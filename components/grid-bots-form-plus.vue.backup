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

// RSI values at bot creation (multi-timeframe)
const rsiValues = ref({
  '1m': null,
  '5m': null,
  '15m': null,
  '30m': null,
  '1h': null,
  '2h': null,
  '6h': null,
  '1d': null
});
const currentPrice = ref(null);

// Collapsed sections state
let showBasicConfig = ref(true);
let showAdvancedConfig = ref(false);
let showPriceActions = ref(true);
let showStrategies = ref(false);
let showRSIInfo = ref(true); // Show RSI section by default

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

      // Update current price from order book
      if (bestBid.value && bestAsk.value) {
        currentPrice.value = (bestBid.value + bestAsk.value) / 2;
      }
    }
  } catch (error) {
    console.error('Error fetching order book:', error);
  }
}

// Fetch RSI values for all timeframes
async function fetchRSIValues() {
  try {
    const exchange = currentExchange.value || 'coinbaseadvanced';
    const market = currentSymbol.value || 'LCX/USDC';
    const timeframes = ['1m', '5m', '15m', '30m', '1h', '2h', '6h', '1d'];

    console.log('📊 Fetching RSI values for bot creation:', { exchange, market });

    // Fetch all timeframes in parallel
    const promises = timeframes.map(async (tf) => {
      try {
        const response = await $fetch('/api/v1/calculateIndicators', {
          method: 'POST',
          body: {
            exchange: exchange,
            symbol: market,
            timeframe: tf
          },
          timeout: 60000
        });

        if (response.success && response.data && response.data.currentRSI) {
          rsiValues.value[tf] = response.data.currentRSI;
        }
      } catch (err) {
        console.error(`Error fetching RSI for ${tf}:`, err.message || err);
      }
    });

    await Promise.all(promises);
    console.log('✅ RSI values fetched:', rsiValues.value);
  } catch (error) {
    console.error('Error fetching RSI values:', error);
  }
}

// Fetch balance for the current symbol
async function fetchBalanceForSymbol() {
  try {
    const exchange = currentExchange.value || 'coinbaseadvanced';
    const apiKeyName = selectedApiKeys.value && selectedApiKeys.value.length > 0 ? selectedApiKeys.value[0] : null;

    if (!apiKeyName) {
      console.warn('⚠️ No API key selected for balance fetch');
      return;
    }

    console.log('💰 Fetching balance for bot creation:', { exchange, apiKeyName });

    const response = await $fetch('/api/v1/fetchBalance', {
      query: {
        userID: userID.value,
        exchange: exchange,
        apiKeyName: apiKeyName
      },
      timeout: 30000
    });

    if (response.success && response.data) {
      const balances = response.data;

      // Extract base and quote balances
      const baseBalance = balances[base] || { free: 0, total: 0 };
      const quoteBalance = balances[quote] || { free: 0, total: 0 };

      BalanceBase.value = baseBalance.free || 0;
      BalanceQuote.value = quoteBalance.free || 0;

      console.log('✅ Balance fetched:', {
        base: `${base}: ${BalanceBase.value}`,
        quote: `${quote}: ${BalanceQuote.value}`
      });
    } else {
      console.error('❌ Failed to fetch balance:', response);
    }
  } catch (error) {
    console.error('Error fetching balance:', error);
  }
}

// Helper to get RSI class for styling
function getRSIClass(rsi) {
  if (rsi === null || rsi === undefined) return '';
  if (rsi >= 70) return 'overbought';
  if (rsi <= 30) return 'oversold';
  if (rsi >= 50) return 'bullish';
  return 'bearish';
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

  // Calculate initial bot balance value (total balance in quote currency)
  const initialBotValue = currentPrice.value
    ? (parseFloat(BalanceQuote.value || 0) + (parseFloat(BalanceBase.value || 0) * currentPrice.value)).toString()
    : '0';

  console.log('💰 Initial Bot Balance:', {
    base: BalanceBase.value,
    quote: BalanceQuote.value,
    currentPrice: currentPrice.value,
    totalValue: initialBotValue
  });

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
    // RSI values at bot creation
    rsiAtCreation: rsiValues.value,
    priceAtCreation: currentPrice.value,
    // Initial balance snapshot
    BalanceBotStart: initialBotValue,
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
      BalanceBase: BalanceBase.value?.toString() || '0',
      BalanceQuote: BalanceQuote.value?.toString() || '0',
      BalanceBaseInUSD: BalanceBaseInUSD.value?.toString() || '0',
      BalanceQuoteInUSD: BalanceQuoteInUSD.value?.toString() || '0',
      BalanceBaseProfit: '0',
      BalanceQuoteProfit: '0',
      BalanceBotProfit: '0',
      BalanceBotValInitiala: initialBotValue
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

  // Fetch RSI values and balance when component mounts
  await fetchRSIValues();
  await fetchBalanceForSymbol();

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

    <!-- RSI Information -->
    <div class="config-section">
      <div class="section-header" @click="showRSIInfo = !showRSIInfo">
        <span>📊 RSI at Creation</span>
        <span class="collapse-icon">{{ showRSIInfo ? '▼' : '▶' }}</span>
      </div>
      <div v-show="showRSIInfo" class="section-content rsi-section">
        <div class="rsi-grid">
          <div
            v-for="(value, timeframe) in rsiValues"
            :key="timeframe"
            class="rsi-item"
            :class="getRSIClass(value)"
          >
            <span class="rsi-timeframe">{{ timeframe }}</span>
            <span class="rsi-value">{{ value !== null ? value.toFixed(2) : '-' }}</span>
          </div>
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

/* RSI Section Styles */
.rsi-section {
  padding: 6px !important;
}

.rsi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
}

.rsi-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 4px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.rsi-item:hover {
  transform: scale(1.05);
  border-color: rgba(0, 255, 255, 0.3);
}

.rsi-timeframe {
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 2px;
}

.rsi-value {
  font-size: 11px;
  font-weight: 800;
}

/* RSI Color Classes */
.rsi-item.bullish {
  border-color: rgba(16, 235, 4, 0.6);
  background: rgba(16, 235, 4, 0.15);
}

.rsi-item.bullish .rsi-value {
  color: #10eb04;
  text-shadow: 0 0 8px rgba(16, 235, 4, 0.6);
}

.rsi-item.bearish {
  border-color: rgba(233, 10, 21, 0.6);
  background: rgba(233, 10, 21, 0.15);
}

.rsi-item.bearish .rsi-value {
  color: #e90a15;
  text-shadow: 0 0 8px rgba(233, 10, 21, 0.6);
}

.rsi-item.overbought {
  border-color: rgba(255, 107, 0, 0.6);
  background: rgba(255, 107, 0, 0.15);
}

.rsi-item.overbought .rsi-value {
  color: #ff6b00;
  text-shadow: 0 0 8px rgba(255, 107, 0, 0.6);
}

.rsi-item.oversold {
  border-color: rgba(0, 149, 255, 0.6);
  background: rgba(0, 149, 255, 0.15);
}

.rsi-item.oversold .rsi-value {
  color: #0095ff;
  text-shadow: 0 0 8px rgba(0, 149, 255, 0.6);
}

/* Current Price Item */
.price-item.current {
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
}

.price-item.current .price-value {
  color: #00ffff;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
}
</style>
