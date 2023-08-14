<script setup>
import { useAppStore } from '~/stores/app.store';
import {clearIntervalAsync, setIntervalAsync} from "set-interval-async"
const app = useAppStore()

let userID = useCookie('userID');

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);


const bidsData = ref([]);
const asksData = ref([]);

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
    bidsData.value = bids;

    for (let i = 0; i < orderBook.data.asks.length; i++) {
      asks.push({
        price: orderBook.data.asks[i][0],
        quantity: orderBook.data.asks[i][1],
        total: (orderBook.data.asks[i][1] * orderBook.data.asks[i][0]).toFixed(2),
      })
    }
    asksData.value = asks;
  }
}


</script>

<template>
  <n-card>
    <n-space vertical :size="12">
      <div class="asks box">
        <div class="row" v-for="row in asksData">
          <div class="col">
            {{row.price}}
          </div>
          <div class="col">
            {{row.quantity}}
          </div>
          <div class="col">
            {{row.total}}
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col labels">Price</div>
        <div class="col labels">Quantity</div>
        <div class="col labels">Total</div>
      </div>
      <div class="bids box">
        <div v-for="row in bidsData" class="row">
          <div class="col">
            {{row.price}}
          </div>
          <div class="col">
            {{row.quantity}}
          </div>
          <div class="col">
            {{row.total}}
          </div>
        </div>
      </div>
    </n-space>
  </n-card>
</template>

<style scoped>
.box {
  max-height:150px;
  overflow-y: scroll;
}

.asks {
  flex-direction: column-reverse;
  display: flex;
}

.row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.col {
  font-size:12px;
  width:33.333%;
}

.labels {
  font-size:16px;
  font-weight:bold;
  text-transform:uppercase;
}
</style>
