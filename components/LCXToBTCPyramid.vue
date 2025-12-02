<template>
  <div class="pyramid-wrapper">
    <!-- Info Card: Header + Progress -->
    <div class="info-card">
      <!-- Compact Header -->
      <div class="compact-header">
        <div class="header-content">
        <div class="price-badge btc">
          <span class="badge-icon">₿</span>
          <span class="badge-value">${{ parseFloat(btcPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
        </div>
        <div class="price-badge lcx">
          <span class="badge-icon">🟢</span>
          <span class="badge-value">${{ currentPrice }}</span>
        </div>
        <div class="price-badge current">
          <span class="badge-icon">📍</span>
          <span class="badge-label">Current:</span>
          <span class="badge-value-small">₿{{ currentLcxInBTC.toFixed(10) }}</span>
        </div>
        <div class="price-badge ath-usd">
          <span class="badge-icon">🔥</span>
          <span class="badge-label">ATH USD:</span>
          <span class="badge-value-small">$0.564</span>
          <span class="badge-conversion">(₿{{ athUsdInBTC.toFixed(8) }})</span>
          <span class="badge-percent down">-80.0%</span>
        </div>
        <div class="price-badge ath-btc">
          <span class="badge-icon">⚡</span>
          <span class="badge-label">ATH BTC:</span>
          <span class="badge-value-small">₿0.0000058967</span>
          <span class="badge-conversion">(${{ athBtcInUSD.toFixed(4) }})</span>
          <span class="badge-percent down">-88.6%</span>
        </div>
        <div class="level-info">
          <span class="info-text">{{ pyramidLevels.length }} levels • 50K → 10M LCX</span>
        </div>
      </div>
    </div>

    <!-- Progress Cards Section -->
    <div class="progress-section">
      <div class="progress-card">
        <div class="progress-header">
          <span class="progress-icon">📍</span>
          <span class="progress-title">Base → Current</span>
        </div>
        <div class="progress-value">{{ progressBaseToCurrent.toFixed(1) }}%</div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill green" :style="{ width: progressBaseToCurrent + '%' }"></div>
        </div>
      </div>

      <div class="progress-card">
        <div class="progress-header">
          <span class="progress-icon">🔥</span>
          <span class="progress-title">Base → ATH USD</span>
        </div>
        <div class="progress-value">{{ progressBaseToAthUsd.toFixed(1) }}%</div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill orange" :style="{ width: progressBaseToAthUsd + '%' }"></div>
        </div>
      </div>

      <div class="progress-card">
        <div class="progress-header">
          <span class="progress-icon">⚡</span>
          <span class="progress-title">Base → ATH BTC</span>
        </div>
        <div class="progress-value">{{ progressBaseToAthBtc.toFixed(1) }}%</div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill violet" :style="{ width: progressBaseToAthBtc + '%' }"></div>
        </div>
      </div>

      <div class="progress-card">
        <div class="progress-header">
          <span class="progress-icon">🎯</span>
          <span class="progress-title">Current → ATH USD</span>
        </div>
        <div class="progress-value">{{ progressCurrentToAthUsd.toFixed(1) }}%</div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill cyan" :style="{ width: progressCurrentToAthUsd + '%' }"></div>
        </div>
      </div>

      <div class="progress-card">
        <div class="progress-header">
          <span class="progress-icon">🚀</span>
          <span class="progress-title">Current → ATH BTC</span>
        </div>
        <div class="progress-value">{{ progressCurrentToAthBtc.toFixed(1) }}%</div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill gold" :style="{ width: progressCurrentToAthBtc + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Pyramid Card -->
    <div class="pyramid-card">
      <!-- Modern Pyramid Grid -->
      <div class="pyramid-grid">
      <div
        v-for="(level, index) in pyramidLevels"
        :key="index"
        class="pyramid-level"
        :class="{
          'highlight-level': isHighlightLevel(level.lcx),
          'current-level': isCurrentLevel(level.lcx),
          'ath-usd-level': isAthUsdLevel(level.lcx),
          'ath-btc-level': isAthBtcLevel(level.lcx),
          'ath-usd-dynamic-level': isAthUsdDynamicLevel(level.lcx),
          'ath-btc-dynamic-level': isAthBtcDynamicLevel(level.lcx)
        }"
        :style="getLevelStyle(index)"
        @mouseenter="hoveredLevel = index"
        @mouseleave="hoveredLevel = null"
      >
        <!-- Current Level Indicator -->
        <div v-if="isCurrentLevel(level.lcx)" class="current-indicator">
          <span class="pulse-dot"></span>
          <span class="current-text">YOU ARE HERE</span>
        </div>

        <!-- ATH USD Indicator -->
        <div v-if="isAthUsdLevel(level.lcx)" class="ath-indicator ath-usd">
          <span class="pulse-dot ath-usd-dot"></span>
          <span class="ath-text">ATH USD $0.564</span>
        </div>

        <!-- ATH BTC Indicator -->
        <div v-if="isAthBtcLevel(level.lcx)" class="ath-indicator ath-btc">
          <span class="pulse-dot ath-btc-dot"></span>
          <span class="ath-text">ATH BTC ₿0.0000058967</span>
        </div>

        <!-- ATH USD Dynamic Indicator (moves with BTC price) - LEFT SIDE -->
        <div v-if="isAthUsdDynamicLevel(level.lcx)" class="ath-indicator ath-usd-dynamic left-indicator">
          <span class="ath-emoji">🔥</span>
          <span class="ath-text">ATH USD→BTC ₿{{ athUsdInBTC.toFixed(8) }}</span>
        </div>

        <!-- ATH BTC Dynamic Indicator (moves with BTC price) - LEFT SIDE -->
        <div v-if="isAthBtcDynamicLevel(level.lcx)" class="ath-indicator ath-btc-dynamic left-indicator">
          <span class="ath-emoji">⚡</span>
          <span class="ath-text">ATH BTC→USD ${{ athBtcInUSD.toFixed(4) }}</span>
        </div>

        <!-- Level Number Badge -->
        <div class="level-number">{{ index + 1 }}</div>

        <!-- Tooltip on hover -->
        <div v-if="hoveredLevel === index" class="level-tooltip">
          <div class="tooltip-header">Level {{ index + 1 }}</div>
          <div class="tooltip-row">
            <span class="tooltip-label">LCX Amount:</span>
            <span class="tooltip-value">{{ formatNumber(level.lcx) }}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">1 LCX in BTC:</span>
            <span class="tooltip-value btc-color">₿{{ level.btc.toFixed(10) }}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">1 LCX in USD:</span>
            <span class="tooltip-value usd-color">${{ level.usd.toFixed(8) }}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">Total Value:</span>
            <span class="tooltip-value">${{ (level.lcx * level.usd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats Row -->
    <div class="quick-stats">
      <div class="stat-box peak">
        <div class="stat-icon">🔺</div>
        <div class="stat-content">
          <div class="stat-title">Peak</div>
          <div class="stat-amount">{{ formatNumber(pyramidLevels[0].lcx) }}</div>
          <div class="stat-price">${{ pyramidLevels[0].usd.toFixed(8) }}</div>
        </div>
      </div>

      <div class="stat-box average">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-title">Average</div>
          <div class="stat-amount">{{ pyramidLevels.length }} lvls</div>
          <div class="stat-price">${{ averagePriceUSD.toFixed(8) }}</div>
        </div>
      </div>

      <div class="stat-box base">
        <div class="stat-icon">📦</div>
        <div class="stat-content">
          <div class="stat-title">Base</div>
          <div class="stat-amount">{{ formatNumber(pyramidLevels[pyramidLevels.length - 1].lcx) }}</div>
          <div class="stat-price">${{ pyramidLevels[pyramidLevels.length - 1].usd.toFixed(8) }}</div>
        </div>
      </div>
    </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

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

const hoveredLevel = ref(null)

// ATH values
const ATH_USD = 0.564
const ATH_BTC = 0.0000058967

// Calculate current LCX price in BTC
const currentLcxInBTC = computed(() => {
  const currentLcxPrice = parseFloat(props.currentPrice)
  const btcPriceUsd = parseFloat(props.btcPrice)
  return currentLcxPrice / btcPriceUsd
})

// Calculate equivalent LCX amount for current price (1 BTC / currentLcxInBTC)
const currentEquivalentLCX = computed(() => {
  return 1 / currentLcxInBTC.value
})

// Calculate equivalent LCX amount for ATH USD
const athUsdEquivalentLCX = computed(() => {
  const btcPriceUsd = parseFloat(props.btcPrice)
  const athUsdInBTC = ATH_USD / btcPriceUsd
  return 1 / athUsdInBTC
})

// Calculate equivalent LCX amount for ATH BTC
const athBtcEquivalentLCX = computed(() => {
  return 1 / ATH_BTC
})

// Calculate ATH USD in BTC at current BTC price
const athUsdInBTC = computed(() => {
  const btcPriceUsd = parseFloat(props.btcPrice)
  return ATH_USD / btcPriceUsd
})

// Calculate ATH BTC in USD at current BTC price
const athBtcInUSD = computed(() => {
  const btcPriceUsd = parseFloat(props.btcPrice)
  return ATH_BTC * btcPriceUsd
})

// Calculate pyramid progress (where we are on the pyramid from base to peak)
const pyramidProgress = computed(() => {
  const equivalentLCX = 1 / currentLcxInBTC.value
  const minLCX = 50000 // Base of pyramid
  const maxLCX = 10000000 // Peak of pyramid

  // Calculate progress from base (0%) to peak (100%)
  const progress = ((equivalentLCX - minLCX) / (maxLCX - minLCX)) * 100

  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, progress))
})

// Progress from Base (50K) to Current Position (based on level index)
const progressBaseToCurrent = computed(() => {
  // Find current level index
  const currentLCX = 1 / currentLcxInBTC.value
  const levels = pyramidLevels.value

  let currentLevelIndex = 0
  let minDistance = Infinity

  levels.forEach((level, index) => {
    const distance = Math.abs(level.lcx - currentLCX)
    if (distance < minDistance) {
      minDistance = distance
      currentLevelIndex = index
    }
  })

  // Calculate progress based on level index (0 = peak, 69 = base)
  // Reverse it so base = 0% and peak = 100%
  const totalLevels = levels.length - 1
  const progress = ((totalLevels - currentLevelIndex) / totalLevels) * 100
  return Math.max(0, Math.min(100, progress))
})

// Progress from Base to ATH USD (based on level index)
const progressBaseToAthUsd = computed(() => {
  const athUsdLCX = athUsdEquivalentLCX.value
  const levels = pyramidLevels.value

  let athUsdLevelIndex = 0
  let minDistance = Infinity

  levels.forEach((level, index) => {
    const distance = Math.abs(level.lcx - athUsdLCX)
    if (distance < minDistance) {
      minDistance = distance
      athUsdLevelIndex = index
    }
  })

  // Calculate progress based on level index
  const totalLevels = levels.length - 1
  const progress = ((totalLevels - athUsdLevelIndex) / totalLevels) * 100
  return Math.max(0, Math.min(100, progress))
})

// Progress from Base to ATH BTC (based on level index)
const progressBaseToAthBtc = computed(() => {
  const athBtcLCX = athBtcEquivalentLCX.value
  const levels = pyramidLevels.value

  let athBtcLevelIndex = 0
  let minDistance = Infinity

  levels.forEach((level, index) => {
    const distance = Math.abs(level.lcx - athBtcLCX)
    if (distance < minDistance) {
      minDistance = distance
      athBtcLevelIndex = index
    }
  })

  // Calculate progress based on level index
  const totalLevels = levels.length - 1
  const progress = ((totalLevels - athBtcLevelIndex) / totalLevels) * 100
  return Math.max(0, Math.min(100, progress))
})

// Progress from Current to ATH USD (based on level index difference)
const progressCurrentToAthUsd = computed(() => {
  const currentLCX = 1 / currentLcxInBTC.value
  const athUsdLCX = athUsdEquivalentLCX.value
  const levels = pyramidLevels.value

  // Find current level index
  let currentLevelIndex = 0
  let minDistanceCurrent = Infinity
  levels.forEach((level, index) => {
    const distance = Math.abs(level.lcx - currentLCX)
    if (distance < minDistanceCurrent) {
      minDistanceCurrent = distance
      currentLevelIndex = index
    }
  })

  // Find ATH USD level index
  let athUsdLevelIndex = 0
  let minDistanceAth = Infinity
  levels.forEach((level, index) => {
    const distance = Math.abs(level.lcx - athUsdLCX)
    if (distance < minDistanceAth) {
      minDistanceAth = distance
      athUsdLevelIndex = index
    }
  })

  // If we're at or above ATH USD (lower index = higher on pyramid)
  if (currentLevelIndex <= athUsdLevelIndex) {
    return 100
  }

  // Calculate progress from base to current relative to base to ATH USD
  const totalLevels = levels.length - 1
  const distanceFromBaseToCurrent = totalLevels - currentLevelIndex
  const distanceFromBaseToAth = totalLevels - athUsdLevelIndex

  if (distanceFromBaseToAth === 0) return 0
  const progress = (distanceFromBaseToCurrent / distanceFromBaseToAth) * 100
  return Math.max(0, Math.min(100, progress))
})

// Progress from Current to ATH BTC (based on level index difference)
const progressCurrentToAthBtc = computed(() => {
  const currentLCX = 1 / currentLcxInBTC.value
  const athBtcLCX = athBtcEquivalentLCX.value
  const levels = pyramidLevels.value

  // Find current level index
  let currentLevelIndex = 0
  let minDistanceCurrent = Infinity
  levels.forEach((level, index) => {
    const distance = Math.abs(level.lcx - currentLCX)
    if (distance < minDistanceCurrent) {
      minDistanceCurrent = distance
      currentLevelIndex = index
    }
  })

  // Find ATH BTC level index
  let athBtcLevelIndex = 0
  let minDistanceAth = Infinity
  levels.forEach((level, index) => {
    const distance = Math.abs(level.lcx - athBtcLCX)
    if (distance < minDistanceAth) {
      minDistanceAth = distance
      athBtcLevelIndex = index
    }
  })

  // If we're at or above ATH BTC (lower index = higher on pyramid)
  if (currentLevelIndex <= athBtcLevelIndex) {
    return 100
  }

  // Calculate progress from base to current relative to base to ATH BTC
  const totalLevels = levels.length - 1
  const distanceFromBaseToCurrent = totalLevels - currentLevelIndex
  const distanceFromBaseToAth = totalLevels - athBtcLevelIndex

  if (distanceFromBaseToAth === 0) return 0
  const progress = (distanceFromBaseToCurrent / distanceFromBaseToAth) * 100
  return Math.max(0, Math.min(100, progress))
})

// Generate levels from 50K to 10M (original 70 levels)
const pyramidLevels = computed(() => {
  const btcPriceUsd = parseFloat(props.btcPrice)

  const levels = [
    50000, 100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000,
    550000, 600000, 650000, 700000, 750000, 800000, 850000, 900000, 950000, 1000000,
    1100000, 1200000, 1300000, 1400000, 1500000, 1600000, 1700000, 1800000, 1900000, 2000000,
    2100000, 2200000, 2300000, 2400000, 2500000, 2600000, 2700000, 2800000, 2900000, 3000000,
    3100000, 3200000, 3300000, 3400000, 3500000, 3600000, 3700000, 3800000, 3900000, 4000000,
    4100000, 4200000, 4300000, 4400000, 4500000, 4600000, 4700000, 4800000, 4900000, 5000000,
    5500000, 6000000, 6500000, 7000000, 7500000, 8000000, 8500000, 9000000, 9500000, 10000000
  ]

  return levels.map((lcx, index) => {
    const lcxPriceInBTC = 1 / lcx
    const lcxPriceInUSD = lcxPriceInBTC * btcPriceUsd

    return {
      lcx,
      usd: lcxPriceInUSD,
      btc: lcxPriceInBTC,
      index
    }
  })
})

// Calculate averages
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

// Get dynamic style for each level
const getLevelStyle = (index) => {
  const totalLevels = pyramidLevels.value.length
  const progress = index / totalLevels

  // Color gradient from red (top) to green (bottom)
  const hue = progress * 120 // 0 (red) to 120 (green)
  const saturation = 70 + (progress * 30) // 70% to 100%
  const lightness = 30 + (Math.sin(progress * Math.PI) * 20) // Varying lightness

  const width = 20 + (progress * 80) // 20% to 100% width

  return {
    background: `linear-gradient(135deg, hsl(${hue}, ${saturation}%, ${lightness}%), hsl(${hue}, ${saturation}%, ${lightness - 10}%))`,
    width: `${width}%`,
    borderColor: `hsl(${hue}, ${saturation}%, ${lightness + 10}%)`
  }
}

// Check if level should be highlighted
const isHighlightLevel = (lcx) => {
  return lcx === 1000000 || lcx === 5000000 || lcx === 10000000
}

// Check if this is the current level (closest to current price)
const isCurrentLevel = (lcx) => {
  const equivalentLCX = 1 / currentLcxInBTC.value

  // Find the closest level to current price
  const allLevels = pyramidLevels.value.map(l => l.lcx)
  const closest = allLevels.reduce((prev, curr) => {
    return Math.abs(curr - equivalentLCX) < Math.abs(prev - equivalentLCX) ? curr : prev
  })

  return lcx === closest
}

// Check if this is the ATH USD level
const isAthUsdLevel = (lcx) => {
  const allLevels = pyramidLevels.value.map(l => l.lcx)
  const closest = allLevels.reduce((prev, curr) => {
    return Math.abs(curr - athUsdEquivalentLCX.value) < Math.abs(prev - athUsdEquivalentLCX.value) ? curr : prev
  })

  return lcx === closest
}

// Check if this is the ATH BTC level
const isAthBtcLevel = (lcx) => {
  const allLevels = pyramidLevels.value.map(l => l.lcx)
  const closest = allLevels.reduce((prev, curr) => {
    return Math.abs(curr - athBtcEquivalentLCX.value) < Math.abs(prev - athBtcEquivalentLCX.value) ? curr : prev
  })

  return lcx === closest
}

// Check if this is the ATH USD Dynamic level (ATH USD converted to BTC at current price)
const isAthUsdDynamicLevel = (lcx) => {
  const equivalentLCX = athUsdEquivalentLCX.value
  const allLevels = pyramidLevels.value.map(l => l.lcx)
  const closest = allLevels.reduce((prev, curr) => {
    return Math.abs(curr - equivalentLCX) < Math.abs(prev - equivalentLCX) ? curr : prev
  })

  return lcx === closest
}

// Check if this is the ATH BTC Dynamic level (ATH BTC converted to USD at current price)
const isAthBtcDynamicLevel = (lcx) => {
  const btcPriceUsd = parseFloat(props.btcPrice)
  const athBtcInUsd = ATH_BTC * btcPriceUsd
  const athBtcInBtcAgain = athBtcInUsd / btcPriceUsd // This will equal ATH_BTC
  const equivalentLCX = 1 / athBtcInBtcAgain

  const allLevels = pyramidLevels.value.map(l => l.lcx)
  const closest = allLevels.reduce((prev, curr) => {
    return Math.abs(curr - equivalentLCX) < Math.abs(prev - equivalentLCX) ? curr : prev
  })

  return lcx === closest
}

// Format numbers
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  return Math.round(num).toLocaleString('en-US')
}
</script>

<style scoped>
.pyramid-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.info-card {
  padding: 6px;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1729 100%);
  border-radius: 8px;
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.pyramid-card {
  padding: 6px;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1729 100%);
  border-radius: 8px;
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

/* Compact Header */
.compact-header {
  margin-bottom: 4px;
  padding: 4px 6px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  backdrop-filter: blur(10px);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
}

.price-badge {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px 6px;
  border-radius: 3px;
  font-weight: 600;
}

.price-badge.btc {
  background: linear-gradient(135deg, rgba(247, 147, 26, 0.2), rgba(247, 147, 26, 0.1));
  border: 1px solid rgba(247, 147, 26, 0.3);
}

.price-badge.lcx {
  background: linear-gradient(135deg, rgba(16, 235, 4, 0.2), rgba(16, 235, 4, 0.1));
  border: 1px solid rgba(16, 235, 4, 0.3);
}

.price-badge.current {
  background: linear-gradient(135deg, rgba(255, 0, 255, 0.2), rgba(255, 0, 255, 0.1));
  border: 1px solid rgba(255, 0, 255, 0.4);
  gap: 4px;
}

.price-badge.ath-usd {
  background: linear-gradient(135deg, rgba(255, 87, 34, 0.2), rgba(255, 87, 34, 0.1));
  border: 1px solid rgba(255, 87, 34, 0.4);
  gap: 4px;
}

.price-badge.ath-btc {
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.2), rgba(156, 39, 176, 0.1));
  border: 1px solid rgba(156, 39, 176, 0.4);
  gap: 4px;
}

.badge-icon {
  font-size: 9px;
}

.badge-value {
  font-size: 9px;
  font-family: 'Courier New', monospace;
  color: #fbbf24;
}

.badge-label {
  font-size: 7px;
  color: #9ca3af;
  font-weight: 600;
}

.badge-value-small {
  font-size: 8px;
  font-family: 'Courier New', monospace;
  color: #f0abfc;
  font-weight: 700;
}

.badge-conversion {
  font-size: 6px;
  font-family: 'Courier New', monospace;
  color: #60a5fa;
  font-weight: 600;
  margin-left: 1px;
}

.badge-percent {
  font-size: 6px;
  font-weight: 700;
  padding: 1px 3px;
  border-radius: 2px;
  margin-left: 2px;
}

.badge-percent.down {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.badge-percent.up {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.level-info {
  padding: 3px 6px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 3px;
}

.info-text {
  font-size: 7px;
  color: #a5b4fc;
  font-weight: 600;
}

/* Progress Section */
.progress-section {
  display: flex;
  gap: 4px;
  margin: 3px 0;
  padding: 3px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  flex-wrap: wrap;
  justify-content: center;
}

.progress-card {
  flex: 1;
  min-width: 90px;
  max-width: 110px;
  padding: 3px;
  background: rgba(30, 30, 30, 0.5);
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.progress-card:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.progress-header {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-bottom: 2px;
}

.progress-icon {
  font-size: 8px;
}

.progress-title {
  font-size: 7px;
  color: #9ca3af;
  font-weight: 600;
}

.progress-value {
  font-size: 10px;
  font-weight: 700;
  color: #fbbf24;
  margin-bottom: 2px;
  font-family: 'Courier New', monospace;
}

.progress-bar-container {
  width: 100%;
  height: 3px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 1.5px;
  overflow: hidden;
  margin-top: 1px;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.progress-bar-fill.green {
  background: linear-gradient(90deg, #22c55e 0%, #10b981 50%, #059669 100%);
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.6);
}

.progress-bar-fill.orange {
  background: linear-gradient(90deg, #ff5722 0%, #ff6f3c 50%, #ff8a50 100%);
  box-shadow: 0 0 10px rgba(255, 87, 34, 0.6);
}

.progress-bar-fill.violet {
  background: linear-gradient(90deg, #9c27b0 0%, #ab47bc 50%, #ba68c8 100%);
  box-shadow: 0 0 10px rgba(156, 39, 176, 0.6);
}

.progress-bar-fill.cyan {
  background: linear-gradient(90deg, #00d9ff 0%, #00bfea 50%, #00a5d5 100%);
  box-shadow: 0 0 10px rgba(0, 217, 255, 0.6);
}

.progress-bar-fill.gold {
  background: linear-gradient(90deg, #ffd700 0%, #ffed4e 50%, #ffeb3b 100%);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
}

/* Modern Pyramid Grid */
.pyramid-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 8px 4px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  max-height: none;
  overflow-y: hidden;
  overflow-x: hidden;
}

/* Custom scrollbar */
.pyramid-grid::-webkit-scrollbar {
  width: 4px;
}

.pyramid-grid::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
}

.pyramid-grid::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.5);
  border-radius: 2px;
}

.pyramid-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.7);
}

.pyramid-level {
  position: relative;
  height: 2.5px;
  border-radius: 1px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 3px;
}

.pyramid-level:hover {
  height: 5px;
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.6);
  transform: scaleX(1.02);
  z-index: 10;
}

.pyramid-level.highlight-level {
  border-width: 1.5px;
  border-style: solid;
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.3);
}

.pyramid-level.current-level {
  height: 6px;
  border: 2px solid #ff00ff;
  box-shadow: 0 0 25px rgba(255, 0, 255, 0.8), 0 0 40px rgba(255, 0, 255, 0.4);
  animation: pulse 2s infinite;
  z-index: 15;
}

.pyramid-level.ath-usd-level {
  height: 6px;
  border: 2px solid #ff5722;
  box-shadow: 0 0 25px rgba(255, 87, 34, 0.8), 0 0 40px rgba(255, 87, 34, 0.4);
  animation: pulseAthUsd 2s infinite;
  z-index: 14;
}

.pyramid-level.ath-btc-level {
  height: 6px;
  border: 2px solid #9c27b0;
  box-shadow: 0 0 25px rgba(156, 39, 176, 0.8), 0 0 40px rgba(156, 39, 176, 0.4);
  animation: pulseAthBtc 2s infinite;
  z-index: 13;
}

.pyramid-level.ath-usd-dynamic-level {
  height: 6px;
  border: 2px solid #00d9ff;
  box-shadow: 0 0 25px rgba(0, 217, 255, 0.8), 0 0 40px rgba(0, 217, 255, 0.4);
  animation: pulseAthUsdDynamic 2s infinite;
  z-index: 12;
}

.pyramid-level.ath-btc-dynamic-level {
  height: 6px;
  border: 2px solid #ffd700;
  box-shadow: 0 0 25px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.4);
  animation: pulseAthBtcDynamic 2s infinite;
  z-index: 11;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 25px rgba(255, 0, 255, 0.8), 0 0 40px rgba(255, 0, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 35px rgba(255, 0, 255, 1), 0 0 60px rgba(255, 0, 255, 0.6);
  }
}

