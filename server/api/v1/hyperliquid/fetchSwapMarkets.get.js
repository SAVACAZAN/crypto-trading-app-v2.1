import ccxt from 'ccxt';

export default defineEventHandler(async (event) => {
  try {
    // Initialize Hyperliquid exchange
    const exchange = new ccxt.hyperliquid({
      'enableRateLimit': true,
    });

    // Fetch all markets
    const allMarkets = await exchange.fetchMarkets();

    // Filter for swap/perpetual markets (type === 'swap' or contract === true)
    const swapMarkets = allMarkets.filter(market =>
      market.type === 'swap' || market.swap === true || market.contract === true
    );

    console.log(`📊 Fetched ${swapMarkets.length} swap/perpetual markets from Hyperliquid (out of ${allMarkets.length} total)`);

    return {
      success: true,
      data: swapMarkets,
      count: swapMarkets.length,
      totalMarkets: allMarkets.length
    };

  } catch (error) {
    console.error('❌ Error fetching Hyperliquid swap markets:', error);
    return {
      success: false,
      message: error.message || "Failed to fetch swap markets",
      data: []
    };
  }
});
