<template>
  <div class="dashboard-container">
    <!-- Welcome Overlay -->
    <WelcomeOverlay />

    

    <!-- Tabs -->
    <n-tabs v-model:value="activeTab" type="card" animated class="dashboard-tabs">
      <!-- Overview Tab -->
      <n-tab-pane name="overview" tab="Overview">
        <!-- Single exchange view -->
        <div v-if="selectedExchange" class="exchange-detail-view">
          <div class="detail-header">
            <n-button text @click="selectedExchange = null" class="back-btn">
              <template #icon>
                <n-icon size="24">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </n-icon>
              </template>
              Back to All Exchanges
            </n-button>
            <div class="exchange-title-section">
              <img
                :src="getExchangeLogo(selectedExchange.name)"
                :alt="selectedExchange.name"
                class="exchange-logo-large"
                @error="(e) => e.target.style.display = 'none'"
              />
              <h2 class="exchange-title">{{ selectedExchange.name.toUpperCase() }} Exchange</h2>
            </div>
          </div>

          <n-grid x-gap="20" :cols="12">
            <n-gi span="8">
              <div v-for="apiKeyData in selectedExchange.apiKeys" :key="apiKeyData.apiKeyName" class="api-key-card">
                <div class="api-key-header">
                  <h3>{{ apiKeyData.apiKeyName }}</h3>
                  <n-tag v-if="apiKeyData.balance.length > 0" type="success" size="large">
                    {{ apiKeyData.balance.length }} assets
                  </n-tag>
                  <n-tag v-else type="warning">No balance</n-tag>
                </div>

                <n-alert v-if="apiKeyData.error" type="error" style="margin-bottom: 15px;">
                  {{ apiKeyData.error }}
                </n-alert>

                <n-data-table
                  v-if="apiKeyData.balance.length > 0"
                  :columns="tableColumns"
                  :data="apiKeyData.balance"
                  :pagination="false"
                  class="balance-table"
                />
                <n-empty v-else description="No balance data available" />
              </div>
            </n-gi>
            <n-gi span="4">
              <div class="chart-card">
                <h3>Asset Distribution</h3>
                <Pie v-if="selectedExchange.combinedBalance.length > 0" :data="formatBalance(selectedExchange.combinedBalance)" />
                <n-empty v-else description="No assets" />
              </div>
            </n-gi>
          </n-grid>
        </div>

        <!-- All exchanges view -->
        <div v-else>
          <!-- Global stats cards -->
          <div class="stats-grid">
            <div class="stat-card total-exchanges">
              <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <div class="stat-content">
                <p class="stat-label">Total Exchanges</p>
                <h2 class="stat-value">{{ exchanges.length }}</h2>
              </div>
            </div>

            <div class="stat-card lcx-stat">
              <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div class="stat-content">
                <p class="stat-label">Total LCX</p>
                <h2 class="stat-value">{{ formatNumber(GlobalBalanceLCX) }}</h2>
              </div>
            </div>

            <div class="stat-card job-stat">
              <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div class="stat-content">
                <p class="stat-label">Total JOB</p>
                <h2 class="stat-value">{{ formatNumber(GlobalBalanceJOB) }}</h2>
              </div>
            </div>

            <div class="stat-card toto-stat">
              <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <text x="12" y="16" text-anchor="middle" font-size="12" fill="currentColor">T</text>
                </svg>
              </div>
              <div class="stat-content">
                <p class="stat-label">Total TOTO</p>
                <h2 class="stat-value">{{ formatNumber(GlobalBalanceTOTO) }}</h2>
              </div>
            </div>

            <div class="stat-card usdc-stat">
              <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div class="stat-content">
                <p class="stat-label">Total USDC</p>
                <h2 class="stat-value">${{ formatNumber(GlobalBalanceUSDC) }}</h2>
              </div>
            </div>

            <div class="stat-card usdt-stat">
              <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div class="stat-content">
                <p class="stat-label">Total USDT</p>
                <h2 class="stat-value">${{ formatNumber(GlobalBalanceUSDT) }}</h2>
              </div>
            </div>

            <div class="stat-card usd-stat">
              <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div class="stat-content">
                <p class="stat-label">Total USD</p>
                <h2 class="stat-value">${{ formatNumber(GlobalBalanceUSD) }}</h2>
              </div>
            </div>

            <div class="stat-card eur-stat">
              <div class="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12H3M21 6H3M21 18H3"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
              <div class="stat-content">
                <p class="stat-label">Total EUR</p>
                <h2 class="stat-value">€{{ formatNumber(GlobalBalanceEUR) }}</h2>
              </div>
            </div>

            <!-- Refresh Button Card -->
            <div class="stat-card refresh-stat">
              <n-button type="primary" size="large" :loading="isRefreshing" @click="refreshBalances" class="refresh-btn-full">
                <template #icon>
                  <n-icon>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                    </svg>
                  </n-icon>
                </template>
                Refresh All
              </n-button>
              <n-tag v-if="lastUpdated" type="info" size="small" style="margin-top: 8px; width: 100%;">
                <template #icon>
                  <n-icon>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </n-icon>
                </template>
                {{ formatTime(lastUpdated) }}
              </n-tag>
            </div>
          </div>

          <!-- Detailed breakdown -->
          <div class="breakdown-section">
            <n-collapse>
              <n-collapse-item title="View Detailed Breakdown by Exchange" name="breakdown">
                <n-data-table
                  :columns="globalTotalsColumns"
                  :data="globalTotalsData"
                  size="small"
                  :pagination="false"
                  class="breakdown-table"
                />
              </n-collapse-item>
            </n-collapse>
          </div>

          <!-- Exchange cards grid -->
          <div class="exchanges-grid">
            <div
              v-for="exchange in exchanges"
              :key="exchange.name"
              class="exchange-card"
              @click="selectedExchange = exchange"
            >
              <div class="exchange-card-header">
                <img
                  :src="getExchangeLogo(exchange.name)"
                  :alt="exchange.name"
                  class="exchange-logo"
                  @error="(e) => e.target.style.display = 'none'"
                />
                <h3 class="exchange-name">{{ exchange.name.toUpperCase() }}</h3>
                <n-icon size="28" class="arrow-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </n-icon>
              </div>

              <div class="exchange-card-body">
                <div class="quick-stats">
                  <div class="quick-stat">
                    <span class="quick-stat-label">API Keys</span>
                    <span class="quick-stat-value">{{ exchange.apiKeys.length }}</span>
                  </div>
                  <div class="quick-stat">
                    <span class="quick-stat-label">Assets</span>
                    <span class="quick-stat-value">{{ exchange.combinedBalance.length }}</span>
                  </div>
                </div>

                <div class="balance-highlights">
                  <div v-if="exchange.combinedBalance.find(a => a.coin === 'LCX')" class="balance-item lcx-balance">
                    <span class="balance-label">LCX</span>
                    <span class="balance-value">{{ formatNumber(exchange.combinedBalance.find(a => a.coin === 'LCX').total) }}</span>
                  </div>
                  <div v-if="exchange.combinedBalance.find(a => a.coin === 'USDC')" class="balance-item usdc-balance">
                    <span class="balance-label">USDC</span>
                    <span class="balance-value">${{ formatNumber(exchange.combinedBalance.find(a => a.coin === 'USDC').total) }}</span>
                  </div>
                  <div v-if="exchange.combinedBalance.find(a => a.coin === 'USDT')" class="balance-item usdt-balance">
                    <span class="balance-label">USDT</span>
                    <span class="balance-value">${{ formatNumber(exchange.combinedBalance.find(a => a.coin === 'USDT').total) }}</span>
                  </div>
                  <div v-if="exchange.combinedBalance.find(a => a.coin === 'EUR')" class="balance-item eur-balance">
                    <span class="balance-label">EUR</span>
                    <span class="balance-value">€{{ formatNumber(exchange.combinedBalance.find(a => a.coin === 'EUR').total) }}</span>
                  </div>
                </div>
              </div>

              <div class="exchange-card-footer">
                <span class="view-details">View Details</span>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <n-empty v-if="exchanges.length === 0" description="No exchanges configured" style="margin-top: 60px;" />
        </div>
      </n-tab-pane>

      <!-- Balance SAVE Tab -->
      <n-tab-pane name="balancesave" tab="Balance SAVE">
        <BalanceSaveContent />
      </n-tab-pane>

      <!-- Open Orders Tab -->
      <n-tab-pane name="openorders" tab="📈 Open Orders">
        <div class="compact-wrapper">
          <OpenOrdersDevComponent />
        </div>
      </n-tab-pane>

      <!-- Closed Orders Tab -->
      <n-tab-pane name="closedorders" tab="📊 Closed Orders">
        <ClosedOrdersDevTabbed />
      </n-tab-pane>

      <!-- Portfolio Distribution Tab -->
      <n-tab-pane name="distribution" tab="📊 Distribution">
        <PortfolioDistribution />
      </n-tab-pane>

      <!-- Fiat Wallet Tab -->
      <n-tab-pane name="fiatwallet" tab="💵 Fiat Wallet">
        <FiatWallet />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup>
