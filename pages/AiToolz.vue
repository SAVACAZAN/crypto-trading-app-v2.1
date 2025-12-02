<template>
  <div class="ai-toolz-page">
    <!-- Tabs Navigation -->
    <n-tabs type="line" animated size="small" class="ai-tabs">
      <n-tab-pane name="v1" tab="🌟 AI Grid Bots V1 (Glassmorphism)">
        <GridBotsAIV1 />
      </n-tab-pane>

      <n-tab-pane name="v2" tab="⚡ AI Grid Bots V2 (Neon)">
        <GridBotsAIV2 />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAppStore } from '~/stores/app.store';

// Import page components
import GridBotsAIV1 from './grid-bots-plus-AI.vue';
import GridBotsAIV2 from './grid-bots-plus-AIv2.vue';

definePageMeta({
  middleware: 'auth'
});

const app = useAppStore();
const userID = useCookie('userID');

// Load user exchange data in onMounted to avoid blocking
onMounted(async () => {
  await app.loadUserExchangeData(userID.value);
});
</script>

<style scoped>
/* ========== COMPACT AI TOOLZ PAGE (FIXED TOP) ========== */
.ai-toolz-page {
  padding: 0;
  height: calc(100vh - 95px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ai-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ========== COMPACT TABS (SUBȚIRI, LIPITE SUS) ========== */
:deep(.n-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.n-tabs .n-tabs-nav-scroll-wrapper) {
  background: rgba(20, 20, 20, 0.9);
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.n-tabs .n-tabs-nav) {
  background: transparent;
  border-radius: 0;
  padding: 0 12px;
  height: 36px;
}

:deep(.n-tabs .n-tabs-wrapper) {
  padding: 0 !important;
}

:deep(.n-tabs .n-tabs-tab) {
  font-weight: 700;
  font-size: 11px;
  padding: 6px 16px;
  transition: all 0.2s ease;
  border-radius: 0;
  height: 36px;
  line-height: 24px;
}

:deep(.n-tabs .n-tabs-tab:hover) {
  background: rgba(0, 255, 255, 0.1);
  color: #00ffff;
}

:deep(.n-tabs .n-tabs-tab.n-tabs-tab--active) {
  background: rgba(0, 255, 255, 0.15);
  color: #00ffff;
  text-shadow: 0 0 5px #00ffff;
  border-bottom: 2px solid #00ffff;
}

:deep(.n-tabs .n-tabs-tab-pad) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.n-tabs .n-tabs-pane-wrapper) {
  flex: 1;
  overflow: hidden;
  padding: 0;
}

:deep(.n-tabs .n-tab-pane) {
  padding: 0;
  height: 100%;
}
</style>
