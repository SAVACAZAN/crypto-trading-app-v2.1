
<template>
     <h2>machine</h2>
  <n-grid x-gap="12" :cols="12" item-responsive>
    <n-gi span="12 800:8">
      <TickerBar/>
    
      <machinelearningForm/>
    </n-gi>
    <n-gi span="12 800:4">
      <OrderBook/>
      
      
    </n-gi>
  </n-grid>


</template>




<script setup>
import machinelearningForm from '~/components/Bots/machinelearning-form.vue';


definePageMeta({
  middleware: 'auth'
})
import { useAppStore } from '~/stores/app.store';
const app = useAppStore()
let userID = useCookie('userID');

await app.loadUserExchangeData(userID.value);
</script>
