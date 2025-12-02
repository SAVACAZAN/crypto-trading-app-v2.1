<template>
  <div style="background: #000; min-height: calc(100vh - 95px); padding: 15px;">
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #f52a09;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <NuxtLink to="/PalantirApp" style="color: #666; font-size: 20px; text-decoration: none;">←</NuxtLink>
        <div style="font-size: 24px;">🛑</div>
        <div>
          <h1 style="margin: 0; font-size: 20px; color: #f52a09; font-weight: 700;">STOP-LOSS MANAGER</h1>
          <p style="margin: 3px 0 0 0; color: #888; font-size: 11px;">Stop-Loss Control</p>
        </div>
      </div>
    </div>

    <!-- Stats Overview -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 15px;">
      <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 12px; border-radius: 8px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 5px;">ACTIVE STOP-LOSSES</div>
        <div style="color: #f52a09; font-size: 18px; font-weight: 700;">{{ activeStopLosses }}</div>
        <div style="color: #888; font-size: 9px;">{{ totalPositions }} Total Positions</div>
      </div>
      <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 12px; border-radius: 8px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 5px;">TRIGGERED (24H)</div>
        <div style="color: #f52a09; font-size: 18px; font-weight: 700;">{{ triggeredToday }}</div>
        <div style="color: #10eb04; font-size: 9px;">Saved ${{ savedCapital.toLocaleString() }}</div>
      </div>
      <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 12px; border-radius: 8px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 5px;">AVG SL DISTANCE</div>
        <div style="color: #f52a09; font-size: 18px; font-weight: 700;">{{ avgSlDistance }}%</div>
        <div style="color: #888; font-size: 9px;">From Entry Price</div>
      </div>
      <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 12px; border-radius: 8px;">
        <div style="color: #888; font-size: 10px; margin-bottom: 5px;">TRAILING STOPS</div>
        <div style="color: #f52a09; font-size: 18px; font-weight: 700;">{{ trailingStops }}</div>
        <div style="color: #10eb04; font-size: 9px;">{{ Math.round((trailingStops / activeStopLosses) * 100) }}% Active</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <n-button size="small" type="error" @click="showCreateModal = true">
          ➕ Add Stop-Loss
        </n-button>
        <n-button size="small" @click="applyToAll">
          🔄 Apply to All
        </n-button>
        <n-button size="small" @click="enableTrailing">
          📈 Enable Trailing
        </n-button>
        <n-button size="small" @click="tightenStops">
          ⬆️ Tighten All Stops
        </n-button>
        <n-button size="small" @click="refreshData" :loading="isRefreshing">
          🔄 Refresh
        </n-button>
        <n-button size="small" @click="exportReport">
          📊 Export Report
        </n-button>
      </div>
    </div>

    <!-- Active Stop-Losses -->
    <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
      <div style="color: #fff; font-size: 14px; font-weight: 700; margin-bottom: 15px;">
        Active Stop-Losses
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div
          v-for="sl in stopLosses"
          :key="sl.id"
          :style="`background: ${getStatusColor(sl.status)}; border: 1px solid ${getStatusBorder(sl.status)}; padding: 15px; border-radius: 8px;`"
        >
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="font-size: 24px;">{{ sl.icon }}</div>
              <div>
                <div style="color: #fff; font-size: 14px; font-weight: 700;">{{ sl.symbol }}</div>
                <div style="color: #888; font-size: 10px;">{{ sl.type }} • {{ sl.side }}</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <n-tag :type="getStatusType(sl.status)" size="small" round>
                {{ sl.status }}
              </n-tag>
              <n-button size="tiny" @click="editStopLoss(sl)">✏️</n-button>
              <n-button size="tiny" type="error" @click="removeStopLoss(sl.id)">🗑️</n-button>
            </div>
          </div>

          <!-- Price Info -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px;">
            <div>
              <div style="color: #888; font-size: 9px;">ENTRY PRICE</div>
              <div style="color: #fff; font-size: 12px; font-weight: 700;">${{ sl.entryPrice.toFixed(4) }}</div>
            </div>
            <div>
              <div style="color: #888; font-size: 9px;">CURRENT PRICE</div>
              <div :style="`color: ${sl.currentPrice >= sl.entryPrice ? '#10eb04' : '#f52a09'}; font-size: 12px; font-weight: 700;`">
                ${{ sl.currentPrice.toFixed(4) }}
              </div>
            </div>
            <div>
              <div style="color: #888; font-size: 9px;">STOP-LOSS</div>
              <div style="color: #f52a09; font-size: 12px; font-weight: 700;">${{ sl.stopPrice.toFixed(4) }}</div>
            </div>
            <div>
              <div style="color: #888; font-size: 9px;">DISTANCE</div>
              <div :style="`color: ${getDistanceColor(sl.distance)}; font-size: 12px; font-weight: 700;`">
                {{ sl.distance }}%
              </div>
            </div>
          </div>

          <!-- Position Info -->
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 12px;">
            <div>
              <div style="color: #888; font-size: 8px;">SIZE</div>
              <div style="color: #fff; font-size: 11px;">{{ sl.size.toLocaleString() }}</div>
            </div>
            <div>
              <div style="color: #888; font-size: 8px;">VALUE</div>
              <div style="color: #fff; font-size: 11px;">${{ sl.value.toLocaleString() }}</div>
            </div>
            <div>
              <div style="color: #888; font-size: 8px;">RISK</div>
              <div style="color: #f52a09; font-size: 11px;">${{ sl.risk.toLocaleString() }}</div>
            </div>
            <div>
              <div style="color: #888; font-size: 8px;">P&L</div>
              <div :style="`color: ${sl.pnl >= 0 ? '#10eb04' : '#f52a09'}; font-size: 11px;`">
                {{ sl.pnl >= 0 ? '+' : '' }}${{ sl.pnl.toLocaleString() }}
              </div>
            </div>
            <div>
              <div style="color: #888; font-size: 8px;">P&L %</div>
              <div :style="`color: ${sl.pnlPercent >= 0 ? '#10eb04' : '#f52a09'}; font-size: 11px;`">
                {{ sl.pnlPercent >= 0 ? '+' : '' }}{{ sl.pnlPercent.toFixed(2) }}%
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div style="height: 8px; background: rgba(0,0,0,0.3); border-radius: 4px; overflow: hidden; margin-bottom: 8px;">
            <div
              :style="`width: ${getProgressWidth(sl)}%; background: ${getProgressColor(sl)}; height: 100%; transition: all 0.3s;`"
            ></div>
          </div>

          <!-- Settings -->
          <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
            <div v-if="sl.isTrailing" style="display: flex; align-items: center; gap: 5px; color: #10eb04; font-size: 10px;">
              <span>📈</span>
              <span>Trailing: {{ sl.trailingPercent }}%</span>
            </div>
            <div v-if="sl.takeProfitEnabled" style="display: flex; align-items: center; gap: 5px; color: #10eb04; font-size: 10px;">
              <span>🎯</span>
              <span>TP: ${{ sl.takeProfit.toFixed(4) }}</span>
            </div>
            <div style="color: #888; font-size: 10px;">
              Created: {{ formatTime(sl.createdAt) }}
            </div>
            <div v-if="sl.lastUpdated" style="color: #888; font-size: 10px;">
              Updated: {{ formatTime(sl.lastUpdated) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Triggers -->
    <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
      <div style="color: #fff; font-size: 14px; font-weight: 700; margin-bottom: 15px;">
        Recent Triggers (24H)
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div
          v-for="trigger in recentTriggers"
          :key="trigger.id"
          style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: rgba(245,42,9,0.1); border-radius: 6px; border: 1px solid rgba(245,42,9,0.3);"
        >
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 20px;">{{ trigger.icon }}</div>
            <div>
              <div style="color: #fff; font-size: 12px; font-weight: 700;">{{ trigger.symbol }}</div>
              <div style="color: #888; font-size: 9px;">{{ formatTime(trigger.triggeredAt) }}</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="color: #f52a09; font-size: 12px;">Stopped at ${{ trigger.stopPrice.toFixed(4) }}</div>
            <div :style="`color: ${trigger.savedAmount >= 0 ? '#10eb04' : '#f52a09'}; font-size: 10px;`">
              {{ trigger.savedAmount >= 0 ? 'Saved' : 'Loss' }}: ${{ Math.abs(trigger.savedAmount).toLocaleString() }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <n-modal v-model:show="showCreateModal" preset="card" style="width: 600px; background: #1a1a2e; border: 1px solid #f52a09;">
      <template #header>
        <div style="color: #f52a09; font-size: 16px; font-weight: 700;">
          {{ editingStopLoss ? '✏️ Edit Stop-Loss' : '➕ Add Stop-Loss' }}
        </div>
      </template>
      <div style="padding: 10px;">
        <!-- Symbol Selection -->
        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Symbol</div>
          <n-select
            v-model:value="formData.symbol"
            :options="symbolOptions"
            placeholder="Select trading pair"
          />
        </div>

        <!-- Type Selection -->
        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Stop-Loss Type</div>
          <n-select
            v-model:value="formData.type"
            :options="typeOptions"
          />
        </div>

        <!-- Side Selection -->
        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Side</div>
          <n-select
            v-model:value="formData.side"
            :options="sideOptions"
          />
        </div>

        <!-- Entry Price -->
        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Entry Price ($)</div>
          <n-input-number
            v-model:value="formData.entryPrice"
            :precision="4"
            :min="0"
            style="width: 100%;"
          />
        </div>

        <!-- Stop-Loss Price/Percent -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 15px;">
          <div>
            <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Stop-Loss Price ($)</div>
            <n-input-number
              v-model:value="formData.stopPrice"
              :precision="4"
              :min="0"
              style="width: 100%;"
              @update:value="calculatePercent"
            />
          </div>
          <div>
            <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Or Stop-Loss (%)</div>
            <n-input-number
              v-model:value="formData.stopPercent"
              :precision="2"
              :min="0"
              :max="100"
              style="width: 100%;"
              @update:value="calculatePrice"
            />
          </div>
        </div>

        <!-- Position Size & Value -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 15px;">
          <div>
            <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Position Size</div>
            <n-input-number
              v-model:value="formData.size"
              :precision="2"
              :min="0"
              style="width: 100%;"
            />
          </div>
          <div>
            <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Position Value ($)</div>
            <n-input-number
              v-model:value="formData.value"
              :precision="2"
              :min="0"
              style="width: 100%;"
            />
          </div>
        </div>

        <!-- Trailing Stop -->
        <div style="margin-bottom: 15px;">
          <n-checkbox v-model:checked="formData.isTrailing">
            Enable Trailing Stop
          </n-checkbox>
        </div>

        <div v-if="formData.isTrailing" style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Trailing Percent (%)</div>
          <n-slider
            v-model:value="formData.trailingPercent"
            :min="0.5"
            :max="10"
            :step="0.5"
            :marks="{ 0.5: '0.5%', 2: '2%', 5: '5%', 10: '10%' }"
          />
        </div>

        <!-- Take Profit -->
        <div style="margin-bottom: 15px;">
          <n-checkbox v-model:checked="formData.takeProfitEnabled">
            Add Take Profit
          </n-checkbox>
        </div>

        <div v-if="formData.takeProfitEnabled" style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 11px; margin-bottom: 5px;">Take Profit Price ($)</div>
          <n-input-number
            v-model:value="formData.takeProfit"
            :precision="4"
            :min="0"
            style="width: 100%;"
          />
        </div>

        <!-- Risk Summary -->
        <div style="background: rgba(245,42,9,0.1); border: 1px solid rgba(245,42,9,0.3); padding: 12px; border-radius: 6px; margin-bottom: 15px;">
          <div style="color: #f52a09; font-size: 12px; font-weight: 700; margin-bottom: 8px;">Risk Summary</div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
            <div>
              <div style="color: #888; font-size: 9px;">Max Risk</div>
              <div style="color: #f52a09; font-size: 13px; font-weight: 700;">
                ${{ calculateRisk().toLocaleString() }}
              </div>
            </div>
            <div>
              <div style="color: #888; font-size: 9px;">Risk %</div>
              <div style="color: #f52a09; font-size: 13px; font-weight: 700;">
                {{ calculateRiskPercent().toFixed(2) }}%
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div style="display: flex; gap: 10px;">
          <n-button type="error" style="flex: 1;" @click="saveStopLoss">
            {{ editingStopLoss ? '💾 Update' : '➕ Create' }}
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
const editingStopLoss = ref(null);
const isRefreshing = ref(false);

// Form data
const formData = ref({
  symbol: 'BTC/USDT',
  type: 'Stop Market',
  side: 'Long',
  entryPrice: 43250,
  stopPrice: 41000,
  stopPercent: 5.2,
  size: 0.5,
  value: 21625,
  isTrailing: false,
  trailingPercent: 2,
  takeProfitEnabled: false,
  takeProfit: 45000
});

// Options
const symbolOptions = [
  { label: 'BTC/USDT', value: 'BTC/USDT' },
  { label: 'ETH/USDT', value: 'ETH/USDT' },
  { label: 'LCX/USDC', value: 'LCX/USDC' },
  { label: 'SOL/USDT', value: 'SOL/USDT' },
  { label: 'BNB/USDT', value: 'BNB/USDT' }
];

const typeOptions = [
  { label: 'Stop Market', value: 'Stop Market' },
  { label: 'Stop Limit', value: 'Stop Limit' },
  { label: 'Trailing Stop', value: 'Trailing Stop' }
];

const sideOptions = [
  { label: 'Long', value: 'Long' },
  { label: 'Short', value: 'Short' }
];

// Mock data
const stopLosses = ref([
  {
    id: 1,
    symbol: 'BTC/USDT',
    icon: '₿',
    type: 'Stop Market',
    side: 'Long',
    entryPrice: 43250,
    currentPrice: 44120,
    stopPrice: 41000,
    distance: 7.07,
    size: 0.5,
    value: 22060,
    risk: 1125,
    pnl: 435,
    pnlPercent: 2.01,
    isTrailing: true,
    trailingPercent: 2,
    takeProfitEnabled: true,
    takeProfit: 45000,
    status: 'Active',
    createdAt: Date.now() - 3600000 * 12,
    lastUpdated: Date.now() - 300000
  },
  {
    id: 2,
    symbol: 'ETH/USDT',
    icon: 'Ξ',
    type: 'Trailing Stop',
    side: 'Long',
    entryPrice: 2280,
    currentPrice: 2340,
    stopPrice: 2220,
    distance: 5.13,
    size: 5,
    value: 11700,
    risk: 300,
    pnl: 300,
    pnlPercent: 2.63,
    isTrailing: true,
    trailingPercent: 3,
    takeProfitEnabled: false,
    takeProfit: null,
    status: 'Active',
    createdAt: Date.now() - 3600000 * 8,
    lastUpdated: Date.now() - 180000
  },
  {
    id: 3,
    symbol: 'LCX/USDC',
    icon: '🔷',
    type: 'Stop Market',
    side: 'Long',
    entryPrice: 0.085,
    currentPrice: 0.0812,
    stopPrice: 0.0807,
    distance: 0.62,
    size: 50000,
    value: 4060,
    risk: 215,
    pnl: -190,
    pnlPercent: -4.47,
    isTrailing: false,
    trailingPercent: null,
    takeProfitEnabled: true,
    takeProfit: 0.095,
    status: 'Warning',
    createdAt: Date.now() - 3600000 * 24,
    lastUpdated: Date.now() - 60000
  },
  {
    id: 4,
    symbol: 'SOL/USDT',
    icon: '◎',
    type: 'Stop Limit',
    side: 'Long',
    entryPrice: 98,
    currentPrice: 102.5,
    stopPrice: 93,
    distance: 9.27,
    size: 20,
    value: 2050,
    risk: 100,
    pnl: 90,
    pnlPercent: 4.59,
    isTrailing: false,
    trailingPercent: null,
    takeProfitEnabled: true,
    takeProfit: 110,
    status: 'Active',
    createdAt: Date.now() - 3600000 * 6,
    lastUpdated: null
  },
  {
    id: 5,
    symbol: 'BNB/USDT',
    icon: '🔶',
    type: 'Stop Market',
    side: 'Long',
    entryPrice: 315,
    currentPrice: 318.5,
    stopPrice: 305,
    distance: 4.24,
    size: 10,
    value: 3185,
    risk: 100,
    pnl: 35,
    pnlPercent: 1.11,
    isTrailing: true,
    trailingPercent: 2.5,
    takeProfitEnabled: false,
    takeProfit: null,
    status: 'Active',
    createdAt: Date.now() - 3600000 * 4,
    lastUpdated: Date.now() - 120000
  }
]);

const recentTriggers = ref([
  {
    id: 1,
    symbol: 'MATIC/USDT',
    icon: '⬡',
    stopPrice: 0.78,
    triggeredAt: Date.now() - 3600000 * 2,
    savedAmount: 124
  },
  {
    id: 2,
    symbol: 'LINK/USDT',
    icon: '🔗',
    stopPrice: 13.8,
    triggeredAt: Date.now() - 3600000 * 5,
    savedAmount: 87
  },
  {
    id: 3,
    symbol: 'ADA/USDT',
    icon: '₳',
    stopPrice: 0.54,
    triggeredAt: Date.now() - 3600000 * 18,
    savedAmount: 215
  }
]);

// Computed
const activeStopLosses = computed(() => stopLosses.value.length);
const totalPositions = computed(() => stopLosses.value.length);
const triggeredToday = computed(() => recentTriggers.value.length);
const savedCapital = computed(() => recentTriggers.value.reduce((sum, t) => sum + t.savedAmount, 0));
const avgSlDistance = computed(() => {
  const total = stopLosses.value.reduce((sum, sl) => sum + sl.distance, 0);
  return (total / stopLosses.value.length).toFixed(2);
});
const trailingStops = computed(() => stopLosses.value.filter(sl => sl.isTrailing).length);

// Methods
const getStatusColor = (status) => {
  if (status === 'Active') return 'rgba(15,52,96,0.3)';
  if (status === 'Warning') return 'rgba(245,42,9,0.1)';
  return 'rgba(15,52,96,0.3)';
};

const getStatusBorder = (status) => {
  if (status === 'Active') return '#0f3460';
  if (status === 'Warning') return 'rgba(245,42,9,0.5)';
  return '#0f3460';
};

const getStatusType = (status) => {
  if (status === 'Active') return 'success';
  if (status === 'Warning') return 'error';
  return 'default';
};

const getDistanceColor = (distance) => {
  if (distance > 5) return '#10eb04';
  if (distance > 2) return '#ff6b35';
  return '#f52a09';
};

const getProgressWidth = (sl) => {
  const range = Math.abs(sl.entryPrice - sl.stopPrice);
  const current = Math.abs(sl.currentPrice - sl.stopPrice);
  return Math.min(100, (current / range) * 100);
};

const getProgressColor = (sl) => {
  const width = getProgressWidth(sl);
  if (width > 80) return '#10eb04';
  if (width > 50) return '#ff6b35';
  return '#f52a09';
};

const formatTime = (timestamp) => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

const calculatePercent = () => {
  if (formData.value.entryPrice && formData.value.stopPrice) {
    formData.value.stopPercent = Math.abs(
      ((formData.value.entryPrice - formData.value.stopPrice) / formData.value.entryPrice) * 100
    );
  }
};

const calculatePrice = () => {
  if (formData.value.entryPrice && formData.value.stopPercent) {
    formData.value.stopPrice = formData.value.entryPrice * (1 - formData.value.stopPercent / 100);
  }
};

const calculateRisk = () => {
  if (formData.value.entryPrice && formData.value.stopPrice && formData.value.size) {
    return Math.abs((formData.value.entryPrice - formData.value.stopPrice) * formData.value.size);
  }
  return 0;
};

const calculateRiskPercent = () => {
  if (formData.value.value && calculateRisk() > 0) {
    return (calculateRisk() / formData.value.value) * 100;
  }
  return 0;
};

const editStopLoss = (sl) => {
  editingStopLoss.value = sl;
  formData.value = {
    symbol: sl.symbol,
    type: sl.type,
    side: sl.side,
    entryPrice: sl.entryPrice,
    stopPrice: sl.stopPrice,
    stopPercent: sl.distance,
    size: sl.size,
    value: sl.value,
    isTrailing: sl.isTrailing,
    trailingPercent: sl.trailingPercent || 2,
    takeProfitEnabled: sl.takeProfitEnabled,
    takeProfit: sl.takeProfit
  };
  showCreateModal.value = true;
};

const saveStopLoss = () => {
  if (editingStopLoss.value) {
    // Update existing
    const index = stopLosses.value.findIndex(sl => sl.id === editingStopLoss.value.id);
    if (index !== -1) {
      stopLosses.value[index] = {
        ...stopLosses.value[index],
        ...formData.value,
        lastUpdated: Date.now()
      };
    }
  } else {
    // Create new
    const newStopLoss = {
      id: Date.now(),
      ...formData.value,
      icon: getIconForSymbol(formData.value.symbol),
      currentPrice: formData.value.entryPrice,
      distance: formData.value.stopPercent,
      risk: calculateRisk(),
      pnl: 0,
      pnlPercent: 0,
      status: 'Active',
      createdAt: Date.now(),
      lastUpdated: null
    };
    stopLosses.value.unshift(newStopLoss);
  }

  cancelEdit();
};

const getIconForSymbol = (symbol) => {
  const icons = {
    'BTC/USDT': '₿',
    'ETH/USDT': 'Ξ',
    'LCX/USDC': '🔷',
    'SOL/USDT': '◎',
    'BNB/USDT': '🔶'
  };
  return icons[symbol] || '💎';
};

const cancelEdit = () => {
  showCreateModal.value = false;
  editingStopLoss.value = null;
  formData.value = {
    symbol: 'BTC/USDT',
    type: 'Stop Market',
    side: 'Long',
    entryPrice: 43250,
    stopPrice: 41000,
    stopPercent: 5.2,
    size: 0.5,
    value: 21625,
    isTrailing: false,
    trailingPercent: 2,
    takeProfitEnabled: false,
    takeProfit: 45000
  };
};

const removeStopLoss = (id) => {
  const index = stopLosses.value.findIndex(sl => sl.id === id);
  if (index !== -1) {
    stopLosses.value.splice(index, 1);
  }
};

const applyToAll = () => {
  console.log('Apply to all positions');
};

const enableTrailing = () => {
  stopLosses.value = stopLosses.value.map(sl => ({
    ...sl,
    isTrailing: true,
    trailingPercent: sl.trailingPercent || 2,
    lastUpdated: Date.now()
  }));
};

const tightenStops = () => {
  stopLosses.value = stopLosses.value.map(sl => ({
    ...sl,
    stopPrice: sl.currentPrice * 0.98,
    distance: 2,
    lastUpdated: Date.now()
  }));
};

const refreshData = async () => {
  isRefreshing.value = true;
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Update current prices
  stopLosses.value = stopLosses.value.map(sl => {
    const newPrice = sl.currentPrice * (1 + (Math.random() - 0.5) * 0.01);
    const newPnl = (newPrice - sl.entryPrice) * sl.size;
    const newPnlPercent = ((newPrice - sl.entryPrice) / sl.entryPrice) * 100;

    return {
      ...sl,
      currentPrice: newPrice,
      pnl: newPnl,
      pnlPercent: newPnlPercent,
      distance: Math.abs(((newPrice - sl.stopPrice) / newPrice) * 100)
    };
  });

  isRefreshing.value = false;
};

const exportReport = () => {
  const data = stopLosses.value.map(sl => ({
    Symbol: sl.symbol,
    Type: sl.type,
    Side: sl.side,
    EntryPrice: sl.entryPrice,
    CurrentPrice: sl.currentPrice,
    StopPrice: sl.stopPrice,
    Distance: sl.distance,
    Size: sl.size,
    Value: sl.value,
    Risk: sl.risk,
    PnL: sl.pnl,
    'PnL %': sl.pnlPercent,
    Status: sl.status
  }));

  const csv = [
    Object.keys(data[0]).join(','),
    ...data.map(row => Object.values(row).join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stop-loss-report-${Date.now()}.csv`;
  a.click();
};
</script>
