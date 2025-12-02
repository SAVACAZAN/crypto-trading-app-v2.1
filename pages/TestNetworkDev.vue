<script setup>
import { ref } from 'vue';

// Testnet networks data
const testnets = ref([
  {
    id: 'monad',
    name: 'Monad',
    symbol: 'MON',
    icon: '⚡',
    type: 'L1 EVM-compatible',
    status: 'Active Portal',
    description: 'L1 EVM-compatible chain with active airdrop portal and testnet',
    website: 'https://monad.xyz',
    portal: 'https://monad.xyz/claim',
    features: ['Airdrop Portal', 'Testnet Active', 'EVM Compatible'],
    tasks: [
      'Visit claim portal',
      'Connect wallet',
      'Complete testnet tasks',
      'Claim test tokens'
    ],
    color: '#8B5CF6'
  },
  {
    id: 'berachain',
    name: 'Berachain',
    symbol: 'BERA',
    icon: '🐻',
    type: 'Incentivized Testnet',
    status: 'Farming Active',
    description: 'Incentivized testnet with farming guides and airdrop opportunities',
    website: 'https://berachain.com',
    portal: 'https://blog.berachain.com',
    features: ['Farming Rewards', 'Testnet Incentives', 'Active Community'],
    tasks: [
      'Add Berachain testnet to wallet',
      'Get test BERA from faucet',
      'Participate in DeFi protocols',
      'Complete farming tasks'
    ],
    color: '#F59E0B'
  },
  {
    id: 'zksync',
    name: 'zkSync Era',
    symbol: 'ETH',
    icon: '⚙️',
    type: 'Testnet/Devnet',
    status: 'Ecosystem Active',
    description: 'zkSync Era testnet with rich dApp ecosystem and task opportunities',
    website: 'https://zksync.io',
    portal: 'https://portal.zksync.io',
    features: ['dApp Ecosystem', 'Testnet Tasks', 'Layer 2 Scaling'],
    tasks: [
      'Bridge test ETH to zkSync',
      'Interact with dApps',
      'Complete testnet missions',
      'Deploy test contracts'
    ],
    color: '#4C8BF5'
  },
  {
    id: 'sepolia',
    name: 'Sepolia',
    symbol: 'ETH',
    icon: '🔷',
    type: 'Ethereum Testnet',
    status: 'Active',
    description: 'Official Ethereum testnet for developers and dApp testing',
    website: 'https://ethereum.org',
    portal: 'https://sepolia.etherscan.io',
    rpcUrl: 'https://rpc.sepolia.org',
    chainId: 11155111,
    features: ['Ethereum Compatible', 'Public Faucets', 'Developer Friendly', 'Stable Network'],
    tasks: [
      'Add Sepolia to MetaMask',
      'Get test ETH from faucet',
      'Deploy smart contracts',
      'Test dApps on Sepolia'
    ],
    faucets: [
      'https://sepoliafaucet.com',
      'https://www.alchemy.com/faucets/ethereum-sepolia',
      'https://faucet.quicknode.com/ethereum/sepolia'
    ],
    color: '#627EEA'
  },
  {
    id: 'fraction-ai',
    name: 'Fraction AI',
    symbol: 'FRAC',
    icon: '🤖',
    type: 'Sepolia Testnet',
    status: 'Airdrop Expected',
    description: 'AI-focused testnet on Sepolia with activities and potential airdrop',
    website: 'https://fractionai.xyz',
    portal: 'https://fractionai.xyz/testnet',
    features: ['AI Integration', 'Sepolia Network', 'Activity Tasks'],
    tasks: [
      'Connect to Sepolia network',
      'Get Sepolia ETH from faucet',
      'Complete AI tasks',
      'Interact with Fraction AI dApp'
    ],
    color: '#10B981'
  },
  {
    id: 'megaeth',
    name: 'MegaETH Carrot',
    symbol: 'METH',
    icon: '🥕',
    type: 'High-Performance L2',
    status: 'Testnet Active',
    description: 'Ultra-fast EVM-compatible L2 with real-time performance (Carrot testnet)',
    website: 'https://www.megaeth.com',
    portal: 'https://testnet.megaeth.com',
    rpcUrl: 'https://carrot.megaeth.com/rpc',
    chainId: 6342,
    features: ['MetaMask Compatible', 'High Performance', 'EVM Compatible', 'Real-time Blocks'],
    tasks: [
      'Add MegaETH Carrot to MetaMask',
      'Connect wallet to testnet',
      'Get test METH from Carrot faucet',
      'Deploy and test smart contracts'
    ],
    color: '#FF6B6B'
  }
]);

