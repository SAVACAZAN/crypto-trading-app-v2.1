/**
 * Symbol (XYM) Wallet Generator
 * Symbol is the evolution of NEM
 * Uses BIP39/BIP32 for key derivation
 * Symbol uses base32 encoding similar to NEM
 */

import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import crypto from 'crypto';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

// Base32 alphabet (RFC 4648)
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buffer) {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
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
      networkType = 'mainnet' // mainnet (0x68) or testnet (0x98)
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    console.log(`[Generate Symbol Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Symbol'
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

    // Symbol derivation path: m/44'/4343'/{account}'/0/0
    const derivationPath = `m/44'/4343'/${accountIndex}'/0/0`;
    const child = rootKey.derivePath(derivationPath);

    const privateKey = child.privateKey;
    const publicKey = child.publicKey;

    // Symbol address generation
    const networkByte = networkType === 'mainnet' ? 0x68 : 0x98;

    // SHA3-256 hash of public key
    const sha3Hash = crypto.createHash('sha3-256').update(publicKey).digest();

    // RIPEMD160 of the hash
    const ripemd160Hash = crypto.createHash('ripemd160').update(sha3Hash).digest();

    // Add network byte
    const addressPayload = Buffer.concat([Buffer.from([networkByte]), ripemd160Hash]);

    // SHA3-256 checksum (first 3 bytes for Symbol)
    const checksum = crypto.createHash('sha3-256').update(addressPayload).digest().slice(0, 3);

    // Combine and encode
    const addressBytes = Buffer.concat([addressPayload, checksum]);
    const address = base32Encode(addressBytes);

    const walletData = {
      success: true,
      network: 'Symbol',
      type: 'Symbol',
      symbol: 'XYM',

      address: address,
      publicKey: publicKey.toString('hex'),
      privateKey: privateKey.toString('hex'),
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,
      networkType: networkType,

      addressFormat: 'Base32 (N...)',

      warning: '⚠️ NEVER share your private key or mnemonic! Symbol is the evolution of NEM.',

      chainInfo: {
        network: networkType,
        rpcUrl: 'https://symbol.fyi:3001',
        explorerUrl: `https://symbol.fyi/accounts/${address}`,
        features: [
          '🔄 Multi-layer architecture',
          '🔗 Cross-chain swaps',
          '💼 Advanced multi-signature',
          '📝 Aggregate transactions'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Symbol Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Symbol',
        networkSymbol: 'XYM',
        chainId: 0,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKey.toString('hex'),
        privateKey: privateKey.toString('hex'),
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nNetwork: ${networkType}\nCoin Type: 4343`,
        tags: ['Symbol', 'XYM', 'NEM Evolution', 'Enterprise'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Symbol Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Symbol (XYM) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Symbol (XYM) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Symbol Wallet] Error:', error);
    return {
      success: false,
      message: `Symbol wallet generation failed: ${error.message}`
    };
  }
});
