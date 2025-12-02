<template>
  <div style="padding: 20px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="color: #10eb04; margin: 0;">📉 Support/Resistance & Price Levels</h2>
      <n-button text @click="$router.push('/Analytics')" style="color: #60a5fa;">
        ← Back to Analytics
      </n-button>
    </div>

    <!-- Exchange & Symbol Selector -->
    <n-card size="small" style="margin-bottom: 20px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
      <n-grid :cols="4" x-gap="12">
        <n-gi>
          <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Exchange</div>
          <n-select v-model:value="selectedExchange" :options="exchangeOptions" size="small" placeholder="Select Exchange" />
        </n-gi>
        <n-gi>
          <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Symbol</div>
          <n-select v-model:value="selectedSymbol" :options="symbolOptions" size="small" placeholder="Select Symbol" filterable />
        </n-gi>
        <n-gi>
          <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Timeframe</div>
          <n-select v-model:value="selectedTimeframe" :options="timeframeOptions" size="small" />
        </n-gi>
        <n-gi style="display: flex; align-items: flex-end;">
          <n-button type="primary" size="small" @click="fetchLevelsData" :loading="isLoading" style="width: 100%;">
            {{ isLoading ? 'Loading...' : '🔍 Find Levels' }}
          </n-button>
        </n-gi>
      </n-grid>
    </n-card>

    <!-- Support/Resistance Tabs -->
    <n-tabs v-model:value="activeTab" type="card" animated>
      <!-- Tab 1: Support/Resistance Levels -->
      <n-tab-pane name="levels" tab="📊 S/R Levels">
        <n-card size="small" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
          <div v-if="isLoading" style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">⏳</div>
            <div>Analyzing price levels...</div>
          </div>

          <div v-else-if="levelsData.length === 0" style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">📊</div>
            <div>No data available. Click "🔍 Find Levels" to analyze.</div>
          </div>

          <div v-else>
            <!-- Current Price Info -->
            <n-card size="small" style="margin-bottom: 20px; background: rgba(96, 165, 250, 0.1);">
              <n-grid :cols="4" x-gap="12">
                <n-gi>
                  <div style="text-align: center;">
                    <div style="font-size: 10px; color: #888;">CURRENT PRICE</div>
                    <div style="font-size: 20px; color: #60a5fa; font-weight: 700;">${{ currentPrice }}</div>
                  </div>
                </n-gi>
                <n-gi>
                  <div style="text-align: center;">
                    <div style="font-size: 10px; color: #888;">NEAREST SUPPORT</div>
                    <div style="font-size: 16px; color: #10eb04; font-weight: 600;">${{ nearestSupport.price }}</div>
                    <div style="font-size: 9px; color: #888;">{{ nearestSupport.distance }}%</div>
                  </div>
                </n-gi>
                <n-gi>
                  <div style="text-align: center;">
                    <div style="font-size: 10px; color: #888;">NEAREST RESISTANCE</div>
                    <div style="font-size: 16px; color: #ef4444; font-weight: 600;">${{ nearestResistance.price }}</div>
                    <div style="font-size: 9px; color: #888;">{{ nearestResistance.distance }}%</div>
                  </div>
                </n-gi>
                <n-gi>
                  <div style="text-align: center;">
                    <div style="font-size: 10px; color: #888;">RANGE</div>
                    <div style="font-size: 16px; color: #fbbf24; font-weight: 600;">{{ rangePercent }}%</div>
                    <div style="font-size: 9px; color: #888;">S/R Distance</div>
                  </div>
                </n-gi>
              </n-grid>
            </n-card>

            <!-- Support Levels Table -->
            <h3 style="color: #10eb04; margin: 20px 0 10px 0; font-size: 14px;">🟢 SUPPORT LEVELS</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead style="background: rgba(16, 235, 4, 0.1); position: sticky; top: 0; z-index: 10;">
                <tr>
                  <th style="padding: 6px; text-align: left; color: #888; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">#</th>
                  <th style="padding: 6px; text-align: right; color: #10eb04;">Price</th>
                  <th style="padding: 6px; text-align: right; color: #888;">Distance</th>
                  <th style="padding: 6px; text-align: center; color: #888;">Strength</th>
                  <th style="padding: 6px; text-align: center; color: #888;">Touches</th>
                  <th style="padding: 6px; text-align: left; color: #888;">Type</th>
                  <th style="padding: 6px; text-align: left; color: #888;">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(level, index) in supportLevels" :key="index"
                    :style="{ background: 'rgba(16, 235, 4, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }">
                  <td style="padding: 6px; color: #888;">{{ index + 1 }}</td>
                  <td style="padding: 6px; text-align: right; color: #10eb04; font-weight: 600;">${{ level.price }}</td>
                  <td style="padding: 6px; text-align: right; color: #888;">{{ level.distance }}%</td>
                  <td style="padding: 6px; text-align: center;">
                    <span :style="{
                      color: level.strength >= 8 ? '#10eb04' : level.strength >= 5 ? '#fbbf24' : '#888',
                      fontWeight: '600'
                    }">{{ level.strength }}/10</span>
                  </td>
                  <td style="padding: 6px; text-align: center; color: #888;">{{ level.touches }}</td>
                  <td style="padding: 6px; color: #a78bfa; font-size: 10px;">{{ level.type }}</td>
                  <td style="padding: 6px; font-size: 10px;">
                    <span :style="{ color: level.status === 'Strong' ? '#10eb04' : level.status === 'Weak' ? '#888' : '#fbbf24' }">
                      {{ level.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Resistance Levels Table -->
            <h3 style="color: #ef4444; margin: 20px 0 10px 0; font-size: 14px;">🔴 RESISTANCE LEVELS</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead style="background: rgba(239, 68, 68, 0.1); position: sticky; top: 0; z-index: 10;">
                <tr>
                  <th style="padding: 6px; text-align: left; color: #888; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">#</th>
                  <th style="padding: 6px; text-align: right; color: #ef4444;">Price</th>
                  <th style="padding: 6px; text-align: right; color: #888;">Distance</th>
                  <th style="padding: 6px; text-align: center; color: #888;">Strength</th>
                  <th style="padding: 6px; text-align: center; color: #888;">Touches</th>
                  <th style="padding: 6px; text-align: left; color: #888;">Type</th>
                  <th style="padding: 6px; text-align: left; color: #888;">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(level, index) in resistanceLevels" :key="index"
                    :style="{ background: 'rgba(239, 68, 68, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }">
                  <td style="padding: 6px; color: #888;">{{ index + 1 }}</td>
                  <td style="padding: 6px; text-align: right; color: #ef4444; font-weight: 600;">${{ level.price }}</td>
                  <td style="padding: 6px; text-align: right; color: #888;">{{ level.distance }}%</td>
                  <td style="padding: 6px; text-align: center;">
                    <span :style="{
                      color: level.strength >= 8 ? '#ef4444' : level.strength >= 5 ? '#fbbf24' : '#888',
                      fontWeight: '600'
                    }">{{ level.strength }}/10</span>
                  </td>
                  <td style="padding: 6px; text-align: center; color: #888;">{{ level.touches }}</td>
                  <td style="padding: 6px; color: #a78bfa; font-size: 10px;">{{ level.type }}</td>
                  <td style="padding: 6px; font-size: 10px;">
                    <span :style="{ color: level.status === 'Strong' ? '#ef4444' : level.status === 'Weak' ? '#888' : '#fbbf24' }">
                      {{ level.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </n-card>
      </n-tab-pane>

      <!-- Tab 2: Pivot Points -->
      <n-tab-pane name="pivots" tab="📍 Pivot Points">
        <n-card size="small" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
          <div v-if="pivotData.classic">
            <!-- Classic Pivot Points -->
            <h3 style="color: #60a5fa; margin: 0 0 15px 0; font-size: 14px;">Classic Pivot Points</h3>
            <n-grid :cols="4" x-gap="12" style="margin-bottom: 30px;">
              <n-gi v-for="(value, key) in pivotData.classic" :key="key">
                <div style="text-align: center; padding: 10px; background: rgba(96, 165, 250, 0.05); border-radius: 6px;">
                  <div style="font-size: 9px; color: #888; margin-bottom: 4px;">{{ key.toUpperCase() }}</div>
                  <div :style="{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: key.includes('R') ? '#ef4444' : key.includes('S') ? '#10eb04' : '#60a5fa'
                  }">${{ value }}</div>
                </div>
              </n-gi>
            </n-grid>

            <!-- Fibonacci Pivot Points -->
            <h3 style="color: #fbbf24; margin: 20px 0 15px 0; font-size: 14px;">Fibonacci Pivot Points</h3>
            <n-grid :cols="4" x-gap="12" style="margin-bottom: 30px;">
              <n-gi v-for="(value, key) in pivotData.fibonacci" :key="key">
                <div style="text-align: center; padding: 10px; background: rgba(251, 191, 36, 0.05); border-radius: 6px;">
                  <div style="font-size: 9px; color: #888; margin-bottom: 4px;">{{ key.toUpperCase() }}</div>
                  <div :style="{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: key.includes('R') ? '#ef4444' : key.includes('S') ? '#10eb04' : '#fbbf24'
                  }">${{ value }}</div>
                </div>
              </n-gi>
            </n-grid>

            <!-- Camarilla Pivot Points -->
            <h3 style="color: #a78bfa; margin: 20px 0 15px 0; font-size: 14px;">Camarilla Pivot Points</h3>
            <n-grid :cols="4" x-gap="12">
              <n-gi v-for="(value, key) in pivotData.camarilla" :key="key">
                <div style="text-align: center; padding: 10px; background: rgba(167, 139, 250, 0.05); border-radius: 6px;">
                  <div style="font-size: 9px; color: #888; margin-bottom: 4px;">{{ key.toUpperCase() }}</div>
                  <div :style="{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: key.includes('R') ? '#ef4444' : key.includes('S') ? '#10eb04' : '#a78bfa'
                  }">${{ value }}</div>
                </div>
              </n-gi>
            </n-grid>
          </div>
          <div v-else style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">📍</div>
            <div>Click "🔍 Find Levels" to calculate pivot points</div>
          </div>
        </n-card>
      </n-tab-pane>

      <!-- Tab 3: Fibonacci Retracement -->
      <n-tab-pane name="fibonacci" tab="🌀 Fibonacci">
        <n-card size="small" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
          <div v-if="fibonacciData.levels">
            <n-grid :cols="2" x-gap="20">
              <n-gi>
                <h3 style="color: #10eb04; margin: 0 0 15px 0; font-size: 14px;">🟢 Fibonacci Retracement (Uptrend)</h3>
                <div style="font-size: 10px; color: #888; margin-bottom: 10px;">
                  From Low: ${{ fibonacciData.swingLow }} to High: ${{ fibonacciData.swingHigh }}
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                  <thead style="background: rgba(16, 235, 4, 0.1);">
                    <tr>
                      <th style="padding: 6px; text-align: left; color: #888;">Level</th>
                      <th style="padding: 6px; text-align: right; color: #10eb04;">Price</th>
                      <th style="padding: 6px; text-align: right; color: #888;">Distance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="level in fibonacciData.levels" :key="level.ratio"
                        :style="{ background: 'rgba(16, 235, 4, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }">
                      <td style="padding: 6px; color: #fbbf24; font-weight: 600;">{{ level.ratio }}%</td>
                      <td style="padding: 6px; text-align: right; color: #10eb04; font-weight: 600;">${{ level.price }}</td>
                      <td style="padding: 6px; text-align: right; color: #888;">{{ level.distance }}%</td>
                    </tr>
                  </tbody>
                </table>
              </n-gi>

              <n-gi>
                <h3 style="color: #ef4444; margin: 0 0 15px 0; font-size: 14px;">🔴 Fibonacci Extension</h3>
                <div style="font-size: 10px; color: #888; margin-bottom: 10px;">
                  Extension targets from current trend
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                  <thead style="background: rgba(239, 68, 68, 0.1);">
                    <tr>
                      <th style="padding: 6px; text-align: left; color: #888;">Level</th>
                      <th style="padding: 6px; text-align: right; color: #ef4444;">Price</th>
                      <th style="padding: 6px; text-align: right; color: #888;">Distance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="level in fibonacciData.extensions" :key="level.ratio"
                        :style="{ background: 'rgba(239, 68, 68, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }">
                      <td style="padding: 6px; color: #fbbf24; font-weight: 600;">{{ level.ratio }}%</td>
                      <td style="padding: 6px; text-align: right; color: #ef4444; font-weight: 600;">${{ level.price }}</td>
                      <td style="padding: 6px; text-align: right; color: #888;">{{ level.distance }}%</td>
                    </tr>
                  </tbody>
                </table>
              </n-gi>
            </n-grid>
          </div>
          <div v-else style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">🌀</div>
            <div>Click "🔍 Find Levels" to calculate Fibonacci levels</div>
          </div>
        </n-card>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const userID = useCookie('userID');

