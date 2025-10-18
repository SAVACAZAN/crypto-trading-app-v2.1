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

let name = ref(`Co-PilotBot_${generateRandomString(5)}`);
let strategyPicker = ref();
let strategyPickerOptions = ref([]);
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

// Funcția pentru actualizarea prețului minim
function updateLowerPrice(deviationPercentage = 0.01) {
  if (bestBid.value) {
    const newValue = (bestBid.value * (1 - deviationPercentage)).toFixed(3).toString();
    console.log(`Update Lower Price Button Clicked. New Value with ${deviationPercentage * 100}% deviation:`, newValue);
    manualLowerPrice.value = newValue;
    //  și lowerPrice automat
    lowerPrice.value = newValue;
    PriceStart.value = newValue;
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
    PriceStart.value = newValue;
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

  let strategiesStore = JSON.parse(localStorage.getItem('strategiesStoreCoPilotBot'));

  for (let i = 0; i < strategiesStore.length; i++) {
    if (strategiesStore[i].name === strategyPicker.value) {
      console.log('strategy selected: ', strategiesStore[i]);

      name.value = strategiesStore[i].name;
      // currentExchange.value = strategiesStore[i].currentExchange;
      // currentSymbol.value = strategiesStore[i].currentSymbol;
      PriceStart.value = strategiesStore[i].PriceStart;
      amountPriceStart.value = strategiesStore[i].amountPriceStart;

      lowerPrice.value = strategiesStore[i].lowerPrice;
      upperPrice.value = strategiesStore[i].upperPrice;
      amountType.value = strategiesStore[i].amountType;
      amount.value = strategiesStore[i].amount;
      nrOfGrids.value = strategiesStore[i].nrOfGrids;
      ordersSide.value = strategiesStore[i].ordersSide;
      incrementalPercentAmountBuy.value = strategiesStore[i].incrementalPercentAmountBuy;
      incrementalPercentAmountSell.value = strategiesStore[i].incrementalPercentAmountSell;


    }
  }
}

async function addStrategy() {
  console.log('adding');

  let strategiesStore = JSON.parse(localStorage.getItem('strategiesStoreCoPilotBot'));

  let newStrategy = {
    name: name.value,
    exchange: currentExchange.value,
    symbol: currentSymbol.value,
    PriceStart: PriceStart.value,
    amountPriceStart:amountPriceStart.value,
    lowerPrice: lowerPrice.value,
    upperPrice: upperPrice.value,
    amountType: amountType.value,
    amount: amount.value,
    nrOfGrids: nrOfGrids.value,
    ordersSide: ordersSide.value,
    incrementalPercentAmountBuy: incrementalPercentAmountBuy.value,
    incrementalPercentAmountSell: incrementalPercentAmountSell.value,

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

  localStorage.setItem('strategiesStoreCoPilotBot', JSON.stringify(strategiesStore));

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

  let strategiesStore = JSON.parse(localStorage.getItem('strategiesStoreCoPilotBot'));

  if (strategiesStore !== null) {
    for (let i = 0; i < strategiesStore.length ; i++) {
      if (strategiesStore[i].name === strategyPicker.value) {
        strategiesStore[i]. PriceStart = PriceStart.value;
        strategiesStore[i]. amountPriceStart = amountPriceStart.value;
        
        strategiesStore[i].lowerPrice = lowerPrice.value;
        strategiesStore[i].upperPrice = upperPrice.value;
        strategiesStore[i].amountType = amountType.value;
        strategiesStore[i].amount = amount.value;
        strategiesStore[i].nrOfGrids = nrOfGrids.value;
        strategiesStore[i].ordersSide = ordersSide.value;
        strategiesStore[i].incrementalPercentAmountBuy = incrementalPercentAmountBuy.value;
        strategiesStore[i].incrementalPercentAmountSell = incrementalPercentAmountSell.value;
  
      }
    }
  }

  localStorage.setItem('strategiesStoreCoPilotBot', JSON.stringify(strategiesStore));
}

async function deleteStrategy() {
  console.log('deleting');


  let strategiesStore = JSON.parse(localStorage.getItem('strategiesStoreCoPilotBot'));

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
  PriceStart.value = '';
  amountPriceStart.value = '';
  lowerPrice.value = '';
  upperPrice.value = '';
  amountType.value = 'quantityPerGrid';
  amount.value = '';
  nrOfGrids.value = '';
  ordersSide.value = 'buyOrSell';
  incrementalPercentAmountBuy.value = '';
  incrementalPercentAmountSell.value = '';


  localStorage.setItem('strategiesStoreCoPilotBot', JSON.stringify(strategiesStore));
}

async function deleteAllStrategies() {
  console.log('deleting all strategies');

  // Clear the strategiesStore array and update localStorage
  let strategiesStore = [];
  localStorage.setItem('strategiesStoreCoPilotBot', JSON.stringify(strategiesStore));

  // Clear the strategyPickerOptions array
  strategyPickerOptions.value = [];

  // Reset form values if needed
  // ...

  // Set the selected strategy to an empty string
  strategyPicker.value = '';
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
    amountPriceStart:amountPriceStart.value,
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

  let response = await $fetch( '/api/v1/Bots/createCoPilotBot', {
    method: 'POST',
    body: data
  } );
  console.log('Response from server:', response);
  } catch (error) {
    console.error('Error creating co pilot  bot:', error);
  }
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

    updateLowerPrice,
    updateUpperPrice,
    handleManualLowerPriceInput,
    handleManualUpperPriceInput,
  };
});


