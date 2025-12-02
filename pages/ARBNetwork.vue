<template>
  <div class="arb-network-page">
        <!-- Back Button -->
    <div style="margin-bottom: 16px;">
      <n-button text @click="$router.push('/dashboard?tab=cryptowallet')" class="back-button">
        ← Back
      </n-button>
    </div>

    <!-- Hyperliquid Account Selector -->
    <n-card class="api-selector-card" style="margin-bottom: 24px;">
      <template #header>
        <div style="display: flex; align-items: center; gap: 12px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2d81e0" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span style="font-size: 16px; font-weight: 600;">Select Hyperliquid Account</span>
        </div>
      </template>

      <n-space vertical :size="16">
        <n-select
          v-model:value="selectedKeyId"
          :options="keyOptions"
          placeholder="Choose your Hyperliquid wallet..."
          size="large"
          @update:value="onKeySelect"
        >
          <template #empty>
            <div style="padding: 20px; text-align: center;">
              <p style="color: #888; margin-bottom: 12px;">No Hyperliquid accounts configured</p>
              <n-button type="primary" size="small" @click="navigateToProfile">
                Add Hyperliquid Account
              </n-button>
            </div>
          </template>
        </n-select>

        <div v-if="selectedKey" class="selected-wallet-info">
          <div class="info-row">
            <span class="info-label">Wallet Address:</span>
            <code class="wallet-address">{{ selectedKey.walletAddress }}</code>
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <n-tag :bordered="false" type="success" size="small">Connected</n-tag>
          </div>
          <div class="info-row">
            <span class="info-label">Network:</span>
            <n-tag :bordered="false" type="info" size="small">Arbitrum One</n-tag>
          </div>
        </div>
      </n-space>
    </n-card>

    <!-- Arbitrum Network Scanner Tabs -->
    <n-card class="scanner-card">
      <template #header>
        <div style="display: flex; align-items: center; gap: 12px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2d81e0" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
          <span style="font-size: 18px; font-weight: 600; color: #2d81e0;">Arbitrum Network Scanner</span>
        </div>
      </template>

      <n-tabs type="line" animated>
        <!-- My Wallet Tab -->
        <n-tab-pane name="wallet" tab="💼 My Wallet">
          <div v-if="selectedWalletAddress" class="tab-content">
            <ARBNetworkScanner :walletAddress="selectedWalletAddress" />
          </div>
          <div v-else class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.5">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <h3>No Wallet Selected</h3>
            <p>Please select a Hyperliquid account to scan Arbitrum network</p>
          </div>
        </n-tab-pane>

        <!-- Network Stats Tab -->
        <n-tab-pane name="stats" tab="📊 Network Stats">
          <div class="tab-content">
            <n-grid cols="1 s:2 m:3 l:4" responsive="screen" :x-gap="16" :y-gap="16">
              <n-grid-item>
                <n-statistic label="Network" value="Arbitrum One">
                  <template #prefix>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2d81e0" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                  </template>
                </n-statistic>
              </n-grid-item>
              <n-grid-item>
                <n-statistic label="Chain ID" value="42161">
                  <template #prefix>#</template>
                </n-statistic>
              </n-grid-item>
              <n-grid-item>
                <n-statistic label="Currency" value="ETH">
                  <template #prefix>Ξ</template>
                </n-statistic>
              </n-grid-item>
              <n-grid-item>
                <n-statistic label="Block Explorer" value="Arbiscan">
                  <template #prefix>🔍</template>
                </n-statistic>
              </n-grid-item>
            </n-grid>

            <n-divider />

            <div style="margin-top: 24px;">
              <h3 style="margin-bottom: 16px;">Network Information</h3>
              <n-space vertical :size="12">
                <div class="info-card">
                  <strong>RPC URL:</strong>
                  <code>https://arb1.arbitrum.io/rpc</code>
                </div>
                <div class="info-card">
                  <strong>Explorer:</strong>
                  <a href="https://arbiscan.io" target="_blank" rel="noopener" style="color: #2d81e0;">https://arbiscan.io</a>
                </div>
                <div class="info-card">
                  <strong>Bridge:</strong>
                  <a href="https://bridge.arbitrum.io" target="_blank" rel="noopener" style="color: #2d81e0;">https://bridge.arbitrum.io</a>
                </div>
              </n-space>
            </div>
          </div>
        </n-tab-pane>

        <!-- Token Scanner Tab -->
        <n-tab-pane name="tokens" tab="🪙 Token Scanner">
          <div class="tab-content">
            <n-space vertical :size="16">
              <n-input
                v-model:value="tokenSearchAddress"
                placeholder="Enter ARB token contract address (0x...)"
                size="large"
                clearable
              >
                <template #prefix>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </template>
              </n-input>

              <n-button type="primary" size="large" @click="searchToken" :loading="searchingToken">
                Search Token on Arbitrum
              </n-button>

              <div v-if="tokenInfo" class="token-info-display">
                <h4>Token Information</h4>
                <n-descriptions bordered :column="2">
                  <n-descriptions-item label="Name">{{ tokenInfo.name }}</n-descriptions-item>
                  <n-descriptions-item label="Symbol">{{ tokenInfo.symbol }}</n-descriptions-item>
                  <n-descriptions-item label="Decimals">{{ tokenInfo.decimals }}</n-descriptions-item>
                  <n-descriptions-item label="Total Supply">{{ tokenInfo.totalSupply }}</n-descriptions-item>
                </n-descriptions>
              </div>
            </n-space>
          </div>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ARBNetworkScanner from '~/components/ARBNetworkScanner.vue';

