<template>
  <div style="background: #000; min-height: calc(100vh - 95px); padding: 15px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #00d4ff;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <NuxtLink to="/PalantirApp" style="color: #666; font-size: 20px; text-decoration: none;">←</NuxtLink>
          <div style="font-size: 24px;">🤖</div>
          <div>
            <h1 style="margin: 0; font-size: 20px; color: #00d4ff; font-weight: 700;">ACTIVE BOTS</h1>
            <p style="margin: 3px 0 0 0; color: #888; font-size: 11px;">Overview & Management</p>
          </div>
        </div>
        <div style="display: flex; gap: 10px;">
          <n-button size="small" @click="refreshBots" style="background: #00d4ff; border: none;">🔄 REFRESH</n-button>
          <n-button size="small" @click="pauseAll" style="background: #f5a623; border: none;">⏸ PAUSE ALL</n-button>
          <n-button size="small" @click="stopAll" style="background: #f52a09; border: none;">⏹ STOP ALL</n-button>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-bottom: 15px;">
      <div style="background: rgba(16,235,4,0.1); border: 1px solid #10eb04; padding: 12px; border-radius: 6px; text-align: center;">
        <div style="font-size: 9px; color: #888; margin-bottom: 3px;">RUNNING</div>
        <div style="font-size: 20px; color: #10eb04; font-weight: 700;">{{ stats.running }}</div>
      </div>
      <div style="background: rgba(245,166,35,0.1); border: 1px solid #f5a623; padding: 12px; border-radius: 6px; text-align: center;">
        <div style="font-size: 9px; color: #888; margin-bottom: 3px;">PAUSED</div>
        <div style="font-size: 20px; color: #f5a623; font-weight: 700;">{{ stats.paused }}</div>
      </div>
      <div style="background: rgba(102,102,102,0.1); border: 1px solid #666; padding: 12px; border-radius: 6px; text-align: center;">
        <div style="font-size: 9px; color: #888; margin-bottom: 3px;">STOPPED</div>
        <div style="font-size: 20px; color: #666; font-weight: 700;">{{ stats.stopped }}</div>
      </div>
      <div style="background: rgba(0,212,255,0.1); border: 1px solid #00d4ff; padding: 12px; border-radius: 6px; text-align: center;">
        <div style="font-size: 9px; color: #888; margin-bottom: 3px;">TOTAL P&L</div>
        <div :style="`font-size: 20px; font-weight: 700; color: ${stats.totalPnL >= 0 ? '#10eb04' : '#f52a09'};`">
          {{ stats.totalPnL >= 0 ? '+' : '' }}{{ stats.totalPnL }}%
        </div>
      </div>
      <div style="background: rgba(138,43,226,0.1); border: 1px solid #8a2be2; padding: 12px; border-radius: 6px; text-align: center;">
        <div style="font-size: 9px; color: #888; margin-bottom: 3px;">WIN RATE</div>
        <div style="font-size: 20px; color: #8a2be2; font-weight: 700;">{{ stats.winRate }}%</div>
      </div>
      <div style="background: rgba(245,42,9,0.1); border: 1px solid #f52a09; padding: 12px; border-radius: 6px; text-align: center;">
        <div style="font-size: 9px; color: #888; margin-bottom: 3px;">ACTIVE ORDERS</div>
        <div style="font-size: 20px; color: #f52a09; font-weight: 700;">{{ stats.activeOrders }}</div>
      </div>
    </div>

    <!-- Filters -->
    <div style="background: rgba(15,52,96,0.2); border: 1px solid #0f3460; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div>
          <div style="font-size: 9px; color: #888; margin-bottom: 4px;">Bot Type</div>
          <n-select v-model:value="filters.type" :options="botTypeOptions" size="small" />
        </div>
        <div>
          <div style="font-size: 9px; color: #888; margin-bottom: 4px;">Exchange</div>
          <n-select v-model:value="filters.exchange" :options="exchangeOptions" size="small" />
        </div>
        <div>
          <div style="font-size: 9px; color: #888; margin-bottom: 4px;">Symbol</div>
          <n-select v-model:value="filters.symbol" :options="symbolOptions" size="small" />
        </div>
        <div>
          <div style="font-size: 9px; color: #888; margin-bottom: 4px;">Status</div>
          <n-select v-model:value="filters.status" :options="statusOptions" size="small" />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" style="text-align: center; padding: 60px;">
      <div style="font-size: 48px; margin-bottom: 20px;">⏳</div>
      <div style="color: #00d4ff; font-size: 16px;">Loading bots...</div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredBots.length === 0" style="text-align: center; padding: 60px;">
      <div style="font-size: 48px; margin-bottom: 20px;">🤖</div>
      <div style="color: #888; font-size: 16px; margin-bottom: 10px;">No bots found</div>
      <div style="color: #666; font-size: 12px;">Create your first bot to get started!</div>
    </div>

    <!-- Bots Grid -->
    <div v-else style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
      <div v-for="bot in filteredBots" :key="bot.id"
           :style="`background: rgba(15,52,96,0.3); border: 2px solid ${getBotBorderColor(bot.status)}; padding: 15px; border-radius: 8px;`">

        <!-- Bot Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="font-size: 20px;">{{ getBotIcon(bot.type) }}</div>
            <div>
              <div style="color: #00d4ff; font-size: 13px; font-weight: 600;">{{ bot.name }}</div>
              <div style="color: #888; font-size: 9px;">{{ bot.type }}</div>
            </div>
          </div>
          <div :style="`padding: 3px 8px; background: ${getStatusBg(bot.status)}; border-radius: 4px; font-size: 9px; color: ${getStatusColor(bot.status)}; font-weight: 600;`">
            {{ bot.status.toUpperCase() }}
          </div>
        </div>

        <!-- Bot Details -->
        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; margin-bottom: 10px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 10px;">
            <div>
              <div style="color: #888;">Exchange</div>
              <div style="color: #fff; font-weight: 600;">{{ bot.exchange }}</div>
            </div>
            <div>
              <div style="color: #888;">Symbol</div>
              <div style="color: #fff; font-weight: 600;">{{ bot.symbol }}</div>
            </div>
            <div>
              <div style="color: #888;">Strategy</div>
              <div :style="`color: ${bot.strategy === 'BUY' ? '#10eb04' : '#f52a09'}; font-weight: 600;`">
                {{ bot.strategy }}
              </div>
            </div>
            <div>
              <div style="color: #888;">Runtime</div>
              <div style="color: #00d4ff; font-weight: 600;">{{ bot.runtime }}</div>
            </div>
          </div>
        </div>

        <!-- P&L Stats -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 10px;">
          <div style="background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px; text-align: center;">
            <div style="font-size: 8px; color: #888;">P&L</div>
            <div :style="`font-size: 14px; font-weight: 700; color: ${bot.pnl >= 0 ? '#10eb04' : '#f52a09'};`">
              {{ bot.pnl >= 0 ? '+' : '' }}{{ bot.pnl }}%
            </div>
          </div>
          <div style="background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px; text-align: center;">
            <div style="font-size: 8px; color: #888;">ORDERS</div>
            <div style="font-size: 14px; color: #00d4ff; font-weight: 700;">{{ bot.orders }}/{{ bot.totalOrders }}</div>
          </div>
          <div style="background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px; text-align: center;">
            <div style="font-size: 8px; color: #888;">FILLED</div>
            <div style="font-size: 14px; color: #f5a623; font-weight: 700;">{{ bot.filled }}%</div>
          </div>
        </div>

        <!-- Actions -->
        <div style="display: flex; gap: 6px;">
          <n-button v-if="bot.status === 'running'" size="tiny" @click="pauseBot(bot.id)" style="flex: 1; background: #f5a623; border: none; font-size: 9px;">
            ⏸ PAUSE
          </n-button>
          <n-button v-else-if="bot.status === 'paused'" size="tiny" @click="resumeBot(bot.id)" style="flex: 1; background: #10eb04; border: none; font-size: 9px;">
            ▶ RESUME
          </n-button>
          <n-button size="tiny" @click="stopBot(bot.id)" style="flex: 1; background: #f52a09; border: none; font-size: 9px;">
            ⏹ STOP
          </n-button>
          <n-button size="tiny" @click="editBot(bot)" style="flex: 1; background: #00d4ff; border: none; font-size: 9px;">
            ✏️ EDIT
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useMessage } from 'naive-ui';

