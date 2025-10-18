<script setup>
const notification = useNotification();
import { useAppStore } from '~/stores/app.store';
import {NButton} from "naive-ui";
import {clearIntervalAsync, setIntervalAsync} from "set-interval-async";
const app = useAppStore()

let userID = useCookie('userID');

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);

// API Key selector
let availableApiKeys = ref([]);
let selectedApiKeys = ref([]);
let loadingApiKeys = ref(false);
let allOpenOrders = ref([]);
let allClosedOrders = ref([]);

const openOrdersTablePagination = false;
const openOrdersTableColumns = [
  {
    title: "API Key",
    key: "apiKeyName"
  },
  {
    title: "Symbol",
    key: "symbol"
  },
  {
    title: "Type",
    key: "type"
  },
  {
    title: "Side",
    key: "side"
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
    title: "API Key",
    key: "apiKeyName"
  },
  {
    title: "Symbol",
    key: "symbol"
  },
  {
    title: "Type",
    key: "type"
  },
  {
    title: "Side",
    key: "side"
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
  orderListInterval = setIntervalAsync(fetchOrdersPooling, 500);
});

onUnmounted(() => {
  clearIntervalAsync(orderListInterval);
});

// Load available API keys
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
      availableApiKeys.value = response.data.map(apiKey => ({
        label: `${apiKey.name}`,
        value: apiKey.name
      }));

      // Select all API keys by default
      selectedApiKeys.value = availableApiKeys.value.map(k => k.value);
    }
  } catch (error) {
    console.error('Failed to load API keys:', error);
  } finally {
    loadingApiKeys.value = false;
  }
}

// Watch for changes in selected API keys
watch(selectedApiKeys, () => {
  filterOrders();
});

// Filter orders based on selected API keys
function filterOrders() {
  if (selectedApiKeys.value.length === 0) {
    openOrdersTableData.value = [];
    closedOrdersTableData.value = [];
    return;
  }

  openOrdersTableData.value = allOpenOrders.value.filter(order =>
    selectedApiKeys.value.includes(order.apiKeyName)
  );

  closedOrdersTableData.value = allClosedOrders.value.filter(order =>
    selectedApiKeys.value.includes(order.apiKeyName)
  );
}

// Get orders by API key and side
function getOrdersByApiKey(apiKeyName, side) {
  return allOpenOrders.value.filter(order =>
    order.apiKeyName === apiKeyName && order.side === side
  );
}

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

async function fetchOrdersPooling() {
  allOpenOrders.value = [];
  allClosedOrders.value = [];

  // Fetch orders from all API keys
  for (const apiKey of availableApiKeys.value) {
    const apiKeyName = apiKey.value;

    // Fetch open orders for this API key
    let openOrdersRes = await $fetch('/api/v1/fetchOpenOrders', {
      query:{
        userID:userID.value,
        exchange:currentExchange.value,
        symbol:currentSymbol.value,
        apiKeyName: apiKeyName
      }
    });

    if (openOrdersRes.data) {
      const taggedOpenOrders = openOrdersRes.data.map(order => ({
        id: order.id,
        datetime: order.datetime,
        symbol: order.symbol,
        type: order.type,
        side: order.side,
        price: order.price,
        amount: order.amount,
        filled: order.filled,
        remaining: order.remaining,
        actions: '',
        apiKeyName: apiKeyName
      }));
      allOpenOrders.value.push(...taggedOpenOrders);
    }

    // Fetch closed orders for this API key
    let closedOrdersRes = await $fetch('/api/v1/fetchClosedOrders', {
      query:{
        userID:userID.value,
        exchange:currentExchange.value,
        symbol:currentSymbol.value,
        apiKeyName: apiKeyName
      }
    });

    if (closedOrdersRes.data) {
      const taggedClosedOrders = closedOrdersRes.data.map(order => ({
        datetime: order.datetime,
        symbol: order.symbol,
        type: order.type,
        side: order.side,
        price: order.price,
        amount: order.amount,
        filled: order.filled,
        remaining: order.remaining,
        apiKeyName: apiKeyName
      }));
      allClosedOrders.value.push(...taggedClosedOrders);
    }
  }

  // Filter orders based on selected API keys
  filterOrders();
}

