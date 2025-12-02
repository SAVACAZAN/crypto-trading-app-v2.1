<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAppStore } from '~/stores/app.store';

const app = useAppStore();
let userID = useCookie('userID');

// Bot Collections State
const botCollections = ref({
  gridBots: [],
  frontRunBots: [],
  scalpingBots: [],
  oneClickBots: [],
  fibBots: [],
  aiBots: [],
  coPilotBots: [],
  oneYearBots: [],
  grinderBots: [],
  orderBookBots: [],
  pumpDumpBots: []
});

// Bot Stats
const botStats = ref({
  total: 0,
  running: 0,
  paused: 0,
  stopped: 0,
  profit: 0,
  loss: 0
});

// Selected Bot Type Filter
const selectedBotType = ref('all');
const botTypeOptions = [
  { value: 'all', label: '🎯 All Bots', icon: '🎯' },
  { value: 'gridBots', label: '📊 GridBot', icon: '📊', color: '#00ff88' },
  { value: 'frontRunBots', label: '🏃 FrontRun', icon: '🏃', color: '#ff6b6b' },
  { value: 'scalpingBots', label: '⚡ Scalping', icon: '⚡', color: '#ffd700' },
  { value: 'oneClickBots', label: '🖱️ OneClick', icon: '🖱️', color: '#4ecdc4' },
  { value: 'fibBots', label: '📈 FibBot', icon: '📈', color: '#95e1d3' },
  { value: 'aiBots', label: '🧠 AI Bot', icon: '🧠', color: '#a8e6cf' },
  { value: 'coPilotBots', label: '✈️ Co-Pilot', icon: '✈️', color: '#ffa07a' },
  { value: 'oneYearBots', label: '📅 1YearBot', icon: '📅', color: '#dda0dd' },
  { value: 'grinderBots', label: '⚙️ Grinder', icon: '⚙️', color: '#87ceeb' },
  { value: 'orderBookBots', label: '📖 OrderBook', icon: '📖', color: '#98d8c8' },
  { value: 'pumpDumpBots', label: '💥 Pump&Dump', icon: '💥', color: '#ff1744' }
];

// Command States
const isExecutingCommand = ref(false);
const lastCommand = ref('');

// Correlation & Distribution Analysis
const correlationData = ref({
  volumeSpike: 0,
  priceDeviation: 0,
  orderBookImbalance: 0,
  suspiciousActivity: false
});

// Real-time monitoring
const monitoringActive = ref(false);
let monitoringInterval = null;

// Fetch all bots from all collections
async function fetchAllBots() {
  try {
    // Fetch GridBots
    const gridBotsRes = await $fetch('/api/v1/fetchGridBots', {
      query: { userID: userID.value }
    });
    botCollections.value.gridBots = gridBotsRes.data || [];

    // Fetch FrontRun Bots
    const frontRunRes = await $fetch('/api/v1/fetchFrontRunBots', {
      query: { userID: userID.value }
    });
    botCollections.value.frontRunBots = frontRunRes.data || [];

    // Fetch OneClick Bots
    const oneClickRes = await $fetch('/api/v1/fetchOneClickBots', {
      query: { userID: userID.value }
    });
    botCollections.value.oneClickBots = oneClickRes.data || [];

    // Fetch FibBots
    const fibBotsRes = await $fetch('/api/v1/fetchFibBots', {
      query: { userID: userID.value }
    });
    botCollections.value.fibBots = fibBotsRes.data || [];

    // Calculate stats
    calculateBotStats();
  } catch (error) {
    console.error('Error fetching bots:', error);
  }
}

// Calculate bot statistics
function calculateBotStats() {
  let total = 0;
  let running = 0;
  let totalProfit = 0;

  Object.values(botCollections.value).forEach(collection => {
    total += collection.length;
    collection.forEach(bot => {
      if (bot.status === 'running') running++;
      if (bot.BalanceBot?.BalanceBotProfit) {
        totalProfit += parseFloat(bot.BalanceBot.BalanceBotProfit) || 0;
      }
    });
  });

  botStats.value.total = total;
  botStats.value.running = running;
  botStats.value.paused = 0;
  botStats.value.stopped = total - running;
  botStats.value.profit = totalProfit > 0 ? totalProfit : 0;
  botStats.value.loss = totalProfit < 0 ? Math.abs(totalProfit) : 0;
}

// Get all bots or filtered by type
const displayedBots = computed(() => {
  if (selectedBotType.value === 'all') {
    return Object.entries(botCollections.value).flatMap(([type, bots]) =>
      bots.map(bot => ({ ...bot, botType: type }))
    );
  }
  return botCollections.value[selectedBotType.value].map(bot => ({
    ...bot,
    botType: selectedBotType.value
  }));
});

