<template>
  <div class="smart-dca-page">
    <!-- Header -->
    <div class="page-header">
      <h1>🎯 Smart DCA Bot</h1>
      <p>Automated Dollar Cost Averaging with RSI & MACD Indicators</p>
    </div>

    <!-- Main Content Layout -->
    <div class="content-layout">
      <!-- Left Panel: Bot Configuration -->
      <div class="config-panel">
        <n-card title="📊 DCA Configuration" size="small" :segmented="{ content: true }" style="font-size: 11px;">
          <n-space vertical :size="6">
            <!-- Bot Name -->
            <n-input
              v-model:value="botName"
              placeholder="Bot Name"
              size="small"
            >
              <template #prefix>🤖</template>
            </n-input>

            <!-- Buy/Sell Toggle -->
            <n-radio-group v-model:value="side" size="small">
              <n-radio-button value="buy" style="flex: 1;">
                <span style="color: #18a058;">🟢 Buy DCA</span>
              </n-radio-button>
              <n-radio-button value="sell" style="flex: 1;">
                <span style="color: #d03050;">🔴 Sell DCA</span>
              </n-radio-button>
            </n-radio-group>

            <!-- Amount per interval -->
            <n-input-number
              v-model:value="amountPerInterval"
              placeholder="Amount per interval"
              :min="0.001"
              :step="0.1"
              style="width: 100%;"
              size="small"
            >
              <template #prefix>💰</template>
              <template #suffix>{{ side === 'buy' ? quote : base }}</template>
            </n-input-number>

            <!-- DCA Interval -->
            <n-select
              v-model:value="dcaInterval"
              :options="intervalOptions"
              placeholder="DCA Interval"
              size="small"
            >
              <template #prefix>⏱️</template>
            </n-select>

            <!-- Total Duration (optional) -->
            <n-input-number
              v-model:value="totalDuration"
              placeholder="Total Duration (hours, 0 = infinite)"
              :min="0"
              :step="1"
              style="width: 100%;"
              size="small"
            >
              <template #prefix>⏳</template>
              <template #suffix>hours</template>
            </n-input-number>

            <!-- Display Selected API Keys -->
            <div v-if="app.getSelectedApiKeys.length > 0" style="margin-top: 8px;">
              <span style="font-size: 11px; color: #888; display: block; margin-bottom: 4px;">🔑 Agent:</span>
              <n-space :size="4">
                <n-tag
                  v-for="keyName in app.getSelectedApiKeys"
                  :key="keyName"
                  type="info"
                  size="small"
                  style="font-size: 10px;"
                >
                  {{ keyName }}
                </n-tag>
              </n-space>
            </div>
            <div v-else style="margin-top: 8px;">
              <n-tag type="warning" size="small" style="font-size: 10px;">
                ⚠️ No API keys selected
              </n-tag>
            </div>

            <n-divider style="margin: 4px 0; font-size: 10px;">Execution Mode</n-divider>

            <!-- Smart vs Scheduled -->
            <n-radio-group v-model:value="executionMode" size="small">
              <n-space vertical>
                <n-radio value="scheduled">
                  📅 Scheduled - Execute every interval
                </n-radio>
                <n-radio value="smart">
                  🧠 Smart - Execute only when conditions met
                </n-radio>
              </n-space>
            </n-radio-group>

            <!-- Action Buttons -->
            <n-space :size="6" style="margin-top: 8px;">
              <n-button
                type="primary"
                @click="createBot"
                :loading="creating"
                style="flex: 1; font-size: 11px; padding: 0 8px; height: 28px;"
                size="small"
              >
                ✅ Create Bot
              </n-button>
              <n-button
                @click="resetForm"
                style="flex: 1; font-size: 11px; padding: 0 8px; height: 28px;"
                size="small"
              >
                🔄 Reset
              </n-button>
            </n-space>
          </n-space>
        </n-card>
      </div>

      <!-- Middle Panel: All Bots List -->
      <div class="bots-panel">
        <n-card title="🤖 Smart DCA Bots" size="small">
          <div v-if="activeBots.length === 0" class="empty-state">
            <n-empty description="No bots found">
              <template #icon>
                <span style="font-size: 48px;">🤖</span>
              </template>
            </n-empty>
          </div>

          <n-space vertical :size="12" v-else>
            <div
              v-for="bot in activeBots"
              :key="bot._id"
              class="bot-card"
            >
              <div class="bot-header">
                <span class="bot-name">{{ bot.name }}</span>

                <!-- Compact Progress Indicators (20px) -->
                <div class="progress-inline-container" v-if="bot.status === 'active'">
                  <!-- Next Execution -->
                  <div class="progress-inline-item">
                    <div class="mini-circle" :style="{
                      background: `conic-gradient(
                        from 0deg,
                        #00d4ff 0%,
                        #00d4ff ${getNextExecutionPercent(bot)}%,
                        rgba(255, 255, 255, 0.08) ${getNextExecutionPercent(bot)}%,
                        rgba(255, 255, 255, 0.08) 100%
                      )`
                    }">
                      <div class="circle-center"></div>
                    </div>
                    <span class="progress-inline-text" style="color: #00d4ff;">⏱️ {{ getNextExecutionPercent(bot) }}%</span>
                  </div>

                  <!-- Bot Completion -->
                  <div class="progress-inline-item" v-if="bot.totalDuration > 0">
                    <div class="mini-circle" :style="{
                      background: `conic-gradient(
                        from 0deg,
                        #18a058 0%,
                        #18a058 ${getBotCompletionPercent(bot)}%,
                        rgba(255, 255, 255, 0.08) ${getBotCompletionPercent(bot)}%,
                        rgba(255, 255, 255, 0.08) 100%
                      )`
                    }">
                      <div class="circle-center"></div>
                    </div>
                    <span class="progress-inline-text" style="color: #18a058;">🎯 {{ getBotCompletionPercent(bot) }}%</span>
                  </div>
                </div>

                <n-tag
                  :type="bot.side === 'buy' ? 'success' : 'error'"
                  size="small"
                >
                  {{ bot.side === 'buy' ? '🟢 Buy' : '🔴 Sell' }}
                </n-tag>
              </div>

              <div class="bot-stats">
                <!-- Line 1 -->
                <div class="stat-item">
                  <span class="stat-label">Symbol:</span>
                  <span class="stat-value">{{ bot.symbol }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Exec:</span>
                  <span class="stat-value">{{ bot.executionCount || 0 }}/{{ getAnticipatedOrders(bot) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">{{ bot.side === 'buy' ? 'Spent:' : 'Received:' }}</span>
                  <span class="stat-value">${{ (bot.side === 'buy' ? bot.totalSpent : bot.totalReceived || 0).toFixed(2) }}</span>
                </div>
                <div class="stat-item" v-if="bot.totalDuration > 0">
                  <span class="stat-label">Duration:</span>
                  <span class="stat-value">{{ getElapsedTime(bot) }}/{{ bot.totalDuration }}h</span>
                </div>
                <div class="stat-item" v-else>
                  <span class="stat-label">Duration:</span>
                  <span class="stat-value">♾️</span>
                </div>

                <!-- Line 2 -->
                <div class="stat-item">
                  <span class="stat-label">Interval:</span>
                  <span class="stat-value">{{ bot.dcaInterval }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Amount:</span>
                  <span class="stat-value">{{ bot.amountPerInterval }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Avg:</span>
                  <span class="stat-value">{{ getAveragePrice(bot) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Next:</span>
                  <span class="stat-value">{{ formatNextRun(bot.nextRun) }}</span>
                </div>
              </div>

              <div class="bot-indicators" v-if="bot.enableRSI || bot.enableMACD">
                <n-tag
                  v-if="bot.enableRSI"
                  size="tiny"
                  type="info"
                >
                  RSI: {{ bot.rsiTimeframe }} ({{ bot.rsiOversold }}-{{ bot.rsiOverbought }})
                </n-tag>
                <n-tag
                  v-if="bot.enableMACD"
                  size="tiny"
                  type="info"
                >
                  MACD: {{ bot.macdTimeframe }}
                </n-tag>
                <n-tag
                  size="tiny"
                  :type="bot.executionMode === 'smart' ? 'success' : 'default'"
                >
                  {{ bot.executionMode === 'smart' ? '🧠 Smart' : '📅 Scheduled' }}
                </n-tag>
              </div>

              <div class="bot-actions">
                <n-tooltip v-if="bot.status === 'active'" trigger="hover">
                  <template #trigger>
                    <n-button
                      size="tiny"
                      @click="stopBot(bot._id)"
                      type="warning"
                      secondary
                    >
                      ⏸️
                    </n-button>
                  </template>
                  Stop Bot
                </n-tooltip>

                <n-tooltip v-if="bot.status === 'stopped'" trigger="hover">
                  <template #trigger>
                    <n-button
                      size="tiny"
                      @click="runBot(bot._id)"
                      type="success"
                      secondary
                    >
                      ▶️
                    </n-button>
                  </template>
                  Run Bot
                </n-tooltip>

                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-button
                      size="tiny"
                      @click="viewBotHistory(bot)"
                      type="info"
                      secondary
                    >
                      📊
                    </n-button>
                  </template>
                  View History
                </n-tooltip>

                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-button
                      size="tiny"
                      @click="deleteBot(bot._id)"
                      type="error"
                      secondary
                    >
                      🗑️
                    </n-button>
                  </template>
                  Delete Bot
                </n-tooltip>

                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-button
                      size="tiny"
                      @click="doubleBet(bot)"
                      type="warning"
                      secondary
                    >
                      2x
                    </n-button>
                  </template>
                  Double Bet
                </n-tooltip>

                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-button
                      size="tiny"
                      @click="addGrid(bot)"
                      type="primary"
                      secondary
                    >
                      ➕
                    </n-button>
                  </template>
                  Add Grid
                </n-tooltip>
              </div>
            </div>
          </n-space>
        </n-card>
      </div>

      <!-- Right Panel: RSI/MACD + Calculator -->
      <div class="indicators-panel">
        <!-- RSI/MACD Bar Component with Lazy Loading -->
        <div>
          <Suspense>
            <template #default>
              <RsiMacdBar />
            </template>
            <template #fallback>
              <n-card size="small" style="text-align: center; padding: 10px;">
                <n-spin size="small" />
                <div style="margin-top: 4px; font-size: 10px; color: #888;">Loading indicators...</div>
              </n-card>
            </template>
          </Suspense>
        </div>

        <!-- Anticipation Calculator -->
        <n-card title="📊 Anticipation Calculator" size="small" style="margin-top: 8px; font-size: 10px;">
          <div class="anticipation-grid">
            <div class="anticipation-box">
              <span class="anticipation-label">Total Orders:</span>
              <span class="anticipation-value">{{ anticipatedOrders }}</span>
            </div>
            <div class="anticipation-box">
              <span class="anticipation-label">Total {{ base }} ({{ side === 'buy' ? 'Buy' : 'Sell' }}):</span>
              <span class="anticipation-value">{{ anticipatedBase }} {{ base }}</span>
            </div>
            <div class="anticipation-box">
              <span class="anticipation-label">Total {{ quote }} {{ side === 'buy' ? 'Spent' : 'Received' }}:</span>
              <span class="anticipation-value">{{ anticipatedQuote }} {{ quote }}</span>
            </div>
            <div class="anticipation-box">
              <span class="anticipation-label">Estimated Avg Price:</span>
              <span class="anticipation-value">${{ anticipatedAvgPrice }}</span>
            </div>
            <div class="anticipation-box">
              <span class="anticipation-label">Duration:</span>
              <span class="anticipation-value">{{ anticipatedDuration }}</span>
            </div>
            <div class="anticipation-box">
              <span class="anticipation-label">Frequency:</span>
              <span class="anticipation-value">{{ dcaInterval }}</span>
            </div>
          </div>
          <n-divider style="margin: 6px 0;" />
          <div style="font-size: 9px; color: #888; text-align: center;">
            💡 Current price: ${{ currentPrice.toFixed(4) }}
          </div>
        </n-card>
      </div>
    </div>

    <!-- Bot History Modal with Tabs -->
    <n-modal
      v-model:show="showHistoryModal"
      preset="card"
      :title="`📊 ${selectedBot?.name} - Details`"
      style="width: 90%; max-width: 1200px;"
      size="huge"
    >
      <div v-if="selectedBot">
        <n-tabs type="line" animated>
          <!-- Tab 1: Statistics -->
          <n-tab-pane name="statistics" tab="📈 Statistics">
            <div class="stats-grid" style="margin-top: 16px;">
              <!-- General Stats -->
              <div class="stat-box">
                <span class="stat-label">Total Executions:</span>
                <span class="stat-value">{{ selectedBot.executionCount || 0 }}</span>
              </div>
              <div class="stat-box">
                <span class="stat-label">Started:</span>
                <span class="stat-value">{{ formatDate(selectedBot.startedAt) }}</span>
              </div>
              <div class="stat-box">
                <span class="stat-label">Status:</span>
                <span class="stat-value" :style="{ color: selectedBot.status === 'active' ? '#18a058' : '#d03050' }">
                  {{ selectedBot.status.toUpperCase() }}
                </span>
              </div>

              <!-- Price Stats -->
              <div class="stat-box">
                <span class="stat-label">Starting Price:</span>
                <span class="stat-value">${{ selectedBot.startingPrice ? selectedBot.startingPrice.toFixed(4) : 'N/A' }}</span>
              </div>
              <div class="stat-box">
                <span class="stat-label">Average Price:</span>
                <span class="stat-value">{{ getAveragePrice(selectedBot) }}</span>
              </div>
              <div class="stat-box">
                <span class="stat-label">Current Price:</span>
                <span class="stat-value">${{ currentPrice.toFixed(4) }}</span>
              </div>

              <!-- Base Currency Stats -->
              <div class="stat-box" style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 149, 255, 0.15));">
                <span class="stat-label">Total {{ base }} {{ selectedBot.side === 'buy' ? 'Bought' : 'Sold' }}:</span>
                <span class="stat-value" style="color: #00d4ff;">
                  {{ getTotalBase(selectedBot) }} {{ base }}
                </span>
              </div>

              <!-- Quote Currency Stats -->
              <div class="stat-box" style="background: linear-gradient(135deg, rgba(255, 212, 0, 0.15), rgba(255, 149, 0, 0.15));">
                <span class="stat-label">Total {{ quote }} {{ selectedBot.side === 'buy' ? 'Spent' : 'Received' }}:</span>
                <span class="stat-value" style="color: #ffd400;">
                  ${{ (selectedBot.side === 'buy' ? selectedBot.totalSpent : selectedBot.totalReceived || 0).toFixed(2) }} {{ quote }}
                </span>
              </div>

              <!-- Fees -->
              <div class="stat-box">
                <span class="stat-label">Total Fees:</span>
                <span class="stat-value">${{ (selectedBot.totalFees || 0).toFixed(4) }}</span>
              </div>

              <!-- P&L Calculation (if buy bot) -->
              <div class="stat-box" v-if="selectedBot.side === 'buy' && getTotalBase(selectedBot) > 0" style="background: linear-gradient(135deg, rgba(24, 160, 88, 0.15), rgba(15, 122, 66, 0.15));">
                <span class="stat-label">Current Portfolio Value:</span>
                <span class="stat-value" style="color: #18a058;">
                  ${{ (getTotalBase(selectedBot) * currentPrice).toFixed(2) }}
                </span>
              </div>
              <div class="stat-box" v-if="selectedBot.side === 'buy' && getTotalBase(selectedBot) > 0" style="background: linear-gradient(135deg, rgba(24, 160, 88, 0.15), rgba(15, 122, 66, 0.15));">
                <span class="stat-label">Unrealized P&L:</span>
                <span class="stat-value" :style="{ color: getPnL(selectedBot) >= 0 ? '#18a058' : '#d03050' }">
                  ${{ getPnL(selectedBot).toFixed(2) }} ({{ getPnLPercent(selectedBot) }}%)
                </span>
              </div>

              <!-- Duration -->
              <div class="stat-box" v-if="selectedBot.totalDuration > 0">
                <span class="stat-label">Duration Progress:</span>
                <span class="stat-value">{{ getElapsedTime(selectedBot) }} / {{ selectedBot.totalDuration }}h ({{ getBotCompletionPercent(selectedBot) }}%)</span>
              </div>
              <div class="stat-box" v-else>
                <span class="stat-label">Duration:</span>
                <span class="stat-value">♾️ Infinite</span>
              </div>
            </div>
          </n-tab-pane>

          <!-- Tab 2: Initial Conditions -->
          <n-tab-pane name="initial" tab="🎯 Initial Conditions" v-if="selectedBot.initialRSI || selectedBot.initialMACD">
            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
              <!-- Initial RSI Values -->
              <div v-if="selectedBot.initialRSI && Object.keys(selectedBot.initialRSI).length > 0">
                <div style="font-size: 12px; font-weight: 600; color: #0095ff; margin-bottom: 8px;">📊 Initial RSI Values:</div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  <n-tag
                    v-for="(value, timeframe) in selectedBot.initialRSI"
                    :key="timeframe"
                    size="small"
                    :type="value >= 70 ? 'warning' : value <= 30 ? 'info' : 'default'"
                  >
                    {{ timeframe }}: {{ value !== null ? value.toFixed(2) : 'N/A' }}
                  </n-tag>
                </div>
              </div>

              <!-- Initial MACD Values -->
              <div v-if="selectedBot.initialMACD && Object.keys(selectedBot.initialMACD).length > 0">
                <div style="font-size: 12px; font-weight: 600; color: #ff00ff; margin-bottom: 8px;">📈 Initial MACD Values:</div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  <n-tag
                    v-for="(value, timeframe) in selectedBot.initialMACD"
                    :key="timeframe"
                    size="small"
                    :type="value?.histogram > 0 ? 'success' : value?.histogram < 0 ? 'error' : 'default'"
                  >
                    {{ timeframe }}: {{ value?.histogram !== null && value?.histogram !== undefined ? value.histogram.toFixed(4) : 'N/A' }}
                  </n-tag>
                </div>
              </div>
            </div>
          </n-tab-pane>

          <!-- Tab 3: Execution History -->
          <n-tab-pane name="execution" tab="📜 Execution History">
            <n-data-table
              :columns="historyColumns"
              :data="selectedBot.executionHistory || []"
              :pagination="{ pageSize: 10 }"
              size="small"
              :scroll-x="1200"
              style="margin-top: 16px;"
            />
          </n-tab-pane>

          <!-- Tab 4: RSI History -->
          <n-tab-pane name="rsi" tab="📊 RSI History" v-if="selectedBot.rsiHistory && selectedBot.rsiHistory.length > 0">
            <div style="margin-top: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-size: 13px; font-weight: 600; color: #0095ff;">RSI History</span>
                <n-select
                  v-model:value="selectedRSITimeframe"
                  :options="availableRSITimeframes.map(tf => ({ label: tf.toUpperCase(), value: tf }))"
                  size="small"
                  style="width: 100px;"
                  placeholder="Timeframe"
                />
              </div>
              <div style="max-height: 300px; overflow-y: auto;">
                <n-empty v-if="filteredRSIHistory.length === 0" description="No RSI data for selected timeframe" />
                <div v-else>
                  <div v-for="(rsi, index) in filteredRSIHistory.slice(-20)" :key="index" style="font-size: 11px; padding: 4px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span style="color: #888;">{{ formatDate(rsi.timestamp) }}</span>:
                    <span style="font-weight: 600; color: #0095ff;">RSI = {{ rsi.value.toFixed(2) }}</span>
                    <span style="color: #ff00ff; margin-left: 8px;">({{ rsi.timeframe }})</span>
                  </div>
                </div>
              </div>
            </div>
          </n-tab-pane>

          <!-- Tab 5: MACD History -->
          <n-tab-pane name="macd" tab="📈 MACD History" v-if="selectedBot.macdHistory && selectedBot.macdHistory.length > 0">
            <div style="margin-top: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-size: 13px; font-weight: 600; color: #10eb04;">MACD History</span>
                <n-select
                  v-model:value="selectedMACDTimeframe"
                  :options="availableMACDTimeframes.map(tf => ({ label: tf.toUpperCase(), value: tf }))"
                  size="small"
                  style="width: 100px;"
                  placeholder="Timeframe"
                />
              </div>
              <div style="max-height: 300px; overflow-y: auto;">
                <n-empty v-if="filteredMACDHistory.length === 0" description="No MACD data for selected timeframe" />
                <div v-else>
                  <div v-for="(macd, index) in filteredMACDHistory.slice(-20)" :key="index" style="font-size: 11px; padding: 4px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span style="color: #888;">{{ formatDate(macd.timestamp) }}</span>:
                    <span style="font-weight: 600; color: #10eb04;">Histogram = {{ macd.histogram.toFixed(4) }}</span>
                    <span style="color: #ff00ff; margin-left: 8px;">({{ macd.timeframe }})</span>
                  </div>
                </div>
              </div>
            </div>
          </n-tab-pane>

        </n-tabs>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent, Suspense } from 'vue'
import { useMessage } from 'naive-ui'
import { useAppStore } from '~/stores/app.store'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

// Lazy load RSI/MACD bar component
const RsiMacdBar = defineAsyncComponent(() => import('~/components/rsi-macd-bar.vue'))

const app = useAppStore()
const message = useMessage()
const userID = useCookie('userID')

// Form state
const botName = ref(`SmartDCA_${Date.now()}`)
const side = ref('buy')
const amountPerInterval = ref(1)
const dcaInterval = ref('1m')
const totalDuration = ref(0)
const executionMode = ref('scheduled')

// Keep RSI/MACD settings for backend (will use existing bars)
const enableRSI = ref(false)
const rsiTimeframe = ref('15m')
const rsiPeriod = ref(14)
const rsiOversold = ref(30)
const rsiOverbought = ref(70)
const enableMACD = ref(false)
const macdTimeframe = ref('1h')
const macdFast = ref(12)
const macdSlow = ref(26)
const macdSignal = ref(9)

const creating = ref(false)
const activeBots = ref([])
const showHistoryModal = ref(false)
const selectedBot = ref(null)
const selectedRSITimeframe = ref('all') // Filter for RSI history
const selectedMACDTimeframe = ref('all') // Filter for MACD history

// Live data
const currentPrice = ref(0)
const currentRSI = ref(50)
const macdSignalValue = ref(0)

// History table columns
const historyColumns = [
  {
    title: 'Time',
    key: 'timestamp',
    width: 150,
    render: (row) => formatDate(row.timestamp)
  },
  {
    title: 'Side',
    key: 'side',
    width: 80,
    render: (row) => row.side === 'buy' ? '🟢 BUY' : '🔴 SELL'
  },
  {
    title: 'Price',
    key: 'price',
    width: 100,
    render: (row) => `$${row.price?.toFixed(4) || 'N/A'}`
  },
  {
    title: 'Amount',
    key: 'amount',
    width: 100,
    render: (row) => row.amount?.toFixed(4) || 'N/A'
  },
  {
    title: 'Cost',
    key: 'cost',
    width: 100,
    render: (row) => `$${((row.price || 0) * (row.amount || 0)).toFixed(2)}`
  },
  {
    title: 'Fee',
    key: 'fee',
    width: 80,
    render: (row) => `$${row.fee?.toFixed(4) || '0'}`
  },
  {
    title: 'RSI',
    key: 'rsi',
    width: 80,
    render: (row) => row.rsi ? row.rsi.toFixed(2) : 'N/A'
  },
  {
    title: 'MACD',
    key: 'macd',
    width: 100,
    render: (row) => row.macd ? row.macd.histogram?.toFixed(4) : 'N/A'
  },
  {
    title: 'Executed',
    key: 'executed',
    width: 100,
    render: (row) => row.executed ? '✅ Yes' : '⏳ No'
  },
  {
    title: 'Order ID',
    key: 'orderId',
    width: 150,
    ellipsis: true,
    render: (row) => row.orderId || 'N/A'
  }
]

// Symbol from app store
const currentSymbol = computed(() => app.getUserSelectedMarket)
const currentExchange = computed(() => app.getUserSelectedExchange)
const base = computed(() => currentSymbol.value.split('/')[0])
const quote = computed(() => currentSymbol.value.split('/')[1])

// Filtered RSI/MACD history
const filteredRSIHistory = computed(() => {
  if (!selectedBot.value || !selectedBot.value.rsiHistory) return []
  if (selectedRSITimeframe.value === 'all') return selectedBot.value.rsiHistory
  return selectedBot.value.rsiHistory.filter(r => r.timeframe === selectedRSITimeframe.value)
})

const filteredMACDHistory = computed(() => {
  if (!selectedBot.value || !selectedBot.value.macdHistory) return []
  if (selectedMACDTimeframe.value === 'all') return selectedBot.value.macdHistory
  return selectedBot.value.macdHistory.filter(m => m.timeframe === selectedMACDTimeframe.value)
})

// Available timeframes from history
const availableRSITimeframes = computed(() => {
  if (!selectedBot.value || !selectedBot.value.rsiHistory) return []
  const timeframes = [...new Set(selectedBot.value.rsiHistory.map(r => r.timeframe))]
  return ['all', ...timeframes]
})

const availableMACDTimeframes = computed(() => {
  if (!selectedBot.value || !selectedBot.value.macdHistory) return []
  const timeframes = [...new Set(selectedBot.value.macdHistory.map(m => m.timeframe))]
  return ['all', ...timeframes]
})

// API Key options from user exchange data
const apiKeyOptions = computed(() => {
  const exchangeData = app.getUserExchangeData
  if (!exchangeData || !exchangeData.apiKeys) return []

  return exchangeData.apiKeys.map(key => ({
    label: key.name,
    value: key.name
  }))
})

// Interval options
const intervalOptions = [
  { label: '1 Minute', value: '1m' },
  { label: '5 Minutes', value: '5m' },
  { label: '10 Minutes', value: '10m' },
  { label: '15 Minutes', value: '15m' },
  { label: '30 Minutes', value: '30m' },
  { label: '1 Hour', value: '1h' },
  { label: '4 Hours', value: '4h' },
  { label: '1 Day', value: '1d' },
  { label: '1 Week', value: '1w' },
  { label: '1 Month', value: '1M' }
]

const timeframeOptions = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '30m', value: '30m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1d', value: '1d' }
]

// Computed
const conditionsMet = computed(() => {
  let met = true

  if (enableRSI.value) {
    if (side.value === 'buy') {
      met = met && currentRSI.value < rsiOversold.value
    } else {
      met = met && currentRSI.value > rsiOverbought.value
    }
  }

  if (enableMACD.value) {
    if (side.value === 'buy') {
      met = met && macdSignalValue.value > 0
    } else {
      met = met && macdSignalValue.value < 0
    }
  }

  return met
})

// Anticipation Calculator - calculate how many orders and totals
const intervalToMinutes = computed(() => {
  const match = dcaInterval.value.match(/^(\d+)([mhdwM])$/)
  if (!match) return 60

  const value = parseInt(match[1])
  const unit = match[2]

  const units = {
    'm': 1,
    'h': 60,
    'd': 1440,
    'w': 10080,
    'M': 43200
  }

  return value * (units[unit] || 60)
})

const anticipatedOrders = computed(() => {
  if (totalDuration.value === 0) return '∞ (Infinite)'
  const totalMinutes = totalDuration.value * 60
  const intervalMinutes = intervalToMinutes.value
  const orders = Math.floor(totalMinutes / intervalMinutes)
  return orders
})

const anticipatedBase = computed(() => {
  if (totalDuration.value === 0) return '∞'
  if (currentPrice.value === 0) return 'N/A'

  const orders = typeof anticipatedOrders.value === 'number' ? anticipatedOrders.value : 0
  if (orders === 0) return '0'

  if (side.value === 'buy') {
    // For BUY: amount is in quote currency, so we buy (amount / price) base
    const basePerOrder = amountPerInterval.value / currentPrice.value
    return (basePerOrder * orders).toFixed(4)
  } else {
    // For SELL: amount is in base currency
    return (amountPerInterval.value * orders).toFixed(4)
  }
})

const anticipatedQuote = computed(() => {
  if (totalDuration.value === 0) return '∞'
  if (currentPrice.value === 0) return 'N/A'

  const orders = typeof anticipatedOrders.value === 'number' ? anticipatedOrders.value : 0
  if (orders === 0) return '0'

  if (side.value === 'buy') {
    // For BUY: we spend quote currency directly
    return (amountPerInterval.value * orders).toFixed(2)
  } else {
    // For SELL: we receive (amount * price) quote
    const quotePerOrder = amountPerInterval.value * currentPrice.value
    return (quotePerOrder * orders).toFixed(2)
  }
})

const anticipatedAvgPrice = computed(() => {
  if (currentPrice.value === 0) return 'N/A'
  // Average price is current price (simplified - assumes price stays constant)
  return currentPrice.value.toFixed(4)
})

const anticipatedDuration = computed(() => {
  if (totalDuration.value === 0) return '∞ (Infinite)'

  const hours = totalDuration.value
  if (hours < 1) return `${Math.round(hours * 60)} minutes`
  if (hours < 24) return `${hours} hours`

  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24

  if (remainingHours === 0) return `${days} days`
  return `${days}d ${remainingHours}h`
})

// Functions
const createBot = async () => {
  try {
    creating.value = true

    // Get selected API keys from global store (from sidebar/navbar)
    const selectedApiKeys = app.getSelectedApiKeys
    if (!selectedApiKeys || selectedApiKeys.length === 0) {
      message.error('⚠️ No API keys selected. Please select API keys from the sidebar.')
      creating.value = false
      return
    }

    console.log('[SmartDCA] Creating bot with API keys:', selectedApiKeys)

    // Fetch current RSI/MACD values for all timeframes
    const timeframes = ['1m', '5m', '15m', '30m', '1h', '2h', '6h', '1d']
    const initialRSI = {}
    const initialMACD = {}

    message.info('📊 Capturing initial RSI/MACD values...')

    for (const timeframe of timeframes) {
      try {
        const indicatorResponse = await $fetch('/api/v1/calculateIndicators', {
          method: 'POST',
          body: {
            exchange: currentExchange.value,
            symbol: currentSymbol.value,
            timeframe: timeframe
          },
          timeout: 10000
        })

        if (indicatorResponse.success && indicatorResponse.data) {
          initialRSI[timeframe] = indicatorResponse.data.currentRSI
          initialMACD[timeframe] = indicatorResponse.data.currentMACD
        }
      } catch (err) {
        console.warn(`Failed to fetch ${timeframe} indicators:`, err)
      }
    }

    // Get current price
    let startingPrice = currentPrice.value
    if (startingPrice === 0) {
      try {
        const tickerResponse = await $fetch('/api/v1/fetchTicker', {
          method: 'POST',
          body: {
            exchange: currentExchange.value,
            symbol: currentSymbol.value
          }
        })
        if (tickerResponse.success) {
          startingPrice = tickerResponse.data.last
        }
      } catch (err) {
        console.warn('Failed to fetch starting price:', err)
      }
    }

    const data = {
      userID: userID.value,
      name: botName.value,
      exchange: currentExchange.value,
      symbol: currentSymbol.value,
      side: side.value,
      amountPerInterval: amountPerInterval.value,
      dcaInterval: dcaInterval.value,
      totalDuration: totalDuration.value,
      enableRSI: enableRSI.value,
      rsiTimeframe: rsiTimeframe.value,
      rsiPeriod: rsiPeriod.value,
      rsiOversold: rsiOversold.value,
      rsiOverbought: rsiOverbought.value,
      enableMACD: enableMACD.value,
      macdTimeframe: macdTimeframe.value,
      macdFast: macdFast.value,
      macdSlow: macdSlow.value,
      macdSignal: macdSignal.value,
      executionMode: executionMode.value,
      apiKeyNames: selectedApiKeys,  // Send all selected API keys
      startingPrice: startingPrice,
      initialRSI: initialRSI,
      initialMACD: initialMACD
    }

    console.log('[SmartDCA] Bot data:', data)

    const response = await $fetch('/api/v1/createSmartDCABot', {
      method: 'POST',
      body: data
    })

    if (response.success) {
      message.success('✅ Smart DCA Bot created successfully!')
      await loadActiveBots()
      resetForm()
    } else {
      message.error(`Failed: ${response.message}`)
    }
  } catch (error) {
    console.error('[SmartDCA] Error creating bot:', error)
    message.error('Error: ' + error.message)
  } finally {
    creating.value = false
  }
}

const stopBot = async (botId) => {
  try {
    const response = await $fetch('/api/v1/stopSmartDCABot', {
      method: 'POST',
      body: {
        userID: userID.value,
        botId: botId
      }
    })

    if (response.success) {
      message.success('⏹️ Bot stopped successfully!')
      await loadActiveBots()
    } else {
      message.error(`Failed: ${response.message}`)
    }
  } catch (error) {
    message.error('Error: ' + error.message)
  }
}

const loadActiveBots = async () => {
  try {
    const response = await $fetch('/api/v1/fetchSmartDCABots', {
      method: 'POST',
      body: {
        userID: userID.value
      }
    })

    if (response.success) {
      activeBots.value = response.data
    }
  } catch (error) {
    console.error('Error loading bots:', error)
  }
}

const fetchLiveIndicators = async () => {
  try {
    // Fetch current price
    const ticker = await $fetch('/api/v1/fetchTicker', {
      query: {
        userID: userID.value,
        exchange: currentExchange.value,
        symbol: currentSymbol.value
      }
    })
    currentPrice.value = ticker.data?.last || 0

    // Fetch RSI if enabled
    if (enableRSI.value) {
      const rsiData = await $fetch('/api/v1/calculateRSI', {
        method: 'POST',
        body: {
          userID: userID.value,
          exchange: currentExchange.value,
          symbol: currentSymbol.value,
          timeframe: rsiTimeframe.value,
          period: rsiPeriod.value
        }
      })
      currentRSI.value = rsiData.data?.rsi || 50
    }

    // Fetch MACD if enabled
    if (enableMACD.value) {
      const macdData = await $fetch('/api/v1/calculateMACD', {
        method: 'POST',
        body: {
          userID: userID.value,
          exchange: currentExchange.value,
          symbol: currentSymbol.value,
          timeframe: macdTimeframe.value,
          fast: macdFast.value,
          slow: macdSlow.value,
          signal: macdSignal.value
        }
      })
      macdSignalValue.value = macdData.data?.histogram || 0
    }
  } catch (error) {
    console.error('Error fetching indicators:', error)
  }
}

const resetForm = () => {
  botName.value = `SmartDCA_${Date.now()}`
  amountPerInterval.value = 1
  dcaInterval.value = '1m'
  totalDuration.value = 0
}

const viewBotHistory = (bot) => {
  selectedBot.value = bot
  selectedRSITimeframe.value = 'all'
  selectedMACDTimeframe.value = 'all'
  showHistoryModal.value = true
}

const runBot = async (botId) => {
  try {
    const response = await $fetch('/api/v1/runSmartDCABot', {
      method: 'POST',
      body: {
        userID: userID.value,
        botId: botId
      }
    })

    if (response.success) {
      message.success('▶️ Bot resumed successfully!')
      await loadActiveBots()
    } else {
      message.error(`Failed: ${response.message}`)
    }
  } catch (error) {
    message.error('Error: ' + error.message)
  }
}

const deleteBot = async (botId) => {
  try {
    const response = await $fetch('/api/v1/deleteSmartDCABot', {
      method: 'POST',
      body: {
        userID: userID.value,
        botId: botId
      }
    })

    if (response.success) {
      message.success('🗑️ Bot deleted successfully!')
      await loadActiveBots()
    } else {
      message.error(`Failed: ${response.message}`)
    }
  } catch (error) {
    message.error('Error: ' + error.message)
  }
}

const doubleBet = async (bot) => {
  try {
    const newAmount = bot.amountPerInterval * 2
    const response = await $fetch('/api/v1/updateSmartDCABot', {
      method: 'POST',
      body: {
        userID: userID.value,
        botId: bot._id,
        amountPerInterval: newAmount
      }
    })

    if (response.success) {
      message.success(`2️⃣x Bet applied! New amount: ${newAmount}`)
      await loadActiveBots()
    } else {
      message.error(`Failed: ${response.message}`)
    }
  } catch (error) {
    message.error('Error: ' + error.message)
  }
}

const addGrid = async (bot) => {
  message.info('Add Grid feature - will create additional DCA levels')
  // TODO: Implement grid adding logic
}

const getAveragePrice = (bot) => {
  if (!bot.executionHistory || bot.executionHistory.length === 0) return 'N/A'

  const executed = bot.executionHistory.filter(h => h.executed && h.price)
  if (executed.length === 0) return 'N/A'

  const sum = executed.reduce((acc, h) => acc + h.price, 0)
  return `$${(sum / executed.length).toFixed(4)}`
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatNextRun = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  const now = new Date()
  const diff = date - now

  if (diff < 0) return 'Running...'

  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)

  return `${minutes}m ${seconds}s`
}

const getNextExecutionPercent = (bot) => {
  if (!bot.nextRun || !bot.lastExecutionAt) return 0

  const now = new Date()
  const nextRun = new Date(bot.nextRun)
  const lastExecution = new Date(bot.lastExecutionAt)

  const totalInterval = nextRun - lastExecution
  const elapsed = now - lastExecution

  if (totalInterval <= 0) return 100
  if (elapsed <= 0) return 0

  const percent = Math.min(100, Math.max(0, (elapsed / totalInterval) * 100))
  return Math.floor(percent)
}

const getBotCompletionPercent = (bot) => {
  if (!bot.totalDuration || bot.totalDuration <= 0) return 0
  if (!bot.startedAt) return 0

  const now = new Date()
  const startedAt = new Date(bot.startedAt)
  const durationMs = bot.totalDuration * 60 * 60 * 1000 // hours to ms
  const elapsed = now - startedAt

  if (elapsed <= 0) return 0
  if (elapsed >= durationMs) return 100

  const percent = Math.min(100, Math.max(0, (elapsed / durationMs) * 100))
  return Math.floor(percent)
}

const getAnticipatedOrders = (bot) => {
  if (!bot.totalDuration || bot.totalDuration <= 0) return '∞'

  const intervalMs = intervalToMs(bot.dcaInterval)
  const durationMs = bot.totalDuration * 60 * 60 * 1000 // hours to ms
  const totalOrders = Math.floor(durationMs / intervalMs)

  return totalOrders
}

const getElapsedTime = (bot) => {
  if (!bot.startedAt) return '0h'

  const now = new Date()
  const startedAt = new Date(bot.startedAt)
  const elapsedMs = now - startedAt
  const elapsedHours = (elapsedMs / (1000 * 60 * 60)).toFixed(1)

  return `${elapsedHours}h`
}

const intervalToMs = (interval) => {
  const units = {
    's': 1000,
    'm': 60 * 1000,
    'h': 60 * 60 * 1000,
    'd': 24 * 60 * 60 * 1000
  }

  const match = interval.match(/^(\d+)([smhd])$/)
  if (!match) return 60000 // default 1 minute

  const value = parseInt(match[1])
  const unit = match[2]

  return value * units[unit]
}

const getTotalBase = (bot) => {
  if (!bot.executionHistory || bot.executionHistory.length === 0) return 0

  const executed = bot.executionHistory.filter(h => h.executed && h.amount)
  const totalBase = executed.reduce((acc, h) => acc + h.amount, 0)

  return totalBase.toFixed(4)
}

const getPnL = (bot) => {
  if (bot.side !== 'buy') return 0
  const totalBase = parseFloat(getTotalBase(bot))
  if (totalBase === 0) return 0

  const currentValue = totalBase * currentPrice.value
  const totalSpent = bot.totalSpent || 0

  return currentValue - totalSpent
}

const getPnLPercent = (bot) => {
  if (bot.side !== 'buy') return '0.00'
  const totalSpent = bot.totalSpent || 0
  if (totalSpent === 0) return '0.00'

  const pnl = getPnL(bot)
  const percent = (pnl / totalSpent) * 100

  return percent >= 0 ? `+${percent.toFixed(2)}` : percent.toFixed(2)
}

// Lifecycle
let indicatorInterval = null
let botsRefreshInterval = null

onMounted(async () => {
  await app.loadUserExchangeData(userID.value)
  await loadActiveBots()
  await fetchLiveIndicators()

  // Update indicators every 5 seconds
  indicatorInterval = setInterval(fetchLiveIndicators, 5000)

  // Refresh bots list every 10 seconds
  botsRefreshInterval = setInterval(loadActiveBots, 10000)
})

onUnmounted(() => {
  if (indicatorInterval) clearInterval(indicatorInterval)
  if (botsRefreshInterval) clearInterval(botsRefreshInterval)
})
</script>

<style scoped>
.smart-dca-page {
  padding: 8px;
  height: calc(100vh - 95px);
  max-height: calc(100vh - 95px);
  overflow: hidden;
  background: #0f1419;
}

.page-header {
  margin-bottom: 8px;
}

.page-header h1 {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 4px 0;
}

.page-header p {
  font-size: 10px;
  color: #888;
  margin: 0;
}

.content-layout {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 8px;
  height: calc(100% - 40px);
}

.config-panel {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: 100%;
}

.bots-panel {
  overflow-y: auto;
  max-height: 100%;
}

.indicators-panel {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: 100%;
}

.indicator-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
  font-size: 10px;
}