// State
const selectedExchange = ref('');
const selectedSymbol = ref('');
const selectedTimeframe = ref('');
const activeTab = ref('levels');
const isLoading = ref(false);

// Data
const levelsData = ref([]);
const pivotData = ref({});
const fibonacciData = ref({});

// Options
const exchangeOptions = ref([]);
const symbolOptions = ref([]);
const timeframeOptions = ref([]);

// Current price
const currentPrice = computed(() => {
  if (levelsData.value.length === 0) return '0.00';
  return levelsData.value[0]?.close || '0.00';
});

// Support levels (below current price)
const supportLevels = computed(() => {
  return levelsData.value.filter(l => l.type === 'support').sort((a, b) => b.priceNum - a.priceNum);
});

// Resistance levels (above current price)
const resistanceLevels = computed(() => {
  return levelsData.value.filter(l => l.type === 'resistance').sort((a, b) => a.priceNum - b.priceNum);
});

// Nearest support
const nearestSupport = computed(() => {
  const supports = supportLevels.value;
  if (supports.length === 0) return { price: '0.00', distance: '0.0' };
  return supports[0];
});

// Nearest resistance
const nearestResistance = computed(() => {
  const resistances = resistanceLevels.value;
  if (resistances.length === 0) return { price: '0.00', distance: '0.0' };
  return resistances[0];
});

