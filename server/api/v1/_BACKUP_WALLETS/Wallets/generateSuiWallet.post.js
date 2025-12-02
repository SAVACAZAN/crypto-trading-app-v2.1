/**
 * Sui Wallet Generator
 * Uses @mysten/sui.js for proper wallet generation
 * Supports Ed25519 key scheme
 */

import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import * as bip39 from 'bip39';
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
      network = 'mainnet' // mainnet, testnet, devnet
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    console.log(`[Generate Sui Wallet] User: ${userID}, Network: ${network}`);

    let keypair;
    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      // Use custom mnemonic
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Sui'
        };
      }
      mnemonic = customMnemonic;

      // Derive Sui keypair from mnemonic using Sui SDK's method
      keypair = Ed25519Keypair.deriveKeypair(mnemonic);
    } else {
      // Generate new keypair
      mnemonic = bip39.generateMnemonic(128); // 12 words

      // Derive Sui keypair from mnemonic using Sui SDK's method
      keypair = Ed25519Keypair.deriveKeypair(mnemonic);
    }

    // Get address and keys
    const address = keypair.getPublicKey().toSuiAddress(); // 0x... format
    const publicKeyBase64 = keypair.getPublicKey().toBase64();
    const privateKeyHex = keypair.export().privateKey;

    const networkInfo = getNetworkInfo(network);

    const walletData = {
      success: true,
      network: 'Sui',
      type: 'Sui',
      symbol: 'SUI',

      // Wallet details
      address: address, // 0x... format (64 hex chars)
      privateKey: privateKeyHex,
      publicKey: publicKeyBase64,
      mnemonic: mnemonic,

      // Additional info
      addressFormat: 'Sui Address (0x... 64 characters)',
      keyScheme: 'Ed25519',

      warning: '⚠️ NEVER share your private key or mnemonic! Sui uses Ed25519 signatures.',

      // Network info
      chainInfo: networkInfo,

      // Sui-specific notes
      notes: [
        '📌 Sui is a Move-based Layer 1 blockchain (from Mysten Labs)',
        '📌 Uses object-centric data model (unlike account-based)',
        '📌 Parallel transaction execution with Narwhal & Bullshark consensus',
        '📌 Transaction finality: sub-second',
        '📌 Theoretical TPS: 120,000+',
        '📌 Smart contracts written in Move language',
        '📌 Gas fees paid in SUI',
        '📌 Supports programmable transaction blocks (PTBs)',
        '📌 NFTs and fungible tokens are first-class objects',
        '📌 zkLogin - login with Google, Facebook, etc.'
      ]
    };

    // Save to database if requested
    if (saveToDatabase) {
      const defaultWalletName = walletName || `Sui Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Sui',
        networkSymbol: 'SUI',
        chainId: 0, // Sui doesn't use numeric chainId
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKeyBase64,
        privateKey: privateKeyHex, // ⚠️ In production, encrypt this!
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\n\nNetwork: ${network}\n\n${walletData.notes.join('\n')}`,
        tags: ['Sui', 'SUI', 'Move', 'Layer-1'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Sui Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          // Don't send sensitive data in response
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Sui wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Sui wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Sui Wallet] Error:', error);
    return {
      success: false,
      message: `Sui wallet generation failed: ${error.message}`
    };
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getNetworkInfo(network) {
  const networks = {
    mainnet: {
      name: 'Mainnet',
      rpcUrl: 'https://fullnode.mainnet.sui.io:443',
      faucetUrl: null,
      explorerUrl: 'https://suiscan.xyz/mainnet',
      suiexplorerUrl: 'https://explorer.sui.io'
    },
    testnet: {
      name: 'Testnet',
      rpcUrl: 'https://fullnode.testnet.sui.io:443',
      faucetUrl: 'https://faucet.testnet.sui.io',
      explorerUrl: 'https://suiscan.xyz/testnet',
      suiexplorerUrl: 'https://explorer.sui.io/?network=testnet'
    },
    devnet: {
      name: 'Devnet',
      rpcUrl: 'https://fullnode.devnet.sui.io:443',
      faucetUrl: 'https://faucet.devnet.sui.io',
      explorerUrl: 'https://suiscan.xyz/devnet',
      suiexplorerUrl: 'https://explorer.sui.io/?network=devnet'
    }
  };

  return networks[network] || networks.mainnet;
}
