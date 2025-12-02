import ccxt from 'ccxt';

export default defineEventHandler(async (event) => {
  try {
    // Initialize Hyperliquid exchange
    const exchange = new ccxt.hyperliquid({
      'enableRateLimit': true,
    });

    // Fetch all currencies
    const currencies = await exchange.fetchCurrencies();

    console.log(`💱 Fetched ${Object.keys(currencies).length} currencies from Hyperliquid`);

    return {
      success: true,
      data: currencies,
      count: Object.keys(currencies).length
    };

  } catch (error) {
    console.error('❌ Error fetching Hyperliquid currencies:', error);
    return {
      success: false,
      message: error.message || "Failed to fetch currencies",
      data: {}
    };
  }
});
