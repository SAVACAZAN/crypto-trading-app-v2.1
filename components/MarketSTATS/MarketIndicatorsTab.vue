<template>
  <div class="market-indicators-tab">
    <n-space vertical :size="20">
      <!-- Summary Cards -->
      <n-grid :cols="4" :x-gap="16" :y-gap="16">
        <!-- 1-3: Live Correlations -->
        <n-gi>
          <n-card size="small" :bordered="false" class="indicator-card">
            <div class="card-header">📊 LCX-BTC Correlation</div>
            <div class="card-value" :style="{ color: getCorrelationColor(correlations.lcxBtc) }">
              {{ correlations.lcxBtc.toFixed(4) }}
            </div>
            <div class="card-label">{{ getCorrelationLabel(correlations.lcxBtc) }}</div>
          </n-card>
        </n-gi>

        <n-gi>
          <n-card size="small" :bordered="false" class="indicator-card">
            <div class="card-header">📊 LCX-ETH Correlation</div>
            <div class="card-value" :style="{ color: getCorrelationColor(correlations.lcxEth) }">
              {{ correlations.lcxEth.toFixed(4) }}
            </div>
            <div class="card-label">{{ getCorrelationLabel(correlations.lcxEth) }}</div>
          </n-card>
        </n-gi>

        <n-gi>
          <n-card size="small" :bordered="false" class="indicator-card">
            <div class="card-header">📊 BTC-ETH Correlation</div>
            <div class="card-value" :style="{ color: getCorrelationColor(correlations.btcEth) }">
              {{ correlations.btcEth.toFixed(4) }}
            </div>
            <div class="card-label">{{ getCorrelationLabel(correlations.btcEth) }}</div>
          </n-card>
        </n-gi>

        <!-- 6-7: Change Percentages with Trend Direction -->
        <n-gi>
          <n-card size="small" :bordered="false" class="indicator-card">
            <div class="card-header">📈 LCX Change</div>
            <div class="card-value" :style="{ color: changes.lcx >= 0 ? '#4ade80' : '#ef4444' }">
              {{ changes.lcx >= 0 ? '↑' : '↓' }} {{ Math.abs(changes.lcx).toFixed(2) }}%
            </div>
            <div class="card-label">Last 24h</div>
          </n-card>
        </n-gi>

        <!-- 4-5: Ratios -->
        <n-gi>
          <n-card size="small" :bordered="false" class="indicator-card">
            <div class="card-header">🔢 LCX/BTC Ratio</div>
            <div class="card-value">{{ ratios.lcxBtc.toFixed(8) }}</div>
            <div class="card-label">{{ ratios.lcxBtcChange.toFixed(2) }}% change</div>
          </n-card>
        </n-gi>

        <n-gi>
          <n-card size="small" :bordered="false" class="indicator-card">
            <div class="card-header">🔢 LCX/ETH Ratio</div>
            <div class="card-value">{{ ratios.lcxEth.toFixed(8) }}</div>
            <div class="card-label">{{ ratios.lcxEthChange.toFixed(2) }}% change</div>
          </n-card>
        </n-gi>

        <n-gi>
          <n-card size="small" :bordered="false" class="indicator-card">
            <div class="card-header">🔄 BTC/LCX (Inverted)</div>
            <div class="card-value">{{ ratios.btcLcx.toFixed(2) }}</div>
            <div class="card-label">Inverse ratio</div>
          </n-card>
        </n-gi>

        <n-gi>
          <n-card size="small" :bordered="false" class="indicator-card">
            <div class="card-header">🔄 ETH/LCX (Inverted)</div>
            <div class="card-value">{{ ratios.ethLcx.toFixed(2) }}</div>
            <div class="card-label">Inverse ratio</div>
          </n-card>
        </n-gi>

        <!-- 8: Volatility -->
        <n-gi>
          <n-card size="small" :bordered="false" class="indicator-card">
            <div class="card-header">📊 LCX Volatility (σ)</div>
            <div class="card-value">{{ volatility.lcx.toFixed(4) }}</div>
            <div class="card-label">{{ getVolatilityLabel(volatility.lcx) }}</div>
          </n-card>
        </n-gi>

        <n-gi>
          <n-card size="small" :bordered="false" class="indicator-card">
            <div class="card-header">📊 BTC Volatility (σ)</div>
            <div class="card-value">{{ volatility.btc.toFixed(4) }}</div>
            <div class="card-label">{{ getVolatilityLabel(volatility.btc) }}</div>
          </n-card>
        </n-gi>

        <n-gi>
          <n-card size="small" :bordered="false" class="indicator-card">
            <div class="card-header">📊 ETH Volatility (σ)</div>
            <div class="card-value">{{ volatility.eth.toFixed(4) }}</div>
            <div class="card-label">{{ getVolatilityLabel(volatility.eth) }}</div>
          </n-card>
        </n-gi>

        <!-- 9-10: Moving Averages -->
        <n-gi>
          <n-card size="small" :bordered="false" class="indicator-card">
            <div class="card-header">📈 SMA-5 vs SMA-30</div>
            <div class="card-value">
              {{ sma.short.toFixed(6) }} / {{ sma.long.toFixed(6) }}
            </div>
            <div class="card-label">{{ sma.short > sma.long ? '🟢 Bullish' : '🔴 Bearish' }}</div>
          </n-card>
        </n-gi>

        <!-- 11: RSI -->
        <n-gi>
          <n-card size="small" :bordered="false" class="indicator-card">
            <div class="card-header">📊 RSI (14)</div>
            <div class="card-value" :style="{ color: getRSIColor(rsi) }">
              {{ rsi.toFixed(2) }}
            </div>
            <div class="card-label">{{ getRSILabel(rsi) }}</div>
          </n-card>
        </n-gi>

        <!-- 12: Beta Coefficient -->
        <n-gi>
          <n-card size="small" :bordered="false" class="indicator-card">
            <div class="card-header">📊 Beta vs BTC</div>
            <div class="card-value">{{ beta.toFixed(4) }}</div>
            <div class="card-label">{{ getBetaLabel(beta) }}</div>
          </n-card>
        </n-gi>

        <!-- 13: Performance Ratio -->
        <n-gi>
          <n-card size="small" :bordered="false" class="indicator-card">
            <div class="card-header">🎯 Performance vs BTC</div>
            <div class="card-value" :style="{ color: performance >= 0 ? '#4ade80' : '#ef4444' }">
              {{ performance >= 0 ? '+' : '' }}{{ performance.toFixed(2) }}%
            </div>
            <div class="card-label">Relative performance</div>
          </n-card>
        </n-gi>

        <!-- 14: Breakout Detection -->
        <n-gi>
          <n-card size="small" :bordered="false" class="indicator-card">
            <div class="card-header">🚀 Breakout Status</div>
            <div class="card-value" :style="{ fontSize: '24px' }">
              {{ breakout ? '⚡ ACTIVE' : '😴 None' }}
            </div>
            <div class="card-label">{{ breakout ? 'Breaking trend!' : 'Following market' }}</div>
          </n-card>
        </n-gi>

        <!-- 15: Deviation -->
        <n-gi>
          <n-card size="small" :bordered="false" class="indicator-card">
            <div class="card-header">📏 Model Deviation</div>
            <div class="card-value">{{ deviation.toFixed(2) }}%</div>
            <div class="card-label">From BTC+ETH model</div>
          </n-card>
        </n-gi>
      </n-grid>

      <!-- Auto-refresh toggle -->
      <n-card size="small" :bordered="false">
        <n-space align="center" justify="space-between">
          <span>Auto-refresh every 3 seconds</span>
          <n-switch v-model:value="autoRefresh" @update:value="toggleAutoRefresh" />
        </n-space>
      </n-card>
    </n-space>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';

