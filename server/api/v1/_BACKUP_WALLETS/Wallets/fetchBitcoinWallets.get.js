import { BitcoinWalletsSchema } from '~/server/models/BitcoinWallets.schema';

/**
 * Fetch all Bitcoin wallets for a specific user
 * Returns complete wallet data including all address types
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { userID } = query;

    if (!userID) {
      return {
        success: false,
        message: 'userID is required'
      };
    }

    // Fetch all Bitcoin wallets for this user
    const bitcoinWallets = await BitcoinWalletsSchema.find({
      userID: userID,
      isActive: true
    }).sort({ generatedAt: -1 }); // Most recent first

    return {
      success: true,
      data: bitcoinWallets,
      count: bitcoinWallets.length
    };

  } catch (error) {
    console.error('[fetchBitcoinWallets] Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch Bitcoin wallets'
    };
  }
});
