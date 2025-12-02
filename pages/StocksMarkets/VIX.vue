<template>
  <div class="vix-container">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <n-spin size="large" />
      <p style="margin-top: 20px; color: #94a3b8">Loading VIX data...</p>
    </div>

    <!-- Main Content -->
    <div v-else class="content-wrapper">
      <!-- Current VIX Card -->
      <n-card
        title="Current VIX Level"
        :bordered="false"
        style="margin-bottom: 24px"
        :segmented="{
          content: true,
          footer: 'soft'
        }"
      >
        <div class="vix-display">
          <div class="vix-value" :style="{ color: getVixColor(currentVix) }">
            {{ currentVix }}
          </div>
          <div class="vix-label">
            {{ getVixLevel(currentVix) }}
          </div>
          <div class="vix-description">
            {{ getVixDescription(currentVix) }}
          </div>
        </div>

        <template #footer>
          <div style="display: flex; justify-content: space-between; align-items: center">
            <span style="color: #94a3b8">Last Updated: {{ lastUpdate }}</span>
            <n-button @click="fetchVixData" :loading="isLoading" type="primary">
              Refresh Data
            </n-button>
          </div>
        </template>
      </n-card>

      <!-- Risk Level & Bot Recommendations -->
      <n-grid :cols="2" :x-gap="24" :y-gap="24" style="margin-bottom: 24px">
        <!-- Risk Level Card -->
        <n-grid-item>
          <n-card
            title="Risk Level"
            :bordered="false"
            :segmented="{ content: true }"
          >
            <div class="risk-indicator">
              <div
                class="risk-badge"
                :style="{
                  background: getRiskColor(riskLevel),
                  boxShadow: `0 0 20px ${getRiskColor(riskLevel)}`
                }"
              >
                {{ riskLevel }}
              </div>
              <div class="risk-advice">
                {{ getRiskAdvice(riskLevel) }}
              </div>
            </div>
          </n-card>
        </n-grid-item>

        <!-- Market Condition Card -->
        <n-grid-item>
          <n-card
            title="Market Condition"
            :bordered="false"
            :segmented="{ content: true }"
          >
            <div class="market-condition">
              <div class="condition-text">
                {{ marketCondition }}
              </div>
              <div class="condition-detail">
                {{ marketConditionDetail }}
              </div>
            </div>
          </n-card>
        </n-grid-item>
      </n-grid>

      <!-- Bot Recommendations Card -->
      <n-card
        title="Grid Bot Recommendations"
        :bordered="false"
        style="margin-bottom: 24px"
        :segmented="{ content: true }"
      >
        <n-grid :cols="3" :x-gap="24">
          <n-grid-item>
            <div class="bot-setting">
              <div class="setting-label">Grid Spacing</div>
              <div class="setting-value">{{ gridSpacing }}</div>
            </div>
          </n-grid-item>
          <n-grid-item>
            <div class="bot-setting">
              <div class="setting-label">Position Size</div>
              <div class="setting-value">{{ positionSize }}</div>
            </div>
          </n-grid-item>
          <n-grid-item>
            <div class="bot-setting">
              <div class="setting-label">Stop Loss</div>
              <div class="setting-value">{{ stopLoss }}</div>
            </div>
          </n-grid-item>
        </n-grid>

        <n-divider />

        <div class="bot-actions">
          <h4 style="color: #00dc82; margin-bottom: 12px">Recommended Actions:</h4>
          <ul style="color: #cbd5e1; line-height: 1.8">
            <li v-for="(action, index) in botActions" :key="index">{{ action }}</li>
          </ul>
        </div>
      </n-card>

      <!-- VIX Historical Chart -->
      <n-card
        title="VIX Historical Data (30 Days)"
        :bordered="false"
        :segmented="{ content: true }"
      >
        <div class="chart-container">
          <div v-if="historicalData.length === 0" class="no-data">
            No historical data available
          </div>
          <div v-else class="data-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>VIX Value</th>
                  <th>Level</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in historicalData.slice(0, 10)" :key="index">
                  <td>{{ item.date }}</td>
                  <td :style="{ color: getVixColor(item.value) }">{{ item.value }}</td>
                  <td>{{ getVixLevel(item.value) }}</td>
                  <td :style="{ color: item.change >= 0 ? '#10b981' : '#ef4444' }">
                    {{ item.change >= 0 ? '+' : '' }}{{ item.change }}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </n-card>

      <!-- VIX Reference Guide -->
      <n-card
        title="VIX Reference Guide"
        :bordered="false"
        style="margin-top: 24px"
        :segmented="{ content: true }"
      >
        <div class="reference-grid">
          <div class="reference-item">
            <div class="ref-range" style="color: #10b981">0-12</div>
            <div class="ref-label">LOW</div>
            <div class="ref-desc">Calm market, low volatility</div>
          </div>
          <div class="reference-item">
            <div class="ref-range" style="color: #3b82f6">12-20</div>
            <div class="ref-label">NORMAL</div>
            <div class="ref-desc">Normal market conditions</div>
          </div>
          <div class="reference-item">
            <div class="ref-range" style="color: #f59e0b">20-30</div>
            <div class="ref-label">HIGH</div>
            <div class="ref-desc">Elevated volatility</div>
          </div>
          <div class="reference-item">
            <div class="ref-range" style="color: #ef4444">30-40</div>
            <div class="ref-label">CRITICAL</div>
            <div class="ref-desc">High market stress</div>
          </div>
          <div class="reference-item">
            <div class="ref-range" style="color: #dc2626">40+</div>
            <div class="ref-label">EXTREME</div>
            <div class="ref-desc">Panic, extreme volatility</div>
          </div>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { NCard, NButton, NSpin, NGrid, NGridItem, NDivider } from 'naive-ui'

