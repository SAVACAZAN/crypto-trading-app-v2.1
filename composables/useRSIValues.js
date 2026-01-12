import { ref } from 'vue';

export function useRSIValues() {
  // RSI values at bot creation (multi-timeframe)
  const rsiValues = ref({
    '1m': null,
    '5m': null,
    '15m': null,
    '30m': null,
    '1h': null,
    '2h': null,
    '6h': null,
    '1d': null
  });

  const currentPrice = ref(null);
  const isLoadingRSI = ref(false);

  /**
   * Fetch RSI values for all timeframes
   * @param {string} exchange - Exchange name (e.g., 'coinbaseadvanced')
   * @param {string} symbol - Trading pair (e.g., 'BTC/USD')
   */
  async function fetchRSIValues(exchange, symbol) {
    try {
      isLoadingRSI.value = true;
      const timeframes = ['1m', '5m', '15m', '30m', '1h', '2h', '6h', '1d'];

      console.log('📊 Fetching RSI values for bot creation:', { exchange, symbol });

      // Fetch all timeframes in parallel
      const promises = timeframes.map(async (tf) => {
        try {
          const response = await $fetch('/api/v1/calculateIndicators', {
            method: 'POST',
            body: {
              exchange: exchange,
              symbol: symbol,
              timeframe: tf
            },
            timeout: 60000
          });

          if (response.success && response.data && response.data.currentRSI) {
            rsiValues.value[tf] = response.data.currentRSI;
          }
        } catch (err) {
          console.error(`Error fetching RSI for ${tf}:`, err.message || err);
        }
      });

      await Promise.all(promises);
      console.log('✅ RSI values fetched:', rsiValues.value);
    } catch (error) {
      console.error('Error fetching RSI values:', error);
    } finally {
      isLoadingRSI.value = false;
    }
  }

  /**
   * Get RSI class for styling based on RSI value
   * @param {number} rsi - RSI value
   * @returns {string} CSS class name
   */
  function getRSIClass(rsi) {
    if (rsi === null || rsi === undefined) return '';
    if (rsi >= 70) return 'overbought';
    if (rsi <= 30) return 'oversold';
    if (rsi >= 50) return 'bullish';
    return 'bearish';
  }

  /**
   * Reset RSI values to null
   */
  function resetRSIValues() {
    Object.keys(rsiValues.value).forEach(key => {
      rsiValues.value[key] = null;
    });
    currentPrice.value = null;
  }

  return {
    rsiValues,
    currentPrice,
    isLoadingRSI,
    fetchRSIValues,
    getRSIClass,
    resetRSIValues
  };
}