<template>
    <h2>dkd Bots</h2>
    <TickerBar/>
    <DkdBotsForm/>
    <DkdBotsList/>
   
</template>


<script setup>
import DkdBotsList from '~/components/dkd-bots-list.vue';
import DkdBotsForm from '~/components/dkd-bots-form.vue';


definePageMeta({
  middleware: 'auth'
})
import { useAppStore } from '~/stores/app.store';

const app = useAppStore()
let userID = useCookie('userID');

await app.loadUserExchangeData(userID.value);
</script>
