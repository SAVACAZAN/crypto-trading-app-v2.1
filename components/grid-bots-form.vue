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
let strategyPicker = ref();
let strategyPickerOptions = [];
let lowerPrice = ref('');
let upperPrice = ref('');
let amountType = ref('quantityPerGrid');
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
let usePriceGroup = ref(true);
let priceGroupBuy = ref('');
let priceGroupSell = ref('');

function generateRandomString(length = 20) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }

  return randomString;
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

  console.log(data);

  let response = await $fetch( '/api/v1/createGridBot', {
    method: 'POST',
    body: data
  } );

}


</script>

<template>
  <n-card>
      <n-grid x-gap="12" :cols="2">
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
            <n-select v-model:value="strategyPicker" :options="strategyPickerOptions" placeholder="Select strategy"/>
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
</template>

<style scoped>

</style>
