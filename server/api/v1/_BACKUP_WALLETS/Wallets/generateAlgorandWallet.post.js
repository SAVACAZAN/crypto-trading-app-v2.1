/**
 * Algorand (ALGO) Wallet Generator
 * Uses algosdk for proper Algorand wallet generation
 * Supports both random generation and mnemonic-based derivation
 */

import algosdk from 'algosdk';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      userID,
      walletName,
      saveToDatabase = true,
      useCustomMnemonic = false,
      customMnemonic = null
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    console.log(`[Generate Algorand Wallet] User: ${userID}`);

    let account;
    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      // Use custom mnemonic
      try {
        // Algorand uses 25-word mnemonics
        const mnemonicWords = customMnemonic.trim().split(/\s+/);

        if (mnemonicWords.length !== 25) {
          return {
            success: false,
            message: 'Algorand requires exactly 25-word mnemonic'
          };
        }

        // Validate and recover account from mnemonic
        if (!algosdk.isValidMnemonic(customMnemonic)) {
          return {
            success: false,
            message: 'Invalid mnemonic phrase for Algorand'
          };
        }

        account = algosdk.mnemonicToSecretKey(customMnemonic);
        mnemonic = customMnemonic;
      } catch (error) {
        return {
          success: false,
          message: `Invalid Algorand mnemonic: ${error.message}`
        };
      }
    } else {
      // Generate new account (creates 25-word mnemonic automatically)
      account = algosdk.generateAccount();
      mnemonic = algosdk.secretKeyToMnemonic(account.sk);
    }

    // Get address and keys
    const address = account.addr; // Algorand address (58 characters)
    const privateKey = Buffer.from(account.sk).toString('hex');
    const publicKey = algosdk.encodeAddress(account.sk.slice(32)); // Public key is last 32 bytes

    const walletData = {
      success: true,
      network: 'Algorand',
      type: 'Algorand',
      symbol: 'ALGO',

      // Wallet details
      address: address, // Algorand address (starts with A-Z, 58 chars)
      privateKey: privateKey,
      publicKey: publicKey,
      mnemonic: mnemonic, // 25 words

      // Additional info
      addressFormat: 'Algorand Address (58 characters, base32)',
      mnemonicWords: 25,

      warning: '⚠️ NEVER share your mnemonic or private key! Algorand uses 25-word mnemonics.',

      // Network info
      chainInfo: {
        network: 'mainnet',
        // Algorand API endpoints
        algodUrl: 'https://mainnet-api.algonode.cloud',
        indexerUrl: 'https://mainnet-idx.algonode.cloud',
        explorerUrl: `https://algoexplorer.io/address/${address}`,
        peraExplorer: `https://explorer.perawallet.app/address/${address}`,

        // Algorand network info
        minimumBalance: '0.1 ALGO', // Minimum account balance
        transactionFee: '0.001 ALGO', // Standard transaction fee
        assetOptInFee: '0.001 ALGO', // Fee to opt-in to ASA
        decimals: 6, // ALGO has 6 decimals (1 ALGO = 1,000,000 microAlgos)

        // Block time
        blockTime: '~4.5 seconds',
        tps: '~1000 TPS',
        finality: 'Instant (single round)'
      },

      // Algorand-specific notes
      notes: [
        '📌 Algorand has instant finality - transactions are final in ~4.5 seconds',
        '📌 Minimum balance: 0.1 ALGO (+ 0.1 ALGO per asset opt-in)',
        '📌 Transaction fees are fixed at 0.001 ALGO',
        '📌 Algorand uses Pure Proof of Stake (PPoS) consensus',
        '📌 No staking required - rewards go to all holders (governance)',
        '📌 Supports smart contracts (Algorand Smart Contracts - ASC1)',
        '📌 Supports Algorand Standard Assets (ASA) - native token standard',
        '📌 Can participate in Algorand Governance for rewards (~8-10% APY)',
        '📌 Account must have ≥0.1 ALGO to remain active'
      ]
    };

    // Save to database if requested
    if (saveToDatabase) {
      const defaultWalletName = walletName || `Algorand Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Algorand',
        networkSymbol: 'ALGO',
        chainId: 0, // Algorand doesn't use numeric chainId
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKey,
        privateKey: privateKey, // ⚠️ In production, encrypt this!
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\n\n${walletData.notes.join('\n')}`,
        tags: ['Algorand', 'ALGO', 'PPoS', 'Layer-1'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Algorand Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          // Don't send sensitive data in response
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Algorand (ALGO) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Algorand (ALGO) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Algorand Wallet] Error:', error);
    return {
      success: false,
      message: `Algorand wallet generation failed: ${error.message}`
    };
  }
});
