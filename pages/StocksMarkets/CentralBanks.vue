<script setup>
import { ref, computed, onMounted } from 'vue'
import { NButton } from 'naive-ui'

definePageMeta({
  layout: 'stocks'
})

// State
const isLoading = ref(false)
const rateHistoryChart = ref(null)
const dotPlotChart = ref(null)

// Central Banks Data
const centralBanks = ref([
  {
    id: 1,
    name: 'Federal Reserve',
    shortName: 'Fed',
    region: 'United States',
    flag: '🇺🇸',
    currentRate: 5.375,
    previousRate: 5.375,
    recentChange: 0,
    lastChangeDate: 'Jul 2023',
    nextMeeting: 'Jan 31, 2024',
    stance: 'HAWKISH',
    governor: 'Jerome Powell'
  },
  {
    id: 2,
    name: 'European Central Bank',
    shortName: 'ECB',
    region: 'Eurozone',
    flag: '🇪🇺',
    currentRate: 4.50,
    previousRate: 4.50,
    recentChange: 0,
    lastChangeDate: 'Sep 2023',
    nextMeeting: 'Jan 25, 2024',
    stance: 'NEUTRAL',
    governor: 'Christine Lagarde'
  },
  {
    id: 3,
    name: 'Bank of Japan',
    shortName: 'BoJ',
    region: 'Japan',
    flag: '🇯🇵',
    currentRate: -0.10,
    previousRate: -0.10,
    recentChange: 0,
    lastChangeDate: 'Oct 2023',
    nextMeeting: 'Jan 23, 2024',
    stance: 'DOVISH',
    governor: 'Kazuo Ueda'
  },
  {
    id: 4,
    name: 'Bank of England',
    shortName: 'BoE',
    region: 'United Kingdom',
    flag: '🇬🇧',
    currentRate: 5.25,
    previousRate: 5.25,
    recentChange: 0,
    lastChangeDate: 'Aug 2023',
    nextMeeting: 'Feb 1, 2024',
    stance: 'HAWKISH',
    governor: 'Andrew Bailey'
  },
  {
    id: 5,
    name: 'Swiss National Bank',
    shortName: 'SNB',
    region: 'Switzerland',
    flag: '🇨🇭',
    currentRate: 1.75,
    previousRate: 1.75,
    recentChange: 0,
    lastChangeDate: 'Jun 2023',
    nextMeeting: 'Mar 21, 2024',
    stance: 'NEUTRAL',
    governor: 'Thomas Jordan'
  },
  {
    id: 6,
    name: 'Reserve Bank of Australia',
    shortName: 'RBA',
    region: 'Australia',
    flag: '🇦🇺',
    currentRate: 4.35,
    previousRate: 4.35,
    recentChange: 0,
    lastChangeDate: 'Nov 2023',
    nextMeeting: 'Feb 6, 2024',
    stance: 'NEUTRAL',
    governor: 'Michele Bullock'
  }
])

// Upcoming Meetings
const upcomingMeetings = ref([
  {
    id: 1,
    bankName: 'BoJ',
    flag: '🇯🇵',
    date: new Date('2024-01-23T10:00:00'),
    expectation: 'Hold at -0.10%',
    consensus: 'No change expected',
    importance: 'MEDIUM',
    botAction: 'Monitor for YCC policy changes'
  },
  {
    id: 2,
    bankName: 'ECB',
    flag: '🇪🇺',
    date: new Date('2024-01-25T13:45:00'),
    expectation: 'Hold at 4.50%',
    consensus: 'Pause after tightening cycle',
    importance: 'HIGH',
    botAction: 'PAUSE EUR pairs 15 min before'
  },
  {
    id: 3,
    bankName: 'Fed (FOMC)',
    flag: '🇺🇸',
    date: new Date('2024-01-31T14:00:00'),
    expectation: 'Hold at 5.25-5.50%',
    consensus: 'Higher for longer messaging',
    importance: 'HIGH',
    botAction: 'PAUSE all bots 30 min before'
  },
  {
    id: 4,
    bankName: 'BoE',
    flag: '🇬🇧',
    date: new Date('2024-02-01T12:00:00'),
    expectation: 'Hold at 5.25%',
    consensus: 'Peak rates reached',
    importance: 'MEDIUM',
    botAction: 'Monitor GBP pairs closely'
  }
])

