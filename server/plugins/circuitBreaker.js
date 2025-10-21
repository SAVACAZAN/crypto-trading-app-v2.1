// Circuit Breaker for Exchange API calls
// Prevents API calls when exchanges are down

// DEVELOPMENT MODE: Circuit breaker is DISABLED - allow all API calls
const CIRCUIT_BREAKER_ENABLED = false;

const exchangeStatus = {
  coinbase: { operational: true, lastCheck: 0, shouldDisableSync: false },
  lcx: { operational: true, lastCheck: 0, shouldDisableSync: false },
  kraken: { operational: true, lastCheck: 0, shouldDisableSync: false }
};

const CHECK_INTERVAL = 60000; // Check every 60 seconds

// Check exchange status
async function checkExchangeStatus(exchange) {
  const now = Date.now();

  // Only check if last check was more than CHECK_INTERVAL ago
  if (now - exchangeStatus[exchange].lastCheck < CHECK_INTERVAL) {
    return exchangeStatus[exchange];
  }

  try {
    let isOperational = true;
    let shouldDisableSync = false;

    if (exchange === 'coinbaseadvanced' || exchange === 'coinbase') {
      // Check Coinbase status
      try {
        const statusResponse = await fetch('https://api.statuspage.io/v1/pages/5j4c75wtrnqh/summary.json');
        const statusData = await statusResponse.json();

        const hasIncidents = (statusData.incidents || []).some(i =>
          i.status === 'investigating' ||
          i.status === 'identified' ||
          i.status === 'monitoring'
        );

        const indicator = statusData.status?.indicator || 'unknown';
        isOperational = indicator === 'none' && !hasIncidents;
        shouldDisableSync = !isOperational;

        if (!isOperational) {
          console.log(`[CIRCUIT-BREAKER] ⚠️ Coinbase has issues - API calls disabled`);
        }
      } catch (e) {
        // If status check fails, try API directly
        try {
          const testResponse = await fetch('https://api.coinbase.com/api/v3/brokerage/time');
          isOperational = testResponse.ok;
          shouldDisableSync = !isOperational;
        } catch (apiError) {
          isOperational = false;
          shouldDisableSync = true;
        }
      }
    } else if (exchange === 'lcx') {
      // Check LCX API
      try {
        const testResponse = await fetch('https://exchange-api.lcx.com/market/tickers');
        isOperational = testResponse.ok;
        shouldDisableSync = !isOperational;
      } catch (e) {
        isOperational = false;
        shouldDisableSync = true;
      }
    } else if (exchange === 'kraken') {
      // Check Kraken status
      try {
        const testResponse = await fetch('https://api.kraken.com/0/public/SystemStatus');
        const data = await testResponse.json();
        isOperational = data?.result?.status === 'online';
        shouldDisableSync = !isOperational;
      } catch (e) {
        isOperational = false;
        shouldDisableSync = true;
      }
    }

    // Update cache
    exchangeStatus[exchange] = {
      operational: isOperational,
      lastCheck: now,
      shouldDisableSync
    };

    return exchangeStatus[exchange];
  } catch (error) {
    console.error(`[CIRCUIT-BREAKER] Error checking ${exchange} status:`, error);
    return { operational: false, shouldDisableSync: true };
  }
}

// Export middleware
export default defineNitroPlugin((nitroApp) => {
  console.log('[CIRCUIT-BREAKER] 🔌 Circuit breaker initialized');

  // Add method to check if API calls should be allowed
  nitroApp.canCallExchangeAPI = async function(exchange) {
    // Circuit breaker disabled in development
    if (!CIRCUIT_BREAKER_ENABLED) {
      return true;
    }

    const normalizedExchange = exchange === 'coinbaseadvanced' ? 'coinbase' : exchange;
    const status = await checkExchangeStatus(normalizedExchange);

    if (status.shouldDisableSync) {
      console.log(`[CIRCUIT-BREAKER] 🛑 Blocking API call to ${exchange} - Exchange is down`);
      return false;
    }

    return true;
  };

  // Add method to get current status
  nitroApp.getExchangeStatus = function(exchange) {
    const normalizedExchange = exchange === 'coinbaseadvanced' ? 'coinbase' : exchange;
    return exchangeStatus[normalizedExchange];
  };

  // Check all exchanges on startup (only if circuit breaker enabled)
  if (CIRCUIT_BREAKER_ENABLED) {
    (async () => {
      console.log('[CIRCUIT-BREAKER] 🔍 Checking initial exchange status...');
      await checkExchangeStatus('coinbase');
      await checkExchangeStatus('lcx');
      await checkExchangeStatus('kraken');

      // Log status
      for (const [exchange, status] of Object.entries(exchangeStatus)) {
        if (!status.operational) {
          console.log(`[CIRCUIT-BREAKER] ⚠️ ${exchange} is DOWN - API calls disabled`);
        } else {
          console.log(`[CIRCUIT-BREAKER] ✅ ${exchange} is operational`);
        }
      }
    })();
  } else {
    console.log('[CIRCUIT-BREAKER] 🔓 DISABLED for development - All API calls allowed');
  }
});