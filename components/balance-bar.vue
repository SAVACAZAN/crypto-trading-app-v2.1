<script setup>
import { useAppStore } from '~/stores/app.store';

const app = useAppStore();
const userID = useCookie('userID');
const currentExchange = computed(() => app.getUserSelectedExchange);
const currentSymbol = computed(() => app.getUserSelectedMarket);

// Get selected API keys from store - REMOVE DUPLICATES
const selectedApiKeys = computed(() => {
  const keys = app.getSelectedApiKeys || [];
  return [...new Set(keys)]; // Remove duplicates
});

// Balance data for each API key
const balancesData = ref({});
const loadingBalances = ref(false);

// Parse base and quote from symbol
const base = computed(() => currentSymbol.value?.split('/')[0] || 'LCX');
const quote = computed(() => currentSymbol.value?.split('/')[1] || 'USDC');

// Fetch balances for all selected API keys
async function fetchBalances() {
  console.log('🔑 BalanceBar: fetchBalances called');
  console.log('🔑 BalanceBar: selectedApiKeys:', selectedApiKeys.value);

  if (!selectedApiKeys.value || selectedApiKeys.value.length === 0) {
    console.log('⚠️ BalanceBar: No API keys selected');
    balancesData.value = {};
    return;
  }

  loadingBalances.value = true;
  const newBalances = {};

  try {
    // Fetch balance for each API key
    for (const apiKeyName of selectedApiKeys.value) {
      console.log(`📊 BalanceBar: Fetching balance for ${apiKeyName}`);
      try {
        const response = await $fetch('/api/v1/fetchBalance', {
          query: {
            userID: userID.value,
            exchange: currentExchange.value,
            apiKeyName: apiKeyName
          }
        });

        console.log(`✅ BalanceBar: Got balance for ${apiKeyName}:`, response.data);

        if (response.data) {
          newBalances[apiKeyName] = {
            baseFree: response.data.free?.[base.value] || 0,
            baseUsed: response.data.used?.[base.value] || 0,
            baseTotal: response.data.total?.[base.value] || 0,
            quoteFree: response.data.free?.[quote.value] || 0,
            quoteUsed: response.data.used?.[quote.value] || 0,
            quoteTotal: response.data.total?.[quote.value] || 0,
          };
        }
      } catch (error) {
        console.error(`❌ BalanceBar: Failed to fetch balance for ${apiKeyName}:`, error);
      }
    }

    balancesData.value = newBalances;
    console.log('📊 BalanceBar: All balances fetched:', balancesData.value);
  } finally {
    loadingBalances.value = false;
  }
}

// Calculate totals across all API keys
const totalBalances = computed(() => {
  const totals = {
    baseFree: 0,
    baseUsed: 0,
    baseTotal: 0,
    quoteFree: 0,
    quoteUsed: 0,
    quoteTotal: 0,
  };

  Object.values(balancesData.value).forEach(balance => {
    totals.baseFree += Number(balance.baseFree) || 0;
    totals.baseUsed += Number(balance.baseUsed) || 0;
    totals.baseTotal += Number(balance.baseTotal) || 0;
    totals.quoteFree += Number(balance.quoteFree) || 0;
    totals.quoteUsed += Number(balance.quoteUsed) || 0;
    totals.quoteTotal += Number(balance.quoteTotal) || 0;
  });

  return totals;
});

// Watch for changes in selected API keys
watch(selectedApiKeys, () => {
  fetchBalances();
}, { immediate: true });

// Watch for symbol changes
watch(currentSymbol, () => {
  fetchBalances();
});

onMounted(() => {
  console.log('🔑 BalanceBar: Component mounted');
  console.log('🔑 BalanceBar: Selected API Keys:', selectedApiKeys.value);
  console.log('🔑 BalanceBar: Current Symbol:', currentSymbol.value);
  fetchBalances();
});
</script>

