<template>
  <n-config-provider :theme="darkTheme">
    <n-layout has-sider style="height: 100vh">
      <!-- Sidebar pentru Stocks Markets -->
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="200"
        :collapsed="collapsed"
        show-trigger
        @collapse="collapsed = true"
        @expand="collapsed = false"
        style="background: rgba(0, 0, 0, 0.95)"
      >
        <!-- Header cu Logo -->
        <div style="padding: 20px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1)">
          <h2 v-if="!collapsed" style="color: #00dc82; margin: 0; font-size: 18px; font-weight: bold">
            📊 STOCKS MARKETS
          </h2>
          <h2 v-else style="color: #00dc82; margin: 0; font-size: 24px">
            📊
          </h2>
        </div>

        <!-- Menu Navigation -->
        <n-menu
          :collapsed="collapsed"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="menuOptions"
          :value="activeKey"
          @update:value="handleMenuClick"
          style="margin-top: 10px"
        />

        <!-- Navigation Links (jos) -->
        <div style="position: absolute; bottom: 20px; left: 0; right: 0; padding: 0 20px; display: flex; flex-direction: column; gap: 10px">
          <!-- Crypto App Button -->
          <n-button
            secondary
            type="info"
            block
            @click="goToCryptoApp"
            style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981"
          >
            <template #icon>
              <n-icon><TrendingUpOutline /></n-icon>
            </template>
            <span v-if="!collapsed">💹 Crypto App</span>
          </n-button>

          <!-- Palantir Button -->
          <n-button
            secondary
            type="warning"
            block
            @click="goToPalantir"
            style="background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b"
          >
            <template #icon>
              <n-icon><LayersOutline /></n-icon>
            </template>
            <span v-if="!collapsed">🔮 Palantir</span>
          </n-button>
        </div>
      </n-layout-sider>

      <!-- Main Content Area -->
      <n-layout style="background: #0a0a0a">
        <!-- Top Navbar -->
        <n-layout-header
          bordered
          style="height: 60px; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; background: rgba(0, 0, 0, 0.9); border-bottom: 1px solid rgba(255, 255, 255, 0.1)"
        >
          <!-- Left: Page Title -->
          <div style="display: flex; align-items: center; gap: 12px">
            <n-icon size="28" :color="getPageColor()">
              <component :is="getPageIcon()" />
            </n-icon>
            <h3 style="margin: 0; color: #fff; font-size: 18px; font-weight: 600">
              {{ getPageTitle() }}
            </h3>
          </div>

          <!-- Right: Market Status + Time -->
          <div style="display: flex; align-items: center; gap: 20px">
            <!-- Market Status -->
            <div style="display: flex; align-items: center; gap: 8px">
              <div
                :style="{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: isMarketOpen ? '#10b981' : '#ef4444',
                  boxShadow: isMarketOpen ? '0 0 10px #10b981' : '0 0 10px #ef4444'
                }"
              ></div>
              <span style="color: #fff; font-size: 14px">
                {{ isMarketOpen ? 'Market OPEN' : 'Market CLOSED' }}
              </span>
            </div>

            <!-- Current Time (București) -->
            <div style="color: #94a3b8; font-size: 14px">
              {{ currentTime }}
            </div>
          </div>
        </n-layout-header>

        <!-- Page Content -->
        <n-layout-content
          :native-scrollbar="false"
          style="padding: 24px; background: #0a0a0a; height: calc(100vh - 60px); overflow-y: auto"
        >
          <slot />
        </n-layout-content>
      </n-layout>
    </n-layout>
  </n-config-provider>
</template>

