<template>
  <n-grid x-gap="12" :cols="12" item-responsive>
    <!-- LEFT COLUMN: Grid Bot Form + AI Advisors -->
    <n-gi span="12 800:3">
      <!-- Dynamic AI Advisor Cards (FREE providers first) -->
      <UniversalAiAdvisor
        v-for="provider in activeProviders"
        :key="provider.id"
        :provider="provider"
        :balance="balanceData"
        :orderbook="orderbookData"
        :price-history="priceHistoryData"
        :current-price="currentPrice"
        @apply-suggestion="applyAISuggestion"
        style="margin-bottom: 12px;"
      />

      <!-- Show message if no AI providers configured -->
      <n-card v-if="activeProviders.length === 0" style="margin-bottom: 12px; background: linear-gradient(135deg, #1a1a2e 0%, #2d1810 100%); border: 2px dashed #f55036;">
        <div style="text-align: center; padding: 20px; color: #a0aec0;">
          <span style="font-size: 48px;">⚡</span>
          <h3 style="color: #f55036; margin-top: 12px;">Groq AI Not Configured</h3>
          <p style="font-size: 13px; margin-top: 8px;">
            Get FREE & SUPER FAST AI-powered grid bot recommendations!
          </p>
          <ul style="text-align: left; display: inline-block; margin-top: 12px; font-size: 12px;">
            <li><strong>⚡ Groq API</strong> - FREE & Lightning Fast (Llama 3.3 70B)</li>
            <li>✅ Multi-bot suggestions (1-10 configurations)</li>
            <li>📊 Balance-aware recommendations</li>
            <li>🎯 Complete bot configurations (upper/lower/incremental/deviation)</li>
            <li>🔒 Risk level assessment</li>
          </ul>
          <p style="font-size: 12px; margin-top: 16px; color: #f55036;">
            → Go to your <strong>Profile</strong> page to add your FREE Groq API key!
          </p>
          <p style="font-size: 10px; margin-top: 8px; color: #888;">
            Get your free key at: <a href="https://console.groq.com" target="_blank" style="color: #f55036;">console.groq.com</a>
          </p>
        </div>
      </n-card>

      <!-- Grid Bot Form -->
      <GridBotsFormPlusAI
        ref="gridBotFormRef"
        @update:balance="updateBalance"
        @update:orderbook="updateOrderbook"
        @update:price="updateCurrentPrice"
      />
    </n-gi>

    <!-- MIDDLE COLUMN: OrderBook & Ticker -->
    <n-gi span="12 800:3">
      <TickerBar
        @update:price="updateCurrentPrice"
        @update:balance="updateBalance"
      />
      <OrderBook @update:orderbook="updateOrderbook" />
    </n-gi>

    <!-- RIGHT COLUMN: Grid Bots List & Open Orders -->
    <n-gi span="12 800:6">
      <GridBotsList />
      <OpenOrdersDev :use-store-api-key="true" />
    </n-gi>
  </n-grid>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAppStore } from '~/stores/app.store';

definePageMeta({
  middleware: 'auth'
});

const app = useAppStore();
const userID = useCookie('userID');

// References
const gridBotFormRef = ref(null);

// Market data for AI
const balanceData = ref(null);
const orderbookData = ref(null);
const priceHistoryData = ref(null);
const currentPrice = ref(null);

// User's AI API keys
const userAiKeys = ref({});

// AI Provider configurations - GROQ ONLY (FREE & SUPER FAST!)
const aiProviders = [
  {
    id: 'groq',
    name: 'Groq',
    emoji: '⚡',
    color: '#f55036',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #2d1810 100%)',
    endpoint: '/api/v1/groqAI',
    model: 'Llama 3.3 70B',
    free: true
  }
];

// Computed: Filter to show only providers with configured API keys
const activeProviders = computed(() => {
  return aiProviders.filter(provider => {
    const hasKey = userAiKeys.value[provider.id];
    if (hasKey) {
      console.log(`✅ ${provider.name} AI - API key configured`);
    }
    return hasKey;
  });
});

// Fetch user's configured AI API keys
async function fetchUserAiKeys() {
  try {
    const response = await $fetch('/api/v1/getAiApiKeys', {
      query: { userID: userID.value }
    });

    if (response.success) {
      userAiKeys.value = response.data;
      console.log('🔑 User AI Keys loaded:', Object.keys(response.data).filter(k => response.data[k]).join(', '));
    }
  } catch (error) {
    console.error('Failed to fetch AI keys:', error);
  }
}

// Load user exchange data
await app.loadUserExchangeData(userID.value);

// Fetch price history for AI analysis
async function fetchPriceHistory() {
  try {
    const response = await $fetch('/api/v1/fetchChart', {
      query: {
        userID: userID.value,
        exchange: app.getUserSelectedExchange,
        symbol: app.getUserSelectedMarket,
        timeframe: '1d',
        limit: 30
      }
    });

    if (response.success && response.data) {
      priceHistoryData.value = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch price history:', error);
  }
}

// Update handlers
function updateBalance(balance) {
  balanceData.value = balance;
}

function updateOrderbook(orderbook) {
  orderbookData.value = orderbook;
}

function updateCurrentPrice(price) {
  currentPrice.value = price;
}

// Apply AI suggestion to form
function applyAISuggestion(suggestion) {
  if (gridBotFormRef.value && gridBotFormRef.value.applyAISuggestion) {
    gridBotFormRef.value.applyAISuggestion(suggestion);
  }
}

onMounted(() => {
  fetchUserAiKeys();
  fetchPriceHistory();
});
</script>

<style scoped>
/* Page-specific styles */
</style>
