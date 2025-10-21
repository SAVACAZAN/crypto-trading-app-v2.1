<template>
  <div>
    <!-- All controls now in NAVBAR - TickerBar + ApiSelector -->

    <!-- Action Buttons Bar -->
    <div style="background: #1a1a1a; padding: 6px 10px; border-radius: 6px; margin-bottom: 8px; border: 1px solid #333; display: flex; gap: 12px; align-items: center;">
      <!-- Refresh Orders Button -->
      <n-button size="small" type="primary" @click="fetchAllOrders" :loading="loadingOrders">
        🔄 Refresh Orders
      </n-button>

      <!-- Calculate Statistics Button -->
      <n-button size="small" type="success" @click="calculateStatistics" :loading="calculatingStats" :disabled="allOrders.length === 0">
        📊 Calculate Stats
      </n-button>

      <!-- Statistics Status -->
      <n-text v-if="statisticsAge" style="font-size: 9px; color: #888;">
        Stats: {{ statisticsAge }}
      </n-text>

      <!-- API Keys Info -->
      <n-text strong style="font-size: 10px; color: #10eb04; margin-left: auto;">
        APIs: {{ selectedApiKeys.length }}
      </n-text>
    </div>

    <!-- Loading Indicator -->
    <div v-if="loadingOrders" style="padding: 20px; text-align: center;">
      <n-spin size="large" />
      <div style="margin-top: 10px; color: #888;">Loading all orders from database...</div>
    </div>

    <!-- Main Tabs Container -->
    <div v-else class="container">
      <n-tabs v-model:value="activeTab" type="card" animated>
        <!-- Tab 1: Orders Table (First Tab) -->
        <n-tab-pane name="orders" tab="📈 Orders Table">
          <ClosedOrdersTable
            :all-orders="allOrders"
            :selected-api-keys="selectedApiKeys"
            :api-key-colors="apiKeyColors"
            :base="base"
            :quote="quote"
          />
        </n-tab-pane>

        <!-- Tab 2: Top Orders Analysis -->
        <n-tab-pane name="top-orders" tab="🔝 Top Orders">
          <TopOrdersCards
            :all-orders="allOrders"
            :selected-api-keys="selectedApiKeys"
            :api-key-colors="apiKeyColors"
          />
        </n-tab-pane>

        <!-- Tab 3: Last & Big Trades per API -->
        <n-tab-pane name="last-big-trades" tab="💎 Last & Big Trades per API">
          <!-- Last Trades Section -->
          <LastTradesPerApiCards
            :all-orders="allOrders"
            :selected-api-keys="selectedApiKeys"
            :api-key-colors="apiKeyColors"
          />

          <!-- Big Orders Section -->
          <div style="margin-top: 16px;">
            <BigOrdersCards
              :all-orders="allOrders"
              :selected-api-keys="selectedApiKeys"
              :api-key-colors="apiKeyColors"
            />
          </div>
        </n-tab-pane>

        <!-- Tab 4: Performance Stats -->
        <n-tab-pane name="performance" tab="📊 Performance">
          <PerformanceStatsCards
            :all-orders="allOrders"
            :selected-api-keys="selectedApiKeys"
            :api-key-colors="apiKeyColors"
            :base="base"
          />
        </n-tab-pane>

        <!-- Tab 5: Price & Extremes -->
        <n-tab-pane name="price-extremes" tab="📈 Price & Extremes">
          <PriceExtremesCards
            :all-orders="allOrders"
            :selected-api-keys="selectedApiKeys"
            :api-key-colors="apiKeyColors"
            :base="base"
            :quote="quote"
          />
        </n-tab-pane>

        <!-- Tab 6: Trading Patterns -->
        <n-tab-pane name="patterns" tab="🎯 Trading Patterns">
          <TradingPatternsCards
            :all-orders="allOrders"
            :selected-api-keys="selectedApiKeys"
            :api-key-colors="apiKeyColors"
          />
        </n-tab-pane>

        <!-- Tab 7: Weekly & Monthly Trades -->
        <n-tab-pane name="weekly-monthly" tab="📅 Weekly & Monthly">
          <WeeklyMonthlyTradesCards
            :all-orders="allOrders"
            :selected-api-keys="selectedApiKeys"
            :api-key-colors="apiKeyColors"
          />
        </n-tab-pane>

        <!-- Tab 8: All Analysis Cards -->
        <n-tab-pane name="all-cards" tab="📊 All Analysis Cards">
          <ClosedOrdersAnalysisCards
            :all-orders="allOrders"
            :selected-api-keys="selectedApiKeys"
            :api-key-colors="apiKeyColors"
            :base="base"
            :quote="quote"
          />
        </n-tab-pane>

        <!-- Tab 9: Statistics Summary -->
        <n-tab-pane name="summary" tab="📋 Summary">
          <n-card style="background: #0f0f0f;">
            <n-text strong style="color: #f5a623; font-size: 13px; display: block; margin-bottom: 12px;">
              📋 ORDERS SUMMARY
            </n-text>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
              <!-- Total Orders -->
              <n-statistic label="Total Orders" :value="totalOrdersCount">
                <template #prefix>📦</template>
              </n-statistic>

              <!-- Total Volume -->
              <n-statistic label="Total Volume" :value="formatNumber(totalVolume.toFixed(2))">
                <template #prefix>💰</template>
                <template #suffix>{{ base }}</template>
              </n-statistic>

              <!-- Total Cost -->
              <n-statistic label="Total Cost" :value="'$' + formatNumber(totalCost.toFixed(2))">
                <template #prefix>💵</template>
              </n-statistic>

              <!-- Average Order Size -->
              <n-statistic label="Avg Order Size" :value="formatNumber(averageOrderSize.toFixed(2))">
                <template #prefix>📏</template>
                <template #suffix>{{ base }}</template>
              </n-statistic>

              <!-- Buy Orders -->
              <n-statistic label="Buy Orders" :value="buyOrdersCount">
                <template #prefix>
                  <span style="color: #10eb04;">🟢</span>
                </template>
                <template #suffix>
                  <span style="color: #888;">({{ buyPercentage }}%)</span>
                </template>
              </n-statistic>

              <!-- Sell Orders -->
              <n-statistic label="Sell Orders" :value="sellOrdersCount">
                <template #prefix>
                  <span style="color: #e90a15;">🔴</span>
                </template>
                <template #suffix>
                  <span style="color: #888;">({{ sellPercentage }}%)</span>
                </template>
              </n-statistic>
            </div>

            <!-- API Keys Summary -->
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #333;">
              <n-text strong style="color: #10eb04; font-size: 11px; display: block; margin-bottom: 10px;">
                API KEYS PERFORMANCE
              </n-text>
              <n-table :bordered="false" size="small">
                <thead>
                  <tr>
                    <th>API Key</th>
                    <th>Orders</th>
                    <th>Volume</th>
                    <th>Cost</th>
                    <th>Buy/Sell Orders</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="item in apiKeySummary" :key="item.apiKey">
                    <tr>
                      <td :style="`color: ${apiKeyColors[item.apiKey]}; font-weight: 600;`">{{ item.apiKey }}</td>
                      <td>{{ item.orders }}</td>
                      <td>
                        <div>{{ formatNumber(item.volume.toFixed(2)) }} {{ base }}</div>
                        <div style="font-size: 8px; color: #888; margin-top: 2px;">
                          <span style="color: #20b2aa;">buy: {{ formatNumber(item.volumeBuy.toFixed(2)) }}</span> |
                          <span style="color: #cd5c5c;">sell: {{ formatNumber(item.volumeSell.toFixed(2)) }}</span>
                        </div>
                      </td>
                      <td>
                        <div>${{ formatNumber(item.cost.toFixed(2)) }}</div>
                        <div style="font-size: 8px; color: #888; margin-top: 2px;">
                          <span style="color: #20b2aa;">buy: ${{ formatNumber(item.costBuy.toFixed(2)) }}</span> |
                          <span style="color: #cd5c5c;">sell: ${{ formatNumber(item.costSell.toFixed(2)) }}</span>
                        </div>
                      </td>
                      <td>
                        <span style="color: #10eb04;">{{ item.buy }}</span> /
                        <span style="color: #e90a15;">{{ item.sell }}</span>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </n-table>
            </div>
          </n-card>
        </n-tab-pane>
      </n-tabs>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { useAppStore } from '~/stores/app.store';
