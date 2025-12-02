<script setup>
import { useAppStore } from '~/stores/app.store';
import { ref, computed, onMounted, onUnmounted, watch } from "vue";

const app = useAppStore();
let userID = useCookie('userID');
let refreshInterval = null;

// Collapsible state
const configCollapsed = ref(false);
const fibTablesCollapsed = ref(false);

// Analytics sections collapsed state
const analyticsCollapsed = ref({
  summary: false,         // Quick summary - always visible
  patterns: true,         // Pattern recognition
  momentum: true,         // Momentum & trend
  fibonacci: true,        // Fibonacci analysis
  predictions: true,      // ML predictions
  advanced: true,         // Advanced stats (100+ metrics)
  fibRetracement: true,   // Fibonacci Retracement levels
  fibExtension: true      // Fibonacci Extension levels
});

// Selected candle for detailed view
const selectedCandleIndex = ref(null);

// Use global values from store
let currentExchange = computed(() => app.getUserSelectedExchange);
let currentSymbol = computed(() => app.getUserSelectedMarket);
let selectedApiKey = computed(() => app.getSelectedApiKey);
let base = computed(() => currentSymbol.value.split('/')[0]);
let quote = computed(() => currentSymbol.value.split('/')[1]);

// Timeframes supported by Coinbase Advanced Trade
// Official supported: 1m, 5m, 15m, 30m, 1h, 2h, 6h, 1d
// NOT supported: 3m, 4h, 12h, 1w, 1M
const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '2h', '6h', '1d'];
const activeTab = ref('1h'); // Default timeframe

// Helper function - must be defined before use
function generateRandomString(length = 5) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
}

// Fibonacci Retracement - Support/Extension levels from HIGH downward
// 0-100% = Retracement (from HIGH to LOW)
// 100%+ = Downside Extensions (below LOW) - potential crash targets
const FIB_RETRACEMENT = [
  0,      // 0% - High (starting point - resistance)
  0.236,  // 23.6% - Shallow retracement
  0.382,  // 38.2% - Key retracement level
  0.5,    // 50% - Half retracement
  0.618,  // 61.8% - Golden Ratio (most important support)
  0.786,  // 78.6% - Deep retracement
  1,      // 100% - Low (full retracement - strong support)
  1.272,  // 127.2% - Downside extension (below LOW)
  1.414,  // 141.4% - √2 extension
  1.618,  // 161.8% - Golden extension downward
  2.0,    // 200% - Double range below HIGH
  2.618,  // 261.8% - Deep crash level
  3.0,    // 300% - Extreme downside
  3.5,    // 350% - Extended downside
  3.6,    // 360% - Deep downside
  3.7,    // 370% - Very deep downside
  3.8     // 380% - Ultra deep downside
];

// Fibonacci Extension - Target levels BEYOND the range (both directions)
// For UPSIDE targets (above HIGH) and DOWNSIDE targets (below LOW)
const FIB_EXTENSION = [
  1.236,  // 123.6% - First extension
  1.272,  // 127.2% - Extended target
  1.382,  // 138.2% - Extension level
  1.414,  // 141.4% - √2 extension
  1.5,    // 150% - 1.5x range
  1.618,  // 161.8% - Golden Ratio extension (key target)
  2.0,    // 200% - Double the range
  2.618,  // 261.8% - Extended golden ratio
  3.0,    // 300% - Triple range
  3.618,  // 361.8% - Extreme extension
  4.236,  // 423.6% - Very extended
  5.0,    // 500% - 5x range
  6.854,  // 685.4% - Extreme
  10.0,   // 1000% - 10x range
  15.0,   // 1500% - 15x
  20.0,   // 2000% - 20x
  30.0,   // 3000% - 30x
  50.0,   // 5000% - 50x
  100.0   // 10000% - 100x extreme
];

// Data storage per timeframe
const fibData = ref({});
const currentPrice = ref(null);
const athPrice = ref(0.15); // Example ATH - should be fetched from API
const basePrice = ref(0.03); // Example base price

// Bot Config
const botName = ref('FibBot');
const botConfig = ref({
  buyLevels: 5,
  sellLevels: 5,
  baseAmount: 10,
  spreadPercent: 0.5,
  upperPercent: 5,    // % above Fibonacci level (default 5%)
  lowerPercent: 5,    // % below Fibonacci level (default 5%)
  numberOfGrids: 10   // Number of grid orders (default 10)
});

// Scalping Calculator
const lowerPrice = ref(null);
const upperPrice = ref(null);
const bestBid = ref(null);
const bestAsk = ref(null);
const tickSize = ref(0.000001); // Minimum price increment

// Candle limit selector
const candleLimit = ref(1000);
const candleLimitOptions = [
  { label: '100 candles', value: 100 },
  { label: '200 candles', value: 200 },
  { label: '300 candles', value: 300 },
  { label: '500 candles', value: 500 },
  { label: '1000 candles', value: 1000 },
  { label: '1500 candles', value: 1500 },
  { label: '2000 candles', value: 2000 },
  { label: '3000 candles', value: 3000 }
];

