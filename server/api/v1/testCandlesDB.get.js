import { candlesSchema } from '~/server/models/candles.schema.js';

export default defineEventHandler(async (event) => {
  try {
    // Count total candles
    const totalCount = await candlesSchema.countDocuments();

    // Get distinct exchanges
    const exchanges = await candlesSchema.distinct('exchange');

    // Get distinct symbols
    const symbols = await candlesSchema.distinct('symbol');

    // Get distinct timeframes
    const timeframes = await candlesSchema.distinct('timeframe');

    // Get one sample candle
    const sampleCandle = await candlesSchema.findOne().lean();

    // Get candles grouped by exchange/symbol/timeframe
    const groups = await candlesSchema.aggregate([
      {
        $group: {
          _id: {
            exchange: '$exchange',
            symbol: '$symbol',
            timeframe: '$timeframe'
          },
          count: { $sum: 1 },
          latestTimestamp: { $max: '$timestamp' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    return {
      success: true,
      totalCandles: totalCount,
      exchanges,
      symbols,
      timeframes,
      sampleCandle,
      groups: groups.map(g => ({
        exchange: g._id.exchange,
        symbol: g._id.symbol,
        timeframe: g._id.timeframe,
        count: g.count,
        latestTimestamp: g.latestTimestamp
      }))
    };
  } catch (error) {
    console.error('❌ Error testing candles DB:', error);
    return {
      success: false,
      error: error.message
    };
  }
});