definePageMeta({ middleware: 'auth', layout: 'palantir' });

const message = useMessage();
const userID = useCookie('userID');
const loading = ref(false);

const stats = ref({
  running: 0,
  paused: 0,
  stopped: 0,
  totalPnL: 0,
  winRate: 0,
  activeOrders: 0
});

const filters = ref({
  type: 'all',
  exchange: 'all',
  symbol: 'all',
  status: 'all'
});

const bots = ref([]);

// Fetch all active bots from database
async function fetchAllBots() {
  loading.value = true;
  try {
    console.log('🤖 Fetching all active bots...');

    const response = await $fetch('/api/v1/fetchAllActiveBots', {
      method: 'POST',
      body: {
        userID: userID.value
      }
    });

    if (response.success) {
      bots.value = response.bots || [];
      stats.value = response.stats || {
        running: 0,
        paused: 0,
        stopped: 0,
        totalPnL: 0,
        winRate: 0,
        activeOrders: 0
      };

      console.log('✅ Loaded bots:', bots.value.length);
      console.log('📊 Stats:', stats.value);

      message.success(`Loaded ${bots.value.length} active bots`);
    } else {
      message.error('Failed to fetch bots');
    }
  } catch (error) {
    console.error('❌ Error fetching bots:', error);
    message.error('Error loading bots: ' + error.message);
  } finally {
    loading.value = false;
  }
}