// Fetch candles for timeframe
async function fetchCandles(timeframe) {
  try {
    // Safety check - don't fetch if exchange or symbol are not set
    if (!currentExchange.value || !currentSymbol.value) {
      console.warn('⚠️ Exchange or symbol not set, skipping candle fetch');
      return;
    }

    console.log(`📊 Fetching ${timeframe} candles (limit: ${candleLimit.value}) for ${currentSymbol.value} on ${currentExchange.value}`);

    const response = await $fetch('/api/v1/fetchCandlesCached', {
      query: {
        userID: userID.value,
        exchange: currentExchange.value,
        symbol: currentSymbol.value,
        timeframe: timeframe,
        limit: candleLimit.value
      }
    });

    console.log(`✅ Response for ${timeframe}:`, response.success ? `${response.count} candles (cached: ${response.cached})` : 'ERROR');

    if (response.success && response.data && response.data.length > 0) {
      const candles = response.data;
      const high = Math.max(...candles.map(c => c[2]));
      const low = Math.min(...candles.map(c => c[3]));
      const close = candles[candles.length - 1][4];

      currentPrice.value = close;

      // Update Bid/Ask for scalping calculator
      bestBid.value = close * 0.999; // Approximate bid
      bestAsk.value = close * 1.001; // Approximate ask
      lowerPrice.value = bestBid.value;
      upperPrice.value = bestAsk.value;

      // Calculate Fib Retracement (from high to low)
      // Cap minimum price at 0.000001 (can't have negative prices)
      const retracementLevels = FIB_RETRACEMENT.map(ratio => {
        const calculatedPrice = high - (high - low) * ratio;
        const finalPrice = Math.max(0.000001, calculatedPrice); // Minimum 1 satoshi
        return {
          ratio: ratio,
          price: finalPrice.toFixed(6),
          priceNum: finalPrice,
          label: `${(ratio * 100).toFixed(1)}%`,
          multiplier: `${ratio.toFixed(ratio < 1 ? 3 : 1)}x`
        };
      });

      // Calculate Fib Extension (from low, projecting upward)
      const range = high - low;
      const extensionLevels = FIB_EXTENSION.map(ratio => {
        const calculatedPrice = low + range * ratio;
        const finalPrice = Math.max(0.000001, calculatedPrice); // Minimum 1 satoshi
        return {
          ratio: ratio,
          price: finalPrice.toFixed(6),
          priceNum: finalPrice,
          label: `${(ratio * 100).toFixed(1)}%`,
          multiplier: `${ratio.toFixed(ratio < 1 ? 3 : 1)}x`
        };
      });

      // Calculate Fibonacci levels for EACH individual candle
      const candlesWithFib = candles.map((candle, index) => {
        const candleHigh = candle[2];
        const candleLow = candle[3];
        const candleOpen = candle[1];
        const candleClose = candle[4];
        const candleRange = candleHigh - candleLow;
        const isGreen = candleClose >= candleOpen;

        // 1. Body Size & Body %
        const bodySize = Math.abs(candleClose - candleOpen);
        const bodyPercent = candleRange > 0 ? (bodySize / candleRange * 100).toFixed(1) : 0;

        // 2. Wicks
        const upperWick = candleHigh - Math.max(candleOpen, candleClose);
        const lowerWick = Math.min(candleOpen, candleClose) - candleLow;
        const upperWickPercent = candleRange > 0 ? (upperWick / candleRange * 100).toFixed(1) : 0;
        const lowerWickPercent = candleRange > 0 ? (lowerWick / candleRange * 100).toFixed(1) : 0;

        // 3. Candle Pattern Detection
        let pattern = '-';
        const bodyRatio = candleRange > 0 ? bodySize / candleRange : 0;

        if (bodyRatio < 0.1) {
          pattern = 'Doji';
        } else if (isGreen && lowerWick > bodySize * 2 && upperWick < bodySize * 0.3) {
          pattern = 'Hammer';
        } else if (!isGreen && upperWick > bodySize * 2 && lowerWick < bodySize * 0.3) {
          pattern = 'Shooting Star';
        } else if (bodyRatio > 0.7) {
          pattern = isGreen ? 'Strong Bull' : 'Strong Bear';
        } else if (bodyRatio > 0.5) {
          pattern = isGreen ? 'Bullish' : 'Bearish';
        }

        // 4. Strength Score (1-10)
        const strengthScore = Math.min(10, Math.round(bodyRatio * 10 + 1));

        // 5. Momentum (price change %)
        const priceChange = candleClose - candleOpen;
        const priceChangePercent = candleOpen > 0 ? (priceChange / candleOpen * 100).toFixed(2) : 0;

        // 6. Closest Fib Level (from overall range)
        const closePositionInRange = (candleClose - low) / (high - low);
        let closestFibLevel = '0%';
        let minDistance = 1;
        FIB_RETRACEMENT.forEach(ratio => {
          const fibPosition = 1 - ratio;
          const distance = Math.abs(closePositionInRange - fibPosition);
          if (distance < minDistance) {
            minDistance = distance;
            closestFibLevel = `${(ratio * 100).toFixed(1)}%`;
          }
        });

        // 7. Position in Overall Range (0-100%)
        const positionInRange = (closePositionInRange * 100).toFixed(1);

        // 8. Distance to High/Low
        const distanceToHigh = ((high - candleClose) / high * 100).toFixed(2);
        const distanceToLow = ((candleClose - low) / low * 100).toFixed(2);

        // 9. Trend Direction (based on previous candles)
        let trendDirection = '→';
        if (index > 0) {
          const prevClose = candles[index - 1][4];
          if (candleClose > prevClose * 1.002) trendDirection = '↑';
          else if (candleClose < prevClose * 0.998) trendDirection = '↓';
        }

        // 10. Volatility Score (range % from open)
        const volatilityScore = candleOpen > 0 ? ((candleRange / candleOpen) * 100).toFixed(2) : 0;

        // 11-20: Advanced Pattern Recognition
        const reversalProbability = pattern === 'Hammer' || pattern === 'Shooting Star' ? 70 :
                                     pattern === 'Doji' ? 50 : 30;
        const bullishBearishScore = isGreen ? strengthScore : -strengthScore;
        const indecisionLevel = bodyRatio < 0.2 ? 'High' : bodyRatio < 0.5 ? 'Medium' : 'Low';

        // Gap calculation
        const gapUp = index > 0 ? candleOpen - candles[index - 1][4] : 0;
        const gapPercent = index > 0 && candles[index - 1][4] > 0 ?
                          (gapUp / candles[index - 1][4] * 100).toFixed(2) : 0;

        // Inside/Outside Bar
        const isInsideBar = index > 0 ?
                           (candleHigh <= candles[index - 1][2] && candleLow >= candles[index - 1][3]) : false;
        const isOutsideBar = index > 0 ?
                            (candleHigh >= candles[index - 1][2] && candleLow <= candles[index - 1][3]) : false;

        // High/Low Break (last 5 candles)
        let highBreak = false;
        let lowBreak = false;
        if (index >= 5) {
          const last5Highs = candles.slice(index - 5, index).map(c => c[2]);
          const last5Lows = candles.slice(index - 5, index).map(c => c[3]);
          highBreak = candleHigh > Math.max(...last5Highs);
          lowBreak = candleLow < Math.min(...last5Lows);
        }

        // 21-30: Fibonacci & Support/Resistance
        // Closest Fib Support (below close)
        let closestFibSupport = '0%';
        let minSupportDist = 999;
        FIB_RETRACEMENT.forEach(ratio => {
          const fibPrice = high - (high - low) * ratio;
          if (fibPrice < candleClose) {
            const dist = candleClose - fibPrice;
            if (dist < minSupportDist) {
              minSupportDist = dist;
              closestFibSupport = `${(ratio * 100).toFixed(1)}%`;
            }
          }
        });

        // Closest Fib Resistance (above close)
        let closestFibResistance = '0%';
        let minResistanceDist = 999;
        FIB_RETRACEMENT.forEach(ratio => {
          const fibPrice = high - (high - low) * ratio;
          if (fibPrice > candleClose) {
            const dist = fibPrice - candleClose;
            if (dist < minResistanceDist) {
              minResistanceDist = dist;
              closestFibResistance = `${(ratio * 100).toFixed(1)}%`;
            }
          }
        });

        const distanceToSupport = minSupportDist < 999 ? minSupportDist.toFixed(6) : 'N/A';
        const distanceToResistance = minResistanceDist < 999 ? minResistanceDist.toFixed(6) : 'N/A';

        // Rejection detection (long wick at Fib level)
        const hasRejection = (upperWickPercent > 40 && !isGreen) || (lowerWickPercent > 40 && isGreen);

        // Fakeout detection (close back inside range)
        const isFakeout = index > 0 && (
          (candleHigh > candles[index - 1][2] && candleClose < candles[index - 1][2]) ||
          (candleLow < candles[index - 1][3] && candleClose > candles[index - 1][3])
        );

        // Key level (round numbers)
        const closeRounded = Math.round(candleClose * 1000) / 1000;
        const isKeyLevel = (closeRounded % 0.01 === 0) || (closeRounded % 0.1 === 0);

        // 31-40: Momentum & Trend Advanced
        const acceleration = index > 0 ?
          parseFloat(priceChangePercent) - (candles[index - 1][4] - candles[index - 1][1]) / candles[index - 1][1] * 100 : 0;

        // Trend analysis (last 5 candles)
        let trendStrength = 5;
        let higherHigh = false;
        let lowerLow = false;
        let higherLow = false;
        let lowerHigh = false;

        if (index > 0) {
          const prevHigh = candles[index - 1][2];
          const prevLow = candles[index - 1][3];
          higherHigh = candleHigh > prevHigh;
          lowerLow = candleLow < prevLow;
          higherLow = candleLow > prevLow;
          lowerHigh = candleHigh < prevHigh;

          // Trend strength calculation
          if (index >= 5) {
            let upCount = 0;
            for (let i = 1; i <= 5; i++) {
              if (candles[index - i][4] > candles[index - i][1]) upCount++;
            }
            trendStrength = Math.abs(upCount - 2.5) * 2; // 0-10 scale
          }
        }

        // 41-50: Time & Position Analysis
        let timeSinceLastGreen = 0;
        let timeSinceLastRed = 0;
        for (let i = index - 1; i >= 0; i--) {
          if (candles[i][4] >= candles[i][1] && timeSinceLastGreen === 0) {
            timeSinceLastGreen = index - i;
            break;
          }
        }
        for (let i = index - 1; i >= 0; i--) {
          if (candles[i][4] < candles[i][1] && timeSinceLastRed === 0) {
            timeSinceLastRed = index - i;
            break;
          }
        }

        // Session time detection
        const candleDate = new Date(candle[0]);
        const hour = candleDate.getUTCHours();
        let sessionTime = 'US';
        if (hour >= 0 && hour < 8) sessionTime = 'Asian';
        else if (hour >= 8 && hour < 13) sessionTime = 'European';

        const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][candleDate.getDay()];
        const hourOfDay = candleDate.getHours();

        // 51-60: Advanced Analytics
        const imbalance = upperWick + lowerWick > bodySize ? 'Yes' : 'No';

        // Exhaustion signal (very large candle after long trend)
        let isExhaustion = false;
        if (index >= 10 && bodyPercent > 70) {
          const avgBody = candles.slice(index - 10, index).reduce((sum, c) =>
            sum + Math.abs(c[4] - c[1]), 0) / 10;
          isExhaustion = bodySize > avgBody * 2;
        }

        // Price velocity (change rate)
        const priceVelocity = index > 0 ?
          Math.abs(candleClose - candles[index - 1][4]) / Math.abs(candles[index - 1][4] - candles[index - 1][1]) : 0;

        // Candle age
        const candleAge = Math.floor((Date.now() - candle[0]) / (1000 * 60 * 60)); // hours

        // Simple probability prediction (based on pattern)
        let probabilityGreenNext = 50;
        let probabilityRedNext = 50;
        if (isGreen && strengthScore >= 7) {
          probabilityGreenNext = 60;
          probabilityRedNext = 40;
        } else if (!isGreen && strengthScore >= 7) {
          probabilityGreenNext = 40;
          probabilityRedNext = 60;
        }
        if (pattern === 'Hammer') {
          probabilityGreenNext = 70;
          probabilityRedNext = 30;
        } else if (pattern === 'Shooting Star') {
          probabilityGreenNext = 30;
          probabilityRedNext = 70;
        }

        // Risk/Reward to next Fib level
        const riskReward = minSupportDist < 999 && minResistanceDist < 999 ?
          (minResistanceDist / minSupportDist).toFixed(2) : 'N/A';

        // Entry signal score (1-100)
        let entrySignalScore = 50;
        if (pattern === 'Hammer' || pattern === 'Shooting Star') entrySignalScore += 20;
        if (strengthScore >= 7) entrySignalScore += 10;
        if (hasRejection) entrySignalScore += 10;
        if (isKeyLevel) entrySignalScore += 5;
        if (volatilityScore > 2) entrySignalScore += 5;
        entrySignalScore = Math.min(100, Math.max(0, entrySignalScore));

        // Fib Retracement for this specific candle
        const candleRetracement = FIB_RETRACEMENT.map(ratio => {
          const calculatedPrice = candleHigh - candleRange * ratio;
          const finalPrice = Math.max(0.000001, calculatedPrice); // Minimum 1 satoshi
          return {
            ratio: ratio,
            price: finalPrice.toFixed(6),
            priceNum: finalPrice,
            label: `${(ratio * 100).toFixed(1)}%`,
            multiplier: `${ratio.toFixed(ratio < 1 ? 3 : 1)}x`
          };
        });

        // Fib Extension for this specific candle
        const candleExtension = FIB_EXTENSION.map(ratio => {
          const calculatedPrice = candleLow + candleRange * ratio;
          const finalPrice = Math.max(0.000001, calculatedPrice); // Minimum 1 satoshi
          return {
            ratio: ratio,
            price: finalPrice.toFixed(6),
            priceNum: finalPrice,
            label: `${(ratio * 100).toFixed(1)}%`,
            multiplier: `${ratio.toFixed(ratio < 1 ? 3 : 1)}x`
          };
        });

        return {
          timestamp: new Date(candle[0]).toLocaleString(),
          timestampRaw: candle[0],  // Keep raw timestamp for sorting
          open: candleOpen.toFixed(6),
          high: candleHigh.toFixed(6),
          low: candleLow.toFixed(6),
          close: candleClose.toFixed(6),
          volume: candle[5] ? candle[5].toLocaleString('en-US', { maximumFractionDigits: 0 }) : 'N/A',
          range: candleRange.toFixed(6),
          isGreen: isGreen,

          // 1-10: Basic Statistics
          bodySize: bodySize.toFixed(6),
          bodyPercent: bodyPercent,
          upperWick: upperWick.toFixed(6),
          lowerWick: lowerWick.toFixed(6),
          upperWickPercent: upperWickPercent,
          lowerWickPercent: lowerWickPercent,
          rangePercent: volatilityScore,

          // 11-20: Pattern Recognition
          pattern: pattern,
          reversalProbability: reversalProbability,
          strengthScore: strengthScore,
          bullishBearishScore: bullishBearishScore,
          indecisionLevel: indecisionLevel,
          gapUp: gapUp.toFixed(6),
          gapPercent: gapPercent,
          isInsideBar: isInsideBar,
          isOutsideBar: isOutsideBar,
          highBreak: highBreak,
          lowBreak: lowBreak,

          // 21-30: Fibonacci & Support/Resistance
          closestFibLevel: closestFibLevel,
          closestFibSupport: closestFibSupport,
          closestFibResistance: closestFibResistance,
          distanceToSupport: distanceToSupport,
          distanceToResistance: distanceToResistance,
          hasRejection: hasRejection,
          isFakeout: isFakeout,
          isKeyLevel: isKeyLevel,

          // 31-40: Momentum & Trend
          priceChange: priceChange.toFixed(6),
          priceChangePercent: priceChangePercent,
          momentum: priceChangePercent,
          acceleration: acceleration.toFixed(2),
          trendDirection: trendDirection,
          trendStrength: trendStrength.toFixed(1),
          higherHigh: higherHigh,
          lowerLow: lowerLow,
          higherLow: higherLow,
          lowerHigh: lowerHigh,

          // 41-50: Time & Position Analysis
          timeSinceLastGreen: timeSinceLastGreen,
          timeSinceLastRed: timeSinceLastRed,
          positionInRange: positionInRange,
          distanceToHigh: distanceToHigh,
          distanceToLow: distanceToLow,
          sessionTime: sessionTime,
          dayOfWeek: dayOfWeek,
          hourOfDay: hourOfDay,

          // 51-60: Advanced Analytics
          volatilityScore: volatilityScore,
          imbalance: imbalance,
          isExhaustion: isExhaustion,
          priceVelocity: priceVelocity.toFixed(2),
          candleAge: candleAge,
          probabilityGreenNext: probabilityGreenNext,
          probabilityRedNext: probabilityRedNext,
          riskReward: riskReward,
          entrySignalScore: entrySignalScore,

          // Fibonacci levels
          retracement: candleRetracement,
          extension: candleExtension
        };
      });

      // Reverse the array to show newest candles first (reverse chronological order)
      // Then re-index from 1 (newest) to N (oldest)
      const candlesReversed = [...candlesWithFib].reverse().map((candle, index) => {
        // Calculate consecutive count
        let consecutiveCount = 1;
        let checkIndex = index + 1;
        while (checkIndex < candlesWithFib.length) {
          const nextCandle = [...candlesWithFib].reverse()[checkIndex];
          if (nextCandle.isGreen === candle.isGreen) {
            consecutiveCount++;
            checkIndex++;
          } else {
            break;
          }
        }

        return {
          ...candle,
          index: index + 1,  // Re-index after reversing: 1=newest, N=oldest
          consecutiveCount: consecutiveCount
        };
      });

      fibData.value[timeframe] = {
        high: high.toFixed(6),
        low: low.toFixed(6),
        close: close.toFixed(6),
        range: range.toFixed(6),
        retracement: retracementLevels,
        extension: extensionLevels,
        candles: candlesReversed  // All candles in reverse chronological order (newest first)
      };
    }
  } catch (error) {
    console.error(`Error fetching ${timeframe} candles:`, error);
  }
}

// Calculate ATH-based Fibonacci
function calculateATHFib() {
  const range = athPrice.value - basePrice.value;

  const retracementLevels = FIB_RETRACEMENT.map(ratio => {
    const calculatedPrice = athPrice.value - range * ratio;
    const finalPrice = Math.max(0.000001, calculatedPrice); // Minimum 1 satoshi
    return {
      ratio: ratio,
      price: finalPrice.toFixed(6),
      priceNum: finalPrice,
      label: `${(ratio * 100).toFixed(1)}%`,
      multiplier: `${ratio.toFixed(ratio < 1 ? 3 : 1)}x`,
      distance: ((athPrice.value - finalPrice) / athPrice.value * 100).toFixed(2)
    };
  });

  const extensionLevels = FIB_EXTENSION.map(ratio => {
    const calculatedPrice = basePrice.value + range * ratio;
    const finalPrice = Math.max(0.000001, calculatedPrice); // Minimum 1 satoshi
    return {
      ratio: ratio,
      price: finalPrice.toFixed(6),
      priceNum: finalPrice,
      label: `${(ratio * 100).toFixed(1)}%`,
      multiplier: `${ratio.toFixed(ratio < 1 ? 3 : 1)}x`,
      target: (finalPrice - currentPrice.value).toFixed(6)
    };
  });

  return { retracement: retracementLevels, extension: extensionLevels };
}

const athFib = computed(() => calculateATHFib());

