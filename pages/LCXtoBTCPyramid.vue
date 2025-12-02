<template>
  <div class="fibonacci-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">🏔️ LCX to BTC Pyramid</h1>
          <p class="page-subtitle">Visual accumulation pyramid showing your journey to 1 Bitcoin</p>
        </div>
        <div class="header-actions">
          <div class="current-price-display">
            <span class="price-label">🔴 LIVE LCX PRICE</span>
            <span class="price-value">${{ currentPrice }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="pyramid-main-content">
      <!-- LCX to BTC Pyramid -->
      <n-card class="pyramid-card" title="🏔️ LCX to BTC Pyramid">
        <template #header-extra>
          <div class="pyramid-stats">
            <span class="stats-label">Target: 1 BTC</span>
            <span class="stats-value">₿ 1.00000000</span>
          </div>
        </template>

        <!-- Real-time Price Info -->
        <div class="real-time-info">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">🔴 LIVE BTC:</span>
              <span class="info-value">${{ parseFloat(btcPrice).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">1 BTC =</span>
              <span class="info-value">{{ lcxPerBtc.toLocaleString('en-US', {maximumFractionDigits: 0}) }} LCX</span>
            </div>
            <div class="info-item">
              <span class="info-label">1 LCX =</span>
              <span class="info-value">₿ {{ (1 / lcxPerBtc).toFixed(8) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">LCX Price:</span>
              <span class="info-value">${{ currentPrice }}</span>
            </div>
          </div>
        </div>

        <div class="pyramid-container">
          <!-- BTC Value Indicator -->
          <div class="btc-indicator">
            <div class="btc-icon">₿</div>
            <div class="btc-value">1.00000000 BTC</div>
            <div class="btc-usd">${{ parseFloat(btcPrice).toLocaleString('en-US') }}</div>
          </div>

          <!-- Pyramid Levels -->
          <div class="pyramid-levels">
            <div 
              v-for="(level, index) in pyramidLevels" 
              :key="index"
              class="pyramid-level"
              :class="[
                `level-${index + 1}`,
                { 
                  'completed': level.percentage >= 100, 
                  'current': level.isCurrentLevel,
                  'highlight': level.highlight
                }
              ]"
              :style="{ width: getPyramidLevelWidth(level.percentage) + '%' }"
            >
              <div class="level-content">
                <div class="level-lcx">{{ level.lcx.toLocaleString('en-US') }} LCX</div>
                <div class="level-btc">₿ {{ level.btc.toFixed(8) }}</div>
                <div class="level-percentage">{{ level.percentage.toFixed(1) }}%</div>
                <div class="level-usd">${{ level.usd.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</div>
              </div>
              
              <!-- Progress Bar -->
              <div class="level-progress">
                <div 
                  class="progress-fill" 
                  :style="{ width: Math.min(level.percentage, 100) + '%' }"
                ></div>
              </div>

              <!-- Level Indicator -->
              <div class="level-indicator">
                <div class="indicator-dot" :class="{ 'active': level.percentage >= 100 }"></div>
                <div class="indicator-label">Level {{ index + 1 }}</div>
              </div>
            </div>
          </div>

          <!-- Base Level -->
          <div class="pyramid-base">
            <div class="base-content">
              <div class="base-label">Start Accumulation</div>
              <div class="base-lcx">0 LCX</div>
              <div class="base-btc">₿ 0.00000000</div>
            </div>
          </div>
        </div>

        <!-- Progress Summary -->
        <div class="progress-summary">
          <div class="summary-item">
            <span class="summary-label">Total LCX Required:</span>
            <span class="summary-value">{{ lcxPerBtc.toLocaleString('en-US', {maximumFractionDigits: 0}) }} LCX</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Current Progress:</span>
            <span class="summary-value highlight">{{ currentPyramidProgress.toFixed(1) }}%</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Remaining:</span>
            <span class="summary-value">{{ remainingLCXFor1BTC.toLocaleString('en-US', {maximumFractionDigits: 0}) }} LCX</span>
          </div>
        </div>

        <!-- Legend -->
        <div class="pyramid-legend">
          <div class="legend-title">📊 Pyramid Levels:</div>
          <div class="legend-items">
            <div class="legend-item">
              <div class="legend-color completed"></div>
              <span>Completed Level</span>
            </div>
            <div class="legend-item">
              <div class="legend-color current"></div>
              <span>Current Level</span>
            </div>
            <div class="legend-item">
              <div class="legend-color upcoming"></div>
              <span>Upcoming Level</span>
            </div>
            <div class="legend-item">
              <div class="legend-color highlight"></div>
              <span>Milestone Level</span>
            </div>
          </div>
        </div>

        <!-- Quick Conversion Table -->
        <div class="quick-conversion">
          <h3>💱 Quick Conversion Reference</h3>
          <div class="conversion-grid">
            <div 
              v-for="item in quickConversions" 
              :key="item.lcx"
              class="conversion-item"
              :class="{ 'highlight': item.highlight }"
            >
              <div class="conversion-lcx">{{ item.lcx.toLocaleString('en-US') }} LCX</div>
              <div class="conversion-btc">₿ {{ item.btc.toFixed(8) }}</div>
              <div class="conversion-usd">${{ item.usd.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</div>
              <div class="conversion-pct">{{ item.percentage.toFixed(1) }}%</div>
            </div>
          </div>
        </div>
      </n-card>

      <!-- Additional Info Cards -->
      <div class="info-cards-grid">
        <!-- Accumulation Strategy -->
        <n-card class="strategy-card" title="🎯 Accumulation Strategy">
          <div class="strategy-content">
            <div class="strategy-item">
              <div class="strategy-icon">💰</div>
              <div class="strategy-text">
                <h4>Dollar Cost Averaging</h4>
                <p>Consistently accumulate LCX over time to reach your BTC goals</p>
              </div>
            </div>
            <div class="strategy-item">
              <div class="strategy-icon">📈</div>
              <div class="strategy-text">
                <h4>Price Targets</h4>
                <p>Set buy orders at key Fibonacci levels for optimal entry points</p>
              </div>
            </div>
            <div class="strategy-item">
              <div class="strategy-icon">🛡️</div>
              <div class="strategy-text">
                <h4>Risk Management</h4>
                <p>Never invest more than you can afford to lose</p>
              </div>
            </div>
          </div>
        </n-card>

        <!-- BTC Dominance -->
        <n-card class="dominance-card" title="🌍 BTC Market Dominance">
          <div class="dominance-content">
            <div class="dominance-stats">
              <div class="dominance-item">
                <span class="dominance-label">BTC Dominance:</span>
                <span class="dominance-value">52.8%</span>
              </div>
              <div class="dominance-item">
                <span class="dominance-label">Market Cap:</span>
                <span class="dominance-value">$2.1T</span>
              </div>
            </div>
            <div class="dominance-chart">
              <div class="chart-bar">
                <div class="chart-fill btc-fill" style="width: 52.8%"></div>
                <div class="chart-fill eth-fill" style="width: 17.2%"></div>
                <div class="chart-fill other-fill" style="width: 30%"></div>
              </div>
              <div class="chart-labels">
                <div class="chart-label">
                  <div class="label-color btc-color"></div>
                  <span>BTC: 52.8%</span>
                </div>
                <div class="chart-label">
                  <div class="label-color eth-color"></div>
                  <span>ETH: 17.2%</span>
                </div>
                <div class="chart-label">
                  <div class="label-color other-color"></div>
                  <span>Other: 30%</span>
                </div>
              </div>
            </div>
          </div>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAppStore } from '~/stores/app.store';

definePageMeta({
  middleware: 'auth'
});

const appStore = useAppStore();

// BTC price (live from ticker-bar store - updated every 3 seconds)
const btcPrice = computed(() => {
  const storePrice = appStore.getBtcPrice;
  return storePrice ? storePrice.toFixed(2) : "108484.22";
});

// Current price from store
const currentPrice = computed(() => {
  const storePrice = appStore.getCurrentPrice;
  return storePrice ? storePrice.toFixed(4) : "0.1101";
});

// Calculate how many LCX equals 1 BTC at current prices
const lcxPerBtc = computed(() => {
  const lcxPriceUsd = parseFloat(currentPrice.value);
  const btcPriceUsd = parseFloat(btcPrice.value);
  return btcPriceUsd / lcxPriceUsd;
});

// Pyramid levels data
const pyramidLevels = computed(() => {
  const lcxPriceUsd = parseFloat(currentPrice.value);
  const btcPriceUsd = parseFloat(btcPrice.value);
  const lcxFor1Btc = lcxPerBtc.value;
  
  const levels = [
    { lcx: 100000, label: '100K LCX' },
    { lcx: 250000, label: '250K LCX' },
    { lcx: 500000, label: '500K LCX' },
    { lcx: 750000, label: '750K LCX' },
    { lcx: 1000000, label: '1M LCX' },
    { lcx: 1500000, label: '1.5M LCX' },
    { lcx: 2000000, label: '2M LCX' },
    { lcx: 2500000, label: '2.5M LCX' }
  ];

  return levels.map(level => {
    const btcValue = (level.lcx * lcxPriceUsd) / btcPriceUsd;
    const usdValue = level.lcx * lcxPriceUsd;
    const percentage = (btcValue / 1) * 100;
    
    // Check if this is the current level (user's progress)
    const currentLcx = 0; // You can replace this with actual user's LCX balance from store
    const isCurrentLevel = currentLcx >= level.lcx;
    const highlight = level.lcx === 1000000 || level.lcx === 500000 || level.lcx === 100000;
    
    return {
      ...level,
      btc: btcValue,
      usd: usdValue,
      percentage: percentage,
      isCurrentLevel: isCurrentLevel,
      highlight: highlight
    };
  });
});

// Current pyramid progress
const currentPyramidProgress = computed(() => {
  const lcxPriceUsd = parseFloat(currentPrice.value);
  const btcPriceUsd = parseFloat(btcPrice.value);
  const currentLcx = 0; // Replace with actual user's LCX balance
  
  const btcValue = (currentLcx * lcxPriceUsd) / btcPriceUsd;
  return (btcValue / 1) * 100;
});

// Remaining LCX for 1 BTC
const remainingLCXFor1BTC = computed(() => {
  const currentLcx = 0; // Replace with actual user's LCX balance
  const requiredLcx = lcxPerBtc.value;
  return Math.max(0, requiredLcx - currentLcx);
});

// Quick conversion reference
const quickConversions = computed(() => {
  const lcxPriceUsd = parseFloat(currentPrice.value);
  const btcPriceUsd = parseFloat(btcPrice.value);
  
  const amounts = [1000, 5000, 10000, 50000, 100000, 500000, 1000000, 5000000];
  
  return amounts.map(amount => {
    const usdValue = amount * lcxPriceUsd;
    const btcValue = usdValue / btcPriceUsd;
    const percentage = (btcValue / 1) * 100;
    
    return {
      lcx: amount,
      usd: usdValue,
      btc: btcValue,
      percentage: percentage,
      highlight: amount === 100000 || amount === 1000000
    };
  });
});

// Method to calculate pyramid level width
function getPyramidLevelWidth(percentage) {
  const baseWidth = 25;
  const maxWidth = 95;
  const scaleFactor = (maxWidth - baseWidth) / 100;
  
  return baseWidth + (percentage * scaleFactor);
}
</script>

<style scoped>
.fibonacci-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  padding: 20px;
}

/* ===== PAGE HEADER ===== */
.page-header {
  background: linear-gradient(135deg, rgba(245, 166, 35, 0.08), rgba(16, 235, 4, 0.08));
  border-radius: 12px;
  padding: 20px 30px;
  margin-bottom: 24px;
  border: 1px solid rgba(245, 166, 35, 0.3);
  box-shadow: 0 4px 15px rgba(245, 166, 35, 0.15);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #f5a623, #10eb04);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(245, 166, 35, 0.3);
}

.page-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 8px 0 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.current-price-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(16, 235, 4, 0.4);
  border-radius: 8px;
  padding: 8px 16px;
  min-width: 140px;
}

.price-label {
  font-size: 10px;
  font-weight: 800;
  color: #ff0000;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 2px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.price-value {
  font-size: 18px;
  font-weight: 800;
  color: #10eb04;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 10px rgba(16, 235, 4, 0.5);
}

/* ===== MAIN CONTENT ===== */
.pyramid-main-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* ===== PYRAMID CARD ===== */
.pyramid-card {
  background: rgba(13, 1, 77, 0.6);
  border: 1px solid rgba(247, 147, 26, 0.3);
  margin-bottom: 24px;
}

.pyramid-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}

.stats-value {
  font-size: 14px;
  color: #f7931a;
  font-weight: 800;
  font-family: 'Courier New', monospace;
}

/* Real-time Info */
.real-time-info {
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(247, 147, 26, 0.2);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border: 1px solid rgba(247, 147, 26, 0.1);
}

.info-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 13px;
  color: #f7931a;
  font-weight: 800;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 8px rgba(247, 147, 26, 0.4);
}

/* ===== PYRAMID CONTAINER ===== */
.pyramid-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(13, 1, 77, 0.2));
  border-radius: 12px;
  border: 1px solid rgba(247, 147, 26, 0.2);
  margin-bottom: 24px;
}

.btc-indicator {
  text-align: center;
  margin-bottom: 30px;
  padding: 15px 25px;
  background: rgba(247, 147, 26, 0.1);
  border: 2px solid rgba(247, 147, 26, 0.4);
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(247, 147, 26, 0.3);
}

.btc-icon {
  font-size: 48px;
  color: #f7931a;
  margin-bottom: 8px;
}

.btc-value {
  font-size: 18px;
  font-weight: 800;
  color: #f7931a;
  font-family: 'Courier New', monospace;
  margin-bottom: 4px;
}

.btc-usd {
  font-size: 14px;
  color: #05f5ed;
  font-weight: 700;
}

.pyramid-levels {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
  gap: 8px;
  margin-bottom: 20px;
}

.pyramid-level {
  position: relative;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid;
  border-radius: 8px;
  padding: 12px 20px;
  transition: all 0.3s ease;
  min-height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Level colors based on completion */
.pyramid-level {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
}

.pyramid-level.current {
  border-color: #f5a623;
  background: linear-gradient(135deg, rgba(245, 166, 35, 0.15), transparent);
  box-shadow: 0 0 25px rgba(245, 166, 35, 0.3);
  transform: scale(1.02);
}

.pyramid-level.completed {
  border-color: #10eb04;
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.15), transparent);
}

