/**
 * NEO (NEO) Wallet Generator
 * Uses BIP39/BIP32 for key derivation
 * NEO uses base58check encoding with version 0x17
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

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      userID,
      walletName,
      saveToDatabase = true,
      useCustomMnemonic = false,
      customMnemonic = null,
      accountIndex = 0
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    console.log(`[Generate NEO Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for NEO'
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

    // NEO derivation path: m/44'/888'/{account}'/0/0
    const derivationPath = `m/44'/888'/${accountIndex}'/0/0`;
    const child = rootKey.derivePath(derivationPath);

    const privateKey = child.privateKey;
    const publicKey = child.publicKey;

    // Create NEO address (version 0x17 for 'A' prefix)
    const version = Buffer.from([0x17]);

    // Hash public key: SHA256 then RIPEMD160
    const sha256Hash = crypto.createHash('sha256').update(publicKey).digest();
    const ripemd160Hash = crypto.createHash('ripemd160').update(sha256Hash).digest();

    // Add version byte
    const addressPayload = Buffer.concat([version, ripemd160Hash]);

    // Double SHA256 for checksum
    const checksum = crypto.createHash('sha256')
      .update(crypto.createHash('sha256').update(addressPayload).digest())
      .digest()
      .slice(0, 4);

    // Final address
    const addressBytes = Buffer.concat([addressPayload, checksum]);
    const address = base58Encode(addressBytes);

    const walletData = {
      success: true,
      network: 'NEO',
      type: 'NEO',
      symbol: 'NEO',

      address: address,
      publicKey: publicKey.toString('hex'),
      privateKey: privateKey.toString('hex'),
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,

      addressFormat: 'Base58Check (A...)',

      warning: '⚠️ NEVER share your private key or mnemonic! NEO is a smart contract platform.',

      chainInfo: {
        network: 'mainnet',
        rpcUrl: 'https://mainnet1.neo.coz.io:443',
        explorerUrl: `https://neotube.io/address/${address}`,
        features: [
          '🔧 Smart contracts (C#, Python, Go, Java)',
          '⚡ dBFT 2.0 consensus',
          '🪙 Dual token (NEO + GAS)',
          '💰 Generate GAS by holding NEO'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `NEO Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'NEO',
        networkSymbol: 'NEO',
        chainId: 0,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKey.toString('hex'),
        privateKey: privateKey.toString('hex'),
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nCoin Type: 888`,
        tags: ['NEO', 'Smart Contracts', 'dBFT'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate NEO Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `NEO (NEO) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `NEO (NEO) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate NEO Wallet] Error:', error);
    return {
      success: false,
      message: `NEO wallet generation failed: ${error.message}`
    };
  }
});