const props = defineProps({
  symbol: String,
  exchange: String,
  coin: String
});

// State
const correlations = ref({ lcxBtc: 0, lcxEth: 0, btcEth: 0 });
const changes = ref({ lcx: 0, btc: 0, eth: 0 });
const ratios = ref({ lcxBtc: 0, lcxEth: 0, btcLcx: 0, ethLcx: 0, lcxBtcChange: 0, lcxEthChange: 0 });
const volatility = ref({ lcx: 0, btc: 0, eth: 0 });
const sma = ref({ short: 0, long: 0 });
const rsi = ref(50);
const beta = ref(1);
const performance = ref(0);
const breakout = ref(false);
const deviation = ref(0);
const autoRefresh = ref(true);

let refreshInterval = null;

// Helper functions
const getCorrelationColor = (val) => {
  if (val > 0.7) return '#4ade80';
  if (val > 0.3) return '#fbbf24';
  return '#ef4444';
};

const getCorrelationLabel = (val) => {
  if (val > 0.7) return 'Strong positive';
  if (val > 0.3) return 'Moderate';
  if (val > -0.3) return 'Weak';
  if (val > -0.7) return 'Moderate negative';
  return 'Strong negative';
};

const getVolatilityLabel = (val) => {
  if (val > 0.05) return 'Very High';
  if (val > 0.03) return 'High';
  if (val > 0.01) return 'Moderate';
  return 'Low';
};

