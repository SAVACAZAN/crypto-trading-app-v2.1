<template>
  <div class="neon-dashboard">
    <!-- FLOATING HEADER WITH STATS -->
    <div class="floating-header">
      <div class="header-left">
        <div class="brand-box">
          <span class="neon-icon">⚡</span>
          <div class="brand-text">
            <h1>AI GRID BOTS</h1>
            <span class="version">V2.0 NEON</span>
          </div>
        </div>
      </div>

      <div class="header-stats">
        <div class="stat-pill">
          <span class="stat-label">AI Status</span>
          <span class="stat-value" :class="activeProviders.length > 0 ? 'active' : 'inactive'">
            {{ activeProviders.length > 0 ? 'ONLINE' : 'OFFLINE' }}
          </span>
        </div>
        <div class="stat-pill">
          <span class="stat-label">Provider</span>
          <span class="stat-value">{{ activeProviders.length > 0 ? 'GROQ AI' : 'NONE' }}</span>
        </div>
      </div>
    </div>

    <!-- MAIN GRID LAYOUT (NO TABS) -->
    <div class="dashboard-grid">
      <!-- AI ADVISOR PANEL (Always visible on left) -->
      <div class="ai-panel">
        <div class="panel-header">
          <div class="header-glow"></div>
          <h2>🧠 AI ADVISOR</h2>
          <p>Powered by Groq Llama 3.3 70B</p>
        </div>

        <div class="ai-content">
          <!-- AI Provider Cards -->
          <UniversalAiAdvisor
            v-for="provider in activeProviders"
            :key="provider.id"
            :provider="provider"
            :balance="balanceData"
            :orderbook="orderbookData"
            :price-history="priceHistoryData"
            :current-price="currentPrice"
            @apply-suggestion="applyAISuggestion"
            class="ai-advisor-widget"
          />

          <!-- No AI Configured -->
          <div v-if="activeProviders.length === 0" class="no-ai-neon">
            <div class="pulsing-circle">⚡</div>
            <h3>AI NOT CONFIGURED</h3>
            <p class="no-ai-text">Unlock FREE AI-powered recommendations</p>

            <div class="benefits-grid">
              <div class="benefit">✓ Multi-bot configs</div>
              <div class="benefit">✓ Balance-aware</div>
              <div class="benefit">✓ Risk analysis</div>
              <div class="benefit">✓ Auto-optimize</div>
            </div>

            <div class="cta-box">
              <p class="cta-text">Setup Groq API in Profile</p>
              <a href="https://console.groq.com" target="_blank" class="neon-link">
                Get Free Key →
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- MAIN CONTENT AREA (DIRECT FORM, NO TABS) -->
      <div class="content-area">
        <GridBotsFormV2Neon
          ref="gridBotFormRef"
          @update:balance="updateBalance"
          @update:orderbook="updateOrderbook"
          @update:price="updateCurrentPrice"
        />
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
/* ========== NEON THEME BASE (FIXED LAYOUT) ========== */
.neon-dashboard {
  height: 100%;
  background: #000000;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(120, 0, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 0, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(0, 255, 255, 0.1) 0%, transparent 50%);
  padding: 15px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ========== FLOATING HEADER (MINI BANNER - 30PX) ========== */
.floating-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(20, 20, 20, 0.9);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  padding: 4px 12px;
  margin-bottom: 8px;
  backdrop-filter: blur(20px);
  box-shadow:
    0 0 10px rgba(0, 255, 255, 0.2),
    inset 0 0 10px rgba(0, 255, 255, 0.05);
  flex-shrink: 0;
  height: 32px;
}

