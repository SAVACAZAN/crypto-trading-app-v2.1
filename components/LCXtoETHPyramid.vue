<template>
  <div class="pyramid-wrapper">
    <!-- Info Card: Header + Progress -->
    <div class="info-card">
      <!-- Compact Header -->
      <div class="compact-header">
        <div class="header-content">
        <div class="price-badge eth">
          <span class="badge-icon">Ξ</span>
          <span class="badge-value">${{ parseFloat(ethPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
        </div>
        <div class="price-badge lcx">
          <span class="badge-icon">🟢</span>
          <span class="badge-value">${{ currentPrice }}</span>
        </div>
        <div class="price-badge current">
          <span class="badge-icon">📍</span>
          <span class="badge-label">Current:</span>
          <span class="badge-value-small">Ξ{{ currentLcxInETH.toFixed(10) }}</span>
        </div>
        <div class="price-badge ath-usd">
          <span class="badge-icon">🔥</span>
          <span class="badge-label">ATH USD:</span>
          <span class="badge-value-small">$0.564</span>
          <span class="badge-conversion">(Ξ{{ athUsdInETH.toFixed(8) }})</span>
          <span class="badge-percent down">-80.0%</span>
        </div>
        <div class="price-badge ath-eth">
          <span class="badge-icon">⚡</span>
          <span class="badge-label">ATH ETH:</span>
          <span class="badge-value-small">Ξ0.0001433</span>
          <span class="badge-conversion">(${{ athEthInUSD.toFixed(4) }})</span>
          <span class="badge-percent down">-80.0%</span>
        </div>
        <div class="level-info">
          <span class="info-text">{{ pyramidLevels.length }} levels • 1K → 200K LCX</span>
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
          <span class="progress-title">Base → ATH ETH</span>
        </div>
        <div class="progress-value">{{ progressBaseToAthEth.toFixed(1) }}%</div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill violet" :style="{ width: progressBaseToAthEth + '%' }"></div>
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
          <span class="progress-title">Current → ATH ETH</span>
        </div>
        <div class="progress-value">{{ progressCurrentToAthEth.toFixed(1) }}%</div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill gold" :style="{ width: progressCurrentToAthEth + '%' }"></div>
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
          'ath-eth-level': isAthEthLevel(level.lcx),
          'ath-usd-dynamic-level': isAthUsdDynamicLevel(level.lcx),
          'ath-eth-dynamic-level': isAthEthDynamicLevel(level.lcx)
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

        <!-- ATH ETH Indicator -->
        <div v-if="isAthEthLevel(level.lcx)" class="ath-indicator ath-eth">
          <span class="pulse-dot ath-eth-dot"></span>
          <span class="ath-text">ATH ETH Ξ0.0001433</span>
        </div>

        <!-- ATH USD Dynamic Indicator (moves with ETH price) - LEFT SIDE -->
        <div v-if="isAthUsdDynamicLevel(level.lcx)" class="ath-indicator ath-usd-dynamic left-indicator">
          <span class="ath-emoji">🔥</span>
          <span class="ath-text">ATH USD→ETH Ξ{{ athUsdInETH.toFixed(8) }}</span>
        </div>

        <!-- ATH ETH Dynamic Indicator (moves with ETH price) - LEFT SIDE -->
        <div v-if="isAthEthDynamicLevel(level.lcx)" class="ath-indicator ath-eth-dynamic left-indicator">
          <span class="ath-emoji">⚡</span>
          <span class="ath-text">ATH ETH→USD ${{ athEthInUSD.toFixed(4) }}</span>
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
            <span class="tooltip-label">1 LCX in ETH:</span>
            <span class="tooltip-value eth-color">Ξ{{ level.eth.toFixed(10) }}</span>
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
  ethPrice: {
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
const ATH_ETH = 0.0001433 // ATH in ETH

// Calculate current LCX price in ETH
const currentLcxInETH = computed(() => {
  const currentLcxPrice = parseFloat(props.currentPrice)
  const ethPriceUsd = parseFloat(props.ethPrice)
  return currentLcxPrice / ethPriceUsd
})

// Calculate equivalent LCX amount for current price (1 ETH / currentLcxInETH)
const currentEquivalentLCX = computed(() => {
  return 1 / currentLcxInETH.value
})

// Calculate equivalent LCX amount for ATH USD
const athUsdEquivalentLCX = computed(() => {
  const ethPriceUsd = parseFloat(props.ethPrice)
  const athUsdInETH = ATH_USD / ethPriceUsd
  return 1 / athUsdInETH
})

// Calculate equivalent LCX amount for ATH ETH
const athEthEquivalentLCX = computed(() => {
  return 1 / ATH_ETH
})

// Calculate ATH USD in ETH at current ETH price
const athUsdInETH = computed(() => {
  const ethPriceUsd = parseFloat(props.ethPrice)
  return ATH_USD / ethPriceUsd
})

// Calculate ATH ETH in USD at current ETH price
const athEthInUSD = computed(() => {
  const ethPriceUsd = parseFloat(props.ethPrice)
  return ATH_ETH * ethPriceUsd
})

// Progress from Base (50K) to Current Position (based on level index)
const progressBaseToCurrent = computed(() => {
  const currentLCX = 1 / currentLcxInETH.value
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

  const totalLevels = levels.length - 1
  const progress = ((totalLevels - athUsdLevelIndex) / totalLevels) * 100
  return Math.max(0, Math.min(100, progress))
})

// Progress from Base to ATH ETH (based on level index)
const progressBaseToAthEth = computed(() => {
  const athEthLCX = athEthEquivalentLCX.value
  const levels = pyramidLevels.value

  let athEthLevelIndex = 0
  let minDistance = Infinity

  levels.forEach((level, index) => {
    const distance = Math.abs(level.lcx - athEthLCX)
    if (distance < minDistance) {
      minDistance = distance
      athEthLevelIndex = index
    }
  })

  const totalLevels = levels.length - 1
  const progress = ((totalLevels - athEthLevelIndex) / totalLevels) * 100
  return Math.max(0, Math.min(100, progress))
})

// Progress from Current to ATH USD (based on level index difference)
const progressCurrentToAthUsd = computed(() => {
  const currentLCX = 1 / currentLcxInETH.value
  const athUsdLCX = athUsdEquivalentLCX.value
  const levels = pyramidLevels.value

  let currentLevelIndex = 0
  let minDistanceCurrent = Infinity
  levels.forEach((level, index) => {
    const distance = Math.abs(level.lcx - currentLCX)
    if (distance < minDistanceCurrent) {
      minDistanceCurrent = distance
      currentLevelIndex = index
    }
  })

  let athUsdLevelIndex = 0
  let minDistanceAth = Infinity
  levels.forEach((level, index) => {
    const distance = Math.abs(level.lcx - athUsdLCX)
    if (distance < minDistanceAth) {
      minDistanceAth = distance
      athUsdLevelIndex = index
    }
  })

  if (currentLevelIndex <= athUsdLevelIndex) {
    return 100
  }

  const totalLevels = levels.length - 1
  const distanceFromBaseToCurrent = totalLevels - currentLevelIndex
  const distanceFromBaseToAth = totalLevels - athUsdLevelIndex

  if (distanceFromBaseToAth === 0) return 0
  const progress = (distanceFromBaseToCurrent / distanceFromBaseToAth) * 100
  return Math.max(0, Math.min(100, progress))
})

// Progress from Current to ATH ETH (based on level index difference)
const progressCurrentToAthEth = computed(() => {
  const currentLCX = 1 / currentLcxInETH.value
  const athEthLCX = athEthEquivalentLCX.value
  const levels = pyramidLevels.value

  let currentLevelIndex = 0
  let minDistanceCurrent = Infinity
  levels.forEach((level, index) => {
    const distance = Math.abs(level.lcx - currentLCX)
    if (distance < minDistanceCurrent) {
      minDistanceCurrent = distance
      currentLevelIndex = index
    }
  })

  let athEthLevelIndex = 0
  let minDistanceAth = Infinity
  levels.forEach((level, index) => {
    const distance = Math.abs(level.lcx - athEthLCX)
    if (distance < minDistanceAth) {
      minDistanceAth = distance
      athEthLevelIndex = index
    }
  })

  if (currentLevelIndex <= athEthLevelIndex) {
    return 100
  }

  const totalLevels = levels.length - 1
  const distanceFromBaseToCurrent = totalLevels - currentLevelIndex
  const distanceFromBaseToAth = totalLevels - athEthLevelIndex

  if (distanceFromBaseToAth === 0) return 0
  const progress = (distanceFromBaseToCurrent / distanceFromBaseToAth) * 100
  return Math.max(0, Math.min(100, progress))
})

// Generate ETH pyramid levels from 1K to 200K (separate from BTC)
const pyramidLevels = computed(() => {
  const ethPriceUsd = parseFloat(props.ethPrice)

  // Generate levels from 1000 to 200000
  const levels = []

  // 1K to 10K (increments of 1K) - 10 levels
  for (let i = 1; i <= 10; i++) {
    levels.push(i * 1000)
  }

  // 15K to 50K (increments of 5K) - 8 levels
  for (let i = 3; i <= 10; i++) {
    levels.push(i * 5000)
  }

  // 60K to 100K (increments of 10K) - 5 levels
  for (let i = 6; i <= 10; i++) {
    levels.push(i * 10000)
  }

  // 120K to 200K (increments of 20K) - 5 levels
  for (let i = 6; i <= 10; i++) {
    levels.push(i * 20000)
  }

  return levels.map((lcx, index) => {
    // Same formula as BTC: 1 LCX = (1/lcx) ETH
    // This means: at level 50000, you need 50000 LCX to have 1 ETH worth
    const lcxPriceInETH = 1 / lcx
    const lcxPriceInUSD = lcxPriceInETH * ethPriceUsd

    return {
      lcx,
      usd: lcxPriceInUSD,
      eth: lcxPriceInETH,
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

const averagePriceETH = computed(() => {
  if (pyramidLevels.value.length === 0) return 0
  const sum = pyramidLevels.value.reduce((acc, level) => acc + level.eth, 0)
  return sum / pyramidLevels.value.length
})

// Get dynamic style for each level
const getLevelStyle = (index) => {
  const totalLevels = pyramidLevels.value.length
  const progress = index / totalLevels

  // Color gradient from purple (top) to cyan (bottom) for ETH theme
  const hue = 260 + (progress * 100) // 260 (purple) to 360 (cyan)
  const saturation = 70 + (progress * 30)
  const lightness = 30 + (Math.sin(progress * Math.PI) * 20)

  const width = 20 + (progress * 80)

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

// Check if this is the current level
const isCurrentLevel = (lcx) => {
  const equivalentLCX = 1 / currentLcxInETH.value
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

// Check if this is the ATH ETH level
const isAthEthLevel = (lcx) => {
  const allLevels = pyramidLevels.value.map(l => l.lcx)
  const closest = allLevels.reduce((prev, curr) => {
    return Math.abs(curr - athEthEquivalentLCX.value) < Math.abs(prev - athEthEquivalentLCX.value) ? curr : prev
  })
  return lcx === closest
}

// Check if this is the ATH USD Dynamic level
const isAthUsdDynamicLevel = (lcx) => {
  const equivalentLCX = athUsdEquivalentLCX.value
  const allLevels = pyramidLevels.value.map(l => l.lcx)
  const closest = allLevels.reduce((prev, curr) => {
    return Math.abs(curr - equivalentLCX) < Math.abs(prev - equivalentLCX) ? curr : prev
  })
  return lcx === closest
}

// Check if this is the ATH ETH Dynamic level
const isAthEthDynamicLevel = (lcx) => {
  const ethPriceUsd = parseFloat(props.ethPrice)
  const athEthInUsd = ATH_ETH * ethPriceUsd
  const athEthInEthAgain = athEthInUsd / ethPriceUsd
  const equivalentLCX = 1 / athEthInEthAgain
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
  background: linear-gradient(135deg, #1a0e27 0%, #2a1f3a 50%, #1f1729 100%);
  border-radius: 8px;
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.pyramid-card {
  padding: 6px;
  background: linear-gradient(135deg, #1a0e27 0%, #2a1f3a 50%, #1f1729 100%);
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

.price-badge.eth {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1));
  border: 1px solid rgba(139, 92, 246, 0.3);
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

.price-badge.ath-eth {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1));
  border: 1px solid rgba(139, 92, 246, 0.4);
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
  max-height: 450px;
  overflow-y: auto;
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
  background: rgba(139, 92, 246, 0.5);
  border-radius: 2px;
}

.pyramid-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.7);
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
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.6);
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

.pyramid-level.ath-eth-level {
  height: 6px;
  border: 2px solid #8b5cf6;
  box-shadow: 0 0 25px rgba(139, 92, 246, 0.8), 0 0 40px rgba(139, 92, 246, 0.4);
  animation: pulseAthEth 2s infinite;
  z-index: 13;
}

.pyramid-level.ath-usd-dynamic-level {
  height: 6px;
  border: 2px solid #00d9ff;
  box-shadow: 0 0 25px rgba(0, 217, 255, 0.8), 0 0 40px rgba(0, 217, 255, 0.4);
  animation: pulseAthUsdDynamic 2s infinite;
  z-index: 12;
}

.pyramid-level.ath-eth-dynamic-level {
  height: 6px;
  border: 2px solid #ffd700;
  box-shadow: 0 0 25px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.4);
  animation: pulseAthEthDynamic 2s infinite;
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

@keyframes pulseAthEth {
  0%, 100% {
    box-shadow: 0 0 25px rgba(139, 92, 246, 0.8), 0 0 40px rgba(139, 92, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 35px rgba(139, 92, 246, 1), 0 0 60px rgba(139, 92, 246, 0.6);
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

@keyframes pulseAthEthDynamic {
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

.ath-indicator.ath-eth {
  right: -160px;
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

.pulse-dot.ath-eth-dot {
  background: #8b5cf6;
  animation: pulseDotAthEth 1.5s infinite;
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

@keyframes pulseDotAthEth {
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

.ath-eth .ath-text {
  color: #8b5cf6;
  text-shadow: 0 0 10px rgba(139, 92, 246, 0.6);
}

.ath-usd-dynamic .ath-text {
  color: #00d9ff;
  text-shadow: 0 0 10px rgba(0, 217, 255, 0.6);
}

.ath-eth-dynamic .ath-text {
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
  border: 2px solid rgba(139, 92, 246, 0.5);
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
  border-bottom: 1px solid rgba(139, 92, 246, 0.3);
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

.tooltip-value.eth-color {
  color: #8b5cf6;
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
  border-color: rgba(139, 92, 246, 0.3);
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
