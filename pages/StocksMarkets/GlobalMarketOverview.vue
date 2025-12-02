<template>
  <div class="global-market-overview">
    <!-- Header with live clock -->
    <div class="page-header">
      <h1>🌐 Global Markets - Real-Time Overview</h1>
      <div class="time-clocks">
        <div class="clock">
          <span class="label">București:</span>
          <span class="value">{{ bucharestTime }}</span>
        </div>
        <div class="clock">
          <span class="label">New York:</span>
          <span class="value">{{ etTime }}</span>
        </div>
        <div class="clock">
          <span class="label">UTC:</span>
          <span class="value">{{ utcTime }}</span>
        </div>
      </div>
    </div>

    <!-- Market Activity Gauge -->
    <div class="activity-gauge-section">
      <h2>📊 Global Market Activity Level</h2>
      <div class="activity-gauge">
        <div class="gauge-container">
          <div class="gauge-bar">
            <div class="gauge-fill" :style="{ width: activityLevel + '%' }"></div>
          </div>
          <div class="gauge-labels">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
            <span>Peak</span>
          </div>
        </div>
        <div class="activity-score">
          <div class="score-value">{{ activityLevel }}</div>
          <div class="score-label">Activity Score</div>
        </div>
      </div>
    </div>

    <!-- Market Status Cards Grid -->
    <div class="markets-grid">
      <!-- STOCKS Card -->
      <div class="market-card stocks" :class="{ active: marketStatus.stocks.isOpen }">
        <div class="card-header">
          <div class="header-left">
            <span class="icon">📈</span>
            <h3>STOCKS</h3>
          </div>
          <div class="status-badge" :class="getStocksStatusClass()">
            {{ marketStatus.stocks.status }}
          </div>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="label">NYSE/NASDAQ:</span>
            <span class="value">{{ getStocksHours() }}</span>
          </div>
          <div class="info-row">
            <span class="label">Session:</span>
            <span class="value">{{ getStocksSession() }}</span>
          </div>
          <div class="info-row">
            <span class="label">Next Event:</span>
            <span class="value">{{ getNextStocksEvent() }}</span>
          </div>
        </div>
        <div class="card-footer">
          <div class="quick-stats">
            <div class="stat">
              <span class="stat-label">Volatility:</span>
              <span class="stat-value" :class="getVolatilityClass('stocks')">
                {{ getStocksVolatility() }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- FUTURES Card -->
      <div class="market-card futures" :class="{ active: marketStatus.futures.isActive }">
        <div class="card-header">
          <div class="header-left">
            <span class="icon">📊</span>
            <h3>FUTURES</h3>
          </div>
          <div class="status-badge" :class="getFuturesStatusClass()">
            {{ marketStatus.futures.status }}
          </div>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="label">ES / NQ / CL:</span>
            <span class="value">{{ getFuturesHours() }}</span>
          </div>
          <div class="info-row">
            <span class="label">Daily Pause:</span>
            <span class="value">{{ marketStatus.futures.isPause ? 'IN PAUSE' : '00:00-01:00 RO' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Active Until:</span>
            <span class="value">{{ getFuturesCloseTime() }}</span>
          </div>
        </div>
        <div class="card-footer">
          <div class="quick-stats">
            <div class="stat">
              <span class="stat-label">Liquidity:</span>
              <span class="stat-value high">
                {{ marketStatus.futures.isPause ? 'ZERO' : 'HIGH' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- FOREX Card -->
      <div class="market-card forex active">
        <div class="card-header">
          <div class="header-left">
            <span class="icon">💱</span>
            <h3>FOREX</h3>
          </div>
          <div class="status-badge open">24/5</div>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="label">Session:</span>
            <span class="value session-name">{{ marketStatus.forex.session }}</span>
          </div>
          <div class="info-row">
            <span class="label">Liquidity:</span>
            <span class="value" :class="getLiquidityClass(marketStatus.forex.liquidity)">
              {{ marketStatus.forex.liquidity }}
            </span>
          </div>
          <div class="info-row">
            <span class="label">Description:</span>
            <span class="value desc">{{ marketStatus.forex.description }}</span>
          </div>
        </div>
        <div class="card-footer">
          <div class="quick-stats">
            <div class="stat">
              <span class="stat-label">Volatility:</span>
              <span class="stat-value" :class="getVolatilityClass('forex')">
                {{ marketStatus.forex.volatility }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- CRYPTO Card -->
      <div class="market-card crypto active">
        <div class="card-header">
          <div class="header-left">
            <span class="icon">₿</span>
            <h3>CRYPTO</h3>
          </div>
          <div class="status-badge always-open">24/7</div>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="label">Zone:</span>
            <span class="value zone-name">{{ marketStatus.crypto.zone }}</span>
          </div>
          <div class="info-row">
            <span class="label">Liquidity:</span>
            <span class="value" :class="getLiquidityClass(marketStatus.crypto.liquidity)">
              {{ marketStatus.crypto.liquidity }}
            </span>
          </div>
          <div class="info-row">
            <span class="label">Recommendation:</span>
            <span class="value rec">{{ marketStatus.crypto.recommendation }}</span>
          </div>
        </div>
        <div class="card-footer">
          <div class="quick-stats">
            <div class="stat">
              <span class="stat-label">Volatility:</span>
              <span class="stat-value" :class="getVolatilityClass('crypto')">
                {{ marketStatus.crypto.volatility }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bot Recommendations Section -->
    <div class="bot-recommendations-section">
      <h2>🤖 Automated Bot Recommendations</h2>
      <div v-if="recommendations.length === 0" class="no-recommendations">
        <p>✅ No special actions required - markets in normal conditions</p>
      </div>
      <div v-else class="recommendations-list">
        <div
          v-for="(rec, index) in recommendations"
          :key="index"
          class="recommendation-card"
          :class="rec.severity.toLowerCase()"
        >
          <div class="rec-header">
            <span class="severity-badge" :class="rec.severity.toLowerCase()">
              {{ rec.severity }}
            </span>
            <span class="markets-affected">{{ rec.markets.join(', ') }}</span>
          </div>
          <div class="rec-body">
            <div class="action">
              <strong>Action:</strong> {{ rec.action }}
              <span v-if="rec.multiplier" class="multiplier">
                ({{ rec.multiplier }}x)
              </span>
            </div>
            <div class="reason">{{ rec.reason }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Navigation -->
    <div class="quick-navigation">
      <h2>📍 Quick Navigation</h2>
      <div class="nav-grid">
        <NuxtLink to="/StocksMarkets/OpenBIGEXCHANGES" class="nav-card">
          <span class="nav-icon">🏦</span>
          <span class="nav-label">Exchange Hours</span>
        </NuxtLink>
        <NuxtLink to="/StocksMarkets/EconomicCalendar" class="nav-card">
          <span class="nav-icon">📅</span>
          <span class="nav-label">Economic Calendar</span>
        </NuxtLink>
        <NuxtLink to="/StocksMarkets/CentralBanks" class="nav-card">
          <span class="nav-icon">🏛️</span>
          <span class="nav-label">Central Banks</span>
        </NuxtLink>
        <NuxtLink to="/StocksMarkets/StockFlowAnalysis" class="nav-card">
          <span class="nav-icon">📊</span>
          <span class="nav-label">Stock Flow</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import MarketHoursDetector from '~/utils/MarketHoursDetector'

definePageMeta({
  layout: 'stocks'
})

// Market detector instance
const detector = ref(null)
const currentTime = ref(new Date())
let updateInterval = null

// Market status
const marketStatus = ref({
  stocks: { isOpen: false, isPreMarket: false, isAfterHours: false, status: 'CLOSED' },
  futures: { isActive: false, isPause: false, status: 'CLOSED' },
  forex: { session: 'UNKNOWN', liquidity: 'UNKNOWN', volatility: 'UNKNOWN' },
  crypto: { zone: 'UNKNOWN', liquidity: 'UNKNOWN', volatility: 'UNKNOWN', recommendation: 'UNKNOWN' },
  timestamps: { bucharest: new Date(), et: new Date(), utc: new Date() }
})

const recommendations = ref([])
const activityLevel = ref(50)

// Time displays
const bucharestTime = computed(() => {
  return currentTime.value.toLocaleTimeString('ro-RO', {
    timeZone: 'Europe/Bucharest',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

const etTime = computed(() => {
  return currentTime.value.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

const utcTime = computed(() => {
  return currentTime.value.toLocaleTimeString('en-GB', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

// Helper functions
const getStocksStatusClass = () => {
  if (marketStatus.value.stocks.isOpen) return 'open'
  if (marketStatus.value.stocks.isPreMarket) return 'pre-market'
  if (marketStatus.value.stocks.isAfterHours) return 'after-hours'
  return 'closed'
}

const getFuturesStatusClass = () => {
  if (marketStatus.value.futures.isPause) return 'pause'
  if (marketStatus.value.futures.isActive) return 'active'
  return 'closed'
}

const getStocksHours = () => {
  if (marketStatus.value.stocks.isOpen) return '09:30-16:00 ET'
  if (marketStatus.value.stocks.isPreMarket) return 'PRE 04:00-09:30 ET'
  if (marketStatus.value.stocks.isAfterHours) return 'AFTER 16:00-20:00 ET'
  return 'CLOSED'
}

const getStocksSession = () => {
  if (marketStatus.value.stocks.isOpen) return 'Regular Trading'
  if (marketStatus.value.stocks.isPreMarket) return 'Pre-Market'
  if (marketStatus.value.stocks.isAfterHours) return 'After-Hours'
  return 'Market Closed'
}

const getNextStocksEvent = () => {
  const et = detector.value?.getETTime()
  if (!et) return 'N/A'

  const day = et.getDay()
  const hour = et.getHours()

  if (day === 0) return 'Opens Monday 04:00 ET'
  if (day === 6) return 'Opens Monday 04:00 ET'

  if (hour < 4) return 'Pre-market at 04:00 ET'
  if (hour < 9 || (hour === 9 && et.getMinutes() < 30)) return 'Opens at 09:30 ET'
  if (hour < 16) return 'Closes at 16:00 ET'
  if (hour < 20) return 'After-hours ends 20:00 ET'

  return 'Pre-market tomorrow 04:00 ET'
}

const getStocksVolatility = () => {
  if (!detector.value) return 'UNKNOWN'

  const et = detector.value.getETTime()
  const hour = et.getHours()
  const minutes = et.getMinutes()

  if (marketStatus.value.stocks.isOpen) {
    // First 30 minutes
    if (hour === 9 && minutes < 60) return 'VERY HIGH'
    // Power hour (15:00-16:00 ET)
    if (hour === 15) return 'HIGH'
    return 'MEDIUM'
  }

  return 'LOW'
}

const getFuturesHours = () => {
  if (marketStatus.value.futures.isPause) return 'IN PAUSE (17:00-18:00 ET)'
  if (marketStatus.value.futures.isActive) return '23/5 (Sun 18:00 - Fri 17:00 ET)'
  return 'CLOSED (Sat + Fri 17:00-Sun 18:00)'
}

const getFuturesCloseTime = () => {
  const et = detector.value?.getETTime()
  if (!et) return 'N/A'

  const day = et.getDay()
  if (day === 5) return 'Closes Today 17:00 ET'
  if (day === 6) return 'Opens Sunday 18:00 ET'
  if (day === 0 && et.getHours() < 18) return 'Opens Today 18:00 ET'

  return 'Daily pause 17:00-18:00 ET'
}

const getLiquidityClass = (liquidity) => {
  if (!liquidity) return ''
  const liq = liquidity.toLowerCase()
  if (liq.includes('maximum')) return 'maximum'
  if (liq.includes('high')) return 'high'
  if (liq.includes('medium')) return 'medium'
  if (liq.includes('low')) return 'low'
  if (liq.includes('very_low')) return 'very-low'
  return ''
}

const getVolatilityClass = (market) => {
  const vol = market === 'stocks' ? getStocksVolatility() :
              market === 'forex' ? marketStatus.value.forex.volatility :
              market === 'crypto' ? marketStatus.value.crypto.volatility : 'UNKNOWN'

  const volStr = vol.toLowerCase()
  if (volStr.includes('very') && volStr.includes('high')) return 'very-high'
  if (volStr.includes('high')) return 'high'
  if (volStr.includes('medium')) return 'medium'
  if (volStr.includes('low')) return 'low'
  return ''
}

// Update market status
const updateMarketStatus = () => {
  if (!detector.value) return

  detector.value.refresh()
  marketStatus.value = detector.value.getMarketStatus()
  recommendations.value = detector.value.getBotRecommendations()
  activityLevel.value = detector.value.getMarketActivityLevel()
  currentTime.value = new Date()
}

// Lifecycle
onMounted(() => {
  detector.value = new MarketHoursDetector()
  updateMarketStatus()

  // Update every second
  updateInterval = setInterval(updateMarketStatus, 1000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped>
.global-market-overview {
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.page-header h1 {
  margin: 0 0 16px 0;
  font-size: 28px;
  font-weight: 700;
  color: #00d4ff;
}

.time-clocks {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.clock {
  display: flex;
  gap: 10px;
  align-items: center;
}

.clock .label {
  color: #8892b0;
  font-size: 13px;
  font-weight: 500;
}

.clock .value {
  font-size: 18px;
  font-weight: 700;
  color: #00ff88;
  font-family: 'Courier New', monospace;
  background: rgba(0, 255, 136, 0.1);
  padding: 4px 12px;
  border-radius: 6px;
}

/* Activity Gauge */
.activity-gauge-section {
  margin-bottom: 30px;
  padding: 24px;
  background: #1a1f3a;
  border-radius: 12px;
}

.activity-gauge-section h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #00d4ff;
}

.activity-gauge {
  display: flex;
  gap: 30px;
  align-items: center;
}

.gauge-container {
  flex: 1;
}

.gauge-bar {
  height: 40px;
  background: #0f1423;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5);
}

.gauge-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff3366 0%, #ffc300 25%, #00ff88 50%, #00d4ff 100%);
  transition: width 0.5s ease;
  border-radius: 20px;
}

.gauge-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #8892b0;
}

.activity-score {
  text-align: center;
  padding: 20px;
  background: rgba(0, 212, 255, 0.1);
  border-radius: 12px;
  min-width: 120px;
}

.score-value {
  font-size: 48px;
  font-weight: 700;
  color: #00d4ff;
  font-family: 'Courier New', monospace;
}

.score-label {
  font-size: 12px;
  color: #8892b0;
  margin-top: 4px;
}

/* Markets Grid */
.markets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.market-card {
  background: #1a1f3a;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #2d3561;
  transition: all 0.3s ease;
}

.market-card.active {
  border-color: #00ff88;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #2d3561;
}

.header-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.header-left .icon {
  font-size: 24px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge.open {
  background: #00ff88;
  color: #0a0e27;
}

.status-badge.pre-market {
  background: #ffc300;
  color: #0a0e27;
}

.status-badge.after-hours {
  background: #8892b0;
  color: #fff;
}

.status-badge.closed {
  background: #ff3366;
  color: #fff;
}

.status-badge.active {
  background: #00ff88;
  color: #0a0e27;
}

.status-badge.pause {
  background: #ff3366;
  color: #fff;
}

.status-badge.always-open {
  background: #00d4ff;
  color: #0a0e27;
}

.card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.info-row .label {
  color: #8892b0;
  font-weight: 500;
}

.info-row .value {
  color: #fff;
  font-weight: 600;
  text-align: right;
}

.info-row .value.session-name,
.info-row .value.zone-name {
  color: #00d4ff;
}

.info-row .value.rec {
  color: #00ff88;
  font-size: 11px;
}

.info-row .value.desc {
  font-size: 11px;
  color: #8892b0;
  font-weight: 400;
}

.info-row .value.maximum {
  color: #ff3366;
  font-weight: 700;
}

.info-row .value.high {
  color: #ffc300;
  font-weight: 700;
}

.info-row .value.medium {
  color: #00d4ff;
}

.info-row .value.low,
.info-row .value.very-low {
  color: #8892b0;
}

.card-footer {
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid #2d3561;
}

.quick-stats {
  display: flex;
  gap: 20px;
}

.stat {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 13px;
}

.stat-label {
  color: #8892b0;
}

.stat-value {
  font-weight: 700;
  text-transform: uppercase;
  font-size: 11px;
}

.stat-value.very-high {
  color: #ff3366;
}

.stat-value.high {
  color: #ffc300;
}

.stat-value.medium {
  color: #00d4ff;
}

.stat-value.low {
  color: #8892b0;
}

/* Bot Recommendations */
.bot-recommendations-section {
  margin-bottom: 30px;
  padding: 24px;
  background: #1a1f3a;
  border-radius: 12px;
}

.bot-recommendations-section h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #ffc300;
}

.no-recommendations {
  padding: 20px;
  text-align: center;
  color: #00ff88;
  font-size: 14px;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommendation-card {
  padding: 16px;
  background: #0f1423;
  border-radius: 8px;
  border-left: 4px solid #2d3561;
}

.recommendation-card.critical {
  border-left-color: #ff3366;
  background: rgba(255, 51, 102, 0.05);
}

.recommendation-card.high {
  border-left-color: #ffc300;
  background: rgba(255, 195, 0, 0.05);
}

.recommendation-card.medium {
  border-left-color: #00d4ff;
  background: rgba(0, 212, 255, 0.05);
}

.recommendation-card.low {
  border-left-color: #8892b0;
}

.rec-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;
}

.severity-badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.severity-badge.critical {
  background: #ff3366;
  color: #fff;
}

.severity-badge.high {
  background: #ffc300;
  color: #0a0e27;
}

.severity-badge.medium {
  background: #00d4ff;
  color: #0a0e27;
}

.severity-badge.low {
  background: #8892b0;
  color: #fff;
}

.markets-affected {
  font-size: 11px;
  color: #8892b0;
  font-weight: 600;
}

.rec-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action {
  font-size: 14px;
  color: #fff;
}

.multiplier {
  color: #00ff88;
  font-weight: 700;
}

.reason {
  font-size: 13px;
  color: #8892b0;
}

/* Quick Navigation */
.quick-navigation {
  padding: 24px;
  background: #1a1f3a;
  border-radius: 12px;
}

.quick-navigation h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #00ff88;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.nav-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: #2d3561;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.nav-card:hover {
  border-color: #00d4ff;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
  transform: translateY(-2px);
}

.nav-icon {
  font-size: 32px;
}

.nav-label {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}
</style>
