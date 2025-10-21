<script setup>
import { useAppStore } from '~/stores/app.store';
import { ref, h, onMounted, computed } from "vue";
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async';

const app = useAppStore();
let userID = useCookie('userID');

// Refs for form inputs
let incrementalPercentAmountBuy = ref('1');
let incrementalPercentAmountSell = ref('1');
let deviationPriceBuy = ref('1');
let deviationPriceSell = ref('1');
let deviationAmountBuy = ref('0.9');
let deviationAmountSell = ref('0.9');

const savedConfigurations = ref([
  {
    name: "Default",
    incrementalPercentAmountBuy: "1",
    incrementalPercentAmountSell: "1",
    deviationPriceBuy: "1",
    deviationPriceSell: "1",
    deviationAmountBuy: "0.9",
    deviationAmountSell: "0.9",
    isDefault: true,
  }
]);

function saveConfiguration() {
  const configName = prompt("Enter configuration name:");
  if (configName) {
    savedConfigurations.value.push({
      name: configName,
      incrementalPercentAmountBuy: incrementalPercentAmountBuy.value,
      incrementalPercentAmountSell: incrementalPercentAmountSell.value,
      deviationPriceBuy: deviationPriceBuy.value,
      deviationPriceSell: deviationPriceSell.value,
      deviationAmountBuy: deviationAmountBuy.value,
      deviationAmountSell: deviationAmountSell.value,
      isDefault: false,
    });
  }
}

function applyConfiguration(config) {
  incrementalPercentAmountBuy.value = config.incrementalPercentAmountBuy;
  incrementalPercentAmountSell.value = config.incrementalPercentAmountSell;
  deviationPriceBuy.value = config.deviationPriceBuy;
  deviationPriceSell.value = config.deviationPriceSell;
  deviationAmountBuy.value = config.deviationAmountBuy;
  deviationAmountSell.value = config.deviationAmountSell;
}

// API Key selector
let availableApiKeys = ref([]);
let selectedApiKey = ref(null);
let loadingApiKeys = ref(false);
let apiKeyColors = ref({});

let selectedExchange = ref('coinbaseadvanced');
let selectedMarkets = ref(['LCX/USDC']);
let marketForms = ref([]);

let userExchanges = app.getUserExchanges;
let userExchangeMarkets = app.getUserExchangeMarkets;

async function updateSelectedExchange(exchange) {
  selectedExchange.value = exchange;
  selectedMarkets.value = [];
  marketForms.value = [];
  await loadApiKeys();
}

async function fetchOrderBook() {
  try {
    for (let market of selectedMarkets.value) {
      const response = await $fetch('/api/v1/fetchOrderBook', {
        method: 'GET',
        params: {
          userID: userID.value,
          exchange: selectedExchange.value,
          symbol: market
        }
      });
      const orderBook = response.data;

      const marketForm = marketForms.value.find((mf) => mf.symbol === market);
      if (marketForm) {
        marketForm.bestBid = orderBook?.bids?.[0]?.[0] || 'N/A';
        marketForm.bestAsk = orderBook?.asks?.[0]?.[0] || 'N/A';
      }
    }
  } catch (error) {
    console.error('Error fetching order book:', error);
  }
}

function addToAmount(value) {
  marketForms.value.forEach((marketForm) => {
    marketForm.amount = String((+marketForm.amount || 0) + value);
  });
}

function addToNrOfGrids(value) {
  marketForms.value.forEach((marketForm) => {
    marketForm.nrOfGrids = String((+marketForm.nrOfGrids || 0) + value);
  });
}

function updateLowerPriceForAll(deviationPercentage) {
  marketForms.value.forEach((marketForm) => {
    if (marketForm.bestBid) {
      marketForm.lowerPrice = (parseFloat(marketForm.bestBid) * (1 - deviationPercentage)).toFixed(6);
    }
  });
}

function updateUpperPriceForAll(deviationPercentage) {
  marketForms.value.forEach((marketForm) => {
    if (marketForm.bestAsk) {
      marketForm.upperPrice = (parseFloat(marketForm.bestAsk) * (1 + deviationPercentage)).toFixed(6);
    }
  });
}

