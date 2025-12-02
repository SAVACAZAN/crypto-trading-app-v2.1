<template>
  <div class="fibonacci-page">
    <!-- Header (același ca înainte) -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">📊 LCX Fibonacci Levels & BTC Conversion</h1>
          <p class="page-subtitle">Technical analysis with Fibonacci retracement and BTC/LCX conversion calculator</p>
        </div>
        <div class="header-actions">
          <div class="current-price-display">
            <span class="price-label">🔴 LIVE LCX PRICE</span>
            <span class="price-value">${{ currentPrice }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <n-tabs type="segment" animated class="main-tabs">
      <n-tab-pane name="fibonacci" tab="📈 Fibonacci Levels">
        <!-- Conținutul existent pentru Fibonacci Levels -->
        <div class="tab-content">
          <!-- ... conținutul existent pentru Fibonacci ... -->
        </div>
      </n-tab-pane>

      <n-tab-pane name="btc-conversion" tab="₿ BTC vs LCX">
        <div class="tab-content">
          <div class="btc-tabs-grid">
            <!-- Left Table: LCX to BTC Conversion -->
            <n-card class="btc-table-card" title="💰 LCX → BTC Value">
              <!-- ... conținutul existent ... -->
            </n-card>

            <!-- Right Table: LCX Price Scenarios in BTC -->
            <n-card class="btc-table-card" title="₿ LCX Price Scenarios">
              <!-- ... conținutul existent ... -->
            </n-card>
          </div>

          <!-- NEW: Fibonacci Analyzer Section -->
          <div class="fib-analyzer-section">
            <n-card class="fib-analyzer-card" title="📊 BTC ↔ LCX Fibonacci Analyzer">
              <template #header-extra>
                <div class="analyzer-info">
                  <span class="live-indicator">🔴 LIVE</span>
                  <span class="current-btc-price">BTC: ${{ parseFloat(btcPrice).toLocaleString('en-US') }}</span>
                </div>
              </template>

              <div class="analyzer-header">
                <div class="price-info-grid">
                  <div class="price-info-item">
                    <span class="info-label">LCX Price (USD):</span>
                    <span class="info-value">${{ currentPrice }}</span>
                  </div>
                  <div class="price-info-item">
                    <span class="info-label">BTC Price (USD):</span>
                    <span class="info-value">${{ parseFloat(btcPrice).toLocaleString('en-US') }}</span>
                  </div>
                  <div class="price-info-item">
                    <span class="info-label">1 LCX in BTC:</span>
                    <span class="info-value">₿ {{ (1 / lcxPerBtc).toFixed(10) }}</span>
                  </div>
                  <div class="price-info-item">
                    <span class="info-label">1 BTC in LCX:</span>
                    <span class="info-value">{{ lcxPerBtc.toLocaleString('en-US', {maximumFractionDigits: 0}) }} LCX</span>
                  </div>
                </div>
              </div>

              <!-- Fibonacci Levels Table -->
              <div class="fib-table-container">
                <table class="fib-table">
                  <thead>
                    <tr>
                      <th>Level</th>
                      <th>1 LCX in BTC</th>
                      <th>1 LCX in USD</th>
                      <th>LCX for 1 BTC</th>
                      <th>Multiplier</th>
                      <th>Zone</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="level in enrichedBtcLevels" 
                      :key="level.index"
                      :class="{
                        'current-level': level.isCurrent,
                        'buy-zone': level.zone === 'buy',
                        'sell-zone': level.zone === 'sell',
                        'target-zone': level.zone === 'target'
                      }"
                    >
                      <td class="level-col">{{ level.index }}</td>
                      <td class="btc-price-col">₿ {{ level.btcPrice.toFixed(10) }}</td>
                      <td class="usd-price-col">${{ level.usdPrice.toFixed(6) }}</td>
                      <td class="lcx-amount-col">{{ level.lcxForOneBtc.toLocaleString('en-US') }} LCX</td>
                      <td class="multiplier-col">{{ level.multiplier }}x</td>
                      <td class="zone-col">
                        <span :class="['zone-badge', level.zone]">
                          {{ level.zoneLabel }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Fibonacci Classic Levels -->
              <div class="classic-fib-section">
                <h3>🌟 Classic Fibonacci Levels (USD)</h3>
                <div class="fib-levels-grid">
                  <div 
                    v-for="level in classicFibLevels" 
                    :key="level.ratio"
                    class="fib-level-item"
                    :class="{
                      'current-fib': isCurrentFibLevel(level.price),
                      [level.zone]: true
                    }"
                  >
                    <div class="fib-level-header">
                      <span class="fib-ratio">{{ level.ratioLabel }}</span>
                      <span class="fib-price">${{ level.price.toFixed(4) }}</span>
                    </div>
                    <div class="fib-level-info">
                      <span class="fib-multiplier">{{ level.multiplier }}x</span>
                      <span class="fib-zone">{{ level.zoneLabel }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </n-card>
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAppStore } from '~/stores/app.store';

