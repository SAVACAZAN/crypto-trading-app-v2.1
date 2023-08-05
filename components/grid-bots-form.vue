<script setup>
import { useAppStore } from '~/stores/app.store';
import {ref} from "vue";
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


}


</script>

<template>
  <n-card>
      <n-grid x-gap="12" :cols="2">
        <n-gi>
          <n-space vertical>

          </n-space>
        </n-gi>
        <n-gi>
          <n-space vertical>

          </n-space>
        </n-gi>
      </n-grid>
  </n-card>
</template>

<style scoped>

</style>
