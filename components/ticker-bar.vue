<script setup>
import { useAppStore } from '~/stores/app.store';
import { reloadNuxtApp } from "nuxt/app";
import { setIntervalAsync, clearIntervalAsync } from "set-interval-async";
import ccxt from 'ccxt';

const app = useAppStore();
let currentSymbol = ref(app.getUserSelectedMarket);
let userID = useCookie('userID');
let base = currentSymbol.value.split('/')[0];
let quote = currentSymbol.value.split('/')[1];
let userExchanges = app.getUserExchanges;
let selectedExchange = ref(app.getUserSelectedExchange);
let userExchangeMarkets = app.getUserExchangeMarkets;
let selectedMarket = ref(app.getUserSelectedMarket);

let ticker = ref({
  last: 0,
  change: 0,
  low: 0,
  high: 0,
  baseVolume: 0,
  quoteVolume: 0
});

let tickerBTC = ref(0); // Prețul în BTC
let tickerETH = ref(0); // Prețul în ETH
let tickerInterval = null;

onMounted(() => {
  tickerInterval = setIntervalAsync(fetchTickerPooling, 500);
});

onUnmounted(() => {
  clearIntervalAsync(tickerInterval);
});

async function fetchTickerPooling() {
  let response = await $fetch('/api/v1/fetchTicker', {
    query: {
      userID: userID.value,
      exchange: selectedExchange.value,
      symbol: selectedMarket.value,
    }
  });

  if (response.data) {
    ticker.value = response.data;
    // Obținem prețul ticker-ului pentru perechea selectată
    fetchTickerBTC();
    fetchTickerETH();
  }
}

async function fetchTickerBTC() {
  try {
    const binance = new ccxt.binance();
    const tickerBTCData = await binance.fetchTicker('BTC/USDT');
    tickerBTC.value = parseFloat(tickerBTCData.last);
  } catch (error) {
    console.error('Eroare la obținerea prețului BTC/USDT:', error);
    tickerBTC.value = 0;
  }
}
async function fetchTickerETH() {
  try {
    const binance = new ccxt.binance();
    const tickerETHData = await binance.fetchTicker('ETH/USDT');
    tickerETH.value = parseFloat(tickerETHData.last);
  } catch (error) {
    console.error('Eroare la obținerea prețului ETH/USDT:', error);
    tickerETH.value = 0;
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

// Calculăm valoarea în BTC pentru prețul ticker.last
let inBTC = computed(() => {
  // Verificăm dacă prețurile sunt numere și nenule înainte de a efectua împărțirea
  if (ticker.last && tickerBTC.value) {
    return (ticker.last / tickerBTC.value).toFixed(8);
  } else {
    return 0;
  }
});
</script>

<template>
  <div class="top-bar">
     {{base}} {{ ticker.last }}  | BTC: {{ tickerBTC }} | ETH: {{ tickerETH }} | 
    <n-card style="margin-bottom: 10px">
      <n-grid x-gap="12" :cols="12">
        <n-gi span="5 800:2">
          <n-select v-model:value="selectedExchange"
                    :options="userExchanges"
                    placeholder="Select exchange"
                    filterable
                    @update:value="updateSelectedExchange($event)"
          />
        </n-gi>
        <n-gi span="5 800:2">
          <n-select v-model:value="selectedMarket"
                    :options="userExchangeMarkets"
                    placeholder="Select exchange"
                    filterable
                    @update:value="updateSelectedMarket($event)"
          />
        </n-gi>
      </n-grid>
    </n-card>
  </div>
</template>

<style scoped>
</style>