async function reduceBuyOrders() {
  const buyOrders = openOrdersTableData.value.filter(order => order.side === 'buy');
  const ordersByPrice = {};

  buyOrders.forEach(order => {
    const price = order.price.toFixed(8);

    if (!ordersByPrice[price]) {
      ordersByPrice[price] = {
        price: order.price,
        totalAmount: 0,
        orders: []
      };
    }
    ordersByPrice[price].totalAmount += order.amount;
    ordersByPrice[price].orders.push(order);
  });

  const sortedPrices = Object.keys(ordersByPrice).sort((a, b) => a - b);

  sortedPrices.forEach(async price => { // Marcam funcția ca async aici
    const groupedOrders = ordersByPrice[price];
    const { orders } = groupedOrders;
    const numOrdersToKeep = Math.min(3, orders.length);
    let combinedAmount = 0;

    for (let i = 0; i < numOrdersToKeep; i++) {
      combinedAmount += orders[i].amount;
      await cancelOrder(orders[i]); // Așteptăm anularea fiecărui order
    }

    const newOrder = {
      symbol: orders[0].symbol,
      type: 'limit',
      side: 'buy',
      price: groupedOrders.price,
      amount: combinedAmount,
      filled: 0,
      remaining: combinedAmount,
      actions: ''
    };

    openOrdersTableData.value = openOrdersTableData.value.filter(order => !orders.includes(order));
    openOrdersTableData.value.push(newOrder);

    console.log(`Reduced ${numOrdersToKeep} buy orders at price ${groupedOrders.price} into 1 order with amount ${combinedAmount}`);
  });
}

async function reduceSellOrders() {
  const sellOrders = openOrdersTableData.value.filter(order => order.side === 'sell');
  const ordersByPrice = {};

  sellOrders.forEach(order => {
    const price = order.price.toFixed(8);

    if (!ordersByPrice[price]) {
      ordersByPrice[price] = {
        price: order.price,
        totalAmount: 0,
        orders: []
      };
    }
    ordersByPrice[price].totalAmount += order.amount;
    ordersByPrice[price].orders.push(order);
  });

  const sortedPrices = Object.keys(ordersByPrice).sort((a, b) => a - b);

  sortedPrices.forEach(async price => { // Marcam funcția ca async aici
    const groupedOrders = ordersByPrice[price];
    const { orders } = groupedOrders;
    const numOrdersToKeep = Math.min(3, orders.length);
    let combinedAmount = 0;

    for (let i = 0; i < numOrdersToKeep; i++) {
      combinedAmount += orders[i].amount;
      await cancelOrder(orders[i]); // Așteptăm anularea fiecărui order
    }

    const newOrder = {
      symbol: orders[0].symbol,
      type: 'limit',
      side: 'sell',
      price: groupedOrders.price,
      amount: combinedAmount,
      filled: 0,
      remaining: combinedAmount,
      actions: ''
    };

    openOrdersTableData.value = openOrdersTableData.value.filter(order => !orders.includes(order));
    openOrdersTableData.value.push(newOrder);

    console.log(`Reduced ${numOrdersToKeep} sell orders at price ${groupedOrders.price} into 1 order with amount ${combinedAmount}`);
  });
}
const priceBuckets = ref([]);

function calculatePriceBuckets() {
  const bucketStart = 0.17;
  const bucketEnd = 0.4;
  const step = 0.01;

  const buckets = [];

  for (let price = bucketStart; price < bucketEnd; price += step) {
    const upper = parseFloat((price + step).toFixed(4));
    const lower = parseFloat(price.toFixed(4));

    const bucketOrders = openOrdersTableData.value.filter(order =>
      order.price >= lower && order.price < upper
    );

    const buyAmount = bucketOrders
      .filter(o => o.side === 'buy')
      .reduce((sum, o) => sum + o.amount, 0);

    const sellAmount = bucketOrders
      .filter(o => o.side === 'sell')
      .reduce((sum, o) => sum + o.amount, 0);

    buckets.push({
      interval: `${lower} - ${upper}`,
      buyAmount: buyAmount.toFixed(2),
      sellAmount: sellAmount.toFixed(2)
    });
  }

  priceBuckets.value = buckets;
}

