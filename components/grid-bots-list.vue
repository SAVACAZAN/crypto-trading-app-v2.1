<script setup>
const notification = useNotification();
import { useAppStore } from '~/stores/app.store';
import {NButton} from "naive-ui";
import {clearIntervalAsync, setIntervalAsync} from "set-interval-async";
const app = useAppStore()

let userID = useCookie('userID');

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);

let base = currentSymbol.value.split('/')[0];
let quote = currentSymbol.value.split('/')[1];

// API Key selector - MULTIPLE SELECTION
let availableApiKeys = ref([]);
// Watch store for selected API keys from navbar
const selectedApiKeys = computed(() => app.getSelectedApiKeys);
let loadingApiKeys = ref(false);
let apiKeyBalances = ref({});
let apiKeyColors = ref({});  // Colors for each API key
let loadingBalances = ref(false);

const gridBotsTablePagination = false;
const gridBotsTableColumns = [
  {
    title: "Name",
    key: "name"
  },
  {
    title: "Symbol",
    key: "symbol"
  },
  {
    title: "API Keys",
    key: "apiKeys",
    render(row) {
      if (!row.apiKeys || row.apiKeys.length === 0) {
        return h('span', { style: 'color: #888; font-style: italic;' }, '-');
      }

      // Display API keys with colored dots
      return h('div', { style: 'display: flex; flex-direction: column; gap: 2px;' },
        row.apiKeys.map(apiKey => {
          const color = apiKeyColors.value[apiKey] || '#ffffff';
          return h('div', { style: 'display: flex; align-items: center; gap: 4px;' }, [
            h('span', {
              style: `display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${color};`
            }),
            h('span', { style: `color: ${color}; font-size: 11px; font-weight: 500;` }, apiKey)
          ]);
        })
      );
    }
  },
  {
    title: "Lower Price",
    key: "lowerPrice"
  },
  {
    title: "Upper Price",
    key: "upperPrice"
  },

  {
    title: "Amount",
    key: "amount"
  },
  {
    title: "nr Of Grids",
    key: "nrOfGrids"
  },

  {
    title: "BalanceBot",
    key: "BalanceBot"
  },
  {
    title: "Profit",
    key: "Profit"
  },

];
const gridBotsTableData = ref([]);


const openOrdersTablePagination = false;
const openOrdersTableColumns = [
  {
    title: "Symbol",
    key: "symbol"
  },
  {
    title: "API Key",
    key: "apiKey",
    render(row) {
      if (!row.apiKey) {
        return h('span', { style: 'color: #888; font-style: italic;' }, '-');
      }

      const color = apiKeyColors.value[row.apiKey] || '#ffffff';
      return h('div', { style: 'display: flex; align-items: center; gap: 4px;' }, [
        h('span', {
          style: `display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${color};`
        }),
        h('span', { style: `color: ${color}; font-size: 11px; font-weight: 500;` }, row.apiKey)
      ]);
    }
  },
  {
    title: "Type",
    key: "type"
  },
  {
    title: "Side",
    key: "side",
    render(row) {
      return h(
        'span',
        {
          style: {
            color: row.side === 'buy' ? '#18a058' : '#d03050',
            fontWeight: 'bold'
          }
        },
        row.side.toUpperCase()
      );
    }
  },
  {
    title: "Price",
    key: "price"
  },
  {
    title: "Amount",
    key: "amount"
  },
  {
    title: "Filled",
    key: "filled"
  },
  {
    title: "Remaining",
    key: "remaining"
  },
  {
    title: function(row){
      return h(
          NButton,
          {
            strong: true,
            tertiary: true,
            size: "small",
            onClick: () => cancelAllOrders(row)
          },
          { default: () => "Cancel all" }
      );
    },
    key: "actions",
    render(row) {
      return h(
          NButton,
          {
            strong: true,
            tertiary: true,
            size: "small",
            onClick: () => cancelOrder(row)
          },
          { default: () => "Cancel Order" }
      );
    }
  },
];
const openOrdersTableData = ref([]);


