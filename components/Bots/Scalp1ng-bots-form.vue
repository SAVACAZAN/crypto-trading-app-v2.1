<script setup>
import { useAppStore } from '~/stores/app.store';
import { ref, h, onMounted, onUnmounted, watch } from "vue";
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async';

const app = useAppStore();

let userID = useCookie('userID');

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);

let base = currentSymbol.value.split('/')[0];
let quote = currentSymbol.value.split('/')[1];

// API Key selector
let availableApiKeys = ref([]);
let selectedApiKey = ref(null);
let loadingApiKeys = ref(false);
let apiKeyColors = ref({}); // Store colors for each API key

let name = ref(`Sc4lp1ngB0t_${generateRandomString(5)}`);

let lowerPrice = ref('');
let upperPrice = ref('');
let BalanceBotStart = ref('200');
let amountType = ref('incrementalPercent');

let amount = ref('20');
let nrOfGrids = ref('20');
let ordersSide = ref('buyOrSell');
let ordersSideOptions = [
  { value: 'buyOnly', label: 'Buy Only' },
  { value: 'sellOnly', label: 'Sell Only' },
];

const bestBid = ref(null);
const bestAsk = ref(null);
const manualLowerPrice = ref('');
const manualUpperPrice = ref('');

let BalanceBase = ref(0);
let BalanceQuote = ref(0);
let BalanceBaseInUSD = ref(0);
let BalanceQuoteInUSD = ref(0);
let BalanceBaseProfit = ref(0);
let BalanceQuoteProfit = ref(0);
let BalanceBotProfit = ref(0);
let BalanceBotValInitiala = ref(0);
let TakeProfitBotSTR1 = ref('');
let TakeProfitBotSTR2 = ref('');

let BotReset = ref('');
let BotCancelOrders = ref('');
let BotX1 = ref('');
let BotX2 = ref('');
let BotX3 = ref('');
let BotX4 = ref('');

let ActiveRANGE = ref(false);
let baseBalanceFree = ref(0);
let baseBalanceUsed = ref(0);
let baseBalanceTotal = ref(0);
let quoteBalanceFree = ref(0);
let quoteBalanceUsed = ref(0);
let quoteBalanceTotal = ref(0);
let userBalanceInterval = null;
let orderBookInterval = null;
let initialDeviationApplied = false;

onMounted(async () => {
  orderBookInterval = setIntervalAsync(fetchOrderBookPooling, 500);
  userBalanceInterval = setIntervalAsync(fetchUserBalancePooling, 500);
  applyInitialDeviation();
  fetchOrderBookPooling();
  await loadApiKeys();
});

onUnmounted(() => {
  clearIntervalAsync(orderBookInterval);
  clearIntervalAsync(userBalanceInterval);
});

// Load available API keys for the selected exchange
async function loadApiKeys() {
  loadingApiKeys.value = true;
  try {
    const response = await $fetch('/api/v1/fetchApiKeysList', {
      query: {
        userID: userID.value,
        exchange: currentExchange.value
      }
    });

    if (response.success && response.data && response.data.length > 0) {
      // Color palette for API keys
      const colors = ['#10eb04', '#05f5ed', '#f5a623', '#eb06eb', '#eadb11', '#50e3c2', '#f72c09', '#cb8d07'];

      // Store colors for each API key
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
      apiKeyColors.value = {};
    }
  } catch (error) {
    console.error('Failed to load API keys:', error);
    availableApiKeys.value = [];
    selectedApiKey.value = null;
    apiKeyColors.value = {};
  } finally {
    loadingApiKeys.value = false;
  }
}

// Watch for API key changes and reload balance
watch(selectedApiKey, async (newKey) => {
  if (newKey) {
    await fetchUserBalancePooling();
  }
});

// Custom render function for API key options with colored icons
function renderApiKeyLabel(option) {
  const color = apiKeyColors.value[option.value] || '#ffffff';
  return h('div', { style: 'display: flex; align-items: center;' }, [
    h('span', {
      style: `display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color}; margin-right: 8px; flex-shrink: 0;`
    }),
    h('span', { style: `color: ${color}; font-weight: 500;` }, option.label)
  ]);
}

