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

let selectedMarkets = ref(['BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'EGLD/USDC', 'LCX/USDC']); // Default symbols
let tickers = ref({});
let tickerBTC = ref(0); // Prețul în BTC
let tickerETH = ref(0); // Prețul în ETH
let tickerSOL = ref(0); // Prețul în SOL
let tickerEGLD = ref(0); // Prețul în EGLD
let tickerEUR = ref(0); // Prețul în EUR
let tickerInterval = null;

onMounted(() => {
  tickerInterval = setIntervalAsync(fetchTickersPooling, 500);
});

onUnmounted(() => {
  clearIntervalAsync(tickerInterval);
});

async function fetchTickersPooling() {
  for (const symbol of selectedMarkets.value) {
    let response = await $fetch('/api/v1/fetchTicker', {
      query: {
        userID: userID.value,
        exchange: selectedExchange.value,
        symbol: symbol,
      }
    });

    if (response.data) {
      tickers.value[symbol] = response.data;
    }
  }

  // Obținem prețurile BTC, ETH, SOL, EGLD, și EUR
  await Promise.all([fetchTickerBTC(), fetchTickerETH(), fetchTickerSOL(), fetchTickerEgld(), fetchTickerEUR()]);
}

async function fetchTickerBTC() {
  try {
    const binance = new ccxt.binance(); // binance Advanced API
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

async function fetchTickerSOL() {
  try {
    const binance = new ccxt.binance();
    const tickerSOLData = await binance.fetchTicker('SOL/USDT');
    tickerSOL.value = parseFloat(tickerSOLData.last);
  } catch (error) {
    console.error('Eroare la obținerea prețului SOL/USDT:', error);
    tickerSOL.value = 0;
  }
}

async function fetchTickerEgld() {
  try {
    const binance = new ccxt.binance();
    const tickerEgldData = await binance.fetchTicker('EGLD/USDT');
    tickerEGLD.value = parseFloat(tickerEgldData.last);
  } catch (error) {
    console.error('Eroare la obținerea prețului EGLD/USDT:', error);
    tickerEGLD.value = 0;
  }
}

async function fetchTickerEUR() {
  try {
    const binance = new ccxt.binance();
    const tickerEURData = await binance.fetchTicker('EUR/USDT');
    tickerEUR.value = parseFloat(tickerEURData.last);
  } catch (error) {
    console.error('Eroare la obținerea prețului EUR/USDT:', error);
    tickerEUR.value = 0;
  }
}

// Funcții pentru calculul prețului în BTC, ETH, SOL, EGLD și EUR
function inBTC(symbol) {
  if (tickers.value[symbol]?.last && tickerBTC.value) {
    return (tickers.value[symbol].last / tickerBTC.value).toFixed(8);
  } else {
    return 0;
  }
}

function inETH(symbol) {
  if (tickers.value[symbol]?.last && tickerETH.value) {
    return (tickers.value[symbol].last / tickerETH.value).toFixed(8);
  } else {
    return 0;
  }
}

function inSOL(symbol) {
  if (tickers.value[symbol]?.last && tickerSOL.value) {
    return (tickers.value[symbol].last / tickerSOL.value).toFixed(8);
  } else {
    return 0;
  }
}

function inEGLD(symbol) {
  if (tickers.value[symbol]?.last && tickerEGLD.value) {
    return (tickers.value[symbol].last / tickerEGLD.value).toFixed(8);
  } else {
    return 0;
  }
}

function inEUR(symbol) {
  if (tickers.value[symbol]?.last && tickerEUR.value) {
    return (tickers.value[symbol].last / tickerEUR.value).toFixed(4);
  } else {
    return 0;
  }
}


async function updateSelectedExchange(exchange) {
  await app.updateUserSelectedExchange(userID.value, exchange);
  reloadNuxtApp();
}

async function updateSelectedMarkets(markets) {
  await app.updateUserSelectedMarket(userID.value, selectedExchange.value, markets);
  reloadNuxtApp();
}
</script>

<template>
   <div class="top-bar">
    <!-- Afișăm datele într-un tabel -->
    <table class="ticker-table">
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Last</th>
          <th>In EUR</th>
          <th>In BTC</th>
          <th>In ETH</th>
          <th>In SOL</th>
          <th>In EGLD</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="symbol in selectedMarkets" :key="symbol">
          <td class="symbol">{{ symbol }}</td>
          <td class="last">{{ tickers[symbol]?.last || 0 }}</td>
          <td class="eur">{{ inEUR(symbol) }}</td>
          <td class="btc">{{ inBTC(symbol) }}</td>
          <td class="eth">{{ inETH(symbol) }}</td>
          <td class="sol">{{ inSOL(symbol) }}</td>
          <td class="egld">{{ inEGLD(symbol) }}</td>
        </tr>
      </tbody>
    </table>
  </div>

<div>
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
          <n-select v-model:value="selectedMarkets"
                    :options="userExchangeMarkets"
                    placeholder="Select market(s)"
                    filterable
                    multiple
                    @update:value="updateSelectedMarkets($event)"
          />
        </n-gi>
      </n-grid>
    </n-card>
  </div>
</template>


<style scoped>
.ticker-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  margin-bottom: 20px;
}

.ticker-table th, .ticker-table td {
  padding: 10px;
  border: 1px solid #ddd;
}

.ticker-row {
  margin-bottom: 10px;
}
.symbol {
  color: orange;
}
.last {
  color: red;
}
.eur {
  color: rgb(9, 224, 240);
}
.btc {
  color: rgb(224, 93, 134);
}
.eth {
  color: rgb(229, 45, 229);
}
.sol {
  color: rgb(192, 237, 58);
}
.egld {
  color: rgb(237, 150, 51);
}
/* Stil pentru întreaga grilă */
.n-grid {
  padding: 20px;
  gap: 20px;
}

/* Stil pentru secțiunea principală */
.n-gi {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Stil pentru barele de selecție (TickerBar2) */
.ticker-bar {
  background-color: #fff;
  border: 1px solid #dee2e6;
  padding: 15px;
  border-radius: 10px;
}

/* Stil pentru cardurile interne */
.n-card {
  margin-bottom: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Stil pentru select-box-uri */
.n-select {
  width: 100%;
  border: 1px solid #07ea30;
  border-radius: 5px;
  padding: 10px;
  background-color: #300241;
}

/* Stil pentru butoane */
.n-button {
  background-color: #007bff;
  border: none;
  color: rgb(100, 156, 21);
  padding: 10px 20px;
  border-radius: 5px;
  text-align: center;
  display: inline-block;
  font-size: 14px;
  margin: 4px 2px;
  cursor: pointer;
  transition-duration: 0.4s;
}

.n-button:hover {
  background-color: #a7cb24;
}

/* Stil pentru text */
p, h1, h2, h3, h4 {
  color: #333;
  font-family: 'Arial', sans-serif;
}

</style>