// Range percentage
const rangePercent = computed(() => {
  if (!nearestSupport.value || !nearestResistance.value) return '0.0';
  const current = parseFloat(currentPrice.value);
  const support = parseFloat(nearestSupport.value.price);
  const resistance = parseFloat(nearestResistance.value.price);
  if (resistance === support) return '0.0';
  return (((resistance - support) / support) * 100).toFixed(2);
});

// Fetch Levels Data
async function fetchLevelsData() {
  isLoading.value = true;
  try {
    const response = await $fetch('/api/v1/getVolumeData', {
      params: {
        exchange: selectedExchange.value,
        symbol: selectedSymbol.value,
        timeframe: selectedTimeframe.value
      }
    });

    if (response && response.success && response.candles) {
      processLevelsData(response.candles);
    }
  } catch (error) {
    console.error('Error fetching levels data:', error);
  } finally {
    isLoading.value = false;
  }
}

// Process Levels Data
function processLevelsData(candles) {
  if (candles.length === 0) return;

  // Reverse for proper calculation (oldest to newest)
  const reversedCandles = [...candles].reverse();

  // Get current price (most recent candle)
  const currentCandle = candles[0];
  const currentPriceValue = currentCandle[4];

  // Find swing highs and lows for support/resistance
  const levels = findSupportResistanceLevels(reversedCandles, currentPriceValue);

  // Calculate pivot points
  const pivots = calculatePivotPoints(reversedCandles);
  pivotData.value = pivots;

  // Calculate Fibonacci levels
  const fib = calculateFibonacciLevels(reversedCandles, currentPriceValue);
  fibonacciData.value = fib;

  // Reverse back for display
  levelsData.value = levels;
}

