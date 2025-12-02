/**
 * Monad Testnet Wallet Generator
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

    console.log(`[Generate Monad Wallet] User: ${userID}`);

    // Generate EVM wallet using ethers.js
    const wallet = ethers.Wallet.createRandom();

    // Get wallet details
    const address = wallet.address;
    const privateKey = wallet.privateKey;
    const mnemonic = wallet.mnemonic.phrase;

    // Save to database
    const defaultWalletName = walletName || `Monad Testnet ${Date.now()}`;

    const savedWallet = await testNetworksSchema.create({
      userID,
      walletName: defaultWalletName,
      network: 'Monad',
      networkSymbol: 'MON',
      networkType: 'EVM',
      chainId: 0, // Monad testnet chain ID (to be updated)
      rpcUrl: 'https://testnet-rpc.monad.xyz',
      explorerUrl: 'https://explorer.monad.xyz',
      address: address,
      publicKey: wallet.publicKey,
      privateKey: privateKey,
      mnemonic: mnemonic,
      faucetUrl: 'https://faucet.monad.xyz',
      portalUrl: 'https://monad.xyz/claim',
      tasks: [
        'Visit claim portal',
        'Connect wallet',
        'Complete testnet tasks',
        'Claim test tokens'
      ],
      tasksCompleted: [],
      isActive: true,
      balance: '0',
      lastActivity: new Date(),
      note: '⚡ Monad L1 EVM-compatible testnet. Visit portal for airdrop opportunities.',
      tags: ['Testnet', 'EVM', 'Monad', 'Airdrop'],
      createdAt: new Date()
    });

    console.log(`[Generate Monad Wallet] ✅ Created: ${address}`);

    return {
      success: true,
      walletId: savedWallet._id.toString(),
      address: address,
      network: 'Monad',
      networkType: 'EVM',
      portalUrl: 'https://monad.xyz/claim',
      message: 'Monad testnet wallet generated successfully!'
    };

  } catch (error) {
    console.error('[Generate Monad Wallet] Error:', error);
    return {
      success: false,
      message: `Failed: ${error.message}`
    };
  }
});
