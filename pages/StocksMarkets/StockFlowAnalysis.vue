<template>
  <div class="stock-flow-analysis">
    <!-- Header -->
    <div class="page-header">
      <h1>📈 Stock Flow Analysis - Market Internals</h1>
      <div class="header-actions">
        <n-button size="small" @click="refreshData" :loading="isLoading">
          🔄 Refresh Live Data
        </n-button>
      </div>
    </div>

    <!-- VIX Fear Index -->
    <div class="vix-section">
      <h2>😱 VIX - Fear Index</h2>
      <div class="vix-container">
        <div class="vix-gauge">
          <div class="gauge-wrapper">
            <div class="vix-value" :class="getVIXClass(vixData.current)">
              {{ vixData.current.toFixed(2) }}
            </div>
            <div class="vix-label">Current VIX</div>
            <div class="vix-change" :class="vixData.change >= 0 ? 'up' : 'down'">
              {{ vixData.change >= 0 ? '+' : '' }}{{ vixData.change.toFixed(2) }} ({{ vixData.changePercent.toFixed(2) }}%)
            </div>
          </div>
          <div class="vix-interpretation">
            <div class="interpretation-card" :class="getVIXInterpretationClass(vixData.current)">
              <h3>{{ getVIXLevel(vixData.current) }}</h3>
              <p>{{ getVIXDescription(vixData.current) }}</p>
              <div class="bot-action">
                <strong>🤖 Bot Action:</strong> {{ getVIXBotAction(vixData.current) }}
              </div>
            </div>
          </div>
        </div>
        <div class="vix-chart">
          <canvas ref="vixChart"></canvas>
        </div>
      </div>

      <!-- VIX Levels Guide -->
      <div class="vix-levels-guide">
        <div class="level-card complacency">
          <span class="level-range">VIX < 15</span>
          <span class="level-name">Low Fear / Complacency</span>
          <span class="market-state">Risk-On</span>
        </div>
        <div class="level-card normal">
          <span class="level-range">VIX 15-25</span>
          <span class="level-name">Normal Market</span>
          <span class="market-state">Balanced</span>
        </div>
        <div class="level-card elevated">
          <span class="level-range">VIX 25-35</span>
          <span class="level-name">Elevated Fear</span>
          <span class="market-state">Caution</span>
        </div>
        <div class="level-card panic">
          <span class="level-range">VIX > 35</span>
          <span class="level-name">Panic / Crisis</span>
          <span class="market-state">Risk-Off</span>
        </div>
      </div>
    </div>

    <!-- Market Indices -->
    <div class="indices-section">
      <h2>📊 Major Indices - Real-Time</h2>
      <div class="indices-grid">
        <div
          v-for="index in marketIndices"
          :key="index.symbol"
          class="index-card"
          :class="{ negative: index.change < 0 }"
        >
          <div class="index-header">
            <h3>{{ index.name }}</h3>
            <span class="index-symbol">{{ index.symbol }}</span>
          </div>
          <div class="index-price">
            <span class="price-value">{{ formatNumber(index.price) }}</span>
            <span class="price-change" :class="index.change >= 0 ? 'positive' : 'negative'">
              {{ index.change >= 0 ? '+' : '' }}{{ index.change.toFixed(2) }} ({{ index.changePercent.toFixed(2) }}%)
            </span>
          </div>
          <div class="index-stats">
            <div class="stat">
              <span class="stat-label">High:</span>
              <span class="stat-value">{{ formatNumber(index.high) }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Low:</span>
              <span class="stat-value">{{ formatNumber(index.low) }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Volume:</span>
              <span class="stat-value">{{ formatVolume(index.volume) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Volume Analysis -->
    <div class="volume-section">
      <h2>📦 Volume Analysis - Unusual Activity</h2>
      <div class="volume-alerts">
        <div
          v-for="alert in volumeAlerts"
          :key="alert.id"
          class="volume-alert-card"
          :class="alert.severity"
        >
          <div class="alert-header">
            <div class="alert-badge" :class="alert.severity">
              {{ alert.severity.toUpperCase() }}
            </div>
            <div class="alert-time">{{ getTimeAgo(alert.timestamp) }}</div>
          </div>
          <div class="alert-body">
            <h3>{{ alert.symbol }} - {{ alert.name }}</h3>
            <div class="alert-details">
              <div class="detail">
                <span class="label">Current Volume:</span>
                <span class="value highlight">{{ formatVolume(alert.currentVolume) }}</span>
              </div>
              <div class="detail">
                <span class="label">Average Volume:</span>
                <span class="value">{{ formatVolume(alert.avgVolume) }}</span>
              </div>
              <div class="detail">
                <span class="label">Spike Factor:</span>
                <span class="value spike">{{ alert.spikeFactor.toFixed(2) }}x</span>
              </div>
            </div>
          </div>
          <div class="alert-footer">
            <div class="bot-recommendation">
              🤖 {{ alert.recommendation }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Market Internals -->
    <div class="market-internals-section">
      <h2>🔍 Market Internals</h2>
      <div class="internals-grid">
        <div class="internal-card">
          <h3>📊 Advance/Decline Ratio</h3>
          <div class="internal-value">
            <span class="value" :class="getADRatioClass(marketInternals.advanceDecline)">
              {{ marketInternals.advanceDecline.toFixed(2) }}
            </span>
          </div>
          <div class="internal-stats">
            <div class="stat-row">
              <span>Advancing:</span>
              <span class="green">{{ marketInternals.advancing }}</span>
            </div>
            <div class="stat-row">
              <span>Declining:</span>
              <span class="red">{{ marketInternals.declining }}</span>
            </div>
            <div class="stat-row">
              <span>Unchanged:</span>
              <span class="gray">{{ marketInternals.unchanged }}</span>
            </div>
          </div>
          <div class="interpretation">
            <strong>{{ getADInterpretation(marketInternals.advanceDecline) }}</strong>
          </div>
        </div>

        <div class="internal-card">
          <h3>📈 New Highs / New Lows</h3>
          <div class="internal-value">
            <span class="value highs">{{ marketInternals.newHighs }}</span>
            <span class="separator">/</span>
            <span class="value lows">{{ marketInternals.newLows }}</span>
          </div>
          <div class="internal-stats">
            <div class="stat-row">
              <span>52-Week Highs:</span>
              <span class="green">{{ marketInternals.newHighs }}</span>
            </div>
            <div class="stat-row">
              <span>52-Week Lows:</span>
              <span class="red">{{ marketInternals.newLows }}</span>
            </div>
            <div class="stat-row">
              <span>Ratio:</span>
              <span :class="getHighLowRatioClass(marketInternals.newHighs, marketInternals.newLows)">
                {{ (marketInternals.newHighs / Math.max(marketInternals.newLows, 1)).toFixed(2) }}
              </span>
            </div>
          </div>
          <div class="interpretation">
            <strong>{{ getHighLowInterpretation(marketInternals.newHighs, marketInternals.newLows) }}</strong>
          </div>
        </div>

        <div class="internal-card">
          <h3>💪 Market Breadth</h3>
          <div class="internal-value">
            <span class="value" :class="getBreadthClass(marketInternals.breadth)">
              {{ marketInternals.breadth }}%
            </span>
          </div>
          <div class="breadth-bar">
            <div class="bar-fill" :style="{ width: marketInternals.breadth + '%' }"></div>
          </div>
          <div class="internal-stats">
            <div class="stat-row">
              <span>Above 200 MA:</span>
              <span>{{ marketInternals.above200MA }}%</span>
            </div>
            <div class="stat-row">
              <span>Above 50 MA:</span>
              <span>{{ marketInternals.above50MA }}%</span>
            </div>
          </div>
          <div class="interpretation">
            <strong>{{ getBreadthInterpretation(marketInternals.breadth) }}</strong>
          </div>
        </div>

        <div class="internal-card">
          <h3>🌊 Cumulative Volume Delta</h3>
          <div class="internal-value">
            <span class="value" :class="getCVDClass(marketInternals.cvd)">
              {{ formatCVD(marketInternals.cvd) }}
            </span>
          </div>
          <div class="cvd-chart">
            <canvas ref="cvdChart"></canvas>
          </div>
          <div class="interpretation">
            <strong>{{ getCVDInterpretation(marketInternals.cvd) }}</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- Sector Performance -->
    <div class="sector-section">
      <h2>🏭 Sector Performance - Leadership</h2>
      <div class="sector-grid">
        <div
          v-for="sector in sectors"
          :key="sector.name"
          class="sector-card"
          :class="{ positive: sector.change >= 0, negative: sector.change < 0 }"
        >
          <div class="sector-header">
            <span class="sector-icon">{{ sector.icon }}</span>
            <span class="sector-name">{{ sector.name }}</span>
          </div>
          <div class="sector-change">
            <span class="change-value" :class="sector.change >= 0 ? 'positive' : 'negative'">
              {{ sector.change >= 0 ? '+' : '' }}{{ sector.change.toFixed(2) }}%
            </span>
          </div>
          <div class="sector-bar">
            <div
              class="bar-fill"
              :class="sector.change >= 0 ? 'positive' : 'negative'"
              :style="{ width: Math.abs(sector.change) * 10 + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Crypto Correlation -->
    <div class="correlation-section">
      <h2>🔗 Crypto Correlation with Stock Markets</h2>
      <div class="correlation-grid">
        <div class="correlation-card">
          <h3>BTC vs S&P500</h3>
          <div class="correlation-value">
            <span class="value">{{ correlations.btcSP500.toFixed(2) }}</span>
            <span class="label">Correlation</span>
          </div>
          <div class="correlation-interpretation">
            {{ getCorrelationInterpretation(correlations.btcSP500) }}
          </div>
        </div>

        <div class="correlation-card">
          <h3>BTC vs NASDAQ</h3>
          <div class="correlation-value">
            <span class="value">{{ correlations.btcNasdaq.toFixed(2) }}</span>
            <span class="label">Correlation</span>
          </div>
          <div class="correlation-interpretation">
            {{ getCorrelationInterpretation(correlations.btcNasdaq) }}
          </div>
        </div>

        <div class="correlation-card">
          <h3>BTC vs VIX (Inverse)</h3>
          <div class="correlation-value">
            <span class="value">{{ correlations.btcVIX.toFixed(2) }}</span>
            <span class="label">Correlation</span>
          </div>
          <div class="correlation-interpretation">
            {{ getCorrelationInterpretation(correlations.btcVIX, true) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { NButton } from 'naive-ui'

definePageMeta({
  layout: 'stocks'
})

// State
const isLoading = ref(false)
const vixChart = ref(null)
const cvdChart = ref(null)

// VIX Data
const vixData = ref({
  current: 14.32,
  previous: 15.21,
  change: -0.89,
  changePercent: -5.85,
  high52: 28.74,
  low52: 11.98
})

// Market Indices
const marketIndices = ref([
  {
    name: 'S&P 500',
    symbol: 'SPX',
    price: 4783.45,
    change: 24.58,
    changePercent: 0.52,
    high: 4792.30,
    low: 4765.80,
    volume: 3847562000
  },
  {
    name: 'NASDAQ Composite',
    symbol: 'IXIC',
    price: 15040.07,
    change: 82.34,
    changePercent: 0.55,
    high: 15068.20,
    low: 14991.50,
    volume: 5123847000
  },
  {
    name: 'Dow Jones',
    symbol: 'DJI',
    price: 37248.13,
    change: 156.82,
    changePercent: 0.42,
    high: 37301.45,
    low: 37189.67,
    volume: 387562000
  },
  {
    name: 'Russell 2000',
    symbol: 'RUT',
    price: 2027.38,
    change: -8.45,
    changePercent: -0.42,
    high: 2041.22,
    low: 2023.89,
    volume: 847562000
  }
])

// Volume Alerts
const volumeAlerts = ref([
  {
    id: 1,
    symbol: 'NVDA',
    name: 'NVIDIA Corp',
    currentVolume: 127500000,
    avgVolume: 48200000,
    spikeFactor: 2.64,
    severity: 'high',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    recommendation: 'Monitor for breakout - institutional buying detected'
  },
  {
    id: 2,
    symbol: 'TSLA',
    name: 'Tesla Inc',
    currentVolume: 184300000,
    avgVolume: 92100000,
    spikeFactor: 2.00,
    severity: 'medium',
    timestamp: new Date(Date.now() - 32 * 60 * 1000),
    recommendation: 'High volume - watch for trend continuation'
  },
  {
    id: 3,
    symbol: 'AAPL',
    name: 'Apple Inc',
    currentVolume: 98600000,
    avgVolume: 51200000,
    spikeFactor: 1.93,
    severity: 'medium',
    timestamp: new Date(Date.now() - 47 * 60 * 1000),
    recommendation: 'Above average volume - potential accumulation'
  }
])

// Market Internals
const marketInternals = ref({
  advanceDecline: 1.84,
  advancing: 1847,
  declining: 1003,
  unchanged: 247,
  newHighs: 284,
  newLows: 42,
  breadth: 64,
  above200MA: 58,
  above50MA: 62,
  cvd: 2847562000
})

// Sectors
const sectors = ref([
  { name: 'Technology', icon: '💻', change: 1.24 },
  { name: 'Energy', icon: '⚡', change: 0.87 },
  { name: 'Financials', icon: '🏦', change: 0.65 },
  { name: 'Healthcare', icon: '🏥', change: 0.43 },
  { name: 'Industrials', icon: '🏭', change: 0.32 },
  { name: 'Consumer Disc.', icon: '🛒', change: -0.18 },
  { name: 'Materials', icon: '⚒️', change: -0.34 },
  { name: 'Real Estate', icon: '🏘️', change: -0.56 },
  { name: 'Utilities', icon: '💡', change: -0.73 },
  { name: 'Telecom', icon: '📞', change: -0.91 }
])

// Correlations
const correlations = ref({
  btcSP500: 0.72,
  btcNasdaq: 0.78,
  btcVIX: -0.65
})

// Methods
const getVIXClass = (vix) => {
  if (vix < 15) return 'low'
  if (vix < 25) return 'normal'
  if (vix < 35) return 'elevated'
  return 'panic'
}

const getVIXInterpretationClass = (vix) => {
  if (vix < 15) return 'complacency'
  if (vix < 25) return 'normal'
  if (vix < 35) return 'elevated'
  return 'panic'
}

const getVIXLevel = (vix) => {
  if (vix < 15) return 'Low Fear / Complacency'
  if (vix < 25) return 'Normal Market Conditions'
  if (vix < 35) return 'Elevated Fear'
  return 'Panic / Crisis Mode'
}

const getVIXDescription = (vix) => {
  if (vix < 15) return 'Market is complacent. Risk-on environment. Watch for reversals.'
  if (vix < 25) return 'Healthy market volatility. Normal trading conditions.'
  if (vix < 35) return 'Increased uncertainty. Exercise caution with positions.'
  return 'Extreme fear in the market. Risk-off mode. Protect capital.'
}

const getVIXBotAction = (vix) => {
  if (vix < 15) return 'Increase risk appetite, normal grid parameters'
  if (vix < 25) return 'Standard bot operation'
  if (vix < 35) return 'Reduce position sizes, widen stop losses'
  return 'PAUSE aggressive strategies, risk-off mode'
}

const getADRatioClass = (ratio) => {
  if (ratio > 2) return 'very-bullish'
  if (ratio > 1.5) return 'bullish'
  if (ratio > 0.67) return 'neutral'
  if (ratio > 0.5) return 'bearish'
  return 'very-bearish'
}

const getADInterpretation = (ratio) => {
  if (ratio > 2) return 'Very Bullish - Strong breadth'
  if (ratio > 1.5) return 'Bullish - Healthy market'
  if (ratio > 0.67) return 'Neutral - Mixed signals'
  if (ratio > 0.5) return 'Bearish - Weak breadth'
  return 'Very Bearish - Selling pressure'
}

const getHighLowRatioClass = (highs, lows) => {
  const ratio = highs / Math.max(lows, 1)
  if (ratio > 3) return 'very-bullish'
  if (ratio > 1.5) return 'bullish'
  if (ratio > 0.67) return 'neutral'
  return 'bearish'
}

const getHighLowInterpretation = (highs, lows) => {
  const ratio = highs / Math.max(lows, 1)
  if (ratio > 3) return 'Very Bullish - Strong leadership'
  if (ratio > 1.5) return 'Bullish - More highs than lows'
  if (ratio > 0.67) return 'Mixed - Monitor closely'
  return 'Bearish - Distribution phase'
}

const getBreadthClass = (breadth) => {
  if (breadth > 60) return 'strong'
  if (breadth > 40) return 'neutral'
  return 'weak'
}

const getBreadthInterpretation = (breadth) => {
  if (breadth > 60) return 'Strong - Broad market participation'
  if (breadth > 40) return 'Moderate - Average breadth'
  return 'Weak - Narrow market leadership'
}

const getCVDClass = (cvd) => {
  if (cvd > 2000000000) return 'bullish'
  if (cvd > -2000000000) return 'neutral'
  return 'bearish'
}

const getCVDInterpretation = (cvd) => {
  if (cvd > 2000000000) return 'Bullish - Net buying pressure'
  if (cvd > -2000000000) return 'Neutral - Balanced flow'
  return 'Bearish - Net selling pressure'
}

const getCorrelationInterpretation = (corr, inverse = false) => {
  const absCorr = Math.abs(corr)
  if (absCorr > 0.7) {
    return inverse ? 'Strong inverse correlation - VIX up, crypto down' : 'Strong positive correlation - markets move together'
  }
  if (absCorr > 0.5) {
    return 'Moderate correlation - some relationship'
  }
  return 'Weak correlation - independent movements'
}

const formatNumber = (num) => {
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatVolume = (vol) => {
  if (vol >= 1000000000) return (vol / 1000000000).toFixed(2) + 'B'
  if (vol >= 1000000) return (vol / 1000000).toFixed(2) + 'M'
  return vol.toLocaleString()
}

const formatCVD = (cvd) => {
  if (cvd >= 0) return '+' + formatVolume(cvd)
  return formatVolume(cvd)
}

const getTimeAgo = (timestamp) => {
  const now = new Date()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

const refreshData = async () => {
  isLoading.value = true
  // In production: fetch from Polygon.io, AlphaVantage, etc.
  await new Promise(resolve => setTimeout(resolve, 1000))
  isLoading.value = false
}

onMounted(() => {
  // In production: initialize charts with Chart.js
  console.log('Stock Flow Analysis loaded')
})
</script>

<style scoped>
.stock-flow-analysis {
  padding: 20px;
  max-width: 1800px;
  margin: 0 auto;
  background: #0a0e27;
  min-height: 100vh;
  color: #fff;
}

/* Header */
.page-header {
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #1a1f3a 0%, #2d3561 100%);
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #00d4ff;
}

/* VIX Section */
.vix-section {
  margin-bottom: 40px;
}

.vix-section h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #ff3366;
}

.vix-container {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.vix-gauge {
  background: #1a1f3a;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
}

.gauge-wrapper {
  margin-bottom: 20px;
}

.vix-value {
  font-size: 72px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  margin-bottom: 10px;
}

.vix-value.low { color: #00ff88; }
.vix-value.normal { color: #00d4ff; }
.vix-value.elevated { color: #ffc300; }
.vix-value.panic { color: #ff3366; }

.vix-label {
  font-size: 14px;
  color: #8892b0;
  margin-bottom: 10px;
}

.vix-change {
  font-size: 18px;
  font-weight: 700;
}

.vix-change.up { color: #ff3366; }
.vix-change.down { color: #00ff88; }

.vix-interpretation {
  margin-top: 20px;
}

.interpretation-card {
  padding: 20px;
  border-radius: 8px;
  border: 2px solid;
}

.interpretation-card.complacency {
  background: rgba(0, 255, 136, 0.1);
  border-color: #00ff88;
}

.interpretation-card.normal {
  background: rgba(0, 212, 255, 0.1);
  border-color: #00d4ff;
}

.interpretation-card.elevated {
  background: rgba(255, 195, 0, 0.1);
  border-color: #ffc300;
}

.interpretation-card.panic {
  background: rgba(255, 51, 102, 0.1);
  border-color: #ff3366;
}

.interpretation-card h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
}

.interpretation-card p {
  margin: 0 0 15px 0;
  font-size: 13px;
  color: #e6e6e6;
}

.bot-action {
  font-size: 13px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
}

.vix-chart {
  background: #1a1f3a;
  padding: 20px;
  border-radius: 12px;
}

.vix-levels-guide {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.level-card {
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  border: 2px solid;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.level-card.complacency {
  background: rgba(0, 255, 136, 0.1);
  border-color: #00ff88;
}

.level-card.normal {
  background: rgba(0, 212, 255, 0.1);
  border-color: #00d4ff;
}

.level-card.elevated {
  background: rgba(255, 195, 0, 0.1);
  border-color: #ffc300;
}

.level-card.panic {
  background: rgba(255, 51, 102, 0.1);
  border-color: #ff3366;
}

.level-range {
  font-weight: 700;
  font-size: 14px;
}

.level-name {
  font-size: 12px;
  color: #e6e6e6;
}

.market-state {
  font-size: 11px;
  color: #8892b0;
}

/* Indices */
.indices-section {
  margin-bottom: 40px;
}

.indices-section h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #00ff88;
}

.indices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.index-card {
  background: #1a1f3a;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #2d3561;
}

.index-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.index-header h3 {
  margin: 0;
  font-size: 16px;
}

.index-symbol {
  font-size: 12px;
  color: #8892b0;
  font-weight: 600;
}

.index-price {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.price-value {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.price-change {
  font-size: 14px;
  font-weight: 700;
}

.price-change.positive { color: #00ff88; }
.price-change.negative { color: #ff3366; }

.index-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
}

.stat {
  display: flex;
  justify-content: space-between;
}

.stat-label {
  color: #8892b0;
}

.stat-value {
  color: #fff;
  font-weight: 600;
}

/* Volume Alerts */
.volume-section {
  margin-bottom: 40px;
}

.volume-section h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #ffc300;
}

.volume-alerts {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.volume-alert-card {
  background: #1a1f3a;
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid;
}

.volume-alert-card.high {
  border-left-color: #ff3366;
}

.volume-alert-card.medium {
  border-left-color: #ffc300;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.alert-badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
}

.alert-badge.high {
  background: #ff3366;
  color: #fff;
}

.alert-badge.medium {
  background: #ffc300;
  color: #0a0e27;
}

.alert-time {
  font-size: 12px;
  color: #8892b0;
}

.alert-body h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
}

.alert-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail .label {
  font-size: 12px;
  color: #8892b0;
}

.detail .value {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.detail .value.highlight {
  color: #00ff88;
}

.detail .value.spike {
  color: #ff3366;
}

.alert-footer {
  padding-top: 12px;
  border-top: 1px solid #2d3561;
  font-size: 13px;
  color: #00d4ff;
}

/* Market Internals */
.market-internals-section {
  margin-bottom: 40px;
}

.market-internals-section h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #00d4ff;
}

.internals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.internal-card {
  background: #1a1f3a;
  padding: 20px;
  border-radius: 12px;
}

.internal-card h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #00ff88;
}

.internal-value {
  text-align: center;
  margin-bottom: 16px;
}

.internal-value .value {
  font-size: 48px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.internal-value .very-bullish { color: #00ff88; }
.internal-value .bullish { color: #00d4ff; }
.internal-value .neutral { color: #ffc300; }
.internal-value .bearish { color: #ff6b35; }
.internal-value .very-bearish { color: #ff3366; }

.internal-value .strong { color: #00ff88; }
.internal-value .weak { color: #ff3366; }

.internal-value .separator {
  margin: 0 10px;
  color: #8892b0;
}

.internal-value .highs { color: #00ff88; }
.internal-value .lows { color: #ff3366; }

.internal-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 13px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
}

.stat-row .green { color: #00ff88; font-weight: 700; }
.stat-row .red { color: #ff3366; font-weight: 700; }
.stat-row .gray { color: #8892b0; }

.breadth-bar {
  height: 8px;
  background: #2d3561;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
}

.breadth-bar .bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff3366, #ffc300, #00ff88);
  transition: width 0.5s ease;
}

.cvd-chart {
  height: 120px;
  margin-bottom: 16px;
}

.interpretation {
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  text-align: center;
  font-size: 13px;
  color: #e6e6e6;
}

/* Sectors */
.sector-section {
  margin-bottom: 40px;
}

.sector-section h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #00ff88;
}

.sector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.sector-card {
  background: #1a1f3a;
  padding: 16px;
  border-radius: 8px;
  border: 2px solid #2d3561;
}

.sector-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.sector-icon {
  font-size: 24px;
}

.sector-name {
  font-size: 14px;
  font-weight: 600;
}

.sector-change {
  margin-bottom: 12px;
}

.change-value {
  font-size: 20px;
  font-weight: 700;
}

.change-value.positive { color: #00ff88; }
.change-value.negative { color: #ff3366; }

.sector-bar {
  height: 6px;
  background: #2d3561;
  border-radius: 3px;
  overflow: hidden;
}

.sector-bar .bar-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.sector-bar .bar-fill.positive {
  background: #00ff88;
}

.sector-bar .bar-fill.negative {
  background: #ff3366;
}

/* Correlation */
.correlation-section {
  margin-bottom: 40px;
}

.correlation-section h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #00d4ff;
}

.correlation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.correlation-card {
  background: #1a1f3a;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.correlation-card h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #fff;
}

.correlation-value {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.correlation-value .value {
  font-size: 48px;
  font-weight: 700;
  color: #00d4ff;
  font-family: 'Courier New', monospace;
}

.correlation-value .label {
  font-size: 12px;
  color: #8892b0;
}

.correlation-interpretation {
  font-size: 13px;
  color: #e6e6e6;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}
</style>