// Find Support/Resistance Levels
function findSupportResistanceLevels(candles, currentPrice) {
  const levels = [];
  const lookback = Math.min(100, candles.length);
  const tolerance = 0.002; // 0.2% tolerance for level clustering

  // Find local highs and lows
  for (let i = 5; i < lookback - 5; i++) {
    const high = candles[i][2];
    const low = candles[i][3];

    // Check if it's a local high
    let isLocalHigh = true;
    for (let j = i - 5; j <= i + 5; j++) {
      if (j !== i && candles[j][2] > high) {
        isLocalHigh = false;
        break;
      }
    }

    // Check if it's a local low
    let isLocalLow = true;
    for (let j = i - 5; j <= i + 5; j++) {
      if (j !== i && candles[j][3] < low) {
        isLocalLow = false;
        break;
      }
    }

    if (isLocalHigh) {
      levels.push({
        price: high,
        type: high > currentPrice ? 'resistance' : 'support',
        touches: 1,
        timestamp: candles[i][0]
      });
    }

    if (isLocalLow) {
      levels.push({
        price: low,
        type: low > currentPrice ? 'resistance' : 'support',
        touches: 1,
        timestamp: candles[i][0]
      });
    }
  }

  // Cluster nearby levels
  const clusteredLevels = clusterLevels(levels, tolerance);

  // Format and score levels
  return clusteredLevels.map(level => {
    const distance = ((level.price - currentPrice) / currentPrice * 100).toFixed(2);
    const strength = Math.min(10, level.touches + (Math.abs(parseFloat(distance)) < 1 ? 3 : 0));

    return {
      price: level.price.toFixed(6),
      priceNum: level.price,
      distance: Math.abs(parseFloat(distance)).toFixed(2),
      strength,
      touches: level.touches,
      type: level.type,
      status: strength >= 8 ? 'Strong' : strength >= 5 ? 'Medium' : 'Weak',
      close: currentPrice.toFixed(6)
    };
  });
}

