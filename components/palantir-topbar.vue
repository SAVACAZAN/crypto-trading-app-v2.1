<script setup>
import { useAppStore } from '~/stores/app.store';
import { setIntervalAsync, clearIntervalAsync } from "set-interval-async";

const app = useAppStore();
const userID = useCookie('userID');

// API Keys selection
const availableApiKeys = ref([]);
const selectedApiKeys = ref([]);
const loadingApiKeys = ref(false);

// Exchange & Market selection
const userExchanges = computed(() => app.getUserExchanges);
const selectedExchange = computed({
  get: () => app.getUserSelectedExchange || 'coinbaseadvanced',
  set: (value) => value
});
const userExchangeMarkets = computed(() => app.getUserExchangeMarkets);
const selectedMarket = computed({
  get: () => app.getUserSelectedMarket || 'LCX/USDC',
  set: (value) => value
});

// Ticker data
const currentTicker = ref({ last: 0, percentage: 0, bid: 0, ask: 0 });
const tickerBTC = ref(0);
const tickerETH = ref(0);
let tickerInterval = null;

// System status
const patternEngineStatus = ref('active');
const botChainsStatus = ref('active');
const alertsCount = ref(3);

// Fetch available API keys for current exchange
async function fetchAvailableApiKeys() {
  if (!selectedExchange.value || !userID.value) return;

  loadingApiKeys.value = true;
  try {
    const response = await $fetch('/api/v1/getUserApiKeys', {
      query: {
        userID: userID.value,
        exchange: selectedExchange.value
      }
    });

    if (response.success && response.data) {
      availableApiKeys.value = response.data.map(key => ({
        label: key.name || key.apiKeyId,
        value: key.name || key.apiKeyId
      }));

      // Auto-select first API key if none selected
      if (selectedApiKeys.value.length === 0 && availableApiKeys.value.length > 0) {
        selectedApiKeys.value = [availableApiKeys.value[0].value];
        updateStoreApiKeys();
      }
    }
  } catch (error) {
    console.error('Failed to load API keys:', error);
  } finally {
    loadingApiKeys.value = false;
  }
}

// Update store when API keys change
function updateStoreApiKeys() {
  app.setSelectedApiKeys(selectedApiKeys.value);
}

// Update handlers
async function updateSelectedApiKeys(keys) {
  selectedApiKeys.value = keys;
  updateStoreApiKeys();
}

async function updateSelectedExchange(exchange) {
  await app.updateUserSelectedExchange(userID.value, exchange);
  await fetchAvailableApiKeys(); // Refresh API keys when exchange changes
}

async function updateSelectedMarket(market) {
  await app.updateUserSelectedMarket(userID.value, selectedExchange.value, market);
}

