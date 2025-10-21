<script setup>
import { useAppStore } from '~/stores/app.store';
import { reloadNuxtApp } from "nuxt/app";
import { setIntervalAsync, clearIntervalAsync } from "set-interval-async";
import ccxt from 'ccxt';

const app = useAppStore();
const userID = useCookie('userID');

// Exchange & Market selection
const userExchanges = app.getUserExchanges;
const selectedExchange = ref(app.getUserSelectedExchange || 'coinbaseadvanced');
const userExchangeMarkets = app.getUserExchangeMarkets;

// selectedMarket is a STRING like "LCX/USDC" (from getter)
const selectedMarket = ref(app.getUserSelectedMarket || 'LCX/USDC');

// Ticker data - SIMPLIFIED (only selected ticker + BTC/ETH)
const currentTicker = ref({ last: 0, percentage: 0 });
const tickerBTC = ref(0);
const tickerETH = ref(0);
let tickerInterval = null;

// Toggle visibility
const isExpanded = ref(true);

// Update handlers
async function updateSelectedExchange(exchange) {
  await app.updateUserSelectedExchange(userID.value, exchange);
  reloadNuxtApp();
}

async function updateSelectedMarket(market) {
  await app.updateUserSelectedMarket(userID.value, selectedExchange.value, market);
  reloadNuxtApp();
}

// Fetch ONLY selected ticker + BTC/ETH (MUCH faster & safer)
async function fetchPrices() {
  try {
    // Fetch selected market ticker
    if (selectedExchange.value && selectedMarket.value) {
      try {
        const response = await $fetch('/api/v1/fetchTicker', {
          query: {
            userID: userID.value,
            exchange: selectedExchange.value,
            symbol: selectedMarket.value,
          }
        });
        if (response.data) {
          currentTicker.value = {
            last: parseFloat(response.data.last) || 0,
            percentage: parseFloat(response.data.percentage) || 0,
            bid: parseFloat(response.data.bid) || 0,
            ask: parseFloat(response.data.ask) || 0
          };
          // ✅ UPDATE STORE WITH LIVE PRICE
          app.setCurrentPrice(currentTicker.value.last);
        }
      } catch (error) {
        console.error(`Error fetching ${selectedMarket.value}:`, error);
      }
    }

    // Always fetch BTC & ETH from Binance
    try {
      const binance = new ccxt.binance();
      const btcData = await binance.fetchTicker('BTC/USDT');
      const ethData = await binance.fetchTicker('ETH/USDT');

      tickerBTC.value = parseFloat(btcData.last) || 0;
      tickerETH.value = parseFloat(ethData.last) || 0;
    } catch (error) {
      console.error('Error fetching BTC/ETH:', error);
    }
  } catch (error) {
    console.error('Error fetching prices:', error);
  }
}

onMounted(() => {
  fetchPrices();
  tickerInterval = setIntervalAsync(fetchPrices, 3000); // 3 sec refresh
});

onUnmounted(() => {
  if (tickerInterval) {
    clearIntervalAsync(tickerInterval);
  }
});
</script>