definePageMeta({
  middleware: 'auth'
});

const appStore = useAppStore();

// Price constants
const athLow = 0.01;
const athHigh = 0.7654;
const targetLow = 0.01;
let targetPrice = ref(1.5);

// BTC price (live from ticker-bar store)
const btcPrice = computed(() => {
  const storePrice = appStore.getBtcPrice;
  return storePrice ? storePrice.toFixed(2) : "94000";
});

// Current price from store
const currentPrice = computed(() => {
  const storePrice = appStore.getCurrentPrice;
  return storePrice ? storePrice.toFixed(4) : "0.1120";
});

// Calculate how many LCX equals 1 BTC at current prices
const lcxPerBtc = computed(() => {
  const lcxPriceUsd = parseFloat(currentPrice.value);
  const btcPriceUsd = parseFloat(btcPrice.value);
  return btcPriceUsd / lcxPriceUsd;
});

// LCX amounts for tables
const lcxAmounts = [
  1100000, 1000000, 900000, 800000, 700000, 600000, 500000,
  400000, 300000, 250000, 200000, 150000, 100000,
  90000, 80000, 70000, 60000, 50000
];

// Table 1: LCX to BTC conversion
const lcxToBtcRows = computed(() => {
  const lcxPriceUsd = parseFloat(currentPrice.value);
  const btcPriceUsd = parseFloat(btcPrice.value);
  const lcxPriceInBtc = lcxPriceUsd / btcPriceUsd;

  return lcxAmounts.map(lcxAmount => {
    const usdValue = lcxAmount * lcxPriceUsd;
    const btcValue = usdValue / btcPriceUsd;
    const percentage = (btcValue * 100);

    return {
      lcx: lcxAmount,
      lcxPriceInBtc: lcxPriceInBtc,
      usd: usdValue,
      btc: btcValue,
      percent: percentage,
      highlight: lcxAmount === 1000000 || lcxAmount === 500000 || lcxAmount === 100000
    };
  });
});

// Table 2: LCX Price Scenarios in BTC
const btcPriceScenarios = computed(() => {
  const btcPriceUsd = parseFloat(btcPrice.value);
  const currentLcxPriceInBtc = parseFloat(currentPrice.value) / btcPriceUsd;

  const scenarios = [
    { btcPrice: 0.00000001, label: '0.00000001' },
    { btcPrice: 0.0000001, label: '0.0000001' },
    { btcPrice: 0.000001, label: '0.000001' },
    { btcPrice: 0.00001, label: '0.00001' },
    { btcPrice: 0.0001, label: '0.0001' },
    { btcPrice: 0.001, label: '0.001' },
    { btcPrice: 0.01, label: '0.01' },
    { btcPrice: 0.1, label: '0.1' },
  ];

  return scenarios.map(scenario => {
    const lcxPriceInUsd = scenario.btcPrice * btcPriceUsd;
    const multiplier = (scenario.btcPrice / currentLcxPriceInBtc).toFixed(2);
    const isCurrent = Math.abs(scenario.btcPrice - currentLcxPriceInBtc) < 0.0000001;

    return {
      scenario: `₿ ${scenario.label}`,
      lcxPriceInBtc: scenario.btcPrice,
      lcxPriceInUsd: lcxPriceInUsd,
      multiplier: multiplier + 'x',
      isCurrent: isCurrent
    };
  });
});