definePageMeta({
    middleware: 'auth'
})
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useNotification } from 'naive-ui'
import OpenOrdersDevComponent from '~/components/OpenOrdersDev.vue'
import ClosedOrdersDevTabbed from '~/components/ClosedOrdersDevTabbed.vue'
import FiatWallet from '~/components/FiatWallet.vue'
import AppTopButtonBar from '~/components/AppTopButtonBar.vue'

ChartJS.register(ArcElement, Tooltip, Legend)

const notification = useNotification();
const { getExchangeLogo } = useExchangeLogos();
const route = useRoute();

let userID = useCookie('userID');
let isRefreshing = ref(false);
let lastUpdated = ref(null);
let exchanges = ref([]);
let selectedExchange = ref(null);
let activeTab = ref(route.query.tab || 'overview');

// Load cached balances on mount
await loadCachedBalances();

async function loadCachedBalances() {
  try {
    console.log('🔍 Dashboard: Loading cached balances...');

    // Fetch user exchanges structure
    const dbExchanges = await $fetch('/api/v1/fetchUserExchanges', {
      query: {
        userID: userID.value,
      }
    });

    console.log('📊 Dashboard: Found exchanges:', dbExchanges.data.map(e => e.exchange));

    // Fetch cached balances
    const cachedResponse = await $fetch('/api/v1/getCachedBalances', {
      query: {
        userID: userID.value
      }
    });

    console.log('💾 Dashboard: Loaded cached balances:', cachedResponse.count);

    let exchangesData = [];

    // Process each exchange
    if (dbExchanges.data.length) {
      for (let i = 0; i < dbExchanges.data.length; i++) {
        let currentExchange = dbExchanges.data[i].exchange;
        let apiKeys = dbExchanges.data[i].apiKeys;

        console.log(`\n💱 Processing ${currentExchange}...`);

        let exchangeData = {
          name: currentExchange,
          apiKeys: [],
          combinedBalance: []
        };

        // Handle both old format (flat array) and new format (array with name)
        let apiKeysList = [];

        if (apiKeys && apiKeys.length > 0) {
          if (apiKeys[0].name !== undefined) {
            // New format: array of { name, keys: [...] }
            apiKeysList = apiKeys.map(k => k.name);
            console.log(`  📋 API Keys (named):`, apiKeysList);
          } else {
            // Old format: single unnamed key
            apiKeysList = ['default'];
            console.log(`  📋 API Keys (default):`, apiKeysList);
          }
        }

        // Find cached balance for each API key
        for (let apiKeyName of apiKeysList) {
          const cachedBalance = cachedResponse.balances.find(
            b => b.exchange === currentExchange && b.apiKeyName === apiKeyName
          );

          if (cachedBalance) {
            console.log(`  ✅ Found cached balance for ${currentExchange} - ${apiKeyName}`);

            // Update lastUpdated timestamp
            if (!lastUpdated.value || new Date(cachedBalance.lastUpdated) > new Date(lastUpdated.value)) {
              lastUpdated.value = cachedBalance.lastUpdated;
            }

            // Convert cached balance to array format
            let balanceArray = [];

            if (cachedBalance.balance && cachedBalance.balance.free) {
              const calculateUsed = (freeVal, totalVal, usedVal) => {
                const f = Number(freeVal || 0);
                const t = Number(totalVal || 0);
                const u = Number(usedVal || 0);
                if (u === 0 && t > 0) {
                  return Math.max(0, t - f);
                }
                return u;
              };

              for (let coin in cachedBalance.balance.free) {
                const freeVal = cachedBalance.balance.free[coin] || 0;
                const totalVal = cachedBalance.balance.total[coin] || 0;
                const usedVal = calculateUsed(freeVal, totalVal, cachedBalance.balance.used[coin]);

                if (freeVal > 0 || usedVal > 0 || totalVal > 0) {
                  let coinData = {
                    coin: coin,
                    free: freeVal,
                    used: usedVal,
                    total: totalVal,
                    usdt: 0
                  };
                  balanceArray.push(coinData);
                }
              }
            }

            exchangeData.apiKeys.push({
              apiKeyName: apiKeyName,
              balance: balanceArray,
              totalUSD: cachedBalance.totalUSD || 0,
              error: null
            });

            // Add to combined balance for chart
            balanceArray.forEach(asset => {
              let existingAsset = exchangeData.combinedBalance.find(a => a.coin === asset.coin);
              if (existingAsset) {
                existingAsset.free += asset.free;
                existingAsset.used += asset.used;
                existingAsset.total += asset.total;
                existingAsset.usdt += asset.usdt;
              } else {
                exchangeData.combinedBalance.push({ ...asset });
              }
            });
          } else {
            console.log(`  ⚠️ No cached balance for ${currentExchange} - ${apiKeyName}`);
            // Add empty entry
            exchangeData.apiKeys.push({
              apiKeyName: apiKeyName,
              balance: [],
              totalUSD: 0,
              error: 'No cached data available. Click refresh to load.'
            });
          }
        }

        exchangesData.push(exchangeData);
        console.log(`  ✓ Added ${currentExchange} to dashboard`);
      }
    }

    exchanges.value = exchangesData;
    console.log(`\n🎯 Dashboard: Total exchanges loaded: ${exchanges.value.length}`);

  } catch (error) {
    console.error('❌ Error loading cached balances:', error);
    notification.error({
      content: 'Failed to load balances',
      meta: error.message,
      duration: 3000
    });
  }
}