.pyramid-level.highlight {
  border-color: #05f5ed;
  background: linear-gradient(135deg, rgba(5, 245, 237, 0.15), transparent);
  box-shadow: 0 0 20px rgba(5, 245, 237, 0.2);
}

.level-content {
  text-align: center;
  z-index: 2;
}

.level-lcx {
  font-size: 16px;
  font-weight: 800;
  color: #10eb04;
  margin-bottom: 4px;
}

.level-btc {
  font-size: 13px;
  color: #f7931a;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  margin-bottom: 2px;
}

.level-percentage {
  font-size: 12px;
  color: #05f5ed;
  font-weight: 800;
  margin-bottom: 2px;
}

.level-usd {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

.level-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0 0 6px 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10eb04, #05f5ed);
  transition: width 0.5s ease;
  border-radius: 0 0 6px 6px;
}

.level-indicator {
  position: absolute;
  left: -60px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.indicator-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
}

.indicator-dot.active {
  background: #10eb04;
  border-color: #10eb04;
  box-shadow: 0 0 8px rgba(16, 235, 4, 0.5);
}

.indicator-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  white-space: nowrap;
}

.pyramid-base {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 10px 20px;
  text-align: center;
}

.base-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.base-lcx {
  font-size: 12px;
  color: #10eb04;
  font-weight: 700;
}

