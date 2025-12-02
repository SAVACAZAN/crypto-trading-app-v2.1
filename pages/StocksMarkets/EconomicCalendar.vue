<script setup>
import { ref, computed, onMounted } from 'vue'
import { NButton, NSelect } from 'naive-ui'

definePageMeta({
  layout: 'stocks'
})

// State
const isLoading = ref(false)
const selectedImportance = ref('ALL')
const selectedTimeFilter = ref('upcoming')

// Mock data - In production, fetch from FRED API, TradingEconomics, etc.
const economicEvents = ref([
  {
    id: 1,
    name: 'FOMC Meeting - Interest Rate Decision',
    category: 'Monetary Policy',
    country: 'USA',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    importance: 'HIGH',
    forecast: '5.25-5.50%',
    previous: '5.25-5.50%',
    actual: null,
    impact: 'crypto'
  },
  {
    id: 2,
    name: 'CPI (Consumer Price Index)',
    category: 'Inflation',
    country: 'USA',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    importance: 'HIGH',
    forecast: '3.2%',
    previous: '3.7%',
    actual: null,
    impact: 'crypto'
  },
  {
    id: 3,
    name: 'Non-Farm Payrolls (NFP)',
    category: 'Employment',
    country: 'USA',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    importance: 'HIGH',
    forecast: '180K',
    previous: '216K',
    actual: null,
    impact: 'stocks'
  },
  {
    id: 4,
    name: 'Fed Chair Powell Speech',
    category: 'Speech',
    country: 'USA',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    importance: 'MEDIUM',
    forecast: null,
    previous: null,
    actual: null,
    impact: 'crypto'
  },
  {
    id: 5,
    name: 'ECB Interest Rate Decision',
    category: 'Monetary Policy',
    country: 'EUR',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    importance: 'HIGH',
    forecast: '4.50%',
    previous: '4.50%',
    actual: null,
    impact: 'forex'
  },
  {
    id: 6,
    name: 'GDP Growth Rate (Q4)',
    category: 'Economic Growth',
    country: 'USA',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    importance: 'MEDIUM',
    forecast: '2.5%',
    previous: '4.9%',
    actual: null,
    impact: 'stocks'
  },
  {
    id: 7,
    name: 'Retail Sales',
    category: 'Consumer Spending',
    country: 'USA',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    importance: 'MEDIUM',
    forecast: '0.3%',
    previous: '0.7%',
    actual: null,
    impact: 'stocks'
  },
  {
    id: 8,
    name: 'PPI (Producer Price Index)',
    category: 'Inflation',
    country: 'USA',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    importance: 'MEDIUM',
    forecast: '2.3%',
    previous: '2.2%',
    actual: null,
    impact: 'crypto'
  },
  // Past events
  {
    id: 9,
    name: 'CPI (Consumer Price Index)',
    category: 'Inflation',
    country: 'USA',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    importance: 'HIGH',
    forecast: '3.7%',
    previous: '3.2%',
    actual: '3.7%',
    impact: 'crypto'
  },
  {
    id: 10,
    name: 'FOMC Meeting - Interest Rate Decision',
    category: 'Monetary Policy',
    country: 'USA',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    importance: 'HIGH',
    forecast: '5.25-5.50%',
    previous: '5.00-5.25%',
    actual: '5.25-5.50%',
    impact: 'crypto'
  }
])

// Options
const importanceOptions = [
  { label: 'All Events', value: 'ALL' },
  { label: 'High Only', value: 'HIGH' },
  { label: 'Medium+', value: 'MEDIUM' }
]

const timeFilters = [
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Past Events', value: 'past' }
]

