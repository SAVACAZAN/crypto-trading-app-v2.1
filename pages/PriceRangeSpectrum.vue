<template>
  <div class="spectrum-root" :style="{ width: width + 'px' }">
    <svg :width="width" :height="height" viewBox="0 0 400 800" class="spectrum-svg">
      <!-- defs: gradient stops based on levels -->
      <defs>
        <linearGradient id="verticalGradient" x1="0" y1="0" x2="0" y2="1">
          <stop
            v-for="(s, i) in gradientStops"
            :key="i"
            :offset="(s.offset*100) + '%'"
            :stop-color="s.color"
            :stop-opacity="1"
          />
        </linearGradient>
        
        <!-- Modern glow effects -->
        <filter id="modernGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        <!-- Gradient for current price indicator -->
        <linearGradient id="currentPriceGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#3b82f6"/>
          <stop offset="100%" stop-color="#60a5fa"/>
        </linearGradient>
        
        <!-- Glass morphism effect -->
        <filter id="glassEffect">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
          <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0" result="glass"/>
        </filter>
      </defs>

      <!-- Background with modern gradient -->
      <rect x="0" y="0" :width="width" :height="height" rx="16" fill="url(#backgroundGradient)"/>
      
      <!-- Glass morphism overlay -->
      <rect x="8" y="8" :width="width-16" :height="height-16" rx="12" fill="white" opacity="0.03" filter="url(#glassEffect)"/>

      <!-- Main content group -->
      <g :transform="'translate(' + leftPad + ', ' + topPad + ')'">
        
        <!-- Gradient bar with modern styling -->
        <rect
          :x="0"
          :y="0"
          :width="barW"
          :height="barH"
          rx="12"
          fill="url(#verticalGradient)"
          stroke="rgba(255,255,255,0.1)"
          stroke-width="1"
          filter="url(#modernGlow)"
          class="gradient-bar"
        />
        
        <!-- Zone labels on the bar -->
        <g v-for="zone in zoneMarkers" :key="zone.name">
          <rect
            :x="-42"
            :y="zone.yPosition - 12"
            width="36"
            height="24"
            rx="6"
            :fill="zone.color"
            opacity="0.9"
          />
          <text
            :x="-24"
            :y="zone.yPosition + 4"
            font-size="10"
            font-weight="600"
            fill="white"
            text-anchor="middle"
            style="font-family: 'Inter', sans-serif;"
          >
            {{ zone.name }}
          </text>
        </g>

        <!-- Price levels with modern design -->
        <g v-for="(lvl, idx) in visibleLevels" :key="lvl.id">
          <circle
            :cx="barW + 8"
            :cy="priceToY(lvl.price)"
            r="4"
            :fill="zoneColor(lvl.zone)"
            stroke="white"
            stroke-width="1.5"
            class="level-marker"
          />
          <g class="level-label" :opacity="0.9">
            <rect
              :x="barW + 16"
              :y="priceToY(lvl.price) - 14"
              :width="getLabelWidth(lvl)"
              height="20"
              rx="8"
              :fill="getZoneBackground(lvl.zone)"
              stroke="rgba(255,255,255,0.2)"
              stroke-width="0.5"
            />
            <text
              :x="barW + 24"
              :y="priceToY(lvl.price)"
              font-size="11"
              font-weight="500"
              fill="white"
              style="font-family: 'Inter', sans-serif;"
            >
              {{ lvl.label }} • {{ formatPrice(lvl.price) }}
            </text>
          </g>
        </g>

        <!-- Current price line with modern design -->
        <g v-if="currentPrice !== null" class="current-price-group">
          <!-- Glow effect -->
          <line
            :x1="-10" :x2="barW + 180"
            :y1="priceToY(currentPrice)" :y2="priceToY(currentPrice)"
            stroke="#3b82f6" stroke-width="8"
            opacity="0.2"
            filter="url(#modernGlow)"
          />
          <!-- Main line -->
          <line
            :x1="-6" :x2="barW + 180"
            :y1="priceToY(currentPrice)" :y2="priceToY(currentPrice)"
            stroke="url(#currentPriceGradient)" stroke-width="2"
          />
          <!-- Indicator dot -->
          <circle
            :cx="barW + 8"
            :cy="priceToY(currentPrice)"
            r="6"
            fill="url(#currentPriceGradient)"
            stroke="white"
            stroke-width="2"
          />
          <!-- Price card -->
          <g class="current-price-card">
            <rect
              :x="barW + 20"
              :y="priceToY(currentPrice) - 20"
              width="140"
              height="40"
              rx="12"
              fill="rgba(59, 130, 246, 0.95)"
              stroke="rgba(255,255,255,0.3)"
              stroke-width="1"
            />
            <g>
              <text
                :x="barW + 30"
                :y="priceToY(currentPrice) - 3"
                font-size="10"
                fill="rgba(255,255,255,0.8)"
                style="font-family: 'Inter', sans-serif; font-weight: 500;"
              >
                CURRENT PRICE
              </text>
              <text
                :x="barW + 30"
                :y="priceToY(currentPrice) + 12"
                font-size="14"
                fill="white"
                style="font-family: 'Inter', sans-serif; font-weight: 700;"
              >
                {{ formatPrice(currentPrice) }} BTC
              </text>
            </g>
            <circle
              :cx="barW + 145"
              :cy="priceToY(currentPrice)"
              r="4"
              fill="#86efac"
            >
              <animate
                attributeName="r"
                values="4;6;4"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        </g>

        <!-- Range indicators -->
        <g class="range-indicators">
          <g v-for="range in rangeData" :key="range.name">
            <rect
              :x="barW + 160"
              :y="range.yPosition - 25"
              width="120"
              height="50"
              rx="12"
              :fill="range.background"
              stroke="rgba(255,255,255,0.1)"
              stroke-width="1"
              opacity="0.9"
            />
            <text
              :x="barW + 220"
              :y="range.yPosition - 8"
              font-size="10"
              font-weight="600"
              fill="white"
              text-anchor="middle"
              style="font-family: 'Inter', sans-serif;"
            >
              {{ range.name }} RANGE
            </text>
            <text
              :x="barW + 220"
              :y="range.yPosition + 8"
              font-size="11"
              font-weight="500"
              :fill="range.color"
              text-anchor="middle"
              style="font-family: 'Inter', sans-serif;"
            >
              {{ formatPrice(range.low) }} - {{ formatPrice(range.high) }}
            </text>
          </g>
        </g>
      </g>

      <!-- Header -->
      <g class="header">
        <rect x="0" y="0" :width="width" height="60" rx="16" fill="rgba(15, 23, 42, 0.8)"/>
        <text x="20" y="35" font-size="18" font-weight="700" fill="white" style="font-family: 'Inter', sans-serif;">
          📊 LCX Price Spectrum
        </text>
        <text x="20" y="52" font-size="12" fill="#94a3b8" style="font-family: 'Inter', sans-serif;">
          Real-time market zones & levels
        </text>
      </g>

      <!-- Footer stats -->
      <g class="footer-stats">
        <rect x="0" :y="height - 40" :width="width" height="40" rx="0 0 16 16" fill="rgba(15, 23, 42, 0.6)"/>
        <text x="20" :y="height - 20" font-size="11" fill="#94a3b8" style="font-family: 'Inter', sans-serif;">
          Range: {{ formatPrice(minPrice) }} - {{ formatPrice(maxPrice) }}
        </text>
        <text :x="width - 20" :y="height - 20" font-size="11" fill="#94a3b8" text-anchor="end" style="font-family: 'Inter', sans-serif;">
          Updated: {{ currentTime }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  levels: { type: Array, default: () => [
    { id: 'ATL', label: 'ATL', price: 0.0000001, zone: 'buy' },
    { id: 'L1', label: 'L1', price: 0.0000001, zone: 'buy' },
    { id: 'L2', label: 'L2', price: 0.0000002, zone: 'buy' },
    { id: 'L3', label: 'L3', price: 0.0000003, zone: 'buy' },
    { id: 'L4', label: 'L4', price: 0.0000004, zone: 'buy' },
    { id: 'L5', label: 'L5', price: 0.0000005, zone: 'buy' },
    { id: 'L6', label: 'L6', price: 0.0000006, zone: 'buy' },
    { id: 'L7', label: 'L7', price: 0.0000007, zone: 'neutral' },
    { id: 'L8', label: 'L8', price: 0.0000008, zone: 'neutral' },
    { id: 'L9', label: 'L9', price: 0.000001, zone: 'sell' },
    { id: 'L10', label: 'L10', price: 0.0000012, zone: 'sell' },
    { id: 'L11', label: 'L11', price: 0.0000014, zone: 'sell' },
    { id: 'L12', label: 'L12', price: 0.0000016, zone: 'sell' },
    { id: 'L13', label: 'L13', price: 0.0000018, zone: 'sell' },
    { id: 'L14', label: 'L14', price: 0.000002, zone: 'sell' },
    { id: 'L15', label: 'L15', price: 0.0000025, zone: 'sell' },
    { id: 'L16', label: 'L16', price: 0.000003, zone: 'sell' },
    { id: 'L17', label: 'L17', price: 0.000004, zone: 'sell' },
    { id: 'L18', label: 'L18', price: 0.000005, zone: 'sell' },
    { id: 'L19', label: 'L19', price: 0.000006, zone: 'sell' },
    { id: 'ATH', label: 'ATH', price: 0.000008, zone: 'ath' },
  ]},
  currentPrice: { type: Number, default: 0.00000099 },
  minPrice: { type: Number, default: null },
  maxPrice: { type: Number, default: null },
  width: { type: Number, default: 400 },
  height: { type: Number, default: 800 }
})

