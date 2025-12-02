<script setup>
import { useAppStore } from '~/stores/app.store';
import { ref, computed, onMounted, onUnmounted } from "vue";
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async';
import BidAskCalculator from '~/components/BidAskCalculator.vue';

const app = useAppStore();

// Collapsible state
const configCollapsed = ref(false);
const calculatorCollapsed = ref(false);

let userID = useCookie('userID');

// Use global values from store
let currentExchange = computed(() => app.getUserSelectedExchange);
let currentSymbol = computed(() => app.getUserSelectedMarket);
let selectedApiKey = computed(() => app.getSelectedApiKey);

let base = computed(() => currentSymbol.value.split('/')[0]);
let quote = computed(() => currentSymbol.value.split('/')[1]);

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
});

onUnmounted(() => {
  clearIntervalAsync(orderBookInterval);
  clearIntervalAsync(userBalanceInterval);
});

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
    baseBalanceFree.value = response.data.free?.[base.value] || 0;
    baseBalanceUsed.value = response.data.used?.[base.value] || 0;
    baseBalanceTotal.value = response.data.total?.[base.value] || 0;
    quoteBalanceFree.value = response.data.free?.[quote.value] || 0;
    quoteBalanceUsed.value = response.data.used?.[quote.value] || 0;
    quoteBalanceTotal.value = response.data.total?.[quote.value] || 0;
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
  <!-- Bot Configuration Card - Compact & Modern -->
  <n-card size="small" style="margin-bottom: 8px; background: linear-gradient(135deg, #1a1f2e 0%, #2a3441 100%);">
    <template #header>
      <div @click="configCollapsed = !configCollapsed" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 13px; font-weight: 700; color: #10eb04;">⚡ Scalp1ng Bot Configuration</span>
        <n-icon size="16">
          <svg v-if="!configCollapsed" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 17l5-5-5-5v10z"/>
          </svg>
        </n-icon>
      </div>
    </template>

    <n-collapse-transition :show="!configCollapsed">
      <n-grid x-gap="8" :cols="3" item-responsive>
        <!-- Column 1 -->
        <n-gi>
          <n-space vertical :size="4">
            <n-input v-model:value="name" type="text" placeholder="Bot name" size="small">
              <template #prefix><span style="color: #eb06eb;">📊</span></template>
            </n-input>
            <n-input v-model:value="lowerPrice" type="text" placeholder="Lower Price" size="small">
              <template #prefix><span style="color: #10eb04;">🟢</span></template>
              <template #suffix><span style="color: #888; font-size: 10px;">{{ quote }}</span></template>
            </n-input>
          </n-space>
        </n-gi>

        <!-- Column 2 -->
        <n-gi>
          <n-space vertical :size="4">
            <n-input v-model:value="upperPrice" type="text" placeholder="Upper Price" size="small">
              <template #prefix><span style="color: #f52a09;">🔴</span></template>
              <template #suffix><span style="color: #888; font-size: 10px;">{{ quote }}</span></template>
            </n-input>
            <n-input v-model:value="amount" type="text" placeholder="Amount" size="small">
              <template #prefix><span style="color: #05f5ed;">💰</span></template>
              <template #suffix><span style="color: #888; font-size: 10px;">{{ quote }}</span></template>
            </n-input>
          </n-space>
        </n-gi>

        <!-- Column 3 -->
        <n-gi>
          <n-space vertical :size="4">
            <n-input v-model:value="nrOfGrids" type="text" placeholder="Nr of grids" size="small">
              <template #prefix><span style="color: #f5a623;">📐</span></template>
            </n-input>
            <n-input v-model:value="BalanceBotStart" type="text" placeholder="Balance Start" size="small">
              <template #prefix><span style="color: #eadb11;">💵</span></template>
            </n-input>
          </n-space>
        </n-gi>
      </n-grid>

      <!-- Action Buttons -->
      <n-space :size="6" style="margin-top: 8px;">
        <n-button type="success" @click="createBuyOnlyBot" size="small" style="flex: 1;">
          📈 Buy Only
        </n-button>
        <n-button type="error" @click="createSellOnlyBot" size="small" style="flex: 1;">
          📉 Sell Only
        </n-button>
      </n-space>
    </n-collapse-transition>
  </n-card>

  <!-- BidAsk Calculator Card - Collapsible -->
  <div style="margin-bottom: 12px;">
    <n-card>
      <template #header>
        <div @click="calculatorCollapsed = !calculatorCollapsed" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
          <span>Bid/Ask Calculator</span>
          <n-icon>
            <svg v-if="!calculatorCollapsed" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 17l5-5-5-5v10z"/>
            </svg>
          </n-icon>
        </div>
      </template>

      <n-collapse-transition :show="!calculatorCollapsed">
        <BidAskCalculator
          :bestBid="bestBid"
          :bestAsk="bestAsk"
          @updateLowerPrice="updateLowerPrice"
          @updateUpperPrice="updateUpperPrice"
        />
      </n-collapse-transition>
    </n-card>
  </div>
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