import { ref, computed } from "vue";
import { clearIntervalAsync, setIntervalAsync } from "set-interval-async";
import ClosedOrdersTable from './ClosedOrdersTable.vue';
import ClosedOrdersAnalysisCards from './ClosedOrdersAnalysisCards.vue';
import TopOrdersCards from './TopOrdersCards.vue';
import LastTradesPerApiCards from './LastTradesPerApiCards.vue';
import BigOrdersCards from './BigOrdersCards.vue';
import PerformanceStatsCards from './PerformanceStatsCards.vue';
import PriceExtremesCards from './PriceExtremesCards.vue';
import TradingPatternsCards from './TradingPatternsCards.vue';
import WeeklyMonthlyTradesCards from './WeeklyMonthlyTradesCards.vue';

// No more props needed - everything from store
const app = useAppStore();

// User and market data
let userID = useCookie('userID');
let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);
let base = currentSymbol.value.split('/')[0];
let quote = currentSymbol.value.split('/')[1];

// Ticker variables
let ticker = ref({
  last: 0,
  change: 0,
  low: 0,
  high: 0,
  baseVolume: 0,
  quoteVolume: 0
});
let tickerBTC = ref(0);
let tickerETH = ref(0);
let tickerInterval = null;
let userExchanges = app.getUserExchanges;
let userExchangeMarkets = app.getUserExchangeMarkets;
let selectedExchange = ref(app.getUserSelectedExchange);
let selectedMarket = ref(app.getUserSelectedMarket);