/* Reactive data */
const currentTime = ref('')

/* Layout */
const leftPad = 24
const topPad = 80
const barW = 48
const barH = props.height - topPad - 60

/* Computed values */
const levelsSorted = computed(() => {
  return [...props.levels].sort((a,b) => b.price - a.price)
})

const maxPrice = computed(() => {
  return props.maxPrice !== null ? props.maxPrice : Math.max(...props.levels.map(l => l.price))
})

const minPrice = computed(() => {
  return props.minPrice !== null ? props.minPrice : Math.min(...props.levels.map(l => l.price))
})

const currentPrice = computed(() => props.currentPrice)

// Filter levels to avoid overcrowding
const visibleLevels = computed(() => {
  return levelsSorted.value.filter((level, index, array) => {
    // Show every 3rd level or important ones (ATL, ATH)
    if (level.id === 'ATL' || level.id === 'ATH') return true
    return index % 3 === 0
  })
})

// Zone markers for the gradient bar
const zoneMarkers = computed(() => {
  const zones = [
    { name: 'BUY', color: '#10b981', price: minPrice.value },
    { name: 'NEUTRAL', color: '#f59e0b', price: (minPrice.value + maxPrice.value) * 0.3 },
    { name: 'SELL', color: '#ef4444', price: maxPrice.value * 0.7 }
  ]
  
  return zones.map(zone => ({
    ...zone,
    yPosition: priceToY(zone.price)
  }))
})

