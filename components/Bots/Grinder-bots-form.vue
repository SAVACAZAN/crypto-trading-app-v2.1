<script setup>
import { useAppStore } from '~/stores/app.store';
import {ref} from "vue";
const app = useAppStore()

let userID = useCookie('userID');

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);

let base = currentSymbol.value.split('/')[0];
let quote = currentSymbol.value.split('/')[1];

let name = ref(`gridBot_${generateRandomString(5)}`);

let lowerPrice = ref('');
let upperPrice = ref('');


let BalanceBotStart = ref('');
let amount = ref('');

let ordersSide = ref('buyOrSell');
let ordersSideOptions = [
  { value: 'buyOnly', label: 'Buy Only' },
  { value: 'sellOnly', label: 'Sell Only' },
];




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
  await createGrinderBot('buyOnly');
}

async function createSellOnlyBot() {
  await createGrinderBot('sellOnly');
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
   
   
    lowerPrice: lowerPrice.value,
    upperPrice: upperPrice.value,
    BalanceBotStart: BalanceBotStart.value,
    amount: amount.value,
  
    ordersSide: ordersSide.value,
   
   
  };

  // console.log(data);

  let response = await $fetch( '/api/v1/Bots/createGrinderBot', {
    method: 'POST',
    body: data
  } );
  console.log('Response from server:', response);
  } catch (error) {
    console.error('Error creating front run bot:', error);
  }
}





</script>

<template>
  <n-card>
      <n-grid x-gap="12" :cols="2" item-responsive>
        <n-gi>
          <n-space vertical>
            <n-input v-model:value="name" type="text" placeholder="Bot name" />
          
          
           
            <n-button-group>
      <n-button class="buy-button" type="primary" @click="createBuyOnlyBot">Buy Only</n-button>
      <n-button class="sell-button" type="primary" @click="createSellOnlyBot">Sell Only</n-button>
    </n-button-group>
    
          </n-space>
        </n-gi>
        <n-gi>
          <n-space vertical>

       

            <n-input v-model:value="BalanceBotStart" type="text" placeholder="BalanceBotStart" />
            <n-input v-model:value="lowerPrice" type="text" placeholder="Lower Price">
              <template #suffix> {{quote}} </template>
            </n-input>
            <n-input v-model:value="upperPrice" type="text" placeholder="Upper Price">
              <template #suffix> {{quote}} </template>
            </n-input>
            <n-input v-model:value="amount" type="text" placeholder="Amount per grid">
              <template #suffix> {{quote}} </template>
            </n-input>
           
   
          </n-space>
        </n-gi>
      </n-grid>
  </n-card>
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
  