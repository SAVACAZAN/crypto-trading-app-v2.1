<script setup>
import { useAppStore } from '~/stores/app.store';
import { ref, h, watch, computed, onMounted } from "vue";

const app = useAppStore();

let userID = useCookie('userID');
let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);

// API Key selector
let availableApiKeys = ref([]);
let selectedApiKey = computed({
  get: () => app.getSelectedApiKey,
  set: (value) => app.setSelectedApiKey(value)
});
let loadingApiKeys = ref(false);
let apiKeyColors = ref({});

let base = currentSymbol.value.split('/')[0];
let quote = currentSymbol.value.split('/')[1];

// Balance display - detailed breakdown
let balanceBaseFree = ref(0);
let balanceBaseUsed = ref(0);
let balanceBaseTotal = ref(0);
let balanceQuoteFree = ref(0);
let balanceQuoteUsed = ref(0);
let balanceQuoteTotal = ref(0);
let loadingBalance = ref(false);

// Load available API keys for the current exchange
async function loadApiKeys() {
  loadingApiKeys.value = true;
  try {
    const response = await $fetch('/api/v1/fetchApiKeysList', {
      query: {
        userID: userID.value,
        exchange: currentExchange.value
      }
    });

    if (response.success && response.data && response.data.length > 0) {
      // Color palette for API keys
      const colors = ['#10eb04', '#05f5ed', '#f5a623', '#eb06eb', '#eadb11', '#50e3c2', '#f72c09', '#cb8d07'];

      // Store colors for each API key
      apiKeyColors.value = {};

      availableApiKeys.value = response.data.map((apiKey, index) => {
        const color = colors[index % colors.length];
        apiKeyColors.value[apiKey.name] = color;

        return {
          label: `${apiKey.name} (${apiKey.preview})`,
          value: apiKey.name
        };
      });

      // Select first API key by default if none selected
      if (!selectedApiKey.value && availableApiKeys.value.length > 0) {
        selectedApiKey.value = availableApiKeys.value[0].value;
      }

      // Load balance for the first API key
      await fetchBalance();
    } else {
      availableApiKeys.value = [];
      selectedApiKey.value = null;
      apiKeyColors.value = {};
    }
  } catch (error) {
    console.error('Failed to load API keys:', error);
    availableApiKeys.value = [];
    selectedApiKey.value = null;
    apiKeyColors.value = {};
  } finally {
    loadingApiKeys.value = false;
  }
}

// Custom render function for API key options with colored icons
function renderApiKeyLabel(option) {
  const color = apiKeyColors.value[option.value] || '#ffffff';
  return h('div', { style: 'display: flex; align-items: center;' }, [
    h('span', {
      style: `display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color}; margin-right: 8px; flex-shrink: 0;`
    }),
    h('span', { style: `color: ${color}; font-weight: 500;` }, option.label)
  ]);
}

// Fetch balance for selected API key
async function fetchBalance() {
  if (!selectedApiKey.value) {
    balanceBaseFree.value = 0;
    balanceBaseUsed.value = 0;
    balanceBaseTotal.value = 0;
    balanceQuoteFree.value = 0;
    balanceQuoteUsed.value = 0;
    balanceQuoteTotal.value = 0;
    return;
  }

  loadingBalance.value = true;
  try {
    const response = await $fetch('/api/v1/fetchBalance', {
      query: {
        userID: userID.value,
        exchange: currentExchange.value,
        apiKeyName: selectedApiKey.value
      }
    });

    if (response.data) {
      balanceBaseFree.value = response.data.free?.[base] || 0;
      balanceBaseUsed.value = response.data.used?.[base] || 0;
      balanceBaseTotal.value = response.data.total?.[base] || 0;
      balanceQuoteFree.value = response.data.free?.[quote] || 0;
      balanceQuoteUsed.value = response.data.used?.[quote] || 0;
      balanceQuoteTotal.value = response.data.total?.[quote] || 0;
    }
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    balanceBaseFree.value = 0;
    balanceBaseUsed.value = 0;
    balanceBaseTotal.value = 0;
    balanceQuoteFree.value = 0;
    balanceQuoteUsed.value = 0;
    balanceQuoteTotal.value = 0;
  } finally {
    loadingBalance.value = false;
  }
}

