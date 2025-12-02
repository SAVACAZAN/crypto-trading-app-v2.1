<template>
  <div class="whale-alert-bot-page">
    <!-- TOP: News Bots Navigation -->
    <div class="news-bots-nav">
   
      <div class="nav-tabs-container">
        <button
          v-for="bot in newsBots"
          :key="bot.id"
          :class="['news-tab-btn', { active: currentBotId === bot.id }]"
          @click="navigateToNewsBot(bot.id)"
        >
          <span class="tab-icon">{{ bot.icon }}</span>
          <span class="tab-name">{{ bot.name }}</span>
          <span v-if="bot.status === 'active'" class="status-badge active">LIVE</span>
          <span v-else-if="bot.status === 'coming'" class="status-badge coming">SOON</span>
        </button>
      </div>
    </div>

    <!-- MAIN CONTENT: 3-Column Whale Alert Layout -->
    <div class="whale-grid-layout">
      <!-- LEFT COLUMN: Live Whale Movements & Statistics -->
      <div class="left-column">
        <!-- Live Whale Movements Feed -->
        <n-card title="🐋 Live Whale Movements" :bordered="false" class="whale-card">
          <div class="whale-movements-feed">
            <div
              v-for="movement in whaleMovements"
              :key="movement.id"
              class="whale-movement-item"
            >
              <div class="movement-header">
                <span class="whale-icon">🐋</span>
                <span :class="['movement-type', movement.type]">
                  {{ movement.type === 'buy' ? '📈 BUY' : '📉 SELL' }}
                </span>
                <span class="movement-time">{{ movement.time }}</span>
              </div>
              <div class="movement-details">
                <div class="detail-row">
                  <span class="label">Amount:</span>
                  <span class="value amount">{{ movement.amount }} {{ movement.symbol }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">USD Value:</span>
                  <span class="value usd">${{ movement.usdValue.toLocaleString() }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">From:</span>
                  <span class="value address">{{ movement.from }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">To:</span>
                  <span class="value address">{{ movement.to }}</span>
                </div>
                <div v-if="movement.news" class="news-correlation">
                  <span class="news-icon">📰</span>
                  <span class="news-text">{{ movement.news }}</span>
                </div>
              </div>
              <div class="movement-actions">
                <n-button size="tiny" type="primary" @click="createSignalFromMovement(movement)">
                  Create Signal
                </n-button>
              </div>
            </div>
          </div>
        </n-card>

        <!-- Whale Statistics -->
        <n-card title="📊 Whale Statistics" :bordered="false" class="whale-card">
          <div class="whale-stats">
            <div class="stat-box">
              <div class="stat-label">Total Whales Tracked</div>
              <div class="stat-value">{{ whaleStats.totalWhales }}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">24h Movements</div>
              <div class="stat-value">{{ whaleStats.movements24h }}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">24h Volume</div>
              <div class="stat-value">${{ whaleStats.volume24h.toLocaleString() }}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Buy/Sell Ratio</div>
              <div class="stat-value">{{ whaleStats.buySellRatio }}</div>
            </div>
          </div>

          <!-- Whale Activity Chart -->
          <div class="activity-chart">
            <div class="chart-title">24h Whale Activity</div>
            <div class="chart-bars">
              <div
                v-for="hour in whaleActivityChart"
                :key="hour.hour"
                class="chart-bar-group"
              >
                <div class="bar-container">
                  <div class="bar buy" :style="{ height: hour.buyPercent + '%' }"></div>
                  <div class="bar sell" :style="{ height: hour.sellPercent + '%' }"></div>
                </div>
                <div class="bar-label">{{ hour.hour }}</div>
              </div>
            </div>
          </div>
        </n-card>
      </div>

      <!-- CENTER COLUMN: Bot Configuration -->
      <div class="center-column">
        <n-card title="⚡ Whale Alert Bot Configuration" :bordered="false" class="config-card">
          <n-tabs type="line" animated>
            <!-- TAB 1: Basic Config -->
            <n-tab-pane name="basic" tab="⚙️ Basic Config">
              <div class="config-section">
                <div class="form-group">
                  <label>Exchange</label>
                  <n-select
                    v-model:value="botConfig.exchange"
                    :options="exchangeOptions"
                    placeholder="Select exchange"
                  />
                </div>

                <div class="form-group">
                  <label>Trading Pair</label>
                  <n-select
                    v-model:value="botConfig.symbol"
                    :options="symbolOptions"
                    placeholder="Select trading pair"
                  />
                </div>

                <div class="form-group">
                  <label>Minimum Whale Size (USD)</label>
                  <n-input-number
                    v-model:value="botConfig.minWhaleSize"
                    :min="10000"
                    :step="10000"
                    :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  />
                </div>

                <div class="form-group">
                  <label>Trade Amount per Signal (%)</label>
                  <n-slider
                    v-model:value="botConfig.tradePercent"
                    :min="1"
                    :max="100"
                    :step="1"
                    :marks="{ 1: '1%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }"
                  />
                </div>

                <div class="form-group">
                  <label>Auto-Execute Trades</label>
                  <n-checkbox v-model:checked="botConfig.autoExecute">
                    Automatically execute trades based on whale signals
                  </n-checkbox>
                </div>
              </div>
            </n-tab-pane>

            <!-- TAB 2: Whale Filters -->
            <n-tab-pane name="filters" tab="🎯 Whale Filters">
              <div class="config-section">
                <div class="form-group">
                  <label>Track Whale Types</label>
                  <n-checkbox-group v-model:value="botConfig.whaleTypes">
                    <n-checkbox value="exchange" label="Exchange Whales" />
                    <n-checkbox value="private" label="Private Wallets" />
                    <n-checkbox value="institutional" label="Institutional" />
                    <n-checkbox value="smartmoney" label="Smart Money" />
                  </n-checkbox-group>
                </div>

                <div class="form-group">
                  <label>Movement Types to Track</label>
                  <n-checkbox-group v-model:value="botConfig.movementTypes">
                    <n-checkbox value="buy" label="Large Buys" />
                    <n-checkbox value="sell" label="Large Sells" />
                    <n-checkbox value="transfer" label="Wallet Transfers" />
                    <n-checkbox value="accumulation" label="Accumulation Patterns" />
                  </n-checkbox-group>
                </div>

                <div class="form-group">
                  <label>Time Window (minutes)</label>
                  <n-input-number
                    v-model:value="botConfig.timeWindow"
                    :min="1"
                    :max="1440"
                    :step="5"
                  />
                  <small>React to whale movements within this time window</small>
                </div>

                <div class="form-group">
                  <label>Correlation Threshold</label>
                  <n-slider
                    v-model:value="botConfig.correlationThreshold"
                    :min="0"
                    :max="100"
                    :step="5"
                    :marks="{ 0: '0%', 50: '50%', 100: '100%' }"
                  />
                  <small>Minimum correlation between whale movements and news events</small>
                </div>
              </div>
            </n-tab-pane>

            <!-- TAB 3: Risk Management -->
            <n-tab-pane name="risk" tab="🛡️ Risk Management">
              <div class="config-section">
                <div class="form-group">
                  <label>Max Daily Loss (%)</label>
                  <n-input-number
                    v-model:value="botConfig.maxDailyLoss"
                    :min="1"
                    :max="50"
                    :step="1"
                  />
                </div>

                <div class="form-group">
                  <label>Stop Loss (%)</label>
                  <n-input-number
                    v-model:value="botConfig.stopLoss"
                    :min="0.1"
                    :max="20"
                    :step="0.1"
                  />
                </div>

                <div class="form-group">
                  <label>Take Profit (%)</label>
                  <n-input-number
                    v-model:value="botConfig.takeProfit"
                    :min="0.5"
                    :max="50"
                    :step="0.5"
                  />
                </div>

                <div class="form-group">
                  <label>Max Concurrent Trades</label>
                  <n-input-number
                    v-model:value="botConfig.maxConcurrentTrades"
                    :min="1"
                    :max="20"
                    :step="1"
                  />
                </div>

                <div class="form-group">
                  <label>Whale Reversal Protection</label>
                  <n-checkbox v-model:checked="botConfig.reversalProtection">
                    Automatically close positions if whale reverses within 15 minutes
                  </n-checkbox>
                </div>
              </div>
            </n-tab-pane>

            <!-- TAB 4: Alert Settings -->
            <n-tab-pane name="alerts" tab="🔔 Alert Settings">
              <div class="config-section">
                <div class="form-group">
                  <label>Alert Channels</label>
                  <n-checkbox-group v-model:value="botConfig.alertChannels">
                    <n-checkbox value="telegram" label="Telegram" />
                    <n-checkbox value="email" label="Email" />
                    <n-checkbox value="discord" label="Discord" />
                    <n-checkbox value="sms" label="SMS" />
                    <n-checkbox value="whatsapp" label="WhatsApp" />
                  </n-checkbox-group>
                </div>

                <div class="form-group">
                  <label>Alert on Whale Size (USD)</label>
                  <n-input-number
                    v-model:value="botConfig.alertThreshold"
                    :min="50000"
                    :step="50000"
                    :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  />
                </div>

                <div class="form-group">
                  <label>News Correlation Alerts</label>
                  <n-checkbox v-model:checked="botConfig.newsAlerts">
                    Send alerts when whale movements correlate with breaking news
                  </n-checkbox>
                </div>

                <div class="form-group">
                  <label>Smart Money Alerts</label>
                  <n-checkbox v-model:checked="botConfig.smartMoneyAlerts">
                    Alert when known smart money wallets make moves
                  </n-checkbox>
                </div>

                <div class="form-group">
                  <label>Alert Frequency Limit</label>
                  <n-select
                    v-model:value="botConfig.alertFrequency"
                    :options="alertFrequencyOptions"
                    placeholder="Select frequency"
                  />
                </div>
              </div>
            </n-tab-pane>
          </n-tabs>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <n-button
              type="success"
              size="large"
              :loading="botRunning"
              @click="toggleBot"
            >
              {{ botRunning ? '⏸️ Stop Bot' : '▶️ Start Bot' }}
            </n-button>
            <n-button type="info" size="large" @click="saveConfig">
              💾 Save Config
            </n-button>
            <n-button type="warning" size="large" @click="resetConfig">
              🔄 Reset to Default
            </n-button>
          </div>
        </n-card>
      </div>

      <!-- RIGHT COLUMN: Active Alerts & Performance -->
      <div class="right-column">
        <!-- Active Whale Signals -->
        <n-card title="🎯 Active Whale Signals" :bordered="false" class="signals-card">
          <div class="signals-list">
            <div
              v-for="signal in activeSignals"
              :key="signal.id"
              :class="['signal-item', signal.type]"
            >
              <div class="signal-header">
                <span class="signal-icon">{{ signal.type === 'buy' ? '🟢' : '🔴' }}</span>
                <span class="signal-type">{{ signal.type.toUpperCase() }}</span>
                <span class="signal-strength" :style="{ background: getStrengthColor(signal.strength) }">
                  {{ signal.strength }}%
                </span>
              </div>
              <div class="signal-details">
                <div class="signal-row">
                  <span class="label">Pair:</span>
                  <span class="value">{{ signal.symbol }}</span>
                </div>
                <div class="signal-row">
                  <span class="label">Price:</span>
                  <span class="value">${{ signal.price }}</span>
                </div>
                <div class="signal-row">
                  <span class="label">Whale Size:</span>
                  <span class="value">${{ signal.whaleSize.toLocaleString() }}</span>
                </div>
                <div class="signal-row">
                  <span class="label">Correlation:</span>
                  <span class="value">{{ signal.correlation }}%</span>
                </div>
              </div>
              <div class="signal-actions">
                <n-button size="tiny" type="success" @click="executeSignal(signal)">
                  Execute
                </n-button>
                <n-button size="tiny" type="error" @click="dismissSignal(signal)">
                  Dismiss
                </n-button>
              </div>
            </div>
          </div>
        </n-card>

        <!-- Bot Performance Stats -->
        <n-card title="📈 Bot Performance" :bordered="false" class="performance-card">
          <div class="performance-stats">
            <div class="stat-item">
              <div class="stat-icon">💰</div>
              <div class="stat-content">
                <div class="stat-label">Total Profit</div>
                <div class="stat-value profit">+$12,456.78</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon">🎯</div>
              <div class="stat-content">
                <div class="stat-label">Win Rate</div>
                <div class="stat-value">76.8%</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon">📊</div>
              <div class="stat-content">
                <div class="stat-label">Signals Today</div>
                <div class="stat-value">24</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon">⚡</div>
              <div class="stat-content">
                <div class="stat-label">Executed Trades</div>
                <div class="stat-value">18</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon">🐋</div>
              <div class="stat-content">
                <div class="stat-label">Whales Tracked</div>
                <div class="stat-value">157</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon">📰</div>
              <div class="stat-content">
                <div class="stat-label">News Correlations</div>
                <div class="stat-value">42</div>
              </div>
            </div>
          </div>

          <!-- Performance Progress Bars -->
          <div class="performance-progress">
            <div class="progress-item">
              <div class="progress-label">
                <span>Profitability</span>
                <span class="progress-value">89%</span>
              </div>
              <n-progress type="line" :percentage="89" status="success" :show-indicator="false" />
            </div>

            <div class="progress-item">
              <div class="progress-label">
                <span>Accuracy</span>
                <span class="progress-value">76%</span>
              </div>
              <n-progress type="line" :percentage="76" status="info" :show-indicator="false" />
            </div>

            <div class="progress-item">
              <div class="progress-label">
                <span>Risk Level</span>
                <span class="progress-value">34%</span>
              </div>
              <n-progress type="line" :percentage="34" status="warning" :show-indicator="false" />
            </div>
          </div>
        </n-card>

        <!-- Recent Whale Trade History -->
        <n-card title="📜 Recent Whale Trades" :bordered="false" class="history-card">
          <div class="trade-history">
            <div
              v-for="trade in tradeHistory"
              :key="trade.id"
              :class="['trade-item', trade.result]"
            >
              <div class="trade-header">
                <span :class="['trade-type', trade.type]">{{ trade.type }}</span>
                <span class="trade-time">{{ trade.time }}</span>
              </div>
              <div class="trade-info">
                <span class="trade-symbol">{{ trade.symbol }}</span>
                <span :class="['trade-profit', trade.result]">
                  {{ trade.profit > 0 ? '+' : '' }}${{ trade.profit.toFixed(2) }}
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
const currentBotId = ref('news-whale');

// TOP 10 NEWS-RELATED BOTS
const newsBots = ref([
  {
    id: 'scalp-news',
    name: 'News Scalping',
    icon: '📰',
    description: 'Real-time news trading with AI sentiment analysis',
    status: 'active'
  },
  {
    id: 'news-whale',
    name: 'Whale Alert',
    icon: '🐋',
    description: 'Track whale movements and news correlation',
    status: 'active'
  },
  {
    id: 'news-sentiment',
    name: 'Sentiment Tracker',
    icon: '😊',
    description: 'Social media sentiment analysis',
    status: 'coming'
  },
  {
    id: 'news-flash',
    name: 'Flash News',
    icon: '⚡',
    description: 'Ultra-fast news reaction trading',
    status: 'coming'
  },
  {
    id: 'news-event',
    name: 'Event Trader',
    icon: '📅',
    description: 'Trade based on scheduled events',
    status: 'coming'
  },
  {
    id: 'news-twitter',
    name: 'Twitter Monitor',
    icon: '🐦',
    description: 'Track influential crypto Twitter accounts',
    status: 'coming'
  },
  {
    id: 'news-reddit',
    name: 'Reddit Pulse',
    icon: '🔥',
    description: 'Reddit sentiment and trending analysis',
    status: 'coming'
  },
  {
    id: 'news-insider',
    name: 'Insider Alert',
    icon: '🕵️',
    description: 'Detect potential insider trading patterns',
    status: 'coming'
  },
  {
    id: 'news-correlation',
    name: 'News Correlation',
    icon: '🔗',
    description: 'Multi-source news correlation engine',
    status: 'coming'
  },
  {
    id: 'news-ai',
    name: 'AI News Bot',
    icon: '🤖',
    description: 'Advanced AI-powered news interpretation',
    status: 'coming'
  }
]);

// Bot Configuration
const botConfig = ref({
  exchange: 'binance',
  symbol: 'BTC/USDT',
  minWhaleSize: 100000,
  tradePercent: 10,
  autoExecute: false,
  whaleTypes: ['exchange', 'institutional'],
  movementTypes: ['buy', 'sell'],
  timeWindow: 15,
  correlationThreshold: 60,
  maxDailyLoss: 5,
  stopLoss: 2,
  takeProfit: 5,
  maxConcurrentTrades: 5,
  reversalProtection: true,
  alertChannels: ['telegram'],
  alertThreshold: 500000,
  newsAlerts: true,
  smartMoneyAlerts: true,
  alertFrequency: 'medium'
});

// Bot State
const botRunning = ref(false);

// Live Whale Movements (Simulated)
const whaleMovements = ref([
  {
    id: 1,
    type: 'buy',
    amount: '547.82',
    symbol: 'BTC',
    usdValue: 28456000,
    from: '0x742d...891a',
    to: 'Binance Hot Wallet',
    time: '2 min ago',
    news: 'Breaking: BlackRock files for spot Bitcoin ETF'
  },
  {
    id: 2,
    type: 'sell',
    amount: '1,250,000',
    symbol: 'ETH',
    usdValue: 3125000,
    from: 'Kraken Exchange',
    to: '0x9a3f...42bc',
    time: '5 min ago',
    news: null
  },
  {
    id: 3,
    type: 'buy',
    amount: '3,200,000',
    symbol: 'USDT',
    usdValue: 3200000,
    from: '0x1b4e...67cd',
    to: 'Coinbase Pro',
    time: '8 min ago',
    news: 'Fed announces interest rate decision'
  }
]);

// Whale Statistics
const whaleStats = ref({
  totalWhales: 157,
  movements24h: 342,
  volume24h: 1250000000,
  buySellRatio: '2.4:1'
});

// Whale Activity Chart (24h)
const whaleActivityChart = ref([
  { hour: '00', buyPercent: 45, sellPercent: 30 },
  { hour: '04', buyPercent: 30, sellPercent: 25 },
  { hour: '08', buyPercent: 65, sellPercent: 40 },
  { hour: '12', buyPercent: 80, sellPercent: 55 },
  { hour: '16', buyPercent: 70, sellPercent: 45 },
  { hour: '20', buyPercent: 55, sellPercent: 35 },
  { hour: '23', buyPercent: 50, sellPercent: 32 }
]);

// Active Whale Signals
const activeSignals = ref([
  {
    id: 1,
    type: 'buy',
    symbol: 'BTC/USDT',
    price: 51923.45,
    whaleSize: 28456000,
    correlation: 87,
    strength: 92
  },
  {
    id: 2,
    type: 'buy',
    symbol: 'ETH/USDT',
    price: 2501.32,
    whaleSize: 5200000,
    correlation: 72,
    strength: 78
  },
  {
    id: 3,
    type: 'sell',
    symbol: 'SOL/USDT',
    price: 102.45,
    whaleSize: 1850000,
    correlation: 65,
    strength: 68
  }
]);

// Trade History
const tradeHistory = ref([
  { id: 1, type: 'BUY', symbol: 'BTC/USDT', profit: 234.56, result: 'win', time: '10 min ago' },
  { id: 2, type: 'SELL', symbol: 'ETH/USDT', profit: -45.23, result: 'loss', time: '25 min ago' },
  { id: 3, type: 'BUY', symbol: 'SOL/USDT', profit: 156.78, result: 'win', time: '1h ago' },
  { id: 4, type: 'BUY', symbol: 'BTC/USDT', profit: 389.12, result: 'win', time: '2h ago' }
]);

// Options
const exchangeOptions = [
  { label: 'Binance', value: 'binance' },
  { label: 'Coinbase', value: 'coinbase' },
  { label: 'Kraken', value: 'kraken' },
  { label: 'LCX', value: 'lcx' }
];

const symbolOptions = [
  { label: 'BTC/USDT', value: 'BTC/USDT' },
  { label: 'ETH/USDT', value: 'ETH/USDT' },
  { label: 'SOL/USDT', value: 'SOL/USDT' },
  { label: 'BNB/USDT', value: 'BNB/USDT' }
];

const alertFrequencyOptions = [
  { label: 'Low (Max 5 per hour)', value: 'low' },
  { label: 'Medium (Max 15 per hour)', value: 'medium' },
  { label: 'High (Max 30 per hour)', value: 'high' },
  { label: 'Unlimited', value: 'unlimited' }
];

// Navigate to different news bot
const navigateToNewsBot = (botId) => {
  if (botId === 'scalp-news') {
    navigateTo('/PalantirApp/Bots/DeployBot?botId=scalp-news');
  } else if (botId === 'news-whale') {
    currentBotId.value = botId;
  } else {
    message.info(`${botId} - Coming Soon!`);
  }
};

// Get strength color
const getStrengthColor = (strength) => {
  if (strength >= 80) return 'linear-gradient(135deg, #10eb04 0%, #0ab800 100%)';
  if (strength >= 60) return 'linear-gradient(135deg, #f5d020 0%, #f5a623 100%)';
  return 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)';
};

// Create signal from whale movement
const createSignalFromMovement = (movement) => {
  message.success(`Signal created from whale movement: ${movement.amount} ${movement.symbol}`);
};

// Execute signal
const executeSignal = (signal) => {
  message.success(`Executing ${signal.type.toUpperCase()} signal for ${signal.symbol}`);
};

// Dismiss signal
const dismissSignal = (signal) => {
  const index = activeSignals.value.findIndex(s => s.id === signal.id);
  if (index > -1) {
    activeSignals.value.splice(index, 1);
    message.info('Signal dismissed');
  }
};

// Toggle bot
const toggleBot = () => {
  botRunning.value = !botRunning.value;
  if (botRunning.value) {
    message.success('🐋 Whale Alert Bot Started!');
  } else {
    message.warning('⏸️ Whale Alert Bot Stopped');
  }
};

// Save config
const saveConfig = () => {
  message.success('✅ Configuration saved successfully!');
};

// Reset config
const resetConfig = () => {
  message.info('🔄 Configuration reset to default');
};

// Simulate real-time whale movements
let movementInterval;

onMounted(() => {
  // Simulate new whale movements every 30 seconds
  movementInterval = setInterval(() => {
    const types = ['buy', 'sell'];
    const symbols = ['BTC', 'ETH', 'SOL', 'BNB'];
    const newsEvents = [
      'Breaking: Major exchange announces new listing',
      'Fed announces monetary policy update',
      'SEC approves new crypto regulation',
      null,
      null
    ];

    const newMovement = {
      id: Date.now(),
      type: types[Math.floor(Math.random() * types.length)],
      amount: (Math.random() * 1000 + 100).toFixed(2),
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      usdValue: Math.floor(Math.random() * 50000000 + 1000000),
      from: `0x${Math.random().toString(16).substr(2, 4)}...${Math.random().toString(16).substr(2, 4)}`,
      to: `0x${Math.random().toString(16).substr(2, 4)}...${Math.random().toString(16).substr(2, 4)}`,
      time: 'Just now',
      news: newsEvents[Math.floor(Math.random() * newsEvents.length)]
    };

    whaleMovements.value.unshift(newMovement);
    if (whaleMovements.value.length > 10) {
      whaleMovements.value.pop();
    }
  }, 30000);
});

onUnmounted(() => {
  if (movementInterval) {
    clearInterval(movementInterval);
  }
});
</script>

<style scoped>
/* ========== MAIN PAGE LAYOUT ========== */
.whale-alert-bot-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  padding: 0;
}

/* ========== NEWS BOTS NAVIGATION (WHALE THEME - BLUE) ========== */
.news-bots-nav {
  background: linear-gradient(135deg, #1a1f2e 0%, #2a3441 100%);
  border-bottom: 2px solid #4a90e2;
  padding: 16px 20px;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.nav-icon {
  font-size: 28px;
}

.nav-header h1 {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #4a90e2 0%, #6db3f2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.nav-tabs-container {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.news-tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(74, 144, 226, 0.3);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.news-tab-btn:hover {
  background: rgba(74, 144, 226, 0.2);
  border-color: #4a90e2;
  color: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
}

.news-tab-btn.active {
  background: linear-gradient(135deg, #4a90e2 0%, #6db3f2 100%);
  border-color: #4a90e2;
  color: #fff;
  box-shadow: 0 4px 16px rgba(74, 144, 226, 0.5);
}

.tab-icon {
  font-size: 16px;
}

.tab-name {
  font-size: 12px;
}

.status-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  margin-left: 4px;
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

/* ========== 3-COLUMN GRID LAYOUT ========== */
.whale-grid-layout {
  display: grid;
  grid-template-columns: 350px 1fr 350px;
  gap: 16px;
  padding: 16px;
  max-width: 100%;
}

@media (max-width: 1600px) {
  .whale-grid-layout {
    grid-template-columns: 1fr;
  }
}

/* ========== COLUMNS ========== */
.left-column,
.center-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ========== CARDS ========== */
.whale-card,
.config-card,
.signals-card,
.performance-card,
.history-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(74, 144, 226, 0.3);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* ========== WHALE MOVEMENTS FEED ========== */
.whale-movements-feed {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.whale-movement-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s ease;
}

.whale-movement-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: #4a90e2;
  transform: translateY(-2px);
}

.movement-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.whale-icon {
  font-size: 20px;
}

.movement-type {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
}

.movement-type.buy {
  background: rgba(16, 235, 4, 0.2);
  color: #10eb04;
}

.movement-type.sell {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
}

.movement-time {
  margin-left: auto;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.movement-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.detail-row .label {
  color: rgba(255, 255, 255, 0.6);
}

.detail-row .value {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.detail-row .value.amount {
  color: #4a90e2;
}

.detail-row .value.usd {
  color: #10eb04;
}

.detail-row .value.address {
  font-family: monospace;
  font-size: 11px;
}

.news-correlation {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  background: rgba(245, 166, 35, 0.1);
  border-left: 2px solid #f5a623;
  border-radius: 4px;
  margin-top: 4px;
}

.news-icon {
  font-size: 14px;
}

.news-text {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
}

.movement-actions {
  display: flex;
  gap: 8px;
}

/* ========== WHALE STATISTICS ========== */
.whale-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-box {
  background: rgba(74, 144, 226, 0.1);
  border: 1px solid rgba(74, 144, 226, 0.3);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}

.stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #4a90e2;
}

/* ========== ACTIVITY CHART ========== */
.activity-chart {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 12px;
}

.chart-title {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12px;
}

.chart-bars {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 100px;
  gap: 8px;
}

.chart-bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bar-container {
  width: 100%;
  height: 80px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
}

.bar {
  width: 40%;
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
}

.bar.buy {
  background: linear-gradient(to top, #10eb04 0%, #0ab800 100%);
}

.bar.sell {
  background: linear-gradient(to top, #ff6b6b 0%, #ee5a52 100%);
}

.bar-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

/* ========== CONFIG SECTION ========== */
.config-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.form-group small {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: -4px;
}

/* ========== ACTION BUTTONS ========== */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* ========== ACTIVE SIGNALS ========== */
.signals-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.signal-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s ease;
}

.signal-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.signal-item.buy {
  border-left: 3px solid #10eb04;
}

.signal-item.sell {
  border-left: 3px solid #ff6b6b;
}

.signal-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.signal-icon {
  font-size: 16px;
}

.signal-type {
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.signal-strength {
  margin-left: auto;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
}

.signal-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.signal-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.signal-row .label {
  color: rgba(255, 255, 255, 0.6);
}

.signal-row .value {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.signal-actions {
  display: flex;
  gap: 8px;
}

/* ========== PERFORMANCE STATS ========== */
.performance-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
}

.stat-icon {
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.stat-value.profit {
  color: #10eb04;
}

/* ========== PERFORMANCE PROGRESS ========== */
.performance-progress {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.progress-value {
  font-weight: 700;
  color: #4a90e2;
}

/* ========== TRADE HISTORY ========== */
.trade-history {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.trade-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px;
}

.trade-item.win {
  border-left: 2px solid #10eb04;
}

.trade-item.loss {
  border-left: 2px solid #ff6b6b;
}

.trade-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.trade-type {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.trade-type.BUY {
  background: rgba(16, 235, 4, 0.2);
  color: #10eb04;
}

.trade-type.SELL {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
}

.trade-time {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
}

.trade-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trade-symbol {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.trade-profit {
  font-size: 12px;
  font-weight: 700;
}

.trade-profit.win {
  color: #10eb04;
}

.trade-profit.loss {
  color: #ff6b6b;
}

/* ========== SCROLLBAR STYLING ========== */
.whale-movements-feed::-webkit-scrollbar,
.signals-list::-webkit-scrollbar,
.trade-history::-webkit-scrollbar,
.nav-tabs-container::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.whale-movements-feed::-webkit-scrollbar-track,
.signals-list::-webkit-scrollbar-track,
.trade-history::-webkit-scrollbar-track,
.nav-tabs-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.whale-movements-feed::-webkit-scrollbar-thumb,
.signals-list::-webkit-scrollbar-thumb,
.trade-history::-webkit-scrollbar-thumb,
.nav-tabs-container::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #4a90e2 0%, #6db3f2 100%);
  border-radius: 10px;
}

.whale-movements-feed::-webkit-scrollbar-thumb:hover,
.signals-list::-webkit-scrollbar-thumb:hover,
.trade-history::-webkit-scrollbar-thumb:hover,
.nav-tabs-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #6db3f2 0%, #4a90e2 100%);
}
</style>
