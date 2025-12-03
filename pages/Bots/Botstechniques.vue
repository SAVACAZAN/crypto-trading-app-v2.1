<template>
  <div class="bots-techniques-unified">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">🤖 Multi-Bot Strategy Builder</h1>
      <p class="page-subtitle">Combine your trading strategies intelligently</p>
    </div>

    <!-- 🔧 TECHNIQUES TAB SELECTOR - 12 GridBot+ Bots -->
    <n-card class="techniques-tabs-card">
      <div class="techniques-tabs-header">
        <span class="techniques-title">🔧 Techniques - Select Your GridBot+ Strategy</span>
      </div>
      <div class="techniques-tabs-grid">
        <n-button
          v-for="(technique, index) in gridBotTechniques"
          :key="index"
          :type="selectedTechnique === technique.name ? 'primary' : 'default'"
          @click="selectTechniqueTab(technique)"
          class="technique-tab-button"
          size="small"
        >
          <span class="technique-icon">{{ technique.emoji }}</span>
          <span class="technique-text">{{ technique.name }}</span>
        </n-button>
      </div>
      <div v-if="selectedTechnique" class="technique-info">
        <span class="info-text">{{ getSelectedTechniqueInfo() }}</span>
      </div>
    </n-card>

    <!-- Mode Selector -->
    <n-card class="mode-selector-card">
      <div class="mode-selector">
        <n-button-group>
          <n-button
            :type="creationMode === 'normal' ? 'primary' : 'default'"
            @click="creationMode = 'normal'"
            size="small"
          >
            🤖 Normal Mode
          </n-button>
          <n-button
            :type="creationMode === 'ab-testing' ? 'primary' : 'default'"
            @click="creationMode = 'ab-testing'"
            size="small"
          >
            🧪 A/B Testing
          </n-button>
          <n-button
            :type="creationMode === 'conditional' ? 'primary' : 'default'"
            @click="creationMode = 'conditional'"
            size="small"
          >
            🔗 Conditional Chains
          </n-button>
        </n-button-group>
      </div>
    </n-card>

    <!-- Strategy Presets (Normal Mode Only) -->
    <n-card class="presets-card" v-if="creationMode === 'normal'">
      <div class="presets-header">
        <span class="presets-title">📋 Quick Presets</span>
        <n-button size="small" @click="clearAll" quaternary>Clear All</n-button>
      </div>
      <div class="presets-grid">
        <n-button size="small" type="success" @click="loadPreset('conservative')">
          🛡️ Conservative
        </n-button>
        <n-button size="small" type="info" @click="loadPreset('balanced')">
          ⚖️ Balanced
        </n-button>
        <n-button size="small" type="warning" @click="loadPreset('aggressive')">
          🔥 Aggressive
        </n-button>
        <n-button size="small" type="primary" @click="loadPreset('range-trader')">
          📊 Range Trader
        </n-button>
        <n-button size="small" type="error" @click="loadPreset('trend-follower')">
          📈 Trend Follower
        </n-button>
        <n-button size="small" @click="loadPreset('accumulator')">
          💰 Accumulator
        </n-button>
      </div>
    </n-card>

    <!-- A/B Testing Configuration -->
    <n-card class="ab-testing-card" v-if="creationMode === 'ab-testing'">
      <div class="ab-testing-header">
        <span class="ab-testing-title">🧪 A/B Testing - Parameter Variation</span>
        <span class="ab-testing-description">Create multiple bots with different parameters to find optimal settings</span>
      </div>

      <n-space vertical :size="12">
        <n-grid :cols="4" x-gap="8">
          <n-gi>
            <n-select
              v-model:value="abTesting.botType"
              :options="abTestBotTypes"
              placeholder="Select Bot Type"
              size="small"
            />
          </n-gi>
          <n-gi>
            <n-select
              v-model:value="abTesting.parameter"
              :options="getParameterOptions()"
              placeholder="Select Parameter"
              size="small"
              :disabled="!abTesting.botType"
            />
          </n-gi>
          <n-gi>
            <n-input-number
              v-model:value="abTesting.startValue"
              placeholder="Start Value"
              size="small"
              style="width: 100%"
              :disabled="!abTesting.parameter"
            />
          </n-gi>
          <n-gi>
            <n-input-number
              v-model:value="abTesting.endValue"
              placeholder="End Value"
              size="small"
              style="width: 100%"
              :disabled="!abTesting.parameter"
            />
          </n-gi>
        </n-grid>

        <n-grid :cols="3" x-gap="8">
          <n-gi>
            <n-input-number
              v-model:value="abTesting.step"
              placeholder="Step"
              size="small"
              style="width: 100%"
              :disabled="!abTesting.parameter"
            />
          </n-gi>
          <n-gi :span="2">
            <div class="ab-variations-info">
              <span class="variations-label">Variations to create:</span>
              <span class="variations-count">{{ calculateVariations() }}</span>
            </div>
          </n-gi>
        </n-grid>

        <div class="ab-preview" v-if="abTesting.parameter && calculateVariations() > 0">
          <span class="preview-label">📊 Preview:</span>
          <div class="preview-values">
            <span v-for="val in generatePreviewValues()" :key="val" class="preview-value">
              {{ abTesting.parameter }}: {{ val }}
            </span>
          </div>
        </div>
      </n-space>
    </n-card>

    <!-- Conditional Bot Chains Configuration -->
    <n-card class="conditional-card" v-if="creationMode === 'conditional'">
      <div class="conditional-header">
        <span class="conditional-title">🔗 Conditional Bot Chains</span>
        <span class="conditional-description">Bot B starts automatically when Bot A reaches conditions</span>
      </div>

      <n-space vertical :size="12">
        <!-- Bot A Configuration -->
        <n-card size="small" class="chain-bot-card">
          <template #header>
            <span class="chain-bot-title">🟢 Bot A (Trigger Bot)</span>
          </template>
          <n-grid :cols="3" x-gap="8">
            <n-gi>
              <n-select
                v-model:value="conditionalChain.botA.type"
                :options="chainBotTypes"
                placeholder="Bot Type"
                size="small"
              />
            </n-gi>
            <n-gi>
              <n-input v-model:value="conditionalChain.botA.name" placeholder="Bot Name" size="small" />
            </n-gi>
            <n-gi>
              <n-select
                v-model:value="conditionalChain.botA.side"
                :options="[{label: 'BUY', value: 'buy'}, {label: 'SELL', value: 'sell'}]"
                placeholder="Side"
                size="small"
              />
            </n-gi>
          </n-grid>
        </n-card>

        <!-- Trigger Condition -->
        <n-card size="small" class="trigger-condition-card">
          <template #header>
            <span class="trigger-title">⚡ Trigger Condition</span>
          </template>
          <n-grid :cols="3" x-gap="8">
            <n-gi>
              <n-select
                v-model:value="conditionalChain.condition.type"
                :options="triggerConditionTypes"
                placeholder="Condition Type"
                size="small"
              />
            </n-gi>
            <n-gi>
              <n-select
                v-model:value="conditionalChain.condition.operator"
                :options="[
                  {label: '>', value: 'gt'},
                  {label: '>=', value: 'gte'},
                  {label: '<', value: 'lt'},
                  {label: '<=', value: 'lte'},
                  {label: '=', value: 'eq'}
                ]"
                placeholder="Operator"
                size="small"
              />
            </n-gi>
            <n-gi>
              <n-input-number
                v-model:value="conditionalChain.condition.value"
                placeholder="Value"
                size="small"
                style="width: 100%"
              >
                <template #suffix>%</template>
              </n-input-number>
            </n-gi>
          </n-grid>
          <div class="condition-example">
            💡 Example: Start SELL bot when BUY bot profit > 10%
          </div>
        </n-card>

        <!-- Bot B Configuration -->
        <n-card size="small" class="chain-bot-card">
          <template #header>
            <span class="chain-bot-title">🔵 Bot B (Action Bot)</span>
          </template>
          <n-grid :cols="3" x-gap="8">
            <n-gi>
              <n-select
                v-model:value="conditionalChain.botB.type"
                :options="chainBotTypes"
                placeholder="Bot Type"
                size="small"
              />
            </n-gi>
            <n-gi>
              <n-input v-model:value="conditionalChain.botB.name" placeholder="Bot Name" size="small" />
            </n-gi>
            <n-gi>
              <n-select
                v-model:value="conditionalChain.botB.side"
                :options="[{label: 'BUY', value: 'buy'}, {label: 'SELL', value: 'sell'}]"
                placeholder="Side"
                size="small"
              />
            </n-gi>
          </n-grid>
        </n-card>
      </n-space>
    </n-card>

    <!-- Main Creation Card (Normal Mode) -->
    <n-card class="main-card" v-if="creationMode === 'normal'">
      <n-space vertical :size="12">

        <!-- GRID BOT Section -->
        <n-card size="small" class="bot-section-card" :class="{ active: gridBots.enabled }">
          <template #header>
            <div class="section-header">
              <div class="header-left">
                <n-checkbox v-model:checked="gridBots.enabled">
                  <span class="section-title">📊 Grid Bot</span>
                </n-checkbox>
                <span class="section-description">Best for ranging markets (sideways movement)</span>
              </div>
              <n-input-number v-model:value="gridBots.count" :min="1" :max="5" size="small" style="width: 70px">
                <template #prefix>x</template>
              </n-input-number>
            </div>
          </template>
          <n-grid :cols="4" x-gap="8" y-gap="8" v-if="gridBots.enabled">
            <n-gi>
              <n-input v-model:value="gridBots.lowerPrice" size="small" placeholder="Lower Price">
                <template #suffix>{{ quote }}</template>
              </n-input>
            </n-gi>
            <n-gi>
              <n-input v-model:value="gridBots.upperPrice" size="small" placeholder="Upper Price">
                <template #suffix>{{ quote }}</template>
              </n-input>
            </n-gi>
            <n-gi>
              <n-input v-model:value="gridBots.nrOfGrids" size="small" placeholder="Grids">
                <template #prefix>#</template>
              </n-input>
            </n-gi>
            <n-gi>
              <n-input v-model:value="gridBots.amount" size="small" placeholder="Amount">
                <template #suffix>{{ quote }}</template>
              </n-input>
            </n-gi>
          </n-grid>
          <div class="bot-info" v-if="gridBots.enabled">
            <span class="info-label">💡 Tip:</span>
            <span class="info-text">Create multiple grids at different price levels for better coverage</span>
          </div>
        </n-card>

        <!-- DCA BOT Section -->
        <n-card size="small" class="bot-section-card" :class="{ active: dcaBots.enabled }">
          <template #header>
            <div class="section-header">
              <div class="header-left">
                <n-checkbox v-model:checked="dcaBots.enabled">
                  <span class="section-title">💰 DCA Bot</span>
                </n-checkbox>
                <span class="section-description">Dollar Cost Averaging - accumulate over time</span>
              </div>
              <n-input-number v-model:value="dcaBots.count" :min="1" :max="3" size="small" style="width: 70px">
                <template #prefix>x</template>
              </n-input-number>
            </div>
          </template>
          <n-grid :cols="4" x-gap="8" y-gap="8" v-if="dcaBots.enabled">
            <n-gi>
              <n-input v-model:value="dcaBots.baseOrderAmount" size="small" placeholder="Base Order">
                <template #suffix>{{ quote }}</template>
              </n-input>
            </n-gi>
            <n-gi>
              <n-input v-model:value="dcaBots.takeProfitOrderPercent" size="small" placeholder="Take Profit">
                <template #suffix>%</template>
              </n-input>
            </n-gi>
            <n-gi>
              <n-input v-model:value="dcaBots.safetyOrderAmount" size="small" placeholder="Safety Order">
                <template #suffix>{{ quote }}</template>
              </n-input>
            </n-gi>
            <n-gi>
              <n-input v-model:value="dcaBots.maxSafetyOrdersCount" size="small" placeholder="Max Safety">
                <template #prefix>#</template>
              </n-input>
            </n-gi>
          </n-grid>
          <div class="bot-info" v-if="dcaBots.enabled">
            <span class="info-label">💡 Tip:</span>
            <span class="info-text">DCA works best in downtrends - averages your entry price</span>
          </div>
        </n-card>

        <!-- SMART DCA Section -->
        <n-card size="small" class="bot-section-card" :class="{ active: smartDCABots.enabled }">
          <template #header>
            <div class="section-header">
              <div class="header-left">
                <n-checkbox v-model:checked="smartDCABots.enabled">
                  <span class="section-title">🧠 Smart DCA Bot</span>
                </n-checkbox>
                <span class="section-description">DCA with RSI/MACD - buy only when oversold</span>
              </div>
              <n-input-number v-model:value="smartDCABots.count" :min="1" :max="3" size="small" style="width: 70px">
                <template #prefix>x</template>
              </n-input-number>
            </div>
          </template>
          <n-grid :cols="4" x-gap="8" y-gap="8" v-if="smartDCABots.enabled">
            <n-gi>
              <n-input v-model:value="smartDCABots.amountPerInterval" size="small" placeholder="Amount/Interval">
                <template #suffix>{{ base }}</template>
              </n-input>
            </n-gi>
            <n-gi>
              <n-input v-model:value="smartDCABots.dcaInterval" size="small" placeholder="Interval">
                <template #suffix>min</template>
              </n-input>
            </n-gi>
            <n-gi>
              <n-input v-model:value="smartDCABots.rsiOversold" size="small" placeholder="RSI Buy">
                <template #suffix><30</template>
              </n-input>
            </n-gi>
            <n-gi>
              <n-input v-model:value="smartDCABots.rsiOverbought" size="small" placeholder="RSI Sell">
                <template #suffix>>70</template>
              </n-input>
            </n-gi>
          </n-grid>
          <div class="bot-info" v-if="smartDCABots.enabled">
            <span class="info-label">💡 Tip:</span>
            <span class="info-text">Waits for good entries - more patient than regular DCA</span>
          </div>
        </n-card>

        <!-- FIB BOT Section -->
        <n-card size="small" class="bot-section-card" :class="{ active: fibBots.enabled }">
          <template #header>
            <div class="section-header">
              <div class="header-left">
                <n-checkbox v-model:checked="fibBots.enabled">
                  <span class="section-title">🌀 Fibonacci Bot</span>
                </n-checkbox>
                <span class="section-description">Trade at Fibonacci retracement levels</span>
              </div>
              <n-input-number v-model:value="fibBots.count" :min="1" :max="3" size="small" style="width: 70px">
                <template #prefix>x</template>
              </n-input-number>
            </div>
          </template>
          <n-grid :cols="4" x-gap="8" y-gap="8" v-if="fibBots.enabled">
            <n-gi>
              <n-input v-model:value="fibBots.PriceStart" size="small" placeholder="Start Price">
                <template #suffix>{{ quote }}</template>
              </n-input>
            </n-gi>
            <n-gi>
              <n-input v-model:value="fibBots.lowerPrice" size="small" placeholder="Lower Price">
                <template #suffix>{{ quote }}</template>
              </n-input>
            </n-gi>
            <n-gi>
              <n-input v-model:value="fibBots.upperPrice" size="small" placeholder="Upper Price">
                <template #suffix>{{ quote }}</template>
              </n-input>
            </n-gi>
            <n-gi>
              <n-input v-model:value="fibBots.nrOfGrids" size="small" placeholder="Fib Levels">
                <template #prefix>#</template>
              </n-input>
            </n-gi>
          </n-grid>
          <div class="bot-info" v-if="fibBots.enabled">
            <span class="info-label">💡 Tip:</span>
            <span class="info-text">Best for trending markets with pullbacks</span>
          </div>
        </n-card>

        <!-- Strategy Summary & Create (Normal Mode) -->
        <n-card size="small" class="summary-card">
          <div class="summary-content">
            <div class="summary-left">
              <div class="summary-title">📊 Your Strategy</div>
              <div class="summary-stats">
                <div class="stat-badge" v-if="gridBots.enabled">
                  📊 {{ gridBots.count }}x Grid
                </div>
                <div class="stat-badge" v-if="dcaBots.enabled">
                  💰 {{ dcaBots.count }}x DCA
                </div>
                <div class="stat-badge" v-if="smartDCABots.enabled">
                  🧠 {{ smartDCABots.count }}x Smart DCA
                </div>
                <div class="stat-badge" v-if="fibBots.enabled">
                  🌀 {{ fibBots.count }}x Fibonacci
                </div>
              </div>
              <div class="summary-info">
                <span class="info-item">
                  <strong>Total Bots:</strong> {{ getTotalBotsCount() }}
                </span>
                <span class="info-item">
                  <strong>Symbol:</strong> {{ currentSymbol }}
                </span>
                <span class="info-item">
                  <strong>Risk Level:</strong> {{ getRiskLevel() }}
                </span>
              </div>
            </div>
            <n-button
              type="primary"
              size="large"
              @click="createAllBots"
              :loading="isCreating"
              :disabled="getTotalBotsCount() === 0"
              class="create-all-button"
            >
              <template #icon>
                <span style="font-size: 20px;">🚀</span>
              </template>
              Deploy {{ getTotalBotsCount() }} Bot{{ getTotalBotsCount() > 1 ? 's' : '' }}
            </n-button>
          </div>
        </n-card>

        <!-- Progress Display -->
        <n-card size="small" v-if="creationProgress.length > 0" class="progress-card">
          <div class="progress-header">
            <span class="progress-title">📝 Deployment Progress</span>
            <span class="progress-count">{{ getSuccessCount() }}/{{ creationProgress.length }}</span>
          </div>
          <div class="progress-list">
            <div
              v-for="(item, index) in creationProgress"
              :key="index"
              class="progress-item"
              :class="item.status"
            >
              <span class="progress-icon">
                {{ item.status === 'success' ? '✅' : item.status === 'error' ? '❌' : '⏳' }}
              </span>
              <span class="progress-text">{{ item.message }}</span>
            </div>
          </div>
        </n-card>

      </n-space>
    </n-card>

    <!-- A/B Testing Create Button -->
    <n-card class="action-card" v-if="creationMode === 'ab-testing'">
      <div class="action-content">
        <div class="action-left">
          <div class="action-title">🧪 A/B Test Configuration</div>
          <div class="action-info">
            <span class="info-item">
              <strong>Bot Type:</strong> {{ abTesting.botType || 'Not selected' }}
            </span>
            <span class="info-item">
              <strong>Parameter:</strong> {{ abTesting.parameter || 'Not selected' }}
            </span>
            <span class="info-item">
              <strong>Variations:</strong> {{ calculateVariations() }}
            </span>
          </div>
        </div>
        <n-button
          type="warning"
          size="large"
          @click="createABTest"
          :loading="isCreating"
          :disabled="calculateVariations() === 0"
          class="create-all-button"
        >
          <template #icon>
            <span style="font-size: 20px;">🧪</span>
          </template>
          Create {{ calculateVariations() }} A/B Test Bots
        </n-button>
      </div>
    </n-card>

    <!-- Conditional Chain Create Button -->
    <n-card class="action-card" v-if="creationMode === 'conditional'">
      <div class="action-content">
        <div class="action-left">
          <div class="action-title">🔗 Conditional Chain Configuration</div>
          <div class="action-info">
            <span class="info-item">
              <strong>Bot A:</strong> {{ conditionalChain.botA.type || 'Not configured' }}
            </span>
            <span class="info-item">
              <strong>Trigger:</strong> {{ formatCondition() }}
            </span>
            <span class="info-item">
              <strong>Bot B:</strong> {{ conditionalChain.botB.type || 'Not configured' }}
            </span>
          </div>
        </div>
        <n-button
          type="error"
          size="large"
          @click="createConditionalChain"
          :loading="isCreating"
          :disabled="!isConditionalChainValid()"
          class="create-all-button"
        >
          <template #icon>
            <span style="font-size: 20px;">🔗</span>
          </template>
          Create Bot Chain
        </n-button>
      </div>
    </n-card>

    <!-- Progress Display (All Modes) -->
    <n-card size="small" v-if="creationProgress.length > 0 && creationMode !== 'normal'" class="progress-card">
      <div class="progress-header">
        <span class="progress-title">📝 Deployment Progress</span>
        <span class="progress-count">{{ getSuccessCount() }}/{{ creationProgress.length }}</span>
      </div>
      <div class="progress-list">
        <div
          v-for="(item, index) in creationProgress"
          :key="index"
          class="progress-item"
          :class="item.status"
        >
          <span class="progress-icon">
            {{ item.status === 'success' ? '✅' : item.status === 'error' ? '❌' : '⏳' }}
          </span>
          <span class="progress-text">{{ item.message }}</span>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAppStore } from '~/stores/app.store';