onMounted(async () => {
  await loadApiKeys();
});

// Watch for API key changes and reload balance
watch(selectedApiKey, async (newKey) => {
  if (newKey) {
    await fetchBalance();
  }
});
</script>

<template>
  <!-- API Key Selector and Balance Display -->
  <n-card style="margin-bottom: 16px; padding: 8px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed;">
      <thead>
        <tr style="border-bottom: 1px solid #444;">
          <th style="text-align: left; padding: 4px 8px; width: 25%;">API Key</th>
          <th style="text-align: left; padding: 4px 8px; width: 10%;">Coin</th>
          <th style="text-align: right; padding: 4px 8px; color: #10eb04; width: 21.66%;">Free</th>
          <th style="text-align: right; padding: 4px 8px; color: #f5a623; width: 21.66%;">Used</th>
          <th style="text-align: right; padding: 4px 8px; color: #50e3c2; width: 21.66%;">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td rowspan="2" style="padding: 4px 8px; vertical-align: middle;">
            <n-select
              v-model:value="selectedApiKey"
              :options="availableApiKeys"
              :loading="loadingApiKeys"
              placeholder="Select API Key"
              :disabled="availableApiKeys.length === 0"
              size="small"
              :render-label="renderApiKeyLabel"
            />
          </td>
          <td v-if="selectedApiKey && !loadingBalance" style="padding: 4px 8px;">
            <span style="display: inline-flex; align-items: center;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10eb04; margin-right: 6px;"></span>
              <span style="font-weight: bold; color: #10eb04;">{{ base }}</span>
            </span>
          </td>
          <td v-if="selectedApiKey && !loadingBalance" style="padding: 4px 8px; text-align: right; color: #10eb04;">{{ (['BTC', 'ETH'].includes(base)) ? Number(balanceBaseFree).toFixed(8) : Number(balanceBaseFree).toFixed(2) }}</td>
          <td v-if="selectedApiKey && !loadingBalance" style="padding: 4px 8px; text-align: right; color: #f5a623;">{{ (['BTC', 'ETH'].includes(base)) ? Number(balanceBaseUsed).toFixed(8) : Number(balanceBaseUsed).toFixed(2) }}</td>
          <td v-if="selectedApiKey && !loadingBalance" style="padding: 4px 8px; text-align: right; color: #50e3c2;">{{ (['BTC', 'ETH'].includes(base)) ? Number(balanceBaseTotal).toFixed(8) : Number(balanceBaseTotal).toFixed(2) }}</td>
          <td v-if="!selectedApiKey || loadingBalance" colspan="4" style="padding: 4px 8px; text-align: center;">
            <n-spin v-if="loadingBalance" size="small" />
            <n-text v-else type="warning" style="font-size: 11px;">Select an API key</n-text>
          </td>
        </tr>
        <tr v-if="selectedApiKey && !loadingBalance">
          <td style="padding: 4px 8px;">
            <span style="display: inline-flex; align-items: center;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #05f5ed; margin-right: 6px;"></span>
              <span style="font-weight: bold; color: #05f5ed;">{{ quote }}</span>
            </span>
          </td>
          <td style="padding: 4px 8px; text-align: right; color: #10eb04;">{{ (['BTC', 'ETH'].includes(quote)) ? Number(balanceQuoteFree).toFixed(8) : Number(balanceQuoteFree).toFixed(2) }}</td>
          <td style="padding: 4px 8px; text-align: right; color: #f5a623;">{{ (['BTC', 'ETH'].includes(quote)) ? Number(balanceQuoteUsed).toFixed(8) : Number(balanceQuoteUsed).toFixed(2) }}</td>
          <td style="padding: 4px 8px; text-align: right; color: #50e3c2;">{{ (['BTC', 'ETH'].includes(quote)) ? Number(balanceQuoteTotal).toFixed(8) : Number(balanceQuoteTotal).toFixed(2) }}</td>
        </tr>
      </tbody>
    </table>
  </n-card>
</template>