// Range data for the right side indicators
const rangeData = computed(() => {
  const buyLevels = props.levels.filter(l => l.zone === 'buy')
  const neutralLevels = props.levels.filter(l => l.zone === 'neutral')
  const sellLevels = props.levels.filter(l => l.zone === 'sell')
  
  return [
    {
      name: 'BUY',
      low: Math.min(...buyLevels.map(l => l.price)),
      high: Math.max(...buyLevels.map(l => l.price)),
      color: '#10b981',
      background: 'rgba(16, 185, 129, 0.1)',
      yPosition: priceToY((Math.min(...buyLevels.map(l => l.price)) + Math.max(...buyLevels.map(l => l.price))) / 2)
    },
    {
      name: 'NEUTRAL',
      low: Math.min(...neutralLevels.map(l => l.price)),
      high: Math.max(...neutralLevels.map(l => l.price)),
      color: '#f59e0b',
      background: 'rgba(245, 158, 11, 0.1)',
      yPosition: priceToY((Math.min(...neutralLevels.map(l => l.price)) + Math.max(...neutralLevels.map(l => l.price))) / 2)
    },
    {
      name: 'SELL',
      low: Math.min(...sellLevels.map(l => l.price)),
      high: Math.max(...sellLevels.map(l => l.price)),
      color: '#ef4444',
      background: 'rgba(239, 68, 68, 0.1)',
      yPosition: priceToY((Math.min(...sellLevels.map(l => l.price)) + Math.max(...sellLevels.map(l => l.price))) / 2)
    }
  ]
})