definePageMeta({
  layout: 'stocks'
})

// State
const isLoading = ref(false)
const currentVix = ref(0)
const lastUpdate = ref('')
const riskLevel = ref('UNKNOWN')
const marketCondition = ref('')
const marketConditionDetail = ref('')
const gridSpacing = ref('')
const positionSize = ref('')
const stopLoss = ref('')
const botActions = ref([])
const historicalData = ref([])

// Fetch VIX data from API
const fetchVixData = async () => {
  isLoading.value = true
  try {
    const response = await fetch('/api/v1/StocksMarkets/fetchVIX?source=both&limit=30')
    const data = await response.json()

    if (data.success) {
      currentVix.value = data.vix.current
      lastUpdate.value = new Date(data.vix.date).toLocaleString('ro-RO', {
        timeZone: 'Europe/Bucharest',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })

      // Recommendations
      riskLevel.value = data.recommendations.riskLevel
      marketCondition.value = data.recommendations.marketCondition
      marketConditionDetail.value = data.recommendations.marketConditionDetail || ''
      gridSpacing.value = data.recommendations.gridBotSettings.gridSpacing
      positionSize.value = data.recommendations.gridBotSettings.positionSize
      stopLoss.value = data.recommendations.gridBotSettings.stopLoss
      botActions.value = data.recommendations.botActions

      // Historical data
      if (data.vix.historical && data.vix.historical.length > 0) {
        historicalData.value = data.vix.historical.map((item, index, arr) => {
          const change = index < arr.length - 1
            ? ((item.value - arr[index + 1].value) / arr[index + 1].value * 100).toFixed(2)
            : 0
          return {
            ...item,
            change: parseFloat(change)
          }
        })
      }
    }
  } catch (error) {
    console.error('Error fetching VIX data:', error)
  } finally {
    isLoading.value = false
  }
}

// Helper functions
const getVixColor = (vix) => {
  if (vix < 12) return '#10b981'
  if (vix < 20) return '#3b82f6'
  if (vix < 30) return '#f59e0b'
  if (vix < 40) return '#ef4444'
  return '#dc2626'
}

