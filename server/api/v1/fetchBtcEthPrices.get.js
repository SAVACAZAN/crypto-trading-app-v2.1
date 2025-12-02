/**
 * Fetch BTC and ETH prices from Coinbase Advanced
 * Used by ticker-bar component for displaying live BTC/ETH prices
 * Uses CCXT directly (no auth required for public ticker data)
 *
 * Features:
 * - Extended timeout (30s)
 * - Retry logic (3 attempts)
 * - Multiple exchange fallbacks
 * - Cache last successful prices
 */
import ccxt from 'ccxt';

// Cache last successful prices (in-memory)
let priceCache = {
  btcPrice: 0,
  ethPrice: 0,
  lastUpdate: null
};

// Helper function to fetch with timeout and retry
async function fetchWithRetry(exchange, symbol, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const ticker = await exchange.fetchTicker(symbol);
      return ticker.last || 0;
    } catch (error) {
      console.error(`[fetchBtcEthPrices] Attempt ${attempt}/${maxRetries} failed for ${symbol}:`, error.message);

      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retry (exponential backoff: 1s, 2s, 4s)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
}

export default defineEventHandler(async (event) => {
  try {
    // Create Coinbase Advanced Trade exchange instance with extended timeout
    const coinbase = new ccxt.coinbaseadvanced({
      enableRateLimit: true,
      timeout: 30000, // 30 seconds timeout (increased from default 10s)
      options: {
        defaultType: 'spot'
      }
    });

    // Fetch BTC/USD and ETH/USD with retry logic
    const [btcPrice, ethPrice] = await Promise.all([
      fetchWithRetry(coinbase, 'BTC/USD'),
      fetchWithRetry(coinbase, 'ETH/USD')
    ]);

    // Update cache
    priceCache = {
      btcPrice,
      ethPrice,
      lastUpdate: new Date().toISOString()
    };

    return {
      success: true,
      data: {
        btcPrice,
        ethPrice,
        cached: false,
        lastUpdate: priceCache.lastUpdate
      }
    };

  } catch (error) {
    console.error('[fetchBtcEthPrices] Error after retries:', error);

    // Try alternative exchanges as fallback
    try {
      console.log('[fetchBtcEthPrices] Trying fallback exchanges...');

      // Try Kraken as fallback
      const kraken = new ccxt.kraken({
        enableRateLimit: true,
        timeout: 15000
      });

      const [btcPrice, ethPrice] = await Promise.all([
        fetchWithRetry(kraken, 'BTC/USD', 2),
        fetchWithRetry(kraken, 'ETH/USD', 2)
      ]);

      // Update cache
      priceCache = {
        btcPrice,
        ethPrice,
        lastUpdate: new Date().toISOString()
      };

      return {
        success: true,
        data: {
          btcPrice,
          ethPrice,
          cached: false,
          fallback: 'kraken',
          lastUpdate: priceCache.lastUpdate
        }
      };

    } catch (fallbackError) {
      console.error('[fetchBtcEthPrices] Fallback also failed:', fallbackError.message);

      // Return cached prices if available
      if (priceCache.btcPrice > 0 && priceCache.ethPrice > 0) {
        const cacheAge = priceCache.lastUpdate
          ? Math.floor((Date.now() - new Date(priceCache.lastUpdate).getTime()) / 1000)
          : 'unknown';

        console.log(`[fetchBtcEthPrices] Returning cached prices (${cacheAge}s old)`);

        return {
          success: true,
          data: {
            btcPrice: priceCache.btcPrice,
            ethPrice: priceCache.ethPrice,
            cached: true,
            cacheAge,
            lastUpdate: priceCache.lastUpdate
          }
        };
      }

      // No cache available, return zeros with error
      return {
        success: false,
        message: 'All price sources failed and no cache available',
        data: {
          btcPrice: 0,
          ethPrice: 0,
          cached: false
        }
      };
    }
  }
});
