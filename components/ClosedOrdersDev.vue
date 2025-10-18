<script setup>
const notification = useNotification();
import { useAppStore } from '~/stores/app.store';
import {NButton} from "naive-ui";
import {clearIntervalAsync, setIntervalAsync} from "set-interval-async";
const app = useAppStore()

let userID = useCookie('userID');

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);



const closedBuyOrdersTablePagination = true;
const closedSellOrdersTablePagination = true;

const closedBuyOrdersTableColumns = [
  { title: 'Date', key: 'datetime' },
  { title: 'Symbol', key: 'symbol' },
  { title: 'Type', key: 'type' },
  { title: 'Price', key: 'price' },
  { title: 'Amount', key: 'amount' },
  { title: 'Filled', key: 'filled' },
  { title: 'Remaining', key: 'remaining' },
  
];

const closedSellOrdersTableColumns = [
  { title: 'Date', key: 'datetime' },
  { title: 'Symbol', key: 'symbol' },
  { title: 'Type', key: 'type' },
  { title: 'Price', key: 'price' },
  { title: 'Amount', key: 'amount' },
  { title: 'Filled', key: 'filled' },
  { title: 'Remaining', key: 'remaining' },
];

const closedBuyOrdersTableData = ref([]);
const closedSellOrdersTableData = ref([]);

let orderListInterval = null;

onMounted(() => {
  orderListInterval = setIntervalAsync(fetchOrdersPooling, 500);
});

onUnmounted(() => {
  clearIntervalAsync(orderListInterval);
});

async function cancelOrder(row) {
  const data = {
    userID: userID.value,
    exchange: currentExchange.value,
    id: row.id,
    symbol: currentSymbol.value
  };

  const response = await $fetch('/api/v1/cancelOrder', {
    method: 'POST',
    body: data
  });

  const base = row.symbol.split('/')[0];
  const quote = row.symbol.split('/')[1];

  notification['info']({
    content: 'Order Cancelled!',
    meta: `Cancelled ${data.exchange} limit ${row.side} order for ${row.amount} ${base} by using ${quote} at price ${row.price}`,
    duration: 2500
  });
}

async function fetchOrdersPooling() {
  let closedBuyOrdersData = [];
  let closedSellOrdersData = [];

  // Closed Orders
  const closedOrdersRes = await $fetch('/api/v1/fetchClosedOrders', {
    query: {
      userID: userID.value,
      exchange: currentExchange.value,
      symbol: currentSymbol.value,
      limit: 1000 // Modificăm limita la 1000 pentru a afișa mai multe înregistrări
    
    }
  });

  if (closedOrdersRes.data) {
    closedOrdersRes.data.forEach(order => {
      const orderData = {
        datetime: order.datetime,
        symbol: order.symbol,
        type: order.type,
        price: order.price,
        amount: order.amount,
        filled: order.filled,
        remaining: order.remaining,
        id: order.id // trebuie să fie inclus ID-ul comenzii pentru a putea fi anulată
      };
      if (order.side === 'buy') {
        closedBuyOrdersData.push(orderData);
      } else if (order.side === 'sell') {
        closedSellOrdersData.push(orderData);
      }
    });

    closedBuyOrdersTableData.value = closedBuyOrdersData;
    closedSellOrdersTableData.value = closedSellOrdersData;
  }
}

function filterOrdersByDate(orders, date) {
  return orders.filter(order => {
    const orderDate = new Date(order.datetime).toLocaleDateString();
    return orderDate === date;
  });
}
</script>

<template>
  <n-card>
    <n-tabs type="line" animated>
      <n-tab-pane 
        name="Closed Buy Orders" 
        tab="Closed Buy Orders" 
        v-on:show="fetchOrdersPooling()">
        <n-data-table
          :columns="closedBuyOrdersTableColumns"
          :data="closedBuyOrdersTableData"
          :pagination="closedBuyOrdersTablePagination"
          size="small"
        />
      </n-tab-pane>
      <n-tab-pane 
        name="Closed Sell Orders" 
        tab="Closed Sell Orders" 
        v-on:show="fetchOrdersPooling()">
        <n-data-table
          :columns="closedSellOrdersTableColumns"
          :data="closedSellOrdersTableData"
          :pagination="closedSellOrdersTablePagination"
          size="small"
        />
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<style scoped>
</style>