// Computed
const hawkishBanks = computed(() => {
  return centralBanks.value.filter(b => b.stance === 'HAWKISH')
})

const neutralBanks = computed(() => {
  return centralBanks.value.filter(b => b.stance === 'NEUTRAL')
})

const dovishBanks = computed(() => {
  return centralBanks.value.filter(b => b.stance === 'DOVISH')
})

// Methods
const getRateChangeClass = (change) => {
  if (change > 0) return 'increase'
  if (change < 0) return 'decrease'
  return 'unchanged'
}

const getStanceClass = (stance) => {
  return stance.toLowerCase()
}

const getCryptoImpact = (bank) => {
  if (bank.stance === 'HAWKISH') return '⬇️ Bearish'
  if (bank.stance === 'DOVISH') return '⬆️ Bullish'
  return '↔️ Neutral'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ro-RO', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('ro-RO', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getCountdown = (date) => {
  const now = new Date()
  const eventDate = new Date(date)
  const diff = eventDate - now

  if (diff < 0) return 'Passed'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) return `In ${days}d ${hours}h`
  return `In ${hours}h`
}

const refreshData = async () => {
  isLoading.value = true
  // In production: fetch from FRED API, ECB API, etc.
  await new Promise(resolve => setTimeout(resolve, 1000))
  isLoading.value = false
}

// Initialize charts
const initCharts = () => {
  // In production: use Chart.js to render rate history and dot plot
  console.log('Charts initialized')
}

onMounted(() => {
  initCharts()
})
</script>

