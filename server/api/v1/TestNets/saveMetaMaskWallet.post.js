/**
 * Save MetaMask Wallet to TestNetworks
 * When user connects MetaMask, save the address to DB
 */
import { testNetworksSchema } from '~/server/models/testNetworks.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      userID,
      address,
      network,
      chainId
    } = body;

    if (!userID || !address) {
      return { success: false, message: 'userID and address are required' };
    }

    console.log(`[Save MetaMask Wallet] User: ${userID}, Address: ${address}`);

    // Normalize address to lowercase for case-insensitive matching
    const normalizedAddress = address.toLowerCase();

    // Check if this MetaMask wallet already exists for this user (case-insensitive)
    const existingWallet = await testNetworksSchema.findOne({
      userID,
      address: { $regex: new RegExp(`^${normalizedAddress}$`, 'i') },
      network: network || 'MegaETH',
      walletType: 'metamask'
    });

    if (existingWallet) {
      console.log('[Save MetaMask Wallet] ✅ Wallet already exists, ID:', existingWallet._id);
      return {
        success: true,
        walletId: existingWallet._id.toString(),
        message: 'MetaMask wallet already saved',
        alreadyExists: true
      };
    }

    console.log('[Save MetaMask Wallet] No existing wallet found, creating new...');

    // Network-specific configuration
    let networkConfig = {
      network: 'MegaETH',
      networkSymbol: 'METH',
      networkType: 'EVM',
      chainId: 6342,
      rpcUrl: 'https://carrot.megaeth.com/rpc',
      explorerUrl: 'https://megaeth-testnet.blockscout.com',
      faucetUrl: 'https://testnet.megaeth.com/#2',
      portalUrl: 'https://www.megaeth.com'
    };

    // Override with provided network/chainId if specified
    if (network) networkConfig.network = network;
    if (chainId) networkConfig.chainId = chainId;

    // Save MetaMask wallet (store address in original case)
    const savedWallet = await testNetworksSchema.create({
      userID,
      walletName: `🦊 MetaMask ${address.slice(0, 6)}...${address.slice(-4)}`,
      ...networkConfig,
      address: address,
      publicKey: '', // MetaMask doesn't expose public key
      privateKey: '', // MetaMask wallets don't store private key (security)
      mnemonic: '',
      walletType: 'metamask',
      tasks: [
        'Add MegaETH to MetaMask',
        'Connect wallet to testnet',
        'Get test METH from faucet',
        'Make test transactions'
      ],
      tasksCompleted: ['Add MegaETH to MetaMask', 'Connect wallet to testnet'],
      isActive: true,
      balance: '0',
      lastActivity: new Date(),
      note: '🦊 MetaMask wallet connected for signing transactions and interacting with dApps.',
      tags: ['Testnet', 'EVM', 'L2', 'MetaMask', 'Connected'],
      createdAt: new Date()
    });

    console.log(`[Save MetaMask Wallet] ✅ Saved successfully!`);
    console.log(`[Save MetaMask Wallet] Wallet ID: ${savedWallet._id.toString()}`);
    console.log(`[Save MetaMask Wallet] Address: ${address}`);
    console.log(`[Save MetaMask Wallet] Network: ${networkConfig.network}`);

    return {
      success: true,
      walletId: savedWallet._id.toString(),
      address: address,
      network: networkConfig.network,
      walletType: 'metamask',
      message: 'MetaMask wallet saved successfully!'
    };

  } catch (error) {
    console.error('[Save MetaMask Wallet] Error:', error);
    return {
      success: false,
      message: `Failed: ${error.message}`
    };
  }
});
