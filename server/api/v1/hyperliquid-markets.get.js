import mongoose from 'mongoose';
import hyperliquidEcosystemSchema from '../../models/hyperliquidEcosystem.schema.js';

const HyperliquidEcosystem = mongoose.models.HyperliquidEcosystem || mongoose.model('HyperliquidEcosystem', hyperliquidEcosystemSchema);

/**
 * GET /api/v1/hyperliquid-markets
 *
 * Fetch Hyperliquid markets from database (cached data)
 * Query params:
 *  - type: 'spot' | 'perp' | 'all' (default: 'all')
 *  - search: search term for filtering markets
 *  - activeOnly: true | false (default: true)
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const marketType = query.type || 'all';
    const searchTerm = query.search || '';
    const activeOnly = query.activeOnly !== 'false';

    console.log(`[HYPERLIQUID-MARKETS] Fetching markets - Type: ${marketType}, Search: ${searchTerm}, ActiveOnly: ${activeOnly}`);

    // If search term provided, use search method
    if (searchTerm) {
      const searchType = marketType === 'all' ? null : marketType;
      let markets = await HyperliquidEcosystem.searchMarkets(searchTerm, searchType);

      if (activeOnly) {
        markets = markets.filter(m => m.status === 'active');
      }

      return {
        success: true,
        data: {
          markets,
          count: markets.length,
          searchTerm,
          type: marketType
        }
      };
    }

    // Fetch all markets or specific type
    if (marketType === 'all') {
      const allMarkets = await HyperliquidEcosystem.getAllActiveMarkets();

      return {
        success: true,
        data: {
          spot: allMarkets.spot,
          perp: allMarkets.perp,
          spotCount: allMarkets.spotCount,
          perpCount: allMarkets.perpCount,
          totalCount: allMarkets.spotCount + allMarkets.perpCount,
          lastSync: allMarkets.lastSync
        }
      };
    } else {
      // Fetch specific market type (spot or perp)
      const marketData = await HyperliquidEcosystem.getLatestMarkets(marketType);

      if (!marketData) {
        return {
          success: false,
          error: `No ${marketType} markets found in database. Please run sync script first.`,
          data: {
            markets: [],
            count: 0,
            lastSync: null
          }
        };
      }

      let markets = marketData.markets;
      if (activeOnly) {
        markets = markets.filter(m => m.status === 'active');
      }

      // Check if data is stale
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const isStale = new Date(marketData.lastSync) < oneHourAgo;

      return {
        success: true,
        data: {
          markets,
          count: markets.length,
          totalCount: marketData.totalMarkets,
          lastSync: marketData.lastSync,
          isStale,
          syncStatus: marketData.syncStatus,
          marketType
        },
        warning: isStale ? 'Market data is older than 1 hour. Consider running sync.' : null
      };
    }

  } catch (error) {
    console.error('[HYPERLIQUID-MARKETS] Error fetching markets:', error);

    return {
      success: false,
      error: error.message || 'Failed to fetch Hyperliquid markets',
      data: {
        markets: [],
        count: 0
      }
    };
  }
});
