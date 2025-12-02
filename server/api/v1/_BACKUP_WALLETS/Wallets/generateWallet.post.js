/**
 * Generate Wallet API Endpoint
 * Supports: Ethereum, Arbitrum, Optimism, Base, Polygon, Avalanche, BNB Chain, etc.
 * Saves to database automatically
 */

import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID, network, walletType = 'EVM', walletName, saveToDatabase = true } = body;

    if (!userID) {
      return {
        success: false,
        message: 'userID is required'
      };
    }

    if (!network) {
      return {
        success: false,
        message: 'Network is required'
      };
    }

    console.log(`[Generate Wallet] User: ${userID}, Network: ${network}, Type: ${walletType}`);

    let walletData;

    if (walletType === 'EVM') {
      // Generate EVM wallet (Ethereum, Arbitrum, Optimism, Base, Polygon, Avalanche, BNB, etc.)
      walletData = generateEVMWallet(network);
    } else {
      // For other types, return generic
      walletData = generateGenericWallet(network);
    }

    // Save to database if requested
    if (saveToDatabase) {
      const defaultWalletName = walletName || `${network} Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: walletData.network,
        networkSymbol: walletData.chainInfo?.symbol || network,
        chainId: walletData.chainInfo?.chainId || 0,
        walletType: walletData.type,
        address: walletData.address,
        publicKey: walletData.publicKey,
        privateKey: walletData.privateKey, // ⚠️ In production, encrypt this!
        mnemonic: walletData.mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: walletData.warning,
        tags: [walletType, network],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: walletData,
        walletId: savedWallet._id.toString(),
        message: `${network} wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `${network} wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Wallet] Error:', error);
    return {
      success: false,
      message: error.message
    };
  }
});

// Generate EVM-compatible wallet
function generateEVMWallet(network) {
  // Generate random mnemonic (12 words)
  const mnemonic = bip39.generateMnemonic();

  // Create wallet from mnemonic
  const wallet = ethers.Wallet.fromPhrase(mnemonic);

  return {
    network,
    type: 'EVM',
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: mnemonic,
    publicKey: wallet.publicKey,
    derivationPath: "m/44'/60'/0'/0/0", // Standard Ethereum path
    chainInfo: getChainInfo(network),
    warning: '� NEVER share your private key or mnemonic! Store them securely offline.'
  };
}

// Generate generic wallet for non-EVM chains
function generateGenericWallet(network) {
  const mnemonic = bip39.generateMnemonic();
  const crypto = require('crypto');

  const privateKey = '0x' + crypto.randomBytes(32).toString('hex');
  const publicKey = '0x' + crypto.randomBytes(32).toString('hex');

  return {
    network,
    type: 'Generic',
    publicKey,
    privateKey,
    mnemonic,
    warning: '� Use official wallet software for production. This is a generic keypair.',
    note: 'For Solana, Algorand, Cosmos, etc. - use their official wallet generators'
  };
}

// Get chain information
function getChainInfo(network) {
  const chains = {
    'Ethereum': { chainId: 1, symbol: 'ETH', rpc: 'https://eth.llamarpc.com', explorer: 'https://etherscan.io' },
    'Arbitrum': { chainId: 42161, symbol: 'ETH', rpc: 'https://arb1.arbitrum.io/rpc', explorer: 'https://arbiscan.io' },
    'Optimism': { chainId: 10, symbol: 'ETH', rpc: 'https://mainnet.optimism.io', explorer: 'https://optimistic.etherscan.io' },
    'Base': { chainId: 8453, symbol: 'ETH', rpc: 'https://mainnet.base.org', explorer: 'https://basescan.org' },
    'Polygon': { chainId: 137, symbol: 'MATIC', rpc: 'https://polygon-rpc.com', explorer: 'https://polygonscan.com' },
    'Avalanche': { chainId: 43114, symbol: 'AVAX', rpc: 'https://api.avax.network/ext/bc/C/rpc', explorer: 'https://snowtrace.io' },
    'BNB Chain': { chainId: 56, symbol: 'BNB', rpc: 'https://bsc-dataseed.binance.org', explorer: 'https://bscscan.com' },
    'Plasma': { chainId: 369, symbol: 'PLS', rpc: 'https://rpc.mainnet.pulsechain.com', explorer: 'https://scan.pulsechain.com' }
  };

  return chains[network] || { chainId: 0, symbol: '', rpc: '', explorer: '' };
}