/* Functions */
function priceToY(price) {
  const p = Math.max(minPrice.value, Math.min(maxPrice.value, price))
  const ratio = (p - minPrice.value) / (maxPrice.value - minPrice.value)
  const yInGroup = (1 - ratio) * barH
  return Math.round(yInGroup)
}

const zoneColor = (zone) => {
  const colors = {
    'buy': '#10b981',
    'neutral': '#f59e0b', 
    'sell': '#ef4444',
    'ath': '#a855f7'
  }
  return colors[zone] || '#9ca3af'
}

const getZoneBackground = (zone) => {
  const backgrounds = {
    'buy': 'rgba(16, 185, 129, 0.2)',
    'neutral': 'rgba(245, 158, 11, 0.2)',
    'sell': 'rgba(239, 68, 68, 0.2)',
    'ath': 'rgba(168, 85, 247, 0.2)'
  }
  return backgrounds[zone] || 'rgba(156, 163, 175, 0.2)'
}

const getLabelWidth = (level) => {
  const text = `${level.label} • ${formatPrice(level.price)}`
  return Math.max(100, text.length * 7)
}

const gradientStops = computed(() => {
  const uniq = [...props.levels]
    .slice()
    .sort((a,b)=> b.price - a.price)
    .filter((v,i,a)=> i===0 || v.price !== a[i-1].price)

  if (uniq.length === 0) return [{ offset: 0, color: '#fff' }, { offset: 1, color: '#000' }]
  
  const stops = uniq.map(l => {
    const offset = (maxPrice.value - l.price) / (maxPrice.value - minPrice.value)
    return { offset: offset, color: zoneColor(l.zone) }
  })

  if (stops[0].offset > 0.0001) {
    stops.unshift({ offset: 0, color: stops[0].color })
  }
  if (stops[stops.length-1].offset < 0.9999) {
    stops.push({ offset: 1, color: stops[stops.length-1].color })
  }

  stops.sort((a,b)=> a.offset - b.offset)
  return stops
})

const formatPrice = (p) => {
  if (typeof p !== 'number') return String(p)
  const s = p.toFixed(8)
  return s.replace(/\.?0+$/,'')
}

// Update time
const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  updateTime()
  const timer = setInterval(updateTime, 1000)
  onUnmounted(() => clearInterval(timer))
})
</script>

<style scoped>
.spectrum-root {
  display: inline-block;
  user-select: none;
  font-family: 'Inter', sans-serif;
}

.spectrum-svg {
  display: block;
  border-radius: 16px;
  overflow: visible;
  background: linear-gradient(135deg, #0f1724 0%, #1e293b 100%);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.gradient-bar {
  transition: all 0.3s ease;
}

.level-marker {
  transition: all 0.3s ease;
}

.level-marker:hover {
  r: 6;
  filter: url(#modernGlow);
}

.current-price-group {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-2px); }
}

.current-price-card {
  transition: all 0.3s ease;
}

.current-price-card:hover {
  transform: translateX(4px);
}
</style>