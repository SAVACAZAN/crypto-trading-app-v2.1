
<template>
   
  <n-grid x-gap="12" :cols="2" item-responsive>
  
    <n-gi span="12 800:4">
  
      <OneClickbotsform/>
      
    </n-gi>
  </n-grid>


</template>




<script setup>
import OneClickbotsform from '~/components/Bots/OneClick-bots-form.vue';

definePageMeta({
  middleware: 'auth'
})
import { useAppStore } from '~/stores/app.store';
const app = useAppStore()
let userID = useCookie('userID');

await app.loadUserExchangeData(userID.value);
</script>