const app = useAppStore();
const userID = useCookie('userID');

definePageMeta({
  middleware: 'auth'
});

await app.loadUserExchangeData(userID.value);

const currentExchange = ref(app.getUserSelectedExchange);
const currentSymbol = ref(app.getUserSelectedMarket);
const base = computed(() => currentSymbol.value?.split('/')[0] || 'LCX');
const quote = computed(() => currentSymbol.value?.split('/')[1] || 'USDC');

const isCreating = ref(false);
const creationProgress = ref([]);
const creationMode = ref('normal'); // 'normal', 'ab-testing', 'conditional'

// 🔧 12 GridBot+ Techniques/Bots
const gridBotTechniques = ref([
  { emoji: '🖱️', name: 'OneClick', description: 'One-click bot deployment - Instant bot creation' },
  { emoji: '🏃', name: 'FrontRun', description: 'Front-running strategy - Beat the market' },
  { emoji: '✈️', name: 'Co-Pilot', description: 'AI co-pilot assistance - Smart guidance' },
  { emoji: '📊', name: 'DCA + Grid', description: 'DCA combined with grid - Best of both' },
  { emoji: '🎯', name: 'Smart DCA', description: 'Intelligent DCA strategy - Technical timing' },
  { emoji: '📊', name: 'GridBot', description: 'Classic grid trading - Range exploitation' },
  { emoji: '🎯', name: 'Scalping', description: 'Fast scalping strategy - Quick profits' },
  { emoji: '📈', name: 'FibBot', description: 'Fibonacci-based trading - Level-based entry' },
  { emoji: '🧠', name: 'AI Bot', description: 'AI-powered trading - Machine learning' },
  { emoji: '⚙️', name: 'Grinder', description: 'Continuous grinding bot - Steady gains' },
  { emoji: '📖', name: 'OrderBook3pm', description: 'Order book analysis at 3pm - Time-based' },
  { emoji: '🌟', name: 'AI Grid V1', description: 'AI Grid Bots V1 (Glassmorphism) - Latest version' }
]);

