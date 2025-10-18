<script setup>
import { useAppStore } from '~/stores/app.store';
import {ref} from "vue";
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async';

const app = useAppStore()

let userID = useCookie('userID');

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);

// API Key selector
let availableApiKeys = ref([]);
let selectedApiKey = ref(null);
let loadingApiKeys = ref(false);

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

let BalanceBase = ref(0); // Adaugarea variabilei BalanceBase cu valoarea 0
let BalanceQuote = ref(0); // Adaugarea variabilei BalanceQuote cu valoarea 0
let BalanceBaseInUSD = ref(0); // Adaugarea variabilei BalanceBase cu valoarea 0
let BalanceQuoteInUSD = ref(0); // Adaugarea variabilei BalanceQuote cu valoarea 0
let BalanceBaseProfit = ref(0); // Adaugarea variabilei BalanceBase cu valoarea 0
let BalanceQuoteProfit = ref(0); // Adaugarea variabilei BalanceQuote cu valoarea 0
let BalanceBotProfit = ref(0); // Adaugarea variabilei BalanceQuote cu valoarea 0
let BalanceBotValInitiala = ref(0); // Adaugarea variabilei BalanceQuote cu valoarea 0
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

onMounted(async () => {
  await loadApiKeys();
  orderBookInterval = setIntervalAsync(fetchOrderBookPooling, 500);
});

onUnmounted(() => {
  clearIntervalAsync(orderBookInterval);
});

// Load available API keys for the current exchange
async function loadApiKeys() {
  loadingApiKeys.value = true;
  try {
    const response = await $fetch('/api/v1/fetchApiKeysList', {
      query: {
        userID: userID.value,
        exchange: currentExchange.value
      }
    });

    if (response.success && response.data.length > 0) {
      availableApiKeys.value = response.data.map(apiKey => ({
        label: `${apiKey.name} (${apiKey.preview})`,
        value: apiKey.name
      }));

      // Select first API key by default
      selectedApiKey.value = availableApiKeys.value[0].value;
    }
  } catch (error) {
    console.error('Failed to load API keys:', error);
  } finally {
    loadingApiKeys.value = false;
  }
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
    const newValue = (bestBid.value * (1 - deviationPercentage)).toFixed(3).toString();
    console.log(`Update Lower Price Button Clicked. New Value with ${deviationPercentage * 100}% deviation:`, newValue);
    manualLowerPrice.value = newValue;
    //  și lowerPrice automat
    lowerPrice.value = newValue;
  }
}

