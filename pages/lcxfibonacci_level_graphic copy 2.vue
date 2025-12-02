<template>
  <div class="spectrum-container p-6">
    <div class="spectrum-card rounded-2xl p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800 flex items-center">
            <i class="fas fa-chart-line text-blue-500 mr-3"></i>
            LCX Price Range Spectrum
          </h2>
          <p class="text-gray-600 mt-1">Visual representation of buy, neutral, and sell zones</p>
        </div>
        <div class="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
          <div class="text-sm font-medium">Current Price</div>
          <div class="text-xl font-bold">{{ formatPrice(currentPrice) }} BTC</div>
        </div>
      </div>
      
      <!-- Legend -->
      <div class="flex flex-wrap gap-4 mb-6">
        <div class="flex items-center" v-for="zone in zones" :key="zone.name">
          <div class="w-4 h-4 rounded-full mr-2" :class="zone.colorClass"></div>
          <span class="text-sm font-medium">{{ zone.label }}</span>
        </div>
      </div>
      
      <div class="flex flex-col md:flex-row gap-6">
        <!-- Spectrum Visualization -->
        <div class="flex-1">
          <div class="spectrum-wrapper relative h-96 rounded-xl border border-gray-200 overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100">
            <!-- Zones Background -->
            <div class="absolute inset-0 flex flex-col">
              <div 
                v-for="zone in zoneRanges" 
                :key="zone.name"
                class="flex-1 border-b border-white/30 transition-all duration-300 hover:opacity-90"
                :class="zone.backgroundClass"
                :style="{ height: zone.height + '%' }"
              ></div>
            </div>
            
            <!-- Price Levels -->
            <div class="absolute inset-0">
              <div 
                v-for="(level, index) in visibleLevels" 
                :key="level.id" 
                class="absolute left-0 right-0 flex items-center group cursor-pointer"
                :style="{ top: getLevelPosition(level) + '%' }"
                @mouseenter="hoveredLevel = level"
                @mouseleave="hoveredLevel = null"
              >
                <div 
                  class="w-3 h-3 rounded-full border-2 border-white shadow-md transition-all duration-200 group-hover:scale-125"
                  :class="getLevelColor(level)"
                ></div>
                <div class="ml-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg border border-gray-200 transform transition-all duration-200 group-hover:scale-105 opacity-0 group-hover:opacity-100">
                  <div class="font-bold">{{ level.label }}</div>
                  <div class="text-gray-600">{{ formatPrice(level.price) }}</div>
                  <div class="text-xs mt-1 capitalize" :class="getZoneTextColor(level.zone)">{{ level.zone }} zone</div>
                </div>
              </div>
            </div>
            
            <!-- Current Price Line -->
            <div 
              class="price-line absolute left-0 right-0 h-0.5 bg-blue-500 transition-all duration-500"
              :style="{ top: getCurrentPricePosition() + '%' }"
            >
              <div class="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-lg animate-pulse">
                <div class="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <div class="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-bold whitespace-nowrap">
                {{ formatPrice(currentPrice) }}
              </div>
            </div>
            
            <!-- Range Indicators -->
            <div class="absolute left-4 top-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200">
              <div class="text-xs font-semibold text-gray-500 mb-1">BUY RANGE</div>
              <div class="text-sm font-bold text-green-600">{{ formatPrice(buyRange.lower) }} - {{ formatPrice(buyRange.upper) }}</div>
              <div class="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div class="bg-green-500 h-1.5 rounded-full" :style="{ width: buyRange.percentage + '%' }"></div>
              </div>
            </div>
            
            <div class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200">
              <div class="text-xs font-semibold text-gray-500 mb-1">NEUTRAL RANGE</div>
              <div class="text-sm font-bold text-amber-600">{{ formatPrice(neutralRange.lower) }} - {{ formatPrice(neutralRange.upper) }}</div>
              <div class="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div class="bg-amber-500 h-1.5 rounded-full" :style="{ width: neutralRange.percentage + '%' }"></div>
              </div>
            </div>
            
            <div class="absolute left-4 bottom-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200">
              <div class="text-xs font-semibold text-gray-500 mb-1">SELL RANGE</div>
              <div class="text-sm font-bold text-red-600">{{ formatPrice(sellRange.lower) }} - {{ formatPrice(sellRange.upper) }}</div>
              <div class="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div class="bg-red-500 h-1.5 rounded-full" :style="{ width: sellRange.percentage + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Details Panel -->
        <div class="md:w-80 bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h3 class="font-bold text-gray-800 mb-4 flex items-center">
            <i class="fas fa-info-circle text-blue-500 mr-2"></i>
            Zone Details & Analytics
          </h3>
          
          <div class="space-y-4">
            <div 
              v-for="zone in zoneDetails" 
              :key="zone.name"
              class="range-indicator bg-white rounded-xl p-4 shadow-sm border-l-4 transition-all duration-300 hover:shadow-md"
              :class="zone.borderClass"
            >
              <div class="flex justify-between items-center">
                <span class="font-medium" :class="zone.textClass">{{ zone.label }}</span>
                <i class="text-xl" :class="zone.icon"></i>
              </div>
              <div class="text-xs text-gray-600 mt-1">{{ zone.description }}</div>
              <div class="text-sm font-semibold mt-2">{{ zone.range }}</div>
              <div class="flex justify-between items-center mt-2">
                <span class="text-xs text-gray-500">{{ zone.levels }} levels</span>
                <span class="text-xs font-medium px-2 py-1 rounded-full" :class="zone.badgeClass">
                  {{ zone.percentage }}%
                </span>
              </div>
            </div>
          </div>
          
          <!-- Current Price Analytics -->
          <div class="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4 shadow-lg">
            <div class="flex justify-between items-center mb-3">
              <div>
                <div class="text-sm font-medium">Current Position</div>
                <div class="text-xl font-bold">{{ formatPrice(currentPrice) }}</div>
              </div>
              <i class="fas fa-bolt text-yellow-300 text-2xl"></i>
            </div>
            
            <div class="flex items-center justify-between text-sm">
              <span>Distance to Buy Zone:</span>
              <span class="font-semibold">{{ calculateDistanceToZone('buy') }}%</span>
            </div>
            <div class="flex items-center justify-between text-sm mt-1">
              <span>Distance to Sell Zone:</span>
              <span class="font-semibold">{{ calculateDistanceToZone('sell') }}%</span>
            </div>
            
            <div class="mt-3 text-xs bg-blue-400/30 rounded-lg p-2">
              In <span class="font-semibold">{{ getCurrentZone().label }}</span> - {{ getCurrentZone().advice }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Additional Stats -->
      <div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div class="text-sm text-gray-500">Total Range</div>
          <div class="text-lg font-bold text-gray-800">{{ formatPrice(minPrice) }} - {{ formatPrice(maxPrice) }}</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div class="text-sm text-gray-500">Price Change</div>
          <div class="text-lg font-bold text-green-500">+2.34%</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div class="text-sm text-gray-500">Volatility</div>
          <div class="text-lg font-bold text-amber-500">Medium</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div class="text-sm text-gray-500">Last Update</div>
          <div class="text-lg font-bold text-gray-800">{{ lastUpdate }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const levels = ref([
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
])

const currentPrice = ref(0.00000099)
const hoveredLevel = ref(null)
const lastUpdate = ref('')

const maxPrice = computed(() => Math.max(...levels.value.map(l => l.price)))
const minPrice = computed(() => Math.min(...levels.value.map(l => l.price)))

// Zone definitions
const zones = computed(() => [
  { name: 'buy', label: 'Buy Zone', colorClass: 'bg-green-500' },
  { name: 'neutral', label: 'Neutral Zone', colorClass: 'bg-amber-500' },
  { name: 'sell', label: 'Sell Zone', colorClass: 'bg-red-500' },
  { name: 'ath', label: 'ATH Zone', colorClass: 'bg-orange-500' }
])

// Zone ranges with calculations
const buyRange = computed(() => {
  const buyLevels = levels.value.filter(l => l.zone === 'buy')
  return {
    lower: Math.min(...buyLevels.map(l => l.price)),
    upper: Math.max(...buyLevels.map(l => l.price)),
    percentage: ((Math.max(...buyLevels.map(l => l.price)) - minPrice.value) / (maxPrice.value - minPrice.value)) * 100
  }
})

const neutralRange = computed(() => {
  const neutralLevels = levels.value.filter(l => l.zone === 'neutral')
  return {
    lower: Math.min(...neutralLevels.map(l => l.price)),
    upper: Math.max(...neutralLevels.map(l => l.price)),
    percentage: ((Math.max(...neutralLevels.map(l => l.price)) - Math.min(...neutralLevels.map(l => l.price))) / (maxPrice.value - minPrice.value)) * 100
  }
})

const sellRange = computed(() => {
  const sellLevels = levels.value.filter(l => l.zone === 'sell')
  return {
    lower: Math.min(...sellLevels.map(l => l.price)),
    upper: Math.max(...sellLevels.map(l => l.price)),
    percentage: ((maxPrice.value - Math.min(...sellLevels.map(l => l.price))) / (maxPrice.value - minPrice.value)) * 100
  }
})

// Zone ranges for background
const zoneRanges = computed(() => [
  { 
    name: 'buy', 
    height: buyRange.value.percentage,
    backgroundClass: 'zone-buy' 
  },
  { 
    name: 'neutral', 
    height: neutralRange.value.percentage,
    backgroundClass: 'zone-neutral' 
  },
  { 
    name: 'sell', 
    height: sellRange.value.percentage,
    backgroundClass: 'zone-sell' 
  }
])

// Filtered levels for display (remove duplicates at same price)
const visibleLevels = computed(() => {
  const uniquePrices = new Set()
  return levels.value.filter(level => {
    if (uniquePrices.has(level.price)) return false
    uniquePrices.add(level.price)
    return true
  })
})

// Zone details for the side panel
const zoneDetails = computed(() => [
  {
    name: 'buy',
    label: 'Buy Zone',
    description: 'Optimal accumulation area',
    range: `${formatPrice(buyRange.value.lower)} - ${formatPrice(buyRange.value.upper)}`,
    levels: levels.value.filter(l => l.zone === 'buy').length,
    percentage: Math.round(buyRange.value.percentage),
    borderClass: 'border-green-500',
    textClass: 'text-green-600',
    icon: 'fas fa-arrow-down text-green-500',
    badgeClass: 'bg-green-100 text-green-700'
  },
  {
    name: 'neutral',
    label: 'Neutral Zone',
    description: 'Wait for confirmation',
    range: `${formatPrice(neutralRange.value.lower)} - ${formatPrice(neutralRange.value.upper)}`,
    levels: levels.value.filter(l => l.zone === 'neutral').length,
    percentage: Math.round(neutralRange.value.percentage),
    borderClass: 'border-amber-500',
    textClass: 'text-amber-600',
    icon: 'fas fa-pause text-amber-500',
    badgeClass: 'bg-amber-100 text-amber-700'
  },
  {
    name: 'sell',
    label: 'Sell Zone',
    description: 'Consider taking profits',
    range: `${formatPrice(sellRange.value.lower)} - ${formatPrice(sellRange.value.upper)}`,
    levels: levels.value.filter(l => l.zone === 'sell').length,
    percentage: Math.round(sellRange.value.percentage),
    borderClass: 'border-red-500',
    textClass: 'text-red-600',
    icon: 'fas fa-arrow-up text-red-500',
    badgeClass: 'bg-red-100 text-red-700'
  },
  {
    name: 'ath',
    label: 'ATH Zone',
    description: 'All-time high resistance',
    range: `${formatPrice(levels.value.find(l => l.zone === 'ath').price)}+`,
    levels: 1,
    percentage: 5,
    borderClass: 'border-orange-500',
    textClass: 'text-orange-600',
    icon: 'fas fa-fire text-orange-500',
    badgeClass: 'bg-orange-100 text-orange-700'
  }
])

// Helper functions
const formatPrice = (p) => {
  if (typeof p !== 'number') return p
  return p.toFixed(8)
}

const getLevelPosition = (level) => {
  return (1 - (level.price - minPrice.value) / (maxPrice.value - minPrice.value)) * 100
}

const getCurrentPricePosition = () => {
  return (1 - (currentPrice.value - minPrice.value) / (maxPrice.value - minPrice.value)) * 100
}

const getLevelColor = (level) => {
  const colors = {
    buy: 'bg-green-500',
    neutral: 'bg-amber-500',
    sell: 'bg-red-500',
    ath: 'bg-orange-500'
  }
  return colors[level.zone] || 'bg-gray-500'
}

const getZoneTextColor = (zone) => {
  const colors = {
    buy: 'text-green-600',
    neutral: 'text-amber-600',
    sell: 'text-red-600',
    ath: 'text-orange-600'
  }
  return colors[zone] || 'text-gray-600'
}

const calculateDistanceToZone = (zone) => {
  const zonePrice = zone === 'buy' ? buyRange.value.upper : sellRange.value.lower
  const distance = Math.abs((currentPrice.value - zonePrice) / zonePrice * 100)
  return distance.toFixed(2)
}

const getCurrentZone = () => {
  if (currentPrice.value <= buyRange.value.upper) {
    return { label: 'Buy Zone', advice: 'Good time to accumulate' }
  } else if (currentPrice.value <= neutralRange.value.upper) {
    return { label: 'Neutral Zone', advice: 'Wait for breakout direction' }
  } else {
    return { label: 'Sell Zone', advice: 'Consider taking profits' }
  }
}

// Initialize last update time
onMounted(() => {
  lastUpdate.value = new Date().toLocaleTimeString()
  
  // Simulate price updates
  setInterval(() => {
    lastUpdate.value = new Date().toLocaleTimeString()
  }, 30000)
})
</script>

<style scoped>
.spectrum-container {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.spectrum-card {
  background: white;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(10px);
}

.zone-buy {
  background: linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.2));
}

.zone-neutral {
  background: linear-gradient(to right, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.2));
}

.zone-sell {
  background: linear-gradient(to right, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.2));
}

.price-line {
  filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.5));
}

.range-indicator {
  transition: all 0.3s ease;
}

.range-indicator:hover {
  transform: scale(1.02);
}
</style>