const selectedTechnique = ref(null);

// GRID BOTS CONFIG
const gridBots = ref({
  enabled: false,
  count: 2,
  lowerPrice: '',
  upperPrice: '',
  nrOfGrids: '10',
  amount: ''
});

// DCA BOTS CONFIG
const dcaBots = ref({
  enabled: false,
  count: 1,
  baseOrderAmount: '',
  takeProfitOrderPercent: '3',
  safetyOrderAmount: '',
  maxSafetyOrdersCount: '3'
});

// SMART DCA CONFIG
const smartDCABots = ref({
  enabled: false,
  count: 2,
  amountPerInterval: '',
  dcaInterval: '15',
  rsiOversold: '30',
  rsiOverbought: '70'
});

// FIB BOTS CONFIG
const fibBots = ref({
  enabled: false,
  count: 1,
  PriceStart: '',
  lowerPrice: '',
  upperPrice: '',
  nrOfGrids: '8'
});

// A/B TESTING CONFIG
const abTesting = ref({
  botType: null,
  parameter: null,
  startValue: null,
  endValue: null,
  step: 1
});

const abTestBotTypes = [
  { label: '📊 Grid Bot', value: 'grid' },
  { label: '💰 DCA Bot', value: 'dca' },
  { label: '🧠 Smart DCA Bot', value: 'smartdca' },
  { label: '🌀 Fibonacci Bot', value: 'fib' }
];

