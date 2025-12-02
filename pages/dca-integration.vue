<template>
  <div class="dca-integration-page">
    <div class="page-header">
      <h1>📊 DCA Integration</h1>
      <p class="subtitle">Dollar Cost Averaging, Grid Trading & Arbitrage Tools</p>
    </div>

    <!-- DCA + Grid Bot Creation Form -->
      <div class="form-section">
        <div class="section-card">
          <div class="card-header">
            <h2>🤖 Create DCA + Grid Bot</h2>
            <n-tag type="success">Hybrid Strategy</n-tag>
          </div>

          <div class="form-content">
            <!-- Strategy Type Selection -->
            <div class="form-group">
              <label>Strategy Type</label>
              <n-radio-group v-model:value="formData.strategyType">
                <n-radio-button value="dca-buy-grid-sell">
                  <span class="strategy-label">
                    📈 DCA Buy + Grid Sell
                    <small>Regular buys + profit taking</small>
                  </span>
                </n-radio-button>
                <n-radio-button value="grid-buy-dca-sell">
                  <span class="strategy-label">
                    📉 Grid Buy + DCA Sell
                    <small>Accumulate dips + regular sells</small>
                  </span>
                </n-radio-button>
              </n-radio-group>
            </div>

            <!-- Trading Pair -->
            <div class="form-group">
              <label>Trading Pair</label>
              <n-select
                v-model:value="formData.symbol"
                :options="symbolOptions"
                placeholder="Select trading pair"
                filterable
              />
            </div>

            <!-- DCA Configuration -->
            <div class="config-section">
              <h3>💰 DCA Configuration</h3>
              <div class="form-row">
                <div class="form-group">
                  <label>DCA Amount (per interval)</label>
                  <n-input-number
                    v-model:value="formData.dcaAmount"
                    :min="10"
                    :step="10"
                    placeholder="100"
                  >
                    <template #suffix>USDC</template>
                  </n-input-number>
                </div>

                <div class="form-group">
                  <label>DCA Interval</label>
                  <n-select
                    v-model:value="formData.dcaInterval"
                    :options="intervalOptions"
                    placeholder="Select interval"
                  />
                </div>

                <div class="form-group">
                  <label>Total Budget</label>
                  <n-input-number
                    v-model:value="formData.totalBudget"
                    :min="100"
                    :step="100"
                    placeholder="1000"
                  >
                    <template #suffix>USDC</template>
                  </n-input-number>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Start Date</label>
                  <n-date-picker
                    v-model:value="formData.startDate"
                    type="datetime"
                    placeholder="Select start date"
                    style="width: 100%"
                  />
                </div>

                <div class="form-group">
                  <label>Duration (optional)</label>
                  <n-select
                    v-model:value="formData.duration"
                    :options="durationOptions"
                    placeholder="Indefinite"
                    clearable
                  />
                </div>
              </div>
            </div>

            <!-- Grid Configuration -->
            <div class="config-section">
              <h3>📊 Grid Trading Configuration</h3>
              <div class="form-row">
                <div class="form-group">
                  <label>Lower Price</label>
                  <n-input-number
                    v-model:value="formData.lowerPrice"
                    :min="0.0001"
                    :step="0.001"
                    placeholder="0.030"
                  >
                    <template #suffix>USDC</template>
                  </n-input-number>
                </div>

                <div class="form-group">
                  <label>Upper Price</label>
                  <n-input-number
                    v-model:value="formData.upperPrice"
                    :min="0.0001"
                    :step="0.001"
                    placeholder="0.050"
                  >
                    <template #suffix>USDC</template>
                  </n-input-number>
                </div>

                <div class="form-group">
                  <label>Number of Grids</label>
                  <n-input-number
                    v-model:value="formData.nrOfGrids"
                    :min="3"
                    :max="100"
                    placeholder="20"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Grid Amount (per order)</label>
                  <n-input-number
                    v-model:value="formData.gridAmount"
                    :min="10"
                    :step="10"
                    placeholder="50"
                  >
                    <template #suffix>USDC</template>
                  </n-input-number>
                </div>

                <div class="form-group">
                  <label>Grid Side</label>
                  <n-select
                    v-model:value="formData.gridSide"
                    :options="gridSideOptions"
                    placeholder="Select side"
                  />
                </div>
              </div>
            </div>

            <!-- Advanced Options -->
            <div class="advanced-options">
              <n-collapse>
                <n-collapse-item title="⚙️ Advanced Options" name="advanced">
                  <div class="form-row">
                    <div class="form-group">
                      <label>
                        <n-checkbox v-model:checked="formData.autoAdjustGrid">
                          Auto-adjust grid based on market
                        </n-checkbox>
                      </label>
                    </div>

                    <div class="form-group">
                      <label>
                        <n-checkbox v-model:checked="formData.reinvestProfits">
                          Reinvest grid profits into DCA
                        </n-checkbox>
                      </label>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Stop Loss (%)</label>
                      <n-input-number
                        v-model:value="formData.stopLoss"
                        :min="0"
                        :max="50"
                        :step="1"
                        placeholder="Optional"
                      >
                        <template #suffix>%</template>
                      </n-input-number>
                    </div>

                    <div class="form-group">
                      <label>Take Profit (%)</label>
                      <n-input-number
                        v-model:value="formData.takeProfit"
                        :min="0"
                        :max="500"
                        :step="5"
                        placeholder="Optional"
                      >
                        <template #suffix>%</template>
                      </n-input-number>
                    </div>
                  </div>
                </n-collapse-item>
              </n-collapse>
            </div>

            <!-- Strategy Summary -->
            <div class="strategy-summary">
              <h4>📋 Strategy Summary</h4>
              <div class="summary-content">
                <div class="summary-item">
                  <span class="label">DCA:</span>
                  <span class="value">
                    ${{ formData.dcaAmount }} every {{ formatInterval(formData.dcaInterval) }}
                  </span>
                </div>
                <div class="summary-item">
                  <span class="label">Grid:</span>
                  <span class="value">
                    {{ formData.nrOfGrids }} levels between ${{ formData.lowerPrice }} - ${{ formData.upperPrice }}
                  </span>
                </div>
                <div class="summary-item">
                  <span class="label">Total Investment:</span>
                  <span class="value">
                    ${{ calculateTotalInvestment() }}
                  </span>
                </div>
                <div class="summary-item">
                  <span class="label">Estimated Duration:</span>
                  <span class="value">
                    {{ calculateDuration() }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="form-actions">
              <n-button @click="resetForm" quaternary>
                Reset
              </n-button>
              <n-button
                type="primary"
                @click="createDcaGridBot"
                :loading="isCreating"
                :disabled="!isFormValid"
              >
                🚀 Create DCA + Grid Bot
              </n-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Active DCA + Grid Bots -->
      <div class="bots-section">
        <div class="section-card">
          <div class="card-header">
            <h2>🤖 Active DCA + Grid Bots</h2>
            <n-button @click="refreshBots" size="small">
              🔄 Refresh
            </n-button>
          </div>

          <div class="bots-list">
            <div
              v-for="bot in dcaGridBots"
              :key="bot._id"
              class="bot-card"
            >
              <div class="bot-header">
                <h3>{{ bot.name }}</h3>
                <n-tag :type="bot.status === 'active' ? 'success' : 'default'">
                  {{ bot.status }}
                </n-tag>
              </div>

              <div class="bot-info">
                <div class="info-row">
                  <span class="label">Symbol:</span>
                  <span class="value">{{ bot.symbol }}</span>
                </div>
                <div class="info-row">
                  <span class="label">DCA Amount:</span>
                  <span class="value">${{ bot.dcaAmount }} / {{ formatInterval(bot.dcaInterval) }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Grid Range:</span>
                  <span class="value">${{ bot.lowerPrice }} - ${{ bot.upperPrice }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Total Invested:</span>
                  <span class="value">${{ bot.totalInvested || 0 }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Current Profit:</span>
                  <span :class="['value', bot.profit >= 0 ? 'positive' : 'negative']">
                    ${{ bot.profit || 0 }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="label">Next DCA:</span>
                  <span class="value">{{ formatNextDca(bot.nextDcaDate) }}</span>
                </div>
              </div>

              <div class="bot-actions">
                <n-button size="small" @click="viewBotDetails(bot)">
                  📊 Details
                </n-button>
                <n-button size="small" @click="pauseBot(bot)" v-if="bot.status === 'active'">
                  ⏸️ Pause
                </n-button>
                <n-button size="small" @click="resumeBot(bot)" v-else>
                  ▶️ Resume
                </n-button>
                <n-button size="small" type="error" @click="stopBot(bot)">
                  🛑 Stop
                </n-button>
              </div>
            </div>

            <div v-if="dcaGridBots.length === 0" class="empty-state">
              <p>No active DCA + Grid bots</p>
              <p class="hint">Create your first hybrid bot to start accumulating!</p>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMessage, NSelect, NInputNumber, NDatePicker, NRadioGroup, NRadioButton, NButton, NTag, NCollapse, NCollapseItem, NCheckbox } from 'naive-ui'
import { useAppStore } from '~/stores/app.store'

definePageMeta({
  middleware: 'auth'
})

const app = useAppStore()
const message = useMessage()
let userID = useCookie('userID')
const isCreating = ref(false)
const dcaGridBots = ref([])

const formData = ref({
  strategyType: 'dca-buy-grid-sell',
  symbol: 'LCX/USDC',
  dcaAmount: 100,
  dcaInterval: 'daily',
  totalBudget: 1000,
  startDate: Date.now(),
  duration: null,
  lowerPrice: 0.030,
  upperPrice: 0.050,
  nrOfGrids: 20,
  gridAmount: 50,
  gridSide: 'sell',
  autoAdjustGrid: false,
  reinvestProfits: true,
  stopLoss: null,
  takeProfit: null
})

const symbolOptions = [
  { label: 'LCX/USDC', value: 'LCX/USDC' },
  { label: 'BTC/USDC', value: 'BTC/USDC' },
  { label: 'ETH/USDC', value: 'ETH/USDC' },
  { label: 'SOL/USDC', value: 'SOL/USDC' },
  { label: 'MATIC/USDC', value: 'MATIC/USDC' }
]

const intervalOptions = [
  { label: 'Every Hour', value: 'hourly' },
  { label: 'Every 4 Hours', value: '4hours' },
  { label: 'Every 12 Hours', value: '12hours' },
  { label: 'Daily', value: 'daily' },
  { label: 'Every 3 Days', value: '3days' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Bi-Weekly', value: 'biweekly' },
  { label: 'Monthly', value: 'monthly' }
]

const durationOptions = [
  { label: '1 Month', value: '1month' },
  { label: '3 Months', value: '3months' },
  { label: '6 Months', value: '6months' },
  { label: '1 Year', value: '1year' },
  { label: '2 Years', value: '2years' }
]

const gridSideOptions = [
  { label: 'Sell (Take Profits)', value: 'sell' },
  { label: 'Buy (Accumulate Dips)', value: 'buy' },
  { label: 'Both (Balanced)', value: 'both' }
]

const isFormValid = computed(() => {
  return formData.value.symbol &&
         formData.value.dcaAmount > 0 &&
         formData.value.totalBudget > 0 &&
         formData.value.lowerPrice > 0 &&
         formData.value.upperPrice > formData.value.lowerPrice &&
         formData.value.nrOfGrids >= 3 &&
         formData.value.gridAmount > 0
})

const formatInterval = (interval) => {
  const map = {
    'hourly': 'hour',
    '4hours': '4 hours',
    '12hours': '12 hours',
    'daily': 'day',
    '3days': '3 days',
    'weekly': 'week',
    'biweekly': '2 weeks',
    'monthly': 'month'
  }
  return map[interval] || interval
}

const calculateTotalInvestment = () => {
  const dcaTotal = formData.value.totalBudget || 0
  const gridTotal = formData.value.gridAmount * formData.value.nrOfGrids || 0
  return (dcaTotal + gridTotal).toFixed(2)
}

const calculateDuration = () => {
  if (formData.value.duration) {
    return formData.value.duration.replace(/(\d+)(\w+)/, '$1 $2')
  }

  const intervalHours = {
    'hourly': 1,
    '4hours': 4,
    '12hours': 12,
    'daily': 24,
    '3days': 72,
    'weekly': 168,
    'biweekly': 336,
    'monthly': 720
  }

  const hours = intervalHours[formData.value.dcaInterval] || 24
  const totalBuys = Math.floor(formData.value.totalBudget / formData.value.dcaAmount)
  const totalHours = totalBuys * hours

  if (totalHours < 48) {
    return `${totalHours} hours`
  } else if (totalHours < 720) {
    return `${Math.ceil(totalHours / 24)} days`
  } else {
    return `${Math.ceil(totalHours / 720)} months`
  }
}

const formatNextDca = (date) => {
  if (!date) return 'Not scheduled'
  const nextDate = new Date(date)
  const now = new Date()
  const diffMs = nextDate - now
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `in ${diffMins} minutes`
  if (diffHours < 24) return `in ${diffHours} hours`
  return `in ${diffDays} days`
}

const createDcaGridBot = async () => {
  if (!isFormValid.value) {
    message.error('Please fill in all required fields')
    return
  }

  isCreating.value = true

  try {
    const result = await $fetch('/api/v1/createDcaGridBot', {
      method: 'POST',
      body: {
        userID: userID.value,
        ...formData.value,
        exchange: 'coinbaseadvanced',
        apiKeyNames: app.selectedApiKeys || []
      }
    })

    if (result.success) {
      message.success('✅ DCA + Grid Bot created successfully!', { duration: 5000 })
      await refreshBots()
      resetForm()
    } else {
      message.error(`Failed to create bot: ${result.message}`)
    }
  } catch (error) {
    console.error('Error creating DCA + Grid bot:', error)
    message.error('Error creating bot: ' + error.message)
  } finally {
    isCreating.value = false
  }
}

const resetForm = () => {
  formData.value = {
    strategyType: 'dca-buy-grid-sell',
    symbol: 'LCX/USDC',
    dcaAmount: 100,
    dcaInterval: 'daily',
    totalBudget: 1000,
    startDate: Date.now(),
    duration: null,
    lowerPrice: 0.030,
    upperPrice: 0.050,
    nrOfGrids: 20,
    gridAmount: 50,
    gridSide: 'sell',
    autoAdjustGrid: false,
    reinvestProfits: true,
    stopLoss: null,
    takeProfit: null
  }
}

const refreshBots = async () => {
  try {
    const result = await $fetch('/api/v1/fetchDcaGridBots', {
      method: 'POST',
      body: { userID: userID.value }
    })

    if (result.success && result.data) {
      dcaGridBots.value = result.data
    }
  } catch (error) {
    console.error('Error fetching DCA + Grid bots:', error)
  }
}

const viewBotDetails = (bot) => {
  message.info(`Viewing details for ${bot.name}`)
  // TODO: Open detailed modal
}

const pauseBot = async (bot) => {
  try {
    const result = await $fetch('/api/v1/updateDcaGridBot', {
      method: 'POST',
      body: {
        botId: bot._id,
        userID: userID.value,
        status: 'paused'
      }
    })

    if (result.success) {
      message.success('Bot paused')
      await refreshBots()
    }
  } catch (error) {
    message.error('Error pausing bot')
  }
}

const resumeBot = async (bot) => {
  try {
    const result = await $fetch('/api/v1/updateDcaGridBot', {
      method: 'POST',
      body: {
        botId: bot._id,
        userID: userID.value,
        status: 'active'
      }
    })

    if (result.success) {
      message.success('Bot resumed')
      await refreshBots()
    }
  } catch (error) {
    message.error('Error resuming bot')
  }
}

const stopBot = async (bot) => {
  try {
    const result = await $fetch('/api/v1/stopDcaGridBot', {
      method: 'POST',
      body: {
        botId: bot._id,
        userID: userID.value
      }
    })

    if (result.success) {
      message.success('Bot stopped')
      await refreshBots()
    }
  } catch (error) {
    message.error('Error stopping bot')
  }
}

onMounted(async () => {
  await app.loadUserExchangeData(userID.value)
  await refreshBots()
})
</script>

<style scoped>
.dca-integration-page {
  padding: 16px;
  width: 100%;
  min-height: 100vh;
  background: #0f1419;
  color: #fff;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #fff;
}

.subtitle {
  font-size: 14px;
  color: #888;
  margin: 0;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 500px 1fr;
  gap: 16px;
}

.section-card {
  background: rgba(20, 25, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #fff;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #ddd;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.strategy-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
}

.strategy-label small {
  font-size: 11px;
  opacity: 0.7;
}

.config-section {
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  padding: 16px;
}

.config-section h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #667eea;
}

.advanced-options {
  margin-top: 8px;
}

.strategy-summary {
  background: rgba(24, 160, 88, 0.1);
  border: 1px solid rgba(24, 160, 88, 0.3);
  border-radius: 8px;
  padding: 16px;
}

.strategy-summary h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #18a058;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.summary-item .label {
  color: #888;
}

.summary-item .value {
  font-weight: 600;
  color: #fff;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

.bots-section {
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.bots-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bot-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
}

.bot-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(102, 126, 234, 0.3);
}

.bot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.bot-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #fff;
}

.bot-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.info-row .label {
  color: #888;
}

.info-row .value {
  font-weight: 600;
  color: #fff;
}

.info-row .value.positive {
  color: #18a058;
}

.info-row .value.negative {
  color: #d03050;
}

.bot-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-state p {
  margin: 8px 0;
}

.empty-state .hint {
  font-size: 13px;
  color: #888;
}

/* Scrollbar */
.bots-section::-webkit-scrollbar {
  width: 6px;
}

.bots-section::-webkit-scrollbar-thumb {
  background-color: rgba(128, 128, 128, 0.3);
  border-radius: 3px;
}

/* Responsive */
@media (max-width: 1200px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
}
</style>