// Global Commands for ALL Bots
async function executeGlobalCommand(command) {
  isExecutingCommand.value = true;
  lastCommand.value = command;

  try {
    const response = await $fetch('/api/v1/Bots/globalCommand', {
      method: 'POST',
      body: {
        userID: userID.value,
        command: command,
        botType: selectedBotType.value
      }
    });

    console.log(`Global command ${command} executed:`, response);

    // Refresh bots after command
    await fetchAllBots();
  } catch (error) {
    console.error(`Error executing global command ${command}:`, error);
  } finally {
    isExecutingCommand.value = false;
  }
}

// Individual Bot Commands
async function executeBotCommand(bot, command) {
  try {
    const response = await $fetch('/api/v1/Bots/botCommand', {
      method: 'POST',
      body: {
        userID: userID.value,
        botId: bot._id,
        botType: bot.botType,
        command: command
      }
    });

    console.log(`Bot command ${command} executed for ${bot.name}:`, response);
    await fetchAllBots();
  } catch (error) {
    console.error(`Error executing bot command ${command}:`, error);
  }
}

// Pump & Dump Detection Analysis
async function analyzePumpDump() {
  try {
    const response = await $fetch('/api/v1/ML/analyzePumpDump', {
      method: 'POST',
      body: {
        userID: userID.value,
        symbol: app.getUserSelectedMarket,
        exchange: app.getUserSelectedExchange
      }
    });

    correlationData.value = response.data;
  } catch (error) {
    console.error('Error analyzing pump & dump:', error);
  }
}

// Start/Stop Real-time Monitoring
function toggleMonitoring() {
  monitoringActive.value = !monitoringActive.value;

  if (monitoringActive.value) {
    monitoringInterval = setInterval(() => {
      fetchAllBots();
      analyzePumpDump();
    }, 3000); // Update every 3 seconds
  } else {
    clearInterval(monitoringInterval);
  }
}

// Get bot status badge color
function getBotStatusColor(bot) {
  if (bot.activeOrders && bot.activeOrders.length > 0) return '#00ff88';
  if (bot.filledOrders && bot.filledOrders.length > 0) return '#ffd700';
  return '#6c757d';
}

// Get bot type icon
function getBotTypeIcon(botType) {
  const typeConfig = botTypeOptions.find(opt => opt.value === botType);
  return typeConfig ? typeConfig.icon : '🤖';
}

// Get bot type color
function getBotTypeColor(botType) {
  const typeConfig = botTypeOptions.find(opt => opt.value === botType);
  return typeConfig ? typeConfig.color : '#6c757d';
}

// Format profit/loss
function formatProfit(value) {
  const num = parseFloat(value) || 0;
  return num.toFixed(2);
}

onMounted(() => {
  fetchAllBots();
});
</script>