async function fetchOrderBookPooling() {
  try {
    const orderBook = await $fetch('/api/v1/fetchOrderBook', {
      query: {
        userID: userID.value,
        exchange: currentExchange.value,
        symbol: currentSymbol.value,
      },
    });

    if (orderBook.data) {
      bestBid.value = orderBook.data.bids.length > 0 ? orderBook.data.bids[0][0] : null;
      bestAsk.value = orderBook.data.asks.length > 0 ? orderBook.data.asks[0][0] : null;
    }
  } catch (error) {
    console.error('Error fetching order book:', error);
  }
}

async function fetchUserBalancePooling() {
  if (!selectedApiKey.value) return;

  let response = await $fetch('/api/v1/fetchBalance', {
    query: {
      userID: userID.value,
      exchange: currentExchange.value,
      apiKeyName: selectedApiKey.value
    }
  });

  if (response.data) {
    baseBalanceFree.value = response.data.free?.[base] || 0;
    baseBalanceUsed.value = response.data.used?.[base] || 0;
    baseBalanceTotal.value = response.data.total?.[base] || 0;
    quoteBalanceFree.value = response.data.free?.[quote] || 0;
    quoteBalanceUsed.value = response.data.used?.[quote] || 0;
    quoteBalanceTotal.value = response.data.total?.[quote] || 0;
  } else {
    baseBalanceFree.value = 0;
    baseBalanceUsed.value = 0;
    baseBalanceTotal.value = 0;
    quoteBalanceFree.value = 0;
    quoteBalanceUsed.value = 0;
    quoteBalanceTotal.value = 0;
  }
}

function updateLowerPrice1(deviationPercentage = 0.01) {
  if (bestBid.value) {
    const newValue = (bestBid.value * (1 + deviationPercentage)).toFixed(8).toString();
    console.log(`Update Lower Price Button Clicked. New Value with ${deviationPercentage * 100}% deviation:`, newValue);
    manualLowerPrice.value = newValue;
    lowerPrice.value = newValue;
  }
}

function updateUpperPrice1(deviationPercentage = 0.01) {
  if (bestAsk.value) {
    const newValue = (bestAsk.value * (1 - deviationPercentage)).toFixed(8).toString();
    console.log(`Update Upper Price Button Clicked. New Value with ${deviationPercentage * 100}% deviation:`, newValue);
    manualUpperPrice.value = newValue;
    upperPrice.value = newValue;
  }
}


function updateLowerPrice2(deviationPercentage = 0.01) {
  if (bestAsk.value) {
    const newValue = (bestAsk.value * (1 - deviationPercentage)).toFixed(8).toString();
    console.log(`Update Lower Price Button Clicked. New Value with ${deviationPercentage * 100}% deviation:`, newValue);
    manualLowerPrice.value = newValue;
    lowerPrice.value = newValue;
  }
}

function updateUpperPrice2(deviationPercentage = 0.01) {
  if (bestBid.value) {
    const newValue = (bestBid.value * (1 + deviationPercentage)).toFixed(8).toString();
    console.log(`Update Upper Price Button Clicked. New Value with ${deviationPercentage * 100}% deviation:`, newValue);
    manualUpperPrice.value = newValue;
    upperPrice.value = newValue;
  }
}

function updateLowerPrice(deviationPercentage = 0.01) {
  if (bestBid.value) {
    const newValue = (bestBid.value * (1 - deviationPercentage)).toFixed(8).toString();
    console.log(`Update Lower Price Button Clicked. New Value with ${deviationPercentage * 100}% deviation:`, newValue);
    manualLowerPrice.value = newValue;
    lowerPrice.value = newValue;
  }
}

