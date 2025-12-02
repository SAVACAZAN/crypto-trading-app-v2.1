<template>
  <div class="deploy-bot-page">
    <!-- Quick Navigation Tabs (Only for SAVACAZAN bots) -->
    <div v-if="showQuickNavTabs" class="quick-nav-tabs">
      <div class="tabs-container">
        <button
          v-for="bot in allBots"
          :key="bot.id"
          :class="['tab-btn', { active: botId === bot.id }]"
          @click="navigateToBot(bot.id)"
          :title="bot.name"
        >
          <span class="tab-icon">{{ bot.icon }}</span>
          <span class="tab-name">{{ bot.name }}</span>
        </button>
      </div>
    </div>

    <!-- Main Content - Full Width Form Only -->
    <div class="content-wrapper">
      <!-- AI Bot Special Case: Show both V1 and V2 in tabs -->
      <div v-if="botId === 'ai-bot'" class="ai-bot-tabs-container">
        <n-tabs type="line" animated size="small" class="ai-bot-tabs">
          <n-tab-pane name="v1" tab="🌟 AI Grid Bots V1 (Glassmorphism)">
            <GridBotsAIV1 />
          </n-tab-pane>
          <n-tab-pane name="v2" tab="⚡ AI Grid Bots V2 (Neon)">
            <GridBotsAIV2 />
          </n-tab-pane>
        </n-tabs>
      </div>

      <!-- Co-Pilot Bot Special Case: Advanced Order Management -->
      <div v-else-if="botId === 'copilot-bot'" class="copilot-container">
        <CoPilotAdvanced />
      </div>

      <!-- DCA + Grid Bot Special Case: DCA Integration -->
      <div v-else-if="botId === 'dca-grid-bot'" class="dca-integration-container">
        <DcaIntegration />
      </div>

      <!-- Smart DCA Bot Special Case: Smart DCA Page -->
      <div v-else-if="botId === 'smart-dca-bot'" class="smart-dca-container">
        <SmartDcaPage />
      </div>

      <!-- OrderBook Bot Special Case: OrderBook Analysis & Trading -->
      <div v-else-if="botId === 'orderbook-bot'" class="orderbook-container">
        <OrderBookBotPage />
      </div>

      <!-- News Scalping Bot Special Case: Real-time News Trading -->
      <div v-else-if="botId === 'scalp-news'" class="news-scalping-container">
        <NewsScalpingBotPage />
      </div>

      <!-- Whale Alert Bot Special Case: Whale Movements + News Correlation -->
      <div v-else-if="botId === 'news-whale'" class="whale-alert-container">
        <WhaleAlertBotPage />
      </div>

      <!-- Triangular Arbitrage Bot Special Case: Three-way Arbitrage -->
      <div v-else-if="botId === 'arb-triangular'" class="triangular-arb-container">
        <TriangularArbBotPage />
      </div>

      <!-- All Other Bots: Single form component -->
      <component
        v-else
        :is="botFormComponent"
        ref="botFormRef"
        :bot-name="selectedBot?.name"
        :bot-config="selectedBot?.specificConfig"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useMessage } from 'naive-ui';

// Import all bot form components
import GridBotsFormPlus from '~/components/grid-bots-form-plus.vue';
import GridBotsForm from '~/components/grid-bots-form.vue';
import FrontRunBotsForm from '~/components/frontrun-bots-form.vue';
import Scalp1ngBotsForm from '~/components/Bots/Scalp1ng-bots-form.vue';
import OneClickBotsForm from '~/components/Bots/OneClick-bots-form.vue';
import FibBotsForm from '~/components/Bots/fib-bots-form.vue';
import AIBotForm from '~/components/Bots/AIBOT-bots-form.vue';
import CoPilotBotsForm from '~/components/Bots/Co-Pilot-bots-form.vue';
import DcaGridBotsForm from '~/components/grid-bots-form-plusAI.vue';
import DcaBotsForm from '~/components/dca-bots-form.vue';
import GrinderBotsForm from '~/components/Bots/Grinder-bots-form.vue';
import OrderBookBotsForm from '~/components/Bots/OrderBook-bots-form.vue';
import GridBotsList from '~/components/grid-bots-list.vue';

// AI Bot V1 & V2 - Full page layouts
import GridBotsAIV1 from '~/pages/grid-bots-plus-AI.vue';
import GridBotsAIV2 from '~/pages/grid-bots-plus-AIv2.vue';

// Co-Pilot - Advanced Order Management page
import CoPilotAdvanced from '~/pages/Bots/Co-Pilot.vue';

// DCA + Grid - DCA Integration page
import DcaIntegration from '~/pages/dca-integration.vue';