<template>
  <div class="ml-command-center">
    <!-- Header Section -->
    <n-card class="header-card" title="🧠 ML Bot Command Center">
      <template #header-extra>
        <n-button
          :type="monitoringActive ? 'error' : 'success'"
          @click="toggleMonitoring"
          size="small"
        >
          {{ monitoringActive ? '⏸ Stop Monitoring' : '▶ Start Monitoring' }}
        </n-button>
      </template>

      <!-- Stats Dashboard -->
      <n-grid :cols="6" x-gap="12" class="stats-grid">
        <n-gi>
          <div class="stat-card total">
            <div class="stat-icon">🤖</div>
            <div class="stat-value">{{ botStats.total }}</div>
            <div class="stat-label">Total Bots</div>
          </div>
        </n-gi>
        <n-gi>
          <div class="stat-card running">
            <div class="stat-icon">🟢</div>
            <div class="stat-value">{{ botStats.running }}</div>
            <div class="stat-label">Running</div>
          </div>
        </n-gi>
        <n-gi>
          <div class="stat-card paused">
            <div class="stat-icon">⏸</div>
            <div class="stat-value">{{ botStats.paused }}</div>
            <div class="stat-label">Paused</div>
          </div>
        </n-gi>
        <n-gi>
          <div class="stat-card stopped">
            <div class="stat-icon">🔴</div>
            <div class="stat-value">{{ botStats.stopped }}</div>
            <div class="stat-label">Stopped</div>
          </div>
        </n-gi>
        <n-gi>
          <div class="stat-card profit">
            <div class="stat-icon">📈</div>
            <div class="stat-value">+${{ formatProfit(botStats.profit) }}</div>
            <div class="stat-label">Profit</div>
          </div>
        </n-gi>
        <n-gi>
          <div class="stat-card loss">
            <div class="stat-icon">📉</div>
            <div class="stat-value">-${{ formatProfit(botStats.loss) }}</div>
            <div class="stat-label">Loss</div>
          </div>
        </n-gi>
      </n-grid>
    </n-card>

    <!-- Global Control Panel -->
    <n-card class="control-panel" title="🎮 Global Commands">
      <n-space vertical>
        <!-- Bot Type Filter -->
        <n-select
          v-model:value="selectedBotType"
          :options="botTypeOptions"
          placeholder="Select Bot Type"
          size="large"
        />

        <!-- Command Buttons -->
        <n-grid :cols="6" x-gap="8">
          <n-gi>
            <n-button
              type="success"
              block
              @click="executeGlobalCommand('start')"
              :loading="isExecutingCommand && lastCommand === 'start'"
            >
              ▶ Run All
            </n-button>
          </n-gi>
          <n-gi>
            <n-button
              type="warning"
              block
              @click="executeGlobalCommand('pause')"
              :loading="isExecutingCommand && lastCommand === 'pause'"
            >
              ⏸ Pause All
            </n-button>
          </n-gi>
          <n-gi>
            <n-button
              type="error"
              block
              @click="executeGlobalCommand('stop')"
              :loading="isExecutingCommand && lastCommand === 'stop'"
            >
              ⏹ Stop All
            </n-button>
          </n-gi>
          <n-gi>
            <n-button
              type="info"
              block
              @click="executeGlobalCommand('buyAll')"
              :loading="isExecutingCommand && lastCommand === 'buyAll'"
            >
              💰 Buy All
            </n-button>
          </n-gi>
          <n-gi>
            <n-button
              type="info"
              block
              @click="executeGlobalCommand('sellAll')"
              :loading="isExecutingCommand && lastCommand === 'sellAll'"
            >
              💸 Sell All
            </n-button>
          </n-gi>
          <n-gi>
            <n-button
              type="default"
              block
              @click="executeGlobalCommand('close')"
              :loading="isExecutingCommand && lastCommand === 'close'"
            >
              🔒 Close All
            </n-button>
          </n-gi>
        </n-grid>

        <!-- Advanced Commands -->
        <n-grid :cols="3" x-gap="8">
          <n-gi>
            <n-button
              block
              @click="executeGlobalCommand('regroup')"
              :loading="isExecutingCommand && lastCommand === 'regroup'"
            >
              🔄 Regroup
            </n-button>
          </n-gi>
          <n-gi>
            <n-button
              block
              @click="executeGlobalCommand('rebalance')"
              :loading="isExecutingCommand && lastCommand === 'rebalance'"
            >
              ⚖️ Rebalance
            </n-button>
          </n-gi>
          <n-gi>
            <n-button
              block
              type="error"
              @click="executeGlobalCommand('cancelAll')"
              :loading="isExecutingCommand && lastCommand === 'cancelAll'"
            >
              ❌ Cancel Orders
            </n-button>
          </n-gi>
        </n-grid>
      </n-space>
    </n-card>

    <!-- Pump & Dump Detection -->
    <n-card class="pump-dump-card" title="💥 Pump & Dump Detection">
      <n-grid :cols="4" x-gap="12">
        <n-gi>
          <div class="correlation-stat">
            <div class="correlation-label">Volume Spike</div>
            <n-progress
              type="line"
              :percentage="correlationData.volumeSpike"
              :color="correlationData.volumeSpike > 70 ? '#ff1744' : '#00ff88'"
            />
          </div>
        </n-gi>
        <n-gi>
          <div class="correlation-stat">
            <div class="correlation-label">Price Deviation</div>
            <n-progress
              type="line"
              :percentage="correlationData.priceDeviation"
              :color="correlationData.priceDeviation > 70 ? '#ff1744' : '#00ff88'"
            />
          </div>
        </n-gi>
        <n-gi>
          <div class="correlation-stat">
            <div class="correlation-label">OrderBook Imbalance</div>
            <n-progress
              type="line"
              :percentage="correlationData.orderBookImbalance"
              :color="correlationData.orderBookImbalance > 70 ? '#ff1744' : '#00ff88'"
            />
          </div>
        </n-gi>
        <n-gi>
          <div class="correlation-stat">
            <div class="correlation-label">Suspicious Activity</div>
            <n-tag
              :type="correlationData.suspiciousActivity ? 'error' : 'success'"
              size="large"
            >
              {{ correlationData.suspiciousActivity ? '⚠ ALERT' : '✓ Clear' }}
            </n-tag>
          </div>
        </n-gi>
      </n-grid>
      <n-button block type="primary" @click="analyzePumpDump" style="margin-top: 12px;">
        🔍 Analyze Now
      </n-button>
    </n-card>

    <!-- Bots List -->
    <n-card class="bots-list-card" title="🤖 Active Bots">
      <n-scrollbar style="max-height: 600px;">
        <div class="bots-grid">
          <div
            v-for="bot in displayedBots"
            :key="bot._id"
            class="bot-item"
            :style="{ borderLeft: `4px solid ${getBotTypeColor(bot.botType)}` }"
          >
            <!-- Bot Header -->
            <div class="bot-header">
              <div class="bot-icon">{{ getBotTypeIcon(bot.botType) }}</div>
              <div class="bot-info">
                <div class="bot-name">{{ bot.name }}</div>
                <div class="bot-symbol">{{ bot.symbol }} @ {{ bot.exchange }}</div>
              </div>
              <div class="bot-status-badge" :style="{ backgroundColor: getBotStatusColor(bot) }">
                ●
              </div>
            </div>

            <!-- Bot Stats -->
            <div class="bot-stats">
              <div class="bot-stat">
                <span class="label">Active Orders:</span>
                <span class="value">{{ bot.activeOrders?.length || 0 }}</span>
              </div>
              <div class="bot-stat">
                <span class="label">Filled Orders:</span>
                <span class="value">{{ bot.filledOrders?.length || 0 }}</span>
              </div>
              <div class="bot-stat">
                <span class="label">Profit:</span>
                <span
                  class="value profit"
                  :class="{
                    positive: parseFloat(bot.BalanceBot?.BalanceBotProfit || 0) > 0,
                    negative: parseFloat(bot.BalanceBot?.BalanceBotProfit || 0) < 0
                  }"
                >
                  {{ formatProfit(bot.BalanceBot?.BalanceBotProfit || 0) }} USD
                </span>
              </div>
            </div>

            <!-- Bot Controls -->
            <div class="bot-controls">
              <n-button-group size="small">
                <n-button type="success" @click="executeBotCommand(bot, 'start')">▶</n-button>
                <n-button type="warning" @click="executeBotCommand(bot, 'pause')">⏸</n-button>
                <n-button type="error" @click="executeBotCommand(bot, 'stop')">⏹</n-button>
                <n-button @click="executeBotCommand(bot, 'close')">🔒</n-button>
              </n-button-group>
            </div>
          </div>
        </div>
      </n-scrollbar>
    </n-card>
  </div>
