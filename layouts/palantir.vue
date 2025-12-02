<template>
  <div class="palantir-layout">
    <!-- PALANTIR TOP BAR (NEW COMPONENT) -->
    <PalantirTopbar />

    <!-- MAIN CONTAINER -->
    <div class="palantir-container">
      <!-- SIDEBAR MENU -->
      <div class="palantir-sidebar">
        <div class="sidebar-content">
          <!-- Core Section -->
          <div class="menu-section">
            <div class="section-title">CORE</div>
            <nuxt-link
              v-for="item in coreMenu"
              :key="item.path"
              :to="item.path"
              class="menu-item"
              :class="{ active: isActive(item.path) }"
            >
              <span class="menu-icon">{{ item.icon }}</span>
              <span class="menu-text">{{ item.label }}</span>
              <span v-if="item.badge" class="menu-badge">{{ item.badge }}</span>
            </nuxt-link>
          </div>

          <!-- Analytics Section -->
          <div class="menu-section">
            <div class="section-title">ANALYTICS</div>
            <nuxt-link
              v-for="item in analyticsMenu"
              :key="item.path"
              :to="item.path"
              class="menu-item"
              :class="{ active: isActive(item.path) }"
            >
              <span class="menu-icon">{{ item.icon }}</span>
              <span class="menu-text">{{ item.label }}</span>
            </nuxt-link>
          </div>

          <!-- Bots Section -->
          <div class="menu-section">
            <div class="section-title">BOTS</div>
            <nuxt-link
              v-for="item in botsMenu"
              :key="item.path"
              :to="item.path"
              class="menu-item"
              :class="{ active: isActive(item.path) }"
            >
              <span class="menu-icon">{{ item.icon }}</span>
              <span class="menu-text">{{ item.label }}</span>
            </nuxt-link>
          </div>

          <!-- Risk Section -->
          <div class="menu-section">
            <div class="section-title">RISK</div>
            <nuxt-link
              v-for="item in riskMenu"
              :key="item.path"
              :to="item.path"
              class="menu-item"
              :class="{ active: isActive(item.path) }"
            >
              <span class="menu-icon">{{ item.icon }}</span>
              <span class="menu-text">{{ item.label }}</span>
            </nuxt-link>
          </div>

          <!-- System Section -->
          <div class="menu-section">
            <div class="section-title">SYSTEM</div>
            <nuxt-link
              v-for="item in systemMenu"
              :key="item.path"
              :to="item.path"
              class="menu-item"
              :class="{ active: isActive(item.path) }"
            >
              <span class="menu-icon">{{ item.icon }}</span>
              <span class="menu-text">{{ item.label }}</span>
            </nuxt-link>
          </div>
        </div>

        <!-- Sidebar Footer -->
        <div class="sidebar-footer">
          <nuxt-link to="/cryptoapp" class="back-to-app">
            <span class="icon">⬅️</span>
            <span class="text">Back to Main App</span>
          </nuxt-link>
        </div>
      </div>

      <!-- CONTENT AREA -->
      <div class="palantir-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '~/stores/app.store';

const route = useRoute();
const app = useAppStore();
const userID = useCookie('userID');

// API Keys & Exchange Sync
const availableExchanges = ref([]);
const availableMarkets = ref([]);
const selectedExchange = ref('coinbaseadvanced');
const selectedMarket = ref('LCX/USDC');

// Live prices from ticker-bar (synced via store)
const livePrice = computed(() => app.getCurrentPrice);
const btcPrice = computed(() => app.getBtcPrice);
const ethPrice = computed(() => app.getEthPrice);

// Menu Items
const coreMenu = ref([
  { path: '/PalantirApp', icon: '🎯', label: 'Dashboard', exact: true },
  { path: '/PalantirApp/BotChains', icon: '⛓️', label: 'Bot Chains', badge: 3 },
  { path: '/PalantirApp/PatternRecognition', icon: '🔍', label: 'Patterns', badge: 12 },
]);

const analyticsMenu = ref([
  { path: '/PalantirApp/Analytics', icon: '📊', label: 'Overview' },
  { path: '/PalantirApp/Analytics/OrderFlow', icon: '💹', label: 'Order Flow' },
  { path: '/PalantirApp/Analytics/LiquidityAnalysis', icon: '💧', label: 'Liquidity' },
  { path: '/PalantirApp/Analytics/MultiTimeframe', icon: '⏱️', label: 'Multi-TF' },
  { path: '/PalantirApp/Analytics/MarketHeatmap', icon: '🗺️', label: 'Heatmap' },
  { path: '/PalantirApp/Analytics/CorrelationMatrix', icon: '🔗', label: 'Correlation' },
]);