async function createGridBot() {
  if (!selectedApiKey.value) {
    alert('Please select an API key');
    return;
  }

  try {
    const botsData = marketForms.value.map((marketForm) => ({
      userID: userID.value,
      name: marketForm.name || `gridBot_${marketForm.symbol}`,
      exchange: selectedExchange.value,
      symbol: marketForm.symbol,
      lowerPrice: parseFloat(marketForm.lowerPrice) || 0,
      upperPrice: parseFloat(marketForm.upperPrice) || 0,
      amountType: 'incrementalPercent',
      amount: parseFloat(marketForm.amount) || 0,
      nrOfGrids: parseInt(marketForm.nrOfGrids) || 0,
      ordersSide: 'buyOrSell',
      incrementalPercentAmountBuy: parseFloat(incrementalPercentAmountBuy.value) || 0,
      incrementalPercentAmountSell: parseFloat(incrementalPercentAmountSell.value) || 0,
      apiKeyName: selectedApiKey.value,
      config: {
        deviationPriceBuy: parseFloat(deviationPriceBuy.value) || 1,
        deviationPriceSell: parseFloat(deviationPriceSell.value) || 1,
        deviationAmountBuy: parseFloat(deviationAmountBuy.value) || 1,
        deviationAmountSell: parseFloat(deviationAmountSell.value) || 1,
      },
    }));

    await Promise.all(
      botsData.map((botData) =>
        $fetch('/api/v1/createOneClickBot', {
          method: 'POST',
          body: botData,
        })
      )
    );

    alert('Grid Bots created successfully!');
  } catch (error) {
    console.error('Error creating grid bots:', error);
    alert('Failed to create Grid Bots');
  }
}

function handleBuy() {
  createGridBot({ type: 'buy' });
}

function handleSell() {
  createGridBot({ type: 'sell' });
}

async function updateSelectedMarkets(markets) {
  selectedMarkets.value = markets;

  marketForms.value = markets.map((market) => ({
    symbol: market,
    name: `gridBot_${market}`,
    lowerPrice: '',
    upperPrice: '',
    amount: '1.1',
    nrOfGrids: '10',
    bestBid: null,
    bestAsk: null,
  }));

  await fetchOrderBook();
}

onMounted(async () => {
  await loadApiKeys();
  await updateSelectedMarkets(selectedMarkets.value);
  setIntervalAsync(fetchOrderBook, 5000);
});

async function loadApiKeys() {
  loadingApiKeys.value = true;
  try {
    const response = await $fetch('/api/v1/fetchApiKeysList', {
      query: {
        userID: userID.value,
        exchange: selectedExchange.value
      }
    });

    if (response.success && response.data && response.data.length > 0) {
      const colors = ['#10eb04', '#05f5ed', '#f5a623', '#eb06eb', '#eadb11', '#50e3c2', '#f72c09', '#cb8d07'];
      apiKeyColors.value = {};

      availableApiKeys.value = response.data.map((apiKey, index) => {
        const color = colors[index % colors.length];
        apiKeyColors.value[apiKey.name] = color;
        return {
          label: `${apiKey.name} (${apiKey.preview})`,
          value: apiKey.name
        };
      });
      selectedApiKey.value = availableApiKeys.value[0].value;
    } else {
      availableApiKeys.value = [];
      selectedApiKey.value = null;
    }
  } catch (error) {
    console.error('Failed to load API keys:', error);
    availableApiKeys.value = [];
    selectedApiKey.value = null;
  } finally {
    loadingApiKeys.value = false;
  }
}

function renderApiKeyLabel(option) {
  const color = apiKeyColors.value[option.value] || '#ffffff';
  return h('div', { style: 'display: flex; align-items: center;' }, [
    h('span', {
      style: `display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color}; margin-right: 8px;`
    }),
    h('span', { style: `color: ${color}; font-weight: 500;` }, option.label)
  ]);
}
</script>

