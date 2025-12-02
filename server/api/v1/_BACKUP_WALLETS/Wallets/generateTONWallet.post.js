/**
 * TON (The Open Network) Wallet Generator
 * Uses ton-crypto and ton-core for proper TON wallet generation
 * Supports v4R2 wallet contract (most common)
 */

import { mnemonicNew, mnemonicToPrivateKey, mnemonicValidate } from 'ton-crypto';
import { WalletContractV4 } from 'ton';
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
      workchain = 0, // 0 = basechain, -1 = masterchain
      walletVersion = 'v4R2' // v3R1, v3R2, v4R1, v4R2
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    console.log(`[Generate TON Wallet] User: ${userID}, Version: ${walletVersion}, Workchain: ${workchain}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      // Use custom mnemonic (TON uses 24-word mnemonics)
      const mnemonicArray = customMnemonic.split(' ');

      if (mnemonicArray.length !== 24) {
        return {
          success: false,
          message: 'TON requires exactly 24-word mnemonic'
        };
      }

      const isValid = await mnemonicValidate(mnemonicArray);
      if (!isValid) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for TON'
        };
      }

      mnemonic = mnemonicArray;
    } else {
      // Generate new 24-word mnemonic (TON standard)
      mnemonic = await mnemonicNew(24);
    }

    // Derive key pair from mnemonic
    const keyPair = await mnemonicToPrivateKey(mnemonic);

    // Create wallet contract (v4R2 is the most common and recommended)
    const wallet = WalletContractV4.create({
      workchain: workchain,
      publicKey: keyPair.publicKey
    });

    // Get addresses
    const address = wallet.address;
    const addressString = address.toString(); // Raw address
    const addressUserFriendly = address.toString({
      bounceable: true,
      testOnly: false
    }); // User-friendly bounceable
    const addressNonBounceable = address.toString({
      bounceable: false,
      testOnly: false
    }); // User-friendly non-bounceable

    const walletData = {
      success: true,
      network: 'TON',
      type: 'TON',
      symbol: 'TON',

      // Wallet details
      address: addressUserFriendly, // Main user-friendly address (bounceable)
      addressRaw: addressString, // Raw address format
      addressBounceable: addressUserFriendly, // EQ... format (recommended for wallets)
      addressNonBounceable: addressNonBounceable, // UQ... format (for first-time activation)

      privateKey: keyPair.secretKey.toString('hex'),
      publicKey: keyPair.publicKey.toString('hex'),
      mnemonic: mnemonic.join(' '),

      // Wallet info
      walletVersion: walletVersion,
      workchain: workchain,

      // Additional info
      addressFormats: {
        bounceable: 'EQ... (recommended for wallets and smart contracts)',
        nonBounceable: 'UQ... (use for first activation only)',
        raw: 'Raw address format'
      },

      warning: '⚠️ NEVER share your mnemonic or private key! TON uses 24-word mnemonics.',

      // Network info
      chainInfo: {
        workchain: workchain === 0 ? 'Basechain' : 'Masterchain',
        explorerUrl: `https://tonscan.org/address/${addressUserFriendly}`,
        tonviewerUrl: `https://tonviewer.com/${addressUserFriendly}`,

        // TON RPC endpoints
        mainnetRpc: 'https://toncenter.com/api/v2/jsonRPC',
        testnetRpc: 'https://testnet.toncenter.com/api/v2/jsonRPC',

        // Important TON info
        minimumBalance: '~0.1 TON', // Recommended minimum for operation
        storageFeePer1KB: '~0.00001 TON per second',
        typicalTransactionFee: '~0.005-0.01 TON'
      },

      // TON-specific notes
      notes: [
        '📌 TON wallet must be deployed (activated) before use - costs ~0.05 TON',
        '📌 Use BOUNCEABLE address (EQ...) for transfers between wallets',
        '📌 Use NON-BOUNCEABLE address (UQ...) ONLY for first-time activation',
        '📌 TON uses workchains: 0 (basechain - for users) and -1 (masterchain)',
        '📌 Storage fees are charged continuously - keep small balance for storage',
        `📌 This is a ${walletVersion} wallet contract (recommended version)`,
        '📌 TON supports smart contracts natively - every wallet is a smart contract'
      ]
    };

    // Save to database if requested
    if (saveToDatabase) {
      const defaultWalletName = walletName || `TON Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'TON',
        networkSymbol: 'TON',
        chainId: workchain, // Use workchain as chainId
        walletType: 'Non-EVM',
        address: addressUserFriendly, // Save bounceable address
        publicKey: keyPair.publicKey.toString('hex'),
        privateKey: keyPair.secretKey.toString('hex'), // ⚠️ In production, encrypt this!
        mnemonic: mnemonic.join(' '),
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\n\nRaw Address: ${addressString}\nBounceable: ${addressUserFriendly}\nNon-Bounceable: ${addressNonBounceable}\n\n${walletData.notes.join('\n')}`,
        tags: ['TON', 'The Open Network', walletVersion, `workchain-${workchain}`],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate TON Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          // Don't send sensitive data in response
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `TON wallet (${walletVersion}) generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `TON wallet (${walletVersion}) generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate TON Wallet] Error:', error);
    return {
      success: false,
      message: `TON wallet generation failed: ${error.message}`
    };
  }
});
