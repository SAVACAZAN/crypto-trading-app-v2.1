<script setup>
const notification = useNotification();
import { useAppStore } from '~/stores/app.store';
import {clearIntervalAsync, setIntervalAsync} from "set-interval-async";
const app = useAppStore()

let userID = useCookie('userID');

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);


let sellPrice = ref('');
let sellSize = ref('');
let sellTotalPercent = ref(0);
let sellTotal = ref('');

let buyPrice = ref('');
let buySize = ref('');
let buyTotalPercent = ref(0);
let buyTotal = ref('');


let base = currentSymbol.value.split('/')[0];
let quote = currentSymbol.value.split('/')[1];

let baseBalance = ref('Loading...');
let quoteBalance = ref('Loading...');

let userBalanceInterval = null;

onMounted(() => {
  userBalanceInterval = setIntervalAsync(fetchUserBalancePooling, 500);
});

onUnmounted(() => {
  clearIntervalAsync(userBalanceInterval);
});

async function fetchUserBalancePooling() {
  let response = await $fetch('/api/v1/fetchBalance', {
    query:{
      userID:userID.value,
      exchange:currentExchange.value,
    }
  });

  if (response.data) {
    if(response.data[base]) {
      quoteBalance.value = `${ response.data[base].free }`;
    } else {
      quoteBalance.value = `${ response.data[quote].free }`;
    }
  } else {
    quoteBalance.value = 'N/A';
  }


  if (response.data) {
    if (response.data[quote]) {
      baseBalance.value = `${ response.data[quote].free }`;
    }
  } else {
    baseBalance.value =  'N/A';
  }
}

function formatTooltip(value) {
  return `${value}%`;
}

async function createOrder(side, type){

  let data = {
    userID:userID.value,
    exchange: currentExchange.value,
    symbol:currentSymbol.value,
    type:type,
    side:side,
    amount:(side === 'BUY') ? buySize.value : sellSize.value,
    price:(side === 'BUY') ? buyPrice.value : sellPrice.value,
  }

  let response = await $fetch( '/api/v1/createOrder', {
    method: 'POST',
    body: data
  } );

  if (response.success) {
    notification['info']({
      content: "Order created!",
      meta: `Submitted ${data.exchange} limit ${data.side} order for ${data.amount} ${base} by using ${quote} at price ${data.price}`,
      duration: 2500,
    });
  } else {
    notification['error']({
      content: "Erorr creating order!",
      meta: response.log,
      duration: 2500,
    });
  }

}

function updateBuyPrice(val) {
  // console.log('changing updateBuyPrice ', val);
}

function updateBuySize(val) {
  // console.log('changing updateBuySize ', val);
  if (buyPrice.value) {
    buyTotal.value = buySize.value * buyPrice.value;
  }
}

watch(buyTotalPercent, (newVal, oldVal) => {
  if (baseBalance.value !== 'Loading...' || baseBalance.value !== 'N/A') {
    buyTotal.value = (baseBalance.value / 100) * newVal;
  } else {
    buyTotal.value = '';
  }

  if (buyPrice.value) {
    buySize.value = ((baseBalance.value / 100) * newVal) / buyPrice.value;
  }
});

function updateBuyTotal(val) {
  // console.log('changing updateBuyTotal ', val);
  if (buyPrice.value) {
    buySize.value = buyTotal.value / buyPrice.value;
  }

  setTimeout(function(){
    buyTotalPercent.value = ((val / baseBalance.value) * 100).toFixed(0);
  }, 100);
}



function updateSellPrice(val) {
  // console.log('changing updateSellPrice ', val);
}

function updateSellSize(val) {
  // console.log('changing updateSellSize ', val);
  if (sellPrice.value) {
    sellTotal.value = sellSize.value * sellPrice.value;
  }
}

