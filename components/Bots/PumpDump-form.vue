<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useNotification } from 'naive-ui';
import { useAppStore } from '~/stores/app.store';
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async';

const notification = useNotification();
const app = useAppStore();
let userID = useCookie('userID');

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);

let sellPrice = ref('');
let sellSize = ref('');
let buyPrice = ref('');
let buySize = ref('');

let base = ref(currentSymbol.value.split('/')[0]);
let quote = ref(currentSymbol.value.split('/')[1]);

let baseBalance = ref('Loading...');
let quoteBalance = ref('Loading...');

let userBalanceInterval = null;
let orderLoopInterval = null;
let loopCount = 0;
const maxLoops = 10;
let currentOrderType = ''; // 'BUY' or 'SELL'

onMounted(() => {
  userBalanceInterval = setIntervalAsync(fetchUserBalancePooling, 500);
});

onUnmounted(() => {
  clearIntervalAsync(userBalanceInterval);
  if (orderLoopInterval) {
    clearInterval(orderLoopInterval);
  }
});

async function fetchUserBalancePooling() {
  let response = await $fetch('/api/v1/fetchBalance', {
    query: {
      userID: userID.value,
      exchange: currentExchange.value,
    }
  });

  if (response.data) {
    if (response.data[base.value]) {
      quoteBalance.value = `${response.data[base.value].free}`;
    } else {
      quoteBalance.value = `${response.data[quote.value].free}`;
    }

    if (response.data[quote.value]) {
      baseBalance.value = `${response.data[quote.value].free}`;
    } else {
      baseBalance.value = 'N/A';
    }
  } else {
    quoteBalance.value = 'N/A';
    baseBalance.value = 'N/A';
  }
}

async function createOrder(side, type) {
  let data = {
    userID: userID.value,
    exchange: currentExchange.value,
    symbol: currentSymbol.value,
    type: type,
    side: side,
    amount: (side === 'BUY') ? buySize.value : sellSize.value,
    price: (side === 'BUY') ? buyPrice.value : sellPrice.value,
  }

  let response = await $fetch('/api/v1/createOrder', {
    method: 'POST',
    body: data
  });

  if (response.success) {
    notification['info']({
      content: "Order created!",
      meta: `Submitted ${data.exchange} limit ${data.side} order for ${data.amount} ${base.value} by using ${quote.value} at price ${data.price}`,
      duration: 2500,
    });
    return response.orderId; // Asumând că ID-ul ordinului este returnat ca `orderId`
  } else {
    notification['error']({
      content: "Error creating order!",
      meta: response.log,
      duration: 2500,
    });
    return null;
  }
}

async function cancelOrder({ id, symbol }) {
  let data = {
    userID: userID.value,
    exchange: currentExchange.value,
    id: id,
    symbol: symbol,
  }

  let response = await $fetch('/api/v1/cancelOrder', {
    method: 'POST',
    body: data
  });

  let baseSymbol = symbol.split('/')[0];
  let quoteSymbol = symbol.split('/')[1];

  notification['info']({
    content: "Order Cancelled!",
    meta: `Cancelled ${data.exchange} limit ${row.side} order for ${row.amount} ${baseSymbol} by using ${quoteSymbol} at price ${row.price}`,
    duration: 2500,
  });
}

function formatTooltip(value) {
  return `${value}%`;
}

async function placeAndCancelOrder() {
  if (loopCount >= maxLoops) {
    clearInterval(orderLoopInterval);
    orderLoopInterval = null;
    return;
  }

  const side = currentOrderType;
  const orderId = await createOrder(side, 'limit'); // Poți ajusta acest lucru în funcție de cerințele tale

  if (orderId) {
    setTimeout(async () => {
      await cancelOrder({ id: orderId, symbol: currentSymbol.value });
      loopCount++;
    }, 1000); // 1 secundă
  }
}

function startOrderLoop(side) {
  currentOrderType = side;
  loopCount = 0;
  
  if (orderLoopInterval) {
    clearInterval(orderLoopInterval);
  }

  orderLoopInterval = setInterval(placeAndCancelOrder, 2000); // Loop la fiecare 2 secunde pentru a permite 1 secundă între plasare și anulare
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
              <n-input v-model:value="buyPrice" type="text" placeholder="Price">
                <template #suffix> {{quote}} </template>
              </n-input>
              <n-input v-model:value="buySize" type="text" placeholder="Size">
                <template #suffix> {{base}} </template>
              </n-input>
              <n-button type="primary" @click="startOrderLoop('BUY')">BUY/LONG</n-button>
            </n-space>
          </n-gi>
          <n-gi>
            <n-space vertical>
              <span>Avlb: {{ quoteBalance }}</span>
              <n-input v-model:value="sellPrice" type="text" placeholder="Price">
                <template #suffix> {{quote}} </template>
              </n-input>
              <n-input v-model:value="sellSize" type="text" placeholder="Size">
                <template #suffix> {{base}} </template>
              </n-input>
              <n-button type="error" @click="startOrderLoop('SELL')">SELL/SHORT</n-button>
            </n-space>
          </n-gi>
        </n-grid>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<style scoped>

</style>
