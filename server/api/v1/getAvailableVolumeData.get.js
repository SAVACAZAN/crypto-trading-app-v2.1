import { candlesSchema } from '~/server/models/candles.schema.js';

export default defineEventHandler(async (event) => {
  try {
    console.log('📊 Getting available volume data combinations...');

    // Get all unique combinations of exchange/symbol/timeframe with count
    const combinations = await candlesSchema.aggregate([
      {
        $group: {
          _id: {
            exchange: '$exchange',
            symbol: '$symbol',
            timeframe: '$timeframe'
          },
          count: { $sum: 1 },
          latestTimestamp: { $max: '$timestamp' },
          oldestTimestamp: { $min: '$timestamp' }
        }
      },
      { $sort: { '_id.exchange': 1, '_id.symbol': 1, '_id.timeframe': 1 } }
    ]);

    console.log(`✅ Found ${combinations.length} data combinations`);

    return {
      success: true,
      combinations: combinations.map(c => ({
        exchange: c._id.exchange,
        symbol: c._id.symbol,
        timeframe: c._id.timeframe,
        count: c.count,
        latestTimestamp: c.latestTimestamp,
        oldestTimestamp: c.oldestTimestamp
      }))
    };

  } catch (error) {
    console.error('❌ Error getting available volume data:', error);
    return {
      success: false,
      error: error.message
    };
  }
});
