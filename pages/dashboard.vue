<template>
    <div style="padding: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2>Dashboard</h2>
        <n-space>
          <n-tag v-if="lastUpdated" type="info">
            Last updated: {{ formatTime(lastUpdated) }}
          </n-tag>
          <n-button type="primary" :loading="isRefreshing" @click="refreshBalances">
            <template #icon>
              <n-icon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
              </n-icon>
            </template>
            Refresh Balances
          </n-button>
        </n-space>
      </div>

      <!-- Global totals with detailed breakdown -->
      <n-card style="margin-bottom: 20px;" title="Global Totals">
        <n-grid :cols="7" x-gap="12" style="margin-bottom: 20px;">
          <n-gi>
            <n-statistic label="Total Exchanges" :value="exchanges.length" />
          </n-gi>
          <n-gi>
            <n-statistic label="Total LCX" :value="formatNumber(GlobalBalanceLCX)" />
          </n-gi>
          <n-gi>
            <n-statistic label="Total JOB" :value="formatNumber(GlobalBalanceJOB)" />
          </n-gi>
          <n-gi>
            <n-statistic label="Total USD" :value="formatNumber(GlobalBalanceUSD)" />
          </n-gi>
          <n-gi>
            <n-statistic label="Total USDC" :value="formatNumber(GlobalBalanceUSDC)" />
          </n-gi>
          <n-gi>
            <n-statistic label="Total USDT" :value="formatNumber(GlobalBalanceUSDT)" />
          </n-gi>
          <n-gi>
            <n-statistic label="Total EUR" :value="formatNumber(GlobalBalanceEUR)" />
          </n-gi>
        </n-grid>

        <!-- Detailed breakdown table -->
        <n-collapse>
          <n-collapse-item title="View Detailed Breakdown by Exchange" name="breakdown">
            <n-data-table
              :columns="globalTotalsColumns"
              :data="globalTotalsData"
              size="small"
              :pagination="false"
            />
          </n-collapse-item>
        </n-collapse>
      </n-card>

      <!-- Exchange cards -->
      <div v-for="exchange in exchanges" :key="exchange.name" style="margin-bottom: 30px;">
        <n-card>
          <template #header>
            <div style="display: flex; align-items: center; gap: 12px;">
              <img
                :src="getExchangeLogo(exchange.name)"
                :alt="exchange.name"
                style="width: 32px; height: 32px; object-fit: contain; border-radius: 6px; background: white; padding: 4px;"
                @error="(e) => e.target.style.display = 'none'"
              />
              <span style="font-size: 18px; font-weight: 600;">{{ exchange.name.toUpperCase() }} Exchange</span>
            </div>
          </template>
          <n-grid x-gap="12" :cols="12">
            <n-gi span="8">
              <!-- Display balances for each API key -->
              <div v-for="apiKeyData in exchange.apiKeys" :key="apiKeyData.apiKeyName" style="margin-bottom: 20px;">
                <n-card size="small" :title="`API Key: ${apiKeyData.apiKeyName}`">
                  <template #header-extra>
                    <n-tag v-if="apiKeyData.balance.length > 0" type="success">
                      {{ apiKeyData.balance.length }} assets
                    </n-tag>
                    <n-tag v-else type="warning">No balance</n-tag>
                  </template>

                  <n-alert v-if="apiKeyData.error" type="error" style="margin-bottom: 10px;">
                    {{ apiKeyData.error }}
                  </n-alert>

                  <n-data-table
                      v-if="apiKeyData.balance.length > 0"
                      :columns="tableColumns"
                      :data="apiKeyData.balance"
                      size="small"
                      :pagination="false"
                  />
                  <n-empty v-else description="No balance data available" />
                </n-card>
              </div>
            </n-gi>
            <n-gi span="4">
              <n-card size="small" title="Asset Allocation">
                <Pie v-if="exchange.combinedBalance.length > 0" :data="formatBalance(exchange.combinedBalance)" />
                <n-empty v-else description="No assets" />
              </n-card>
            </n-gi>
          </n-grid>
        </n-card>
      </div>

      <!-- Show if no exchanges -->
      <n-empty v-if="exchanges.length === 0" description="No exchanges configured" />
    </div>
</template>

<script setup>
definePageMeta({
    middleware: 'auth'
})
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useNotification } from 'naive-ui'

ChartJS.register(ArcElement, Tooltip, Legend)

const notification = useNotification();
const { getExchangeLogo } = useExchangeLogos();

let userID = useCookie('userID');
let isRefreshing = ref(false);
let lastUpdated = ref(null);
let exchanges = ref([]);

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
      USD: exchangeTotals[exchangeName].USD,
      USDC: exchangeTotals[exchangeName].USDC,
      USDT: exchangeTotals[exchangeName].USDT,
      EUR: exchangeTotals[exchangeName].EUR
    })),
    {
      exchange: 'GRAND TOTAL',
      LCX: GlobalBalanceLCX.value,
      JOB: GlobalBalanceJOB.value,
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
