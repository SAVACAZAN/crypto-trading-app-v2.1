/**
 * Stellar (XLM) Wallet Generator
 * Uses stellar-sdk for proper Stellar wallet generation
 * Supports both random generation and mnemonic-based derivation
 */

import * as StellarSdk from 'stellar-sdk';
import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
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

    console.log(`[Generate Stellar Wallet] User: ${userID}, Account Index: ${accountIndex}`);

    let keypair;
    let mnemonic;
    let derivationPath = '';

    if (useCustomMnemonic && customMnemonic) {
      // Use custom mnemonic
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Stellar'
        };
      }
      mnemonic = customMnemonic;
    } else {
      // Generate new 24-word mnemonic
      mnemonic = bip39.generateMnemonic(256); // 256 bits = 24 words
    }

    // Derive Stellar keypair from mnemonic using BIP44
    // Stellar path: m/44'/148'/{account}'
    derivationPath = `m/44'/148'/${accountIndex}'`;
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc);
    const node = bip32.fromSeed(seed).derivePath(derivationPath);

    // Create Stellar keypair from derived key
    keypair = StellarSdk.Keypair.fromRawEd25519Seed(node.privateKey);

    // Get wallet details
    const publicKey = keypair.publicKey(); // G... address
    const secretKey = keypair.secret(); // S... secret key

    const walletData = {
      success: true,
      network: 'Stellar',
      type: 'Stellar',
      symbol: 'XLM',

      // Wallet details
      address: publicKey, // G... format (public key)
      privateKey: secretKey, // S... format (secret key)
      publicKey: publicKey,
      mnemonic: mnemonic,

      // Derivation info
      accountIndex: accountIndex,
      derivationPath: derivationPath,

      // Additional info
      addressFormat: 'Stellar Public Key (G...)',
      secretFormat: 'Stellar Secret Key (S...)',

      warning: '⚠️ NEVER share your secret key (S...) or mnemonic! Anyone with your secret key can access your funds.',

      // Network info
      chainInfo: {
        network: 'mainnet', // Can be 'mainnet' or 'testnet'
        horizonUrl: 'https://horizon.stellar.org',
        explorerUrl: `https://stellarexpert.io/explorer/public/account/${publicKey}`,
        stellarChainUrl: `https://stellar.expert/explorer/public/account/${publicKey}`,

        // Important Stellar info
        minimumBalance: '1 XLM', // Minimum account balance
        baseReserve: '0.5 XLM', // Base reserve per account
        baseFeeSuggestion: '0.00001 XLM' // Suggested base fee
      },

      // Stellar-specific notes
      notes: [
        '📌 Stellar accounts require a minimum balance of 1 XLM to be active',
        '📌 Each subentry (trustline, offer, etc.) requires 0.5 XLM reserve',
        '📌 Accounts must be activated by receiving at least 1 XLM',
        '📌 Transaction fees are typically very low (~0.00001 XLM)'
      ]
    };

    // Save to database if requested
    if (saveToDatabase) {
      const defaultWalletName = walletName || `Stellar Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Stellar',
        networkSymbol: 'XLM',
        chainId: 0, // Stellar doesn't use numeric chainId
        walletType: 'Non-EVM',
        address: publicKey,
        publicKey: publicKey,
        privateKey: secretKey, // ⚠️ In production, encrypt this!
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\n\n${walletData.notes.join('\n')}`,
        tags: ['Stellar', 'XLM', 'BIP44-148'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Stellar Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          // Don't send sensitive data in response
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Stellar (XLM) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Stellar (XLM) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Stellar Wallet] Error:', error);
    return {
      success: false,
      message: `Stellar wallet generation failed: ${error.message}`
    };
  }
});
