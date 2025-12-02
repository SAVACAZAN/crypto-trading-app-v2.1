<template>
  <div class="market-indices-container">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <n-spin size="large" />
      <p style="margin-top: 20px; color: #94a3b8">Loading market indices data...</p>
      <p style="color: #64748b; font-size: 14px">This may take up to 60 seconds...</p>
    </div>

    <!-- Main Content -->
    <div v-else class="content-wrapper">
      <!-- Market Sentiment Overview -->
      <n-card
        title="Overall Market Sentiment"
        :bordered="false"
        style="margin-bottom: 24px"
        :segmented="{
          content: true,
          footer: 'soft'
        }"
      >
        <div class="sentiment-display">
          <div
            class="sentiment-badge"
            :style="{
              background: getSentimentColor(sentiment),
              boxShadow: `0 0 20px ${getSentimentColor(sentiment)}`
            }"
          >
            {{ sentiment }}
          </div>
          <div class="sentiment-description">
            {{ sentimentDescription }}
          </div>
          <div class="sentiment-stats">
            <div class="stat-item">
              <span class="stat-label">Average Change:</span>
              <span
                class="stat-value"
                :style="{ color: averageChange >= 0 ? '#10b981' : '#ef4444' }"
              >
                {{ averageChange >= 0 ? '+' : '' }}{{ averageChange }}%
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Positive Indices:</span>
              <span class="stat-value" style="color: #10b981">{{ positiveCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Negative Indices:</span>
              <span class="stat-value" style="color: #ef4444">{{ negativeCount }}</span>
            </div>
          </div>
        </div>

        <template #footer>
          <div style="display: flex; justify-content: space-between; align-items: center">
            <span style="color: #94a3b8">Last Updated: {{ lastUpdate }}</span>
            <n-button @click="fetchMarketData" :loading="isLoading" type="primary">
              Refresh Data
            </n-button>
          </div>
        </template>
      </n-card>

      <!-- Major Indices Grid -->
      <n-grid :cols="2" :x-gap="24" :y-gap="24" style="margin-bottom: 24px">
        <!-- S&P 500 -->
        <n-grid-item>
          <n-card
            :bordered="false"
            :segmented="{ content: true }"
          >
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center">
                <span style="color: #3b82f6; font-weight: 600; font-size: 18px">📊 S&P 500</span>
                <span style="color: #94a3b8; font-size: 14px">SPY</span>
              </div>
            </template>
            <div class="index-card">
              <div class="index-price">${{ sp500Price }}</div>
              <div
                class="index-change"
                :style="{ color: sp500Change >= 0 ? '#10b981' : '#ef4444' }"
              >
                {{ sp500Change >= 0 ? '▲' : '▼' }} {{ sp500Change >= 0 ? '+' : '' }}{{ sp500Change }}%
              </div>
              <div class="index-detail">
                Volume: {{ sp500Volume }}
              </div>
            </div>
          </n-card>
        </n-grid-item>

        <!-- NASDAQ -->
        <n-grid-item>
          <n-card
            :bordered="false"
            :segmented="{ content: true }"
          >
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center">
                <span style="color: #8b5cf6; font-weight: 600; font-size: 18px">💻 NASDAQ</span>
                <span style="color: #94a3b8; font-size: 14px">QQQ</span>
              </div>
            </template>
            <div class="index-card">
              <div class="index-price">${{ nasdaqPrice }}</div>
              <div
                class="index-change"
                :style="{ color: nasdaqChange >= 0 ? '#10b981' : '#ef4444' }"
              >
                {{ nasdaqChange >= 0 ? '▲' : '▼' }} {{ nasdaqChange >= 0 ? '+' : '' }}{{ nasdaqChange }}%
              </div>
              <div class="index-detail">
                Volume: {{ nasdaqVolume }}
              </div>
            </div>
          </n-card>
        </n-grid-item>

        <!-- Dow Jones -->
        <n-grid-item>
          <n-card
            :bordered="false"
            :segmented="{ content: true }"
          >
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center">
                <span style="color: #10b981; font-weight: 600; font-size: 18px">🏭 Dow Jones</span>
                <span style="color: #94a3b8; font-size: 14px">DIA</span>
              </div>
            </template>
            <div class="index-card">
              <div class="index-price">${{ dowPrice }}</div>
              <div
                class="index-change"
                :style="{ color: dowChange >= 0 ? '#10b981' : '#ef4444' }"
              >
                {{ dowChange >= 0 ? '▲' : '▼' }} {{ dowChange >= 0 ? '+' : '' }}{{ dowChange }}%
              </div>
              <div class="index-detail">
                Volume: {{ dowVolume }}
              </div>
            </div>
          </n-card>
        </n-grid-item>

        <!-- Russell 2000 -->
        <n-grid-item>
          <n-card
            :bordered="false"
            :segmented="{ content: true }"
          >
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center">
                <span style="color: #f59e0b; font-weight: 600; font-size: 18px">🏢 Russell 2000</span>
                <span style="color: #94a3b8; font-size: 14px">IWM</span>
              </div>
            </template>
            <div class="index-card">
              <div class="index-price">${{ russellPrice }}</div>
              <div
                class="index-change"
                :style="{ color: russellChange >= 0 ? '#10b981' : '#ef4444' }"
              >
                {{ russellChange >= 0 ? '▲' : '▼' }} {{ russellChange >= 0 ? '+' : '' }}{{ russellChange }}%
              </div>
              <div class="index-detail">
                Volume: {{ russellVolume }}
              </div>
            </div>
          </n-card>
        </n-grid-item>
      </n-grid>

      <!-- Bot Recommendations -->
      <n-card
        title="Trading Bot Recommendations"
        :bordered="false"
        style="margin-bottom: 24px"
        :segmented="{ content: true }"
      >
        <div class="bot-recommendations">
          <div class="recommendation-section">
            <h4 style="color: #00dc82; margin-bottom: 12px">📋 Recommended Actions:</h4>
            <ul style="color: #cbd5e1; line-height: 1.8">
              <li v-for="(action, index) in botActions" :key="index">{{ action }}</li>
            </ul>
          </div>

          <n-divider />

          <div class="recommendation-section">
            <h4 style="color: #00dc82; margin-bottom: 12px">🔗 Crypto Correlation:</h4>
            <p style="color: #cbd5e1; line-height: 1.8">{{ cryptoCorrelation }}</p>
          </div>
        </div>
      </n-card>

      <!-- Market Analysis -->
      <n-card
        title="Market Analysis"
        :bordered="false"
        :segmented="{ content: true }"
      >
        <n-grid :cols="3" :x-gap="24">
          <n-grid-item>
            <div class="analysis-item">
              <div class="analysis-label">Market Trend</div>
              <div class="analysis-value" :style="{ color: getTrendColor() }">
                {{ marketTrend }}
              </div>
            </div>
          </n-grid-item>
          <n-grid-item>
            <div class="analysis-item">
              <div class="analysis-label">Risk Appetite</div>
              <div class="analysis-value">{{ riskAppetite }}</div>
            </div>
          </n-grid-item>
          <n-grid-item>
            <div class="analysis-item">
              <div class="analysis-label">Trading Strategy</div>
              <div class="analysis-value">{{ tradingStrategy }}</div>
            </div>
          </n-grid-item>
        </n-grid>
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
const lastUpdate = ref('')

// Sentiment
const sentiment = ref('NEUTRAL')
const sentimentDescription = ref('')
const averageChange = ref(0)
const positiveCount = ref(0)
const negativeCount = ref(0)

// Indices data
const sp500Price = ref('0.00')
const sp500Change = ref(0)
const sp500Volume = ref('0')

const nasdaqPrice = ref('0.00')
const nasdaqChange = ref(0)
const nasdaqVolume = ref('0')

const dowPrice = ref('0.00')
const dowChange = ref(0)
const dowVolume = ref('0')

const russellPrice = ref('0.00')
const russellChange = ref(0)
const russellVolume = ref('0')

// Recommendations
const botActions = ref([])
const cryptoCorrelation = ref('')
const marketTrend = ref('UNKNOWN')
const riskAppetite = ref('UNKNOWN')
const tradingStrategy = ref('UNKNOWN')

// Fetch market data
const fetchMarketData = async () => {
  isLoading.value = true
  try {
    // Fetch all indices (takes ~52 seconds for all 4)
    const response = await fetch('/api/v1/StocksMarkets/fetchMarketIndices?indices=all')
    const data = await response.json()

    if (data.success) {
      // Update summary
      sentiment.value = data.summary.sentiment
      sentimentDescription.value = data.summary.sentimentDescription
      averageChange.value = parseFloat(data.summary.averageChangePercent)
      positiveCount.value = data.summary.positiveIndices
      negativeCount.value = data.summary.negativeIndices

      // Update indices
      if (data.indices.sp500) {
        sp500Price.value = data.indices.sp500.price.replace('$', '')
        sp500Change.value = parseFloat(data.indices.sp500.changePercent)
        sp500Volume.value = data.indices.sp500.volume
      }

      if (data.indices.nasdaq) {
        nasdaqPrice.value = data.indices.nasdaq.price.replace('$', '')
        nasdaqChange.value = parseFloat(data.indices.nasdaq.changePercent)
        nasdaqVolume.value = data.indices.nasdaq.volume
      }

      if (data.indices.dow) {
        dowPrice.value = data.indices.dow.price.replace('$', '')
        dowChange.value = parseFloat(data.indices.dow.changePercent)
        dowVolume.value = data.indices.dow.volume
      }

      if (data.indices.russell) {
        russellPrice.value = data.indices.russell.price.replace('$', '')
        russellChange.value = parseFloat(data.indices.russell.changePercent)
        russellVolume.value = data.indices.russell.volume
      }

      // Recommendations
      if (data.summary.botRecommendations) {
        botActions.value = data.summary.botRecommendations.actions || []
        cryptoCorrelation.value = data.summary.botRecommendations.correlationNote || ''
      }

      // Market analysis
      if (averageChange.value > 1) {
        marketTrend.value = 'STRONG BULLISH'
        riskAppetite.value = 'HIGH'
        tradingStrategy.value = 'LONG POSITIONS'
      } else if (averageChange.value > 0) {
        marketTrend.value = 'BULLISH'
        riskAppetite.value = 'MODERATE'
        tradingStrategy.value = 'BALANCED'
      } else if (averageChange.value > -1) {
        marketTrend.value = 'BEARISH'
        riskAppetite.value = 'LOW'
        tradingStrategy.value = 'DEFENSIVE'
      } else {
        marketTrend.value = 'STRONG BEARISH'
        riskAppetite.value = 'VERY LOW'
        tradingStrategy.value = 'CASH/HEDGED'
      }

      lastUpdate.value = new Date().toLocaleString('ro-RO', {
        timeZone: 'Europe/Bucharest',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  } catch (error) {
    console.error('Error fetching market data:', error)
  } finally {
    isLoading.value = false
  }
}

// Helper functions
const getSentimentColor = (sentiment) => {
  if (sentiment === 'BULLISH') return '#10b981'
  if (sentiment === 'BEARISH') return '#ef4444'
  return '#3b82f6'
}

const getTrendColor = () => {
  if (marketTrend.value.includes('BULLISH')) return '#10b981'
  if (marketTrend.value.includes('BEARISH')) return '#ef4444'
  return '#94a3b8'
}

onMounted(() => {
  fetchMarketData()
})
</script>

<style scoped>
.market-indices-container {
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

.sentiment-display {
  text-align: center;
  padding: 30px 20px;
}

.sentiment-badge {
  display: inline-block;
  padding: 12px 40px;
  font-size: 28px;
  font-weight: bold;
  border-radius: 8px;
  margin-bottom: 16px;
  text-transform: uppercase;
}

.sentiment-description {
  font-size: 16px;
  color: #94a3b8;
  margin-bottom: 24px;
}

.sentiment-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  font-size: 12px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.index-card {
  text-align: center;
  padding: 20px;
}

.index-price {
  font-size: 36px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 8px;
}

.index-change {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
}

.index-detail {
  font-size: 14px;
  color: #94a3b8;
}

.bot-recommendations {
  padding: 10px 0;
}

.recommendation-section {
  margin-bottom: 20px;
}

.recommendation-section:last-child {
  margin-bottom: 0;
}

.recommendation-section ul {
  margin: 0;
  padding-left: 24px;
}

.analysis-item {
  text-align: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.analysis-label {
  font-size: 12px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.analysis-value {
  font-size: 18px;
  font-weight: bold;
  color: #00dc82;
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
