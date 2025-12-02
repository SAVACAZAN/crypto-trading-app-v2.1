import ccxt from 'ccxt';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { symbol } = query; // Optional: fetch specific symbol ticker

    // Initialize Hyperliquid exchange
    const exchange = new ccxt.hyperliquid({
      'enableRateLimit': true,
    });

    let tickers;

    if (symbol) {
      // Fetch ticker for specific symbol
      const ticker = await exchange.fetchTicker(symbol);
      tickers = { [symbol]: ticker };
      console.log(`📊 Fetched ticker for ${symbol} from Hyperliquid`);
    } else {
      // Fetch all tickers
      tickers = await exchange.fetchTickers();
      console.log(`📊 Fetched ${Object.keys(tickers).length} tickers from Hyperliquid`);
    }

    return {
      success: true,
      data: tickers,
      count: Object.keys(tickers).length
    };

  } catch (error) {
    console.error('❌ Error fetching Hyperliquid tickers:', error);
    return {
      success: false,
      message: error.message || "Failed to fetch tickers",
      data: {}
    };
  }
});