// CONDITIONAL CHAIN CONFIG
const conditionalChain = ref({
  botA: {
    type: null,
    name: '',
    side: 'buy'
  },
  condition: {
    type: null,
    operator: 'gt',
    value: 10
  },
  botB: {
    type: null,
    name: '',
    side: 'sell'
  }
});

const chainBotTypes = [
  { label: '📊 Grid Bot', value: 'grid' },
  { label: '💰 DCA Bot', value: 'dca' },
  { label: '🧠 Smart DCA Bot', value: 'smartdca' },
  { label: '🌀 Fibonacci Bot', value: 'fib' }
];

const triggerConditionTypes = [
  { label: 'Profit %', value: 'profit' },
  { label: 'Loss %', value: 'loss' },
  { label: 'Total Trades', value: 'trades' },
  { label: 'Win Rate %', value: 'winrate' },
  { label: 'Running Time (hours)', value: 'runtime' }
];

// 🔧 SELECT TECHNIQUE TAB
function selectTechniqueTab(technique) {
  selectedTechnique.value = technique.name;
  window.$message.info(`✨ ${technique.emoji} ${technique.name} selected! Configure below.`);
}

function getSelectedTechniqueInfo() {
  const technique = gridBotTechniques.value.find(t => t.name === selectedTechnique.value);
  return technique ? technique.description : '';
}

// PRESETS
function loadPreset(presetName) {
  clearAll();

  switch(presetName) {
    case 'conservative':
      // 1 DCA + 2 Smart DCA
      dcaBots.value.enabled = true;
      dcaBots.value.count = 1;
      smartDCABots.value.enabled = true;
      smartDCABots.value.count = 2;
      window.$message.info('🛡️ Conservative: Slow accumulation with smart timing');
      break;

    case 'balanced':
      // 2 Grid + 1 DCA + 1 Smart DCA
      gridBots.value.enabled = true;
      gridBots.value.count = 2;
      dcaBots.value.enabled = true;
      dcaBots.value.count = 1;
      smartDCABots.value.enabled = true;
      smartDCABots.value.count = 1;
      window.$message.info('⚖️ Balanced: Mix of range trading and accumulation');
      break;

    case 'aggressive':
      // 3 Grid + 2 Smart DCA
      gridBots.value.enabled = true;
      gridBots.value.count = 3;
      smartDCABots.value.enabled = true;
      smartDCABots.value.count = 2;
      window.$message.info('🔥 Aggressive: Multiple grids for active trading');
      break;

    case 'range-trader':
      // 4 Grid + 1 Fib
      gridBots.value.enabled = true;
      gridBots.value.count = 4;
      fibBots.value.enabled = true;
      fibBots.value.count = 1;
      window.$message.info('📊 Range Trader: Heavy grid coverage');
      break;

    case 'trend-follower':
      // 1 Fib + 2 Smart DCA + 1 DCA
      fibBots.value.enabled = true;
      fibBots.value.count = 1;
      smartDCABots.value.enabled = true;
      smartDCABots.value.count = 2;
      dcaBots.value.enabled = true;
      dcaBots.value.count = 1;
      window.$message.info('📈 Trend Follower: Follow trends with technical signals');
      break;

    case 'accumulator':
      // 2 DCA + 2 Smart DCA
      dcaBots.value.enabled = true;
      dcaBots.value.count = 2;
      smartDCABots.value.enabled = true;
      smartDCABots.value.count = 2;
      window.$message.info('💰 Accumulator: Maximum accumulation strategy');
      break;
  }
}