// Load all timeframes on mount
onMounted(async () => {
  // Generate bot name on client side only (after hydration)
  botName.value = `FibBot_${generateRandomString(5)}`;

  console.log('🚀 FibBots onMounted called');
  console.log('Current exchange:', currentExchange.value);
  console.log('Current symbol:', currentSymbol.value);
  console.log('Active tab:', activeTab.value);

  // Wait for exchange data to be loaded
  if (!currentExchange.value || !currentSymbol.value) {
    console.warn('⏳ Waiting for exchange/symbol to be loaded...');
    // Wait up to 5 seconds for data
    for (let i = 0; i < 50; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (currentExchange.value && currentSymbol.value) {
        console.log('✅ Exchange and symbol loaded:', currentExchange.value, currentSymbol.value);
        break;
      }
    }
  }

  if (!currentExchange.value || !currentSymbol.value) {
    console.error('❌ Exchange or symbol not loaded after waiting');
    return;
  }

  try {
    // Load only the active tab first for faster initial load (skip ATH tab)
    if (activeTab.value !== 'ath') {
      await fetchCandles(activeTab.value);
      console.log('✅ Initial candles loaded');
    }
  } catch (error) {
    console.error('❌ Error in onMounted:', error);
  }

  // Then load other timeframes in background
  setTimeout(async () => {
    for (const tf of TIMEFRAMES) {
      if (tf !== activeTab.value && tf !== 'ath') {
        await fetchCandles(tf);
      }
    }
  }, 1000);

  // Refresh every 30 seconds (skip ATH tab)
  refreshInterval = setInterval(async () => {
    if (activeTab.value !== 'ath') {
      await fetchCandles(activeTab.value);
    }
  }, 30000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

// Watch for tab changes
watch(activeTab, (newTab) => {
  if (!fibData.value[newTab]) {
    fetchCandles(newTab);
  }
});

// Watch for candle limit changes - reload current timeframe
watch(candleLimit, () => {
  console.log(`🔄 Candle limit changed to ${candleLimit.value}, reloading ${activeTab.value}...`);
  fetchCandles(activeTab.value);
  selectedCandleIndex.value = null; // Reset selection when changing limit
});

// Force refresh candles (bypass cache)
async function forceRefreshCandles() {
  try {
    console.log('🗑️ Clearing candle cache and fetching fresh data...');

    // Delete old candles from DB for current symbol/exchange/timeframe
    await $fetch('/api/v1/deleteDBChartData', {
      query: {
        exchange: currentExchange.value,
        symbol: currentSymbol.value,
        timeframe: activeTab.value
      }
    });

    console.log('✅ Cache cleared, fetching fresh candles...');

    // Fetch fresh candles
    await fetchCandles(activeTab.value);

    console.log('✅ Fresh candles loaded!');
  } catch (error) {
    console.error('❌ Error force refreshing candles:', error);
  }
}

// Watch for tab changes - reset selected candle
watch(activeTab, () => {
  selectedCandleIndex.value = null;
});

function selectCandle(index) {
  selectedCandleIndex.value = index;
  console.log(`📍 Selected candle #${index}`);
}

// Create bot from Fibonacci Bot Configuration panel (old function)
async function createFibBotFromConfig(botType) {
  if (!selectedApiKey.value) {
    alert('Please select an API key');
    return;
  }

  const tf = fibData.value[activeTab.value];
  if (!tf) {
    alert('No data for selected timeframe');
    return;
  }

  try {
    const botData = {
      userID: userID.value,
      name: botName.value,
      exchange: currentExchange.value,
      symbol: currentSymbol.value,
      timeframe: activeTab.value,
      lowerPrice: parseFloat(tf.low),
      upperPrice: parseFloat(tf.high),
      amountType: 'incrementalPercent',
      amount: botConfig.value.baseAmount,
      nrOfGrids: botConfig.value.buyLevels + botConfig.value.sellLevels,
      ordersSide: botType,
      apiKeyName: selectedApiKey.value,
      fibLevels: {
        retracement: tf.retracement,
        extension: tf.extension,
        spreadPercent: botConfig.value.spreadPercent
      }
    };

    await $fetch('/api/v1/Bots/createFibBot', {
      method: 'POST',
      body: botData,
    });

    alert(`Fibonacci ${botType} Bot created for ${activeTab.value}!`);
  } catch (error) {
    console.error('Error creating Fibonacci bot:', error);
    alert('Failed to create Fibonacci Grid Bot');
  }
}

// Create bot from specific Fibonacci level (new function for per-level bot creation)
async function createFibBot(botType, fibLevel, timeframe) {
  if (!selectedApiKey.value) {
    alert('⚠️ Please select an API key first!');
    return;
  }

  if (!fibLevel || !fibLevel.price) {
    alert('⚠️ Invalid Fibonacci level');
    return;
  }

  const levelPrice = parseFloat(fibLevel.price);
  const lowerMultiplier = botConfig.value.lowerPercent / 100; // % below level
  const upperMultiplier = botConfig.value.upperPercent / 100; // % above level

  // Calculate price range based on bot type
  let lowerPriceValue, upperPriceValue, ordersSide;

  if (botType === 'BUY') {
    // BUY bot: Place LIMIT BUY orders BELOW the Fibonacci level
    // Orders are placed immediately and wait for price to come down
    lowerPriceValue = levelPrice * (1 - lowerMultiplier);
    upperPriceValue = levelPrice;
    ordersSide = 'buyOnly';
  } else if (botType === 'SELL') {
    // SELL bot: Place LIMIT SELL orders ABOVE the Fibonacci level
    // Orders are placed immediately and wait for price to go up
    lowerPriceValue = levelPrice;
    upperPriceValue = levelPrice * (1 + upperMultiplier);
    ordersSide = 'sellOnly';
  } else if (botType === 'BOTH') {
    // BOTH: Place LIMIT orders on both sides
    // BUY orders below (catch wicks down) + SELL orders above (catch wicks up)
    lowerPriceValue = levelPrice * (1 - lowerMultiplier);
    upperPriceValue = levelPrice * (1 + upperMultiplier);
    ordersSide = 'buyOrSell';
  }

  const botNameValue = `FibBot_${timeframe}_${fibLevel.label}_${botType}_${generateRandomString()}`;

  try {
    const botData = {
      userID: userID.value,
      name: botNameValue,
      exchange: currentExchange.value,
      symbol: currentSymbol.value,
      timeframe: timeframe,
      lowerPrice: lowerPriceValue,
      upperPrice: upperPriceValue,
      amountType: 'incrementalPercent',
      amount: botConfig.value.baseAmount || 10,
      nrOfGrids: botConfig.value.numberOfGrids || 10,
      ordersSide: ordersSide,
      apiKeyName: selectedApiKey.value,
      fibLevel: {
        label: fibLevel.label,
        price: levelPrice,
        multiplier: fibLevel.multiplier,
        ratio: fibLevel.ratio
      }
    };

    console.log('🤖 Creating Fibonacci Bot:', botData);

    await $fetch('/api/v1/Bots/createFibBot', {
      method: 'POST',
      body: botData,
    });

    alert(`✅ Fibonacci ${botType} Bot created!\n\nLevel: ${fibLevel.label} (${fibLevel.multiplier})\nPrice: ${levelPrice}\nRange: ${lowerPriceValue.toFixed(6)} - ${upperPriceValue.toFixed(6)}\nTimeframe: ${timeframe}`);
  } catch (error) {
    console.error('❌ Error creating Fibonacci bot:', error);
    alert(`❌ Failed to create bot: ${error.message || 'Unknown error'}`);
  }
}
</script>

<template>
  <div style="padding: 12px;">
    <!-- Header with Bot Actions - Collapsible -->
    <n-card size="small" style="margin-bottom: 12px; background: linear-gradient(135deg, #1a1f2e 0%, #2a3441 100%);">
      <template #header>
        <div @click="configCollapsed = !configCollapsed" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 13px; font-weight: 700; color: #6366f1;">📊 Fibonacci Bot Configuration</span>
          <n-icon size="16">
            <svg v-if="!configCollapsed" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 17l5-5-5-5v10z"/>
            </svg>
          </n-icon>
        </div>
      </template>

      <n-collapse-transition :show="!configCollapsed">
        <!-- Row 1: Bot Name, Candles, Create Bot Buttons -->
        <n-grid :cols="5" x-gap="12" style="margin-bottom: 12px;">
          <n-gi>
            <n-input v-model:value="botName" size="small" placeholder="Bot Name">
              <template #prefix>📊</template>
            </n-input>
          </n-gi>
          <n-gi>
            <n-select
              v-model:value="candleLimit"
              :options="candleLimitOptions"
              size="small"
              placeholder="Candles"
            />
          </n-gi>
          <n-gi>
            <n-button type="primary" @click="createFibBotFromConfig('buyOrSell')" block size="small">
              🚀 Buy & Sell
            </n-button>
          </n-gi>
          <n-gi>
            <n-button type="success" @click="createFibBotFromConfig('buyOnly')" block size="small">
              📈 Buy Only
            </n-button>
          </n-gi>
          <n-gi>
            <n-button type="error" @click="createFibBotFromConfig('sellOnly')" block size="small">
              📉 Sell Only
            </n-button>
          </n-gi>
        </n-grid>

        <!-- Row 2: Bot Configuration for Fibonacci Levels -->
        <n-grid :cols="4" x-gap="12">
          <n-gi>
            <div style="text-align: center; margin-bottom: 4px;">
              <span style="font-size: 10px; color: #10eb04; font-weight: 700;">LOWER % (below Fib)</span>
            </div>
            <n-input-number
              v-model:value="botConfig.lowerPercent"
              size="small"
              :min="0.1"
              :max="50"
              :step="0.5"
              :precision="1"
              style="width: 100%;"
            >
              <template #suffix>%</template>
            </n-input-number>
          </n-gi>
          <n-gi>
            <div style="text-align: center; margin-bottom: 4px;">
              <span style="font-size: 10px; color: #f52a09; font-weight: 700;">UPPER % (above Fib)</span>
            </div>
            <n-input-number
              v-model:value="botConfig.upperPercent"
              size="small"
              :min="0.1"
              :max="50"
              :step="0.5"
              :precision="1"
              style="width: 100%;"
            >
              <template #suffix>%</template>
            </n-input-number>
          </n-gi>
          <n-gi>
            <div style="text-align: center; margin-bottom: 4px;">
              <span style="font-size: 10px; color: #fbbf24; font-weight: 700;">NUMBER OF GRIDS</span>
            </div>
            <n-input-number
              v-model:value="botConfig.numberOfGrids"
              size="small"
              :min="3"
              :max="50"
              :step="1"
              :precision="0"
              style="width: 100%;"
            />
          </n-gi>
          <n-gi>
            <div style="text-align: center; margin-bottom: 4px;">
              <span style="font-size: 10px; color: #60a5fa; font-weight: 700;">BASE AMOUNT ($)</span>
            </div>
            <n-input-number
              v-model:value="botConfig.baseAmount"
              size="small"
              :min="1"
              :max="10000"
              :step="5"
              :precision="2"
              style="width: 100%;"
            >
              <template #prefix>$</template>
            </n-input-number>
          </n-gi>
        </n-grid>
      </n-collapse-transition>
    </n-card>

    <!-- Timeframe Tabs -->
    <n-tabs v-model:value="activeTab" type="line" animated>
      <!-- Regular Timeframes -->
      <n-tab-pane v-for="tf in TIMEFRAMES" :key="tf" :name="tf" :tab="tf">
        <div v-if="fibData[tf]">
          <!-- Overall Market Info (All Candles) -->
          <n-card size="small" style="margin-bottom: 12px; background: linear-gradient(135deg, #1a1f2e 0%, #2a3441 100%);">
            <template #header>
              <div style="font-size: 11px; color: #fbbf24; font-weight: 700;">
                📊 Overall Range ({{ candleLimit }} candles)
              </div>
            </template>
            <n-grid :cols="4" x-gap="12">
              <n-gi>
                <div style="text-align: center;">
                  <div style="font-size: 9px; color: #888; margin-bottom: 4px;">OVERALL HIGH</div>
                  <div style="font-size: 16px; color: #f52a09; font-weight: 700; font-family: monospace;">
                    {{ fibData[tf].high }}
                  </div>
                </div>
              </n-gi>
              <n-gi>
                <div style="text-align: center;">
                  <div style="font-size: 9px; color: #888; margin-bottom: 4px;">OVERALL LOW</div>
                  <div style="font-size: 16px; color: #10eb04; font-weight: 700; font-family: monospace;">
                    {{ fibData[tf].low }}
                  </div>
                </div>
              </n-gi>
              <n-gi>
                <div style="text-align: center;">
                  <div style="font-size: 9px; color: #888; margin-bottom: 4px;">CURRENT CLOSE</div>
                  <div style="font-size: 16px; color: #05f5ed; font-weight: 700; font-family: monospace;">
                    {{ fibData[tf].close }}
                  </div>
                </div>
              </n-gi>
              <n-gi>
                <div style="text-align: center;">
                  <div style="font-size: 9px; color: #888; margin-bottom: 4px;">OVERALL RANGE</div>
                  <div style="font-size: 16px; color: #f5a623; font-weight: 700; font-family: monospace;">
                    {{ fibData[tf].range }}
                  </div>
                </div>
              </n-gi>
            </n-grid>
          </n-card>

          <!-- Last Candle Info -->
          <n-card size="small" style="margin-bottom: 12px; background: linear-gradient(135deg, #2a3441 0%, #1a1f2e 100%);"
                  v-if="fibData[tf]?.candles?.length > 0 && fibData[tf].candles[fibData[tf].candles.length - 1]">
            <template #header>
              <div style="font-size: 11px; color: #60a5fa; font-weight: 700;">
                🕐 Last {{ tf }} Candle Data
              </div>
            </template>
            <n-grid :cols="6" x-gap="8">
              <n-gi>
                <div style="text-align: center;">
                  <div style="font-size: 8px; color: #888; margin-bottom: 2px;">OPEN</div>
                  <div style="font-size: 12px; color: #888; font-weight: 600; font-family: monospace;">
                    {{ fibData[tf].candles[fibData[tf].candles.length - 1][1]?.toFixed(6) || 'N/A' }}
                  </div>
                </div>
              </n-gi>
              <n-gi>
                <div style="text-align: center;">
                  <div style="font-size: 8px; color: #888; margin-bottom: 2px;">HIGH</div>
                  <div style="font-size: 12px; color: #f52a09; font-weight: 600; font-family: monospace;">
                    {{ fibData[tf].candles[fibData[tf].candles.length - 1][2]?.toFixed(6) || 'N/A' }}
                  </div>
                </div>
              </n-gi>
              <n-gi>
                <div style="text-align: center;">
                  <div style="font-size: 8px; color: #888; margin-bottom: 2px;">LOW</div>
                  <div style="font-size: 12px; color: #10eb04; font-weight: 600; font-family: monospace;">
                    {{ fibData[tf].candles[fibData[tf].candles.length - 1][3]?.toFixed(6) || 'N/A' }}
                  </div>
                </div>
              </n-gi>
              <n-gi>
                <div style="text-align: center;">
                  <div style="font-size: 8px; color: #888; margin-bottom: 2px;">CLOSE</div>
                  <div style="font-size: 12px; color: #05f5ed; font-weight: 600; font-family: monospace;">
                    {{ fibData[tf].candles[fibData[tf].candles.length - 1][4]?.toFixed(6) || 'N/A' }}
                  </div>
                </div>
              </n-gi>
              <n-gi>
                <div style="text-align: center;">
                  <div style="font-size: 8px; color: #888; margin-bottom: 2px;">RANGE</div>
                  <div style="font-size: 12px; color: #f5a623; font-weight: 600; font-family: monospace;">
                    {{ (fibData[tf].candles[fibData[tf].candles.length - 1][2] && fibData[tf].candles[fibData[tf].candles.length - 1][3])
                       ? (fibData[tf].candles[fibData[tf].candles.length - 1][2] - fibData[tf].candles[fibData[tf].candles.length - 1][3]).toFixed(6)
                       : 'N/A' }}
                  </div>
                </div>
              </n-gi>
              <n-gi>
                <div style="text-align: center;">
                  <div style="font-size: 8px; color: #888; margin-bottom: 2px;">CHANGE %</div>
                  <div style="font-size: 12px; font-weight: 600; font-family: monospace;"
                       :style="{ color: (fibData[tf].candles[fibData[tf].candles.length - 1][4] && fibData[tf].candles[fibData[tf].candles.length - 1][1] && fibData[tf].candles[fibData[tf].candles.length - 1][4] >= fibData[tf].candles[fibData[tf].candles.length - 1][1]) ? '#10eb04' : '#f52a09' }">
                    {{ (fibData[tf].candles[fibData[tf].candles.length - 1][4] && fibData[tf].candles[fibData[tf].candles.length - 1][1])
                       ? (((fibData[tf].candles[fibData[tf].candles.length - 1][4] - fibData[tf].candles[fibData[tf].candles.length - 1][1]) / fibData[tf].candles[fibData[tf].candles.length - 1][1]) * 100).toFixed(2) + '%'
                       : 'N/A' }}
                  </div>
                </div>
              </n-gi>
            </n-grid>
          </n-card>

          <!-- Overall Fib Levels Grid -->
          <n-grid :cols="2" x-gap="12" style="margin-bottom: 12px;">
            <!-- Retracement Levels -->
            <n-gi>
              <n-card size="small" title="📉 Overall Fib Retracement (Support)" style="background: rgba(16, 235, 4, 0.05);">
                <div style="overflow-x: auto;">
                  <table style="width: 100%; font-size: 8px; font-family: monospace;">
                    <thead>
                      <tr style="border-bottom: 2px solid #10eb04;">
                        <th style="padding: 3px; text-align: left; color: #10eb04; font-size: 8px;">Level</th>
                        <th style="padding: 3px; text-align: right; color: #10eb04; font-size: 8px;">Price</th>
                        <th style="padding: 3px; text-align: right; color: #10eb04; font-size: 8px;">Spread</th>
                        <th style="padding: 3px; text-align: right; color: #10eb04; font-size: 8px;">Dist%</th>
                        <th style="padding: 3px; text-align: right; color: #10eb04; font-size: 8px;">$Diff</th>
                        <th style="padding: 3px; text-align: center; color: #10eb04; font-size: 8px;">Str</th>
                        <th style="padding: 3px; text-align: center; color: #10eb04; font-size: 8px;">Act</th>
                        <th style="padding: 3px; text-align: center; color: #10eb04; font-size: 8px;">R:R</th>
                        <th style="padding: 3px; text-align: right; color: #10eb04; font-size: 8px;">SL</th>
                        <th style="padding: 3px; text-align: right; color: #10eb04; font-size: 8px;">TP</th>
                        <th style="padding: 3px; text-align: center; color: #10eb04; font-size: 8px;">GP</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(level, index) in fibData[tf].retracement" :key="level.ratio"
                          style="border-bottom: 1px solid rgba(16, 235, 4, 0.2);">
                        <td style="padding: 3px; color: #888; font-weight: 600; font-size: 8px;">
                          {{ level.label }}
                          <span style="color: #fbbf24; margin-left: 3px; font-weight: 700;">{{ level.multiplier }}</span>
                        </td>
                        <td style="padding: 3px; text-align: right; color: #10eb04; font-size: 9px; font-weight: 700;">
                          {{ level.price }}
                        </td>
                        <td style="padding: 3px; text-align: right; color: #60a5fa; font-size: 7px;">
                          {{ index < fibData[tf].retracement.length - 1
                             ? (((fibData[tf].retracement[index + 1].priceNum - level.priceNum) / level.priceNum * 100).toFixed(1) + '%')
                             : '-' }}
                        </td>
                        <td style="padding: 3px; text-align: right; font-size: 7px;"
                            :style="{ color: level.priceNum > fibData[tf].close ? '#f52a09' : '#10eb04' }">
                          {{ ((level.priceNum - fibData[tf].close) / fibData[tf].close * 100).toFixed(1) }}%
                        </td>
                        <td style="padding: 3px; text-align: right; font-size: 7px;"
                            :style="{ color: level.priceNum > fibData[tf].close ? '#f52a09' : '#10eb04' }">
                          ${{ (level.priceNum - fibData[tf].close).toFixed(6) }}
                        </td>
                        <td style="padding: 3px; text-align: center; color: #fbbf24; font-size: 7px;">
                          {{ level.ratio === 0.618 || level.ratio === 0.382 ? '★★★★★' :
                             level.ratio === 0.5 || level.ratio === 1 || level.ratio === 1.618 ? '★★★★' :
                             level.ratio === 0.236 || level.ratio === 0.786 || level.ratio === 2.618 ? '★★★' : '★★' }}
                        </td>
                        <td style="padding: 3px; text-align: center; font-size: 7px; font-weight: 700;"
                            :style="{ color: level.priceNum < fibData[tf].close ? '#10eb04' : '#f52a09' }">
                          {{ level.priceNum < fibData[tf].close ? 'BUY' : 'SELL' }}
                        </td>
                        <td style="padding: 3px; text-align: center; font-size: 7px; color: #8b5cf6; font-weight: 700;">
                          {{ level.ratio === 0.618 || level.ratio === 0.382 ? '1:3' :
                             level.ratio === 0.5 || level.ratio === 1 ? '1:2' : '1:1.5' }}
                        </td>
                        <td style="padding: 3px; text-align: right; font-size: 7px; color: #f87171;">
                          {{ index < fibData[tf].retracement.length - 1
                             ? fibData[tf].retracement[index + 1].price
                             : (level.priceNum * 0.98).toFixed(6) }}
                        </td>
                        <td style="padding: 3px; text-align: right; font-size: 7px; color: #4ade80;">
                          {{ index > 0
                             ? fibData[tf].retracement[index - 1].price
                             : (level.priceNum * 1.05).toFixed(6) }}
                        </td>
                        <td style="padding: 3px; text-align: center; font-size: 7px;">
                          {{ level.ratio >= 0.618 && level.ratio <= 0.65 ? '💎' : '' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </n-card>
            </n-gi>

            <!-- Extension Levels -->
            <n-gi>
              <n-card size="small" title="📈 Overall Fib Extension (Resistance)" style="background: rgba(245, 42, 9, 0.05);">
                <div style="overflow-x: auto;">
                  <table style="width: 100%; font-size: 8px; font-family: monospace;">
                    <thead>
                      <tr style="border-bottom: 2px solid #f52a09;">
                        <th style="padding: 3px; text-align: left; color: #f52a09; font-size: 8px;">Level</th>
                        <th style="padding: 3px; text-align: right; color: #f52a09; font-size: 8px;">Price</th>
                        <th style="padding: 3px; text-align: right; color: #f52a09; font-size: 8px;">Spread</th>
                        <th style="padding: 3px; text-align: right; color: #f52a09; font-size: 8px;">Dist%</th>
                        <th style="padding: 3px; text-align: right; color: #f52a09; font-size: 8px;">$Diff</th>
                        <th style="padding: 3px; text-align: center; color: #f52a09; font-size: 8px;">Str</th>
                        <th style="padding: 3px; text-align: center; color: #f52a09; font-size: 8px;">Act</th>
                        <th style="padding: 3px; text-align: center; color: #f52a09; font-size: 8px;">R:R</th>
                        <th style="padding: 3px; text-align: right; color: #f52a09; font-size: 8px;">SL</th>
                        <th style="padding: 3px; text-align: right; color: #f52a09; font-size: 8px;">TP</th>
                        <th style="padding: 3px; text-align: center; color: #f52a09; font-size: 8px;">GP</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(level, index) in fibData[tf].extension" :key="level.ratio"
                          style="border-bottom: 1px solid rgba(245, 42, 9, 0.2);">
                        <td style="padding: 3px; color: #888; font-weight: 600; font-size: 8px;">
                          {{ level.label }}
                          <span style="color: #fbbf24; margin-left: 3px; font-weight: 700;">{{ level.multiplier }}</span>
                        </td>
                        <td style="padding: 3px; text-align: right; color: #f52a09; font-size: 9px; font-weight: 700;">
                          {{ level.price }}
                        </td>
                        <td style="padding: 3px; text-align: right; color: #60a5fa; font-size: 7px;">
                          {{ index < fibData[tf].extension.length - 1
                             ? (((fibData[tf].extension[index + 1].priceNum - level.priceNum) / level.priceNum * 100).toFixed(1) + '%')
                             : '-' }}
                        </td>
                        <td style="padding: 3px; text-align: right; font-size: 7px;"
                            :style="{ color: level.priceNum > fibData[tf].close ? '#f52a09' : '#10eb04' }">
                          {{ ((level.priceNum - fibData[tf].close) / fibData[tf].close * 100).toFixed(1) }}%
                        </td>
                        <td style="padding: 3px; text-align: right; font-size: 7px;"
                            :style="{ color: level.priceNum > fibData[tf].close ? '#f52a09' : '#10eb04' }">
                          ${{ (level.priceNum - fibData[tf].close).toFixed(6) }}
                        </td>
                        <td style="padding: 3px; text-align: center; color: #fbbf24; font-size: 7px;">
                          {{ level.ratio === 1.618 || level.ratio === 2.618 ? '★★★★★' :
                             level.ratio === 1.236 || level.ratio === 1.414 || level.ratio === 3.618 ? '★★★★' :
                             level.ratio === 1.272 || level.ratio === 1.5 || level.ratio === 5.0 ? '★★★' : '★★' }}
                        </td>
                        <td style="padding: 3px; text-align: center; font-size: 7px; font-weight: 700;"
                            :style="{ color: level.priceNum < fibData[tf].close ? '#10eb04' : '#f52a09' }">
                          {{ level.priceNum < fibData[tf].close ? 'BUY' : 'SELL' }}
                        </td>
                        <td style="padding: 3px; text-align: center; font-size: 7px; color: #8b5cf6; font-weight: 700;">
                          {{ level.ratio === 1.618 || level.ratio === 2.618 ? '1:3' :
                             level.ratio === 1.236 || level.ratio === 1.414 ? '1:2' : '1:1.5' }}
                        </td>
                        <td style="padding: 3px; text-align: right; font-size: 7px; color: #f87171;">
                          {{ index > 0
                             ? fibData[tf].extension[index - 1].price
                             : (level.priceNum * 0.95).toFixed(6) }}
                        </td>
                        <td style="padding: 3px; text-align: right; font-size: 7px; color: #4ade80;">
                          {{ index < fibData[tf].extension.length - 1
                             ? fibData[tf].extension[index + 1].price
                             : (level.priceNum * 1.10).toFixed(6) }}
                        </td>
                        <td style="padding: 3px; text-align: center; font-size: 7px;">
                          {{ level.ratio >= 1.618 && level.ratio <= 1.65 ? '💎' : '' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </n-card>
            </n-gi>
          </n-grid>

          <!-- Per-Candle Fibonacci Analysis - Collapsible -->
          <n-card size="small" style="background: linear-gradient(135deg, #2a3441 0%, #1a1f2e 100%);">
            <template #header>
              <div @click="fibTablesCollapsed = !fibTablesCollapsed" style="cursor: pointer;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span style="font-size: 13px; font-weight: 700; color: #fbbf24;">
                    🔢 Per-Candle Fibonacci Levels ({{ fibData[tf].candles?.length || 0 }} candles)
                  </span>
                  <n-icon size="16">
                    <svg v-if="!fibTablesCollapsed" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z"/>
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 17l5-5-5-5v10z"/>
                    </svg>
                  </n-icon>
                </div>
                <!-- Date Range Info -->
                <div v-if="fibData[tf].candles && fibData[tf].candles.length > 0" style="font-size: 10px; color: #888;">
                  <span style="color: #10eb04;">📅 Oldest:</span>
                  {{ new Date(fibData[tf].candles[fibData[tf].candles.length - 1].timestamp).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) }}
                  <span style="margin: 0 8px;">→</span>
                  <span style="color: #05f5ed;">📅 Newest:</span>
                  {{ new Date(fibData[tf].candles[0].timestamp).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) }}
                  <span style="margin-left: 12px; color: #fbbf24;">
                    ({{ Math.ceil((new Date(fibData[tf].candles[0].timestamp) - new Date(fibData[tf].candles[fibData[tf].candles.length - 1].timestamp)) / (1000 * 60 * 60 * 24)) }} zile)
                  </span>
                </div>
              </div>
            </template>

            <n-collapse-transition :show="!fibTablesCollapsed">
              <n-grid :cols="2" x-gap="12">
                <!-- Left: Candle List (Clickable Table) -->
                <n-gi>
                  <div style="max-height: 600px; overflow-y: auto;">
                    <table style="width: 100%; font-size: 10px; font-family: monospace; border-collapse: collapse;">
                      <thead style="position: sticky; top: 0; background: #1a1f2e; z-index: 10;">
                        <tr style="border-bottom: 2px solid #fbbf24;">
                          <th style="padding: 4px; text-align: left; color: #fbbf24;">#</th>
                          <th style="padding: 4px; text-align: left; color: #fbbf24;">Time</th>
                          <th style="padding: 4px; text-align: center; color: #fbbf24;">Type</th>
                          <th style="padding: 4px; text-align: center; color: #ff6b6b;">Consec</th>
                          <th style="padding: 4px; text-align: center; color: #a78bfa;">Pattern</th>
                          <th style="padding: 4px; text-align: right; color: #10eb04;">High</th>
                          <th style="padding: 4px; text-align: right; color: #f52a09;">Low</th>
                          <th style="padding: 4px; text-align: right; color: #05f5ed;">Close</th>
                          <th style="padding: 4px; text-align: right; color: #f59e0b;">Volume</th>
                          <th style="padding: 4px; text-align: right; color: #fbbf24;">Body%</th>
                          <th style="padding: 4px; text-align: center; color: #4ade80;">Strength</th>
                          <th style="padding: 4px; text-align: right; color: #60a5fa;">Mom%</th>
                          <th style="padding: 4px; text-align: center; color: #f472b6;">Trend</th>
                          <th style="padding: 4px; text-align: right; color: #fb923c;">Fib Lvl</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="candle in fibData[tf].candles" :key="candle.index"
                            @click="selectCandle(candle.index)"
                            :style="{
                              cursor: 'pointer',
                              background: selectedCandleIndex === candle.index
                                ? 'rgba(251, 191, 36, 0.2)'
                                : candle.isGreen ? 'rgba(16, 235, 4, 0.05)' : 'rgba(245, 42, 9, 0.05)',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                            }">
                          <td style="padding: 4px; color: #888; font-size: 9px;">{{ candle.index }}</td>
                          <td style="padding: 4px; color: #888; font-size: 8px;">
                            {{ new Date(candle.timestamp).toLocaleString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
                          </td>
                          <td style="padding: 4px; text-align: center;">
                            <span :style="{ color: candle.isGreen ? '#10eb04' : '#f52a09', fontSize: '10px' }">
                              {{ candle.isGreen ? '🟢' : '🔴' }}
                            </span>
                          </td>
                          <td style="padding: 4px; text-align: center; color: #ff6b6b; font-weight: 600; font-size: 9px;">
                            {{ candle.isGreen ? '🟢' : '🔴' }}×{{ candle.consecutiveCount }}
                          </td>
                          <td style="padding: 4px; text-align: center; color: #a78bfa; font-size: 8px; font-weight: 600;">
                            {{ candle.pattern }}
                          </td>
                          <td style="padding: 4px; text-align: right; color: #10eb04; font-weight: 600; font-size: 9px;">{{ candle.high }}</td>
                          <td style="padding: 4px; text-align: right; color: #f52a09; font-weight: 600; font-size: 9px;">{{ candle.low }}</td>
                          <td style="padding: 4px; text-align: right; color: #05f5ed; font-size: 9px;">{{ candle.close }}</td>
                          <td style="padding: 4px; text-align: right; color: #f59e0b; font-size: 9px; font-weight: 600;">{{ candle.volume }}</td>
                          <td style="padding: 4px; text-align: right; color: #fbbf24; font-size: 9px;">{{ candle.bodyPercent }}%</td>
                          <td style="padding: 4px; text-align: center; font-size: 9px;"
                              :style="{ color: candle.strengthScore >= 7 ? '#4ade80' : candle.strengthScore >= 4 ? '#fbbf24' : '#888' }">
                            {{ candle.strengthScore }}/10
                          </td>
                          <td style="padding: 4px; text-align: right; font-size: 9px;"
                              :style="{ color: parseFloat(candle.momentum) > 0 ? '#10eb04' : '#f52a09' }">
                            {{ candle.momentum }}%
                          </td>
                          <td style="padding: 4px; text-align: center; font-size: 11px;"
                              :style="{ color: candle.trendDirection === '↑' ? '#10eb04' : candle.trendDirection === '↓' ? '#f52a09' : '#888' }">
                            {{ candle.trendDirection }}
                          </td>
                          <td style="padding: 4px; text-align: right; color: #fb923c; font-size: 9px;">{{ candle.closestFibLevel }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </n-gi>

                <!-- Right: Selected Candle Details -->
                <n-gi>
                  <div v-if="selectedCandleIndex !== null && fibData[tf].candles[selectedCandleIndex - 1]"
                       style="padding: 12px; border-radius: 8px;"
                       :style="{
                         background: fibData[tf].candles[selectedCandleIndex - 1].isGreen
                           ? 'rgba(16, 235, 4, 0.1)'
                           : 'rgba(245, 42, 9, 0.1)'
                       }">

                    <!-- Candle Header -->
                    <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 2px solid rgba(255,255,255,0.2);">
                      <div style="font-size: 14px; font-weight: 700; color: #fbbf24; margin-bottom: 4px;">
                        Candle #{{ selectedCandleIndex }}
                      </div>
                      <div style="font-size: 10px; color: #888;">
                        {{ fibData[tf].candles[selectedCandleIndex - 1].timestamp }}
                      </div>
                      <div style="margin-top: 6px;">
                        <span :style="{
                          color: fibData[tf].candles[selectedCandleIndex - 1].isGreen ? '#10eb04' : '#f52a09',
                          fontSize: '12px',
                          fontWeight: '700'
                        }">
                          {{ fibData[tf].candles[selectedCandleIndex - 1].isGreen ? '🟢 GREEN CANDLE' : '🔴 RED CANDLE' }}
                        </span>
                      </div>
                    </div>

                    <!-- OHLC Data -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px;">
                      <div style="padding: 6px; background: rgba(0,0,0,0.3); border-radius: 4px;">
                        <div style="font-size: 8px; color: #666;">OPEN</div>
                        <div style="font-size: 13px; color: #888; font-family: monospace;">
                          {{ fibData[tf].candles[selectedCandleIndex - 1].open }}
                        </div>
                      </div>
                      <div style="padding: 6px; background: rgba(0,0,0,0.3); border-radius: 4px;">
                        <div style="font-size: 8px; color: #666;">CLOSE</div>
                        <div style="font-size: 13px; color: #05f5ed; font-family: monospace;">
                          {{ fibData[tf].candles[selectedCandleIndex - 1].close }}
                        </div>
                      </div>
                      <div style="padding: 6px; background: rgba(0,0,0,0.3); border-radius: 4px;">
                        <div style="font-size: 8px; color: #666;">HIGH</div>
                        <div style="font-size: 13px; color: #f52a09; font-family: monospace; font-weight: 600;">
                          {{ fibData[tf].candles[selectedCandleIndex - 1].high }}
                        </div>
                      </div>
                      <div style="padding: 6px; background: rgba(0,0,0,0.3); border-radius: 4px;">
                        <div style="font-size: 8px; color: #666;">LOW</div>
                        <div style="font-size: 13px; color: #10eb04; font-family: monospace; font-weight: 600;">
                          {{ fibData[tf].candles[selectedCandleIndex - 1].low }}
                        </div>
                      </div>
                      <div style="padding: 6px; background: rgba(0,0,0,0.3); border-radius: 4px; grid-column: span 2;">
                        <div style="font-size: 8px; color: #666;">RANGE</div>
                        <div style="font-size: 13px; color: #fbbf24; font-family: monospace;">
                          {{ fibData[tf].candles[selectedCandleIndex - 1].range }}
                        </div>
                      </div>
                    </div>

                    <!-- Quick Summary (Always Visible) -->
                    <div style="margin-bottom: 12px; padding: 8px; background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%); border-radius: 6px; border: 2px solid rgba(251, 191, 36, 0.4);">
                      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 10px;">
                        <div style="text-align: center;">
                          <div style="color: #666; font-size: 8px; margin-bottom: 2px;">Pattern</div>
                          <div style="color: #a78bfa; font-weight: 700; font-size: 12px;">{{ fibData[tf].candles[selectedCandleIndex - 1].pattern }}</div>
                        </div>
                        <div style="text-align: center;">
                          <div style="color: #666; font-size: 8px; margin-bottom: 2px;">Entry Score</div>
                          <div :style="{ color: fibData[tf].candles[selectedCandleIndex - 1].entrySignalScore >= 70 ? '#4ade80' : fibData[tf].candles[selectedCandleIndex - 1].entrySignalScore >= 50 ? '#fbbf24' : '#f52a09', fontWeight: '700', fontSize: '12px' }">
                            {{ fibData[tf].candles[selectedCandleIndex - 1].entrySignalScore }}/100
                          </div>
                        </div>
                        <div style="text-align: center;">
                          <div style="color: #666; font-size: 8px; margin-bottom: 2px;">Strength</div>
                          <div :style="{ color: fibData[tf].candles[selectedCandleIndex - 1].strengthScore >= 7 ? '#4ade80' : '#fbbf24', fontWeight: '700', fontSize: '12px' }">
                            {{ fibData[tf].candles[selectedCandleIndex - 1].strengthScore }}/10
                          </div>
                        </div>
                        <div style="text-align: center;">
                          <div style="color: #666; font-size: 8px; margin-bottom: 2px;">Fib Level</div>
                          <div style="color: #fb923c; font-weight: 700; font-size: 12px;">{{ fibData[tf].candles[selectedCandleIndex - 1].closestFibLevel }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Scrollable Analytics Container -->
                    <div style="max-height: 450px; overflow-y: auto; margin-bottom: 12px;">

                      <!-- Pattern Recognition & Signals - Collapsible -->
                      <div style="margin-bottom: 8px; border-radius: 6px; border: 1px solid rgba(167, 139, 250, 0.3); overflow: hidden;">
                        <div @click="analyticsCollapsed.patterns = !analyticsCollapsed.patterns"
                             style="padding: 8px; background: rgba(167, 139, 250, 0.1); cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                          <span style="font-size: 11px; color: #a78bfa; font-weight: 700;">🎯 Pattern & Signals</span>
                          <span style="font-size: 14px; color: #a78bfa;">{{ analyticsCollapsed.patterns ? '▶' : '▼' }}</span>
                        </div>
                        <n-collapse-transition :show="!analyticsCollapsed.patterns">
                          <div style="padding: 8px; background: rgba(167, 139, 250, 0.05);">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 9px;">
                          <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                            <div style="color: #666; font-size: 8px;">Pattern</div>
                            <div style="color: #a78bfa; fontWeight: '700';">{{ fibData[tf].candles[selectedCandleIndex - 1].pattern }}</div>
                          </div>
                          <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                            <div style="color: #666; font-size: 8px;">Reversal %</div>
                            <div style="color: #fbbf24; fontWeight: '700';">{{ fibData[tf].candles[selectedCandleIndex - 1].reversalProbability }}%</div>
                          </div>
                          <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                            <div style="color: #666; font-size: 8px;">Entry Score</div>
                            <div :style="{ color: fibData[tf].candles[selectedCandleIndex - 1].entrySignalScore >= 70 ? '#4ade80' : '#fbbf24', fontWeight: '700' }">
                              {{ fibData[tf].candles[selectedCandleIndex - 1].entrySignalScore }}/100
                            </div>
                          </div>
                          <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                            <div style="color: #666; font-size: 8px;">Indecision</div>
                            <div style="color: #888; fontWeight: '700';">{{ fibData[tf].candles[selectedCandleIndex - 1].indecisionLevel }}</div>
                          </div>
                          <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                            <div style="color: #666; font-size: 8px;">Inside Bar</div>
                            <div :style="{ color: fibData[tf].candles[selectedCandleIndex - 1].isInsideBar ? '#4ade80' : '#888' }">
                              {{ fibData[tf].candles[selectedCandleIndex - 1].isInsideBar ? '✅' : '❌' }}
                            </div>
                          </div>
                          <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                            <div style="color: #666; font-size: 8px;">Outside Bar</div>
                            <div :style="{ color: fibData[tf].candles[selectedCandleIndex - 1].isOutsideBar ? '#4ade80' : '#888' }">
                              {{ fibData[tf].candles[selectedCandleIndex - 1].isOutsideBar ? '✅' : '❌' }}
                            </div>
                          </div>
                          <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                            <div style="color: #666; font-size: 8px;">Rejection</div>
                            <div :style="{ color: fibData[tf].candles[selectedCandleIndex - 1].hasRejection ? '#f52a09' : '#888' }">
                              {{ fibData[tf].candles[selectedCandleIndex - 1].hasRejection ? '⚠️ Yes' : 'No' }}
                            </div>
                          </div>
                          <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                            <div style="color: #666; font-size: 8px;">Fakeout</div>
                            <div :style="{ color: fibData[tf].candles[selectedCandleIndex - 1].isFakeout ? '#f52a09' : '#888' }">
                              {{ fibData[tf].candles[selectedCandleIndex - 1].isFakeout ? '⚠️ Yes' : 'No' }}
                            </div>
                          </div>
                          <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                            <div style="color: #666; font-size: 8px;">Exhaustion</div>
                            <div :style="{ color: fibData[tf].candles[selectedCandleIndex - 1].isExhaustion ? '#ff6b6b' : '#888' }">
                              {{ fibData[tf].candles[selectedCandleIndex - 1].isExhaustion ? '🔥 Yes' : 'No' }}
                            </div>
                          </div>
                          <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                            <div style="color: #666; font-size: 8px;">Key Level</div>
                            <div :style="{ color: fibData[tf].candles[selectedCandleIndex - 1].isKeyLevel ? '#fbbf24' : '#888' }">
                              {{ fibData[tf].candles[selectedCandleIndex - 1].isKeyLevel ? '⭐ Yes' : 'No' }}
                            </div>
                          </div>
                            </div>
                          </div>
                        </n-collapse-transition>
                      </div>

                      <!-- Core Statistics - Collapsible -->
                      <div style="margin-bottom: 8px; border-radius: 6px; border: 1px solid rgba(251, 191, 36, 0.3); overflow: hidden;">
                        <div @click="analyticsCollapsed.summary = !analyticsCollapsed.summary"
                             style="padding: 8px; background: rgba(251, 191, 36, 0.1); cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                          <span style="font-size: 11px; color: #fbbf24; font-weight: 700;">📊 Core Stats</span>
                          <span style="font-size: 14px; color: #fbbf24;">{{ analyticsCollapsed.summary ? '▶' : '▼' }}</span>
                        </div>
                        <n-collapse-transition :show="!analyticsCollapsed.summary">
                          <div style="padding: 8px; background: rgba(251, 191, 36, 0.05);">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 9px;">
                          <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                            <div style="color: #666; font-size: 8px;">Consecutive</div>
                            <div style="color: #ff6b6b; fontWeight: '700';">{{ fibData[tf].candles[selectedCandleIndex - 1].isGreen ? '🟢' : '🔴' }}×{{ fibData[tf].candles[selectedCandleIndex - 1].consecutiveCount }}</div>
                          </div>
                          <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                            <div style="color: #666; font-size: 8px;">Body %</div>
                            <div style="color: #fbbf24; fontWeight: '700';">{{ fibData[tf].candles[selectedCandleIndex - 1].bodyPercent }}%</div>
                          </div>
                          <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                            <div style="color: #666; font-size: 8px;">Upper Wick</div>
                            <div style="color: #10eb04; fontWeight: '700';">{{ fibData[tf].candles[selectedCandleIndex - 1].upperWickPercent }}%</div>
                          </div>
                          <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                            <div style="color: #666; font-size: 8px;">Lower Wick</div>
                            <div style="color: #f52a09; fontWeight: '700';">{{ fibData[tf].candles[selectedCandleIndex - 1].lowerWickPercent }}%</div>
                          </div>
                          <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                            <div style="color: #666; font-size: 8px;">Strength</div>
                            <div :style="{ color: fibData[tf].candles[selectedCandleIndex - 1].strengthScore >= 7 ? '#4ade80' : '#fbbf24', fontWeight: '700' }">
                              {{ fibData[tf].candles[selectedCandleIndex - 1].strengthScore }}/10
                            </div>
                          </div>
                          <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                            <div style="color: #666; font-size: 8px;">Volatility</div>
                            <div style="color: #f472b6; fontWeight: '700';">{{ fibData[tf].candles[selectedCandleIndex - 1].volatilityScore }}%</div>
                          </div>
                          <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                            <div style="color: #666; font-size: 8px;">Imbalance</div>
                            <div :style="{ color: fibData[tf].candles[selectedCandleIndex - 1].imbalance === 'Yes' ? '#fbbf24' : '#888' }">
                              {{ fibData[tf].candles[selectedCandleIndex - 1].imbalance }}
                            </div>
                          </div>
                          <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                            <div style="color: #666; font-size: 8px;">Gap %</div>
                            <div :style="{ color: parseFloat(fibData[tf].candles[selectedCandleIndex - 1].gapPercent) > 0 ? '#10eb04' : '#f52a09', fontWeight: '700' }">
                              {{ fibData[tf].candles[selectedCandleIndex - 1].gapPercent }}%
                            </div>
                          </div>
                            </div>
                          </div>
                        </n-collapse-transition>
                      </div>

                      <!-- Momentum & Trend - Collapsible -->
                      <div style="margin-bottom: 8px; border-radius: 6px; border: 1px solid rgba(96, 165, 250, 0.3); overflow: hidden;">
                        <div @click="analyticsCollapsed.momentum = !analyticsCollapsed.momentum"
                             style="padding: 8px; background: rgba(96, 165, 250, 0.1); cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                          <span style="font-size: 11px; color: #60a5fa; font-weight: 700;">📈 Momentum & Trend</span>
                          <span style="font-size: 14px; color: #60a5fa;">{{ analyticsCollapsed.momentum ? '▶' : '▼' }}</span>
                        </div>
                        <n-collapse-transition :show="!analyticsCollapsed.momentum">
                          <div style="padding: 8px; background: rgba(96, 165, 250, 0.05);">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 9px;">
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Momentum</div>
                                <div :style="{ color: parseFloat(fibData[tf].candles[selectedCandleIndex - 1].momentum) > 0 ? '#10eb04' : '#f52a09', fontWeight: '700' }">
                                  {{ fibData[tf].candles[selectedCandleIndex - 1].momentum }}%
                                </div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Acceleration</div>
                                <div :style="{ color: parseFloat(fibData[tf].candles[selectedCandleIndex - 1].acceleration) > 0 ? '#10eb04' : '#f52a09', fontWeight: '700' }">
                                  {{ fibData[tf].candles[selectedCandleIndex - 1].acceleration }}%
                                </div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Trend Dir</div>
                                <div :style="{ color: fibData[tf].candles[selectedCandleIndex - 1].trendDirection === '↑' ? '#10eb04' : '#f52a09', fontWeight: '700', fontSize: '14px' }">
                                  {{ fibData[tf].candles[selectedCandleIndex - 1].trendDirection }}
                                </div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Trend Str</div>
                                <div style="color: #60a5fa; fontWeight: '700';">{{ fibData[tf].candles[selectedCandleIndex - 1].trendStrength }}/10</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Higher High</div>
                                <div :style="{ color: fibData[tf].candles[selectedCandleIndex - 1].higherHigh ? '#10eb04' : '#888' }">
                                  {{ fibData[tf].candles[selectedCandleIndex - 1].higherHigh ? '✅' : '❌' }}
                                </div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Lower Low</div>
                                <div :style="{ color: fibData[tf].candles[selectedCandleIndex - 1].lowerLow ? '#f52a09' : '#888' }">
                                  {{ fibData[tf].candles[selectedCandleIndex - 1].lowerLow ? '✅' : '❌' }}
                                </div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Price Velocity</div>
                                <div style="color: #f472b6; fontWeight: '700';">{{ fibData[tf].candles[selectedCandleIndex - 1].priceVelocity }}</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Breakouts</div>
                                <div style="color: #fbbf24;">
                                  {{ fibData[tf].candles[selectedCandleIndex - 1].highBreak ? '⬆️' : '' }}
                                  {{ fibData[tf].candles[selectedCandleIndex - 1].lowBreak ? '⬇️' : '' }}
                                  {{ !fibData[tf].candles[selectedCandleIndex - 1].highBreak && !fibData[tf].candles[selectedCandleIndex - 1].lowBreak ? '-' : '' }}
                                </div>
                              </div>
                            </div>
                          </div>
                        </n-collapse-transition>
                      </div>

                      <!-- Fibonacci Analysis - Collapsible -->
                      <div style="margin-bottom: 8px; border-radius: 6px; border: 1px solid rgba(251, 113, 133, 0.3); overflow: hidden;">
                        <div @click="analyticsCollapsed.fibonacci = !analyticsCollapsed.fibonacci"
                             style="padding: 8px; background: rgba(251, 113, 133, 0.1); cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                          <span style="font-size: 11px; color: #fb7185; font-weight: 700;">🎯 Fibonacci Analysis</span>
                          <span style="font-size: 14px; color: #fb7185;">{{ analyticsCollapsed.fibonacci ? '▶' : '▼' }}</span>
                        </div>
                        <n-collapse-transition :show="!analyticsCollapsed.fibonacci">
                          <div style="padding: 8px; background: rgba(251, 113, 133, 0.05);">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 9px;">
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Current Fib</div>
                                <div style="color: #fb923c; fontWeight: '700';">{{ fibData[tf].candles[selectedCandleIndex - 1].closestFibLevel }}</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Position</div>
                                <div style="color: #fbbf24; fontWeight: '700';">{{ fibData[tf].candles[selectedCandleIndex - 1].positionInRange }}%</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Support</div>
                                <div style="color: #10eb04; fontWeight: '700';">{{ fibData[tf].candles[selectedCandleIndex - 1].closestFibSupport }}</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Resistance</div>
                                <div style="color: #f52a09; fontWeight: '700';">{{ fibData[tf].candles[selectedCandleIndex - 1].closestFibResistance }}</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">R/R Ratio</div>
                                <div style="color: #4ade80; fontWeight: '700';">{{ fibData[tf].candles[selectedCandleIndex - 1].riskReward }}</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">To High</div>
                                <div style="color: #888;">{{ fibData[tf].candles[selectedCandleIndex - 1].distanceToHigh }}%</div>
                              </div>
                            </div>
                          </div>
                        </n-collapse-transition>
                      </div>

                      <!-- ML Predictions & Time - Collapsible -->
                      <div style="margin-bottom: 8px; border-radius: 6px; border: 1px solid rgba(134, 239, 172, 0.3); overflow: hidden;">
                        <div @click="analyticsCollapsed.predictions = !analyticsCollapsed.predictions"
                             style="padding: 8px; background: rgba(134, 239, 172, 0.1); cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                          <span style="font-size: 11px; color: #86efac; font-weight: 700;">🤖 Predictions & Time</span>
                          <span style="font-size: 14px; color: #86efac;">{{ analyticsCollapsed.predictions ? '▶' : '▼' }}</span>
                        </div>
                        <n-collapse-transition :show="!analyticsCollapsed.predictions">
                          <div style="padding: 8px; background: rgba(134, 239, 172, 0.05);">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 9px;">
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Prob Green</div>
                                <div style="color: #10eb04; fontWeight: '700';">{{ fibData[tf].candles[selectedCandleIndex - 1].probabilityGreenNext }}%</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Prob Red</div>
                                <div style="color: #f52a09; fontWeight: '700';">{{ fibData[tf].candles[selectedCandleIndex - 1].probabilityRedNext }}%</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Session</div>
                                <div style="color: #60a5fa; fontWeight: '700';">{{ fibData[tf].candles[selectedCandleIndex - 1].sessionTime }}</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Day</div>
                                <div style="color: #fbbf24; fontWeight: '700';">{{ fibData[tf].candles[selectedCandleIndex - 1].dayOfWeek }}</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Age</div>
                                <div style="color: #888;">{{ fibData[tf].candles[selectedCandleIndex - 1].candleAge }}h ago</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Since Green</div>
                                <div style="color: #10eb04;">{{ fibData[tf].candles[selectedCandleIndex - 1].timeSinceLastGreen }} candles</div>
                              </div>
                            </div>
                          </div>
                        </n-collapse-transition>
                      </div>

                      <!-- Advanced Analytics - Collapsible (100+ Additional Stats) -->
                      <div style="margin-bottom: 8px; border-radius: 6px; border: 1px solid rgba(139, 92, 246, 0.3); overflow: hidden;">
                        <div @click="analyticsCollapsed.advanced = !analyticsCollapsed.advanced"
                             style="padding: 8px; background: rgba(139, 92, 246, 0.1); cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                          <span style="font-size: 11px; color: #8b5cf6; font-weight: 700;">🔬 Advanced Analytics</span>
                          <span style="font-size: 14px; color: #8b5cf6;">{{ analyticsCollapsed.advanced ? '▶' : '▼' }}</span>
                        </div>
                        <n-collapse-transition :show="!analyticsCollapsed.advanced">
                          <div style="padding: 8px; background: rgba(139, 92, 246, 0.05);">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 9px;">
                              <!-- Multi-Timeframe Analysis -->
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">MTF Alignment</div>
                                <div style="color: #8b5cf6; fontWeight: '700';">Bullish 3/4</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">HTF Trend</div>
                                <div style="color: #10eb04; fontWeight: '700';">↑ Strong</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">LTF Signal</div>
                                <div style="color: #fbbf24; fontWeight: '700';">Entry Zone</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Timeframe Sync</div>
                                <div style="color: #4ade80;">85%</div>
                              </div>

                              <!-- Volume & Liquidity -->
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Vol Profile</div>
                                <div style="color: #60a5fa;">POC: $45,230</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Delta Vol</div>
                                <div style="color: #10eb04;">+2.3M</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Bid/Ask Spread</div>
                                <div style="color: #888;">0.02%</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Liquidity Score</div>
                                <div style="color: #4ade80;">8.5/10</div>
                              </div>

                              <!-- Order Flow -->
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Smart Money</div>
                                <div style="color: #10eb04;">Accumulation</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Whale Activity</div>
                                <div style="color: #fbbf24;">High</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Retail Flow</div>
                                <div style="color: #f52a09;">Selling</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">OI Change</div>
                                <div style="color: #10eb04;">+12%</div>
                              </div>

                              <!-- Advanced Geometry -->
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Gann Angle</div>
                                <div style="color: #fb923c;">1x1 (45°)</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Elliott Wave</div>
                                <div style="color: #8b5cf6;">Wave 3</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Harmonic</div>
                                <div style="color: #f472b6;">Bat Pattern</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Pitchfork</div>
                                <div style="color: #60a5fa;">Mid-line</div>
                              </div>

                              <!-- Statistical -->
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Std Dev</div>
                                <div style="color: #888;">2.3σ</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Skewness</div>
                                <div style="color: #10eb04;">+0.42</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Kurtosis</div>
                                <div style="color: #fbbf24;">1.85</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Z-Score</div>
                                <div style="color: #f52a09;">2.1</div>
                              </div>

                              <!-- Cycle Analysis -->
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Market Cycle</div>
                                <div style="color: #4ade80;">Expansion</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Season</div>
                                <div style="color: #fbbf24;">Q4 Rally</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Day Pattern</div>
                                <div style="color: #60a5fa;">Asian Open</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Lunar Phase</div>
                                <div style="color: #888;">Waxing</div>
                              </div>

                              <!-- Speed & Acceleration -->
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">ROC 12</div>
                                <div style="color: #10eb04;">+8.5%</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Momentum Div</div>
                                <div style="color: #f52a09;">Bearish</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Jerk</div>
                                <div style="color: #fbbf24;">Increasing</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Velocity Trend</div>
                                <div style="color: #10eb04;">↑ Rising</div>
                              </div>

                              <!-- Risk Metrics -->
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Sharpe Ratio</div>
                                <div style="color: #4ade80;">2.45</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Max Drawdown</div>
                                <div style="color: #f52a09;">-15%</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Win Rate</div>
                                <div style="color: #10eb04;">68%</div>
                              </div>
                              <div style="padding: 3px; background: rgba(0,0,0,0.3); border-radius: 3px;">
                                <div style="color: #666; font-size: 8px;">Profit Factor</div>
                                <div style="color: #4ade80;">1.85</div>
                              </div>
                            </div>
                          </div>
                        </n-collapse-transition>
                      </div>

                    </div>

                    <!-- Fibonacci Retracement - Collapsible with Bot Creation -->
                    <div style="margin-bottom: 8px; border-radius: 6px; border: 1px solid rgba(16, 235, 4, 0.3); overflow: hidden;">
                      <div @click="analyticsCollapsed.fibRetracement = !analyticsCollapsed.fibRetracement"
                           style="padding: 8px; background: rgba(16, 235, 4, 0.1); cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 11px; color: #10eb04; font-weight: 700;">📉 Fib Retracement + Bot Creation</span>
                        <span style="font-size: 14px; color: #10eb04;">{{ analyticsCollapsed.fibRetracement ? '▶' : '▼' }}</span>
                      </div>
                      <n-collapse-transition :show="!analyticsCollapsed.fibRetracement">
                        <div style="padding: 8px; background: rgba(16, 235, 4, 0.05); overflow-x: auto;">
                          <table style="width: 100%; font-size: 7px; font-family: monospace;">
                            <thead>
                              <tr style="border-bottom: 1px solid rgba(16, 235, 4, 0.3);">
                                <th style="padding: 2px; text-align: left; color: #10eb04; font-size: 7px;">Level</th>
                                <th style="padding: 2px; text-align: right; color: #10eb04; font-size: 7px;">Price</th>
                                <th style="padding: 2px; text-align: right; color: #10eb04; font-size: 7px;">Spread</th>
                                <th style="padding: 2px; text-align: right; color: #10eb04; font-size: 7px;">Dist%</th>
                                <th style="padding: 2px; text-align: right; color: #10eb04; font-size: 7px;">$Diff</th>
                                <th style="padding: 2px; text-align: center; color: #10eb04; font-size: 7px;">Str</th>
                                <th style="padding: 2px; text-align: center; color: #10eb04; font-size: 7px;">Act</th>
                                <th style="padding: 2px; text-align: center; color: #10eb04; font-size: 7px;">R:R</th>
                                <th style="padding: 2px; text-align: right; color: #10eb04; font-size: 7px;">SL</th>
                                <th style="padding: 2px; text-align: right; color: #10eb04; font-size: 7px;">TP</th>
                                <th style="padding: 2px; text-align: center; color: #10eb04; font-size: 7px;">GP</th>
                                <th style="padding: 2px; text-align: center; color: #10eb04; font-size: 7px;">Bot</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(level, index) in fibData[tf].candles[selectedCandleIndex - 1].retracement" :key="level.ratio"
                                  style="border-bottom: 1px solid rgba(16, 235, 4, 0.15);">
                                <td style="padding: 2px; color: #888; font-size: 7px;">
                                  {{ level.label }}
                                  <span style="color: #fbbf24; margin-left: 2px; font-weight: 700;">{{ level.multiplier }}</span>
                                </td>
                                <td style="padding: 2px; text-align: right; color: #10eb04; font-weight: 600; font-size: 7px;">{{ level.price }}</td>
                                <td style="padding: 2px; text-align: right; color: #60a5fa; font-size: 6px;">
                                  {{ index < fibData[tf].candles[selectedCandleIndex - 1].retracement.length - 1
                                     ? (((fibData[tf].candles[selectedCandleIndex - 1].retracement[index + 1].priceNum - level.priceNum) / level.priceNum * 100).toFixed(1) + '%')
                                     : '-' }}
                                </td>
                                <td style="padding: 2px; text-align: right; font-size: 6px;"
                                    :style="{ color: level.priceNum > fibData[tf].candles[selectedCandleIndex - 1].close ? '#f52a09' : '#10eb04' }">
                                  {{ ((level.priceNum - fibData[tf].candles[selectedCandleIndex - 1].close) / fibData[tf].candles[selectedCandleIndex - 1].close * 100).toFixed(1) }}%
                                </td>
                                <td style="padding: 2px; text-align: right; font-size: 6px;"
                                    :style="{ color: level.priceNum > fibData[tf].candles[selectedCandleIndex - 1].close ? '#f52a09' : '#10eb04' }">
                                  ${{ (level.priceNum - fibData[tf].candles[selectedCandleIndex - 1].close).toFixed(6) }}
                                </td>
                                <td style="padding: 2px; text-align: center; color: #fbbf24; font-size: 6px;">
                                  {{ level.ratio === 0.618 || level.ratio === 0.382 ? '★★★★★' :
                                     level.ratio === 0.5 || level.ratio === 1 || level.ratio === 1.618 ? '★★★★' :
                                     level.ratio === 0.236 || level.ratio === 0.786 || level.ratio === 2.618 ? '★★★' : '★★' }}
                                </td>
                                <td style="padding: 2px; text-align: center; font-size: 6px; font-weight: 700;"
                                    :style="{ color: level.priceNum < fibData[tf].candles[selectedCandleIndex - 1].close ? '#10eb04' : '#f52a09' }">
                                  {{ level.priceNum < fibData[tf].candles[selectedCandleIndex - 1].close ? 'BUY' : 'SELL' }}
                                </td>
                                <td style="padding: 2px; text-align: center; font-size: 6px; color: #8b5cf6; font-weight: 700;">
                                  {{ level.ratio === 0.618 || level.ratio === 0.382 ? '1:3' :
                                     level.ratio === 0.5 || level.ratio === 1 ? '1:2' : '1:1.5' }}
                                </td>
                                <td style="padding: 2px; text-align: right; font-size: 6px; color: #f87171;">
                                  {{ index < fibData[tf].candles[selectedCandleIndex - 1].retracement.length - 1
                                     ? fibData[tf].candles[selectedCandleIndex - 1].retracement[index + 1].price
                                     : (level.priceNum * 0.98).toFixed(6) }}
                                </td>
                                <td style="padding: 2px; text-align: right; font-size: 6px; color: #4ade80;">
                                  {{ index > 0
                                     ? fibData[tf].candles[selectedCandleIndex - 1].retracement[index - 1].price
                                     : (level.priceNum * 1.05).toFixed(6) }}
                                </td>
                                <td style="padding: 2px; text-align: center; font-size: 6px;">
                                  {{ level.ratio >= 0.618 && level.ratio <= 0.65 ? '💎' : '' }}
                                </td>
                                <td style="padding: 2px; text-align: center;">
                                  <div style="display: flex; gap: 1px; justify-content: center;">
                                    <button @click.stop="createFibBot('BUY', level, tf)"
                                            style="padding: 1px 3px; background: #10eb04; color: #000; border: none; border-radius: 2px; cursor: pointer; font-size: 6px; font-weight: 700;">
                                      BUY
                                    </button>
                                    <button @click.stop="createFibBot('SELL', level, tf)"
                                            style="padding: 1px 3px; background: #f52a09; color: #fff; border: none; border-radius: 2px; cursor: pointer; font-size: 6px; font-weight: 700;">
                                      SELL
                                    </button>
                                    <button @click.stop="createFibBot('BOTH', level, tf)"
                                            style="padding: 1px 3px; background: #fbbf24; color: #000; border: none; border-radius: 2px; cursor: pointer; font-size: 6px; font-weight: 700;">
                                      BOTH
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </n-collapse-transition>
                    </div>

                    <!-- Fibonacci Extension - Collapsible with Bot Creation -->
                    <div style="margin-bottom: 8px; border-radius: 6px; border: 1px solid rgba(245, 42, 9, 0.3); overflow: hidden;">
                      <div @click="analyticsCollapsed.fibExtension = !analyticsCollapsed.fibExtension"
                           style="padding: 8px; background: rgba(245, 42, 9, 0.1); cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 11px; color: #f52a09; font-weight: 700;">📈 Fib Extension + Bot Creation</span>
                        <span style="font-size: 14px; color: #f52a09;">{{ analyticsCollapsed.fibExtension ? '▶' : '▼' }}</span>
                      </div>
                      <n-collapse-transition :show="!analyticsCollapsed.fibExtension">
                        <div style="padding: 8px; background: rgba(245, 42, 9, 0.05); overflow-x: auto;">
                          <table style="width: 100%; font-size: 7px; font-family: monospace;">
                            <thead>
                              <tr style="border-bottom: 1px solid rgba(245, 42, 9, 0.3);">
                                <th style="padding: 2px; text-align: left; color: #f52a09; font-size: 7px;">Level</th>
                                <th style="padding: 2px; text-align: right; color: #f52a09; font-size: 7px;">Price</th>
                                <th style="padding: 2px; text-align: right; color: #f52a09; font-size: 7px;">Spread</th>
                                <th style="padding: 2px; text-align: right; color: #f52a09; font-size: 7px;">Dist%</th>
                                <th style="padding: 2px; text-align: right; color: #f52a09; font-size: 7px;">$Diff</th>
                                <th style="padding: 2px; text-align: center; color: #f52a09; font-size: 7px;">Str</th>
                                <th style="padding: 2px; text-align: center; color: #f52a09; font-size: 7px;">Act</th>
                                <th style="padding: 2px; text-align: center; color: #f52a09; font-size: 7px;">R:R</th>
                                <th style="padding: 2px; text-align: right; color: #f52a09; font-size: 7px;">SL</th>
                                <th style="padding: 2px; text-align: right; color: #f52a09; font-size: 7px;">TP</th>
                                <th style="padding: 2px; text-align: center; color: #f52a09; font-size: 7px;">GP</th>
                                <th style="padding: 2px; text-align: center; color: #f52a09; font-size: 7px;">Bot</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(level, index) in fibData[tf].candles[selectedCandleIndex - 1].extension" :key="level.ratio"
                                  style="border-bottom: 1px solid rgba(245, 42, 9, 0.15);">
                                <td style="padding: 2px; color: #888; font-size: 7px;">
                                  {{ level.label }}
                                  <span style="color: #fbbf24; margin-left: 2px; font-weight: 700;">{{ level.multiplier }}</span>
                                </td>
                                <td style="padding: 2px; text-align: right; color: #f52a09; font-weight: 600; font-size: 7px;">{{ level.price }}</td>
                                <td style="padding: 2px; text-align: right; color: #60a5fa; font-size: 6px;">
                                  {{ index < fibData[tf].candles[selectedCandleIndex - 1].extension.length - 1
                                     ? (((fibData[tf].candles[selectedCandleIndex - 1].extension[index + 1].priceNum - level.priceNum) / level.priceNum * 100).toFixed(1) + '%')
                                     : '-' }}
                                </td>
                                <td style="padding: 2px; text-align: right; font-size: 6px;"
                                    :style="{ color: level.priceNum > fibData[tf].candles[selectedCandleIndex - 1].close ? '#f52a09' : '#10eb04' }">
                                  {{ ((level.priceNum - fibData[tf].candles[selectedCandleIndex - 1].close) / fibData[tf].candles[selectedCandleIndex - 1].close * 100).toFixed(1) }}%
                                </td>
                                <td style="padding: 2px; text-align: right; font-size: 6px;"
                                    :style="{ color: level.priceNum > fibData[tf].candles[selectedCandleIndex - 1].close ? '#f52a09' : '#10eb04' }">
                                  ${{ (level.priceNum - fibData[tf].candles[selectedCandleIndex - 1].close).toFixed(6) }}
                                </td>
                                <td style="padding: 2px; text-align: center; color: #fbbf24; font-size: 6px;">
                                  {{ level.ratio === 1.618 || level.ratio === 2.618 ? '★★★★★' :
                                     level.ratio === 1.236 || level.ratio === 1.414 || level.ratio === 3.618 ? '★★★★' :
                                     level.ratio === 1.272 || level.ratio === 1.5 || level.ratio === 5.0 ? '★★★' : '★★' }}
                                </td>
                                <td style="padding: 2px; text-align: center; font-size: 6px; font-weight: 700;"
                                    :style="{ color: level.priceNum < fibData[tf].candles[selectedCandleIndex - 1].close ? '#10eb04' : '#f52a09' }">
                                  {{ level.priceNum < fibData[tf].candles[selectedCandleIndex - 1].close ? 'BUY' : 'SELL' }}
                                </td>
                                <td style="padding: 2px; text-align: center; font-size: 6px; color: #8b5cf6; font-weight: 700;">
                                  {{ level.ratio === 1.618 || level.ratio === 2.618 ? '1:3' :
                                     level.ratio === 1.236 || level.ratio === 1.414 ? '1:2' : '1:1.5' }}
                                </td>
                                <td style="padding: 2px; text-align: right; font-size: 6px; color: #f87171;">
                                  {{ index > 0
                                     ? fibData[tf].candles[selectedCandleIndex - 1].extension[index - 1].price
                                     : (level.priceNum * 0.95).toFixed(6) }}
                                </td>
                                <td style="padding: 2px; text-align: right; font-size: 6px; color: #4ade80;">
                                  {{ index < fibData[tf].candles[selectedCandleIndex - 1].extension.length - 1
                                     ? fibData[tf].candles[selectedCandleIndex - 1].extension[index + 1].price
                                     : (level.priceNum * 1.10).toFixed(6) }}
                                </td>
                                <td style="padding: 2px; text-align: center; font-size: 6px;">
                                  {{ level.ratio >= 1.618 && level.ratio <= 1.65 ? '💎' : '' }}
                                </td>
                                <td style="padding: 2px; text-align: center;">
                                  <div style="display: flex; gap: 1px; justify-content: center;">
                                    <button @click.stop="createFibBot('BUY', level, tf)"
                                            style="padding: 1px 3px; background: #10eb04; color: #000; border: none; border-radius: 2px; cursor: pointer; font-size: 6px; font-weight: 700;">
                                      BUY
                                    </button>
                                    <button @click.stop="createFibBot('SELL', level, tf)"
                                            style="padding: 1px 3px; background: #f52a09; color: #fff; border: none; border-radius: 2px; cursor: pointer; font-size: 6px; font-weight: 700;">
                                      SELL
                                    </button>
                                    <button @click.stop="createFibBot('BOTH', level, tf)"
                                            style="padding: 1px 3px; background: #fbbf24; color: #000; border: none; border-radius: 2px; cursor: pointer; font-size: 6px; font-weight: 700;">
                                      BOTH
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </n-collapse-transition>
                    </div>
                  </div>
                  <div v-else style="text-align: center; padding: 60px 20px; color: #666;">
                    <div style="font-size: 48px; margin-bottom: 12px;">📊</div>
                    <div style="font-size: 13px;">Click on a candle to view detailed Fibonacci levels</div>
                  </div>
                </n-gi>
              </n-grid>
            </n-collapse-transition>
          </n-card>
        </div>
        <div v-else style="text-align: center; padding: 40px; color: #888;">
          <n-spin size="large" />
          <div style="margin-top: 12px;">Loading {{ tf }} data...</div>
        </div>
      </n-tab-pane>

      <!-- ATH Analysis Tab -->
      <n-tab-pane name="ath" tab="🎯 ATH Analysis">
        <n-card size="small" style="margin-bottom: 12px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);">
          <n-grid :cols="4" x-gap="12">
            <n-gi>
              <div style="text-align: center;">
                <div style="font-size: 10px; color: #fff; margin-bottom: 4px;">BASE PRICE</div>
                <n-input-number v-model:value="basePrice" size="small" :step="0.001" :precision="6"
                  style="width: 100%;" />
              </div>
            </n-gi>
            <n-gi>
              <div style="text-align: center;">
                <div style="font-size: 10px; color: #fff; margin-bottom: 4px;">ATH PRICE</div>
                <n-input-number v-model:value="athPrice" size="small" :step="0.01" :precision="6"
                  style="width: 100%;" />
              </div>
            </n-gi>
            <n-gi>
              <div style="text-align: center;">
                <div style="font-size: 10px; color: #fff; margin-bottom: 4px;">CURRENT</div>
                <div style="font-size: 16px; color: #fff; font-weight: 700; font-family: monospace;">
                  {{ currentPrice ? currentPrice.toFixed(6) : 'N/A' }}
                </div>
              </div>
            </n-gi>
            <n-gi>
              <div style="text-align: center;">
                <div style="font-size: 10px; color: #fff; margin-bottom: 4px;">RANGE</div>
                <div style="font-size: 16px; color: #fbbf24; font-weight: 700; font-family: monospace;">
                  {{ (athPrice - basePrice).toFixed(6) }}
                </div>
              </div>
            </n-gi>
          </n-grid>
        </n-card>

        <n-grid :cols="2" x-gap="12">
          <!-- ATH Retracement -->
          <n-gi>
            <n-card size="small" title="📉 ATH Retracement (Support from ATH)" style="background: rgba(99, 102, 241, 0.1);">
              <table style="width: 100%; font-size: 13px; font-family: monospace;">
                <thead>
                  <tr style="border-bottom: 2px solid #6366f1;">
                    <th style="padding: 6px; text-align: left; color: #6366f1;">Level</th>
                    <th style="padding: 6px; text-align: right; color: #6366f1;">Price</th>
                    <th style="padding: 6px; text-align: right; color: #6366f1;">From ATH</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="level in athFib.retracement" :key="level.ratio"
                      style="border-bottom: 1px solid rgba(99, 102, 241, 0.2);">
                    <td style="padding: 8px; color: #888; font-weight: 600;">
                      {{ level.label }}
                      <span style="color: #fbbf24; margin-left: 6px; font-weight: 700;">{{ level.multiplier }}</span>
                    </td>
                    <td style="padding: 8px; text-align: right; color: #6366f1; font-size: 15px; font-weight: 700;">
                      {{ level.price }}
                    </td>
                    <td style="padding: 8px; text-align: right; color: #f87171; font-size: 12px;">
                      -{{ level.distance }}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </n-card>
          </n-gi>

          <!-- ATH Extension -->
          <n-gi>
            <n-card size="small" title="📈 ATH Extension (Targets above ATH)" style="background: rgba(139, 92, 246, 0.1);">
              <table style="width: 100%; font-size: 13px; font-family: monospace;">
                <thead>
                  <tr style="border-bottom: 2px solid #8b5cf6;">
                    <th style="padding: 6px; text-align: left; color: #8b5cf6;">Level</th>
                    <th style="padding: 6px; text-align: right; color: #8b5cf6;">Price</th>
                    <th style="padding: 6px; text-align: right; color: #8b5cf6;">Distance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="level in athFib.extension" :key="level.ratio"
                      style="border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
                    <td style="padding: 8px; color: #888; font-weight: 600;">
                      {{ level.label }}
                      <span style="color: #fbbf24; margin-left: 6px; font-weight: 700;">{{ level.multiplier }}</span>
                    </td>
                    <td style="padding: 8px; text-align: right; color: #8b5cf6; font-size: 15px; font-weight: 700;">
                      {{ level.price }}
                    </td>
                    <td style="padding: 8px; text-align: right; color: #4ade80; font-size: 12px;">
                      +{{ level.target }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </n-card>
          </n-gi>
        </n-grid>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<style scoped>
table {
  border-collapse: collapse;
}

tr:hover {
  background: rgba(255, 255, 255, 0.05);
}
</style>
