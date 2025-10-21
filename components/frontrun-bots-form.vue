<script setup>
import { useAppStore } from '~/stores/app.store';
import {ref, h, watch} from "vue";
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async';
const app = useAppStore()

let userID = useCookie('userID');

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);

let base = currentSymbol.value.split('/')[0];
let quote = currentSymbol.value.split('/')[1];
const bestBid = ref(null);
const bestAsk = ref(null);
const manualLowerPrice = ref('');
const manualUpperPrice = ref('');

// API Key selector
let availableApiKeys = ref([]);
let selectedApiKey = ref(null);
let loadingApiKeys = ref(false);
let apiKeyColors = ref({}); // Store colors for each API key

// Balance display
let balanceBaseFree = ref(0);
let balanceBaseUsed = ref(0);
let balanceBaseTotal = ref(0);
let balanceQuoteFree = ref(0);
let balanceQuoteUsed = ref(0);
let balanceQuoteTotal = ref(0);
let loadingBalance = ref(false);

let name = ref(`FrontRunBot_${generateRandomString(5)}`);


let strategyPicker = ref('1st');
let previousStrategy = ref('1st');

// Stări pentru dezactivarea butoanelor "Buy Only" și "Sell Only"
let isBuyDisabled = ref(false);
let isSellDisabled = ref(false);

function selectStrategy(strategy) {
  const wasBuy = previousStrategy.value.startsWith('BUY');
  const wasSell = previousStrategy.value.startsWith('SELL');
  const isBuy = strategy.startsWith('BUY');
  const isSell = strategy.startsWith('SELL');

  // Swap prices only when switching between BUY and SELL strategies
  if ((wasBuy && isSell) || (wasSell && isBuy)) {
    const tempLower = lowerPrice.value;
    const tempUpper = upperPrice.value;
    lowerPrice.value = tempUpper;
    upperPrice.value = tempLower;
  }

  strategyPicker.value = strategy;
  previousStrategy.value = strategy;

  // Dezactivăm butoanele "Buy Only" și "Sell Only" în funcție de strategia selectată
  if (isBuy) {
    isSellDisabled.value = true;
    isBuyDisabled.value = false;
  } else if (isSell) {
    isBuyDisabled.value = true;
    isSellDisabled.value = false;
  } else {
    isBuyDisabled.value = false;
    isSellDisabled.value = false;
  }
}


let lowerPrice = ref('');
let upperPrice = ref('');
let PriceStart = ref('');
let amountPriceStart = ref('');
let amountType = ref('incrementalPercent');
let amountTypeOptions = [

  { value: 'totalAmount', label:'Total Amount'},
  { value: 'incrementalPercent', label:'Incremental Amount'}
];
let amount = ref('');
let nrOfGrids = ref('');
let ordersSide = ref('buyOrSell');
let ordersSideOptions = [
  { value: 'buyOnly', label: 'Buy Only' },
  { value: 'sellOnly', label: 'Sell Only' },
];
let incrementalPercentAmountBuy = ref('');
let incrementalPercentAmountSell = ref('');

let ActiveRANGE = ref(false);

// Collapse state for sections - all start collapsed
let showBotConfig = ref(false);
let showPriceAdjust = ref(false);
let showStrategies = ref(false);
let showGridConfig = ref(false);
let showIncremental = ref(false);

let orderBookInterval = null;

// Starea pentru a ține evidența dacă devierea inițială a fost aplicată sau nu
let initialDeviationApplied = false;


function setAmount(value) {
  amount.value = value.toString();
  amountPriceStart.value = (value * 10).toString();  // Setează Amount Price Start la de 10 ori valoarea lui Amount
}


function setNrGrids(value) {
  nrOfGrids.value = value.toString();            // Setează nrOfGrids la valoarea specificată
  amount.value = '1';                            // Setează amount la 1, indiferent de valoarea nrOfGrids
  amountPriceStart.value = (value - 1).toString(); // Setează amountPriceStart la nrGrids - 1
}

function setIncrementalAmounts(buyAmount, sellAmount) {
  incrementalPercentAmountBuy.value = buyAmount.toString();  // Setează Incremental % Amount Buy
  incrementalPercentAmountSell.value = sellAmount.toString(); // Setează Incremental % Amount Sell
}


onMounted(async () => {
  orderBookInterval = setIntervalAsync(fetchOrderBookPooling, 500);
  await loadApiKeys();
});