// Fetch live prices
async function fetchPrices() {
  try {
    const exchange = selectedExchange.value || 'coinbaseadvanced';
    const market = selectedMarket.value || 'LCX/USDC';

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
        if (response.data) {
          currentTicker.value = {
            last: parseFloat(response.data.last) || 0,
            percentage: parseFloat(response.data.percentage) || 0,
            bid: parseFloat(response.data.bid) || 0,
            ask: parseFloat(response.data.ask) || 0
          };
          app.setCurrentPrice(currentTicker.value.last);
        }
      } catch (error) {
        console.error(`Error fetching ${market}:`, error);
      }
    }

    // Fetch BTC & ETH
    try {
      const btcEthResponse = await $fetch('/api/v1/fetchBtcEthPrices');
      if (btcEthResponse.success && btcEthResponse.data) {
        tickerBTC.value = parseFloat(btcEthResponse.data.btcPrice) || 0;
        tickerETH.value = parseFloat(btcEthResponse.data.ethPrice) || 0;
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

onMounted(async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  await fetchAvailableApiKeys();
  fetchPrices();
  tickerInterval = setIntervalAsync(fetchPrices, 3000);
});

onUnmounted(() => {
  if (tickerInterval) {
    clearIntervalAsync(tickerInterval);
  }
});
</script>

<template>
  <div class="palantir-topbar">
    <!-- LEFT: Branding -->
    <div class="topbar-left">
      <div class="palantir-logo">
        <span class="logo-icon">🎯</span>
        <div class="logo-text-group">
          <span class="logo-text">PALANTIR</span>
          <span class="logo-subtitle">Trading Intelligence</span>
        </div>
      </div>
    </div>

    <!-- CENTER: Selectors & Prices -->
    <div class="topbar-center">
      <!-- API Key Selector -->
      <div class="selector-group">
        <label class="selector-label">API KEY</label>
        <n-select
          v-model:value="selectedApiKeys"
          :options="availableApiKeys"
          placeholder="Select API Key"
          size="small"
          filterable
          multiple
          :loading="loadingApiKeys"
          class="palantir-select"
          @update:value="updateSelectedApiKeys($event)"
        />
      </div>

      <!-- Exchange Selector -->
      <div class="selector-group">
        <label class="selector-label">EXCHANGE</label>
        <n-select
          v-model:value="selectedExchange"
          :options="userExchanges"
          placeholder="Exchange"
          size="small"
          filterable
          class="palantir-select"
          @update:value="updateSelectedExchange($event)"
        />
      </div>

      <!-- Market Selector -->
      <div class="selector-group">
        <label class="selector-label">MARKET</label>
        <n-select
          v-model:value="selectedMarket"
          :options="userExchangeMarkets"
          placeholder="Pair"
          size="small"
          filterable
          class="palantir-select"
          @update:value="updateSelectedMarket($event)"
        />
      </div>

      <div class="divider"></div>

      <!-- Live Prices -->
      <div class="price-group">
        <div class="price-item selected">
          <span class="price-label">{{ selectedMarket ? selectedMarket.split('/')[0] : 'LCX' }}</span>
          <span class="price-value" :class="{ positive: currentTicker.percentage > 0, negative: currentTicker.percentage < 0 }">
            ${{ currentTicker.last.toFixed(4) }}
          </span>
          <span class="price-change" :class="{ positive: currentTicker.percentage > 0, negative: currentTicker.percentage < 0 }">
            {{ currentTicker.percentage > 0 ? '+' : '' }}{{ currentTicker.percentage.toFixed(2) }}%
          </span>
        </div>
        <div class="price-item">
          <span class="price-label">BTC</span>
          <span class="price-value">${{ tickerBTC.toLocaleString() }}</span>
        </div>
        <div class="price-item">
          <span class="price-label">ETH</span>
          <span class="price-value">${{ tickerETH.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- RIGHT: System Status -->
    <div class="topbar-right">
      <div class="status-group">
        <div class="status-item" :class="patternEngineStatus">
          <span class="status-dot"></span>
          <span class="status-text">Pattern Engine</span>
        </div>
        <div class="status-item" :class="botChainsStatus">
          <span class="status-dot"></span>
          <span class="status-text">Bot Chains</span>
        </div>
        <div class="alerts-badge">
          <span class="alert-icon">🔔</span>
          <span class="alert-count">{{ alertsCount }}</span>
        </div>
      </div>
      <div class="user-id">
        <span class="user-label">ID:</span>
        <span class="user-value">{{ userID?.substring(0, 24) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.palantir-topbar {
  height: 60px;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  border-bottom: 1px solid #00d4ff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 212, 255, 0.2);
}

/* LEFT: Branding */
.topbar-left {
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 200px;
}

.palantir-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 32px;
  filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.6));
}

.logo-text-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #00d4ff;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

.logo-subtitle {
  font-size: 9px;
  color: #888;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* CENTER: Selectors & Prices */
.topbar-center {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
  justify-content: center;
}

.selector-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.selector-label {
  font-size: 8px;
  color: #666;
  letter-spacing: 0.5px;
  font-weight: 600;
  text-transform: uppercase;
}

.palantir-select {
  min-width: 140px;
}

.palantir-select :deep(.n-base-selection) {
  background: rgba(0, 212, 255, 0.05) !important;
  border: 1px solid rgba(0, 212, 255, 0.3) !important;
  border-radius: 4px !important;
  height: 28px !important;
  font-size: 11px !important;
  color: #00d4ff !important;
}

.palantir-select :deep(.n-base-selection:hover) {
  border-color: #00d4ff !important;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.2) !important;
}

.divider {
  width: 1px;
  height: 40px;
  background: linear-gradient(to bottom, transparent, #00d4ff, transparent);
}

.price-group {
  display: flex;
  align-items: center;
  gap: 15px;
}

.price-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 5px 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  border: 1px solid #222;
}

.price-item.selected {
  border-color: #00d4ff;
  background: rgba(0, 212, 255, 0.05);
}

.price-label {
  font-size: 8px;
  color: #666;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.price-value {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  font-family: monospace;
}

.price-value.positive {
  color: #10eb04;
}

.price-value.negative {
  color: #f52a09;
}

.price-change {
  font-size: 9px;
  font-weight: 600;
  font-family: monospace;
}

.price-change.positive {
  color: #10eb04;
}

.price-change.negative {
  color: #f52a09;
}

/* RIGHT: System Status */
.topbar-right {
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 300px;
  justify-content: flex-end;
}

.status-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  border: 1px solid #222;
}

.status-item.active .status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10eb04;
  box-shadow: 0 0 10px rgba(16, 235, 4, 0.5);
  animation: pulse 2s infinite;
}

.status-text {
  font-size: 10px;
  color: #888;
  font-weight: 600;
}

.alerts-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  border-radius: 4px;
}

.alert-icon {
  font-size: 14px;
}

.alert-count {
  font-size: 11px;
  color: #ef4444;
  font-weight: 700;
}

.user-id {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #222;
  border-radius: 4px;
  font-size: 9px;
  font-family: monospace;
}

.user-label {
  color: #666;
  font-weight: 600;
}

.user-value {
  color: #00d4ff;
  font-weight: 600;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