.indicator-label {
  color: #888;
  font-weight: 500;
  font-size: 10px;
}

.indicator-value {
  color: #fff;
  font-weight: 600;
  font-size: 10px;
}

.text-green {
  color: #18a058;
}

.text-red {
  color: #d03050;
}

.empty-state {
  padding: 20px;
  text-align: center;
  font-size: 11px;
}

.bot-card {
  background: rgba(20, 25, 30, 0.4);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 4px;
  padding: 6px 8px;
  margin-bottom: 6px;
  transition: all 0.2s ease;
}

.bot-card:hover {
  background: rgba(20, 25, 30, 0.6);
  border-color: rgba(102, 126, 234, 0.3);
}

.bot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.bot-name {
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
}

.bot-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px 8px;
  margin-bottom: 6px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 9px;
  padding: 2px 0;
}

.stat-label {
  color: #888;
  font-size: 8px;
  font-weight: 400;
}

.stat-value {
  color: #fff;
  font-weight: 600;
  font-size: 9px;
}

.bot-indicators {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.bot-actions {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 4px;
}

@media (max-width: 1200px) {
  .content-layout {
    grid-template-columns: 1fr;
  }
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.stat-box {
  display: flex;
  flex-direction: column;
  padding: 12px;
  background: rgba(20, 25, 30, 0.5);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
}

.stat-label {
  font-size: 11px;
  color: #888;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #18a058;
}

/* Anticipation Calculator */
.anticipation-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.anticipation-box {
  display: flex;
  flex-direction: column;
  padding: 6px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.anticipation-box:hover {
  transform: translateY(-1px);
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.anticipation-label {
  font-size: 9px;
  color: #888;
  margin-bottom: 2px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.anticipation-value {
  font-size: 11px;
  font-weight: 700;
  color: #00d4ff;
  text-shadow: 0 0 6px rgba(0, 212, 255, 0.3);
}

/* Progress Indicators in Header (20px circles) */
.progress-inline-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 10px;
}

.progress-inline-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mini-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
}

.circle-center {
  position: absolute;
  top: 3px;
  left: 3px;
  right: 3px;
  bottom: 3px;
  background: #0f1419;
  border-radius: 50%;
}

.progress-inline-text {
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}
</style>
