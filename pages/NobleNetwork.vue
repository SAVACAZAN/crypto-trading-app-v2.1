<template>
  <div class="noble-network-page">
        <!-- Back Button -->
    <div style="margin-bottom: 16px;">
      <n-button text @click="$router.push('/dashboard?tab=cryptowallet')" class="back-button">
        ← Back
      </n-button>
    </div>

<n-card class="api-selector-card" style="margin-bottom: 20px;">
      <template #header>
        <div style="display: flex; align-items: center; gap: 12px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span style="font-size: 16px; font-weight: 600;">Select Hyperliquid Account</span>
        </div>
      </template>
      <n-select v-model:value="selectedKeyId" :options="keyOptions" placeholder="Choose your Hyperliquid wallet..." size="large" :loading="loadingKeys" @update:value="onKeySelect" />
    </n-card>

    <n-card class="scanner-card">
      <n-tabs type="line" animated>
        <n-tab-pane name="wallet" tab="💼 My Wallet">
          <NobleNetworkScanner :walletAddress="selectedWalletAddress" />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import NobleNetworkScanner from '~/components/NobleNetworkScanner.vue';

const selectedKeyId = ref(null);
const hyperliquidKeys = ref([]);
const loadingKeys = ref(false);

const keyOptions = computed(() => hyperliquidKeys.value.map(key => ({
  label: `${key.keyName} - ${key.walletAddress.substring(0, 6)}...${key.walletAddress.substring(key.walletAddress.length - 4)}`,
  value: key._id
})));

const selectedWalletAddress = computed(() => {
  const selectedKey = hyperliquidKeys.value.find(key => key._id === selectedKeyId.value);
  return selectedKey?.walletAddress || '';
});

async function fetchHyperliquidKeys() {
  loadingKeys.value = true;
  try {
    const response = await fetch('/api/v1/hyperliquid-keys', { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (response.ok) {
      const data = await response.json();
      hyperliquidKeys.value = data.keys || [];
      if (hyperliquidKeys.value.length > 0) selectedKeyId.value = hyperliquidKeys.value[0]._id;
    }
  } catch (error) {
    console.error('Error fetching keys:', error);
  } finally {
    loadingKeys.value = false;
  }
}

function onKeySelect(value) { console.log('Selected key:', value); }

onMounted(() => fetchHyperliquidKeys());
</script>

<style scoped>
.noble-network-page { padding: 20px; max-width: 1400px; margin: 0 auto; }
.api-selector-card { background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); border: 1px solid #e0e0e0; }
.scanner-card { background: white; border: 1px solid #e0e0e0; }
</style>
