/**
 * Connect Wallet API Endpoint
 * Import existing wallet via private key or mnemonic
 * Saves to database
 */

import { ethers } from 'ethers';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { 
      userID, 
      network, 
      walletType = 'EVM', 
      walletName,
      // Connection methods
      privateKey,
      mnemonic,
      publicKeyOnly // For view-only wallets
    } = body;

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

    if (!privateKey && !mnemonic && !publicKeyOnly) {
      return {
        success: false,
        message: 'Provide privateKey, mnemonic, or publicKey to connect wallet'
      };
    }

    console.log(`[Connect Wallet] User: ${userID}, Network: ${network}, Type: ${walletType}`);

    let walletData;

    if (walletType === 'EVM') {
      walletData = await connectEVMWallet(network, { privateKey, mnemonic, publicKeyOnly });
    } else {
      return {
        success: false,
        message: 'Only EVM wallets supported currently'
      };
    }

    if (!walletData.success) {
      return {
        success: false,
        message: walletData.message
      };
    }

    // Check if wallet already exists
    const existingWallet = await userWalletsSchema.findOne({
      userID,
      address: walletData.address
    });

    if (existingWallet) {
      return {
        success: false,
        message: 'This wallet is already connected to your account',
        walletId: existingWallet._id.toString()
      };
    }

    // Save to database
    const defaultWalletName = walletName || `Imported ${network} Wallet`;

    const savedWallet = await userWalletsSchema.create({
      userID,
      walletName: defaultWalletName,
      network: walletData.network,
      networkSymbol: walletData.chainInfo?.symbol || network,
      chainId: walletData.chainInfo?.chainId || 0,
      walletType: walletData.type,
      address: walletData.address,
      publicKey: walletData.publicKey,
      privateKey: walletData.privateKey, //   In production, encrypt this!
      mnemonic: walletData.mnemonic,
      isDefault: false,
      balance: '0',
      balanceUSD: '0',
      note: publicKeyOnly ? 'View-only wallet (no private key)' : 'Imported wallet',
      tags: [walletType, network, 'imported'],
      createdAt: new Date(),
      lastUsed: new Date(),
      isActive: true
    });

    console.log(`[Connect Wallet]  Saved to DB: ${savedWallet._id}`);

    return {
      success: true,
      wallet: {
        ...walletData,
        // Don't send private key in response for security
        privateKey: undefined,
        mnemonic: undefined
      },
      walletId: savedWallet._id.toString(),
      message: `${network} wallet connected successfully!`
    };

  } catch (error) {
    console.error('[Connect Wallet] Error:', error);
    return {
      success: false,
      message: error.message
    };
  }
});

// Connect EVM wallet
async function connectEVMWallet(network, { privateKey, mnemonic, publicKeyOnly }) {
  try {
    let wallet;

    if (mnemonic) {
      // Import from mnemonic
      if (!ethers.Mnemonic.isValidMnemonic(mnemonic)) {
        return { success: false, message: 'Invalid mnemonic phrase' };
      }
      wallet = ethers.Wallet.fromPhrase(mnemonic);
    } else if (privateKey) {
      // Import from private key
      wallet = new ethers.Wallet(privateKey);
    } else if (publicKeyOnly) {
      // View-only wallet (no private key)
      return {
        success: true,
        network,
        type: 'EVM',
        address: publicKeyOnly,
        publicKey: publicKeyOnly,
        privateKey: null,
        mnemonic: null,
        chainInfo: getChainInfo(network),
        warning: '  View-only wallet - cannot send transactions'
      };
    }

    return {
      success: true,
      network,
      type: 'EVM',
      address: wallet.address,
      privateKey: privateKey || wallet.privateKey,
      mnemonic: mnemonic || null,
      publicKey: wallet.publicKey,
      chainInfo: getChainInfo(network),
      warning: '  Keep your private key secure!'
    };

  } catch (error) {
    return {
      success: false,
      message: `Failed to import wallet: ${error.message}`
    };
  }
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