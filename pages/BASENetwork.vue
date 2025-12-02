<template>
  <div class="base-network-page">
        <!-- Back Button -->
    <div style="margin-bottom: 16px;">
      <n-button text @click="$router.push('/dashboard?tab=cryptowallet')" class="back-button">
        ← Back
      </n-button>
    </div>

    <!-- API Key Selector Card -->
    <n-card class="api-selector-card" style="margin-bottom: 20px;">
      <template #header>
        <div style="display: flex; align-items: center; gap: 12px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0052FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span style="font-size: 16px; font-weight: 600;">Select Hyperliquid Account</span>
        </div>
      </template>

      <n-select
        v-model:value="selectedKeyId"
        :options="keyOptions"
        placeholder="Choose your Hyperliquid wallet..."
        size="large"
        :loading="loadingKeys"
        @update:value="onKeySelect"
      />
    </n-card>

    <!-- Scanner Card with Tabs -->
    <n-card class="scanner-card">
      <n-tabs type="line" animated>
        <n-tab-pane name="wallet" tab="💼 My Wallet">
          <BASENetworkScanner :walletAddress="selectedWalletAddress" />
        </n-tab-pane>

        <n-tab-pane name="stats" tab="📊 Network Stats">
          <n-card title="🔵 Base Network Statistics">
            <n-grid cols="1 s:2 m:3" responsive="screen" :x-gap="16" :y-gap="16">
              <n-gi>
                <n-statistic label="Network Name" value="Base">
                  <template #prefix>
                    <span style="font-size: 20px;">🔵</span>
                  </template>
                </n-statistic>
              </n-gi>
              <n-gi>
                <n-statistic label="Chain ID" value="8453">
                  <template #prefix>
                    <span style="font-size: 20px;">#</span>
                  </template>
                </n-statistic>
              </n-gi>
              <n-gi>
                <n-statistic label="Network Type" value="Layer 2">
                  <template #prefix>
                    <span style="font-size: 20px;">⚡</span>
                  </template>
                </n-statistic>
              </n-gi>
              <n-gi>
                <n-statistic label="Native Token" value="ETH">
                  <template #prefix>
                    <span style="font-size: 20px;">💎</span>
                  </template>
                </n-statistic>
              </n-gi>
              <n-gi>
                <n-statistic label="Developer" value="Coinbase">
                  <template #prefix>
                    <span style="font-size: 20px;">🏢</span>
                  </template>
                </n-statistic>
              </n-gi>
              <n-gi>
                <n-statistic label="Block Explorer" value="Basescan">
                  <template #prefix>
                    <span style="font-size: 20px;">🔍</span>
                  </template>
                </n-statistic>
              </n-gi>
            </n-grid>

            <n-divider />

            <div style="margin-top: 20px;">
              <h3 style="margin-bottom: 16px;">About Base Network</h3>
              <p style="line-height: 1.8; color: #666;">
                Base is a secure, low-cost, builder-friendly Ethereum Layer 2 (L2) blockchain built by Coinbase.
                It offers a safe, low-cost, developer-friendly way to build onchain applications. Base is built on the
                open-source OP Stack in collaboration with Optimism.
              </p>

              <div style="margin-top: 20px;">
                <h4 style="margin-bottom: 12px;">Key Features:</h4>
                <ul style="line-height: 2; color: #666;">
                  <li>🚀 <strong>Low Transaction Costs:</strong> Significantly cheaper than Ethereum mainnet</li>
                  <li>⚡ <strong>Fast Transactions:</strong> Near-instant transaction confirmation</li>
                  <li>🔐 <strong>Ethereum Security:</strong> Secured by Ethereum's robust infrastructure</li>
                  <li>🛠️ <strong>Developer Friendly:</strong> Full EVM compatibility</li>
                  <li>🌐 <strong>Coinbase Integration:</strong> Easy onramp/offramp with Coinbase</li>
                  <li>🎯 <strong>Growing Ecosystem:</strong> Rapidly expanding DeFi and NFT projects</li>
                </ul>
              </div>

              <div style="margin-top: 20px;">
                <n-button type="info" @click="openBaseWebsite" style="margin-right: 12px;">
                  Visit Base.org
                </n-button>
                <n-button type="primary" @click="openBasescan">
                  Open Basescan
                </n-button>
              </div>
            </div>
          </n-card>
        </n-tab-pane>

        <n-tab-pane name="tokens" tab="🪙 Token Scanner">
          <n-card title="🔍 Search Token on Base">
            <n-space vertical size="large">
              <n-input
                v-model:value="customTokenAddress"
                placeholder="Enter token contract address (0x...)"
                size="large"
                clearable
              />

              <n-button
                type="primary"
                size="large"
                :loading="scanningToken"
                :disabled="!customTokenAddress || !selectedWalletAddress"
                @click="scanCustomToken"
                block
              >
                Scan Token Balance
              </n-button>

              <n-alert v-if="tokenScanResult" :type="tokenScanResult.type" style="margin-top: 16px;">
                {{ tokenScanResult.message }}
              </n-alert>

              <n-card v-if="scannedToken" title="Token Details" style="margin-top: 20px;">
                <n-descriptions :column="1" bordered>
                  <n-descriptions-item label="Token Name">
                    {{ scannedToken.name }}
                  </n-descriptions-item>
                  <n-descriptions-item label="Symbol">
                    {{ scannedToken.symbol }}
                  </n-descriptions-item>
                  <n-descriptions-item label="Balance">
                    {{ scannedToken.balance }}
                  </n-descriptions-item>
                  <n-descriptions-item label="Contract Address">
                    <a :href="`https://basescan.org/token/${scannedToken.contract}`" target="_blank" style="color: #0052FF;">
                      {{ scannedToken.contract }}
                    </a>
                  </n-descriptions-item>
                </n-descriptions>
              </n-card>
            </n-space>
          </n-card>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
