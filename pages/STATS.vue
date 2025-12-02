<template>
  <div class="stats-container">
 

    <n-card class="stats-content-card">
      <n-tabs
        v-model:value="activeTab"
        type="card"
        animated
        size="small"
        class="stats-tabs"
      >
        <n-tab-pane name="market" tab="📊 Market Stats">
          <MarketStatsPage />
        </n-tab-pane>

        <n-tab-pane name="fibonacci" tab="📈 Fibonacci Levels">
          <FibonacciLevelPage />
        </n-tab-pane>

        <n-tab-pane name="spectrum" tab="📉 Price Spectrum">
          <PriceSpectrumPage />
        </n-tab-pane>

        <n-tab-pane name="eth-pyramid" tab="Ξ ETH Pyramid">
          <LCXtoETHPyramidPage />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import MarketStatsPage from './MarketSTATS.vue';
import FibonacciLevelPage from './LCXFibonacciLevel.vue';
import PriceSpectrumPage from './PriceRangeSpectrumPage.vue';
import LCXtoETHPyramidPage from './LCXtoETHPyramid.vue';

definePageMeta({
  middleware: 'auth'
});

const activeTab = ref('market');
</script>

<style scoped>
.stats-container {
  padding: 12px;
  max-width: 100%;
  height: 100%;
}

.stats-header-card {
  background: linear-gradient(135deg, rgba(245, 166, 35, 0.1) 0%, rgba(243, 156, 18, 0.1) 100%);
  border: 1px solid rgba(245, 166, 35, 0.3);
}

.stats-icon {
  font-size: 48px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.stats-content-card {
  min-height: calc(100vh - 240px);
}

.stats-tabs :deep(.n-tabs-nav) {
  background: rgba(0, 0, 0, 0.3);
}

.stats-tabs :deep(.n-tabs-tab) {
  font-weight: 600;
  font-size: 11px;
  padding: 6px 12px;
}

.stats-tabs :deep(.n-tabs-tab:hover) {
  background: rgba(245, 166, 35, 0.2);
}

.stats-tabs :deep(.n-tabs-tab--active) {
  background: linear-gradient(135deg, rgba(245, 166, 35, 0.3) 0%, rgba(243, 156, 18, 0.3) 100%);
  border-bottom: 2px solid #f5a623;
}

.stats-tabs :deep(.n-tab-pane) {
  padding: 12px 0;
}
</style>
