<script setup>
import { useAppStore } from '~/stores/app.store';
import {ref, watch, computed, onMounted, onUnmounted} from "vue";
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async';

const app = useAppStore()

let userID = useCookie('userID');

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);

// API Keys - READ FROM STORE (set in grid-bots-list.vue)
const selectedApiKeys = computed(() => app.getSelectedApiKeys);

let base = currentSymbol.value.split('/')[0];
let quote = currentSymbol.value.split('/')[1];
const bestBid = ref(null);
const bestAsk = ref(null);
const manualLowerPrice = ref('');
const manualUpperPrice = ref('');

let name = ref(`gridBot_${generateRandomString(5)}`);
let strategyPicker = ref();
let strategyPickerOptions = ref([]);
let lowerPrice = ref('');
let upperPrice = ref('');
let amountType = ref('incrementalPercent');
let amountTypeOptions = [
  { value: 'quantityPerGrid', label:'Qty Per Grid'},
  { value: 'totalAmount', label:'Total Amount'},
  { value: 'incrementalPercent', label:'Incremental Amount'}
];
let amount = ref('');
let nrOfGrids = ref('');
let ordersSide = ref('buyOrSell');
let ordersSideOptions = [
  { value: 'buyOrSell', label: 'Buy & Sell' },
  { value: 'buyOnly', label: 'Buy Only' },
  { value: 'sellOnly', label: 'Sell Only' },
];
let incrementalPercentAmountBuy = ref('');
let incrementalPercentAmountSell = ref('');
let deviationPriceBuy = ref('');
let deviationPriceSell = ref('');
let deviationAmountBuy = ref('');
let deviationAmountSell = ref('');
let usePriceGroup = ref(false);
let priceGroupBuy = ref('');
let priceGroupSell = ref('');

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

let orderBookInterval = null;

// Collapsed sections state
let showBasicConfig = ref(true);
let showAdvancedConfig = ref(false);
let showPriceActions = ref(true);
let showStrategies = ref(false);

// Starea pentru a ține evidența dacă devierea inițială a fost aplicată sau nu
let initialDeviationApplied = false;

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

// Funcția pentru actualizarea prețului minim
function updateLowerPrice(deviationPercentage = 0.01) {
  if (bestBid.value) {
    const newValue = (bestBid.value * (1 - deviationPercentage)).toFixed(6).toString();
    console.log(`Update Lower Price Button Clicked. New Value with ${deviationPercentage * 100}% deviation:`, newValue);
    manualLowerPrice.value = newValue;
    lowerPrice.value = newValue;
  }
}

// Funcția pentru actualizarea prețului maxim
function updateUpperPrice(deviationPercentage = 0.01) {
  if (bestAsk.value) {
    const newValue = (bestAsk.value * (1 + deviationPercentage)).toFixed(6).toString();
    console.log(`Update Upper Price Button Clicked. New Value with ${deviationPercentage * 100}% deviation:`, newValue);
    manualUpperPrice.value = newValue;
    upperPrice.value = newValue;
  }
}