<template>
  <div class="central-banks">
    <!-- Header -->
    <div class="page-header">
      <h1>🏛️ Central Banks - Rate Monitoring</h1>
      <div class="header-actions">
        <n-button size="small" @click="refreshData" :loading="isLoading">
          🔄 Refresh
        </n-button>
      </div>
    </div>

    <!-- Current Rates Overview -->
    <div class="current-rates-section">
      <h2>💰 Current Interest Rates</h2>
      <div class="rates-grid">
        <div
          v-for="bank in centralBanks"
          :key="bank.id"
          class="bank-card"
          :class="{ 'rate-change': bank.recentChange }"
        >
          <div class="bank-header">
            <div class="bank-flag">{{ bank.flag }}</div>
            <div class="bank-info">
              <h3>{{ bank.name }}</h3>
              <p class="bank-region">{{ bank.region }}</p>
            </div>
          </div>
          <div class="bank-body">
            <div class="current-rate">
              <span class="rate-value">{{ bank.currentRate }}%</span>
              <span v-if="bank.recentChange" class="rate-change-badge" :class="getRateChangeClass(bank.recentChange)">
                {{ bank.recentChange > 0 ? '+' : '' }}{{ bank.recentChange }}%
              </span>
            </div>
            <div class="rate-details">
              <div class="detail-row">
                <span class="label">Previous:</span>
                <span class="value">{{ bank.previousRate }}%</span>
              </div>
              <div class="detail-row">
                <span class="label">Last Change:</span>
                <span class="value">{{ bank.lastChangeDate }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Next Meeting:</span>
                <span class="value meeting-date">{{ bank.nextMeeting }}</span>
              </div>
            </div>
          </div>
          <div class="bank-footer">
            <div class="stance-indicator" :class="getStanceClass(bank.stance)">
              {{ bank.stance }}
            </div>
            <div class="crypto-impact">
              Impact: {{ getCryptoImpact(bank) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rate History Chart -->
    <div class="rate-history-section">
      <h2>📊 Rate History (Last 2 Years)</h2>
      <div class="chart-container">
        <canvas ref="rateHistoryChart"></canvas>
      </div>
    </div>

    <!-- Upcoming Meetings -->
    <div class="upcoming-meetings-section">
      <h2>📅 Upcoming Central Bank Meetings</h2>
      <div class="meetings-timeline">
        <div
          v-for="meeting in upcomingMeetings"
          :key="meeting.id"
          class="meeting-card"
          :class="{ 'critical': meeting.importance === 'HIGH' }"
        >
          <div class="meeting-header">
            <div class="meeting-bank">
              <span class="flag">{{ meeting.flag }}</span>
              <span class="name">{{ meeting.bankName }}</span>
            </div>
            <div class="meeting-countdown">
              {{ getCountdown(meeting.date) }}
            </div>
          </div>
          <div class="meeting-body">
            <div class="meeting-date">
              <span class="icon">📅</span>
              {{ formatDate(meeting.date) }} at {{ formatTime(meeting.date) }}
            </div>
            <div class="meeting-expectation">
              <strong>Expected:</strong> {{ meeting.expectation }}
            </div>
            <div class="meeting-consensus">
              <strong>Market Consensus:</strong> {{ meeting.consensus }}
            </div>
          </div>
          <div class="meeting-footer">
            <div class="bot-recommendation">
              <strong>🤖 Bot Action:</strong> {{ meeting.botAction }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fed Dot Plot -->
    <div class="dot-plot-section">
      <h2>🎯 Fed Dot Plot - Rate Projections</h2>
      <div class="dot-plot-container">
        <div class="dot-plot-chart">
          <canvas ref="dotPlotChart"></canvas>
        </div>
        <div class="dot-plot-info">
          <h3>📈 FOMC Median Projections</h3>
          <div class="projection-list">
            <div class="projection-item">
              <span class="year">2024:</span>
              <span class="rate">5.125%</span>
              <span class="change down">-0.50%</span>
            </div>
            <div class="projection-item">
              <span class="year">2025:</span>
              <span class="rate">4.125%</span>
              <span class="change down">-1.00%</span>
            </div>
            <div class="projection-item">
              <span class="year">2026:</span>
              <span class="rate">3.125%</span>
              <span class="change down">-1.00%</span>
            </div>
            <div class="projection-item">
              <span class="year">Long-term:</span>
              <span class="rate">2.50%</span>
              <span class="change neutral">Neutral</span>
            </div>
          </div>
          <div class="projection-note">
            <p><strong>Note:</strong> Dot plot shows individual FOMC member rate expectations. Median represents market-moving consensus.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Policy Stance Analysis -->
    <div class="policy-analysis-section">
      <h2>🔍 Current Policy Stance Analysis</h2>
      <div class="analysis-grid">
        <div class="analysis-card hawkish">
          <h3>🦅 Hawkish Banks (Tight Policy)</h3>
          <p class="description">Fighting inflation, raising or holding high rates</p>
          <div class="banks-list">
            <div v-for="bank in hawkishBanks" :key="bank.id" class="bank-tag">
              {{ bank.flag }} {{ bank.name }}
            </div>
          </div>
          <div class="impact">
            <strong>Crypto Impact:</strong> Negative (USD stronger, risk-off)
          </div>
        </div>

        <div class="analysis-card neutral">
          <h3>⚖️ Neutral Banks (Wait & See)</h3>
          <p class="description">Monitoring data, no clear directional bias</p>
          <div class="banks-list">
            <div v-for="bank in neutralBanks" :key="bank.id" class="bank-tag">
              {{ bank.flag }} {{ bank.name }}
            </div>
          </div>
          <div class="impact">
            <strong>Crypto Impact:</strong> Minimal (market-driven)
          </div>
        </div>

        <div class="analysis-card dovish">
          <h3>🕊️ Dovish Banks (Loose Policy)</h3>
          <p class="description">Supporting growth, cutting or holding low rates</p>
          <div class="banks-list">
            <div v-for="bank in dovishBanks" :key="bank.id" class="bank-tag">
              {{ bank.flag }} {{ bank.name }}
            </div>
          </div>
          <div class="impact">
            <strong>Crypto Impact:</strong> Positive (USD weaker, risk-on)
          </div>
        </div>
      </div>
    </div>

    <!-- Key Terminology -->
    <div class="terminology-section">
      <h2>📚 Central Bank Terminology Guide</h2>
      <div class="terminology-grid">
        <div class="term-card">
          <h4>🦅 Hawkish</h4>
          <p><strong>Meaning:</strong> Favors higher interest rates to combat inflation</p>
          <p><strong>Signals:</strong> "Persistent inflation", "data-dependent tightening"</p>
          <p><strong>Crypto Effect:</strong> ⬇️ Negative (stronger USD, lower risk appetite)</p>
        </div>

        <div class="term-card">
          <h4>🕊️ Dovish</h4>
          <p><strong>Meaning:</strong> Favors lower interest rates to support growth</p>
          <p><strong>Signals:</strong> "Accommodative policy", "supporting employment"</p>
          <p><strong>Crypto Effect:</strong> ⬆️ Positive (weaker USD, higher risk appetite)</p>
        </div>

        <div class="term-card">
          <h4>🎯 Dot Plot</h4>
          <p><strong>Meaning:</strong> FOMC members' individual rate forecasts</p>
          <p><strong>Signals:</strong> Median shows consensus, dispersion shows uncertainty</p>
          <p><strong>Crypto Effect:</strong> Higher median = bearish, Lower = bullish</p>
        </div>

        <div class="term-card">
          <h4>📊 Forward Guidance</h4>
          <p><strong>Meaning:</strong> Central bank communication about future policy</p>
          <p><strong>Signals:</strong> "Higher for longer" vs "gradual easing"</p>
          <p><strong>Crypto Effect:</strong> Clear guidance reduces volatility</p>
        </div>

        <div class="term-card">
          <h4>💰 QE / QT</h4>
          <p><strong>Meaning:</strong> Quantitative Easing (buying) vs Tightening (selling)</p>
          <p><strong>Signals:</strong> Balance sheet expansion/contraction</p>
          <p><strong>Crypto Effect:</strong> QE bullish, QT bearish for risk assets</p>
        </div>

        <div class="term-card">
          <h4>📈 Real Rates</h4>
          <p><strong>Meaning:</strong> Nominal rate minus inflation rate</p>
          <p><strong>Signals:</strong> Positive real rates = restrictive policy</p>
          <p><strong>Crypto Effect:</strong> Higher real rates = crypto bearish</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.central-banks {
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

/* Current Rates */
.current-rates-section {
  margin-bottom: 40px;
}

.current-rates-section h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #00ff88;
}

.rates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.bank-card {
  background: #1a1f3a;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #2d3561;
  transition: all 0.3s ease;
}

.bank-card:hover {
  border-color: #00d4ff;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
}

.bank-card.rate-change {
  border-color: #ffc300;
}

.bank-header {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 16px 20px;
  background: #2d3561;
}

.bank-flag {
  font-size: 32px;
}

.bank-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.bank-region {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #8892b0;
}

.bank-body {
  padding: 20px;
}

.current-rate {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.rate-value {
  font-size: 36px;
  font-weight: 700;
  color: #00d4ff;
  font-family: 'Courier New', monospace;
}

.rate-change-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 700;
}

.rate-change-badge.increase {
  background: #ff3366;
  color: #fff;
}

.rate-change-badge.decrease {
  background: #00ff88;
  color: #0a0e27;
}

.rate-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.detail-row .label {
  color: #8892b0;
}

.detail-row .value {
  color: #fff;
  font-weight: 600;
}

.meeting-date {
  color: #ffc300;
  font-weight: 700;
}

.bank-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid #2d3561;
}

.stance-indicator {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.stance-indicator.hawkish {
  background: #ff3366;
  color: #fff;
}

.stance-indicator.neutral {
  background: #8892b0;
  color: #fff;
}

.stance-indicator.dovish {
  background: #00ff88;
  color: #0a0e27;
}

.crypto-impact {
  font-size: 12px;
  color: #8892b0;
}

/* Rate History Chart */
.rate-history-section {
  margin-bottom: 40px;
}

.rate-history-section h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #00d4ff;
}

.chart-container {
  background: #1a1f3a;
  padding: 20px;
  border-radius: 12px;
  min-height: 400px;
}

/* Upcoming Meetings */
.upcoming-meetings-section {
  margin-bottom: 40px;
}

.upcoming-meetings-section h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #ffc300;
}

.meetings-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.meeting-card {
  background: #1a1f3a;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #2d3561;
}

.meeting-card.critical {
  border-left-color: #ff3366;
  background: rgba(255, 51, 102, 0.05);
}

.meeting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.meeting-bank {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 18px;
  font-weight: 700;
}

.meeting-bank .flag {
  font-size: 24px;
}

.meeting-countdown {
  font-size: 14px;
  font-weight: 700;
  color: #00ff88;
  font-family: 'Courier New', monospace;
}

.meeting-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
  font-size: 13px;
}

.meeting-date .icon {
  margin-right: 6px;
}

.meeting-footer {
  padding-top: 16px;
  border-top: 1px solid #2d3561;
  font-size: 13px;
  color: #00ff88;
}

/* Dot Plot */
.dot-plot-section {
  margin-bottom: 40px;
}

.dot-plot-section h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #ff3366;
}

