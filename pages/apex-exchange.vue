<template>
  <div class="apex-page">
    <n-space vertical :size="20">
      <!-- Header -->
      <n-card style="background: linear-gradient(135deg, #1a1a1a 0%, #0d1f2d 100%); border: 2px solid #00d4ff;">
        <template #header>
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="padding: 12px; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); border-radius: 12px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
            </div>
            <div>
              <h1 style="margin: 0; font-size: 28px; color: #00d4ff;">🎯 Apex Exchange (Omni)</h1>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #888;">
                API Integration • Real-time Balance • Live Markets
              </p>
            </div>
          </div>
        </template>

        <n-space :size="16">
          <n-select
            v-model:value="selectedApiKey"
            :options="apiKeyOptions"
            placeholder="Select API Key"
            style="width: 300px;"
            @update:value="handleApiKeyChange"
          />
          <n-button type="primary" @click="fetchBalance" :loading="loadingBalance">
            💰 Fetch Balance
          </n-button>
          <n-button type="info" @click="fetchMarkets" :loading="loadingMarkets">
            📊 Fetch Markets
          </n-button>
        </n-space>
      </n-card>

      <!-- API Key Info -->
      <n-card v-if="selectedApiKey !== null" style="border: 1px solid #333; background: rgba(0, 212, 255, 0.05);">
        <n-space :size="12" align="center">
          <div style="padding: 8px; background: #00d4ff; border-radius: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
            </svg>
          </div>
          <div>
            <div style="font-size: 14px; color: #00d4ff; font-weight: 700;">
              {{ apiKeyOptions[selectedApiKey]?.label }}
            </div>
            <div style="font-size: 12px; color: #888; margin-top: 4px;">
              API Key: {{ maskApiKey(apiKeyOptions[selectedApiKey]?.apiKey) }}
            </div>
          </div>
        </n-space>
      </n-card>

      <!-- Balance Section -->
      <n-card title="💰 Account Balance" style="border: 1px solid #00d4ff;">
        <n-spin :show="loadingBalance">
          <div v-if="balance && balance.length > 0">
            <n-data-table
              :columns="balanceColumns"
              :data="balance"
              :pagination="false"
              :bordered="false"
              size="small"
            />
          </div>
          <n-empty v-else description="No balance data available" style="padding: 40px;">
            <template #extra>
              <n-button @click="fetchBalance" :loading="loadingBalance">
                Fetch Balance
              </n-button>
            </template>
          </n-empty>
        </n-spin>
      </n-card>

      <!-- Markets Section -->
      <n-card title="📊 Available Markets" style="border: 1px solid #00d4ff;">
        <n-spin :show="loadingMarkets">
          <div v-if="markets && markets.length > 0">
            <n-data-table
              :columns="marketColumns"
              :data="markets"
              :pagination="{ pageSize: 20 }"
              :bordered="false"
              size="small"
            />
          </div>
          <n-empty v-else description="No market data available" style="padding: 40px;">
            <template #extra>
              <n-button @click="fetchMarkets" :loading="loadingMarkets">
                Fetch Markets
              </n-button>
            </template>
          </n-empty>
        </n-spin>
      </n-card>
    </n-space>
  </div>
</template>

<script setup>
import { h } from 'vue';

definePageMeta({
  middleware: 'auth'
});

const notification = useNotification();

// User ID
const userIDCookie = useCookie('userID');
const userID = userIDCookie.value;

// State
const selectedApiKey = ref(null);
const apiKeyOptions = ref([]);
const balance = ref([]);
const markets = ref([]);
const loadingBalance = ref(false);
const loadingMarkets = ref(false);

// Balance columns
const balanceColumns = [
  {
    title: 'Asset',
    key: 'asset',
    width: 120,
    render: (row) => h('span', { style: 'font-weight: 700; color: #00d4ff;' }, row.asset)
  },
  {
    title: 'Free',
    key: 'free',
    width: 150,
    render: (row) => h('span', { style: 'color: #10eb04;' }, row.free || '0.00')
  },
  {
    title: 'Locked',
    key: 'locked',
    width: 150,
    render: (row) => h('span', { style: 'color: #f5a623;' }, row.locked || '0.00')
  },
  {
    title: 'Total',
    key: 'total',
    width: 150,
    render: (row) => h('span', { style: 'color: #05f5ed; font-weight: 600;' }, row.total || '0.00')
  }
];

