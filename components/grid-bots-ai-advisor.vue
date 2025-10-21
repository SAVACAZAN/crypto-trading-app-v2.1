<script setup>
import { ref, computed, watch } from 'vue';
import { useAppStore } from '~/stores/app.store';

const app = useAppStore();
const userID = useCookie('userID');

const props = defineProps({
  balance: Object,
  orderbook: Object,
  priceHistory: Array,
  currentPrice: Number
});

const emit = defineEmits(['apply-suggestion']);

const loading = ref(false);
const aiAnalysis = ref(null);
const aiSuggestions = ref(null);
const error = ref(null);
const autoRefresh = ref(false);
const refreshInterval = ref(null);

const currentExchange = computed(() => app.getUserSelectedExchange);
const currentSymbol = computed(() => app.getUserSelectedMarket);

// Get AI analysis from Claude
async function analyzeMarket() {
  loading.value = true;
  error.value = null;

  try {
    // Fetch balance if not provided
    let balanceToUse = props.balance;
    if (!balanceToUse) {
      console.log('🔍 Fetching balance data...');
      const balanceResponse = await $fetch('/api/v1/fetchBalance', {
        query: {
          userID: userID.value,
          exchange: currentExchange.value
        }
      });
      if (balanceResponse.success) {
        balanceToUse = balanceResponse.data;
      }
    }

    // Fetch orderbook if not provided
    let orderbookToUse = props.orderbook;
    if (!orderbookToUse) {
      console.log('🔍 Fetching orderbook data...');
      const orderbookResponse = await $fetch('/api/v1/fetchOrderBook', {
        query: {
          userID: userID.value,
          exchange: currentExchange.value,
          symbol: currentSymbol.value
        }
      });
      if (orderbookResponse.success) {
        orderbookToUse = orderbookResponse.data;
      }
    }

    // Fetch price history if not provided
    let priceHistoryToUse = props.priceHistory;
    if (!priceHistoryToUse || priceHistoryToUse.length === 0) {
      console.log('🔍 Fetching price history data...');
      const priceResponse = await $fetch('/api/v1/fetchChart', {
        query: {
          userID: userID.value,
          exchange: currentExchange.value,
          symbol: currentSymbol.value,
          timeframe: '1d',
          limit: 30
        }
      });
      if (priceResponse.success) {
        priceHistoryToUse = priceResponse.data;
      }
    }

    console.log('📊 Sending to Claude AI:', {
      hasBalance: !!balanceToUse,
      hasOrderbook: !!orderbookToUse,
      hasPriceHistory: !!priceHistoryToUse,
      symbol: currentSymbol.value,
      exchange: currentExchange.value
    });

    const response = await $fetch('/api/v1/claudeAI', {
      method: 'POST',
      body: {
        balance: balanceToUse,
        orderbook: orderbookToUse,
        priceHistory: priceHistoryToUse,
        symbol: currentSymbol.value,
        exchange: currentExchange.value,
        currentPrice: props.currentPrice,
        timeframe: '30d',
        userID: userID.value
      }
    });

    if (response.success) {
      aiAnalysis.value = response.data.analysis;
      aiSuggestions.value = response.data.suggestions;
    } else {
      error.value = response.error || 'Failed to get AI analysis';
    }
  } catch (err) {
    console.error('❌ AI Analysis Error:', err);
    error.value = err.message || 'Failed to connect to AI service';
  } finally {
    loading.value = false;
  }
}

// Apply AI suggestions to the form
function applySuggestion(suggestion) {
  emit('apply-suggestion', suggestion);
}

// Auto-refresh functionality
function toggleAutoRefresh() {
  if (autoRefresh.value) {
    refreshInterval.value = setInterval(() => {
      analyzeMarket();
    }, 60000); // Refresh every 60 seconds
  } else {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value);
      refreshInterval.value = null;
    }
  }
}

watch(autoRefresh, toggleAutoRefresh);

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});

// Extract key metrics from suggestions
const keyMetrics = computed(() => {
  if (!aiSuggestions.value || aiSuggestions.value.parsed === false) {
    return null;
  }

  return {
    lowerPrice: aiSuggestions.value.recommendedPriceRange?.lowerPrice || null,
    upperPrice: aiSuggestions.value.recommendedPriceRange?.upperPrice || null,
    numberOfGrids: aiSuggestions.value.gridConfiguration?.numberOfGrids || null,
    riskLevel: aiSuggestions.value.riskAssessment?.riskLevel || 'Unknown',
    expectedProfit: aiSuggestions.value.gridConfiguration?.expectedProfitPerGrid || null
  };
});
</script>