@keyframes pulseAthUsd {
  0%, 100% {
    box-shadow: 0 0 25px rgba(255, 87, 34, 0.8), 0 0 40px rgba(255, 87, 34, 0.4);
  }
  50% {
    box-shadow: 0 0 35px rgba(255, 87, 34, 1), 0 0 60px rgba(255, 87, 34, 0.6);
  }
}

@keyframes pulseAthBtc {
  0%, 100% {
    box-shadow: 0 0 25px rgba(156, 39, 176, 0.8), 0 0 40px rgba(156, 39, 176, 0.4);
  }
  50% {
    box-shadow: 0 0 35px rgba(156, 39, 176, 1), 0 0 60px rgba(156, 39, 176, 0.6);
  }
}

@keyframes pulseAthUsdDynamic {
  0%, 100% {
    box-shadow: 0 0 25px rgba(0, 217, 255, 0.8), 0 0 40px rgba(0, 217, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 35px rgba(0, 217, 255, 1), 0 0 60px rgba(0, 217, 255, 0.6);
  }
}

@keyframes pulseAthBtcDynamic {
  0%, 100% {
    box-shadow: 0 0 25px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.4);
  }
  50% {
    box-shadow: 0 0 35px rgba(255, 215, 0, 1), 0 0 60px rgba(255, 215, 0, 0.6);
  }
}

