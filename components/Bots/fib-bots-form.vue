<script setup>
import { useAppStore } from '~/stores/app.store';
import {ref} from "vue";
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

let name = ref(`FibBot_${generateRandomString(5)}`);


let strategyPicker = ref('1st');

// Stări pentru dezactivarea butoanelor "Buy Only" și "Sell Only"
let isBuyDisabled = ref(false);
let isSellDisabled = ref(false);

function selectStrategy(strategy) {
  strategyPicker.value = strategy;

  // Dezactivăm butoanele "Buy Only" și "Sell Only" în funcție de strategia selectată
  if (strategy.startsWith('BUY')) {
    isSellDisabled.value = true;
    isBuyDisabled.value = false;
  } else if (strategy.startsWith('SELL')) {
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


onMounted(() => {
  orderBookInterval = setIntervalAsync(fetchOrderBookPooling, 500);
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
      lowerPrice.value = (bestAsk.value * (1 + lowerPercent)).toFixed(decimalPlaces);  // Folosește numărul de zecimale corect
      upperPrice.value = (bestAsk.value * (1 + upperPercent)).toFixed(decimalPlaces);  // Folosește numărul de zecimale corect
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
  };

  // console.log(data);

  let response = await $fetch( '/api/v1/Bots/createFibBot', {
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

<n-card>
  
    <!-- Grup pentru butoanele de tip "BUY" -->
    <tr>
      <n-button-group class="strategy-buttons-buy">
        <n-button type="default" :ghost="strategyPicker !== '1st'">BUY--->SELLGRID</n-button>
        <n-button type="default" @click="selectStrategy('BUY--->SELLGRID2%')" :ghost="strategyPicker !== 'BUY--->SELLGRID2%'">2</n-button>
        <n-button type="default" @click="selectStrategy('BUY--->SELLGRID5%')" :ghost="strategyPicker !== 'BUY--->SELLGRID5%'">5</n-button>
        <n-button type="default" @click="selectStrategy('BUY--->SELLGRID7%')" :ghost="strategyPicker !== 'BUY--->SELLGRID7%'">7</n-button>
        <n-button type="default" @click="selectStrategy('BUY--->SELLGRID10%')" :ghost="strategyPicker !== 'BUY--->SELLGRID10%'">10</n-button>
        <n-button type="default" @click="selectStrategy('BUY--->SELLGRID20%')" :ghost="strategyPicker !== 'BUY--->SELLGRID20%'">20</n-button>
        <n-button type="default" @click="selectStrategy('BUY--->SELLGRID50%')" :ghost="strategyPicker !== 'BUY--->SELLGRID50%'">50</n-button>
        <n-button type="default" @click="selectStrategy('BUY--->SELLGRID80%')" :ghost="strategyPicker !== 'BUY--->SELLGRID80%'">80</n-button>
      </n-button-group>
    </tr>
    
    <!-- Grup pentru butoanele de tip "SELL" -->
    <tr>
      <n-button-group class="strategy-buttons-sell">
        <n-button type="default" :ghost="strategyPicker !== '2nd'">SELL--->BUYGRID</n-button>
        <n-button type="default" @click="selectStrategy('SELL--->BUYGRID2%')" :ghost="strategyPicker !== 'SELL--->BUYGRID2%'">2</n-button>
        <n-button type="default" @click="selectStrategy('SELL--->BUYGRID5%')" :ghost="strategyPicker !== 'SELL--->BUYGRID5%'">5</n-button>
        <n-button type="default" @click="selectStrategy('SELL--->BUYGRID7%')" :ghost="strategyPicker !== 'SELL--->BUYGRID7%'">7</n-button>
        <n-button type="default" @click="selectStrategy('SELL--->BUYGRID10%')" :ghost="strategyPicker !== 'SELL--->BUYGRID10%'">10</n-button>
        <n-button type="default" @click="selectStrategy('SELL--->BUYGRID20%')" :ghost="strategyPicker !== 'SELL--->BUYGRID20%'">20</n-button>
        <n-button type="default" @click="selectStrategy('SELL--->BUYGRID50%')" :ghost="strategyPicker !== 'SELL--->BUYGRID50%'">50</n-button>
        <n-button type="default" @click="selectStrategy('SELL--->BUYGRID80%')" :ghost="strategyPicker !== 'SELL--->BUYGRID80%'">80</n-button>
      </n-button-group>
    </tr>

    <tr>
      <n-button class="set-NrGrids-button" @click="setNrGrids(10)"> NrGrids 10</n-button>
      <n-button class="set-NrGrids-button" @click="setNrGrids(20)"> NrGrids 20</n-button>
      <n-button class="set-NrGrids-button" @click="setNrGrids(25)"> NrGrids 25</n-button>
      <n-button class="set-NrGrids-button" @click="setNrGrids(35)"> NrGrids 35</n-button>
      <n-button class="set-NrGrids-button" @click="setNrGrids(50)"> NrGrids 50</n-button>
      <n-button class="set-NrGrids-button" @click="setNrGrids(100)"> NrGrids 100</n-button>
    </tr>
    
    <tr>
      <!-- Butoane pentru setarea amount -->
      <n-button class="set-amount-button" @click="setAmount(1)"> Amount 1</n-button>
    <n-button class="set-amount-button" @click="setAmount(5)"> Amount 5</n-button>
    <n-button class="set-amount-button" @click="setAmount(10)"> Amount 10</n-button>

    <n-button class="set-amount-button" @click="setAmount(20)"> Amount 20</n-button>
    <n-button class="set-amount-button" @click="setAmount(50)"> Amount 50</n-button>
    <n-button class="set-amount-button" @click="setAmount(100)"> Amount 100</n-button>
    </tr>

    <n-button type="primary" @click="setIncrementalAmounts(0.5, 0.7)">0.5, 0.7 </n-button>
    <n-button type="primary" @click="setIncrementalAmounts(1, 1.5)">1, 1.5  </n-button>
    <n-button type="primary" @click="setIncrementalAmounts(2, 2.5)">2, 2.5  </n-button>


      <n-button type="primary" @click="setAccumulation(1, 0.5)">1, 0.5</n-button>
      <n-button type="primary" @click="setAccumulation(2, 1)"> 2, 1  </n-button>
      <n-button type="primary" @click="setAccumulation(3, 1.5)">3, 1.5  </n-button>
      <n-button type="primary" @click="setAccumulation(4, 2)">4, 2   </n-button>
      <n-button type="primary" @click="setAccumulation(5, 2.5)">5, 2.5  </n-button>

      <n-button type="primary" @click="setDistribution(0.5, 1)">0.5, 1  </n-button>
      <n-button type="primary" @click="setDistribution(1, 2)">1, 2  </n-button>
      <n-button type="primary" @click="setDistribution(1.5, 3)">1.5, 3  </n-button>
      <n-button type="primary" @click="setDistribution(2, 4)">2, 4  </n-button>
      <n-button type="primary" @click="setDistribution(2.5, 5)">2.5, 5  </n-button>



</n-card>



  <n-card>
 

  

    <n-grid x-gap="12" :cols="2">

      <!-- Primul tabel pentru Bot Name, Price Start și Amount Price Start -->
      <n-gi>
       
        
    
     
        
        
        <n-space vertical>



          <table class="form-table">
            <tr>
              <td class="label-cell label-bot-name"><label>Bot Name</label></td>
              <td class="input-cell">
                <n-input class="input-bot-name" v-model:value="name" placeholder="FrontRunBot_zc6Iv" />
              </td>
            </tr>

            <tr>
              <td class="label-cell label-price-start"><label>Price Start</label></td>
              <td class="input-cell">
                <n-input class="input-price-start" v-model:value="PriceStart" placeholder="Price Start">
                  <template #suffix>{{ quote }}</template>
                </n-input>
              </td>
            </tr>

            <tr>
              <td class="label-cell label-amount-price-start"><label>Amount Price Start</label></td>
              <td class="input-cell">
                <n-input class="input-amount-price-start" v-model:value="amountPriceStart" placeholder="Amount Price Start">
                  <template #suffix>{{ quote }}</template>
                </n-input>
              </td>
            </tr>
          </table>
          
          <n-button-group>
           <!-- Butoane Buy Only și Sell Only -->
    <tr>
      <td class="label-cell">
        <n-button class="buy-button" type="primary" @click="createBuyOnlyBot" :disabled="isBuyDisabled">Buy Only</n-button>
      </td>
    </tr> 
    <tr>
      <td class="label-cell">
        <n-button class="sell-button" type="primary" @click="createSellOnlyBot" :disabled="isSellDisabled">Sell Only</n-button>

      </td>
    </tr> 

    <tr>
            <!-- Buton pentru Enable All -->
            <n-button type="primary" @click="enableAllButtons">Enable All</n-button>
            <n-button class="reset-button" type="warning" @click="resetFields">Reset All</n-button>
            
             
             
         
          <n-checkbox class="label-cell"  v-model:checked="ActiveRANGE">Active RANGE</n-checkbox> 
     
        </tr>   
        </n-button-group>
         
       

            <n-grid x-gap="2" :cols="4">





              <n-gi>
  <table>
    <tr>
      <td>
        <n-button class="buy-button" @click="updateLowerPrice(0.0001)" :disabled="isSellDisabled">-</n-button>
      </td>
      <td>
        <n-button class="sell-button" @click="updateUpperPrice(0.001)" :disabled="isBuyDisabled">+</n-button>
      </td>
    </tr>
    <tr>
      <td>
        <n-button class="buy-button" @click="updateLowerPrice(0.005)" :disabled="isSellDisabled">- 0.5</n-button>
      </td>
      <td>
        <n-button class="sell-button" @click="updateUpperPrice(0.005)" :disabled="isBuyDisabled">+ 0.5</n-button>
      </td>
    </tr>
    <tr>
      <td>
        <n-button class="buy-button" @click="updateLowerPrice(0.01)" :disabled="isSellDisabled">- 1%</n-button>
      </td>
      <td>
        <n-button class="sell-button" @click="updateUpperPrice(0.01)" :disabled="isBuyDisabled">+ 1%</n-button>
      </td>
    </tr>
    <tr>
      <td>
        <n-button class="buy-button" @click="updateLowerPrice(0.02)" :disabled="isSellDisabled">- 2%</n-button>
      </td>
      <td>
        <n-button class="sell-button" @click="updateUpperPrice(0.02)" :disabled="isBuyDisabled">+ 2%</n-button>
      </td>
    </tr>
    <tr>
      <td>
        <n-button class="buy-button" @click="updateLowerPrice(0.03)" :disabled="isSellDisabled">- 3%</n-button>
      </td>
      <td>
        <n-button class="sell-button" @click="updateUpperPrice(0.03)" :disabled="isBuyDisabled">+ 3%</n-button>
      </td>
    </tr>
    <tr>
      <td>
        <n-button class="buy-button" @click="updateLowerPrice(0.05)" :disabled="isSellDisabled">- 5%</n-button>
      </td>
      <td>
        <n-button class="sell-button" @click="updateUpperPrice(0.05)" :disabled="isBuyDisabled">+ 5%</n-button>
      </td>
    </tr>
    <tr>
      <td>
        <n-button class="buy-button" @click="updateLowerPrice(0.07)" :disabled="isSellDisabled">- 7%</n-button>
      </td>
      <td>
        <n-button class="sell-button" @click="updateUpperPrice(0.07)" :disabled="isBuyDisabled">+ 7%</n-button>
      </td>
    </tr>
    <tr>
      <td>
        <n-button class="buy-button" @click="updateLowerPrice(0.09)" :disabled="isSellDisabled">- 9%</n-button>
      </td>
      <td>
        <n-button class="sell-button" @click="updateUpperPrice(0.09)" :disabled="isBuyDisabled">+ 9%</n-button>
      </td>
    </tr>
  </table>
              </n-gi>

    <n-gi>
      <table>
        <tr>
          <td>
            <n-button class="buy-button" @click="updateLowerPrice(0.1)" :disabled="isSellDisabled">- 10%</n-button>
          </td>
          <td>
            <n-button class="sell-button" @click="updateUpperPrice(0.1)" :disabled="isBuyDisabled">+ 10%</n-button>
          </td>
        </tr>
        <tr>
          <td>
            <n-button class="buy-button" @click="updateLowerPrice(0.2)" :disabled="isSellDisabled">- 20%</n-button>
          </td>
          <td>
            <n-button class="sell-button" @click="updateUpperPrice(0.2)" :disabled="isBuyDisabled">+ 20%</n-button>
          </td>
        </tr>
        <tr>
          <td>
            <n-button class="buy-button" @click="updateLowerPrice(0.3)" :disabled="isSellDisabled">- 30%</n-button>
          </td>
          <td>
            <n-button class="sell-button" @click="updateUpperPrice(0.3)" :disabled="isBuyDisabled">+ 30%</n-button>
          </td>
        </tr>
        <tr>
          <td>
            <n-button class="buy-button" @click="updateLowerPrice(0.5)" :disabled="isSellDisabled">- 50%</n-button>
          </td>
          <td>
            <n-button class="sell-button" @click="updateUpperPrice(0.5)" :disabled="isBuyDisabled">+ 50%</n-button>
          </td>
        </tr>
        <tr>
          <td>
            <n-button class="buy-button" @click="updateLowerPrice(0.6)" :disabled="isSellDisabled">- 60%</n-button>
          </td>
          <td>
            <n-button class="sell-button" @click="updateUpperPrice(0.6)" :disabled="isBuyDisabled">+ 60%</n-button>
          </td>
        </tr>
        <tr>
          <td>
            <n-button class="buy-button" @click="updateLowerPrice(0.7)" :disabled="isSellDisabled">- 70%</n-button>
          </td>
          <td>
            <n-button class="sell-button" @click="updateUpperPrice(0.7)" :disabled="isBuyDisabled">+ 70%</n-button>
          </td>
        </tr>
        <tr>
          <td>
            <n-button class="buy-button" @click="updateLowerPrice(0.8)" :disabled="isSellDisabled">- 80%</n-button>
          </td>
          <td>
            <n-button class="sell-button" @click="updateUpperPrice(0.8)" :disabled="isBuyDisabled">+ 80%</n-button>
          </td>
        </tr>
        <tr>
          <td>
            <n-button class="buy-button" @click="updateLowerPrice(0.97)" :disabled="isSellDisabled">- 90%</n-button>
          </td>
          <td>
            <n-button class="sell-button" @click="updateUpperPrice(0.9)" :disabled="isBuyDisabled">+ 90%</n-button>
          </td>
        </tr>
      </table>
    </n-gi>




      
    </n-grid>




          
        </n-space>
      </n-gi>

      <!-- Al doilea tabel pentru restul câmpurilor -->
      <n-gi>
        <n-space vertical>
          <table class="form-table">
          

            <tr>
              <td class="label-cell label-lower-price"><label>Lower Price</label></td>
              <td class="input-cell">
                <n-input class="input-lower-price" v-model:value="lowerPrice" placeholder="Lower Price">
                  <template #suffix>{{ quote }}</template>
                </n-input>
              </td>
            </tr>

            <tr>
              <td class="label-cell label-upper-price"><label>Upper Price</label></td>
              <td class="input-cell">
                <n-input class="input-upper-price" v-model:value="upperPrice" placeholder="Upper Price">
                  <template #suffix>{{ quote }}</template>
                </n-input>
              </td>
            </tr>
        

            
            <tr>
              <td class="label-cell label-amount"><label>Amount</label></td>
              <td class="input-cell">
                <n-input class="input-amount" v-model:value="amount" placeholder="Amount">
                  <template #suffix>{{ quote }}</template>
                </n-input>
              </td>
            </tr>

            <tr>
              <td class="label-cell label-number-grids"><label>Number of Grids</label></td>
              <td class="input-cell">
                <n-input class="input-number-grids" v-model:value="nrOfGrids" placeholder="Number of Grids" />
              </td>
            </tr>

      

            <tr>
              <td class="label-cell label-incremental-buy"><label>Incremental % Amount Buy</label></td>
              <td class="input-cell">
                <n-input class="input-incremental-buy" v-model:value="incrementalPercentAmountBuy" placeholder="Incremental % Amount Buy">
                  <template #suffix>%</template>
                </n-input>
              </td>
            </tr>

            <tr>
              <td class="label-cell label-incremental-sell"><label>Incremental % Amount Sell</label></td>
              <td class="input-cell">
                <n-input class="input-incremental-sell" v-model:value="incrementalPercentAmountSell" placeholder="Incremental % Amount Sell">
                  <template #suffix>%</template>
                </n-input>
              </td>
            </tr>
          </table>
        </n-space>
      </n-gi>

    </n-grid>
  </n-card>
</template>

<style scoped>
.form-table {
  width: 100%;
  border-collapse: collapse;
}

.label-cell,
.input-cell {
  padding: 8px;
  width: 50%;
  vertical-align: middle;
  border: 1px solid #0ab08c;
}

.label-cell {
  text-align: left;
  padding-right: 16px;
  font-weight: bold;
}

/* Stilurile pentru etichete (label) */
.label-bot-name label {
  color: #eb06eb; /* Albastru */
}

.label-price-start label {
  color: #eadb11; /* Verde */
}

.label-amount-price-start label {
  color: #05f5ed; /* Roșu */
}

.label-amount label {
  color: #05f5ed; /* Galben */
}

.label-lower-price label {
  color: #10eb04; /* Culoare cyan */
}

.label-upper-price label {
  color: #f72c09; /* Gri */
}

.label-number-grids label {
  color: #cb8d07; /* Gri deschis */
}

.label-amount-type label {
  color: #6610f2; /* Mov */
}

.label-incremental-buy label {
  color: #10eb04; /* Portocaliu */
}

.label-incremental-sell label {
  color: #f72c09; /* Verde deschis */
}

/* Stilurile pentru textul din input */
.input-bot-name .n-input__input {
  color: #007bff; /* Albastru */
}


/* Stilizează butoanele din grupul de "BUY" cu verde */
.strategy-buttons-buy .n-button {
  background-color: green; /* Verde */
  color: white;
  border: none;
}

/* Stilizează butoanele din grupul de "SELL" cu roșu */
.strategy-buttons-sell .n-button {
  background-color: red; /* Roșu */
  color: white;
  border: none;
}

/* Stil pentru hover */
.strategy-buttons-buy .n-button:hover, 
.strategy-buttons-sell .n-button:hover {
  background-color: green; /* Mai închis pentru verde la hover */
  color: white;
}

.strategy-buttons-sell .n-button:hover {
  background-color: red; /* Mai închis pentru roșu la hover */
  color: white;
}



.buy-button {
  background-color: green; /* Culoare pentru butonul Buy Only */
}

.sell-button {
  background-color: red; /* Culoare pentru butonul Sell Only */
}
</style>
<style scoped>
.buy-button {
  background-color: green;
  color: white;
  border: none;
}

.sell-button {
  background-color: red;
  color: white;
  border: none;
}

.buy-button:disabled {
  background-color: lightgreen;
  color: white;
}

.sell-button:disabled {
  background-color: lightcoral;
  color: white;
}

.strategy-buttons-buy .n-button {
  background-color: green;
  color: white;
}

.strategy-buttons-sell .n-button {
  background-color: red;
  color: white;
}
</style>
