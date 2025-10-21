<template>
  <div class="modern-grid-ai-page">
    <!-- HEADER SECTION -->
 

    <!-- MAIN CONTENT - 3 COLUMN LAYOUT -->
    <div class="main-layout">
      <!-- LEFT SIDEBAR: AI Advisors + Quick Stats -->
      <div class="left-sidebar">
        <!-- AI Advisor Section -->
        <div class="section-header">
          <span class="section-icon">⚡</span>
          <h2>AI Advisor</h2>
        </div>

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
          class="ai-advisor-card"
        />

        <!-- Show message if no AI providers configured -->
        <div v-if="activeProviders.length === 0" class="no-ai-card">
          <div class="no-ai-content">
            <span class="no-ai-icon">⚡</span>
            <h3>Groq AI Not Configured</h3>
            <p class="no-ai-desc">Get FREE & SUPER FAST AI-powered grid bot recommendations!</p>

            <div class="features-list">
              <div class="feature-item">
                <span class="check">✅</span>
                <span>Multi-bot suggestions (1-10)</span>
              </div>
              <div class="feature-item">
                <span class="check">✅</span>
                <span>Balance-aware recommendations</span>
              </div>
              <div class="feature-item">
                <span class="check">✅</span>
                <span>Complete bot configurations</span>
              </div>
              <div class="feature-item">
                <span class="check">✅</span>
                <span>Risk level assessment</span>
              </div>
            </div>

            <div class="no-ai-cta">
              <p>→ Go to your <strong>Profile</strong> page to add your FREE Groq API key!</p>
              <a href="https://console.groq.com" target="_blank" class="groq-link">console.groq.com</a>
            </div>
          </div>
        </div>
      </div>

      <!-- CENTER COLUMN: Grid Bot Form -->
      <div class="center-content">
        <div class="section-header">
          <span class="section-icon">⚙️</span>
          <h2>Bot Configuration</h2>
        </div>

        <GridBotsFormPlusAI
          ref="gridBotFormRef"
          @update:balance="updateBalance"
          @update:orderbook="updateOrderbook"
          @update:price="updateCurrentPrice"
        />
      </div>

      <!-- RIGHT SIDEBAR: Market Data (Ticker Only) -->
      <div class="right-sidebar">
        <div class="section-header">
          <span class="section-icon">📊</span>
          <h2>Market Data</h2>
        </div>

        <TickerBar
          @update:price="updateCurrentPrice"
          @update:balance="updateBalance"
        />
      </div>
    </div>

    <!-- BOTTOM SECTION: Active Bots & Orders -->
    <div class="bottom-section">
      <div class="bots-column">
        <div class="section-header">
          <span class="section-icon">🤖</span>
          <h2>Active Grid Bots</h2>
        </div>
        <GridBotsList />
      </div>

      <div class="orders-column">
        <div class="section-header">
          <span class="section-icon">📋</span>
          <h2>Open Orders</h2>
        </div>
        <OpenOrdersDev :use-store-api-key="true" />
      </div>
    </div>
  </div>
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

onMounted(async () => {
  // Load exchange data without blocking
  await app.loadUserExchangeData(userID.value);

  // Fetch AI keys and price history
  fetchUserAiKeys();
  fetchPriceHistory();
});
</script>

<style scoped>
/* ========== FIXED HEIGHT LAYOUT (NO PAGE SCROLL) ========== */
.modern-grid-ai-page {
  height: calc(100vh - 68px);
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ========== MAIN LAYOUT (3 COLUMNS - FIXED HEIGHT) ========== */
.main-layout {
  display: grid;
  grid-template-columns: 280px 1fr 280px;
  gap: 12px;
  flex: 1;
  padding: 12px;
  overflow: hidden;
  min-height: 0;
}

@media (max-width: 1400px) {
  .main-layout {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }
}

/* ========== LEFT SIDEBAR (COMPACT) ========== */
.left-sidebar {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* ========== CENTER CONTENT (NO SCROLL) ========== */
.center-content {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* ========== RIGHT SIDEBAR (COMPACT) ========== */
.right-sidebar {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* ========== SECTION HEADERS (COMPACT) ========== */
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.section-icon {
  font-size: 16px;
}

.section-header h2 {
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

/* ========== AI ADVISOR CARD ========== */
.ai-advisor-card {
  margin-bottom: 16px;
}

/* ========== NO AI CONFIGURED CARD ========== */
.no-ai-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #2d1810 100%);
  border: 2px dashed #f55036;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}

.no-ai-content {
  color: rgba(255, 255, 255, 0.8);
}

.no-ai-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.no-ai-card h3 {
  color: #f55036;
  font-size: 18px;
  font-weight: 700;
  margin: 12px 0;
}

.no-ai-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 16px;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 16px 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  text-align: left;
}

.feature-item .check {
  font-size: 14px;
}

.no-ai-cta {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.no-ai-cta p {
  font-size: 12px;
  color: #f55036;
  margin-bottom: 8px;
}

.groq-link {
  color: #f55036;
  text-decoration: none;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.groq-link:hover {
  color: #ff6b52;
  text-decoration: underline;
}

/* ========== BOTTOM SECTION (HIDDEN - USE SEPARATE PAGES) ========== */
.bottom-section {
  display: none;
}

/* ========== SCROLLBAR STYLING ========== */
.left-sidebar::-webkit-scrollbar,
.center-content::-webkit-scrollbar,
.right-sidebar::-webkit-scrollbar {
  width: 6px;
}

.left-sidebar::-webkit-scrollbar-track,
.center-content::-webkit-scrollbar-track,
.right-sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.left-sidebar::-webkit-scrollbar-thumb,
.center-content::-webkit-scrollbar-thumb,
.right-sidebar::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

.left-sidebar::-webkit-scrollbar-thumb:hover,
.center-content::-webkit-scrollbar-thumb:hover,
.right-sidebar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}
</style>
