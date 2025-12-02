<template>
  <div style="padding: 20px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="color: #10eb04; margin: 0;">🔄 Trend Analysis</h2>
      <n-button text @click="$router.push('/Analytics')" style="color: #60a5fa;">
        ← Back to Analytics
      </n-button>
    </div>

    <!-- Exchange & Symbol Selector -->
    <n-card size="small" style="margin-bottom: 20px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
      <n-grid :cols="4" x-gap="12">
        <n-gi>
          <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Exchange</div>
          <n-select v-model:value="selectedExchange" :options="exchangeOptions" size="small" />
        </n-gi>
        <n-gi>
          <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Symbol</div>
          <n-select v-model:value="selectedSymbol" :options="symbolOptions" size="small" filterable />
        </n-gi>
        <n-gi>
          <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Timeframe</div>
          <n-select v-model:value="selectedTimeframe" :options="timeframeOptions" size="small" />
        </n-gi>
        <n-gi style="display: flex; align-items: flex-end;">
          <n-button type="primary" size="small" @click="fetchTrendData" :loading="isLoading" style="width: 100%;">
            {{ isLoading ? 'Loading...' : '📊 Analyze Trend' }}
          </n-button>
        </n-gi>
      </n-grid>
    </n-card>

    <!-- Trend Analysis Tabs -->
    <n-tabs v-model:value="activeTab" type="card" animated>
      <!-- Tab 1: Overview -->
      <n-tab-pane name="overview" tab="📊 Overview">
        <n-card size="small" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
          <div v-if="trendData.current">
            <!-- Overall Trend Summary -->
            <n-grid :cols="5" x-gap="12" style="margin-bottom: 20px;">
              <n-gi>
                <div style="text-align: center; padding: 15px; background: rgba(96, 165, 250, 0.1); border-radius: 8px;">
                  <div style="font-size: 10px; color: #888; margin-bottom: 6px;">TREND</div>
                  <div :style="{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: trendData.current.trend === 'Strong Up' ? '#10eb04' :
                           trendData.current.trend === 'Up' ? '#4ade80' :
                           trendData.current.trend === 'Strong Down' ? '#ef4444' :
                           trendData.current.trend === 'Down' ? '#f87171' : '#fbbf24'
                  }">{{ trendData.current.trend }}</div>
                </div>
              </n-gi>
              <n-gi>
                <div style="text-align: center; padding: 15px; background: rgba(251, 191, 36, 0.1); border-radius: 8px;">
                  <div style="font-size: 10px; color: #888; margin-bottom: 6px;">STRENGTH</div>
                  <div style="font-size: 18px; font-weight: 700; color: #fbbf24;">{{ trendData.current.strength }}/10</div>
                </div>
              </n-gi>
              <n-gi>
                <div style="text-align: center; padding: 15px; background: rgba(167, 139, 250, 0.1); border-radius: 8px;">
                  <div style="font-size: 10px; color: #888; margin-bottom: 6px;">MOMENTUM</div>
                  <div :style="{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: trendData.current.momentum > 0 ? '#10eb04' : '#ef4444'
                  }">{{ trendData.current.momentum > 0 ? '+' : '' }}{{ trendData.current.momentum }}%</div>
                </div>
              </n-gi>
              <n-gi>
                <div style="text-align: center; padding: 15px; background: rgba(16, 235, 4, 0.1); border-radius: 8px;">
                  <div style="font-size: 10px; color: #888; margin-bottom: 6px;">CURRENT PRICE</div>
                  <div style="font-size: 18px; font-weight: 700; color: #10eb04;">${{ trendData.current.price }}</div>
                </div>
              </n-gi>
              <n-gi>
                <div style="text-align: center; padding: 15px; background: rgba(239, 68, 68, 0.1); border-radius: 8px;">
                  <div style="font-size: 10px; color: #888; margin-bottom: 6px;">VOLATILITY</div>
                  <div style="font-size: 18px; font-weight: 700; color: #ef4444;">{{ trendData.current.volatility }}</div>
                </div>
              </n-gi>
            </n-grid>

            <!-- MA Alignment Table -->
            <h3 style="color: #60a5fa; margin: 20px 0 10px 0; font-size: 14px;">Moving Averages Status</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead style="background: rgba(96, 165, 250, 0.1);">
                <tr>
                  <th style="padding: 6px; text-align: left; color: #888;">MA Period</th>
                  <th style="padding: 6px; text-align: right; color: #888;">Value</th>
                  <th style="padding: 6px; text-align: right; color: #888;">Distance</th>
                  <th style="padding: 6px; text-align: center; color: #888;">Position</th>
                  <th style="padding: 6px; text-align: center; color: #888;">Direction</th>
                  <th style="padding: 6px; text-align: left; color: #888;">Signal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ma in trendData.movingAverages" :key="ma.period"
                    :style="{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }">
                  <td style="padding: 6px; color: #60a5fa; font-weight: 600;">{{ ma.type }} {{ ma.period }}</td>
                  <td style="padding: 6px; text-align: right; color: #888;">${{ ma.value }}</td>
                  <td style="padding: 6px; text-align: right;" :style="{ color: parseFloat(ma.distance) > 0 ? '#10eb04' : '#ef4444' }">
                    {{ ma.distance }}%
                  </td>
                  <td style="padding: 6px; text-align: center;">
                    <span :style="{ color: ma.position === 'Above' ? '#10eb04' : '#ef4444' }">{{ ma.position }}</span>
                  </td>
                  <td style="padding: 6px; text-align: center; font-size: 14px;">{{ ma.direction }}</td>
                  <td style="padding: 6px; color: #fbbf24; font-size: 10px;">{{ ma.signal }}</td>
                </tr>
              </tbody>
            </table>

            <!-- MA Crossovers -->
            <div v-if="trendData.crossovers && trendData.crossovers.length > 0">
              <h3 style="color: #fbbf24; margin: 20px 0 10px 0; font-size: 14px;">⚡ Recent Crossovers</h3>
              <div v-for="cross in trendData.crossovers" :key="cross.id"
                   style="padding: 10px; margin-bottom: 10px; background: rgba(251, 191, 36, 0.05); border-radius: 6px; border-left: 3px solid;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <span :style="{ color: cross.type === 'Bullish' ? '#10eb04' : '#ef4444', fontWeight: '700' }">
                      {{ cross.type === 'Bullish' ? '🔼' : '🔽' }} {{ cross.type }}
                    </span>
                    <span style="color: #888; margin-left: 10px; font-size: 11px;">{{ cross.description }}</span>
                  </div>
                  <div style="font-size: 10px; color: #888;">{{ cross.timeAgo }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-else style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">📊</div>
            <div>Click "📊 Analyze Trend" to start analysis</div>
          </div>
        </n-card>
      </n-tab-pane>

      <!-- Tab 2: Moving Averages -->
      <n-tab-pane name="ma" tab="📈 Moving Averages">
        <n-card size="small" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
          <div v-if="maData.length > 0">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead style="background: rgba(96, 165, 250, 0.1); position: sticky; top: 0;">
                <tr>
                  <th style="padding: 6px; text-align: left; color: #888;">Time</th>
                  <th style="padding: 6px; text-align: right; color: #888;">Close</th>
                  <th style="padding: 6px; text-align: right; color: #60a5fa;">EMA 20</th>
                  <th style="padding: 6px; text-align: right; color: #10eb04;">EMA 50</th>
                  <th style="padding: 6px; text-align: right; color: #fbbf24;">EMA 100</th>
                  <th style="padding: 6px; text-align: right; color: #ef4444;">EMA 200</th>
                  <th style="padding: 6px; text-align: center; color: #888;">Signal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in maData" :key="index"
                    :style="{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }">
                  <td style="padding: 6px; color: #888; font-size: 9px;">
                    {{ new Date(row.timestamp).toLocaleString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
                  </td>
                  <td style="padding: 6px; text-align: right; font-weight: 600;" :style="{ color: row.isGreen ? '#10eb04' : '#ef4444' }">
                    ${{ row.close }}
                  </td>
                  <td style="padding: 6px; text-align: right; color: #60a5fa;">${{ row.ema20 }}</td>
                  <td style="padding: 6px; text-align: right; color: #10eb04;">${{ row.ema50 }}</td>
                  <td style="padding: 6px; text-align: right; color: #fbbf24;">${{ row.ema100 }}</td>
                  <td style="padding: 6px; text-align: right; color: #ef4444;">${{ row.ema200 }}</td>
                  <td style="padding: 6px; text-align: center; font-size: 10px;">
                    <span :style="{ color: row.signal === 'BUY' ? '#10eb04' : row.signal === 'SELL' ? '#ef4444' : '#888' }">
                      {{ row.signal }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">📈</div>
            <div>No data available</div>
          </div>
        </n-card>
      </n-tab-pane>

      <!-- Tab 3: Ichimoku Cloud -->
      <n-tab-pane name="ichimoku" tab="☁️ Ichimoku">
        <n-card size="small" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
          <div v-if="ichimokuData.length > 0">
            <!-- Ichimoku Summary -->
            <n-card size="small" style="margin-bottom: 20px; background: rgba(167, 139, 250, 0.05);">
              <div style="text-align: center;">
                <div style="font-size: 11px; color: #888; margin-bottom: 8px;">ICHIMOKU CLOUD SIGNAL</div>
                <div :style="{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: ichimokuSignal === 'Strong Bullish' ? '#10eb04' :
                         ichimokuSignal === 'Bullish' ? '#4ade80' :
                         ichimokuSignal === 'Strong Bearish' ? '#ef4444' :
                         ichimokuSignal === 'Bearish' ? '#f87171' : '#fbbf24'
                }">{{ ichimokuSignal }}</div>
              </div>
            </n-card>

            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead style="background: rgba(167, 139, 250, 0.1); position: sticky; top: 0;">
                <tr>
                  <th style="padding: 6px; text-align: left; color: #888;">Time</th>
                  <th style="padding: 6px; text-align: right; color: #888;">Close</th>
                  <th style="padding: 6px; text-align: right; color: #60a5fa;">Tenkan</th>
                  <th style="padding: 6px; text-align: right; color: #ef4444;">Kijun</th>
                  <th style="padding: 6px; text-align: right; color: #10eb04;">Senkou A</th>
                  <th style="padding: 6px; text-align: right; color: #fbbf24;">Senkou B</th>
                  <th style="padding: 6px; text-align: center; color: #888;">Cloud</th>
                  <th style="padding: 6px; text-align: center; color: #888;">Signal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in ichimokuData" :key="index"
                    :style="{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }">
                  <td style="padding: 6px; color: #888; font-size: 9px;">
                    {{ new Date(row.timestamp).toLocaleString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
                  </td>
                  <td style="padding: 6px; text-align: right; font-weight: 600;" :style="{ color: row.isGreen ? '#10eb04' : '#ef4444' }">
                    ${{ row.close }}
                  </td>
                  <td style="padding: 6px; text-align: right; color: #60a5fa;">${{ row.tenkan }}</td>
                  <td style="padding: 6px; text-align: right; color: #ef4444;">${{ row.kijun }}</td>
                  <td style="padding: 6px; text-align: right; color: #10eb04;">${{ row.senkouA }}</td>
                  <td style="padding: 6px; text-align: right; color: #fbbf24;">${{ row.senkouB }}</td>
                  <td style="padding: 6px; text-align: center;">
                    <span :style="{ color: row.cloudColor === 'green' ? '#10eb04' : '#ef4444', fontSize: '10px' }">
                      {{ row.cloudColor === 'green' ? '🟢 Bullish' : '🔴 Bearish' }}
                    </span>
                  </td>
                  <td style="padding: 6px; text-align: center; font-size: 10px;">
                    <span :style="{ color: row.signal === 'BUY' ? '#10eb04' : row.signal === 'SELL' ? '#ef4444' : '#888' }">
                      {{ row.signal }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">☁️</div>
            <div>No data available</div>
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
const activeTab = ref('overview');
const isLoading = ref(false);

// Data
const trendData = ref({});
const maData = ref([]);
const ichimokuData = ref([]);

// Options
const exchangeOptions = ref([]);
const symbolOptions = ref([]);
const timeframeOptions = ref([]);

// Ichimoku Signal
const ichimokuSignal = computed(() => {
  if (ichimokuData.value.length === 0) return 'Neutral';
  const recent = ichimokuData.value[0];

  const priceAboveCloud = parseFloat(recent.close) > Math.max(parseFloat(recent.senkouA), parseFloat(recent.senkouB));
  const priceBelowCloud = parseFloat(recent.close) < Math.min(parseFloat(recent.senkouA), parseFloat(recent.senkouB));
  const tenkanAboveKijun = parseFloat(recent.tenkan) > parseFloat(recent.kijun);
  const greenCloud = recent.cloudColor === 'green';

  if (priceAboveCloud && tenkanAboveKijun && greenCloud) return 'Strong Bullish';
  if (priceAboveCloud) return 'Bullish';
  if (priceBelowCloud && !tenkanAboveKijun && !greenCloud) return 'Strong Bearish';
  if (priceBelowCloud) return 'Bearish';
  return 'Neutral';
});

// Fetch Trend Data
async function fetchTrendData() {
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
      processTrendData(response.candles);
    }
  } catch (error) {
    console.error('Error fetching trend data:', error);
  } finally {
    isLoading.value = false;
  }
}

// Process Trend Data
function processTrendData(candles) {
  const reversedCandles = [...candles].reverse();

  // Calculate Moving Averages
  const maCalculated = calculateMovingAverages(reversedCandles);
  maData.value = maCalculated.reverse();

  // Calculate Ichimoku
  const ichimokuCalculated = calculateIchimoku(reversedCandles);
  ichimokuData.value = ichimokuCalculated.reverse();

  // Calculate trend overview
  const overview = calculateTrendOverview(reversedCandles, maCalculated);
  trendData.value = overview;
}

// Calculate Moving Averages
function calculateMovingAverages(candles) {
  return candles.map((candle, index) => {
    const [timestamp, open, high, low, close] = candle;

    const ema20 = calculateEMA(candles, index, 20);
    const ema50 = calculateEMA(candles, index, 50);
    const ema100 = calculateEMA(candles, index, 100);
    const ema200 = calculateEMA(candles, index, 200);

    // Determine signal
    let signal = 'HOLD';
    if (close > ema20 && ema20 > ema50 && ema50 > ema100) signal = 'BUY';
    else if (close < ema20 && ema20 < ema50 && ema50 < ema100) signal = 'SELL';

    return {
      timestamp,
      close: close.toFixed(6),
      isGreen: close >= open,
      ema20: ema20.toFixed(6),
      ema50: ema50.toFixed(6),
      ema100: ema100.toFixed(6),
      ema200: ema200.toFixed(6),
      signal
    };
  });
}

// Calculate EMA
function calculateEMA(candles, currentIndex, period) {
  if (currentIndex < 0) return 0;

  const actualPeriod = Math.min(period, currentIndex + 1);
  const multiplier = 2 / (actualPeriod + 1);

  let sum = 0;
  const startIdx = Math.max(0, currentIndex - actualPeriod + 1);
  for (let i = startIdx; i <= currentIndex; i++) {
    sum += candles[i][4];
  }
  let ema = sum / actualPeriod;

  for (let i = startIdx; i <= currentIndex; i++) {
    ema = (candles[i][4] - ema) * multiplier + ema;
  }

  return ema;
}

// Calculate Ichimoku
function calculateIchimoku(candles) {
  return candles.map((candle, index) => {
    const [timestamp, open, high, low, close] = candle;

    // Tenkan-sen (Conversion Line): (9-period high + 9-period low)/2
    const tenkan = calculateMidpoint(candles, index, 9);

    // Kijun-sen (Base Line): (26-period high + 26-period low)/2
    const kijun = calculateMidpoint(candles, index, 26);

    // Senkou Span A (Leading Span A): (Conversion + Base)/2, plotted 26 periods ahead
    const senkouA = (tenkan + kijun) / 2;

    // Senkou Span B (Leading Span B): (52-period high + 52-period low)/2, plotted 26 periods ahead
    const senkouB = calculateMidpoint(candles, index, 52);

    // Cloud color
    const cloudColor = senkouA > senkouB ? 'green' : 'red';

    // Signal
    let signal = 'HOLD';
    if (close > Math.max(senkouA, senkouB) && tenkan > kijun) signal = 'BUY';
    else if (close < Math.min(senkouA, senkouB) && tenkan < kijun) signal = 'SELL';

    return {
      timestamp,
      close: close.toFixed(6),
      isGreen: close >= open,
      tenkan: tenkan.toFixed(6),
      kijun: kijun.toFixed(6),
      senkouA: senkouA.toFixed(6),
      senkouB: senkouB.toFixed(6),
      cloudColor,
      signal
    };
  });
}

// Calculate midpoint for Ichimoku
function calculateMidpoint(candles, currentIndex, period) {
  const actualPeriod = Math.min(period, currentIndex + 1);
  const startIdx = Math.max(0, currentIndex - actualPeriod + 1);

  let highest = -Infinity;
  let lowest = Infinity;

  for (let i = startIdx; i <= currentIndex; i++) {
    if (candles[i][2] > highest) highest = candles[i][2];
    if (candles[i][3] < lowest) lowest = candles[i][3];
  }

  return (highest + lowest) / 2;
}

// Calculate Trend Overview
function calculateTrendOverview(candles, maData) {
  if (candles.length < 50) return {};

  const currentCandle = candles[candles.length - 1];
  const currentPrice = currentCandle[4];

  // Get recent MAs
  const recent = maData[maData.length - 1];
  const ema20 = parseFloat(recent.ema20);
  const ema50 = parseFloat(recent.ema50);
  const ema100 = parseFloat(recent.ema100);
  const ema200 = parseFloat(recent.ema200);

  // Determine trend
  let trend = 'Sideways';
  let strength = 5;

  if (currentPrice > ema20 && ema20 > ema50 && ema50 > ema100 && ema100 > ema200) {
    trend = 'Strong Up';
    strength = 9;
  } else if (currentPrice > ema20 && ema20 > ema50) {
    trend = 'Up';
    strength = 7;
  } else if (currentPrice < ema20 && ema20 < ema50 && ema50 < ema100 && ema100 < ema200) {
    trend = 'Strong Down';
    strength = 2;
  } else if (currentPrice < ema20 && ema20 < ema50) {
    trend = 'Down';
    strength = 3;
  }

  // Calculate momentum
  const priceChange = ((currentPrice - candles[candles.length - 20][4]) / candles[candles.length - 20][4] * 100);

  // Volatility (ATR-based)
  const atr = calculateATR(candles, candles.length - 1, 14);
  const volatility = ((atr / currentPrice) * 100).toFixed(2) + '%';

  // MA array for table
  const movingAverages = [
    {
      type: 'EMA',
      period: 20,
      value: ema20.toFixed(6),
      distance: (((currentPrice - ema20) / ema20) * 100).toFixed(2),
      position: currentPrice > ema20 ? 'Above' : 'Below',
      direction: ema20 > parseFloat(maData[maData.length - 2]?.ema20 || 0) ? '↑' : '↓',
      signal: currentPrice > ema20 ? 'Bullish' : 'Bearish'
    },
    {
      type: 'EMA',
      period: 50,
      value: ema50.toFixed(6),
      distance: (((currentPrice - ema50) / ema50) * 100).toFixed(2),
      position: currentPrice > ema50 ? 'Above' : 'Below',
      direction: ema50 > parseFloat(maData[maData.length - 2]?.ema50 || 0) ? '↑' : '↓',
      signal: currentPrice > ema50 ? 'Bullish' : 'Bearish'
    },
    {
      type: 'EMA',
      period: 100,
      value: ema100.toFixed(6),
      distance: (((currentPrice - ema100) / ema100) * 100).toFixed(2),
      position: currentPrice > ema100 ? 'Above' : 'Below',
      direction: ema100 > parseFloat(maData[maData.length - 2]?.ema100 || 0) ? '↑' : '↓',
      signal: currentPrice > ema100 ? 'Bullish' : 'Bearish'
    },
    {
      type: 'EMA',
      period: 200,
      value: ema200.toFixed(6),
      distance: (((currentPrice - ema200) / ema200) * 100).toFixed(2),
      position: currentPrice > ema200 ? 'Above' : 'Below',
      direction: ema200 > parseFloat(maData[maData.length - 2]?.ema200 || 0) ? '↑' : '↓',
      signal: currentPrice > ema200 ? 'Bullish' : 'Bearish'
    }
  ];

  // Detect crossovers
  const crossovers = [];
  if (maData.length > 1) {
    const prev = maData[maData.length - 2];

    // Golden Cross (50 crosses above 200)
    if (ema50 > ema200 && parseFloat(prev.ema50) <= parseFloat(prev.ema200)) {
      crossovers.push({
        id: 1,
        type: 'Bullish',
        description: 'Golden Cross (EMA 50 > EMA 200)',
        timeAgo: 'Just now'
      });
    }

    // Death Cross (50 crosses below 200)
    if (ema50 < ema200 && parseFloat(prev.ema50) >= parseFloat(prev.ema200)) {
      crossovers.push({
        id: 2,
        type: 'Bearish',
        description: 'Death Cross (EMA 50 < EMA 200)',
        timeAgo: 'Just now'
      });
    }
  }

  return {
    current: {
      trend,
      strength,
      momentum: priceChange.toFixed(2),
      price: currentPrice.toFixed(6),
      volatility
    },
    movingAverages,
    crossovers
  };
}

// Calculate ATR
function calculateATR(candles, currentIndex, period = 14) {
  if (currentIndex < 1) return 0;

  const actualPeriod = Math.min(period, currentIndex);
  let sum = 0;

  for (let i = Math.max(1, currentIndex - actualPeriod + 1); i <= currentIndex; i++) {
    const high = candles[i][2];
    const low = candles[i][3];
    const prevClose = candles[i - 1][4];

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    sum += tr;
  }

  return sum / actualPeriod;
}

// Load available combinations
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
    console.error('Error loading combinations:', error);
  }
}

onMounted(() => {
  loadAvailableCombinations();
});
</script>
