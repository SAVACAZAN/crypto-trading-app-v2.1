<template>
  <div class="dashboard-grid">
    <!-- Bot Types Card -->
    <BotTypesCard
      :selected="selectedBotType"
      @update:selected="$emit('update:selectedBotType', $event)"
      :rules-count="rulesCountByType"
      @show-info="$emit('show-bot-info', $event)"
    />

    <!-- Chain Monitor -->
    <n-card class="dashboard-card" size="small">
      <template #header>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">⛓️</span>
          <span>Chain Monitor</span>
          <n-tag size="tiny" :type="chainMonitorActive ? 'success' : 'default'">
            {{ chainMonitorActive ? 'Active' : 'Inactive' }}
          </n-tag>
        </div>
      </template>
      <div class="chain-monitor-content">
        <div class="monitor-stat">
          <span class="stat-label">Active Chains</span>
          <span class="stat-value">{{ stats.activeChains }}</span>
        </div>
        <div class="monitor-stat">
          <span class="stat-label">Pending Actions</span>
          <span class="stat-value" style="color: #ffd93d;">{{ stats.pendingActions }}</span>
        </div>
        <div class="monitor-stat">
          <span class="stat-label">Executed Today</span>
          <span class="stat-value" style="color: #51cf66;">{{ stats.executedToday }}</span>
        </div>
      </div>
      <n-divider style="margin: 8px 0;" />
      <div style="display: flex; gap: 8px;">
        <n-button
          size="tiny"
          :type="chainMonitorActive ? 'warning' : 'success'"
          @click="$emit('toggle-chain-monitor')"
          style="flex: 1;"
        >
          {{ chainMonitorActive ? '⏸️ Pause' : '▶️ Start' }}
        </n-button>
        <n-button size="tiny" @click="$emit('configure-chain')" style="flex: 1;">
          ⚙️ Configure
        </n-button>
      </div>
    </n-card>

    <!-- Active Bots Status -->
    <n-card class="dashboard-card" size="small">
      <template #header>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">📊</span>
          <span>Active Bots Status</span>
          <n-tag size="tiny" type="success">{{ stats.totalActiveBots }} Running</n-tag>
        </div>
      </template>
      <div class="active-bots-list">
        <div v-if="stats.runningBots.length === 0" style="text-align: center; padding: 20px; color: #666;">
          No bots running
        </div>
        <div v-else v-for="bot in stats.runningBots.slice(0, 4)" :key="bot.id" class="running-bot-item">
          <div class="bot-info">
            <span class="bot-type-icon">{{ getBotIcon(bot.type) }}</span>
            <div>
              <div style="font-weight: bold; font-size: 12px;">{{ bot.name || bot.symbol }}</div>
              <div style="font-size: 10px; color: #888;">{{ bot.type }} | {{ bot.exchange }}</div>
            </div>
          </div>
          <div class="bot-status">
            <n-tag size="tiny" :type="bot.status === 'running' ? 'success' : 'warning'">
              {{ bot.status }}
            </n-tag>
          </div>
        </div>
        <n-button v-if="stats.runningBots.length > 4" size="tiny" text style="width: 100%; margin-top: 8px;">
          View All ({{ stats.runningBots.length }})
        </n-button>
      </div>
    </n-card>

    <!-- Quick Actions -->
    <n-card class="dashboard-card" size="small">
      <template #header>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">⚡</span>
          <span>Quick Actions</span>
        </div>
      </template>
      <div class="quick-actions-grid">
        <n-button size="small" @click="$emit('quick-action', 'cancel-all')" style="width: 100%;">
          ❌ Cancel All Orders
        </n-button>
        <n-button size="small" @click="$emit('quick-action', 'pause-all')" style="width: 100%;">
          ⏸️ Pause All Bots
        </n-button>
        <n-button size="small" @click="$emit('quick-action', 'resume-all')" style="width: 100%;">
          ▶️ Resume All Bots
        </n-button>
        <n-button size="small" @click="$emit('quick-action', 'sync-orders')" style="width: 100%;">
          🔄 Sync Orders
        </n-button>
      </div>
    </n-card>

    <!-- Performance Stats -->
    <n-card class="dashboard-card" size="small">
      <template #header>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">📈</span>
          <span>Performance Stats</span>
          <n-tag size="tiny" :type="stats.totalPnL >= 0 ? 'success' : 'error'">
            {{ stats.totalPnL >= 0 ? '+' : '' }}{{ stats.totalPnL.toFixed(2) }}%
          </n-tag>
        </div>
      </template>
      <div class="performance-stats">
        <div class="perf-stat">
          <span class="perf-label">Total Orders</span>
          <span class="perf-value">{{ stats.performance.totalOrders }}</span>
        </div>
        <div class="perf-stat">
          <span class="perf-label">Filled Orders</span>
          <span class="perf-value" style="color: #51cf66;">{{ stats.performance.filledOrders }}</span>
        </div>
        <div class="perf-stat">
          <span class="perf-label">Success Rate</span>
          <span class="perf-value" style="color: #ffd93d;">{{ stats.performance.successRate }}%</span>
        </div>
        <div class="perf-stat">
          <span class="perf-label">Avg Profit</span>
          <span class="perf-value" :style="{ color: stats.performance.avgProfit >= 0 ? '#51cf66' : '#ff6b6b' }">
            {{ stats.performance.avgProfit >= 0 ? '+' : '' }}{{ stats.performance.avgProfit.toFixed(2) }}%
          </span>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { BOT_TYPES } from '~/constants/botTypes';
import BotTypesCard from './BotTypesCard.vue';

const props = defineProps({
  selectedBotType: {
    type: String,
    default: null
  },
  chainMonitorActive: {
    type: Boolean,
    default: false
  },
  stats: {
    type: Object,
    required: true
  },
  rulesCountByType: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits([
  'update:selectedBotType',
  'toggle-chain-monitor',
  'configure-chain',
  'quick-action',
  'show-bot-info'
]);

function getBotIcon(botType) {
  const bot = Object.values(BOT_TYPES).find(b => b.id === botType);
  return bot ? bot.icon : '🤖';
}
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.dashboard-card {
  height: 100%;
}

.chain-monitor-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.monitor-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.stat-label {
  font-size: 11px;
  color: #888;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  color: #10eb04;
}

.active-bots-list {
  max-height: 250px;
  overflow-y: auto;
}

.running-bot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #1a1a1a;
  border-radius: 4px;
  margin-bottom: 6px;
}

.bot-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bot-type-icon {
  font-size: 18px;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.performance-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.perf-stat {
  text-align: center;
  padding: 8px;
  background: #1a1a1a;
  border-radius: 4px;
}

.perf-label {
  display: block;
  font-size: 10px;
  color: #888;
  margin-bottom: 4px;
}

.perf-value {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #10eb04;
}
</style>
