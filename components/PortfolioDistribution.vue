<template>
  <div class="portfolio-distribution">
    <div class="distribution-header">
      <h2>Portfolio Distribution</h2>
      <n-button type="primary" @click="saveCurrentDistribution" :loading="isSaving">
        Save Today's Snapshot
      </n-button>
    </div>

    <!-- Current Distribution -->
    <div class="current-distribution">
      <h3>Current Distribution</h3>
      <div class="distribution-cards">
        <n-card class="dist-card stablecoins">
          <div class="card-header">
            <n-icon size="32" color="#10b981">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                <path d="M12.5 7h-2v5H7v2h3.5v2h2v-2H16v-2h-3.5z"/>
              </svg>
            </n-icon>
            <span class="card-title">Stablecoins</span>
          </div>
          <div class="card-value">${{ currentStablecoins.toLocaleString() }}</div>
          <div class="card-percentage">{{ currentStablecoinsPercent.toFixed(2) }}%</div>
          <div class="breakdown">
            <div v-for="(value, coin) in currentStableBreakdown" :key="coin" class="breakdown-item">
              <span>{{ coin }}</span>
              <span>${{ value.toLocaleString() }}</span>
            </div>
          </div>
        </n-card>

        <n-card class="dist-card crypto">
          <div class="card-header">
            <n-icon size="32" color="#f59e0b">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </n-icon>
            <span class="card-title">Cryptocurrencies</span>
          </div>
          <div class="card-value">${{ currentCrypto.toLocaleString() }}</div>
          <div class="card-percentage">{{ currentCryptoPercent.toFixed(2) }}%</div>
          <div class="breakdown">
            <div v-for="(value, coin) in currentCryptoBreakdown" :key="coin" class="breakdown-item">
              <span>{{ coin }}</span>
              <span>${{ value.toLocaleString() }}</span>
            </div>
          </div>
        </n-card>

        <n-card class="dist-card total">
          <div class="card-header">
            <n-icon size="32" color="#8b5cf6">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
            </n-icon>
            <span class="card-title">Total Portfolio</span>
          </div>
          <div class="card-value">${{ currentTotal.toLocaleString() }}</div>
          <div class="card-percentage">100%</div>
        </n-card>
      </div>

      <!-- Pie Chart -->
      <n-card class="chart-card">
        <div ref="pieChartContainer" style="width: 100%; height: 300px;"></div>
      </n-card>
    </div>

    <!-- Historical Evolution -->
    <div class="historical-evolution">
      <h3>Evolution (Last {{ selectedDays }} Days)</h3>
      <n-select
        v-model:value="selectedDays"
        :options="daysOptions"
        style="width: 150px; margin-bottom: 16px;"
        @update:value="loadHistoricalData"
      />

      <n-card class="chart-card">
        <div ref="lineChartContainer" style="width: 100%; height: 400px;"></div>
      </n-card>

      <!-- Historical Data Table -->
      <n-card class="table-card">
        <n-data-table
          :columns="tableColumns"
          :data="historicalData"
          :pagination="{ pageSize: 10 }"
          :bordered="false"
        />
      </n-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { Chart } from 'chart.js/auto'

const message = useMessage()

// User info
const userID = ref(localStorage.getItem('userID') || '')

// Loading states
const isSaving = ref(false)
const isLoading = ref(false)

// Current distribution data
const currentStablecoins = ref(0)
const currentCrypto = ref(0)
const currentTotal = ref(0)
const currentStableBreakdown = ref({})
const currentCryptoBreakdown = ref({})

// Historical data
const selectedDays = ref(30)
const historicalData = ref([])

// Chart refs
const pieChartContainer = ref(null)
const lineChartContainer = ref(null)
let pieChart = null
let lineChart = null

// Computed
const currentStablecoinsPercent = computed(() => {
  return currentTotal.value > 0 ? (currentStablecoins.value / currentTotal.value) * 100 : 0
})

const currentCryptoPercent = computed(() => {
  return currentTotal.value > 0 ? (currentCrypto.value / currentTotal.value) * 100 : 0
})

// Days options
const daysOptions = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
  { label: '180 Days', value: 180 },
  { label: '365 Days', value: 365 }
]

// Table columns
const tableColumns = [
  {
    title: 'Date',
    key: 'date',
    render: (row) => new Date(row.date).toLocaleDateString()
  },
  {
    title: 'Total Portfolio',
    key: 'totalPortfolioUSD',
    render: (row) => '$' + row.totalPortfolioUSD.toLocaleString()
  },
  {
    title: 'Stablecoins',
    key: 'stablecoins',
    render: (row) => `$${row.stablecoins.totalUSD.toLocaleString()} (${row.stablecoins.percentage.toFixed(2)}%)`
  },
  {
    title: 'Crypto',
    key: 'crypto',
    render: (row) => `$${row.crypto.totalUSD.toLocaleString()} (${row.crypto.percentage.toFixed(2)}%)`
  }
]

