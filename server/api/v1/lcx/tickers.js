// server/api/v1/lcx/tickers.js

import axios from 'axios';

export default defineEventHandler(async () => {
  try {
    const response = await axios.get('https://exchange-api.lcx.com/api/tickers');
    const tickerData = response.data.data;

    // Filter and map to required structure
    const filteredTickers = Object.keys(tickerData).map((symbol) => ({
      symbol,
      bestAsk: tickerData[symbol].bestAsk,
      bestBid: tickerData[symbol].bestBid,
      usdVolume: tickerData[symbol].usdVolume,
    }));

    return { data: filteredTickers };
  } catch (error) {
    console.error('Failed to fetch tickers:', error);
    return { error: 'Failed to fetch tickers.' };
  }
});