</script>

<template>

  <n-card>

    
      <n-grid x-gap="12" :cols="2">
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



            <n-input v-model:value="name" type="text" placeholder="Bot name" />

            <n-input v-model:value="PriceStart" type="text" placeholder="PriceStart">
              <template #suffix> {{quote}} </template>
            </n-input>
            <n-input v-model:value="amountPriceStart" type="text" placeholder="AmountPriceStart">
              <template #suffix> {{quote}} </template>
            </n-input>

            <n-input v-model:value="amount" type="text" placeholder="Amount">
              <template #suffix> {{quote}} </template>
            </n-input>


            

            <n-input v-model:value="lowerPrice" type="text" placeholder="Lower Price">
             <template #suffix> {{quote}} </template>
              </n-input>
              
            <n-input v-model:value="upperPrice" type="text" placeholder="Upper Price">
              <template #suffix> {{quote}} </template>
            </n-input>
            <n-input v-model:value="nrOfGrids" type="text" placeholder="Nr of grids"></n-input>
              
            
            <n-select v-model:value="amountType" :options="amountTypeOptions" placeholder="Amount Type"/>
           
            <n-input v-model:value="incrementalPercentAmountBuy" type="text" placeholder="Inc. % Amount Buy">
              <template #suffix> % </template>
            </n-input>
           
         
        
     
        
          
     
           

     

            <n-input v-model:value="incrementalPercentAmountSell" type="text" placeholder="Inc. % Amount Sell">
              <template #suffix> % </template>
            </n-input>
         
            <n-checkbox v-model:checked="ActiveRANGE">
              Active RANGE
            </n-checkbox>
          </n-space>
        </n-gi>
        
      </n-grid>
      
      <n-button-group>
      <n-button class="buy-button" type="primary" @click="createBuyOnlyBot">Buy Only</n-button>
      <n-button class="sell-button" type="primary" @click="createSellOnlyBot">Sell Only</n-button>
    </n-button-group>

    <span style="margin-right: 10px;"></span>
      

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

     

    </n-grid>


</n-card>
</template>


<style scoped>
.buy-button {
  background-color: green; /* culoarea pentru butonul Buy Only */
}

.sell-button {
  background-color: red; /* culoarea pentru butonul Sell Only */
}
</style>
