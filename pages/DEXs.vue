<template>
  <div class="dexs-container">
    <n-card class="dexs-header-card" style="margin-bottom: 16px;">
      <template #header>
        <div style="display: flex; align-items: center; gap: 16px;">
          <div class="dexs-icon">🔄</div>
          <div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #00d4ff 0%, #ff6600 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              Decentralized Exchanges (DEXs)
            </h1>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #888;">
              Trade on leading DEX platforms - Hyperliquid, Asterdex, Apex Exchange
            </p>
          </div>
        </div>
      </template>
    </n-card>

    <n-card class="dexs-content-card">
      <n-tabs
        v-model:value="activeTab"
        type="card"
        animated
        size="large"
        class="dexs-tabs"
      >
        <n-tab-pane name="hyperliquid" tab="⚡ Hyperliquid">
          <HyperliquidPage />
        </n-tab-pane>

        <n-tab-pane name="asterdex" tab="⭐ Asterdex">
          <AsterdexPage />
        </n-tab-pane>

        <n-tab-pane name="apex" tab="🎯 Apex Exchange">
          <ApexExchangePage />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import HyperliquidPage from './hyperliquid.vue';
import AsterdexPage from './asterdex.vue';
import ApexExchangePage from './apex-exchange.vue';

definePageMeta({
  middleware: 'auth'
});

const activeTab = ref('hyperliquid');
</script>

<style scoped>
.dexs-container {
  padding: 24px;
  max-width: 100%;
  height: 100%;
}

.dexs-header-card {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(255, 102, 0, 0.1) 100%);
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.dexs-icon {
  font-size: 48px;
  animation: rotate 10s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.dexs-content-card {
  min-height: calc(100vh - 240px);
}

.dexs-tabs :deep(.n-tabs-nav) {
  background: rgba(0, 0, 0, 0.3);
}

.dexs-tabs :deep(.n-tabs-tab) {
  font-weight: 600;
  font-size: 14px;
  padding: 12px 20px;
}

.dexs-tabs :deep(.n-tabs-tab:hover) {
  background: rgba(0, 212, 255, 0.2);
}

.dexs-tabs :deep(.n-tabs-tab--active) {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.3) 0%, rgba(255, 102, 0, 0.3) 100%);
  border-bottom: 3px solid #00d4ff;
}

.dexs-tabs :deep(.n-tab-pane) {
  padding: 20px 0;
}
</style>
