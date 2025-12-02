/**
 * Fraction AI Testnet Wallet Generator
 * Type: EVM-compatible (Sepolia Network)
 * Uses ethers.js for wallet generation
 */

import { ethers } from 'ethers';
import { testNetworksSchema } from '~/server/models/testNetworks.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      userID,
      walletName
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    console.log(`[Generate Fraction AI Wallet] User: ${userID}`);

    // Generate EVM wallet
    const wallet = ethers.Wallet.createRandom();

    const address = wallet.address;
    const privateKey = wallet.privateKey;
    const mnemonic = wallet.mnemonic.phrase;

    const defaultWalletName = walletName || `Fraction AI Testnet ${Date.now()}`;

    const savedWallet = await testNetworksSchema.create({
      userID,
      walletName: defaultWalletName,
      network: 'Fraction AI',
      networkSymbol: 'FRAC',
      networkType: 'EVM',
      chainId: 11155111, // Sepolia testnet
      rpcUrl: 'https://rpc.sepolia.org',
      explorerUrl: 'https://sepolia.etherscan.io',
      address: address,
      publicKey: wallet.publicKey,
      privateKey: privateKey,
      mnemonic: mnemonic,
      faucetUrl: 'https://sepoliafaucet.com',
      portalUrl: 'https://fractionai.xyz/testnet',
      tasks: [
        'Connect to Sepolia network',
        'Get Sepolia ETH from faucet',
        'Complete AI tasks',
        'Interact with Fraction AI dApp'
      ],
      tasksCompleted: [],
      isActive: true,
      balance: '0',
      lastActivity: new Date(),
      note: '🤖 Fraction AI testnet on Sepolia with AI integration and airdrop potential.',
      tags: ['Testnet', 'EVM', 'Sepolia', 'AI', 'Airdrop'],
      createdAt: new Date()
    });

    console.log(`[Generate Fraction AI Wallet] ✅ Created: ${address}`);

    return {
      success: true,
      walletId: savedWallet._id.toString(),
      address: address,
      network: 'Fraction AI',
      networkType: 'EVM',
      portalUrl: 'https://fractionai.xyz/testnet',
      message: 'Fraction AI testnet wallet generated successfully!'
    };

  } catch (error) {
    console.error('[Generate Fraction AI Wallet] Error:', error);
    return {
      success: false,
      message: `Failed: ${error.message}`
    };
  }
});
