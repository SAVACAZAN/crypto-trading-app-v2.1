
<template>
     <h2>Bots Analysis</h2>
  <n-grid x-gap="12" :cols="12" item-responsive>
    <n-gi span="12 800:8">
      <TickerBar/>
    
      <BotsAnalysis/>
    </n-gi>
    <n-gi span="12 800:4">
      <OrderBook/>
      
      
    </n-gi>
  </n-grid>


</template>




<script setup>
import BotsAnalysis from '~/components/Bots/BotsAnalysis-form.vue';

definePageMeta({
  middleware: 'auth'
})
import { useAppStore } from '~/stores/app.store';
const app = useAppStore()
let userID = useCookie('userID');

await app.loadUserExchangeData(userID.value);
</script>
