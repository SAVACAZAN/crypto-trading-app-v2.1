import { candlesSchema } from '~/server/models/candles.schema.js';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { exchange, symbol, timeframe } = query;

  if (!exchange || !symbol || !timeframe) {
    return {
      success: false,
      error: 'Missing required parameters: exchange, symbol, timeframe'
    };
  }

  try {
    console.log(`📊 getVolumeData: ${exchange} ${symbol} ${timeframe}`);

    // Get candles from MongoDB (same query as FibBots)
    const candles = await candlesSchema.find({
      exchange,
      symbol,
      timeframe
    })
    .sort({ timestamp: -1 }) // Descending order (newest first)
    .lean();

    if (!candles || candles.length === 0) {
      console.warn(`⚠️ No candles found for ${exchange} ${symbol} ${timeframe}`);
      return {
        success: false,
        error: `No candles found for ${exchange} ${symbol} ${timeframe}`,
        candles: []
      };
    }

    console.log(`✅ Found ${candles.length} candles in DB`);

    // Convert to CCXT format: [timestamp, open, high, low, close, volume]
    const data = candles.map(c => [
      new Date(c.timestamp).getTime(),
      c.open,
      c.high,
      c.low,
      c.close,
      c.volume || 0
    ]);

    return {
      success: true,
      candles: data,
      count: data.length
    };

  } catch (error) {
    console.error('❌ Error in getVolumeData:', error);
    return {
      success: false,
      error: error.message
    };
  }
});
