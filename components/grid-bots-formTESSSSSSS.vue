<script setup>
import { useAppStore } from '~/stores/app.store';
import {ref} from "vue";
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async';
const app = useAppStore();

let userID = useCookie('userID');

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);

let base = currentSymbol.value.split('/')[1];
let quote = currentSymbol.value.split('/')[0];
const bestBid = ref(null);
const bestAsk = ref(null);
const manualLowerPrice = ref('');
const manualUpperPrice = ref('');

let name = ref(`Scalp1ngBot_${generateRandomString(5)}`);

let lowerPrice = ref('');
let upperPrice = ref('');

let BalanceBotStart = ref('');
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
let baseBalance = ref('Loading...');
let quoteBalance = ref('Loading...'); 
let userBalanceInterval = null;
let orderBookInterval = null;
let initialDeviationApplied = false;

onMounted(() => {
  orderBookInterval = setIntervalAsync(fetchOrderBookPooling, 500);
  userBalanceInterval = setIntervalAsync(fetchUserBalancePooling, 500);
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
  let response = await $fetch('/api/v1/fetchBalance', {
    query:{
      userID:userID.value,
      exchange:currentExchange.value,
    }
  });

  if (response.data) {
    if(response.data[base]) {
      baseBalance.value = `${ response.data[base].free }`;
    } else {
      quoteBalance.value = `${ response.data[quote].free }`;
    }
  } else {
    quoteBalance.value = 'N/A';
  }

  if (response.data) {
    if (response.data[quote]) {
      quoteBalance.value = `${ response.data[quote].free }`;
    }
  } else {
    baseBalance.value =  'N/A';
  }
}

function updateLowerPrice1(deviationPercentage = 0.01) {
  if (bestBid.value) {
    const newValue = (bestBid.value * (1 + deviationPercentage)).toFixed(8).toString();
    console.log(`Update Lower Price Button Clicked. New Value with ${deviationPercentage * 100}% deviation:`, newValue);
    manualLowerPrice.value = newValue;
    lowerPrice.value = newValue;
    PriceStart.value = newValue;
  }
}

function updateUpperPrice1(deviationPercentage = 0.01) {
  if (bestAsk.value) {
    const newValue = (bestAsk.value * (1 - deviationPercentage)).toFixed(8).toString();
    console.log(`Update Upper Price Button Clicked. New Value with ${deviationPercentage * 100}% deviation:`, newValue);
    manualUpperPrice.value = newValue;
    upperPrice.value = newValue;
    PriceStart.value = newValue;
  }
}

function updateLowerPrice(deviationPercentage = 0.01) {
  if (bestBid.value) {
    const newValue = (bestBid.value * (1 - deviationPercentage)).toFixed(8).toString();
    console.log(`Update Lower Price Button Clicked. New Value with ${deviationPercentage * 100}% deviation:`, newValue);
    manualLowerPrice.value = newValue;
    lowerPrice.value = newValue;
    PriceStart.value = newValue;
  }
}

function updateUpperPrice(deviationPercentage = 0.01) {
  if (bestAsk.value) {
    const newValue = (bestAsk.value * (1 + deviationPercentage)).toFixed(8).toString();
    console.log(`Update Upper Price Button Clicked. New Value with ${deviationPercentage * 100}% deviation:`, newValue);
    manualUpperPrice.value = newValue;
    upperPrice.value = newValue;
    PriceStart.value = newValue;
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
  await createBot('buyOnly');
}

async function createSellOnlyBot() {
  await createBot('sellOnly');
}

async function createBot(action) {
  console.log('Creating front run bot with action:', action);

  try {
    ordersSide.value = action === 'buyOnly' ? 'buyOnly' : 'sellOnly';

    let data = {
      userID: userID.value,
      name: name.value,
      exchange: currentExchange.value,
      symbol: currentSymbol.value,
    
      BalanceBotStart: BalanceBotStart.value,
      lowerPrice: lowerPrice.value,
      upperPrice: upperPrice.value,
      amountType: amountType.value,
      amount: amount.value,
      ordersSide: ordersSide.value,
    };

    let response = await $fetch('/api/v1/createGridBot', {
      method: 'POST',
      body: data,
    });
    console.log('Response from server:', response);
  } catch (error) {
    console.error('Error creating front run bot:', error);
  }
}

onMounted(() => {
  applyInitialDeviation();
  fetchOrderBookPooling();

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
    BalanceBotStart,
    ordersSide,
    ordersSideOptions,
    baseBalance,
    quoteBalance,
    updateLowerPrice,
    updateUpperPrice,
    updateLowerPrice1,
    updateUpperPrice1,
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
          <span>{{ base }} {{ baseBalance }}</span>
          <span>{{ quote }} {{ quoteBalance }}</span>
          <n-input v-model:value="name" type="text" placeholder="Bot name" />
       
          <n-input v-model:value="BalanceBot" type="text" placeholder="BalanceBot">
            <template #suffix> {{base}} </template>
          </n-input>
          <n-input v-model:value="amount" type="text" placeholder="Amount">
            <template #suffix> {{base}} </template>
          </n-input>
          <n-input v-model:value="lowerPrice" type="text" placeholder="Lower Price">
            <template #suffix> {{base}} </template>
          </n-input>
          <n-input v-model:value="upperPrice" type="text" placeholder="Upper Price">
            <template #suffix> {{base}} </template>
          </n-input>
        </n-space>
      </n-gi>
    </n-grid>
    
    <n-button-group>
      <n-button class="buy-button" type="primary" @click="createBuyOnlyBot">Buy Only</n-button>
      <n-button class="sell-button" type="primary" @click="createSellOnlyBot">Sell Only</n-button>
    </n-button-group>

    <n-card>
      <n-grid x-gap="0" :cols="3" item-responsive style="display: flex; flex-wrap: nowrap;">
        <n-gi>
          <table>
            <tr>
              <td>
                <n-button @click="updateLowerPrice1(0.00003)">  - </n-button>
              </td>
              <td>
                <n-button @click="updateUpperPrice1(0.00003)">  + </n-button>
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
  </n-card>
</template>

<style scoped>
.buy-button {
  background-color: green;
}

.sell-button {
  background-color: red;
}
</style>