// Cluster nearby levels
function clusterLevels(levels, tolerance) {
  const clustered = [];

  levels.sort((a, b) => a.price - b.price);

  for (const level of levels) {
    const existing = clustered.find(c =>
      Math.abs(c.price - level.price) / c.price < tolerance
    );

    if (existing) {
      existing.touches++;
      existing.price = (existing.price + level.price) / 2; // Average price
    } else {
      clustered.push({ ...level });
    }
  }

  return clustered;
}

// Calculate Pivot Points
function calculatePivotPoints(candles) {
  if (candles.length < 2) return {};

  // Get yesterday's OHLC (last completed candle)
  const yesterday = candles[candles.length - 2];
  const high = yesterday[2];
  const low = yesterday[3];
  const close = yesterday[4];

  // Classic Pivots
  const pp = (high + low + close) / 3;
  const classic = {
    pp: pp.toFixed(6),
    r1: (2 * pp - low).toFixed(6),
    r2: (pp + (high - low)).toFixed(6),
    r3: (high + 2 * (pp - low)).toFixed(6),
    s1: (2 * pp - high).toFixed(6),
    s2: (pp - (high - low)).toFixed(6),
    s3: (low - 2 * (high - pp)).toFixed(6)
  };

  // Fibonacci Pivots
  const range = high - low;
  const fibonacci = {
    pp: pp.toFixed(6),
    r1: (pp + 0.382 * range).toFixed(6),
    r2: (pp + 0.618 * range).toFixed(6),
    r3: (pp + 1.000 * range).toFixed(6),
    s1: (pp - 0.382 * range).toFixed(6),
    s2: (pp - 0.618 * range).toFixed(6),
    s3: (pp - 1.000 * range).toFixed(6)
  };

  // Camarilla Pivots
  const camarilla = {
    pp: pp.toFixed(6),
    r1: (close + 1.1 * range / 12).toFixed(6),
    r2: (close + 1.1 * range / 6).toFixed(6),
    r3: (close + 1.1 * range / 4).toFixed(6),
    r4: (close + 1.1 * range / 2).toFixed(6),
    s1: (close - 1.1 * range / 12).toFixed(6),
    s2: (close - 1.1 * range / 6).toFixed(6),
    s3: (close - 1.1 * range / 4).toFixed(6),
    s4: (close - 1.1 * range / 2).toFixed(6)
  };

  return { classic, fibonacci, camarilla };
}

