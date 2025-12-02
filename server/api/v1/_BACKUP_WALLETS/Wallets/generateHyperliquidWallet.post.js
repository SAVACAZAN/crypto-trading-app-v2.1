/**
 * Hyperliquid (HYPE) Wallet Generator
 * Hyperliquid is a custom Layer 1 for perpetuals trading
 * Uses Ethereum-compatible addresses
 */

import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import crypto from 'crypto';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

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

    console.log(`[Generate Hyperliquid Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Hyperliquid'
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

    // Ethereum derivation path: m/44'/60'/{account}'/0/0
    const derivationPath = `m/44'/60'/${accountIndex}'/0/0`;
    const child = rootKey.derivePath(derivationPath);

    const privateKey = child.privateKey;
    const publicKey = child.publicKey;

    // Generate Ethereum-compatible address
    const pubKeyWithoutPrefix = publicKey.length === 65 ? publicKey.slice(1) : publicKey;
    const keccak256 = crypto.createHash('sha3-256').update(pubKeyWithoutPrefix).digest();
    const address = '0x' + keccak256.slice(-20).toString('hex');

    const walletData = {
      success: true,
      network: 'Hyperliquid',
      type: 'Hyperliquid',
      symbol: 'HYPE',

      address: address,
      publicKey: publicKey.toString('hex'),
      privateKey: privateKey.toString('hex'),
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,

      addressFormat: 'Ethereum-compatible (0x...)',

      warning: '⚠️ NEVER share your private key or mnemonic! Hyperliquid is a perpetuals DEX.',

      chainInfo: {
        network: 'mainnet',
        chainId: 421614,
        rpcUrl: 'https://api.hyperliquid.xyz',
        explorerUrl: `https://app.hyperliquid.xyz/explorer/address/${address}`,
        features: [
          '📊 Perpetuals trading DEX',
          '⚡ High-performance L1',
          '💰 On-chain order book',
          '🔐 Non-custodial trading'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Hyperliquid Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Hyperliquid',
        networkSymbol: 'HYPE',
        chainId: 421614,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKey.toString('hex'),
        privateKey: privateKey.toString('hex'),
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nCoin Type: 60 (Ethereum-compatible)`,
        tags: ['Hyperliquid', 'HYPE', 'Perpetuals', 'DEX'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Hyperliquid Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Hyperliquid (HYPE) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Hyperliquid (HYPE) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Hyperliquid Wallet] Error:', error);
    return {
      success: false,
      message: `Hyperliquid wallet generation failed: ${error.message}`
    };
  }
});