function clearAll() {
  gridBots.value.enabled = false;
  dcaBots.value.enabled = false;
  smartDCABots.value.enabled = false;
  fibBots.value.enabled = false;
}

// COMPUTED
function getTotalBotsCount() {
  let total = 0;
  if (gridBots.value.enabled) total += gridBots.value.count;
  if (dcaBots.value.enabled) total += dcaBots.value.count;
  if (smartDCABots.value.enabled) total += smartDCABots.value.count;
  if (fibBots.value.enabled) total += fibBots.value.count;
  return total;
}

function getRiskLevel() {
  const total = getTotalBotsCount();
  const hasGrid = gridBots.value.enabled && gridBots.value.count >= 3;
  const hasManyBots = total >= 5;

  if (hasManyBots || hasGrid) return '🔥 High';
  if (total >= 3) return '⚖️ Medium';
  return '🛡️ Low';
}

function getSuccessCount() {
  return creationProgress.value.filter(p => p.status === 'success').length;
}

// CREATE ALL BOTS
async function createAllBots() {
  isCreating.value = true;
  creationProgress.value = [];

  try {
    // Create Grid Bots
    if (gridBots.value.enabled) {
      for (let i = 0; i < gridBots.value.count; i++) {
        await createGridBot(i + 1);
      }
    }

    // Create DCA Bots
    if (dcaBots.value.enabled) {
      for (let i = 0; i < dcaBots.value.count; i++) {
        await createDCABot(i + 1);
      }
    }

    // Create Smart DCA Bots
    if (smartDCABots.value.enabled) {
      for (let i = 0; i < smartDCABots.value.count; i++) {
        await createSmartDCABot(i + 1);
      }
    }

    // Create Fib Bots
    if (fibBots.value.enabled) {
      for (let i = 0; i < fibBots.value.count; i++) {
        await createFibBot(i + 1);
      }
    }

    window.$message.success(`🎉 Successfully deployed ${getTotalBotsCount()} bots!`);
  } catch (error) {
    console.error('Error creating bots:', error);
    window.$message.error('❌ Failed to create some bots');
  } finally {
    isCreating.value = false;
  }
}

// INDIVIDUAL CREATE FUNCTIONS
async function createGridBot(index) {
  const botName = `Grid_${currentSymbol.value.replace('/', '')}_${index}_${Date.now()}`;
  try {
    creationProgress.value.push({ message: `Creating Grid Bot ${index}...`, status: 'pending' });

    const data = {
      userID: userID.value,
      name: botName,
      exchange: currentExchange.value,
      symbol: currentSymbol.value,
      lowerPrice: gridBots.value.lowerPrice,
      upperPrice: gridBots.value.upperPrice,
      nrOfGrids: gridBots.value.nrOfGrids,
      amount: gridBots.value.amount,
      ordersSide: 'buyOrSell',
      amountType: 'incrementalPercent',
      incrementalPercentAmountBuy: '5',
      incrementalPercentAmountSell: '5'
    };

    await $fetch('/api/v1/createGridBot', { method: 'POST', body: data });

    creationProgress.value[creationProgress.value.length - 1].status = 'success';
    creationProgress.value[creationProgress.value.length - 1].message = `Grid Bot ${index} deployed successfully`;
  } catch (error) {
    creationProgress.value[creationProgress.value.length - 1].status = 'error';
    creationProgress.value[creationProgress.value.length - 1].message = `Grid Bot ${index} failed: ${error.message}`;
    console.error('Grid Bot creation error:', error);
  }
}

async function createDCABot(index) {
  const botName = `DCA_${currentSymbol.value.replace('/', '')}_${index}_${Date.now()}`;
  try {
    creationProgress.value.push({ message: `Creating DCA Bot ${index}...`, status: 'pending' });

    const data = {
      userID: userID.value,
      isRunning: true,
      exchange: currentExchange.value,
      symbol: currentSymbol.value,
      direction: 'long',
      baseOrderAmount: dcaBots.value.baseOrderAmount,
      baseOrderType: 'limit',
      takeProfitOrderPercent: dcaBots.value.takeProfitOrderPercent,
      safetyOrderAmount: dcaBots.value.safetyOrderAmount,
      safetyOrderPercent: '2',
      maxSafetyOrdersCount: dcaBots.value.maxSafetyOrdersCount,
      stopLossOrderPercent: '5',
      marketType: 'limit',
      dealStartCondition: 'always'
    };

    await $fetch('/api/v1/createDCABot', { method: 'POST', body: data });

    creationProgress.value[creationProgress.value.length - 1].status = 'success';
    creationProgress.value[creationProgress.value.length - 1].message = `DCA Bot ${index} deployed successfully`;
  } catch (error) {
    creationProgress.value[creationProgress.value.length - 1].status = 'error';
    creationProgress.value[creationProgress.value.length - 1].message = `DCA Bot ${index} failed: ${error.message}`;
    console.error('DCA Bot creation error:', error);
  }
}

async function createSmartDCABot(index) {
  const botName = `SmartDCA_${currentSymbol.value.replace('/', '')}_${index}_${Date.now()}`;
  try {
    creationProgress.value.push({ message: `Creating Smart DCA Bot ${index}...`, status: 'pending' });

    const data = {
      userID: userID.value,
      name: botName,
      exchange: currentExchange.value,
      symbol: currentSymbol.value,
      side: 'buy',
      amountPerInterval: smartDCABots.value.amountPerInterval,
      dcaInterval: smartDCABots.value.dcaInterval,
      totalDuration: '0',
      executionMode: 'smart',
      rsiPeriod: '14',
      rsiOversold: smartDCABots.value.rsiOversold,
      rsiOverbought: smartDCABots.value.rsiOverbought,
      useMacd: true
    };

    await $fetch('/api/v1/createSmartDCABot', { method: 'POST', body: data });

    creationProgress.value[creationProgress.value.length - 1].status = 'success';
    creationProgress.value[creationProgress.value.length - 1].message = `Smart DCA Bot ${index} deployed successfully`;
  } catch (error) {
    creationProgress.value[creationProgress.value.length - 1].status = 'error';
    creationProgress.value[creationProgress.value.length - 1].message = `Smart DCA Bot ${index} failed: ${error.message}`;
    console.error('Smart DCA Bot creation error:', error);
  }
}