// Funcția pentru actualizarea prețului maxim
function updateUpperPrice(deviationPercentage = 0.01) {
  if (bestAsk.value) {
    const newValue = (bestAsk.value * (1 + deviationPercentage)).toFixed(3).toString();
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

async function createGridBot(){
  if (!selectedApiKey.value) {
    console.error('No API Key selected');
    return;
  }

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
    apiKeyName: selectedApiKey.value,
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




onMounted(() => {
  applyInitialDeviation(); // Apelați funcția applyInitialDeviation
  fetchOrderBookPooling(); // Inițializare pentru lowerPrice și upperPrice

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
    deviationPriceBuy,
    deviationPriceSell,
    deviationAmountBuy,
    deviationAmountSell,
    updateLowerPrice,
    updateUpperPrice,
    handleManualLowerPriceInput,
    handleManualUpperPriceInput,
  };
});



</script>

<template>
  <n-card>
    <!-- API Key Selector -->
    <n-space vertical style="margin-bottom: 16px;">
      <n-text strong>Select API Key:</n-text>
      <n-select
        v-model:value="selectedApiKey"
        :options="availableApiKeys"
        :loading="loadingApiKeys"
        placeholder="Select API Key"
        :disabled="availableApiKeys.length === 0"
        size="small"
      />
      <n-text v-if="availableApiKeys.length === 0 && !loadingApiKeys" type="warning" depth="3" style="font-size: 12px;">
        No API keys found. Please add API keys in your profile.
      </n-text>
    </n-space>
  </n-card>

  <n-card>
    <n-grid x-gap="0" :cols="3" item-responsive style="display: flex; flex-wrap: nowrap;">

      <n-gi>
                  <table>
                  <tr>
                    <td>
                      <n-button @click="updateLowerPrice(0.0001)">  - </n-button>
                    </td>
                    <td>
                      <n-button @click="updateUpperPrice(0.001)">  + </n-button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <n-button @click="updateLowerPrice(0.005)">  - 0.5%</n-button>
                    </td>
                    <td>
                      <n-button @click="updateUpperPrice(0.005)">  + 0.5%</n-button>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <n-button @click="updateLowerPrice(0.01)">  - 1%</n-button>
                    </td>
                    <td>
                      <n-button @click="updateUpperPrice(0.01)">  + 1%</n-button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <n-button @click="updateLowerPrice(0.02)">  - 2%</n-button>
                    </td>
                    <td>
                      <n-button @click="updateUpperPrice(0.02)">  + 2%</n-button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <n-button @click="updateLowerPrice(0.03)">  - 3%</n-button>
                    </td>
                    <td>
                      <n-button @click="updateUpperPrice(0.03)">  + 3%</n-button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <n-button @click="updateLowerPrice(0.05)">  - 5%</n-button>
                    </td>
                    <td>
                      <n-button @click="updateUpperPrice(0.05)">  + 5%</n-button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <n-button @click="updateLowerPrice(0.07)">  - 7%</n-button>
                    </td>
                    <td>
                      <n-button @click="updateUpperPrice(0.07)">  + 7%</n-button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <n-button @click="updateLowerPrice(0.09)">  - 9%</n-button>
                    </td>
                    <td>
                      <n-button @click="updateUpperPrice(0.09)">  + 9%</n-button>
                    </td>
                  </tr>
                </table>
      </n-gi>

      <n-gi>
                  <table>

                    <tr>
                      <td>
                        <n-button @click="updateLowerPrice(0.1)">  - 10%</n-button>
                      </td>
                      <td>
                        <n-button @click="updateUpperPrice(0.1)">  + 10%</n-button>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <n-button @click="updateLowerPrice(0.2)">  - 20%</n-button>
                      </td>
                      <td>
                        <n-button @click="updateUpperPrice(0.2)">  + 20%</n-button>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <n-button @click="updateLowerPrice(0.3)">  - 30%</n-button>
                      </td>
                      <td>
                        <n-button @click="updateUpperPrice(0.3)">  + 30%</n-button>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <n-button @click="updateLowerPrice(0.5)">  - 50%</n-button>
                      </td>
                      <td>
                        <n-button @click="updateUpperPrice(0.5)">  + 50%</n-button>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <n-button @click="updateLowerPrice(0.6)">  - 60%</n-button>
                      </td>
                      <td>
                        <n-button @click="updateUpperPrice(0.6)">  + 60%</n-button>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <n-button @click="updateLowerPrice(0.7)">  - 70%</n-button>
                      </td>
                      <td>
                        <n-button @click="updateUpperPrice(0.7)">  + 70%</n-button>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <n-button @click="updateLowerPrice(0.8)">  - 80%</n-button>
                      </td>
                      <td>
                        <n-button @click="updateUpperPrice(0.8)">  + 80%</n-button>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <n-button @click="updateLowerPrice(0.97)">  - 90%</n-button>
                      </td>
                      <td>
                        <n-button @click="updateUpperPrice(0.9)">  + 90%</n-button>
                      </td>
                    </tr>
                  </table>
      </n-gi>

        <n-gi>

        </n-gi>


    </n-grid>


</n-card>
</template>

<style scoped>
[contenteditable="true"] {
  /* Stiluri generale pentru elementele contenteditable */
  padding: 2px;
  border: 1px solid #ccc;
  border-radius: 1px;
  outline: none; /* Elimină conturul implicit la focalizare */
  min-height: 10px; /* Înălțime minimă pentru a asigura vizibilitatea */
  font-family: Arial, sans-serif;
  font-size: 13px;
  color: #e0bfbf;
}

[contenteditable="true"]:focus {
  /* Stiluri pentru când elementul este focalizat */
  border-color: blue;
}

.editable-cellLower,
.editable-cellUpper,
.editable-cell.amount,
.editable-cell.numberOfGrids,
.editable-cell.incrementalPercentAmountBuy,
.editable-cell.incrementalPercentAmountSell,
.editable-cell.deviationPriceBuy,
.editable-cell.deviationPriceSell,
.editable-cell.deviationAmountBuy,
.editable-cell.deviationAmountSell {
  position: relative;
}

.editable-cellLower:before {
  content: "Preț minim manual: "; /* Textul descriptiv pentru prețul minim */
  position: relative;
  top: 0;
  left: 0;
  color: rgba(193, 224, 16, 0.5); /* Culoarea textului */
  pointer-events: none; /* Face textul descriptiv "ne-clickabil" */
}

.editable-cellUpper:before {
  content: "Preț maxim manual: "; /* Textul descriptiv pentru prețul maxim */
  position: relative;
  top: 0;
  left: 0;
  color: rgba(193, 224, 16, 0.5); /* Culoarea textului */
  pointer-events: none; /* Face textul descriptiv "ne-clickabil" */
}

.editable-cell.amount:before {
  content: "Amount:"; /* Textul descriptiv pentru Amount */
}

.editable-cell.numberOfGrids:before {
  content: "Number of Grids:"; /* Textul descriptiv pentru Number of Grids */
}

.editable-cell.incrementalPercentAmountBuy:before {
  content: "Incremental Percent Amount Buy:"; /* Textul descriptiv pentru Incremental Percent Amount Buy */
  
}

.editable-cell.incrementalPercentAmountSell:before {
  content: "Incremental Percent Amount Sell:"; /* Textul descriptiv pentru Incremental Percent Amount Sell */
}

.editable-cell.deviationPriceBuy:before {
  content: "Deviation Price Buy:"; /* Textul descriptiv pentru Deviation Price Buy */
}

.editable-cell.deviationPriceSell:before {
  content: "Deviation Price Sell:"; /* Textul descriptiv pentru Deviation Price Sell */
}

.editable-cell.deviationAmountBuy:before {
  content: "Deviation Amount Buy:"; /* Textul descriptiv pentru Deviation Amount Buy */
}

.editable-cell.deviationAmountSell:before {
  content: "Deviation Amount Sell:"; /* Textul descriptiv pentru Deviation Amount Sell */
}



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
  margin-top: 10px; /* Adjust the margin as needed */
}
  
  .result-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px;
    background-color: #3a14e4; /* Change the background color as needed */
    border: 1px solid #0bdd9e;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    z-index: 999;
    display: flex;
    flex-direction: column;
  }
  </style>
  