// Load bots on mount
onMounted(() => {
  fetchAllBots();
});

const botTypeOptions = [
  { label: 'All Types', value: 'all' },
  { label: 'Grid Bot', value: 'GridBot' },
  { label: 'DCA Grid Bot', value: 'DCABot' },
  { label: 'Smart DCA Bot', value: 'SmartDCABot' },
  { label: 'Scalping Bot', value: 'Scalp1ngBot' },
  { label: 'FrontRun Bot', value: 'FrontRunBot' },
  { label: 'OneClick Bot', value: 'OneClickBot' },
  { label: 'Fibonacci Bot', value: 'FibBot' },
  { label: 'Co-Pilot Bot', value: 'CoPilotBot' },
  { label: 'Grinder Bot', value: 'GrinderBot' },
  { label: 'DCA Bot (legacy)', value: 'DcaBot' }
];

const exchangeOptions = [
  { label: 'All Exchanges', value: 'all' },
  { label: 'LCX', value: 'LCX' },
  { label: 'Coinbase', value: 'Coinbase' },
  { label: 'Kraken', value: 'Kraken' }
];

const symbolOptions = [
  { label: 'All Symbols', value: 'all' },
  { label: 'BTC/USDC', value: 'BTC/USDC' },
  { label: 'ETH/USDC', value: 'ETH/USDC' },
  { label: 'LCX/USDC', value: 'LCX/USDC' }
];

const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Running', value: 'running' },
  { label: 'Paused', value: 'paused' },
  { label: 'Stopped', value: 'stopped' }
];

const filteredBots = computed(() => {
  return bots.value.filter(bot => {
    if (filters.value.type !== 'all' && bot.type !== filters.value.type) return false;
    if (filters.value.exchange !== 'all' && bot.exchange !== filters.value.exchange) return false;
    if (filters.value.symbol !== 'all' && bot.symbol !== filters.value.symbol) return false;
    if (filters.value.status !== 'all' && bot.status !== filters.value.status) return false;
    return true;
  });
});