const getVixLevel = (vix) => {
  if (vix < 12) return 'LOW'
  if (vix < 20) return 'NORMAL'
  if (vix < 30) return 'HIGH'
  if (vix < 40) return 'CRITICAL'
  return 'EXTREME'
}

const getVixDescription = (vix) => {
  if (vix < 12) return 'Calm market conditions with low volatility'
  if (vix < 20) return 'Normal market volatility - Standard trading conditions'
  if (vix < 30) return 'Elevated volatility - Increased market uncertainty'
  if (vix < 40) return 'High market stress - Significant volatility expected'
  return 'Extreme volatility - Market panic conditions'
}

const getRiskColor = (level) => {
  const colors = {
    'LOW': '#10b981',
    'NORMAL': '#3b82f6',
    'MEDIUM': '#3b82f6',
    'HIGH': '#f59e0b',
    'CRITICAL': '#ef4444',
    'EXTREME': '#dc2626'
  }
  return colors[level] || '#94a3b8'
}

const getRiskAdvice = (level) => {
  const advice = {
    'LOW': 'Safe for aggressive trading strategies',
    'NORMAL': 'Standard risk management recommended',
    'MEDIUM': 'Standard risk management recommended',
    'HIGH': 'Reduce position sizes, widen stops',
    'CRITICAL': 'Consider pausing automated strategies',
    'EXTREME': 'PAUSE all bots - Wait for stabilization'
  }
  return advice[level] || 'Monitor market conditions closely'
}

onMounted(() => {
  fetchVixData()
})
</script>

<style scoped>
.vix-container {
  width: 100%;
  height: 100%;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.content-wrapper {
  padding: 0;
}

.vix-display {
  text-align: center;
  padding: 40px 20px;
}

.vix-value {
  font-size: 72px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 16px;
}

.vix-label {
  font-size: 24px;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 8px;
}

.vix-description {
  font-size: 16px;
  color: #94a3b8;
}

.risk-indicator {
  text-align: center;
  padding: 30px 20px;
}

.risk-badge {
  display: inline-block;
  padding: 12px 32px;
  font-size: 24px;
  font-weight: bold;
  border-radius: 8px;
  margin-bottom: 16px;
}

.risk-advice {
  font-size: 14px;
  color: #94a3b8;
  margin-top: 12px;
}

.market-condition {
  text-align: center;
  padding: 30px 20px;
}

.condition-text {
  font-size: 20px;
  font-weight: 600;
  color: #00dc82;
  margin-bottom: 12px;
}

.condition-detail {
  font-size: 14px;
  color: #94a3b8;
}

.bot-setting {
  text-align: center;
  padding: 20px;
  background: rgba(0, 220, 130, 0.05);
  border-radius: 8px;
}

.setting-label {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.setting-value {
  font-size: 20px;
  font-weight: bold;
  color: #00dc82;
}

.bot-actions {
  margin-top: 16px;
}

.bot-actions ul {
  margin: 0;
  padding-left: 24px;
}

.chart-container {
  min-height: 200px;
}

.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
  font-size: 16px;
}

.data-table {
  overflow-x: auto;
}

.data-table table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 12px;
  background: rgba(0, 220, 130, 0.1);
  color: #00dc82;
  font-weight: 600;
  font-size: 14px;
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
}

.data-table tr:hover {
  background: rgba(0, 220, 130, 0.05);
}

.reference-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}

.reference-item {
  text-align: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.ref-range {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.ref-label {
  font-size: 14px;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 4px;
}

.ref-desc {
  font-size: 12px;
  color: #94a3b8;
}

:deep(.n-card) {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.n-card__content) {
  padding: 20px;
}

:deep(.n-card-header__main) {
  color: #00dc82;
  font-weight: 600;
  font-size: 18px;
}
</style>
