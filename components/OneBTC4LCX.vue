<template>
  <div class="btc-lcx-container">
    <h3 class="table-title">🏔️ LCX to BTC Conversion Pyramid</h3>

    <div class="formula-header">
      <div class="price-info-grid">
        <div class="price-info-item">
          <span class="price-info-label">🔴 BTC Price:</span>
          <span class="price-info-value">${{ parseFloat(btcPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
        </div>
        <div class="price-info-item">
          <span class="price-info-label">🟢 LCX Price:</span>
          <span class="price-info-value">${{ currentPrice }}</span>
        </div>
      </div>
      <div class="formula-display">
        <span class="formula-label">📐 Formula:</span>
        <span class="formula-text">1 BTC / pyramid levels = prices in BTC [value in USD]</span>
      </div>
    </div>

    <!-- Current Price Display -->
    <div class="current-price-display">
      <div class="price-card btc-card">
        <span class="price-label">LCX Price in BTC</span>
        <span class="price-value">₿{{ (parseFloat(currentPrice) / parseFloat(btcPrice)).toFixed(10) }}</span>
      </div>
      <div class="price-card eth-card">
        <span class="price-label">LCX Price in ETH</span>
        <span class="price-value">Ξ{{ (parseFloat(currentPrice) / parseFloat(ethPrice)).toFixed(10) }}</span>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="btc-lcx-table">
        <thead>
          <tr>
            <th>Pyramid Level<br/><small>(LCX per 1 BTC)</small></th>
            <th>1 LCX Price in BTC<br/><small>(1 BTC / Level)</small></th>
            <th>1 LCX Price in USD<br/><small>(@ Current BTC Price)</small></th>
            <th>Multiplier vs Now</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in priceTable" :key="index" :class="row.highlight ? 'highlight-row' : ''">
            <td class="lcx-col">{{ row.lcxAmount.toLocaleString('en-US') }} LCX</td>
            <td class="btc-lcx-col">₿{{ row.lcxPriceInBTC.toFixed(10) }}</td>
            <td class="price-col">${{ row.lcxPriceInUSD.toFixed(8) }}</td>
            <td class="multiplier-col">{{ row.multiplier.toFixed(2) }}x</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Stats Section -->
    <div class="stats-section">
      <div class="stat-card">
        <span class="stat-label">Current LCX Price</span>
        <span class="stat-value">${{ currentPrice }}</span>
        <span class="stat-btc">₿{{ (parseFloat(currentPrice) / parseFloat(btcPrice)).toFixed(10) }}</span>
      </div>

      <div class="stat-card">
        <span class="stat-label">Top Level ({{ priceTable[priceTable.length - 1].lcxAmount.toLocaleString() }} LCX)</span>
        <span class="stat-value">${{ priceTable[priceTable.length - 1].lcxPriceInUSD.toFixed(8) }}</span>
        <span class="stat-btc">₿{{ priceTable[priceTable.length - 1].lcxPriceInBTC.toFixed(10) }}</span>
      </div>

      <div class="stat-card">
        <span class="stat-label">Base Level ({{ priceTable[0].lcxAmount.toLocaleString() }} LCX)</span>
        <span class="stat-value">${{ priceTable[0].lcxPriceInUSD.toFixed(8) }}</span>
        <span class="stat-btc">₿{{ priceTable[0].lcxPriceInBTC.toFixed(10) }}</span>
      </div>

      <div class="stat-card">
        <span class="stat-label">Average Multiplier</span>
        <span class="stat-value">{{ averageMultiplier.toFixed(2) }}x</span>
        <span class="stat-desc">Across all pyramid levels</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  btcPrice: {
    type: [String, Number],
    required: true
  },
  ethPrice: {
    type: [String, Number],
    required: true
  },
  currentPrice: {
    type: [String, Number],
    required: true
  }
})

// LCX amounts from 1,100,000 down to 50,000
const lcxAmounts = [
  50000, 60000, 70000, 80000, 90000, 100000, 150000, 200000, 250000, 300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000, 1100000, 1200000, 1300000, 1400000, 1500000, 1600000, 1700000, 1800000, 1900000, 2000000, 2100000, 2200000, 2300000, 2400000, 2500000, 2600000, 2700000, 2800000, 2900000, 3000000, 3100000, 3200000, 3300000, 3400000, 3500000, 3600000, 3700000, 3800000, 3900000, 4000000, 4100000, 4200000, 4300000, 4400000, 4500000, 4600000, 4700000, 4800000, 4900000, 5000000, 5100000, 5200000, 5300000, 5400000, 5500000, 5600000, 5700000, 5800000, 5900000, 6000000, 6100000, 6200000, 6300000, 6400000, 6500000, 6600000, 6700000, 6800000, 6900000, 7000000, 7100000, 7200000, 7300000, 7400000, 7500000, 7600000, 7700000, 7800000, 7900000, 8000000, 8100000, 8200000, 8300000, 8400000, 8500000, 8600000, 8700000, 8800000, 8900000, 9000000, 9100000, 9200000, 9300000, 9400000, 9500000, 9600000, 9700000, 9800000, 9900000, 10000000

]

// Calculate price table
const priceTable = computed(() => {
  const btcPriceUsd = parseFloat(props.btcPrice)
  const currentLcxPriceUsd = parseFloat(props.currentPrice)

  return lcxAmounts.map((lcxAmount) => {
    // CORRECT FORMULA: 1 BTC / pyramid_level = price of 1 LCX in BTC
    // Example: 1 BTC / 1,100,000 LCX = 0.0000009090909 BTC per LCX
    const lcxPriceInBTC = 1 / lcxAmount

    // Convert BTC price to USD: BTC_price × BTC_amount
    const lcxPriceInUSD = lcxPriceInBTC * btcPriceUsd

    // Calculate multiplier vs current price
    const multiplier = lcxPriceInUSD / currentLcxPriceUsd

    return {
      lcxAmount,
      lcxPriceInBTC,      // Price of 1 LCX in BTC (1 BTC / level)
      lcxPriceInUSD,      // Price of 1 LCX in USD
      multiplier,
      highlight: lcxAmount === 1100000 || lcxAmount === 50000
    }
  })
})

// Calculate average multiplier
const averageMultiplier = computed(() => {
  if (priceTable.value.length === 0) return 0
  const sum = priceTable.value.reduce((acc, row) => acc + row.multiplier, 0)
  return sum / priceTable.value.length
})
</script>

<style scoped>
.btc-lcx-container {
  width: 100%;
  padding: 20px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.5));
  border-radius: 12px;
}