.brand-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.neon-icon {
  font-size: 18px;
  filter: drop-shadow(0 0 5px #00ffff);
}

.brand-text h1 {
  font-size: 14px;
  font-weight: 900;
  margin: 0;
  background: linear-gradient(90deg, #00ffff, #ff00ff, #00ffff);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: neonGradient 3s linear infinite;
  letter-spacing: 1px;
}

@keyframes neonGradient {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}

.version {
  font-size: 8px;
  color: #00ffff;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-shadow: 0 0 3px #00ffff;
}

.header-stats {
  display: flex;
  gap: 6px;
}

.stat-pill {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 2px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 8px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.stat-value.active {
  color: #00ff00;
  text-shadow: 0 0 3px #00ff00;
}

.stat-value.inactive {
  color: #ff0066;
  text-shadow: 0 0 3px #ff0066;
}

/* ========== DASHBOARD GRID (FIXED HEIGHT, NO TABS) ========== */
.dashboard-grid {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 12px;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

@media (max-width: 1400px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    height: auto;
  }
}

/* ========== AI PANEL (COMPACT - 4X SMALLER) ========== */
.ai-panel {
  background: rgba(20, 20, 20, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 10px;
  backdrop-filter: blur(20px);
  box-shadow:
    0 0 15px rgba(0, 255, 255, 0.2),
    inset 0 0 15px rgba(0, 255, 255, 0.05);
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.panel-header {
  position: relative;
  text-align: center;
  padding-bottom: 8px;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  flex-shrink: 0;
}

.header-glow {
  display: none;
}

.panel-header h2 {
  font-size: 12px;
  font-weight: 900;
  color: #00ffff;
  margin: 0;
  text-shadow: 0 0 5px #00ffff;
  letter-spacing: 1px;
}

.panel-header p {
  font-size: 8px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.ai-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto;
}

.ai-advisor-widget {
  font-size: 10px;
}

/* ========== NO AI NEON CARD (COMPACT) ========== */
.no-ai-neon {
  background: rgba(0, 0, 0, 0.6);
  border: 1px dashed rgba(255, 0, 102, 0.5);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}

.pulsing-circle {
  width: 40px;
  height: 40px;
  margin: 0 auto 8px;
  background: radial-gradient(circle, rgba(255, 0, 102, 0.2), transparent);
  border: 1px solid #ff0066;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  animation: pulse 2s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(255, 0, 102, 0.5);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 0, 102, 0.5); }
  50% { transform: scale(1.05); box-shadow: 0 0 15px rgba(255, 0, 102, 0.8); }
}

.no-ai-neon h3 {
  font-size: 10px;
  font-weight: 800;
  color: #ff0066;
  margin: 0 0 4px 0;
  letter-spacing: 0.5px;
  text-shadow: 0 0 5px #ff0066;
}

.no-ai-text {
  font-size: 8px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.benefits-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
  margin-bottom: 8px;
}

.benefit {
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  padding: 4px;
  font-size: 8px;
  color: #00ffff;
  font-weight: 600;
}

.cta-box {
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cta-text {
  font-size: 8px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4px;
}

.neon-link {
  display: inline-block;
  color: #ff0066;
  text-decoration: none;
  font-size: 8px;
  font-weight: 700;
  padding: 4px 8px;
  border: 1px solid #ff0066;
  border-radius: 4px;
  transition: all 0.3s ease;
  text-shadow: 0 0 3px #ff0066;
}

.neon-link:hover {
  background: rgba(255, 0, 102, 0.2);
  box-shadow: 0 0 10px rgba(255, 0, 102, 0.5);
}

/* ========== CONTENT AREA (FIXED HEIGHT) ========== */
.content-area {
  background: rgba(20, 20, 20, 0.8);
  border: 1px solid rgba(255, 0, 255, 0.3);
  border-radius: 12px;
  padding: 12px;
  backdrop-filter: blur(20px);
  box-shadow:
    0 0 15px rgba(255, 0, 255, 0.2),
    inset 0 0 15px rgba(255, 0, 255, 0.05);
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* ========== SCROLLBAR NEON ========== */
.ai-panel::-webkit-scrollbar,
.content-area::-webkit-scrollbar {
  width: 8px;
}

.ai-panel::-webkit-scrollbar-track,
.content-area::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

.ai-panel::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #00ffff, #ff00ff);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.content-area::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #ff00ff, #00ffff);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(255, 0, 255, 0.5);
}

.ai-panel::-webkit-scrollbar-thumb:hover,
.content-area::-webkit-scrollbar-thumb:hover {
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
}

/* ========== RESPONSIVE ========== */
@media (max-width: 768px) {
  .floating-header {
    flex-direction: column;
    gap: 12px;
  }

  .neon-tabs {
    flex-wrap: wrap;
  }

  .tab-btn span:not(.tab-icon) {
    display: none;
  }
}
</style>
