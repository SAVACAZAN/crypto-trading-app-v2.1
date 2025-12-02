<script setup>
import { useAppStore } from '~/stores/app.store';
import { useStrategyGridBot } from '~/composables/useStrategyGridBot';
import StrategiesGridBot from '~/components/StrategiesGridBot.vue';
import {ref, onMounted} from "vue";

const app = useAppStore()
const {
  amountTypeOptions,
  ordersSideOptions
} = useStrategyGridBot();

let userID = useCookie('userID');

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);

let base = currentSymbol.value.split('/')[0];
let quote = currentSymbol.value.split('/')[1];

let name = ref(`gridBot_${generateRandomString(5)}`);
let lowerPrice = ref('');
let upperPrice = ref('');
let amountType = ref('incrementalPercent');
let amount = ref('');
let nrOfGrids = ref('');
let ordersSide = ref('buyOrSell');
let incrementalPercentAmountBuy = ref('');
let incrementalPercentAmountSell = ref('');
let deviationPriceBuy = ref('');
let deviationPriceSell = ref('');
let deviationAmountBuy = ref('');
let deviationAmountSell = ref('');
let usePriceGroup = ref(false);
let priceGroupBuy = ref('');
let priceGroupSell = ref('');

let bestBid = ref(null);
let bestAsk = ref(null);

function generateRandomString(length = 20) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }

  return randomString;
}

// Handle strategy applied from StrategiesGridBot component
function handleStrategyApplied(appliedData) {
  if (appliedData) {
    name.value = appliedData.name;
    lowerPrice.value = appliedData.lowerPrice.toString();
    upperPrice.value = appliedData.upperPrice.toString();
    amount.value = appliedData.amount.toString();
    nrOfGrids.value = appliedData.nrOfGrids.toString();
    ordersSide.value = appliedData.ordersSide;
    amountType.value = appliedData.amountType;
    incrementalPercentAmountBuy.value = appliedData.incBuy.toString();
    incrementalPercentAmountSell.value = appliedData.incSell.toString();
    deviationPriceBuy.value = appliedData.devPriceBuy.toString();
    deviationPriceSell.value = appliedData.devPriceSell.toString();
    deviationAmountBuy.value = appliedData.devAmtBuy.toString();
    deviationAmountSell.value = appliedData.devAmtSell.toString();
    bestBid.value = appliedData.bestBid;
    bestAsk.value = appliedData.bestAsk;

    console.log('✅ Strategy applied and form updated!');
  }
}

async function createGridBot(){

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
    deviationPriceBuy: deviationPriceBuy.value,
    deviationPriceSell: deviationPriceSell.value,
    deviationAmountBuy: deviationAmountBuy.value,
    deviationAmountSell: deviationAmountSell.value,
    usePriceGroup: usePriceGroup.value,
    priceGroupBuy:priceGroupBuy.value,
    priceGroupSell:priceGroupSell.value,
  };

  // console.log(data);

  let response = await $fetch( '/api/v1/createGridBot', {
    method: 'POST',
    body: data
  } );

}

onMounted(() => {
  // Strategies are now loaded in StrategiesGridBot component
})


</script>

<template>
  <ClientOnly>
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
              <!-- Strategies Management Component -->
              <StrategiesGridBot
                :userID="userID?.value"
                :exchange="currentExchange.value"
                :symbol="currentSymbol.value"
                :bestBid="bestBid.value"
                :bestAsk="bestAsk.value"
                :formData="{
                  name,
                  lowerPrice,
                  upperPrice,
                  amountType,
                  amount,
                  nrOfGrids,
                  ordersSide,
                  incrementalPercentAmountBuy,
                  incrementalPercentAmountSell,
                  deviationPriceBuy,
                  deviationPriceSell,
                  deviationAmountBuy,
                  deviationAmountSell,
                  usePriceGroup,
                  priceGroupBuy,
                  priceGroupSell
                }"
                @apply-strategy="handleStrategyApplied"
              />

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
  </ClientOnly>
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
  