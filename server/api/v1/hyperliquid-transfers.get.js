import mongoose from 'mongoose';
import hyperliquidUserAccountSchema from '../../models/hyperliquidUserAccount.schema.js';

const HyperliquidUserAccount = mongoose.models.HyperliquidUserAccount || mongoose.model('HyperliquidUserAccount', hyperliquidUserAccountSchema);

/**
 * GET /api/v1/hyperliquid-transfers
 *
 * Fetch user's internal transfer history (Spot ↔ Perp)
 * Query params:
 *  - userId: User ID
 *  - walletAddress: Hyperliquid wallet address
 *  - limit: (optional) Number of transfers to return (default: 100)
 *  - coin: (optional) Filter by specific coin
 *  - direction: (optional) Filter by direction (spot-to-perp, perp-to-spot)
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { userId, walletAddress, limit = 100, coin, direction } = query;

    if (!userId || !walletAddress) {
      return {
        success: false,
        error: 'Missing required parameters: userId and walletAddress'
      };
    }

    console.log(`[HYPERLIQUID-TRANSFERS] Fetching transfers for user ${userId}, wallet ${walletAddress}`);

    // Find user account
    const account = await HyperliquidUserAccount.findOne({
      userId,
      walletAddress
    })
      .select('transfers lastTransferSync syncStatus.transfers stats')
      .lean()
      .exec();

    if (!account) {
      return {
        success: false,
        error: 'Account not found. Please sync account data first.',
        data: {
          transfers: [],
          count: 0,
          totalAmount: 0
        }
      };
    }

    // Get transfers and sort by time (newest first)
    let transfers = account.transfers || [];

    // Filter by coin if specified
    if (coin) {
      transfers = transfers.filter(t => t.coin.toUpperCase() === coin.toUpperCase());
    }

    // Filter by direction if specified
    if (direction) {
      if (direction === 'spot-to-perp') {
        transfers = transfers.filter(t => t.fromAccount === 'spot' && t.toAccount === 'perp');
      } else if (direction === 'perp-to-spot') {
        transfers = transfers.filter(t => t.fromAccount === 'perp' && t.toAccount === 'spot');
      }
    }

    // Sort by time descending
    transfers.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Apply limit
    const limitedTransfers = transfers.slice(0, parseInt(limit));

    // Calculate totals
    const totalAmount = transfers.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalUsdValue = transfers.reduce((sum, t) => sum + (t.usdValue || 0), 0);

    // Direction breakdown
    const spotToPerp = transfers.filter(t => t.fromAccount === 'spot' && t.toAccount === 'perp');
    const perpToSpot = transfers.filter(t => t.fromAccount === 'perp' && t.toAccount === 'spot');

    const directionBreakdown = {
      spotToPerp: {
        count: spotToPerp.length,
        totalAmount: spotToPerp.reduce((sum, t) => sum + (t.amount || 0), 0)
      },
      perpToSpot: {
        count: perpToSpot.length,
        totalAmount: perpToSpot.reduce((sum, t) => sum + (t.amount || 0), 0)
      }
    };

    // Status breakdown
    const statusBreakdown = {
      completed: transfers.filter(t => t.status === 'completed').length,
      pending: transfers.filter(t => t.status === 'pending').length,
      failed: transfers.filter(t => t.status === 'failed').length
    };

    // Check if data is stale (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const isStale = !account.lastTransferSync || new Date(account.lastTransferSync) < oneHourAgo;

    return {
      success: true,
      data: {
        transfers: limitedTransfers,
        count: transfers.length,
        displayedCount: limitedTransfers.length,
        totalAmount,
        totalUsdValue,
        directionBreakdown,
        statusBreakdown,
        lastSync: account.lastTransferSync,
        isStale,
        syncStatus: account.syncStatus?.transfers || 'never',
        filter: {
          ...(coin && { coin }),
          ...(direction && { direction })
        }
      },
      warning: isStale ? 'Transfer data is older than 1 hour. Consider refreshing.' : null
    };

  } catch (error) {
    console.error('[HYPERLIQUID-TRANSFERS] Error:', error);

    return {
      success: false,
      error: error.message || 'Failed to fetch transfers',
      data: {
        transfers: [],
        count: 0,
        totalAmount: 0
      }
    };
  }
});