// Selected testnet for details modal
const selectedTestnet = ref(null);
const showDetailsModal = ref(false);

// Open testnet details
function openTestnetDetails(testnet) {
  selectedTestnet.value = testnet;
  showDetailsModal.value = true;
}

// Open external link
function openLink(url) {
  window.open(url, '_blank');
}

// Copy to clipboard
function copyToClipboard(text, label) {
  navigator.clipboard.writeText(text).then(() => {
    window.$message?.success(`${label} copied to clipboard!`);
  }).catch(() => {
    window.$message?.error('Failed to copy to clipboard');
  });
}
</script>

<template>
  <div class="testnet-dev-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <span class="network-icon">🧪</span>
          <div>
            <h1>TestNet Developer Hub</h1>
            <p class="subtitle">Participate in testnets, earn airdrops, and farm rewards</p>
          </div>
        </div>
        <div class="header-badge">
          <n-tag type="success" size="large">
            {{ testnets.length }} Active Testnets
          </n-tag>
        </div>
      </div>
    </div>

    <!-- Info Alert -->
    <n-alert type="info" style="margin-bottom: 24px;">
      <template #icon>
        <span style="font-size: 24px;">💡</span>
      </template>
      <strong>Testnet Opportunities</strong><br>
      Participate in these testnets to potentially qualify for future airdrops. Complete tasks, interact with dApps, and stay active in the ecosystem.
    </n-alert>

    <!-- Testnets Grid -->
    <div class="testnets-grid">
      <n-card
        v-for="testnet in testnets"
        :key="testnet.id"
        class="testnet-card"
        hoverable
        :style="{ borderColor: testnet.color + '40' }"
      >
        <!-- Card Header -->
        <div class="testnet-header">
          <div class="testnet-icon" :style="{ background: testnet.color }">
            {{ testnet.icon }}
          </div>
          <div class="testnet-info">
            <h3>{{ testnet.name }}</h3>
            <span class="testnet-symbol">{{ testnet.symbol }}</span>
          </div>
          <n-tag :color="{ color: testnet.color, textColor: '#fff' }" size="small">
            {{ testnet.status }}
          </n-tag>
        </div>

        <n-divider style="margin: 16px 0;" />

        <!-- Type & Description -->
        <div class="testnet-type">
          <n-tag type="info" size="small">{{ testnet.type }}</n-tag>
        </div>

        <p class="testnet-description">{{ testnet.description }}</p>

        <!-- Features -->
        <div class="testnet-features">
          <n-tag
            v-for="feature in testnet.features"
            :key="feature"
            type="success"
            size="small"
            :bordered="false"
          >
            ✓ {{ feature }}
          </n-tag>
        </div>

        <n-divider style="margin: 16px 0;" />

        <!-- Quick Tasks Preview -->
        <div class="quick-tasks">
          <h4 style="margin: 0 0 8px 0; font-size: 13px; color: rgba(255,255,255,0.7);">Quick Tasks:</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 12px;">
            <li v-for="(task, idx) in testnet.tasks.slice(0, 3)" :key="idx" style="margin-bottom: 4px;">
              {{ task }}
            </li>
          </ul>
        </div>

        <!-- Actions -->
        <div class="testnet-actions">
          <n-button
            type="primary"
            size="small"
            @click="navigateTo(`/${testnet.id === 'monad' ? 'MonadTest' : testnet.id === 'sepolia' ? 'SepoliaTest' : testnet.id === 'berachain' ? 'BerachainTest' : testnet.id === 'zksync' ? 'ZkSyncTest' : testnet.id === 'fraction-ai' ? 'FractionAITest' : 'MegaETHTest'}`)"
            block
            :style="{ background: testnet.color }"
          >
            💼 Manage Wallets
          </n-button>
          <n-button
            size="small"
            @click="openLink(testnet.portal)"
            block
          >
            🚀 Portal
          </n-button>
          <n-button
            size="small"
            @click="openTestnetDetails(testnet)"
            block
            secondary
          >
            📋 Details
          </n-button>
        </div>
      </n-card>
    </div>

    <!-- Testnet Details Modal -->
    <n-modal
      v-model:show="showDetailsModal"
      preset="card"
      :title="`${selectedTestnet?.icon} ${selectedTestnet?.name} - Complete Guide`"
      style="width: 700px; max-width: 95vw;"
    >
      <div v-if="selectedTestnet" class="testnet-details">
        <!-- Overview -->
        <n-card size="small" style="margin-bottom: 16px;">
          <template #header>
            <strong>📊 Overview</strong>
          </template>
          <n-descriptions :column="1" size="small">
            <n-descriptions-item label="Network">
              {{ selectedTestnet.name }}
            </n-descriptions-item>
            <n-descriptions-item label="Symbol">
              {{ selectedTestnet.symbol }}
            </n-descriptions-item>
            <n-descriptions-item label="Type">
              {{ selectedTestnet.type }}
            </n-descriptions-item>
            <n-descriptions-item label="Status">
              <n-tag :color="{ color: selectedTestnet.color, textColor: '#fff' }" size="small">
                {{ selectedTestnet.status }}
              </n-tag>
            </n-descriptions-item>
          </n-descriptions>
        </n-card>

        <!-- Description -->
        <n-alert type="info" style="margin-bottom: 16px;">
          {{ selectedTestnet.description }}
        </n-alert>

        <!-- Features -->
        <n-card size="small" style="margin-bottom: 16px;">
          <template #header>
            <strong>✨ Key Features</strong>
          </template>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <n-tag
              v-for="feature in selectedTestnet.features"
              :key="feature"
              type="success"
              :bordered="false"
            >
              ✓ {{ feature }}
            </n-tag>
          </div>
        </n-card>

        <!-- Tasks -->
        <n-card size="small" style="margin-bottom: 16px;">
          <template #header>
            <strong>📝 Task Checklist</strong>
          </template>
          <n-checkbox-group>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <n-checkbox
                v-for="(task, idx) in selectedTestnet.tasks"
                :key="idx"
                :value="idx"
              >
                {{ task }}
              </n-checkbox>
            </div>
          </n-checkbox-group>
        </n-card>

        <!-- Faucets (if available) -->
        <n-card v-if="selectedTestnet.faucets && selectedTestnet.faucets.length > 0" size="small" style="margin-bottom: 16px;">
          <template #header>
            <strong>💧 Faucets</strong>
          </template>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <n-button
              v-for="(faucet, idx) in selectedTestnet.faucets"
              :key="idx"
              @click="openLink(faucet)"
              block
              type="success"
            >
              💧 Faucet {{ idx + 1 }}
            </n-button>
          </div>
        </n-card>

        <!-- Links -->
        <n-card size="small">
          <template #header>
            <strong>🔗 Useful Links</strong>
          </template>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <n-button
              type="primary"
              @click="openLink(selectedTestnet.portal)"
              block
              :style="{ background: selectedTestnet.color }"
            >
              🚀 Open Portal / Explorer
            </n-button>
            <n-button
              @click="openLink(selectedTestnet.website)"
              block
            >
              🌐 Official Website
            </n-button>
          </div>
        </n-card>

        <!-- Warning -->
        <n-alert type="warning" style="margin-top: 16px;">
          <template #icon>
            <span>⚠️</span>
          </template>
          <strong>Important:</strong> This is testnet activity. Never use real funds. Always verify official links and be cautious of scams.
        </n-alert>
      </div>
    </n-modal>
  </div>
</template>

<style scoped>
.testnet-dev-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.network-icon {
  font-size: 48px;
  line-height: 1;
}

.title-section h1 {
  margin: 0;
  font-size: 32px;
  font-weight: bold;
  color: #fff;
}

.subtitle {
  margin: 4px 0 0 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.testnets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.testnet-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.testnet-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.testnet-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.testnet-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.testnet-info {
  flex: 1;
}

.testnet-info h3 {
  margin: 0;
  font-size: 18px;
  color: #fff;
}

.testnet-symbol {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.testnet-type {
  margin-bottom: 12px;
}

.testnet-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.6;
  margin: 12px 0;
}

.testnet-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
}

.quick-tasks {
  background: rgba(0, 0, 0, 0.2);
  padding: 12px;
  border-radius: 8px;
  margin: 12px 0;
}

.quick-tasks ul {
  color: rgba(255, 255, 255, 0.8);
}

.testnet-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.testnet-details {
  padding: 8px 0;
}
</style>
