<template>
  <div class="triangular-arb-page">
    <!-- TOP: Arbitrage Bots Navigation -->
    <div class="arb-bots-nav">
     
      <div class="nav-tabs-container">
        <button
          v-for="bot in arbBots"
          :key="bot.id"
          :class="['arb-tab-btn', { active: currentBotId === bot.id }]"
          @click="navigateToArbBot(bot.id)"
        >
          <span class="tab-icon">{{ bot.icon }}</span>
          <span class="tab-name">{{ bot.name }}</span>
          <span v-if="bot.status === 'active'" class="status-badge active">LIVE</span>
          <span v-else-if="bot.status === 'coming'" class="status-badge coming">SOON</span>
        </button>
      </div>
    </div>

    <!-- MAIN CONTENT: Reorganized Layout -->
    <div class="arb-grid-layout">
      <!-- LEFT COLUMN: Bot Configuration -->
      <div class="left-column">
        <!-- Live Triangular Opportunities -->
        <n-card title="🔺 Opp" :bordered="false" class="opportunities-card" size="small">
          <template #header-extra>
            <n-tag :type="scannerStatus === 'scanning' ? 'success' : 'error'" size="small" :bordered="false">
              {{ scannerStatus === 'scanning' ? '🔄 Scanning' : '⏸️ Paused' }}
            </n-tag>
          </template>

          <div class="opportunities-feed">
            <div
              v-for="opp in opportunities"
              :key="opp.id"
              :class="['opportunity-item', getProfitClass(opp.profit)]"
            >
              <!-- Triangle Visualization -->
              <div class="triangle-visual">
                <div class="triangle-path">
                  <div class="triangle-node start">
                    <span class="node-currency">{{ opp.path[0] }}</span>
                  </div>
                  <div class="triangle-arrow">→</div>
                  <div class="triangle-node">
                    <span class="node-currency">{{ opp.path[1] }}</span>
                  </div>
                  <div class="triangle-arrow">→</div>
                  <div class="triangle-node">
                    <span class="node-currency">{{ opp.path[2] }}</span>
                  </div>
                  <div class="triangle-arrow">→</div>
                  <div class="triangle-node end">
                    <span class="node-currency">{{ opp.path[0] }}</span>
                  </div>
                </div>
              </div>

              <!-- Opportunity Details -->
              <div class="opportunity-details">
                <div class="detail-row">
                  <span class="label">Profit:</span>
                  <span :class="['value profit', getProfitClass(opp.profit)]">
                    {{ opp.profit > 0 ? '+' : '' }}{{ opp.profit.toFixed(3) }}%
                  </span>
                </div>
                <div class="detail-row">
                  <span class="label">Expected:</span>
                  <span class="value">${{ opp.expectedProfit.toFixed(2) }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Trades:</span>
                  <span class="value trades">
                    {{ opp.pairs[0] }} → {{ opp.pairs[1] }} → {{ opp.pairs[2] }}
                  </span>
                </div>
                <div class="detail-row">
                  <span class="label">Volume:</span>
                  <span class="value">${{ opp.volume.toLocaleString() }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Speed:</span>
                  <span class="value speed">{{ opp.executionTime }}ms</span>
                </div>
                <div class="detail-row">
                  <span class="label">Confidence:</span>
                  <n-progress
                    type="line"
                    :percentage="opp.confidence"
                    :height="6"
                    :show-indicator="false"
                    :color="getConfidenceColor(opp.confidence)"
                  />
                </div>
              </div>

              <!-- Action Button -->
              <div class="opportunity-actions">
                <n-button
                  size="tiny"
                  :type="opp.profit > 0.5 ? 'success' : 'info'"
                  @click="executeTriangle(opp)"
                  :disabled="opp.profit < botConfig.minProfitThreshold"
                >
                  {{ opp.profit >= botConfig.minProfitThreshold ? '⚡ Execute' : '🔒 Low' }}
                </n-button>
              </div>
            </div>

            <!-- No opportunities message -->
            <div v-if="opportunities.length === 0" class="no-opportunities">
              <div class="no-opp-icon">🔍</div>
              <p>Scanning for triangular arbitrage opportunities...</p>
              <p class="no-opp-hint">Profitable triangles will appear here</p>
            </div>
          </div>
        </n-card>

        <!-- Exchange Network Map -->
        <n-card title="🌐 Network" :bordered="false" class="network-card" size="small">
          <div class="network-stats">
            <div class="stat-item">
              <div class="stat-icon">🏦</div>
              <div class="stat-content">
                <div class="stat-label">Active Exchanges</div>
                <div class="stat-value">{{ networkStats.activeExchanges }}</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">💱</div>
              <div class="stat-content">
                <div class="stat-label">Trading Pairs</div>
                <div class="stat-value">{{ networkStats.tradingPairs }}</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">🔺</div>
              <div class="stat-content">
                <div class="stat-label">Possible Triangles</div>
                <div class="stat-value">{{ networkStats.possibleTriangles }}</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">⚡</div>
              <div class="stat-content">
                <div class="stat-label">Scans/min</div>
                <div class="stat-value">{{ networkStats.scansPerMin }}</div>
              </div>
            </div>
          </div>
        </n-card>
      </div>

      <!-- CENTER COLUMN: Bot Configuration -->
      <div class="center-column">
        <n-card title="⚙️ Config" :bordered="false" class="config-card" size="small">
          <n-tabs type="line" animated size="small">
            <!-- TAB 1: Basic Settings -->
            <n-tab-pane name="basic" tab="⚙️ Basic">
              <div class="config-section">
                <div class="form-group">
                  <label>Exchange</label>
                  <n-select
                    v-model:value="botConfig.exchange"
                    :options="exchangeOptions"
                    placeholder="Select exchange"
                    size="small"
                  />
                </div>

                <div class="form-group">
                  <label>Base Currency</label>
                  <n-select
                    v-model:value="botConfig.baseCurrency"
                    :options="baseCurrencyOptions"
                    placeholder="Select base currency"
                    size="small"
                  />
                </div>

                <div class="form-group">
                  <label>Investment Amount</label>
                  <n-input-number
                    v-model:value="botConfig.investmentAmount"
                    :min="10"
                    :step="10"
                    :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                    size="small"
                  />
                </div>

                <div class="form-group">
                  <label>Min Profit (%)</label>
                  <n-slider
                    v-model:value="botConfig.minProfitThreshold"
                    :min="0.1"
                    :max="5"
                    :step="0.1"
                    size="small"
                  />
                </div>

                <div class="form-group">
                  <label>Auto-Execute</label>
                  <n-checkbox v-model:checked="botConfig.autoExecute" size="small">
                    Auto execute profitable opportunities
                  </n-checkbox>
                </div>

                <div class="form-group">
                  <label>Max Slippage (%)</label>
                  <n-input-number
                    v-model:value="botConfig.maxSlippage"
                    :min="0.1"
                    :max="5"
                    :step="0.1"
                    size="small"
                  />
                </div>
              </div>
            </n-tab-pane>

            <!-- TAB 2: Triangle Discovery -->
            <n-tab-pane name="discovery" tab="🔍 Scan">
              <div class="config-section">
                <div class="form-group">
                  <label>Scan Frequency</label>
                  <n-select
                    v-model:value="botConfig.scanFrequency"
                    :options="scanFrequencyOptions"
                    placeholder="Select frequency"
                    size="small"
                  />
                </div>

                <div class="form-group">
                  <label>Currency Pairs</label>
                  <n-select
                    v-model:value="botConfig.monitoredPairs"
                    :options="pairOptions"
                    multiple
                    filterable
                    placeholder="Select pairs"
                    size="small"
                  />
                </div>

                <div class="form-group">
                  <label>Triangle Depth</label>
                  <n-input-number
                    v-model:value="botConfig.maxTriangleDepth"
                    :min="3"
                    :max="5"
                    :step="1"
                    size="small"
                  />
                </div>

                <div class="form-group">
                  <label>Min Liquidity</label>
                  <n-input-number
                    v-model:value="botConfig.minLiquidity"
                    :min="1000"
                    :step="1000"
                    :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                    size="small"
                  />
                </div>

                <div class="form-group">
                  <label>Stablecoins</label>
                  <n-checkbox v-model:checked="botConfig.includeStablecoins" size="small">
                    Include USDT, USDC, BUSD
                  </n-checkbox>
                </div>
              </div>
            </n-tab-pane>

            <!-- TAB 3: Execution Strategy -->
            <n-tab-pane name="execution" tab="⚡ Exec">
              <div class="config-section">
                <div class="form-group">
                  <label>Speed</label>
                  <n-select
                    v-model:value="botConfig.executionSpeed"
                    :options="executionSpeedOptions"
                    placeholder="Select speed"
                    size="small"
                  />
                </div>

                <div class="form-group">
                  <label>Order Type</label>
                  <n-select
                    v-model:value="botConfig.orderType"
                    :options="orderTypeOptions"
                    placeholder="Select type"
                    size="small"
                  />
                </div>

                <div class="form-group">
                  <label>Max Concurrent</label>
                  <n-input-number
                    v-model:value="botConfig.maxConcurrentTriangles"
                    :min="1"
                    :max="10"
                    :step="1"
                    size="small"
                  />
                </div>

                <div class="form-group">
                  <label>Timeout (sec)</label>
                  <n-input-number
                    v-model:value="botConfig.tradeTimeout"
                    :min="5"
                    :max="60"
                    :step="5"
                    size="small"
                  />
                </div>

                <div class="form-group">
                  <label>Retry Failed</label>
                  <n-checkbox v-model:checked="botConfig.retryFailedLegs" size="small">
                    Retry failed legs (max 3)
                  </n-checkbox>
                </div>

                <div class="form-group">
                  <label>Emergency Exit</label>
                  <n-checkbox v-model:checked="botConfig.emergencyExit" size="small">
                    Auto-exit at market price
                  </n-checkbox>
                </div>
              </div>
            </n-tab-pane>

            <!-- TAB 4: Risk Management -->
            <n-tab-pane name="risk" tab="🛡️ Risk">
              <div class="config-section">
                <div class="form-group">
                  <label>Max Daily Loss (%)</label>
                  <n-input-number
                    v-model:value="botConfig.maxDailyLoss"
                    :min="1"
                    :max="20"
                    :step="1"
                    size="small"
                  />
                </div>

                <div class="form-group">
                  <label>Max Loss/Triangle (%)</label>
                  <n-input-number
                    v-model:value="botConfig.maxLossPerTriangle"
                    :min="0.5"
                    :max="10"
                    :step="0.5"
                    size="small"
                  />
                </div>

                <div class="form-group">
                  <label>Daily Limit</label>
                  <n-input-number
                    v-model:value="botConfig.dailyExecutionLimit"
                    :min="10"
                    :max="1000"
                    :step="10"
                    size="small"
                  />
                </div>

                <div class="form-group">
                  <label>Cooldown (sec)</label>
                  <n-input-number
                    v-model:value="botConfig.cooldownPeriod"
                    :min="0"
                    :max="300"
                    :step="10"
                    size="small"
                  />
                </div>

                <div class="form-group">
                  <label>Price Protection</label>
                  <n-checkbox v-model:checked="botConfig.priceMovementProtection" size="small">
                    Cancel if price moves unfavorably
                  </n-checkbox>
                </div>
              </div>
            </n-tab-pane>
          </n-tabs>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <n-button
              type="success"
              size="small"
              :loading="botRunning"
              @click="toggleBot"
            >
              {{ botRunning ? '⏸️ Stop' : '▶️ Start' }}
            </n-button>
            <n-button type="info" size="small" @click="saveConfig">
              💾 Save
            </n-button>
            <n-button type="warning" size="small" @click="resetConfig">
              🔄 Reset
            </n-button>
          </div>
        </n-card>
      </div>

      <!-- RIGHT COLUMN: Active Triangles & Performance -->
      <div class="right-column">
        <!-- Active Triangle Executions -->
        <n-card title="⚡ Exec" :bordered="false" class="executions-card" size="small">
          <div class="executions-list">
            <div
              v-for="exec in activeExecutions"
              :key="exec.id"
              class="execution-item"
            >
              <div class="exec-header">
                <span class="exec-id">#{exec.id}</span>
                <span :class="['exec-status', exec.status]">{{ exec.status }}</span>
              </div>

              <!-- Progress Bar -->
              <div class="exec-progress">
                <div class="progress-steps">
                  <div :class="['step', { completed: exec.step >= 1, active: exec.step === 1 }]">
                    <span class="step-num">1</span>
                    <span class="step-label">{{ exec.path[0] }}→{{ exec.path[1] }}</span>
                  </div>
                  <div :class="['step', { completed: exec.step >= 2, active: exec.step === 2 }]">
                    <span class="step-num">2</span>
                    <span class="step-label">{{ exec.path[1] }}→{{ exec.path[2] }}</span>
                  </div>
                  <div :class="['step', { completed: exec.step >= 3, active: exec.step === 3 }]">
                    <span class="step-num">3</span>
                    <span class="step-label">{{ exec.path[2] }}→{{ exec.path[0] }}</span>
                  </div>
                </div>
              </div>

              <div class="exec-details">
                <div class="exec-row">
                  <span class="label">Invested:</span>
                  <span class="value">${{ exec.invested }}</span>
                </div>
                <div class="exec-row">
                  <span class="label">Current:</span>
                  <span class="value">${{ exec.current }}</span>
                </div>
                <div class="exec-row">
                  <span class="label">P&L:</span>
                  <span :class="['value', exec.pnl >= 0 ? 'profit' : 'loss']">
                    {{ exec.pnl >= 0 ? '+' : '' }}${{ exec.pnl.toFixed(2) }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="activeExecutions.length === 0" class="no-executions">
              <div class="no-exec-icon">⏳</div>
              <p>No active triangle executions</p>
            </div>
          </div>
        </n-card>

        <!-- Bot Performance -->
        <n-card title="📊 Perf" :bordered="false" class="performance-card" size="small">
          <div class="performance-stats">
            <div class="stat-box">
              <div class="stat-label">Total Profit (24h)</div>
              <div class="stat-value profit">+${{ performanceStats.totalProfit.toFixed(2) }}</div>
            </div>

            <div class="stat-box">
              <div class="stat-label">Success Rate</div>
              <div class="stat-value">{{ performanceStats.successRate }}%</div>
            </div>

            <div class="stat-box">
              <div class="stat-label">Triangles Executed</div>
              <div class="stat-value">{{ performanceStats.trianglesExecuted }}</div>
            </div>

            <div class="stat-box">
              <div class="stat-label">Avg Profit/Triangle</div>
              <div class="stat-value profit">+${{ performanceStats.avgProfit.toFixed(2) }}</div>
            </div>

            <div class="stat-box">
              <div class="stat-label">Avg Execution Time</div>
              <div class="stat-value">{{ performanceStats.avgExecutionTime }}ms</div>
            </div>

            <div class="stat-box">
              <div class="stat-label">Best Triangle</div>
              <div class="stat-value profit">+{{ performanceStats.bestTriangle }}%</div>
            </div>
          </div>

          <!-- Performance Chart -->
          <div class="performance-chart">
            <div class="chart-title">Hourly Profit</div>
            <div class="chart-bars">
              <div
                v-for="hour in hourlyProfit"
                :key="hour.hour"
                class="chart-bar-item"
              >
                <div
                  class="chart-bar"
                  :style="{
                    height: Math.abs(hour.profit) * 10 + 'px',
                    background: hour.profit >= 0 ? 'linear-gradient(to top, #10eb04, #0ab800)' : 'linear-gradient(to top, #ff6b6b, #ee5a52)'
                  }"
                ></div>
                <div class="chart-label">{{ hour.hour }}</div>
              </div>
            </div>
          </div>
        </n-card>

        <!-- Recent Triangle History -->
        <n-card title="📜 History" :bordered="false" class="history-card" size="small">
          <div class="triangle-history">
            <div
              v-for="triangle in triangleHistory"
              :key="triangle.id"
              :class="['history-item', triangle.result]"
            >
              <div class="history-header">
                <span class="history-path">{{ triangle.path.join(' → ') }}</span>
                <span class="history-time">{{ triangle.time }}</span>
              </div>
              <div class="history-details">
                <span class="history-profit" :class="triangle.result">
                  {{ triangle.profit >= 0 ? '+' : '' }}{{ triangle.profit.toFixed(2) }}%
                </span>
                <span class="history-amount">
                  {{ triangle.profit >= 0 ? '+' : '' }}${{ triangle.amount.toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useMessage } from 'naive-ui';

const message = useMessage();

// Current bot ID for navigation
const currentBotId = ref('arb-triangular');

// TOP 10 ARBITRAGE BOTS (as specified by user)
const arbBots = ref([
  {
    id: 'arb-triangular',
    name: 'Triangular Arb',
    icon: '🔺',
    description: 'Three-way arbitrage on single exchange',
    status: 'active'
  },
  {
    id: 'arb-crossexchange',
    name: 'Cross-Exchange Arb',
    icon: '🔄',
    description: 'Arbitrage between different exchanges',
    status: 'coming'
  },
  {
    id: 'arb-flash',
    name: 'Flash Arb',
    icon: '⚡',
    description: 'Flash loan arbitrage',
    status: 'coming'
  },
  {
    id: 'arb-funding',
    name: 'Funding Rate Arb',
    icon: '💰',
    description: 'Profit from funding rate differences',
    status: 'coming'
  },
  {
    id: 'arb-deltaneutral',
    name: 'Delta Neutral',
    icon: '⚖️',
    description: 'Market-neutral delta hedging strategies',
    status: 'coming'
  },
  {
    id: 'arb-basistrader',
    name: 'Basis Trader',
    icon: '📊',
    description: 'Spot-futures basis trading',
    status: 'coming'
  },
  {
    id: 'arb-ironcondor',
    name: 'Iron Condor',
    icon: '🦅',
    description: 'Options iron condor strategy',
    status: 'coming'
  },
  {
    id: 'arb-lcx-coinbase',
    name: 'LCX-Coinbase Arb',
    icon: '🏦',
    description: 'Arbitrage between LCX and Coinbase',
    status: 'coming'
  },
  {
    id: 'arb-lcx-kraken',
    name: 'LCX-Kraken Arb',
    icon: '🐙',
    description: 'Arbitrage between LCX and Kraken',
    status: 'coming'
  },
  {
    id: 'arb-coinbase-kraken',
    name: 'Coinbase-Kraken Arb',
    icon: '🔀',
    description: 'Arbitrage between Coinbase and Kraken',
    status: 'coming'
  }
]);

// Navigate to different arbitrage bot
const navigateToArbBot = (botId) => {
  if (botId === 'arb-triangular') {
    currentBotId.value = botId;
  } else {
    message.info(`${botId} - Coming Soon!`);
  }
};

// Bot State
const botRunning = ref(false);
const scannerStatus = ref('scanning');

// Bot Configuration
const botConfig = ref({
  exchange: 'binance',
  baseCurrency: 'USDT',
  investmentAmount: 1000,
  minProfitThreshold: 0.5,
  autoExecute: false,
  maxSlippage: 0.5,
  scanFrequency: 'medium',
  monitoredPairs: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'],
  maxTriangleDepth: 3,
  minLiquidity: 10000,
  includeStablecoins: true,
  executionSpeed: 'fast',
  orderType: 'market',
  maxConcurrentTriangles: 3,
  tradeTimeout: 30,
  retryFailedLegs: true,
  emergencyExit: true,
  maxDailyLoss: 5,
  maxLossPerTriangle: 2,
  dailyExecutionLimit: 100,
  cooldownPeriod: 10,
  priceMovementProtection: true
});

// Live Opportunities (Simulated)
const opportunities = ref([
  {
    id: 1,
    path: ['USDT', 'BTC', 'ETH', 'USDT'],
    pairs: ['BTC/USDT', 'ETH/BTC', 'ETH/USDT'],
    profit: 1.23,
    expectedProfit: 12.30,
    volume: 1000,
    executionTime: 245,
    confidence: 87
  },
  {
    id: 2,
    path: ['USDT', 'ETH', 'BNB', 'USDT'],
    pairs: ['ETH/USDT', 'BNB/ETH', 'BNB/USDT'],
    profit: 0.89,
    expectedProfit: 8.90,
    volume: 1000,
    executionTime: 198,
    confidence: 92
  },
  {
    id: 3,
    path: ['USDT', 'BNB', 'BTC', 'USDT'],
    pairs: ['BNB/USDT', 'BTC/BNB', 'BTC/USDT'],
    profit: 0.34,
    expectedProfit: 3.40,
    volume: 1000,
    executionTime: 312,
    confidence: 76
  }
]);

// Network Stats
const networkStats = ref({
  activeExchanges: 5,
  tradingPairs: 247,
  possibleTriangles: 1842,
  scansPerMin: 180
});

// Active Executions
const activeExecutions = ref([
  {
    id: 1001,
    path: ['USDT', 'BTC', 'ETH'],
    status: 'executing',
    step: 2,
    invested: 1000,
    current: 1008.5,
    pnl: 8.5
  }
]);

// Performance Stats
const performanceStats = ref({
  totalProfit: 245.67,
  successRate: 87.3,
  trianglesExecuted: 156,
  avgProfit: 1.57,
  avgExecutionTime: 234,
  bestTriangle: 3.45
});

// Hourly Profit Chart
const hourlyProfit = ref([
  { hour: '00', profit: 2.3 },
  { hour: '04', profit: 1.8 },
  { hour: '08', profit: 4.2 },
  { hour: '12', profit: 5.6 },
  { hour: '16', profit: 3.1 },
  { hour: '20', profit: 2.8 },
  { hour: '23', profit: 1.9 }
]);

// Triangle History
const triangleHistory = ref([
  {
    id: 1,
    path: ['USDT', 'BTC', 'ETH', 'USDT'],
    profit: 1.23,
    amount: 12.30,
    result: 'success',
    time: '2 min ago'
  },
  {
    id: 2,
    path: ['USDT', 'ETH', 'BNB', 'USDT'],
    profit: -0.45,
    amount: -4.50,
    result: 'failed',
    time: '5 min ago'
  },
  {
    id: 3,
    path: ['USDT', 'BNB', 'BTC', 'USDT'],
    profit: 0.89,
    amount: 8.90,
    result: 'success',
    time: '8 min ago'
  }
]);

// Options
const exchangeOptions = [
  { label: 'Binance', value: 'binance' },
  { label: 'Coinbase', value: 'coinbase' },
  { label: 'Kraken', value: 'kraken' },
  { label: 'LCX', value: 'lcx' }
];

const baseCurrencyOptions = [
  { label: 'USDT', value: 'USDT' },
  { label: 'USDC', value: 'USDC' },
  { label: 'BTC', value: 'BTC' },
  { label: 'ETH', value: 'ETH' }
];

const scanFrequencyOptions = [
  { label: 'Very Fast (100ms)', value: 'very-fast' },
  { label: 'Fast (500ms)', value: 'fast' },
  { label: 'Medium (1s)', value: 'medium' },
  { label: 'Slow (5s)', value: 'slow' }
];

const pairOptions = [
  { label: 'BTC/USDT', value: 'BTC/USDT' },
  { label: 'ETH/USDT', value: 'ETH/USDT' },
  { label: 'BNB/USDT', value: 'BNB/USDT' },
  { label: 'ETH/BTC', value: 'ETH/BTC' },
  { label: 'BNB/BTC', value: 'BNB/BTC' },
  { label: 'BNB/ETH', value: 'BNB/ETH' }
];

const executionSpeedOptions = [
  { label: 'Ultra Fast (Market Orders)', value: 'ultra-fast' },
  { label: 'Fast (Aggressive Limit)', value: 'fast' },
  { label: 'Medium (Limit Orders)', value: 'medium' },
  { label: 'Slow (Best Price)', value: 'slow' }
];

const orderTypeOptions = [
  { label: 'Market', value: 'market' },
  { label: 'Limit', value: 'limit' },
  { label: 'IOC (Immediate or Cancel)', value: 'ioc' },
  { label: 'FOK (Fill or Kill)', value: 'fok' }
];

// Helper Functions
const getProfitClass = (profit) => {
  if (profit >= 1) return 'high';
  if (profit >= 0.5) return 'medium';
  return 'low';
};

const getConfidenceColor = (confidence) => {
  if (confidence >= 80) return '#10eb04';
  if (confidence >= 60) return '#f5d020';
  return '#ff6b6b';
};

// Execute Triangle
const executeTriangle = (opp) => {
  message.success(`Executing triangle: ${opp.path.join(' → ')} | Expected profit: +${opp.profit.toFixed(2)}%`);
};

// Toggle Bot
const toggleBot = () => {
  botRunning.value = !botRunning.value;
  scannerStatus.value = botRunning.value ? 'scanning' : 'paused';
  if (botRunning.value) {
    message.success('🔺 Triangular Arbitrage Scanner Started!');
  } else {
    message.warning('⏸️ Scanner Paused');
  }
};

// Save Config
const saveConfig = () => {
  message.success('✅ Configuration saved successfully!');
};

// Reset Config
const resetConfig = () => {
  message.info('🔄 Configuration reset to default');
};

// Simulate opportunities updates
let opportunityInterval;

onMounted(() => {
  // Simulate new opportunities every 5 seconds
  opportunityInterval = setInterval(() => {
    if (botRunning.value) {
      // Update opportunities with slight variations
      opportunities.value.forEach(opp => {
        opp.profit = (Math.random() * 2).toFixed(3);
        opp.confidence = Math.floor(Math.random() * 40 + 60);
      });
    }
  }, 5000);
});

onUnmounted(() => {
  if (opportunityInterval) {
    clearInterval(opportunityInterval);
  }
});
</script>

<style scoped>
/* ========== MAIN PAGE LAYOUT ========== */
.triangular-arb-page {
  height: 100vh;
  max-height: 100vh;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ========== ARBITRAGE BOTS NAVIGATION (PURPLE/GREEN THEME) ========== */
.arb-bots-nav {
  background: linear-gradient(135deg, #1a1f2e 0%, #2a3441 100%);
  border-bottom: 1px solid #9c27b0;
  padding: 2px 4px;
  box-shadow: 0 1px 4px rgba(156, 39, 176, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
}

.nav-header {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.nav-icon {
  font-size: 10px;
}

.nav-header h1 {
  font-size: 8px;
  font-weight: 700;
  background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.nav-tabs-container {
  display: flex;
  gap: 3px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.arb-tab-btn {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 4px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(156, 39, 176, 0.3);
  border-radius: 3px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 7px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.arb-tab-btn:hover {
  background: rgba(156, 39, 176, 0.2);
  border-color: #9c27b0;
  color: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
}

.arb-tab-btn.active {
  background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%);
  border-color: #9c27b0;
  color: #fff;
  box-shadow: 0 2px 8px rgba(156, 39, 176, 0.5);
}

.tab-icon {
  font-size: 8px;
}

.tab-name {
  font-size: 7px;
}

.status-badge {
  padding: 1px 3px;
  border-radius: 2px;
  font-size: 6px;
  font-weight: 700;
  margin-left: 2px;
}

.status-badge.active {
  background: #10eb04;
  color: #000;
  animation: pulse-glow 2s ease-in-out infinite;
}

.status-badge.coming {
  background: transparent;
  color: #f5a623;
  border: 1px solid #f5a623;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(16, 235, 4, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(16, 235, 4, 0.8);
  }
}

/* Scrollbar for arb tabs */
.nav-tabs-container::-webkit-scrollbar {
  height: 6px;
}

.nav-tabs-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.nav-tabs-container::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #9c27b0 0%, #673ab7 100%);
  border-radius: 10px;
}

.nav-tabs-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(90deg, #673ab7 0%, #9c27b0 100%);
}

/* ========== 2-ROW GRID LAYOUT ========== */
.arb-grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 3px;
  padding: 3px;
  width: 100%;
  height: calc(100vh - 30px);
  max-height: calc(100vh - 30px);
  overflow-y: auto;
}

@media (max-width: 1200px) {
  .arb-grid-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
}

/* ========== COLUMNS ========== */
.left-column {
  grid-column: 1;
  grid-row: 1 / 3;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.center-column {
  grid-column: 2;
  grid-row: 1 / 3;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.right-column {
  grid-column: 3;
  grid-row: 1 / 3;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

/* ========== CARDS ========== */
.opportunities-card,
.network-card,
.config-card,
.executions-card,
.performance-card,
.history-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(156, 39, 176, 0.3);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Auto heights for all cards - Flexible layout */
.opportunities-card,
.network-card,
.config-card,
.executions-card,
.performance-card,
.history-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

/* ========== OPPORTUNITIES FEED ========== */
.opportunities-feed {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.opportunity-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  padding: 2px;
  transition: all 0.2s ease;
}

.opportunity-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(156, 39, 176, 0.3);
}

.opportunity-item.high {
  border-left: 3px solid #10eb04;
}

.opportunity-item.medium {
  border-left: 3px solid #f5d020;
}

.opportunity-item.low {
  border-left: 3px solid #ff6b6b;
}

/* Triangle Visualization */
.triangle-visual {
  margin-bottom: 2px;
}

.triangle-path {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1px;
}

.triangle-node {
  background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%);
  border: 1px solid rgba(156, 39, 176, 0.5);
  border-radius: 50%;
  width: 10px;
  height: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.triangle-node.start,
.triangle-node.end {
  background: linear-gradient(135deg, #10eb04 0%, #0ab800 100%);
  border-color: #10eb04;
}

.node-currency {
  font-size: 5px;
  font-weight: 700;
  color: #fff;
}

.triangle-arrow {
  font-size: 5px;
  color: rgba(255, 255, 255, 0.5);
}

/* Opportunity Details */
.opportunity-details {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-bottom: 2px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 6px;
}

.detail-row .label {
  color: rgba(255, 255, 255, 0.6);
}

.detail-row .value {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.detail-row .value.profit {
  font-weight: 700;
}

.detail-row .value.profit.high {
  color: #10eb04;
}

.detail-row .value.profit.medium {
  color: #f5d020;
}

.detail-row .value.profit.low {
  color: #ff6b6b;
}

.detail-row .value.trades {
  font-size: 10px;
  font-family: monospace;
}

.detail-row .value.speed {
  color: #9c27b0;
}

.opportunity-actions {
  display: flex;
  gap: 8px;
}

/* No Opportunities */
.no-opportunities {
  text-align: center;
  padding: 32px;
  color: rgba(255, 255, 255, 0.5);
}

.no-opp-icon {
  font-size: 48px;
  margin-bottom: 12px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.no-opp-hint {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
}

/* ========== NETWORK STATS ========== */
.network-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 2px;
  background: rgba(156, 39, 176, 0.1);
  border: 1px solid rgba(156, 39, 176, 0.3);
  border-radius: 2px;
  padding: 2px;
}

.stat-icon {
  font-size: 8px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 5px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0px;
}

.stat-value {
  font-size: 7px;
  font-weight: 700;
  color: #9c27b0;
}

/* ========== CONFIG SECTION ========== */
.config-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 2px 0;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.form-group label {
  font-size: 6px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.form-group small {
  font-size: 7px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: -1px;
  display: none;
}

/* ========== ACTION BUTTONS ========== */
.action-buttons {
  display: flex;
  gap: 2px;
  margin-top: 3px;
  padding-top: 3px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* ========== ACTIVE EXECUTIONS ========== */
.executions-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.execution-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(156, 39, 176, 0.3);
  border-radius: 3px;
  padding: 3px;
}

.exec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3px;
}

.exec-id {
  font-size: 6px;
  font-weight: 700;
  color: #9c27b0;
}

.exec-status {
  padding: 1px 3px;
  border-radius: 2px;
  font-size: 5px;
  font-weight: 700;
  text-transform: uppercase;
}

.exec-status.executing {
  background: rgba(156, 39, 176, 0.2);
  color: #9c27b0;
}

/* Progress Steps */
.progress-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3px;
}

.step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  position: relative;
}

.step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 6px;
  left: 50%;
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.step.completed::after {
  background: #10eb04;
}

.step-num {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 6px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  position: relative;
  z-index: 1;
}

.step.active .step-num {
  background: #9c27b0;
  color: #fff;
}

.step.completed .step-num {
  background: #10eb04;
  color: #000;
}

.step-label {
  font-size: 5px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.exec-details {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.exec-row {
  display: flex;
  justify-content: space-between;
  font-size: 6px;
}

.exec-row .label {
  color: rgba(255, 255, 255, 0.6);
}

.exec-row .value {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.exec-row .value.profit {
  color: #10eb04;
}

.exec-row .value.loss {
  color: #ff6b6b;
}

.no-executions {
  text-align: center;
  padding: 32px;
  color: rgba(255, 255, 255, 0.5);
}

.no-exec-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

/* ========== PERFORMANCE STATS ========== */
.performance-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
  margin-bottom: 3px;
}

.stat-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  padding: 2px;
  text-align: center;
}

.stat-box .stat-label {
  font-size: 5px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 1px;
}

.stat-box .stat-value {
  font-size: 7px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.stat-box .stat-value.profit {
  color: #10eb04;
}

/* Performance Chart */
.performance-chart {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 2px;
  padding: 2px;
}

.chart-title {
  font-size: 6px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2px;
}

.chart-bars {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 30px;
  gap: 2px;
}

.chart-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-bar {
  width: 100%;
  border-radius: 2px 2px 0 0;
  transition: all 0.2s ease;
}

.chart-label {
  font-size: 5px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 1px;
}

/* ========== TRIANGLE HISTORY ========== */
.triangle-history {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.history-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  padding: 2px;
}

.history-item.success {
  border-left: 1px solid #10eb04;
}

.history-item.failed {
  border-left: 1px solid #ff6b6b;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1px;
}

.history-path {
  font-size: 5px;
  font-family: monospace;
  color: rgba(255, 255, 255, 0.7);
}

.history-time {
  font-size: 5px;
  color: rgba(255, 255, 255, 0.5);
}

.history-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-profit {
  font-size: 6px;
  font-weight: 700;
}

.history-profit.success {
  color: #10eb04;
}

.history-profit.failed {
  color: #ff6b6b;
}

.history-amount {
  font-size: 5px;
  color: rgba(255, 255, 255, 0.6);
}

/* ========== SCROLLBAR STYLING ========== */
.opportunities-feed::-webkit-scrollbar,
.executions-list::-webkit-scrollbar,
.triangle-history::-webkit-scrollbar {
  width: 6px;
}

.opportunities-feed::-webkit-scrollbar-track,
.executions-list::-webkit-scrollbar-track,
.triangle-history::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.opportunities-feed::-webkit-scrollbar-thumb,
.executions-list::-webkit-scrollbar-thumb,
.triangle-history::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%);
  border-radius: 10px;
}

.opportunities-feed::-webkit-scrollbar-thumb:hover,
.executions-list::-webkit-scrollbar-thumb:hover,
.triangle-history::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #673ab7 0%, #9c27b0 100%);
}
</style>
