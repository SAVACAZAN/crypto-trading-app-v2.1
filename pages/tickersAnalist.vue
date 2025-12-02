<template>
  <div class="tickers-analist-page">
    <div class="page-header">
      <h1 class="page-title">📊 Tickers Analist - Live Price Tracking</h1>
      <p class="page-subtitle">Real-time price analysis for {{ selectedCoin }} on {{ selectedExchange }}</p>
    </div>

    <!-- Current Prices Display -->
    <div class="current-prices">
      <div class="price-box lcx-box">
        <span class="coin-label">{{ selectedCoin }}</span>
        <span class="price-value">${{ latestPrices.pairPriceUSD?.toFixed(6) || '0.000000' }}</span>
        <div class="conversions">
          <span>₿{{ latestPrices.pairPriceBTC?.toFixed(10) || '0' }}</span>
          <span>Ξ{{ latestPrices.pairPriceETH?.toFixed(10) || '0' }}</span>
        </div>
      </div>

      <div class="price-box btc-box">
        <span class="coin-label">BTC</span>
        <span class="price-value">${{ latestPrices.btcPriceUSD?.toLocaleString() || '0' }}</span>
        <div class="conversions">
          <span>Ξ{{ latestPrices.btcPriceETH?.toFixed(2) || '0' }}</span>
          <span>{{ (latestPrices.btcPriceUSD / latestPrices.pairPriceUSD)?.toLocaleString() || '0' }} {{ selectedCoin }}</span>
        </div>
      </div>

      <div class="price-box eth-box">
        <span class="coin-label">ETH</span>
        <span class="price-value">${{ latestPrices.ethPriceUSD?.toLocaleString() || '0' }}</span>
        <div class="conversions">
          <span>₿{{ latestPrices.ethPriceBTC?.toFixed(5) || '0' }}</span>
          <span>{{ (latestPrices.ethPriceUSD / latestPrices.pairPriceUSD)?.toLocaleString() || '0' }} {{ selectedCoin }}</span>
        </div>
      </div>

      <div class="stats-box">
        <span class="stat-label">Data Points</span>
        <span class="stat-value">{{ dataPoints }}</span>
        <span class="stat-label">Time Range</span>
        <span class="stat-value">{{ timeRangeLabel }}</span>
      </div>
    </div>

    <!-- Correlations Section -->
    <div class="correlations-section">
      <h2 class="section-title">📈 Price Correlations</h2>
      <div class="correlation-grid">
        <div class="correlation-card">
          <span class="corr-label">{{ selectedCoin }} ↔ BTC</span>
          <span class="corr-value" :class="getCorrelationClass(correlations.pairBtc)">{{ formatCorrelation(correlations.pairBtc) }}</span>
          <span class="corr-desc">{{ getCorrelationDescription(correlations.pairBtc) }}</span>
        </div>
        <div class="correlation-card">
          <span class="corr-label">{{ selectedCoin }} ↔ ETH</span>
          <span class="corr-value" :class="getCorrelationClass(correlations.pairEth)">{{ formatCorrelation(correlations.pairEth) }}</span>
          <span class="corr-desc">{{ getCorrelationDescription(correlations.pairEth) }}</span>
        </div>
        <div class="correlation-card">
          <span class="corr-label">BTC ↔ ETH</span>
          <span class="corr-value" :class="getCorrelationClass(correlations.btcEth)">{{ formatCorrelation(correlations.btcEth) }}</span>
          <span class="corr-desc">{{ getCorrelationDescription(correlations.btcEth) }}</span>
        </div>
      </div>
    </div>

    <!-- Price Differences Table -->
    <div class="differences-section">
      <h2 class="section-title">📊 Price Differences (Delta)</h2>

      <!-- Selected Coin Differences -->
      <div class="diff-card lcx-diff">
        <h3 class="diff-title">{{ selectedCoin }} Price Changes</h3>
        <div class="diff-grid">
          <div class="diff-item">
            <span class="diff-label">1s</span>
            <span class="diff-value" :class="getDiffClass(deltas.pair1s)">{{ formatDiff(deltas.pair1s) }}</span>
          </div>
          <div class="diff-item">
            <span class="diff-label">1m</span>
            <span class="diff-value" :class="getDiffClass(deltas.pair1m)">{{ formatDiff(deltas.pair1m) }}</span>
          </div>
          <div class="diff-item">
            <span class="diff-label">1h</span>
            <span class="diff-value" :class="getDiffClass(deltas.pair1h)">{{ formatDiff(deltas.pair1h) }}</span>
          </div>
          <div class="diff-item">
            <span class="diff-label">1d</span>
            <span class="diff-value" :class="getDiffClass(deltas.pair1d)">{{ formatDiff(deltas.pair1d) }}</span>
          </div>
        </div>
      </div>

      <!-- BTC Differences -->
      <div class="diff-card btc-diff">
        <h3 class="diff-title">BTC Price Changes</h3>
        <div class="diff-grid">
          <div class="diff-item">
            <span class="diff-label">1s</span>
            <span class="diff-value" :class="getDiffClass(deltas.btc1s)">{{ formatDiff(deltas.btc1s) }}</span>
          </div>
          <div class="diff-item">
            <span class="diff-label">1m</span>
            <span class="diff-value" :class="getDiffClass(deltas.btc1m)">{{ formatDiff(deltas.btc1m) }}</span>
          </div>
          <div class="diff-item">
            <span class="diff-label">1h</span>
            <span class="diff-value" :class="getDiffClass(deltas.btc1h)">{{ formatDiff(deltas.btc1h) }}</span>
          </div>
          <div class="diff-item">
            <span class="diff-label">1d</span>
            <span class="diff-value" :class="getDiffClass(deltas.btc1d)">{{ formatDiff(deltas.btc1d) }}</span>
          </div>
        </div>
      </div>

      <!-- ETH Differences -->
      <div class="diff-card eth-diff">
        <h3 class="diff-title">ETH Price Changes</h3>
        <div class="diff-grid">
          <div class="diff-item">
            <span class="diff-label">1s</span>
            <span class="diff-value" :class="getDiffClass(deltas.eth1s)">{{ formatDiff(deltas.eth1s) }}</span>
          </div>
          <div class="diff-item">
            <span class="diff-label">1m</span>
            <span class="diff-value" :class="getDiffClass(deltas.eth1m)">{{ formatDiff(deltas.eth1m) }}</span>
          </div>
          <div class="diff-item">
            <span class="diff-label">1h</span>
            <span class="diff-value" :class="getDiffClass(deltas.eth1h)">{{ formatDiff(deltas.eth1h) }}</span>
          </div>
          <div class="diff-item">
            <span class="diff-label">1d</span>
            <span class="diff-value" :class="getDiffClass(deltas.eth1d)">{{ formatDiff(deltas.eth1d) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Time Range Selector -->
    <div class="controls">
      <n-button-group>
        <n-button @click="setTimeRange(60)" :type="timeRange === 60 ? 'primary' : 'default'">1 Min</n-button>
        <n-button @click="setTimeRange(300)" :type="timeRange === 300 ? 'primary' : 'default'">5 Min</n-button>
        <n-button @click="setTimeRange(900)" :type="timeRange === 900 ? 'primary' : 'default'">15 Min</n-button>
        <n-button @click="setTimeRange(1800)" :type="timeRange === 1800 ? 'primary' : 'default'">30 Min</n-button>
        <n-button @click="setTimeRange(3600)" :type="timeRange === 3600 ? 'primary' : 'default'">1 Hour</n-button>
        <n-button @click="setTimeRange(7200)" :type="timeRange === 7200 ? 'primary' : 'default'">2 Hours</n-button>
      </n-button-group>
    </div>

    <!-- Chart -->
    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import Chart from 'chart.js/auto';
import { useAppStore } from '~/stores/app.store';

definePageMeta({
  middleware: 'auth'
});

const appStore = useAppStore();

const chartCanvas = ref(null);
let chartInstance = null;
let fetchInterval = null;

const tickerHistory = ref([]);
const timeRange = ref(3600); // Default: 1 hour
const latestPrices = ref({});

// Get selected symbol and exchange from store (synced with ticker-bar)
const selectedSymbol = computed(() => appStore.getUserSelectedMarket || 'LCX/USDC');
const selectedExchange = computed(() => appStore.getUserSelectedExchange || 'coinbaseadvanced');
const selectedCoin = computed(() => selectedSymbol.value.split('/')[0]);

const dataPoints = computed(() => tickerHistory.value.length);
const timeRangeLabel = computed(() => {
  const minutes = timeRange.value / 60;
  if (minutes < 60) return `${minutes} min`;
  return `${minutes / 60} hour${minutes / 60 > 1 ? 's' : ''}`;
});

// Calculate price deltas (differences) for various timeframes
const deltas = computed(() => {
  if (tickerHistory.value.length < 2) {
    return {
      pair1s: 0, pair1m: 0, pair1h: 0, pair1d: 0,
      btc1s: 0, btc1m: 0, btc1h: 0, btc1d: 0,
      eth1s: 0, eth1m: 0, eth1h: 0, eth1d: 0
    };
  }

  const latest = tickerHistory.value[tickerHistory.value.length - 1];
  const findPriceAt = (secondsAgo) => {
    const targetTime = new Date(latest.timestamp).getTime() - (secondsAgo * 1000);
    const closest = tickerHistory.value.reduce((prev, curr) => {
      const prevDiff = Math.abs(new Date(prev.timestamp).getTime() - targetTime);
      const currDiff = Math.abs(new Date(curr.timestamp).getTime() - targetTime);
      return currDiff < prevDiff ? curr : prev;
    });
    return closest;
  };

  const price1s = tickerHistory.value.length > 1 ? tickerHistory.value[tickerHistory.value.length - 2] : latest;
  const price1m = findPriceAt(60);
  const price1h = findPriceAt(3600);
  const price1d = findPriceAt(86400);

  return {
    // Selected pair deltas
    pair1s: ((latest.pairPriceUSD - price1s.pairPriceUSD) / price1s.pairPriceUSD) * 100,
    pair1m: ((latest.pairPriceUSD - price1m.pairPriceUSD) / price1m.pairPriceUSD) * 100,
    pair1h: ((latest.pairPriceUSD - price1h.pairPriceUSD) / price1h.pairPriceUSD) * 100,
    pair1d: ((latest.pairPriceUSD - price1d.pairPriceUSD) / price1d.pairPriceUSD) * 100,

    // BTC deltas
    btc1s: ((latest.btcPriceUSD - price1s.btcPriceUSD) / price1s.btcPriceUSD) * 100,
    btc1m: ((latest.btcPriceUSD - price1m.btcPriceUSD) / price1m.btcPriceUSD) * 100,
    btc1h: ((latest.btcPriceUSD - price1h.btcPriceUSD) / price1h.btcPriceUSD) * 100,
    btc1d: ((latest.btcPriceUSD - price1d.btcPriceUSD) / price1d.btcPriceUSD) * 100,

    // ETH deltas
    eth1s: ((latest.ethPriceUSD - price1s.ethPriceUSD) / price1s.ethPriceUSD) * 100,
    eth1m: ((latest.ethPriceUSD - price1m.ethPriceUSD) / price1m.ethPriceUSD) * 100,
    eth1h: ((latest.ethPriceUSD - price1h.ethPriceUSD) / price1h.ethPriceUSD) * 100,
    eth1d: ((latest.ethPriceUSD - price1d.ethPriceUSD) / price1d.ethPriceUSD) * 100
  };
});

// Format delta with +/- sign and percentage
function formatDiff(value) {
  if (!value || isNaN(value)) return '0.00%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(4)}%`;
}

// Get CSS class for positive/negative diff
function getDiffClass(value) {
  if (!value || isNaN(value)) return 'neutral';
  return value >= 0 ? 'positive' : 'negative';
}

// Calculate Pearson correlation between two arrays
function calculateCorrelation(x, y) {
  const n = x.length;
  if (n === 0) return 0;

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  const num = x.map((v, i) => (v - meanX) * (y[i] - meanY)).reduce((a, b) => a + b, 0);
  const den = Math.sqrt(
    x.map(v => (v - meanX) ** 2).reduce((a, b) => a + b, 0) *
    y.map(v => (v - meanY) ** 2).reduce((a, b) => a + b, 0)
  );

  return den === 0 ? 0 : num / den;
}

// Calculate correlations between coins
const correlations = computed(() => {
  if (tickerHistory.value.length < 2) {
    return {
      pairBtc: 0,
      pairEth: 0,
      btcEth: 0
    };
  }

  const pair = tickerHistory.value.map(t => t.pairPriceUSD);
  const btc = tickerHistory.value.map(t => t.btcPriceUSD);
  const eth = tickerHistory.value.map(t => t.ethPriceUSD);

  return {
    pairBtc: calculateCorrelation(pair, btc),
    pairEth: calculateCorrelation(pair, eth),
    btcEth: calculateCorrelation(btc, eth)
  };
});

// Format correlation value
function formatCorrelation(value) {
  if (!value || isNaN(value)) return '0.0000';
  return value.toFixed(4);
}

// Get correlation class based on strength
function getCorrelationClass(value) {
  const abs = Math.abs(value);
  if (abs > 0.8) return 'corr-strong';
  if (abs > 0.5) return 'corr-moderate';
  if (abs > 0.3) return 'corr-weak';
  return 'corr-none';
}

// Get correlation description
function getCorrelationDescription(value) {
  const abs = Math.abs(value);
  if (abs > 0.8) return 'Strong Correlation';
  if (abs > 0.5) return 'Moderate Correlation';
  if (abs > 0.3) return 'Weak Correlation';
  return 'No Correlation';
}

// Fetch ticker history from database (filtered by selected symbol/exchange)
async function fetchTickerHistory() {
  try {
    const response = await $fetch('/api/v1/fetchTickerHistory', {
      query: {
        symbol: selectedSymbol.value,
        exchange: selectedExchange.value,
        timeRange: timeRange.value,
        limit: 7200 // Max 2 hours of second-by-second data
      }
    });

    if (response.success && response.data) {
      tickerHistory.value = response.data;

      // Update latest prices
      if (response.data.length > 0) {
        latestPrices.value = response.data[response.data.length - 1];
      }

      updateChart();
    }
  } catch (error) {
    console.error('Error fetching ticker history:', error);
  }
}

// Set time range and refresh data
function setTimeRange(seconds) {
  timeRange.value = seconds;
  fetchTickerHistory();
}

// Update chart with new data
function updateChart() {
  if (!chartCanvas.value || tickerHistory.value.length === 0) return;

  const labels = tickerHistory.value.map(item => {
    const date = new Date(item.timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false });
  });

  const pairData = tickerHistory.value.map(item => item.pairPriceUSD);
  const btcData = tickerHistory.value.map(item => item.btcPriceUSD);
  const ethData = tickerHistory.value.map(item => item.ethPriceUSD);

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: `${selectedCoin.value} (USD)`,
          data: pairData,
          borderColor: '#00ffff',
          backgroundColor: 'rgba(0, 255, 255, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          yAxisID: 'y-pair',
          pointRadius: 0
        },
        {
          label: 'BTC (USD)',
          data: btcData,
          borderColor: '#ff9500',
          backgroundColor: 'rgba(255, 149, 0, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          yAxisID: 'y-btc',
          pointRadius: 0
        },
        {
          label: 'ETH (USD)',
          data: ethData,
          borderColor: '#9d4edd',
          backgroundColor: 'rgba(157, 78, 221, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          yAxisID: 'y-eth',
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#e5e7eb',
            font: {
              size: 14,
              weight: 'bold'
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#e5e7eb',
          bodyColor: '#e5e7eb',
          borderColor: 'rgba(0, 255, 255, 0.3)',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#9ca3af',
            maxRotation: 45,
            minRotation: 45,
            autoSkip: true,
            maxTicksLimit: 20
          }
        },
        'y-pair': {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: `${selectedCoin.value} Price (USD)`,
            color: '#00ffff'
          },
          grid: {
            color: 'rgba(0, 255, 255, 0.1)'
          },
          ticks: {
            color: '#00ffff'
          }
        },
        'y-btc': {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'BTC Price (USD)',
            color: '#ff9500'
          },
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            color: '#ff9500'
          }
        },
        'y-eth': {
          type: 'linear',
          display: false,
          position: 'right',
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}