async function refreshBalances() {
  isRefreshing.value = true;

  try {
    console.log('🔄 Refreshing balances from exchanges...');

    const response = await $fetch('/api/v1/syncBalances', {
      method: 'POST',
      body: {
        userID: userID.value
      }
    });

    console.log('✅ Sync complete:', response);

    notification.success({
      content: 'Balances refreshed!',
      meta: `Updated ${response.cached} balances successfully`,
      duration: 3000
    });

    // Reload cached balances after sync
    await loadCachedBalances();

  } catch (error) {
    console.error('❌ Error refreshing balances:', error);
    notification.error({
      content: 'Failed to refresh balances',
      meta: error.message,
      duration: 3000
    });
  } finally {
    isRefreshing.value = false;
  }
}

function formatTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// Define table columns with formatted numbers
const tableColumns = [
  {
    title: "Coin",
    key: "coin",
  },
  {
    title: "Free",
    key: "free",
    render: (row) => formatNumber(row.free)
  },
  {
    title: "Used",
    key: "used",
    render: (row) => formatNumber(row.used)
  },
  {
    title: "Total",
    key: "total",
    render: (row) => formatNumber(row.total)
  },
  {
    title: "Total USD",
    key: "usdt",
    render: (row) => formatNumber(row.usdt)
  },
];