onUnmounted(() => {
  clearIntervalAsync(orderBookInterval);
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

      // Load balance for the first API key
      await fetchBalance();
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

// Fetch balance for selected API key
async function fetchBalance() {
  if (!selectedApiKey.value) {
    balanceBaseFree.value = 0;
    balanceBaseUsed.value = 0;
    balanceBaseTotal.value = 0;
    balanceQuoteFree.value = 0;
    balanceQuoteUsed.value = 0;
    balanceQuoteTotal.value = 0;
    return;
  }

  loadingBalance.value = true;
  try {
    const response = await $fetch('/api/v1/fetchBalance', {
      query: {
        userID: userID.value,
        exchange: currentExchange.value,
        apiKeyName: selectedApiKey.value
      }
    });

    if (response.data) {
      balanceBaseFree.value = response.data.free?.[base] || 0;
      balanceBaseUsed.value = response.data.used?.[base] || 0;
      balanceBaseTotal.value = response.data.total?.[base] || 0;
      balanceQuoteFree.value = response.data.free?.[quote] || 0;
      balanceQuoteUsed.value = response.data.used?.[quote] || 0;
      balanceQuoteTotal.value = response.data.total?.[quote] || 0;
    }
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    balanceBaseFree.value = 0;
    balanceBaseUsed.value = 0;
    balanceBaseTotal.value = 0;
    balanceQuoteFree.value = 0;
    balanceQuoteUsed.value = 0;
    balanceQuoteTotal.value = 0;
  } finally {
    loadingBalance.value = false;
  }
}

// Watch for API key changes and reload balance
watch(selectedApiKey, async (newKey) => {
  if (newKey) {
    await fetchBalance();
  }
});

// Funcție pentru stabilirea numărului de zecimale în funcție de simbol
function getDecimalPlacesForSymbol(symbol) {
  if (symbol === 'JOB') {
    return 6; // JOB folosește 6 zecimale
  } else if (symbol === 'LCX') {
    return 3; // LCX folosește 3 zecimale
  } else {
    return 6; // Implicit, folosim 6 zecimale pentru alte simboluri
  }
}

// Funcția pentru actualizarea prețului minim
function updateLowerPrice(deviationPercentage = 0.01) {
  if (bestBid.value) {
    const decimalPlaces = getDecimalPlacesForSymbol(base); // Obține numărul de zecimale pe baza simbolului
    const newValue = (bestBid.value * (1 - deviationPercentage)).toFixed(decimalPlaces).toString();
    console.log(`Update Lower Price Button Clicked. New Value with ${deviationPercentage * 100}% deviation:`, newValue);
    manualLowerPrice.value = newValue;
    //  și lowerPrice automat
    lowerPrice.value = newValue;
  }
}

// Funcția pentru actualizarea prețului maxim
function updateUpperPrice(deviationPercentage = 0.01) {
  if (bestAsk.value) {
    const decimalPlaces = getDecimalPlacesForSymbol(base); // Obține numărul de zecimale pe baza simbolului
    const newValue = (bestAsk.value * (1 + deviationPercentage)).toFixed(decimalPlaces).toString();
    console.log(`Update Upper Price Button Clicked. New Value with ${deviationPercentage * 100}% deviation:`, newValue);
    manualUpperPrice.value = newValue;
    //  și upperPrice automat
    upperPrice.value = newValue;
  }
}


// Funcția pentru aplicarea devierii inițiale la încărcarea paginii
function applyInitialDeviation() {
  if (!initialDeviationApplied) {
    updateLowerPrice();
    updateUpperPrice();
    initialDeviationApplied = true; // Marchează devierea inițială ca aplicată
  }
}
// Funcția pentru gestionarea introducerii de date în celula pentru prețul minim
function handleManualLowerPriceInput(event) {
  const newValue = event.target.innerText.trim();
  if (/^\d*\.?\d*$/.test(newValue)) {
    manualLowerPrice.value = newValue;
  } else {
    event.target.innerText = manualLowerPrice.value; // Restaură valoarea anterioară
  }
}

// Funcția pentru gestionarea introducerii de date în celula pentru prețul maxim
function handleManualUpperPriceInput(event) {
  const newValue = event.target.innerText.trim();
  if (/^\d*\.?\d*$/.test(newValue)) {
    manualUpperPrice.value = newValue;
  } else {
    event.target.innerText = manualUpperPrice.value; // Restaură valoarea anterioară
  }
}
function resetFields() {
  name.value = `FrontRunBot_${generateRandomString(5)}`;

  isBuyDisabled.value = false;
  isSellDisabled.value = false;
  lowerPrice.value = '';
  upperPrice.value = '';
  PriceStart.value = '';
  amountPriceStart.value = '';
  amount.value = '';
  nrOfGrids.value = '';
  ordersSide.value = 'buyOrSell';
  incrementalPercentAmountBuy.value = '';
  incrementalPercentAmountSell.value = '';
  ActiveRANGE.value = false;
}

// Funcția de setare a valorilor implicite bazate pe strategii
function setStrategyDefaults(strategy) {
  const strategyMapping = {
    '3buySELLGRID': { lowerPercent: 0.001, upperPercent: 0.2 },
    '4sellBUYGRID': { lowerPercent: 0.001, upperPercent: -0.2 },
    'BUY--->SELLGRID2%': { lowerPercent: 0.001, upperPercent: 0.02 },
    'SELL--->BUYGRID2%': { lowerPercent: 0.001, upperPercent: -0.02 },
    'BUY--->SELLGRID5%': { lowerPercent: 0.001, upperPercent: 0.05 },
    'SELL--->BUYGRID5%': { lowerPercent: 0.001, upperPercent: -0.05 },
    'BUY--->SELLGRID7%': { lowerPercent: 0.001, upperPercent: 0.07 },
    'SELL--->BUYGRID7%': { lowerPercent: 0.001, upperPercent: -0.07 },
    'BUY--->SELLGRID10%': { lowerPercent: 0.001, upperPercent: 0.1 },
    'SELL--->BUYGRID10%': { lowerPercent: 0.001, upperPercent: -0.1 },
    'BUY--->SELLGRID20%': { lowerPercent: 0.001, upperPercent: 0.2 },
    'SELL--->BUYGRID20%': { lowerPercent: 0.001, upperPercent: -0.2 },
    'BUY--->SELLGRID50%': { lowerPercent: 0.001, upperPercent: 0.5 },
    'SELL--->BUYGRID50%': { lowerPercent: 0.001, upperPercent: -0.5 },
    'BUY--->SELLGRID80%': { lowerPercent: 0.001, upperPercent: 0.80 },
    'SELL--->BUYGRID80%': { lowerPercent: 0.001, upperPercent: -0.80 }
  };

  // Modificăm și setarea strategiilor pentru a lua în considerare numărul de zecimale
if (strategy in strategyMapping) {
  const { lowerPercent, upperPercent } = strategyMapping[strategy];
  const decimalPlaces = getDecimalPlacesForSymbol(base); // Obține numărul de zecimale pe baza simbolului

  if (strategy.startsWith('BUY')) {
    if (bestBid.value) {
      PriceStart.value = bestBid.value;
      amountPriceStart.value = '2';
      lowerPrice.value = (bestBid.value * (1 + lowerPercent)).toFixed(decimalPlaces);  // Folosește numărul de zecimale corect
      upperPrice.value = (bestBid.value * (1 + upperPercent)).toFixed(decimalPlaces);  // Folosește numărul de zecimale corect
      amountType.value = 'incrementalPercent';
      amount.value = '1';
      nrOfGrids.value = '25';
      ordersSide.value = 'buyOnly';
      incrementalPercentAmountBuy.value = '0.11';
      incrementalPercentAmountSell.value = '0.11';
      ActiveRANGE.value = false;
    }
  } else if (strategy.startsWith('SELL')) {
    if (bestAsk.value) {
      PriceStart.value = bestAsk.value;
      amountPriceStart.value = '2';
      // For SELL strategy: lower price = current - deviation, upper price = current + deviation
      // upperPercent is negative (e.g., -0.05), so we use Math.abs() to make it positive
      lowerPrice.value = (bestAsk.value * (1 + upperPercent)).toFixed(decimalPlaces);  // Lower (smaller value)
      upperPrice.value = (bestAsk.value * (1 + lowerPercent)).toFixed(decimalPlaces);  // Upper (larger value)
      amountType.value = 'incrementalPercent';
      amount.value = '1';
      nrOfGrids.value = '25';
      ordersSide.value = 'sellOnly';
      incrementalPercentAmountBuy.value = '0.11';
      incrementalPercentAmountSell.value = '0.11';
      ActiveRANGE.value = false;
    }
  }
} else if (strategy === '1st') {
  // Default logic for '1st' strategy
  const decimalPlaces = getDecimalPlacesForSymbol(base); // Obține numărul de zecimale pe baza simbolului
  PriceStart.value = '0.1';
  amountPriceStart.value = '2';
  lowerPrice.value = '0.1'.toFixed(decimalPlaces);
  upperPrice.value = '0.1'.toFixed(decimalPlaces);
  amountType.value = 'incrementalPercent';
  amount.value = '1';
  nrOfGrids.value = '25';
  ordersSide.value = 'buyOnly';
  incrementalPercentAmountBuy.value = '0.11';
  incrementalPercentAmountSell.value = '0.11';
  ActiveRANGE.value = false;
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

function setAccumulation(buyIncrement, sellIncrement) {
  incrementalPercentAmountBuy.value = buyIncrement.toString();  // Cumpăr mai mult (acumulare)
  incrementalPercentAmountSell.value = sellIncrement.toString(); // Vând mai puțin (acumulare)
}

function setDistribution(buyIncrement, sellIncrement) {
  incrementalPercentAmountBuy.value = buyIncrement.toString();  // Cumpăr mai puțin (distribuție)
  incrementalPercentAmountSell.value = sellIncrement.toString(); // Vând mai mult (distribuție)
}



watch(strategyPicker, (newStrategy) => {
  setStrategyDefaults(newStrategy);
});

// Funcția pentru activarea tuturor butoanelor
function enableAllButtons() {
  isBuyDisabled.value = false;
  isSellDisabled.value = false;
}

async function createBuyOnlyBot() {
  await createBot('buyOnly');
}

async function createSellOnlyBot() {
  await createBot('sellOnly');
}

async function createBot(action) {
  console.log('Creating front run bot with action:', action);

  // Validate API key is selected
  if (!selectedApiKey.value) {
    console.error('Please select an API key before creating bot');
    return;
  }

  try {
    ordersSide.value = action === 'buyOnly' ? 'buyOnly' : 'sellOnly'; // Set ordersSide based on the action

    let data = {
    userID: userID.value,
    name: name.value,
    exchange: currentExchange.value,
    symbol: currentSymbol.value,
    PriceStart: PriceStart.value,
    amountPriceStart: amountPriceStart.value,
    lowerPrice: lowerPrice.value,
    upperPrice: upperPrice.value,
    amountType: amountType.value,
    amount: amount.value,
    nrOfGrids: nrOfGrids.value,
    ordersSide: ordersSide.value,
    incrementalPercentAmountBuy: incrementalPercentAmountBuy.value,
    incrementalPercentAmountSell: incrementalPercentAmountSell.value,
    apiKeyName: selectedApiKey.value,
  };

  // console.log(data);

  let response = await $fetch( '/api/v1/createFrontRunBot', {
    method: 'POST',
    body: data
  } );
  console.log('Response from server:', response);
  } catch (error) {
    console.error('Error creating front run bot:', error);
  }
}



onMounted(() => {
  applyInitialDeviation(); // Apelați funcția applyInitialDeviation
  fetchOrderBookPooling(); // Inițializare pentru lowerPrice și upperPrice

  // localStorage.setItem('test', '123');



  // Restul codului pe care l-ați furnizat înainte poate rămâne aici
  return {
    bestBid,
    bestAsk,
    manualLowerPrice,
    manualUpperPrice,
    lowerPrice,
    upperPrice,
    amountType,
    amountTypeOptions,
    amount,
    nrOfGrids,
    ordersSide,
    ordersSideOptions,
    incrementalPercentAmountBuy,
    incrementalPercentAmountSell,

    updateLowerPrice,
    updateUpperPrice,
    handleManualLowerPriceInput,
    handleManualUpperPriceInput,
  };
});


</script>

<template>
<div class="frontrun-container">
  <!-- All Configuration Cards in One Row -->
  <n-grid :cols="3" x-gap="20">
    <!-- Left Column: Bot Config + Actions -->
    <n-gi>
      <n-card class="bot-config-card">
        <div class="section-header clickable" @click="showBotConfig = !showBotConfig">
          🤖 Bot Configuration
          <span class="collapse-icon">{{ showBotConfig ? '▼' : '▶' }}</span>
        </div>

        <div v-show="showBotConfig">

        <n-space vertical size="small">
    

          <!-- Price Start, Lower Price & Upper Price (Same Row) -->
          <n-grid :cols="3" x-gap="8">
            <n-gi>
              <div class="input-group">
                <label class="input-label" style="color: #eadb11;">Price Start</label>
                <n-input v-model:value="PriceStart" placeholder="Price Start" size="small">
                  <template #suffix>{{ quote }}</template>
                </n-input>
              </div>
            </n-gi>
            <n-gi>
              <div class="input-group">
                <label class="input-label" style="color: #10eb04;">Lower Price</label>
                <n-input v-model:value="lowerPrice" placeholder="Lower Price" size="small">
                  <template #suffix>{{ quote }}</template>
                </n-input>
              </div>
            </n-gi>
            <n-gi>
              <div class="input-group">
                <label class="input-label" style="color: #f72c09;">Upper Price</label>
                <n-input v-model:value="upperPrice" placeholder="Upper Price" size="small">
                  <template #suffix>{{ quote }}</template>
                </n-input>
              </div>
            </n-gi>
          </n-grid>

          <!-- Amount Price Start, Amount & Number of Grids (Same Row) -->
          <n-grid :cols="3" x-gap="8">
            <n-gi>
              <div class="input-group">
                <label class="input-label" style="color: #05f5ed;">AmountPStart</label>
                <n-input v-model:value="amountPriceStart" placeholder="Amount Price Start" size="small">
                  <template #suffix>{{ quote }}</template>
                </n-input>
              </div>
            </n-gi>
            <n-gi>
              <div class="input-group">
                <label class="input-label" style="color: #05f5ed;">Amount</label>
                <n-input v-model:value="amount" placeholder="Amount" size="small">
                  <template #suffix>{{ quote }}</template>
                </n-input>
              </div>
            </n-gi>
            <n-gi>
              <div class="input-group">
                <label class="input-label" style="color: #cb8d07;">Number of Grids</label>
                <n-input v-model:value="nrOfGrids" placeholder="Number of Grids" size="small" />
              </div>
            </n-gi>
          </n-grid>

          <!-- Incremental % Buy -->
          <div class="input-group">
            <label class="input-label" style="color: #10eb04;">Incremental % Buy</label>
            <n-input v-model:value="incrementalPercentAmountBuy" placeholder="Incremental % Buy" size="small">
              <template #suffix>%</template>
            </n-input>
          </div>

          <!-- Incremental % Sell -->
          <div class="input-group">
            <label class="input-label" style="color: #f72c09;">Incremental % Sell</label>
            <n-input v-model:value="incrementalPercentAmountSell" placeholder="Incremental % Sell" size="small">
              <template #suffix>%</template>
            </n-input>
          </div>

                <!-- Bot Name -->
          <div class="input-group">
            <label class="input-label" style="color: #eb06eb;">Bot Name</label>
            <n-input v-model:value="name" placeholder="FrontRunBot_zc6Iv" size="small" />
          </div>
        </n-space>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <n-space>
            <n-button class="buy-btn" type="success" @click="createBuyOnlyBot" :disabled="isBuyDisabled">
              🟢 Buy Only
            </n-button>
            <n-button class="sell-btn" type="error" @click="createSellOnlyBot" :disabled="isSellDisabled">
              🔴 Sell Only
            </n-button>
            <n-button type="info" @click="enableAllButtons">Enable All</n-button>
            <n-button type="warning" @click="resetFields">Reset All</n-button>
          </n-space>
          <n-checkbox v-model:checked="ActiveRANGE" style="margin-top: 8px;">
            <span style="font-size: 11px; color: #f5a623;">Active RANGE</span>
          </n-checkbox>
        </div>
        </div>
      </n-card>
    </n-gi>

    <!-- Right Column: Price Adjustment -->
    <n-gi>
      <n-card class="price-adjust-card">
        <div class="section-header clickable" @click="showPriceAdjust = !showPriceAdjust">
          📈 Price Adjustment
          <span class="collapse-icon">{{ showPriceAdjust ? '▼' : '▶' }}</span>
        </div>

        <div v-show="showPriceAdjust">
        <n-grid :cols="2" x-gap="8">
          <!-- Lower Price Adjustments -->
          <n-gi>
            <div class="price-adjust-section lower-section">
              <div class="adjust-label">🟢 Lower Price (-)</div>
              <n-space vertical size="small">
                <n-button size="small" class="adjust-btn buy-btn" @click="updateLowerPrice(0.0001)" :disabled="isSellDisabled">- 0.01%</n-button>
                <n-button size="small" class="adjust-btn buy-btn" @click="updateLowerPrice(0.005)" :disabled="isSellDisabled">- 0.5%</n-button>
                <n-button size="small" class="adjust-btn buy-btn" @click="updateLowerPrice(0.01)" :disabled="isSellDisabled">- 1%</n-button>
                <n-button size="small" class="adjust-btn buy-btn" @click="updateLowerPrice(0.02)" :disabled="isSellDisabled">- 2%</n-button>
                <n-button size="small" class="adjust-btn buy-btn" @click="updateLowerPrice(0.03)" :disabled="isSellDisabled">- 3%</n-button>
                <n-button size="small" class="adjust-btn buy-btn" @click="updateLowerPrice(0.05)" :disabled="isSellDisabled">- 5%</n-button>
                <n-button size="small" class="adjust-btn buy-btn" @click="updateLowerPrice(0.07)" :disabled="isSellDisabled">- 7%</n-button>
                <n-button size="small" class="adjust-btn buy-btn" @click="updateLowerPrice(0.09)" :disabled="isSellDisabled">- 9%</n-button>
                <n-button size="small" class="adjust-btn buy-btn" @click="updateLowerPrice(0.1)" :disabled="isSellDisabled">- 10%</n-button>
                <n-button size="small" class="adjust-btn buy-btn" @click="updateLowerPrice(0.2)" :disabled="isSellDisabled">- 20%</n-button>
                <n-button size="small" class="adjust-btn buy-btn" @click="updateLowerPrice(0.3)" :disabled="isSellDisabled">- 30%</n-button>
                <n-button size="small" class="adjust-btn buy-btn" @click="updateLowerPrice(0.5)" :disabled="isSellDisabled">- 50%</n-button>
                <n-button size="small" class="adjust-btn buy-btn" @click="updateLowerPrice(0.6)" :disabled="isSellDisabled">- 60%</n-button>
                <n-button size="small" class="adjust-btn buy-btn" @click="updateLowerPrice(0.7)" :disabled="isSellDisabled">- 70%</n-button>
                <n-button size="small" class="adjust-btn buy-btn" @click="updateLowerPrice(0.8)" :disabled="isSellDisabled">- 80%</n-button>
                <n-button size="small" class="adjust-btn buy-btn" @click="updateLowerPrice(0.97)" :disabled="isSellDisabled">- 90%</n-button>
              </n-space>
            </div>
          </n-gi>

          <!-- Upper Price Adjustments -->
          <n-gi>
            <div class="price-adjust-section upper-section">
              <div class="adjust-label">🔴 Upper Price (+)</div>
              <n-space vertical size="small">
                <n-button size="small" class="adjust-btn sell-btn" @click="updateUpperPrice(0.001)" :disabled="isBuyDisabled">+ 0.1%</n-button>
                <n-button size="small" class="adjust-btn sell-btn" @click="updateUpperPrice(0.005)" :disabled="isBuyDisabled">+ 0.5%</n-button>
                <n-button size="small" class="adjust-btn sell-btn" @click="updateUpperPrice(0.01)" :disabled="isBuyDisabled">+ 1%</n-button>
                <n-button size="small" class="adjust-btn sell-btn" @click="updateUpperPrice(0.02)" :disabled="isBuyDisabled">+ 2%</n-button>
                <n-button size="small" class="adjust-btn sell-btn" @click="updateUpperPrice(0.03)" :disabled="isBuyDisabled">+ 3%</n-button>
                <n-button size="small" class="adjust-btn sell-btn" @click="updateUpperPrice(0.05)" :disabled="isBuyDisabled">+ 5%</n-button>
                <n-button size="small" class="adjust-btn sell-btn" @click="updateUpperPrice(0.07)" :disabled="isBuyDisabled">+ 7%</n-button>
                <n-button size="small" class="adjust-btn sell-btn" @click="updateUpperPrice(0.09)" :disabled="isBuyDisabled">+ 9%</n-button>
                <n-button size="small" class="adjust-btn sell-btn" @click="updateUpperPrice(0.1)" :disabled="isBuyDisabled">+ 10%</n-button>
                <n-button size="small" class="adjust-btn sell-btn" @click="updateUpperPrice(0.2)" :disabled="isBuyDisabled">+ 20%</n-button>
                <n-button size="small" class="adjust-btn sell-btn" @click="updateUpperPrice(0.3)" :disabled="isBuyDisabled">+ 30%</n-button>
                <n-button size="small" class="adjust-btn sell-btn" @click="updateUpperPrice(0.5)" :disabled="isBuyDisabled">+ 50%</n-button>
                <n-button size="small" class="adjust-btn sell-btn" @click="updateUpperPrice(0.6)" :disabled="isBuyDisabled">+ 60%</n-button>
                <n-button size="small" class="adjust-btn sell-btn" @click="updateUpperPrice(0.7)" :disabled="isBuyDisabled">+ 70%</n-button>
                <n-button size="small" class="adjust-btn sell-btn" @click="updateUpperPrice(0.8)" :disabled="isBuyDisabled">+ 80%</n-button>
                <n-button size="small" class="adjust-btn sell-btn" @click="updateUpperPrice(0.9)" :disabled="isBuyDisabled">+ 90%</n-button>
              </n-space>
            </div>
          </n-gi>
        </n-grid>
        </div>
      </n-card>
    </n-gi>

    <!-- Third Column: Trading Strategies + Grid & Amount Config + Incremental Settings -->
    <n-gi>
      <n-space vertical size="small">
        <!-- Trading Strategies -->
        <n-card class="strategy-card">
          <div class="section-header clickable" @click="showStrategies = !showStrategies">
            📊 Trading Strategies
            <span class="collapse-icon">{{ showStrategies ? '▼' : '▶' }}</span>
          </div>
          <div v-show="showStrategies">
            <!-- BUY Strategy -->
            <div class="strategy-section buy-section">
              <div class="strategy-label">🟢 BUY → SELL Grid (%)</div>
              <n-button-group class="strategy-buttons">
                <n-button size="small" @click="selectStrategy('BUY--->SELLGRID2%')" :type="strategyPicker === 'BUY--->SELLGRID2%' ? 'success' : 'default'">2%</n-button>
                <n-button size="small" @click="selectStrategy('BUY--->SELLGRID5%')" :type="strategyPicker === 'BUY--->SELLGRID5%' ? 'success' : 'default'">5%</n-button>
                <n-button size="small" @click="selectStrategy('BUY--->SELLGRID7%')" :type="strategyPicker === 'BUY--->SELLGRID7%' ? 'success' : 'default'">7%</n-button>
                <n-button size="small" @click="selectStrategy('BUY--->SELLGRID10%')" :type="strategyPicker === 'BUY--->SELLGRID10%' ? 'success' : 'default'">10%</n-button>
                <n-button size="small" @click="selectStrategy('BUY--->SELLGRID20%')" :type="strategyPicker === 'BUY--->SELLGRID20%' ? 'success' : 'default'">20%</n-button>
                <n-button size="small" @click="selectStrategy('BUY--->SELLGRID50%')" :type="strategyPicker === 'BUY--->SELLGRID50%' ? 'success' : 'default'">50%</n-button>
                <n-button size="small" @click="selectStrategy('BUY--->SELLGRID80%')" :type="strategyPicker === 'BUY--->SELLGRID80%' ? 'success' : 'default'">80%</n-button>
              </n-button-group>
            </div>

            <!-- SELL Strategy -->
            <div class="strategy-section sell-section">
              <div class="strategy-label">🔴 SELL → BUY Grid (%)</div>
              <n-button-group class="strategy-buttons">
                <n-button size="small" @click="selectStrategy('SELL--->BUYGRID2%')" :type="strategyPicker === 'SELL--->BUYGRID2%' ? 'error' : 'default'">2%</n-button>
                <n-button size="small" @click="selectStrategy('SELL--->BUYGRID5%')" :type="strategyPicker === 'SELL--->BUYGRID5%' ? 'error' : 'default'">5%</n-button>
                <n-button size="small" @click="selectStrategy('SELL--->BUYGRID7%')" :type="strategyPicker === 'SELL--->BUYGRID7%' ? 'error' : 'default'">7%</n-button>
                <n-button size="small" @click="selectStrategy('SELL--->BUYGRID10%')" :type="strategyPicker === 'SELL--->BUYGRID10%' ? 'error' : 'default'">10%</n-button>
                <n-button size="small" @click="selectStrategy('SELL--->BUYGRID20%')" :type="strategyPicker === 'SELL--->BUYGRID20%' ? 'error' : 'default'">20%</n-button>
                <n-button size="small" @click="selectStrategy('SELL--->BUYGRID50%')" :type="strategyPicker === 'SELL--->BUYGRID50%' ? 'error' : 'default'">50%</n-button>
                <n-button size="small" @click="selectStrategy('SELL--->BUYGRID80%')" :type="strategyPicker === 'SELL--->BUYGRID80%' ? 'error' : 'default'">80%</n-button>
              </n-button-group>
            </div>
          </div>
        </n-card>

        <!-- Grid & Amount Configuration -->
        <n-card class="config-card">
          <div class="section-header clickable" @click="showGridConfig = !showGridConfig">
            ⚙️ Grid & Amount Config
            <span class="collapse-icon">{{ showGridConfig ? '▼' : '▶' }}</span>
          </div>
          <div v-show="showGridConfig">
            <!-- Number of Grids -->
            <div class="config-section">
              <div class="config-label">📊 Number of Grids</div>
              <n-button-group class="config-buttons">
                <n-button size="small" @click="setNrGrids(10)">10</n-button>
                <n-button size="small" @click="setNrGrids(20)">20</n-button>
                <n-button size="small" @click="setNrGrids(25)">25</n-button>
                <n-button size="small" @click="setNrGrids(35)">35</n-button>
                <n-button size="small" @click="setNrGrids(50)">50</n-button>
                <n-button size="small" @click="setNrGrids(100)">100</n-button>
              </n-button-group>
            </div>

            <!-- Amount -->
            <div class="config-section">
              <div class="config-label">💰 Amount (USDC)</div>
              <n-button-group class="config-buttons">
                <n-button size="small" @click="setAmount(1)">1</n-button>
                <n-button size="small" @click="setAmount(5)">5</n-button>
                <n-button size="small" @click="setAmount(10)">10</n-button>
                <n-button size="small" @click="setAmount(20)">20</n-button>
                <n-button size="small" @click="setAmount(50)">50</n-button>
                <n-button size="small" @click="setAmount(100)">100</n-button>
              </n-button-group>
            </div>
          </div>
        </n-card>

        <!-- Incremental Amount Settings -->
        <n-card class="incremental-card">
          <div class="section-header clickable" @click="showIncremental = !showIncremental">
            📈 Incremental Settings
            <span class="collapse-icon">{{ showIncremental ? '▼' : '▶' }}</span>
          </div>
          <div v-show="showIncremental">
            <div class="incremental-section">
              <div class="incremental-label">🔵 Basic (Buy%, Sell%)</div>
              <n-button-group class="incremental-buttons">
                <n-button size="small" @click="setIncrementalAmounts(0.5, 0.7)">0.5, 0.7</n-button>
                <n-button size="small" @click="setIncrementalAmounts(1, 1.5)">1, 1.5</n-button>
                <n-button size="small" @click="setIncrementalAmounts(2, 2.5)">2, 2.5</n-button>
              </n-button-group>
            </div>

            <div class="incremental-section">
              <div class="incremental-label">🟢 Accumulation</div>
              <n-button-group class="incremental-buttons">
                <n-button size="small" @click="setAccumulation(1, 0.5)">1, 0.5</n-button>
                <n-button size="small" @click="setAccumulation(2, 1)">2, 1</n-button>
                <n-button size="small" @click="setAccumulation(3, 1.5)">3, 1.5</n-button>
                <n-button size="small" @click="setAccumulation(4, 2)">4, 2</n-button>
                <n-button size="small" @click="setAccumulation(5, 2.5)">5, 2.5</n-button>
              </n-button-group>
            </div>

            <div class="incremental-section">
              <div class="incremental-label">🔴 Distribution</div>
              <n-button-group class="incremental-buttons">
                <n-button size="small" @click="setDistribution(0.5, 1)">0.5, 1</n-button>
                <n-button size="small" @click="setDistribution(1, 2)">1, 2</n-button>
                <n-button size="small" @click="setDistribution(1.5, 3)">1.5, 3</n-button>
                <n-button size="small" @click="setDistribution(2, 4)">2, 4</n-button>
                <n-button size="small" @click="setDistribution(2.5, 5)">2.5, 5</n-button>
              </n-button-group>
            </div>
          </div>
        </n-card>
      </n-space>
    </n-gi>
  </n-grid>



</div>
</template>

<style scoped>
.frontrun-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  height: 100%;
  padding: 4px;
  margin: 0;
  overflow: hidden;
}

/* Section Headers */
.section-header {
  font-size: 13px;
  font-weight: 700;
  color: #f5a623;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid #333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header.clickable {
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
}

.section-header.clickable:hover {
  color: #10eb04;
  border-bottom-color: #10eb04;
}

.collapse-icon {
  font-size: 12px;
  transition: transform 0.3s ease;
  color: #10eb04;
}

/* ===== STRATEGY CARD ===== */
.strategy-card {
  background: #0a0a0a;
  border: 1px solid #2a2a2a;
  width: 100%;
}

.strategy-section {
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 4px;
}

.buy-section {
  background: linear-gradient(135deg, #0a2e01 0%, #0f1a0a 100%);
  border: 1px solid #10eb04;
}

.sell-section {
  background: linear-gradient(135deg, #2e0a01 0%, #1a0a0a 100%);
  border: 1px solid #e90a15;
}

.strategy-label {
  font-size: 10px;
  font-weight: 600;
  color: #d0d0d0;
  margin-bottom: 4px;
}

.strategy-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.strategy-buttons .n-button {
  flex: 1;
  min-width: 40px;
  font-size: 10px;
  padding: 0;
  height: 22px;
}

/* ===== CONFIG CARD ===== */
.config-card {
  background: #0a0a0a;
  border: 1px solid #2a2a2a;
  min-width: 280px;
  max-width: 280px;
}

.incremental-card {
  background: #0a0a0a;
  border: 1px solid #2a2a2a;
  min-width: 300px;
  max-width: 300px;
}

.config-section, .incremental-section {
  padding: 4px;
  background: #0f0f0f;
  border-radius: 4px;
  border: 1px solid #2a2a2a;
  margin-bottom: 4px;
}

.config-section:last-child, .incremental-section:last-child {
  margin-bottom: 0;
}

.config-label, .incremental-label {
  font-size: 9px;
  font-weight: 600;
  color: #d0d0d0;
  margin-bottom: 2px;
}

.config-buttons, .incremental-buttons {
  display: flex;
  flex-wrap: nowrap;
  gap: 1px;
}

.config-buttons .n-button, .incremental-buttons .n-button {
  flex: 1;
  min-width: 0;
  font-size: 9px;
  padding: 0;
  white-space: nowrap;
  height: 20px;
}

/* ===== BOT CONFIG CARD ===== */
.bot-config-card {
  background: #0a0a0a;
  border: 1px solid #2a2a2a;
  display: flex;
  flex-direction: column;
  min-width: 320px;
  max-width: 320px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.action-buttons {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #333;
}

.buy-btn {
  background: linear-gradient(135deg, #0a2e01 0%, #10eb04 100%) !important;
  border: 1px solid #10eb04 !important;
  color: white !important;
}

.buy-btn:hover {
  background: linear-gradient(135deg, #10eb04 0%, #0a2e01 100%) !important;
}

.buy-btn:disabled {
  opacity: 0.5;
  background: #2a2a2a !important;
}

.sell-btn {
  background: linear-gradient(135deg, #2e0a01 0%, #e90a15 100%) !important;
  border: 1px solid #e90a15 !important;
  color: white !important;
}

.sell-btn:hover {
  background: linear-gradient(135deg, #e90a15 0%, #2e0a01 100%) !important;
}

.sell-btn:disabled {
  opacity: 0.5;
  background: #2a2a2a !important;
}

/* ===== PRICE ADJUST CARD ===== */
.price-adjust-card {
  background: #0a0a0a;
  border: 1px solid #2a2a2a;
  min-width: 320px;
  max-width: 320px;
}

.price-adjust-section {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #2a2a2a;
}

.lower-section {
  background: linear-gradient(135deg, #0a2e01 0%, #0f1a0a 100%);
  border-color: #10eb04;
}

.upper-section {
  background: linear-gradient(135deg, #2e0a01 0%, #1a0a0a 100%);
  border-color: #e90a15;
}

.adjust-label {
  font-size: 10px;
  font-weight: 600;
  color: #d0d0d0;
  margin-bottom: 6px;
  text-align: center;
}

.adjust-btn {
  width: 100%;
}
</style>