<template>
  <div class="ticker-wrapper" :class="{ collapsed: !isExpanded }">
    <!-- TOGGLE BUTTON -->
    <button class="toggle-btn" @click="isExpanded = !isExpanded">
      <span class="icon">{{ isExpanded ? '◀' : '▶' }}</span>
    </button>

    <!-- TICKER CONTENT -->
    <div v-show="isExpanded" class="ticker-content">
      <!-- EXCHANGE SELECT -->
      <div class="select-group">
        <n-select
          v-model:value="selectedExchange"
          :options="userExchanges"
          placeholder="Exchange"
          size="small"
          filterable
          class="exchange-select mini-select"
          @update:value="updateSelectedExchange($event)"
        />
      </div>

      <!-- PAIR SELECT -->
      <div class="select-group">
        <n-select
          v-model:value="selectedMarket"
          :options="userExchangeMarkets"
          placeholder="Pair"
          size="small"
          filterable
          class="pair-select mini-select"
          @update:value="updateSelectedMarket($event)"
        />
      </div>

      <div class="divider"></div>

      <!-- PRICE CARDS -->
      <div class="price-cards">
        <!-- Selected Market -->
        <div class="price-card current">
          <span class="coin">{{ selectedMarket ? selectedMarket.split('/')[0] : 'LCX' }}</span>
          <span class="price">${{ currentTicker.last ? currentTicker.last.toFixed(4) : '0.0000' }}</span>
         
        </div>

        <!-- BTC -->
        <div class="price-card btc">
          <span class="coin">BTC</span>
          <span class="price">${{ tickerBTC ? tickerBTC.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0' }}</span>
        </div>

        <!-- ETH -->
        <div class="price-card eth">
          <span class="coin">ETH</span>
          <span class="price">${{ tickerETH ? tickerETH.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticker-wrapper {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(10, 10, 30, 0.95), rgba(20, 20, 40, 0.95));
  border: 1px solid rgba(0, 255, 255, 0.15);
  border-radius: 6px;
  padding: 4px 8px;
  gap: 8px;
  height: 32px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.ticker-wrapper.collapsed {
  width: 36px;
  padding: 4px;
}

.toggle-btn {
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 3px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.toggle-btn:hover {
  background: rgba(0, 255, 255, 0.2);
  border-color: rgba(0, 255, 255, 0.5);
}

.toggle-btn .icon {
  color: #00ffff;
  font-size: 8px;
  line-height: 1;
}

.ticker-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.select-group {
  display: flex;
  align-items: center;
}

/* MINI SELECTS - SLEEK STYLE */
:deep(.mini-select .n-base-selection) {
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 4px !important;
  height: 26px !important;
  min-height: 26px !important;
  transition: all 0.2s ease !important;
}

/* EXCHANGE SELECT - FIT 17 CHARS (coinbaseadvanced) */
:deep(.exchange-select .n-base-selection) {
  max-width: 150px !important;
  width: 150px !important;
}

:deep(.exchange-select .n-base-selection-label) {
  color: #00ffff !important;
  font-weight: 700 !important;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
}

:deep(.exchange-select .n-base-selection-input__content) {
  color: #00ffff !important;
  font-weight: 700 !important;
}

/* PAIR SELECT - FIT 11 CHARS (BTC/USDT) */
:deep(.pair-select .n-base-selection) {
  max-width: 110px !important;
  width: 110px !important;
}

:deep(.pair-select .n-base-selection-label) {
  color: #ff00ff !important;
  font-weight: 700 !important;
  text-shadow: 0 0 5px rgba(255, 0, 255, 0.5);
}

:deep(.pair-select .n-base-selection-input__content) {
  color: #ff00ff !important;
  font-weight: 700 !important;
}

:deep(.mini-select .n-base-selection:hover) {
  border-color: rgba(0, 255, 255, 0.4) !important;
  background: rgba(255, 255, 255, 0.08) !important;
}

:deep(.exchange-select .n-base-selection-label) {
  color: #00ffff !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  padding: 0 10px !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
}

:deep(.pair-select .n-base-selection-label) {
  color: #ff00ff !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  padding: 0 10px !important;
  text-shadow: 0 0 8px rgba(255, 0, 255, 0.6);
}

:deep(.mini-select .n-base-suffix) {
  color: rgba(255, 255, 255, 0.4) !important;
  font-size: 10px !important;
}

.divider {
  width: 1px;
  height: 18px;
  background: linear-gradient(to bottom, transparent, rgba(0, 255, 255, 0.3), transparent);
}

.price-cards {
  display: flex;
  align-items: center;
  gap: 6px;
}

.price-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: rgba(0, 0, 0, 0.4);
  padding: 3px 10px;
  border-radius: 4px;
  border: 1px solid;
  transition: all 0.2s ease;
  min-width: 70px;
}

.price-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.2);
}

.price-card.current {
  border-color: rgba(0, 255, 255, 0.3);
}

.price-card.btc {
  border-color: rgba(255, 149, 0, 0.3);
}

.price-card.eth {
  border-color: rgba(157, 78, 221, 0.3);
}

.price-card .coin {
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.9;
  line-height: 1;
}

.price-card .price {
  font-size: 11px;
  font-weight: 800;
  line-height: 1.2;
  margin-top: 2px;
}

.price-card .change {
  font-size: 8px;
  font-weight: 700;
  margin-top: 2px;
}

.price-card .change.positive {
  color: #10eb04;
  text-shadow: 0 0 4px rgba(16, 235, 4, 0.4);
}

.price-card .change.negative {
  color: #e90a15;
  text-shadow: 0 0 4px rgba(233, 10, 21, 0.4);
}

.price-card.current .coin,
.price-card.current .price {
  color: #00ffff;
  text-shadow: 0 0 4px rgba(0, 255, 255, 0.4);
}

.price-card.btc .coin,
.price-card.btc .price {
  color: #ff9500;
  text-shadow: 0 0 4px rgba(255, 149, 0, 0.4);
}

.price-card.eth .coin,
.price-card.eth .price {
  color: #9d4edd;
  text-shadow: 0 0 4px rgba(157, 78, 221, 0.4);
}

/* GLOBAL TICKER SCROLLING */
.global-ticker-scroll {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  flex: 1;
  padding: 2px 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 255, 255, 0.3) transparent;
}

.global-ticker-scroll::-webkit-scrollbar {
  height: 3px;
}

.global-ticker-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.global-ticker-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.3);
  border-radius: 2px;
}

