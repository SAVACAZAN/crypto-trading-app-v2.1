/**
 * MegaETH Testnet Wallet Generator
 * Type: EVM-compatible High-Performance L2
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

    console.log(`[Generate MegaETH Wallet] User: ${userID}`);

    // Generate EVM wallet
    const wallet = ethers.Wallet.createRandom();

    const address = wallet.address;
    const privateKey = wallet.privateKey;
    const mnemonic = wallet.mnemonic.phrase;

    const defaultWalletName = walletName || `MegaETH Testnet ${Date.now()}`;

    const savedWallet = await testNetworksSchema.create({
      userID,
      walletName: defaultWalletName,
      network: 'MegaETH',
      networkSymbol: 'METH',
      networkType: 'EVM',
      chainId: 6342, // MegaETH testnet chain ID (correct from docs)
      rpcUrl: 'https://carrot.megaeth.com/rpc',
      explorerUrl: 'https://megaeth-testnet.blockscout.com',
      address: address,
      publicKey: wallet.publicKey,
      privateKey: privateKey,
      mnemonic: mnemonic,
      walletType: 'generated',
      faucetUrl: 'https://testnet.megaeth.com/#2',
      portalUrl: 'https://www.megaeth.com',
      tasks: [
        'Add MegaETH to MetaMask',
        'Connect wallet to testnet',
        'Get test METH from faucet',
        'Deploy and test smart contracts'
      ],
      tasksCompleted: [],
      isActive: true,
      balance: '0',
      lastActivity: new Date(),
      note: '🚀 MegaETH high-performance L2 testnet with ultra-fast EVM execution and MetaMask support.',
      tags: ['Testnet', 'EVM', 'L2', 'High-Performance', 'MetaMask'],
      createdAt: new Date()
    });

    console.log(`[Generate MegaETH Wallet] ✅ Created: ${address}`);

    return {
      success: true,
      walletId: savedWallet._id.toString(),
      address: address,
      network: 'MegaETH',
      networkType: 'EVM',
      chainId: 6342,
      rpcUrl: 'https://carrot.megaeth.com/rpc',
      explorerUrl: 'https://megaeth-testnet.blockscout.com',
      portalUrl: 'https://www.megaeth.com',
      message: 'MegaETH testnet wallet generated successfully!'
    };

  } catch (error) {
    console.error('[Generate MegaETH Wallet] Error:', error);
    return {
      success: false,
      message: `Failed: ${error.message}`
    };
  }
});