// Calculate current distribution from balances
async function calculateCurrentDistribution() {
  try {
    const response = await $fetch('/api/v1/fetchBalance', {
      params: { userID: userID.value }
    })

    if (!response || !response.length) {
      return
    }

    const stablecoins = ['USDC', 'USDT', 'DAI', 'BUSD', 'TUSD', 'USDD', 'USDP', 'GUSD', 'EUR', 'EURS', 'EURT', 'EURC']
    let stableTotal = 0
    let cryptoTotal = 0
    let portfolioTotal = 0
    const stableBreakdown = {}
    const cryptoBreakdown = {}

    for (const bal of response) {
      portfolioTotal += bal.totalUSD || 0

      if (bal.balance && typeof bal.balance === 'object') {
        for (const [coin, data] of Object.entries(bal.balance)) {
          const coinUSD = data.usd || 0
          if (coinUSD > 0) {
            const coinSymbol = coin.toUpperCase()
            const isStablecoin = stablecoins.some(stable =>
              coinSymbol === stable ||
              coinSymbol.includes(stable) ||
              coinSymbol.startsWith('USD') ||
              coinSymbol.startsWith('EUR')
            )

            if (isStablecoin) {
              stableTotal += coinUSD
              stableBreakdown[coinSymbol] = (stableBreakdown[coinSymbol] || 0) + coinUSD
            } else {
              cryptoTotal += coinUSD
              cryptoBreakdown[coinSymbol] = (cryptoBreakdown[coinSymbol] || 0) + coinUSD
            }
          }
        }
      }
    }

    currentStablecoins.value = stableTotal
    currentCrypto.value = cryptoTotal
    currentTotal.value = portfolioTotal
    currentStableBreakdown.value = stableBreakdown
    currentCryptoBreakdown.value = cryptoBreakdown

    // Update pie chart
    updatePieChart()
  } catch (error) {
    console.error('Error calculating distribution:', error)
  }
}

// Save current distribution
async function saveCurrentDistribution() {
  isSaving.value = true
  try {
    const response = await $fetch('/api/v1/savePortfolioDistribution', {
      method: 'POST',
      body: { userID: userID.value }
    })

    if (response.success) {
      message.success('Portfolio distribution saved successfully!')
      await loadHistoricalData()
    } else {
      message.error(response.error || 'Failed to save distribution')
    }
  } catch (error) {
    console.error('Error saving distribution:', error)
    message.error('Error saving distribution')
  } finally {
    isSaving.value = false
  }
}

// Load historical data
async function loadHistoricalData() {
  isLoading.value = true
  try {
    const response = await $fetch('/api/v1/portfolioDistribution', {
      params: {
        userID: userID.value,
        days: selectedDays.value
      }
    })

    if (response.success) {
      historicalData.value = response.data
      updateLineChart()
    }
  } catch (error) {
    console.error('Error loading historical data:', error)
  } finally {
    isLoading.value = false
  }
}

// Update pie chart
function updatePieChart() {
  if (!pieChartContainer.value) return

  if (pieChart) {
    pieChart.destroy()
  }

  const ctx = pieChartContainer.value.getContext('2d')
  pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Stablecoins', 'Cryptocurrencies'],
      datasets: [{
        data: [currentStablecoins.value, currentCrypto.value],
        backgroundColor: ['#10b981', '#f59e0b'],
        borderWidth: 2,
        borderColor: '#1f2937'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#fff',
            font: { size: 14 }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const value = context.parsed || 0
              const percentage = ((value / currentTotal.value) * 100).toFixed(2)
              return `${label}: $${value.toLocaleString()} (${percentage}%)`
            }
          }
        }
      }
    }
  })
}

// Update line chart
function updateLineChart() {
  if (!lineChartContainer.value || !historicalData.value.length) return

  if (lineChart) {
    lineChart.destroy()
  }

  const ctx = lineChartContainer.value.getContext('2d')
  const dates = historicalData.value.map(d => new Date(d.date).toLocaleDateString())
  const stablePercentages = historicalData.value.map(d => d.stablecoins.percentage)
  const cryptoPercentages = historicalData.value.map(d => d.crypto.percentage)

  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'Stablecoins %',
          data: stablePercentages,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Crypto %',
          data: cryptoPercentages,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            color: '#9ca3af',
            callback: function(value) {
              return value + '%'
            }
          },
          grid: {
            color: 'rgba(156, 163, 175, 0.1)'
          }
        },
        x: {
          ticks: {
            color: '#9ca3af'
          },
          grid: {
            color: 'rgba(156, 163, 175, 0.1)'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: '#fff',
            font: { size: 14 }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`
            }
          }
        }
      }
    }
  })
}

onMounted(async () => {
  await calculateCurrentDistribution()
  await loadHistoricalData()
})
</script>

<style scoped>
.portfolio-distribution {
  padding: 20px;
  color: #fff;
}

.distribution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.distribution-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.current-distribution,
.historical-evolution {
  margin-bottom: 32px;
}

.current-distribution h3,
.historical-evolution h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.distribution-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.dist-card {
  background: rgba(31, 41, 55, 0.8);
  border-radius: 12px;
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #9ca3af;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.card-percentage {
  font-size: 18px;
  font-weight: 600;
  color: #10b981;
  margin-bottom: 16px;
}

.breakdown {
  max-height: 200px;
  overflow-y: auto;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  border-bottom: 1px solid rgba(156, 163, 175, 0.1);
}

.breakdown-item span:first-child {
  color: #9ca3af;
}

.breakdown-item span:last-child {
  color: #fff;
  font-weight: 600;
}

.chart-card,
.table-card {
  background: rgba(31, 41, 55, 0.8);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}
</style>
