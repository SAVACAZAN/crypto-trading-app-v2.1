import { candlesSchema } from '~/server/models/candles.schema.js';

export default defineEventHandler(async (event) => {
  const nitroApp = useNitroApp();
  const query = getQuery(event);

  const { userID, exchange, symbol, timeframe = '1h', limit = 100 } = query;

  if (!userID || !exchange || !symbol) {
    return {
      success: false,
      error: 'Missing required parameters: userID, exchange, symbol'
    };
  }

  try {
    console.log(`📊 fetchCandlesCached: ${exchange} ${symbol} ${timeframe} (limit: ${limit})`);

    // Calculate cache expiry time based on timeframe
    const cacheExpiry = getCacheExpiryTime(timeframe);
    const cutoffTime = new Date(Date.now() - cacheExpiry);

    // Check if we have recent candles in DB
    // DON'T limit the query - get ALL available candles from cache
    const cachedCandles = await candlesSchema.find({
      exchange,
      symbol,
      timeframe,
      timestamp: { $gte: cutoffTime }
    })
    .sort({ timestamp: -1 })
    // .limit(limit)  // REMOVED - get all candles from cache
    .lean();

    // If we have enough recent candles, return them (at least 50 or 80% of requested)
    if (cachedCandles && cachedCandles.length >= Math.min(limit * 0.8, 50)) {
      console.log(`✅ Using ${cachedCandles.length} cached candles from DB (requested: ${limit})`);

      // Sort by timestamp ascending (oldest first)
      const sortedCandles = cachedCandles.sort((a, b) =>
        new Date(a.timestamp) - new Date(b.timestamp)
      );

      // Convert to CCXT format [timestamp, open, high, low, close, volume]
      const data = sortedCandles.map(c => [
        new Date(c.timestamp).getTime(),
        c.open,
        c.high,
        c.low,
        c.close,
        c.volume
      ]);

      return {
        success: true,
        data,
        cached: true,
        count: data.length
      };
    }

    // Otherwise, fetch fresh data from exchange
    console.log(`🔄 Fetching fresh candles from ${exchange}...`);
    const response = await nitroApp.ccxtw.fetchOHLCV(
      userID,
      exchange,
      symbol,
      timeframe,
      undefined,  // since parameter (not used)
      parseInt(limit)  // limit parameter (convert to number)
    );

    if (!response.success || !response.data || response.data.length === 0) {
      console.error('❌ Failed to fetch candles from exchange:', response.error);
      return {
        success: false,
        error: response.error || 'No data returned from exchange'
      };
    }

    console.log(`✅ Fetched ${response.data.length} fresh candles from exchange`);

    // Save new candles to DB (upsert to avoid duplicates)
    const bulkOps = response.data.map(candle => ({
      updateOne: {
        filter: {
          exchange,
          symbol,
          timeframe,
          timestamp: new Date(candle[0])
        },
        update: {
          $set: {
            exchange,
            symbol,
            timeframe,
            timestamp: new Date(candle[0]),
            open: candle[1],
            high: candle[2],
            low: candle[3],
            close: candle[4],
            volume: candle[5]
          }
        },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await candlesSchema.bulkWrite(bulkOps);
      console.log(`💾 Saved ${bulkOps.length} candles to DB`);
    }

    // Clean up old candles (keep only last 1000 per timeframe)
    const oldCandlesCount = await candlesSchema.countDocuments({
      exchange,
      symbol,
      timeframe
    });

    if (oldCandlesCount > 1000) {
      const oldestToKeep = await candlesSchema.findOne({
        exchange,
        symbol,
        timeframe
      })
      .sort({ timestamp: -1 })
      .skip(1000)
      .select('timestamp')
      .lean();

      if (oldestToKeep) {
        await candlesSchema.deleteMany({
          exchange,
          symbol,
          timeframe,
          timestamp: { $lt: oldestToKeep.timestamp }
        });
        console.log(`🗑️ Cleaned up old candles (kept 1000 most recent)`);
      }
    }

    return {
      success: true,
      data: response.data,
      cached: false,
      count: response.data.length
    };

  } catch (error) {
    console.error('❌ Error in fetchCandlesCached:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
});

/**
 * Get cache expiry time in milliseconds based on timeframe
 * Shorter timeframes = shorter cache expiry
 */
function getCacheExpiryTime(timeframe) {
  const expiryMap = {
    '1m': 1 * 60 * 1000,      // 1 minute
    '5m': 2 * 60 * 1000,      // 2 minutes
    '15m': 5 * 60 * 1000,     // 5 minutes
    '1h': 15 * 60 * 1000,     // 15 minutes
    '4h': 60 * 60 * 1000,     // 1 hour
    '1d': 4 * 60 * 60 * 1000, // 4 hours
    '1w': 24 * 60 * 60 * 1000 // 24 hours
  };

  return expiryMap[timeframe] || 15 * 60 * 1000; // Default: 15 minutes
}