function updateUpperPrice(deviationPercentage = 0.01) {
  if (bestAsk.value) {
    const newValue = (bestAsk.value * (1 + deviationPercentage)).toFixed(8).toString();
    console.log(`Update Upper Price Button Clicked. New Value with ${deviationPercentage * 100}% deviation:`, newValue);
    manualUpperPrice.value = newValue;
    upperPrice.value = newValue;
  }
}

function applyInitialDeviation() {
  if (!initialDeviationApplied) {
    updateLowerPrice();
    updateUpperPrice();
    initialDeviationApplied = true;
  }
}

function handleManualLowerPriceInput(event) {
  const newValue = event.target.innerText.trim();
  if (/^\d*\.?\d*$/.test(newValue)) {
    manualLowerPrice.value = newValue;
  } else {
    event.target.innerText = manualLowerPrice.value;
  }
}

function handleManualUpperPriceInput(event) {
  const newValue = event.target.innerText.trim();
  if (/^\d*\.?\d*$/.test(newValue)) {
    manualUpperPrice.value = newValue;
  } else {
    event.target.innerText = manualUpperPrice.value;
  }
}

function generateRandomString(length = 20) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }

  return randomString;
}

async function createBuyOnlyBot() {
  ordersSide.value = 'buyOnly';
  await createScalp1ngBot();
}

async function createSellOnlyBot() {
  ordersSide.value = 'sellOnly';
  await createScalp1ngBot();
}

async function createScalp1ngBot() {
  // Validate API key is selected
  if (!selectedApiKey.value) {
    console.error('Please select an API key before creating bot');
    return;
  }

  let data = {
    userID: userID.value,
    name: name.value,
    exchange: currentExchange.value,
    symbol: currentSymbol.value,
    lowerPrice: lowerPrice.value,
    upperPrice: upperPrice.value,
    BalanceBotStart: BalanceBotStart.value,
    amountType: amountType.value,
    amount: amount.value,
    nrOfGrids: nrOfGrids.value,
    ordersSide: ordersSide.value,
    apiKeyName: selectedApiKey.value,

    BalanceBot: {
      BalanceBase: BalanceBase.value,
      BalanceQuote: BalanceQuote.value,
      BalanceBaseInUSD: BalanceBaseInUSD.value,
      BalanceQuoteInUSD: BalanceQuoteInUSD.value,
      BalanceBaseProfit: BalanceBaseProfit.value,
      BalanceQuoteProfit: BalanceQuoteProfit.value,
      BalanceBotProfit: BalanceBotProfit.value,
      BalanceBotValInitiala: BalanceBotValInitiala.value
    },
    TakeProfitBot: {
      TakeProfitBotSTR1: TakeProfitBotSTR1.value,
      TakeProfitBotSTR2: TakeProfitBotSTR2.value
    },
    BotAction: {
      BotReset: BotReset.value,
      BotCancelOrders: BotCancelOrders.value,
      BotX1: BotX1.value,
      BotX2: BotX2.value,
      BotX3: BotX3.value,
      BotX4: BotX4.value,
    },
  };

  let response = await $fetch('/api/v1/Bots/createScalp1ngBot', {
    method: 'POST',
    body: data
  });

  // Display buttons after creating the bot
  BotX1.value = 'ComandaX1';
  BotX2.value = 'ComandaX2';
  // Add BotX3, BotX4 etc. if needed
}
</script>

