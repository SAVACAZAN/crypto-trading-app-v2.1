
<template>
     <h2>Co-Pilot Bots</h2>
  <n-grid x-gap="12" :cols="12" item-responsive>
    <n-gi span="12 800:8">
      <TickerBar/>
    
      <CoPilot/>
    </n-gi>
    <n-gi span="12 800:4">
      <OrderBook/>
      
      
    </n-gi>
  </n-grid>


</template>




<script setup>
import CoPilot from '~/components/Bots/Co-Pilot-bots-form.vue';

definePageMeta({
  middleware: 'auth'
})
import { useAppStore } from '~/stores/app.store';
const app = useAppStore()
let userID = useCookie('userID');

await app.loadUserExchangeData(userID.value);
</script>