<template>
  <div class="oneclick-container">
    <!-- Compact Header -->
    <div class="compact-header">
      <span class="header-title">🤖 OneClick Grid Bot</span>
      <div class="header-controls">
        <n-select
          v-model:value="selectedApiKey"
          :options="availableApiKeys"
          :loading="loadingApiKeys"
          placeholder="API Key"
          :disabled="availableApiKeys.length === 0"
          size="small"
          style="width: 200px;"
          :render-label="renderApiKeyLabel"
        />
        <n-select
          v-model:value="selectedExchange"
          :options="userExchanges"
          placeholder="Exchange"
          size="small"
          style="width: 150px;"
          @update:value="updateSelectedExchange($event)"
        />
        <n-select
          v-model:value="selectedMarkets"
          :options="userExchangeMarkets"
          placeholder="Markets"
          size="small"
          style="width: 200px;"
          multiple
          filterable
          @update:value="updateSelectedMarkets($event)"
        />
      </div>
    </div>

    <!-- Ticker Bar with Actions -->
    <div class="ticker-bar" v-if="marketForms.length > 0">
      <div class="ticker-content">
        <div class="ticker-scroll">
          <div v-for="(marketForm, index) in marketForms" :key="index" class="ticker-item">
            <span class="ticker-symbol">{{ marketForm.symbol }}</span>
            <span class="ticker-bid">{{ marketForm.bestBid || '-' }}</span>
            <span class="ticker-separator">/</span>
            <span class="ticker-ask">{{ marketForm.bestAsk || '-' }}</span>
            <span class="ticker-spread" v-if="marketForm.bestBid && marketForm.bestAsk && !isNaN(parseFloat(marketForm.bestBid)) && !isNaN(parseFloat(marketForm.bestAsk))">
              ({{ ((parseFloat(marketForm.bestAsk) - parseFloat(marketForm.bestBid)) / parseFloat(marketForm.bestBid) * 100).toFixed(2) }}%)
            </span>
          </div>
        </div>
        <div class="ticker-actions">
          <n-button type="primary" size="tiny" @click="createGridBot">🚀 Create</n-button>
          <n-button type="success" size="tiny" @click="handleBuy">📈 Buy</n-button>
          <n-button type="error" size="tiny" @click="handleSell">📉 Sell</n-button>
          <span class="action-separator">|</span>
          <n-button size="tiny" @click="() => updateLowerPriceForAll(0.01)">-1%</n-button>
          <n-button size="tiny" @click="() => updateLowerPriceForAll(0.1)">-10%</n-button>
          <n-button size="tiny" type="error" @click="() => updateUpperPriceForAll(0.01)">+1%</n-button>
          <n-button size="tiny" type="error" @click="() => updateUpperPriceForAll(0.1)">+10%</n-button>
          <span class="action-separator">|</span>
          <n-button size="tiny" @click="() => addToAmount(1.1)">+1.1</n-button>
          <n-button size="tiny" @click="() => addToAmount(10.1)">+10.1</n-button>
          <n-button size="tiny" @click="() => addToNrOfGrids(5)">+5G</n-button>
          <n-button size="tiny" @click="() => addToNrOfGrids(10)">+10G</n-button>
        </div>
      </div>
    </div>

    <!-- Main Content with Sidebar -->
    <div class="content-wrapper" v-if="marketForms.length > 0">
      <!-- Sidebar Config -->
      <div class="sidebar-config">
        <div class="config-section">
          <div class="section-title">⚙️ Config</div>
          <div class="config-grid">
            <label>Inc % Buy</label>
            <n-input v-model:value="incrementalPercentAmountBuy" size="tiny" placeholder="1.0" />

            <label>Inc % Sell</label>
            <n-input v-model:value="incrementalPercentAmountSell" size="tiny" placeholder="1.0" />

            <label>Dev Price Buy</label>
            <n-input v-model:value="deviationPriceBuy" size="tiny" placeholder="1.0" />

            <label>Dev Price Sell</label>
            <n-input v-model:value="deviationPriceSell" size="tiny" placeholder="1.0" />

            <label>Dev Amt Buy</label>
            <n-input v-model:value="deviationAmountBuy" size="tiny" placeholder="0.9" />

            <label>Dev Amt Sell</label>
            <n-input v-model:value="deviationAmountSell" size="tiny" placeholder="0.9" />
          </div>
          <n-button type="primary" size="tiny" block @click="saveConfiguration" style="margin-top: 8px;">💾 Save</n-button>
        </div>

        <div class="config-section">
          <div class="section-title">💾 Saved</div>
          <div class="saved-list">
            <div v-for="(config, index) in savedConfigurations" :key="index" class="saved-item">
              <span class="saved-name">{{ config.name }}</span>
              <n-button size="tiny" @click="applyConfiguration(config)">Apply</n-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Table -->
      <div class="main-table">
        <table class="compact-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Bid</th>
              <th>Ask</th>
              <th>Spread</th>
              <th>Bot Name</th>
              <th>Lower Price</th>
              <th>Upper Price</th>
              <th>Amount</th>
              <th>Grids</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(marketForm, index) in marketForms" :key="index">
              <td><n-tag type="info" size="small" strong>{{ marketForm.symbol }}</n-tag></td>
              <td class="price-bid">{{ marketForm.bestBid || '-' }}</td>
              <td class="price-ask">{{ marketForm.bestAsk || '-' }}</td>
              <td class="price-spread" v-if="marketForm.bestBid && marketForm.bestAsk && !isNaN(parseFloat(marketForm.bestBid)) && !isNaN(parseFloat(marketForm.bestAsk))">
                {{ ((parseFloat(marketForm.bestAsk) - parseFloat(marketForm.bestBid)) / parseFloat(marketForm.bestBid) * 100).toFixed(3) }}%
              </td>
              <td v-else>-</td>
              <td><n-input v-model:value="marketForm.name" size="tiny" placeholder="Bot name" /></td>
              <td><n-input v-model:value="marketForm.lowerPrice" size="tiny" placeholder="Lower" /></td>
              <td><n-input v-model:value="marketForm.upperPrice" size="tiny" placeholder="Upper" /></td>
              <td><n-input v-model:value="marketForm.amount" size="tiny" placeholder="Amount" /></td>
              <td><n-input v-model:value="marketForm.nrOfGrids" size="tiny" placeholder="Grids" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Main Container */