const botsMenu = ref([
  { path: '/PalantirApp/Bots/ActiveBots', icon: '🤖', label: 'Active Bots' },
  { path: '/PalantirApp/Bots/BotTemplates', icon: '📋', label: 'Templates' },
  { path: '/PalantirApp/Bots/BotPerformance', icon: '📈', label: 'Performance' },
  { path: '/PalantirApp/Bots/BotScheduler', icon: '⏰', label: 'Scheduler' },
]);

const riskMenu = ref([
  { path: '/PalantirApp/Risk/PortfolioRisk', icon: '⚠️', label: 'Portfolio Risk' },
  { path: '/PalantirApp/Risk/StopLossManager', icon: '🛑', label: 'Stop-Loss' },
  { path: '/PalantirApp/Risk/PositionSizing', icon: '💰', label: 'Position Size' },
]);

const systemMenu = ref([
  { path: '/PalantirApp/Automation/RulesEngine', icon: '⚙️', label: 'Rules Engine' },
  { path: '/PalantirApp/Reports/DailyReport', icon: '📋', label: 'Reports' },
  { path: '/PalantirApp/Settings/PalantirSettings', icon: '⚙️', label: 'Settings' },
]);

// Check if menu item is active
const isActive = (path) => {
  if (path === '/PalantirApp') {
    return route.path === path;
  }
  return route.path.startsWith(path);
};

// API Key Synchronization Functions
async function refreshApiKeys() {
  try {
    const response = await $fetch('/api/v1/fetchUserExchanges', {
      query: { userID: userID.value }
    });

    if (response && response.data) {
      availableExchanges.value = response.data.map(ex => ({
        value: ex.exchange,
        label: ex.exchange.toUpperCase()
      }));

      const currentExchange = response.data.find(ex => ex.exchange === selectedExchange.value);
      if (currentExchange && currentExchange.selectedMarket) {
        availableMarkets.value = [
          {
            value: `${currentExchange.selectedMarket.base}/${currentExchange.selectedMarket.quote}`,
            label: `${currentExchange.selectedMarket.base}/${currentExchange.selectedMarket.quote}`
          }
        ];
      }

      selectedExchange.value = app.getUserSelectedExchange || 'coinbaseadvanced';
      selectedMarket.value = app.getUserSelectedMarket || 'LCX/USDC';
    }
  } catch (error) {
    console.error('❌ Error refreshing API keys:', error);
  }
}

async function onExchangeChange() {
  app.updateUserSelectedExchange(selectedExchange.value);
  await refreshApiKeys();
}

async function onMarketChange() {
  app.updateUserSelectedMarket(selectedMarket.value);
}

onMounted(async () => {
  console.log('🚀 Palantir Layout mounted - Loading user exchange data for:', userID.value);
  if (userID.value) {
    await app.loadUserExchangeData(userID.value);
    console.log('✅ Palantir Store initialized with:', {
      exchange: app.getUserSelectedExchange,
      market: app.getUserSelectedMarket,
      exchanges: app.getUserExchanges
    });
  }
  await refreshApiKeys();
});
</script>

<style scoped>
.palantir-layout {
  width: 100vw;
  height: 100vh;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ==================== CONTAINER ==================== */
.palantir-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* ==================== SIDEBAR ==================== */
.palantir-sidebar {
  width: 240px;
  background: linear-gradient(180deg, #111 0%, #0a0a0a 100%);
  border-right: 1px solid #222;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px 0;
}

.sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: #00d4ff;
  border-radius: 2px;
}

.menu-section {
  margin-bottom: 25px;
}

.section-title {
  font-size: 10px;
  color: #666;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 0 20px 10px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 10px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: #999;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  border-left: 3px solid transparent;
}

.menu-item:hover {
  background: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
  border-left-color: #00d4ff;
}

.menu-item.active {
  background: linear-gradient(90deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 212, 255, 0.05) 100%);
  color: #00d4ff;
  border-left-color: #00d4ff;
  box-shadow: inset 0 0 20px rgba(0, 212, 255, 0.1);
}

.menu-icon {
  font-size: 16px;
  min-width: 20px;
  text-align: center;
}

.menu-text {
  font-size: 13px;
  font-weight: 600;
  flex: 1;
}

.menu-badge {
  background: #f52a09;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #222;
  background: rgba(0, 0, 0, 0.5);
}

.back-to-app {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #999;
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.back-to-app:hover {
  background: rgba(16, 235, 4, 0.1);
  border-color: #10eb04;
  color: #10eb04;
  box-shadow: 0 0 15px rgba(16, 235, 4, 0.2);
}

/* ==================== CONTENT ==================== */
.palantir-content {
  flex: 1;
  background: #0a0a0a;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
}

.palantir-content::-webkit-scrollbar {
  width: 8px;
}

.palantir-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.palantir-content::-webkit-scrollbar-thumb {
  background: #00d4ff;
  border-radius: 4px;
}

.palantir-content::-webkit-scrollbar-thumb:hover {
  background: #10eb04;
}
</style>
