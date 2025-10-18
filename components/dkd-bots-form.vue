<script setup>
import { useAppStore } from '~/stores/app.store';
import {ref} from "vue";
const app = useAppStore()

let userID = useCookie('userID');

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);

let base = currentSymbol.value.split('/')[0];
let quote = currentSymbol.value.split('/')[1];

let name = ref(`DkdBot_${generateRandomString(5)}`);

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
    ordersSide.value = action === 'buyOnly' ? 'buyOnly' : 'sellOnly'; // Set ordersSide based on the action

  let data = {
    userID: userID.value,
    name: name.value,
    exchange: currentExchange.value,
    symbol: currentSymbol.value,
    PriceStart: PriceStart.value,
   
    lowerPrice: lowerPrice.value,
    upperPrice: upperPrice.value,
    amountType: amountType.value,
    amount: amount.value,
    nrOfGrids: nrOfGrids.value,
    ordersSide: ordersSide.value,

  };

  // console.log(data);

  let response = await $fetch( '/api/v1/createDkdBot', {
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
      <n-grid x-gap="12" :cols="2">
        <n-gi>
          <n-space vertical>
        
            <n-input v-model:value="name" type="text" placeholder="Bot name" />

            <n-input v-model:value="PriceStart" type="text" placeholder="PriceStart">
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
           
        
     
        
          
     
           

     

          
          </n-space>
        </n-gi>
        
      </n-grid>
      
      <n-button-group>
      <n-button class="buy-button" type="primary" @click="createBuyOnlyBot">Buy Only</n-button>
      <n-button class="sell-button" type="primary" @click="createSellOnlyBot">Sell Only</n-button>
    </n-button-group>

    <span style="margin-right: 10px;"></span>
      

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