// Recalculezi pragurile după fiecare fetch
watch(openOrdersTableData, calculatePriceBuckets);

</script>

<template>
  <n-card>
    <!-- API Key Selector -->
    <n-card title="API Key Filter" class="mb-4">
      <n-select
        v-model:value="selectedApiKeys"
        :options="availableApiKeys"
        :loading="loadingApiKeys"
        placeholder="Select API Keys"
        multiple
        clearable
      />
    </n-card>

    <!-- Totals per API Key -->
    <n-card v-for="apiKey in selectedApiKeys" :key="apiKey" class="mb-4">
      <template #header>
        <strong>{{ apiKey }}</strong>
      </template>
      <n-space vertical>
        <n-card title="Buy Orders">
          <n-space>
            <n-statistic label="Total Buy Orders" :value="getOrdersByApiKey(apiKey, 'buy').length" />
            <n-statistic
              label="Total Buy Amount"
              :value="getOrdersByApiKey(apiKey, 'buy').reduce((sum, o) => sum + o.amount, 0).toFixed(8)"
            />
          </n-space>
        </n-card>

        <n-card title="Sell Orders">
          <n-space>
            <n-statistic label="Total Sell Orders" :value="getOrdersByApiKey(apiKey, 'sell').length" />
            <n-statistic
              label="Total Sell Amount"
              :value="getOrdersByApiKey(apiKey, 'sell').reduce((sum, o) => sum + o.amount, 0).toFixed(8)"
            />
          </n-space>
        </n-card>
      </n-space>
      <n-divider />
    </n-card>

    <!-- Grand Total -->
    <n-card v-if="selectedApiKeys.length > 1" class="mb-4">
      <template #header>
        <strong>GRAND TOTAL (All Selected Keys)</strong>
      </template>
      <n-space vertical>
        <n-card title="Buy Orders">
          <n-space>
            <n-statistic
              label="Total Buy Orders"
              :value="allOpenOrders.filter(o => selectedApiKeys.includes(o.apiKeyName) && o.side === 'buy').length"
            />
            <n-statistic
              label="Total Buy Amount"
              :value="allOpenOrders.filter(o => selectedApiKeys.includes(o.apiKeyName) && o.side === 'buy').reduce((sum, o) => sum + o.amount, 0).toFixed(8)"
            />
          </n-space>
        </n-card>

        <n-card title="Sell Orders">
          <n-space>
            <n-statistic
              label="Total Sell Orders"
              :value="allOpenOrders.filter(o => selectedApiKeys.includes(o.apiKeyName) && o.side === 'sell').length"
            />
            <n-statistic
              label="Total Sell Amount"
              :value="allOpenOrders.filter(o => selectedApiKeys.includes(o.apiKeyName) && o.side === 'sell').reduce((sum, o) => sum + o.amount, 0).toFixed(8)"
            />
          </n-space>
        </n-card>
      </n-space>
      <n-divider />
    </n-card>

    <n-tabs type="line" animated>
      <n-tab-pane name="Open Orders" tab="Open Orders">
        <n-button type="primary" @click="reduceBuyOrders">Reduce Buy Orders</n-button>
        <n-button type="primary" @click="reduceSellOrders">Reduce Sell Orders</n-button>
        <br /><br />
        <n-data-table
            :columns="openOrdersTableColumns"
            :data="openOrdersTableData"
            :pagination="openOrdersTablePagination"
            :max-height="1250"
            size="small"
        />
      </n-tab-pane>
      <n-tab-pane name="Closed Orders" tab="Closed Orders">
        <n-data-table
            :columns="closedOrdersTableColumns"
            :data="closedOrdersTableData"
            :pagination="closedOrdersTablePagination"
            :max-height="1250"
            size="small"
        />
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

