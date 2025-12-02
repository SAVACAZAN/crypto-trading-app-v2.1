export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const limit = query.limit || 100; // Default to top 100 coins
    const currency = query.currency || 'usd';

    // Fetch market data from CoinGecko API
    const response = await $fetch(`https://api.coingecko.com/api/v3/coins/markets`, {
      params: {
        vs_currency: currency,
        order: 'market_cap_desc',
        per_page: limit,
        page: 1,
        sparkline: false,
        price_change_percentage: '1h,24h,7d'
      }
    });

    // Transform data to our format
    const marketAssets = response.map((coin) => {
      // Categorize coins
      let category = 'altcoin';
      const symbol = coin.symbol.toUpperCase();

      // Layer 1 blockchains
      if (['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'AVAX', 'DOT', 'MATIC', 'ATOM', 'NEAR', 'FTM', 'ALGO'].includes(symbol)) {
        category = 'layer1';
      }
      // Layer 2 solutions
      else if (['ARB', 'OP', 'IMX', 'LRC', 'MATIC'].includes(symbol)) {
        category = 'layer2';
      }
      // DeFi tokens
      else if (['UNI', 'AAVE', 'LINK', 'CRV', 'MKR', 'COMP', 'SNX', 'SUSHI', '1INCH'].includes(symbol)) {
        category = 'defi';
      }
      // Meme coins
      else if (['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK'].includes(symbol)) {
        category = 'meme';
      }

      // Determine trend based on price changes
      let trend = 'Neutral';
      const change24h = coin.price_change_percentage_24h || 0;
      if (change24h > 5) trend = 'Bullish';
      else if (change24h < -5) trend = 'Bearish';

      return {
        symbol: symbol,
        name: coin.name,
        icon: coin.image, // CoinGecko provides image URLs
        price: coin.current_price,
        change: coin.price_change_percentage_24h || 0,
        change1h: coin.price_change_percentage_1h_in_currency || 0,
        change7d: coin.price_change_percentage_7d_in_currency || 0,
        marketCap: coin.market_cap / 1000000, // Convert to millions
        volume: coin.total_volume / 1000000, // Convert to millions
        category: category,
        trend: trend,
        high24h: coin.high_24h,
        low24h: coin.low_24h,
        ath: coin.ath,
        atl: coin.atl,
        circulatingSupply: coin.circulating_supply,
        totalSupply: coin.total_supply,
        maxSupply: coin.max_supply,
        rank: coin.market_cap_rank
      };
    });

    // Calculate global market stats
    const totalMarketCap = marketAssets.reduce((sum, asset) => sum + asset.marketCap, 0);
    const totalVolume = marketAssets.reduce((sum, asset) => sum + asset.volume, 0);
    const btcMarketCap = marketAssets.find(a => a.symbol === 'BTC')?.marketCap || 0;
    const btcDominance = totalMarketCap > 0 ? ((btcMarketCap / totalMarketCap) * 100) : 0;

    // Calculate average changes
    const avgChange24h = marketAssets.reduce((sum, a) => sum + a.change, 0) / marketAssets.length;

    console.log(`✅ Fetched ${marketAssets.length} market assets from CoinGecko`);

    return {
      success: true,
      data: {
        assets: marketAssets,
        stats: {
          totalMarketCap: totalMarketCap,
          totalVolume: totalVolume,
          btcDominance: btcDominance.toFixed(2),
          avgChange24h: avgChange24h.toFixed(2),
          assetsCount: marketAssets.length
        }
      }
    };
  } catch (error) {
    console.error('❌ Error fetching market heatmap data:', error);
    return {
      success: false,
      error: error.message,
      data: {
        assets: [],
        stats: {
          totalMarketCap: 0,
          totalVolume: 0,
          btcDominance: 0,
          avgChange24h: 0,
          assetsCount: 0
        }
      }
    };
  }
});
