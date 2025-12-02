import ccxt from 'ccxt';

export default defineEventHandler(async (event) => {
  try {
    // Initialize Hyperliquid exchange
    const exchange = new ccxt.hyperliquid({
      'enableRateLimit': true,
    });

    // Fetch all markets
    const markets = await exchange.fetchMarkets();

    console.log(`📊 Fetched ${markets.length} markets from Hyperliquid`);

    return {
      success: true,
      data: markets,
      count: markets.length
    };

  } catch (error) {
    console.error('❌ Error fetching Hyperliquid markets:', error);
    return {
      success: false,
      message: error.message || "Failed to fetch markets",
      data: []
    };
  }
});