// NEW: Fibonacci Analyzer Computed Properties
const enrichedBtcLevels = computed(() => {
  const start = 0.00000001;
  const end = 0.0001;
  const steps = 50;
  
  // Exponential progression
  const factor = Math.pow(end / start, 1 / (steps - 1));
  
  const currentLcxInBtc = parseFloat(currentPrice.value) / parseFloat(btcPrice.value);
  
  const levels = Array.from({ length: steps }, (_, i) => {
    const btcPriceForLcx = start * Math.pow(factor, i);
    const usdPrice = btcPriceForLcx * parseFloat(btcPrice.value);
    const lcxForOneBtc = 1 / btcPriceForLcx;
    const multiplier = (btcPriceForLcx / currentLcxInBtc).toFixed(2);
    
    // Determine zone based on multiplier
    let zone, zoneLabel;
    if (multiplier >= 10) {
      zone = 'buy';
      zoneLabel = '🟢 STRONG BUY';
    } else if (multiplier >= 3) {
      zone = 'buy';
      zoneLabel = '🟢 BUY ZONE';
    } else if (multiplier >= 1) {
      zone = 'neutral';
      zoneLabel = '🟡 NEUTRAL';
    } else if (multiplier >= 0.5) {
      zone = 'sell';
      zoneLabel = '🔴 SELL ZONE';
    } else {
      zone = 'sell';
      zoneLabel = '🔴 STRONG SELL';
    }
    
    const isCurrent = Math.abs(btcPriceForLcx - currentLcxInBtc) < 0.000000001;
    
    return {
      index: i + 1,
      btcPrice: btcPriceForLcx,
      usdPrice: usdPrice,
      lcxForOneBtc: lcxForOneBtc,
      multiplier: multiplier,
      zone: zone,
      zoneLabel: zoneLabel,
      isCurrent: isCurrent
    };
  });
  
  return levels;
});

// Classic Fibonacci Levels
const classicFibLevels = computed(() => {
  const basePrice = parseFloat(currentPrice.value);
  const fibRatios = [
    { ratio: 0.236, ratioLabel: '23.6%', zone: 'buy' },
    { ratio: 0.382, ratioLabel: '38.2%', zone: 'buy' },
    { ratio: 0.5, ratioLabel: '50.0%', zone: 'neutral' },
    { ratio: 0.618, ratioLabel: '61.8%', zone: 'golden' },
    { ratio: 0.786, ratioLabel: '78.6%', zone: 'sell' },
    { ratio: 1, ratioLabel: '100%', zone: 'target' },
    { ratio: 1.618, ratioLabel: '161.8%', zone: 'target' },
    { ratio: 2.618, ratioLabel: '261.8%', zone: 'target' },
  ];
  
  return fibRatios.map(fib => {
    const price = basePrice * fib.ratio;
    const multiplier = fib.ratio.toFixed(3);
    
    let zoneLabel;
    switch(fib.zone) {
      case 'buy': zoneLabel = '🟢 BUY'; break;
      case 'neutral': zoneLabel = '🟡 NEUTRAL'; break;
      case 'golden': zoneLabel = '🌟 GOLDEN'; break;
      case 'sell': zoneLabel = '🔴 SELL'; break;
      case 'target': zoneLabel = '🎯 TARGET'; break;
      default: zoneLabel = '⚪️ NEUTRAL';
    }
    
    return {
      ...fib,
      price: price,
      multiplier: multiplier,
      zoneLabel: zoneLabel
    };
  });
});

// Check if current price is near Fibonacci level
function isCurrentFibLevel(levelPrice) {
  const current = parseFloat(currentPrice.value);
  const tolerance = 0.02;
  const diff = Math.abs(current - levelPrice);
  const percentDiff = (diff / levelPrice) * 100;
  return percentDiff <= tolerance;
}

// Restul funcțiilor existente...
const fibRatios = [
  { ratio: 0, label: '0.0%', zone: 'extreme-buy' },
  { ratio: 14.6, label: '14.6%', zone: 'strong-buy' },
  { ratio: 23.6, label: '23.6%', zone: 'buy' },
  { ratio: 38.2, label: '38.2%', zone: 'buy' },
  { ratio: 50.0, label: '50.0%', zone: 'neutral' },
  { ratio: 61.8, label: '61.8% 🌟', zone: 'golden' },
  { ratio: 70.7, label: '70.7%', zone: 'sell' },
  { ratio: 78.6, label: '78.6%', zone: 'sell' },
  { ratio: 88.6, label: '88.6%', zone: 'strong-sell' },
  { ratio: 100, label: '100.0%', zone: 'target' },
];