// Computed
const criticalUpcomingEvents = computed(() => {
  const now = new Date()
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  return economicEvents.value
    .filter(event => {
      const eventDate = new Date(event.date)
      return eventDate > now && eventDate <= sevenDaysLater && event.importance === 'HIGH'
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
})

const filteredEvents = computed(() => {
  let filtered = economicEvents.value

  // Filter by importance
  if (selectedImportance.value === 'HIGH') {
    filtered = filtered.filter(e => e.importance === 'HIGH')
  } else if (selectedImportance.value === 'MEDIUM') {
    filtered = filtered.filter(e => e.importance === 'HIGH' || e.importance === 'MEDIUM')
  }

  // Filter by time
  const now = new Date()

  if (selectedTimeFilter.value === 'upcoming') {
    filtered = filtered.filter(e => new Date(e.date) > now)
  } else if (selectedTimeFilter.value === 'today') {
    const today = new Date().setHours(0, 0, 0, 0)
    const tomorrow = new Date(today + 24 * 60 * 60 * 1000)
    filtered = filtered.filter(e => {
      const eventDate = new Date(e.date)
      return eventDate >= today && eventDate < tomorrow
    })
  } else if (selectedTimeFilter.value === 'week') {
    const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    filtered = filtered.filter(e => new Date(e.date) > now && new Date(e.date) <= oneWeek)
  } else if (selectedTimeFilter.value === 'month') {
    const oneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    filtered = filtered.filter(e => new Date(e.date) > now && new Date(e.date) <= oneMonth)
  } else if (selectedTimeFilter.value === 'past') {
    filtered = filtered.filter(e => new Date(e.date) <= now)
  }

  return filtered.sort((a, b) => new Date(a.date) - new Date(b.date))
})

// Methods
const getCountryFlag = (country) => {
  const flags = {
    'USA': '🇺🇸',
    'EUR': '🇪🇺',
    'UK': '🇬🇧',
    'Japan': '🇯🇵',
    'China': '🇨🇳'
  }
  return flags[country] || '🌍'
}

const getImportanceClass = (importance) => {
  return importance?.toLowerCase() || 'low'
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
    minute: '2-digit',
    timeZone: 'Europe/Bucharest'
  })
}

const getCountdown = (date) => {
  const now = new Date()
  const eventDate = new Date(date)
  const diff = eventDate - now

  if (diff < 0) return 'Passed'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `In ${days}d ${hours}h`
  if (hours > 0) return `In ${hours}h ${minutes}m`
  return `In ${minutes}m`
}

const isPastEvent = (date) => {
  return new Date(date) < new Date()
}

const getBotAction = (event) => {
  if (event.importance === 'HIGH') {
    if (event.name.includes('FOMC')) {
      return 'PAUSE all bots 30 min before'
    }
    return 'PAUSE 15 min before, reduce positions'
  }
  return 'Monitor and adjust risk parameters'
}

const getActualClass = (event) => {
  if (!event.actual || !event.forecast) return ''

  const actual = parseFloat(event.actual)
  const forecast = parseFloat(event.forecast)

  if (actual > forecast) return 'higher'
  if (actual < forecast) return 'lower'
  return 'inline'
}

const getImpactClass = (event) => {
  if (event.importance === 'HIGH') return 'high-impact'
  if (event.importance === 'MEDIUM') return 'medium-impact'
  return 'low-impact'
}

const getImpactLevel = (event) => {
  const impacts = {
    'crypto': '₿ Crypto',
    'stocks': '📈 Stocks',
    'forex': '💱 Forex',
    'all': '🌐 All'
  }
  return impacts[event.impact] || 'N/A'
}

const refreshCalendar = async () => {
  isLoading.value = true
  // In production: fetch from API
  await new Promise(resolve => setTimeout(resolve, 1000))
  isLoading.value = false
}

onMounted(() => {
  // In production: fetch calendar data from APIs
  console.log('Economic Calendar loaded')
})
</script>

