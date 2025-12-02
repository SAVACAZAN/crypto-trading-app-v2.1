import mongoose from 'mongoose';
import hyperliquidUserAccountSchema from '../../models/hyperliquidUserAccount.schema.js';

const HyperliquidUserAccount = mongoose.models.HyperliquidUserAccount || mongoose.model('HyperliquidUserAccount', hyperliquidUserAccountSchema);

/**
 * GET /api/v1/hyperliquid-withdrawals
 *
 * Fetch user's withdrawal history on Hyperliquid
 * Query params:
 *  - userId: User ID
 *  - walletAddress: Hyperliquid wallet address
 *  - limit: (optional) Number of withdrawals to return (default: 100)
 *  - coin: (optional) Filter by specific coin
 *  - status: (optional) Filter by status (pending, processing, completed, failed, cancelled)
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { userId, walletAddress, limit = 100, coin, status } = query;

    if (!userId || !walletAddress) {
      return {
        success: false,
        error: 'Missing required parameters: userId and walletAddress'
      };
    }

    console.log(`[HYPERLIQUID-WITHDRAWALS] Fetching withdrawals for user ${userId}, wallet ${walletAddress}`);

    // Find user account
    const account = await HyperliquidUserAccount.findOne({
      userId,
      walletAddress
    })
      .select('withdrawals lastWithdrawalSync syncStatus.withdrawals stats')
      .lean()
      .exec();

    if (!account) {
      return {
        success: false,
        error: 'Account not found. Please sync account data first.',
        data: {
          withdrawals: [],
          count: 0,
          totalAmount: 0
        }
      };
    }

    // Get withdrawals and sort by time (newest first)
    let withdrawals = account.withdrawals || [];

    // Filter by coin if specified
    if (coin) {
      withdrawals = withdrawals.filter(w => w.coin.toUpperCase() === coin.toUpperCase());
    }

    // Filter by status if specified
    if (status) {
      withdrawals = withdrawals.filter(w => w.status === status);
    }

    // Sort by time descending
    withdrawals.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Apply limit
    const limitedWithdrawals = withdrawals.slice(0, parseInt(limit));

    // Calculate totals
    const totalAmount = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
    const totalUsdValue = withdrawals.reduce((sum, w) => sum + (w.usdValue || 0), 0);
    const totalFees = withdrawals.reduce((sum, w) => sum + (w.fee || 0), 0);

    // Status breakdown
    const statusBreakdown = {
      pending: withdrawals.filter(w => w.status === 'pending').length,
      processing: withdrawals.filter(w => w.status === 'processing').length,
      completed: withdrawals.filter(w => w.status === 'completed').length,
      failed: withdrawals.filter(w => w.status === 'failed').length,
      cancelled: withdrawals.filter(w => w.status === 'cancelled').length
    };

    // Check if data is stale (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const isStale = !account.lastWithdrawalSync || new Date(account.lastWithdrawalSync) < oneHourAgo;

    return {
      success: true,
      data: {
        withdrawals: limitedWithdrawals,
        count: withdrawals.length,
        displayedCount: limitedWithdrawals.length,
        totalAmount,
        totalUsdValue,
        totalFees,
        statusBreakdown,
        lastSync: account.lastWithdrawalSync,
        isStale,
        syncStatus: account.syncStatus?.withdrawals || 'never',
        filter: {
          ...(coin && { coin }),
          ...(status && { status })
        }
      },
      warning: isStale ? 'Withdrawal data is older than 1 hour. Consider refreshing.' : null
    };

  } catch (error) {
    console.error('[HYPERLIQUID-WITHDRAWALS] Error:', error);

    return {
      success: false,
      error: error.message || 'Failed to fetch withdrawals',
      data: {
        withdrawals: [],
        count: 0,
        totalAmount: 0
      }
    };
  }
});
