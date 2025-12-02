<template>
  <div style="padding: 20px;">
    <h3 style="color: #60a5fa; margin-bottom: 20px;">🎯 Trading Signals Analysis</h3>

    <!-- Selection Controls -->
    <n-card style="margin-bottom: 20px; background: rgba(0,0,0,0.3);">
      <n-grid cols="4" x-gap="12">
        <n-gi>
          <div style="margin-bottom: 8px; color: #888; font-size: 12px;">Exchange</div>
          <n-select
            v-model:value="selectedExchange"
            :options="exchanges"
            @update:value="onExchangeChange"
            style="width: 100%;"
          />
        </n-gi>
        <n-gi>
          <div style="margin-bottom: 8px; color: #888; font-size: 12px;">Symbol</div>
          <n-select
            v-model:value="selectedSymbol"
            :options="symbols"
            @update:value="loadData"
            style="width: 100%;"
          />
        </n-gi>
        <n-gi>
          <div style="margin-bottom: 8px; color: #888; font-size: 12px;">Timeframe</div>
          <n-select
            v-model:value="selectedTimeframe"
            :options="timeframes"
            @update:value="loadData"
            style="width: 100%;"
          />
        </n-gi>
        <n-gi>
          <div style="margin-bottom: 8px; color: #888; font-size: 12px;">Actions</div>
          <n-button type="primary" @click="loadData" :loading="loading" style="width: 100%;">
            🔄 Refresh
          </n-button>
        </n-gi>
      </n-grid>
    </n-card>

    <!-- Loading State -->
    <div v-if="loading" style="text-align: center; padding: 40px; color: #888;">
      <div style="font-size: 48px; margin-bottom: 12px;">⏳</div>
      <div>Loading Trading Signals...</div>
    </div>

    <!-- Error State -->
    <n-card v-else-if="error" style="background: rgba(220, 38, 38, 0.1); border: 1px solid #dc2626;">
      <div style="color: #ef4444; text-align: center;">
        <div style="font-size: 32px; margin-bottom: 8px;">❌</div>
        <div>{{ error }}</div>
      </div>
    </n-card>

    <!-- Main Content -->
    <div v-else-if="signalData">
      <!-- Overall Signal Card -->
      <n-card style="margin-bottom: 20px; background: rgba(0,0,0,0.3);">
        <div style="text-align: center;">
          <div style="font-size: 64px; margin-bottom: 12px;">
            {{ signalData.overall.emoji }}
          </div>
          <div style="font-size: 32px; font-weight: bold; margin-bottom: 8px;"
               :style="{ color: signalData.overall.color }">
            {{ signalData.overall.signal }}
          </div>
          <div style="font-size: 18px; color: #888; margin-bottom: 16px;">
            Confidence: <span :style="{ color: signalData.overall.confidenceColor }">
              {{ signalData.overall.confidence }}
            </span>
          </div>

          <!-- Signal Score Bar -->
          <div style="margin: 20px auto; max-width: 400px;">
            <div style="margin-bottom: 8px; color: #888; font-size: 14px;">
              Signal Score: {{ signalData.overall.score }}/100
            </div>
            <div style="height: 30px; background: rgba(255,255,255,0.1); border-radius: 15px; overflow: hidden;">
              <div :style="{
                width: Math.abs(signalData.overall.score) + '%',
                height: '100%',
                background: signalData.overall.score >= 60 ? 'linear-gradient(90deg, #10b981, #22c55e)' :
                           signalData.overall.score >= 40 ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' :
                           signalData.overall.score >= -40 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' :
                           signalData.overall.score >= -60 ? 'linear-gradient(90deg, #f97316, #fb923c)' :
                           'linear-gradient(90deg, #ef4444, #dc2626)',
                transition: 'width 0.5s ease'
              }"></div>
            </div>
          </div>

          <!-- Current Price -->
          <div style="margin-top: 20px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px;">
            <div style="color: #888; font-size: 12px; margin-bottom: 4px;">Current Price</div>
            <div style="font-size: 24px; font-weight: bold; color: #60a5fa;">
              {{ signalData.overall.currentPrice }}
            </div>
          </div>
        </div>
      </n-card>

      <!-- Signal Tabs -->
      <n-tabs type="card" animated default-value="breakdown">
        <!-- TAB 1: Signal Breakdown -->
        <n-tab-pane name="breakdown" tab="📊 Signal Breakdown">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
            <!-- Trend Signal -->
            <n-card :title="'📈 Trend Signal: ' + signalData.breakdown.trend.signal"
                    style="background: rgba(0,0,0,0.2);">
              <div style="margin-bottom: 12px;">
                <div style="color: #888; font-size: 12px;">Score</div>
                <div style="font-size: 24px; font-weight: bold;"
                     :style="{ color: signalData.breakdown.trend.color }">
                  {{ signalData.breakdown.trend.score }}/100
                </div>
              </div>
              <div style="margin-bottom: 8px;">
                <div style="color: #888; font-size: 12px;">Trend</div>
                <div style="color: #fff;">{{ signalData.breakdown.trend.trend }}</div>
              </div>
              <div style="margin-bottom: 8px;">
                <div style="color: #888; font-size: 12px;">Strength</div>
                <div style="color: #fff;">{{ signalData.breakdown.trend.strength }}/10</div>
              </div>
              <div>
                <div style="color: #888; font-size: 12px;">Details</div>
                <div style="color: #888; font-size: 11px;">{{ signalData.breakdown.trend.details }}</div>
              </div>
            </n-card>

            <!-- RSI Signal -->
            <n-card :title="'📉 RSI Signal: ' + signalData.breakdown.rsi.signal"
                    style="background: rgba(0,0,0,0.2);">
              <div style="margin-bottom: 12px;">
                <div style="color: #888; font-size: 12px;">Score</div>
                <div style="font-size: 24px; font-weight: bold;"
                     :style="{ color: signalData.breakdown.rsi.color }">
                  {{ signalData.breakdown.rsi.score }}/100
                </div>
              </div>
              <div style="margin-bottom: 8px;">
                <div style="color: #888; font-size: 12px;">RSI Value</div>
                <div style="color: #fff;">{{ signalData.breakdown.rsi.value }}</div>
              </div>
              <div style="margin-bottom: 8px;">
                <div style="color: #888; font-size: 12px;">Status</div>
                <div style="color: #fff;">{{ signalData.breakdown.rsi.status }}</div>
              </div>
              <div>
                <div style="color: #888; font-size: 12px;">Details</div>
                <div style="color: #888; font-size: 11px;">{{ signalData.breakdown.rsi.details }}</div>
              </div>
            </n-card>

            <!-- MACD Signal -->
            <n-card :title="'📊 MACD Signal: ' + signalData.breakdown.macd.signal"
                    style="background: rgba(0,0,0,0.2);">
              <div style="margin-bottom: 12px;">
                <div style="color: #888; font-size: 12px;">Score</div>
                <div style="font-size: 24px; font-weight: bold;"
                     :style="{ color: signalData.breakdown.macd.color }">
                  {{ signalData.breakdown.macd.score }}/100
                </div>
              </div>
              <div style="margin-bottom: 8px;">
                <div style="color: #888; font-size: 12px;">Histogram</div>
                <div style="color: #fff;">{{ signalData.breakdown.macd.histogram }}</div>
              </div>
              <div style="margin-bottom: 8px;">
                <div style="color: #888; font-size: 12px;">Crossover</div>
                <div style="color: #fff;">{{ signalData.breakdown.macd.crossover }}</div>
              </div>
              <div>
                <div style="color: #888; font-size: 12px;">Details</div>
                <div style="color: #888; font-size: 11px;">{{ signalData.breakdown.macd.details }}</div>
              </div>
            </n-card>

            <!-- Volume Signal -->
            <n-card :title="'📊 Volume Signal: ' + signalData.breakdown.volume.signal"
                    style="background: rgba(0,0,0,0.2);">
              <div style="margin-bottom: 12px;">
                <div style="color: #888; font-size: 12px;">Score</div>
                <div style="font-size: 24px; font-weight: bold;"
                     :style="{ color: signalData.breakdown.volume.color }">
                  {{ signalData.breakdown.volume.score }}/100
                </div>
              </div>
              <div style="margin-bottom: 8px;">
                <div style="color: #888; font-size: 12px;">Relative Volume</div>
                <div style="color: #fff;">{{ signalData.breakdown.volume.relativeVolume }}x</div>
              </div>
              <div style="margin-bottom: 8px;">
                <div style="color: #888; font-size: 12px;">Trend</div>
                <div style="color: #fff;">{{ signalData.breakdown.volume.trend }}</div>
              </div>
              <div>
                <div style="color: #888; font-size: 12px;">Details</div>
                <div style="color: #888; font-size: 11px;">{{ signalData.breakdown.volume.details }}</div>
              </div>
            </n-card>

            <!-- Support/Resistance Signal -->
            <n-card :title="'🎯 S/R Signal: ' + signalData.breakdown.sr.signal"
                    style="background: rgba(0,0,0,0.2);">
              <div style="margin-bottom: 12px;">
                <div style="color: #888; font-size: 12px;">Score</div>
                <div style="font-size: 24px; font-weight: bold;"
                     :style="{ color: signalData.breakdown.sr.color }">
                  {{ signalData.breakdown.sr.score }}/100
                </div>
              </div>
              <div style="margin-bottom: 8px;">
                <div style="color: #888; font-size: 12px;">Nearest Level</div>
                <div style="color: #fff;">{{ signalData.breakdown.sr.nearestLevel }}</div>
              </div>
              <div style="margin-bottom: 8px;">
                <div style="color: #888; font-size: 12px;">Distance</div>
                <div style="color: #fff;">{{ signalData.breakdown.sr.distance }}%</div>
              </div>
              <div>
                <div style="color: #888; font-size: 12px;">Details</div>
                <div style="color: #888; font-size: 11px;">{{ signalData.breakdown.sr.details }}</div>
              </div>
            </n-card>

            <!-- Bollinger Bands Signal -->
            <n-card :title="'⚡ Bollinger Signal: ' + signalData.breakdown.bollinger.signal"
                    style="background: rgba(0,0,0,0.2);">
              <div style="margin-bottom: 12px;">
                <div style="color: #888; font-size: 12px;">Score</div>
                <div style="font-size: 24px; font-weight: bold;"
                     :style="{ color: signalData.breakdown.bollinger.color }">
                  {{ signalData.breakdown.bollinger.score }}/100
                </div>
              </div>
              <div style="margin-bottom: 8px;">
                <div style="color: #888; font-size: 12px;">%B Position</div>
                <div style="color: #fff;">{{ signalData.breakdown.bollinger.percentB }}</div>
              </div>
              <div style="margin-bottom: 8px;">
                <div style="color: #888; font-size: 12px;">Band Width</div>
                <div style="color: #fff;">{{ signalData.breakdown.bollinger.width }}%</div>
              </div>
              <div>
                <div style="color: #888; font-size: 12px;">Details</div>
                <div style="color: #888; font-size: 11px;">{{ signalData.breakdown.bollinger.details }}</div>
              </div>
            </n-card>
          </div>
        </n-tab-pane>

        <!-- TAB 2: Entry/Exit Strategy -->
        <n-tab-pane name="strategy" tab="🎯 Entry/Exit Strategy">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 16px;">
            <!-- Entry Strategy -->
            <n-card title="📍 Suggested Entry" style="background: rgba(0,0,0,0.2);">
              <div style="margin-bottom: 16px;">
                <div style="color: #888; font-size: 12px; margin-bottom: 4px;">Entry Price</div>
                <div style="font-size: 28px; font-weight: bold; color: #10b981;">
                  {{ signalData.strategy.entry.price }}
                </div>
                <div style="color: #888; font-size: 11px; margin-top: 4px;">
                  {{ signalData.strategy.entry.reasoning }}
                </div>
              </div>
              <div style="margin-bottom: 12px;">
                <div style="color: #888; font-size: 12px;">Entry Type</div>
                <div style="color: #fff;">{{ signalData.strategy.entry.type }}</div>
              </div>
              <div style="margin-bottom: 12px;">
                <div style="color: #888; font-size: 12px;">Distance from Current</div>
                <div style="color: #fff;">{{ signalData.strategy.entry.distance }}</div>
              </div>
              <div>
                <div style="color: #888; font-size: 12px;">Wait for Confirmation</div>
                <div style="color: #fbbf24; font-size: 11px;">
                  {{ signalData.strategy.entry.confirmation }}
                </div>
              </div>
            </n-card>

            <!-- Stop Loss -->
            <n-card title="🛑 Stop Loss" style="background: rgba(0,0,0,0.2);">
              <div style="margin-bottom: 16px;">
                <div style="color: #888; font-size: 12px; margin-bottom: 4px;">Stop Loss Price</div>
                <div style="font-size: 28px; font-weight: bold; color: #ef4444;">
                  {{ signalData.strategy.stopLoss.price }}
                </div>
                <div style="color: #888; font-size: 11px; margin-top: 4px;">
                  {{ signalData.strategy.stopLoss.reasoning }}
                </div>
              </div>
              <div style="margin-bottom: 12px;">
                <div style="color: #888; font-size: 12px;">Risk %</div>
                <div style="color: #ef4444; font-size: 20px; font-weight: bold;">
                  {{ signalData.strategy.stopLoss.riskPercent }}
                </div>
              </div>
              <div>
                <div style="color: #888; font-size: 12px;">Distance from Entry</div>
                <div style="color: #fff;">{{ signalData.strategy.stopLoss.distance }}</div>
              </div>
            </n-card>

            <!-- Take Profit Targets -->
            <n-card title="🎯 Take Profit Targets" style="background: rgba(0,0,0,0.2);">
              <div v-for="(tp, index) in signalData.strategy.takeProfits" :key="index"
                   style="margin-bottom: 16px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #888; font-size: 12px;">Target {{ index + 1 }}</span>
                  <span style="color: #22c55e; font-weight: bold;">{{ tp.price }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="color: #888; font-size: 11px;">Gain</span>
                  <span style="color: #10b981;">{{ tp.gainPercent }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="color: #888; font-size: 11px;">R:R Ratio</span>
                  <span style="color: #60a5fa;">{{ tp.rrRatio }}</span>
                </div>
                <div style="color: #888; font-size: 10px; margin-top: 8px;">
                  {{ tp.reasoning }}
                </div>
              </div>
            </n-card>

            <!-- Risk Management -->
            <n-card title="⚖️ Risk Management" style="background: rgba(0,0,0,0.2);">
              <div style="margin-bottom: 16px;">
                <div style="color: #888; font-size: 12px; margin-bottom: 4px;">Overall R:R Ratio</div>
                <div style="font-size: 28px; font-weight: bold; color: #60a5fa;">
                  {{ signalData.strategy.risk.overallRR }}
                </div>
              </div>
              <div style="margin-bottom: 12px;">
                <div style="color: #888; font-size: 12px;">Maximum Risk</div>
                <div style="color: #ef4444; font-size: 20px; font-weight: bold;">
                  {{ signalData.strategy.risk.maxRisk }}
                </div>
              </div>
              <div style="margin-bottom: 12px;">
                <div style="color: #888; font-size: 12px;">Potential Reward</div>
                <div style="color: #22c55e; font-size: 20px; font-weight: bold;">
                  {{ signalData.strategy.risk.potentialReward }}
                </div>
              </div>
              <div style="margin-bottom: 12px;">
                <div style="color: #888; font-size: 12px;">Position Sizing</div>
                <div style="color: #fbbf24; font-size: 11px;">
                  {{ signalData.strategy.risk.positionSizing }}
                </div>
              </div>
              <div>
                <div style="color: #888; font-size: 12px;">Recommendation</div>
                <div style="color: #888; font-size: 11px;">
                  {{ signalData.strategy.risk.recommendation }}
                </div>
              </div>
            </n-card>
          </div>
        </n-tab-pane>

        <!-- TAB 3: Signal History -->
        <n-tab-pane name="history" tab="📜 Recent Signals">
          <n-card style="background: rgba(0,0,0,0.2);">
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <th style="padding: 12px 8px; text-align: left; color: #888; font-size: 12px;">Time</th>
                    <th style="padding: 12px 8px; text-align: center; color: #888; font-size: 12px;">Price</th>
                    <th style="padding: 12px 8px; text-align: center; color: #888; font-size: 12px;">Signal</th>
                    <th style="padding: 12px 8px; text-align: center; color: #888; font-size: 12px;">Score</th>
                    <th style="padding: 12px 8px; text-align: center; color: #888; font-size: 12px;">Confidence</th>
                    <th style="padding: 12px 8px; text-align: left; color: #888; font-size: 12px;">Contributing Factors</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(signal, index) in signalData.history.slice(0, 50)" :key="index"
                      style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 12px 8px; color: #888; font-size: 11px;">
                      {{ signal.time }}
                    </td>
                    <td style="padding: 12px 8px; text-align: center; color: #fff; font-weight: bold;">
                      {{ signal.price }}
                    </td>
                    <td style="padding: 12px 8px; text-align: center;">
                      <span :style="{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        background: signal.signalColor + '20',
                        color: signal.signalColor
                      }">
                        {{ signal.signal }}
                      </span>
                    </td>
                    <td style="padding: 12px 8px; text-align: center; font-weight: bold;"
                        :style="{ color: signal.scoreColor }">
                      {{ signal.score }}
                    </td>
                    <td style="padding: 12px 8px; text-align: center; color: #888; font-size: 11px;">
                      {{ signal.confidence }}
                    </td>
                    <td style="padding: 12px 8px; color: #888; font-size: 10px;">
                      {{ signal.factors }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </n-card>
        </n-tab-pane>
      </n-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';

// ==================== STATE ====================
const loading = ref(false);
const error = ref(null);
const signalData = ref(null);

// Selection Options
const selectedExchange = ref('lcx');
const selectedSymbol = ref('LCX/USDC');
const selectedTimeframe = ref('5m');

const exchanges = ref([
  { label: 'LCX', value: 'lcx' },
  { label: 'Coinbase', value: 'coinbase' }
]);

const symbols = ref([
  { label: 'LCX/USDC', value: 'LCX/USDC' },
  { label: 'BTC/USDC', value: 'BTC/USDC' },
  { label: 'ETH/USDC', value: 'ETH/USDC' }
]);

const timeframes = ref([
  { label: '1 Minute', value: '1m' },
  { label: '5 Minutes', value: '5m' },
  { label: '15 Minutes', value: '15m' },
  { label: '1 Hour', value: '1h' },
  { label: '4 Hours', value: '4h' },
  { label: '1 Day', value: '1d' }
]);

// ==================== LIFECYCLE ====================
onMounted(() => {
  loadData();
});

// ==================== METHODS ====================

// Load Data
async function loadData() {
  if (!selectedExchange.value || !selectedSymbol.value || !selectedTimeframe.value) {
    error.value = 'Please select exchange, symbol, and timeframe';
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    console.log('📡 Fetching data for signals:', {
      exchange: selectedExchange.value,
      symbol: selectedSymbol.value,
      timeframe: selectedTimeframe.value
    });

    const response = await $fetch('/api/v1/getVolumeData', {
      params: {
        exchange: selectedExchange.value,
        symbol: selectedSymbol.value,
        timeframe: selectedTimeframe.value
      }
    });

    if (!response.success || !response.candles || response.candles.length === 0) {
      error.value = response.error || 'No data available';
      signalData.value = null;
      return;
    }

    console.log('✅ Received candles:', response.candles.length);
    processSignalData(response.candles);

  } catch (err) {
    console.error('❌ Error loading data:', err);
    error.value = err.message || 'Failed to load data';
    signalData.value = null;
  } finally {
    loading.value = false;
  }
}

// Process Signal Data
function processSignalData(candles) {
  // IMPORTANT: Reverse candles for calculation (oldest to newest)
  const reversedCandles = [...candles].reverse();

  // Calculate all signals with proper historical context
  const signals = reversedCandles.map((candle, index) => {
    const [timestamp, open, high, low, close, volume] = candle;

    // Calculate indicators
    const rsi = calculateRSI(reversedCandles, index, 14);
    const { macd, signal: macdSignal, histogram } = calculateMACD(reversedCandles, index);
    const { upper, middle, lower, percentB, width } = calculateBollingerBands(reversedCandles, index);
    const avgVolume = calculateAvgVolume(reversedCandles, index, 20);
    const relativeVolume = avgVolume > 0 ? (volume / avgVolume) : 1;

    // Calculate trend
    const ema20 = calculateEMA(reversedCandles, index, 20);
    const ema50 = calculateEMA(reversedCandles, index, 50);
    const trend = ema20 > ema50 ? 'Uptrend' : 'Downtrend';

    // Calculate support/resistance
    const { nearestSupport, nearestResistance } = findNearestLevels(reversedCandles, index, close);

    // Score each indicator (-100 to +100 scale)
    const rsiScore = calculateRSIScore(rsi);
    const macdScore = calculateMACDScore(histogram, macd, macdSignal);
    const volumeScore = calculateVolumeScore(relativeVolume);
    const trendScore = calculateTrendScore(close, ema20, ema50);
    const srScore = calculateSRScore(close, nearestSupport, nearestResistance);
    const bollingerScore = calculateBollingerScore(percentB, width);

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      (trendScore * 0.25) +
      (rsiScore * 0.20) +
      (macdScore * 0.20) +
      (volumeScore * 0.15) +
      (srScore * 0.12) +
      (bollingerScore * 0.08)
    );

    // Determine signal
    let signal = 'HOLD';
    let confidence = 'Low';

    if (overallScore >= 60) {
      signal = 'STRONG BUY';
      confidence = 'High';
    } else if (overallScore >= 40) {
      signal = 'BUY';
      confidence = 'Medium';
    } else if (overallScore >= -40) {
      signal = 'HOLD';
      confidence = 'Low';
    } else if (overallScore >= -60) {
      signal = 'SELL';
      confidence = 'Medium';
    } else {
      signal = 'STRONG SELL';
      confidence = 'High';
    }

    return {
      timestamp,
      close,
      signal,
      score: overallScore,
      confidence,
      indicators: {
        rsi: { value: rsi, score: rsiScore },
        macd: { histogram, score: macdScore },
        volume: { relative: relativeVolume, score: volumeScore },
        trend: { type: trend, score: trendScore },
        sr: { support: nearestSupport, resistance: nearestResistance, score: srScore },
        bollinger: { percentB, width, score: bollingerScore }
      }
    };
  });

  // Reverse back for display (newest first)
  const displaySignals = signals.reverse();

  // Get current (most recent) signal
  const current = displaySignals[0];

  // Build signal data structure
  signalData.value = {
    overall: buildOverallSignal(current),
    breakdown: buildBreakdown(current),
    strategy: buildStrategy(current, reversedCandles[reversedCandles.length - 1]),
    history: displaySignals.map(s => formatHistoryEntry(s))
  };
}

// Build Overall Signal
function buildOverallSignal(current) {
  const emoji = current.signal === 'STRONG BUY' ? '🚀' :
                current.signal === 'BUY' ? '📈' :
                current.signal === 'HOLD' ? '⏸️' :
                current.signal === 'SELL' ? '📉' : '🔻';

  const color = current.score >= 60 ? '#10b981' :
                current.score >= 40 ? '#22c55e' :
                current.score >= -40 ? '#f59e0b' :
                current.score >= -60 ? '#f97316' : '#ef4444';

  const confidenceColor = current.confidence === 'High' ? '#10b981' :
                          current.confidence === 'Medium' ? '#f59e0b' : '#ef4444';

  return {
    signal: current.signal,
    score: current.score,
    confidence: current.confidence,
    currentPrice: current.close.toFixed(6),
    emoji,
    color,
    confidenceColor
  };
}

// Build Breakdown
function buildBreakdown(current) {
  const getScoreColor = (score) => {
    if (score >= 60) return '#10b981';
    if (score >= 40) return '#22c55e';
    if (score >= -40) return '#f59e0b';
    if (score >= -60) return '#f97316';
    return '#ef4444';
  };

  const getSignal = (score) => {
    if (score >= 60) return 'STRONG BUY';
    if (score >= 40) return 'BUY';
    if (score >= -40) return 'HOLD';
    if (score >= -60) return 'SELL';
    return 'STRONG SELL';
  };

  return {
    trend: {
      signal: getSignal(current.indicators.trend.score),
      score: current.indicators.trend.score,
      color: getScoreColor(current.indicators.trend.score),
      trend: current.indicators.trend.type,
      strength: Math.abs(Math.round(current.indicators.trend.score / 10)),
      details: `Trend is ${current.indicators.trend.type.toLowerCase()}, indicating ${current.indicators.trend.score > 0 ? 'bullish' : 'bearish'} momentum`
    },
    rsi: {
      signal: getSignal(current.indicators.rsi.score),
      score: current.indicators.rsi.score,
      color: getScoreColor(current.indicators.rsi.score),
      value: current.indicators.rsi.value.toFixed(1),
      status: current.indicators.rsi.value > 70 ? 'Overbought' : current.indicators.rsi.value < 30 ? 'Oversold' : 'Neutral',
      details: `RSI at ${current.indicators.rsi.value.toFixed(1)} suggests ${current.indicators.rsi.value > 70 ? 'overbought conditions' : current.indicators.rsi.value < 30 ? 'oversold conditions' : 'neutral momentum'}`
    },
    macd: {
      signal: getSignal(current.indicators.macd.score),
      score: current.indicators.macd.score,
      color: getScoreColor(current.indicators.macd.score),
      histogram: current.indicators.macd.histogram.toFixed(6),
      crossover: current.indicators.macd.histogram > 0 ? 'Bullish' : 'Bearish',
      details: `MACD histogram ${current.indicators.macd.histogram > 0 ? 'positive' : 'negative'}, indicating ${current.indicators.macd.histogram > 0 ? 'bullish' : 'bearish'} momentum`
    },
    volume: {
      signal: getSignal(current.indicators.volume.score),
      score: current.indicators.volume.score,
      color: getScoreColor(current.indicators.volume.score),
      relativeVolume: current.indicators.volume.relative.toFixed(2),
      trend: current.indicators.volume.relative > 1.5 ? 'High' : current.indicators.volume.relative > 1 ? 'Normal' : 'Low',
      details: `Volume is ${current.indicators.volume.relative.toFixed(2)}x average, ${current.indicators.volume.relative > 1.5 ? 'confirming strong momentum' : 'indicating weak momentum'}`
    },
    sr: {
      signal: getSignal(current.indicators.sr.score),
      score: current.indicators.sr.score,
      color: getScoreColor(current.indicators.sr.score),
      nearestLevel: current.indicators.sr.score > 0 ? 'Support' : 'Resistance',
      distance: Math.abs(current.indicators.sr.score > 0 ?
        ((current.close - current.indicators.sr.support) / current.close * 100) :
        ((current.indicators.sr.resistance - current.close) / current.close * 100)
      ).toFixed(2),
      details: `Price ${current.indicators.sr.score > 0 ? 'near support' : 'near resistance'}, ${current.indicators.sr.score > 0 ? 'potential bounce' : 'potential rejection'} zone`
    },
    bollinger: {
      signal: getSignal(current.indicators.bollinger.score),
      score: current.indicators.bollinger.score,
      color: getScoreColor(current.indicators.bollinger.score),
      percentB: current.indicators.bollinger.percentB.toFixed(2),
      width: current.indicators.bollinger.width.toFixed(2),
      details: `%B at ${current.indicators.bollinger.percentB.toFixed(2)}, ${current.indicators.bollinger.percentB < 0.2 ? 'oversold' : current.indicators.bollinger.percentB > 0.8 ? 'overbought' : 'mid-range'} position`
    }
  };
}

// Build Strategy
function buildStrategy(current, currentCandle) {
  const [timestamp, open, high, low, close] = currentCandle;

  // Determine entry strategy based on signal
  let entryPrice, entryType, entryReasoning, entryConfirmation;

  if (current.score >= 40) {
    // BUY signal - suggest entry at support or current price
    entryPrice = current.indicators.sr.support || close;
    entryType = current.indicators.sr.support ? 'Limit Order (Support)' : 'Market Order';
    entryReasoning = current.indicators.sr.support ?
      'Enter at nearest support level for better risk/reward' :
      'Strong signal - consider market entry';
    entryConfirmation = 'Wait for volume confirmation and RSI > 30';
  } else if (current.score <= -40) {
    // SELL signal - suggest entry at resistance or current price
    entryPrice = current.indicators.sr.resistance || close;
    entryType = current.indicators.sr.resistance ? 'Limit Order (Resistance)' : 'Market Order';
    entryReasoning = current.indicators.sr.resistance ?
      'Enter short at nearest resistance level' :
      'Strong sell signal - consider market entry';
    entryConfirmation = 'Wait for volume confirmation and RSI < 70';
  } else {
    // HOLD - no entry
    entryPrice = close;
    entryType = 'No Entry';
    entryReasoning = 'Signal not strong enough - wait for clearer opportunity';
    entryConfirmation = 'Wait for score to exceed ±40';
  }

  // Calculate stop loss (2 ATR or 2% below entry for buys)
  const atr = calculateATR([currentCandle], 0, 14);
  const stopLossDistance = Math.max(atr * 2, entryPrice * 0.02);
  const stopLossPrice = current.score >= 40 ? entryPrice - stopLossDistance : entryPrice + stopLossDistance;
  const riskPercent = (Math.abs(entryPrice - stopLossPrice) / entryPrice * 100).toFixed(2);

  // Calculate take profit targets (Fibonacci levels)
  const tp1Price = current.score >= 40 ? entryPrice * 1.015 : entryPrice * 0.985; // 1.5%
  const tp2Price = current.score >= 40 ? entryPrice * 1.03 : entryPrice * 0.97; // 3%
  const tp3Price = current.score >= 40 ? entryPrice * 1.05 : entryPrice * 0.95; // 5%

  const tp1Gain = (Math.abs(tp1Price - entryPrice) / entryPrice * 100).toFixed(2);
  const tp2Gain = (Math.abs(tp2Price - entryPrice) / entryPrice * 100).toFixed(2);
  const tp3Gain = (Math.abs(tp3Price - entryPrice) / entryPrice * 100).toFixed(2);

  const tp1RR = (tp1Gain / riskPercent).toFixed(2);
  const tp2RR = (tp2Gain / riskPercent).toFixed(2);
  const tp3RR = (tp3Gain / riskPercent).toFixed(2);

  return {
    entry: {
      price: entryPrice.toFixed(6),
      type: entryType,
      distance: ((Math.abs(entryPrice - close) / close) * 100).toFixed(2) + '%',
      reasoning: entryReasoning,
      confirmation: entryConfirmation
    },
    stopLoss: {
      price: stopLossPrice.toFixed(6),
      riskPercent: '-' + riskPercent + '%',
      distance: ((Math.abs(stopLossPrice - entryPrice) / entryPrice) * 100).toFixed(2) + '%',
      reasoning: `Based on ${(atr * 2).toFixed(6)} (2x ATR) or 2% of entry price`
    },
    takeProfits: [
      {
        price: tp1Price.toFixed(6),
        gainPercent: '+' + tp1Gain + '%',
        rrRatio: '1:' + tp1RR,
        reasoning: 'Conservative target - take 30% profit'
      },
      {
        price: tp2Price.toFixed(6),
        gainPercent: '+' + tp2Gain + '%',
        rrRatio: '1:' + tp2RR,
        reasoning: 'Medium target - take 40% profit'
      },
      {
        price: tp3Price.toFixed(6),
        gainPercent: '+' + tp3Gain + '%',
        rrRatio: '1:' + tp3RR,
        reasoning: 'Aggressive target - let 30% run'
      }
    ],
    risk: {
      overallRR: '1:' + ((parseFloat(tp2Gain) / parseFloat(riskPercent)).toFixed(2)),
      maxRisk: '-' + riskPercent + '%',
      potentialReward: '+' + tp2Gain + '%',
      positionSizing: `Risk no more than 1-2% of total capital per trade`,
      recommendation: parseFloat(riskPercent) > 5 ?
        'Risk is high - consider reducing position size or waiting for better entry' :
        'Risk/Reward ratio is acceptable for this setup'
    }
  };
}

// Format History Entry
function formatHistoryEntry(signal) {
  const signalColor = signal.score >= 60 ? '#10b981' :
                      signal.score >= 40 ? '#22c55e' :
                      signal.score >= -40 ? '#f59e0b' :
                      signal.score >= -60 ? '#f97316' : '#ef4444';

  const scoreColor = signalColor;

  const factors = [];
  if (Math.abs(signal.indicators.trend.score) > 50) factors.push('Trend');
  if (Math.abs(signal.indicators.rsi.score) > 50) factors.push('RSI');
  if (Math.abs(signal.indicators.macd.score) > 50) factors.push('MACD');
  if (Math.abs(signal.indicators.volume.score) > 50) factors.push('Volume');

  return {
    time: new Date(signal.timestamp).toLocaleString(),
    price: signal.close.toFixed(6),
    signal: signal.signal,
    signalColor,
    score: signal.score,
    scoreColor,
    confidence: signal.confidence,
    factors: factors.join(', ') || 'None'
  };
}

// ==================== INDICATOR CALCULATIONS ====================

// Calculate RSI
function calculateRSI(candles, index, period = 14) {
  if (index < period) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = index - period + 1; i <= index; i++) {
    const change = candles[i][4] - candles[i - 1][4];
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  return rsi;
}

// Calculate MACD
function calculateMACD(candles, index, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const fastEMA = calculateEMA(candles, index, fastPeriod);
  const slowEMA = calculateEMA(candles, index, slowPeriod);
  const macd = fastEMA - slowEMA;

  if (index < slowPeriod + signalPeriod - 1) {
    return { macd: 0, signal: 0, histogram: 0 };
  }

  const macdLine = [];
  for (let i = Math.max(0, index - signalPeriod + 1); i <= index; i++) {
    const fast = calculateEMA(candles, i, fastPeriod);
    const slow = calculateEMA(candles, i, slowPeriod);
    macdLine.push(fast - slow);
  }

  const signal = macdLine.reduce((a, b) => a + b, 0) / macdLine.length;
  const histogram = macd - signal;

  return { macd, signal, histogram };
}

// Calculate EMA
function calculateEMA(candles, index, period) {
  if (index < period - 1) return candles[index][4];

  const multiplier = 2 / (period + 1);
  let ema = candles[Math.max(0, index - period + 1)][4];

  for (let i = Math.max(0, index - period + 2); i <= index; i++) {
    ema = (candles[i][4] - ema) * multiplier + ema;
  }

  return ema;
}

// Calculate Bollinger Bands
function calculateBollingerBands(candles, index, period = 20, stdDev = 2) {
  if (index < period - 1) {
    return { upper: 0, middle: 0, lower: 0, percentB: 0.5, width: 0 };
  }

  const subset = candles.slice(Math.max(0, index - period + 1), index + 1);
  const closes = subset.map(c => c[4]);
  const middle = closes.reduce((a, b) => a + b, 0) / closes.length;

  const squaredDiffs = closes.map(close => Math.pow(close - middle, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / closes.length;
  const standardDeviation = Math.sqrt(variance);

  const upper = middle + (standardDeviation * stdDev);
  const lower = middle - (standardDeviation * stdDev);

  const currentClose = candles[index][4];
  const percentB = (currentClose - lower) / (upper - lower);
  const width = ((upper - lower) / middle) * 100;

  return { upper, middle, lower, percentB, width };
}

// Calculate Average Volume
function calculateAvgVolume(candles, index, period = 20) {
  if (index < period - 1) return candles[index][5] || 0;

  const subset = candles.slice(Math.max(0, index - period + 1), index + 1);
  const sum = subset.reduce((acc, c) => acc + (c[5] || 0), 0);
  return sum / subset.length;
}

// Calculate ATR
function calculateATR(candles, index, period = 14) {
  if (index < 1) return 0;

  const tr = Math.max(
    candles[index][2] - candles[index][3], // High - Low
    Math.abs(candles[index][2] - candles[index - 1][4]), // High - Previous Close
    Math.abs(candles[index][3] - candles[index - 1][4])  // Low - Previous Close
  );

  if (index < period) return tr;

  let atr = 0;
  for (let i = Math.max(1, index - period + 1); i <= index; i++) {
    const trValue = Math.max(
      candles[i][2] - candles[i][3],
      Math.abs(candles[i][2] - candles[i - 1][4]),
      Math.abs(candles[i][3] - candles[i - 1][4])
    );
    atr += trValue;
  }

  return atr / period;
}

// Find Nearest Support/Resistance Levels
function findNearestLevels(candles, index, currentPrice) {
  const lookback = Math.min(100, index);
  const levels = [];

  for (let i = Math.max(0, index - lookback); i < index; i++) {
    const high = candles[i][2];
    const low = candles[i][3];

    let isLocalHigh = true;
    let isLocalLow = true;

    for (let j = Math.max(0, i - 5); j <= Math.min(index - 1, i + 5); j++) {
      if (j !== i) {
        if (candles[j][2] > high) isLocalHigh = false;
        if (candles[j][3] < low) isLocalLow = false;
      }
    }

    if (isLocalHigh) levels.push({ price: high, type: 'resistance' });
    if (isLocalLow) levels.push({ price: low, type: 'support' });
  }

  const supports = levels.filter(l => l.type === 'support' && l.price < currentPrice);
  const resistances = levels.filter(l => l.type === 'resistance' && l.price > currentPrice);

  const nearestSupport = supports.length > 0 ?
    supports.reduce((prev, curr) => Math.abs(curr.price - currentPrice) < Math.abs(prev.price - currentPrice) ? curr : prev).price :
    currentPrice * 0.98;

  const nearestResistance = resistances.length > 0 ?
    resistances.reduce((prev, curr) => Math.abs(curr.price - currentPrice) < Math.abs(prev.price - currentPrice) ? curr : prev).price :
    currentPrice * 1.02;

  return { nearestSupport, nearestResistance };
}

// ==================== SCORING FUNCTIONS ====================

// Calculate RSI Score (-100 to +100)
function calculateRSIScore(rsi) {
  if (rsi < 20) return 80; // Very oversold - strong buy
  if (rsi < 30) return 60; // Oversold - buy
  if (rsi < 40) return 30; // Slightly oversold
  if (rsi < 60) return 0; // Neutral
  if (rsi < 70) return -30; // Slightly overbought
  if (rsi < 80) return -60; // Overbought - sell
  return -80; // Very overbought - strong sell
}

// Calculate MACD Score
function calculateMACDScore(histogram, macd, signal) {
  if (histogram > 0) {
    if (macd > signal && histogram > 0.0001) return 70; // Strong bullish
    return 40; // Bullish
  } else {
    if (macd < signal && histogram < -0.0001) return -70; // Strong bearish
    return -40; // Bearish
  }
}

// Calculate Volume Score
function calculateVolumeScore(relativeVolume) {
  if (relativeVolume > 2) return 60; // Very high volume
  if (relativeVolume > 1.5) return 40; // High volume
  if (relativeVolume > 1) return 20; // Above average
  if (relativeVolume > 0.7) return 0; // Normal
  return -20; // Low volume
}

// Calculate Trend Score
function calculateTrendScore(price, ema20, ema50) {
  if (price > ema20 && ema20 > ema50) {
    const strength = ((price - ema50) / ema50) * 100;
    return Math.min(80, 50 + strength * 10);
  } else if (price < ema20 && ema20 < ema50) {
    const strength = ((ema50 - price) / ema50) * 100;
    return Math.max(-80, -50 - strength * 10);
  }
  return 0;
}

// Calculate S/R Score
function calculateSRScore(price, support, resistance) {
  const distanceToSupport = ((price - support) / price) * 100;
  const distanceToResistance = ((resistance - price) / price) * 100;

  if (distanceToSupport < 0.5) return 60; // Very close to support - buy
  if (distanceToSupport < 1) return 40; // Near support
  if (distanceToResistance < 0.5) return -60; // Very close to resistance - sell
  if (distanceToResistance < 1) return -40; // Near resistance
  return 0; // Mid-range
}

// Calculate Bollinger Score
function calculateBollingerScore(percentB, width) {
  if (percentB < 0.2) return 50; // Oversold
  if (percentB < 0.4) return 30; // Below middle
  if (percentB < 0.6) return 0; // Middle
  if (percentB < 0.8) return -30; // Above middle
  return -50; // Overbought
}

// ==================== EVENT HANDLERS ====================
function onExchangeChange() {
  // Reset symbol and timeframe when exchange changes
  loadData();
}
</script>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(96, 165, 250, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(96, 165, 250, 0.5);
}
</style>
