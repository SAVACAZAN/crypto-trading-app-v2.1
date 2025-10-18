<template>
    <h2>dkd Bots</h2>
    <TickerBar/>
    <UserInfo/>
  
   
</template>


<script setup>
import UserInfo from '~/components/UserInfo.vue';



definePageMeta({
  middleware: 'auth'
})
import { useAppStore } from '~/stores/app.store';

const app = useAppStore()
let userID = useCookie('userID');

await app.loadUserExchangeData(userID.value);
</script>
