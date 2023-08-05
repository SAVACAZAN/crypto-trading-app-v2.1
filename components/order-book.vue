<script setup>
import { useAppStore } from '~/stores/app.store';
import {clearIntervalAsync, setIntervalAsync} from "set-interval-async"
const app = useAppStore()

let userID = useCookie('userID');

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);


const orderBookTablePagination = false;
const orderBookTableColumns = [
  {
    title: "Price",
    key: "price"
  },
  {
    title: "Quantity",
    key: "quantity"
  },
  {
    title: "Total",
    key: "total"
  },
];

const bidsTableData = ref([]);
const asksTableData = ref([]);


let orderBookInterval = null;

onMounted(() => {
  orderBookInterval = setIntervalAsync(fetchOrderBookPooling, 500);
});

onUnmounted(() => {
  clearIntervalAsync(orderBookInterval);
});

async function fetchOrderBookPooling() {
  let bids = [];
  let asks = [];

  let orderBook = await $fetch('/api/v1/fetchOrderBook', {
    query:{
      userID:userID.value,
      exchange:currentExchange.value,
      symbol:currentSymbol.value,
    }
  });

  if (orderBook.data) {
    for (let i = 0; i < orderBook.data.bids.length; i++) {
      bids.push({
        price: orderBook.data.bids[i][0],
        quantity: orderBook.data.bids[i][1],
        total: (orderBook.data.bids[i][1] * orderBook.data.bids[i][0]).toFixed(2),
      })
    }
    bidsTableData.value = bids;

    for (let i = 0; i < orderBook.data.asks.length; i++) {
      asks.push({
        price: orderBook.data.asks[i][0],
        quantity: orderBook.data.asks[i][1],
        total: (orderBook.data.asks[i][1] * orderBook.data.asks[i][0]).toFixed(2),
      })
    }
    asksTableData.value = asks;
  }
}


</script>

<template>
  <n-card style="margin-bottom: 10px;">
    <n-data-table
        :columns="orderBookTableColumns"
        :data="bidsTableData"
        :pagination="orderBookTablePagination"
        :max-height="150"
        size="small"
    />
    <n-data-table
        :columns="orderBookTableColumns"
        :data="asksTableData"
        :pagination="orderBookTablePagination"
        :max-height="150"
        size="small"
    />
  </n-card>
</template>

<style scoped>

</style>