// Watch for symbol/exchange changes and refetch data
watch([selectedSymbol, selectedExchange], () => {
  fetchTickerHistory();
});

onMounted(() => {
  fetchTickerHistory();
  // Refresh data every 5 seconds
  fetchInterval = setInterval(fetchTickerHistory, 5000);
});

onUnmounted(() => {
  if (fetchInterval) {
    clearInterval(fetchInterval);
  }
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>

<style scoped>
.tickers-analist-page {
  padding: 20px;
  background: linear-gradient(135deg, rgba(10, 10, 30, 0.95), rgba(20, 20, 40, 0.95));
  min-height: 100vh;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 16px;
  color: #9ca3af;
}

.current-prices {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.price-box {
  padding: 20px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  border: 2px solid;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lcx-box {
  border-color: rgba(0, 255, 255, 0.5);
}

.btc-box {
  border-color: rgba(255, 149, 0, 0.5);
}

.eth-box {
  border-color: rgba(157, 78, 221, 0.5);
}

.stats-box {
  border-color: rgba(255, 255, 255, 0.3);
  justify-content: center;
}

.coin-label {
  font-size: 14px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
}

.price-value {
  font-size: 24px;
  font-weight: 800;
  color: #fbbf24;
  text-shadow: 0 0 8px rgba(251, 191, 36, 0.4);
}

.conversions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
  color: #9ca3af;
}

.stat-label {
  font-size: 12px;
  color: #9ca3af;
  text-transform: uppercase;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #00ffff;
}

.controls {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.chart-container {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  height: 600px;
}

canvas {
  width: 100% !important;
  height: 100% !important;
}

/* Correlations Section */
.correlations-section {
  margin-bottom: 30px;
}

.correlation-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.correlation-card {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(20, 20, 40, 0.5));
  border: 2px solid rgba(251, 191, 36, 0.5);
  border-radius: 12px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.correlation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(251, 191, 36, 0.3);
}

.corr-label {
  font-size: 16px;
  font-weight: 700;
  color: #e5e7eb;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.corr-value {
  font-size: 36px;
  font-weight: 800;
  text-shadow: 0 0 10px currentColor;
}

.corr-value.corr-strong {
  color: #10eb04;
}

.corr-value.corr-moderate {
  color: #fbbf24;
}

.corr-value.corr-weak {
  color: #ff9500;
}

.corr-value.corr-none {
  color: #9ca3af;
}

.corr-desc {
  font-size: 12px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Differences Section */
.differences-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #fbbf24;
  text-shadow: 0 0 8px rgba(251, 191, 36, 0.4);
  margin-bottom: 20px;
  text-align: center;
}

.diff-card {
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  border: 2px solid;
  padding: 20px;
  margin-bottom: 15px;
}

.lcx-diff {
  border-color: rgba(0, 255, 255, 0.5);
}

.btc-diff {
  border-color: rgba(255, 149, 0, 0.5);
}

.eth-diff {
  border-color: rgba(157, 78, 221, 0.5);
}

.diff-title {
  font-size: 18px;
  font-weight: 700;
  color: #e5e7eb;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.diff-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.diff-item {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.diff-label {
  font-size: 12px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.diff-value {
  font-size: 20px;
  font-weight: 800;
  text-shadow: 0 0 6px currentColor;
}

.diff-value.positive {
  color: #10eb04;
}

.diff-value.negative {
  color: #e90a15;
}

.diff-value.neutral {
  color: #9ca3af;
}
</style>
