/**
 * NEM (XEM) Wallet Generator
 * Uses BIP39/BIP32 for key derivation
 * NEM uses base32 encoding with specific address format
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

    console.log(`[Generate NEM Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for NEM'
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

    // NEM derivation path: m/44'/43'/{account}'/0/0
    const derivationPath = `m/44'/43'/${accountIndex}'/0/0`;
    const child = rootKey.derivePath(derivationPath);

    const privateKey = child.privateKey;
    const publicKey = child.publicKey;

    // NEM address generation
    const networkByte = networkType === 'mainnet' ? 0x68 : 0x98;

    // SHA3-256 hash of public key
    const sha3Hash = crypto.createHash('sha3-256').update(publicKey).digest();

    // RIPEMD160 of the hash
    const ripemd160Hash = crypto.createHash('ripemd160').update(sha3Hash).digest();

    // Add network byte
    const addressPayload = Buffer.concat([Buffer.from([networkByte]), ripemd160Hash]);

    // SHA3-256 checksum (first 4 bytes)
    const checksum = crypto.createHash('sha3-256').update(addressPayload).digest().slice(0, 4);

    // Combine and encode
    const addressBytes = Buffer.concat([addressPayload, checksum]);
    const address = base32Encode(addressBytes);

    const walletData = {
      success: true,
      network: 'NEM',
      type: 'NEM',
      symbol: 'XEM',

      address: address,
      publicKey: publicKey.toString('hex'),
      privateKey: privateKey.toString('hex'),
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,
      networkType: networkType,

      addressFormat: 'Base32 (N...)',

      warning: '⚠️ NEVER share your private key or mnemonic! NEM uses Proof of Importance consensus.',

      chainInfo: {
        network: networkType,
        rpcUrl: 'https://api.nem.io:7890',
        explorerUrl: `https://explorer.nemtool.com/#/s_account?account=${address}`,
        features: [
          '⚖️ Proof of Importance (PoI)',
          '💼 Multi-signature accounts',
          '📝 Messaging and namespaces',
          '🏢 Enterprise blockchain'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `NEM Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'NEM',
        networkSymbol: 'XEM',
        chainId: 0,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKey.toString('hex'),
        privateKey: privateKey.toString('hex'),
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nNetwork: ${networkType}\nCoin Type: 43`,
        tags: ['NEM', 'XEM', 'PoI', 'Enterprise'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate NEM Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `NEM (XEM) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `NEM (XEM) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate NEM Wallet] Error:', error);
    return {
      success: false,
      message: `NEM wallet generation failed: ${error.message}`
    };
  }
});
