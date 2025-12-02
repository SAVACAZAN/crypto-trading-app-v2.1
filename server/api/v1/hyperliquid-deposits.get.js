import mongoose from 'mongoose';
import hyperliquidUserAccountSchema from '../../models/hyperliquidUserAccount.schema.js';

const HyperliquidUserAccount = mongoose.models.HyperliquidUserAccount || mongoose.model('HyperliquidUserAccount', hyperliquidUserAccountSchema);

/**
 * GET /api/v1/hyperliquid-deposits
 *
 * Fetch user's deposit history on Hyperliquid
 * Query params:
 *  - userId: User ID
 *  - walletAddress: Hyperliquid wallet address
 *  - limit: (optional) Number of deposits to return (default: 100)
 *  - coin: (optional) Filter by specific coin
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { userId, walletAddress, limit = 100, coin } = query;

    if (!userId || !walletAddress) {
      return {
        success: false,
        error: 'Missing required parameters: userId and walletAddress'
      };
    }

    console.log(`[HYPERLIQUID-DEPOSITS] Fetching deposits for user ${userId}, wallet ${walletAddress}`);

    // Find user account
    const account = await HyperliquidUserAccount.findOne({
      userId,
      walletAddress
    })
      .select('deposits lastDepositSync syncStatus.deposits stats')
      .lean()
      .exec();

    if (!account) {
      return {
        success: false,
        error: 'Account not found. Please sync account data first.',
        data: {
          deposits: [],
          count: 0,
          totalAmount: 0
        }
      };
    }

    // Get deposits and sort by time (newest first)
    let deposits = account.deposits || [];

    // Filter by coin if specified
    if (coin) {
      deposits = deposits.filter(d => d.coin.toUpperCase() === coin.toUpperCase());
    }

    // Sort by time descending
    deposits.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Apply limit
    const limitedDeposits = deposits.slice(0, parseInt(limit));

    // Calculate total amount
    const totalAmount = deposits.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalUsdValue = deposits.reduce((sum, d) => sum + (d.usdValue || 0), 0);

    // Check if data is stale (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const isStale = !account.lastDepositSync || new Date(account.lastDepositSync) < oneHourAgo;

    return {
      success: true,
      data: {
        deposits: limitedDeposits,
        count: deposits.length,
        displayedCount: limitedDeposits.length,
        totalAmount,
        totalUsdValue,
        lastSync: account.lastDepositSync,
        isStale,
        syncStatus: account.syncStatus?.deposits || 'never',
        filter: coin ? { coin } : null
      },
      warning: isStale ? 'Deposit data is older than 1 hour. Consider refreshing.' : null
    };

  } catch (error) {
    console.error('[HYPERLIQUID-DEPOSITS] Error:', error);

    return {
      success: false,
      error: error.message || 'Failed to fetch deposits',
      data: {
        deposits: [],
        count: 0,
        totalAmount: 0
      }
    };
  }
});
