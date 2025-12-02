<template>
  <div class="pyramid-container">
    

    <div class="formula-header">
      <div class="formula-single-row">
        <div class="price-item">
          <span class="price-label">🔴 BTC:</span>
          <span class="price-value">${{ parseFloat(btcPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
        </div>
        <div class="separator">|</div>
        <div class="price-item">
          <span class="price-label">🟢 LCX:</span>
          <span class="price-value">${{ currentPrice }}</span>
        </div>
        <div class="separator">|</div>
        <div class="formula-item">
          <span class="formula-icon">📐</span>
          <span class="formula-text">Current level: 1 BTC / {{ currentPrice }} LCX = {{ (1 / parseFloat(currentPrice)).toFixed(10) }} BTC</span>
        </div>
      </div>
    </div>

    <div class="pyramid-wrapper">
      <svg width="100%" height="450" viewBox="0 0 600 450" class="pyramid-svg">
        <!-- Background -->
        <rect x="0" y="0" width="600" height="450" fill="#0f172a" rx="10" />

        <!-- Pyramid shape with levels -->
        <g v-for="(level, index) in pyramidLevels" :key="index">
          <!-- Pyramid block -->
          <polygon
            :points="getPyramidPoints(index)"
            :fill="level.color"
            :opacity="0.7"
            stroke="#1f2937"
            stroke-width="1"
          />

          <!-- LCX amount text (left side) -->
          <text
            :x="getLabelX(index, 'left')"
            :y="getLabelY(index)"
            fill="#e5e7eb"
            font-size="5"
            font-weight="bold"
            text-anchor="end"
          >
            {{ formatNumber(level.lcx) }}
          </text>

          <!-- BTC value text (right side) - Price of 1 LCX in BTC -->
          <text
            :x="getLabelX(index, 'right')"
            :y="getLabelY(index) - 1"
            fill="#f7931a"
            font-size="4"
            text-anchor="start"
            font-weight="bold"
          >
            ₿{{ level.btc.toFixed(10) }}
          </text>

          <!-- USD value text (right side, below BTC) - Price of 1 LCX in USD -->
          <text
            :x="getLabelX(index, 'right')"
            :y="getLabelY(index) + 3"
            fill="#10eb04"
            font-size="4"
            text-anchor="start"
            font-weight="600"
          >
            ${{ level.usd.toFixed(6) }}
          </text>
        </g>

        <!-- Labels: BASE and PEAK -->
        <text x="50" y="30" fill="#00cc00" font-size="11" font-weight="bold">📦 BASE</text>
        <text x="530" y="30" fill="#ff0000" font-size="11" font-weight="bold">🔺 PEAK</text>

        <!-- Legend -->
        <g>
          <rect x="15" y="380" width="570" height="45" fill="rgba(0,0,0,0.5)" rx="8" />

          <text x="25" y="395" fill="#e5e7eb" font-size="9" font-weight="bold">
            📊 Pyramid Structure
          </text>

          <text x="25" y="407" fill="#9ca3af" font-size="7">
            Base: 3,000,000 LCX → Peak: 50,000 LCX | Total: {{ pyramidLevels.length }} levels
          </text>

          <text x="25" y="418" fill="#9ca3af" font-size="6">
            Left: LCX amount | Right: 1 LCX price in BTC (₿) and USD ($) - Formula: 1 BTC / level
          </text>
        </g>
      </svg>
    </div>

    <!-- Statistics -->
    <div class="pyramid-stats">
      <div class="stat-card">
        <span class="stat-label">Peak Level</span>
        <span class="stat-lcx">{{ formatNumber(pyramidLevels[0].lcx) }} LCX</span>
        <span class="stat-value">${{ pyramidLevels[0].usd.toFixed(6) }}</span>
        <span class="stat-subtitle">₿{{ pyramidLevels[0].btc.toFixed(10) }}</span>
      </div>

      <div class="stat-card">
        <span class="stat-label">Average 1 LCX Price</span>
        <span class="stat-lcx">{{ pyramidLevels.length }} levels</span>
        <span class="stat-value">${{ averagePriceUSD.toFixed(6) }}</span>
        <span class="stat-subtitle">₿{{ averagePriceBTC.toFixed(10) }}</span>
      </div>

      <div class="stat-card">
        <span class="stat-label">Base Level</span>
        <span class="stat-lcx">{{ formatNumber(pyramidLevels[pyramidLevels.length - 1].lcx) }} LCX</span>
        <span class="stat-value">${{ pyramidLevels[pyramidLevels.length - 1].usd.toFixed(6) }}</span>
        <span class="stat-subtitle">₿{{ pyramidLevels[pyramidLevels.length - 1].btc.toFixed(10) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  btcPrice: {
    type: String,
    required: true
  },
  currentPrice: {
    type: String,
    required: true
  }
})

// Pyramid levels from 50,000 up to 1,100,000 (inverted order)
const pyramidLevels = computed(() => {
  const btcPriceUsd = parseFloat(props.btcPrice)
  const lcxPriceUsd = parseFloat(props.currentPrice)

  const levels = [
  50000, 60000, 70000, 80000, 90000, 100000, 150000, 200000, 250000, 300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000, 1100000, 1200000, 1300000, 1400000, 1500000, 1600000, 1700000, 1800000, 1900000, 2000000, 2100000, 2200000, 2300000, 2400000, 2500000, 2600000, 2700000, 2800000, 2900000, 3000000, 3100000, 3200000, 3300000, 3400000, 3500000, 3600000, 3700000, 3800000, 3900000, 4000000, 4100000, 4200000, 4300000, 4400000, 4500000, 4600000, 4700000, 4800000, 4900000, 5000000, 5100000, 5200000, 5300000, 5400000, 5500000, 5600000, 5700000, 5800000, 5900000, 6000000, 6100000, 6200000, 6300000, 6400000, 6500000, 6600000, 6700000, 6800000, 6900000, 7000000, 7100000, 7200000, 7300000, 7400000, 7500000, 7600000, 7700000, 7800000, 7900000, 8000000, 8100000, 8200000, 8300000, 8400000, 8500000, 8600000, 8700000, 8800000, 8900000, 9000000, 9100000, 9200000, 9300000, 9400000, 9500000, 9600000, 9700000, 9800000, 9900000, 10000000
 ]

  const colors = [
    '#990000', '#880000', '#770000', '#660000', '#550000', '#440000', '#330000',
    '#ffff33', '#ffff00', '#dddd00', '#cccc00',
    '#00b300', '#009900', '#008000', '#006600', '#004d00', '#003300', '#002200', '#001a00', '#001100', '#000d00', '#000900', '#000600', '#000400', '#000200', '#000100', '#000100', '#001100', '#002200', '#003300', '#004400', '#005500', '#006600', '#007700', '#008800', '#009900', '#00aa00'
  ]

  return levels.map((lcx, index) => {
    // CORRECT FORMULA: 1 BTC / pyramid_level = price of 1 LCX in BTC
    // Example: 1 BTC / 1,100,000 LCX = 0.0000009090909 BTC per LCX
    const lcxPriceInBTC = 1 / lcx

    // Convert BTC price to USD: BTC_price × BTC_amount
    const lcxPriceInUSD = lcxPriceInBTC * btcPriceUsd

    // Total USD value for this pyramid level
    const usdValue = lcx * lcxPriceInUSD

    return {
      lcx,
      usd: lcxPriceInUSD,  // Price of 1 LCX in USD at this pyramid level
      btc: lcxPriceInBTC,  // Price of 1 LCX in BTC (1 BTC / level)
      color: colors[index % colors.length],
      index
    }
  })
})

// Calculate averages for 1 LCX price across all pyramid levels
const averagePriceUSD = computed(() => {
  if (pyramidLevels.value.length === 0) return 0
  const sum = pyramidLevels.value.reduce((acc, level) => acc + level.usd, 0)
  return sum / pyramidLevels.value.length
})

const averagePriceBTC = computed(() => {
  if (pyramidLevels.value.length === 0) return 0
  const sum = pyramidLevels.value.reduce((acc, level) => acc + level.btc, 0)
  return sum / pyramidLevels.value.length
})

// Get pyramid points for SVG polygon
const getPyramidPoints = (index) => {
  const totalLevels = pyramidLevels.value.length
  const baseWidth = 520
  const topWidth = 30
  const height = 3
  const startY = 50

  // Calculate width for this level (inverted - peak at top, base at bottom)
  const levelWidth = topWidth + ((baseWidth - topWidth) / totalLevels) * index
  const nextLevelWidth = topWidth + ((baseWidth - topWidth) / totalLevels) * (index + 1)

  const y1 = startY + index * height
  const y2 = y1 + height

  const leftX1 = 300 - levelWidth / 2
  const rightX1 = 300 + levelWidth / 2
  const leftX2 = 300 - nextLevelWidth / 2
  const rightX2 = 300 + nextLevelWidth / 2

  return `${leftX1},${y1} ${rightX1},${y1} ${rightX2},${y2} ${leftX2},${y2}`
}

// Get label X position
const getLabelX = (index, side) => {
  const totalLevels = pyramidLevels.value.length
  const baseWidth = 520
  const topWidth = 30

  const levelWidth = topWidth + ((baseWidth - topWidth) / totalLevels) * index

  if (side === 'left') {
    return 300 - levelWidth / 2 - 10
  } else {
    return 300 + levelWidth / 2 + 10
  }
}

// Get label Y position
const getLabelY = (index) => {
  const height = 3
  const startY = 50
  return startY + index * height + height / 2
}

// Format numbers
const formatNumber = (num) => {
  return Math.round(num).toLocaleString('en-US')
}
</script>

<style scoped>
.pyramid-container {
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  color: #ffffff;
}

.pyramid-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
  color: #e5e7eb;
}

.formula-header {
  margin-bottom: 25px;
  padding: 15px 20px;
  background: linear-gradient(135deg, rgba(247, 147, 26, 0.1), rgba(16, 235, 4, 0.1));
  border: 1px solid rgba(247, 147, 26, 0.3);
  border-radius: 12px;
}

.formula-single-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.price-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 600;
}

.price-value {
  font-size: 14px;
  font-weight: 700;
  color: #fbbf24;
  font-family: 'Courier New', monospace;
}

.separator {
  font-size: 16px;
  color: #4b5563;
  font-weight: 300;
}

.formula-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.formula-icon {
  font-size: 16px;
}

.formula-text {
  font-size: 12px;
  font-weight: 600;
  color: #10eb04;
  font-family: 'Courier New', monospace;
}

.pyramid-info {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 20px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  font-size: 14px;
}

.pyramid-wrapper {
  margin: 20px 0;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 20px;
  overflow-x: auto;
}

.pyramid-svg {
  width: 100%;
  height: auto;
  min-height: 450px;
}

.pyramid-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.stat-card {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.stat-label {
  display: block;
  font-size: 11px;
  color: #888;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.stat-lcx {
  display: block;
  font-size: 12px;
  color: #e5e7eb;
  margin-bottom: 6px;
  font-weight: 600;
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #10eb04;
  margin-bottom: 4px;
  font-family: 'Courier New', monospace;
}

.stat-subtitle {
  display: block;
  font-size: 10px;
  color: #f7931a;
  font-family: 'Courier New', monospace;
  font-weight: 600;
}

@media (max-width: 600px) {
  .pyramid-container {
    padding: 10px;
  }

  .pyramid-stats {
    grid-template-columns: 1fr 1fr;
  }

  .pyramid-title {
    font-size: 18px;
  }

  .pyramid-info {
    flex-direction: column;
    gap: 10px;
    font-size: 12px;
  }
}
</style>