async function createFibBot(index) {
  const botName = `Fib_${currentSymbol.value.replace('/', '')}_${index}_${Date.now()}`;
  try {
    creationProgress.value.push({ message: `Creating Fibonacci Bot ${index}...`, status: 'pending' });

    const data = {
      userID: userID.value,
      name: botName,
      exchange: currentExchange.value,
      symbol: currentSymbol.value,
      PriceStart: fibBots.value.PriceStart,
      amountPriceStart: '10',
      lowerPrice: fibBots.value.lowerPrice,
      upperPrice: fibBots.value.upperPrice,
      amount: '10',
      nrOfGrids: fibBots.value.nrOfGrids,
      ordersSide: 'buyOnly',
      incrementalPercentAmountBuy: '5',
      incrementalPercentAmountSell: '5'
    };

    await $fetch('/api/v1/Bots/createFibBot', { method: 'POST', body: data });

    creationProgress.value[creationProgress.value.length - 1].status = 'success';
    creationProgress.value[creationProgress.value.length - 1].message = `Fibonacci Bot ${index} deployed successfully`;
  } catch (error) {
    creationProgress.value[creationProgress.value.length - 1].status = 'error';
    creationProgress.value[creationProgress.value.length - 1].message = `Fibonacci Bot ${index} failed: ${error.message}`;
    console.error('Fib Bot creation error:', error);
  }
}

// ===== A/B TESTING FUNCTIONS =====

function getParameterOptions() {
  if (!abTesting.value.botType) return [];

  const parametersByBotType = {
    grid: [
      { label: 'Number of Grids', value: 'nrOfGrids' },
      { label: 'Lower Price', value: 'lowerPrice' },
      { label: 'Upper Price', value: 'upperPrice' }
    ],
    dca: [
      { label: 'Base Order Amount', value: 'baseOrderAmount' },
      { label: 'Take Profit %', value: 'takeProfitOrderPercent' },
      { label: 'Safety Order Amount', value: 'safetyOrderAmount' },
      { label: 'Max Safety Orders', value: 'maxSafetyOrdersCount' }
    ],
    smartdca: [
      { label: 'RSI Oversold', value: 'rsiOversold' },
      { label: 'RSI Overbought', value: 'rsiOverbought' },
      { label: 'RSI Period', value: 'rsiPeriod' },
      { label: 'DCA Interval (min)', value: 'dcaInterval' },
      { label: 'Amount Per Interval', value: 'amountPerInterval' }
    ],
    fib: [
      { label: 'Number of Fib Levels', value: 'nrOfGrids' },
      { label: 'Lower Price', value: 'lowerPrice' },
      { label: 'Upper Price', value: 'upperPrice' }
    ]
  };

  return parametersByBotType[abTesting.value.botType] || [];
}

function calculateVariations() {
  const { startValue, endValue, step } = abTesting.value;
  if (!startValue || !endValue || !step || startValue >= endValue) return 0;
  return Math.floor((endValue - startValue) / step) + 1;
}

function generatePreviewValues() {
  const { startValue, endValue, step } = abTesting.value;
  if (!startValue || !endValue || !step) return [];

  const values = [];
  for (let val = startValue; val <= endValue; val += step) {
    values.push(val);
  }
  return values.slice(0, 10); // Show max 10 in preview
}

async function createABTest() {
  isCreating.value = true;
  creationProgress.value = [];

  try {
    const variations = generatePreviewValues();
    const testGroupId = Date.now();

    for (let i = 0; i < variations.length; i++) {
      const paramValue = variations[i];
      await createABTestBot(i + 1, paramValue, testGroupId, variations.length);
    }

    window.$message.success(`🧪 Successfully created ${variations.length} A/B test bots!`);
  } catch (error) {
    console.error('A/B Test creation error:', error);
    window.$message.error('❌ Failed to create A/B test bots');
  } finally {
    isCreating.value = false;
  }
}

async function createABTestBot(index, paramValue, testGroupId, totalVariations) {
  const botName = `AB_${abTesting.value.botType}_${abTesting.value.parameter}_${paramValue}_${Date.now()}`;

  try {
    creationProgress.value.push({
      message: `Creating A/B Test Bot ${index}/${totalVariations} (${abTesting.value.parameter}=${paramValue})...`,
      status: 'pending'
    });

    // Build bot config with varied parameter
    let botConfig = {
      userID: userID.value,
      name: botName,
      exchange: currentExchange.value,
      symbol: currentSymbol.value,
      abTestGroup: testGroupId,
      abTestParameter: abTesting.value.parameter,
      abTestValue: paramValue
    };

    // Add bot-specific config based on type
    if (abTesting.value.botType === 'grid') {
      botConfig = {
        ...botConfig,
        lowerPrice: abTesting.value.parameter === 'lowerPrice' ? paramValue : gridBots.value.lowerPrice,
        upperPrice: abTesting.value.parameter === 'upperPrice' ? paramValue : gridBots.value.upperPrice,
        nrOfGrids: abTesting.value.parameter === 'nrOfGrids' ? paramValue : gridBots.value.nrOfGrids,
        amount: gridBots.value.amount,
        ordersSide: 'buyOrSell',
        amountType: 'incrementalPercent',
        incrementalPercentAmountBuy: '5',
        incrementalPercentAmountSell: '5'
      };
      await $fetch('/api/v1/createGridBot', { method: 'POST', body: botConfig });
    } else if (abTesting.value.botType === 'dca') {
      botConfig = {
        ...botConfig,
        isRunning: true,
        direction: 'long',
        baseOrderAmount: abTesting.value.parameter === 'baseOrderAmount' ? paramValue : dcaBots.value.baseOrderAmount,
        baseOrderType: 'limit',
        takeProfitOrderPercent: abTesting.value.parameter === 'takeProfitOrderPercent' ? paramValue : dcaBots.value.takeProfitOrderPercent,
        safetyOrderAmount: abTesting.value.parameter === 'safetyOrderAmount' ? paramValue : dcaBots.value.safetyOrderAmount,
        safetyOrderPercent: '2',
        maxSafetyOrdersCount: abTesting.value.parameter === 'maxSafetyOrdersCount' ? paramValue : dcaBots.value.maxSafetyOrdersCount,
        stopLossOrderPercent: '5',
        marketType: 'limit',
        dealStartCondition: 'always'
      };
      await $fetch('/api/v1/createDCABot', { method: 'POST', body: botConfig });
    } else if (abTesting.value.botType === 'smartdca') {
      botConfig = {
        ...botConfig,
        side: 'buy',
        amountPerInterval: abTesting.value.parameter === 'amountPerInterval' ? paramValue : smartDCABots.value.amountPerInterval,
        dcaInterval: abTesting.value.parameter === 'dcaInterval' ? paramValue : smartDCABots.value.dcaInterval,
        totalDuration: '0',
        executionMode: 'smart',
        rsiPeriod: abTesting.value.parameter === 'rsiPeriod' ? paramValue : '14',
        rsiOversold: abTesting.value.parameter === 'rsiOversold' ? paramValue : smartDCABots.value.rsiOversold,
        rsiOverbought: abTesting.value.parameter === 'rsiOverbought' ? paramValue : smartDCABots.value.rsiOverbought,
        useMacd: true
      };
      await $fetch('/api/v1/createSmartDCABot', { method: 'POST', body: botConfig });
    } else if (abTesting.value.botType === 'fib') {
      botConfig = {
        ...botConfig,
        PriceStart: fibBots.value.PriceStart,
        amountPriceStart: '10',
        lowerPrice: abTesting.value.parameter === 'lowerPrice' ? paramValue : fibBots.value.lowerPrice,
        upperPrice: abTesting.value.parameter === 'upperPrice' ? paramValue : fibBots.value.upperPrice,
        amount: '10',
        nrOfGrids: abTesting.value.parameter === 'nrOfGrids' ? paramValue : fibBots.value.nrOfGrids,
        ordersSide: 'buyOnly',
        incrementalPercentAmountBuy: '5',
        incrementalPercentAmountSell: '5'
      };
      await $fetch('/api/v1/Bots/createFibBot', { method: 'POST', body: botConfig });
    }

    creationProgress.value[creationProgress.value.length - 1].status = 'success';
    creationProgress.value[creationProgress.value.length - 1].message = `A/B Test Bot ${index} created (${abTesting.value.parameter}=${paramValue})`;
  } catch (error) {
    creationProgress.value[creationProgress.value.length - 1].status = 'error';
    creationProgress.value[creationProgress.value.length - 1].message = `A/B Test Bot ${index} failed: ${error.message}`;
    console.error('A/B Test Bot creation error:', error);
  }
}

