<template>
  <div class="price-range-spectrum-page">
    <n-tabs type="segment" animated class="main-tabs">
      <!-- Tab 1: Visual Spectrum -->
      <n-tab-pane name="visual-spectrum" tab="📉 Price Range Spectrum">
        <div class="tab-content">
          <VisualChartsSpectrum
            :current-price="currentPrice"
            :btc-price="btcPrice"
            :current-level-class="currentLevelClass"
            :current-level-emoji="currentLevelEmoji"
            :current-level-name="currentLevelName"
          />
        </div>
      </n-tab-pane>

      <!-- Tab 2: Detailed Table -->
      <n-tab-pane name="detailed-table" tab="📋 Detailed Levels Table">
        <div class="tab-content">
          <div class="table-header">
            <h2>All 29 LCX Price Levels</h2>
            <div class="header-info">
              <span>BTC: ${{ parseFloat(btcPrice).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
              <span>LCX: ${{ currentPrice }}</span>
              <span :class="currentLevelClass">{{ currentLevelEmoji }} {{ currentLevelName }}</span>
            </div>
          </div>

          <div class="table-wrapper">
            <table class="levels-table">
              <thead>
                <tr>
                  <th>Level</th>
                  <th>₿ BTC Price</th>
                  <th>$ USD Price</th>
                  <th>LCX Equivalent</th>
                  <th>Multiplier</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="level in allLevels"
                  :key="level.name"
                  :class="getLevelRowClass(level)"
                >
                  <td class="level-name">
                    <span class="level-emoji">{{ level.emoji }}</span>
                    {{ level.name }}
                  </td>
                  <td class="btc-value">₿{{ level.btc.toFixed(10) }}</td>
                  <td class="usd-value">${{ (level.btc * parseFloat(btcPrice)).toFixed(6) }}</td>
                  <td class="lcx-value">{{ ((level.btc * parseFloat(btcPrice)) / parseFloat(currentPrice)).toFixed(2) }} LCX</td>
                  <td class="multiplier">{{ ((level.btc * parseFloat(btcPrice)) / parseFloat(currentPrice)).toFixed(2) }}x</td>
                  <td class="status">
                    <span :class="getLevelStatus(level)">{{ getStatusText(level) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </n-tab-pane>

      <!-- Tab 3: Price Zones Info -->
      <n-tab-pane name="zones-info" tab="🎯 Price Zones Guide">
        <div class="tab-content zones-guide">
          <div class="zone-card">
            <div class="zone-header buy-zone">
              <h3>🟢 BUY ZONES (ATL - L10)</h3>
              <p>Lower prices = Good buying opportunities</p>
            </div>
            <div class="zone-details">
              <p><strong>ATL:</strong> All-Time Low - ₿0.00000001 - Starting point</p>
              <p><strong>L1-L6:</strong> Strong buy zones - ₿0.0000001 to ₿0.0000006</p>
              <p><strong>L7-L10:</strong> Moderate buy zones - ₿0.0000007 to ₿0.0000012</p>
              <p class="hint">💡 These levels represent historically favorable entry points</p>
            </div>
          </div>

          <div class="zone-card">
            <div class="zone-header neutral-zone">
              <h3>🟡 NEUTRAL ZONES (L11 - L19)</h3>
              <p>Mid-range prices = Caution zone</p>
            </div>
            <div class="zone-details">
              <p><strong>L11-L19:</strong> Transitional zone - ₿0.0000014 to ₿0.0000060</p>
              <p>Neither clearly bullish nor bearish</p>
              <p class="hint">💡 Wait for confirmation before entering positions</p>
            </div>
          </div>

          <div class="zone-card">
            <div class="zone-header sell-zone">
              <h3>🔴 SELL ZONES (ATH - L28)</h3>
              <p>Higher prices = Good selling opportunities</p>
            </div>
            <div class="zone-details">
              <p><strong>ATH:</strong> All-Time High - ₿0.000008 - Reference level</p>
              <p><strong>L20-L28:</strong> Strong sell zones - ₿0.00001 to ₿0.0001</p>
              <p class="hint">💡 These represent price targets for taking profits</p>
            </div>
          </div>
        </div>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VisualChartsSpectrum from '~/components/VisualChartsSpectrum.vue'
import { useAppStore } from '~/stores/app.store'

const appStore = useAppStore()

// Price data from store
const btcPrice = computed(() => {
  const storePrice = appStore.getBtcPrice
  return storePrice ? storePrice.toFixed(2) : "109639.97"
})

const currentPrice = computed(() => {
  const storePrice = appStore.getCurrentPrice
  return storePrice ? storePrice.toFixed(4) : "0.1126"
})

// All 29 levels data
const allLevels = computed(() => [
  { name: 'ATL', btc: 0.00000001, emoji: '🟢', type: 'buy' },
  { name: 'L1', btc: 0.0000001, emoji: '🟢', type: 'buy' },
  { name: 'L2', btc: 0.0000002, emoji: '🟢', type: 'buy' },
  { name: 'L3', btc: 0.0000003, emoji: '🟢', type: 'buy' },
  { name: 'L4', btc: 0.0000004, emoji: '🟢', type: 'buy' },
  { name: 'L5', btc: 0.0000005, emoji: '🟢', type: 'buy' },
  { name: 'L6', btc: 0.0000006, emoji: '🟢', type: 'buy' },
  { name: 'L7', btc: 0.0000007, emoji: '🟡', type: 'neutral' },
  { name: 'L8', btc: 0.0000008, emoji: '🟡', type: 'neutral' },
  { name: 'L9', btc: 0.000001, emoji: '🟡', type: 'neutral' },
  { name: 'L10', btc: 0.0000012, emoji: '🟡', type: 'neutral' },
  { name: 'L11', btc: 0.0000014, emoji: '🔴', type: 'sell' },
  { name: 'L12', btc: 0.0000016, emoji: '🔴', type: 'sell' },
  { name: 'L13', btc: 0.0000018, emoji: '🔴', type: 'sell' },
  { name: 'L14', btc: 0.000002, emoji: '🔴', type: 'sell' },
  { name: 'L15', btc: 0.0000025, emoji: '🔴', type: 'sell' },
  { name: 'L16', btc: 0.000003, emoji: '🔴', type: 'sell' },
  { name: 'L17', btc: 0.000004, emoji: '🔴', type: 'sell' },
  { name: 'L18', btc: 0.000005, emoji: '🔴', type: 'sell' },
  { name: 'L19', btc: 0.000006, emoji: '🔴', type: 'sell' },
  { name: 'ATH', btc: 0.000008, emoji: '🔥', type: 'ath' },
  { name: 'L20', btc: 0.00001, emoji: '🚀', type: 'sell' },
  { name: 'L21', btc: 0.000015, emoji: '🚀', type: 'sell' },
  { name: 'L22', btc: 0.00002, emoji: '🚀', type: 'sell' },
  { name: 'L23', btc: 0.00003, emoji: '🚀', type: 'sell' },
  { name: 'L24', btc: 0.00004, emoji: '🌙', type: 'sell' },
  { name: 'L25', btc: 0.00005, emoji: '🌙', type: 'sell' },
  { name: 'L26', btc: 0.00006, emoji: '🌙', type: 'sell' },
  { name: 'L27', btc: 0.00008, emoji: '⭐', type: 'sell' },
  { name: 'L28', btc: 0.0001, emoji: '⭐', type: 'sell' }
])

// Determine current level
const currentLevelIndex = computed(() => {
  const btcPriceUsd = parseFloat(btcPrice.value)
  const lcxPriceUsd = parseFloat(currentPrice.value)
  const currentBtc = lcxPriceUsd / btcPriceUsd

  let closest = 0
  let minDiff = Math.abs(allLevels.value[0].btc - currentBtc)

  for (let i = 1; i < allLevels.value.length; i++) {
    const diff = Math.abs(allLevels.value[i].btc - currentBtc)
    if (diff < minDiff) {
      minDiff = diff
      closest = i
    }
  }

  return closest
})

const currentLevel = computed(() => allLevels.value[currentLevelIndex.value])

const currentLevelName = computed(() => currentLevel.value.name)
const currentLevelEmoji = computed(() => currentLevel.value.emoji)
const currentLevelClass = computed(() => `level-${currentLevel.value.type}`)

// Helper functions
const getLevelRowClass = (level) => {
  if (level.name === currentLevel.value.name) {
    return `level-row current-level level-${level.type}`
  }
  return `level-row level-${level.type}`
}

const getLevelStatus = (level) => {
  const btcPriceUsd = parseFloat(btcPrice.value)
  const lcxPriceUsd = parseFloat(currentPrice.value)
  const currentBtc = lcxPriceUsd / btcPriceUsd

  if (Math.abs(level.btc - currentBtc) < 0.00000001) {
    return 'status-current'
  }
  return level.btc > currentBtc ? 'status-above' : 'status-below'
}

const getStatusText = (level) => {
  const btcPriceUsd = parseFloat(btcPrice.value)
  const lcxPriceUsd = parseFloat(currentPrice.value)
  const currentBtc = lcxPriceUsd / btcPriceUsd

  if (Math.abs(level.btc - currentBtc) < 0.00000001) {
    return '🎯 CURRENT'
  }
  return level.btc > currentBtc ? '⬆️ ABOVE' : '⬇️ BELOW'
}
</script>

<style scoped>
.price-range-spectrum-page {
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  min-height: 100vh;
  color: #ffffff;
}

.main-tabs {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  padding: 20px;
}

.tab-content {
  padding: 20px 0;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.table-header h2 {
  margin: 0;
  font-size: 24px;
}

.header-info {
  display: flex;
  gap: 20px;
  font-size: 14px;
}

.header-info span {
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
}

.header-info .level-buy {
  background: rgba(0, 204, 0, 0.2);
  color: #00ff00;
  font-weight: bold;
}

.header-info .level-neutral {
  background: rgba(255, 255, 0, 0.2);
  color: #ffff00;
  font-weight: bold;
}

.header-info .level-sell {
  background: rgba(255, 0, 0, 0.2);
  color: #ff0000;
  font-weight: bold;
}

.header-info .level-ath {
  background: linear-gradient(to right, rgba(255, 102, 0, 0.2), rgba(255, 255, 0, 0.2));
  color: #ff9933;
  font-weight: bold;
}

.table-wrapper {
  overflow-x: auto;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 15px;
}

.levels-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.levels-table thead {
  background: rgba(0, 0, 0, 0.4);
  position: sticky;
  top: 0;
}

.levels-table th {
  padding: 12px;
  text-align: left;
  font-weight: bold;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  color: #888;
}

.levels-table tbody tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.levels-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

.level-row {
  background: transparent;
}

.level-row.level-buy {
  background: rgba(0, 255, 0, 0.03);
}

.level-row.level-sell {
  background: rgba(255, 0, 0, 0.03);
}

.level-row.level-neutral {
  background: rgba(255, 255, 0, 0.03);
}

.level-row.level-ath {
  background: rgba(255, 165, 0, 0.05);
}

.level-row.current-level {
  background: rgba(255, 255, 0, 0.15);
  animation: highlight 2s infinite;
}

.levels-table td {
  padding: 10px 12px;
}

.level-name {
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
}

.level-emoji {
  font-size: 16px;
}

.btc-value {
  font-family: monospace;
  color: #ffb347;
}

.usd-value {
  font-family: monospace;
  color: #87ceeb;
}

.lcx-value {
  font-family: monospace;
  color: #98fb98;
}

.multiplier {
  font-weight: bold;
}

.status {
  font-weight: bold;
}

.status-current {
  background: #ffff00;
  color: #000;
  padding: 2px 6px;
  border-radius: 3px;
}

.status-above {
  background: rgba(255, 0, 0, 0.2);
  color: #ff8888;
  padding: 2px 6px;
  border-radius: 3px;
}

.status-below {
  background: rgba(0, 255, 0, 0.2);
  color: #88ff88;
  padding: 2px 6px;
  border-radius: 3px;
}

.zones-guide {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.zone-card {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.zone-header {
  padding: 15px;
  color: white;
}

.zone-header h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
}

.zone-header p {
  margin: 0;
  font-size: 12px;
  opacity: 0.8;
}

.zone-header.buy-zone {
  background: rgba(0, 255, 0, 0.1);
  border-bottom: 2px solid #00ff00;
}

.zone-header.neutral-zone {
  background: rgba(255, 255, 0, 0.1);
  border-bottom: 2px solid #ffff00;
}

.zone-header.sell-zone {
  background: rgba(255, 0, 0, 0.1);
  border-bottom: 2px solid #ff0000;
}

.zone-details {
  padding: 15px;
  font-size: 13px;
  line-height: 1.6;
}

.zone-details p {
  margin: 8px 0;
}

.zone-details .hint {
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
  border-left: 3px solid #ffff00;
  margin-top: 10px;
}

@keyframes highlight {
  0%, 100% {
    background: rgba(255, 255, 0, 0.15);
  }
  50% {
    background: rgba(255, 255, 0, 0.25);
  }
}

@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-info {
    flex-direction: column;
    width: 100%;
    margin-top: 10px;
  }

  .zones-guide {
    grid-template-columns: 1fr;
  }
}
</style>