const router = useRouter();

// State
const hyperliquidKeys = ref([]);
const selectedKeyId = ref(null);
const userID = ref('LCXuser');
const tokenSearchAddress = ref('');
const searchingToken = ref(false);
const tokenInfo = ref(null);

// Computed
const selectedKey = computed(() => {
  return hyperliquidKeys.value.find(k => k.id === selectedKeyId.value);
});

const selectedWalletAddress = computed(() => {
  return selectedKey.value?.walletAddress || '';
});

const keyOptions = computed(() => {
  return hyperliquidKeys.value.map(key => ({
    label: `${key.name} (${maskAddress(key.walletAddress)})`,
    value: key.id
  }));
});

// Functions
function maskAddress(address) {
  if (!address) return 'N/A';
  if (address.length <= 10) return address;
  return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

function navigateToProfile() {
  router.push('/profile');
}

// Fetch Hyperliquid keys
async function fetchHyperliquidKeys() {
  try {
    const response = await $fetch('/api/v1/fetchHyperliquidKeys', {
      query: { userID: userID.value }
    });

    if (response.success && response.data) {
      hyperliquidKeys.value = response.data.map(item => ({
        id: item._id,
        name: item.name,
        walletAddress: item.walletAddress,
        privateKey: item.privateKey
      }));

      // Auto-select first key if available
      if (hyperliquidKeys.value.length > 0 && !selectedKeyId.value) {
        selectedKeyId.value = hyperliquidKeys.value[0].id;
      }
    }
  } catch (error) {
    console.error('Failed to fetch Hyperliquid keys:', error);
  }
}

// Search token function
async function searchToken() {
  if (!tokenSearchAddress.value) {
    window.$message.warning('Please enter a token address');
    return;
  }

  searchingToken.value = true;
  try {
    // TODO: Implement Arbitrum token search
    window.$message.info('Token search feature coming soon!');
  } catch (error) {
    console.error('Token search error:', error);
    window.$message.error('Failed to search token');
  } finally {
    searchingToken.value = false;
  }
}

// On key select
function onKeySelect(keyId) {
  console.log('Selected Hyperliquid key for ARB Network:', keyId);
}

// Mount
onMounted(() => {
  fetchHyperliquidKeys();
});

// Optional: Set page meta
definePageMeta({
  layout: 'default',
  title: 'Arbitrum Network Scanner'
});
</script>

<style scoped>
.arb-network-page {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  background: #0a0a0a;
}

.api-selector-card {
  border: 2px solid rgba(45, 129, 224, 0.3);
}

.scanner-card {
  border: 2px solid rgba(45, 129, 224, 0.2);
}

.selected-wallet-info {
  padding: 16px;
  background: rgba(45, 129, 224, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(45, 129, 224, 0.2);
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.info-row:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-label {
  font-size: 13px;
  color: #888;
  font-weight: 600;
}

.wallet-address {
  font-size: 12px;
  color: #2d81e0;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.tab-content {
  padding: 20px 0;
  min-height: 400px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #666;
}

.empty-state h3 {
  margin: 20px 0 10px;
  color: #999;
}

.empty-state p {
  color: #666;
  max-width: 400px;
}

.info-card {
  padding: 16px;
  background: rgba(45, 129, 224, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(45, 129, 224, 0.15);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-card strong {
  color: #2d81e0;
  font-size: 13px;
  font-weight: 600;
}

.info-card code {
  font-size: 12px;
  color: #aaa;
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.token-info-display {
  margin-top: 20px;
  padding: 20px;
  background: rgba(45, 129, 224, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(45, 129, 224, 0.2);
}

.token-info-display h4 {
  margin-bottom: 16px;
  color: #2d81e0;
}
</style>
