<template>
  <div class="web3-toolz-container">
    <n-card class="web3-header-card" style="margin-bottom: 16px;">
      <template #header>
        <div style="display: flex; align-items: center; gap: 16px;">
          <div class="web3-icon">🌐</div>
          <div>
            <h1 style="margin: 0; font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              Web3 Toolz
            </h1>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #888;">
              Multi-chain blockchain network tools and explorers
            </p>
          </div>
        </div>
      </template>
    </n-card>

    <n-card class="web3-content-card">
      <n-tabs
        v-model:value="activeTab"
        type="card"
        animated
        size="large"
        class="web3-tabs"
      >
        <n-tab-pane name="eth" tab="🔷 ETH Network">
          <ETHNetworkPage />
        </n-tab-pane>

        <n-tab-pane name="nft" tab="💎 TIAMONDS NFT">
          <NFTCollectionPage />
        </n-tab-pane>

        <n-tab-pane name="arb" tab="🔵 ARB Network">
          <ARBNetworkPage />
        </n-tab-pane>

        <n-tab-pane name="base" tab="🔵 BASE Network">
          <BASENetworkPage />
        </n-tab-pane>

        <n-tab-pane name="plasma" tab="🟣 PLASMA Network">
          <PLASMANetworkPage />
        </n-tab-pane>

        <n-tab-pane name="optimism" tab="🔴 Optimism Network">
          <OptimismNetworkPage />
        </n-tab-pane>

        <n-tab-pane name="avalanche" tab="🔺 Avalanche Network">
          <AvalancheNetworkPage />
        </n-tab-pane>

        <n-tab-pane name="algorand" tab="⬛ Algorand Network">
          <AlgorandNetworkPage />
        </n-tab-pane>

        <n-tab-pane name="noble" tab="👑 Noble Network">
          <NobleNetworkPage />
        </n-tab-pane>

        <n-tab-pane name="sui" tab="🌊 Sui Network">
          <SuiNetworkPage />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ETHNetworkPage from './ETHNetwork.vue';
import NFTCollectionPage from './NFTCollection.vue';
import ARBNetworkPage from './ARBNetwork.vue';
import BASENetworkPage from './BASENetwork.vue';
import PLASMANetworkPage from './PLASMANetwork.vue';
import OptimismNetworkPage from './OptimismNetwork.vue';
import AvalancheNetworkPage from './AvalancheNetwork.vue';
import AlgorandNetworkPage from './AlgorandNetwork.vue';
import NobleNetworkPage from './NobleNetwork.vue';
import SuiNetworkPage from './SuiNetwork.vue';

const activeTab = ref('eth');
</script>

<style scoped>
.web3-toolz-container {
  padding: 24px;
  max-width: 100%;
  height: 100%;
}

.web3-header-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.web3-icon {
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

.web3-content-card {
  min-height: calc(100vh - 240px);
}

.web3-tabs :deep(.n-tabs-nav) {
  background: rgba(0, 0, 0, 0.3);
}

.web3-tabs :deep(.n-tabs-tab) {
  font-weight: 600;
  font-size: 14px;
  padding: 12px 20px;
}

.web3-tabs :deep(.n-tabs-tab:hover) {
  background: rgba(102, 126, 234, 0.2);
}

.web3-tabs :deep(.n-tabs-tab--active) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
  border-bottom: 3px solid #667eea;
}

.web3-tabs :deep(.n-tab-pane) {
  padding: 20px 0;
}
</style>
