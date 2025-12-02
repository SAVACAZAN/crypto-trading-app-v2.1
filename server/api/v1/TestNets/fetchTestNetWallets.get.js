import { testNetworksSchema } from '~/server/models/testNetworks.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { userID, network } = query;

    if (!userID) {
      return {
        success: false,
        message: 'Missing userID parameter',
      };
    }

    console.log(`[Fetch TestNet Wallets] User: ${userID}, Network: ${network || 'All'}`);

    // Build query filter
    const filter = { userID, isActive: true };
    if (network) {
      filter.network = network;
    }

    // Fetch wallets from testNetworksSchema
    const wallets = await testNetworksSchema.find(filter).sort({ createdAt: -1 });

    // Remove sensitive data from response (for security)
    const safeWallets = wallets.map(wallet => ({
      _id: wallet._id,
      walletName: wallet.walletName,
      network: wallet.network,
      networkSymbol: wallet.networkSymbol,
      networkType: wallet.networkType,
      chainId: wallet.chainId,
      rpcUrl: wallet.rpcUrl,
      explorerUrl: wallet.explorerUrl,
      address: wallet.address,
      publicKey: wallet.publicKey,
      // Don't send privateKey and mnemonic in list view
      faucetUrl: wallet.faucetUrl,
      portalUrl: wallet.portalUrl,
      tasks: wallet.tasks,
      tasksCompleted: wallet.tasksCompleted,
      balance: wallet.balance,
      lastActivity: wallet.lastActivity,
      note: wallet.note,
      tags: wallet.tags,
      createdAt: wallet.createdAt
    }));

    return {
      success: true,
      message: `Found ${safeWallets.length} testnet wallets`,
      data: safeWallets,
    };

  } catch (error) {
    console.error('[Fetch TestNet Wallets] Error:', error);
    return {
      success: false,
      message: 'Failed to fetch testnet wallets',
      error: error.message,
      data: [],
    };
  }
});
