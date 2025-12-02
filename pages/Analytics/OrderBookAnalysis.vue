<template>
  <div class="orderbook-analysis-container">
    <!-- Hidden OrderBook for data collection only -->
    <div style="display: none;">
      <OrderBook @update:orderbook="handleOrderBookUpdate" />
    </div>

    <n-grid x-gap="16" y-gap="16" :cols="1">
      <n-gi span="1">
        <n-tabs type="line" size="small" animated default-value="all">
          <!-- Complete Analysis List - 60+ Metrics in TABLE format -->
          <n-tab-pane name="all" tab="📊 All Metrics (60+)">
            <div class="metrics-table-container">
              <table class="metrics-table">
                <thead>
                  <tr>
                    <th style="width: 30px;">#</th>
                    <th style="width: 40px;">Icon</th>
                    <th style="width: 25%;">Metric</th>
                    <th style="width: 20%;">Value</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="metric in allMetrics" :key="metric.id" class="metric-row">
                    <td class="metric-id">{{ metric.id }}</td>
                    <td class="metric-icon-cell">{{ metric.icon }}</td>
                    <td class="metric-title-cell">{{ metric.title }}</td>
                    <td class="metric-value-cell" :class="metric.valueClass">{{ metric.value }}</td>
                    <td class="metric-desc-cell">{{ metric.description }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </n-tab-pane>

          <!-- Depth Analysis -->
          <n-tab-pane name="depth" tab="📊 Depth Analysis">
            <div class="compact-tab-content">
              <!-- Cumulative Depth Profile - Simple Table -->
              <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                  <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #e0e0e0;">📈 Cumulative Depth Profile (Top full)</h3>
                  <div style="display: flex; gap: 8px; align-items: center;">
                    <span style="font-size: 12px; color: #888;">Decimals:</span>
                    <n-button size="tiny" @click="priceDecimals = Math.max(1, priceDecimals - 1)" :disabled="priceDecimals <= 1">-</n-button>
                    <span style="font-size: 14px; font-weight: 600; color: #e0e0e0; min-width: 20px; text-align: center;">{{ priceDecimals }}</span>
                    <n-button size="tiny" @click="priceDecimals = Math.min(8, priceDecimals + 1)" :disabled="priceDecimals >= 8">+</n-button>
                  </div>
                </div>
                <div ref="depthScrollContainer" style="width: 600px; height: 500px; overflow-y: auto; scroll-behavior: smooth; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px;">
                  <table class="compact-table ultra-compact" style="margin-bottom: 0;">
                    <thead style="position: sticky; top: 0; background: rgba(0, 0, 0, 0.9); z-index: 10;">
                      <tr>
                        <th style="width: 12%;">Price</th>
                        <th style="width: 15%;">Vol</th>
                        <th style="width: 18%;">Cumulative Vol</th>
                        <th style="width: 8%;">Side</th>
                        <th style="width: 47%;">Visual</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(level, idx) in depthLevels"
                        :key="idx"
                        :ref="idx === midPriceIndex ? 'midPriceRow' : undefined"
                        :class="{ 'mid-price-separator': idx === midPriceIndex }"
                      >
                        <td class="price-cell" :class="level.side">{{ level.price }}</td>
                        <td class="value-cell">{{ level.volume }}</td>
                        <td class="value-cell">{{ level.cumulative }}</td>
                        <td><n-tag size="tiny" :type="level.side === 'bid' ? 'success' : 'error'" :bordered="false">{{ level.side }}</n-tag></td>
                        <td>
                          <div class="mini-bar-container">
                            <div class="mini-bar" :class="level.side" :style="{ width: (level.cumulative / maxCumulative * 100) + '%' }"></div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Depth Distribution - Collapsible -->
              <n-collapse default-expanded-names="['depth-distribution']">
                <n-collapse-item name="depth-distribution">
                  <template #header>
                    <div style="font-size: 15px; font-weight: 700;">📊 Depth Distribution by Range</div>
                  </template>
                  <div style="height: 500px; overflow-y: auto;">
                    <table class="compact-table" style="margin-bottom: 0;">
                      <thead style="position: sticky; top: 0; background: rgba(0, 0, 0, 0.9); z-index: 10;">
                        <tr>
                          <th style="width: 15%;">Range</th>
                          <th style="width: 20%;">Bid Volume</th>
                          <th style="width: 20%;">Ask Volume</th>
                          <th style="width: 15%;">% of Total</th>
                          <th style="width: 30%;">Distribution</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="dist in depthDistribution" :key="dist.range">
                          <td class="label-cell">{{ dist.range }}</td>
                          <td class="bid-cell">{{ dist.bidVolume }}</td>
                          <td class="ask-cell">{{ dist.askVolume }}</td>
                          <td class="value-cell">{{ dist.percent }}%</td>
                          <td>
                            <div class="split-bar">
                              <div class="split-segment bid" :style="{ width: dist.bidPercent + '%' }">{{ dist.bidPercent }}%</div>
                              <div class="split-segment ask" :style="{ width: dist.askPercent + '%' }">{{ dist.askPercent }}%</div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </n-collapse-item>
              </n-collapse>
            </div>
          </n-tab-pane>

          <!-- Wall Analysis -->
          <n-tab-pane name="walls" tab="🏰 Wall Analysis">
            <div class="compact-tab-content">
              <!-- Summary Stats -->
              <div class="stats-summary">
                <div class="stat-box bid">
                  <div class="stat-icon">🟢</div>
                  <div class="stat-info">
                    <div class="stat-label">Bid Walls</div>
                    <div class="stat-value">{{ bidWalls.length }}</div>
                    <div class="stat-detail">Strength: {{ bidWallStrength }}</div>
                  </div>
                </div>
                <div class="stat-box ask">
                  <div class="stat-icon">🔴</div>
                  <div class="stat-info">
                    <div class="stat-label">Ask Walls</div>
                    <div class="stat-value">{{ askWalls.length }}</div>
                    <div class="stat-detail">Strength: {{ askWallStrength }}</div>
                  </div>
                </div>
                <div class="stat-box neutral">
                  <div class="stat-icon">🎯</div>
                  <div class="stat-info">
                    <div class="stat-label">Bid Clusters</div>
                    <div class="stat-value">{{ bidClusters }}</div>
                    <div class="stat-detail">{{ bidClusterInfo }}</div>
                  </div>
                </div>
                <div class="stat-box neutral">
                  <div class="stat-icon">🎯</div>
                  <div class="stat-info">
                    <div class="stat-label">Ask Clusters</div>
                    <div class="stat-value">{{ askClusters }}</div>
                    <div class="stat-detail">{{ askClusterInfo }}</div>
                  </div>
                </div>
              </div>

              <!-- Bid Walls Table -->
              <div class="section-header">🟢 Detected Bid Walls (Size > 3x Avg)</div>
              <div v-if="bidWalls.length === 0" class="no-data-message">No significant bid walls detected</div>
              <table v-else class="compact-table">
                <thead>
                  <tr>
                    <th style="width: 15%;">Price</th>
                    <th style="width: 15%;">Size</th>
                    <th style="width: 12%;">Distance</th>
                    <th style="width: 12%;">Multiplier</th>
                    <th style="width: 10%;">Impact</th>
                    <th style="width: 36%;">Strength</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="wall in bidWalls" :key="wall.price">
                    <td class="price-cell bid">{{ wall.price }}</td>
                    <td class="value-cell">{{ wall.size }} {{ base }}</td>
                    <td class="distance-cell">-{{ wall.distance }}%</td>
                    <td class="value-cell">{{ wall.multiplier }}x</td>
                    <td><n-tag size="small" :type="wall.impact === 'High' ? 'error' : wall.impact === 'Medium' ? 'warning' : 'success'" :bordered="false">{{ wall.impact }}</n-tag></td>
                    <td>
                      <div class="strength-bar-container">
                        <div class="strength-bar bid" :style="{ width: wall.strength + '%' }">{{ wall.strength }}%</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Ask Walls Table -->
              <div class="section-header">🔴 Detected Ask Walls (Size > 3x Avg)</div>
              <div v-if="askWalls.length === 0" class="no-data-message">No significant ask walls detected</div>
              <table v-else class="compact-table">
                <thead>
                  <tr>
                    <th style="width: 15%;">Price</th>
                    <th style="width: 15%;">Size</th>
                    <th style="width: 12%;">Distance</th>
                    <th style="width: 12%;">Multiplier</th>
                    <th style="width: 10%;">Impact</th>
                    <th style="width: 36%;">Strength</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="wall in askWalls" :key="wall.price">
                    <td class="price-cell ask">{{ wall.price }}</td>
                    <td class="value-cell">{{ wall.size }} {{ base }}</td>
                    <td class="distance-cell">+{{ wall.distance }}%</td>
                    <td class="value-cell">{{ wall.multiplier }}x</td>
                    <td><n-tag size="small" :type="wall.impact === 'High' ? 'error' : wall.impact === 'Medium' ? 'warning' : 'success'" :bordered="false">{{ wall.impact }}</n-tag></td>
                    <td>
                      <div class="strength-bar-container">
                        <div class="strength-bar ask" :style="{ width: wall.strength + '%' }">{{ wall.strength }}%</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </n-tab-pane>

          <!-- Liquidity Analysis -->
          <n-tab-pane name="liquidity" tab="💧 Liquidity">
            <div class="compact-tab-content">
              <!-- Liquidity Scores -->
              <div class="stats-summary">
                <div class="stat-box success">
                  <div class="stat-icon">💧</div>
                  <div class="stat-info">
                    <div class="stat-label">Liquidity Score</div>
                    <div class="stat-value">{{ liquidityScore }}/10</div>
                    <n-progress type="line" :percentage="liquidityScore * 10" :color="getLiquidityColor(liquidityScore)" :show-indicator="false" />
                  </div>
                </div>
                <div class="stat-box neutral">
                  <div class="stat-icon">📊</div>
                  <div class="stat-info">
                    <div class="stat-label">Market Depth</div>
                    <div class="stat-value">{{ marketDepth }}</div>
                    <div class="stat-detail">Full orderbook</div>
                  </div>
                </div>
                <div class="stat-box neutral">
                  <div class="stat-icon">📦</div>
                  <div class="stat-info">
                    <div class="stat-label">Avg Order Size</div>
                    <div class="stat-value">{{ avgOrderSize }}</div>
                    <div class="stat-detail">{{ base }}</div>
                  </div>
                </div>
                <div class="stat-box neutral">
                  <div class="stat-icon">🔢</div>
                  <div class="stat-info">
                    <div class="stat-label">Density Score</div>
                    <div class="stat-value">{{ densityScore }}/10</div>
                    <div class="stat-detail">Order density</div>
                  </div>
                </div>
              </div>

              <!-- Liquidity at Different Levels -->
              <div class="section-header">💧 Liquidity at Different Price Levels</div>
              <table class="compact-table">
                <thead>
                  <tr>
                    <th style="width: 10%;">Distance</th>
                    <th style="width: 12%;">Bid Price</th>
                    <th style="width: 16%;">Bid Depth</th>
                    <th style="width: 12%;">Ask Price</th>
                    <th style="width: 16%;">Ask Depth</th>
                    <th style="width: 16%;">Total</th>
                    <th style="width: 18%;">Imbalance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="level in liquidityLevels" :key="level.distance">
                    <td class="label-cell">{{ level.distance }}%</td>
                    <td class="price-cell bid">{{ level.bidPrice }}</td>
                    <td class="bid-cell">{{ level.bidDepth }}</td>
                    <td class="price-cell ask">{{ level.askPrice }}</td>
                    <td class="ask-cell">{{ level.askDepth }}</td>
                    <td class="value-cell">{{ level.total }}</td>
                    <td>
                      <div class="imbalance-indicator">
                        <n-tag size="small" :type="level.imbalanceClass === 'bid' ? 'success' : level.imbalanceClass === 'ask' ? 'error' : 'warning'" :bordered="false">{{ level.imbalance }}%</n-tag>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Slippage Estimator -->
              <div class="section-header">💱 Slippage Estimator</div>
              <div class="slippage-tool">
                <div class="slippage-input-row">
                  <label>Order Size ({{ quote }}):</label>
                  <n-input-number v-model:value="slippageOrderSize" :min="0" :step="100" size="small" style="width: 180px;" />
                </div>
                <table class="compact-table">
                  <thead>
                    <tr>
                      <th style="width: 30%;">Metric</th>
                      <th style="width: 35%;">Buy</th>
                      <th style="width: 35%;">Sell</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="label-cell">Slippage</td>
                      <td class="ask-cell">{{ buySlippage }}%</td>
                      <td class="bid-cell">{{ sellSlippage }}%</td>
                    </tr>
                    <tr>
                      <td class="label-cell">Avg Fill Price</td>
                      <td class="value-cell">{{ avgBuyPrice }}</td>
                      <td class="value-cell">{{ avgSellPrice }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </n-tab-pane>

          <!-- Imbalance Analysis -->
          <n-tab-pane name="imbalance" tab="⚖️ Imbalance">
            <div class="compact-tab-content">
              <!-- Overall Stats -->
              <div class="stats-summary">
                <div class="stat-box" :class="imbalanceClass">
                  <div class="stat-icon">⚖️</div>
                  <div class="stat-info">
                    <div class="stat-label">Imbalance Ratio</div>
                    <div class="stat-value">{{ imbalanceRatio }}%</div>
                    <div class="stat-detail">{{ bidPercent }}% Bid / {{ askPercent }}% Ask</div>
                  </div>
                </div>
                <div class="stat-box" :class="biasClass">
                  <div class="stat-icon">🎯</div>
                  <div class="stat-info">
                    <div class="stat-label">Market Bias</div>
                    <div class="stat-value">{{ marketBias }}</div>
                    <div class="stat-detail">Overall direction</div>
                  </div>
                </div>
                <div class="stat-box neutral">
                  <div class="stat-icon">💪</div>
                  <div class="stat-info">
                    <div class="stat-label">Pressure Index</div>
                    <div class="stat-value">{{ pressureIndex }}</div>
                    <div class="stat-detail">Intensity measure</div>
                  </div>
                </div>
                <div class="stat-box neutral">
                  <div class="stat-icon">📊</div>
                  <div class="stat-info">
                    <div class="stat-label">Avg Imbalance</div>
                    <div class="stat-value">{{ avgImbalance }}%</div>
                    <div class="stat-detail">Volatility: {{ imbalanceVolatility }}</div>
                  </div>
                </div>
              </div>

              <!-- Visual Imbalance Bar -->
              <div class="section-header">⚖️ Order Book Balance</div>
              <div class="visual-balance-bar">
                <div class="balance-labels">
                  <span class="bid">Bid {{ bidPercent }}%</span>
                  <span class="ask">Ask {{ askPercent }}%</span>
                </div>
                <div class="balance-bar">
                  <div class="balance-segment bid" :style="{ width: bidPercent + '%' }">
                    <span v-if="bidPercent > 15">{{ bidVolume }}</span>
                  </div>
                  <div class="balance-segment ask" :style="{ width: askPercent + '%' }">
                    <span v-if="askPercent > 15">{{ askVolume }}</span>
                  </div>
                </div>
              </div>

              <!-- Imbalance by Price Level -->
              <div class="section-header">📊 Imbalance by Price Level</div>
              <table class="compact-table">
                <thead>
                  <tr>
                    <th style="width: 15%;">Distance</th>
                    <th style="width: 20%;">Bid Volume</th>
                    <th style="width: 20%;">Ask Volume</th>
                    <th style="width: 15%;">Ratio</th>
                    <th style="width: 30%;">Visual</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="level in imbalanceByLevel" :key="level.distance">
                    <td class="label-cell">{{ level.distance }}%</td>
                    <td class="bid-cell">{{ level.bidVol }}</td>
                    <td class="ask-cell">{{ level.askVol }}</td>
                    <td>
                      <n-tag size="small" :type="level.ratioClass === 'bid' ? 'success' : level.ratioClass === 'ask' ? 'error' : 'warning'" :bordered="false">{{ level.ratio }}%</n-tag>
                    </td>
                    <td>
                      <div class="mini-bar-container">
                        <div class="mini-bar" :class="level.ratioClass" :style="{ width: Math.abs(level.ratio) + '%' }"></div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Trend Chart -->
              <div class="section-header">📈 Imbalance Trend (Last 20 Updates)</div>
              <div class="trend-chart-container">
                <div class="trend-bars">
                  <div v-for="(point, idx) in imbalanceTrend" :key="idx" class="trend-column">
                    <div class="trend-bar-wrapper">
                      <div class="trend-bar" :class="point.value > 0 ? 'bid' : 'ask'" :style="{ height: Math.abs(point.value) + '%' }"></div>
                    </div>
                    <span class="trend-label">{{ point.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </n-tab-pane>

          <!-- Microstructure -->
          <n-tab-pane name="microstructure" tab="🔬 Microstructure">
            <div class="compact-tab-content">
              <!-- Spread Metrics -->
              <div class="section-header">📏 Spread Analysis</div>
              <table class="compact-table">
                <thead>
                  <tr>
                    <th style="width: 30%;">Metric</th>
                    <th style="width: 25%;">Value</th>
                    <th style="width: 45%;">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="label-cell">Current Spread</td>
                    <td class="value-cell" :class="spreadClass">{{ spread }}%</td>
                    <td class="desc-cell">Bid-ask percentage spread</td>
                  </tr>
                  <tr>
                    <td class="label-cell">Spread (Absolute)</td>
                    <td class="value-cell">{{ spreadAbs }}</td>
                    <td class="desc-cell">Absolute price difference</td>
                  </tr>
                  <tr>
                    <td class="label-cell">Avg Spread (10 lvl)</td>
                    <td class="value-cell">{{ avgSpread }}%</td>
                    <td class="desc-cell">Average across 10 levels</td>
                  </tr>
                  <tr>
                    <td class="label-cell">Tick Size</td>
                    <td class="value-cell">{{ tickSize }}</td>
                    <td class="desc-cell">Minimum price increment</td>
                  </tr>
                  <tr>
                    <td class="label-cell">Spread Type</td>
                    <td><n-tag size="small" :type="spreadTypeClass === 'bid' ? 'success' : spreadTypeClass === 'ask' ? 'error' : 'warning'" :bordered="false">{{ spreadType }}</n-tag></td>
                    <td class="desc-cell">Spread classification</td>
                  </tr>
                  <tr>
                    <td class="label-cell">Bid-Ask Bounce</td>
                    <td class="value-cell">{{ bidAskBounce }}</td>
                    <td class="desc-cell">Price volatility indicator</td>
                  </tr>
                </tbody>
              </table>

              <!-- Order Size Distribution -->
              <div class="section-header">📊 Order Size Distribution</div>
              <table class="compact-table">
                <thead>
                  <tr>
                    <th style="width: 15%;">Size Range</th>
                    <th style="width: 15%;">Total Orders</th>
                    <th style="width: 15%;">Bid Orders</th>
                    <th style="width: 15%;">Ask Orders</th>
                    <th style="width: 40%;">Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="bucket in sizeDistribution" :key="bucket.range">
                    <td class="label-cell">{{ bucket.range }}</td>
                    <td class="value-cell">{{ bucket.count }}</td>
                    <td class="bid-cell">{{ bucket.bidCount }}</td>
                    <td class="ask-cell">{{ bucket.askCount }}</td>
                    <td>
                      <div class="split-bar">
                        <div class="split-segment bid" :style="{ width: bucket.bidPercent + '%' }">{{ bucket.bidPercent }}%</div>
                        <div class="split-segment ask" :style="{ width: bucket.askPercent + '%' }">{{ bucket.askPercent }}%</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Price Level Statistics -->
              <div class="section-header">📍 Price Level Statistics</div>
              <div class="stats-grid-compact">
                <div class="stat-item">
                  <span class="stat-label">Total Bid Levels</span>
                  <span class="stat-value bid">{{ totalBidLevels }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Total Ask Levels</span>
                  <span class="stat-value ask">{{ totalAskLevels }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Avg Bid Size</span>
                  <span class="stat-value">{{ avgBidSize }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Avg Ask Size</span>
                  <span class="stat-value">{{ avgAskSize }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Max Bid Order</span>
                  <span class="stat-value">{{ maxBidOrder }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Max Ask Order</span>
                  <span class="stat-value">{{ maxAskOrder }}</span>
                </div>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </n-gi>
    </n-grid>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useAppStore } from '~/stores/app.store';
import OrderBook from '~/components/order-book.vue';

const app = useAppStore();

// Reactive Data
const orderBookData = ref(null);
const bestBid = ref(null);
const bestAsk = ref(null);
const bidVolume = ref('0');
const askVolume = ref('0');
const slippageOrderSize = ref(1000);
const imbalanceTrend = ref([]);

// Scroll Container Ref
const depthScrollContainer = ref(null);
const midPriceRow = ref(null);
const hasAutoScrolled = ref(false); // Track if we've already scrolled once
const priceDecimals = ref(4); // Price precision control (decimals)

// Symbol info
const base = computed(() => app.getUserSelectedMarket?.split('/')[0] || 'LCX');
const quote = computed(() => app.getUserSelectedMarket?.split('/')[1] || 'USD');

// Mid Price & Spread
const midPrice = computed(() => {
  if (!bestBid.value || !bestAsk.value) return null;
  return ((parseFloat(bestBid.value) + parseFloat(bestAsk.value)) / 2).toFixed(4);
});

const spread = computed(() => {
  if (!bestBid.value || !bestAsk.value) return '0.00';
  return (((parseFloat(bestAsk.value) - parseFloat(bestBid.value)) / parseFloat(bestBid.value)) * 100).toFixed(4);
});

const spreadAbs = computed(() => {
  if (!bestBid.value || !bestAsk.value) return '0.00';
  return (parseFloat(bestAsk.value) - parseFloat(bestBid.value)).toFixed(4);
});

const spreadClass = computed(() => {
  const s = parseFloat(spread.value);
  if (s < 0.1) return 'tight';
  if (s > 0.5) return 'wide';
  return 'normal';
});

// Imbalance Calculations
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
  if (ratio > 20) return 'Very Bullish';
  if (ratio > 10) return 'Bullish';
  if (ratio < -20) return 'Very Bearish';
  if (ratio < -10) return 'Bearish';
  return 'Neutral';
});

const pressureIndex = computed(() => {
  return Math.abs(bidPercent.value - 50).toFixed(1);
});

// Walls Analysis
const bidWalls = ref([]);
const askWalls = ref([]);

const bidWallStrength = computed(() => {
  return bidWalls.value.reduce((sum, wall) => sum + wall.strength, 0).toFixed(0);
});

const askWallStrength = computed(() => {
  return askWalls.value.reduce((sum, wall) => sum + wall.strength, 0).toFixed(0);
});

const bidClusters = ref(0);
const askClusters = ref(0);
const bidClusterInfo = ref('');
const askClusterInfo = ref('');

// Liquidity Analysis
const liquidityLevels = ref([]);
const liquidityScore = ref(0);
const marketDepth = ref('0');
const avgOrderSize = ref('0');
const densityScore = ref(0);

// Depth Analysis
const depthLevels = ref([]);
const maxCumulative = ref(1);
const depthDistribution = ref([]);
const midPriceIndex = ref(0); // Dynamic index for mid-price separator

// Microstructure
const avgSpread = ref('0.00');
const tickSize = ref('0.0001');
const spreadType = ref('Normal');
const spreadTypeClass = ref('normal');
const bidAskBounce = ref('0');
const sizeDistribution = ref([]);
const totalBidLevels = ref(0);
const totalAskLevels = ref(0);
const avgBidSize = ref('0');
const avgAskSize = ref('0');
const maxBidOrder = ref('0');
const maxAskOrder = ref('0');

// Slippage
const buySlippage = ref('0.00');
const sellSlippage = ref('0.00');
const avgBuyPrice = ref('0');
const avgSellPrice = ref('0');

// Imbalance by Level
const imbalanceByLevel = ref([]);
const avgImbalance = ref('0');
const imbalanceVolatility = ref('Low');

// Computed: All Metrics (50+ analyses)
const allMetrics = computed(() => {
  const bids = orderBookData.value?.bids || [];
  const asks = orderBookData.value?.asks || [];
  const mid = parseFloat(midPrice.value) || 0;

  return [
    // 1-10: Basic Metrics
    { id: 1, icon: '📊', title: 'Best Bid', value: bestBid.value || '-', description: 'Highest buy order price', valueClass: 'bid' },
    { id: 2, icon: '📊', title: 'Best Ask', value: bestAsk.value || '-', description: 'Lowest sell order price', valueClass: 'ask' },
    { id: 3, icon: '💰', title: 'Mid Price', value: midPrice.value || '-', description: 'Average of best bid and ask', valueClass: 'mid' },
    { id: 4, icon: '📏', title: 'Spread', value: `${spread.value}%`, description: 'Bid-Ask spread percentage', valueClass: spreadClass.value },
    { id: 5, icon: '📉', title: 'Spread (Absolute)', value: spreadAbs.value, description: 'Absolute price difference', valueClass: 'neutral' },
    { id: 6, icon: '📊', title: 'Total Bid Volume', value: bidVolume.value, description: 'Sum of all bid orders', valueClass: 'bid' },
    { id: 7, icon: '📊', title: 'Total Ask Volume', value: askVolume.value, description: 'Sum of all ask orders', valueClass: 'ask' },
    { id: 8, icon: '📚', title: 'Book Depth (Bids)', value: totalBidLevels.value, description: 'Number of bid price levels', valueClass: 'neutral' },
    { id: 9, icon: '📚', title: 'Book Depth (Asks)', value: totalAskLevels.value, description: 'Number of ask price levels', valueClass: 'neutral' },
    { id: 10, icon: '📖', title: 'Total Depth', value: Math.max(totalBidLevels.value, totalAskLevels.value), description: 'Maximum orderbook depth', valueClass: 'neutral' },

    // 11-20: Imbalance Metrics
    { id: 11, icon: '⚖️', title: 'Order Imbalance', value: `${imbalanceRatio.value}%`, description: 'Bid/Ask volume imbalance', valueClass: imbalanceClass.value },
    { id: 12, icon: '📊', title: 'Bid Percentage', value: `${bidPercent.value}%`, description: 'Bid volume as % of total', valueClass: 'bid' },
    { id: 13, icon: '📊', title: 'Ask Percentage', value: `${askPercent.value}%`, description: 'Ask volume as % of total', valueClass: 'ask' },
    { id: 14, icon: '🎯', title: 'Market Bias', value: marketBias.value, description: 'Overall market direction', valueClass: biasClass.value },
    { id: 15, icon: '💪', title: 'Pressure Index', value: pressureIndex.value, description: 'Market pressure intensity', valueClass: 'neutral' },
    { id: 16, icon: '📈', title: 'Buy Pressure', value: `${buyPressure.value}%`, description: 'Buying pressure percentage', valueClass: 'bid' },
    { id: 17, icon: '📉', title: 'Sell Pressure', value: `${sellPressure.value}%`, description: 'Selling pressure percentage', valueClass: 'ask' },
    { id: 18, icon: '🌊', title: 'Net Flow', value: netFlow.value, description: 'Net order flow direction', valueClass: netFlowClass.value },
    { id: 19, icon: '📊', title: 'Avg Imbalance', value: `${avgImbalance.value}%`, description: 'Average imbalance across levels', valueClass: 'neutral' },
    { id: 20, icon: '📉', title: 'Imbalance Volatility', value: imbalanceVolatility.value, description: 'Imbalance stability measure', valueClass: 'neutral' },

    // 21-30: Wall Detection
    { id: 21, icon: '🏰', title: 'Bid Walls Count', value: bidWalls.value.length, description: 'Number of detected bid walls', valueClass: 'bid' },
    { id: 22, icon: '🏰', title: 'Ask Walls Count', value: askWalls.value.length, description: 'Number of detected ask walls', valueClass: 'ask' },
    { id: 23, icon: '💪', title: 'Bid Wall Strength', value: bidWallStrength.value, description: 'Total bid wall power', valueClass: 'bid' },
    { id: 24, icon: '💪', title: 'Ask Wall Strength', value: askWallStrength.value, description: 'Total ask wall power', valueClass: 'ask' },
    { id: 25, icon: '🎯', title: 'Wall Clusters (Bid)', value: `${bidClusters.value} zones`, description: bidClusterInfo.value, valueClass: 'bid' },
    { id: 26, icon: '🎯', title: 'Wall Clusters (Ask)', value: `${askClusters.value} zones`, description: askClusterInfo.value, valueClass: 'ask' },
    { id: 27, icon: '🏔️', title: 'Largest Bid Wall', value: bidWalls.value[0]?.size || '0', description: 'Biggest buy order detected', valueClass: 'bid' },
    { id: 28, icon: '🏔️', title: 'Largest Ask Wall', value: askWalls.value[0]?.size || '0', description: 'Biggest sell order detected', valueClass: 'ask' },
    { id: 29, icon: '📍', title: 'Closest Bid Wall', value: bidWalls.value[0]?.distance ? `${bidWalls.value[0].distance}%` : '-', description: 'Distance to nearest bid wall', valueClass: 'bid' },
    { id: 30, icon: '📍', title: 'Closest Ask Wall', value: askWalls.value[0]?.distance ? `${askWalls.value[0].distance}%` : '-', description: 'Distance to nearest ask wall', valueClass: 'ask' },

    // 31-40: Liquidity Metrics
    { id: 31, icon: '💧', title: 'Liquidity Score', value: `${liquidityScore.value}/10`, description: 'Overall liquidity rating', valueClass: getLiquidityColor(liquidityScore.value) === '#10eb04' ? 'bid' : 'ask' },
    { id: 32, icon: '📊', title: 'Market Depth', value: marketDepth.value, description: 'Total market depth', valueClass: 'neutral' },
    { id: 33, icon: '📦', title: 'Avg Order Size', value: avgOrderSize.value, description: 'Average order volume', valueClass: 'neutral' },
    { id: 34, icon: '📊', title: 'Avg Bid Size', value: avgBidSize.value, description: 'Average bid order size', valueClass: 'bid' },
    { id: 35, icon: '📊', title: 'Avg Ask Size', value: avgAskSize.value, description: 'Average ask order size', valueClass: 'ask' },
    { id: 36, icon: '🔢', title: 'Density Score', value: `${densityScore.value}/10`, description: 'Order book density rating', valueClass: 'neutral' },
    { id: 37, icon: '💰', title: 'Liquidity @0.5%', value: liquidityLevels.value[0]?.total || '0', description: 'Total liquidity within 0.5%', valueClass: 'neutral' },
    { id: 38, icon: '💰', title: 'Liquidity @1%', value: liquidityLevels.value[1]?.total || '0', description: 'Total liquidity within 1%', valueClass: 'neutral' },
    { id: 39, icon: '💰', title: 'Liquidity @2%', value: liquidityLevels.value[2]?.total || '0', description: 'Total liquidity within 2%', valueClass: 'neutral' },
    { id: 40, icon: '💰', title: 'Liquidity @5%', value: liquidityLevels.value[4]?.total || '0', description: 'Total liquidity within 5%', valueClass: 'neutral' },

    // 41-50: Advanced Metrics
    { id: 41, icon: '📏', title: 'Avg Spread (10 lvl)', value: `${avgSpread.value}%`, description: 'Average spread across 10 levels', valueClass: 'neutral' },
    { id: 42, icon: '📐', title: 'Tick Size', value: tickSize.value, description: 'Minimum price increment', valueClass: 'neutral' },
    { id: 43, icon: '🎯', title: 'Spread Type', value: spreadType.value, description: 'Spread classification', valueClass: spreadTypeClass.value },
    { id: 44, icon: '📊', title: 'Bid-Ask Bounce', value: bidAskBounce.value, description: 'Price volatility indicator', valueClass: 'neutral' },
    { id: 45, icon: '🔥', title: 'Volatility', value: `${volatility.value}%`, description: 'Market volatility measure', valueClass: volatilityClass.value },
    { id: 46, icon: '🏦', title: 'Max Bid Order', value: maxBidOrder.value, description: 'Largest single bid order', valueClass: 'bid' },
    { id: 47, icon: '🏦', title: 'Max Ask Order', value: maxAskOrder.value, description: 'Largest single ask order', valueClass: 'ask' },
    { id: 48, icon: '⏱️', title: 'Update Rate', value: `${updateRate.value}/s`, description: 'OrderBook update frequency', valueClass: 'neutral' },
    { id: 49, icon: '🎯', title: 'Market State', value: marketState.value, description: 'Current market condition', valueClass: marketStateType.value === 'success' ? 'bid' : 'ask' },
    { id: 50, icon: '📈', title: 'Trend', value: trend.value, description: 'Market trend direction', valueClass: trendType.value === 'success' ? 'bid' : 'ask' },

    // 51-60: Trading Signals & Analysis
    { id: 51, icon: '🚀', title: 'Momentum', value: momentum.value, description: 'Market momentum strength', valueClass: momentumType.value === 'success' ? 'bid' : 'ask' },
    { id: 52, icon: '💡', title: 'Recommended Action', value: recommendedAction.value, description: 'Trading recommendation', valueClass: actionType.value === 'success' ? 'bid' : 'ask' },
    { id: 53, icon: '⚡', title: 'Active Signals', value: activeSignals.value.length, description: 'Number of trading signals', valueClass: 'neutral' },
    { id: 54, icon: '🎯', title: 'Strong Signals', value: activeSignals.value.filter(s => s.strength === 'strong').length, description: 'High confidence signals', valueClass: 'neutral' },
    { id: 55, icon: '📍', title: 'Support Levels', value: supportLevels.value.length, description: 'Detected support zones', valueClass: 'bid' },
    { id: 56, icon: '📍', title: 'Resistance Levels', value: resistanceLevels.value.length, description: 'Detected resistance zones', valueClass: 'ask' },
    { id: 57, icon: '💱', title: 'Buy Slippage', value: `${buySlippage.value}%`, description: `For ${slippageOrderSize.value} ${quote.value}`, valueClass: 'ask' },
    { id: 58, icon: '💱', title: 'Sell Slippage', value: `${sellSlippage.value}%`, description: `For ${slippageOrderSize.value} ${quote.value}`, valueClass: 'bid' },
    { id: 59, icon: '💵', title: 'Avg Buy Price', value: avgBuyPrice.value, description: 'Average fill price (buy)', valueClass: 'ask' },
    { id: 60, icon: '💵', title: 'Avg Sell Price', value: avgSellPrice.value, description: 'Average fill price (sell)', valueClass: 'bid' },
  ];
});

// Handle OrderBook Update
const handleOrderBookUpdate = (data) => {
  if (data && data.bids && data.asks) {
    orderBookData.value = data;
    bestBid.value = data.bids[0]?.[0] || null;
    bestAsk.value = data.asks[0]?.[0] || null;

    // Run all analysis functions
    calculateVolumes();
    detectWalls();
    calculateLiquidityLevels();
    calculateDepthAnalysis();
    calculateMicrostructure();
    calculateImbalanceByLevel();
    updateImbalanceTrend();
  }
};

// Calculate Volumes
const calculateVolumes = () => {
  if (!orderBookData.value) return;

  const bids = orderBookData.value.bids || [];
  const asks = orderBookData.value.asks || [];

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
};

// Detect Walls
const detectWalls = () => {
  if (!orderBookData.value) return;

  const bids = orderBookData.value.bids || [];
  const asks = orderBookData.value.asks || [];
  const mid = parseFloat(midPrice.value) || 0;

  // Calculate averages
  const avgBidVol = bids.reduce((sum, bid) => sum + parseFloat(bid[1]), 0) / bids.length;
  const avgAskVol = asks.reduce((sum, ask) => sum + parseFloat(ask[1]), 0) / asks.length;

  const wallThreshold = 3;

  // Detect ALL bid walls (no limit)
  const detectedBidWalls = [];
  bids.forEach((bid) => {
    const price = parseFloat(bid[0]);
    const size = parseFloat(bid[1]);

    if (size > avgBidVol * wallThreshold) {
      const distance = ((mid - price) / mid * 100).toFixed(2);
      const multiplier = (size / avgBidVol).toFixed(1);
      const strength = Math.min((size / avgBidVol / wallThreshold) * 100, 100);

      let impact = 'Low';
      if (multiplier > 5) impact = 'High';
      else if (multiplier > 4) impact = 'Medium';

      detectedBidWalls.push({
        price: price.toFixed(4),
        size: size.toFixed(2),
        distance,
        multiplier,
        strength: Math.round(strength),
        impact
      });
    }
  });

  // Detect ALL ask walls (no limit)
  const detectedAskWalls = [];
  asks.forEach((ask) => {
    const price = parseFloat(ask[0]);
    const size = parseFloat(ask[1]);

    if (size > avgAskVol * wallThreshold) {
      const distance = ((price - mid) / mid * 100).toFixed(2);
      const multiplier = (size / avgAskVol).toFixed(1);
      const strength = Math.min((size / avgAskVol / wallThreshold) * 100, 100);

      let impact = 'Low';
      if (multiplier > 5) impact = 'High';
      else if (multiplier > 4) impact = 'Medium';

      detectedAskWalls.push({
        price: price.toFixed(4),
        size: size.toFixed(2),
        distance,
        multiplier,
        strength: Math.round(strength),
        impact
      });
    }
  });

  bidWalls.value = detectedBidWalls;
  askWalls.value = detectedAskWalls;

  // Calculate clusters
  bidClusters.value = calculateClusters(detectedBidWalls);
  askClusters.value = calculateClusters(detectedAskWalls);

  bidClusterInfo.value = bidClusters.value > 0 ? `Strong support clustering` : `Scattered support`;
  askClusterInfo.value = askClusters.value > 0 ? `Strong resistance clustering` : `Scattered resistance`;
};

const calculateClusters = (walls) => {
  if (walls.length < 2) return 0;

  let clusters = 0;
  for (let i = 1; i < walls.length; i++) {
    const priceDiff = Math.abs(parseFloat(walls[i].distance) - parseFloat(walls[i-1].distance));
    if (priceDiff < 0.5) clusters++;
  }
  return clusters;
};

const getImpactClass = (impact) => {
  if (impact === 'High') return 'impact-high';
  if (impact === 'Medium') return 'impact-medium';
  return 'impact-low';
};

// Calculate Liquidity Levels
const calculateLiquidityLevels = () => {
  if (!orderBookData.value) return;

  const bids = orderBookData.value.bids || [];
  const asks = orderBookData.value.asks || [];
  const mid = parseFloat(midPrice.value) || 0;

  // Full range of distances to analyze entire orderbook
  const distances = [0.5, 1, 2, 3, 5, 10, 15, 20, 25, 50, 75, 100];
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

    const total = bidDepth + askDepth;
    const imbalance = total > 0 ? (((bidDepth - askDepth) / total) * 100).toFixed(1) : '0.0';
    const imbalanceClass = parseFloat(imbalance) > 10 ? 'bid' : parseFloat(imbalance) < -10 ? 'ask' : 'neutral';

    levels.push({
      distance: dist,
      bidPrice: lowerBound.toFixed(4),
      askPrice: upperBound.toFixed(4),
      bidDepth: bidDepth.toFixed(2),
      askDepth: askDepth.toFixed(2),
      total: total.toFixed(2),
      imbalance,
      imbalanceClass
    });
  });

  liquidityLevels.value = levels;

  // Calculate liquidity score
  let score = 5;
  const spreadVal = parseFloat(spread.value);
  if (spreadVal < 0.1) score += 3;
  else if (spreadVal < 0.3) score += 2;
  else if (spreadVal < 0.5) score += 1;

  if (bids.length > 50) score += 2;
  else if (bids.length > 20) score += 1;

  liquidityScore.value = Math.min(score, 10);
  marketDepth.value = Math.max(bids.length, asks.length).toString();

  const totalOrders = bids.length + asks.length;
  const totalVol = parseFloat(bidVolume.value) + parseFloat(askVolume.value);
  avgOrderSize.value = totalOrders > 0 ? (totalVol / totalOrders).toFixed(2) : '0';

  densityScore.value = Math.min(Math.round(totalOrders / 10), 10);
};

const getLiquidityColor = (score) => {
  if (score >= 8) return '#10eb04';
  if (score >= 5) return '#ffa500';
  return '#ff3b30';
};

// Calculate Depth Analysis
const calculateDepthAnalysis = () => {
  if (!orderBookData.value) return;

  const bids = orderBookData.value.bids || [];
  const asks = orderBookData.value.asks || [];

  // Build cumulative depth levels - SEPARATE bid and ask arrays
  const bidLevels = [];
  const askLevels = [];

  // Asks - Aggregate by price level (group by rounded price)
  const askMap = new Map();
  asks.forEach((ask) => {
    const price = parseFloat(ask[0]);
    const volume = parseFloat(ask[1]);
    const roundedPrice = parseFloat(price.toFixed(priceDecimals.value));

    if (askMap.has(roundedPrice)) {
      askMap.set(roundedPrice, askMap.get(roundedPrice) + volume);
    } else {
      askMap.set(roundedPrice, volume);
    }
  });

  // Convert map to array and sort DESCENDING
  askMap.forEach((volume, price) => {
    askLevels.push({ price, volume, side: 'ask' });
  });
  askLevels.sort((a, b) => b.price - a.price);

  // Calculate cumulative from BOTTOM to TOP (backwards - last element to first)
  let askCumulative = 0;
  for (let i = askLevels.length - 1; i >= 0; i--) {
    const volumeNum = askLevels[i].volume;
    askCumulative += volumeNum;
    askLevels[i].price = askLevels[i].price.toFixed(priceDecimals.value);
    askLevels[i].volume = volumeNum.toFixed(2);
    askLevels[i].cumulative = askCumulative.toFixed(2);
  }

  // Bids - Aggregate by price level (group by rounded price)
  const bidMap = new Map();
  bids.forEach((bid) => {
    const price = parseFloat(bid[0]);
    const volume = parseFloat(bid[1]);
    const roundedPrice = parseFloat(price.toFixed(priceDecimals.value));

    if (bidMap.has(roundedPrice)) {
      bidMap.set(roundedPrice, bidMap.get(roundedPrice) + volume);
    } else {
      bidMap.set(roundedPrice, volume);
    }
  });

  // Convert map to array and sort DESCENDING
  bidMap.forEach((volume, price) => {
    bidLevels.push({ price, volume, side: 'bid' });
  });
  bidLevels.sort((a, b) => b.price - a.price);

  // Calculate cumulative from top to bottom (first row to last row)
  let bidCumulative = 0;
  for (let i = 0; i < bidLevels.length; i++) {
    const volumeNum = bidLevels[i].volume;
    bidCumulative += volumeNum; // Accumulate: starts small, grows as we go down
    bidLevels[i].price = bidLevels[i].price.toFixed(priceDecimals.value);
    bidLevels[i].volume = volumeNum.toFixed(2);
    bidLevels[i].cumulative = bidCumulative.toFixed(2);
  }

  // Combine: asks first (on top), then bids (below)
  // Asks: high price → low price (cumulative ascending)
  // Bids: high price → low price (cumulative ascending)
  depthLevels.value = [...askLevels, ...bidLevels];
  maxCumulative.value = Math.max(bidCumulative, askCumulative);

  // Calculate dynamic mid-price index (transition point between asks and bids)
  midPriceIndex.value = askLevels.length; // First bid index (right after last ask)

  // Auto-scroll to middle ONLY ONCE (transition point between asks and bids)
  if (!hasAutoScrolled.value) {
    nextTick(() => {
      if (depthScrollContainer.value && midPriceRow.value) {
        const row = Array.isArray(midPriceRow.value) ? midPriceRow.value[0] : midPriceRow.value;
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          hasAutoScrolled.value = true; // Mark as scrolled, won't auto-scroll again
        }
      }
    });
  }

  // Calculate depth distribution
  const mid = parseFloat(midPrice.value) || 0;
  const ranges = [
    { range: '0-0.5%', min: 0, max: 0.5 },
    { range: '0.5-1%', min: 0.5, max: 1 },
    { range: '1-2%', min: 1, max: 2 },
    { range: '2-5%', min: 2, max: 5 },
  ];

  const distribution = ranges.map(r => {
    let bidVol = 0;
    let askVol = 0;

    bids.forEach(bid => {
      const price = parseFloat(bid[0]);
      const distPercent = ((mid - price) / mid * 100);
      if (distPercent >= r.min && distPercent < r.max) {
        bidVol += parseFloat(bid[1]);
      }
    });

    asks.forEach(ask => {
      const price = parseFloat(ask[0]);
      const distPercent = ((price - mid) / mid * 100);
      if (distPercent >= r.min && distPercent < r.max) {
        askVol += parseFloat(ask[1]);
      }
    });

    const total = bidVol + askVol;
    return {
      range: r.range,
      bidVolume: bidVol.toFixed(2),
      askVolume: askVol.toFixed(2),
      bidPercent: total > 0 ? Math.round((bidVol / total) * 100) : 50,
      askPercent: total > 0 ? Math.round((askVol / total) * 100) : 50,
      percent: total > 0 ? ((total / (parseFloat(bidVolume.value) + parseFloat(askVolume.value))) * 100).toFixed(1) : '0'
    };
  });

  depthDistribution.value = distribution;
};

// Calculate Microstructure
const calculateMicrostructure = () => {
  if (!orderBookData.value) return;

  const bids = orderBookData.value.bids || [];
  const asks = orderBookData.value.asks || [];

  // Average spread across 10 levels
  let totalSpread = 0;
  const levels = Math.min(10, bids.length, asks.length);

  for (let i = 0; i < levels; i++) {
    const bid = parseFloat(bids[i]?.[0] || 0);
    const ask = parseFloat(asks[i]?.[0] || 0);
    if (bid > 0) {
      totalSpread += ((ask - bid) / bid * 100);
    }
  }

  avgSpread.value = levels > 0 ? (totalSpread / levels).toFixed(4) : '0.00';

  // Tick size
  if (asks.length >= 2) {
    const price1 = parseFloat(asks[0]?.[0] || 0);
    const price2 = parseFloat(asks[1]?.[0] || 0);
    tickSize.value = Math.abs(price2 - price1).toFixed(4);
  }

  // Spread type
  const spreadVal = parseFloat(spread.value);
  if (spreadVal < 0.1) {
    spreadType.value = 'Tight';
    spreadTypeClass.value = 'tight';
  } else if (spreadVal < 0.5) {
    spreadType.value = 'Normal';
    spreadTypeClass.value = 'normal';
  } else {
    spreadType.value = 'Wide';
    spreadTypeClass.value = 'wide';
  }

  // Bid-Ask Bounce (simplified - price change)
  bidAskBounce.value = spreadVal > 0.3 ? 'High' : 'Low';

  // Order size distribution
  const buckets = [
    { range: '0-50', min: 0, max: 50 },
    { range: '50-200', min: 50, max: 200 },
    { range: '200-500', min: 200, max: 500 },
    { range: '500+', min: 500, max: Infinity },
  ];

  const dist = buckets.map(b => {
    let bidCount = 0;
    let askCount = 0;

    bids.forEach(bid => {
      const size = parseFloat(bid[1]);
      if (size >= b.min && size < b.max) bidCount++;
    });

    asks.forEach(ask => {
      const size = parseFloat(ask[1]);
      if (size >= b.min && size < b.max) askCount++;
    });

    const total = bidCount + askCount;
    return {
      range: b.range,
      bidCount,
      askCount,
      count: total,
      bidPercent: total > 0 ? Math.round((bidCount / total) * 100) : 50,
      askPercent: total > 0 ? Math.round((askCount / total) * 100) : 50,
    };
  });

  sizeDistribution.value = dist;

  // Level statistics
  totalBidLevels.value = bids.length;
  totalAskLevels.value = asks.length;

  const avgBid = bids.reduce((sum, bid) => sum + parseFloat(bid[1]), 0) / bids.length;
  const avgAsk = asks.reduce((sum, ask) => sum + parseFloat(ask[1]), 0) / asks.length;

  avgBidSize.value = avgBid.toFixed(2);
  avgAskSize.value = avgAsk.toFixed(2);

  const maxBid = Math.max(...bids.map(bid => parseFloat(bid[1])));
  const maxAsk = Math.max(...asks.map(ask => parseFloat(ask[1])));

  maxBidOrder.value = maxBid.toFixed(2);
  maxAskOrder.value = maxAsk.toFixed(2);
};

// Calculate Imbalance by Level
const calculateImbalanceByLevel = () => {
  if (!orderBookData.value) return;

  const bids = orderBookData.value.bids || [];
  const asks = orderBookData.value.asks || [];
  const mid = parseFloat(midPrice.value) || 0;

  const distances = [0.5, 1, 2, 3, 5];
  const levels = [];

  distances.forEach(dist => {
    const lowerBound = mid * (1 - dist / 100);
    const upperBound = mid * (1 + dist / 100);

    let bidVol = 0;
    let askVol = 0;

    bids.forEach(bid => {
      const price = parseFloat(bid[0]);
      if (price >= lowerBound && price <= mid) {
        bidVol += parseFloat(bid[1]);
      }
    });

    asks.forEach(ask => {
      const price = parseFloat(ask[0]);
      if (price <= upperBound && price >= mid) {
        askVol += parseFloat(ask[1]);
      }
    });

    const total = bidVol + askVol;
    const ratio = total > 0 ? (((bidVol - askVol) / total) * 100).toFixed(1) : '0.0';
    const ratioClass = parseFloat(ratio) > 10 ? 'bid' : parseFloat(ratio) < -10 ? 'ask' : 'neutral';

    levels.push({
      distance: dist,
      bidVol: bidVol.toFixed(2),
      askVol: askVol.toFixed(2),
      ratio,
      ratioClass
    });
  });

  imbalanceByLevel.value = levels;

  // Calculate average imbalance
  const ratios = levels.map(l => parseFloat(l.ratio));
  avgImbalance.value = (ratios.reduce((sum, r) => sum + r, 0) / ratios.length).toFixed(1);

  // Calculate volatility (standard deviation of ratios)
  const mean = parseFloat(avgImbalance.value);
  const variance = ratios.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / ratios.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev > 15) imbalanceVolatility.value = 'High';
  else if (stdDev > 8) imbalanceVolatility.value = 'Medium';
  else imbalanceVolatility.value = 'Low';
};

// Update Imbalance Trend
const updateImbalanceTrend = () => {
  const ratio = bidPercent.value - 50;
  const now = new Date();
  const time = now.getSeconds();

  // Keep last 20 data points
  if (imbalanceTrend.value.length >= 20) {
    imbalanceTrend.value.shift();
  }

  imbalanceTrend.value.push({
    time: `${time}s`,
    value: ratio
  });
};

// Additional computed properties for all metrics (51-60)
const buyPressure = computed(() => bidPercent.value);
const sellPressure = computed(() => askPercent.value);

const netFlow = computed(() => {
  const diff = parseFloat(bidVolume.value) - parseFloat(askVolume.value);
  return diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2);
});

const netFlowClass = computed(() => {
  const diff = parseFloat(bidVolume.value) - parseFloat(askVolume.value);
  return diff > 0 ? 'bid' : 'ask';
});

const volatility = computed(() => {
  const spreadVal = parseFloat(spread.value);
  if (spreadVal > 1) return (spreadVal * 2).toFixed(2);
  return spreadVal.toFixed(2);
});

const volatilityClass = computed(() => {
  const vol = parseFloat(volatility.value);
  if (vol > 2) return 'ask';
  if (vol > 1) return 'neutral';
  return 'bid';
});

const updateRate = ref(2); // Updates every 500ms = 2/s

const marketState = computed(() => {
  const ratio = bidPercent.value - 50;
  const spreadVal = parseFloat(spread.value);

  if (spreadVal < 0.2 && Math.abs(ratio) < 15) return 'Healthy';
  if (spreadVal > 1) return 'Volatile';
  if (Math.abs(ratio) > 30) return 'Imbalanced';
  return 'Normal';
});

const marketStateType = computed(() => {
  const state = marketState.value;
  if (state === 'Healthy') return 'success';
  if (state === 'Volatile' || state === 'Imbalanced') return 'error';
  return 'warning';
});

const trend = computed(() => {
  const ratio = bidPercent.value - 50;
  if (ratio > 15) return 'Bullish';
  if (ratio < -15) return 'Bearish';
  return 'Neutral';
});

const trendType = computed(() => {
  const t = trend.value;
  if (t === 'Bullish') return 'success';
  if (t === 'Bearish') return 'error';
  return 'warning';
});

const momentum = computed(() => {
  const ratio = bidPercent.value - 50;
  if (Math.abs(ratio) > 20) return 'Strong';
  if (Math.abs(ratio) > 10) return 'Moderate';
  return 'Weak';
});

const momentumType = computed(() => {
  const m = momentum.value;
  const ratio = bidPercent.value - 50;
  if (m === 'Strong' && ratio > 0) return 'success';
  if (m === 'Strong' && ratio < 0) return 'error';
  return 'warning';
});

const recommendedAction = computed(() => {
  const ratio = bidPercent.value - 50;
  const spreadVal = parseFloat(spread.value);

  if (ratio > 20 && spreadVal < 0.5) return 'BUY Signal';
  if (ratio < -20 && spreadVal < 0.5) return 'SELL Signal';
  if (Math.abs(ratio) < 10 && spreadVal < 0.3) return 'HOLD';
  return 'WAIT';
});

const actionType = computed(() => {
  const action = recommendedAction.value;
  if (action === 'BUY Signal') return 'success';
  if (action === 'SELL Signal') return 'error';
  return 'warning';
});

const activeSignals = computed(() => {
  const signals = [];
  const ratio = bidPercent.value - 50;
  const spreadVal = parseFloat(spread.value);

  if (ratio > 20) signals.push({ type: 'buy', strength: 'strong' });
  if (ratio < -20) signals.push({ type: 'sell', strength: 'strong' });
  if (bidWalls.value.length > 3) signals.push({ type: 'support', strength: 'medium' });
  if (askWalls.value.length > 3) signals.push({ type: 'resistance', strength: 'medium' });
  if (spreadVal < 0.1) signals.push({ type: 'tight-spread', strength: 'weak' });

  return signals;
});

const supportLevels = computed(() => {
  return bidWalls.value.slice(0, 5);
});

const resistanceLevels = computed(() => {
  return askWalls.value.slice(0, 5);
});

// Watch for slippage order size changes
watch(slippageOrderSize, () => {
  calculateSlippage();
});

// Calculate Slippage
const calculateSlippage = () => {
  if (!orderBookData.value || !slippageOrderSize.value) return;

  const bids = orderBookData.value.bids || [];
  const asks = orderBookData.value.asks || [];
  const orderSize = slippageOrderSize.value;

  // Calculate buy slippage (consuming ask liquidity)
  let remainingBuy = orderSize;
  let totalCostBuy = 0;
  let filledBuy = 0;

  for (const ask of asks) {
    const price = parseFloat(ask[0]);
    const size = parseFloat(ask[1]);
    const quoteSize = price * size;

    if (remainingBuy <= quoteSize) {
      totalCostBuy += remainingBuy;
      filledBuy += remainingBuy / price;
      remainingBuy = 0;
      break;
    } else {
      totalCostBuy += quoteSize;
      filledBuy += size;
      remainingBuy -= quoteSize;
    }
  }

  const avgBuyPriceCalc = filledBuy > 0 ? totalCostBuy / filledBuy : 0;
  avgBuyPrice.value = avgBuyPriceCalc.toFixed(4);
  const buySlippageCalc = bestAsk.value ? ((avgBuyPriceCalc - parseFloat(bestAsk.value)) / parseFloat(bestAsk.value) * 100) : 0;
  buySlippage.value = buySlippageCalc.toFixed(4);

  // Calculate sell slippage (consuming bid liquidity)
  let remainingSell = orderSize;
  let totalRevenueSell = 0;
  let filledSell = 0;

  for (const bid of bids) {
    const price = parseFloat(bid[0]);
    const size = parseFloat(bid[1]);
    const quoteSize = price * size;

    if (remainingSell <= quoteSize) {
      totalRevenueSell += remainingSell;
      filledSell += remainingSell / price;
      remainingSell = 0;
      break;
    } else {
      totalRevenueSell += quoteSize;
      filledSell += size;
      remainingSell -= quoteSize;
    }
  }

  const avgSellPriceCalc = filledSell > 0 ? totalRevenueSell / filledSell : 0;
  avgSellPrice.value = avgSellPriceCalc.toFixed(4);
  const sellSlippageCalc = bestBid.value ? ((parseFloat(bestBid.value) - avgSellPriceCalc) / parseFloat(bestBid.value) * 100) : 0;
  sellSlippage.value = sellSlippageCalc.toFixed(4);
};
</script>

<style scoped>
.orderbook-analysis-container {
  padding: 16px;
  background: #0f1419;
  min-height: 100vh;
}

/* Live OrderBook Card - Ultra Compact */
.orderbook-analysis-container :deep(.n-card) {
  max-height: 75px;
}

.orderbook-analysis-container :deep(.n-card:first-child) {
  max-height: 75px;
}

.orderbook-analysis-container :deep(.n-card__header) {
  padding: 4px 8px !important;
  min-height: 30px !important;
  max-height: 30px !important;
}

.orderbook-analysis-container :deep(.n-card__header .n-card-header__main) {
  font-size: 9px !important;
  font-weight: 600 !important;
  line-height: 1 !important;
}

.orderbook-analysis-container :deep(.n-card__content) {
  padding: 4px !important;
  max-height: 45px !important;
  overflow-y: auto !important;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  text-align: center;
}

.stat-label {
  font-size: 10px;
  color: #888;
  text-transform: uppercase;
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
  color: #ffa500;
}

.stat-value.tight {
  color: #10eb04;
}

.stat-value.wide {
  color: #ff3b30;
}

.stat-value.normal {
  color: #ffa500;
}

/* Depth Chart */
.depth-chart-container {
  max-height: 500px;
  overflow-y: auto;
}

.depth-levels {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.depth-level {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.level-info {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}

.level-price {
  font-family: 'Courier New', monospace;
  font-weight: 600;
}

.level-price.bid {
  color: #10eb04;
}

.level-price.ask {
  color: #ff3b30;
}

.level-cumulative {
  color: #888;
}

.level-bar-container {
  height: 6px;
  background: rgba(128, 128, 128, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.level-bar {
  height: 100%;
  transition: width 0.3s ease;
}

.level-bar.bid {
  background: linear-gradient(90deg, rgba(16, 235, 4, 0.3), #10eb04);
}

.level-bar.ask {
  background: linear-gradient(90deg, rgba(255, 59, 48, 0.3), #ff3b30);
}

/* Distribution */
.distribution-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dist-item {
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.dist-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 11px;
}

.dist-label {
  color: #888;
  font-weight: 600;
}

.dist-percent {
  color: #e0e0e0;
  font-weight: 700;
}

.dist-bars {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dist-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dist-bar {
  height: 20px;
  border-radius: 4px;
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 6px;
  font-size: 10px;
  color: #fff;
  font-weight: 700;
}

.dist-bar.bid {
  background: linear-gradient(90deg, rgba(16, 235, 4, 0.5), #10eb04);
}

.dist-bar.ask {
  background: linear-gradient(90deg, rgba(255, 59, 48, 0.5), #ff3b30);
}

.dist-value {
  font-size: 11px;
  color: #888;
  min-width: 60px;
}

/* Walls Analysis */
.walls-analysis {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.wall-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wall-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}

.wall-section-header.bid {
  background: rgba(16, 235, 4, 0.1);
  color: #10eb04;
  border: 1px solid rgba(16, 235, 4, 0.3);
}

.wall-section-header.ask {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
  border: 1px solid rgba(255, 59, 48, 0.3);
}

.wall-strength {
  font-size: 11px;
  opacity: 0.8;
}

.wall-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 11px;
  font-style: italic;
}

.wall-item {
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border-left: 3px solid;
}

.wall-item:nth-child(even) {
  background: rgba(0, 0, 0, 0.15);
}

.wall-main {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 11px;
}

.wall-price {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: #e0e0e0;
}

.wall-size {
  color: #888;
}

.wall-distance {
  color: #666;
  font-size: 10px;
}

.wall-metrics {
  display: flex;
  gap: 12px;
  margin-bottom: 6px;
  font-size: 10px;
}

.metric {
  display: flex;
  gap: 4px;
}

.metric-label {
  color: #666;
}

.metric-value {
  color: #e0e0e0;
  font-weight: 600;
}

.metric-value.impact-high {
  color: #ff3b30;
}

.metric-value.impact-medium {
  color: #ffa500;
}

.metric-value.impact-low {
  color: #10eb04;
}

.wall-progress {
  height: 6px;
  background: rgba(128, 128, 128, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.wall-progress-bar {
  height: 100%;
  transition: width 0.3s ease;
}

.wall-progress-bar.bid {
  background: linear-gradient(90deg, rgba(16, 235, 4, 0.5), #10eb04);
}

.wall-progress-bar.ask {
  background: linear-gradient(90deg, rgba(255, 59, 48, 0.5), #ff3b30);
}

/* Clustering */
.clustering-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.cluster-item {
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  text-align: center;
}

.cluster-label {
  font-size: 11px;
  color: #888;
  margin-bottom: 8px;
}

.cluster-value {
  font-size: 20px;
  font-weight: 700;
  color: #e0e0e0;
  margin-bottom: 4px;
}

.cluster-info {
  font-size: 10px;
  color: #666;
}

/* Liquidity Table */
.liquidity-table {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.liquidity-header {
  display: grid;
  grid-template-columns: 80px 100px 100px 100px 100px;
  gap: 8px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
}

.liquidity-row {
  display: grid;
  grid-template-columns: 80px 100px 100px 100px 100px;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  font-size: 11px;
  align-items: center;
}

.liq-distance {
  color: #888;
}

.liq-bid {
  color: #10eb04;
  font-family: 'Courier New', monospace;
}

.liq-ask {
  color: #ff3b30;
  font-family: 'Courier New', monospace;
}

.liq-total {
  color: #e0e0e0;
  font-family: 'Courier New', monospace;
  font-weight: 600;
}

.liq-imbalance {
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.liq-imbalance.bid {
  color: #10eb04;
}

.liq-imbalance.ask {
  color: #ff3b30;
}

.liq-imbalance.neutral {
  color: #ffa500;
}

/* Liquidity Metrics */
.liquidity-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.liq-metric-item {
  padding: 14px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  text-align: center;
}

.liq-metric-label {
  font-size: 10px;
  color: #888;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.liq-metric-value {
  font-size: 18px;
  font-weight: 700;
  color: #e0e0e0;
  margin-bottom: 8px;
}

.liq-metric-value.large {
  font-size: 28px;
}

/* Slippage Estimator */
.slippage-estimator {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.slippage-input {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slippage-input label {
  font-size: 12px;
  color: #888;
  min-width: 150px;
}

.slippage-results {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.slippage-result {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  font-size: 11px;
}

.result-label {
  color: #888;
}

.result-value {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: #e0e0e0;
}

.result-value.bid {
  color: #10eb04;
}

.result-value.ask {
  color: #ff3b30;
}

/* Imbalance Overview */
.imbalance-overview {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.imbalance-visual {
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.imbalance-bar-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.imbalance-label {
  font-size: 11px;
  color: #888;
  font-weight: 600;
}

.imbalance-bar {
  display: flex;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
}

.bid-side,
.ask-side {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  transition: width 0.3s ease;
}

.bid-side {
  background: linear-gradient(90deg, rgba(16, 235, 4, 0.7), rgba(16, 235, 4, 0.9));
}

.ask-side {
  background: linear-gradient(90deg, rgba(255, 59, 48, 0.9), rgba(255, 59, 48, 0.7));
}

.imbalance-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.imb-stat {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  font-size: 11px;
}

.imb-stat-label {
  color: #888;
}

.imb-stat-value {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: #e0e0e0;
}

.imb-stat-value.bid {
  color: #10eb04;
}

.imb-stat-value.ask {
  color: #ff3b30;
}

.imb-stat-value.neutral {
  color: #ffa500;
}

/* Level Imbalances */
.level-imbalances {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.level-imbalance-item {
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.level-imb-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 11px;
}

.level-imb-distance {
  color: #888;
}

.level-imb-ratio {
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.level-imb-ratio.bid {
  color: #10eb04;
}

.level-imb-ratio.ask {
  color: #ff3b30;
}

.level-imb-ratio.neutral {
  color: #ffa500;
}

.level-imb-bar {
  height: 8px;
  background: rgba(128, 128, 128, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.level-imb-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.level-imb-fill.bid {
  background: linear-gradient(90deg, rgba(16, 235, 4, 0.5), #10eb04);
}

.level-imb-fill.ask {
  background: linear-gradient(90deg, rgba(255, 59, 48, 0.5), #ff3b30);
}

.level-imb-fill.neutral {
  background: linear-gradient(90deg, rgba(255, 165, 0, 0.5), #ffa500);
}

.level-imb-info {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #666;
}

/* Imbalance Trend */
.imbalance-trend {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trend-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 150px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  gap: 4px;
}

.trend-point {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.trend-bar {
  width: 100%;
  min-height: 2px;
  border-radius: 2px;
  transition: height 0.3s ease;
}

.trend-bar.bid {
  background: #10eb04;
}

.trend-bar.ask {
  background: #ff3b30;
}

.trend-time {
  font-size: 9px;
  color: #666;
}

.trend-stats {
  display: flex;
  justify-content: space-around;
  font-size: 11px;
  color: #888;
}

/* Microstructure */
.spread-micro-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.micro-item {
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  text-align: center;
}

.micro-label {
  font-size: 10px;
  color: #888;
  margin-bottom: 6px;
}

.micro-value {
  font-size: 16px;
  font-weight: 700;
  color: #e0e0e0;
  font-family: 'Courier New', monospace;
}

.micro-value.tight {
  color: #10eb04;
}

.micro-value.wide {
  color: #ff3b30;
}

.micro-value.normal {
  color: #ffa500;
}

/* Size Distribution */
.size-distribution {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.size-bucket {
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.bucket-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 11px;
}

.bucket-label {
  color: #888;
  font-weight: 600;
}

.bucket-count {
  color: #e0e0e0;
}

.bucket-bars {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bucket-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
}

.bar-label {
  color: #888;
  min-width: 40px;
}

.bucket-bar {
  height: 16px;
  border-radius: 4px;
  transition: width 0.3s ease;
  flex: 1;
}

.bucket-bar.bid {
  background: linear-gradient(90deg, rgba(16, 235, 4, 0.5), #10eb04);
}

.bucket-bar.ask {
  background: linear-gradient(90deg, rgba(255, 59, 48, 0.5), #ff3b30);
}

.bar-value {
  color: #666;
  min-width: 30px;
  text-align: right;
}

/* Level Stats */
.level-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.level-stat {
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  text-align: center;
}

.stat-label {
  font-size: 10px;
  color: #888;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #e0e0e0;
  font-family: 'Courier New', monospace;
}

/* Complete Analysis - Compact TABLE Format */
.metrics-table-container {
  width: 100%;
  overflow-x: auto;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 12px;
}

.metrics-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  background: transparent;
}

.metrics-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(0, 0, 0, 0.8);
}

.metrics-table thead th {
  padding: 10px 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  color: #60a5fa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid rgba(96, 165, 250, 0.3);
  background: rgba(0, 0, 0, 0.8);
}

.metrics-table tbody tr {
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);
  transition: background-color 0.2s ease;
}

.metrics-table tbody tr:hover {
  background: rgba(96, 165, 250, 0.08);
}

.metrics-table tbody tr:nth-child(even) {
  background: rgba(0, 0, 0, 0.15);
}

.metrics-table tbody tr:nth-child(even):hover {
  background: rgba(96, 165, 250, 0.12);
}

.metrics-table td {
  padding: 8px 12px;
  vertical-align: middle;
}

.metric-id {
  color: #666;
  font-weight: 600;
  font-size: 10px;
  text-align: center;
}

.metric-icon-cell {
  font-size: 18px;
  text-align: center;
}

.metric-title-cell {
  font-weight: 600;
  color: #e0e0e0;
  font-size: 12px;
}

.metric-value-cell {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  font-size: 13px;
  white-space: nowrap;
}

/* Metric Value Color Classes */
.metric-value-cell.bid {
  color: #10eb04;
}

.metric-value-cell.ask {
  color: #ff3b30;
}

.metric-value-cell.mid {
  color: #ffa500;
}

.metric-value-cell.neutral {
  color: #60a5fa;
}

.metric-value-cell.tight {
  color: #10eb04;
}

.metric-value-cell.wide {
  color: #ff3b30;
}

.metric-value-cell.normal {
  color: #ffa500;
}

.metric-desc-cell {
  color: #888;
  font-size: 11px;
  line-height: 1.4;
}

/* New Compact Tab Styles */
.compact-tab-content {
  padding: 16px;
}

.section-header {
  font-size: 14px;
  font-weight: 700;
  color: #60a5fa;
  margin: 24px 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(96, 165, 250, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-header:first-child {
  margin-top: 0;
}

/* Compact Table Styles */
.compact-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 20px;
}

/* Ultra-compact variant for depth orderbook - smaller padding and font */
.compact-table.ultra-compact {
  font-size: 10px;
}

.compact-table.ultra-compact thead th {
  padding: 6px 8px;
  font-size: 9px;
}

.compact-table.ultra-compact tbody tr {
  border-bottom: 1px solid rgba(128, 128, 128, 0.05);
}

.compact-table.ultra-compact td {
  padding: 4px 8px;
}

.compact-table.ultra-compact .price-cell {
  font-size: 10px;
}

.compact-table.ultra-compact .value-cell {
  font-size: 10px;
}

.compact-table thead th {
  padding: 10px 12px;
  text-align: left;
  font-size: 10px;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.3);
  background: rgba(0, 0, 0, 0.4);
}

.compact-table tbody tr {
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);
  transition: background-color 0.2s ease;
}

.compact-table tbody tr:hover {
  background: rgba(96, 165, 250, 0.08);
}

.compact-table tbody tr:last-child {
  border-bottom: none;
}

.compact-table td {
  padding: 8px 12px;
  vertical-align: middle;
}

.price-cell {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  font-size: 12px;
}

.price-cell.bid {
  color: #10eb04;
}

.price-cell.ask {
  color: #ff3b30;
}

.value-cell {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  font-size: 12px;
  color: #e0e0e0;
}

.label-cell {
  color: #888;
  font-size: 11px;
  font-weight: 600;
}

.bid-cell {
  color: #10eb04;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  font-size: 12px;
}

.ask-cell {
  color: #ff3b30;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  font-size: 12px;
}

.distance-cell {
  color: #666;
  font-size: 11px;
}

.desc-cell {
  color: #888;
  font-size: 10px;
}

.no-data-message {
  text-align: center;
  padding: 30px;
  color: #666;
  font-size: 12px;
  font-style: italic;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  margin-bottom: 20px;
}

/* Mini Bar Component */
.mini-bar-container {
  height: 18px;
  background: rgba(128, 128, 128, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.mini-bar {
  height: 100%;
  transition: width 0.3s ease;
}

.mini-bar.bid {
  background: linear-gradient(90deg, rgba(16, 235, 4, 0.5), #10eb04);
}

.mini-bar.ask {
  background: linear-gradient(90deg, rgba(255, 59, 48, 0.5), #ff3b30);
}

.mini-bar.neutral {
  background: linear-gradient(90deg, rgba(255, 165, 0, 0.5), #ffa500);
}

/* Split Bar Component */
.split-bar {
  display: flex;
  height: 20px;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
}

.split-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  transition: width 0.3s ease;
}

.split-segment.bid {
  background: linear-gradient(90deg, rgba(16, 235, 4, 0.6), rgba(16, 235, 4, 0.8));
}

.split-segment.ask {
  background: linear-gradient(90deg, rgba(255, 59, 48, 0.8), rgba(255, 59, 48, 0.6));
}

/* Stats Summary */
.stats-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 2px solid rgba(128, 128, 128, 0.2);
  transition: all 0.3s ease;
}

.stat-box:hover {
  background: rgba(0, 0, 0, 0.4);
  transform: translateY(-2px);
}

.stat-box.bid {
  border-color: rgba(16, 235, 4, 0.4);
  background: rgba(16, 235, 4, 0.05);
}

.stat-box.ask {
  border-color: rgba(255, 59, 48, 0.4);
  background: rgba(255, 59, 48, 0.05);
}

.stat-box.neutral {
  border-color: rgba(96, 165, 250, 0.3);
}

.stat-box.success {
  border-color: rgba(16, 235, 4, 0.3);
}

.stat-icon {
  font-size: 28px;
  line-height: 1;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 10px;
  color: #888;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #e0e0e0;
  font-family: 'Courier New', monospace;
  margin-bottom: 2px;
}

.stat-detail {
  font-size: 9px;
  color: #666;
}

/* Strength Bar */
.strength-bar-container {
  height: 18px;
  background: rgba(128, 128, 128, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  transition: width 0.3s ease;
}

.strength-bar.bid {
  background: linear-gradient(90deg, rgba(16, 235, 4, 0.5), #10eb04);
}

.strength-bar.ask {
  background: linear-gradient(90deg, rgba(255, 59, 48, 0.5), #ff3b30);
}

/* Slippage Tool */
.slippage-tool {
  background: rgba(0, 0, 0, 0.2);
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.slippage-input-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.slippage-input-row label {
  font-size: 12px;
  color: #888;
  font-weight: 600;
  min-width: 150px;
}

/* Visual Balance Bar */
.visual-balance-bar {
  background: rgba(0, 0, 0, 0.2);
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.balance-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 600;
}

.balance-labels .bid {
  color: #10eb04;
}

.balance-labels .ask {
  color: #ff3b30;
}

.balance-bar {
  display: flex;
  height: 36px;
  border-radius: 6px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
}

.balance-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  transition: width 0.3s ease;
}

.balance-segment.bid {
  background: linear-gradient(90deg, rgba(16, 235, 4, 0.7), rgba(16, 235, 4, 0.9));
}

.balance-segment.ask {
  background: linear-gradient(90deg, rgba(255, 59, 48, 0.9), rgba(255, 59, 48, 0.7));
}

/* Trend Chart */
.trend-chart-container {
  background: rgba(0, 0, 0, 0.2);
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.trend-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 120px;
  gap: 3px;
}

.trend-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  gap: 6px;
}

.trend-bar-wrapper {
  display: flex;
  align-items: flex-end;
  height: 100px;
  width: 100%;
}

.trend-bar {
  width: 100%;
  min-height: 2px;
  border-radius: 2px 2px 0 0;
  transition: height 0.3s ease;
}

.trend-bar.bid {
  background: #10eb04;
}

.trend-bar.ask {
  background: #ff3b30;
}

.trend-label {
  font-size: 8px;
  color: #666;
  white-space: nowrap;
}

/* Stats Grid Compact */
.stats-grid-compact {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  background: rgba(0, 0, 0, 0.2);
  padding: 16px;
  border-radius: 6px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.stat-item .stat-label {
  font-size: 10px;
  color: #888;
  font-weight: 600;
}

.stat-item .stat-value {
  font-size: 14px;
  font-weight: 700;
  color: #e0e0e0;
  font-family: 'Courier New', monospace;
}

.stat-item .stat-value.bid {
  color: #10eb04;
}

.stat-item .stat-value.ask {
  color: #ff3b30;
}

/* Responsive */
@media (max-width: 1400px) {
  .metrics-table {
    font-size: 11px;
  }

  .metric-value-cell {
    font-size: 12px;
  }

  .metric-title-cell {
    font-size: 11px;
  }

  .metric-desc-cell {
    font-size: 10px;
  }
}

@media (max-width: 1000px) {
  .walls-analysis {
    grid-template-columns: 1fr;
  }

  .liquidity-metrics,
  .spread-micro-grid,
  .level-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .clustering-grid,
  .slippage-results,
  .imbalance-stats {
    grid-template-columns: 1fr;
  }

  .metrics-table {
    font-size: 10px;
  }

  .metric-value-cell {
    font-size: 11px;
  }

  .metric-title-cell {
    font-size: 10px;
  }

  .metric-desc-cell {
    font-size: 9px;
  }

  .metric-icon-cell {
    font-size: 16px;
  }
}

/* Mid-Price Separator (between ask and bid in depth profile) */
.mid-price-separator {
  border-bottom: 3px solid rgba(255, 165, 0, 0.6) !important;
  border-top: 3px solid rgba(255, 165, 0, 0.6) !important;
  background: rgba(255, 165, 0, 0.1) !important;
}

.mid-price-separator td {
  padding: 6px 8px !important;
  font-weight: 700 !important;
}
</style>
