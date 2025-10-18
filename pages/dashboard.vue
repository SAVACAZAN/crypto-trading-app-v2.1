<template>
    <div style="padding: 20px;">
      <h2>Dashboard</h2>

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

ChartJS.register(ArcElement, Tooltip, Legend)

const { getExchangeLogo } = useExchangeLogos();

let userID = useCookie('userID');

let loaded = true;

// Fetch user exchanges
console.log('🔍 Dashboard: Fetching user exchanges...');
const dbExchanges = await $fetch('/api/v1/fetchUserExchanges', {
  query:{
    userID:userID.value,
  }
});

console.log('📊 Dashboard: Found exchanges:', dbExchanges.data.map(e => e.exchange));

let exchanges = [];

// Process each exchange and fetch balances for each API key
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

    // Fetch balance for each API key
    for (let apiKeyName of apiKeysList) {
      console.log(`  🔑 Fetching balance for ${currentExchange} - ${apiKeyName}...`);

      try {
        const response = await $fetch('/api/v1/fetchBalance', {
          query: {
            userID: userID.value,
            exchange: currentExchange,
            apiKeyName: apiKeyName
          }
        });

        console.log(`  ✅ Response:`, {
          success: response.success,
          hasData: !!response.data,
          hasFree: response.data?.free ? Object.keys(response.data.free).length : 0,
          log: response.log
        });

        if (response.success && response.data && response.data.free) {
          // Convert balance object to array format
          let balanceArray = [];
          let totalUSD = 0;

          // Helper function to calculate used = total - free if used is not available
          const calculateUsed = (freeVal, totalVal, usedVal) => {
            const f = Number(freeVal || 0);
            const t = Number(totalVal || 0);
            const u = Number(usedVal || 0);

            // If used is not provided or is 0, calculate it from total - free
            if (u === 0 && t > 0) {
              return Math.max(0, t - f);
            }
            return u;
          };

          for (let coin in response.data.free) {
            const freeVal = response.data.free[coin] || 0;
            const totalVal = response.data.total[coin] || 0;
            const usedVal = calculateUsed(freeVal, totalVal, response.data.used[coin]);

            // Include any asset that has any balance (free, used, or total)
            if (freeVal > 0 || usedVal > 0 || totalVal > 0) {
              let coinData = {
                coin: coin,
                free: freeVal,
                used: usedVal,
                total: totalVal,
                usdt: 0
              };
              balanceArray.push(coinData);
              console.log(`    💰 ${coin}: free=${freeVal}, used=${usedVal}, total=${totalVal}`);
            }
          }

          console.log(`  📈 Found ${balanceArray.length} assets with balance`);

          exchangeData.apiKeys.push({
            apiKeyName: apiKeyName,
            balance: balanceArray,
            totalUSD: totalUSD,
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
          console.log(`  ⚠️ No balance data or failed:`, response.log);
          // Add empty entry with error message
          exchangeData.apiKeys.push({
            apiKeyName: apiKeyName,
            balance: [],
            totalUSD: 0,
            error: response.log || 'Failed to fetch balance'
          });
        }
      } catch (e) {
        console.error(`  ❌ Error fetching balance for ${currentExchange} - ${apiKeyName}:`, e.message);
        // Add error entry
        exchangeData.apiKeys.push({
          apiKeyName: apiKeyName,
          balance: [],
          totalUSD: 0,
          error: e.message || 'Network error'
        });
      }
    }

    // Always add exchange even if no balances (to show errors)
    exchanges.push(exchangeData);
    console.log(`  ✓ Added ${currentExchange} to dashboard`);
  }
}

console.log(`\n🎯 Dashboard: Total exchanges loaded: ${exchanges.length}`);

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

// Calculate global totals for all important currencies
let GlobalBalanceLCX = 0;
let GlobalBalanceJOB = 0;
let GlobalBalanceUSD = 0;
let GlobalBalanceUSDC = 0;
let GlobalBalanceUSDT = 0;
let GlobalBalanceEUR = 0;

// Detailed breakdown by exchange
let exchangeTotals = {};

exchanges.forEach(exchange => {
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

    // Add to global totals
    if (coin === "LCX") {
      GlobalBalanceLCX += total;
    } else if (coin === "JOB") {
      GlobalBalanceJOB += total;
    } else if (coin === "USD") {
      GlobalBalanceUSD += total;
    } else if (coin === "USDC") {
      GlobalBalanceUSDC += total;
    } else if (coin === "USDT") {
      GlobalBalanceUSDT += total;
    } else if (coin === "EUR") {
      GlobalBalanceEUR += total;
    }
  });
});

// Create data for global totals table with GRAND TOTAL row
const globalTotalsData = [
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
    LCX: GlobalBalanceLCX,
    JOB: GlobalBalanceJOB,
    USD: GlobalBalanceUSD,
    USDC: GlobalBalanceUSDC,
    USDT: GlobalBalanceUSDT,
    EUR: GlobalBalanceEUR
  }
];

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