const extendedRatios = [
  { ratio: 127.2, label: 'Fib Extension 1.272' },
  { ratio: 161.8, label: 'Fib Extension 1.618 🌟' },
  { ratio: 200.0, label: 'Fib Extension 2.0' },
  { ratio: 261.8, label: 'Fib Extension 2.618' },
];

const fibLevelsATH = computed(() => {
  const range = athHigh - athLow;
  return fibRatios.map(fib => {
    const price = athLow + (range * fib.ratio / 100);
    return {
      ...fib,
      price,
      zoneLabel: getZoneLabel(fib.zone)
    };
  });
});

const fibLevelsTarget = computed(() => {
  const range = targetPrice.value - targetLow;
  return fibRatios.map(fib => {
    const price = targetLow + (range * fib.ratio / 100);
    return {
      ...fib,
      price,
      zoneLabel: getZoneLabel(fib.zone)
    };
  });
});

const extendedLevels = computed(() => {
  const rangeATH = athHigh - athLow;
  const rangeTarget = targetPrice.value - targetLow;

  return extendedRatios.map(ext => ({
    ...ext,
    priceATH: athLow + (rangeATH * ext.ratio / 100),
    priceTarget: targetLow + (rangeTarget * ext.ratio / 100)
  }));
});

const currentPositionATH = computed(() => {
  const current = parseFloat(currentPrice.value);
  const range = athHigh - athLow;
  return ((current - athLow) / range) * 100;
});

const currentPositionTarget = computed(() => {
  const current = parseFloat(currentPrice.value);
  const range = targetPrice.value - targetLow;
  return ((current - targetLow) / range) * 100;
});

function isCurrentLevel(levelPrice) {
  const current = parseFloat(currentPrice.value);
  const tolerance = 0.02;
  const diff = Math.abs(current - levelPrice);
  const percentDiff = (diff / levelPrice) * 100;
  return percentDiff <= tolerance;
}

function getZoneLabel(zone) {
  const labels = {
    'extreme-buy': '🟢 EXTREME BUY',
    'strong-buy': '🟢 STRONG BUY',
    'buy': '🟢 BUY ZONE',
    'neutral': '🟡 NEUTRAL',
    'golden': '🌟 GOLDEN POCKET',
    'sell': '🔴 SELL ZONE',
    'strong-sell': '🔴 STRONG SELL',
    'target': '🎯 TARGET'
  };
  return labels[zone] || '';
}
</script>

<style scoped>
/* Stilurile existente rămân aceleași, adaug doar noile stiluri pentru Fibonacci Analyzer */

.fib-analyzer-section {
  margin-top: 24px;
}

.fib-analyzer-card {
  background: rgba(13, 1, 77, 0.6);
  border: 1px solid rgba(255, 204, 0, 0.3);
}

