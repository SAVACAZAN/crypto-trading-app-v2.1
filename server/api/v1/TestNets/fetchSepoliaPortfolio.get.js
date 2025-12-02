import { sepoliaNetworkBalance } from '~/server/models/sepoliaNetworkBalance.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { userID } = query;

    if (!userID) {
      return {
        success: false,
        message: 'Missing userID parameter',
      };
    }

    console.log(`[Fetch Sepolia Portfolio] User: ${userID}`);

    // Fetch all Sepolia balances for this user
    const balances = await sepoliaNetworkBalance.find({
      userID: userID,
      network: 'Sepolia',
      isActive: true
    }).sort({ balance: -1, lastScanned: -1 });

    // Calculate total balance
    let totalBalanceInETH = 0;
    if (balances && balances.length > 0) {
      totalBalanceInETH = balances.reduce((sum, item) => {
        const balance = parseFloat(item.balance || '0');
        return sum + balance;
      }, 0);
    }

    console.log(`[Fetch Sepolia Portfolio] Found ${balances.length} addresses, Total: ${totalBalanceInETH} ETH`);

    return {
      success: true,
      message: 'Portfolio fetched successfully',
      data: {
        balances: balances || [],
        totalBalance: totalBalanceInETH.toString(),
        totalAddresses: balances.length,
        lastUpdated: balances.length > 0 ? balances[0].lastScanned : null
      },
    };

  } catch (error) {
    console.error('[Fetch Sepolia Portfolio] Error:', error);
    return {
      success: false,
      message: 'Failed to fetch portfolio',
      error: error.message,
    };
  }
});