// Funcția pentru aplicarea devierii inițiale la încărcarea paginii
function applyInitialDeviation() {
  if (!initialDeviationApplied) {
    updateLowerPrice();
    updateUpperPrice();
    initialDeviationApplied = true;
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

async function selectStrategy() {
  console.log('selecting');

  let strategiesStore = JSON.parse(localStorage.getItem('strategiesStore'));

  for (let i = 0; i < strategiesStore.length; i++) {
    if (strategiesStore[i].name === strategyPicker.value) {
      console.log('strategy selected: ', strategiesStore[i]);

      name.value = strategiesStore[i].name;
      lowerPrice.value = strategiesStore[i].lowerPrice;
      upperPrice.value = strategiesStore[i].upperPrice;
      amountType.value = strategiesStore[i].amountType;
      amount.value = strategiesStore[i].amount;
      nrOfGrids.value = strategiesStore[i].nrOfGrids;
      ordersSide.value = strategiesStore[i].ordersSide;
      incrementalPercentAmountBuy.value = strategiesStore[i].incrementalPercentAmountBuy;
      incrementalPercentAmountSell.value = strategiesStore[i].incrementalPercentAmountSell;
      deviationPriceBuy.value = strategiesStore[i].deviationPriceBuy;
      deviationPriceSell.value = strategiesStore[i].deviationPriceSell;
      deviationAmountBuy.value = strategiesStore[i].deviationAmountBuy;
      deviationAmountSell.value = strategiesStore[i].deviationAmountSell;
      usePriceGroup.value = strategiesStore[i].usePriceGroup;
      priceGroupBuy.value = strategiesStore[i].priceGroupBuy;
      priceGroupSell.value = strategiesStore[i].priceGroupSell;
    }
  }
}

async function addStrategy() {
  console.log('adding');

  let strategiesStore = JSON.parse(localStorage.getItem('strategiesStore'));

  let newStrategy = {
    name: name.value,
    exchange: currentExchange.value,
    symbol: currentSymbol.value,
    lowerPrice: lowerPrice.value,
    upperPrice: upperPrice.value,
    amountType: amountType.value,
    amount: amount.value,
    nrOfGrids: nrOfGrids.value,
    ordersSide: ordersSide.value,
    incrementalPercentAmountBuy: incrementalPercentAmountBuy.value,
    incrementalPercentAmountSell: incrementalPercentAmountSell.value,
    deviationPriceBuy: deviationPriceBuy.value,
    deviationPriceSell: deviationPriceSell.value,
    deviationAmountBuy: deviationAmountBuy.value,
    deviationAmountSell: deviationAmountSell.value,
    usePriceGroup: usePriceGroup.value,
    priceGroupBuy: priceGroupBuy.value,
    priceGroupSell: priceGroupSell.value,
  };

  //push in store
  if (strategiesStore !== null) {
    if (strategiesStore.length > 0) {
      for (let i = 0; i < strategiesStore.length ; i++) {
        console.log('?????: ', strategiesStore[i].name,  newStrategy.name);
        if (strategiesStore[i].name !== newStrategy.name) {
          strategiesStore.push(newStrategy);
        }
      }
    } else {
      strategiesStore.push(newStrategy);
    }
  } else {
    strategiesStore = [newStrategy];
  }

  localStorage.setItem('strategiesStore', JSON.stringify(strategiesStore));

  //push in options list
  strategyPickerOptions.value.push({
    value: newStrategy.name,
    label: newStrategy.name
  });

  //set in select
  strategyPicker.value = newStrategy.name;
}

async function editStrategy() {
  console.log('editing');

  let strategiesStore = JSON.parse(localStorage.getItem('strategiesStore'));

  if (strategiesStore !== null) {
    for (let i = 0; i < strategiesStore.length ; i++) {
      if (strategiesStore[i].name === strategyPicker.value) {
        strategiesStore[i].lowerPrice = lowerPrice.value;
        strategiesStore[i].upperPrice = upperPrice.value;
        strategiesStore[i].amountType = amountType.value;
        strategiesStore[i].amount = amount.value;
        strategiesStore[i].nrOfGrids = nrOfGrids.value;
        strategiesStore[i].ordersSide = ordersSide.value;
        strategiesStore[i].incrementalPercentAmountBuy = incrementalPercentAmountBuy.value;
        strategiesStore[i].incrementalPercentAmountSell = incrementalPercentAmountSell.value;
        strategiesStore[i].deviationPriceBuy = deviationPriceBuy.value;
        strategiesStore[i].deviationPriceSell = deviationPriceSell.value;
        strategiesStore[i].deviationAmountBuy = deviationAmountBuy.value;
        strategiesStore[i].deviationAmountSell = deviationAmountSell.value;
        strategiesStore[i].usePriceGroup = usePriceGroup.value;
        strategiesStore[i].priceGroupBuy = priceGroupBuy.value;
        strategiesStore[i].priceGroupSell = priceGroupSell.value;
      }
    }
  }

  localStorage.setItem('strategiesStore', JSON.stringify(strategiesStore));
}

async function deleteStrategy() {
  console.log('deleting');

  let strategiesStore = JSON.parse(localStorage.getItem('strategiesStore'));

  //deleting from store
  if (strategiesStore !== null) {
    for (let i = 0; i < strategiesStore.length ; i++) {
      if (strategiesStore[i].name === strategyPicker.value) {
        strategiesStore.splice(i, 1);
      }
    }
  }

  //deleting from strategy picker options
  for (let i = 0; i < strategyPickerOptions.value.length ; i++) {
    if (strategyPickerOptions.value[i].label === strategyPicker.value) {
      strategyPickerOptions.value.splice(i, 1);
    }
  }

  //deleting from strategy picker
  strategyPicker.value = '';

  //reset form
  lowerPrice.value = '';
  upperPrice.value = '';
  amountType.value = 'quantityPerGrid';
  amount.value = '';
  nrOfGrids.value = '';
  ordersSide.value = 'buyOrSell';
  incrementalPercentAmountBuy.value = '';
  incrementalPercentAmountSell.value = '';
  deviationPriceBuy.value = '';
  deviationPriceSell.value = '';
  deviationAmountBuy.value = '';
  deviationAmountSell.value = '';
  usePriceGroup.value = '';
  priceGroupBuy.value = '';
  priceGroupSell.value = '';

  localStorage.setItem('strategiesStore', JSON.stringify(strategiesStore));
}

async function deleteAllStrategies() {
  console.log('deleting all strategies');

  let strategiesStore = [];
  localStorage.setItem('strategiesStore', JSON.stringify(strategiesStore));

  strategyPickerOptions.value = [];
  strategyPicker.value = '';
}

async function createGridBot(){
  if (!selectedApiKeys.value || selectedApiKeys.value.length === 0) {
    console.error('No API Keys selected');
    return;
  }

  console.log('🔑 Creating GridBot with API Keys:', selectedApiKeys.value);

  let data = {
    userID: userID.value,
    name: name.value,
    exchange: currentExchange.value,
    symbol: currentSymbol.value,
    lowerPrice: lowerPrice.value,
    upperPrice: upperPrice.value,
    amountType: amountType.value,
    amount: amount.value,
    nrOfGrids: nrOfGrids.value,
    ordersSide: ordersSide.value,
    incrementalPercentAmountBuy:incrementalPercentAmountBuy.value,
    incrementalPercentAmountSell:incrementalPercentAmountSell.value,
    apiKeyNames: selectedApiKeys.value,
      config: {
        deviationPriceBuy: deviationPriceBuy.value,
        deviationPriceSell: deviationPriceSell.value,
        deviationAmountBuy: deviationAmountBuy.value,
        deviationAmountSell: deviationAmountSell.value,
        usePriceGroup: usePriceGroup.value,
        priceGroupBuy: priceGroupBuy.value,
        priceGroupSell: priceGroupSell.value
    },
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

  let response = await $fetch( '/api/v1/createGridBot', {
    method: 'POST',
    body: data
  } );

  BotX1.value = 'ComandaX1';
  BotX2.value = 'ComandaX2';
}

onMounted(async () => {
  orderBookInterval = setIntervalAsync(fetchOrderBookPooling, 500);
  applyInitialDeviation();

  let strategiesStore = JSON.parse(localStorage.getItem('strategiesStore'));

  if (strategiesStore !== null) {
    for (let i = 0; i < strategiesStore.length; i++) {
      strategyPickerOptions.value.push({
        value: strategiesStore[i].name,
        label: strategiesStore[i].name
      });
    }
  }
});

onUnmounted(() => {
  clearIntervalAsync(orderBookInterval);
});

</script>

<template>
  <div class="gridbot-form-container">
    <!-- Compact Header -->
    <div class="form-header">
      <span class="header-icon">⚙️</span>
      <span class="header-title">Grid Bot Config</span>
    </div>

    <!-- Current Prices Display -->
    <div class="prices-display">
      <div class="price-item bid">
        <span class="price-label">BID</span>
        <span class="price-value">{{ bestBid || '-' }}</span>
      </div>
      <div class="price-item ask">
        <span class="price-label">ASK</span>
        <span class="price-value">{{ bestAsk || '-' }}</span>
      </div>
    </div>

    <!-- Basic Configuration -->
    <div class="config-section">
      <div class="section-header" @click="showBasicConfig = !showBasicConfig">
        <span>📋 Basic</span>
        <span class="collapse-icon">{{ showBasicConfig ? '▼' : '▶' }}</span>
      </div>
      <div v-show="showBasicConfig" class="section-content">
        <div class="form-row">
          <label>Bot Name</label>
          <n-input v-model:value="name" size="tiny" placeholder="Bot name" />
        </div>
        <div class="form-row">
          <label>Lower Price</label>
          <n-input v-model:value="lowerPrice" size="tiny" :placeholder="quote">
            <template #suffix>{{ quote }}</template>
          </n-input>
        </div>
        <div class="form-row">
          <label>Upper Price</label>
          <n-input v-model:value="upperPrice" size="tiny" :placeholder="quote">
            <template #suffix>{{ quote }}</template>
          </n-input>
        </div>
        <div class="form-row">
          <label>Amount Type</label>
          <n-select v-model:value="amountType" :options="amountTypeOptions" size="tiny" />
        </div>
        <div class="form-row">
          <label>Amount</label>
          <n-input v-model:value="amount" size="tiny" :placeholder="quote">
            <template #suffix>{{ quote }}</template>
          </n-input>
        </div>
        <div class="form-row">
          <label>Nr of Grids</label>
          <n-input v-model:value="nrOfGrids" size="tiny" placeholder="10" />
        </div>
        <div class="form-row">
          <label>Orders Side</label>
          <n-select v-model:value="ordersSide" :options="ordersSideOptions" size="tiny" />
        </div>
      </div>
    </div>

    <!-- Advanced Configuration -->
    <div class="config-section">
      <div class="section-header" @click="showAdvancedConfig = !showAdvancedConfig">
        <span>🔧 Advanced</span>
        <span class="collapse-icon">{{ showAdvancedConfig ? '▼' : '▶' }}</span>
      </div>
      <div v-show="showAdvancedConfig" class="section-content">
        <div class="form-row">
          <label>Inc % Buy</label>
          <n-input v-model:value="incrementalPercentAmountBuy" size="tiny" placeholder="1.0">
            <template #suffix>%</template>
          </n-input>
        </div>
        <div class="form-row">
          <label>Inc % Sell</label>
          <n-input v-model:value="incrementalPercentAmountSell" size="tiny" placeholder="1.0">
            <template #suffix>%</template>
          </n-input>
        </div>
        <div class="form-row">
          <label>Dev Price Buy</label>
          <n-input v-model:value="deviationPriceBuy" size="tiny" placeholder="1.0">
            <template #suffix>%</template>
          </n-input>
        </div>
        <div class="form-row">
          <label>Dev Price Sell</label>
          <n-input v-model:value="deviationPriceSell" size="tiny" placeholder="1.0">
            <template #suffix>%</template>
          </n-input>
        </div>
        <div class="form-row">
          <label>Dev Amt Buy</label>
          <n-input v-model:value="deviationAmountBuy" size="tiny" placeholder="0.9">
            <template #suffix>%</template>
          </n-input>
        </div>
        <div class="form-row">
          <label>Dev Amt Sell</label>
          <n-input v-model:value="deviationAmountSell" size="tiny" placeholder="0.9">
            <template #suffix>%</template>
          </n-input>
        </div>
        <div class="form-row">
          <label>Price Group Buy</label>
          <n-input v-model:value="priceGroupBuy" size="tiny" :placeholder="quote">
            <template #suffix>{{ quote }}</template>
          </n-input>
        </div>
        <div class="form-row">
          <label>Price Group Sell</label>
          <n-input v-model:value="priceGroupSell" size="tiny" :placeholder="quote">
            <template #suffix>{{ quote }}</template>
          </n-input>
        </div>
        <div class="form-row checkbox-row">
          <n-checkbox v-model:checked="usePriceGroup" size="small">
            Use Price Group
          </n-checkbox>
        </div>
      </div>
    </div>

    <!-- Price Actions -->
    <div class="config-section">
      <div class="section-header" @click="showPriceActions = !showPriceActions">
        <span>💰 Quick Price</span>
        <span class="collapse-icon">{{ showPriceActions ? '▼' : '▶' }}</span>
      </div>
      <div v-show="showPriceActions" class="section-content">
        <div class="price-actions">
          <div class="action-group">
            <span class="action-label">Lower (-)</span>
            <div class="action-buttons">
              <n-button size="tiny" @click="updateLowerPrice(0.01)">1%</n-button>
              <n-button size="tiny" @click="updateLowerPrice(0.02)">2%</n-button>
              <n-button size="tiny" @click="updateLowerPrice(0.05)">5%</n-button>
              <n-button size="tiny" @click="updateLowerPrice(0.1)">10%</n-button>
              <n-button size="tiny" @click="updateLowerPrice(0.2)">20%</n-button>
              <n-button size="tiny" @click="updateLowerPrice(0.5)">50%</n-button>
            </div>
          </div>
          <div class="action-group">
            <span class="action-label">Upper (+)</span>
            <div class="action-buttons">
              <n-button size="tiny" type="error" @click="updateUpperPrice(0.01)">1%</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(0.02)">2%</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(0.05)">5%</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(0.1)">10%</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(0.2)">20%</n-button>
              <n-button size="tiny" type="error" @click="updateUpperPrice(0.5)">50%</n-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Strategies Management -->
    <div class="config-section">
      <div class="section-header" @click="showStrategies = !showStrategies">
        <span>💾 Strategies</span>
        <span class="collapse-icon">{{ showStrategies ? '▼' : '▶' }}</span>
      </div>
      <div v-show="showStrategies" class="section-content">
        <div class="form-row">
          <n-select
            v-model:value="strategyPicker"
            :options="strategyPickerOptions"
            @update:value="selectStrategy"
            size="tiny"
            placeholder="Select strategy"
          />
        </div>
        <div class="strategy-buttons">
          <n-button size="tiny" @click="addStrategy">Add</n-button>
          <n-button size="tiny" @click="editStrategy">Edit</n-button>
          <n-button size="tiny" @click="deleteStrategy">Del</n-button>
          <n-button size="tiny" @click="deleteAllStrategies">Clear</n-button>
        </div>
      </div>
    </div>

    <!-- Create Button -->
    <div class="create-button-wrapper">
      <n-button type="primary" size="small" block @click="createGridBot">
        🚀 Create Grid Bot
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.gridbot-form-container {
  background: #1a1f2e;
  border: 1px solid #2a3441;
  border-radius: 4px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 11px;
}

/* Header */
.form-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: #0f1419;
  border-radius: 3px;
  border: 1px solid #2a3441;
}

.header-icon {
  font-size: 14px;
}

.header-title {
  font-size: 12px;
  font-weight: 600;
  color: #e0e0e0;
}

/* Prices Display */
.prices-display {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.price-item {
  padding: 6px;
  background: #0f1419;
  border-radius: 3px;
  border: 1px solid #2a3441;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.price-label {
  font-size: 9px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
}

.price-value {
  font-size: 11px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.price-item.bid .price-value {
  color: #4ade80;
}

.price-item.ask .price-value {
  color: #f87171;
}

/* Config Sections */
.config-section {
  background: #0f1419;
  border: 1px solid #2a3441;
  border-radius: 3px;
  overflow: hidden;
}

.section-header {
  padding: 6px 8px;
  background: #1a1f2e;
  border-bottom: 1px solid #2a3441;
  cursor: pointer;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  transition: background 0.2s;
}

.section-header:hover {
  background: #242936;
}

.collapse-icon {
  font-size: 9px;
  color: #666;
}

.section-content {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Form Rows */
.form-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.form-row label {
  font-size: 9px;
  color: #888;
  font-weight: 600;
}

.checkbox-row {
  padding-top: 4px;
}

/* Price Actions */
.price-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.action-label {
  font-size: 9px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
}

/* Strategy Buttons */
.strategy-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}

/* Create Button */
.create-button-wrapper {
  margin-top: 4px;
}

/* Deep Overrides for Naive UI */
:deep(.n-input) {
  font-size: 10px;
}

:deep(.n-input__input-el) {
  font-size: 10px;
  padding: 4px 6px;
}

:deep(.n-input__suffix) {
  font-size: 9px;
  color: #888;
}

:deep(.n-select) {
  font-size: 10px;
}

:deep(.n-base-selection) {
  font-size: 10px;
}

:deep(.n-base-selection-label) {
  font-size: 10px;
}

:deep(.n-button) {
  font-size: 9px;
  padding: 4px 6px;
  height: auto;
}

:deep(.n-button--tiny-type) {
  font-size: 9px;
}

:deep(.n-checkbox) {
  font-size: 10px;
}

:deep(.n-checkbox__label) {
  font-size: 10px;
}

/* Scrollbar */
.gridbot-form-container::-webkit-scrollbar {
  width: 6px;
}

.gridbot-form-container::-webkit-scrollbar-thumb {
  background-color: rgba(128, 128, 128, 0.3);
  border-radius: 3px;
}

.gridbot-form-container::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>