// ===== CONDITIONAL CHAIN FUNCTIONS =====

function formatCondition() {
  const { type, operator, value } = conditionalChain.value.condition;
  if (!type || !operator || !value) return 'Not configured';

  const operatorSymbols = { gt: '>', gte: '>=', lt: '<', lte: '<=', eq: '=' };
  const typeLabels = { profit: 'Profit', loss: 'Loss', trades: 'Trades', winrate: 'Win Rate', runtime: 'Runtime' };

  return `${typeLabels[type]} ${operatorSymbols[operator]} ${value}${type === 'runtime' ? 'h' : '%'}`;
}

function isConditionalChainValid() {
  const { botA, condition, botB } = conditionalChain.value;
  return botA.type && botA.name && condition.type && condition.value && botB.type && botB.name;
}

async function createConditionalChain() {
  isCreating.value = true;
  creationProgress.value = [];

  try {
    const chainId = Date.now();

    // Create Bot A with chain metadata
    creationProgress.value.push({ message: 'Creating Bot A (Trigger Bot)...', status: 'pending' });
    const botAId = await createChainBot('A', chainId);
    creationProgress.value[0].status = 'success';
    creationProgress.value[0].message = 'Bot A created successfully';

    // Create Bot B with chain metadata
    creationProgress.value.push({ message: 'Creating Bot B (Action Bot)...', status: 'pending' });
    const botBId = await createChainBot('B', chainId);
    creationProgress.value[1].status = 'success';
    creationProgress.value[1].message = 'Bot B created successfully';

    // Store chain relationship in database (you'll need to create this endpoint)
    creationProgress.value.push({ message: 'Linking bot chain...', status: 'pending' });
    await $fetch('/api/v1/Bots/createBotChain', {
      method: 'POST',
      body: {
        chainId,
        botAId,
        botBId,
        condition: conditionalChain.value.condition,
        userID: userID.value
      }
    });
    creationProgress.value[2].status = 'success';
    creationProgress.value[2].message = 'Bot chain linked successfully';

    window.$message.success('🔗 Conditional bot chain created successfully!');
  } catch (error) {
    console.error('Conditional chain creation error:', error);
    window.$message.error('❌ Failed to create conditional chain');
    if (creationProgress.value.length > 0) {
      creationProgress.value[creationProgress.value.length - 1].status = 'error';
    }
  } finally {
    isCreating.value = false;
  }
}

async function createChainBot(botPosition, chainId) {
  const isBotA = botPosition === 'A';
  const botConfig = isBotA ? conditionalChain.value.botA : conditionalChain.value.botB;
  const botName = botConfig.name || `Chain_${botPosition}_${chainId}`;

  const baseConfig = {
    userID: userID.value,
    name: botName,
    exchange: currentExchange.value,
    symbol: currentSymbol.value,
    chainId,
    chainPosition: botPosition,
    chainEnabled: isBotA // Bot A starts immediately, Bot B waits for trigger
  };

  // Create bot based on type using existing bot configs as defaults
  if (botConfig.type === 'grid') {
    const config = {
      ...baseConfig,
      lowerPrice: gridBots.value.lowerPrice,
      upperPrice: gridBots.value.upperPrice,
      nrOfGrids: gridBots.value.nrOfGrids,
      amount: gridBots.value.amount,
      ordersSide: botConfig.side === 'buy' ? 'buyOnly' : 'sellOnly',
      amountType: 'incrementalPercent',
      incrementalPercentAmountBuy: '5',
      incrementalPercentAmountSell: '5'
    };
    const result = await $fetch('/api/v1/createGridBot', { method: 'POST', body: config });
    return result.botId || result._id;
  } else if (botConfig.type === 'dca') {
    const config = {
      ...baseConfig,
      isRunning: isBotA,
      direction: botConfig.side === 'buy' ? 'long' : 'short',
      baseOrderAmount: dcaBots.value.baseOrderAmount,
      baseOrderType: 'limit',
      takeProfitOrderPercent: dcaBots.value.takeProfitOrderPercent,
      safetyOrderAmount: dcaBots.value.safetyOrderAmount,
      safetyOrderPercent: '2',
      maxSafetyOrdersCount: dcaBots.value.maxSafetyOrdersCount,
      stopLossOrderPercent: '5',
      marketType: 'limit',
      dealStartCondition: 'always'
    };
    const result = await $fetch('/api/v1/createDCABot', { method: 'POST', body: config });
    return result.botId || result._id;
  } else if (botConfig.type === 'smartdca') {
    const config = {
      ...baseConfig,
      side: botConfig.side,
      amountPerInterval: smartDCABots.value.amountPerInterval,
      dcaInterval: smartDCABots.value.dcaInterval,
      totalDuration: '0',
      executionMode: 'smart',
      rsiPeriod: '14',
      rsiOversold: smartDCABots.value.rsiOversold,
      rsiOverbought: smartDCABots.value.rsiOverbought,
      useMacd: true
    };
    const result = await $fetch('/api/v1/createSmartDCABot', { method: 'POST', body: config });
    return result.botId || result._id;
  } else if (botConfig.type === 'fib') {
    const config = {
      ...baseConfig,
      PriceStart: fibBots.value.PriceStart,
      amountPriceStart: '10',
      lowerPrice: fibBots.value.lowerPrice,
      upperPrice: fibBots.value.upperPrice,
      amount: '10',
      nrOfGrids: fibBots.value.nrOfGrids,
      ordersSide: botConfig.side === 'buy' ? 'buyOnly' : 'sellOnly',
      incrementalPercentAmountBuy: '5',
      incrementalPercentAmountSell: '5'
    };
    const result = await $fetch('/api/v1/Bots/createFibBot', { method: 'POST', body: config });
    return result.botId || result._id;
  }
}
</script>

