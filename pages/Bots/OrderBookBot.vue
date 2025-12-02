<template>
  <div class="orderbook-bot-page">
    <!-- Main Layout -->
    <n-grid x-gap="16" y-gap="16" :cols="12" item-responsive>
      <!-- Left Column - OrderBook (Compact) -->
      <n-gi span="12 1000:4">
        <n-card title="📖 Live OrderBook" size="small" class="orderbook-card">
          <OrderBookCompact @update:orderbook="handleOrderBookUpdate" />
        </n-card>

        <!-- Market Stats -->
        <n-card title="📊 Market Stats" size="small" class="stats-card">
          <div class="market-stats">
            <div class="stat-row">
              <span class="stat-label">Best Bid:</span>
              <span class="stat-value bid">{{ bestBid || '-' }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Best Ask:</span>
              <span class="stat-value ask">{{ bestAsk || '-' }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Spread:</span>
              <span class="stat-value">{{ spread }}%</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Mid Price:</span>
              <span class="stat-value mid">{{ midPrice || '-' }}</span>
            </div>
          </div>
        </n-card>
      </n-gi>

      <!-- Right Column - Bot Configuration -->
      <n-gi span="12 1000:8">
        <n-card title="🤖 OrderBook Bot & Analysis" size="small" class="config-card">
          <n-tabs type="line" size="small" animated>
            <!-- OrderBook Analysis Tab -->
            <n-tab-pane name="analysis" tab="📊 Analysis">
              <div class="config-section">
                <n-space vertical size="large">
                  <!-- Order Book Imbalance -->
                  <n-card size="small" title="⚖️ Order Book Imbalance" :bordered="false">
                    <div class="analysis-grid">
                      <div class="analysis-item">
                        <span class="label">Bid Volume:</span>
                        <span class="value bid">{{ bidVolume }}</span>
                      </div>
                      <div class="analysis-item">
                        <span class="label">Ask Volume:</span>
                        <span class="value ask">{{ askVolume }}</span>
                      </div>
                      <div class="analysis-item">
                        <span class="label">Imbalance Ratio:</span>
                        <span class="value" :class="imbalanceClass">{{ imbalanceRatio }}%</span>
                      </div>
                      <div class="analysis-item">
                        <span class="label">Market Bias:</span>
                        <span class="value" :class="biasClass">{{ marketBias }}</span>
                      </div>
                    </div>

                    <!-- Imbalance Bar -->
                    <div class="imbalance-bar-container">
                      <div class="imbalance-bar">
                        <div class="bid-bar" :style="{ width: bidPercent + '%' }">
                          <span>{{ bidPercent }}%</span>
                        </div>
                        <div class="ask-bar" :style="{ width: askPercent + '%' }">
                          <span>{{ askPercent }}%</span>
                        </div>
                      </div>
                    </div>
                  </n-card>

                  <!-- Wall Detection -->
                  <n-card size="small" title="🏰 Wall Detection" :bordered="false">
                    <div class="walls-container">
                      <!-- Bid Walls -->
                      <div class="walls-section">
                        <h4 class="wall-header bid">🟢 Bid Walls</h4>
                        <div v-if="bidWalls.length === 0" class="no-walls">No significant walls detected</div>
                        <div v-for="wall in bidWalls" :key="wall.price" class="wall-item bid">
                          <div class="wall-info">
                            <span class="wall-price">{{ wall.price }}</span>
                            <span class="wall-size">{{ wall.size }} {{ base }}</span>
                          </div>
                          <div class="wall-bar">
                            <div class="wall-fill bid" :style="{ width: wall.percent + '%' }"></div>
                          </div>
                          <span class="wall-distance">{{ wall.distance }}% from mid</span>
                        </div>
                      </div>

                      <!-- Ask Walls -->
                      <div class="walls-section">
                        <h4 class="wall-header ask">🔴 Ask Walls</h4>
                        <div v-if="askWalls.length === 0" class="no-walls">No significant walls detected</div>
                        <div v-for="wall in askWalls" :key="wall.price" class="wall-item ask">
                          <div class="wall-info">
                            <span class="wall-price">{{ wall.price }}</span>
                            <span class="wall-size">{{ wall.size }} {{ base }}</span>
                          </div>
                          <div class="wall-bar">
                            <div class="wall-fill ask" :style="{ width: wall.percent + '%' }"></div>
                          </div>
                          <span class="wall-distance">{{ wall.distance }}% from mid</span>
                        </div>
                      </div>
                    </div>
                  </n-card>

                  <!-- Liquidity Depth -->
                  <n-card size="small" title="💧 Liquidity Depth Analysis" :bordered="false">
                    <div class="liquidity-levels">
                      <div class="level-row header">
                        <span>Distance</span>
                        <span>Bid Depth</span>
                        <span>Ask Depth</span>
                        <span>Ratio</span>
                      </div>
                      <div v-for="level in liquidityLevels" :key="level.distance" class="level-row">
                        <span class="distance">{{ level.distance }}%</span>
                        <span class="bid-depth">{{ level.bidDepth }}</span>
                        <span class="ask-depth">{{ level.askDepth }}</span>
                        <span class="ratio" :class="level.ratioClass">{{ level.ratio }}</span>
                      </div>
                    </div>
                  </n-card>

                  <!-- Spread Analysis -->
                  <n-card size="small" title="📏 Spread Analysis" :bordered="false">
                    <div class="spread-analysis">
                      <div class="spread-metric">
                        <span class="metric-label">Current Spread:</span>
                        <span class="metric-value">{{ spread }}%</span>
                      </div>
                      <div class="spread-metric">
                        <span class="metric-label">Avg Spread (5 levels):</span>
                        <span class="metric-value">{{ avgSpread }}%</span>
                      </div>
                      <div class="spread-metric">
                        <span class="metric-label">Spread Type:</span>
                        <span class="metric-value" :class="spreadTypeClass">{{ spreadType }}</span>
                      </div>
                      <div class="spread-metric">
                        <span class="metric-label">Tick Size:</span>
                        <span class="metric-value">{{ tickSize }}</span>
                      </div>
                    </div>
                  </n-card>
                </n-space>
              </div>
            </n-tab-pane>

            <!-- Market Microstructure Tab -->
            <n-tab-pane name="microstructure" tab="🔬 Microstructure">
              <div class="config-section">
                <n-space vertical size="large">
                  <!-- Order Flow -->
                  <n-card size="small" title="📈 Order Flow" :bordered="false">
                    <div class="order-flow-grid">
                      <div class="flow-item">
                        <span class="flow-label">Buy Pressure:</span>
                        <n-progress
                          type="line"
                          :percentage="buyPressure"
                          :color="'#10eb04'"
                          :rail-color="'rgba(16, 235, 4, 0.1)'"
                        />
                      </div>
                      <div class="flow-item">
                        <span class="flow-label">Sell Pressure:</span>
                        <n-progress
                          type="line"
                          :percentage="sellPressure"
                          :color="'#ff3b30'"
                          :rail-color="'rgba(255, 59, 48, 0.1)'"
                        />
                      </div>
                      <div class="flow-item">
                        <span class="flow-label">Net Flow:</span>
                        <span class="flow-value" :class="netFlowClass">{{ netFlow }}</span>
                      </div>
                    </div>
                  </n-card>

                  <!-- Price Levels -->
                  <n-card size="small" title="📍 Key Price Levels" :bordered="false">
                    <div class="price-levels">
                      <div class="price-level support">
                        <span class="level-label">Support Levels:</span>
                        <div class="level-values">
                          <n-tag v-for="level in supportLevels" :key="level" size="small" :bordered="false" type="success">
                            {{ level }}
                          </n-tag>
                        </div>
                      </div>
                      <div class="price-level resistance">
                        <span class="level-label">Resistance Levels:</span>
                        <div class="level-values">
                          <n-tag v-for="level in resistanceLevels" :key="level" size="small" :bordered="false" type="error">
                            {{ level }}
                          </n-tag>
                        </div>
                      </div>
                    </div>
                  </n-card>

                  <!-- Order Book Stats -->
                  <n-card size="small" title="📊 OrderBook Statistics" :bordered="false">
                    <div class="stats-grid">
                      <div class="stat-box">
                        <div class="stat-label">Book Depth</div>
                        <div class="stat-value">1000 levels</div>
                      </div>
                      <div class="stat-box">
                        <div class="stat-label">Update Rate</div>
                        <div class="stat-value">{{ updateRate }}/s</div>
                      </div>
                      <div class="stat-box">
                        <div class="stat-label">Volatility</div>
                        <div class="stat-value" :class="volatilityClass">{{ volatility }}%</div>
                      </div>
                      <div class="stat-box">
                        <div class="stat-label">Liquidity Score</div>
                        <div class="stat-value">{{ liquidityScore }}/10</div>
                      </div>
                    </div>
                  </n-card>
                </n-space>
              </div>
            </n-tab-pane>

            <!-- Trading Signals Tab -->
            <n-tab-pane name="signals" tab="🎯 Signals">
              <div class="config-section">
                <n-space vertical size="large">
                  <!-- Active Signals -->
                  <n-card size="small" title="⚡ Active Trading Signals" :bordered="false">
                    <div class="signals-list">
                      <div v-if="activeSignals.length === 0" class="no-signals">
                        No trading signals detected
                      </div>
                      <div v-for="signal in activeSignals" :key="signal.id" class="signal-item" :class="signal.type">
                        <div class="signal-header">
                          <span class="signal-icon">{{ signal.icon }}</span>
                          <span class="signal-title">{{ signal.title }}</span>
                          <n-tag :type="signal.strength === 'strong' ? 'success' : 'warning'" size="small" :bordered="false">
                            {{ signal.strength }}
                          </n-tag>
                        </div>
                        <div class="signal-description">{{ signal.description }}</div>
                        <div class="signal-details">
                          <span>Price Target: {{ signal.target }}</span>
                          <span>Confidence: {{ signal.confidence }}%</span>
                        </div>
                      </div>
                    </div>
                  </n-card>

                  <!-- Market Conditions -->
                  <n-card size="small" title="🌡️ Market Conditions" :bordered="false">
                    <div class="conditions-grid">
                      <div class="condition-item">
                        <span class="condition-label">Market State:</span>
                        <n-tag :type="marketStateType" :bordered="false">{{ marketState }}</n-tag>
                      </div>
                      <div class="condition-item">
                        <span class="condition-label">Trend:</span>
                        <n-tag :type="trendType" :bordered="false">{{ trend }}</n-tag>
                      </div>
                      <div class="condition-item">
                        <span class="condition-label">Momentum:</span>
                        <n-tag :type="momentumType" :bordered="false">{{ momentum }}</n-tag>
                      </div>
                      <div class="condition-item">
                        <span class="condition-label">Recommended Action:</span>
                        <n-tag :type="actionType" :bordered="false">{{ recommendedAction }}</n-tag>
                      </div>
                    </div>
                  </n-card>

                  <!-- Smart Alerts -->
                  <n-card size="small" title="🔔 Smart Alerts" :bordered="false">
                    <div class="alerts-list">
                      <div v-for="alert in smartAlerts" :key="alert.id" class="alert-item" :class="alert.severity">
                        <div class="alert-icon">{{ alert.icon }}</div>
                        <div class="alert-content">
                          <div class="alert-title">{{ alert.title }}</div>
                          <div class="alert-message">{{ alert.message }}</div>
                          <div class="alert-time">{{ alert.time }}</div>
                        </div>
                      </div>
                    </div>
                  </n-card>
                </n-space>
              </div>
            </n-tab-pane>

            <!-- Basic Config Tab -->
            <n-tab-pane name="basic" tab="⚙️ Bot Config">
              <div class="config-section">
                <n-grid x-gap="12" y-gap="12" :cols="2">
                  <!-- Bot Name -->
                  <n-gi span="2">
                    <div class="form-group">
                      <label class="form-label">Bot Name</label>
                      <n-input v-model:value="botName" placeholder="OrderBook_Bot_1" size="small">
                        <template #prefix>🏷️</template>
                      </n-input>
                    </div>
                  </n-gi>

                  <!-- Strategy Type -->
                  <n-gi span="2">
                    <div class="form-group">
                      <label class="form-label">Strategy Type</label>
                      <n-select
                        v-model:value="strategyType"
                        :options="strategyOptions"
                        size="small"
                        placeholder="Select strategy"
                      />
                    </div>
                  </n-gi>

                  <!-- Order Side -->
                  <n-gi>
                    <div class="form-group">
                      <label class="form-label">Order Side</label>
                      <n-select
                        v-model:value="orderSide"
                        :options="orderSideOptions"
                        size="small"
                      />
                    </div>
                  </n-gi>

                  <!-- Grid Count -->
                  <n-gi>
                    <div class="form-group">
                      <label class="form-label">Number of Grids</label>
                      <n-input-number
                        v-model:value="gridCount"
                        :min="2"
                        :max="100"
                        size="small"
                        style="width: 100%"
                      />
                    </div>
                  </n-gi>

                  <!-- Total Amount -->
                  <n-gi>
                    <div class="form-group">
                      <label class="form-label">Total Amount ({{ quote }})</label>
                      <n-input-number
                        v-model:value="totalAmount"
                        :min="0"
                        :precision="2"
                        size="small"
                        style="width: 100%"
                      >
                        <template #suffix>{{ quote }}</template>
                      </n-input-number>
                    </div>
                  </n-gi>

                  <!-- Amount Per Grid -->
                  <n-gi>
                    <div class="form-group">
                      <label class="form-label">Amount Per Grid</label>
                      <n-input-number
                        v-model:value="amountPerGrid"
                        :min="0"
                        :precision="4"
                        size="small"
                        style="width: 100%"
                        :disabled="true"
                      >
                        <template #suffix>{{ quote }}</template>
                      </n-input-number>
                    </div>
                  </n-gi>
                </n-grid>
              </div>
            </n-tab-pane>

            <!-- Price Range Tab -->
            <n-tab-pane name="range" tab="💰 Price Range">
              <div class="config-section">
                <n-grid x-gap="12" y-gap="12" :cols="2">
                  <!-- Lower Price -->
                  <n-gi>
                    <div class="form-group">
                      <label class="form-label">Lower Price ({{ quote }})</label>
                      <n-input-number
                        v-model:value="lowerPrice"
                        :min="0"
                        :precision="4"
                        size="small"
                        style="width: 100%"
                      >
                        <template #suffix>{{ quote }}</template>
                      </n-input-number>
                    </div>
                  </n-gi>

                  <!-- Upper Price -->
                  <n-gi>
                    <div class="form-group">
                      <label class="form-label">Upper Price ({{ quote }})</label>
                      <n-input-number
                        v-model:value="upperPrice"
                        :min="0"
                        :precision="4"
                        size="small"
                        style="width: 100%"
                      >
                        <template #suffix>{{ quote }}</template>
                      </n-input-number>
                    </div>
                  </n-gi>

                  <!-- Quick Price Adjustments -->
                  <n-gi span="2">
                    <div class="form-group">
                      <label class="form-label">Quick Price Range Adjust</label>
                      <div class="price-adjust-grid">
                        <n-button size="small" @click="adjustPriceRange(-0.5)">-0.5%</n-button>
                        <n-button size="small" @click="adjustPriceRange(-1)">-1%</n-button>
                        <n-button size="small" @click="adjustPriceRange(-2)">-2%</n-button>
                        <n-button size="small" @click="adjustPriceRange(-5)">-5%</n-button>
                        <n-button size="small" type="info" @click="setRangeFromMid">Mid Price</n-button>
                        <n-button size="small" @click="adjustPriceRange(5)">+5%</n-button>
                        <n-button size="small" @click="adjustPriceRange(2)">+2%</n-button>
                        <n-button size="small" @click="adjustPriceRange(1)">+1%</n-button>
                        <n-button size="small" @click="adjustPriceRange(0.5)">+0.5%</n-button>
                      </div>
                    </div>
                  </n-gi>

                  <!-- Price Range Visual -->
                  <n-gi span="2">
                    <div class="price-range-visual">
                      <div class="range-bar">
                        <div class="range-label lower">
                          <span>Lower</span>
                          <strong>{{ lowerPrice }}</strong>
                        </div>
                        <div class="range-middle">
                          <span>Mid</span>
                          <strong>{{ midPrice }}</strong>
                        </div>
                        <div class="range-label upper">
                          <span>Upper</span>
                          <strong>{{ upperPrice }}</strong>
                        </div>
                      </div>
                      <div class="range-info">
                        <span>Range: {{ priceRangePercent }}%</span>
                        <span>Grid Spacing: {{ gridSpacing }}</span>
                      </div>
                    </div>
                  </n-gi>
                </n-grid>
              </div>
            </n-tab-pane>

            <!-- Advanced Tab -->
            <n-tab-pane name="advanced" tab="🎯 Advanced">
              <div class="config-section">
                <n-grid x-gap="12" y-gap="12" :cols="2">
                  <!-- Incremental Amount Buy -->
                  <n-gi>
                    <div class="form-group">
                      <label class="form-label">Incremental % Buy</label>
                      <n-input-number
                        v-model:value="incrementalBuy"
                        :min="0"
                        :max="100"
                        :precision="2"
                        size="small"
                        style="width: 100%"
                      >
                        <template #suffix>%</template>
                      </n-input-number>
                    </div>
                  </n-gi>

                  <!-- Incremental Amount Sell -->
                  <n-gi>
                    <div class="form-group">
                      <label class="form-label">Incremental % Sell</label>
                      <n-input-number
                        v-model:value="incrementalSell"
                        :min="0"
                        :max="100"
                        :precision="2"
                        size="small"
                        style="width: 100%"
                      >
                        <template #suffix>%</template>
                      </n-input-number>
                    </div>
                  </n-gi>

                  <!-- Start Price -->
                  <n-gi>
                    <div class="form-group">
                      <label class="form-label">Start Price</label>
                      <n-input-number
                        v-model:value="startPrice"
                        :min="0"
                        :precision="4"
                        size="small"
                        style="width: 100%"
                      >
                        <template #suffix>{{ quote }}</template>
                      </n-input-number>
                    </div>
                  </n-gi>

                  <!-- Start Amount -->
                  <n-gi>
                    <div class="form-group">
                      <label class="form-label">Start Amount</label>
                      <n-input-number
                        v-model:value="startAmount"
                        :min="0"
                        :precision="4"
                        size="small"
                        style="width: 100%"
                      >
                        <template #suffix>{{ quote }}</template>
                      </n-input-number>
                    </div>
                  </n-gi>

                  <!-- Options -->
                  <n-gi span="2">
                    <div class="form-group">
                      <label class="form-label">Options</label>
                      <n-space>
                        <n-checkbox v-model:checked="activeRange">Active Range Mode</n-checkbox>
                        <n-checkbox v-model:checked="autoAdjust">Auto Adjust Prices</n-checkbox>
                      </n-space>
                    </div>
                  </n-gi>
                </n-grid>
              </div>
            </n-tab-pane>

            <!-- Presets Tab -->
            <n-tab-pane name="presets" tab="💾 Presets">
              <div class="config-section">
                <n-space vertical size="large">
                  <!-- Preset Selector -->
                  <div class="form-group">
                    <label class="form-label">Load Preset</label>
                    <n-grid x-gap="8" :cols="5">
                      <n-gi span="4">
                        <n-select
                          v-model:value="selectedPreset"
                          :options="presetOptions"
                          size="small"
                          placeholder="Select preset"
                          @update:value="loadPreset"
                        />
                      </n-gi>
                      <n-gi>
                        <n-button size="small" @click="deletePreset" type="error" :disabled="!selectedPreset">
                          Delete
                        </n-button>
                      </n-gi>
                    </n-grid>
                  </div>

                  <!-- Save New Preset -->
                  <div class="form-group">
                    <label class="form-label">Save Current Config as Preset</label>
                    <n-grid x-gap="8" :cols="5">
                      <n-gi span="4">
                        <n-input
                          v-model:value="newPresetName"
                          size="small"
                          placeholder="Enter preset name"
                        />
                      </n-gi>
                      <n-gi>
                        <n-button size="small" @click="savePreset" type="success" :disabled="!newPresetName">
                          Save
                        </n-button>
                      </n-gi>
                    </n-grid>
                  </div>

                  <!-- Preset Management -->
                  <n-space>
                    <n-button size="small" @click="updatePreset" :disabled="!selectedPreset">
                      Update Selected
                    </n-button>
                    <n-button size="small" @click="deleteAllPresets" type="error">
                      Delete All
                    </n-button>
                  </n-space>
                </n-space>
              </div>
            </n-tab-pane>
          </n-tabs>

          <!-- Action Buttons -->
          <template #footer>
            <n-space justify="space-between">
              <n-space>
                <n-tag :bordered="false" type="info">
                  {{ currentExchange }} - {{ currentSymbol }}
                </n-tag>
                <n-tag :bordered="false" type="success" v-if="gridCount && totalAmount">
                  {{ gridCount }} grids × {{ amountPerGrid }} {{ quote }}
                </n-tag>
              </n-space>
              <n-button-group>
                <n-button type="success" size="medium" @click="createBuyBot" :loading="creating">
                  <template #icon><span>🟢</span></template>
                  Create Buy Bot
                </n-button>
                <n-button type="error" size="medium" @click="createSellBot" :loading="creating">
                  <template #icon><span>🔴</span></template>
                  Create Sell Bot
                </n-button>
              </n-button-group>
            </n-space>
          </template>
        </n-card>
      </n-gi>
    </n-grid>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useAppStore } from '~/stores/app.store';
import { useMessage } from 'naive-ui';
import OrderBookCompact from '~/components/order-book.vue';

definePageMeta({
  middleware: 'auth'
});

const app = useAppStore();
const message = useMessage();
const userID = useCookie('userID');

// Exchange & Symbol
const currentExchange = ref(app.getUserSelectedExchange);
const currentSymbol = ref(app.getUserSelectedMarket);
const base = computed(() => currentSymbol.value.split('/')[0]);
const quote = computed(() => currentSymbol.value.split('/')[1]);

// OrderBook Data
const bestBid = ref(null);
const bestAsk = ref(null);
const orderBookData = ref(null);

// Bot Configuration
const botName = ref(`OrderBook_${generateRandomString(6)}`);
const strategyType = ref('wall_detection');
const orderSide = ref('both');
const gridCount = ref(10);
const totalAmount = ref(100);
const lowerPrice = ref(0);
const upperPrice = ref(0);
const incrementalBuy = ref(5);
const incrementalSell = ref(5);
const startPrice = ref(0);
const startAmount = ref(10);
const activeRange = ref(false);
const autoAdjust = ref(false);
const creating = ref(false);

// Presets
const selectedPreset = ref(null);
const newPresetName = ref('');
const presetOptions = ref([]);

// Options
const strategyOptions = [
  { label: '🎯 Wall Detection', value: 'wall_detection' },
  { label: '📊 Spread Trading', value: 'spread_trading' },
  { label: '💹 Imbalance Trading', value: 'imbalance_trading' },
  { label: '⚡ Quick Scalping', value: 'quick_scalping' }
];

const orderSideOptions = [
  { label: '🔄 Both (Buy & Sell)', value: 'both' },
  { label: '🟢 Buy Only', value: 'buyOnly' },
  { label: '🔴 Sell Only', value: 'sellOnly' }
];

// Computed Values
const amountPerGrid = computed(() => {
  if (!gridCount.value || gridCount.value === 0) return 0;
  return (totalAmount.value / gridCount.value).toFixed(4);
});

const midPrice = computed(() => {
  if (!bestBid.value || !bestAsk.value) return null;
  return ((parseFloat(bestBid.value) + parseFloat(bestAsk.value)) / 2).toFixed(4);
});

const spread = computed(() => {
  if (!bestBid.value || !bestAsk.value) return '0.00';
  const spreadValue = ((parseFloat(bestAsk.value) - parseFloat(bestBid.value)) / parseFloat(bestBid.value) * 100);
  return spreadValue.toFixed(4);
});

const priceRangePercent = computed(() => {
  if (!lowerPrice.value || !upperPrice.value) return '0.00';
  return (((upperPrice.value - lowerPrice.value) / lowerPrice.value) * 100).toFixed(2);
});

const gridSpacing = computed(() => {
  if (!lowerPrice.value || !upperPrice.value || !gridCount.value) return '0.0000';
  return ((upperPrice.value - lowerPrice.value) / gridCount.value).toFixed(4);
});

// Analysis Data
const bidVolume = ref('0');
const askVolume = ref('0');
const bidWalls = ref([]);
const askWalls = ref([]);
const liquidityLevels = ref([]);
const supportLevels = ref([]);
const resistanceLevels = ref([]);
const activeSignals = ref([]);
const smartAlerts = ref([]);
const bookDepth = ref(0);
const updateRate = ref(2);
const volatility = ref('0.00');
const liquidityScore = ref(0);
const buyPressure = ref(50);
const sellPressure = ref(50);
const marketState = ref('Neutral');
const trend = ref('Sideways');
const momentum = ref('Neutral');
const recommendedAction = ref('Hold');

// Computed Analysis Values
const bidPercent = computed(() => {
  const total = parseFloat(bidVolume.value) + parseFloat(askVolume.value);
  if (total === 0) return 50;
  return Math.round((parseFloat(bidVolume.value) / total) * 100);
});

const askPercent = computed(() => 100 - bidPercent.value);

const imbalanceRatio = computed(() => {
  const ratio = bidPercent.value - 50;
  return ratio > 0 ? `+${ratio}` : ratio;
});

const imbalanceClass = computed(() => {
  const ratio = bidPercent.value - 50;
  if (ratio > 10) return 'bid';
  if (ratio < -10) return 'ask';
  return 'neutral';
});

const biasClass = computed(() => imbalanceClass.value);

const marketBias = computed(() => {
  const ratio = bidPercent.value - 50;
  if (ratio > 15) return 'Strong Buy';
  if (ratio > 5) return 'Buy';
  if (ratio < -15) return 'Strong Sell';
  if (ratio < -5) return 'Sell';
  return 'Neutral';
});

const avgSpread = computed(() => {
  if (!orderBookData.value || !orderBookData.value.bids || !orderBookData.value.asks) return '0.00';

  let totalSpread = 0;
  const levels = Math.min(5, orderBookData.value.bids.length, orderBookData.value.asks.length);

  for (let i = 0; i < levels; i++) {
    const bid = parseFloat(orderBookData.value.bids[i]?.[0] || 0);
    const ask = parseFloat(orderBookData.value.asks[i]?.[0] || 0);
    if (bid > 0) {
      totalSpread += ((ask - bid) / bid * 100);
    }
  }

  return (totalSpread / levels).toFixed(4);
});

const tickSize = computed(() => {
  if (!orderBookData.value || !orderBookData.value.asks || orderBookData.value.asks.length < 2) return '0.0001';
  const price1 = parseFloat(orderBookData.value.asks[0]?.[0] || 0);
  const price2 = parseFloat(orderBookData.value.asks[1]?.[0] || 0);
  return Math.abs(price2 - price1).toFixed(4);
});

const spreadType = computed(() => {
  const spreadVal = parseFloat(spread.value);
  if (spreadVal < 0.1) return 'Tight';
  if (spreadVal < 0.5) return 'Normal';
  return 'Wide';
});

const spreadTypeClass = computed(() => {
  const type = spreadType.value;
  if (type === 'Tight') return 'bid';
  if (type === 'Wide') return 'ask';
  return 'neutral';
});

const netFlow = computed(() => {
  const flow = parseFloat(bidVolume.value) - parseFloat(askVolume.value);
  return flow >= 0 ? `+${flow.toFixed(2)}` : flow.toFixed(2);
});

const netFlowClass = computed(() => {
  return netFlow.value.startsWith('+') ? 'bid' : 'ask';
});

const volatilityClass = computed(() => {
  const vol = parseFloat(volatility.value);
  if (vol > 3) return 'ask';
  if (vol > 1.5) return 'neutral';
  return 'bid';
});

const marketStateType = computed(() => {
  if (marketState.value.includes('Bullish')) return 'success';
  if (marketState.value.includes('Bearish')) return 'error';
  return 'info';
});

const trendType = computed(() => {
  if (trend.value === 'Uptrend') return 'success';
  if (trend.value === 'Downtrend') return 'error';
  return 'info';
});

const momentumType = computed(() => {
  if (momentum.value === 'Strong Up') return 'success';
  if (momentum.value === 'Strong Down') return 'error';
  return 'info';
});

const actionType = computed(() => {
  if (recommendedAction.value === 'Buy') return 'success';
  if (recommendedAction.value === 'Sell') return 'error';
  return 'warning';
});

// Handle OrderBook Updates
const handleOrderBookUpdate = (data) => {
  if (data && data.bids && data.asks) {
    orderBookData.value = data;
    bestBid.value = data.bids[0]?.[0] || null;
    bestAsk.value = data.asks[0]?.[0] || null;

    // Calculate analysis metrics
    calculateOrderBookAnalysis();

    // Auto-set prices on first load
    if (lowerPrice.value === 0 && upperPrice.value === 0 && autoAdjust.value) {
      setRangeFromMid();
    }
  }
};

// Calculate OrderBook Analysis
const calculateOrderBookAnalysis = () => {
  if (!orderBookData.value) return;

  const bids = orderBookData.value.bids || [];
  const asks = orderBookData.value.asks || [];

  // Calculate volumes
  let totalBidVol = 0;
  let totalAskVol = 0;

  bids.forEach(bid => {
    totalBidVol += parseFloat(bid[1] || 0);
  });

  asks.forEach(ask => {
    totalAskVol += parseFloat(ask[1] || 0);
  });

  bidVolume.value = totalBidVol.toFixed(2);
  askVolume.value = totalAskVol.toFixed(2);

  // Detect walls
  detectWalls();

  // Calculate liquidity levels
  calculateLiquidityLevels();

  // Detect support/resistance
  detectSupportResistance();

  // Generate signals
  generateTradingSignals();

  // Update stats
  bookDepth.value = Math.max(bids.length, asks.length);
  liquidityScore.value = calculateLiquidityScore();

  // Calculate buy/sell pressure
  buyPressure.value = bidPercent.value;
  sellPressure.value = askPercent.value;

  // Determine market conditions
  updateMarketConditions();
};

// Detect Order Walls
const detectWalls = () => {
  if (!orderBookData.value) return;

  const bids = orderBookData.value.bids || [];
  const asks = orderBookData.value.asks || [];
  const mid = parseFloat(midPrice.value) || 0;

  // Calculate average volumes
  const avgBidVol = bids.reduce((sum, bid) => sum + parseFloat(bid[1]), 0) / bids.length;
  const avgAskVol = asks.reduce((sum, ask) => sum + parseFloat(ask[1]), 0) / asks.length;

  const wallThreshold = 3; // 3x average = wall

  // Detect bid walls (show up to 15)
  const detectedBidWalls = [];
  bids.forEach((bid, idx) => {
    const price = parseFloat(bid[0]);
    const size = parseFloat(bid[1]);

    if (size > avgBidVol * wallThreshold && detectedBidWalls.length < 15) {
      const distance = ((mid - price) / mid * 100).toFixed(2);
      const percent = Math.min((size / avgBidVol / wallThreshold) * 100, 100);

      detectedBidWalls.push({
        price: price.toFixed(4),
        size: size.toFixed(2),
        distance,
        percent: Math.round(percent)
      });
    }
  });

  // Detect ask walls (show up to 15)
  const detectedAskWalls = [];
  asks.forEach((ask, idx) => {
    const price = parseFloat(ask[0]);
    const size = parseFloat(ask[1]);

    if (size > avgAskVol * wallThreshold && detectedAskWalls.length < 15) {
      const distance = ((price - mid) / mid * 100).toFixed(2);
      const percent = Math.min((size / avgAskVol / wallThreshold) * 100, 100);

      detectedAskWalls.push({
        price: price.toFixed(4),
        size: size.toFixed(2),
        distance,
        percent: Math.round(percent)
      });
    }
  });

  bidWalls.value = detectedBidWalls;
  askWalls.value = detectedAskWalls;
};

// Calculate Liquidity Levels
const calculateLiquidityLevels = () => {
  if (!orderBookData.value) return;

  const bids = orderBookData.value.bids || [];
  const asks = orderBookData.value.asks || [];
  const mid = parseFloat(midPrice.value) || 0;

  const distances = [0.5, 1, 2, 3, 5];
  const levels = [];

  distances.forEach(dist => {
    const lowerBound = mid * (1 - dist / 100);
    const upperBound = mid * (1 + dist / 100);

    let bidDepth = 0;
    let askDepth = 0;

    bids.forEach(bid => {
      const price = parseFloat(bid[0]);
      if (price >= lowerBound && price <= mid) {
        bidDepth += parseFloat(bid[1]);
      }
    });

    asks.forEach(ask => {
      const price = parseFloat(ask[0]);
      if (price <= upperBound && price >= mid) {
        askDepth += parseFloat(ask[1]);
      }
    });

    const ratio = bidDepth > 0 ? (bidDepth / (bidDepth + askDepth) * 100).toFixed(1) : '0.0';
    const ratioClass = parseFloat(ratio) > 55 ? 'bid' : parseFloat(ratio) < 45 ? 'ask' : 'neutral';

    levels.push({
      distance: dist,
      bidDepth: bidDepth.toFixed(2),
      askDepth: askDepth.toFixed(2),
      ratio,
      ratioClass
    });
  });

  liquidityLevels.value = levels;
};

// Detect Support/Resistance Levels
const detectSupportResistance = () => {
  if (!orderBookData.value) return;

  const bids = orderBookData.value.bids || [];
  const asks = orderBookData.value.asks || [];

  // Top 3 bid levels as support
  const supports = bids.slice(0, 3).map(bid => parseFloat(bid[0]).toFixed(4));
  supportLevels.value = supports;

  // Top 3 ask levels as resistance
  const resistances = asks.slice(0, 3).map(ask => parseFloat(ask[0]).toFixed(4));
  resistanceLevels.value = resistances;
};

// Generate Trading Signals
const generateTradingSignals = () => {
  const signals = [];

  // Wall-based signals
  if (bidWalls.value.length > askWalls.value.length && bidWalls.value.length >= 2) {
    signals.push({
      id: 1,
      type: 'bullish',
      icon: '🟢',
      title: 'Strong Bid Support',
      description: `${bidWalls.value.length} large buy walls detected. Strong support levels.`,
      strength: 'strong',
      target: bestBid.value,
      confidence: 75
    });
  }

  if (askWalls.value.length > bidWalls.value.length && askWalls.value.length >= 2) {
    signals.push({
      id: 2,
      type: 'bearish',
      icon: '🔴',
      title: 'Heavy Sell Pressure',
      description: `${askWalls.value.length} large sell walls detected. Resistance ahead.`,
      strength: 'strong',
      target: bestAsk.value,
      confidence: 75
    });
  }

  // Imbalance-based signals
  const ratio = bidPercent.value - 50;
  if (ratio > 20) {
    signals.push({
      id: 3,
      type: 'bullish',
      icon: '📈',
      title: 'Strong Buy Imbalance',
      description: `Order book shows ${ratio}% buy bias. Potential upward movement.`,
      strength: 'moderate',
      target: (parseFloat(bestAsk.value) * 1.02).toFixed(4),
      confidence: 65
    });
  }

  if (ratio < -20) {
    signals.push({
      id: 4,
      type: 'bearish',
      icon: '📉',
      title: 'Strong Sell Imbalance',
      description: `Order book shows ${Math.abs(ratio)}% sell bias. Potential downward movement.`,
      strength: 'moderate',
      target: (parseFloat(bestBid.value) * 0.98).toFixed(4),
      confidence: 65
    });
  }

  activeSignals.value = signals;

  // Generate alerts
  generateSmartAlerts(signals);
};

// Generate Smart Alerts
const generateSmartAlerts = (signals) => {
  const alerts = [];

  // Spread alerts
  const spreadVal = parseFloat(spread.value);
  if (spreadVal < 0.1) {
    alerts.push({
      id: 1,
      severity: 'info',
      icon: '✅',
      title: 'Tight Spread',
      message: `Spread at ${spread.value}% - Excellent liquidity for trading`,
      time: 'Just now'
    });
  } else if (spreadVal > 0.5) {
    alerts.push({
      id: 2,
      severity: 'warning',
      icon: '⚠️',
      title: 'Wide Spread',
      message: `Spread at ${spread.value}% - Low liquidity, use limit orders`,
      time: 'Just now'
    });
  }

  // Signal-based alerts
  if (signals.length > 0) {
    const strongSignals = signals.filter(s => s.strength === 'strong');
    if (strongSignals.length > 0) {
      alerts.push({
        id: 3,
        severity: 'success',
        icon: '🎯',
        title: 'Trading Opportunity',
        message: `${strongSignals.length} strong signal(s) detected`,
        time: 'Just now'
      });
    }
  }

  smartAlerts.value = alerts.slice(0, 5);
};

// Calculate Liquidity Score
const calculateLiquidityScore = () => {
  let score = 5; // Base score

  // Spread contribution (0-3 points)
  const spreadVal = parseFloat(spread.value);
  if (spreadVal < 0.1) score += 3;
  else if (spreadVal < 0.3) score += 2;
  else if (spreadVal < 0.5) score += 1;

  // Depth contribution (0-2 points)
  if (bookDepth.value > 50) score += 2;
  else if (bookDepth.value > 20) score += 1;

  return Math.min(score, 10);
};

// Update Market Conditions
const updateMarketConditions = () => {
  const ratio = bidPercent.value - 50;

  // Market State
  if (ratio > 15) marketState.value = 'Bullish';
  else if (ratio < -15) marketState.value = 'Bearish';
  else marketState.value = 'Neutral';

  // Trend (simplified - based on walls)
  if (bidWalls.value.length > askWalls.value.length + 1) trend.value = 'Uptrend';
  else if (askWalls.value.length > bidWalls.value.length + 1) trend.value = 'Downtrend';
  else trend.value = 'Sideways';

  // Momentum
  if (ratio > 20) momentum.value = 'Strong Up';
  else if (ratio > 10) momentum.value = 'Moderate Up';
  else if (ratio < -20) momentum.value = 'Strong Down';
  else if (ratio < -10) momentum.value = 'Moderate Down';
  else momentum.value = 'Neutral';

  // Recommended Action
  if (activeSignals.value.some(s => s.type === 'bullish' && s.strength === 'strong')) {
    recommendedAction.value = 'Buy';
  } else if (activeSignals.value.some(s => s.type === 'bearish' && s.strength === 'strong')) {
    recommendedAction.value = 'Sell';
  } else {
    recommendedAction.value = 'Hold';
  }
};

// Price Adjustment Functions
const adjustPriceRange = (percent) => {
  const mid = parseFloat(midPrice.value);
  if (!mid) {
    message.warning('Wait for orderbook data');
    return;
  }

  const adjustment = Math.abs(percent) / 100;

  if (percent < 0) {
    lowerPrice.value = parseFloat((mid * (1 - adjustment)).toFixed(4));
  } else {
    upperPrice.value = parseFloat((mid * (1 + adjustment)).toFixed(4));
  }
};

const setRangeFromMid = () => {
  const mid = parseFloat(midPrice.value);
  if (!mid) return;

  lowerPrice.value = parseFloat((mid * 0.98).toFixed(4)); // -2%
  upperPrice.value = parseFloat((mid * 1.02).toFixed(4)); // +2%
  startPrice.value = parseFloat(mid);
};

// Bot Creation
const createBuyBot = async () => {
  orderSide.value = 'buyOnly';
  await createBot();
};

const createSellBot = async () => {
  orderSide.value = 'sellOnly';
  await createBot();
};

const createBot = async () => {
  creating.value = true;

  try {
    const data = {
      userID: userID.value,
      name: botName.value,
      exchange: currentExchange.value,
      symbol: currentSymbol.value,
      strategyType: strategyType.value,
      PriceStart: startPrice.value,
      amountPriceStart: startAmount.value,
      lowerPrice: lowerPrice.value,
      upperPrice: upperPrice.value,
      amountType: 'incrementalPercent',
      amount: totalAmount.value,
      nrOfGrids: gridCount.value,
      ordersSide: orderSide.value,
      incrementalPercentAmountBuy: incrementalBuy.value,
      incrementalPercentAmountSell: incrementalSell.value,
      activeRange: activeRange.value
    };

    const response = await $fetch('/api/v1/Bots/createFibBot', {
      method: 'POST',
      body: data
    });

    message.success(`OrderBook Bot created: ${botName.value}`);
    console.log('Bot created:', response);

    // Generate new bot name
    botName.value = `OrderBook_${generateRandomString(6)}`;
  } catch (error) {
    message.error('Failed to create bot: ' + error.message);
    console.error('Error creating bot:', error);
  } finally {
    creating.value = false;
  }
};

// Preset Management
const savePreset = () => {
  if (!newPresetName.value) return;

  const presets = JSON.parse(localStorage.getItem('orderBookBotPresets') || '[]');

  const newPreset = {
    name: newPresetName.value,
    config: {
      strategyType: strategyType.value,
      orderSide: orderSide.value,
      gridCount: gridCount.value,
      totalAmount: totalAmount.value,
      lowerPrice: lowerPrice.value,
      upperPrice: upperPrice.value,
      incrementalBuy: incrementalBuy.value,
      incrementalSell: incrementalSell.value,
      startPrice: startPrice.value,
      startAmount: startAmount.value,
      activeRange: activeRange.value,
      autoAdjust: autoAdjust.value
    }
  };

  presets.push(newPreset);
  localStorage.setItem('orderBookBotPresets', JSON.stringify(presets));

  presetOptions.value.push({
    label: newPresetName.value,
    value: newPresetName.value
  });

  selectedPreset.value = newPresetName.value;
  newPresetName.value = '';
  message.success('Preset saved!');
};

const loadPreset = (presetName) => {
  const presets = JSON.parse(localStorage.getItem('orderBookBotPresets') || '[]');
  const preset = presets.find(p => p.name === presetName);

  if (preset) {
    const config = preset.config;
    strategyType.value = config.strategyType;
    orderSide.value = config.orderSide;
    gridCount.value = config.gridCount;
    totalAmount.value = config.totalAmount;
    lowerPrice.value = config.lowerPrice;
    upperPrice.value = config.upperPrice;
    incrementalBuy.value = config.incrementalBuy;
    incrementalSell.value = config.incrementalSell;
    startPrice.value = config.startPrice;
    startAmount.value = config.startAmount;
    activeRange.value = config.activeRange;
    autoAdjust.value = config.autoAdjust;

    message.success(`Loaded preset: ${presetName}`);
  }
};

const updatePreset = () => {
  if (!selectedPreset.value) return;

  const presets = JSON.parse(localStorage.getItem('orderBookBotPresets') || '[]');
  const index = presets.findIndex(p => p.name === selectedPreset.value);

  if (index !== -1) {
    presets[index].config = {
      strategyType: strategyType.value,
      orderSide: orderSide.value,
      gridCount: gridCount.value,
      totalAmount: totalAmount.value,
      lowerPrice: lowerPrice.value,
      upperPrice: upperPrice.value,
      incrementalBuy: incrementalBuy.value,
      incrementalSell: incrementalSell.value,
      startPrice: startPrice.value,
      startAmount: startAmount.value,
      activeRange: activeRange.value,
      autoAdjust: autoAdjust.value
    };

    localStorage.setItem('orderBookBotPresets', JSON.stringify(presets));
    message.success('Preset updated!');
  }
};

const deletePreset = () => {
  if (!selectedPreset.value) return;

  let presets = JSON.parse(localStorage.getItem('orderBookBotPresets') || '[]');
  presets = presets.filter(p => p.name !== selectedPreset.value);
  localStorage.setItem('orderBookBotPresets', JSON.stringify(presets));

  presetOptions.value = presetOptions.value.filter(p => p.value !== selectedPreset.value);
  selectedPreset.value = null;
  message.success('Preset deleted!');
};

const deleteAllPresets = () => {
  localStorage.setItem('orderBookBotPresets', '[]');
  presetOptions.value = [];
  selectedPreset.value = null;
  message.success('All presets deleted!');
};

// Utilities
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Lifecycle
onMounted(async () => {
  await app.loadUserExchangeData(userID.value);

  // Load presets
  const presets = JSON.parse(localStorage.getItem('orderBookBotPresets') || '[]');
  presetOptions.value = presets.map(p => ({
    label: p.name,
    value: p.name
  }));

  // Auto-set initial range after a short delay
  setTimeout(() => {
    if (midPrice.value && lowerPrice.value === 0) {
      setRangeFromMid();
    }
  }, 1500);
});
</script>

<style scoped>
.orderbook-bot-page {
  padding: 16px;
  background: #0f1419;
  min-height: 100%;
}

/* Cards */
.orderbook-card,
.stats-card,
.config-card {
  background: #1a1f2e;
  border: 1px solid #2a3441;
  margin-bottom: 16px;
}

/* Market Stats */
.market-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.stat-label {
  font-size: 12px;
  color: #888;
  font-weight: 600;
}

.stat-value {
  font-size: 14px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: #e0e0e0;
}

.stat-value.bid {
  color: #10eb04;
}

.stat-value.ask {
  color: #ff3b30;
}

.stat-value.mid {
  color: #6366f1;
}

/* Config Section */
.config-section {
  padding: 16px 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 11px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Price Adjust Grid */
.price-adjust-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 6px;
}

/* Price Range Visual */
.price-range-visual {
  padding: 16px;
  background: rgba(99, 102, 241, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.range-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  position: relative;
}

.range-bar::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 10%;
  right: 10%;
  height: 2px;
  background: linear-gradient(90deg, #10eb04, #6366f1, #ff3b30);
  transform: translateY(-50%);
  z-index: 0;
}

.range-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  z-index: 1;
  background: #1a1f2e;
  padding: 8px 12px;
  border-radius: 6px;
}

.range-middle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  z-index: 1;
  background: #1a1f2e;
  padding: 8px 12px;
  border-radius: 6px;
  border: 2px solid #6366f1;
}

