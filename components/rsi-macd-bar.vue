<script setup>
import { useAppStore } from '~/stores/app.store';

const app = useAppStore();
const userID = useCookie('userID');

// Get selected exchange and market from store
const selectedExchange = computed(() => app.getUserSelectedExchange || app.getSelectedExchange);
const selectedMarket = computed(() => app.getUserSelectedMarket || app.getSelectedTicker);

// RSI & MACD indicators - Multi-timeframe
// Coinbase Advanced supported: 1m, 5m, 15m, 30m, 1h, 2h, 6h, 1d (1w and 1M not supported)
const multiTimeframeData = ref({
  '1m': { rsi: null, macd: null, rsiClass: '', macdClass: '' },
  '5m': { rsi: null, macd: null, rsiClass: '', macdClass: '' },
  '15m': { rsi: null, macd: null, rsiClass: '', macdClass: '' },
  '30m': { rsi: null, macd: null, rsiClass: '', macdClass: '' },
  '1h': { rsi: null, macd: null, rsiClass: '', macdClass: '' },
  '2h': { rsi: null, macd: null, rsiClass: '', macdClass: '' },
  '6h': { rsi: null, macd: null, rsiClass: '', macdClass: '' },
  '1d': { rsi: null, macd: null, rsiClass: '', macdClass: '' }
});

let indicatorsInterval = null;
let debounceTimer = null;
const isLoading = ref(false);

// Debounced fetch function
function debouncedFetch() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchIndicators();
  }, 500); // 500ms debounce
}

// Watch for changes in store values
watch(selectedExchange, () => {
  debouncedFetch();
});

watch(selectedMarket, () => {
  debouncedFetch();
});

// Helper to get RSI class
function getRSIClass(rsi) {
  if (rsi >= 70) return 'overbought';
  if (rsi <= 30) return 'oversold';
  if (rsi >= 50) return 'bullish';
  return 'bearish';
}

// Helper to get MACD class
function getMACDClass(macd) {
  if (!macd || macd.histogram === null) return 'neutral';
  if (macd.histogram > 0 && macd.macd > macd.signal) return 'bullish';
  if (macd.histogram < 0 && macd.macd < macd.signal) return 'bearish';
  return 'neutral';
}

// Fetch RSI & MACD indicators for all timeframes
async function fetchIndicators() {
  if (isLoading.value) return; // Prevent concurrent fetches

  try {
    isLoading.value = true;
    const exchange = selectedExchange.value || 'coinbaseadvanced';
    const market = selectedMarket.value || 'LCX/USDC';

    if (!exchange || !market) return;

    // Coinbase Advanced supported timeframes only
    const timeframes = ['1m', '5m', '15m', '30m', '1h', '2h', '6h', '1d'];

    // Fetch all timeframes in parallel with timeout handling
    const promises = timeframes.map(async (timeframe) => {
      try {
        const response = await $fetch('/api/v1/calculateIndicators', {
          method: 'POST',
          body: {
            exchange: exchange,
            symbol: market,
            timeframe: timeframe
          },
          timeout: 60000 // 60 second timeout
        });

        if (response.success && response.data) {
          const rsi = response.data.currentRSI;
          const macd = response.data.currentMACD;

          multiTimeframeData.value[timeframe] = {
            rsi: rsi,
            macd: macd ? macd.histogram : null,
            rsiClass: rsi !== null ? getRSIClass(rsi) : '',
            macdClass: macd ? getMACDClass(macd) : ''
          };
        }
      } catch (err) {
        console.error(`Error fetching ${timeframe}:`, err.message || err);
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Error fetching indicators:', error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  console.log('🎯 RSI-MACD Bar mounted');
  console.log('📍 Initial values:', {
    exchange: selectedExchange.value,
    market: selectedMarket.value
  });

  // Wait a bit for store to initialize from layout
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log('📍 After delay:', {
    exchange: selectedExchange.value,
    market: selectedMarket.value
  });

  fetchIndicators(); // Fetch indicators on mount

  // Fetch indicators every 30 seconds
  indicatorsInterval = setInterval(fetchIndicators, 30000);
});

onUnmounted(() => {
  if (indicatorsInterval) {
    clearInterval(indicatorsInterval);
  }
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
});
</script>

<template>
  <div class="rsi-macd-bar">
    <div class="bar-header">
      <span class="bar-title">
        📊 RSI & MACD Analysis
        <span v-if="isLoading" class="loading-spinner">⏳</span>
      </span>
      <span class="bar-pair">{{ selectedMarket || 'LCX/USDC' }} @ {{ selectedExchange || 'coinbaseadvanced' }}</span>
    </div>

    <div class="indicators-scroll">
      <div
        v-for="(data, timeframe) in multiTimeframeData"
        :key="timeframe"
        class="timeframe-card"
      >
        <div class="timeframe-header">{{ timeframe }}</div>

        <div class="indicators-grid">
          <!-- RSI Indicator -->
          <div
            class="indicator-box rsi-box"
            :class="data.rsiClass"
            v-if="data.rsi !== null"
            :title="`RSI ${timeframe}: ${data.rsi?.toFixed(2)}`"
          >
            <div class="indicator-label">RSI</div>
            <div class="indicator-value">{{ data.rsi?.toFixed(2) }}</div>
            <div class="indicator-badge" :class="data.rsiClass">
              {{ data.rsiClass.toUpperCase() }}
            </div>
          </div>

          <!-- MACD Indicator -->
          <div
            class="indicator-box macd-box"
            :class="data.macdClass"
            v-if="data.macd !== null"
            :title="`MACD ${timeframe}: ${data.macd?.toFixed(4)}`"
          >
            <div class="indicator-label">MACD</div>
            <div class="indicator-value">
              {{ data.macd > 0 ? '+' : '' }}{{ data.macd?.toFixed(3) }}
            </div>
            <div class="indicator-badge" :class="data.macdClass">
              {{ data.macdClass.toUpperCase() }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rsi-macd-bar {
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, rgba(10, 10, 30, 0.95), rgba(20, 20, 40, 0.95));
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: rgba(0, 255, 255, 0.05);
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.bar-title {
  font-size: 13px;
  font-weight: 700;
  color: #00ffff;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.bar-pair {
  font-size: 11px;
  font-weight: 600;
  color: #ff00ff;
  text-shadow: 0 0 6px rgba(255, 0, 255, 0.5);
}

.indicators-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 4px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 255, 255, 0.3) transparent;
}

.indicators-scroll::-webkit-scrollbar {
  height: 6px;
}

.indicators-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.indicators-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.4);
  border-radius: 3px;
}