// Market columns
const marketColumns = [
  {
    title: 'Symbol',
    key: 'symbol',
    width: 150,
    render: (row) => h('span', { style: 'font-weight: 700; color: #00d4ff;' }, row.symbol)
  },
  {
    title: 'Base',
    key: 'base',
    width: 100
  },
  {
    title: 'Quote',
    key: 'quote',
    width: 100
  },
  {
    title: 'Last Price',
    key: 'lastPrice',
    width: 150,
    render: (row) => h('span', { style: 'color: #10eb04; font-weight: 600;' }, row.lastPrice || '-')
  },
  {
    title: 'Status',
    key: 'status',
    width: 120,
    render: (row) => {
      const color = row.status === 'TRADING' ? '#10eb04' : '#888';
      return h('span', { style: `color: ${color}; font-weight: 600;` }, row.status);
    }
  }
];

// Fetch API keys
async function fetchApiKeys() {
  try {
    const response = await $fetch('/api/v1/fetchOmniKeys', {
      query: { userID: userID }
    });

    if (response.success && response.data) {
      apiKeyOptions.value = response.data.map((key, index) => ({
        label: key.name,
        value: index,
        apiKey: key.apiKey,
        secret: key.secret,
        passphrase: key.passphrase
      }));

      if (apiKeyOptions.value.length > 0) {
        selectedApiKey.value = 0;
      }
    }
  } catch (error) {
    console.error('Failed to fetch Apex Exchange API keys:', error);
    notification.error({
      content: 'Error',
      meta: 'Failed to fetch API keys',
      duration: 3000
    });
  }
}

// Mask API key
function maskApiKey(key) {
  if (!key) return 'N/A';
  if (key.length <= 12) return '••••••••••••';
  return key.substring(0, 6) + '••••••••' + key.substring(key.length - 6);
}

// Handle API key change
function handleApiKeyChange(value) {
  selectedApiKey.value = value;
  balance.value = [];
  markets.value = [];
}

// Fetch balance
async function fetchBalance() {
  if (selectedApiKey.value === null) {
    notification.warning({
      content: 'No API Key Selected',
      meta: 'Please select an API key first',
      duration: 3000
    });
    return;
  }

  loadingBalance.value = true;

  try {
    const selectedKey = apiKeyOptions.value[selectedApiKey.value];

    const response = await $fetch('/api/v1/apex/balance', {
      method: 'POST',
      body: {
        apiKey: selectedKey.apiKey,
        secret: selectedKey.secret,
        passphrase: selectedKey.passphrase
      }
    });

    if (response.success) {
      balance.value = response.data;
      notification.success({
        content: 'Balance Fetched',
        meta: `${balance.value.length} assets loaded`,
        duration: 3000
      });
    } else {
      notification.error({
        content: 'Failed to Fetch Balance',
        meta: response.message || 'Unknown error',
        duration: 3000
      });
    }
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    notification.error({
      content: 'Error',
      meta: error.message || 'Failed to fetch balance',
      duration: 3000
    });
  } finally {
    loadingBalance.value = false;
  }
}

// Fetch markets
async function fetchMarkets() {
  loadingMarkets.value = true;

  try {
    const response = await $fetch('/api/v1/apex/markets');

    if (response.success) {
      markets.value = response.data;
      notification.success({
        content: 'Markets Fetched',
        meta: `${markets.value.length} markets loaded`,
        duration: 3000
      });
    } else {
      notification.error({
        content: 'Failed to Fetch Markets',
        meta: response.message || 'Unknown error',
        duration: 3000
      });
    }
  } catch (error) {
    console.error('Failed to fetch markets:', error);
    notification.error({
      content: 'Error',
      meta: error.message || 'Failed to fetch markets',
      duration: 3000
    });
  } finally {
    loadingMarkets.value = false;
  }
}

// On mount
onMounted(() => {
  fetchApiKeys();
});
</script>

<style scoped>
.apex-page {
  width: 100%;
  padding: 20px;
}
</style>