.oneclick-container {
  padding: 8px;
  width: 100%;
  background: #0f1419;
  min-height: 100vh;
  font-size: 12px;
}

/* Compact Header */
.compact-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: #1a1f2e;
  border: 1px solid #2a3441;
  border-radius: 4px;
  margin-bottom: 6px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #e0e0e0;
}

.header-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Ticker Bar */
.ticker-bar {
  background: #1a1f2e;
  border: 1px solid #2a3441;
  border-radius: 4px;
  margin-bottom: 6px;
  padding: 6px 10px;
}

.ticker-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.ticker-scroll {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  flex: 1;
}

.ticker-item {
  display: flex;
  gap: 6px;
  align-items: center;
  white-space: nowrap;
  font-size: 11px;
}

.ticker-symbol {
  font-weight: 700;
  color: #6366f1;
  margin-right: 4px;
}

.ticker-bid {
  color: #4ade80;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.ticker-separator {
  color: #666;
}

.ticker-ask {
  color: #f87171;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.ticker-spread {
  color: #fbbf24;
  font-size: 10px;
  font-family: 'Courier New', monospace;
}

.ticker-actions {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-shrink: 0;
}

.action-separator {
  color: #666;
  margin: 0 4px;
  font-size: 12px;
}

/* Content Wrapper */
.content-wrapper {
  display: flex;
  gap: 8px;
}

/* Sidebar Config */
.sidebar-config {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-section {
  background: #1a1f2e;
  border: 1px solid #2a3441;
  border-radius: 4px;
  padding: 8px;
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  color: #888;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.config-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  font-size: 10px;
}

.config-grid label {
  font-size: 9px;
  color: #888;
  font-weight: 600;
  margin-bottom: -4px;
}

.saved-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.saved-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 6px;
  background: #0f1419;
  border: 1px solid #2a3441;
  border-radius: 3px;
  font-size: 10px;
}

.saved-name {
  color: #ccc;
  font-weight: 500;
  font-size: 10px;
}

/* Main Table */
.main-table {
  flex: 1;
  overflow-x: auto;
}

.compact-table {
  width: 100%;
  border-collapse: collapse;
  background: #1a1f2e;
  border: 1px solid #2a3441;
  border-radius: 4px;
  font-size: 11px;
}

.compact-table thead {
  background: #0f1419;
}

.compact-table th {
  padding: 6px 8px;
  text-align: left;
  font-weight: 600;
  color: #888;
  border-bottom: 1px solid #2a3441;
  font-size: 10px;
  text-transform: uppercase;
}

.compact-table td {
  padding: 4px 6px;
  border-bottom: 1px solid #2a3441;
  color: #ccc;
}

.compact-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.price-bid {
  color: #4ade80;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  font-size: 11px;
}

.price-ask {
  color: #f87171;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  font-size: 11px;
}

.price-spread {
  color: #fbbf24;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  font-size: 10px;
}
</style>
