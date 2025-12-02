<template>
  <div style="background: #000; min-height: calc(100vh - 95px); padding: 15px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #f52a09;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <NuxtLink to="/PalantirApp" style="color: #666; font-size: 20px; text-decoration: none;">←</NuxtLink>
        <div style="font-size: 24px;">⚠️</div>
        <div>
          <h1 style="margin: 0; font-size: 20px; color: #f52a09; font-weight: 700;">PORTFOLIO RISK ASSESSMENT</h1>
          <p style="margin: 3px 0 0 0; color: #888; font-size: 11px;">Real-time Portfolio Risk Analysis & Monitoring</p>
        </div>
      </div>
    </div>

    <!-- Portfolio Value Summary - Priority Assets First -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 15px;">
      <!-- Total Exchanges -->
      <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="color: #888; font-size: 11px; margin-bottom: 5px;">TOTAL EXCHANGES</div>
        <div style="color: #fff; font-size: 28px; font-weight: 700;">{{ exchangeCount }}</div>
      </div>

      <!-- Priority Assets (BTC, ETH, LCX, JOB, USD, USDC, USDT, EUR) -->
      <div
        v-for="asset in filteredPriorityAssets"
        :key="'priority-' + asset.coin"
        :style="`background: rgba(15,52,96,0.3); border: 1px solid ${asset.color}; padding: 15px; border-radius: 8px;`"
      >
        <div style="color: #888; font-size: 11px; margin-bottom: 5px;">TOTAL {{ asset.coin }}</div>
        <div :style="`color: ${asset.color}; font-size: 22px; font-weight: 700;`">
          {{ asset.prefix }}{{ formatNumber(asset.total) }}
        </div>
        <div style="color: #666; font-size: 9px; margin-top: 3px;" v-if="asset.valueUSD > 0">
          ≈ ${{ formatNumber(asset.valueUSD) }}
        </div>
      </div>

      <!-- Other Assets (filtered by search) -->
      <div
        v-for="asset in filteredOtherAssets"
        :key="'other-' + asset.coin"
        :style="`background: rgba(15,52,96,0.3); border: 1px solid ${asset.color}; padding: 15px; border-radius: 8px;`"
      >
        <div style="color: #888; font-size: 11px; margin-bottom: 5px;">TOTAL {{ asset.coin }}</div>
        <div :style="`color: ${asset.color}; font-size: 22px; font-weight: 700;`">
          {{ asset.prefix }}{{ formatNumber(asset.total) }}
        </div>
        <div style="color: #666; font-size: 9px; margin-top: 3px;" v-if="asset.valueUSD > 0">
          ≈ ${{ formatNumber(asset.valueUSD) }}
        </div>
      </div>
    </div>

    <!-- Per-API Key Balances Section -->
    <div style="margin-bottom: 15px;">
      <div style="color: #f52a09; font-size: 16px; font-weight: 700; margin-bottom: 12px;">
        📊 BALANCES BY API KEY
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px;">
        <div
          v-for="apiKey in filteredApiKeyBalances"
          :key="apiKey.name"
          style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;"
        >
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div>
              <div style="color: #f5a623; font-size: 13px; font-weight: 700;">{{ apiKey.name }}</div>
              <div style="color: #888; font-size: 10px;">{{ apiKey.exchange }}</div>
            </div>
            <div style="text-align: right;">
              <div style="color: #10eb04; font-size: 16px; font-weight: 700;">${{ formatNumber(apiKey.totalUSD) }}</div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; max-height: 200px; overflow-y: auto;">
            <div
              v-for="asset in apiKey.assets"
              :key="asset.coin"
              style="display: flex; justify-content: space-between; padding: 6px 8px; background: rgba(0,0,0,0.3); border-radius: 4px;"
            >
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 14px;">{{ getAssetIcon(asset.coin) }}</span>
                <span style="color: #fff; font-size: 11px; font-weight: 600;">{{ asset.coin }}</span>
              </div>
              <div style="text-align: right;">
                <div style="color: #10eb04; font-size: 11px; font-weight: 700;">{{ asset.total.toFixed(4) }}</div>
                <div style="color: #666; font-size: 9px;" v-if="asset.valueUSD > 0">
                  ${{ formatNumber(asset.valueUSD) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Asset Allocation & Risk -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
      <!-- Asset Allocation -->
      <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="color: #f52a09; font-size: 14px; font-weight: 700; margin-bottom: 15px;">ASSET ALLOCATION & RISK</div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div
            v-for="asset in assetAllocation"
            :key="asset.symbol"
            style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px;"
          >
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="font-size: 20px;">{{ asset.icon }}</div>
                <div>
                  <div style="color: #fff; font-size: 13px; font-weight: 700;">{{ asset.symbol }}</div>
                  <div style="color: #888; font-size: 10px;">{{ asset.amount }} {{ asset.symbol }}</div>
                </div>
              </div>
              <div style="text-align: right;">
                <div style="color: #fff; font-size: 13px; font-weight: 700;">${{ asset.value.toLocaleString() }}</div>
                <div style="color: #888; font-size: 10px;">{{ asset.allocation }}%</div>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px;">
              <div>
                <div style="color: #888; font-size: 9px;">Volatility</div>
                <div :style="`color: ${getVolatilityColor(asset.volatility)}; font-size: 11px; font-weight: 700;`">
                  {{ asset.volatility }}%
                </div>
              </div>
              <div>
                <div style="color: #888; font-size: 9px;">24H Change</div>
                <div :style="`color: ${asset.change24h >= 0 ? '#10eb04' : '#f52a09'}; font-size: 11px; font-weight: 700;`">
                  {{ asset.change24h >= 0 ? '+' : '' }}{{ asset.change24h }}%
                </div>
              </div>
              <div>
                <div style="color: #888; font-size: 9px;">Risk Score</div>
                <div :style="`color: ${getRiskColor(asset.riskScore)}; font-size: 11px; font-weight: 700;`">
                  {{ asset.riskScore }}
                </div>
              </div>
            </div>
            <div style="width: 100%; height: 6px; background: rgba(15,52,96,0.5); border-radius: 3px; overflow: hidden;">
              <div :style="`width: ${asset.allocation}%; height: 100%; background: ${asset.color}; border-radius: 3px;`"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Risk Alerts & Recommendations -->
      <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
        <div style="color: #f52a09; font-size: 14px; font-weight: 700; margin-bottom: 15px;">RISK ALERTS & RECOMMENDATIONS</div>
        <div style="display: flex; flex-direction: column; gap: 10px; max-height: 450px; overflow-y: auto;">
          <div
            v-for="alert in riskAlerts"
            :key="alert.id"
            :style="`background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px; border-left: 3px solid ${alert.severityColor};`"
          >
            <div style="display: flex; align-items: start; gap: 10px;">
              <div style="font-size: 20px;">{{ alert.icon }}</div>
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                  <div style="color: #fff; font-size: 12px; font-weight: 700;">{{ alert.title }}</div>
                  <n-tag :type="alert.severityType" size="tiny" round>{{ alert.severity }}</n-tag>
                </div>
                <div style="color: #aaa; font-size: 10px; line-height: 1.5; margin-bottom: 8px;">
                  {{ alert.description }}
                </div>
                <div style="background: rgba(15,52,96,0.3); padding: 8px; border-radius: 4px; margin-bottom: 8px;">
                  <div style="color: #10eb04; font-size: 10px; font-weight: 700; margin-bottom: 3px;">💡 RECOMMENDATION:</div>
                  <div style="color: #aaa; font-size: 9px; line-height: 1.4;">{{ alert.recommendation }}</div>
                </div>
                <div style="display: flex; gap: 5px;">
                  <n-button size="tiny" @click="applyRecommendation(alert)" style="background: #10eb04; border: none; color: #000;">
                    Apply
                  </n-button>
                  <n-button size="tiny" @click="dismissAlert(alert.id)">Dismiss</n-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stress Test Scenarios -->
    <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <div style="color: #f52a09; font-size: 14px; font-weight: 700;">STRESS TEST SCENARIOS</div>
        <n-button size="small" @click="runStressTest" :loading="stressTestLoading">
          🧪 Run Stress Test
        </n-button>
      </div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
        <div
          v-for="scenario in stressScenarios"
          :key="scenario.name"
          style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 6px;"
        >
          <div style="color: #888; font-size: 10px; margin-bottom: 5px;">{{ scenario.name }}</div>
          <div style="color: #fff; font-size: 11px; font-weight: 700; margin-bottom: 3px;">{{ scenario.condition }}</div>
          <div :style="`color: ${scenario.impact < 0 ? '#f52a09' : '#10eb04'}; font-size: 20px; font-weight: 700; margin: 8px 0;`">
            {{ scenario.impact >= 0 ? '+' : '' }}{{ scenario.impact }}%
          </div>
          <div style="color: #888; font-size: 9px; margin-bottom: 3px;">
            Projected Loss: <span style="color: #f52a09; font-weight: 700;">${{ Math.abs(scenario.projectedLoss).toLocaleString() }}</span>
          </div>
          <div style="color: #888; font-size: 9px;">
            Recovery Time: <span style="color: #ffa500; font-weight: 700;">{{ scenario.recoveryTime }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Risk Mitigation Actions -->
    <div style="background: rgba(15,52,96,0.3); border: 1px solid #0f3460; padding: 15px; border-radius: 8px;">
      <div style="color: #f52a09; font-size: 14px; font-weight: 700; margin-bottom: 15px;">QUICK RISK MITIGATION</div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
        <n-button
          @click="rebalancePortfolio"
          style="background: rgba(16,235,4,0.2); border: 1px solid #10eb04; color: #10eb04; padding: 15px; height: auto; display: flex; flex-direction: column; align-items: center; gap: 8px;"
        >
          <div style="font-size: 24px;">⚖️</div>
          <div style="font-size: 11px; font-weight: 700;">Rebalance Portfolio</div>
          <div style="font-size: 9px; color: #888;">Optimize allocation</div>
        </n-button>
        <n-button
          @click="setStopLosses"
          style="background: rgba(255,107,53,0.2); border: 1px solid #ff6b35; color: #ff6b35; padding: 15px; height: auto; display: flex; flex-direction: column; align-items: center; gap: 8px;"
        >
          <div style="font-size: 24px;">🛡️</div>
          <div style="font-size: 11px; font-weight: 700;">Set Stop Losses</div>
          <div style="font-size: 9px; color: #888;">Auto-protect assets</div>
        </n-button>
        <n-button
          @click="reduceExposure"
          style="background: rgba(245,42,9,0.2); border: 1px solid #f52a09; color: #f52a09; padding: 15px; height: auto; display: flex; flex-direction: column; align-items: center; gap: 8px;"
        >
          <div style="font-size: 24px;">📉</div>
          <div style="font-size: 11px; font-weight: 700;">Reduce Exposure</div>
          <div style="font-size: 9px; color: #888;">Lower risk positions</div>
        </n-button>
        <n-button
          @click="hedgePositions"
          style="background: rgba(255,165,0,0.2); border: 1px solid #ffa500; color: #ffa500; padding: 15px; height: auto; display: flex; flex-direction: column; align-items: center; gap: 8px;"
        >
          <div style="font-size: 24px;">🔒</div>
          <div style="font-size: 11px; font-weight: 700;">Hedge Positions</div>
          <div style="font-size: 9px; color: #888;">Create hedge orders</div>
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useMessage } from 'naive-ui';
import { useAppStore } from '~/stores/app.store';

definePageMeta({ middleware: 'auth', layout: 'palantir' });

const message = useMessage();
const app = useAppStore();

// State
const userID = useCookie('userID');
const portfolioValue = ref(0); // Will be loaded from real balance
const loadingData = ref(true);
const exchangeCount = ref(0); // Number of exchanges
const globalAssetTotals = ref([]); // Global totals per asset
const overallRiskScore = ref(65); // Overall portfolio risk score
const apiKeyBalances = ref([]); // Balances per API key

// Get selected API keys from store - REMOVE DUPLICATES
const selectedApiKeys = computed(() => {
  const keys = app.getSelectedApiKeys || [];
  return [...new Set(keys)]; // Remove duplicates
});

// Priority assets to show first
const priorityAssets = ['BTC', 'ETH', 'LCX', 'JOB', 'USD', 'USDC', 'USDT', 'EUR'];

// Risk Metrics
const riskMetrics = ref({
  concentration: 72,
  volatility: 65,
  liquidity: 45,
  correlation: 58
});

// VaR Metrics
const varMetrics = ref({
  var95: 8742,
  sharpeRatio: 1.85,
  maxDrawdown: 18.4,
  beta: 1.23
});

// Asset Allocation
const assetAllocation = ref([
  {
    symbol: 'BTC',
    icon: '₿',
    amount: 1.245,
    value: 52340,
    allocation: 36,
    volatility: 68,
    change24h: 2.4,
    riskScore: 65,
    color: '#f7931a'
  },
  {
    symbol: 'ETH',
    icon: 'Ξ',
    amount: 15.8,
    value: 38970,
    allocation: 27,
    volatility: 72,
    change24h: 3.2,
    riskScore: 70,
    color: '#627eea'
  },
  {
    symbol: 'LCX',
    icon: '🔷',
    amount: 125000,
    value: 23450,
    allocation: 16,
    volatility: 85,
    change24h: -1.8,
    riskScore: 78,
    color: '#10eb04'
  },
  {
    symbol: 'BNB',
    icon: '🔶',
    amount: 48.5,
    value: 18920,
    allocation: 13,
    volatility: 58,
    change24h: 1.5,
    riskScore: 60,
    color: '#f3ba2f'
  },
  {
    symbol: 'USDT',
    icon: '💵',
    amount: 11550,
    value: 11550,
    allocation: 8,
    volatility: 2,
    change24h: 0.0,
    riskScore: 15,
    color: '#26a17b'
  }
]);

// Risk Alerts
const riskAlerts = ref([
  {
    id: 1,
    title: 'High Concentration Risk',
    icon: '⚠️',
    severity: 'High',
    severityType: 'error',
    severityColor: '#f52a09',
    description: 'Your portfolio is heavily concentrated in BTC (36%). Single asset concentration above 30% increases portfolio volatility significantly.',
    recommendation: 'Consider rebalancing to distribute risk across more assets. Target: reduce BTC allocation to 25-30% by taking partial profits.'
  },
  {
    id: 2,
    title: 'LCX Volatility Alert',
    icon: '📊',
    severity: 'Medium',
    severityType: 'warning',
    severityColor: '#ffa500',
    description: 'LCX volatility (85%) is significantly higher than portfolio average (65%). This increases your Value-at-Risk exposure.',
    recommendation: 'Set stop-loss orders at -10% from current price or reduce LCX allocation by 50% to manage downside risk.'
  },
  {
    id: 3,
    title: 'Low Stablecoin Allocation',
    icon: '💰',
    severity: 'Medium',
    severityType: 'warning',
    severityColor: '#ffa500',
    description: 'Only 8% in stablecoins (USDT). Low cash reserves limit your ability to buy dips and increase liquidation risk during market downturns.',
    recommendation: 'Increase stablecoin allocation to 15-20% for better liquidity management and market opportunity capture.'
  },
  {
    id: 4,
    title: 'Positive Sharpe Ratio',
    icon: '✅',
    severity: 'Info',
    severityType: 'success',
    severityColor: '#10eb04',
    description: 'Your Sharpe ratio of 1.85 indicates good risk-adjusted returns. Portfolio is performing well relative to volatility.',
    recommendation: 'Maintain current strategy. Consider incrementally adding to winning positions during market pullbacks.'
  },
  {
    id: 5,
    title: 'High Beta Exposure',
    icon: '📈',
    severity: 'Low',
    severityType: 'info',
    severityColor: '#0ea5e9',
    description: 'Portfolio beta of 1.23 means your portfolio is 23% more volatile than BTC market. Higher beta = higher potential returns and losses.',
    recommendation: 'If seeking lower volatility, consider adding low-beta assets or increasing stablecoin allocation.'
  }
]);

// Stress Test Scenarios
const stressScenarios = ref([
  {
    name: 'Market Crash',
    condition: 'BTC -30%',
    impact: -26.4,
    projectedLoss: 38341,
    recoveryTime: '3-6 months'
  },
  {
    name: 'Alt Season',
    condition: 'Alts +50%',
    impact: +31.8,
    projectedLoss: -46183,
    recoveryTime: 'N/A'
  },
  {
    name: 'Flash Crash',
    condition: 'All -15%',
    impact: -14.2,
    projectedLoss: 20623,
    recoveryTime: '2-4 weeks'
  },
  {
    name: 'Stable Growth',
    condition: 'BTC +20%',
    impact: +14.6,
    projectedLoss: -21204,
    recoveryTime: 'N/A'
  }
]);

// Methods
const getRiskScoreType = (score) => {
  if (score >= 70) return 'error';
  if (score >= 50) return 'warning';
  return 'success';
};

const getRiskLevel = (score) => {
  if (score >= 70) return 'High Risk';
  if (score >= 50) return 'Medium Risk';
  return 'Low Risk';
};

const getRiskColor = (score) => {
  if (score >= 70) return '#f52a09';
  if (score >= 50) return '#ffa500';
  return '#10eb04';
};

const getVolatilityColor = (volatility) => {
  if (volatility >= 70) return '#f52a09';
  if (volatility >= 50) return '#ffa500';
  return '#10eb04';
};

const dismissAlert = (id) => {
  const index = riskAlerts.value.findIndex(a => a.id === id);
  if (index !== -1) {
    riskAlerts.value.splice(index, 1);
    message.success('Alert dismissed');
  }
};

const applyRecommendation = (alert) => {
  message.loading('Applying recommendation...');
  setTimeout(() => {
    message.success(`Applied: ${alert.title}`);
    dismissAlert(alert.id);
  }, 1500);
};

const runStressTest = () => {
  stressTestLoading.value = true;
  message.loading('Running stress test scenarios...');

  setTimeout(() => {
    stressTestLoading.value = false;
    message.success('Stress test completed! Scenarios updated.');

    // Randomize impact slightly
    stressScenarios.value = stressScenarios.value.map(s => ({
      ...s,
      impact: s.impact + (Math.random() * 4 - 2),
      projectedLoss: Math.abs(s.projectedLoss) + (Math.random() * 2000 - 1000)
    }));
  }, 2500);
};

const rebalancePortfolio = () => {
  message.info('Opening portfolio rebalancing wizard...');
};

const setStopLosses = () => {
  message.info('Setting automatic stop-loss orders for all positions...');
};

const reduceExposure = () => {
  message.info('Analyzing high-risk positions for reduction...');
};

const hedgePositions = () => {
  message.info('Creating hedge orders to protect portfolio...');
};

// Auto-refresh risk metrics
let refreshInterval;

const refreshRiskMetrics = () => {
  // Simulate real-time updates
  overallRiskScore.value = Math.max(50, Math.min(85, overallRiskScore.value + (Math.random() * 4 - 2)));

  riskMetrics.value = {
    concentration: Math.max(60, Math.min(80, riskMetrics.value.concentration + (Math.random() * 3 - 1.5))),
    volatility: Math.max(55, Math.min(75, riskMetrics.value.volatility + (Math.random() * 3 - 1.5))),
    liquidity: Math.max(35, Math.min(55, riskMetrics.value.liquidity + (Math.random() * 3 - 1.5))),
    correlation: Math.max(48, Math.min(68, riskMetrics.value.correlation + (Math.random() * 3 - 1.5)))
  };

  portfolioValue.value = Math.max(140000, Math.min(150000, portfolioValue.value + (Math.random() * 1000 - 500)));
};

// Load real balance data GROUPED BY EXCHANGE (like CryptoApp)
const loadRealBalances = async () => {
  try {
    loadingData.value = true;
    console.log('💰 Loading real balances grouped by exchange...');
    console.log('🔑 Selected API Keys:', selectedApiKeys.value);

    // Check if any API keys are selected
    if (!selectedApiKeys.value || selectedApiKeys.value.length === 0) {
      console.log('⚠️ No API keys selected');
      message.warning('Please select API keys to view portfolio data');
      loadingData.value = false;
      return;
    }

    // Step 1: Fetch user exchanges structure
    const dbExchanges = await $fetch('/api/v1/fetchUserExchanges', {
      query: { userID: userID.value }
    });

    console.log('📊 Found exchanges:', dbExchanges.data.map(e => e.exchange));

    // Step 2: Fetch cached balances
    const cachedResponse = await $fetch('/api/v1/getCachedBalances', {
      query: { userID: userID.value }
    });

    console.log('💾 Loaded cached balances:', cachedResponse.count);

    let exchangesData = [];
    let totalPortfolioUSD = 0;
    const assetsByExchange = {}; // Track assets per exchange
    const apiKeyBalancesData = []; // Track balances per API key

    // Step 3: Process each exchange
    for (let exchangeDoc of dbExchanges.data) {
      const exchangeName = exchangeDoc.exchange;
      const apiKeys = exchangeDoc.apiKeys;

      console.log(`\n💱 Processing ${exchangeName}...`);

      const exchangeData = {
        name: exchangeName,
        apiKeyNames: [], // Store API key names for later use
        totalUSD: 0,
        assets: []
      };

      // Get API key names
      let apiKeysList = [];
      if (apiKeys && apiKeys.length > 0) {
        if (apiKeys[0].name !== undefined) {
          apiKeysList = apiKeys.map(k => k.name);
        } else {
          apiKeysList = ['default'];
        }
      }

      // FILTER: Only process API keys that are selected in the store
      apiKeysList = apiKeysList.filter(apiKeyName => selectedApiKeys.value.includes(apiKeyName));

      if (apiKeysList.length === 0) {
        console.log(`  ⏭️ Skipping ${exchangeName} - no selected API keys`);
        continue;
      }

      // Store API key names in exchangeData for price fetching
      exchangeData.apiKeyNames = apiKeysList;

      console.log(`  📋 Selected API Keys for this exchange:`, apiKeysList);

      // Process each API key for this exchange
      for (let apiKeyName of apiKeysList) {
        const cachedBalance = cachedResponse.balances.find(
          b => b.exchange === exchangeName && b.apiKeyName === apiKeyName
        );

        if (cachedBalance && cachedBalance.balance) {
          console.log(`  ✅ Found balance for ${exchangeName} - ${apiKeyName}`);

          // Create API key balance entry
          const apiKeyBalance = {
            name: apiKeyName,
            exchange: exchangeName,
            totalUSD: parseFloat(cachedBalance.totalUSD) || 0,
            assets: []
          };

          // Add to exchange total USD
          if (cachedBalance.totalUSD) {
            exchangeData.totalUSD += parseFloat(cachedBalance.totalUSD) || 0;
            totalPortfolioUSD += parseFloat(cachedBalance.totalUSD) || 0;
          }

          // Process each coin in this balance
          if (cachedBalance.balance.free) {
            for (let coin in cachedBalance.balance.free) {
              const freeVal = cachedBalance.balance.free[coin] || 0;
              const totalVal = cachedBalance.balance.total[coin] || 0;
              const usedVal = cachedBalance.balance.used?.[coin] || 0;

              if (totalVal > 0) {
                // Add to API key balance
                apiKeyBalance.assets.push({
                  coin: coin,
                  total: totalVal,
                  free: freeVal,
                  used: usedVal,
                  valueUSD: 0 // Will be calculated with price fetch
                });

                // Find or create asset entry for this exchange
                let assetEntry = exchangeData.assets.find(a => a.coin === coin);
                if (assetEntry) {
                  assetEntry.total += totalVal;
                  assetEntry.free += freeVal;
                  assetEntry.used += usedVal;
                } else {
                  exchangeData.assets.push({
                    coin: coin,
                    total: totalVal,
                    free: freeVal,
                    used: usedVal,
                    valueUSD: 0 // Will be calculated with price fetch
                  });
                }
              }
            }
          }

          // Add API key balance to the list if it has assets
          if (apiKeyBalance.assets.length > 0) {
            apiKeyBalancesData.push(apiKeyBalance);
          }
        }
      }

      if (exchangeData.assets.length > 0) {
        exchangesData.push(exchangeData);
        assetsByExchange[exchangeName] = exchangeData.assets;
        console.log(`  ✓ Added ${exchangeName}: ${exchangeData.assets.length} assets, $${exchangeData.totalUSD.toLocaleString()}`);
      }
    }

    // Step 4: Fetch REAL prices for each asset on its exchange
    await fetchPricesAndCalculateValues(exchangesData);

    // Step 4b: Update API key balances with real prices
    await updateApiKeyBalancesWithPrices(apiKeyBalancesData, exchangesData);

    // Step 5: Recalculate total portfolio value from REAL prices
    let recalculatedTotal = 0;
    exchangesData.forEach(exchange => {
      exchange.assets.forEach(asset => {
        recalculatedTotal += asset.valueUSD || 0;
      });
    });

    // Use recalculated total (from real prices) instead of cached totalUSD
    portfolioValue.value = recalculatedTotal > 0 ? recalculatedTotal : totalPortfolioUSD;

    // Step 6: Update asset allocation with REAL values
    updateAssetAllocationFromExchanges(exchangesData, portfolioValue.value);

    // Step 7: Update exchange count and API key balances
    exchangeCount.value = exchangesData.length;
    apiKeyBalances.value = apiKeyBalancesData;

    console.log(`\n💵 Total Portfolio Value: $${portfolioValue.value.toLocaleString()}`);
    console.log(`📊 Total Exchanges: ${exchangesData.length}`);
    console.log(`🔑 Total API Keys: ${apiKeyBalancesData.length}`);

  } catch (error) {
    console.error('❌ Error loading real balances:', error);
    message.error('Failed to load portfolio balances');
  } finally {
    loadingData.value = false;
  }
};

// Fetch prices for each asset on its exchange
const fetchPricesAndCalculateValues = async (exchangesData) => {
  console.log('\n💰 Fetching prices from each exchange...');

  for (let exchange of exchangesData) {
    console.log(`\n📊 Fetching prices for ${exchange.name}...`);

    // Get first API key name for this exchange (stored during balance loading)
    const apiKeyName = exchange.apiKeyNames?.[0] || 'default';
    console.log(`  Using API key: ${apiKeyName}`);

    for (let asset of exchange.assets) {
      // Skip stablecoins - they're $1
      if (['USDT', 'USDC', 'USD', 'EUR'].includes(asset.coin)) {
        const usdValue = asset.coin === 'EUR' ? 1.1 : 1.0; // EUR ~$1.1
        asset.valueUSD = asset.total * usdValue;
        console.log(`  💵 ${asset.coin}: ${asset.total.toFixed(2)} × $${usdValue} = $${asset.valueUSD.toFixed(2)}`);
        continue;
      }

      // Fetch real price from exchange
      try {
        // Try to find a USDC or USDT pair for this coin
        const symbol = `${asset.coin}/USDC`;

        const tickerResponse = await $fetch('/api/v1/fetchTicker', {
          query: {
            userID: userID.value,
            exchange: exchange.name,
            apiKeyName: apiKeyName,
            symbol: symbol
          }
        });

        if (tickerResponse && tickerResponse.data && tickerResponse.data.last) {
          const price = parseFloat(tickerResponse.data.last);
          asset.valueUSD = asset.total * price;
          asset.currentPrice = price;
          console.log(`  ✅ ${asset.coin}: ${asset.total.toFixed(4)} × $${price.toFixed(6)} = $${asset.valueUSD.toFixed(2)}`);
        } else {
          console.log(`  ⚠️ No price for ${symbol} on ${exchange.name}`);
          asset.valueUSD = 0;
        }
      } catch (error) {
        console.log(`  ❌ Failed to fetch price for ${asset.coin} on ${exchange.name}:`, error.message);
        asset.valueUSD = 0;
      }
    }
  }
};

// Update API key balances with real prices from exchange data
const updateApiKeyBalancesWithPrices = async (apiKeyBalancesData, exchangesData) => {
  console.log('\n🔑 Updating API key balances with real prices...');

  for (let apiKeyBalance of apiKeyBalancesData) {
    // Find the exchange data for this API key
    const exchangeData = exchangesData.find(ex => ex.name === apiKeyBalance.exchange);
    if (!exchangeData) continue;

    let recalculatedTotal = 0;

    // Update each asset's USD value based on exchange prices
    for (let apiAsset of apiKeyBalance.assets) {
      // Find the matching asset in exchange data (which has real prices)
      const exchangeAsset = exchangeData.assets.find(a => a.coin === apiAsset.coin);

      if (exchangeAsset && exchangeAsset.currentPrice) {
        // Use the real price from exchange
        apiAsset.valueUSD = apiAsset.total * exchangeAsset.currentPrice;
        apiAsset.currentPrice = exchangeAsset.currentPrice;
      } else if (['USDT', 'USDC', 'USD'].includes(apiAsset.coin)) {
        apiAsset.valueUSD = apiAsset.total * 1.0;
      } else if (apiAsset.coin === 'EUR') {
        apiAsset.valueUSD = apiAsset.total * 1.1;
      } else if (exchangeAsset) {
        // Use the valueUSD from exchange asset
        apiAsset.valueUSD = exchangeAsset.valueUSD;
      }

      recalculatedTotal += apiAsset.valueUSD || 0;
    }

    // Update total USD with recalculated value
    apiKeyBalance.totalUSD = recalculatedTotal;
    console.log(`  ✅ ${apiKeyBalance.name} (${apiKeyBalance.exchange}): $${recalculatedTotal.toFixed(2)}`);
  }
};

// Update asset allocation from exchanges data
const updateAssetAllocationFromExchanges = (exchangesData, totalValue) => {
  if (totalValue === 0) return;

  const updatedAllocation = [];

  // Map common assets
  const assetIcons = {
    'BTC': '₿',
    'ETH': 'Ξ',
    'LCX': '🔷',
    'BNB': '🔶',
    'USDT': '💵',
    'USDC': '💵',
    'USD': '💵',
    'EUR': '💶'
  };

  // Combine assets across all exchanges
  const combinedAssets = {};

  exchangesData.forEach(exchange => {
    exchange.assets.forEach(asset => {
      if (!combinedAssets[asset.coin]) {
        combinedAssets[asset.coin] = {
          total: 0,
          valueUSD: 0,
          exchanges: []
        };
      }
      combinedAssets[asset.coin].total += asset.total;
      combinedAssets[asset.coin].valueUSD += asset.valueUSD || 0;
      combinedAssets[asset.coin].exchanges.push({
        name: exchange.name,
        amount: asset.total
      });
    });
  });

  // Convert to allocation array
  Object.keys(combinedAssets).forEach(coin => {
    const data = combinedAssets[coin];
    if (data.total > 0 && data.valueUSD > 0) {
      const allocation = (data.valueUSD / totalValue) * 100;

      updatedAllocation.push({
        symbol: coin,
        icon: assetIcons[coin] || '💎',
        amount: data.total,
        value: data.valueUSD,
        allocation: allocation,
        volatility: getVolatilityForAsset(coin),
        change24h: 0, // TODO: calculate from price history
        riskScore: calculateRiskScore(coin, allocation),
        color: getColorForAsset(coin),
        exchanges: data.exchanges
      });
    }
  });

  // Sort by USD value descending
  updatedAllocation.sort((a, b) => b.value - a.value);

  // Update the ref
  assetAllocation.value = updatedAllocation;

  // Calculate global asset totals for stats cards
  calculateGlobalAssetTotals();

  console.log(`\n📊 Asset Allocation:`);
  updatedAllocation.forEach(asset => {
    console.log(`  ${asset.icon} ${asset.symbol}: $${asset.value.toFixed(2)} (${asset.allocation.toFixed(2)}%)`);
  });
};

const getVolatilityForAsset = (coin) => {
  const volatilityMap = {
    'BTC': 68, 'ETH': 72, 'LCX': 85, 'BNB': 58,
    'USDT': 2, 'USDC': 2, 'USD': 1, 'EUR': 3
  };
  return volatilityMap[coin] || 50;
};

const calculateRiskScore = (coin, allocation) => {
  const volatility = getVolatilityForAsset(coin);
  const concentrationRisk = allocation > 30 ? 20 : allocation > 20 ? 10 : 0;
  return Math.min(100, volatility + concentrationRisk);
};

const getColorForAsset = (coin) => {
  const colorMap = {
    'BTC': '#f7931a', 'ETH': '#627eea', 'LCX': '#10eb04',
    'BNB': '#f3ba2f', 'USDT': '#26a17b', 'USDC': '#2775ca',
    'USD': '#85bb65', 'EUR': '#0052b4', 'JOB': '#ff6b35'
  };
  return colorMap[coin] || '#00d4ff';
};

// Format number with commas
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  }
  if (num >= 1000) {
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return num.toFixed(2);
};

// Get currency prefix
const getCurrencyPrefix = (coin) => {
  if (coin === 'USD' || coin === 'USDT' || coin === 'USDC') return '$';
  if (coin === 'EUR') return '€';
  return '';
};

// Calculate global asset totals from asset allocation
const calculateGlobalAssetTotals = () => {
  const totals = [];

  assetAllocation.value.forEach(asset => {
    totals.push({
      coin: asset.symbol,
      total: asset.amount,
      valueUSD: asset.value,
      color: asset.color,
      prefix: getCurrencyPrefix(asset.symbol)
    });
  });

  // Sort by USD value descending
  totals.sort((a, b) => b.valueUSD - a.valueUSD);

  globalAssetTotals.value = totals;
};

// Get asset icon
const getAssetIcon = (coin) => {
  const icons = {
    'BTC': '₿',
    'ETH': 'Ξ',
    'LCX': '🔷',
    'JOB': '💼',
    'BNB': '🔶',
    'USDT': '💵',
    'USDC': '💵',
    'USD': '💵',
    'EUR': '💶',
    'SOL': '◎',
    'MATIC': '🟣',
    'ADA': '🔺',
    'DOT': '🔴',
    'AVAX': '🔺'
  };
  return icons[coin] || '💎';
};

// Computed - Priority Assets (BTC, ETH, LCX, JOB, USD, USDC, USDT, EUR)
const filteredPriorityAssets = computed(() => {
  return globalAssetTotals.value.filter(asset => priorityAssets.includes(asset.coin));
});

// Computed - Other Assets (non-priority)
const filteredOtherAssets = computed(() => {
  return globalAssetTotals.value.filter(asset => !priorityAssets.includes(asset.coin));
});

// Computed - API Key Balances (from selected API keys)
const filteredApiKeyBalances = computed(() => {
  return apiKeyBalances.value;
});

// Watch for changes in selected API keys
watch(selectedApiKeys, () => {
  console.log('🔄 Selected API keys changed, reloading balances...');
  loadRealBalances();
}, { deep: true });

onMounted(async () => {
  console.log('⚠️ Portfolio Risk Assessment loaded');
  console.log(`📊 Overall Risk Score: ${overallRiskScore.value}`);
  console.log('🔑 Selected API Keys:', selectedApiKeys.value);

  // Load real balances from selected API keys
  await loadRealBalances();

  // Refresh metrics every 10 seconds
  refreshInterval = setInterval(refreshRiskMetrics, 10000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>
