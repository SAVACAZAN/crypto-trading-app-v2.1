/**
 * Berachain Testnet Wallet Generator
 * Type: EVM-compatible
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

    console.log(`[Generate Berachain Wallet] User: ${userID}`);

    // Generate EVM wallet
    const wallet = ethers.Wallet.createRandom();

    const address = wallet.address;
    const privateKey = wallet.privateKey;
    const mnemonic = wallet.mnemonic.phrase;

    const defaultWalletName = walletName || `Berachain Testnet ${Date.now()}`;

    const savedWallet = await testNetworksSchema.create({
      userID,
      walletName: defaultWalletName,
      network: 'Berachain',
      networkSymbol: 'BERA',
      networkType: 'EVM',
      chainId: 80085, // Berachain testnet
      rpcUrl: 'https://artio.rpc.berachain.com',
      explorerUrl: 'https://artio.beratrail.io',
      address: address,
      publicKey: wallet.publicKey,
      privateKey: privateKey,
      mnemonic: mnemonic,
      faucetUrl: 'https://artio.faucet.berachain.com',
      portalUrl: 'https://blog.berachain.com',
      tasks: [
        'Add Berachain testnet to wallet',
        'Get test BERA from faucet',
        'Participate in DeFi protocols',
        'Complete farming tasks'
      ],
      tasksCompleted: [],
      isActive: true,
      balance: '0',
      lastActivity: new Date(),
      note: '🐻 Berachain incentivized testnet with farming rewards.',
      tags: ['Testnet', 'EVM', 'Berachain', 'Farming', 'Airdrop'],
      createdAt: new Date()
    });

    console.log(`[Generate Berachain Wallet] ✅ Created: ${address}`);

    return {
      success: true,
      walletId: savedWallet._id.toString(),
      address: address,
      network: 'Berachain',
      networkType: 'EVM',
      portalUrl: 'https://blog.berachain.com',
      message: 'Berachain testnet wallet generated successfully!'
    };

  } catch (error) {
    console.error('[Generate Berachain Wallet] Error:', error);
    return {
      success: false,
      message: `Failed: ${error.message}`
    };
  }
});
