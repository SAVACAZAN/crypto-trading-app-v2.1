<template>
  <div class="arbtoolz-page">
    <!-- Modern Compact Tabs -->
    <n-card class="arbtoolz-card" size="small">
      <template #header>
   
      </template>

      <n-tabs
        v-model:value="activeTab"
        type="card"
        size="small"
        animated
        class="arbtoolz-tabs"
        tab-style="min-width: 80px; padding: 8px 12px;"
      >
        <!-- Trading -->
        <n-tab-pane name="trade" tab="💹 Trade">
          <TradePage />
        </n-tab-pane>

        <!-- Grid Bots -->
        <n-tab-pane name="grid-bots-plus" tab="⚡ GridBot+">
          <Page1 />
        </n-tab-pane>

     <n-tab-pane name="OneClick-Bot" tab="🖱️ OneClick">
          <Page8 />
        </n-tab-pane>


      
        <!-- Trading Bots -->
        <n-tab-pane name="FrontRun-bots" tab="🏃 FrontRun">
          <Page3 />
        </n-tab-pane>
    <n-tab-pane name="CoPilot" tab="✈️ Co-Pilot">
          <Page7 />
        </n-tab-pane>
  <n-tab-pane name="dca-grid" tab="📊 DCA + Grid">
          <DcaIntegrationPage />
        </n-tab-pane>
        <n-tab-pane name="smart-dca" tab="🎯 Smart DCA">
          <Page9 />
        </n-tab-pane>
          <n-tab-pane name="grid-bots" tab="📊 GridBot">
          <Page2 />
        </n-tab-pane>

        <n-tab-pane name="Scalp1ng" tab="🎯 Scalping">
          <Page11 />
        </n-tab-pane>
   
        <!-- Strategy Bots -->
        <n-tab-pane name="fib-bots" tab="📈 FibBot">
          <Page5 />
        </n-tab-pane>
        <n-tab-pane name="AI-BOT" tab="🧠 AI Bot">
          <Page6 />
        </n-tab-pane>
    

        <!-- Advanced Bots -->
      
        <n-tab-pane name="Grinder-Bot" tab="⚙️ Grinder">
          <Page10 />
        </n-tab-pane>
        <n-tab-pane name="Order-BookBot" tab="📖 OrderBook">
          <Page12 />
        </n-tab-pane>
        <n-tab-pane name="PumpDump" tab="💥 Pump&Dump">
          <Page13 />
        </n-tab-pane>

        <!-- Analysis & Learning -->
        <n-tab-pane name="BotsAnalysis" tab="📊 Analysis">
          <Page14 />
        </n-tab-pane>
        <n-tab-pane name="Botstechniques" tab="🔧 Techniques">
          <Page15 />
        </n-tab-pane>
        <n-tab-pane name="machinelearning" tab="🤖 ML">
          <Page16 />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAppStore } from '~/stores/app.store';

import TradePage from '~/pages/trade.vue';
import Page1 from '~/pages/grid-bots-plus.vue';
import Page2 from '~/pages/grid-bots.vue';
import Page3 from '~/pages/frontrun.vue';
import Page5 from '~/pages/Bots/FibBots.vue';
import Page6 from '~/pages/Bots/AIBOT.vue';
import Page7 from '~/pages/Bots/Co-Pilot.vue';
import Page8 from '~/pages/Bots/OneClickBot.vue';
import DcaIntegrationPage from '~/pages/dca-integration.vue';
import Page9 from '~/pages/smart-dca.vue';
import Page10 from '~/pages/Bots/GrinderBot.vue';
import Page11 from '~/pages/Bots/Scalp1ng.vue';
import Page12 from '~/pages/Bots/OrderBookBot.vue';
import Page13 from '~/pages/Bots/PumpDump.vue';
import Page14 from '~/pages/Bots/BotsAnalysis.vue';
import Page15 from '~/pages/Bots/Botstechniques.vue';
import Page16 from '~/pages/Bots/machinelearning.vue';

definePageMeta({
  middleware: 'auth'
});

const app = useAppStore();
let userID = useCookie('userID');
const activeTab = ref('grid-bots-plus');

await app.loadUserExchangeData(userID.value);

onMounted(async () => {
  await app.loadUserExchangeData(userID.value);
});
</script>

<style scoped>
.arbtoolz-page {
  padding: 0;
  width: 100%;
  height: calc(100vh - 95px);
  overflow-y: auto;
  background: #0f1419;
}

/* Card Container */
.arbtoolz-card {
  background: #1a1f2e;
  border: 1px solid #2a3441;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.n-card__content) {
  padding: 0 !important;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.header-icon {
  font-size: 18px;
}

.header-title {
  font-size: 14px;
  font-weight: 600;
  color: #e0e0e0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Tabs Styling */
.arbtoolz-tabs {
  background: transparent;
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.n-tabs-nav) {
  background: #0f1419;
  padding: 8px;
  border-bottom: 1px solid #2a3441;
}

:deep(.n-tabs-tab) {
  background: #1a1f2e;
  border: 1px solid #2a3441;
  border-radius: 4px;
  color: #888;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  transition: all 0.2s;
  margin-right: 4px;
  min-width: 80px;
  padding: 8px 12px;
}

:deep(.n-tabs-tab:hover) {
  background: #242936;
  color: #e0e0e0;
  border-color: #4a5461;
}

:deep(.n-tabs-tab--active) {
  background: #6366f1 !important;
  color: #ffffff !important;
  border-color: #6366f1 !important;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

:deep(.n-tabs-tab__label) {
  font-size: 11px;
}

:deep(.n-tabs-pane-wrapper) {
  padding: 0;
  flex: 1;
  overflow-y: auto;
}

:deep(.n-tab-pane) {
  padding: 16px;
  height: auto;
  min-height: 100%;
  overflow-y: visible;
}

/* Responsive Design */
@media (max-width: 1400px) {
  :deep(.n-tabs-tab) {
    min-width: 70px;
    padding: 6px 10px;
    font-size: 10px;
  }
}

@media (max-width: 768px) {
  .arbtoolz-page {
    padding: 4px;
  }

  .header-title {
    font-size: 12px;
  }

  :deep(.n-tabs-tab) {
    min-width: 60px;
    padding: 6px 8px;
    font-size: 9px;
  }
}

/* Scrollbar for tabs navigation */
:deep(.n-tabs-nav__scrollbar) {
  height: 4px;
  background: #2a3441;
}

:deep(.n-tabs-nav__scrollbar-content) {
  background: #6366f1;
  border-radius: 2px;
}
</style>