<template>
<!-- API Key Selector and Balance Display -->
<n-card style="margin-bottom: 16px; padding: 8px;">
  <table style="width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed;">
    <thead>
      <tr style="border-bottom: 1px solid #444;">
        <th style="text-align: left; padding: 4px 8px; width: 25%;">API Key</th>
        <th style="text-align: left; padding: 4px 8px; width: 10%;">Coin</th>
        <th style="text-align: right; padding: 4px 8px; color: #10eb04; width: 21.66%;">Free</th>
        <th style="text-align: right; padding: 4px 8px; color: #f5a623; width: 21.66%;">Used</th>
        <th style="text-align: right; padding: 4px 8px; color: #50e3c2; width: 21.66%;">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td rowspan="2" style="padding: 4px 8px; vertical-align: middle;">
          <n-select
            v-model:value="selectedApiKey"
            :options="availableApiKeys"
            :loading="loadingApiKeys"
            placeholder="Select API Key"
            :disabled="availableApiKeys.length === 0"
            size="small"
            :render-label="renderApiKeyLabel"
          />
        </td>
        <td v-if="selectedApiKey" style="padding: 4px 8px;">
          <span style="display: inline-flex; align-items: center;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10eb04; margin-right: 6px;"></span>
            <span style="font-weight: bold; color: #10eb04;">{{ base }}</span>
          </span>
        </td>
        <td v-if="selectedApiKey" style="padding: 4px 8px; text-align: right; color: #10eb04;">{{ Number(baseBalanceFree).toFixed(8) }}</td>
        <td v-if="selectedApiKey" style="padding: 4px 8px; text-align: right; color: #f5a623;">{{ Number(baseBalanceUsed).toFixed(8) }}</td>
        <td v-if="selectedApiKey" style="padding: 4px 8px; text-align: right; color: #50e3c2;">{{ Number(baseBalanceTotal).toFixed(8) }}</td>
        <td v-if="!selectedApiKey" colspan="4" style="padding: 4px 8px; text-align: center;">
          <n-spin v-if="loadingApiKeys" size="small" />
          <n-text v-else type="warning" style="font-size: 11px;">Select an API key</n-text>
        </td>
      </tr>
      <tr v-if="selectedApiKey">
        <td style="padding: 4px 8px;">
          <span style="display: inline-flex; align-items: center;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #05f5ed; margin-right: 6px;"></span>
            <span style="font-weight: bold; color: #05f5ed;">{{ quote }}</span>
          </span>
        </td>
        <td style="padding: 4px 8px; text-align: right; color: #10eb04;">{{ Number(quoteBalanceFree).toFixed(8) }}</td>
        <td style="padding: 4px 8px; text-align: right; color: #f5a623;">{{ Number(quoteBalanceUsed).toFixed(8) }}</td>
        <td style="padding: 4px 8px; text-align: right; color: #50e3c2;">{{ Number(quoteBalanceTotal).toFixed(8) }}</td>
      </tr>
    </tbody>
  </table>
