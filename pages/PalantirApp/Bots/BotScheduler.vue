<template>
  <div style="background: #000; min-height: calc(100vh - 95px); padding: 15px;">
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #f5a623;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <NuxtLink to="/PalantirApp" style="color: #666; font-size: 20px; text-decoration: none;">←</NuxtLink>
        <div style="font-size: 24px;">⏰</div>
        <div>
          <h1 style="margin: 0; font-size: 20px; color: #f5a623; font-weight: 700;">BOT SCHEDULER</h1>
          <p style="margin: 3px 0 0 0; color: #888; font-size: 11px;">Scheduled Bot Execution</p>
        </div>
      </div>
    </div>

    <!-- Stats Overview -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 15px;">
      <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 12px; border-radius: 8px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 5px;">ACTIVE SCHEDULES</div>
        <div style="color: #f5a623; font-size: 18px; font-weight: 700;">{{ activeSchedules }}</div>
        <div style="color: #888; font-size: 9px;">{{ totalSchedules }} Total</div>
      </div>
      <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 12px; border-radius: 8px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 5px;">NEXT EXECUTION</div>
        <div style="color: #f5a623; font-size: 18px; font-weight: 700;">{{ nextExecutionTime }}</div>
        <div style="color: #888; font-size: 9px;">{{ nextExecutionBot }}</div>
      </div>
      <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 12px; border-radius: 8px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 5px;">EXECUTIONS TODAY</div>
        <div style="color: #f5a623; font-size: 18px; font-weight: 700;">{{ executionsToday }}</div>
        <div style="color: #10eb04; font-size: 9px;">{{ successRate }}% Success</div>
      </div>
      <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 12px; border-radius: 8px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 5px;">UPCOMING (24H)</div>
        <div style="color: #f5a623; font-size: 18px; font-weight: 700;">{{ upcomingCount }}</div>
        <div style="color: #888; font-size: 9px;">Next 24 Hours</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <n-button size="small" type="warning" @click="showCreateModal = true">
          ➕ Create Schedule
        </n-button>
        <n-button size="small" @click="pauseAll">
          ⏸️ Pause All
        </n-button>
        <n-button size="small" @click="resumeAll">
          ▶️ Resume All
        </n-button>
        <n-button size="small" @click="refreshSchedules" :loading="isRefreshing">
          🔄 Refresh
        </n-button>
        <n-button size="small" @click="viewHistory">
          📜 Execution History
        </n-button>
      </div>
    </div>

    <!-- Scheduled Bots -->
    <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
      <div style="color: #fff; font-size: 14px; font-weight: 700; margin-bottom: 15px;">
        Scheduled Bot Executions
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div
          v-for="schedule in schedules"
          :key="schedule.id"
          style="background: rgba(0,0,0,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;"
        >
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="font-size: 24px;">{{ schedule.icon }}</div>
              <div>
                <div style="color: #fff; font-size: 14px; font-weight: 700;">{{ schedule.name }}</div>
                <div style="color: #888; font-size: 10px;">{{ schedule.botType }} • {{ schedule.symbol }}</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <n-tag :type="getStatusType(schedule.status)" size="small" round>
                {{ schedule.status }}
              </n-tag>
              <n-button size="tiny" @click="editSchedule(schedule)">✏️</n-button>
              <n-button size="tiny" @click="toggleSchedule(schedule)">
                {{ schedule.enabled ? '⏸️' : '▶️' }}
              </n-button>
              <n-button size="tiny" type="error" @click="deleteSchedule(schedule.id)">🗑️</n-button>
            </div>
          </div>

          <!-- Schedule Details -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px;">
            <div>
              <div style="color: #888; font-size: 9px;">SCHEDULE TYPE</div>
              <div style="color: #f5a623; font-size: 12px; font-weight: 700;">{{ schedule.scheduleType }}</div>
            </div>
            <div>
              <div style="color: #888; font-size: 9px;">FREQUENCY</div>
              <div style="color: #fff; font-size: 12px; font-weight: 700;">{{ schedule.frequency }}</div>
            </div>
            <div>
              <div style="color: #888; font-size: 9px;">NEXT RUN</div>
              <div style="color: #10eb04; font-size: 12px; font-weight: 700;">{{ formatTime(schedule.nextRun) }}</div>
            </div>
            <div>
              <div style="color: #888; font-size: 9px;">LAST RUN</div>
              <div style="color: #888; font-size: 12px;">{{ formatTime(schedule.lastRun) }}</div>
            </div>
          </div>

          <!-- Execution Stats -->
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 12px;">
            <div>
              <div style="color: #888; font-size: 8px;">EXECUTIONS</div>
              <div style="color: #fff; font-size: 11px;">{{ schedule.stats.total }}</div>
            </div>
            <div>
              <div style="color: #888; font-size: 8px;">SUCCESSFUL</div>
              <div style="color: #10eb04; font-size: 11px;">{{ schedule.stats.successful }}</div>
            </div>
            <div>
              <div style="color: #888; font-size: 8px;">FAILED</div>
              <div style="color: #f52a09; font-size: 11px;">{{ schedule.stats.failed }}</div>
            </div>
            <div>
              <div style="color: #888; font-size: 8px;">SUCCESS RATE</div>
              <div :style="`color: ${getSuccessRateColor(schedule.stats.successRate)}; font-size: 11px;`">
                {{ schedule.stats.successRate }}%
              </div>
            </div>
            <div>
              <div style="color: #888; font-size: 8px;">AVG DURATION</div>
              <div style="color: #fff; font-size: 11px;">{{ schedule.stats.avgDuration }}s</div>
            </div>
          </div>

          <!-- Schedule Configuration -->
          <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px;">
            <div style="color: #888; font-size: 9px; margin-bottom: 6px;">CONFIGURATION:</div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <div v-if="schedule.config.startTime" style="background: rgba(245,166,35,0.2); border: 1px solid #f5a623; padding: 4px 10px; border-radius: 4px; font-size: 10px; color: #f5a623;">
                ⏰ Start: {{ schedule.config.startTime }}
              </div>
              <div v-if="schedule.config.endTime" style="background: rgba(245,166,35,0.2); border: 1px solid #f5a623; padding: 4px 10px; border-radius: 4px; font-size: 10px; color: #f5a623;">
                ⏰ End: {{ schedule.config.endTime }}
              </div>
              <div v-if="schedule.config.daysOfWeek" style="background: rgba(245,166,35,0.2); border: 1px solid #f5a623; padding: 4px 10px; border-radius: 4px; font-size: 10px; color: #f5a623;">
                📅 {{ schedule.config.daysOfWeek.join(', ') }}
              </div>
              <div v-if="schedule.config.maxExecutions" style="background: rgba(245,166,35,0.2); border: 1px solid #f5a623; padding: 4px 10px; border-radius: 4px; font-size: 10px; color: #f5a623;">
                🔢 Max: {{ schedule.config.maxExecutions }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upcoming Executions -->
    <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
      <div style="color: #fff; font-size: 14px; font-weight: 700; margin-bottom: 15px;">
        Upcoming Executions (Next 24 Hours)
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div
          v-for="execution in upcomingExecutions"
          :key="execution.id"
          style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: rgba(245,166,35,0.1); border-radius: 6px; border: 1px solid rgba(245,166,35,0.3);"
        >
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 20px;">{{ execution.icon }}</div>
            <div>
              <div style="color: #fff; font-size: 12px; font-weight: 700;">{{ execution.name }}</div>
              <div style="color: #888; font-size: 9px;">{{ execution.symbol }}</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="color: #f5a623; font-size: 12px; font-weight: 700;">{{ formatTime(execution.scheduledTime) }}</div>
            <div style="color: #888; font-size: 9px;">{{ execution.scheduleType }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Schedule Modal -->
    <n-modal v-model:show="showCreateModal" preset="card" style="width: 600px; background: #1a1a2e; border: 1px solid #f5a623;">
      <template #header>
        <div style="color: #f5a623; font-size: 16px; font-weight: 700;">
          {{ editingSchedule ? '✏️ Edit Schedule' : '➕ Create Schedule' }}
        </div>
      </template>
      <div style="padding: 10px;">
        <!-- Schedule Name -->
        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Schedule Name</div>
          <n-input v-model:value="formData.name" placeholder="e.g., Morning Grid Bot" />
        </div>

        <!-- Bot Selection -->
        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Bot Type</div>
          <n-select v-model:value="formData.botType" :options="botTypeOptions" />
        </div>

        <!-- Symbol Selection -->
        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Trading Pair</div>
          <n-select v-model:value="formData.symbol" :options="symbolOptions" />
        </div>

        <!-- Schedule Type -->
        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Schedule Type</div>
          <n-select v-model:value="formData.scheduleType" :options="scheduleTypeOptions" />
        </div>

        <!-- Frequency (for Recurring) -->
        <div v-if="formData.scheduleType === 'Recurring'" style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Frequency</div>
          <n-select v-model:value="formData.frequency" :options="frequencyOptions" />
        </div>

        <!-- Time Configuration -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 15px;">
          <div>
            <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Start Time</div>
            <n-input v-model:value="formData.startTime" type="time" />
          </div>
          <div v-if="formData.scheduleType === 'Recurring'">
            <div style="color: #888; font-size: 11px; margin-bottom: 5px;">End Time (Optional)</div>
            <n-input v-model:value="formData.endTime" type="time" />
          </div>
        </div>

        <!-- Days of Week (for Recurring) -->
        <div v-if="formData.scheduleType === 'Recurring' && formData.frequency === 'Weekly'" style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Days of Week</div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <n-checkbox v-for="day in daysOfWeek" :key="day" v-model:checked="formData.daysOfWeek[day]">
              {{ day }}
            </n-checkbox>
          </div>
        </div>

        <!-- Max Executions -->
        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Max Executions (Optional)</div>
          <n-input-number v-model:value="formData.maxExecutions" :min="1" placeholder="Unlimited" style="width: 100%;" />
        </div>

        <!-- Actions -->
        <div style="display: flex; gap: 10px;">
          <n-button type="warning" style="flex: 1;" @click="saveSchedule">
            {{ editingSchedule ? '💾 Update' : '➕ Create' }}
          </n-button>
          <n-button style="flex: 1;" @click="cancelEdit">
            ❌ Cancel
          </n-button>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

definePageMeta({ middleware: 'auth', layout: 'palantir' });

// State
const showCreateModal = ref(false);
const editingSchedule = ref(null);
const isRefreshing = ref(false);

// Form data
const formData = ref({
  name: '',
  botType: 'Grid Bot',
  symbol: 'BTC/USDT',
  scheduleType: 'One-time',
  frequency: 'Daily',
  startTime: '09:00',
  endTime: '',
  daysOfWeek: {
    Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false
  },
  maxExecutions: null
});

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Options
const botTypeOptions = [
  { label: 'Grid Bot', value: 'Grid Bot' },
  { label: 'DCA Bot', value: 'DCA Bot' },
  { label: 'Scalping Bot', value: 'Scalping Bot' },
  { label: 'Arbitrage Bot', value: 'Arbitrage Bot' },
  { label: 'Smart DCA', value: 'Smart DCA' }
];

const symbolOptions = [
  { label: 'BTC/USDT', value: 'BTC/USDT' },
  { label: 'ETH/USDT', value: 'ETH/USDT' },
  { label: 'LCX/USDC', value: 'LCX/USDC' },
  { label: 'SOL/USDT', value: 'SOL/USDT' },
  { label: 'BNB/USDT', value: 'BNB/USDT' }
];

const scheduleTypeOptions = [
  { label: 'One-time', value: 'One-time' },
  { label: 'Recurring', value: 'Recurring' },
  { label: 'Conditional', value: 'Conditional' }
];

const frequencyOptions = [
  { label: 'Every Hour', value: 'Hourly' },
  { label: 'Daily', value: 'Daily' },
  { label: 'Weekly', value: 'Weekly' },
  { label: 'Monthly', value: 'Monthly' }
];

// Mock data
const schedules = ref([
  {
    id: 1,
    name: 'Morning Grid Bot',
    icon: '🤖',
    botType: 'Grid Bot',
    symbol: 'BTC/USDT',
    scheduleType: 'Recurring',
    frequency: 'Daily',
    nextRun: Date.now() + 3600000 * 2,
    lastRun: Date.now() - 86400000,
    enabled: true,
    status: 'Active',
    config: {
      startTime: '09:00',
      endTime: '17:00',
      daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      maxExecutions: null
    },
    stats: {
      total: 45,
      successful: 42,
      failed: 3,
      successRate: 93.3,
      avgDuration: 12
    }
  },
  {
    id: 2,
    name: 'ETH Scalper Weekend',
    icon: '⚡',
    botType: 'Scalping Bot',
    symbol: 'ETH/USDT',
    scheduleType: 'Recurring',
    frequency: 'Weekly',
    nextRun: Date.now() + 3600000 * 48,
    lastRun: Date.now() - 3600000 * 24,
    enabled: true,
    status: 'Active',
    config: {
      startTime: '00:00',
      endTime: '23:59',
      daysOfWeek: ['Sat', 'Sun'],
      maxExecutions: null
    },
    stats: {
      total: 8,
      successful: 8,
      failed: 0,
      successRate: 100,
      avgDuration: 8
    }
  },
  {
    id: 3,
    name: 'LCX DCA Monthly',
    icon: '💰',
    botType: 'DCA Bot',
    symbol: 'LCX/USDC',
    scheduleType: 'Recurring',
    frequency: 'Monthly',
    nextRun: Date.now() + 86400000 * 15,
    lastRun: Date.now() - 86400000 * 15,
    enabled: true,
    status: 'Active',
    config: {
      startTime: '12:00',
      daysOfWeek: null,
      maxExecutions: 12
    },
    stats: {
      total: 3,
      successful: 3,
      failed: 0,
      successRate: 100,
      avgDuration: 5
    }
  },
  {
    id: 4,
    name: 'SOL Arbitrage Test',
    icon: '🔄',
    botType: 'Arbitrage Bot',
    symbol: 'SOL/USDT',
    scheduleType: 'One-time',
    frequency: 'N/A',
    nextRun: Date.now() + 3600000 * 6,
    lastRun: null,
    enabled: false,
    status: 'Paused',
    config: {
      startTime: '15:30',
      maxExecutions: 1
    },
    stats: {
      total: 0,
      successful: 0,
      failed: 0,
      successRate: 0,
      avgDuration: 0
    }
  }
]);

const upcomingExecutions = ref([
  {
    id: 1,
    name: 'Morning Grid Bot',
    icon: '🤖',
    symbol: 'BTC/USDT',
    scheduledTime: Date.now() + 3600000 * 2,
    scheduleType: 'Daily'
  },
  {
    id: 2,
    name: 'SOL Arbitrage Test',
    icon: '🔄',
    symbol: 'SOL/USDT',
    scheduledTime: Date.now() + 3600000 * 6,
    scheduleType: 'One-time'
  },
  {
    id: 3,
    name: 'ETH Scalper Weekend',
    icon: '⚡',
    symbol: 'ETH/USDT',
    scheduledTime: Date.now() + 3600000 * 48,
    scheduleType: 'Weekly'
  }
]);

// Computed
const activeSchedules = computed(() => schedules.value.filter(s => s.enabled).length);
const totalSchedules = computed(() => schedules.value.length);
const executionsToday = computed(() => {
  return schedules.value.reduce((sum, s) => {
    // Simulate executions today
    const today = new Date().toDateString();
    const lastRun = s.lastRun ? new Date(s.lastRun).toDateString() : null;
    return sum + (lastRun === today ? 1 : 0);
  }, 0);
});
const successRate = computed(() => {
  const total = schedules.value.reduce((sum, s) => sum + s.stats.total, 0);
  const successful = schedules.value.reduce((sum, s) => sum + s.stats.successful, 0);
  return total > 0 ? ((successful / total) * 100).toFixed(1) : 0;
});
const upcomingCount = computed(() => upcomingExecutions.value.length);
const nextExecutionTime = computed(() => {
  if (upcomingExecutions.value.length === 0) return 'None';
  const next = upcomingExecutions.value[0];
  return formatTime(next.scheduledTime);
});
const nextExecutionBot = computed(() => {
  if (upcomingExecutions.value.length === 0) return '';
  return upcomingExecutions.value[0].name;
});

// Methods
const getStatusType = (status) => {
  if (status === 'Active') return 'success';
  if (status === 'Paused') return 'warning';
  return 'default';
};

const getSuccessRateColor = (rate) => {
  if (rate >= 95) return '#10eb04';
  if (rate >= 80) return '#00d4ff';
  if (rate >= 70) return '#f5a623';
  return '#f52a09';
};

const formatTime = (timestamp) => {
  if (!timestamp) return 'Never';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((date - now) / 1000);

  if (diff < 0) {
    const absDiff = Math.abs(diff);
    if (absDiff < 60) return `${absDiff}s ago`;
    if (absDiff < 3600) return `${Math.floor(absDiff / 60)}m ago`;
    if (absDiff < 86400) return `${Math.floor(absDiff / 3600)}h ago`;
    return date.toLocaleDateString();
  }

  if (diff < 60) return `in ${diff}s`;
  if (diff < 3600) return `in ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `in ${Math.floor(diff / 3600)}h`;
  return date.toLocaleDateString();
};

const editSchedule = (schedule) => {
  editingSchedule.value = schedule;
  formData.value = {
    name: schedule.name,
    botType: schedule.botType,
    symbol: schedule.symbol,
    scheduleType: schedule.scheduleType,
    frequency: schedule.frequency,
    startTime: schedule.config.startTime,
    endTime: schedule.config.endTime || '',
    daysOfWeek: {
      Mon: schedule.config.daysOfWeek?.includes('Mon') || false,
      Tue: schedule.config.daysOfWeek?.includes('Tue') || false,
      Wed: schedule.config.daysOfWeek?.includes('Wed') || false,
      Thu: schedule.config.daysOfWeek?.includes('Thu') || false,
      Fri: schedule.config.daysOfWeek?.includes('Fri') || false,
      Sat: schedule.config.daysOfWeek?.includes('Sat') || false,
      Sun: schedule.config.daysOfWeek?.includes('Sun') || false
    },
    maxExecutions: schedule.config.maxExecutions
  };
  showCreateModal.value = true;
};

const saveSchedule = () => {
  const selectedDays = Object.keys(formData.value.daysOfWeek).filter(day => formData.value.daysOfWeek[day]);

  if (editingSchedule.value) {
    // Update existing
    const index = schedules.value.findIndex(s => s.id === editingSchedule.value.id);
    if (index !== -1) {
      schedules.value[index] = {
        ...schedules.value[index],
        name: formData.value.name,
        botType: formData.value.botType,
        symbol: formData.value.symbol,
        scheduleType: formData.value.scheduleType,
        frequency: formData.value.frequency,
        config: {
          startTime: formData.value.startTime,
          endTime: formData.value.endTime,
          daysOfWeek: selectedDays.length > 0 ? selectedDays : null,
          maxExecutions: formData.value.maxExecutions
        }
      };
    }
  } else {
    // Create new
    const newSchedule = {
      id: Date.now(),
      name: formData.value.name,
      icon: getIconForBotType(formData.value.botType),
      botType: formData.value.botType,
      symbol: formData.value.symbol,
      scheduleType: formData.value.scheduleType,
      frequency: formData.value.frequency,
      nextRun: calculateNextRun(formData.value),
      lastRun: null,
      enabled: true,
      status: 'Active',
      config: {
        startTime: formData.value.startTime,
        endTime: formData.value.endTime,
        daysOfWeek: selectedDays.length > 0 ? selectedDays : null,
        maxExecutions: formData.value.maxExecutions
      },
      stats: {
        total: 0,
        successful: 0,
        failed: 0,
        successRate: 0,
        avgDuration: 0
      }
    };
    schedules.value.unshift(newSchedule);
  }

  cancelEdit();
};

const getIconForBotType = (type) => {
  const icons = {
    'Grid Bot': '🤖',
    'DCA Bot': '💰',
    'Scalping Bot': '⚡',
    'Arbitrage Bot': '🔄',
    'Smart DCA': '🧠'
  };
  return icons[type] || '🤖';
};

const calculateNextRun = (data) => {
  // Simple calculation - in reality would be more complex
  const now = new Date();
  const [hours, minutes] = data.startTime.split(':');
  const nextRun = new Date();
  nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  if (nextRun < now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  return nextRun.getTime();
};

const cancelEdit = () => {
  showCreateModal.value = false;
  editingSchedule.value = null;
  formData.value = {
    name: '',
    botType: 'Grid Bot',
    symbol: 'BTC/USDT',
    scheduleType: 'One-time',
    frequency: 'Daily',
    startTime: '09:00',
    endTime: '',
    daysOfWeek: {
      Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false
    },
    maxExecutions: null
  };
};

const toggleSchedule = (schedule) => {
  schedule.enabled = !schedule.enabled;
  schedule.status = schedule.enabled ? 'Active' : 'Paused';
};

const deleteSchedule = (id) => {
  const index = schedules.value.findIndex(s => s.id === id);
  if (index !== -1) {
    schedules.value.splice(index, 1);
  }
};

const pauseAll = () => {
  schedules.value.forEach(s => {
    s.enabled = false;
    s.status = 'Paused';
  });
};

const resumeAll = () => {
  schedules.value.forEach(s => {
    s.enabled = true;
    s.status = 'Active';
  });
};

const refreshSchedules = async () => {
  isRefreshing.value = true;
  await new Promise(resolve => setTimeout(resolve, 1000));
  isRefreshing.value = false;
};

const viewHistory = () => {
  console.log('View execution history');
};
</script>
