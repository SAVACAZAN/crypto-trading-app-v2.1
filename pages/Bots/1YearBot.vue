
<template>
     <h2>1YearBot</h2>
  <n-grid x-gap="12" :cols="12" item-responsive>
    <n-gi span="12 800:8">
      <TickerBar/>
    
      <YearBotsForm/>
    </n-gi>
    <n-gi span="12 800:4">
      <OrderBook/>
      
      
    </n-gi>
  </n-grid>


</template>




<script setup>
import YearBotsForm from '~/components/Bots/1Year-bots-form.vue';

definePageMeta({
  middleware: 'auth'
})
import { useAppStore } from '~/stores/app.store';
const app = useAppStore()
let userID = useCookie('userID');

await app.loadUserExchangeData(userID.value);
</script>
