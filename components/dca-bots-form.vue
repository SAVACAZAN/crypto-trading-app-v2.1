<script setup>
import {ref} from "vue";
import {useAppStore} from "~/stores/app.store";
const app = useAppStore()
let userID = useCookie('userID');

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);

const direction = ref('long');
const directionOptions = [
  {
    label:'Long',
    value:'long'
  },
  {
    label:'Short',
    value:'short'
  },
];
const baseOrderAmount = ref('');
const baseOrderType = ref('limit');
const baseOrderTypeOptions = [
  {
    label:'Limit',
    value:'limit'
  },
  {
    label:'Market',
    value:'market'
  },
]
const takeProfitOrderPercent = ref('');
const safetyOrderAmount = ref('');
const safetyOrderPercent = ref('');
const maxSafetyOrdersCount = ref('');
const stopLossOrderPercent = ref('');
const leverage = ref('');
const marketType = ref('');
const dealStartCondition = ref('always');
const dealStartConditionOptions = [
  {
    label:'Always',
    value:'always'
  },
]

async function submit(){
  console.log('clicked')

  let data = {
    userID:userID.value,
    isRunning:true,
    exchange: currentExchange.value,
    symbol:currentSymbol.value,
    direction:direction.value,
    baseOrderAmount:baseOrderAmount.value,
    baseOrderType:baseOrderType.value,
    takeProfitOrderPercent:takeProfitOrderPercent.value,
    safetyOrderAmount:safetyOrderAmount.value,
    safetyOrderPercent:safetyOrderPercent.value,
    maxSafetyOrdersCount:maxSafetyOrdersCount.value,
    stopLossOrderPercent:stopLossOrderPercent.value,
    leverage:leverage.value,
    marketType: baseOrderType.value,
    dealStartCondition: dealStartCondition.value,
  }

  await $fetch( '/api/v1/createDCABot', {
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
            <n-select v-model:value="direction" :options="directionOptions" placeholder="Select direction" />
            <n-input v-model:value="baseOrderAmount" type="text" placeholder="Base Order Amount" />
            <n-select v-model:value="baseOrderType" :options="baseOrderTypeOptions"/>
            <n-input v-model:value="takeProfitOrderPercent" type="text" placeholder="Take profit percent" />
            <n-input v-model:value="safetyOrderAmount" type="text" placeholder="Safety order amount" />

            <n-button type="primary" @click="submit()">
              Submit
            </n-button>
          </n-space>
        </n-gi>
        <n-gi>
          <n-space vertical>
            <n-input v-model:value="safetyOrderPercent" type="text" placeholder="Safety orders percent" />
            <n-input v-model:value="maxSafetyOrdersCount" type="text" placeholder="Max safety orders count" />
            <n-input v-model:value="stopLossOrderPercent" type="text" placeholder="Stop loss percent" />
            <n-input v-model:value="leverage" type="text" placeholder="Leverage" />
            <n-select v-model:value="dealStartCondition" :options="dealStartConditionOptions" />
          </n-space>
        </n-gi>
      </n-grid>
  </n-card>
</template>

<style scoped>

</style>
