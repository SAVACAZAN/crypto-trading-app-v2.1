/**
 * zkSync Era Testnet Wallet Generator
 * Type: EVM-compatible (Layer 2)
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

    console.log(`[Generate zkSync Wallet] User: ${userID}`);

    // Generate EVM wallet
    const wallet = ethers.Wallet.createRandom();

    const address = wallet.address;
    const privateKey = wallet.privateKey;
    const mnemonic = wallet.mnemonic.phrase;

    const defaultWalletName = walletName || `zkSync Testnet ${Date.now()}`;

    const savedWallet = await testNetworksSchema.create({
      userID,
      walletName: defaultWalletName,
      network: 'zkSync',
      networkSymbol: 'ETH',
      networkType: 'EVM',
      chainId: 280, // zkSync Era testnet
      rpcUrl: 'https://testnet.era.zksync.dev',
      explorerUrl: 'https://goerli.explorer.zksync.io',
      address: address,
      publicKey: wallet.publicKey,
      privateKey: privateKey,
      mnemonic: mnemonic,
      faucetUrl: 'https://goerli.portal.zksync.io/faucet',
      portalUrl: 'https://portal.zksync.io',
      tasks: [
        'Bridge test ETH to zkSync',
        'Interact with dApps',
        'Complete testnet missions',
        'Deploy test contracts'
      ],
      tasksCompleted: [],
      isActive: true,
      balance: '0',
      lastActivity: new Date(),
      note: '⚙️ zkSync Era testnet - Layer 2 scaling solution with rich dApp ecosystem.',
      tags: ['Testnet', 'EVM', 'zkSync', 'Layer2', 'Airdrop'],
      createdAt: new Date()
    });

    console.log(`[Generate zkSync Wallet] ✅ Created: ${address}`);

    return {
      success: true,
      walletId: savedWallet._id.toString(),
      address: address,
      network: 'zkSync',
      networkType: 'EVM',
      portalUrl: 'https://portal.zksync.io',
      message: 'zkSync Era testnet wallet generated successfully!'
    };

  } catch (error) {
    console.error('[Generate zkSync Wallet] Error:', error);
    return {
      success: false,
      message: `Failed: ${error.message}`
    };
  }
});