<template>
  <n-card style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border: 2px solid #0f3460;">
    <template #header>
      <div style="display: flex; align-items: center; gap: 10px;">
        <n-icon size="24" color="#4a90e2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
        </n-icon>
        <span style="color: #4a90e2; font-weight: 700; font-size: 14px;">🤖 AI GRID BOT ADVISOR (Claude 3.5)</span>
      </div>
    </template>

    <!-- Control Panel -->
    <n-space vertical :size="12">
      <n-space>
        <n-button
          type="primary"
          @click="analyzeMarket"
          :loading="loading"
          style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none;"
        >
          <template #icon>
            <n-icon>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
              </svg>
            </n-icon>
          </template>
          {{ loading ? 'Analyzing...' : 'Get AI Analysis' }}
        </n-button>

        <n-checkbox v-model:checked="autoRefresh" style="color: #a0aec0;">
          Auto-refresh (1 min)
        </n-checkbox>
      </n-space>

      <!-- Error Display -->
      <n-alert v-if="error" type="error" closable @close="error = null">
        {{ error }}
      </n-alert>

      <!-- Loading State -->
      <div v-if="loading" style="text-align: center; padding: 40px 0;">
        <n-spin size="large" />
        <p style="color: #a0aec0; margin-top: 16px;">Claude AI is analyzing market conditions...</p>
      </div>

      <!-- AI Analysis Results -->
      <div v-else-if="aiAnalysis && aiSuggestions">
        <!-- Key Metrics Cards -->
        <n-grid v-if="keyMetrics" :cols="3" :x-gap="8" :y-gap="8">
          <n-gi>
            <div style="background: rgba(74, 144, 226, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(74, 144, 226, 0.3);">
              <div style="color: #4a90e2; font-size: 10px; font-weight: 600;">LOWER PRICE</div>
              <div style="color: #fff; font-size: 16px; font-weight: 700; margin-top: 4px;">
                {{ keyMetrics.lowerPrice ? `$${keyMetrics.lowerPrice.toFixed(6)}` : 'N/A' }}
              </div>
            </div>
          </n-gi>
          <n-gi>
            <div style="background: rgba(102, 126, 234, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(102, 126, 234, 0.3);">
              <div style="color: #667eea; font-size: 10px; font-weight: 600;">UPPER PRICE</div>
              <div style="color: #fff; font-size: 16px; font-weight: 700; margin-top: 4px;">
                {{ keyMetrics.upperPrice ? `$${keyMetrics.upperPrice.toFixed(6)}` : 'N/A' }}
              </div>
            </div>
          </n-gi>
          <n-gi>
            <div style="background: rgba(118, 75, 162, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(118, 75, 162, 0.3);">
              <div style="color: #764ba2; font-size: 10px; font-weight: 600;">GRIDS</div>
              <div style="color: #fff; font-size: 16px; font-weight: 700; margin-top: 4px;">
                {{ keyMetrics.numberOfGrids || 'N/A' }}
              </div>
            </div>
          </n-gi>
        </n-grid>

        <!-- Risk Level Badge -->
        <n-space v-if="keyMetrics" align="center">
          <n-tag
            :type="keyMetrics.riskLevel === 'Low' ? 'success' : keyMetrics.riskLevel === 'Medium' ? 'warning' : 'error'"
            :bordered="false"
            size="large"
          >
            Risk Level: {{ keyMetrics.riskLevel }}
          </n-tag>
          <span v-if="keyMetrics.expectedProfit" style="color: #48bb78; font-weight: 600;">
            Expected Profit: {{ keyMetrics.expectedProfit }}
          </span>
        </n-space>

        <!-- Apply Suggestion Button -->
        <n-button
          v-if="keyMetrics && keyMetrics.lowerPrice && keyMetrics.upperPrice"
          type="success"
          @click="applySuggestion(keyMetrics)"
          block
          style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); border: none; font-weight: 700;"
        >
          <template #icon>
            <n-icon>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </n-icon>
          </template>
          Apply AI Recommendation to Form
        </n-button>

        <!-- Full Analysis Display -->
        <n-collapse arrow-placement="right">
          <n-collapse-item title="📊 Full AI Analysis" name="1">
            <div style="background: #0f0f0f; padding: 16px; border-radius: 8px; max-height: 400px; overflow-y: auto;">
              <pre style="color: #a0aec0; font-size: 11px; white-space: pre-wrap; font-family: 'Courier New', monospace; margin: 0;">{{ aiAnalysis }}</pre>
            </div>
          </n-collapse-item>

          <n-collapse-item v-if="aiSuggestions.parsed !== false" title="🎯 Structured Suggestions" name="2">
            <div style="background: #0f0f0f; padding: 16px; border-radius: 8px; max-height: 400px; overflow-y: auto;">
              <pre style="color: #a0aec0; font-size: 11px; white-space: pre-wrap; font-family: 'Courier New', monospace; margin: 0;">{{ JSON.stringify(aiSuggestions, null, 2) }}</pre>
            </div>
          </n-collapse-item>
        </n-collapse>
      </div>

      <!-- Initial State -->
      <div v-else style="text-align: center; padding: 40px 20px; color: #a0aec0;">
        <n-icon size="64" color="#4a90e2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
        </n-icon>
        <h3 style="color: #4a90e2; margin-top: 16px;">AI-Powered Grid Bot Advisor</h3>
        <p style="font-size: 13px; margin-top: 8px;">
          Click "Get AI Analysis" to receive personalized grid bot configuration recommendations based on:
        </p>
        <ul style="text-align: left; display: inline-block; margin-top: 12px; font-size: 12px;">
          <li>Current market conditions & volatility</li>
          <li>Your available balance & risk tolerance</li>
          <li>Orderbook depth & liquidity analysis</li>
          <li>Historical price patterns (30-day)</li>
          <li>Optimal grid spacing & profit potential</li>
        </ul>
      </div>
    </n-space>
  </n-card>
</template>

<style scoped>
.n-card {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

pre {
  line-height: 1.5;
}

.n-collapse {
  background: transparent;
}

:deep(.n-collapse-item__header) {
  background: rgba(74, 144, 226, 0.1);
  border-radius: 6px;
  padding: 10px 12px;
  color: #4a90e2 !important;
  font-weight: 600;
}

:deep(.n-collapse-item__content-inner) {
  padding: 12px 0;
}
</style>