.current-indicator {
  position: absolute;
  left: -80px;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #ff00ff;
  border-radius: 50%;
  animation: pulseDot 1.5s infinite;
}

@keyframes pulseDot {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}

.current-text {
  font-size: 8px;
  font-weight: 700;
  color: #ff00ff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: 0 0 10px rgba(255, 0, 255, 0.6);
}

.ath-indicator {
  position: absolute;
  right: -120px;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.ath-indicator.ath-usd {
  right: -110px;
}

.ath-indicator.ath-btc {
  right: -140px;
}

.ath-indicator.left-indicator {
  left: -170px;
  right: auto;
}

.ath-emoji {
  font-size: 10px;
  margin-right: 4px;
  display: inline-block;
}

.pulse-dot.ath-usd-dot {
  background: #ff5722;
  animation: pulseDotAthUsd 1.5s infinite;
}

.pulse-dot.ath-btc-dot {
  background: #9c27b0;
  animation: pulseDotAthBtc 1.5s infinite;
}

.pulse-dot.ath-usd-dynamic-dot {
  background: #00d9ff;
  animation: pulseDotAthUsdDynamic 1.5s infinite;
}

.pulse-dot.ath-btc-dynamic-dot {
  background: #ffd700;
  animation: pulseDotAthBtcDynamic 1.5s infinite;
}

@keyframes pulseDotAthUsd {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}

@keyframes pulseDotAthBtc {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}

@keyframes pulseDotAthUsdDynamic {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}

@keyframes pulseDotAthBtcDynamic {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}

.ath-text {
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ath-usd .ath-text {
  color: #ff5722;
  text-shadow: 0 0 10px rgba(255, 87, 34, 0.6);
}

.ath-btc .ath-text {
  color: #9c27b0;
  text-shadow: 0 0 10px rgba(156, 39, 176, 0.6);
}

.ath-usd-dynamic .ath-text {
  color: #00d9ff;
  text-shadow: 0 0 10px rgba(0, 217, 255, 0.6);
}

.ath-btc-dynamic .ath-text {
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
}

.level-number {
  font-size: 5px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
  opacity: 0;
  transition: opacity 0.2s;
}

.pyramid-level:hover .level-number {
  opacity: 1;
}

/* Tooltip */
.level-tooltip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, rgba(17, 24, 39, 0.98), rgba(31, 41, 55, 0.98));
  border: 2px solid rgba(99, 102, 241, 0.5);
  border-radius: 10px;
  padding: 10px 14px;
  min-width: 240px;
  z-index: 100;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  animation: tooltipFadeIn 0.2s ease;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.tooltip-header {
  font-size: 9px;
  font-weight: 700;
  color: #a5b4fc;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  text-align: center;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(99, 102, 241, 0.3);
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  padding: 3px 0;
  font-size: 9px;
}

.tooltip-label {
  color: #9ca3af;
  font-weight: 500;
}

.tooltip-value {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: #e5e7eb;
}

.tooltip-value.btc-color {
  color: #f7931a;
}

.tooltip-value.usd-color {
  color: #10eb04;
}

/* Quick Stats Row */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 12px;
}

.stat-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-box:hover {
  background: rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.stat-box.peak {
  border-color: rgba(239, 68, 68, 0.3);
}

.stat-box.average {
  border-color: rgba(59, 130, 246, 0.3);
}

.stat-box.base {
  border-color: rgba(34, 197, 94, 0.3);
}

.stat-icon {
  font-size: 18px;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 8px;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.4px;
  margin-bottom: 1px;
}

.stat-amount {
  font-size: 9px;
  color: #e5e7eb;
  font-weight: 600;
  margin-bottom: 1px;
}

.stat-price {
  font-size: 9px;
  font-family: 'Courier New', monospace;
  color: #10eb04;
  font-weight: 700;
}

/* Responsive */
@media (max-width: 768px) {
  .pyramid-container {
    padding: 12px;
  }

  .quick-stats {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .header-content {
    flex-direction: column;
    gap: 10px;
  }

  .level-tooltip {
    min-width: 220px;
    padding: 10px 12px;
  }
}

@media (max-width: 480px) {
  .pyramid-grid {
    max-height: 300px;
  }

  .stat-box {
    padding: 8px;
  }

  .stat-icon {
    font-size: 20px;
  }
}
</style>