<style scoped>
.bots-techniques-unified {
  width: 100%;
  padding: 0 12px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 🔧 TECHNIQUES TABS CARD */
.techniques-tabs-card {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(88, 126, 255, 0.08));
  border: 2px solid rgba(59, 130, 246, 0.3);
  margin-bottom: 16px;
  border-radius: 8px;
}

.techniques-tabs-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.3);
}

.techniques-title {
  font-size: 16px;
  font-weight: 800;
  color: #3b82f6;
  text-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
}

.techniques-tabs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.technique-tab-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 4px !important;
  height: auto !important;
  min-height: 60px;
  font-weight: 700;
  transition: all 0.3s ease;
}

.technique-tab-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(59, 130, 246, 0.2);
}

.technique-icon {
  font-size: 28px;
  display: block;
  line-height: 1;
}

.technique-text {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: normal;
  line-height: 1.2;
}

.technique-info {
  padding: 8px 12px;
  background: rgba(59, 130, 246, 0.15);
  border-radius: 6px;
  border-left: 3px solid #3b82f6;
}

.technique-info .info-text {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
}

/* Page Header */
.page-header {
  text-align: center;
  margin: 12px 0 16px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-radius: 8px;
}

.page-title {
  font-size: 24px;
  font-weight: 800;
  color: #10eb04;
  margin: 0 0 6px 0;
  text-shadow: 0 0 10px rgba(16, 235, 4, 0.4);
}

.page-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* Presets Card */
.presets-card {
  background: rgba(30, 35, 40, 0.6);
  border: 1px solid rgba(102, 126, 234, 0.2);
  margin-bottom: 16px;
}

.presets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.presets-title {
  font-size: 14px;
  font-weight: 700;
  color: #10eb04;
}

.presets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
}

/* Main Card */
.main-card {
  background: rgba(20, 25, 30, 0.6);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

/* Bot Section Cards */
.bot-section-card {
  background: rgba(30, 35, 40, 0.4);
  border: 1px solid rgba(102, 126, 234, 0.15);
  transition: all 0.3s ease;
}

.bot-section-card.active {
  border-color: rgba(16, 235, 4, 0.5);
  background: rgba(30, 35, 40, 0.7);
  box-shadow: 0 0 15px rgba(16, 235, 4, 0.15);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #10eb04;
}

.section-description {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

.bot-info {
  margin-top: 8px;
  padding: 8px;
  background: rgba(16, 235, 4, 0.05);
  border-radius: 4px;
  display: flex;
  gap: 6px;
  align-items: center;
}

.info-label {
  font-size: 11px;
  font-weight: 700;
  color: #10eb04;
  flex-shrink: 0;
}

.info-text {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

/* Summary Card */
.summary-card {
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.1), rgba(5, 245, 237, 0.1));
  border: 2px solid rgba(16, 235, 4, 0.4);
}

.summary-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.summary-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-title {
  font-size: 16px;
  font-weight: 800;
  color: #10eb04;
}

.summary-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  background: rgba(16, 235, 4, 0.15);
  border: 1px solid rgba(16, 235, 4, 0.3);
  border-radius: 12px;
  color: #10eb04;
}

.summary-info {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.info-item {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

.info-item strong {
  color: #10eb04;
  margin-right: 4px;
}

.create-all-button {
  min-width: 200px;
  height: 50px;
  font-weight: 700;
  font-size: 16px;
}

/* Progress Card */
.progress-card {
  background: rgba(20, 25, 30, 0.8);
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.2);
}

.progress-title {
  font-size: 14px;
  font-weight: 700;
  color: #10eb04;
}

.progress-count {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  transition: all 0.3s ease;
}

.progress-item.pending {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  border-left: 3px solid rgba(255, 255, 255, 0.3);
}

.progress-item.success {
  background: rgba(16, 235, 4, 0.1);
  color: #10eb04;
  border-left: 3px solid #10eb04;
}

.progress-item.error {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
  border-left: 3px solid #ff4d4f;
}

.progress-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.progress-text {
  flex: 1;
  font-weight: 600;
}

/* Mode Selector Card */
.mode-selector-card {
  background: rgba(30, 35, 40, 0.6);
  border: 1px solid rgba(102, 126, 234, 0.2);
  margin-bottom: 16px;
}

.mode-selector {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

/* A/B Testing Card */
.ab-testing-card {
  background: rgba(255, 193, 7, 0.05);
  border: 1px solid rgba(255, 193, 7, 0.3);
  margin-bottom: 16px;
}

.ab-testing-header,
.conditional-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.2);
}

.ab-testing-title,
.conditional-title {
  font-size: 16px;
  font-weight: 800;
  color: #ffc107;
}

.ab-testing-description,
.conditional-description {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

.ab-variations-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 6px;
  height: 34px;
}

.variations-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

.variations-count {
  font-size: 16px;
  font-weight: 800;
  color: #ffc107;
}

.ab-preview {
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.preview-label {
  font-size: 12px;
  font-weight: 700;
  color: #ffc107;
  display: block;
  margin-bottom: 8px;
}

.preview-values {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.preview-value {
  font-size: 10px;
  font-weight: 600;
  padding: 4px 10px;
  background: rgba(255, 193, 7, 0.15);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 12px;
  color: #ffc107;
}

/* Conditional Chain Card */
.conditional-card {
  background: rgba(244, 67, 54, 0.05);
  border: 1px solid rgba(244, 67, 54, 0.3);
  margin-bottom: 16px;
}

.conditional-title {
  color: #f44336;
}

.chain-bot-card {
  background: rgba(30, 35, 40, 0.4);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.chain-bot-title {
  font-size: 13px;
  font-weight: 700;
  color: #10eb04;
}

.trigger-condition-card {
  background: rgba(255, 193, 7, 0.08);
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.trigger-title {
  font-size: 13px;
  font-weight: 700;
  color: #ffc107;
}

.condition-example {
  margin-top: 8px;
  padding: 8px;
  background: rgba(255, 193, 7, 0.05);
  border-radius: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

/* Action Card (for A/B Testing and Conditional modes) */
.action-card {
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.1), rgba(5, 245, 237, 0.1));
  border: 2px solid rgba(16, 235, 4, 0.4);
  margin-top: 16px;
}

.action-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.action-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-title {
  font-size: 16px;
  font-weight: 800;
  color: #10eb04;
}

.action-info {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

/* Responsive */
@media (max-width: 800px) {
  .summary-content,
  .action-content {
    flex-direction: column;
  }

  .create-all-button {
    width: 100%;
  }

  .presets-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .mode-selector {
    overflow-x: auto;
  }
}
</style>
