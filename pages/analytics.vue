<template>
  <div style="padding: 20px;">
    <h2 style="color: #60a5fa; margin-bottom: 20px;">📊 Trading Analytics Dashboard</h2>

    <!-- Analytics Tabs (Client-Only to avoid SSR hydration issues) -->
    <ClientOnly>
      <n-tabs type="card" animated default-value="volume">
        <!-- Tab 1: Volume Analysis -->
        <n-tab-pane name="volume" tab="📊 Volume Analysis">
          <VolumeAnalysisContent />
        </n-tab-pane>

        <!-- Tab 2: Technical Indicators -->
        <n-tab-pane name="technical" tab="📈 Technical Indicators">
          <TechnicalIndicatorsContent />
        </n-tab-pane>

        <!-- Tab 3: Support/Resistance & Price Levels -->
        <n-tab-pane name="support-resistance" tab="🎯 Support/Resistance">
          <SupportResistanceContent />
        </n-tab-pane>

        <!-- Tab 4: Trend Analysis -->
        <n-tab-pane name="trend" tab="📈 Trend Analysis">
          <TrendAnalysisContent />
        </n-tab-pane>

        <!-- Tab 5: Trading Signals -->
        <n-tab-pane name="signals" tab="🎯 Trading Signals">
          <TradingSignalsContent />
        </n-tab-pane>

        <!-- Tab 6: OrderBook Analysis -->
        <n-tab-pane name="orderbook" tab="📖 OrderBook Analysis">
          <OrderBookAnalysisContent />
        </n-tab-pane>
      </n-tabs>
      <template #fallback>
        <div style="text-align: center; padding: 40px; color: #888;">
          <div style="font-size: 48px; margin-bottom: 12px;">⏳</div>
          <div>Loading Analytics...</div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup>
import VolumeAnalysisContent from './Analytics/VolumeAnalysis.vue';
import TechnicalIndicatorsContent from './Analytics/TechnicalIndicators.vue';
import SupportResistanceContent from './Analytics/SupportResistance.vue';
import TrendAnalysisContent from './Analytics/TrendAnalysis.vue';
import TradingSignalsContent from './Analytics/TradingSignals.vue';
import OrderBookAnalysisContent from './Analytics/OrderBookAnalysis.vue';

definePageMeta({
  middleware: 'auth'
});
</script>