<template>
  <div class="economic-calendar">
    <!-- Header -->
    <div class="page-header">
      <h1>📅 Economic Calendar - Macro Events</h1>
      <div class="header-actions">
        <n-button size="small" @click="refreshCalendar" :loading="isLoading">
          🔄 Refresh
        </n-button>
        <n-select
          v-model:value="selectedImportance"
          :options="importanceOptions"
          size="small"
          style="width: 150px"
        />
      </div>
    </div>

    <!-- Critical Upcoming Events -->
    <div class="critical-events-section">
      <h2>🚨 Critical Events (Next 7 Days)</h2>
      <div v-if="criticalUpcomingEvents.length === 0" class="no-events">
        <p>✅ No critical events scheduled in the next 7 days</p>
      </div>
      <div v-else class="critical-events-grid">
        <div
          v-for="event in criticalUpcomingEvents"
          :key="event.id"
          class="critical-event-card"
          :class="getImportanceClass(event.importance)"
        >
          <div class="event-header">
            <div class="event-badge" :class="getImportanceClass(event.importance)">
              {{ event.importance }}
            </div>
            <div class="event-countdown">
              {{ getCountdown(event.date) }}
            </div>
          </div>
          <div class="event-body">
            <h3>{{ event.name }}</h3>
            <div class="event-details">
              <div class="detail-row">
                <span class="label">📅 Date:</span>
                <span class="value">{{ formatDate(event.date) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">⏰ Time:</span>
                <span class="value">{{ formatTime(event.date) }} (București)</span>
              </div>
              <div class="detail-row">
                <span class="label">🌍 Country:</span>
                <span class="value">{{ event.country }}</span>
              </div>
              <div v-if="event.forecast" class="detail-row">
                <span class="label">📊 Forecast:</span>
                <span class="value">{{ event.forecast }}</span>
              </div>
              <div v-if="event.previous" class="detail-row">
                <span class="label">📈 Previous:</span>
                <span class="value">{{ event.previous }}</span>
              </div>
            </div>
          </div>
          <div class="event-footer">
            <div class="bot-action">
              <strong>Bot Action:</strong> {{ getBotAction(event) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Full Calendar -->
    <div class="full-calendar-section">
      <h2>📋 Complete Economic Calendar</h2>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <div
          v-for="filter in timeFilters"
          :key="filter.value"
          class="filter-tab"
          :class="{ active: selectedTimeFilter === filter.value }"
          @click="selectedTimeFilter = filter.value"
        >
          {{ filter.label }}
        </div>
      </div>

      <!-- Events Table -->
      <div class="events-table-container">
        <table class="events-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Event</th>
              <th>Country</th>
              <th>Importance</th>
              <th>Forecast</th>
              <th>Previous</th>
              <th>Actual</th>
              <th>Impact</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="event in filteredEvents"
              :key="event.id"
              class="event-row"
              :class="{ 'past-event': isPastEvent(event.date), 'critical-row': event.importance === 'HIGH' }"
            >
              <td>
                <div class="date-cell">
                  <div class="date">{{ formatDate(event.date) }}</div>
                  <div class="time">{{ formatTime(event.date) }}</div>
                </div>
              </td>
              <td>
                <div class="event-name">{{ event.name }}</div>
                <div class="event-category">{{ event.category }}</div>
              </td>
              <td>
                <span class="country-flag">{{ getCountryFlag(event.country) }}</span>
                {{ event.country }}
              </td>
              <td>
                <span class="importance-badge" :class="getImportanceClass(event.importance)">
                  {{ event.importance }}
                </span>
              </td>
              <td>{{ event.forecast || 'N/A' }}</td>
              <td>{{ event.previous || 'N/A' }}</td>
              <td>
                <span v-if="event.actual" class="actual-value" :class="getActualClass(event)">
                  {{ event.actual }}
                </span>
                <span v-else>-</span>
              </td>
              <td>
                <div class="impact-indicator" :class="getImpactClass(event)">
                  {{ getImpactLevel(event) }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Key Events Reference -->
    <div class="key-events-reference">
      <h2>📚 Key Economic Events Reference</h2>
      <div class="reference-grid">
        <div class="reference-card">
          <h3>🏛️ FOMC Meeting</h3>
          <p><strong>Frequency:</strong> 8 times per year</p>
          <p><strong>Impact:</strong> EXTREME - Can move crypto 5-10%</p>
          <p><strong>Bot Action:</strong> PAUSE all bots 30 min before</p>
          <p><strong>Time:</strong> Usually 14:00 ET (21:00 București)</p>
        </div>

        <div class="reference-card">
          <h3>📊 CPI (Inflation)</h3>
          <p><strong>Frequency:</strong> Monthly (usually mid-month)</p>
          <p><strong>Impact:</strong> VERY HIGH - Major crypto mover</p>
          <p><strong>Bot Action:</strong> PAUSE 15 min before, reduce grid range</p>
          <p><strong>Time:</strong> 08:30 ET (15:30 București)</p>
        </div>

        <div class="reference-card">
          <h3>💼 NFP (Non-Farm Payrolls)</h3>
          <p><strong>Frequency:</strong> Monthly (first Friday)</p>
          <p><strong>Impact:</strong> VERY HIGH - Jobs report</p>
          <p><strong>Bot Action:</strong> PAUSE aggressive orders</p>
          <p><strong>Time:</strong> 08:30 ET (15:30 București)</p>
        </div>

        <div class="reference-card">
          <h3>🗣️ Fed Chair Speech</h3>
          <p><strong>Frequency:</strong> Ad-hoc (varies)</p>
          <p><strong>Impact:</strong> MEDIUM-HIGH - Tone matters</p>
          <p><strong>Bot Action:</strong> Monitor for hawkish/dovish tone</p>
          <p><strong>Watch for:</strong> Rate guidance, inflation outlook</p>
        </div>

        <div class="reference-card">
          <h3>📈 GDP Report</h3>
          <p><strong>Frequency:</strong> Quarterly (3 releases per quarter)</p>
          <p><strong>Impact:</strong> MEDIUM - Economic health</p>
          <p><strong>Bot Action:</strong> Adjust risk parameters</p>
          <p><strong>Time:</strong> 08:30 ET (15:30 București)</p>
        </div>

        <div class="reference-card">
          <h3>🏦 ECB Rate Decision</h3>
          <p><strong>Frequency:</strong> 8 times per year</p>
          <p><strong>Impact:</strong> HIGH (especially EUR pairs)</p>
          <p><strong>Bot Action:</strong> Pause EU-related pairs</p>
          <p><strong>Time:</strong> Usually 13:45 CET (14:45 București)</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.economic-calendar {
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

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Critical Events */
.critical-events-section {
  margin-bottom: 40px;
}

.critical-events-section h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #ff3366;
}

.no-events {
  text-align: center;
  padding: 40px;
  background: #1a1f3a;
  border-radius: 12px;
  color: #00ff88;
}

.critical-events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.critical-event-card {
  background: #1a1f3a;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #ff3366;
  box-shadow: 0 0 20px rgba(255, 51, 102, 0.3);
}

.critical-event-card.medium {
  border-color: #ffc300;
  box-shadow: 0 0 20px rgba(255, 195, 0, 0.3);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(255, 51, 102, 0.1);
}

.event-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.event-badge.high {
  background: #ff3366;
  color: #fff;
}

.event-badge.medium {
  background: #ffc300;
  color: #0a0e27;
}

.event-countdown {
  font-size: 14px;
  font-weight: 700;
  color: #00ff88;
  font-family: 'Courier New', monospace;
}

.event-body {
  padding: 20px;
}

.event-body h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #fff;
  font-weight: 700;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.detail-row .label {
  color: #8892b0;
  font-weight: 500;
}

.detail-row .value {
  color: #fff;
  font-weight: 600;
}

.event-footer {
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid #2d3561;
}

.bot-action {
  font-size: 13px;
  color: #00ff88;
}

/* Full Calendar */
.full-calendar-section {
  margin-bottom: 40px;
}

.full-calendar-section h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #00d4ff;
}

.filter-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 10px 20px;
  background: #1a1f3a;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #8892b0;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.filter-tab:hover {
  background: #2d3561;
  color: #fff;
}

.filter-tab.active {
  background: #00d4ff;
  color: #0a0e27;
  border-color: #00d4ff;
}

/* Events Table */
.events-table-container {
  background: #1a1f3a;
  border-radius: 12px;
  overflow-x: auto;
}

.events-table {
  width: 100%;
  border-collapse: collapse;
}

.events-table thead {
  background: #2d3561;
}

.events-table th {
  padding: 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 700;
  color: #00d4ff;
  text-transform: uppercase;
  border-bottom: 2px solid #00d4ff;
}

.events-table tbody tr {
  border-bottom: 1px solid #2d3561;
  transition: background 0.2s ease;
}

.events-table tbody tr:hover {
  background: rgba(0, 212, 255, 0.05);
}

.events-table tbody tr.critical-row {
  background: rgba(255, 51, 102, 0.05);
}

.events-table tbody tr.past-event {
  opacity: 0.5;
}

.events-table td {
  padding: 14px 16px;
  font-size: 13px;
  color: #e6e6e6;
}

.date-cell .date {
  font-weight: 600;
  color: #fff;
}

.date-cell .time {
  font-size: 11px;
  color: #8892b0;
  margin-top: 4px;
}

.event-name {
  font-weight: 600;
  color: #fff;
}

.event-category {
  font-size: 11px;
  color: #8892b0;
  margin-top: 4px;
}

.country-flag {
  font-size: 16px;
  margin-right: 6px;
}

.importance-badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  display: inline-block;
}

.importance-badge.high {
  background: #ff3366;
  color: #fff;
}

.importance-badge.medium {
  background: #ffc300;
  color: #0a0e27;
}

.importance-badge.low {
  background: #8892b0;
  color: #fff;
}

.actual-value {
  font-weight: 700;
}

.actual-value.higher {
  color: #00ff88;
}

.actual-value.lower {
  color: #ff3366;
}

.impact-indicator {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
}

.impact-indicator.high-impact {
  background: rgba(255, 51, 102, 0.2);
  color: #ff3366;
}

.impact-indicator.medium-impact {
  background: rgba(255, 195, 0, 0.2);
  color: #ffc300;
}

.impact-indicator.low-impact {
  background: rgba(138, 146, 176, 0.2);
  color: #8892b0;
}

/* Key Events Reference */
.key-events-reference {
  margin-bottom: 40px;
}

.key-events-reference h2 {
  font-size: 22px;
  margin-bottom: 20px;
  color: #00ff88;
}

.reference-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.reference-card {
  background: #1a1f3a;
  padding: 20px;
  border-radius: 12px;
  border: 2px solid #2d3561;
  transition: all 0.3s ease;
}

.reference-card:hover {
  border-color: #00d4ff;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
}

.reference-card h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #00d4ff;
}

.reference-card p {
  margin: 8px 0;
  font-size: 13px;
  color: #e6e6e6;
}

.reference-card p strong {
  color: #8892b0;
  font-weight: 600;
}
</style>