// API Key selector - NOW USING STORE
let availableApiKeys = ref([]);
let selectedApiKeys = computed(() => app.getSelectedApiKeys || []); // READ FROM STORE
let loadingApiKeys = ref(false);
let loadingOrders = ref(false);
let allOrders = ref([]);
let apiKeyColors = ref({});

// Statistics management
let calculatingStats = ref(false);
let statisticsData = ref(null);
let statisticsAge = ref(null);
let usePreCalculatedStats = ref(false);

// Tab control
const activeTab = ref('orders'); // Start with orders table

// Computed properties
let MaxNrGrids = computed(() => {
  return 500 * selectedApiKeys.value.length;
});

let RemainingNrGrids = computed(() => {
  return MaxNrGrids.value - (buyOrders.value.length + sellOrders.value.length);
});

const buyOrders = computed(() => {
  if (selectedApiKeys.value.length === 0) return [];
  return allOrders.value.filter(order =>
    selectedApiKeys.value.includes(order.apiKeyName) && order.side === 'buy'
  );
});

const sellOrders = computed(() => {
  if (selectedApiKeys.value.length === 0) return [];
  return allOrders.value.filter(order =>
    selectedApiKeys.value.includes(order.apiKeyName) && order.side === 'sell'
  );
});

// Statistics computed properties
const totalOrdersCount = computed(() => {
  return selectedApiKeys.value.length === 0 ? 0 :
    allOrders.value.filter(order => selectedApiKeys.value.includes(order.apiKeyName)).length;
});

const totalVolume = computed(() => {
  if (selectedApiKeys.value.length === 0) return 0;
  return allOrders.value
    .filter(order => selectedApiKeys.value.includes(order.apiKeyName))
    .reduce((sum, order) => sum + (order.filled || order.amount || 0), 0);
});

const totalCost = computed(() => {
  if (selectedApiKeys.value.length === 0) return 0;
  return allOrders.value
    .filter(order => selectedApiKeys.value.includes(order.apiKeyName))
    .reduce((sum, order) => sum + (order.cost || 0), 0);
});

const averageOrderSize = computed(() => {
  if (totalOrdersCount.value === 0) return 0;
  return totalVolume.value / totalOrdersCount.value;
});

const buyOrdersCount = computed(() => buyOrders.value.length);
const sellOrdersCount = computed(() => sellOrders.value.length);

const buyPercentage = computed(() => {
  if (totalOrdersCount.value === 0) return 0;
  return Math.round((buyOrdersCount.value / totalOrdersCount.value) * 100);
});

const sellPercentage = computed(() => {
  if (totalOrdersCount.value === 0) return 0;
  return Math.round((sellOrdersCount.value / totalOrdersCount.value) * 100);
});

const apiKeySummary = computed(() => {
  const summary = {};

  allOrders.value
    .filter(order => selectedApiKeys.value.includes(order.apiKeyName))
    .forEach(order => {
      const key = order.apiKeyName;
      if (!summary[key]) {
        summary[key] = {
          apiKey: key,
          orders: 0,
          volume: 0,
          volumeBuy: 0,
          volumeSell: 0,
          cost: 0,
          costBuy: 0,
          costSell: 0,
          buy: 0,
          sell: 0
        };
      }
      summary[key].orders++;
      summary[key].volume += (order.filled || order.amount || 0);
      summary[key].cost += (order.cost || 0);
      if (order.side === 'buy') {
        summary[key].buy++;
        summary[key].volumeBuy += (order.filled || order.amount || 0);
        summary[key].costBuy += (order.cost || 0);
      } else {
        summary[key].sell++;
        summary[key].volumeSell += (order.filled || order.amount || 0);
        summary[key].costSell += (order.cost || 0);
      }
    });

  return Object.values(summary).sort((a, b) => b.cost - a.cost);
});

