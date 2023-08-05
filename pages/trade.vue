<template>
    <n-grid x-gap="12" :cols="12">
        <n-gi span="8">
          <TickerBar/>
          <Chart/>
          <OrderList/>
        </n-gi>
        <n-gi span="4">
          <OrderBook/>
          <ExchangeForm/>
        </n-gi>
    </n-grid>


</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})
import { useAppStore } from '~/stores/app.store';
const app = useAppStore()
let userID = useCookie('userID');

await app.loadUserExchangeData(userID.value);

</script>
