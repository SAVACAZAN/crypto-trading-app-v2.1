<template>

  <n-card>
    <n-tabs v-model:value="activeTab">
      <n-tab-pane name="grid-bots-plus" tab="GridBotPlus">
        <Page1 />
      </n-tab-pane>
      <n-tab-pane name="grid-bots" tab="GridBot">
        <Page2 />
      </n-tab-pane>
      <n-tab-pane name="FrontRun-bots" tab="FrontRunBot">
        <Page3 />
      </n-tab-pane>
      <n-tab-pane name="Scalp1ng" tab="Scalp1ng">
        <Page11 />
      </n-tab-pane>

      <n-tab-pane name="OneClick-Bot" tab="OneClickBot">
        <Page8 />
      </n-tab-pane>

      <!-- <n-tab-pane name="dkd-bots" tab="DkDBot">
        <Page4 />
      </n-tab-pane> -->

      <n-tab-pane name="fib-bots" tab="FibBot">
        <Page5 />
      </n-tab-pane>
      <n-tab-pane name="AI-BOT" tab="AIBOT">
        <Page6 />
      </n-tab-pane>

      <n-tab-pane name="CoPilot" tab="Co-Pilot">
        <Page7 />
      </n-tab-pane>

    
      <n-tab-pane name="1Year-Bot" tab="1YearBot">
        <Page9 />
      </n-tab-pane>

      <n-tab-pane name="Grinder-Bot" tab="GrinderBot">
        <Page10 />
      </n-tab-pane>

     

      <n-tab-pane name="Order-BookBot" tab="OrderBookBot">
        <Page12 />
      </n-tab-pane>

      <n-tab-pane name="PumpDump" tab="Pump&Dump">
        <Page13 />
      </n-tab-pane>

      <n-tab-pane name="BotsAnalysis" tab="Bots Analysis">
        <Page14 />
      </n-tab-pane>

      <n-tab-pane name="Botstechniques" tab="Bots techniques">
        <Page15 />
      </n-tab-pane>

      <n-tab-pane name="machinelearning" tab="machine learning">
        <Page16 />
      </n-tab-pane>
    </n-tabs>

    
  </n-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAppStore } from '~/stores/app.store';

import Page1 from '~/pages/grid-bots-plus.vue'; // Import your page components
import Page2 from '~/pages/grid-bots.vue'; // Import your page components
import Page3 from '~/pages/frontrun.vue'; // Import your page components
// import Page4 from '~/pages/Bots/dkdbots.vue'; // Import your page components - Commented out with tab
import Page5 from '~/pages/Bots/FibBots.vue'; // Import your page components

import Page6 from '~/pages/Bots/AIBOT.vue'; // Import your page components
import Page7 from '~/pages/Bots/Co-Pilot.vue'; // Import your page components
import Page8 from '~/pages/Bots/OneClickBot.vue'; // Import your page components
import Page9 from '~/pages/Bots/1YearBot.vue'; // Import your page components
import Page10 from '~/pages/Bots/GrinderBot.vue'; // Import your page components
import Page11 from '~/pages/Bots/Scalp1ng.vue'; // Import your page components
import Page12 from '~/pages/Bots/OrderBookBot.vue'; // Import your page components
import Page13 from '~/pages/Bots/PumpDump.vue'; // Import your page components
import Page14 from '~/pages/Bots/BotsAnalysis.vue'; // Import your page components
import Page15 from '~/pages/Bots/Botstechniques.vue'; // Import your page components
import Page16 from '~/pages/Bots/machinelearning.vue'; // Import your page components


definePageMeta({
  middleware: 'auth'
});

const app = useAppStore();
let userID = useCookie('userID');
const activeTab = ref('page1');

await app.loadUserExchangeData(userID.value);

onMounted(async () => {
  await app.loadUserExchangeData(userID.value);
});
</script>

<style scoped>
/* Add any necessary styles here */
</style>
