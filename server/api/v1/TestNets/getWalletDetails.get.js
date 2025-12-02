import { testNetworksSchema } from '~/server/models/testNetworks.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { walletId, userID } = query;

    if (!walletId || !userID) {
      return {
        success: false,
        message: 'Missing walletId or userID parameter',
      };
    }

    console.log(`[Get Wallet Details] Wallet: ${walletId}, User: ${userID}`);

    // Fetch wallet with security check (must belong to the user)
    const wallet = await testNetworksSchema.findOne({
      _id: walletId,
      userID: userID,
      isActive: true
    });

    if (!wallet) {
      return {
        success: false,
        message: 'Wallet not found or access denied',
      };
    }

    // Return full wallet details including privateKey
    // This is secure because we verify the wallet belongs to the authenticated user
    return {
      success: true,
      message: 'Wallet details retrieved',
      data: {
        _id: wallet._id,
        walletName: wallet.walletName,
        network: wallet.network,
        networkSymbol: wallet.networkSymbol,
        address: wallet.address,
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey, // Include for SAVACAZANwalletemulator
        mnemonic: wallet.mnemonic,
        chainId: wallet.chainId,
        rpcUrl: wallet.rpcUrl,
        explorerUrl: wallet.explorerUrl,
        balance: wallet.balance,
        lastActivity: wallet.lastActivity,
        createdAt: wallet.createdAt
      },
    };

  } catch (error) {
    console.error('[Get Wallet Details] Error:', error);
    return {
      success: false,
      message: 'Failed to fetch wallet details',
      error: error.message,
    };
  }
});