.base-btc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Courier New', monospace;
}

/* ===== PROGRESS SUMMARY ===== */
.progress-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin: 20px 0;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(247, 147, 26, 0.2);
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.summary-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  text-align: center;
}

.summary-value {
  font-size: 14px;
  color: #f7931a;
  font-weight: 800;
  font-family: 'Courier New', monospace;
}

.summary-value.highlight {
  color: #10eb04;
  text-shadow: 0 0 8px rgba(16, 235, 4, 0.4);
}

/* ===== PYRAMID LEGEND ===== */
.pyramid-legend {
  margin-top: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.legend-title {
  font-size: 12px;
  font-weight: 800;
  color: #f7931a;
  margin-bottom: 10px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.legend-items {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 2px solid;
}

.legend-color.completed {
  background: rgba(16, 235, 4, 0.3);
  border-color: #10eb04;
}

.legend-color.current {
  background: rgba(245, 166, 35, 0.3);
  border-color: #f5a623;
}

.legend-color.upcoming {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.legend-color.highlight {
  background: rgba(5, 245, 237, 0.3);
  border-color: #05f5ed;
}

.legend-item span {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

/* ===== QUICK CONVERSION ===== */
.quick-conversion {
  margin-top: 24px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(247, 147, 26, 0.2);
}

.quick-conversion h3 {
  font-size: 14px;
  color: #f7931a;
  font-weight: 800;
  text-align: center;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.conversion-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.conversion-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.conversion-item:hover {
  border-color: rgba(247, 147, 26, 0.4);
  transform: translateY(-2px);
}

.conversion-item.highlight {
  border-color: #05f5ed;
  background: linear-gradient(135deg, rgba(5, 245, 237, 0.1), transparent);
}

.conversion-lcx {
  font-size: 12px;
  color: #10eb04;
  font-weight: 800;
  margin-bottom: 4px;
}

.conversion-btc {
  font-size: 10px;
  color: #f7931a;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  margin-bottom: 2px;
}

.conversion-usd {
  font-size: 9px;
  color: #05f5ed;
  font-weight: 600;
  margin-bottom: 2px;
}

.conversion-pct {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}

/* ===== INFO CARDS GRID ===== */
.info-cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.strategy-card, .dominance-card {
  background: rgba(13, 1, 77, 0.6);
  border: 1px solid rgba(247, 147, 26, 0.3);
}

.strategy-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.strategy-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.strategy-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(247, 147, 26, 0.1);
  border-radius: 8px;
}

.strategy-text h4 {
  font-size: 13px;
  color: #f7931a;
  font-weight: 800;
  margin: 0 0 4px 0;
}

.strategy-text p {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.4;
}

.dominance-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dominance-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.dominance-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dominance-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  margin-bottom: 4px;
}

.dominance-value {
  font-size: 14px;
  color: #10eb04;
  font-weight: 800;
  font-family: 'Courier New', monospace;
}

.dominance-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-bar {
  height: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
}

.chart-fill {
  height: 100%;
  transition: width 0.5s ease;
}

.btc-fill {
  background: linear-gradient(90deg, #f7931a, #f5a623);
}

.eth-fill {
  background: linear-gradient(90deg, #627eea, #8a9ef5);
}

.other-fill {
  background: linear-gradient(90deg, #05f5ed, #10eb04);
}

.chart-labels {
  display: flex;
  justify-content: space-around;
  gap: 12px;
}

.chart-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.label-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.btc-color {
  background: #f7931a;
}

.eth-color {
  background: #627eea;
}

.other-color {
  background: #05f5ed;
}

.chart-label span {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

/* Pyramid level widths - creating pyramid shape */
.pyramid-level.level-1 { width: 95% !important; }
.pyramid-level.level-2 { width: 85% !important; }
.pyramid-level.level-3 { width: 75% !important; }
.pyramid-level.level-4 { width: 65% !important; }
.pyramid-level.level-5 { width: 55% !important; }
.pyramid-level.level-6 { width: 45% !important; }
.pyramid-level.level-7 { width: 35% !important; }
.pyramid-level.level-8 { width: 25% !important; }

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 1024px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .conversion-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .info-cards-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .pyramid-level {
    padding: 10px 15px;
    min-height: 60px;
  }
  
  .level-lcx {
    font-size: 14px;
  }
  
  .level-btc {
    font-size: 12px;
  }
  
  .level-indicator {
    left: -50px;
  }
  
  .progress-summary {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .legend-items {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .conversion-grid {
    grid-template-columns: 1fr;
  }
  
  .dominance-stats {
    grid-template-columns: 1fr;
  }
  
  .chart-labels {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .pyramid-container {
    padding: 20px 10px;
  }
  
  .btc-indicator {
    padding: 12px 20px;
  }
  
  .btc-icon {
    font-size: 36px;
  }
  
  .btc-value {
    font-size: 16px;
  }
  
  .level-indicator {
    left: -40px;
  }
  
  .indicator-label {
    font-size: 9px;
  }
}
</style>