// Smart DCA - Smart DCA Bot page
import SmartDcaPage from '~/pages/smart-dca.vue';

// OrderBook Bot - OrderBook Analysis & Trading page
import OrderBookBotPage from '~/pages/Bots/OrderBookBot.vue';

// News Scalping Bot - Real-time news trading with AI sentiment analysis
import NewsScalpingBotPage from '~/pages/Bots/NewsScalpingBot.vue';

// Whale Alert Bot - Whale movements + news correlation
import WhaleAlertBotPage from '~/pages/Bots/WhaleAlertBot.vue';

// Triangular Arbitrage Bot - Three-way arbitrage on single exchange
import TriangularArbBotPage from '~/pages/Bots/TriangularArbBot.vue';

definePageMeta({
  middleware: 'auth',
  layout: 'palantir'
});

const route = useRoute();
const message = useMessage();
const botFormRef = ref(null);
const gridListRef = ref(null);

// Get bot ID from route params
const botId = computed(() => route.query.botId || route.params.botId);

// Special bots that don't show quick nav tabs (have their own complete interfaces)
const specialBotsWithoutTabs = ['scalp-news', 'news-whale', 'arb-triangular']; // Add more special bots here as needed

// Show quick nav tabs only for SAVACAZAN bots
const showQuickNavTabs = computed(() => {
  return !specialBotsWithoutTabs.includes(botId.value);
});

// Map bot IDs to their form components
const botFormComponents = {
  'gridbot-plus': GridBotsFormPlus,
  'standard-gridbot': GridBotsForm,
  'frontrun-bot': FrontRunBotsForm,
  'scalping-bot': Scalp1ngBotsForm,
  'oneclick-bot': OneClickBotsForm,
  'fib-bot': FibBotsForm,
  'ai-bot': AIBotForm,
  'copilot-bot': CoPilotBotsForm,
  'dca-grid-bot': DcaGridBotsForm,
  'smart-dca-bot': DcaBotsForm,
  'grinder-bot': GrinderBotsForm,
  'orderbook-bot': OrderBookBotsForm
};

