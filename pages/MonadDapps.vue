<script setup>
import { ref, computed } from 'vue';

// Search and filter state
const searchQuery = ref('');
const selectedCategory = ref('all');

// Categories
const categories = [
  { value: 'all', label: 'All Apps', icon: '🌐' },
  { value: 'defi', label: 'DeFi', icon: '💰' },
  { value: 'infrastructure', label: 'Infrastructure', icon: '🔧' },
  { value: 'wallet', label: 'Wallets', icon: '👛' },
  { value: 'oracle', label: 'Oracles', icon: '🔮' },
  { value: 'analytics', label: 'Analytics', icon: '📊' }
];

// Monad Ecosystem Apps
const dapps = [
  // DeFi
  {
    name: '0x',
    description: 'Embed swaps in any onchain app',
    category: 'infrastructure',
    logo: 'https://cdn.prod.website-files.com/669ade140a683001b9f7fd78/67b9106b6ca74a7001624998_0x_logo.webp',
    url: 'https://0x.org/',
    tags: ['Dev Tooling', 'Infra']
  },
  {
    name: 'Ambient',
    description: 'Spot AMM combining multiple liquidity types with modular hooks',
    category: 'defi',
    logo: '💧',
    url: 'https://monad.ambient.finance',
    tags: ['DEX', 'AMM']
  },
  {
    name: 'Azaar',
    description: 'High-performance DEX aggregator and trading platform built for Monad',
    category: 'defi',
    logo: '⚡',
    url: 'https://azaar.com/',
    tags: ['DEX', 'Aggregator']
  },
  {
    name: 'Bean Exchange',
    description: 'Gamified decentralized spot & perpetual exchange natively built on Monad',
    category: 'defi',
    logo: '🫘',
    url: 'https://bean.exchange/',
    tags: ['DEX', 'Perpetuals']
  },
  {
    name: 'Bebop',
    description: 'Web3 trading app and API that finds the best route for all trades',
    category: 'defi',
    logo: '🎵',
    url: 'https://bebop.xyz/',
    tags: ['Trading', 'Aggregator']
  },
  {
    name: 'Crystal',
    description: 'Fully on-chain CLOB exchange with CEX-grade performance',
    category: 'defi',
    logo: '💎',
    url: 'https://crystal.exchange',
    tags: ['DEX', 'CLOB']
  },
  {
    name: 'Covenant',
    description: 'Lever up your favorite token through liquid, tradeable debt markets',
    category: 'defi',
    logo: '📜',
    url: 'https://covenant.finance',
    tags: ['Lending', 'DeFi']
  },
  {
    name: 'Crust Finance',
    description: 'Metadex with concentrated liquidity and native ALM support',
    category: 'defi',
    logo: '🥧',
    url: 'https://crust.finance',
    tags: ['DEX', 'Liquidity']
  },
  {
    name: 'Curvance',
    description: 'Multichain liquidity protocol that maximizes capital efficiency in DeFi',
    category: 'defi',
    logo: '📈',
    url: 'https://monad.curvance.com/monad',
    tags: ['Liquidity', 'DeFi']
  },
  {
    name: 'Drake',
    description: 'Hybrid CLOB unlocking CEX speed, DEX transparency, and frictionless yields',
    category: 'defi',
    logo: '🐉',
    url: 'https://drake.exchange/',
    tags: ['Perpetuals', 'CLOB']
  },
  {
    name: 'ELFi',
    description: 'First DEX with ultra portfolio margin & zero-risk stablecoin pool',
    category: 'defi',
    logo: '🧝',
    url: 'https://www.elfi.xyz/',
    tags: ['DEX', 'Margin']
  },
  {
    name: 'Euler',
    description: 'Lets any asset become collateral for a lending market',
    category: 'defi',
    logo: '📐',
    url: 'http://euler.finance',
    tags: ['Lending', 'DeFi']
  },
  // Infrastructure
  {
    name: 'Alchemy',
    description: 'End-to-end platform giving devs everything to build and scale web3 apps',
    category: 'infrastructure',
    logo: '🧪',
    url: 'https://alchemy.com',
    tags: ['Dev Tools', 'RPC']
  },
  {
    name: 'Allium',
    description: 'Delivers blockchain data via dashboards, APIs, datashares, and streams',
    category: 'analytics',
    logo: '🌱',
    url: 'https://www.allium.so/',
    tags: ['Analytics', 'Data']
  },
  {
    name: 'Band Protocol',
    description: 'Cross-chain data oracle platform aggregating real-world data and APIs',
    category: 'oracle',
    logo: '📡',
    url: 'https://www.bandprotocol.com/',
    tags: ['Oracle', 'Data']
  },
  {
    name: 'Chainbase',
    description: 'Enables AI-era data interoperability with decentralized economy',
    category: 'infrastructure',
    logo: '🔗',
    url: 'https://chainbase.com/',
    tags: ['Data', 'AI']
  },
  {
    name: 'Chainlink',
    description: 'Standard for onchain finance, verifiable data, and cross-chain interoperability',
    category: 'oracle',
    logo: '🔗',
    url: 'https://chain.link/',
    tags: ['Oracle', 'Cross-Chain']
  },
  {
    name: 'Dune',
    description: 'Leading data platform empowering users to query and visualize onchain data',
    category: 'analytics',
    logo: '🏜️',
    url: 'http://dune.com/home',
    tags: ['Analytics', 'Data']
  },
  // Wallets
  {
    name: 'Ambire Wallet',
    description: 'Easy and secure self-custody for smart accounts, EOAs, and hardware wallets',
    category: 'wallet',
    logo: '🔐',
    url: 'https://www.ambire.com',
    tags: ['Wallet', 'Smart Account']
  },
  {
    name: 'Backpack',
    description: 'Next-level wallet and exchange to buy tokens, trade futures, and explore apps',
    category: 'wallet',
    logo: '🎒',
    url: 'https://backpack.app/',
    tags: ['Wallet', 'Exchange']
  },
  {
    name: 'Bybit Web3',
    description: 'Gateway to Web3 for exploring DeFi offerings across networks',
    category: 'wallet',
    logo: '🌐',
    url: 'https://www.bybit.com/en/web3',
    tags: ['Wallet', 'Multi-chain']
  }
];

