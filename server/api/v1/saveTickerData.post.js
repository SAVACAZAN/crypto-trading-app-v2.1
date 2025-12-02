import TickersAnalist from '~/server/models/tickersAnalist.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const {
      symbol,
      exchange,
      pairPriceUSD,
      pairPriceBTC,
      pairPriceETH,
      btcPriceUSD,
      btcPriceETH,
      ethPriceUSD,
      ethPriceBTC
    } = body;

    // Validate required fields
    if (!symbol || !exchange || !pairPriceUSD || !btcPriceUSD || !ethPriceUSD) {
      return {
        success: false,
        message: 'Missing required price data'
      };
    }

    // Create new ticker entry
    const tickerData = new TickersAnalist({
      symbol,
      exchange,
      pairPriceUSD,
      pairPriceBTC,
      pairPriceETH,
      btcPriceUSD,
      btcPriceETH,
      ethPriceUSD,
      ethPriceBTC,
      timestamp: new Date()
    });

    await tickerData.save();

    return {
      success: true,
      data: tickerData
    };
  } catch (error) {
    console.error('Error saving ticker data:', error);
    return {
      success: false,
      message: error.message
    };
  }
});
