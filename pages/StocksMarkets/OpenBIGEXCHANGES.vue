<template>
  <div class="open-big-exchanges">
    <div class="page-header">
      <h1>🌍 Global Stock Exchanges - Trading Hours</h1>
      <div class="current-time-display">
        <div class="time-row">
          <span class="time-label">București (GMT+2):</span>
          <span class="time-value">{{ bucharestTime }}</span>
        </div>
        <div class="time-row">
          <span class="time-label">UTC Time:</span>
          <span class="time-value">{{ utcTime }}</span>
        </div>
      </div>
    </div>

    <!-- Critical Moments Alert -->
    <div v-if="currentCriticalMoment" class="critical-moment-alert">
      <div class="alert-icon">🚨</div>
      <div class="alert-content">
        <h3>{{ currentCriticalMoment.title }}</h3>
        <p>{{ currentCriticalMoment.description }}</p>
      </div>
    </div>

    <!-- Active Now Section -->
    <div class="active-now-section">
      <h2>📊 Currently Trading</h2>
      <div class="active-exchanges-grid">
        <div
          v-for="exchange in activeExchanges"
          :key="exchange.symbol"
          class="exchange-card active"
        >
          <div class="exchange-header">
            <span class="exchange-flag">{{ exchange.flag }}</span>
            <div class="exchange-info">
              <h3>{{ exchange.name }}</h3>
              <span class="exchange-symbol">{{ exchange.symbol }}</span>
            </div>
          </div>
          <div class="exchange-status">
            <span class="status-badge open">OPEN NOW</span>
            <span class="time-remaining">Closes in: {{ exchange.timeUntilClose }}</span>
          </div>
          <div class="exchange-times">
            <div class="time-info">
              <span class="label">Local:</span>
              <span class="value">{{ exchange.localHours }}</span>
            </div>
            <div class="time-info">
              <span class="label">București:</span>
              <span class="value">{{ exchange.bucharestHours }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- All Exchanges Table -->
    <div class="all-exchanges-section">
      <h2>🏦 All Major Exchanges</h2>
      <div class="table-container">
        <table class="exchanges-table">
          <thead>
            <tr>
              <th>Exchange</th>
              <th>Country</th>
              <th>Symbol</th>
              <th>Status</th>
              <th>Local Hours</th>
              <th>UTC Hours</th>
              <th>București Hours (GMT+2)</th>
              <th>Pre/After Market</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="exchange in allExchanges"
              :key="exchange.symbol"
              :class="{ 'row-open': exchange.isOpen, 'row-pre-market': exchange.isPreMarket, 'row-after-hours': exchange.isAfterHours }"
            >
              <td>
                <div class="exchange-cell">
                  <span class="flag">{{ exchange.flag }}</span>
                  <span class="name">{{ exchange.name }}</span>
                </div>
              </td>
              <td>{{ exchange.country }}</td>
              <td><span class="symbol-badge">{{ exchange.symbol }}</span></td>
              <td>
                <span
                  class="status-badge"
                  :class="{
                    'open': exchange.isOpen,
                    'closed': !exchange.isOpen && !exchange.isPreMarket && !exchange.isAfterHours,
                    'pre-market': exchange.isPreMarket,
                    'after-hours': exchange.isAfterHours
                  }"
                >
                  {{ exchange.status }}
                </span>
              </td>
              <td>{{ exchange.localHours }}</td>
              <td>{{ exchange.utcHours }}</td>
              <td>{{ exchange.bucharestHours }}</td>
              <td>
                <div v-if="exchange.hasExtendedHours" class="extended-hours">
                  <div v-if="exchange.preMarket">Pre: {{ exchange.preMarket }}</div>
                  <div v-if="exchange.afterHours">After: {{ exchange.afterHours }}</div>
                </div>
                <span v-else class="no-extended">N/A</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Overlap Periods -->
    <div class="overlap-section">
      <h2>⚡ High Liquidity Overlap Periods</h2>
      <div class="overlap-grid">
        <div class="overlap-card maximum">
          <div class="overlap-header">
            <span class="overlap-icon">🔥</span>
            <h3>Maximum Liquidity</h3>
          </div>
          <p class="overlap-time">16:30 - 18:30 București</p>
          <div class="overlap-exchanges">NYSE + NASDAQ + LSE + Euronext</div>
          <div class="overlap-description">
            Overlapping US and European markets - highest volume period
          </div>
        </div>

        <div class="overlap-card high">
          <div class="overlap-header">
            <span class="overlap-icon">⚡</span>
            <h3>Asian Session</h3>
          </div>
          <p class="overlap-time">02:00 - 08:00 București</p>
          <div class="overlap-exchanges">Tokyo + Hong Kong + Shanghai + ASX</div>
          <div class="overlap-description">
            Major Asian markets overlap - important for commodity flows
          </div>
        </div>

        <div class="overlap-card medium">
          <div class="overlap-header">
            <span class="overlap-icon">📈</span>
            <h3>European Session</h3>
          </div>
          <p class="overlap-time">10:00 - 18:30 București</p>
          <div class="overlap-exchanges">LSE + Euronext + Frankfurt</div>
          <div class="overlap-description">
            European markets active - EUR/GBP flows dominant
          </div>
        </div>

        <div class="overlap-card medium">
          <div class="overlap-header">
            <span class="overlap-icon">🌙</span>
            <h3>After Hours US</h3>
          </div>
          <p class="overlap-time">23:00 - 03:00 București</p>
          <div class="overlap-exchanges">NYSE After-Hours + NASDAQ After-Hours</div>
          <div class="overlap-description">
            Extended trading - lower liquidity, earnings reactions
          </div>
        </div>
      </div>
    </div>

    <!-- Critical Moments Timeline -->
    <div class="critical-moments-section">
      <h2>🔔 Daily Critical Moments (București Time)</h2>
      <div class="timeline">
        <div
          v-for="moment in criticalMoments"
          :key="moment.time"
          class="timeline-item"
          :class="{ 'active': isCurrentMoment(moment) }"
        >
          <div class="timeline-time">{{ moment.time }}</div>
          <div class="timeline-content">
            <h4>{{ moment.title }}</h4>
            <p>{{ moment.description }}</p>
            <span class="timeline-impact" :class="moment.impact">{{ moment.impact.toUpperCase() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

definePageMeta({
  layout: 'stocks'
})

// Current time tracking
const currentTime = ref(new Date())
let timeInterval = null

// Exchange definitions
const exchangesData = [
  {
    name: 'New York Stock Exchange',
    symbol: 'NYSE',
    country: 'USA',
    flag: '🇺🇸',
    timezone: 'America/New_York',
    regularHours: { open: '09:30', close: '16:00' },
    preMarket: '04:00 - 09:30',
    afterHours: '16:00 - 20:00',
    utcOffset: -5, // EST
    bucharestOffset: 7, // Bucharest is UTC+2, so +7 hours from EST
    hasExtendedHours: true
  },
  {
    name: 'NASDAQ',
    symbol: 'NASDAQ',
    country: 'USA',
    flag: '🇺🇸',
    timezone: 'America/New_York',
    regularHours: { open: '09:30', close: '16:00' },
    preMarket: '04:00 - 09:30',
    afterHours: '16:00 - 20:00',
    utcOffset: -5,
    bucharestOffset: 7,
    hasExtendedHours: true
  },
  {
    name: 'London Stock Exchange',
    symbol: 'LSE',
    country: 'United Kingdom',
    flag: '🇬🇧',
    timezone: 'Europe/London',
    regularHours: { open: '08:00', close: '16:30' },
    utcOffset: 0, // GMT
    bucharestOffset: 2,
    hasExtendedHours: false
  },
  {
    name: 'Tokyo Stock Exchange',
    symbol: 'TSE',
    country: 'Japan',
    flag: '🇯🇵',
    timezone: 'Asia/Tokyo',
    regularHours: { open: '09:00', close: '15:00' },
    utcOffset: 9, // JST
    bucharestOffset: -7,
    hasExtendedHours: false
  },
  {
    name: 'Shanghai Stock Exchange',
    symbol: 'SSE',
    country: 'China',
    flag: '🇨🇳',
    timezone: 'Asia/Shanghai',
    regularHours: { open: '09:30', close: '15:00' },
    utcOffset: 8, // CST
    bucharestOffset: -6,
    hasExtendedHours: false
  },
  {
    name: 'Hong Kong Stock Exchange',
    symbol: 'HKEX',
    country: 'Hong Kong',
    flag: '🇭🇰',
    timezone: 'Asia/Hong_Kong',
    regularHours: { open: '09:30', close: '16:00' },
    utcOffset: 8, // HKT
    bucharestOffset: -6,
    hasExtendedHours: false
  },
  {
    name: 'Euronext Paris',
    symbol: 'EPA',
    country: 'France',
    flag: '🇫🇷',
    timezone: 'Europe/Paris',
    regularHours: { open: '09:00', close: '17:30' },
    utcOffset: 1, // CET
    bucharestOffset: 1,
    hasExtendedHours: false
  },
  {
    name: 'Frankfurt Stock Exchange',
    symbol: 'FRA',
    country: 'Germany',
    flag: '🇩🇪',
    timezone: 'Europe/Berlin',
    regularHours: { open: '09:00', close: '17:30' },
    utcOffset: 1, // CET
    bucharestOffset: 1,
    hasExtendedHours: false
  },
  {
    name: 'Bombay Stock Exchange',
    symbol: 'BSE',
    country: 'India',
    flag: '🇮🇳',
    timezone: 'Asia/Kolkata',
    regularHours: { open: '09:15', close: '15:30' },
    utcOffset: 5.5, // IST
    bucharestOffset: -3.5,
    hasExtendedHours: false
  },
  {
    name: 'Australian Securities Exchange',
    symbol: 'ASX',
    country: 'Australia',
    flag: '🇦🇺',
    timezone: 'Australia/Sydney',
    regularHours: { open: '10:00', close: '16:00' },
    utcOffset: 11, // AEDT (varies with DST)
    bucharestOffset: -9,
    hasExtendedHours: false
  }
]

// Critical moments of the day
const criticalMoments = [
  {
    time: '02:00',
    title: 'Asian Markets Open',
    description: 'Tokyo + ASX opening - commodity flows begin',
    impact: 'medium'
  },
  {
    time: '03:30',
    title: 'China Markets Open',
    description: 'Shanghai + Hong Kong - Asian liquidity peak',
    impact: 'high'
  },
  {
    time: '10:00',
    title: 'European Session Starts',
    description: 'LSE + Euronext + Frankfurt - EUR/GBP flows',
    impact: 'high'
  },
  {
    time: '16:30',
    title: 'NYSE/NASDAQ Opening Bell',
    description: 'US markets open - MAXIMUM VOLATILITY & LIQUIDITY',
    impact: 'critical'
  },
  {
    time: '17:00',
    title: 'Peak Global Liquidity',
    description: 'US + Europe overlap - highest volume period',
    impact: 'critical'
  },
  {
    time: '18:30',
    title: 'European Markets Close',
    description: 'LSE/Euronext close - liquidity reduces',
    impact: 'medium'
  },
  {
    time: '23:00',
    title: 'NYSE/NASDAQ Close',
    description: 'US regular hours end - EOD volume spike',
    impact: 'high'
  },
  {
    time: '23:30',
    title: 'After-Hours Trading',
    description: 'Extended hours begin - earnings reactions',
    impact: 'medium'
  }
]

// Computed properties
const bucharestTime = computed(() => {
  return currentTime.value.toLocaleTimeString('ro-RO', {
    timeZone: 'Europe/Bucharest',
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

// Check if exchange is currently open
const isExchangeOpen = (exchange) => {
  const now = new Date()

  // Get current time in exchange's timezone
  const exchangeTime = new Date(now.toLocaleString('en-US', { timeZone: exchange.timezone }))
  const hours = exchangeTime.getHours()
  const minutes = exchangeTime.getMinutes()
  const currentMinutes = hours * 60 + minutes

  // Parse open/close times
  const [openHour, openMin] = exchange.regularHours.open.split(':').map(Number)
  const [closeHour, closeMin] = exchange.regularHours.close.split(':').map(Number)
  const openMinutes = openHour * 60 + openMin
  const closeMinutes = closeHour * 60 + closeMin

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes
}

// Check if in pre-market
const isPreMarket = (exchange) => {
  if (!exchange.hasExtendedHours) return false

  const now = new Date()
  const exchangeTime = new Date(now.toLocaleString('en-US', { timeZone: exchange.timezone }))
  const hours = exchangeTime.getHours()
  const minutes = exchangeTime.getMinutes()
  const currentMinutes = hours * 60 + minutes

  const [preStart] = exchange.preMarket.split(' - ')[0].split(':').map(Number)
  const [openHour, openMin] = exchange.regularHours.open.split(':').map(Number)
  const preStartMinutes = preStart * 60
  const openMinutes = openHour * 60 + openMin

  return currentMinutes >= preStartMinutes && currentMinutes < openMinutes
}

// Check if in after-hours
const isAfterHours = (exchange) => {
  if (!exchange.hasExtendedHours) return false

  const now = new Date()
  const exchangeTime = new Date(now.toLocaleString('en-US', { timeZone: exchange.timezone }))
  const hours = exchangeTime.getHours()
  const minutes = exchangeTime.getMinutes()
  const currentMinutes = hours * 60 + minutes

  const [closeHour, closeMin] = exchange.regularHours.close.split(':').map(Number)
  const [afterEnd] = exchange.afterHours.split(' - ')[1].split(':').map(Number)
  const closeMinutes = closeHour * 60 + closeMin
  const afterEndMinutes = afterEnd * 60

  return currentMinutes >= closeMinutes && currentMinutes < afterEndMinutes
}

// Calculate time until close
const timeUntilClose = (exchange) => {
  if (!isExchangeOpen(exchange)) return 'N/A'

  const now = new Date()
  const exchangeTime = new Date(now.toLocaleString('en-US', { timeZone: exchange.timezone }))
  const [closeHour, closeMin] = exchange.regularHours.close.split(':').map(Number)

  const closeTime = new Date(exchangeTime)
  closeTime.setHours(closeHour, closeMin, 0)

  const diff = closeTime - exchangeTime
  const hoursLeft = Math.floor(diff / 1000 / 60 / 60)
  const minutesLeft = Math.floor((diff / 1000 / 60) % 60)

  return `${hoursLeft}h ${minutesLeft}m`
}

// Format exchange hours for display
const formatHours = (exchange, type) => {
  const open = exchange.regularHours.open
  const close = exchange.regularHours.close

  if (type === 'local') {
    return `${open} - ${close}`
  }

  // Convert to UTC or Bucharest
  // This is simplified - in production, use proper timezone conversion
  return `${open} - ${close}`
}

// All exchanges with computed properties
const allExchanges = computed(() => {
  return exchangesData.map(exchange => ({
    ...exchange,
    isOpen: isExchangeOpen(exchange),
    isPreMarket: isPreMarket(exchange),
    isAfterHours: isAfterHours(exchange),
    status: isExchangeOpen(exchange) ? 'OPEN' :
            isPreMarket(exchange) ? 'PRE-MARKET' :
            isAfterHours(exchange) ? 'AFTER-HOURS' : 'CLOSED',
    localHours: formatHours(exchange, 'local'),
    utcHours: exchange.regularHours.open + ' - ' + exchange.regularHours.close + ' UTC',
    bucharestHours: formatHours(exchange, 'bucharest'),
    timeUntilClose: timeUntilClose(exchange)
  }))
})

// Active exchanges
const activeExchanges = computed(() => {
  return allExchanges.value.filter(ex => ex.isOpen)
})

// Current critical moment
const currentCriticalMoment = computed(() => {
  const now = new Date()
  const bucharestHour = parseInt(now.toLocaleTimeString('ro-RO', {
    timeZone: 'Europe/Bucharest',
    hour: '2-digit'
  }))
  const bucharestMinute = parseInt(now.toLocaleTimeString('ro-RO', {
    timeZone: 'Europe/Bucharest',
    minute: '2-digit'
  }))

  const currentTimeStr = `${bucharestHour.toString().padStart(2, '0')}:${bucharestMinute.toString().padStart(2, '0')}`

  for (const moment of criticalMoments) {
    const [momentHour, momentMinute] = moment.time.split(':').map(Number)
    const timeDiff = Math.abs((bucharestHour * 60 + bucharestMinute) - (momentHour * 60 + momentMinute))

    if (timeDiff <= 15) { // Within 15 minutes
      return moment
    }
  }

  return null
})

// Check if moment is current
const isCurrentMoment = (moment) => {
  return currentCriticalMoment.value?.time === moment.time
}

// Lifecycle
onMounted(() => {
  timeInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.open-big-exchanges {
  padding: 20px;
  max-width: 1800px;
  margin: 0 auto;
  background: #0a0e27;
  min-height: 100vh;
  color: #fff;
}

.page-header {
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #1a1f3a 0%, #2d3561 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #00d4ff;
}

.current-time-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.time-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.time-label {
  color: #8892b0;
  font-size: 13px;
  font-weight: 500;
}

.time-value {
  font-size: 20px;
  font-weight: 700;
  color: #00ff88;
  font-family: 'Courier New', monospace;
  background: rgba(0, 255, 136, 0.1);
  padding: 4px 12px;
  border-radius: 6px;
}

/* Critical Moment Alert */
.critical-moment-alert {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #ff3366 0%, #ff6b35 100%);
  border-radius: 12px;
  margin-bottom: 30px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.9; }
}

.alert-icon {
  font-size: 32px;
}

.alert-content h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
}

.alert-content p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

/* Active Now Section */
.active-now-section {
  margin-bottom: 40px;
}

.active-now-section h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #00ff88;
}

.active-exchanges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.exchange-card {
  background: linear-gradient(135deg, #1e2746 0%, #2a3558 100%);
  border-radius: 12px;
  padding: 20px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.exchange-card.active {
  border-color: #00ff88;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
}

.exchange-header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.exchange-flag {
  font-size: 32px;
}

.exchange-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.exchange-symbol {
  font-size: 12px;
  color: #8892b0;
}

.exchange-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge.open {
  background: #00ff88;
  color: #0a0e27;
}

.time-remaining {
  font-size: 13px;
  color: #8892b0;
}

.exchange-times {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.time-info .label {
  color: #8892b0;
}

.time-info .value {
  color: #fff;
  font-weight: 600;
}

/* All Exchanges Table */
.all-exchanges-section {
  margin-bottom: 40px;
}

.all-exchanges-section h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #00d4ff;
}

.table-container {
  background: #1a1f3a;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.exchanges-table {
  width: 100%;
  border-collapse: collapse;
}

.exchanges-table thead {
  background: #2d3561;
}

.exchanges-table th {
  padding: 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 700;
  color: #00d4ff;
  text-transform: uppercase;
  border-bottom: 2px solid #00d4ff;
}

.exchanges-table tbody tr {
  border-bottom: 1px solid #2d3561;
  transition: background 0.2s ease;
}

.exchanges-table tbody tr:hover {
  background: rgba(0, 212, 255, 0.05);
}

.exchanges-table tbody tr.row-open {
  background: rgba(0, 255, 136, 0.08);
}

.exchanges-table tbody tr.row-pre-market {
  background: rgba(255, 195, 0, 0.08);
}

.exchanges-table tbody tr.row-after-hours {
  background: rgba(138, 146, 176, 0.08);
}

.exchanges-table td {
  padding: 14px 16px;
  font-size: 13px;
  color: #e6e6e6;
}

.exchange-cell {
  display: flex;
  gap: 10px;
  align-items: center;
}

.exchange-cell .flag {
  font-size: 20px;
}

.exchange-cell .name {
  font-weight: 600;
}

.symbol-badge {
  background: #2d3561;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: 700;
  color: #00d4ff;
  font-size: 11px;
}

.status-badge.closed {
  background: #8892b0;
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

.extended-hours {
  font-size: 12px;
  color: #8892b0;
}

.no-extended {
  color: #555;
}

/* Overlap Section */
.overlap-section {
  margin-bottom: 40px;
}

.overlap-section h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #ff6b35;
}

.overlap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.overlap-card {
  background: linear-gradient(135deg, #1e2746 0%, #2a3558 100%);
  border-radius: 12px;
  padding: 20px;
  border: 2px solid transparent;
}

.overlap-card.maximum {
  border-color: #ff3366;
  box-shadow: 0 0 20px rgba(255, 51, 102, 0.3);
}

.overlap-card.high {
  border-color: #ffc300;
  box-shadow: 0 0 20px rgba(255, 195, 0, 0.3);
}

.overlap-card.medium {
  border-color: #00d4ff;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
}

.overlap-header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.overlap-icon {
  font-size: 28px;
}

.overlap-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.overlap-time {
  font-size: 20px;
  font-weight: 700;
  color: #00ff88;
  margin: 12px 0;
}

.overlap-exchanges {
  font-size: 13px;
  color: #8892b0;
  margin-bottom: 12px;
  font-weight: 600;
}

.overlap-description {
  font-size: 13px;
  color: #e6e6e6;
  line-height: 1.5;
}

/* Critical Moments Timeline */
.critical-moments-section {
  margin-bottom: 40px;
}

.critical-moments-section h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #ffc300;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-item {
  display: flex;
  gap: 20px;
  padding: 16px;
  background: #1a1f3a;
  border-radius: 8px;
  border-left: 4px solid #2d3561;
  transition: all 0.3s ease;
}

.timeline-item.active {
  border-left-color: #ff3366;
  background: linear-gradient(90deg, rgba(255, 51, 102, 0.1) 0%, #1a1f3a 100%);
  box-shadow: 0 0 20px rgba(255, 51, 102, 0.2);
}

.timeline-time {
  font-size: 20px;
  font-weight: 700;
  color: #00ff88;
  font-family: 'Courier New', monospace;
  min-width: 70px;
}

.timeline-content {
  flex: 1;
}

.timeline-content h4 {
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.timeline-content p {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #8892b0;
}

.timeline-impact {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
}

.timeline-impact.critical {
  background: #ff3366;
  color: #fff;
}

.timeline-impact.high {
  background: #ffc300;
  color: #0a0e27;
}

.timeline-impact.medium {
  background: #00d4ff;
  color: #0a0e27;
}
</style>
