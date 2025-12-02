import mongoose from 'mongoose';
import hyperliquidUserAccountSchema from '../../models/hyperliquidUserAccount.schema.js';

const HyperliquidUserAccount = mongoose.models.HyperliquidUserAccount || mongoose.model('HyperliquidUserAccount', hyperliquidUserAccountSchema);

/**
 * GET /api/v1/hyperliquid-balance
 *
 * Fetch user's Hyperliquid balance (Spot + Perp)
 * Query params:
 *  - userId: User ID
 *  - walletAddress: Hyperliquid wallet address
 *  - apiKeyId: (optional) Specific API key ID
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { userId, walletAddress, apiKeyId } = query;

    if (!userId || !walletAddress) {
      return {
        success: false,
        error: 'Missing required parameters: userId and walletAddress'
      };
    }

    console.log(`[HYPERLIQUID-BALANCE] Fetching balance for user ${userId}, wallet ${walletAddress}`);

    // Find user account
    const account = await HyperliquidUserAccount.findOne({
      userId,
      walletAddress,
      ...(apiKeyId && { apiKeyId })
    })
      .select('balance lastBalanceSync syncStatus.balance stats')
      .lean()
      .exec();

    if (!account) {
      return {
        success: false,
        error: 'Account not found. Please sync account data first.',
        data: {
          spot: { assets: [], totalUsdValue: 0 },
          perp: { marginSummary: null, assetPositions: [] },
          totalAccountValue: 0,
          lastSync: null
        }
      };
    }

    // Check if data is stale (older than 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const isStale = !account.lastBalanceSync || new Date(account.lastBalanceSync) < fiveMinutesAgo;

    return {
      success: true,
      data: {
        spot: account.balance?.spot || { assets: [], totalUsdValue: 0 },
        perp: account.balance?.perp || { marginSummary: null, assetPositions: [] },
        totalAccountValue: account.balance?.totalAccountValue || 0,
        lastSync: account.lastBalanceSync,
        isStale,
        syncStatus: account.syncStatus?.balance || 'never',
        stats: account.stats || {}
      },
      warning: isStale ? 'Balance data is older than 5 minutes. Consider refreshing.' : null
    };

  } catch (error) {
    console.error('[HYPERLIQUID-BALANCE] Error:', error);

    return {
      success: false,
      error: error.message || 'Failed to fetch balance',
      data: {
        spot: { assets: [], totalUsdValue: 0 },
        perp: { marginSummary: null, assetPositions: [] },
        totalAccountValue: 0
      }
    };
  }
});