// Methods
async function fetchApiKeys() {
  loadingApiKeys.value = true;
  try {
    const response = await $fetch('/api/v1/getUserApiKeys', {
      query: {
        userID: userID.value,
        exchange: currentExchange.value
      }
    });

    if (response.data) {
      // Generate colors for each API key
      const colors = ['#10eb04', '#f39c12', '#13e6f5', '#e2c102', '#ff6347', '#9370db', '#ffd700'];

      availableApiKeys.value = response.data.map((apiKey, index) => ({
        label: apiKey.name,
        value: apiKey.name
      }));

      response.data.forEach((apiKey, index) => {
        apiKeyColors.value[apiKey.name] = colors[index % colors.length];
      });

      // Auto-select all API keys if store is empty
      if (app.getSelectedApiKeys.length === 0) {
        const allKeys = response.data.map(apiKey => apiKey.name);
        app.setSelectedApiKeys(allKeys);
        console.log('📋 ClosedOrdersDev: Auto-selected all API keys:', allKeys);
      }
    }
  } catch (error) {
    console.error('Failed to fetch API keys:', error);
  } finally {
    loadingApiKeys.value = false;
  }
}

async function fetchAllOrders() {
  // Use selectedApiKeys from store instead of availableApiKeys
  if (!selectedApiKeys.value || selectedApiKeys.value.length === 0) {
    console.log('[FRONTEND] No API keys selected in store, skipping order fetch');
    return;
  }

  loadingOrders.value = true;
  allOrders.value = [];

  console.log('[FRONTEND] Starting to fetch ALL orders from database...');
  console.log('[FRONTEND] Selected API keys from store:', selectedApiKeys.value);
  console.log('[FRONTEND] Exchange:', currentExchange.value, 'Symbol:', currentSymbol.value);

  for (const apiKeyName of selectedApiKeys.value) {
    try {
      console.log(`[FRONTEND] 🔄 Fetching ALL orders for ${apiKeyName}...`);

      // Use the new endpoint that returns ALL orders without limits
      let closedOrdersRes = await $fetch('/api/v1/getAllClosedOrders', {
        query: {
          userID: userID.value,
          exchange: currentExchange.value,
          symbol: currentSymbol.value,
          apiKeyName: apiKeyName
        }
      });

      console.log(`[FRONTEND] ✅ ${apiKeyName}: received ${closedOrdersRes.data?.length || 0} orders`);

      if (closedOrdersRes.data && closedOrdersRes.data.length > 0) {
        // Process orders in chunks to avoid stack overflow
        const chunkSize = 30000;
        const ordersData = closedOrdersRes.data;

        console.log(`[FRONTEND] 📦 Processing ${ordersData.length} orders in chunks of ${chunkSize}...`);

        for (let i = 0; i < ordersData.length; i += chunkSize) {
          const chunk = ordersData.slice(i, i + chunkSize);
          const taggedChunk = chunk.map(order => ({
            ...order,
            apiKeyName: apiKeyName
          }));

          // Use concat instead of spread operator to avoid stack overflow
          allOrders.value = allOrders.value.concat(taggedChunk);

          // Log progress for large datasets
          if (ordersData.length > 30000) {
            console.log(`[FRONTEND] 📊 Processed ${Math.min(i + chunkSize, ordersData.length)}/${ordersData.length} orders...`);
          }
        }

        console.log(`[FRONTEND] ✅ ${apiKeyName}: processed ${ordersData.length} orders`);
      }
    } catch (error) {
      console.error(`[FRONTEND] ❌ Failed to fetch orders for ${apiKeyName}:`, error);
    }
  }

  console.log(`[FRONTEND] ✅ Total orders loaded: ${allOrders.value.length}`);
  loadingOrders.value = false;
}

async function updateSelectedExchange(value) {
  selectedExchange.value = value;
  app.setUserSelectedExchange(value);
  await fetchApiKeys();
  await fetchAllOrders();
}

async function updateSelectedMarket(value) {
  selectedMarket.value = value;
  app.setUserSelectedMarket(value);
  base = value.split('/')[0];
  quote = value.split('/')[1];
  await fetchAllOrders();
}