const closedOrdersTablePagination = false;
const closedOrdersTableColumns = [
  {
    title: "Symbol",
    key: "symbol"
  },
  {
    title: "API Key",
    key: "apiKey",
    render(row) {
      if (!row.apiKey) {
        return h('span', { style: 'color: #888; font-style: italic;' }, '-');
      }

      const color = apiKeyColors.value[row.apiKey] || '#ffffff';
      return h('div', { style: 'display: flex; align-items: center; gap: 4px;' }, [
        h('span', {
          style: `display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${color};`
        }),
        h('span', { style: `color: ${color}; font-size: 11px; font-weight: 500;` }, row.apiKey)
      ]);
    }
  },
  {
    title: "Type",
    key: "type"
  },
  {
    title: "Side",
    key: "side",
    render(row) {
      return h(
        'span',
        {
          style: {
            color: row.side === 'buy' ? '#18a058' : '#d03050',
            fontWeight: 'bold'
          }
        },
        row.side.toUpperCase()
      );
    }
  },
  {
    title: "Price",
    key: "price"
  },
  {
    title: "Amount",
    key: "amount"
  },
  {
    title: "Filled",
    key: "filled"
  },
  {
    title: "Remaining",
    key: "remaining"
  },
];
const closedOrdersTableData = ref([]);

let orderListInterval = null;

// Watch for changes in selectedApiKeys from store (navbar)
watch(selectedApiKeys, async (newKeys) => {
  if (newKeys && newKeys.length > 0) {
    await fetchBalancesForApiKeys();
    await fetchOrdersPooling();
  }
}, { immediate: true });

onMounted(async () => {
  await loadApiKeys();
  await fetchBalancesForApiKeys();
  orderListInterval = setIntervalAsync(fetchOrdersPooling, 500);
});

onUnmounted(() => {
  clearIntervalAsync(orderListInterval);
});

async function cancelOrder(row) {
  let data = {
    userID:userID.value,
    exchange: currentExchange.value,
    id:row.id,
    symbol:currentSymbol.value,
  }

  let response = await $fetch( '/api/v1/cancelOrder', {
    method: 'POST',
    body: data
  } );

  let base = row.symbol.split('/')[0];
  let quote = row.symbol.split('/')[1];

  notification['info']({
    content: "Order Cancelled!",
    meta: `Cancelled ${data.exchange} limit ${row.side} order for ${row.amount} ${base} by using ${quote} at price ${row.price}`,
    duration: 2500,
  });
}

async function cancelAllOrders(row) {
  let orders = openOrdersTableData.value;

  for (const order of orders) {
    await cancelOrder(order);
  }
}

// API Keys Loading
async function loadApiKeys() {
  loadingApiKeys.value = true;
  try {
    const response = await $fetch('/api/v1/fetchApiKeysList', {
      query: {
        userID: userID.value,
        exchange: currentExchange.value
      }
    });

    if (response.success && response.data.length > 0) {
      // Color palette for API keys
      const colors = ['#10eb04', '#05f5ed', '#f5a623', '#eb06eb', '#eadb11', '#50e3c2', '#f72c09', '#cb8d07'];

      // Store colors for each API key
      apiKeyColors.value = {};

      availableApiKeys.value = response.data.map((apiKey, index) => {
        const color = colors[index % colors.length];
        apiKeyColors.value[apiKey.name] = color;

        return {
          label: apiKey.name,  // Just the name, no preview
          value: apiKey.name
        };
      });
    }
  } catch (error) {
    console.error('Failed to load API keys:', error);
  } finally {
    loadingApiKeys.value = false;
  }
}

// Custom render function for API key options with colored icons
function renderApiKeyLabel(option) {
  const color = apiKeyColors.value[option.value] || '#ffffff';
  return h('div', { style: 'display: flex; align-items: center;' }, [
    h('span', {
      style: `display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color}; margin-right: 8px; flex-shrink: 0;`
    }),
    h('span', { style: `color: ${color}; font-weight: 500;` }, option.label)
  ]);
}