// Calculate global totals for all important currencies (computed)
const GlobalBalanceLCX = computed(() => {
  let total = 0;
  exchanges.value.forEach(exchange => {
    exchange.combinedBalance.forEach(asset => {
      if (asset.coin.toUpperCase() === "LCX") total += asset.total;
    });
  });
  return total;
});

const GlobalBalanceJOB = computed(() => {
  let total = 0;
  exchanges.value.forEach(exchange => {
    exchange.combinedBalance.forEach(asset => {
      if (asset.coin.toUpperCase() === "JOB") total += asset.total;
    });
  });
  return total;
});

const GlobalBalanceTOTO = computed(() => {
  let total = 0;
  exchanges.value.forEach(exchange => {
    exchange.combinedBalance.forEach(asset => {
      if (asset.coin.toUpperCase() === "TOTO") total += asset.total;
    });
  });
  return total;
});

const GlobalBalanceUSD = computed(() => {
  let total = 0;
  exchanges.value.forEach(exchange => {
    exchange.combinedBalance.forEach(asset => {
      if (asset.coin.toUpperCase() === "USD") total += asset.total;
    });
  });
  return total;
});

const GlobalBalanceUSDC = computed(() => {
  let total = 0;
  exchanges.value.forEach(exchange => {
    exchange.combinedBalance.forEach(asset => {
      if (asset.coin.toUpperCase() === "USDC") total += asset.total;
    });
  });
  return total;
});

