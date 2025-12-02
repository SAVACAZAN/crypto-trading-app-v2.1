import ccxt from 'ccxt';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { symbol, limit } = query;

    if (!symbol) {
      return {
        success: false,
        message: "Symbol parameter is required"
      };
    }

    // Initialize Hyperliquid exchange
    const exchange = new ccxt.hyperliquid({
      'enableRateLimit': true,
    });

    // Fetch order book
    const orderBook = await exchange.fetchOrderBook(symbol, limit ? parseInt(limit) : undefined);

    console.log(`📖 Fetched order book for ${symbol} from Hyperliquid (${orderBook.bids.length} bids, ${orderBook.asks.length} asks)`);

    return {
      success: true,
      data: orderBook
    };

  } catch (error) {
    console.error('❌ Error fetching Hyperliquid order book:', error);
    return {
      success: false,
      message: error.message || "Failed to fetch order book"
    };
  }
});
