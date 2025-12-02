<script setup>
import { useAppStore } from '~/stores/app.store';
import { reloadNuxtApp } from "nuxt/app";
import { setIntervalAsync, clearIntervalAsync } from "set-interval-async";
// import ccxt from 'ccxt';

const app = useAppStore();
const userID = useCookie('userID');

const userExchanges = app.getUserExchanges;
const selectedExchange = ref(app.getUserSelectedExchange);
const userExchangeMarkets = app.getUserExchangeMarkets;
const selectedMarket = ref(app.getUserSelectedMarket);
const currentSymbol = computed(() => app.getUserSelectedMarket || 'LCX/USDT');

const ticker = ref({ last: 0 });
const tickerBTC = ref(0);
const tickerETH = ref(0);
let tickerInterval = null;
const showDetails = ref(false);

async function updateSelectedExchange(exchange) {
  await app.updateUserSelectedExchange(userID.value, exchange);
  reloadNuxtApp();
}

async function updateSelectedMarket(market) {
  await app.updateUserSelectedMarket(userID.value, selectedExchange.value, market);
  reloadNuxtApp();
}

async function fetchPrices() {
  try {
    if (selectedExchange.value && selectedMarket.value) {
      const response = await $fetch('/api/v1/fetchTicker', {
        query: {
          userID: userID.value,
          exchange: selectedExchange.value,
          symbol: selectedMarket.value,
        }
      });
      if (response.data) ticker.value = response.data;
    }

    const binance = new ccxt.binance();
    const btcData = await binance.fetchTicker('BTC/USDT');
    const ethData = await binance.fetchTicker('ETH/USDT');
    tickerBTC.value = parseFloat(btcData.last) || 0;
    tickerETH.value = parseFloat(ethData.last) || 0;
  } catch (error) {
    console.error('Error fetching prices:', error);
  }
}

onMounted(() => {
  fetchPrices();
  tickerInterval = setIntervalAsync(fetchPrices, 2000);
});

onUnmounted(() => {
  if (tickerInterval) clearIntervalAsync(tickerInterval);
});
</script>

<template>
  <div class="ticker-button-wrapper">
    <button class="ticker-button" @click="showDetails = !showDetails">
      <span class="pair">{{ currentSymbol }}</span>
      <span class="price">{{ ticker.last ? ticker.last.toFixed(4) : '0.0000' }}</span>
    </button>

    <transition name="fade">
      <div v-if="showDetails" class="ticker-popup">
        <div class="popup-header">
          <n-select
            v-model:value="selectedExchange"
            :options="userExchanges"
            placeholder="Exchange"
            size="tiny"
            class="exchange-select"
            @update:value="updateSelectedExchange($event)"
          />
          <n-select
            v-model:value="selectedMarket"
            :options="userExchangeMarkets"
            placeholder="Pair"
            size="tiny"
            class="pair-select"
            @update:value="updateSelectedMarket($event)"
          />
        </div>
        <div class="popup-prices">
          <div class="ticker-line">
            <span class="label">BTC</span>
            <span class="value btc">{{ tickerBTC.toFixed(0) }}</span>
          </div>
          <div class="ticker-line">
            <span class="label">ETH</span>
            <span class="value eth">{{ tickerETH.toFixed(0) }}</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.ticker-button-wrapper {
  position: relative;
}

.ticker-button {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 255, 255, 0.4);
  border-radius: 6px;
  padding: 2px 10px;
  height: 24px;
  font-size: 10px;
  color: #00ffff;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.ticker-button:hover {
  background: rgba(0, 255, 255, 0.1);
  border-color: rgba(0, 255, 255, 0.7);
  box-shadow: 0 0 6px rgba(0, 255, 255, 0.4);
}

.pair {
  text-transform: uppercase;
}
.price {
  color: #00ffff;
  text-shadow: 0 0 4px rgba(0, 255, 255, 0.6);
}

.ticker-popup {
  position: absolute;
  top: 28px;
  right: 0;
  background: rgba(10, 10, 20, 0.9);
  border: 1px solid rgba(0, 255, 255, 0.4);
  border-radius: 6px;
  padding: 8px;
  min-width: 160px;
  z-index: 999;
  backdrop-filter: blur(6px);
}

.popup-header {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
}

.popup-prices {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.ticker-line {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  font-weight: 700;
}

.ticker-line .label {
  color: #888;
}

.ticker-line .value.btc {
  color: #ff9500;
}
.ticker-line .value.eth {
  color: #9d4edd;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Compact selects */
:deep(.n-base-selection) {
  background: rgba(0, 0, 0, 0.3) !important;
  height: 20px !important;
  min-height: 20px !important;
  border-radius: 3px !important;
}
:deep(.n-base-selection-label) {
  font-size: 9px !important;
  padding: 0 5px !important;
}
</style>
  
