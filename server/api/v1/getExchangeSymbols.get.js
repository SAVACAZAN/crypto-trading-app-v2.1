import TickersAnalist from '~/server/models/tickersAnalist.schema.js';

/**
 * Get all unique trading symbols for a specific exchange from the database
 * This is used to scan all markets for open orders
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { exchange } = query;

  if (!exchange) {
    return {
      success: false,
      error: 'Exchange parameter is required',
      data: []
    };
  }

  try {
    // Get all unique symbols for this exchange
    const symbols = await TickersAnalist.distinct('symbol', { exchange });

    console.log(`📊 Found ${symbols.length} unique symbols for ${exchange}`);

    return {
      success: true,
      data: symbols,
      count: symbols.length
    };
  } catch (error) {
    console.error('❌ Error fetching exchange symbols:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
});
