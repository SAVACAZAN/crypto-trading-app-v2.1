<script setup>
const notification = useNotification();
import { useAppStore } from '~/stores/app.store';
import {NButton} from "naive-ui";
import {clearIntervalAsync, setIntervalAsync} from "set-interval-async";
const app = useAppStore()

let userID = useCookie('userID');

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);

const openOrdersTablePagination = false;
const openOrdersTableColumns = [
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

onMounted(() => {
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

async function fetchOrdersPooling() {
  let openOrdersData = [];
  let closedOrdersData = [];

  let openOrdersRes = await $fetch('/api/v1/fetchOpenOrders', {
    query:{
      userID:userID.value,
      exchange:currentExchange.value,
      symbol:currentSymbol.value,
    }
  });
  if (openOrdersRes.data) {
    for (let i = 0; i < openOrdersRes.data.length; i++) {
      openOrdersData.push({
        id: openOrdersRes.data[i].id,
        datetime: openOrdersRes.data[i].datetime,
        symbol: openOrdersRes.data[i].symbol,
        type: openOrdersRes.data[i].type,
        side: openOrdersRes.data[i].side,
        price: openOrdersRes.data[i].price,
        amount: openOrdersRes.data[i].amount,
        filled: openOrdersRes.data[i].filled,
        remaining: openOrdersRes.data[i].remaining,
        actions: '',
      })
    }

    openOrdersTableData.value = openOrdersData;
  }

  // Closed Orders
  let closedOrdersRes = await $fetch('/api/v1/fetchClosedOrders', {
    query:{
      userID:userID.value,
      exchange:currentExchange.value,
      symbol:currentSymbol.value,
    }
  });

  if (closedOrdersRes.data) {
    for (let i = 0; i < closedOrdersRes.data.length; i++) {
      closedOrdersData.push({
        datetime: closedOrdersRes.data[i].datetime,
        symbol: closedOrdersRes.data[i].symbol,
        type: closedOrdersRes.data[i].type,
        side: closedOrdersRes.data[i].side,
        price: closedOrdersRes.data[i].price,
        amount: closedOrdersRes.data[i].amount,
        filled: closedOrdersRes.data[i].filled,
        remaining: closedOrdersRes.data[i].remaining,
      })
    }

    closedOrdersTableData.value = closedOrdersData;
  }
}

</script>

<template>
  <n-card>
    <n-tabs type="line" animated>
      <n-tab-pane name="Open Orders" tab="Open Orders">
        <n-data-table
            :columns="openOrdersTableColumns"
            :data="openOrdersTableData"
            :pagination="openOrdersTablePagination"
            :max-height="250"
            size="small"
        />
      </n-tab-pane>
      <n-tab-pane name="Closed Orders" tab="Closed Orders">
        <n-data-table
            :columns="closedOrdersTableColumns"
            :data="closedOrdersTableData"
            :pagination="closedOrdersTablePagination"
            :max-height="250"
            size="small"
        />
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<style scoped>

</style>