.analyzer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.current-btc-price {
  font-size: 12px;
  color: #ffcc00;
  font-weight: 700;
  background: rgba(255, 204, 0, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.analyzer-header {
  margin-bottom: 20px;
}

.price-info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  background: rgba(0, 0, 0, 0.3);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.price-info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.price-info-item .info-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  text-transform: uppercase;
}

.price-info-item .info-value {
  font-size: 12px;
  color: #ffcc00;
  font-weight: 800;
  font-family: 'Courier New', monospace;
}

.fib-table-container {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 24px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.fib-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Courier New', monospace;
  background: rgba(0, 0, 0, 0.3);
}

.fib-table thead {
  position: sticky;
  top: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.fib-table th {
  padding: 12px 8px;
  text-align: left;
  font-size: 11px;
  font-weight: 800;
  color: #ffcc00;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid rgba(255, 204, 0, 0.4);
}

.fib-table tbody tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.fib-table tbody tr:hover {
  background: rgba(255, 204, 0, 0.1);
}

.fib-table tbody tr.current-level {
  background: rgba(255, 204, 0, 0.2);
  border-left: 3px solid #ffcc00;
  border-right: 3px solid #ffcc00;
}

.fib-table tbody tr.buy-zone {
  background: linear-gradient(90deg, rgba(16, 235, 4, 0.05), transparent);
}

.fib-table tbody tr.sell-zone {
  background: linear-gradient(90deg, rgba(255, 77, 77, 0.05), transparent);
}

.fib-table tbody tr.target-zone {
  background: linear-gradient(90deg, rgba(5, 245, 237, 0.05), transparent);
}

.fib-table td {
  padding: 10px 8px;
  font-size: 11px;
}

.level-col {
  color: #ffcc00;
  font-weight: 800;
  font-size: 12px;
}

.btc-price-col {
  color: #f7931a;
  font-weight: 800;
  font-size: 11px;
}

.usd-price-col {
  color: #05f5ed;
  font-weight: 700;
}

.lcx-amount-col {
  color: #10eb04;
  font-weight: 800;
  font-size: 11px;
}

.multiplier-col {
  color: #00ff88;
  font-weight: 800;
  font-size: 12px;
}

.zone-col {
  text-align: center;
}

.zone-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.zone-badge.buy {
  background: rgba(16, 235, 4, 0.15);
  color: #10eb04;
  border: 1px solid rgba(16, 235, 4, 0.3);
}

.zone-badge.sell {
  background: rgba(255, 77, 77, 0.15);
  color: #ff4d4d;
  border: 1px solid rgba(255, 77, 77, 0.3);
}

.zone-badge.neutral {
  background: rgba(255, 204, 0, 0.15);
  color: #ffcc00;
  border: 1px solid rgba(255, 204, 0, 0.3);
}

.classic-fib-section {
  margin-top: 24px;
}

.classic-fib-section h3 {
  color: #ffcc00;
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 16px;
  text-align: center;
}

.fib-levels-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.fib-level-item {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 12px;
  border-left: 4px solid;
  transition: all 0.3s ease;
}

.fib-level-item.buy {
  border-left-color: #10eb04;
  background: linear-gradient(90deg, rgba(16, 235, 4, 0.08), transparent);
}

.fib-level-item.neutral {
  border-left-color: #ffcc00;
  background: linear-gradient(90deg, rgba(255, 204, 0, 0.08), transparent);
}

.fib-level-item.golden {
  border-left-color: #ffd700;
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.15), transparent);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
}

.fib-level-item.sell {
  border-left-color: #ff6b35;
  background: linear-gradient(90deg, rgba(255, 107, 53, 0.08), transparent);
}

.fib-level-item.target {
  border-left-color: #05f5ed;
  background: linear-gradient(90deg, rgba(5, 245, 237, 0.1), transparent);
}

.fib-level-item.current-fib {
  border: 2px solid #ffcc00;
  background: linear-gradient(90deg, rgba(255, 204, 0, 0.2), transparent);
  box-shadow: 0 0 20px rgba(255, 204, 0, 0.4);
  transform: scale(1.05);
}

.fib-level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.fib-ratio {
  font-size: 12px;
  font-weight: 800;
  color: #fff;
}

.fib-price {
  font-size: 13px;
  font-weight: 800;
  color: #10eb04;
  font-family: 'Courier New', monospace;
}

.fib-level-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fib-multiplier {
  font-size: 11px;
  color: #ffcc00;
  font-weight: 700;
}

.fib-zone {
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Scrollbar styling */
.fib-table-container::-webkit-scrollbar {
  width: 6px;
}

.fib-table-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.fib-table-container::-webkit-scrollbar-thumb {
  background: rgba(255, 204, 0, 0.4);
  border-radius: 3px;
}

.fib-table-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 204, 0, 0.6);
}

/* Responsive */
@media (max-width: 1200px) {
  .price-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .fib-levels-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .price-info-grid {
    grid-template-columns: 1fr;
  }
  
  .fib-levels-grid {
    grid-template-columns: 1fr;
  }
  
  .fib-table {
    font-size: 10px;
  }
  
  .fib-table th,
  .fib-table td {
    padding: 6px 4px;
  }
}
</style>