import { EthereumWalletsSchema } from '~/server/models/EthereumWallets.schema';
import { userWalletsSchema } from '~/server/models/userWallets.schema';

/**
 * Fetch all Ethereum wallets for a specific user
 * Returns complete wallet data including addresses from both collections
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

    // Fetch from EthereumWallets collection (old/legacy wallets)
    const legacyWallets = await EthereumWalletsSchema.find({
      userID: userID,
      isActive: true
    }).sort({ generatedAt: -1 });

    // Fetch from userWallets collection (new/unified wallets)
    const newWallets = await userWalletsSchema.find({
      userID: userID,
      network: 'Ethereum',
      isActive: true
    }).sort({ createdAt: -1 });

    // Combine both collections
    const allWallets = [
      ...legacyWallets,
      ...newWallets
    ];

    console.log(`[fetchEthereumWallets] Found ${legacyWallets.length} legacy + ${newWallets.length} new = ${allWallets.length} total`);

    return {
      success: true,
      data: allWallets,
      count: allWallets.length
    };

  } catch (error) {
    console.error('[fetchEthereumWallets] Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch Ethereum wallets'
    };
  }
});
