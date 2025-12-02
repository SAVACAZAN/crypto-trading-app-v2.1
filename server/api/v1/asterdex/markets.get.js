export default defineEventHandler(async (event) => {
  try {
    console.log('📊 [ASTERDEX] Fetching markets...');

    // Base URL for Asterdex API
    const baseUrl = 'https://sapi.asterdex.com';

    // Fetch exchange info (public endpoint, no authentication needed)
    const response = await $fetch(`${baseUrl}/api/v1/exchangeInfo`);

    console.log('✅ [ASTERDEX] Markets fetched successfully');

    // Transform response to match our format
    const symbols = response.symbols || [];
    const formattedMarkets = symbols.map(s => ({
      symbol: s.symbol,
      base: s.baseAsset,
      quote: s.quoteAsset,
      status: s.status,
      baseAssetPrecision: s.baseAssetPrecision,
      quoteAssetPrecision: s.quotePrecision
    }));

    return {
      success: true,
      data: formattedMarkets
    };
  } catch (error) {
    console.error('❌ [ASTERDEX] Error fetching markets:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch markets',
      error: error.data || error.message
    };
  }
});