const getRSIColor = (val) => {
  if (val > 70) return '#ef4444';
  if (val < 30) return '#4ade80';
  return '#fbbf24';
};

const getRSILabel = (val) => {
  if (val > 70) return 'Overbought';
  if (val < 30) return 'Oversold';
  return 'Neutral';
};

const getBetaLabel = (val) => {
  if (val > 1.5) return 'Very aggressive';
  if (val > 1) return 'Aggressive';
  if (val > 0.5) return 'Moderate';
  return 'Defensive';
};

// Fetch data
const fetchIndicators = async () => {
  try {
    // Simulated data - replace with real API calls
    // This would call endpoints that calculate these indicators from historical ticker data

    // For now, generate realistic random data
    correlations.value = {
      lcxBtc: 0.65 + Math.random() * 0.3,
      lcxEth: 0.55 + Math.random() * 0.3,
      btcEth: 0.85 + Math.random() * 0.1
    };

    changes.value = {
      lcx: (Math.random() - 0.5) * 10,
      btc: (Math.random() - 0.5) * 5,
      eth: (Math.random() - 0.5) * 6
    };

    const lcxPrice = 0.11;
    const btcPrice = 109000;
    const ethPrice = 3840;

    ratios.value = {
      lcxBtc: lcxPrice / btcPrice,
      lcxEth: lcxPrice / ethPrice,
      btcLcx: btcPrice / lcxPrice,
      ethLcx: ethPrice / lcxPrice,
      lcxBtcChange: (Math.random() - 0.5) * 5,
      lcxEthChange: (Math.random() - 0.5) * 5
    };

    volatility.value = {
      lcx: 0.02 + Math.random() * 0.03,
      btc: 0.01 + Math.random() * 0.02,
      eth: 0.015 + Math.random() * 0.025
    };

    sma.value = {
      short: lcxPrice * (0.98 + Math.random() * 0.04),
      long: lcxPrice * (0.96 + Math.random() * 0.08)
    };

    rsi.value = 30 + Math.random() * 40;
    beta.value = 0.8 + Math.random() * 1;
    performance.value = (Math.random() - 0.5) * 15;
    breakout.value = Math.random() > 0.85;
    deviation.value = (Math.random() - 0.5) * 10;

  } catch (error) {
    console.error('Error fetching indicators:', error);
  }
};

const toggleAutoRefresh = (value) => {
  if (value) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
};

const startAutoRefresh = () => {
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(fetchIndicators, 3000);
};

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

onMounted(() => {
  fetchIndicators();
  if (autoRefresh.value) {
    startAutoRefresh();
  }
});

onUnmounted(() => {
  stopAutoRefresh();
});
</script>

<style scoped>
.market-indicators-tab {
  padding: 20px;
}

.indicator-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
}

.indicator-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(74, 222, 128, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 222, 128, 0.1);
}

.card-header {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
  font-weight: 600;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  color: #4ade80;
  margin-bottom: 4px;
  font-family: 'Courier New', monospace;
}

.card-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}
</style>