// Bot data (SAVACAZAN PREMIUM - matching BotTemplates.vue)
const allBots = ref([
  {
    id: 'gridbot-plus',
    name: 'GridBot Plus',
    icon: '⚡',
    category: 'Grid Trading',
    riskLevel: 'Medium',
    description: 'Advanced grid bot with AI optimization and ultra-fast execution',
    successRate: 89,
    avgReturn: 16.7,
    maxDrawdown: 7.5,
    minInvestment: 500,
    timeframe: 'Daily',
    recommendedMarkets: ['LCX/USDT', 'BTC/USDT', 'ETH/USDT'],
    features: ['AI-powered grid placement', 'Dynamic rebalancing', 'Stop-loss protection', 'Multi-API support'],
    deployedCount: 178,
    isSavacazan: true
  },
  {
    id: 'standard-gridbot',
    name: 'Standard GridBot',
    icon: '📊',
    category: 'Grid Trading',
    riskLevel: 'Low',
    description: 'Classic grid trading bot for stable markets',
    successRate: 85,
    avgReturn: 12.3,
    maxDrawdown: 5.2,
    minInvestment: 300,
    timeframe: 'Daily',
    recommendedMarkets: ['LCX/USDT', 'ETH/USDT'],
    features: ['Simple grid strategy', 'Low risk', 'Consistent returns'],
    deployedCount: 245,
    isSavacazan: true
  },
  {
    id: 'frontrun-bot',
    name: 'FrontRun Bot',
    icon: '🏃',
    category: 'Arbitrage',
    riskLevel: 'High',
    description: 'High-speed frontrunning bot for mempool opportunities',
    successRate: 78,
    avgReturn: 24.5,
    maxDrawdown: 12.8,
    minInvestment: 1000,
    timeframe: 'Real-time',
    recommendedMarkets: ['LCX/USDT', 'BTC/USDT'],
    features: ['Mempool monitoring', 'Gas optimization', 'Flash execution'],
    deployedCount: 89,
    isSavacazan: true
  },
  {
    id: 'scalping-bot',
    name: 'Scalp1ng Bot',
    icon: '🎯',
    category: 'Scalping',
    riskLevel: 'Medium',
    description: 'Fast scalping bot for quick profits',
    successRate: 82,
    avgReturn: 18.9,
    maxDrawdown: 8.3,
    minInvestment: 400,
    timeframe: '1-5min',
    recommendedMarkets: ['BTC/USDT', 'ETH/USDT'],
    features: ['High-frequency trading', 'Technical indicators', 'Quick exits'],
    deployedCount: 156,
    isSavacazan: true
  },
  {
    id: 'oneclick-bot',
    name: 'OneClick Bot',
    icon: '🖱️',
    category: 'DCA',
    riskLevel: 'Low',
    description: 'Simple one-click deployment for beginners',
    successRate: 87,
    avgReturn: 14.2,
    maxDrawdown: 6.1,
    minInvestment: 200,
    timeframe: 'Daily',
    recommendedMarkets: ['LCX/USDT'],
    features: ['One-click setup', 'Beginner-friendly', 'Auto-rebalance'],
    deployedCount: 312,
    isSavacazan: true
  },
  {
    id: 'fib-bot',
    name: 'Fibonacci Bot',
    icon: '📈',
    category: 'Trend Following',
    riskLevel: 'Medium',
    description: 'Fibonacci retracement levels trading bot',
    successRate: 84,
    avgReturn: 19.4,
    maxDrawdown: 9.7,
    minInvestment: 600,
    timeframe: '4H-Daily',
    recommendedMarkets: ['BTC/USDT', 'ETH/USDT'],
    features: ['Fibonacci analysis', 'Support/resistance', 'Trend following'],
    deployedCount: 134,
    isSavacazan: true
  },
  {
    id: 'ai-bot',
    name: 'AI Trading Bot',
    icon: '🧠',
    category: 'Market Making',
    riskLevel: 'Medium',
    description: 'AI-powered trading bot with machine learning',
    successRate: 91,
    avgReturn: 22.8,
    maxDrawdown: 10.4,
    minInvestment: 800,
    timeframe: 'Real-time',
    recommendedMarkets: ['LCX/USDT', 'BTC/USDT', 'ETH/USDT'],
    features: ['Machine learning', 'Pattern recognition', 'Adaptive strategy'],
    deployedCount: 203,
    isSavacazan: true
  },
  {
    id: 'copilot-bot',
    name: 'Co-Pilot Bot',
    icon: '✈️',
    category: 'Trend Following',
    riskLevel: 'Low',
    description: 'Semi-automated bot with manual oversight',
    successRate: 86,
    avgReturn: 15.6,
    maxDrawdown: 7.2,
    minInvestment: 350,
    timeframe: 'Daily',
    recommendedMarkets: ['LCX/USDT', 'ETH/USDT'],
    features: ['Manual controls', 'AI suggestions', 'Risk management'],
    deployedCount: 167,
    isSavacazan: true
  },
  {
    id: 'dca-grid-bot',
    name: 'DCA + Grid Bot',
    icon: '📊',
    category: 'DCA',
    riskLevel: 'Low',
    description: 'Combined DCA and grid trading strategy',
    successRate: 88,
    avgReturn: 17.3,
    maxDrawdown: 6.8,
    minInvestment: 450,
    timeframe: 'Daily-Weekly',
    recommendedMarkets: ['BTC/USDT', 'ETH/USDT'],
    features: ['DCA strategy', 'Grid automation', 'Cost averaging'],
    deployedCount: 221,
    isSavacazan: true
  },
  {
    id: 'smart-dca-bot',
    name: 'Smart DCA Bot',
    icon: '🎯',
    category: 'DCA',
    riskLevel: 'Low',
    description: 'Intelligent dollar-cost averaging with market timing',
    successRate: 90,
    avgReturn: 16.1,
    maxDrawdown: 5.9,
    minInvestment: 300,
    timeframe: 'Daily-Weekly',
    recommendedMarkets: ['BTC/USDT', 'ETH/USDT', 'LCX/USDT'],
    features: ['Smart timing', 'Market analysis', 'Auto-averaging'],
    deployedCount: 289,
    isSavacazan: true
  },
  {
    id: 'grinder-bot',
    name: 'Grinder Bot',
    icon: '⚙️',
    category: 'Market Making',
    riskLevel: 'Medium',
    description: 'Consistent small profits grinder bot',
    successRate: 83,
    avgReturn: 13.7,
    maxDrawdown: 7.8,
    minInvestment: 500,
    timeframe: 'Hourly',
    recommendedMarkets: ['LCX/USDT', 'BTC/USDT'],
    features: ['Consistent profits', 'Low volatility', 'Market making'],
    deployedCount: 178,
    isSavacazan: true
  },
  {
    id: 'orderbook-bot',
    name: 'OrderBook Bot',
    icon: '📖',
    category: 'Market Making',
    riskLevel: 'High',
    description: 'Order book analysis and market making bot',
    successRate: 81,
    avgReturn: 21.4,
    maxDrawdown: 11.3,
    minInvestment: 700,
    timeframe: 'Real-time',
    recommendedMarkets: ['LCX/USDT', 'ETH/USDT'],
    features: ['Order flow analysis', 'Liquidity provision', 'Spread capture'],
    deployedCount: 142,
    isSavacazan: true
  }
]);