const getBotIcon = (type) => {
  const icons = {
    'GridBot': '📊',
    'DCABot': '💰',
    'SmartDCABot': '🎯',
    'Scalp1ngBot': '⚡',
    'FrontRunBot': '🏃',
    'FibBot': '📐',
    'CoPilotBot': '✈️',
    'GrinderBot': '⚙️'
  };
  return icons[type] || '🤖';
};

const getBotBorderColor = (status) => {
  return status === 'running' ? '#10eb04' : status === 'paused' ? '#f5a623' : '#666';
};

const getStatusBg = (status) => {
  return status === 'running' ? 'rgba(16,235,4,0.2)' : status === 'paused' ? 'rgba(245,166,35,0.2)' : 'rgba(102,102,102,0.2)';
};

const getStatusColor = (status) => {
  return status === 'running' ? '#10eb04' : status === 'paused' ? '#f5a623' : '#666';
};

const refreshBots = async () => {
  await fetchAllBots();
};

const pauseAll = async () => {
  if (!confirm('Are you sure you want to pause ALL bots?')) return;

  message.info('Pausing all bots...');
  let pausedCount = 0;

  for (const bot of bots.value.filter(b => b.status === 'running')) {
    try {
      await pauseBot(bot.id, false); // false = don't show individual messages
      pausedCount++;
    } catch (error) {
      console.error('Error pausing bot:', bot.id, error);
    }
  }

  message.success(`Paused ${pausedCount} bots`);
  await fetchAllBots();
};

const stopAll = async () => {
  if (!confirm('⚠️ WARNING: This will STOP all active bots and cancel their orders.\n\nAre you sure?')) return;

  message.warning('Stopping all bots...');
  let stoppedCount = 0;

  for (const bot of bots.value.filter(b => b.status !== 'stopped')) {
    try {
      await stopBot(bot.id, false); // false = don't show individual messages
      stoppedCount++;
    } catch (error) {
      console.error('Error stopping bot:', bot.id, error);
    }
  }

  message.success(`Stopped ${stoppedCount} bots`);
  await fetchAllBots();
};

const pauseBot = async (id, showMessage = true) => {
  try {
    const bot = bots.value.find(b => b.id === id);
    if (!bot) return;

    // TODO: Implement pause endpoint for each bot type
    // For now, just update local status
    bot.status = 'paused';

    if (showMessage) {
      message.info(`Paused ${bot.name}`);
    }
  } catch (error) {
    console.error('Error pausing bot:', error);
    if (showMessage) {
      message.error('Failed to pause bot');
    }
  }
};

const resumeBot = async (id) => {
  try {
    const bot = bots.value.find(b => b.id === id);
    if (!bot) return;

    // TODO: Implement resume endpoint for each bot type
    // For now, just update local status
    bot.status = 'running';
    message.success(`Resumed ${bot.name}`);
  } catch (error) {
    console.error('Error resuming bot:', error);
    message.error('Failed to resume bot');
  }
};

const stopBot = async (id, showMessage = true) => {
  try {
    const bot = bots.value.find(b => b.id === id);
    if (!bot) return;

    if (showMessage && !confirm(`Stop "${bot.name}"?\n\nThis will cancel all active orders.`)) return;

    // Determine the delete endpoint based on bot type
    let endpoint = '';
    if (bot.type === 'GridBot') {
      endpoint = '/api/v1/deleteGridBot';
    } else if (bot.type === 'DCABot') {
      endpoint = '/api/v1/stopDcaGridBot';
    } else if (bot.type === 'SmartDCABot') {
      endpoint = '/api/v1/stopSmartDCABot';
    }

    if (endpoint) {
      await $fetch(endpoint, {
        method: 'POST',
        body: {
          botId: id,
          userID: userID.value
        }
      });
    }

    bot.status = 'stopped';
    if (showMessage) {
      message.success(`Stopped ${bot.name}`);
    }
  } catch (error) {
    console.error('Error stopping bot:', error);
    if (showMessage) {
      message.error('Failed to stop bot');
    }
  }
};

const editBot = (bot) => {
  message.info(`Editing ${bot.name} - Navigate to bot configuration page`);
  // TODO: Navigate to bot edit page based on type
};
</script>
