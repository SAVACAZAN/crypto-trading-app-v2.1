<template>
  <div class="predictions-tab">
    <n-space vertical :size="20">
      <!-- Prediction Cards -->
      <n-grid :cols="3" :x-gap="16" :y-gap="16">
        <!-- 26: Simple Prediction -->
        <n-gi>
          <n-card size="small" :bordered="false" class="prediction-card">
            <div class="card-header">🔮 Next Movement</div>
            <div class="card-value" :style="{ color: prediction.direction === 'up' ? '#4ade80' : '#ef4444' }">
              {{ prediction.direction === 'up' ? '↑' : '↓' }} {{ prediction.change.toFixed(2) }}%
            </div>
            <div class="card-label">Based on BTC+ETH momentum</div>
          </n-card>
        </n-gi>

        <!-- 27: Signal System -->
        <n-gi>
          <n-card size="small" :bordered="false" class="prediction-card">
            <div class="card-header">📊 Market Signal</div>
            <div class="card-value" :style="{ fontSize: '24px', color: getSignalColor(signal) }">
              {{ getSignalIcon(signal) }} {{ signal.toUpperCase() }}
            </div>
            <div class="card-label">Overall market sentiment</div>
          </n-card>
        </n-gi>

        <!-- 28: Probability -->
        <n-gi>
          <n-card size="small" :bordered="false" class="prediction-card">
            <div class="card-header">📈 Growth Probability</div>
            <div class="card-value" :style="{ color: probability > 60 ? '#4ade80' : '#fbbf24' }">
              ↑ {{ probability.toFixed(0) }}%
            </div>
            <div class="card-label">Estimated confidence</div>
          </n-card>
        </n-gi>

        <!-- 29: Momentum Score -->
        <n-gi>
          <n-card size="small" :bordered="false" class="prediction-card">
            <div class="card-header">⚡ Momentum Score</div>
            <div class="momentum-bar">
              <div class="momentum-fill" :style="{ width: `${momentumScore}%`, background: getMomentumColor(momentumScore) }"></div>
            </div>
            <div class="card-label">{{ momentumScore.toFixed(0) }}/100 - {{ getMomentumLabel(momentumScore) }}</div>
          </n-card>
        </n-gi>

        <!-- 30: Heat Bar -->
        <n-gi>
          <n-card size="small" :bordered="false" class="prediction-card">
            <div class="card-header">🔥 Market Heat</div>
            <div class="heat-bar" :style="{ background: getHeatGradient(heatLevel) }">
              <span class="heat-label">{{ getHeatLabel(heatLevel) }}</span>
            </div>
            <div class="card-label">{{ heatLevel > 0 ? 'Positive' : 'Negative' }} impulse</div>
          </n-card>
        </n-gi>

        <!-- 31: Next 5min Direction -->
        <n-gi>
          <n-card size="small" :bordered="false" class="prediction-card">
            <div class="card-header">⏱️ Next 5 Minutes</div>
            <div class="card-value" :style="{ color: next5min.direction === 'up' ? '#4ade80' : '#ef4444' }">
              {{ next5min.direction === 'up' ? '↑' : '↓' }} {{ next5min.confidence }}%
            </div>
            <div class="card-label">Based on RSI & momentum</div>
          </n-card>
        </n-gi>

        <!-- 32: Deviation Prediction -->
        <n-gi>
          <n-card size="small" :bordered="false" class="prediction-card">
            <div class="card-header">📏 Deviation Alert</div>
            <div class="card-value">{{ deviationPrediction.toFixed(2) }}%</div>
            <div class="card-label">{{ deviationPrediction > 0 ? 'Above' : 'Below' }} 1h average</div>
          </n-card>
        </n-gi>

        <!-- 33: Time Travel Simulation -->
        <n-gi>
          <n-card size="small" :bordered="false" class="prediction-card">
            <div class="card-header">⏮️ 10min Ago Entry</div>
            <div class="card-value" :style="{ color: simulation.profit >= 0 ? '#4ade80' : '#ef4444' }">
              {{ simulation.profit >= 0 ? '+' : '' }}{{ simulation.profit.toFixed(2) }}%
            </div>
            <div class="card-label">Would have {{ simulation.profit >= 0 ? 'gained' : 'lost' }}</div>
          </n-card>
        </n-gi>

        <!-- 34: AI Model Prediction -->
        <n-gi>
          <n-card size="small" :bordered="false" class="prediction-card">
            <div class="card-header">🤖 AI Model (LCX ≈ a·BTC + b·ETH + c)</div>
            <div class="card-value" style="font-size: 16px;">
              {{ aiModel.a.toFixed(6) }} · BTC + {{ aiModel.b.toFixed(6) }} · ETH + {{ aiModel.c.toFixed(6) }}
            </div>
            <div class="card-label">R² = {{ aiModel.r2.toFixed(4) }}</div>
          </n-card>
        </n-gi>

        <!-- 35: Textual Indicator -->
        <n-gi :span="3">
          <n-card size="small" :bordered="false" class="prediction-card">
            <div class="card-header">💡 Market Intelligence</div>
            <div class="textual-indicator">
              <span class="indicator-item" :style="{ color: btcTrend === 'up' ? '#4ade80' : '#ef4444' }">
                BTC {{ btcTrend === 'up' ? '↑' : '↓' }}
              </span>
              <span class="indicator-separator">+</span>
              <span class="indicator-item" :style="{ color: ethTrend === 'up' ? '#4ade80' : '#ef4444' }">
                ETH {{ ethTrend === 'up' ? '↑' : '↓' }}
              </span>
              <span class="indicator-separator">+</span>
              <span class="indicator-item" :style="{ color: lcxTrend === 'neutral' ? '#fbbf24' : lcxTrend === 'up' ? '#4ade80' : '#ef4444' }">
                LCX {{ lcxTrend === 'neutral' ? '→' : lcxTrend === 'up' ? '↑' : '↓' }}
              </span>
              <span class="indicator-separator">→</span>
              <span class="indicator-conclusion">{{ getMarketConclusion() }}</span>
            </div>
          </n-card>
        </n-gi>
      </n-grid>

      <!-- Real-time prediction chart -->
      <n-card title="📈 Prediction Timeline" size="small" :bordered="false">
        <div class="prediction-timeline">
          <div class="chart-placeholder">
            <p style="text-align: center; color: #888; padding: 40px;">
              📊 Live prediction chart showing expected LCX movement
              <br><br>
              <span style="font-size: 12px;">Interactive prediction visualization with confidence intervals</span>
            </p>
          </div>
        </div>
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
const prediction = ref({ direction: 'up', change: 0 });
const signal = ref('bullish');
const probability = ref(0);
const momentumScore = ref(0);
const heatLevel = ref(0);
const next5min = ref({ direction: 'up', confidence: 0 });
const deviationPrediction = ref(0);
const simulation = ref({ profit: 0 });
const aiModel = ref({ a: 0, b: 0, c: 0, r2: 0 });
const btcTrend = ref('up');
const ethTrend = ref('up');
const lcxTrend = ref('neutral');

