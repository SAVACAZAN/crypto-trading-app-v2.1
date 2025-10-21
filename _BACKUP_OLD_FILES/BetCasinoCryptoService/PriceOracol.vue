<template>
    <h2>Frontrunning Bots</h2>
  
    <PriceOracol/>
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