watch(sellTotalPercent, (newVal, oldVal) => {
  if ((quoteBalance.value !== 'Loading...' || quoteBalance.value !== 'N/A') && sellPrice.value) {
    sellTotal.value = (quoteBalance.value / 100) * newVal * sellPrice.value;
  } else {
    sellTotal.value = '';
  }

  if (sellPrice.value) {
    sellSize.value = (quoteBalance.value / 100) * newVal;
  }
});

function updateSellTotal(val) {
  // console.log('changing updateBuyTotal ', val);
  if (sellPrice.value) {
    sellSize.value = sellTotal.value / sellPrice.value;
  }

  setTimeout(function(){
    sellTotalPercent.value = ((val / quoteBalance.value) * 100).toFixed(0);
  }, 100);
}

</script>

<template>
  <n-card>
    <n-tabs type="line" animated>
      <n-tab-pane name="Limit Orders" tab="Limit Orders">
        <n-grid x-gap="12" :cols="2">
          <n-gi>
            <n-space vertical>
              <span>Avlb: {{ baseBalance }}</span>
              <n-input v-model:value="buyPrice" type="text" placeholder="Price" @input="updateBuyPrice">
                <template #suffix> {{quote}} </template>
              </n-input>
              <n-input v-model:value="buySize" type="text" placeholder="Size" @input="updateBuySize">
                <template #suffix> {{base}} </template>
              </n-input>
              <n-slider v-model:value="buyTotalPercent" :step="1" :format-tooltip="formatTooltip" />
              <n-input v-model:value="buyTotal" type="text" placeholder="Total" @input="updateBuyTotal">
                <template #suffix> {{quote}} </template>
              </n-input>
              <n-button type="primary" @click="createOrder('BUY', 'limit')">BUY/LONG</n-button>
            </n-space>
          </n-gi>
          <n-gi>
            <n-space vertical>
              <span>Avlb: {{ quoteBalance }}</span>
              <n-input v-model:value="sellPrice" type="text" placeholder="Price" @input="updateSellPrice">
                <template #suffix> {{quote}} </template>
              </n-input>
              <n-input v-model:value="sellSize" type="text" placeholder="Size" @input="updateSellSize">
                <template #suffix> {{base}} </template>
              </n-input>
              <n-slider v-model:value="sellTotalPercent" :step="1" :format-tooltip="formatTooltip" />
              <n-input v-model:value="sellTotal" type="text" placeholder="Total" @input="updateSellTotal">
                <template #suffix> {{quote}} </template>
              </n-input>
              <n-button type="error" @click="createOrder('SELL', 'limit')">SELL/SHORT</n-button>
            </n-space>
          </n-gi>
        </n-grid>
      </n-tab-pane>
      <n-tab-pane name="Market Orders" tab="Market Orders">
        <n-grid x-gap="12" :cols="2">
          <n-gi>
            <n-space vertical>
              <span>Avlb: {{ baseBalance }}</span>
              <n-input v-model:value="buySize" type="text" placeholder="Size">
                <template #suffix> {{base}} </template>
              </n-input>
              <n-slider v-model:value="buyTotalPercent" :step="1" :format-tooltip="formatTooltip" />
              <n-input v-model:value="buyTotal" type="text" placeholder="Total" @input="updateBuyTotal">
                <template #suffix> {{quote}} </template>
              </n-input>
              <n-button type="primary" @click="createOrder('BUY', 'market')">BUY/LONG</n-button>
            </n-space>
          </n-gi>
          <n-gi>
            <n-space vertical>
              <span>Avlb: {{ quoteBalance }}</span>
              <n-input v-model:value="sellSize" type="text" placeholder="Size">
                <template #suffix> {{base}} </template>
              </n-input>
              <n-slider v-model:value="sellTotalPercent" :step="1" :format-tooltip="formatTooltip" />
              <n-input v-model:value="sellTotal" type="text" placeholder="Total" @input="updateSellTotal">
                <template #suffix> {{quote}} </template>
              </n-input>
              <n-button type="error" @click="createOrder('SELL', 'market')">SELL/SHORT</n-button>
            </n-space>
          </n-gi>
        </n-grid>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<style scoped>

</style>