.dot-plot-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 20px;
}

.dot-plot-chart {
  background: #1a1f3a;
  padding: 20px;
  border-radius: 12px;
  min-height: 300px;
}

.dot-plot-info {
  background: #1a1f3a;
  padding: 20px;
  border-radius: 12px;
}

.dot-plot-info h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #00d4ff;
}

.projection-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.projection-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.projection-item .year {
  font-weight: 700;
  color: #8892b0;
}

.projection-item .rate {
  font-size: 18px;
  font-weight: 700;
  color: #00d4ff;
  font-family: 'Courier New', monospace;
}

.projection-item .change {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
}

.projection-item .change.down {
  background: #00ff88;
  color: #0a0e27;
}

.projection-item .change.neutral {
  background: #8892b0;
  color: #fff;
}

.projection-note {
  padding: 12px;
  background: rgba(255, 195, 0, 0.1);
  border-radius: 8px;
  font-size: 12px;
  color: #ffc300;
}

/* Policy Analysis */
.policy-analysis-section {
  margin-bottom: 40px;
}

.policy-analysis-section h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #00ff88;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.analysis-card {
  background: #1a1f3a;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid transparent;
}

.analysis-card.hawkish {
  border-color: #ff3366;
}

.analysis-card.neutral {
  border-color: #8892b0;
}

.analysis-card.dovish {
  border-color: #00ff88;
}

.analysis-card h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #fff;
}

.analysis-card .description {
  font-size: 13px;
  color: #8892b0;
  margin-bottom: 16px;
}

.banks-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.bank-tag {
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.analysis-card .impact {
  font-size: 13px;
  color: #fff;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

/* Terminology */
.terminology-section {
  margin-bottom: 40px;
}

.terminology-section h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #00d4ff;
}

.terminology-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.term-card {
  background: #1a1f3a;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #2d3561;
}

.term-card h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #00ff88;
}

.term-card p {
  margin: 8px 0;
  font-size: 13px;
  color: #e6e6e6;
}

.term-card p strong {
  color: #8892b0;
}
</style>
