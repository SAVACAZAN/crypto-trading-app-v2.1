<script setup>
import { ref, computed, watch } from 'vue';
import { useAppStore } from '~/stores/app.store';

const app = useAppStore();
const userID = useCookie('userID');

const props = defineProps({
  provider: {
    type: Object,
    required: true
    // provider: { id, name, emoji, color, gradient, endpoint, model }
  },
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
const currentApiKey = computed(() => app.getSelectedApiKey);
const currentApiKeys = computed(() => app.getSelectedApiKeys); // ✅ GET ALL SELECTED API KEYS

async function analyzeMarket() {
  loading.value = true;
  error.value = null;

  try {
    console.log('🤖 [AI ADVISOR] Starting analysis...');
    console.log('📊 Exchange:', currentExchange.value);
    console.log('💰 Symbol:', currentSymbol.value);
    console.log('🔑 Selected API Keys:', currentApiKeys.value);

    // ✅ FETCH BALANCES FROM ALL SELECTED API KEYS AND COMBINE THEM
    let balanceToUse = props.balance;
    if (!balanceToUse) {
      const apiKeysToFetch = currentApiKeys.value && currentApiKeys.value.length > 0
        ? currentApiKeys.value
        : [currentApiKey.value];

      console.log('📡 Fetching COMBINED balance for', apiKeysToFetch.length, 'API keys:', apiKeysToFetch);

      // ✅ USE NEW ENDPOINT TO GET COMBINED BALANCE DIRECTLY FROM MONGODB
      const balanceResponse = await $fetch('/api/v1/fetchCombinedBalance', {
        query: {
          userID: userID.value,
          exchange: currentExchange.value,
          apiKeyNames: apiKeysToFetch.join(','),  // Send as comma-separated string
          symbol: currentSymbol.value
        }
      });

      if (balanceResponse.success) {
        balanceToUse = balanceResponse.data;
        const [baseCurrency, quoteCurrency] = currentSymbol.value.split('/');
        console.log('✅ COMBINED Balance from MongoDB:', balanceToUse);
        console.log('   📊 API Keys used:', balanceResponse.apiKeysUsed);
        console.log('   📦 Documents processed:', balanceResponse.totalDocuments);
        console.log(`   💰 ${baseCurrency}: ${balanceToUse[baseCurrency]?.free || 0} (free)`);
        console.log(`   💰 ${quoteCurrency}: ${balanceToUse[quoteCurrency]?.free || 0} (free)`);
      } else {
        console.error('❌ Failed to fetch combined balance:', balanceResponse.error);
      }
    }

    // ✅ VALIDATION - EXCHANGE AND SYMBOL REQUIRED
    if (!currentExchange.value || !currentSymbol.value) {
      error.value = 'Please select an exchange and trading pair first';
      return;
    }

    let orderbookToUse = props.orderbook;
    if (!orderbookToUse) {
      const orderbookResponse = await $fetch('/api/v1/fetchOrderBook', {
        query: {
          userID: userID.value,
          exchange: currentExchange.value,
          symbol: currentSymbol.value,
          apiKeyName: currentApiKey.value
        }
      });
      if (orderbookResponse.success) orderbookToUse = orderbookResponse.data;
    }

    // ✅ GET CURRENT PRICE FROM STORE (LIVE TICKER)
    let currentPriceToUse = app.getCurrentPrice || props.currentPrice;
    if (!currentPriceToUse && orderbookToUse) {
      const midPrice = (orderbookToUse.bids?.[0]?.[0] + orderbookToUse.asks?.[0]?.[0]) / 2;
      currentPriceToUse = midPrice || orderbookToUse.bids?.[0]?.[0] || orderbookToUse.asks?.[0]?.[0];
      console.log('💰 Current Price (fallback from orderbook):', currentPriceToUse);
    } else {
      console.log('💰 Current Price (from live ticker):', currentPriceToUse);
    }

    let priceHistoryToUse = props.priceHistory;
    if (!priceHistoryToUse || priceHistoryToUse.length === 0) {
      const priceResponse = await $fetch('/api/v1/fetchChart', {
        query: {
          userID: userID.value,
          exchange: currentExchange.value,
          symbol: currentSymbol.value,
          timeframe: '1d',
          limit: 30,
          apiKeyName: currentApiKey.value
        }
      });
      if (priceResponse.success) priceHistoryToUse = priceResponse.data;
    }

    const response = await $fetch(props.provider.endpoint, {
      method: 'POST',
      body: {
        balance: balanceToUse,
        orderbook: orderbookToUse,
        priceHistory: priceHistoryToUse,
        symbol: currentSymbol.value,
        exchange: currentExchange.value,
        currentPrice: currentPriceToUse,
        timeframe: '30d',
        userID: userID.value,
        apiKeyName: currentApiKey.value
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

function applySuggestion(suggestion) {
  emit('apply-suggestion', suggestion);
}

function toggleAutoRefresh() {
  if (autoRefresh.value) {
    refreshInterval.value = setInterval(() => analyzeMarket(), 60000);
  } else {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value);
      refreshInterval.value = null;
    }
  }
}

watch(autoRefresh, toggleAutoRefresh);

onUnmounted(() => {
  if (refreshInterval.value) clearInterval(refreshInterval.value);
});

const keyMetrics = computed(() => {
  if (!aiSuggestions.value || aiSuggestions.value.parsed === false) return null;

  // Handle multi-bot response (new format)
  if (aiSuggestions.value.recommendedBots && Array.isArray(aiSuggestions.value.recommendedBots)) {
    return {
      isMultiBot: true,
      baseBalance: aiSuggestions.value.baseBalance || 0,
      quoteBalance: aiSuggestions.value.quoteBalance || 0,
      baseCurrency: aiSuggestions.value.baseCurrency || 'BASE',
      quoteCurrency: aiSuggestions.value.quoteCurrency || 'QUOTE',
      botsCount: aiSuggestions.value.recommendedBots.length,
      recommendedBots: aiSuggestions.value.recommendedBots,
      marketAnalysis: aiSuggestions.value.marketAnalysis || '',
      riskWarning: aiSuggestions.value.riskWarning || ''
    };
  }

  // Handle single bot response (legacy format)
  return {
    isMultiBot: false,
    lowerPrice: aiSuggestions.value.lowerPrice || null,
    upperPrice: aiSuggestions.value.upperPrice || null,
    numberOfGrids: aiSuggestions.value.numberOfGrids || null,
    riskLevel: aiSuggestions.value.riskLevel || 'Unknown'
  };
});
</script>

<template>
  <n-card :style="`background: ${provider.gradient}; border: 2px solid ${provider.color}; margin-bottom: 12px;`">
    <template #header>
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 24px;">{{ provider.emoji }}</span>
        <span :style="`color: ${provider.color}; font-weight: 700; font-size: 14px;`">
          {{ provider.name }} AI ADVISOR
          <span v-if="provider.model" style="font-size: 11px; opacity: 0.8;">({{ provider.model }})</span>
          <span v-if="provider.free" style="font-size: 10px; background: #48bb78; color: white; padding: 2px 6px; border-radius: 4px; margin-left: 4px;">FREE</span>
        </span>
      </div>
    </template>

    <n-space vertical :size="12">
      <n-space>
        <n-button
          type="primary"
          @click="analyzeMarket"
          :loading="loading"
          :style="`background: ${provider.color}; border: none;`"
        >
          {{ loading ? 'Analyzing...' : `Get ${provider.name} Analysis` }}
        </n-button>
        <n-checkbox v-model:checked="autoRefresh" style="color: #a0aec0;">Auto-refresh (1 min)</n-checkbox>
      </n-space>

      <n-alert v-if="error" type="error" closable @close="error = null">{{ error }}</n-alert>

      <div v-if="loading" style="text-align: center; padding: 40px 0;">
        <n-spin size="large" />
        <p style="color: #a0aec0; margin-top: 16px;">{{ provider.name }} is analyzing...</p>
      </div>

      <div v-else-if="aiAnalysis && aiSuggestions && keyMetrics">
        <!-- MULTI-BOT RECOMMENDATIONS -->
        <div v-if="keyMetrics.isMultiBot">
          <!-- Summary Stats - INDIVIDUAL BALANCES -->
          <n-grid :cols="3" :x-gap="8" :y-gap="8" style="margin-bottom: 12px;">
            <n-gi>
              <div :style="`background: #4ade8022; padding: 12px; border-radius: 8px; border: 1px solid #4ade8044;`">
                <div style="color: #4ade80; font-size: 10px; font-weight: 600;">BASE ({{ keyMetrics.baseCurrency }})</div>
                <div style="color: #fff; font-size: 16px; font-weight: 700; margin-top: 4px;">
                  {{ keyMetrics.baseBalance.toFixed(2) }}
                </div>
              </div>
            </n-gi>
            <n-gi>
              <div :style="`background: #60a5fa22; padding: 12px; border-radius: 8px; border: 1px solid #60a5fa44;`">
                <div style="color: #60a5fa; font-size: 10px; font-weight: 600;">QUOTE ({{ keyMetrics.quoteCurrency }})</div>
                <div style="color: #fff; font-size: 16px; font-weight: 700; margin-top: 4px;">
                  {{ keyMetrics.quoteBalance.toFixed(2) }}
                </div>
              </div>
            </n-gi>
            <n-gi>
              <div :style="`background: ${provider.color}22; padding: 12px; border-radius: 8px; border: 1px solid ${provider.color}44;`">
                <div :style="`color: ${provider.color}; font-size: 10px; font-weight: 600;`">RECOMMENDED BOTS</div>
                <div style="color: #fff; font-size: 16px; font-weight: 700; margin-top: 4px;">
                  {{ keyMetrics.botsCount }}
                </div>
              </div>
            </n-gi>
          </n-grid>

          <!-- Market Analysis -->
          <n-alert v-if="keyMetrics.marketAnalysis" type="info" style="margin-bottom: 12px; font-size: 11px;">
            {{ keyMetrics.marketAnalysis }}
          </n-alert>

          <!-- Bot Configurations List -->
          <div style="max-height: 500px; overflow-y: auto; margin-bottom: 12px;">
            <n-card
              v-for="(bot, index) in keyMetrics.recommendedBots"
              :key="index"
              size="small"
              :style="`background: #1a1a2e; border: 1px solid ${provider.color}44; margin-bottom: 8px;`"
            >
              <template #header>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span :style="`color: ${provider.color}; font-weight: 700; font-size: 12px;`">
                    {{ bot.botName }}
                  </span>
                  <n-tag
                    :type="bot.riskLevel === 'Low' ? 'success' : bot.riskLevel === 'Medium' ? 'warning' : 'error'"
                    size="small"
                    :bordered="false"
                  >
                    {{ bot.riskLevel }}
                  </n-tag>
                </div>
              </template>

              <n-grid :cols="3" :x-gap="6" :y-gap="6" style="margin-bottom: 8px;">
                <n-gi>
                  <div style="font-size: 9px; color: #888; font-weight: 600;">LOWER</div>
                  <div style="color: #4ade80; font-size: 11px; font-weight: 700;">${{ bot.lowerPrice.toFixed(6) }}</div>
                </n-gi>
                <n-gi>
                  <div style="font-size: 9px; color: #888; font-weight: 600;">UPPER</div>
                  <div style="color: #f87171; font-size: 11px; font-weight: 700;">${{ bot.upperPrice.toFixed(6) }}</div>
                </n-gi>
                <n-gi>
                  <div style="font-size: 9px; color: #888; font-weight: 600;">GRIDS</div>
                  <div style="color: #fbbf24; font-size: 11px; font-weight: 700;">{{ bot.numberOfGrids }}</div>
                </n-gi>
              </n-grid>

              <n-grid :cols="2" :x-gap="6" :y-gap="6" style="margin-bottom: 8px;">
                <n-gi>
                  <div style="font-size: 9px; color: #888; font-weight: 600;">AMOUNT (USDC)</div>
                  <div style="color: #fff; font-size: 11px; font-weight: 700;">${{ bot.suggestedAmount.toFixed(2) }}</div>
                </n-gi>
                <n-gi>
                  <div style="font-size: 9px; color: #888; font-weight: 600;">INC BUY/SELL</div>
                  <div style="color: #fff; font-size: 11px; font-weight: 700;">{{ bot.incrementalPercentAmountBuy }}% / {{ bot.incrementalPercentAmountSell }}%</div>
                </n-gi>
              </n-grid>

              <div style="font-size: 10px; color: #a0aec0; font-style: italic; margin-bottom: 8px;">
                {{ bot.strategy }}
              </div>

              <n-button
                type="primary"
                size="small"
                @click="applySuggestion(bot)"
                block
                :style="`background: ${provider.color}; border: none; font-size: 10px;`"
              >
                Apply This Configuration
              </n-button>
            </n-card>
          </div>

          <!-- Risk Warning -->
          <n-alert v-if="keyMetrics.riskWarning" type="warning" style="font-size: 10px;">
            {{ keyMetrics.riskWarning }}
          </n-alert>

          <!-- Full Analysis Collapse -->
          <n-collapse arrow-placement="right" style="margin-top: 12px;">
            <n-collapse-item :title="`📊 Full ${provider.name} Analysis`" name="1">
              <div style="background: #0f0f0f; padding: 16px; border-radius: 8px; max-height: 400px; overflow-y: auto;">
                <pre style="color: #a0aec0; font-size: 11px; white-space: pre-wrap; margin: 0;">{{ aiAnalysis }}</pre>
              </div>
            </n-collapse-item>
          </n-collapse>
        </div>

        <!-- SINGLE BOT RECOMMENDATION (Legacy) -->
        <div v-else>
          <n-grid :cols="3" :x-gap="8" :y-gap="8">
            <n-gi>
              <div :style="`background: ${provider.color}22; padding: 12px; border-radius: 8px; border: 1px solid ${provider.color}44;`">
                <div :style="`color: ${provider.color}; font-size: 10px; font-weight: 600;`">LOWER PRICE</div>
                <div style="color: #fff; font-size: 16px; font-weight: 700; margin-top: 4px;">
                  {{ keyMetrics.lowerPrice ? `$${keyMetrics.lowerPrice.toFixed(6)}` : 'N/A' }}
                </div>
              </div>
            </n-gi>
            <n-gi>
              <div :style="`background: ${provider.color}22; padding: 12px; border-radius: 8px; border: 1px solid ${provider.color}44;`">
                <div :style="`color: ${provider.color}; font-size: 10px; font-weight: 600;`">UPPER PRICE</div>
                <div style="color: #fff; font-size: 16px; font-weight: 700; margin-top: 4px;">
                  {{ keyMetrics.upperPrice ? `$${keyMetrics.upperPrice.toFixed(6)}` : 'N/A' }}
                </div>
              </div>
            </n-gi>
            <n-gi>
              <div :style="`background: ${provider.color}22; padding: 12px; border-radius: 8px; border: 1px solid ${provider.color}44;`">
                <div :style="`color: ${provider.color}; font-size: 10px; font-weight: 600;`">GRIDS</div>
                <div style="color: #fff; font-size: 16px; font-weight: 700; margin-top: 4px;">
                  {{ keyMetrics.numberOfGrids || 'N/A' }}
                </div>
              </div>
            </n-gi>
          </n-grid>

          <n-space align="center">
            <n-tag :type="keyMetrics.riskLevel === 'Low' ? 'success' : keyMetrics.riskLevel === 'Medium' ? 'warning' : 'error'" :bordered="false" size="large">
              Risk: {{ keyMetrics.riskLevel }}
            </n-tag>
          </n-space>

          <n-button
            v-if="keyMetrics.lowerPrice && keyMetrics.upperPrice"
            type="success"
            @click="applySuggestion(keyMetrics)"
            block
            style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); border: none; font-weight: 700;"
          >
            Apply {{ provider.name }} Recommendation
          </n-button>

          <n-collapse arrow-placement="right">
            <n-collapse-item :title="`📊 Full ${provider.name} Analysis`" name="1">
              <div style="background: #0f0f0f; padding: 16px; border-radius: 8px; max-height: 400px; overflow-y: auto;">
                <pre style="color: #a0aec0; font-size: 11px; white-space: pre-wrap; margin: 0;">{{ aiAnalysis }}</pre>
              </div>
            </n-collapse-item>
          </n-collapse>
        </div>
      </div>

      <div v-else style="text-align: center; padding: 40px 20px; color: #a0aec0;">
        <span style="font-size: 48px;">{{ provider.emoji }}</span>
        <h3 :style="`color: ${provider.color}; margin-top: 16px;`">{{ provider.name }} Grid Bot Advisor</h3>
        <p style="font-size: 13px; margin-top: 8px;">
          Click "Get {{ provider.name }} Analysis" for AI-powered grid bot recommendations
        </p>
      </div>
    </n-space>
  </n-card>
</template>

<style scoped>
.n-card { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4); }
pre { line-height: 1.5; }
.n-collapse { background: transparent; }
</style>
