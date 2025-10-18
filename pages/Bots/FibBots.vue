
<template>
     <h2>Fib Bots</h2>
  <n-grid x-gap="12" :cols="12" item-responsive>
    <n-gi span="12 800:8">
    
    
      <FibBotsForm/>
    </n-gi>
    <n-gi span="12 800:4">

      
      
    </n-gi>
  </n-grid>


</template>




<script setup>
import FibBotsForm from '~/components/Bots/fib-bots-form.vue';

definePageMeta({
  middleware: 'auth'
})
import { useAppStore } from '~/stores/app.store';
const app = useAppStore()
let userID = useCookie('userID');

await app.loadUserExchangeData(userID.value);
</script>
