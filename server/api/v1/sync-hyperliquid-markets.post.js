import mongoose from 'mongoose';
import hyperliquidEcosystemSchema from '../../models/hyperliquidEcosystem.schema.js';

const HyperliquidEcosystem = mongoose.models.HyperliquidEcosystem || mongoose.model('HyperliquidEcosystem', hyperliquidEcosystemSchema);

/**
 * POST /api/v1/sync-hyperliquid-markets
 *
 * Manually trigger sync of Hyperliquid markets from public API
 * This endpoint can be called manually or by a scheduled job
 */
export default defineEventHandler(async (event) => {
  try {
    console.log('[HYPERLIQUID-SYNC] Starting market sync...');

    const results = {
      spot: { success: false, count: 0, error: null },
      perp: { success: false, count: 0, error: null }
    };

    // Fetch SPOT markets
    try {
      console.log('[HYPERLIQUID-SYNC] Fetching SPOT markets from Hyperliquid API...');

      const spotResponse = await fetch('https://api.hyperliquid.xyz/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'spotMeta'
        })
      });

      if (!spotResponse.ok) {
        throw new Error(`Hyperliquid API error: ${spotResponse.status}`);
      }

      const spotData = await spotResponse.json();
      console.log('[HYPERLIQUID-SYNC] Received SPOT data:', spotData);

      // Parse spot markets
      const spotMarkets = [];
      if (spotData && spotData.tokens && Array.isArray(spotData.tokens)) {
        for (const token of spotData.tokens) {
          spotMarkets.push({
            symbol: `${token.name}/USDC`,
            baseAsset: token.name,
            quoteAsset: 'USDC',
            status: 'active',
            pricePrecision: 8,
            quantityPrecision: 8,
            tickSize: 0.01,
            stepSize: 0.001,
            metadata: {
              tokenId: token.index,
              fullName: token.name,
              ...token
            }
          });
        }
      } else if (spotData && spotData.universe && Array.isArray(spotData.universe)) {
        // Alternative structure
        for (const market of spotData.universe) {
          const [base, quote] = market.name ? market.name.split('/') : [market.coin || 'UNKNOWN', 'USDC'];
          spotMarkets.push({
            symbol: market.name || `${base}/${quote}`,
            baseAsset: base,
            quoteAsset: quote,
            status: 'active',
            pricePrecision: 8,
            quantityPrecision: 8,
            tickSize: parseFloat(market.szDecimals || 0.01),
            stepSize: 0.001,
            metadata: market
          });
        }
      }

      console.log(`[HYPERLIQUID-SYNC] Parsed ${spotMarkets.length} SPOT markets`);

      // Update or create SPOT markets in database
      await HyperliquidEcosystem.findOneAndUpdate(
        { marketType: 'spot' },
        {
          marketType: 'spot',
          markets: spotMarkets,
          totalMarkets: spotMarkets.length,
          lastSync: new Date(),
          syncStatus: 'success',
          syncError: null
        },
        { upsert: true, new: true }
      );

      results.spot.success = true;
      results.spot.count = spotMarkets.length;
      console.log(`[HYPERLIQUID-SYNC] ✅ SPOT markets saved: ${spotMarkets.length}`);

    } catch (error) {
      console.error('[HYPERLIQUID-SYNC] ❌ Error syncing SPOT markets:', error);
      results.spot.error = error.message;

      // Save error to database
      await HyperliquidEcosystem.findOneAndUpdate(
        { marketType: 'spot' },
        {
          syncStatus: 'failed',
          syncError: error.message,
          lastSync: new Date()
        },
        { upsert: true }
      );
    }

    // Fetch PERP markets
    try {
      console.log('[HYPERLIQUID-SYNC] Fetching PERP markets from Hyperliquid API...');

      const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'meta'
        })
      });

      if (!perpResponse.ok) {
        throw new Error(`Hyperliquid API error: ${perpResponse.status}`);
      }

      const perpData = await perpResponse.json();
      console.log('[HYPERLIQUID-SYNC] Received PERP data');

      // Parse perp markets
      const perpMarkets = [];
      if (perpData && perpData.universe && Array.isArray(perpData.universe)) {
        for (const market of perpData.universe) {
          perpMarkets.push({
            symbol: `${market.name}-PERP`,
            baseAsset: market.name,
            quoteAsset: 'USD',
            status: 'active',
            pricePrecision: 8,
            quantityPrecision: 8,
            minOrderSize: parseFloat(market.minSize || 0),
            maxOrderSize: parseFloat(market.maxLeverage || 0),
            tickSize: parseFloat(market.szDecimals || 0.01),
            stepSize: 0.001,
            metadata: {
              maxLeverage: market.maxLeverage,
              onlyIsolated: market.onlyIsolated,
              ...market
            }
          });
        }
      }

      console.log(`[HYPERLIQUID-SYNC] Parsed ${perpMarkets.length} PERP markets`);

      // Update or create PERP markets in database
      await HyperliquidEcosystem.findOneAndUpdate(
        { marketType: 'perp' },
        {
          marketType: 'perp',
          markets: perpMarkets,
          totalMarkets: perpMarkets.length,
          lastSync: new Date(),
          syncStatus: 'success',
          syncError: null
        },
        { upsert: true, new: true }
      );

      results.perp.success = true;
      results.perp.count = perpMarkets.length;
      console.log(`[HYPERLIQUID-SYNC] ✅ PERP markets saved: ${perpMarkets.length}`);

    } catch (error) {
      console.error('[HYPERLIQUID-SYNC] ❌ Error syncing PERP markets:', error);
      results.perp.error = error.message;

      // Save error to database
      await HyperliquidEcosystem.findOneAndUpdate(
        { marketType: 'perp' },
        {
          syncStatus: 'failed',
          syncError: error.message,
          lastSync: new Date()
        },
        { upsert: true }
      );
    }

    // Return results
    const overallSuccess = results.spot.success && results.perp.success;

    return {
      success: overallSuccess,
      message: overallSuccess
        ? 'Markets synced successfully'
        : 'Partial sync completed with errors',
      data: {
        spot: {
          success: results.spot.success,
          count: results.spot.count,
          error: results.spot.error
        },
        perp: {
          success: results.perp.success,
          count: results.perp.count,
          error: results.perp.error
        },
        totalCount: results.spot.count + results.perp.count,
        syncTime: new Date()
      }
    };

  } catch (error) {
    console.error('[HYPERLIQUID-SYNC] Fatal error:', error);

    return {
      success: false,
      error: error.message || 'Failed to sync Hyperliquid markets',
      data: null
    };
  }
});