.global-ticker-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.5);
}

.ticker-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.ticker-item:hover {
  background: rgba(0, 255, 255, 0.1);
  border-color: rgba(0, 255, 255, 0.3);
  transform: translateY(-1px);
}

.ticker-item.active {
  background: rgba(0, 255, 255, 0.15);
  border-color: rgba(0, 255, 255, 0.5);
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
}

.ticker-item.btc {
  border-color: rgba(255, 149, 0, 0.3);
  cursor: default;
}

.ticker-item.btc:hover {
  transform: none;
  background: rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 149, 0, 0.3);
}

.ticker-item.eth {
  border-color: rgba(157, 78, 221, 0.3);
  cursor: default;
}

.ticker-item.eth:hover {
  transform: none;
  background: rgba(0, 0, 0, 0.4);
  border-color: rgba(157, 78, 221, 0.3);
}

.ticker-item .symbol {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ticker-item .price {
  font-size: 10px;
  font-weight: 800;
}

.ticker-item .change {
  font-size: 8px;
  font-weight: 700;
}

.ticker-item.btc .symbol,
.ticker-item.btc .price {
  color: #ff9500;
  text-shadow: 0 0 4px rgba(255, 149, 0, 0.4);
}

.ticker-item.eth .symbol,
.ticker-item.eth .price {
  color: #9d4edd;
  text-shadow: 0 0 4px rgba(157, 78, 221, 0.4);
}

.ticker-item.market .symbol {
  color: #00ffff;
  text-shadow: 0 0 4px rgba(0, 255, 255, 0.4);
}

.ticker-item.market .price {
  color: #ffffff;
}

.ticker-item.market .price.positive {
  color: #10eb04;
  text-shadow: 0 0 4px rgba(16, 235, 4, 0.4);
}

.ticker-item.market .price.negative {
  color: #e90a15;
  text-shadow: 0 0 4px rgba(233, 10, 21, 0.4);
}

.ticker-item.market .change.positive {
  color: #10eb04;
}

.ticker-item.market .change.negative {
  color: #e90a15;
}

.ticker-divider {
  width: 1px;
  height: 18px;
  background: linear-gradient(to bottom, transparent, rgba(0, 255, 255, 0.3), transparent);
  flex-shrink: 0;
}
</style>