</template>

<style scoped>
.ml-command-center {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
  min-height: 100vh;
}

.header-card {
  background: rgba(15, 20, 40, 0.9);
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.stats-grid {
  margin-top: 12px;
}

.stat-card {
  background: rgba(20, 25, 45, 0.8);
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 255, 136, 0.2);
}

.stat-card.total { border-color: #6c757d; }
.stat-card.running { border-color: #00ff88; }
.stat-card.paused { border-color: #ffd700; }
.stat-card.stopped { border-color: #ff6b6b; }
.stat-card.profit { border-color: #00ff88; }
.stat-card.loss { border-color: #ff1744; }

.stat-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
}

.control-panel {
  background: rgba(15, 20, 40, 0.9);
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.pump-dump-card {
  background: rgba(15, 20, 40, 0.9);
  border: 1px solid rgba(255, 23, 68, 0.3);
}

.correlation-stat {
  padding: 12px;
  background: rgba(20, 25, 45, 0.6);
  border-radius: 8px;
}

.correlation-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  text-transform: uppercase;
}

.bots-list-card {
  background: rgba(15, 20, 40, 0.9);
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.bots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
  padding: 8px;
}

.bot-item {
  background: rgba(20, 25, 45, 0.8);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
}

.bot-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 255, 136, 0.15);
  background: rgba(25, 30, 50, 0.9);
}

.bot-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.bot-icon {
  font-size: 32px;
}

.bot-info {
  flex: 1;
}

.bot-name {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 4px;
}

.bot-symbol {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.bot-status-badge {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.bot-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  padding: 12px;
  background: rgba(10, 15, 30, 0.6);
  border-radius: 8px;
}

.bot-stat {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.bot-stat .label {
  color: rgba(255, 255, 255, 0.6);
}

.bot-stat .value {
  color: #fff;
  font-weight: bold;
}

.bot-stat .value.profit.positive {
  color: #00ff88;
}

.bot-stat .value.profit.negative {
  color: #ff1744;
}

.bot-controls {
  margin-top: 12px;
}
</style>