// Fetch balances for all selected API keys
async function fetchBalancesForApiKeys() {
  if (!selectedApiKeys.value || selectedApiKeys.value.length === 0) return;

  loadingBalances.value = true;
  const newBalances = {};

  for (const apiKeyName of selectedApiKeys.value) {
    try {
      const response = await $fetch('/api/v1/fetchBalance', {
        query: {
          userID: userID.value,
          exchange: currentExchange.value,
          apiKeyName: apiKeyName
        }
      });

      if (response.success && response.data) {
        newBalances[apiKeyName] = {
          baseFree: response.data.free?.[base] || 0,
          baseUsed: response.data.used?.[base] || 0,
          baseTotal: response.data.total?.[base] || 0,
          quoteFree: response.data.free?.[quote] || 0,
          quoteUsed: response.data.used?.[quote] || 0,
          quoteTotal: response.data.total?.[quote] || 0
        };
      }
    } catch (error) {
      console.error(`Error fetching balance for ${apiKeyName}:`, error);
      newBalances[apiKeyName] = {
        baseFree: 0,
        baseUsed: 0,
        baseTotal: 0,
        quoteFree: 0,
        quoteUsed: 0,
        quoteTotal: 0
      };
    }
  }

  apiKeyBalances.value = newBalances;
  loadingBalances.value = false;
}

// Called when API keys selection changes
async function onApiKeysChange() {
  await fetchBalancesForApiKeys();
  // Reload orders for the newly selected API keys
  await fetchOrdersPooling();
}

// Format number with thousand separators
function formatNumber(value, decimals = 2) {
  const num = Number(value);
  if (isNaN(num)) return '0.00';

  // Format with fixed decimals first
  const fixed = num.toFixed(decimals);

  // Split into integer and decimal parts
  const [integerPart, decimalPart] = fixed.split('.');

  // Add thousand separators to integer part
  const withSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Combine back
  return decimalPart ? `${withSeparators}.${decimalPart}` : withSeparators;
}

async function fetchOrdersPooling() {
  let gridBotsData = [];
  let openOrdersData = [];
  let closedOrdersData = [];

  //grid bots data
  let gridBotsRes = await $fetch('/api/v1/fetchGridBots', {
    query:{
      userID:userID.value,
      exchange:currentExchange.value,
      symbol:currentSymbol.value,
    }
  });

  if (gridBotsRes.data) {
    for (let i = 0; i < gridBotsRes.data.length; i++) {
      // Extract API keys - prefer apiKeyNames (array), fallback to apiKeyName (single)
      let apiKeys = [];
      if (gridBotsRes.data[i].apiKeyNames && Array.isArray(gridBotsRes.data[i].apiKeyNames)) {
        apiKeys = gridBotsRes.data[i].apiKeyNames;
      } else if (gridBotsRes.data[i].apiKeyName) {
        apiKeys = [gridBotsRes.data[i].apiKeyName];
      }

      gridBotsData.push({
        id: gridBotsRes.data[i].id,
        name: gridBotsRes.data[i].name,
        symbol: gridBotsRes.data[i].symbol,
        apiKeys: apiKeys,  // Add API keys array
        lowerPrice: gridBotsRes.data[i].lowerPrice,
        upperPrice: gridBotsRes.data[i].upperPrice,
        amountType: gridBotsRes.data[i].amountType,
        amount: gridBotsRes.data[i].amount,
        nrOfGrids: gridBotsRes.data[i].nrOfGrids,
        ordersSide: gridBotsRes.data[i].ordersSide,
        incrementalPercentAmountBuy: gridBotsRes.data[i].incrementalPercentAmountBuy,
        incrementalPercentAmountSell: gridBotsRes.data[i].incrementalPercentAmountSell,
        deviationPriceBuy: gridBotsRes.data[i].deviationPriceBuy,
        deviationPriceSell: gridBotsRes.data[i].deviationPriceSell,
        deviationAmountBuy: gridBotsRes.data[i].deviationPriceBuy,
        deviationAmountSell: gridBotsRes.data[i].deviationAmountSell,
        usePriceGroup: gridBotsRes.data[i].usePriceGroup
      })
    }

    console.log(gridBotsData);

    gridBotsTableData.value = gridBotsData;
  }

  //Open Orders - fetch for each selected API key
  for (const apiKeyName of selectedApiKeys.value) {
    let openOrdersRes = await $fetch('/api/v1/fetchOpenOrders', {
      query:{
        userID:userID.value,
        exchange:currentExchange.value,
        symbol:currentSymbol.value,
        apiKeyName: apiKeyName  // Fetch orders for specific API key
      }
    });

    if (openOrdersRes.data) {
      for (let i = 0; i < openOrdersRes.data.length; i++) {
        openOrdersData.push({
          id: openOrdersRes.data[i].id,
          datetime: openOrdersRes.data[i].datetime,
          symbol: openOrdersRes.data[i].symbol,
          apiKey: apiKeyName,  // Add API key identifier
          type: openOrdersRes.data[i].type,
          side: openOrdersRes.data[i].side,
          price: openOrdersRes.data[i].price,
          amount: openOrdersRes.data[i].amount,
          filled: openOrdersRes.data[i].filled,
          remaining: openOrdersRes.data[i].remaining,
          actions: '',
        })
      }
    }
  }

  openOrdersTableData.value = openOrdersData;

  // Closed Orders - fetch for each selected API key
  for (const apiKeyName of selectedApiKeys.value) {
    let closedOrdersRes = await $fetch('/api/v1/fetchClosedOrders', {
      query:{
        userID:userID.value,
        exchange:currentExchange.value,
        symbol:currentSymbol.value,
        apiKeyName: apiKeyName  // Fetch orders for specific API key
      }
    });

    if (closedOrdersRes.data) {
      for (let i = 0; i < closedOrdersRes.data.length; i++) {
        closedOrdersData.push({
          datetime: closedOrdersRes.data[i].datetime,
          symbol: closedOrdersRes.data[i].symbol,
          apiKey: apiKeyName,  // Add API key identifier
          type: closedOrdersRes.data[i].type,
          side: closedOrdersRes.data[i].side,
          price: closedOrdersRes.data[i].price,
          amount: closedOrdersRes.data[i].amount,
          filled: closedOrdersRes.data[i].filled,
          remaining: closedOrdersRes.data[i].remaining,
        })
      }
    }
  }

  console.log(closedOrdersData);

  closedOrdersTableData.value = closedOrdersData;
}

