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
let selectedApiKeys = ref([]);
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

      // Select first API key by default
      if (selectedApiKeys.value.length === 0) {
        selectedApiKeys.value = [availableApiKeys.value[0].value];
      }
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

  // Update store
  app.setSelectedApiKeys(selectedApiKeys.value);
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
  <!-- API Key Selector and Balance Display - FANCY TABLE STYLE -->
  <n-card style="margin-bottom: 16px; padding: 8px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed;">
      <thead>
        <tr style="border-bottom: 1px solid #444;">
          <th style="text-align: left; padding: 4px 8px; width: 25%;">API Keys</th>
          <th style="text-align: left; padding: 4px 8px; width: 10%;">Coin</th>
          <th style="text-align: right; padding: 4px 8px; color: #10eb04; width: 21.66%;">Free</th>
          <th style="text-align: right; padding: 4px 8px; color: #f5a623; width: 21.66%;">Used</th>
          <th style="text-align: right; padding: 4px 8px; color: #50e3c2; width: 21.66%;">Total</th>
        </tr>
      </thead>
      <tbody>
        <!-- ROW 1: BASE coin (LCX) - FIXED -->
        <tr>
          <td rowspan="2" style="padding: 4px 8px; vertical-align: top;">
            <n-select
              v-model:value="selectedApiKeys"
              :options="availableApiKeys"
              :loading="loadingApiKeys"
              placeholder="Select API Keys"
              :disabled="availableApiKeys.length === 0"
              size="small"
              multiple
              clearable
              @update:value="onApiKeysChange"
              :render-label="renderApiKeyLabel"
            />
          </td>
          <td style="padding: 4px 8px; vertical-align: middle;">
            <span style="display: inline-flex; align-items: center;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10eb04; margin-right: 6px;"></span>
              <span style="font-weight: bold; color: #10eb04;">{{ base }}</span>
            </span>
          </td>
          <!-- FREE column for BASE - all API keys stacked -->
          <td style="padding: 4px 8px; text-align: right; vertical-align: top;">
            <div v-if="selectedApiKeys.length > 0 && !loadingBalances" style="display: flex; flex-direction: column; gap: 2px;">
              <div v-for="apiKey in selectedApiKeys" :key="`base-free-${apiKey}`" style="font-size: 11px; line-height: 1.4;">
                <span :style="`color: ${apiKeyColors[apiKey]}; font-weight: 500;`">{{ apiKey }}:</span>
                <span style="color: #10eb04; margin-left: 4px; font-weight: 600;">
                  {{ formatNumber(apiKeyBalances[apiKey]?.baseFree || 0, (['BTC', 'ETH'].includes(base)) ? 8 : 2) }}
                </span>
              </div>
            </div>
            <n-spin v-else-if="loadingBalances" size="small" />
            <n-text v-else type="warning" style="font-size: 10px;">-</n-text>
          </td>
          <!-- USED column for BASE - all API keys stacked -->
          <td style="padding: 4px 8px; text-align: right; vertical-align: top;">
            <div v-if="selectedApiKeys.length > 0 && !loadingBalances" style="display: flex; flex-direction: column; gap: 2px;">
              <div v-for="apiKey in selectedApiKeys" :key="`base-used-${apiKey}`" style="font-size: 11px; line-height: 1.4;">
                <span :style="`color: ${apiKeyColors[apiKey]}; font-weight: 500;`">{{ apiKey }}:</span>
                <span style="color: #f5a623; margin-left: 4px; font-weight: 600;">
                  {{ formatNumber(apiKeyBalances[apiKey]?.baseUsed || 0, (['BTC', 'ETH'].includes(base)) ? 8 : 2) }}
                </span>
              </div>
            </div>
            <n-text v-else-if="!loadingBalances" type="warning" style="font-size: 10px;">-</n-text>
          </td>
          <!-- TOTAL column for BASE - all API keys stacked -->
          <td style="padding: 4px 8px; text-align: right; vertical-align: top;">
            <div v-if="selectedApiKeys.length > 0 && !loadingBalances" style="display: flex; flex-direction: column; gap: 2px;">
              <div v-for="apiKey in selectedApiKeys" :key="`base-total-${apiKey}`" style="font-size: 11px; line-height: 1.4;">
                <span :style="`color: ${apiKeyColors[apiKey]}; font-weight: 500;`">{{ apiKey }}:</span>
                <span style="color: #50e3c2; margin-left: 4px; font-weight: 600;">
                  {{ formatNumber(apiKeyBalances[apiKey]?.baseTotal || 0, (['BTC', 'ETH'].includes(base)) ? 8 : 2) }}
                </span>
              </div>
            </div>
            <n-text v-else-if="!loadingBalances" type="warning" style="font-size: 10px;">-</n-text>
          </td>
        </tr>

        <!-- ROW 2: QUOTE coin (USDC) - FIXED -->
        <tr>
          <td style="padding: 4px 8px; vertical-align: middle;">
            <span style="display: inline-flex; align-items: center;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #05f5ed; margin-right: 6px;"></span>
              <span style="font-weight: bold; color: #05f5ed;">{{ quote }}</span>
            </span>
          </td>
          <!-- FREE column for QUOTE - all API keys stacked -->
          <td style="padding: 4px 8px; text-align: right; vertical-align: top;">
            <div v-if="selectedApiKeys.length > 0 && !loadingBalances" style="display: flex; flex-direction: column; gap: 2px;">
              <div v-for="apiKey in selectedApiKeys" :key="`quote-free-${apiKey}`" style="font-size: 11px; line-height: 1.4;">
                <span :style="`color: ${apiKeyColors[apiKey]}; font-weight: 500;`">{{ apiKey }}:</span>
                <span style="color: #10eb04; margin-left: 4px; font-weight: 600;">
                  {{ formatNumber(apiKeyBalances[apiKey]?.quoteFree || 0, (['BTC', 'ETH'].includes(quote)) ? 8 : 2) }}
                </span>
              </div>
            </div>
            <n-text v-else-if="!loadingBalances" type="warning" style="font-size: 10px;">-</n-text>
          </td>
          <!-- USED column for QUOTE - all API keys stacked -->
          <td style="padding: 4px 8px; text-align: right; vertical-align: top;">
            <div v-if="selectedApiKeys.length > 0 && !loadingBalances" style="display: flex; flex-direction: column; gap: 2px;">
              <div v-for="apiKey in selectedApiKeys" :key="`quote-used-${apiKey}`" style="font-size: 11px; line-height: 1.4;">
                <span :style="`color: ${apiKeyColors[apiKey]}; font-weight: 500;`">{{ apiKey }}:</span>
                <span style="color: #f5a623; margin-left: 4px; font-weight: 600;">
                  {{ formatNumber(apiKeyBalances[apiKey]?.quoteUsed || 0, (['BTC', 'ETH'].includes(quote)) ? 8 : 2) }}
                </span>
              </div>
            </div>
            <n-text v-else-if="!loadingBalances" type="warning" style="font-size: 10px;">-</n-text>
          </td>
          <!-- TOTAL column for QUOTE - all API keys stacked -->
          <td style="padding: 4px 8px; text-align: right; vertical-align: top;">
            <div v-if="selectedApiKeys.length > 0 && !loadingBalances" style="display: flex; flex-direction: column; gap: 2px;">
              <div v-for="apiKey in selectedApiKeys" :key="`quote-total-${apiKey}`" style="font-size: 11px; line-height: 1.4;">
                <span :style="`color: ${apiKeyColors[apiKey]}; font-weight: 500;`">{{ apiKey }}:</span>
                <span style="color: #50e3c2; margin-left: 4px; font-weight: 600;">
                  {{ formatNumber(apiKeyBalances[apiKey]?.quoteTotal || 0, (['BTC', 'ETH'].includes(quote)) ? 8 : 2) }}
                </span>
              </div>
            </div>
            <n-text v-else-if="!loadingBalances" type="warning" style="font-size: 10px;">-</n-text>
          </td>
        </tr>
      </tbody>
    </table>
  </n-card>

  <n-card style="font-size: 12px; max-width: 100%;">
    <n-tabs type="line" animated style="max-width: 100%;">
      <n-tab-pane name="Grid Bots" tab="Grid Bots">
        <div style="max-width: 100%; overflow-x: auto;">
          <n-data-table
              :columns="gridBotsTableColumns"
              :data="gridBotsTableData"
              :pagination="gridBotsTablePagination"
              :max-height="150"
              size="small"
          />
        </div>
      </n-tab-pane>
      <n-tab-pane name="Open Orders" tab="Open Orders">
        <div style="max-width: 100%; overflow-x: auto;">
          <n-data-table
              :columns="openOrdersTableColumns"
              :data="openOrdersTableData"
              :pagination="openOrdersTablePagination"
              :max-height="150"
              size="small"
          />
        </div>
      </n-tab-pane>
      <n-tab-pane name="Closed Orders" tab="Closed Orders">
        <div style="max-width: 100%; overflow-x: auto;">
          <n-data-table
              :columns="closedOrdersTableColumns"
              :data="closedOrdersTableData"
              :pagination="closedOrdersTablePagination"
              :max-height="150"
              size="small"
          />
        </div>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>


<style scoped>

</style>