.range-label span,
.range-middle span {
  font-size: 10px;
  color: #888;
  text-transform: uppercase;
}

.range-label strong,
.range-middle strong {
  font-size: 13px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.range-label.lower strong {
  color: #10eb04;
}

.range-middle strong {
  color: #6366f1;
}

.range-label.upper strong {
  color: #ff3b30;
}

.range-info {
  display: flex;
  justify-content: space-around;
  padding-top: 12px;
  border-top: 1px solid rgba(99, 102, 241, 0.2);
  font-size: 11px;
  color: #888;
}

/* Analysis Components */
.analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.analysis-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.analysis-item .label {
  font-size: 11px;
  color: #888;
  font-weight: 600;
}

.analysis-item .value {
  font-size: 14px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.analysis-item .value.neutral {
  color: #ffa500;
}

/* Imbalance Bar */
.imbalance-bar-container {
  margin-top: 12px;
}

.imbalance-bar {
  display: flex;
  height: 32px;
  border-radius: 6px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
}

.bid-bar,
.ask-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  transition: width 0.3s ease;
}

.bid-bar {
  background: linear-gradient(90deg, rgba(16, 235, 4, 0.7), rgba(16, 235, 4, 0.9));
}

.ask-bar {
  background: linear-gradient(90deg, rgba(255, 59, 48, 0.9), rgba(255, 59, 48, 0.7));
}

/* Wall Detection */
.walls-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.walls-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wall-header {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
}

.wall-header.bid {
  color: #10eb04;
  border-color: rgba(16, 235, 4, 0.3);
}

.wall-header.ask {
  color: #ff3b30;
  border-color: rgba(255, 59, 48, 0.3);
}

.no-walls {
  font-size: 11px;
  color: #666;
  font-style: italic;
  padding: 12px;
  text-align: center;
}

.wall-item {
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border-left: 3px solid;
}

.wall-item.bid {
  border-color: #10eb04;
}

.wall-item.ask {
  border-color: #ff3b30;
}

.wall-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.wall-price {
  font-size: 12px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: #e0e0e0;
}

.wall-size {
  font-size: 11px;
  color: #888;
}

.wall-bar {
  height: 6px;
  background: rgba(128, 128, 128, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.wall-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.wall-fill.bid {
  background: linear-gradient(90deg, rgba(16, 235, 4, 0.5), #10eb04);
}

.wall-fill.ask {
  background: linear-gradient(90deg, rgba(255, 59, 48, 0.5), #ff3b30);
}

.wall-distance {
  font-size: 10px;
  color: #666;
}

/* Liquidity Levels */
.liquidity-levels {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.level-row {
  display: grid;
  grid-template-columns: 60px 100px 100px 80px;
  gap: 12px;
  padding: 8px 12px;
  font-size: 11px;
  align-items: center;
}

.level-row.header {
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  background: rgba(0, 0, 0, 0.2);
}

.level-row:not(.header) {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.level-row .distance {
  color: #888;
}

.level-row .bid-depth {
  color: #10eb04;
  font-family: 'Courier New', monospace;
}

.level-row .ask-depth {
  color: #ff3b30;
  font-family: 'Courier New', monospace;
}

.level-row .ratio {
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

/* Spread Analysis */
.spread-analysis {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.spread-metric {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.metric-label {
  font-size: 11px;
  color: #888;
}

.metric-value {
  font-size: 13px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: #e0e0e0;
}

/* Order Flow */
.order-flow-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.flow-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.flow-label {
  font-size: 11px;
  color: #888;
  font-weight: 600;
  text-transform: uppercase;
}

.flow-value {
  font-size: 18px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

/* Price Levels */
.price-levels {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.price-level {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.level-label {
  font-size: 11px;
  color: #888;
  font-weight: 600;
  text-transform: uppercase;
}

.level-values {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  text-align: center;
}

.stat-box .stat-label {
  font-size: 10px;
  color: #888;
  text-transform: uppercase;
}

.stat-box .stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #e0e0e0;
}

/* Trading Signals */
.signals-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.no-signals {
  font-size: 12px;
  color: #666;
  font-style: italic;
  padding: 20px;
  text-align: center;
}

.signal-item {
  padding: 14px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border-left: 4px solid;
}

.signal-item.bullish {
  border-color: #10eb04;
  background: rgba(16, 235, 4, 0.05);
}

.signal-item.bearish {
  border-color: #ff3b30;
  background: rgba(255, 59, 48, 0.05);
}

.signal-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.signal-icon {
  font-size: 18px;
}

.signal-title {
  flex: 1;
  font-size: 13px;
  font-weight: 700;
  color: #e0e0e0;
}

.signal-description {
  font-size: 12px;
  color: #888;
  margin-bottom: 8px;
  line-height: 1.4;
}

.signal-details {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #666;
}

/* Market Conditions */
.conditions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.condition-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.condition-label {
  font-size: 11px;
  color: #888;
  font-weight: 600;
}

/* Smart Alerts */
.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alert-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border-left: 3px solid;
}

.alert-item.info {
  border-color: #6366f1;
}

.alert-item.warning {
  border-color: #ffa500;
}

.alert-item.success {
  border-color: #10eb04;
}

.alert-icon {
  font-size: 18px;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-size: 12px;
  font-weight: 700;
  color: #e0e0e0;
  margin-bottom: 4px;
}

.alert-message {
  font-size: 11px;
  color: #888;
  margin-bottom: 4px;
}

.alert-time {
  font-size: 10px;
  color: #666;
}

/* Responsive */
@media (max-width: 1000px) {
  .price-adjust-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .walls-container {
    grid-template-columns: 1fr;
  }

  .analysis-grid,
  .spread-analysis,
  .conditions-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