// Get selected bot based on ID
const selectedBot = computed(() => {
  return allBots.value.find(bot => bot.id === botId.value) || allBots.value[0];
});

// Get the appropriate form component for the selected bot
const botFormComponent = computed(() => {
  return botFormComponents[botId.value] || GridBotsFormPlus;
});

// Navigate to different bot
const navigateToBot = (newBotId) => {
  navigateTo(`/PalantirApp/Bots/DeployBot?botId=${newBotId}`);
};

onMounted(() => {
  if (!botId.value) {
    message.warning('No bot selected. Redirecting to templates...');
    setTimeout(() => {
      navigateTo('/PalantirApp/Bots/BotTemplates');
    }, 2000);
  }
});
</script>

<style scoped>
.deploy-bot-page {
  padding: 0;
  width: 100%;
  min-height: 100vh;
  background: #0f1419;
  font-size: 12px;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* Quick Navigation Tabs */
.quick-nav-tabs {
  background: linear-gradient(135deg, #1a1f2e 0%, #2a3441 100%);
  border-bottom: 2px solid #667eea;
  padding: 8px 12px;
  overflow-x: auto;
  overflow-y: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.tabs-container {
  display: flex;
  gap: 6px;
  min-width: fit-content;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  backdrop-filter: blur(10px);
}

.tab-btn:hover {
  background: rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.5);
  color: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: #fff;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.5);
  transform: translateY(-2px);
}

.tab-icon {
  font-size: 14px;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3));
}

.tab-name {
  letter-spacing: 0.3px;
}

/* Scrollbar for tabs */
.quick-nav-tabs::-webkit-scrollbar {
  height: 6px;
}

.quick-nav-tabs::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.quick-nav-tabs::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

.quick-nav-tabs::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(90deg, #764ba2 0%, #667eea 100%);
}

/* Content Wrapper - Flexible to accommodate different bot forms */
.content-wrapper {
  width: 100%;
  padding: 8px;
  flex: 1;
  overflow-y: auto;
}

/* For standard bot forms (not AI, Co-Pilot, DCA+Grid, Smart DCA, OrderBook, or News Scalping), use fit-content */
.content-wrapper:has(> :not(.ai-bot-tabs-container):not(.copilot-container):not(.dca-integration-container):not(.smart-dca-container):not(.orderbook-container):not(.news-scalping-container)) {
  width: fit-content;
  min-width: 320px;
}

/* AI Bot Tabs Container - Full width for tab system */
.ai-bot-tabs-container {
  width: 100%;
  min-height: calc(100vh - 100px);
}

.ai-bot-tabs {
  width: 100%;
}

/* Co-Pilot Container - Full width for advanced order management */
.copilot-container {
  width: 100%;
  min-height: calc(100vh - 100px);
}

/* DCA Integration Container - Full width for DCA + Grid bot */
.dca-integration-container {
  width: 100%;
  min-height: calc(100vh - 100px);
}

/* Smart DCA Container - Full width for Smart DCA bot */
.smart-dca-container {
  width: 100%;
  min-height: calc(100vh - 100px);
}

/* OrderBook Container - Full width for OrderBook bot analysis */
.orderbook-container {
  width: 100%;
  min-height: calc(100vh - 100px);
}

/* News Scalping Container - Full width for real-time news trading */
.news-scalping-container {
  width: 100%;
  min-height: calc(100vh - 100px);
}

/* Whale Alert Container - Full width for whale movements tracking */
.whale-alert-container {
  width: 100%;
  min-height: calc(100vh - 100px);
}

/* Triangular Arbitrage Container - Full width for arbitrage trading */
.triangular-arb-container {
  width: 100%;
  min-height: calc(100vh - 100px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .deploy-bot-page {
    padding: 0;
  }

  .quick-nav-tabs {
    padding: 6px 8px;
  }

  .tabs-container {
    gap: 4px;
  }

  .tab-btn {
    padding: 6px 10px;
    font-size: 10px;
  }

  .tab-icon {
    font-size: 12px;
  }

  .tab-name {
    display: none; /* Hide names on mobile, show only icons */
  }

  .content-wrapper {
    width: 100%;
    min-width: auto;
    padding: 4px;
  }
}

@media (max-width: 480px) {
  .tab-btn {
    padding: 5px 8px;
  }

  .tab-icon {
    font-size: 14px;
  }
}
</style>
