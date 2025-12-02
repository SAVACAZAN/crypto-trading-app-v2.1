export default defineEventHandler(async (event) => {
  try {
    console.log('📊 [APEX] Fetching markets...');

    // Base URL for Apex Exchange (Omni) API
    const baseUrl = 'https://omni.apex.exchange/api';
    const endpoint = '/v3/all-config-data';

    // Fetch market config (public endpoint, no authentication needed)
    const response = await $fetch(`${baseUrl}${endpoint}`);

    console.log('✅ [APEX] Markets fetched successfully');

    // Transform response to match our format
    const perpetualData = response.data?.perpetualContract || [];
    const formattedMarkets = perpetualData.map(p => ({
      symbol: p.symbol,
      base: p.baseCoin,
      quote: p.quoteCoin,
      status: p.status || 'TRADING',
      lastPrice: p.lastPrice || '-',
      indexPrice: p.indexPrice || '-',
      markPrice: p.markPrice || '-'
    }));

    return {
      success: true,
      data: formattedMarkets
    };
  } catch (error) {
    console.error('❌ [APEX] Error fetching markets:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch markets',
      error: error.data || error.message
    };
  }
});
