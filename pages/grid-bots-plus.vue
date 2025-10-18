<template>
  <n-grid x-gap="12" :cols="12" item-responsive>
    <n-gi span="1 800:3">

     
      <GridBotsFormPlus/>
      
      <!-- <Chart/> -->
     
    </n-gi>


    
    <n-gi span="12 800:3">
      <TickerBar/>
      <OrderBook/>
   
    </n-gi>



    <n-gi span="2 800:6">
      <GridBotsBalance/>
      <GridBotsList/>
      <OpenOrdersDev :use-store-api-key="true"/>


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