async function fetchTicker() {
  try {
    const response = await $fetch('/api/v1/fetchTicker', {
      query: {
        userID: userID.value,
        exchange: currentExchange.value,
        symbol: currentSymbol.value
      }
    });

    if (response.data) {
      ticker.value = response.data;
    }

    // Fetch BTC and ETH prices
    const btcResponse = await $fetch('/api/v1/fetchTicker', {
      query: {
        userID: userID.value,
        exchange: currentExchange.value,
        symbol: 'BTC/USD'
      }
    });
    if (btcResponse.data) {
      tickerBTC.value = btcResponse.data.last;
    }

    const ethResponse = await $fetch('/api/v1/fetchTicker', {
      query: {
        userID: userID.value,
        exchange: currentExchange.value,
        symbol: 'ETH/USD'
      }
    });
    if (ethResponse.data) {
      tickerETH.value = ethResponse.data.last;
    }
  } catch (error) {
    console.error('Failed to fetch ticker:', error);
  }
}

// Statistics functions
async function calculateStatistics() {
  if (allOrders.value.length === 0) {
    console.log('[STATS] No orders to calculate statistics for');
    return;
  }

  calculatingStats.value = true;

  try {
    console.log(`[STATS] 🔄 Calculating statistics for ${allOrders.value.length} orders...`);

    const response = await $fetch('/api/v1/calculateOrderStatistics', {
      method: 'POST',
      body: {
        userID: userID.value,
        exchange: currentExchange.value,
        symbol: currentSymbol.value,
        apiKeyNames: selectedApiKeys.value
      }
    });

    if (response.success) {
      console.log(`[STATS] ✅ Statistics calculated successfully in ${response.duration}ms`);

      // Fetch the newly calculated statistics
      await fetchStatistics();

      // Show success message
      window.$message?.success(`Statistics calculated for ${response.orderCount} orders in ${response.duration}ms`);
    } else {
      console.error('[STATS] ❌ Failed to calculate statistics:', response.error);
      window.$message?.error(`Failed to calculate statistics: ${response.error}`);
    }
  } catch (error) {
    console.error('[STATS] ❌ Error calculating statistics:', error);
    window.$message?.error('Error calculating statistics');
  } finally {
    calculatingStats.value = false;
  }
}

async function fetchStatistics() {
  try {
    const response = await $fetch('/api/v1/getOrderStatistics', {
      query: {
        userID: userID.value,
        exchange: currentExchange.value,
        symbol: currentSymbol.value
      }
    });

    if (response.success && response.data) {
      statisticsData.value = response.data;

      // Calculate age
      const ageMs = response.meta.age;
      if (ageMs < 60000) {
        statisticsAge.value = `${Math.floor(ageMs / 1000)}s ago`;
      } else if (ageMs < 3600000) {
        statisticsAge.value = `${Math.floor(ageMs / 60000)}m ago`;
      } else if (ageMs < 86400000) {
        statisticsAge.value = `${Math.floor(ageMs / 3600000)}h ago`;
      } else {
        statisticsAge.value = `${Math.floor(ageMs / 86400000)}d ago`;
      }

      console.log(`[STATS] ✅ Statistics fetched (${statisticsAge.value})`);
      usePreCalculatedStats.value = true;
    } else if (response.needsCalculation) {
      console.log('[STATS] ⚠️ No pre-calculated statistics found');
      statisticsAge.value = null;
      usePreCalculatedStats.value = false;
    }
  } catch (error) {
    console.error('[STATS] ❌ Error fetching statistics:', error);
    usePreCalculatedStats.value = false;
  }
}

function formatNumber(value, type = 'default') {
  if (value === null || value === undefined || isNaN(value)) return '0';

  const num = parseFloat(value);

  if (type === 'Price' || type === 'AveragePrice') {
    if (num >= 1000) return num.toFixed(2);
    if (num >= 1) return num.toFixed(4);
    if (num >= 0.01) return num.toFixed(6);
    return num.toFixed(8);
  }

  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
  if (num >= 1) return num.toFixed(2);
  if (num >= 0.01) return num.toFixed(4);
  return num.toFixed(6);
}

// Watch for changes in store's selected API keys
watch(() => app.getSelectedApiKeys, (newApiKeys) => {
  console.log('📋 ClosedOrdersDev: Store API keys changed:', newApiKeys);
  // Refresh orders when API keys change
  fetchAllOrders();
}, { deep: true });

// Lifecycle hooks
onMounted(async () => {
  await fetchApiKeys();
  await fetchAllOrders();
  await fetchTicker();

  // Set up ticker interval
  tickerInterval = setIntervalAsync(fetchTicker, 30000); // Update every 30 seconds
});

onUnmounted(() => {
  if (tickerInterval) {
    clearIntervalAsync(tickerInterval);
  }
});
</script>

<style scoped>
.container {
  padding: 10px;
}
</style>