<script setup>
import { ref, computed, h, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { darkTheme } from 'naive-ui'
import {
  TrendingUpOutline,
  EarthOutline,
  CalendarOutline,
  BusinessOutline,
  AnalyticsOutline,
  TimeOutline,
  StatsChartOutline,
  PulseOutline,
  LayersOutline
} from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()
const collapsed = ref(false)
const currentTime = ref('')
const isMarketOpen = ref(false)
let timeInterval = null

// Menu Options pentru Stocks Markets
const menuOptions = [
  {
    label: 'Global Overview',
    key: 'StocksMarkets-GlobalMarketOverview',
    icon: renderIcon(EarthOutline),
    style: { color: '#3b82f6' }
  },
  {
    label: 'Open Exchanges',
    key: 'StocksMarkets-OpenBIGEXCHANGES',
    icon: renderIcon(TimeOutline),
    style: { color: '#8b5cf6' }
  },
  {
    label: 'Economic Calendar',
    key: 'StocksMarkets-EconomicCalendar',
    icon: renderIcon(CalendarOutline),
    style: { color: '#f59e0b' }
  },
  {
    label: 'Central Banks',
    key: 'StocksMarkets-CentralBanks',
    icon: renderIcon(BusinessOutline),
    style: { color: '#10b981' }
  },
  {
    label: 'Stock Flow Analysis',
    key: 'StocksMarkets-StockFlowAnalysis',
    icon: renderIcon(AnalyticsOutline),
    style: { color: '#ef4444' }
  },
  {
    label: 'VIX & Volatility',
    key: 'StocksMarkets-VIX',
    icon: renderIcon(PulseOutline),
    style: { color: '#ec4899' }
  },
  {
    label: 'Market Indices',
    key: 'StocksMarkets-MarketIndices',
    icon: renderIcon(StatsChartOutline),
    style: { color: '#06b6d4' }
  }
]

// Active menu key based on current route
const activeKey = computed(() => {
  return route.name || 'StocksMarkets-GlobalMarketOverview'
})

// Helper function to render icons
function renderIcon(icon) {
  return () => h(icon)
}

// Handle menu click
const handleMenuClick = (key) => {
  router.push({ name: key })
}

// Go back to Crypto App (main app dashboard)
const goToCryptoApp = () => {
  router.push('/cryptoapp')
}

// Go to Palantir
const goToPalantir = () => {
  router.push('/PalantirApp')
}

// Get page title based on route
const getPageTitle = () => {
  const titles = {
    'StocksMarkets-GlobalMarketOverview': 'Global Market Overview',
    'StocksMarkets-OpenBIGEXCHANGES': 'Open Stock Exchanges',
    'StocksMarkets-EconomicCalendar': 'Economic Calendar',
    'StocksMarkets-CentralBanks': 'Central Banks Monitor',
    'StocksMarkets-StockFlowAnalysis': 'Stock Flow Analysis',
    'StocksMarkets-VIX': 'VIX & Volatility Index',
    'StocksMarkets-MarketIndices': 'Market Indices'
  }
  return titles[route.name] || 'Stocks Markets'
}

// Get page icon
const getPageIcon = () => {
  const icons = {
    'StocksMarkets-GlobalMarketOverview': EarthOutline,
    'StocksMarkets-OpenBIGEXCHANGES': TimeOutline,
    'StocksMarkets-EconomicCalendar': CalendarOutline,
    'StocksMarkets-CentralBanks': BusinessOutline,
    'StocksMarkets-StockFlowAnalysis': AnalyticsOutline,
    'StocksMarkets-VIX': PulseOutline,
    'StocksMarkets-MarketIndices': StatsChartOutline
  }
  return icons[route.name] || EarthOutline
}

// Get page color
const getPageColor = () => {
  const colors = {
    'StocksMarkets-GlobalMarketOverview': '#3b82f6',
    'StocksMarkets-OpenBIGEXCHANGES': '#8b5cf6',
    'StocksMarkets-EconomicCalendar': '#f59e0b',
    'StocksMarkets-CentralBanks': '#10b981',
    'StocksMarkets-StockFlowAnalysis': '#ef4444',
    'StocksMarkets-VIX': '#ec4899',
    'StocksMarkets-MarketIndices': '#06b6d4'
  }
  return colors[route.name] || '#00dc82'
}

// Check if market is open (09:30-16:00 ET, Monday-Friday)
const checkMarketOpen = () => {
  const now = new Date()
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const day = et.getDay() // 0=Sun, 6=Sat
  const hour = et.getHours()
  const minute = et.getMinutes()
  const totalMinutes = hour * 60 + minute

  // Monday-Friday
  if (day === 0 || day === 6) {
    isMarketOpen.value = false
    return
  }

  // 09:30-16:00 ET (570 minutes = 9:30, 960 minutes = 16:00)
  isMarketOpen.value = totalMinutes >= 570 && totalMinutes < 960
}

// Update current time (București timezone)
const updateTime = () => {
  const now = new Date()
  const bucurestTime = now.toLocaleString('ro-RO', {
    timeZone: 'Europe/Bucharest',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
  currentTime.value = bucurestTime
  checkMarketOpen()
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000) // Update every second
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
/* Custom scrollbar for dark theme */
:deep(.n-layout-scroll-container::-webkit-scrollbar) {
  width: 8px;
}

:deep(.n-layout-scroll-container::-webkit-scrollbar-track) {
  background: rgba(0, 0, 0, 0.2);
}

:deep(.n-layout-scroll-container::-webkit-scrollbar-thumb) {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

:deep(.n-layout-scroll-container::-webkit-scrollbar-thumb:hover) {
  background: rgba(255, 255, 255, 0.3);
}

/* Menu item hover effect */
:deep(.n-menu-item:hover) {
  background: rgba(0, 220, 130, 0.1) !important;
}

:deep(.n-menu-item.n-menu-item--selected) {
  background: rgba(0, 220, 130, 0.2) !important;
  border-left: 3px solid #00dc82;
}
</style>
