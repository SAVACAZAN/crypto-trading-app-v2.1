<script setup>
import { useAppStore } from '~/stores/app.store';
import { reloadNuxtApp } from "nuxt/app";
import { setIntervalAsync, clearIntervalAsync } from "set-interval-async";
// import ccxt from 'ccxt'; // REMOVED: CCXT should only run on server-side!

const app = useAppStore();
const userID = useCookie('userID');

// Exchange & Market selection - Use computed for reactivity
const userExchanges = computed(() => app.getUserExchanges);
const selectedExchange = computed({
  get: () => app.getUserSelectedExchange || 'coinbaseadvanced',
  set: (value) => value // Setter handled by updateSelectedExchange
});
const userExchangeMarkets = computed(() => app.getUserExchangeMarkets);

// selectedMarket is a STRING like "LCX/USDC" (from getter)
const selectedMarket = computed({
  get: () => app.getUserSelectedMarket || 'LCX/USDC',
  set: (value) => value // Setter handled by updateSelectedMarket
});

// Ticker data - SIMPLIFIED (only selected ticker + BTC/ETH)
const currentTicker = ref({ last: 0, percentage: 0 });
const tickerBTC = ref(0);
const tickerETH = ref(0);
let tickerInterval = null;
let saveInterval = null;


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
    const exchange = selectedExchange.value || 'coinbaseadvanced';
    const market = selectedMarket.value || 'LCX/USDC';

    console.log('🔄 Ticker Bar - fetchPrices:', { exchange, market });

    // Fetch selected market ticker
    if (exchange && market) {
      try {
        const response = await $fetch('/api/v1/fetchTicker', {
          query: {
            userID: userID.value,
            exchange: exchange,
            symbol: market,
          }
        });

        // Handle case where user has no API keys configured
        if (response.noApiKeys) {
          // Silently skip - user hasn't configured API keys yet
          return;
        }

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

    // Always fetch BTC & ETH from Binance via API endpoint
    try {
      const btcEthResponse = await $fetch('/api/v1/fetchBtcEthPrices');

      if (btcEthResponse.success && btcEthResponse.data) {
        tickerBTC.value = parseFloat(btcEthResponse.data.btcPrice) || 0;
        tickerETH.value = parseFloat(btcEthResponse.data.ethPrice) || 0;

        // ✅ UPDATE STORE WITH LIVE BTC & ETH PRICES
        app.setBtcPrice(tickerBTC.value);
        app.setEthPrice(tickerETH.value);
      }
    } catch (error) {
      console.error('Error fetching BTC/ETH:', error);
    }
  } catch (error) {
    console.error('Error fetching prices:', error);
  }
}

// Save ticker data to database every second
async function saveTickerData() {
  try {
    if (!currentTicker.value.last || !tickerBTC.value || !tickerETH.value) {
      return; // Skip if data is not ready
    }

    const exchange = selectedExchange.value || 'coinbaseadvanced';
    const market = selectedMarket.value || 'LCX/USDC';

    const tickerData = {
      symbol: market, // e.g., "LCX/USDC", "EGLD/USDT"
      exchange: exchange, // e.g., "coinbaseadvanced"
      pairPriceUSD: currentTicker.value.last,
      pairPriceBTC: currentTicker.value.last / tickerBTC.value,
      pairPriceETH: currentTicker.value.last / tickerETH.value,
      btcPriceUSD: tickerBTC.value,
      btcPriceETH: tickerBTC.value / tickerETH.value,
      ethPriceUSD: tickerETH.value,
      ethPriceBTC: tickerETH.value / tickerBTC.value
    };

    await $fetch('/api/v1/saveTickerData', {
      method: 'POST',
      body: tickerData
    });
  } catch (error) {
    console.error('Error saving ticker data:', error);
  }
}


onMounted(async () => {
  console.log('🎯 Ticker Bar mounted');
  console.log('📍 Initial values:', {
    exchange: selectedExchange.value,
    market: selectedMarket.value
  });

  // Wait a bit for store to initialize from layout
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log('📍 After delay:', {
    exchange: selectedExchange.value,
    market: selectedMarket.value
  });

  fetchPrices();
  tickerInterval = setIntervalAsync(fetchPrices, 3000); // 3 sec refresh

  // Save ticker data to database every second
  saveInterval = setIntervalAsync(saveTickerData, 1000); // 1 sec save
});

onUnmounted(() => {
  if (tickerInterval) {
    clearIntervalAsync(tickerInterval);
  }
  if (saveInterval) {
    clearIntervalAsync(saveInterval);
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
        <!-- Selected Market (LCX) with BTC & ETH conversion -->
        <div class="price-card current">
          <span class="coin">{{ selectedMarket ? selectedMarket.split('/')[0] : 'LCX' }}</span>
          <div class="price-line" v-if="currentTicker.last && tickerBTC && tickerETH">
            <span class="price">${{ currentTicker.last.toFixed(4) }}</span>
            <span class="separator">│</span>
            <span class="conversion">₿{{ (currentTicker.last / tickerBTC).toFixed(10) }}</span>
            <span class="separator">│</span>
            <span class="conversion eth">Ξ{{ (currentTicker.last / tickerETH).toFixed(10) }}</span>
          </div>
        </div>

        <!-- BTC -->
        <div class="price-card btc">
          <span class="coin">BTC</span>
          <div class="price-row" v-if="tickerBTC && tickerETH && currentTicker.last">
            <span class="price">${{ tickerBTC.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}</span>
            <span class="separator-small">│</span>
            <span class="conversion eth">Ξ{{ (tickerBTC / tickerETH).toFixed(2) }}</span>
            <span class="separator-small">│</span>
            <span class="conversion lcx">{{ (tickerBTC / currentTicker.last).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }} LCX</span>
          </div>
        </div>

        <!-- ETH -->
        <div class="price-card eth">
          <span class="coin">ETH</span>
          <div class="price-row" v-if="tickerBTC && tickerETH && currentTicker.last">
            <span class="price">${{ tickerETH.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}</span>
            <span class="separator-small">│</span>
            <span class="conversion">₿{{ (tickerETH / tickerBTC).toFixed(5) }}</span>
            <span class="separator-small">│</span>
            <span class="conversion lcx">{{ (tickerETH / currentTicker.last).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }} LCX</span>
          </div>
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

.price-card.current {
  min-width: 125px;
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

.price-line {
  display: flex;
  gap: 3px;
  align-items: center;
  margin-top: 1px;
  font-size: 9px;
  font-weight: 600;
  line-height: 1;
}

.price-line .price {
  color: #00ffff;
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.4);
}

.price-line-small {
  display: flex;
  gap: 3px;
  align-items: center;
  margin-top: 1px;
  font-size: 8px;
  font-weight: 600;
  line-height: 1;
}

.price-row {
  display: flex;
  gap: 2px;
  align-items: center;
  margin-top: 1px;
  font-size: 8px;
  font-weight: 600;
  line-height: 1;
}

.separator-small {
  color: rgba(255, 255, 255, 0.2);
  font-size: 7px;
}

.separator {
  color: rgba(255, 255, 255, 0.3);
  font-size: 8px;
}

.price-card .conversion {
  font-size: 8px;
  font-weight: 600;
  opacity: 0.95;
  color: #ff9500;
  text-shadow: 0 0 3px rgba(255, 149, 0, 0.3);
  white-space: nowrap;
}

.price-card .conversion.eth {
  color: #9d4edd;
  text-shadow: 0 0 3px rgba(157, 78, 221, 0.3);
}

.price-card .conversion.lcx {
  color: #00ffff;
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.3);
  font-size: 7px;
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