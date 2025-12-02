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

</script>

<template>
  <n-card>
    <n-grid x-gap="12" :cols="2" item-responsive>

        <n-gi>
          <n-space vertical>
            <n-input v-model:value="name" type="text" placeholder="Bot name" />
            <n-input v-model:value="lowerPrice" type="text" placeholder="Lower Price">
              <template #suffix> {{quote}} </template>
            </n-input>
            <n-select v-model:value="amountType" :options="amountTypeOptions" placeholder="Amount Type"/>
            <n-select v-model:value="ordersSide" :options="ordersSideOptions" placeholder="Orders Side"/>
            <n-input v-model:value="incrementalPercentAmountBuy" type="text" placeholder="Inc. % Amount Buy">
              <template #suffix> % </template>
            </n-input>
            <n-input v-model:value="deviationPriceBuy" type="text" placeholder="Deviation Price Buy">
              <template #suffix> % </template>
            </n-input>
            <n-input v-model:value="deviationAmountBuy" type="text" placeholder="Deviation Amount Buy">
              <template #suffix> % </template>
            </n-input>
            <n-input v-model:value="priceGroupBuy" type="text" placeholder="Price Group Buy">
              <template #suffix> {{ quote }} </template>
            </n-input>
            <n-button type="primary" @click="createGridBot">Create Grid bot</n-button>
          </n-space>
        </n-gi>

        <n-gi>
          <n-space vertical>

            <n-grid x-gap="4" :cols="2">
              <n-gi>
                <n-select v-model:value="strategyPicker" :options="strategyPickerOptions" @update:value="selectStrategy" placeholder="Select strategy"/>
              </n-gi>
              <n-gi>
                <n-grid x-gap="4" :cols="4">
                  <n-gi>
                    <n-button @click="addStrategy">A</n-button>
                  </n-gi>
                  <n-gi>
                    <n-button @click="editStrategy">E</n-button>
                  </n-gi>
                  <n-gi>
                    <n-button @click="deleteStrategy">D</n-button>
                  </n-gi>
                  <n-gi>
                    <n-button @click="deleteAllStrategies">A</n-button>
                  </n-gi>

        
                </n-grid>
              </n-gi>
            </n-grid>


            <n-input v-model:value="upperPrice" type="text" placeholder="Upper Price">
              <template #suffix> {{quote}} </template>
            </n-input>
            <n-input v-model:value="amount" type="text" placeholder="Amount">
              <template #suffix> {{quote}} </template>
            </n-input>
            <n-input v-model:value="nrOfGrids" type="text" placeholder="Nr of grids"></n-input>
            <n-input v-model:value="incrementalPercentAmountSell" type="text" placeholder="Inc. % Amount Sell">
              <template #suffix> % </template>
            </n-input>
            <n-input v-model:value="deviationPriceSell" type="text" placeholder="Deviation Price Sell">
              <template #suffix> % </template>
            </n-input>
            <n-input v-model:value="deviationAmountSell" type="text" placeholder="Deviation Amount Sell">
              <template #suffix> % </template>
            </n-input>
            <n-input v-model:value="priceGroupSell" type="text" placeholder="Price Group Sell">
              <template #suffix> {{ quote }} </template>
            </n-input>
            <n-checkbox v-model:checked="usePriceGroup">
              Use Price Group
            </n-checkbox>
          </n-space>
        </n-gi>


      </n-grid>


  </n-card>

  <n-card>
    <n-grid x-gap="0" :cols="3" item-responsive style="display: flex; flex-wrap: nowrap;">

      <n-gi>
                  <table>
                    <tbody>
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
                    </tbody>
                  </table>
      </n-gi>

      <n-gi>
                  <table>
                    <tbody>
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
                    </tbody>
                  </table>
      </n-gi>

        <n-gi>
          <!-- Empty column - API selector moved to grid-bots-list.vue -->
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
  color: rgba(203, 235, 23, 0.5); /* Culoarea textului */
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
  border: 1px solid #b7dd0b;
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
    border: 1px solid #dcf116;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    z-index: 999;
    display: flex;
    flex-direction: column;
  }
  </style>
  