import ccxt from 'ccxt';

export default defineEventHandler(async (event) => {
  try {
    // Initialize Hyperliquid exchange
    const exchange = new ccxt.hyperliquid({
      'enableRateLimit': true,
    });

    // Fetch all markets
    const allMarkets = await exchange.fetchMarkets();

    // Filter for spot markets only (type === 'spot')
    const spotMarkets = allMarkets.filter(market => market.type === 'spot');

    console.log(`📊 Fetched ${spotMarkets.length} spot markets from Hyperliquid (out of ${allMarkets.length} total)`);

    return {
      success: true,
      data: spotMarkets,
      count: spotMarkets.length,
      totalMarkets: allMarkets.length
    };

  } catch (error) {
    console.error('❌ Error fetching Hyperliquid spot markets:', error);
    return {
      success: false,
      message: error.message || "Failed to fetch spot markets",
      data: []
    };
  }
});
