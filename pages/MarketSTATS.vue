<template>
  <div class="market-stats-page">
    <!-- Header with selected coin info -->
    <div class="stats-header">
      <div class="coin-info">
        <h1>{{ selectedCoin }} Market Statistics</h1>
        <p class="subtitle">{{ selectedSymbol }} on {{ selectedExchange }}</p>
      </div>
      <div class="current-price">
        <span class="label">Current Price:</span>
        <span class="price">${{ currentPrice?.toFixed(6) || '0.00' }}</span>
      </div>
    </div>

    <!-- Tabs -->
    <n-tabs
      v-model:value="activeTab"
      type="line"
      animated
      class="stats-tabs"
    >
      <!-- Ticker Analyst Tab -->
      <n-tab-pane name="tickersAnalist" tab="📊 Price Analysis">
        <TickersAnalistTab
          :symbol="selectedSymbol"
          :exchange="selectedExchange"
          :coin="selectedCoin"
        />
      </n-tab-pane>

      <!-- Volume Analysis Tab -->
      <n-tab-pane name="volume" tab="📈 Volume Analysis">
        <VolumeAnalysisTab
          :symbol="selectedSymbol"
          :exchange="selectedExchange"
          :coin="selectedCoin"
        />
      </n-tab-pane>

      <!-- Order Book Tab -->
      <n-tab-pane name="orderbook" tab="📖 Order Book">
        <OrderBookTab
          :symbol="selectedSymbol"
          :exchange="selectedExchange"
          :coin="selectedCoin"
        />
      </n-tab-pane>

      <!-- Market Depth Tab -->
      <n-tab-pane name="depth" tab="🌊 Market Depth">
        <MarketDepthTab
          :symbol="selectedSymbol"
          :exchange="selectedExchange"
          :coin="selectedCoin"
        />
      </n-tab-pane>

      <!-- Statistics Tab -->
      <n-tab-pane name="stats" tab="📋 Statistics">
        <StatisticsTab
          :symbol="selectedSymbol"
          :exchange="selectedExchange"
          :coin="selectedCoin"
        />
      </n-tab-pane>

      <!-- NEW TAB 1: Market Analysis & Indicators -->
      <n-tab-pane name="indicators" tab="🔬 Market Indicators">
        <MarketIndicatorsTab
          :symbol="selectedSymbol"
          :exchange="selectedExchange"
          :coin="selectedCoin"
        />
      </n-tab-pane>

      <!-- NEW TAB 2: Lead/Lag & Temporal Correlation -->
      <n-tab-pane name="leadlag" tab="⏱️ Lead/Lag Analysis">
        <LeadLagTab
          :symbol="selectedSymbol"
          :exchange="selectedExchange"
          :coin="selectedCoin"
        />
      </n-tab-pane>

      <!-- NEW TAB 3: Predictions & Logic Models -->
      <n-tab-pane name="predictions" tab="🔮 Predictions">
        <PredictionsTab
          :symbol="selectedSymbol"
          :exchange="selectedExchange"
          :coin="selectedCoin"
        />
      </n-tab-pane>

      <!-- NEW TAB 4: Advanced Visualizations -->
      <n-tab-pane name="charts" tab="📈 Advanced Charts">
        <AdvancedChartsTab
          :symbol="selectedSymbol"
          :exchange="selectedExchange"
          :coin="selectedCoin"
        />
      </n-tab-pane>

      <!-- NEW TAB 5: Extended Statistics & Metrics -->
      <n-tab-pane name="metrics" tab="📊 Extended Metrics">
        <ExtendedMetricsTab
          :symbol="selectedSymbol"
          :exchange="selectedExchange"
          :coin="selectedCoin"
        />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAppStore } from '~/stores/app.store';
import TickersAnalistTab from '~/components/MarketSTATS/TickersAnalistTab.vue';
import VolumeAnalysisTab from '~/components/MarketSTATS/VolumeAnalysisTab.vue';
import OrderBookTab from '~/components/MarketSTATS/OrderBookTab.vue';
import MarketDepthTab from '~/components/MarketSTATS/MarketDepthTab.vue';
import StatisticsTab from '~/components/MarketSTATS/StatisticsTab.vue';
import MarketIndicatorsTab from '~/components/MarketSTATS/MarketIndicatorsTab.vue';
import LeadLagTab from '~/components/MarketSTATS/LeadLagTab.vue';
import PredictionsTab from '~/components/MarketSTATS/PredictionsTab.vue';
import AdvancedChartsTab from '~/components/MarketSTATS/AdvancedChartsTab.vue';
import ExtendedMetricsTab from '~/components/MarketSTATS/ExtendedMetricsTab.vue';

const appStore = useAppStore();

// Active tab
const activeTab = ref('tickersAnalist');

// Get selected symbol and exchange from store (synced with ticker-bar)
const selectedSymbol = computed(() => appStore.getUserSelectedMarket || 'LCX/USDC');
const selectedExchange = computed(() => appStore.getUserSelectedExchange || 'coinbaseadvanced');
const selectedCoin = computed(() => selectedSymbol.value.split('/')[0]);

// Current price from store
const currentPrice = computed(() => appStore.currentPrice);

// Watch for changes in ticker-bar selection
watch([selectedSymbol, selectedExchange], () => {
  console.log(`📊 MarketSTATS updated: ${selectedSymbol.value} on ${selectedExchange.value}`);
});
</script>

<style scoped>
.market-stats-page {
  height: calc(100vh - 95px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #0a0e27;
  padding: 20px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.coin-info h1 {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px 0;
}

.coin-info .subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.current-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.current-price .label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

.current-price .price {
  font-size: 32px;
  font-weight: 700;
  color: #4ade80;
  font-family: 'Courier New', monospace;
}

.stats-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.stats-tabs :deep(.n-tabs-nav) {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 8px;
  margin-bottom: 20px;
}

.stats-tabs :deep(.n-tabs-tab) {
  font-size: 14px;
  font-weight: 600;
  padding: 12px 24px;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
}

.stats-tabs :deep(.n-tabs-tab--active) {
  background: rgba(74, 222, 128, 0.1);
  color: #4ade80;
  border-radius: 8px;
}

.stats-tabs :deep(.n-tabs-tab:hover) {
  color: #fff;
}

.stats-tabs :deep(.n-tabs-pane-wrapper) {
  flex: 1;
  overflow: auto;
}

/* Scrollbar styling */
.stats-tabs :deep(.n-tabs-pane-wrapper)::-webkit-scrollbar {
  width: 8px;
}

.stats-tabs :deep(.n-tabs-pane-wrapper)::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.stats-tabs :deep(.n-tabs-pane-wrapper)::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.stats-tabs :deep(.n-tabs-pane-wrapper)::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
