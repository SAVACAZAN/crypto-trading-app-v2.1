import TickersAnalist from '~/server/models/tickersAnalist.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const limit = parseInt(query.limit) || 3600; // Default: 1 hour of data (3600 seconds)
    const timeRange = parseInt(query.timeRange) || 3600; // Time range in seconds
    const symbol = query.symbol || 'LCX/USDT'; // Default to LCX if not specified
    const exchange = query.exchange || 'binance'; // Default exchange

    // Calculate start time
    const startTime = new Date(Date.now() - (timeRange * 1000));

    // Fetch ticker data from database filtered by symbol and exchange
    const tickerHistory = await TickersAnalist.find({
      symbol: symbol,
      exchange: exchange,
      timestamp: { $gte: startTime }
    })
      .sort({ timestamp: 1 }) // Ascending order (oldest first)
      .limit(limit)
      .lean();

    return {
      success: true,
      data: tickerHistory,
      count: tickerHistory.length,
      symbol: symbol,
      exchange: exchange
    };
  } catch (error) {
    console.error('Error fetching ticker history:', error);
    return {
      success: false,
      message: error.message,
      data: []
    };
  }
});
