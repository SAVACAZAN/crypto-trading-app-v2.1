<template>
  <div style="padding: 20px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="color: #10eb04; margin: 0;">📈 Technical Indicators Analysis</h2>
      <n-button text @click="$router.push('/Analytics')" style="color: #60a5fa;">
        ← Back to Analytics
      </n-button>
    </div>

    <!-- Exchange & Symbol Selector -->
    <n-card size="small" style="margin-bottom: 20px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
      <n-grid :cols="4" x-gap="12">
        <n-gi>
          <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Exchange</div>
          <n-select
            v-model:value="selectedExchange"
            :options="exchangeOptions"
            size="small"
            placeholder="Select Exchange"
          />
        </n-gi>
        <n-gi>
          <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Symbol</div>
          <n-select
            v-model:value="selectedSymbol"
            :options="symbolOptions"
            size="small"
            placeholder="Select Symbol"
            filterable
          />
        </n-gi>
        <n-gi>
          <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Timeframe</div>
          <n-select
            v-model:value="selectedTimeframe"
            :options="timeframeOptions"
            size="small"
          />
        </n-gi>
        <n-gi style="display: flex; align-items: flex-end;">
          <n-button
            type="primary"
            size="small"
            @click="fetchIndicatorData"
            :loading="isLoading"
            style="width: 100%;"
          >
            {{ isLoading ? 'Loading...' : '🔄 Analyze Indicators' }}
          </n-button>
        </n-gi>
      </n-grid>
    </n-card>

    <!-- Technical Indicators Tabs -->
    <n-tabs v-model:value="activeTab" type="card" animated>
      <!-- Tab 1: RSI Analysis -->
      <n-tab-pane name="rsi" tab="📊 RSI">
        <n-card size="small" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
          <div v-if="isLoading" style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">⏳</div>
            <div>Loading RSI data...</div>
          </div>

          <div v-else-if="indicatorData.length === 0" style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">📊</div>
            <div>No data available. Click "🔄 Analyze Indicators" to load data.</div>
          </div>

          <div v-else>
            <!-- RSI Stats -->
            <n-grid :cols="4" x-gap="12" style="margin-bottom: 20px;">
              <n-gi>
                <div style="text-align: center; padding: 12px; background: rgba(239, 68, 68, 0.1); border-radius: 8px;">
                  <div style="font-size: 10px; color: #888; margin-bottom: 4px;">OVERBOUGHT (>70)</div>
                  <div style="font-size: 20px; color: #ef4444; font-weight: 700;">{{ rsiStats.overbought }}</div>
                </div>
              </n-gi>
              <n-gi>
                <div style="text-align: center; padding: 12px; background: rgba(16, 235, 4, 0.1); border-radius: 8px;">
                  <div style="font-size: 10px; color: #888; margin-bottom: 4px;">OVERSOLD (<30)</div>
                  <div style="font-size: 20px; color: #10eb04; font-weight: 700;">{{ rsiStats.oversold }}</div>
                </div>
              </n-gi>
              <n-gi>
                <div style="text-align: center; padding: 12px; background: rgba(251, 191, 36, 0.1); border-radius: 8px;">
                  <div style="font-size: 10px; color: #888; margin-bottom: 4px;">AVG RSI</div>
                  <div style="font-size: 20px; color: #fbbf24; font-weight: 700;">{{ rsiStats.average }}</div>
                </div>
              </n-gi>
              <n-gi>
                <div style="text-align: center; padding: 12px; background: rgba(96, 165, 250, 0.1); border-radius: 8px;">
                  <div style="font-size: 10px; color: #888; margin-bottom: 4px;">CURRENT RSI</div>
                  <div style="font-size: 20px; font-weight: 700;"
                       :style="{ color: rsiStats.current > 70 ? '#ef4444' : rsiStats.current < 30 ? '#10eb04' : '#fbbf24' }">
                    {{ rsiStats.current }}
                  </div>
                </div>
              </n-gi>
            </n-grid>

            <!-- RSI Table -->
            <div style="max-height: 600px; overflow-y: auto;">
              <table style="width: 100%; font-size: 10px; font-family: monospace; border-collapse: collapse;">
                <thead style="position: sticky; top: 0; background: #0f172a; z-index: 10;">
                  <tr style="border-bottom: 2px solid #fbbf24;">
                    <th style="padding: 6px; text-align: left; color: #fbbf24;">#</th>
                    <th style="padding: 6px; text-align: left; color: #fbbf24;">Time</th>
                    <th style="padding: 6px; text-align: right; color: #60a5fa;">Close</th>
                    <th style="padding: 6px; text-align: right; color: #fbbf24;">RSI(14)</th>
                    <th style="padding: 6px; text-align: center; color: #10eb04;">Status</th>
                    <th style="padding: 6px; text-align: center; color: #ef4444;">Signal</th>
                    <th style="padding: 6px; text-align: right; color: #a78bfa;">Divergence</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(candle, index) in indicatorData" :key="index"
                      :style="{
                        background: candle.isGreen ? 'rgba(16, 235, 4, 0.05)' : 'rgba(245, 42, 9, 0.05)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                      }">
                    <td style="padding: 6px; color: #888;">{{ index + 1 }}</td>
                    <td style="padding: 6px; color: #888; font-size: 9px;">
                      {{ new Date(candle.timestamp).toLocaleString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
                    </td>
                    <td style="padding: 6px; text-align: right; font-weight: 600;"
                        :style="{ color: candle.isGreen ? '#10eb04' : '#f52a09' }">
                      {{ candle.close }}
                    </td>
                    <td style="padding: 6px; text-align: right; font-weight: 700; font-size: 12px;"
                        :style="{ color: candle.rsi > 70 ? '#ef4444' : candle.rsi < 30 ? '#10eb04' : '#fbbf24' }">
                      {{ candle.rsi }}
                    </td>
                    <td style="padding: 6px; text-align: center; font-size: 11px; font-weight: 600;"
                        :style="{ color: candle.rsiStatus === 'Overbought' ? '#ef4444' : candle.rsiStatus === 'Oversold' ? '#10eb04' : '#888' }">
                      {{ candle.rsiStatus }}
                    </td>
                    <td style="padding: 6px; text-align: center; font-size: 11px; font-weight: 600;"
                        :style="{ color: candle.rsiSignal === 'BUY' ? '#10eb04' : candle.rsiSignal === 'SELL' ? '#ef4444' : '#888' }">
                      {{ candle.rsiSignal }}
                    </td>
                    <td style="padding: 6px; text-align: right; font-size: 11px;">{{ candle.rsiDivergence }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </n-card>
      </n-tab-pane>

      <!-- Tab 2: MACD Analysis -->
      <n-tab-pane name="macd" tab="📉 MACD">
        <n-card size="small" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
          <div v-if="isLoading" style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">⏳</div>
            <div>Loading MACD data...</div>
          </div>

          <div v-else-if="indicatorData.length === 0" style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">📉</div>
            <div>No data available.</div>
          </div>

          <div v-else style="max-height: 600px; overflow-y: auto;">
            <table style="width: 100%; font-size: 10px; font-family: monospace; border-collapse: collapse;">
              <thead style="position: sticky; top: 0; background: #0f172a; z-index: 10;">
                <tr style="border-bottom: 2px solid #60a5fa;">
                  <th style="padding: 6px; text-align: left; color: #60a5fa;">#</th>
                  <th style="padding: 6px; text-align: left; color: #60a5fa;">Time</th>
                  <th style="padding: 6px; text-align: right; color: #fbbf24;">Close</th>
                  <th style="padding: 6px; text-align: right; color: #10eb04;">MACD</th>
                  <th style="padding: 6px; text-align: right; color: #a78bfa;">Signal</th>
                  <th style="padding: 6px; text-align: right; color: #f472b6;">Histogram</th>
                  <th style="padding: 6px; text-align: center; color: #ef4444;">Crossover</th>
                  <th style="padding: 6px; text-align: center; color: #4ade80;">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(candle, index) in indicatorData" :key="index"
                    :style="{
                      background: candle.isGreen ? 'rgba(16, 235, 4, 0.05)' : 'rgba(245, 42, 9, 0.05)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                    }">
                  <td style="padding: 6px; color: #888;">{{ index + 1 }}</td>
                  <td style="padding: 6px; color: #888; font-size: 9px;">
                    {{ new Date(candle.timestamp).toLocaleString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
                  </td>
                  <td style="padding: 6px; text-align: right; font-weight: 600;"
                      :style="{ color: candle.isGreen ? '#10eb04' : '#f52a09' }">
                    {{ candle.close }}
                  </td>
                  <td style="padding: 6px; text-align: right; font-weight: 600;"
                      :style="{ color: parseFloat(candle.macd) > 0 ? '#10eb04' : '#ef4444' }">
                    {{ candle.macd }}
                  </td>
                  <td style="padding: 6px; text-align: right; color: #a78bfa;">{{ candle.macdSignal }}</td>
                  <td style="padding: 6px; text-align: right; font-weight: 600;"
                      :style="{ color: parseFloat(candle.macdHistogram) > 0 ? '#10eb04' : '#ef4444' }">
                    {{ candle.macdHistogram }}
                  </td>
                  <td style="padding: 6px; text-align: center; font-size: 11px;">{{ candle.macdCrossover }}</td>
                  <td style="padding: 6px; text-align: center; font-weight: 600;"
                      :style="{ color: candle.macdAction === 'BUY' ? '#10eb04' : candle.macdAction === 'SELL' ? '#ef4444' : '#888' }">
                    {{ candle.macdAction }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </n-card>
      </n-tab-pane>

      <!-- Tab 3: Bollinger Bands -->
      <n-tab-pane name="bollinger" tab="📊 Bollinger Bands">
        <n-card size="small" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
          <div v-if="isLoading" style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">⏳</div>
            <div>Loading Bollinger Bands data...</div>
          </div>

          <div v-else-if="indicatorData.length === 0" style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">📊</div>
            <div>No data available.</div>
          </div>

          <div v-else style="max-height: 600px; overflow-y: auto;">
            <table style="width: 100%; font-size: 10px; font-family: monospace; border-collapse: collapse;">
              <thead style="position: sticky; top: 0; background: #0f172a; z-index: 10;">
                <tr style="border-bottom: 2px solid #8b5cf6;">
                  <th style="padding: 6px; text-align: left; color: #8b5cf6;">#</th>
                  <th style="padding: 6px; text-align: left; color: #8b5cf6;">Time</th>
                  <th style="padding: 6px; text-align: right; color: #ef4444;">Upper BB</th>
                  <th style="padding: 6px; text-align: right; color: #60a5fa;">Middle BB</th>
                  <th style="padding: 6px; text-align: right; color: #10eb04;">Lower BB</th>
                  <th style="padding: 6px; text-align: right; color: #fbbf24;">Close</th>
                  <th style="padding: 6px; text-align: right; color: #f472b6;">%B</th>
                  <th style="padding: 6px; text-align: right; color: #a78bfa;">BB Width</th>
                  <th style="padding: 6px; text-align: center; color: #4ade80;">Signal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(candle, index) in indicatorData" :key="index"
                    :style="{
                      background: candle.isGreen ? 'rgba(16, 235, 4, 0.05)' : 'rgba(245, 42, 9, 0.05)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                    }">
                  <td style="padding: 6px; color: #888;">{{ index + 1 }}</td>
                  <td style="padding: 6px; color: #888; font-size: 9px;">
                    {{ new Date(candle.timestamp).toLocaleString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
                  </td>
                  <td style="padding: 6px; text-align: right; color: #ef4444;">{{ candle.bbUpper }}</td>
                  <td style="padding: 6px; text-align: right; color: #60a5fa;">{{ candle.bbMiddle }}</td>
                  <td style="padding: 6px; text-align: right; color: #10eb04;">{{ candle.bbLower }}</td>
                  <td style="padding: 6px; text-align: right; font-weight: 600; color: #fbbf24;">{{ candle.close }}</td>
                  <td style="padding: 6px; text-align: right; font-weight: 600; color: #f472b6;">{{ candle.bbPercentB }}</td>
                  <td style="padding: 6px; text-align: right; color: #a78bfa;">{{ candle.bbWidth }}</td>
                  <td style="padding: 6px; text-align: center; font-weight: 600;"
                      :style="{ color: candle.bbSignal === 'BUY' ? '#10eb04' : candle.bbSignal === 'SELL' ? '#ef4444' : '#888' }">
                    {{ candle.bbSignal }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </n-card>
      </n-tab-pane>

      <!-- Tab 4: Stochastic Oscillator -->
      <n-tab-pane name="stochastic" tab="⚡ Stochastic">
        <n-card size="small" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
          <div v-if="isLoading" style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">⏳</div>
            <div>Loading Stochastic data...</div>
          </div>

          <div v-else-if="indicatorData.length === 0" style="text-align: center; padding: 40px; color: #888;">
            <div style="font-size: 48px; margin-bottom: 12px;">⚡</div>
            <div>No data available.</div>
          </div>

          <div v-else style="max-height: 600px; overflow-y: auto;">
            <table style="width: 100%; font-size: 10px; font-family: monospace; border-collapse: collapse;">
              <thead style="position: sticky; top: 0; background: #0f172a; z-index: 10;">
                <tr style="border-bottom: 2px solid #10eb04;">
                  <th style="padding: 6px; text-align: left; color: #10eb04;">#</th>
                  <th style="padding: 6px; text-align: left; color: #10eb04;">Time</th>
                  <th style="padding: 6px; text-align: right; color: #fbbf24;">Close</th>
                  <th style="padding: 6px; text-align: right; color: #4ade80;">%K</th>
                  <th style="padding: 6px; text-align: right; color: #ef4444;">%D</th>
                  <th style="padding: 6px; text-align: center; color: #60a5fa;">Status</th>
                  <th style="padding: 6px; text-align: center; color: #f472b6;">Signal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(candle, index) in indicatorData" :key="index"
                    :style="{
                      background: candle.isGreen ? 'rgba(16, 235, 4, 0.05)' : 'rgba(245, 42, 9, 0.05)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                    }">
                  <td style="padding: 6px; color: #888;">{{ index + 1 }}</td>
                  <td style="padding: 6px; color: #888; font-size: 9px;">
                    {{ new Date(candle.timestamp).toLocaleString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
                  </td>
                  <td style="padding: 6px; text-align: right; font-weight: 600;"
                      :style="{ color: candle.isGreen ? '#10eb04' : '#f52a09' }">
                    {{ candle.close }}
                  </td>
                  <td style="padding: 6px; text-align: right; font-weight: 600; color: #4ade80;">{{ candle.stochK }}</td>
                  <td style="padding: 6px; text-align: right; font-weight: 600; color: #ef4444;">{{ candle.stochD }}</td>
                  <td style="padding: 6px; text-align: center; font-size: 11px; font-weight: 600;"
                      :style="{ color: candle.stochStatus === 'Overbought' ? '#ef4444' : candle.stochStatus === 'Oversold' ? '#10eb04' : '#888' }">
                    {{ candle.stochStatus }}
                  </td>
                  <td style="padding: 6px; text-align: center; font-weight: 600;"
                      :style="{ color: candle.stochSignal === 'BUY' ? '#10eb04' : candle.stochSignal === 'SELL' ? '#ef4444' : '#888' }">
                    {{ candle.stochSignal }}
                  </td>
                </tr>
              </tbody>
            </table>
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
const activeTab = ref('rsi');
const isLoading = ref(false);
const indicatorData = ref([]);
const errorMessage = ref('');

// Dynamic Options
const exchangeOptions = ref([]);
const symbolOptions = ref([]);
const timeframeOptions = ref([]);

// RSI Statistics
const rsiStats = computed(() => {
  if (indicatorData.value.length === 0) {
    return { overbought: 0, oversold: 0, average: '0.0', current: '0.0' };
  }

  // Ensure RSI values are numbers
  const rsiValues = indicatorData.value.map(c => parseFloat(c.rsi) || 0);
  const overbought = rsiValues.filter(r => r > 70).length;
  const oversold = rsiValues.filter(r => r < 30).length;

  // Calculate average
  const sum = rsiValues.reduce((a, b) => a + b, 0);
  const average = rsiValues.length > 0 ? (sum / rsiValues.length).toFixed(1) : '0.0';

  // Get current (most recent) RSI - first element in array since data is sorted newest first
  const current = rsiValues.length > 0 ? rsiValues[0].toFixed(1) : '0.0';

  return { overbought, oversold, average, current };
});

// Fetch Indicator Data
async function fetchIndicatorData() {
  isLoading.value = true;
  try {
    const response = await $fetch('/api/v1/getVolumeData', {
      method: 'GET',
      params: {
        exchange: selectedExchange.value,
        symbol: selectedSymbol.value,
        timeframe: selectedTimeframe.value
      }
    });

    if (response && response.success && response.candles && response.candles.length > 0) {
      processIndicatorData(response.candles);
      errorMessage.value = '';
    } else {
      errorMessage.value = response.error || 'No data available';
      indicatorData.value = [];
    }
  } catch (error) {
    console.error('Error fetching indicator data:', error);
    indicatorData.value = [];
  } finally {
    isLoading.value = false;
  }
}

// Process Indicator Data
function processIndicatorData(candles) {
  // IMPORTANT: Reverse candles array for calculation (oldest to newest)
  // This ensures each candle has proper historical context
  const reversedCandles = [...candles].reverse();

  // Calculate indicators with proper historical context
  const calculated = reversedCandles.map((candle, index) => {
    const [timestamp, open, high, low, close, volume] = candle;
    const isGreen = close >= open;

    // Calculate RSI (14-period) - now has proper historical context
    const rsi = calculateRSI(reversedCandles, index, 14);
    const rsiStatus = rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral';
    const rsiSignal = rsi < 30 ? 'BUY' : rsi > 70 ? 'SELL' : 'HOLD';

    // Calculate MACD (12, 26, 9) - with proper historical context
    const { macd, signal, histogram } = calculateMACD(reversedCandles, index);
    const macdCrossover = histogram > 0 && index > 0 && calculateMACD(reversedCandles, index - 1).histogram <= 0 ? '🔼 Bullish' :
                          histogram < 0 && index > 0 && calculateMACD(reversedCandles, index - 1).histogram >= 0 ? '🔽 Bearish' : '-';
    const macdAction = histogram > 0 ? 'BUY' : histogram < 0 ? 'SELL' : 'HOLD';

    // Calculate Bollinger Bands (20, 2) - with proper historical context
    const { upper, middle, lower, percentB, width } = calculateBollingerBands(reversedCandles, index);
    const bbSignal = close < lower ? 'BUY' : close > upper ? 'SELL' : 'HOLD';

    // Calculate Stochastic (14, 3, 3) - with proper historical context
    const { k, d } = calculateStochastic(reversedCandles, index);
    const stochStatus = k > 80 ? 'Overbought' : k < 20 ? 'Oversold' : 'Neutral';
    const stochSignal = k < 20 && k > d ? 'BUY' : k > 80 && k < d ? 'SELL' : 'HOLD';

    return {
      timestamp,
      isGreen,
      open: open.toFixed(6),
      high: high.toFixed(6),
      low: low.toFixed(6),
      close: close.toFixed(6),
      volume: volume.toLocaleString('en-US', { maximumFractionDigits: 0 }),
      // RSI
      rsi: rsi.toFixed(1),
      rsiStatus,
      rsiSignal,
      rsiDivergence: '-',
      // MACD
      macd: macd.toFixed(6),
      macdSignal: signal.toFixed(6),
      macdHistogram: histogram.toFixed(6),
      macdCrossover,
      macdAction,
      // Bollinger Bands
      bbUpper: upper.toFixed(6),
      bbMiddle: middle.toFixed(6),
      bbLower: lower.toFixed(6),
      bbPercentB: percentB.toFixed(2),
      bbWidth: width.toFixed(6),
      bbSignal,
      // Stochastic
      stochK: k.toFixed(1),
      stochD: d.toFixed(1),
      stochStatus,
      stochSignal
    };
  });

  // Reverse back to show newest first (for display)
  indicatorData.value = calculated.reverse();
}

// Calculate RSI - Improved to work with limited data
function calculateRSI(candles, currentIndex, period = 14) {
  // Need at least 2 candles for price change
  if (currentIndex < 1) return 50.0;

  // Use available data if less than period
  const actualPeriod = Math.min(period, currentIndex);
  if (actualPeriod < 2) return 50.0;

  let gains = 0;
  let losses = 0;
  let count = 0;

  for (let i = currentIndex - actualPeriod + 1; i <= currentIndex; i++) {
    if (i > 0) {
      const change = candles[i][4] - candles[i - 1][4];
      if (change > 0) gains += change;
      else losses += Math.abs(change);
      count++;
    }
  }

  if (count === 0) return 50.0;

  const avgGain = gains / count;
  const avgLoss = losses / count;

  if (avgLoss === 0) return avgGain > 0 ? 100.0 : 50.0;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Calculate MACD - Improved to work with limited data
function calculateMACD(candles, currentIndex) {
  if (currentIndex < 1) {
    return { macd: 0, signal: 0, histogram: 0 };
  }

  const ema12 = calculateEMA(candles, currentIndex, 12);
  const ema26 = calculateEMA(candles, currentIndex, 26);
  const macd = ema12 - ema26;

  // Calculate signal line (9-period SMA of MACD for simplicity)
  let signal = macd;
  const signalPeriod = Math.min(9, currentIndex + 1);

  if (signalPeriod > 0 && currentIndex >= signalPeriod - 1) {
    let macdSum = 0;
    let count = 0;
    for (let i = 0; i < signalPeriod && currentIndex - i >= 0; i++) {
      const idx = currentIndex - i;
      const e12 = calculateEMA(candles, idx, 12);
      const e26 = calculateEMA(candles, idx, 26);
      macdSum += (e12 - e26);
      count++;
    }
    signal = count > 0 ? macdSum / count : macd;
  }

  const histogram = macd - signal;

  return { macd, signal, histogram };
}

// Calculate EMA - Improved to work with limited data
function calculateEMA(candles, currentIndex, period) {
  if (currentIndex < 0) return 0;

  const actualPeriod = Math.min(period, currentIndex + 1);
  const multiplier = 2 / (actualPeriod + 1);

  // Calculate SMA for initial EMA
  let sum = 0;
  const startIdx = Math.max(0, currentIndex - actualPeriod + 1);
  for (let i = startIdx; i <= currentIndex; i++) {
    sum += candles[i][4]; // close price
  }
  let ema = sum / actualPeriod;

  // Apply EMA formula for smoothing
  for (let i = startIdx; i <= currentIndex; i++) {
    ema = (candles[i][4] - ema) * multiplier + ema;
  }

  return ema;
}

// Calculate Bollinger Bands - Improved to work with limited data
function calculateBollingerBands(candles, currentIndex, period = 20, stdDev = 2) {
  if (currentIndex < 1) {
    const close = candles[0][4];
    return { upper: close, middle: close, lower: close, percentB: 50, width: 0 };
  }

  // Use available data if less than period
  const actualPeriod = Math.min(period, currentIndex + 1);

  // Calculate SMA (middle band)
  let sum = 0;
  const startIdx = Math.max(0, currentIndex - actualPeriod + 1);
  for (let i = startIdx; i <= currentIndex; i++) {
    sum += candles[i][4];
  }
  const middle = sum / actualPeriod;

  // Calculate standard deviation
  let variance = 0;
  for (let i = startIdx; i <= currentIndex; i++) {
    variance += Math.pow(candles[i][4] - middle, 2);
  }
  const sd = Math.sqrt(variance / actualPeriod);

  const upper = middle + (stdDev * sd);
  const lower = middle - (stdDev * sd);

  const close = candles[currentIndex][4];
  const range = upper - lower;
  const percentB = range > 0 ? ((close - lower) / range) * 100 : 50;
  const width = range;

  return { upper, middle, lower, percentB, width };
}

// Calculate Stochastic - Improved to work with limited data
function calculateStochastic(candles, currentIndex, period = 14, smoothK = 3, smoothD = 3) {
  if (currentIndex < 1) return { k: 50, d: 50 };

  // Use available data if less than period
  const actualPeriod = Math.min(period, currentIndex + 1);

  // Calculate %K for a given index
  const calculateK = (idx) => {
    const period = Math.min(14, idx + 1);
    let highestHigh = -Infinity;
    let lowestLow = Infinity;
    const startIdx = Math.max(0, idx - period + 1);

    for (let i = startIdx; i <= idx; i++) {
      const high = candles[i][2];
      const low = candles[i][3];
      if (high > highestHigh) highestHigh = high;
      if (low < lowestLow) lowestLow = low;
    }

    const close = candles[idx][4];
    const range = highestHigh - lowestLow;

    if (range > 0) {
      return ((close - lowestLow) / range) * 100;
    }
    return 50;
  };

  const k = calculateK(currentIndex);

  // %D is SMA of %K
  const actualDPeriod = Math.min(smoothD, currentIndex + 1);
  let kSum = 0;
  let count = 0;

  for (let i = 0; i < actualDPeriod && currentIndex - i >= 0; i++) {
    const idx = currentIndex - i;
    kSum += calculateK(idx);
    count++;
  }

  const d = count > 0 ? kSum / count : k;

  return { k, d };
}

// Load available data
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
        const firstCombo = response.combinations[0];
        selectedExchange.value = firstCombo.exchange;
        selectedSymbol.value = firstCombo.symbol;
        selectedTimeframe.value = firstCombo.timeframe;
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error loading combinations:', error);
    return false;
  }
}

onMounted(async () => {
  const hasData = await loadAvailableCombinations();
  if (hasData && selectedExchange.value && selectedSymbol.value && selectedTimeframe.value) {
    await fetchIndicatorData();
  }
});
</script>
