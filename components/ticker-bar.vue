<script setup>
import { useAppStore } from '~/stores/app.store';
import {reloadNuxtApp} from "nuxt/app";
import {setIntervalAsync, clearIntervalAsync} from "set-interval-async";
const app = useAppStore()

let userID = useCookie('userID');


let userExchanges = app.getUserExchanges;
let selectedExchange = ref(app.getUserSelectedExchange);
let userExchangeMarkets = app.getUserExchangeMarkets;
let selectedMarket = ref(app.getUserSelectedMarket);


// let ticker = response.data;
let ticker = ref({
  last:0,
  change:0,
  low:0,
  high:0,
  baseVolume:0,
  quoteVolume:0
});

let tickerInterval = null;

onMounted(() => {
  tickerInterval = setIntervalAsync(fetchTickerPooling, 500);
});

onUnmounted(() => {
  clearIntervalAsync(tickerInterval);
});

async function fetchTickerPooling() {
  let response = await $fetch('/api/v1/fetchTicker', {
    query:{
      userID:userID.value,
      exchange:selectedExchange.value,
      symbol:selectedMarket.value,
    }
  });

  if (response.data) {
    ticker.value = response.data;
  }
}

async function updateSelectedExchange(exchange) {
  await app.updateUserSelectedExchange(userID.value, exchange);
  reloadNuxtApp();
}

async function updateSelectedMarket(market) {
  await app.updateUserSelectedMarket(userID.value, selectedExchange.value, market);
  reloadNuxtApp();
}


</script>

<template>


  <div class="top-bar">
    <n-card  style="margin-bottom: 10px">
      <n-grid x-gap="12" :cols="12">
        <n-gi span="4 800:2">
          <n-select v-model:value="selectedExchange"
                    :options="userExchanges"
                    placeholder="Select exchange"
                    filterable
                    @update:value="updateSelectedExchange($event)"
          />
        </n-gi>
        <n-gi span="4 800:2">
          <n-select v-model:value="selectedMarket"
                    :options="userExchangeMarkets"
                    placeholder="Select exchange"
                    filterable
                    @update:value="updateSelectedMarket($event)"
          />
        </n-gi>
        <n-gi span="4 800:8">
          Last Price {{ticker.last}}
        </n-gi>
      </n-grid>
    </n-card>

  </div>
</template>

<style scoped>

</style>