<template>
  <div class="balance-bar-container">
    <div v-if="loadingBalances" class="loading-state">
      <n-spin size="small" />
      <span class="loading-text">Loading balances...</span>
    </div>

    <div v-else-if="selectedApiKeys.length === 0" class="empty-state">
      <span class="empty-text">🔑 Select API keys to view balances</span>
    </div>

    <div v-else class="balance-grid">
      <!-- Individual API Balances -->
      <div v-for="(apiKey, index) in selectedApiKeys" :key="apiKey" class="api-balance-item">
        <div class="api-balance-section">
          <span class="api-name-badge">{{ apiKey }}</span>
          <span class="mini-dot base-dot"></span>
          <span class="mini-currency">{{ base }}</span>
          <span class="mini-value free">F:{{ (balancesData[apiKey]?.baseFree || 0).toFixed(2) }}</span>
          <span class="mini-value used">U:{{ (balancesData[apiKey]?.baseUsed || 0).toFixed(2) }}</span>
          <span class="mini-value total">T:{{ (balancesData[apiKey]?.baseTotal || 0).toFixed(2) }}</span>
          <span class="currency-separator">|</span>
          <span class="mini-dot quote-dot"></span>
          <span class="mini-currency">{{ quote }}</span>
          <span class="mini-value free">F:{{ (balancesData[apiKey]?.quoteFree || 0).toFixed(2) }}</span>
          <span class="mini-value used">U:{{ (balancesData[apiKey]?.quoteUsed || 0).toFixed(2) }}</span>
          <span class="mini-value total">T:{{ (balancesData[apiKey]?.quoteTotal || 0).toFixed(2) }}</span>
        </div>
      </div>

      <!-- Separator - only show if multiple API keys -->
      <div v-if="selectedApiKeys.length > 1" class="separator-item">
        <div class="separator-big"></div>
      </div>

      <!-- GLOBAL TOTALS - only show if multiple API keys -->
      <div v-if="selectedApiKeys.length > 1" class="global-totals-item">
        <div class="global-totals-section">
          <span class="global-label">🌐</span>
          <span class="mini-dot base-dot"></span>
          <span class="currency-name">{{ base }}</span>
          <span class="balance-value free">F:{{ totalBalances.baseFree.toFixed(2) }}</span>
          <span class="balance-value used">U:{{ totalBalances.baseUsed.toFixed(2) }}</span>
          <span class="balance-value total">T:{{ totalBalances.baseTotal.toFixed(2) }}</span>
          <span class="currency-separator">|</span>
          <span class="mini-dot quote-dot"></span>
          <span class="currency-name">{{ quote }}</span>
          <span class="balance-value free">F:{{ totalBalances.quoteFree.toFixed(2) }}</span>
          <span class="balance-value used">U:{{ totalBalances.quoteUsed.toFixed(2) }}</span>
          <span class="balance-value total">T:{{ totalBalances.quoteTotal.toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.balance-bar-container {
  display: flex;
  align-items: center;
  height: 100%;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(16, 235, 4, 0.3) transparent;
}

.balance-bar-container::-webkit-scrollbar {
  height: 4px;
}

.balance-bar-container::-webkit-scrollbar-track {
  background: transparent;
}

.balance-bar-container::-webkit-scrollbar-thumb {
  background: rgba(16, 235, 4, 0.3);
  border-radius: 2px;
}

.balance-bar-container::-webkit-scrollbar-thumb:hover {
  background: rgba(16, 235, 4, 0.5);
}

/* Loading State */
.loading-state {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-text {
  font-size: 10px;
  color: #10eb04;
  font-weight: 600;
}

/* Empty State */
.empty-state {
  display: flex;
  align-items: center;
}

.empty-text {
  font-size: 10px;
  color: rgba(16, 235, 4, 0.6);
  font-weight: 600;
  font-style: italic;
}

/* Balance Grid Layout - Flexbox with Wrapping */
.balance-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 6px;
  width: 100%;
  max-height: 48px;
  overflow-y: auto;
  overflow-x: hidden;
}

.api-balance-item,
.separator-item,
.global-totals-item {
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  white-space: nowrap;
}

.api-balance-item {
  /* No extra styling needed - uses api-balance-section inside */
}

.separator-item {
  padding: 0 4px;
}

.global-totals-item {
  /* No extra styling needed - uses global-totals-section inside */
}

/* ===== INDIVIDUAL API BALANCE ===== */
.api-balance-section {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: rgba(16, 235, 4, 0.05);
  border-radius: 4px;
  flex-shrink: 0;
}

.api-name-badge {
  font-size: 10px;
  font-weight: 800;
  color: #f5a623;
  padding: 2px 6px;
  background: rgba(245, 166, 35, 0.15);
  border-radius: 3px;
}

.mini-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.mini-currency {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
}

.mini-value {
  font-size: 10px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.mini-value.free {
  color: #10eb04;
}

.mini-value.used {
  color: #feca57;
}

.mini-value.total {
  color: #50e3c2;
}

.currency-separator {
  color: rgba(255, 255, 255, 0.3);
  font-size: 10px;
  margin: 0 3px;
}

/* ===== GLOBAL TOTALS SECTION ===== */
.separator-big {
  width: 2px;
  height: 30px;
  background: linear-gradient(to bottom, transparent, rgba(16, 235, 4, 0.6), transparent);
  margin: 0 8px;
  flex-shrink: 0;
}

.global-totals-section {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.12), rgba(5, 245, 237, 0.12));
  border-radius: 4px;
  flex-shrink: 0;
}

.global-label {
  font-size: 11px;
  font-weight: 800;
  padding-right: 4px;
}

.base-dot {
  background: #10eb04;
  box-shadow: 0 0 5px rgba(16, 235, 4, 0.5);
}

.quote-dot {
  background: #05f5ed;
  box-shadow: 0 0 5px rgba(5, 245, 237, 0.5);
}

.currency-name {
  font-size: 10px;
  font-weight: 700;
  color: #10eb04;
  text-shadow: 0 0 3px rgba(16, 235, 4, 0.4);
}

.balance-value {
  font-size: 10px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.balance-value.free {
  color: #10eb04;
}

.balance-value.used {
  color: #feca57;
}

.balance-value.total {
  color: #50e3c2;
}
</style>
