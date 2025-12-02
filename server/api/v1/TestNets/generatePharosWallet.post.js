/**
 * Pharos Testnet Wallet Generator
 * Type: EVM-compatible (L1)
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

    console.log(`[Generate Pharos Wallet] User: ${userID}`);

    // Generate EVM wallet using ethers.js
    const wallet = ethers.Wallet.createRandom();

    // Get wallet details
    const address = wallet.address;
    const privateKey = wallet.privateKey;
    const mnemonic = wallet.mnemonic.phrase;

    // Save to database
    const defaultWalletName = walletName || `Pharos Testnet ${Date.now()}`;

    const savedWallet = await testNetworksSchema.create({
      userID,
      walletName: defaultWalletName,
      network: 'Pharos',
      networkSymbol: 'PHRS',
      networkType: 'EVM',
      chainId: 688688,
      rpcUrl: 'https://testnet.dplabs-internal.com',
      explorerUrl: 'https://testnet.pharosscan.xyz',
      address: address,
      publicKey: wallet.publicKey,
      privateKey: privateKey,
      mnemonic: mnemonic,
      faucetUrl: 'https://zan.top/faucet/pharos',
      portalUrl: 'https://testnet.pharosnetwork.xyz',
      tasks: [
        'Visit testnet portal',
        'Connect wallet',
        'Complete testnet tasks',
        'Claim test tokens from faucet'
      ],
      tasksCompleted: [],
      isActive: true,
      balance: '0',
      lastActivity: new Date(),
      note: '🔷 Pharos L1 EVM-compatible testnet. Fastest EVM Layer-1 with 30K+ TPS.',
      tags: ['Testnet', 'EVM', 'Pharos', 'High-Performance'],
      createdAt: new Date()
    });

    console.log(`[Generate Pharos Wallet] ✅ Created: ${address}`);

    return {
      success: true,
      walletId: savedWallet._id.toString(),
      address: address,
      network: 'Pharos',
      networkType: 'EVM',
      portalUrl: 'https://testnet.pharosnetwork.xyz',
      message: 'Pharos testnet wallet generated successfully!'
    };

  } catch (error) {
    console.error('[Generate Pharos Wallet] Error:', error);
    return {
      success: false,
      message: `Failed: ${error.message}`
    };
  }
});