.indicators-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.6);
}

.timeframe-card {
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 3px;
  gap: 3px;
  min-width: 70px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.timeframe-card:hover {
  border-color: rgba(0, 255, 255, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.2);
}

.timeframe-header {
  text-align: center;
  font-size: 7px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.5);
  padding: 1px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.indicators-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.indicator-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2px 4px;
  border-radius: 2px;
  border: 1px solid;
  gap: 1px;
  transition: all 0.2s ease;
  cursor: help;
}

.indicator-box:hover {
  transform: scale(1.05);
}

.indicator-label {
  font-size: 6px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  opacity: 0.7;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1;
}

.indicator-value {
  font-size: 9px;
  font-weight: 800;
  line-height: 1;
}

.indicator-badge {
  font-size: 5px;
  font-weight: 700;
  padding: 1px 3px;
  border-radius: 6px;
  letter-spacing: 0.2px;
  line-height: 1;
}

/* RSI & MACD Color Classes */
.indicator-box.bullish {
  border-color: rgba(16, 235, 4, 0.6);
  background: rgba(16, 235, 4, 0.15);
}

.indicator-box.bullish .indicator-value {
  color: #10eb04;
  text-shadow: 0 0 8px rgba(16, 235, 4, 0.6);
}

.indicator-badge.bullish {
  background: rgba(16, 235, 4, 0.3);
  color: #10eb04;
  border: 1px solid rgba(16, 235, 4, 0.5);
}

.indicator-box.bearish {
  border-color: rgba(233, 10, 21, 0.6);
  background: rgba(233, 10, 21, 0.15);
}

.indicator-box.bearish .indicator-value {
  color: #e90a15;
  text-shadow: 0 0 8px rgba(233, 10, 21, 0.6);
}

.indicator-badge.bearish {
  background: rgba(233, 10, 21, 0.3);
  color: #e90a15;
  border: 1px solid rgba(233, 10, 21, 0.5);
}

.indicator-box.overbought {
  border-color: rgba(255, 107, 0, 0.6);
  background: rgba(255, 107, 0, 0.15);
}

.indicator-box.overbought .indicator-value {
  color: #ff6b00;
  text-shadow: 0 0 8px rgba(255, 107, 0, 0.6);
}

.indicator-badge.overbought {
  background: rgba(255, 107, 0, 0.3);
  color: #ff6b00;
  border: 1px solid rgba(255, 107, 0, 0.5);
}

.indicator-box.oversold {
  border-color: rgba(0, 149, 255, 0.6);
  background: rgba(0, 149, 255, 0.15);
}

.indicator-box.oversold .indicator-value {
  color: #0095ff;
  text-shadow: 0 0 8px rgba(0, 149, 255, 0.6);
}

.indicator-badge.oversold {
  background: rgba(0, 149, 255, 0.3);
  color: #0095ff;
  border: 1px solid rgba(0, 149, 255, 0.5);
}

.indicator-box.neutral {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
}

.indicator-box.neutral .indicator-value {
  color: #ffffff;
  text-shadow: 0 0 4px rgba(255, 255, 255, 0.3);
}

.indicator-badge.neutral {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}
</style>