const GlobalBalanceUSDT = computed(() => {
  let total = 0;
  exchanges.value.forEach(exchange => {
    exchange.combinedBalance.forEach(asset => {
      if (asset.coin.toUpperCase() === "USDT") total += asset.total;
    });
  });
  return total;
});

const GlobalBalanceEUR = computed(() => {
  let total = 0;
  exchanges.value.forEach(exchange => {
    exchange.combinedBalance.forEach(asset => {
      if (asset.coin.toUpperCase() === "EUR") total += asset.total;
    });
  });
  return total;
});

// Create data for global totals table with GRAND TOTAL row (computed)
const globalTotalsData = computed(() => {
  let exchangeTotals = {};

  exchanges.value.forEach(exchange => {
    // Initialize exchange totals
    if (!exchangeTotals[exchange.name]) {
      exchangeTotals[exchange.name] = {
        LCX: 0,
        JOB: 0,
        TOTO: 0,
        USD: 0,
        USDC: 0,
        USDT: 0,
        EUR: 0
      };
    }

    exchange.combinedBalance.forEach(asset => {
      const coin = asset.coin.toUpperCase();
      const total = asset.total;

      // Add to exchange totals
      if (exchangeTotals[exchange.name][coin] !== undefined) {
        exchangeTotals[exchange.name][coin] += total;
      }
    });
  });

  return [
    ...Object.keys(exchangeTotals).map(exchangeName => ({
      exchange: exchangeName.toUpperCase(),
      LCX: exchangeTotals[exchangeName].LCX,
      JOB: exchangeTotals[exchangeName].JOB,
      TOTO: exchangeTotals[exchangeName].TOTO,
      USD: exchangeTotals[exchangeName].USD,
      USDC: exchangeTotals[exchangeName].USDC,
      USDT: exchangeTotals[exchangeName].USDT,
      EUR: exchangeTotals[exchangeName].EUR
    })),
    {
      exchange: 'GRAND TOTAL',
      LCX: GlobalBalanceLCX.value,
      JOB: GlobalBalanceJOB.value,
      TOTO: GlobalBalanceTOTO.value,
      USD: GlobalBalanceUSD.value,
      USDC: GlobalBalanceUSDC.value,
      USDT: GlobalBalanceUSDT.value,
      EUR: GlobalBalanceEUR.value
    }
  ];
});

// Define columns for global totals breakdown table
const globalTotalsColumns = [
  {
    title: "Exchange",
    key: "exchange",
  },
  {
    title: "LCX",
    key: "LCX",
    render: (row) => formatNumber(row.LCX)
  },
  {
    title: "JOB",
    key: "JOB",
    render: (row) => formatNumber(row.JOB)
  },
  {
    title: "TOTO",
    key: "TOTO",
    render: (row) => formatNumber(row.TOTO)
  },
  {
    title: "USD",
    key: "USD",
    render: (row) => formatNumber(row.USD)
  },
  {
    title: "USDC",
    key: "USDC",
    render: (row) => formatNumber(row.USDC)
  },
  {
    title: "USDT",
    key: "USDT",
    render: (row) => formatNumber(row.USDT)
  },
  {
    title: "EUR",
    key: "EUR",
    render: (row) => formatNumber(row.EUR)
  },
];

// Function to format balances for chart
function formatBalance(balance) {
  let data = {
    labels: [],
    datasets: [
      {
        backgroundColor: [],
        data: []
      }
    ]
  }

  for (let i = 0; i < balance.length; i++) {
    data.labels.push(balance[i].coin);
    data.datasets[0].data.push(balance[i].total);
    data.datasets[0].backgroundColor.push(stringToHex(balance[i].coin));
  }

  return data;
}

// Function to convert string to hex color
function stringToHex(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const rgb = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    rgb[i] = (hash >> (i * 8)) & 255;
  }

  const hex = rgb.reduce((acc, val) => acc + val.toString(16).padStart(2, '0'), '');

  return `#${hex}`;
}

// Function to format numbers with thousands separator and decimals
function formatNumber(value) {
  if (value === null || value === undefined || value === 0) {
    return '0.00';
  }

  const num = parseFloat(value);
  if (isNaN(num)) {
    return '0.00';
  }

  // Format with 2 decimals and thousands separator
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

</script>

<style scoped>
.dashboard-container {
  padding: 0;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0118 0%, #1a0a2e 100%);
}

/* Refresh Card Styles */
.refresh-stat {
  border-color: rgba(16, 235, 4, 0.3);
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.05), rgba(16, 235, 4, 0.02));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px !important;
}

