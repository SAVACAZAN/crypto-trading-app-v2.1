<script setup>
import { useAppStore } from '~/stores/app.store';
import {ref, watch, computed, onMounted, onUnmounted} from "vue";
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async';

const app = useAppStore()

let userID = useCookie('userID');

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);

// Emit events to parent
const emit = defineEmits(['update:price', 'update:balance', 'update:orderbook']);

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
let TakeProfitBotSTR1 = ref(''); // Inițializare cu valoarea unei comenzi goale
let TakeProfitBotSTR2 = ref(''); // Inițializare cu valoarea unei comenzi goale

let BotReset = ref('');
let   BotCancelOrders = ref('');
let   BotX1 = ref('');
let   BotX2 = ref('');
let   BotX3 = ref('');
let   BotX4 = ref('');

let orderBookInterval = null;

// Starea pentru a ține evidența dacă devierea inițială a fost aplicată sau nu
let initialDeviationApplied = false;

// UI state for collapsible sidebar
let showAdvanced = ref(false);

// Update handlers for TickerBar events
function updateCurrentPrice(price) {
  // Update local state if needed
  // Emit to parent
  emit('update:price', price);
}

function updateBalance(balance) {
  // Update local state if needed
  // Emit to parent
  emit('update:balance', balance);
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

// Funcția pentru actualizarea prețului minim
function updateLowerPrice(deviationPercentage = 0.01) {
  if (bestBid.value) {
    const newValue = (bestBid.value * (1 - deviationPercentage)).toFixed(6).toString();
    console.log(`Update Lower Price Button Clicked. New Value with ${deviationPercentage * 100}% deviation:`, newValue);
    manualLowerPrice.value = newValue;
    //  și lowerPrice automat
    lowerPrice.value = newValue;
  }
}

// Funcția pentru actualizarea prețului maxim
function updateUpperPrice(deviationPercentage = 0.01) {
  if (bestAsk.value) {
    const newValue = (bestAsk.value * (1 + deviationPercentage)).toFixed(6).toString();
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
      // currentExchange.value = strategiesStore[i].currentExchange;
      // currentSymbol.value = strategiesStore[i].currentSymbol;
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

  //reset form??
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

  // Clear the strategiesStore array and update localStorage
  let strategiesStore = [];
  localStorage.setItem('strategiesStore', JSON.stringify(strategiesStore));

  // Clear the strategyPickerOptions array
  strategyPickerOptions.value = [];

  // Reset form values if needed
  // ...

  // Set the selected strategy to an empty string
  strategyPicker.value = '';
}

async function createGridBot(sideOverride = null){
  if (!selectedApiKeys.value || selectedApiKeys.value.length === 0) {
    console.error('No API Keys selected');
    return;
  }

  console.log('🔑 Creating GridBot with API Keys:', selectedApiKeys.value);

  // Override ordersSide if button parameter is provided
  const finalOrdersSide = sideOverride || ordersSide.value;

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
    ordersSide: finalOrdersSide,  // Use override or default
    incrementalPercentAmountBuy:incrementalPercentAmountBuy.value,
    incrementalPercentAmountSell:incrementalPercentAmountSell.value,
    apiKeyNames: selectedApiKeys.value,  // Changed to apiKeyNames (array)
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

  // console.log(data);

  let response = await $fetch( '/api/v1/createGridBot', {
    method: 'POST',
    body: data
  } );
 // Afiseaza butoanele dupa crearea botului
  BotX1.value = 'ComandaX1';
  BotX2.value = 'ComandaX2';
  // Adauga aici BotX3, BotX4 etc. daca este nevoie de ele
}




onMounted(async () => {
  // API keys are loaded in grid-bots-list.vue
  orderBookInterval = setIntervalAsync(fetchOrderBookPooling, 500);

  applyInitialDeviation(); // Apelați funcția applyInitialDeviation

  // localStorage.setItem('test', '123');

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

// Expose applyAISuggestion for parent component
function applyAISuggestion(suggestion) {
  console.log('🤖 Applying AI Suggestion:', suggestion);

  // Populate all form fields from AI suggestion
  if (suggestion.lowerPrice !== undefined) {
    lowerPrice.value = suggestion.lowerPrice.toString();
    manualLowerPrice.value = suggestion.lowerPrice.toString();
  }

  if (suggestion.upperPrice !== undefined) {
    upperPrice.value = suggestion.upperPrice.toString();
    manualUpperPrice.value = suggestion.upperPrice.toString();
  }

  if (suggestion.numberOfGrids !== undefined) {
    nrOfGrids.value = suggestion.numberOfGrids.toString();
  }

  if (suggestion.suggestedAmount !== undefined) {
    amount.value = suggestion.suggestedAmount.toString();
  }

  // Incremental Amount BUY/SELL
  if (suggestion.incrementalPercentAmountBuy !== undefined) {
    incrementalPercentAmountBuy.value = suggestion.incrementalPercentAmountBuy.toString();
  }

  if (suggestion.incrementalPercentAmountSell !== undefined) {
    incrementalPercentAmountSell.value = suggestion.incrementalPercentAmountSell.toString();
  }

  // Deviation Price BUY/SELL
  if (suggestion.deviationPriceBuy !== undefined) {
    deviationPriceBuy.value = suggestion.deviationPriceBuy.toString();
  }

  if (suggestion.deviationPriceSell !== undefined) {
    deviationPriceSell.value = suggestion.deviationPriceSell.toString();
  }

  // Deviation Amount BUY/SELL
  if (suggestion.deviationAmountBuy !== undefined) {
    deviationAmountBuy.value = suggestion.deviationAmountBuy.toString();
  }

  if (suggestion.deviationAmountSell !== undefined) {
    deviationAmountSell.value = suggestion.deviationAmountSell.toString();
  }

  // Bot name (optional)
  if (suggestion.botName) {
    name.value = suggestion.botName;
  }

  console.log('✅ AI Configuration applied successfully!');
}

// Expose function to parent
defineExpose({
  applyAISuggestion
});

</script>

<template>
  <div class="compact-neon-form">
    <!-- MAIN TABLE (FULL WIDTH, NO TICKER BAR) -->
    <div class="main-table-section">
      <table class="compact-table">
        <thead>
          <tr>
            <th>Bot Name</th>
            <th>Lower</th>
            <th>Upper</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Grids</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <n-input v-model:value="name" size="tiny" placeholder="Bot" class="table-input" />
            </td>
            <td>
              <n-input v-model:value="lowerPrice" size="tiny" placeholder="0.00" class="table-input" />
            </td>
            <td>
              <n-input v-model:value="upperPrice" size="tiny" placeholder="0.00" class="table-input" />
            </td>
            <td>
              <n-select v-model:value="amountType" :options="amountTypeOptions" size="tiny" class="table-select" />
            </td>
            <td>
              <n-input v-model:value="amount" size="tiny" placeholder="0.00" class="table-input" />
            </td>
            <td>
              <n-input v-model:value="nrOfGrids" size="tiny" placeholder="20" class="table-input" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- PRICE ADJUSTMENT BUTTONS (COMPACT, ICON ONLY) -->
    <div class="price-adjustments-compact">
      <div class="price-row lower-row">
        <span class="row-label">📉 LOWER</span>
        <n-tooltip trigger="hover"><template #trigger><n-button @click="updateLowerPrice(0.01)" size="small" class="price-btn-mini lower">-1%</n-button></template>Lower by 1%</n-tooltip>
        <n-tooltip trigger="hover"><template #trigger><n-button @click="updateLowerPrice(0.02)" size="small" class="price-btn-mini lower">-2%</n-button></template>Lower by 2%</n-tooltip>
        <n-tooltip trigger="hover"><template #trigger><n-button @click="updateLowerPrice(0.05)" size="small" class="price-btn-mini lower">-5%</n-button></template>Lower by 5%</n-tooltip>
        <n-tooltip trigger="hover"><template #trigger><n-button @click="updateLowerPrice(0.1)" size="small" class="price-btn-mini lower">-10%</n-button></template>Lower by 10%</n-tooltip>
        <n-tooltip trigger="hover"><template #trigger><n-button @click="updateLowerPrice(0.2)" size="small" class="price-btn-mini lower">-20%</n-button></template>Lower by 20%</n-tooltip>
        <n-tooltip trigger="hover"><template #trigger><n-button @click="updateLowerPrice(0.5)" size="small" class="price-btn-mini lower">-50%</n-button></template>Lower by 50%</n-tooltip>
      </div>

      <div class="price-row upper-row">
        <span class="row-label">📈 UPPER</span>
        <n-tooltip trigger="hover"><template #trigger><n-button @click="updateUpperPrice(0.01)" size="small" class="price-btn-mini upper">+1%</n-button></template>Upper by 1%</n-tooltip>
        <n-tooltip trigger="hover"><template #trigger><n-button @click="updateUpperPrice(0.02)" size="small" class="price-btn-mini upper">+2%</n-button></template>Upper by 2%</n-tooltip>
        <n-tooltip trigger="hover"><template #trigger><n-button @click="updateUpperPrice(0.05)" size="small" class="price-btn-mini upper">+5%</n-button></template>Upper by 5%</n-tooltip>
        <n-tooltip trigger="hover"><template #trigger><n-button @click="updateUpperPrice(0.1)" size="small" class="price-btn-mini upper">+10%</n-button></template>Upper by 10%</n-tooltip>
        <n-tooltip trigger="hover"><template #trigger><n-button @click="updateUpperPrice(0.2)" size="small" class="price-btn-mini upper">+20%</n-button></template>Upper by 20%</n-tooltip>
        <n-tooltip trigger="hover"><template #trigger><n-button @click="updateUpperPrice(0.5)" size="small" class="price-btn-mini upper">+50%</n-button></template>Upper by 50%</n-tooltip>
      </div>
    </div>
    
    <!-- ACTION BAR - Strategy Management + Create Buttons (COMPACT) -->
    <div class="action-bar-compact">
      <!-- STRATEGY SECTION -->
      <div class="strategy-section-compact">
        <span class="section-label-mini">💾 STRATEGY</span>
        <n-select
          v-model:value="strategyPicker"
          :options="strategyPickerOptions"
          @update:value="selectStrategy"
          placeholder="Strategy"
          size="small"
          class="strategy-select-mini"
        />
        <div class="strategy-actions">
          <n-tooltip trigger="hover"><template #trigger><n-button @click="addStrategy" size="small" class="action-btn-mini add">➕</n-button></template>Add Strategy</n-tooltip>
          <n-tooltip trigger="hover"><template #trigger><n-button @click="editStrategy" size="small" class="action-btn-mini edit">✏️</n-button></template>Edit Strategy</n-tooltip>
          <n-tooltip trigger="hover"><template #trigger><n-button @click="deleteStrategy" size="small" class="action-btn-mini delete">🗑️</n-button></template>Delete Strategy</n-tooltip>
        </div>
      </div>

      <!-- CREATE BUTTONS (HORIZONTAL, COMPACT) -->
      <div class="create-buttons-compact">
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button @click="createGridBot('buyOnly')" size="small" class="create-btn-mini buy-only">
              📉 BUY
            </n-button>
          </template>
          Create BUY-only Grid Bot
        </n-tooltip>

        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button @click="createGridBot('sellOnly')" size="small" class="create-btn-mini sell-only">
              📈 SELL
            </n-button>
          </template>
          Create SELL-only Grid Bot
        </n-tooltip>

        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button @click="createGridBot('buyOrSell')" size="small" class="create-btn-mini buy-sell">
              🚀 BUY & SELL
            </n-button>
          </template>
          Create BUY & SELL Grid Bot
        </n-tooltip>
      </div>
    </div>
    <!-- ADVANCED SETTINGS CARD - Full Width -->
    <div class="advanced-card" :class="{ collapsed: !showAdvanced }">
      <div class="card-header" @click="showAdvanced = !showAdvanced">
        <span class="toggle-icon">{{ showAdvanced ? '▼' : '▶' }}</span>
        <span class="card-title">⚙️ ADVANCED SETTINGS</span>
      </div>

      <div v-if="showAdvanced" class="card-content">
        <table class="advanced-table-v2">
          <thead>
            <tr>
              <th class="side-col">Side</th>
              <th class="param-col">Incremental %</th>
              <th class="param-col">Deviation Price</th>
              <th class="param-col">Deviation Amount</th>
              <th class="param-col">Price Group</th>
            </tr>
          </thead>
          <tbody>
            <!-- BUY ROW -->
            <tr class="buy-row">
              <td class="side-label buy-label">📉 BUY</td>
              <td>
                <n-input v-model:value="incrementalPercentAmountBuy" size="small" placeholder="1.0" class="advanced-input">
                  <template #suffix>%</template>
                </n-input>
              </td>
              <td>
                <n-input v-model:value="deviationPriceBuy" size="small" placeholder="1.0" class="advanced-input">
                  <template #suffix>x</template>
                </n-input>
              </td>
              <td>
                <n-input v-model:value="deviationAmountBuy" size="small" placeholder="0.9" class="advanced-input">
                  <template #suffix>x</template>
                </n-input>
              </td>
              <td>
                <n-input v-model:value="priceGroupBuy" size="small" placeholder="0.00" class="advanced-input">
                  <template #suffix>{{ quote }}</template>
                </n-input>
              </td>
            </tr>

            <!-- SELL ROW -->
            <tr class="sell-row">
              <td class="side-label sell-label">📈 SELL</td>
              <td>
                <n-input v-model:value="incrementalPercentAmountSell" size="small" placeholder="1.0" class="advanced-input">
                  <template #suffix>%</template>
                </n-input>
              </td>
              <td>
                <n-input v-model:value="deviationPriceSell" size="small" placeholder="1.0" class="advanced-input">
                  <template #suffix>x</template>
                </n-input>
              </td>
              <td>
                <n-input v-model:value="deviationAmountSell" size="small" placeholder="0.9" class="advanced-input">
                  <template #suffix>x</template>
                </n-input>
              </td>
              <td>
                <n-input v-model:value="priceGroupSell" size="small" placeholder="0.00" class="advanced-input">
                  <template #suffix>{{ quote }}</template>
                </n-input>
              </td>
            </tr>
          </tbody>
        </table>

        <n-checkbox v-model:checked="usePriceGroup" size="small" class="price-group-check">
          <span>Enable Price Grouping</span>
        </n-checkbox>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========== COMPACT NEON FORM ========== */
.compact-neon-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #0f1419;
  padding: 10px;
  border-radius: 8px;
}

/* ========== MAIN TABLE SECTION (FULL WIDTH) ========== */
.main-table-section {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 6px;
  padding: 10px;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
  overflow-x: auto;
}

/* ========== ACTION BAR COMPACT ========== */
.action-bar-compact {
  display: flex;
  gap: 10px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 6px;
  padding: 8px;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
}

/* STRATEGY SECTION COMPACT */
.strategy-section-compact {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.section-label-mini {
  font-size: 9px;
  font-weight: 800;
  color: #00ffff;
  letter-spacing: 0.5px;
  text-shadow: 0 0 3px #00ffff;
  min-width: 70px;
}

.strategy-select-mini {
  flex: 1;
  max-width: 200px;
}

.strategy-actions {
  display: flex;
  gap: 4px;
}

.action-btn-mini {
  font-size: 14px !important;
  padding: 4px 8px !important;
  min-width: 32px !important;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.action-btn-mini.add {
  background: rgba(0, 255, 0, 0.1) !important;
  border: 1px solid #00ff00 !important;
  color: #00ff00 !important;
}

.action-btn-mini.add:hover {
  background: rgba(0, 255, 0, 0.2) !important;
  box-shadow: 0 0 8px rgba(0, 255, 0, 0.5);
  transform: scale(1.1);
}

.action-btn-mini.edit {
  background: rgba(0, 191, 255, 0.1) !important;
  border: 1px solid #00bfff !important;
  color: #00bfff !important;
}

.action-btn-mini.edit:hover {
  background: rgba(0, 191, 255, 0.2) !important;
  box-shadow: 0 0 8px rgba(0, 191, 255, 0.5);
  transform: scale(1.1);
}

.action-btn-mini.delete {
  background: rgba(255, 165, 0, 0.1) !important;
  border: 1px solid #ffa500 !important;
  color: #ffa500 !important;
}

.action-btn-mini.delete:hover {
  background: rgba(255, 165, 0, 0.2) !important;
  box-shadow: 0 0 8px rgba(255, 165, 0, 0.5);
  transform: scale(1.1);
}

/* CREATE BUTTONS COMPACT (HORIZONTAL) */
.create-buttons-compact {
  display: flex;
  gap: 6px;
  align-items: center;
}

.create-btn-mini {
  font-weight: 800 !important;
  font-size: 10px !important;
  padding: 6px 12px !important;
  border-radius: 4px;
  transition: all 0.2s ease;
  border: none !important;
  white-space: nowrap;
}

.create-btn-mini.buy-only {
  background: linear-gradient(135deg, #64ff64, #00ff00) !important;
  color: #000 !important;
  box-shadow: 0 0 10px rgba(100, 255, 100, 0.4);
}

.create-btn-mini.buy-only:hover {
  box-shadow: 0 0 15px rgba(100, 255, 100, 0.7);
  transform: scale(1.05);
}

.create-btn-mini.sell-only {
  background: linear-gradient(135deg, #ff6464, #ff0000) !important;
  color: #fff !important;
  box-shadow: 0 0 10px rgba(255, 100, 100, 0.4);
}

.create-btn-mini.sell-only:hover {
  box-shadow: 0 0 15px rgba(255, 100, 100, 0.7);
  transform: scale(1.05);
}

.create-btn-mini.buy-sell {
  background: linear-gradient(135deg, #00ffff, #ff00ff) !important;
  color: #000 !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.4);
}

.create-btn-mini.buy-sell:hover {
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.7);
  transform: scale(1.05);
}

/* ========== MAIN TABLE (COMPACT) ========== */
.compact-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
}

.compact-table th {
  background: rgba(0, 255, 255, 0.1);
  color: #00ffff;
  font-size: 9px;
  font-weight: 700;
  padding: 4px 6px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  white-space: nowrap;
  text-shadow: 0 0 3px #00ffff;
}

.compact-table td {
  padding: 3px 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.compact-table tbody tr:hover {
  background: rgba(0, 255, 255, 0.05);
}

/* ========== PRICE ADJUSTMENTS COMPACT ========== */
.price-adjustments-compact {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 6px;
  padding: 8px;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
}

.price-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.row-label {
  font-size: 9px;
  font-weight: 800;
  min-width: 60px;
  letter-spacing: 0.5px;
}

.lower-row .row-label {
  color: #ff6464;
  text-shadow: 0 0 3px #ff6464;
}

.upper-row .row-label {
  color: #64ff64;
  text-shadow: 0 0 3px #64ff64;
}

.price-btn-mini {
  flex: 1;
  font-size: 9px !important;
  padding: 3px 6px !important;
  min-width: 42px !important;
  font-weight: 700 !important;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.price-btn-mini.lower {
  background: rgba(255, 100, 100, 0.1) !important;
  border: 1px solid #ff6464 !important;
  color: #ff6464 !important;
}

.price-btn-mini.lower:hover {
  background: rgba(255, 100, 100, 0.2) !important;
  box-shadow: 0 0 8px rgba(255, 100, 100, 0.5);
  transform: scale(1.05);
}

.price-btn-mini.upper {
  background: rgba(100, 255, 100, 0.1) !important;
  border: 1px solid #64ff64 !important;
  color: #64ff64 !important;
}

.price-btn-mini.upper:hover {
  background: rgba(100, 255, 100, 0.2) !important;
  box-shadow: 0 0 8px rgba(100, 255, 100, 0.5);
  transform: scale(1.05);
}

/* ========== ADVANCED CARD ========== */
.advanced-card {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.advanced-card.collapsed {
  max-height: 40px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(0, 255, 255, 0.1);
  cursor: pointer;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  transition: background 0.2s ease;
}

.card-header:hover {
  background: rgba(0, 255, 255, 0.2);
}

.toggle-icon {
  font-size: 12px;
  color: #00ffff;
  transition: transform 0.3s ease;
}

.card-title {
  font-size: 12px;
  font-weight: 800;
  color: #00ffff;
  letter-spacing: 1px;
  text-shadow: 0 0 5px #00ffff;
}

.card-content {
  padding: 12px;
}

/* Advanced Table V2 - Compact Style */
.advanced-table-v2 {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  margin-bottom: 12px;
}

.advanced-table-v2 thead {
  background: rgba(0, 255, 255, 0.1);
}

.advanced-table-v2 th {
  color: #00ffff;
  font-size: 11px;
  font-weight: 700;
  padding: 8px 10px;
  text-align: left;
  border-bottom: 2px solid rgba(0, 255, 255, 0.3);
  white-space: nowrap;
  text-shadow: 0 0 5px #00ffff;
}

.advanced-table-v2 th.side-col {
  width: 15%;
}

.advanced-table-v2 th.param-col {
  width: 21.25%;
}

.advanced-table-v2 td {
  padding: 6px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.advanced-table-v2 tbody tr:hover {
  background: rgba(0, 255, 255, 0.05);
}

.advanced-table-v2 td.side-label {
  font-size: 11px;
  font-weight: 700;
  text-align: center;
}

.advanced-table-v2 td.buy-label {
  color: #ff6464;
  text-shadow: 0 0 5px #ff6464;
}

.advanced-table-v2 td.sell-label {
  color: #64ff64;
  text-shadow: 0 0 5px #64ff64;
}

.advanced-table-v2 tr.buy-row {
  background: rgba(255, 100, 100, 0.03);
}

.advanced-table-v2 tr.sell-row {
  background: rgba(100, 255, 100, 0.03);
}

.advanced-table-v2 tr.buy-row:hover {
  background: rgba(255, 100, 100, 0.08);
}

.advanced-table-v2 tr.sell-row:hover {
  background: rgba(100, 255, 100, 0.08);
}

.price-group-check {
  margin-top: 8px;
  font-size: 11px;
}

/* ========== NAIVE UI OVERRIDES (COMPACT LIKE TICKER) ========== */
:deep(.table-input .n-input__input-el) {
  background: rgba(0, 0, 0, 0.5) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  border-radius: 6px !important;
  color: #00ffff !important;
  font-size: 10px !important;
  padding: 4px 6px !important;
  font-weight: 700 !important;
  height: 26px !important;
}

:deep(.table-input .n-input__input-el:hover) {
  border-color: rgba(0, 255, 255, 0.7) !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.3) !important;
}

:deep(.table-input .n-input__input-el:focus) {
  border-color: #00ffff !important;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.5) !important;
}

:deep(.table-select .n-base-selection) {
  background: rgba(0, 0, 0, 0.5) !important;
  border: 1px solid rgba(255, 0, 255, 0.4) !important;
  border-radius: 6px !important;
  min-height: 26px !important;
  height: 26px !important;
  font-size: 10px !important;
}

:deep(.table-select .n-base-selection:hover) {
  border-color: rgba(255, 0, 255, 0.7) !important;
  box-shadow: 0 0 8px rgba(255, 0, 255, 0.3) !important;
}

:deep(.table-select .n-base-selection.n-base-selection--active) {
  border-color: #ff00ff !important;
  box-shadow: 0 0 12px rgba(255, 0, 255, 0.5) !important;
}

:deep(.table-select .n-base-selection-label) {
  color: #ff00ff !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  padding: 0 6px !important;
}

:deep(.table-select .n-base-selection-placeholder) {
  color: rgba(255, 0, 255, 0.4) !important;
  font-size: 9px !important;
}

:deep(.table-select .n-base-suffix) {
  color: rgba(255, 0, 255, 0.6) !important;
}

:deep(.strategy-select-mini .n-base-selection) {
  background: rgba(0, 0, 0, 0.5) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  border-radius: 6px !important;
  min-height: 28px !important;
  font-size: 10px !important;
}

:deep(.strategy-select-mini .n-base-selection:hover) {
  border-color: rgba(0, 255, 255, 0.7) !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.3) !important;
}

:deep(.strategy-select-mini .n-base-selection-label) {
  color: #00ffff !important;
  font-size: 10px !important;
  font-weight: 700 !important;
}

:deep(.advanced-input .n-input__input-el) {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
  font-size: 11px;
  padding: 6px 10px;
}

:deep(.advanced-input .n-input__input-el:focus) {
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
}

/* ========== RESPONSIVE ========== */
@media (max-width: 1400px) {
  .action-bar {
    flex-wrap: wrap;
  }

  .strategy-section {
    width: 100%;
  }

  .price-adjustments {
    width: 100%;
  }

  .create-buttons {
    width: 100%;
  }

  .advanced-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .price-buttons {
    grid-template-columns: repeat(3, 1fr);
  }

  .config-fields-row {
    grid-template-columns: 1fr;
  }

  .create-buttons {
    flex-direction: column;
  }

  .create-btn {
    width: 100%;
  }
}
</style>
  