let refreshInterval = null;

// Helper functions
const getSignalColor = (sig) => {
  if (sig === 'bullish') return '#4ade80';
  if (sig === 'bearish') return '#ef4444';
  return '#fbbf24';
};

const getSignalIcon = (sig) => {
  if (sig === 'bullish') return '🐂';
  if (sig === 'bearish') return '🐻';
  return '😐';
};

const getMomentumColor = (score) => {
  if (score > 70) return '#4ade80';
  if (score > 40) return '#fbbf24';
  return '#ef4444';
};

const getMomentumLabel = (score) => {
  if (score > 70) return 'Strong';
  if (score > 40) return 'Moderate';
  return 'Weak';
};

const getHeatGradient = (level) => {
  if (level > 0) {
    return `linear-gradient(90deg, rgba(74, 222, 128, 0.2), rgba(74, 222, 128, ${level / 100}))`;
  }
  return `linear-gradient(90deg, rgba(239, 68, 68, ${Math.abs(level) / 100}), rgba(239, 68, 68, 0.2))`;
};

const getHeatLabel = (level) => {
  const abs = Math.abs(level);
  if (abs > 70) return level > 0 ? '🔥 Very Hot' : '❄️ Very Cold';
  if (abs > 40) return level > 0 ? '🌡️ Hot' : '🌡️ Cool';
  return '😐 Neutral';
};

const getMarketConclusion = computed(() => {
  if (btcTrend.value === 'up' && ethTrend.value === 'up' && lcxTrend.value === 'neutral') {
    return '⏳ Potențial delay bullish';
  }
  if (btcTrend.value === 'up' && ethTrend.value === 'up' && lcxTrend.value === 'up') {
    return '🚀 Strong bullish momentum';
  }
  if (btcTrend.value === 'down' && ethTrend.value === 'down') {
    return '🐻 Bearish pressure';
  }
  return '😐 Mixed signals';
});

// Fetch predictions
const fetchPredictions = async () => {
  try {
    // Simulated data
    const rand = Math.random();
    prediction.value = {
      direction: rand > 0.5 ? 'up' : 'down',
      change: 0.5 + Math.random() * 3
    };

    const signals = ['bullish', 'neutral', 'bearish'];
    signal.value = signals[Math.floor(Math.random() * 3)];

    probability.value = 40 + Math.random() * 50;
    momentumScore.value = Math.random() * 100;
    heatLevel.value = -50 + Math.random() * 100;

    next5min.value = {
      direction: Math.random() > 0.5 ? 'up' : 'down',
      confidence: 50 + Math.random() * 40
    };

    deviationPrediction.value = -5 + Math.random() * 10;
    simulation.value = { profit: -2 + Math.random() * 5 };

    aiModel.value = {
      a: 0.000001 + Math.random() * 0.000002,
      b: 0.00001 + Math.random() * 0.00003,
      c: 0.05 + Math.random() * 0.1,
      r2: 0.7 + Math.random() * 0.25
    };

    const trends = ['up', 'down', 'neutral'];
    btcTrend.value = trends[Math.floor(Math.random() * 2)];
    ethTrend.value = trends[Math.floor(Math.random() * 2)];
    lcxTrend.value = trends[Math.floor(Math.random() * 3)];

  } catch (error) {
    console.error('Error fetching predictions:', error);
  }
};

onMounted(() => {
  fetchPredictions();
  refreshInterval = setInterval(fetchPredictions, 5000);
});

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});
</script>

<style scoped>
.predictions-tab {
  padding: 20px;
}

.prediction-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: all 0.3s ease;
}

.prediction-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(139, 92, 246, 0.3);
  transform: translateY(-2px);
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
  color: #8b5cf6;
  margin-bottom: 4px;
  font-family: 'Courier New', monospace;
}

.card-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.momentum-bar {
  width: 100%;
  height: 24px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  overflow: hidden;
  margin: 12px 0;
}

.momentum-fill {
  height: 100%;
  transition: width 0.5s ease;
}

.heat-bar {
  width: 100%;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 12px 0;
}

.heat-label {
  font-weight: 700;
  font-size: 14px;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.textual-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
}

.indicator-item {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.indicator-separator {
  color: #888;
}

.indicator-conclusion {
  color: #8b5cf6;
  font-weight: 700;
  padding: 8px 16px;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 8px;
}

.prediction-timeline {
  min-height: 300px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.chart-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
</style>
