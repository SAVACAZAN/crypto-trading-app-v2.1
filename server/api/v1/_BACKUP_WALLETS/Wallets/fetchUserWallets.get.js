import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

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

    console.log(`[Fetch Wallets] User: ${userID}, Network: ${network || 'All'}`);

    // Build query filter
    const filter = { userID, isActive: true };
    if (network) {
      filter.network = network;
    }

    // Fetch wallets from userWalletsSchema
    const wallets = await userWalletsSchema.find(filter).sort({ createdAt: -1 });

    // Remove sensitive data from response (for security)
    const safeWallets = wallets.map(wallet => ({
      _id: wallet._id,
      walletName: wallet.walletName,
      network: wallet.network,
      networkSymbol: wallet.networkSymbol,
      chainId: wallet.chainId,
      walletType: wallet.walletType,
      address: wallet.address,
      publicKey: wallet.publicKey,
      // Don't send privateKey and mnemonic in list view
      isDefault: wallet.isDefault,
      balance: wallet.balance,
      balanceUSD: wallet.balanceUSD,
      note: wallet.note,
      tags: wallet.tags,
      createdAt: wallet.createdAt,
      lastUsed: wallet.lastUsed
    }));

    return {
      success: true,
      message: `Found ${safeWallets.length} wallets`,
      data: safeWallets,
    };

  } catch (error) {
    console.error('[Fetch Wallets] Error:', error);
    return {
      success: false,
      message: 'Failed to fetch wallets',
      error: error.message,
      data: [],
    };
  }
});