.refresh-btn-full {
  width: 100%;
  font-weight: 700;
  height: 40px;
  font-size: 14px;
}

/* Tabs */
.dashboard-tabs {
  margin-top: 0;
}

.dashboard-tabs :deep(.n-tabs-nav) {
  background: rgba(255, 255, 255, 0.02);
  padding: 8px 12px;
  border-radius: 0;
  margin: 0;
}

.dashboard-tabs :deep(.n-tabs-tab) {
  font-weight: 600;
  font-size: 14px;
}

.dashboard-tabs :deep(.n-tab-pane) {
  overflow: visible !important;
  height: auto !important;
  max-height: none !important;
  padding: 15px !important;
}

.dashboard-tabs :deep(.n-tabs-pane-wrapper) {
  overflow: visible !important;
  height: auto !important;
}

/* Compact wrapper for Open Orders tab */
.compact-wrapper {
  transform: scale(0.85);
  transform-origin: top left;
  width: 117.65%; /* Compensate for scale: 100 / 0.85 */
  margin-bottom: -15%;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
  margin-bottom: 15px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid;
  transition: all 0.3s ease;
  cursor: default;
}

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.total-exchanges {
  border-color: rgba(16, 235, 4, 0.3);
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.05), rgba(16, 235, 4, 0.02));
}

.lcx-stat {
  border-color: rgba(218, 216, 96, 0.3);
  background: linear-gradient(135deg, rgba(218, 216, 96, 0.05), rgba(218, 216, 96, 0.02));
}

.job-stat {
  border-color: rgba(5, 245, 237, 0.3);
  background: linear-gradient(135deg, rgba(5, 245, 237, 0.05), rgba(5, 245, 237, 0.02));
}

.toto-stat {
  border-color: rgba(147, 51, 234, 0.3);
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.05), rgba(147, 51, 234, 0.02));
}

.usdc-stat {
  border-color: rgba(96, 167, 218, 0.3);
  background: linear-gradient(135deg, rgba(96, 167, 218, 0.05), rgba(96, 167, 218, 0.02));
}

.usdt-stat {
  border-color: rgba(80, 220, 100, 0.3);
  background: linear-gradient(135deg, rgba(80, 220, 100, 0.05), rgba(80, 220, 100, 0.02));
}

.usd-stat {
  border-color: rgba(133, 226, 31, 0.3);
  background: linear-gradient(135deg, rgba(133, 226, 31, 0.05), rgba(133, 226, 31, 0.02));
}

.eur-stat {
  border-color: rgba(255, 165, 0, 0.3);
  background: linear-gradient(135deg, rgba(255, 165, 0, 0.05), rgba(255, 165, 0, 0.02));
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.total-exchanges .stat-icon {
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.2), rgba(16, 235, 4, 0.1));
  color: #10eb04;
}

.lcx-stat .stat-icon {
  background: linear-gradient(135deg, rgba(218, 216, 96, 0.2), rgba(218, 216, 96, 0.1));
  color: rgb(218, 216, 96);
}

.job-stat .stat-icon {
  background: linear-gradient(135deg, rgba(5, 245, 237, 0.2), rgba(5, 245, 237, 0.1));
  color: rgb(5, 245, 237);
}

.toto-stat .stat-icon {
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(147, 51, 234, 0.1));
  color: rgb(147, 51, 234);
}

.usdc-stat .stat-icon {
  background: linear-gradient(135deg, rgba(96, 167, 218, 0.2), rgba(96, 167, 218, 0.1));
  color: rgb(96, 167, 218);
}

.usdt-stat .stat-icon {
  background: linear-gradient(135deg, rgba(80, 220, 100, 0.2), rgba(80, 220, 100, 0.1));
  color: rgb(80, 220, 100);
}

.usd-stat .stat-icon {
  background: linear-gradient(135deg, rgba(133, 226, 31, 0.2), rgba(133, 226, 31, 0.1));
  color: rgb(133, 226, 31);
}

.eur-stat .stat-icon {
  background: linear-gradient(135deg, rgba(255, 165, 0, 0.2), rgba(255, 165, 0, 0.1));
  color: rgb(255, 165, 0);
}