</script>

<template>
  <!-- Grid Bots Table Only -->
  <div class="gridbots-list-container">
    <n-tabs type="segment" animated size="small" class="gridbots-tabs">
      <n-tab-pane name="Grid Bots" tab="Active Bots">
        <!-- Balance Display (uses API keys selected in navbar) -->
        <div class="balance-header" v-if="selectedApiKeys.length > 0">
          <div class="balance-cards">
            <div
              v-for="apiKeyName in selectedApiKeys"
              :key="apiKeyName"
              class="balance-card"
              :style="{ borderLeftColor: apiKeyColors[apiKeyName] || '#666' }"
            >
              <div class="balance-card-header">
                <span
                  class="api-indicator"
                  :style="{ background: apiKeyColors[apiKeyName] || '#666' }"
                ></span>
                <span class="api-name">{{ apiKeyName }}</span>
              </div>
              <div class="balance-row">
                <div class="balance-item">
                  <span class="balance-label">{{ base }}</span>
                  <div class="balance-grid">
                    <div class="balance-line">
                      <span class="balance-type">Free:</span>
                      <span class="balance-free">{{ formatNumber(apiKeyBalances[apiKeyName]?.baseFree || 0, 2) }}</span>
                    </div>
                    <div class="balance-line">
                      <span class="balance-type">Used:</span>
                      <span class="balance-used">{{ formatNumber(apiKeyBalances[apiKeyName]?.baseUsed || 0, 2) }}</span>
                    </div>
                    <div class="balance-line">
                      <span class="balance-type">Total:</span>
                      <span class="balance-total">{{ formatNumber(apiKeyBalances[apiKeyName]?.baseTotal || 0, 2) }}</span>
                    </div>
                  </div>
                </div>
                <div class="balance-item">
                  <span class="balance-label">{{ quote }}</span>
                  <div class="balance-grid">
                    <div class="balance-line">
                      <span class="balance-type">Free:</span>
                      <span class="balance-free">{{ formatNumber(apiKeyBalances[apiKeyName]?.quoteFree || 0, 2) }}</span>
                    </div>
                    <div class="balance-line">
                      <span class="balance-type">Used:</span>
                      <span class="balance-used">{{ formatNumber(apiKeyBalances[apiKeyName]?.quoteUsed || 0, 2) }}</span>
                    </div>
                    <div class="balance-line">
                      <span class="balance-type">Total:</span>
                      <span class="balance-total">{{ formatNumber(apiKeyBalances[apiKeyName]?.quoteTotal || 0, 2) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="table-wrapper">
          <n-data-table
            :columns="gridBotsTableColumns"
            :data="gridBotsTableData"
            :pagination="gridBotsTablePagination"
            :max-height="500"
            size="small"
            :bordered="false"
            striped
          />
        </div>
      </n-tab-pane>
      <n-tab-pane name="Open Orders" tab="Open Orders">
        <div class="table-wrapper">
          <n-data-table
            :columns="openOrdersTableColumns"
            :data="openOrdersTableData"
            :pagination="openOrdersTablePagination"
            :max-height="500"
            size="small"
            :bordered="false"
            striped
          />
        </div>
      </n-tab-pane>
      <n-tab-pane name="Closed Orders" tab="Closed Orders">
        <div class="table-wrapper">
          <n-data-table
            :columns="closedOrdersTableColumns"
            :data="closedOrdersTableData"
            :pagination="closedOrdersTablePagination"
            :max-height="500"
            size="small"
            :bordered="false"
            striped
          />
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>


<style scoped>
.gridbots-list-container {
  width: 100%;
  height: 100%;
}

.gridbots-tabs {
  height: 100%;
}

:deep(.n-tabs-nav) {
  padding: 0 8px;
}

:deep(.n-tabs-tab) {
  padding: 8px 16px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Balance Header */
.balance-header {
  margin-bottom: 12px;
  padding: 10px;
  background: #1a1f2e;
  border: 1px solid #2a3441;
  border-radius: 4px;
}

/* Balance Cards */
.balance-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.balance-card {
  background: #0f1419;
  border: 1px solid #2a3441;
  border-left-width: 3px;
  border-radius: 3px;
  padding: 8px 10px;
}

.balance-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #2a3441;
}

.api-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.api-name {
  font-size: 10px;
  font-weight: 600;
  color: #e0e0e0;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.balance-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.balance-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.balance-label {
  font-size: 9px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.balance-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.balance-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Courier New', monospace;
}

.balance-type {
  font-size: 9px;
  color: #666;
  font-weight: 500;
  min-width: 40px;
}

.balance-free {
  font-size: 10px;
  font-weight: 600;
  color: #4ade80;
}

.balance-used {
  font-size: 10px;
  font-weight: 600;
  color: #fbbf24;
}

.balance-total {
  font-size: 10px;
  font-weight: 600;
  color: #6366f1;
}

.table-wrapper {
  margin-top: 8px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(128, 128, 128, 0.15);
}

/* Table Styling */
:deep(.n-data-table) {
  background: transparent;
}

:deep(.n-data-table-th) {
  background: rgba(128, 128, 128, 0.08) !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  padding: 8px 10px !important;
  border-bottom: 2px solid rgba(128, 128, 128, 0.2) !important;
}

:deep(.n-data-table-td) {
  font-size: 11px !important;
  padding: 6px 10px !important;
  font-family: 'Courier New', monospace !important;
}

:deep(.n-data-table-tr:hover) {
  background: rgba(128, 128, 128, 0.05) !important;
}

/* Scrollbar */
:deep(.n-data-table-base-table-body)::-webkit-scrollbar {
  width: 6px;
}

:deep(.n-data-table-base-table-body)::-webkit-scrollbar-track {
  background: rgba(128, 128, 128, 0.05);
}

:deep(.n-data-table-base-table-body)::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.3);
  border-radius: 3px;
}

:deep(.n-data-table-base-table-body)::-webkit-scrollbar-thumb:hover {
  background: rgba(128, 128, 128, 0.5);
}
</style>
