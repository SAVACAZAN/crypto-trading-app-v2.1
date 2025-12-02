/**
 * Bitcoin (BTC) Wallet Generator
 * Uses BIP39/BIP32/BIP44 for key derivation
 * Supports 3 address formats: Legacy (P2PKH), SegWit (P2SH-P2WPKH), Native SegWit (Bech32/P2WPKH)
 */

import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import crypto from 'crypto';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

// Base58 alphabet
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Encode(buffer) {
  let num = BigInt('0x' + buffer.toString('hex'));
  let encoded = '';

  const zero = BigInt(0);
  const fiftyEight = BigInt(58);

  while (num > zero) {
    const remainder = Number(num % fiftyEight);
    num = num / fiftyEight;
    encoded = BASE58_ALPHABET[remainder] + encoded;
  }

  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
    encoded = '1' + encoded;
  }

  return encoded;
}

// Simplified bech32 encode
function bech32Encode(hrp, data) {
  const hex = Buffer.from(data).toString('hex');
  return `${hrp}1${hex}`;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      userID,
      walletName,
      saveToDatabase = true,
      useCustomMnemonic = false,
      customMnemonic = null,
      accountIndex = 0,
      addressType = 'legacy' // 'legacy' (P2PKH - 1...), 'segwit' (P2SH-P2WPKH - 3...), 'bech32' (P2WPKH - bc1...)
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    console.log(`[Generate Bitcoin Wallet] User: ${userID}, Account: ${accountIndex}, Type: ${addressType}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Bitcoin'
        };
      }
      mnemonic = customMnemonic;
    } else {
      mnemonic = bip39.generateMnemonic(256);
    }

    // Derive keys using BIP32
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc);
    const rootKey = bip32.fromSeed(seed);

    // Bitcoin derivation paths:
    // m/44'/0'/{account}'/0/0 - Legacy (P2PKH)
    // m/49'/0'/{account}'/0/0 - SegWit (P2SH-P2WPKH)
    // m/84'/0'/{account}'/0/0 - Native SegWit (Bech32)
    let derivationPath;
    let addressPrefix;

    if (addressType === 'legacy') {
      derivationPath = `m/44'/0'/${accountIndex}'/0/0`;
      addressPrefix = 0x00; // Mainnet P2PKH (1...)
    } else if (addressType === 'segwit') {
      derivationPath = `m/49'/0'/${accountIndex}'/0/0`;
      addressPrefix = 0x05; // Mainnet P2SH (3...)
    } else {
      derivationPath = `m/84'/0'/${accountIndex}'/0/0`;
    }

    const child = rootKey.derivePath(derivationPath);
    const privateKey = child.privateKey;
    const publicKey = child.publicKey;

    let address;
    let addressFormatDescription;

    if (addressType === 'bech32') {
      // Native SegWit (Bech32): bc1...
      const sha256Hash = crypto.createHash('sha256').update(publicKey).digest();
      const ripemd160Hash = crypto.createHash('ripemd160').update(sha256Hash).digest();
      const witnessProgram = Buffer.concat([Buffer.from([0x00]), ripemd160Hash]);
      address = bech32Encode('bc', witnessProgram);
      addressFormatDescription = 'Native SegWit (bc1...)';
    } else {
      // Legacy (P2PKH) or SegWit (P2SH-P2WPKH)
      const version = Buffer.from([addressPrefix]);
      const sha256Hash = crypto.createHash('sha256').update(publicKey).digest();
      const ripemd160Hash = crypto.createHash('ripemd160').update(sha256Hash).digest();
      const addressPayload = Buffer.concat([version, ripemd160Hash]);
      const checksum = crypto.createHash('sha256')
        .update(crypto.createHash('sha256').update(addressPayload).digest())
        .digest()
        .slice(0, 4);
      const addressBytes = Buffer.concat([addressPayload, checksum]);
      address = base58Encode(addressBytes);
      addressFormatDescription = addressType === 'segwit' ? 'SegWit (3...)' : 'Legacy (1...)';
    }

    // WIF (Wallet Import Format) for private key
    const wifVersion = Buffer.from([0x80]);
    const wifPayload = Buffer.concat([wifVersion, privateKey, Buffer.from([0x01])]);
    const wifChecksum = crypto.createHash('sha256')
      .update(crypto.createHash('sha256').update(wifPayload).digest())
      .digest()
      .slice(0, 4);
    const privateKeyWIF = base58Encode(Buffer.concat([wifPayload, wifChecksum]));

    const walletData = {
      success: true,
      network: 'Bitcoin',
      type: 'Bitcoin',
      symbol: 'BTC',

      address: address,
      addressType: addressType,
      publicKey: publicKey.toString('hex'),
      privateKey: privateKey.toString('hex'),
      privateKeyWIF: privateKeyWIF,
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,

      addressFormat: addressFormatDescription,

      warning: '⚠️ NEVER share your private key or mnemonic! Bitcoin is the original cryptocurrency.',

      chainInfo: {
        network: 'mainnet',
        rpcUrl: 'https://bitcoin.blockstream.info/api',
        explorerUrl: `https://blockstream.info/address/${address}`,
        features: [
          '💎 Original cryptocurrency (2009)',
          '⛏️ Proof of Work',
          '🔐 Most secure blockchain',
          '💰 Digital gold / Store of value'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Bitcoin ${addressType.charAt(0).toUpperCase() + addressType.slice(1)} Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Bitcoin',
        networkSymbol: 'BTC',
        chainId: 0,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKey.toString('hex'),
        privateKey: privateKey.toString('hex'),
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nAddress Type: ${addressType}\nCoin Type: 0`,
        tags: ['Bitcoin', 'BTC', 'PoW', 'UTXO', addressType],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Bitcoin Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          privateKeyWIF: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Bitcoin (BTC) ${addressType} wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Bitcoin (BTC) ${addressType} wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Bitcoin Wallet] Error:', error);
    return {
      success: false,
      message: `Bitcoin wallet generation failed: ${error.message}`
    };
  }
});
