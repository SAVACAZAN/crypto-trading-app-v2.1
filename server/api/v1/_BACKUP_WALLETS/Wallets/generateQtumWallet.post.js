/**
 * Qtum (QTUM) Wallet Generator
 * Qtum combines Bitcoin's UTXO model with Ethereum's smart contracts
 * Uses base58check encoding similar to Bitcoin
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

    console.log(`[Generate Qtum Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Qtum'
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

    // Qtum derivation path: m/44'/2301'/{account}'/0/0
    const derivationPath = `m/44'/2301'/${accountIndex}'/0/0`;
    const child = rootKey.derivePath(derivationPath);

    const privateKey = child.privateKey;
    const publicKey = child.publicKey;

    // Create Qtum address (version 0x3A for 'Q' prefix)
    const version = Buffer.from([0x3A]);

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
      network: 'Qtum',
      type: 'Qtum',
      symbol: 'QTUM',

      address: address,
      publicKey: publicKey.toString('hex'),
      privateKey: privateKey.toString('hex'),
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,

      addressFormat: 'Base58Check (Q...)',

      warning: '⚠️ NEVER share your private key or mnemonic! Qtum combines Bitcoin and Ethereum.',

      chainInfo: {
        network: 'mainnet',
        rpcUrl: 'https://janus.qiswap.com/api',
        explorerUrl: `https://qtum.info/address/${address}`,
        features: [
          '🔗 Bitcoin UTXO + Ethereum EVM',
          '⚡ Proof of Stake',
          '🔧 Smart contracts (Solidity)',
          '📱 Mobile-first blockchain'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Qtum Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Qtum',
        networkSymbol: 'QTUM',
        chainId: 0,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKey.toString('hex'),
        privateKey: privateKey.toString('hex'),
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nCoin Type: 2301`,
        tags: ['Qtum', 'QTUM', 'Hybrid', 'Smart Contracts', 'PoS'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Qtum Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Qtum (QTUM) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Qtum (QTUM) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Qtum Wallet] Error:', error);
    return {
      success: false,
      message: `Qtum wallet generation failed: ${error.message}`
    };
  }
});