// import { ethers } from 'ethers';
import BASENetworkScanner from '~/components/BASENetworkScanner.vue';

// State
const selectedKeyId = ref(null);
const hyperliquidKeys = ref([]);
const loadingKeys = ref(false);
const customTokenAddress = ref('');
const scanningToken = ref(false);
const tokenScanResult = ref(null);
const scannedToken = ref(null);

// Computed
const keyOptions = computed(() => {
  return hyperliquidKeys.value.map(key => ({
    label: `${key.keyName} - ${key.walletAddress.substring(0, 6)}...${key.walletAddress.substring(key.walletAddress.length - 4)}`,
    value: key._id
  }));
});

const selectedWalletAddress = computed(() => {
  const selectedKey = hyperliquidKeys.value.find(key => key._id === selectedKeyId.value);
  return selectedKey?.walletAddress || '';
});

// Methods
async function fetchHyperliquidKeys() {
  loadingKeys.value = true;
  try {
    const response = await fetch('/api/v1/hyperliquid-keys', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      const data = await response.json();
      hyperliquidKeys.value = data.keys || [];

      if (hyperliquidKeys.value.length > 0) {
        selectedKeyId.value = hyperliquidKeys.value[0]._id;
      }
    }
  } catch (error) {
    console.error('Error fetching Hyperliquid keys:', error);
  } finally {
    loadingKeys.value = false;
  }
}

function onKeySelect(value) {
  console.log('Selected key:', value);
  scannedToken.value = null;
  tokenScanResult.value = null;
}

async function scanCustomToken() {
  if (!customTokenAddress.value || !selectedWalletAddress.value) return;

  scanningToken.value = true;
  tokenScanResult.value = null;
  scannedToken.value = null;

  try {
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    const ERC20_ABI = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)',
      'function name() view returns (string)'
    ];

    const tokenContract = new ethers.Contract(customTokenAddress.value, ERC20_ABI, provider);

    const [balance, decimals, symbol, name] = await Promise.all([
      tokenContract.balanceOf(selectedWalletAddress.value),
      tokenContract.decimals(),
      tokenContract.symbol(),
      tokenContract.name()
    ]);

    const balanceFormatted = parseFloat(ethers.formatUnits(balance, decimals)).toFixed(6);

    scannedToken.value = {
      name,
      symbol,
      balance: balanceFormatted,
      contract: customTokenAddress.value
    };

    tokenScanResult.value = {
      type: 'success',
      message: `Successfully scanned token: ${name} (${symbol})`
    };

  } catch (error) {
    console.error('Error scanning token:', error);
    tokenScanResult.value = {
      type: 'error',
      message: `Error scanning token: ${error.message}`
    };
  } finally {
    scanningToken.value = false;
  }
}

function openBaseWebsite() {
  window.open('https://base.org', '_blank');
}

function openBasescan() {
  window.open('https://basescan.org', '_blank');
}

// Lifecycle
onMounted(() => {
  fetchHyperliquidKeys();
});
</script>

<style scoped>
.base-network-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.api-selector-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid #e0e0e0;
}

.scanner-card {
  background: white;
  border: 1px solid #e0e0e0;
}

:deep(.n-card-header) {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.n-card__content) {
  padding: 20px;
}
</style>
