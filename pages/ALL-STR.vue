<template>
    <h2>Frontrunning Bots</h2>
    <TickerBar/>
    <ALL-STR/>
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