// Calculate Fibonacci Levels
function calculateFibonacciLevels(candles, currentPrice) {
  if (candles.length < 50) return {};

  // Find swing high and low in last 100 candles
  const lookback = Math.min(100, candles.length);
  const recentCandles = candles.slice(-lookback);

  let swingHigh = -Infinity;
  let swingLow = Infinity;

  for (const candle of recentCandles) {
    if (candle[2] > swingHigh) swingHigh = candle[2];
    if (candle[3] < swingLow) swingLow = candle[3];
  }

  const range = swingHigh - swingLow;

  // Retracement levels
  const fibRatios = [0, 23.6, 38.2, 50, 61.8, 78.6, 100];
  const levels = fibRatios.map(ratio => {
    const price = swingHigh - (range * ratio / 100);
    const distance = ((price - currentPrice) / currentPrice * 100).toFixed(2);
    return {
      ratio: ratio.toFixed(1),
      price: price.toFixed(6),
      distance: Math.abs(parseFloat(distance)).toFixed(2)
    };
  });

  // Extension levels
  const extRatios = [127.2, 161.8, 200, 261.8];
  const extensions = extRatios.map(ratio => {
    const price = swingHigh + (range * (ratio - 100) / 100);
    const distance = ((price - currentPrice) / currentPrice * 100).toFixed(2);
    return {
      ratio: ratio.toFixed(1),
      price: price.toFixed(6),
      distance: Math.abs(parseFloat(distance)).toFixed(2)
    };
  });

  return {
    swingHigh: swingHigh.toFixed(6),
    swingLow: swingLow.toFixed(6),
    levels,
    extensions
  };
}

// Load available data combinations
async function loadAvailableCombinations() {
  try {
    const response = await $fetch('/api/v1/getAvailableVolumeData');

    if (response && response.success && response.combinations) {
      const exchanges = [...new Set(response.combinations.map(c => c.exchange))];
      exchangeOptions.value = exchanges.map(ex => ({ label: ex.toUpperCase(), value: ex }));

      const symbols = [...new Set(response.combinations.map(c => c.symbol))];
      symbolOptions.value = symbols.map(sym => ({ label: sym, value: sym }));

      const timeframes = [...new Set(response.combinations.map(c => c.timeframe))];
      const timeframeLabels = {
        '1m': '1 Minute', '5m': '5 Minutes', '15m': '15 Minutes',
        '1h': '1 Hour', '4h': '4 Hours', '1d': '1 Day', '1w': '1 Week'
      };
      timeframeOptions.value = timeframes.map(tf => ({ label: timeframeLabels[tf] || tf, value: tf }));

      if (response.combinations.length > 0) {
        selectedExchange.value = response.combinations[0].exchange;
        selectedSymbol.value = response.combinations[0].symbol;
        selectedTimeframe.value = response.combinations[0].timeframe;
      }
    }
  } catch (error) {
    console.error('Error loading available combinations:', error);
  }
}

onMounted(() => {
  loadAvailableCombinations();
});
</script>