</n-card>

  <n-card>
    <n-grid x-gap="12" :cols="2" item-responsive>
      <n-gi>
        <n-space vertical>
          <n-input v-model:value="name" type="text" placeholder="Bot name" />

          <n-input v-model:value="BalanceBotStart" type="text" placeholder="BalanceBotStart" />
          <n-input v-model:value="lowerPrice" type="text" placeholder="Lower Price">
            <template #suffix> {{quote}} </template>
          </n-input>

          <!-- New Buttons for Buy Only and Sell Only -->
          <n-button type="primary" @click="createBuyOnlyBot">Create Buy Only Bot</n-button>
          <n-button type="warning" @click="createSellOnlyBot">Create Sell Only Bot</n-button>
        </n-space>
      </n-gi>
      <n-gi>
        <n-space vertical>
          <n-input v-model:value="upperPrice" type="text" placeholder="Upper Price">
            <template #suffix> {{quote}} </template>
          </n-input>
          <n-input v-model:value="amount" type="text" placeholder="Amount">
            <template #suffix> {{quote}} </template>
          </n-input>
          <n-input v-model:value="nrOfGrids" type="text" placeholder="Nr of grids"></n-input>
        </n-space>
      </n-gi>
    </n-grid>
  </n-card>
  <n-card>
    <n-grid x-gap="0" :cols="3" item-responsive style="display: flex; flex-wrap: nowrap;">
      <n-gi>
        <table>
          <tr>
            <td><n-button @click="updateLowerPrice1(0.00003)">-</n-button></td>
            <td><n-button @click="updateUpperPrice2(0.00003)">+</n-button></td>
          </tr>


      
          
          <tr>
            <td><n-button @click="updateLowerPrice(0.005)">- 0.5%</n-button></td>
            <td><n-button @click="updateUpperPrice(0.005)">+ 0.5%</n-button></td>
          </tr>
          <tr>
            <td><n-button @click="updateLowerPrice(0.01)">- 1%</n-button></td>
            <td><n-button @click="updateUpperPrice(0.01)">+ 1%</n-button></td>
          </tr>
          <tr>
            <td><n-button @click="updateLowerPrice(0.02)">- 2%</n-button></td>
            <td><n-button @click="updateUpperPrice(0.02)">+ 2%</n-button></td>
          </tr>
          <tr>
            <td><n-button @click="updateLowerPrice(0.03)">- 3%</n-button></td>
            <td><n-button @click="updateUpperPrice(0.03)">+ 3%</n-button></td>
          </tr>
          <tr>
            <td><n-button @click="updateLowerPrice(0.05)">- 5%</n-button></td>
            <td><n-button @click="updateUpperPrice(0.05)">+ 5%</n-button></td>
          </tr>
          <tr>
            <td><n-button @click="updateLowerPrice(0.07)">- 7%</n-button></td>
            <td><n-button @click="updateUpperPrice(0.07)">+ 7%</n-button></td>
          </tr>
          <tr>
            <td><n-button @click="updateLowerPrice(0.09)">- 9%</n-button></td>
            <td><n-button @click="updateUpperPrice(0.09)">+ 9%</n-button></td>
          </tr>
        </table>
      </n-gi>

      <n-gi>
        
        <table>
          <tr>
            <td><n-button @click="updateLowerPrice2(0.00003)">-</n-button></td>
            <td><n-button @click="updateUpperPrice1(0.00003)">+</n-button></td>
          </tr>
          <tr>
            <td><n-button @click="updateLowerPrice(0.1)">- 10%</n-button></td>
            <td><n-button @click="updateUpperPrice(0.1)">+ 10%</n-button></td>
          </tr>
          <tr>
            <td><n-button @click="updateLowerPrice(0.2)">- 20%</n-button></td>
            <td><n-button @click="updateUpperPrice(0.2)">+ 20%</n-button></td>
          </tr>
          <tr>
            <td><n-button @click="updateLowerPrice(0.3)">- 30%</n-button></td>
            <td><n-button @click="updateUpperPrice(0.3)">+ 30%</n-button></td>
          </tr>
          <tr>
            <td><n-button @click="updateLowerPrice(0.5)">- 50%</n-button></td>
            <td><n-button @click="updateUpperPrice(0.5)">+ 50%</n-button></td>
          </tr>
          <tr>
            <td><n-button @click="updateLowerPrice(0.6)">- 60%</n-button></td>
            <td><n-button @click="updateUpperPrice(0.6)">+ 60%</n-button></td>
          </tr>
          <tr>
            <td><n-button @click="updateLowerPrice(0.7)">- 70%</n-button></td>
            <td><n-button @click="updateUpperPrice(0.7)">+ 70%</n-button></td>
          </tr>
          <tr>
            <td><n-button @click="updateLowerPrice(0.8)">- 80%</n-button></td>
            <td><n-button @click="updateUpperPrice(0.8)">+ 80%</n-button></td>
          </tr>
          <tr>
            <td><n-button @click="updateLowerPrice(0.97)">- 90%</n-button></td>
            <td><n-button @click="updateUpperPrice(0.9)">+ 90%</n-button></td>
          </tr>
        </table>
      </n-gi>
    </n-grid>
  </n-card>
</template>

<style scoped>
.custom-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  background-color: rgb(36, 2, 2);
  border: 1px solid #0bdd9e;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 999;
  display: flex;
  flex-direction: column;
}

.dialog-content {
  flex: 1;
}

.dialog-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.result-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  background-color: #3a14e4;
  border: 1px solid #0bdd9e;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 999;
  display: flex;
  flex-direction: column;
}

.buy-button {
  background-color: green;
}

.sell-button {
  background-color: red;
}
</style>