.stat-icon svg {
  width: 16px;
  height: 16px;
}

.stat-content {
  flex: 1;
  overflow: hidden;
}

.stat-label {
  margin: 0;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.stat-value {
  margin: 2px 0 0 0;
  font-size: 15px;
  font-weight: 800;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Breakdown Section */
.breakdown-section {
  margin-bottom: 20px;
}

.breakdown-section :deep(.n-collapse) {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  border: 1px solid rgba(16, 235, 4, 0.1);
}

/* Exchange Cards Grid */
.exchanges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.exchange-card {
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.03), rgba(5, 245, 237, 0.03));
  border-radius: 10px;
  padding: 0;
  border: 1px solid rgba(16, 235, 4, 0.15);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.exchange-card:hover {
  transform: translateY(-2px);
  border-color: rgba(16, 235, 4, 0.4);
  box-shadow: 0 8px 16px rgba(16, 235, 4, 0.15);
}

.exchange-card-header {
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.1), rgba(5, 245, 237, 0.1));
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(16, 235, 4, 0.1);
}

.exchange-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
  border-radius: 6px;
  background: white;
  padding: 3px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.exchange-name {
  margin: 0;
  font-size: 13px;
  font-weight: 800;
  color: #10eb04;
  flex: 1;
  letter-spacing: 0.3px;
}

.arrow-icon {
  color: #10eb04;
  transition: transform 0.3s ease;
}

.exchange-card:hover .arrow-icon {
  transform: translateX(4px);
}

.exchange-card-body {
  padding: 10px 12px;
}

.quick-stats {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.quick-stat {
  flex: 1;
  background: rgba(255, 255, 255, 0.03);
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
}

.quick-stat-label {
  display: block;
  font-size: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 2px;
}

.quick-stat-value {
  display: block;
  font-size: 13px;
  font-weight: 800;
  color: #fff;
}

.balance-highlights {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.balance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid;
  font-weight: 700;
}

.lcx-balance {
  background: rgba(218, 216, 96, 0.08);
  border-color: rgba(218, 216, 96, 0.3);
}

.usdc-balance {
  background: rgba(96, 167, 218, 0.08);
  border-color: rgba(96, 167, 218, 0.3);
}

.usdt-balance {
  background: rgba(80, 220, 100, 0.08);
  border-color: rgba(80, 220, 100, 0.3);
}

.eur-balance {
  background: rgba(255, 165, 0, 0.08);
  border-color: rgba(255, 165, 0, 0.3);
}

.toto-balance {
  background: rgba(147, 51, 234, 0.08);
  border-color: rgba(147, 51, 234, 0.3);
}

.balance-label {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 700;
}

.balance-value {
  font-size: 11px;
  font-weight: 800;
}

.lcx-balance .balance-value {
  color: rgb(218, 216, 96);
}

.usdc-balance .balance-value {
  color: rgb(96, 167, 218);
}

.usdt-balance .balance-value {
  color: rgb(80, 220, 100);
}

.eur-balance .balance-value {
  color: rgb(255, 165, 0);
}

.toto-balance .balance-value {
  color: rgb(147, 51, 234);
}

.exchange-card-footer {
  background: rgba(16, 235, 4, 0.05);
  padding: 6px 12px;
  text-align: center;
  border-top: 1px solid rgba(16, 235, 4, 0.1);
}

.view-details {
  font-size: 9px;
  font-weight: 700;
  color: #10eb04;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Exchange Detail View */
.exchange-detail-view {
  padding: 20px;
}

.detail-header {
  margin-bottom: 30px;
}

.back-btn {
  font-size: 16px;
  font-weight: 600;
  color: #10eb04;
  margin-bottom: 20px;
}

.exchange-title-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.exchange-logo-large {
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: 16px;
  background: white;
  padding: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.exchange-title {
  margin: 0;
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(135deg, #10eb04, #05f5ed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.api-key-card {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid rgba(16, 235, 4, 0.1);
}

.api-key-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.api-key-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #10eb04;
}

.chart-card {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(16, 235, 4, 0.1);
  position: sticky;
  top: 20px;
}

.chart-card h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 700;
  color: #10eb04;
}

/* Balance Table */
.balance-table :deep(.n-data-table-th) {
  background: rgba(16, 235, 4, 0.1);
  color: #10eb04;
  font-weight: 700;
}

.balance-table :deep(.n-data-table-td) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
</style>