// Filtered apps
const filteredApps = computed(() => {
  let apps = dapps;

  // Filter by category
  if (selectedCategory.value !== 'all') {
    apps = apps.filter(app => app.category === selectedCategory.value);
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    apps = apps.filter(app =>
      app.name.toLowerCase().includes(query) ||
      app.description.toLowerCase().includes(query) ||
      app.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  return apps;
});

// Open dApp
function openApp(url) {
  window.open(url, '_blank');
}
</script>

<template>
  <div class="monad-dapps-page">
    <!-- Header -->
    <div class="page-header">
      <div class="title-section">
        <span class="header-icon">⚡</span>
        <div>
          <h1>Monad Ecosystem</h1>
          <p class="subtitle">Explore dApps, tools, and infrastructure on Monad</p>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="filters-section">
      <n-input
        v-model:value="searchQuery"
        placeholder="Search apps..."
        size="large"
        clearable
        style="max-width: 400px;"
      >
        <template #prefix>
          🔍
        </template>
      </n-input>

      <div class="category-filters">
        <n-button
          v-for="cat in categories"
          :key="cat.value"
          :type="selectedCategory === cat.value ? 'primary' : 'default'"
          @click="selectedCategory = cat.value"
          size="medium"
        >
          {{ cat.icon }} {{ cat.label }}
        </n-button>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-bar">
      <n-tag type="info" size="large">
        {{ filteredApps.length }} App{{ filteredApps.length !== 1 ? 's' : '' }} Found
      </n-tag>
      <n-button text @click="window.open('https://www.monad.xyz/ecosystem', '_blank')">
        View Full Ecosystem →
      </n-button>
    </div>

    <!-- Apps Grid -->
    <div v-if="filteredApps.length === 0" class="empty-state">
      <span style="font-size: 64px;">🔍</span>
      <h3>No apps found</h3>
      <p>Try adjusting your search or filters</p>
    </div>

    <div v-else class="apps-grid">
      <n-card
        v-for="app in filteredApps"
        :key="app.name"
        class="app-card"
        hoverable
        @click="openApp(app.url)"
      >
        <div class="app-header">
          <div class="app-logo">
            <img v-if="app.logo.startsWith('http')" :src="app.logo" :alt="app.name" />
            <span v-else class="logo-emoji">{{ app.logo }}</span>
          </div>
          <h3 class="app-name">{{ app.name }}</h3>
        </div>

        <p class="app-description">{{ app.description }}</p>

        <div class="app-tags">
          <n-tag v-for="tag in app.tags" :key="tag" size="small" type="info">
            {{ tag }}
          </n-tag>
        </div>

        <div class="app-footer">
          <n-button type="primary" size="small" block>
            Launch App →
          </n-button>
        </div>
      </n-card>
    </div>
  </div>
</template>

<style scoped>
.monad-dapps-page {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  font-size: 48px;
  line-height: 1;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
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

.filters-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.category-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.app-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.app-card:hover {
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 8px 30px rgba(139, 92, 246, 0.2);
  transform: translateY(-4px);
}

.app-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.app-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 92, 246, 0.1);
  overflow: hidden;
}

.app-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-emoji {
  font-size: 28px;
}

.app-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.app-description {
  margin: 0 0 16px 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.5;
  min-height: 60px;
}

.app-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.app-footer {
  margin-top: auto;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-state h3 {
  margin: 16px 0 8px 0;
  color: #fff;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.6);
}
</style>