.table-title {
  font-size: 24px;
  font-weight: 600;
  color: #e5e7eb;
  margin-bottom: 20px;
  text-align: center;
}

.formula-header {
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(247, 147, 26, 0.1), rgba(16, 235, 4, 0.1));
  border: 1px solid rgba(247, 147, 26, 0.3);
  border-radius: 12px;
}

.price-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 15px;
}

.price-info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.price-info-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.price-info-value {
  font-size: 18px;
  font-weight: 700;
  color: #fbbf24;
  font-family: 'Courier New', monospace;
}

.formula-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.4);
  border: 2px dashed rgba(247, 147, 26, 0.4);
  border-radius: 8px;
}

.formula-label {
  font-size: 14px;
  font-weight: 700;
  color: #f7931a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.formula-text {
  font-size: 14px;
  font-weight: 600;
  color: #10eb04;
  font-family: 'Courier New', monospace;
}

.table-info {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #9ca3af;
}

.current-price-display {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.price-card {
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #1f2937;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
}

.price-card.btc-card {
  border-left: 4px solid #f97316;
}

.price-card.eth-card {
  border-left: 4px solid #8b5cf6;
}

.price-label {
  font-size: 12px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.price-value {
  font-size: 22px;
  font-weight: 700;
  color: #fbbf24;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #1f2937;
  background: rgba(0, 0, 0, 0.2);
  margin-bottom: 30px;
}

.btc-lcx-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.btc-lcx-table thead {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
  position: sticky;
  top: 0;
  z-index: 10;
}

.btc-lcx-table th {
  padding: 15px;
  text-align: left;
  color: #93c5fd;
  font-weight: 600;
  border-bottom: 2px solid #1f2937;
}

.btc-lcx-table th small {
  display: block;
  font-size: 10px;
  color: #6b7280;
  font-weight: 500;
  margin-top: 4px;
  line-height: 1.2;
}

.btc-lcx-table tbody tr {
  border-bottom: 1px solid #1f2937;
  transition: background-color 0.2s;
}

.btc-lcx-table tbody tr:hover {
  background-color: rgba(59, 130, 246, 0.05);
}

.btc-lcx-table tbody tr.highlight-row {
  background-color: rgba(34, 197, 94, 0.1);
  font-weight: 600;
}

.btc-lcx-table td {
  padding: 12px 15px;
}

.lcx-col {
  color: #e5e7eb;
  font-weight: 500;
}

.price-col {
  color: #fbbf24;
  font-weight: 600;
}

.usd-col {
  color: #34d399;
}

.btc-col {
  color: #f97316;
  font-weight: 500;
}

.btc-lcx-col {
  color: #f97316;
  font-weight: 600;
}

.multiplier-col {
  color: #a78bfa;
  font-weight: 600;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stat-card {
  padding: 20px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
  border: 1px solid #1f2937;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  font-size: 12px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #fbbf24;
}

.stat-desc {
  font-size: 12px;
  color: #6b7280;
}

.stat-btc {
  font-size: 14px;
  color: #f97316;
  font-weight: 600;
}
</style>
