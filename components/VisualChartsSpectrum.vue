<template>
  <div class="visual-spectrum-container">
    <div class="spectrum-header">
      <h2 class="spectrum-title">📊 LCX Price Range Spectrum (29 Levels)</h2>
      <div class="spectrum-info">
        <div class="info-item"><strong>BTC:</strong> ${{ parseFloat(btcPrice).toLocaleString('en-US') }}</div>
        <div class="info-item"><strong>1 LCX =</strong> ₿{{ currentBtcPrice }}</div>
        <div class="info-item"><strong>LCX USD:</strong> ${{ currentPrice }}</div>
        <div class="info-item"><strong>Position:</strong> {{ currentPricePosition.toFixed(1) }}px</div>
        <div class="info-item">
          <strong>Current Level:</strong>
          <span class="level-badge-inline" :class="currentLevelClass">
            {{ currentLevelEmoji }} {{ currentLevelName }}
          </span>
        </div>
      </div>
    </div>

    <div class="spectrum-content">
      <!-- SVG Spectrum Visualization -->
      <div class="spectrum-svg-wrapper">
        <svg width="100%" height="800" viewBox="0 0 1200 800" class="spectrum-svg">
          <defs>
            <!-- Gradient logaritmic - calculat pentru a se potrivi exact cu nivelele -->
            <!-- Formula: offset = (1 - (log10(btc) - log10(0.00000001)) / (log10(0.0001) - log10(0.00000001))) * 100 -->
            <linearGradient id="btcPriceGradient" x1="0" y1="1" x2="0" y2="0">
              <!-- ATL-L6: VERDE (Buy zones) -->
              <stop offset="0%" stop-color="#003300" /> <!-- ATL - verde închis -->
              <stop offset="12.5%" stop-color="#004d00" /> <!-- L1 -->
              <stop offset="25%" stop-color="#006600" /> <!-- L2 -->
              <stop offset="32.5%" stop-color="#008000" /> <!-- L3 -->
              <stop offset="36.9%" stop-color="#009900" /> <!-- L4 -->
              <stop offset="40%" stop-color="#00b300" /> <!-- L5 -->
              <stop offset="42.5%" stop-color="#00cc00" /> <!-- L6 - verde deschis -->
              <!-- L7-L10: GALBEN (Neutral) -->
              <stop offset="46.1%" stop-color="#cccc00" /> <!-- L7 - galben închis -->
              <stop offset="47.5%" stop-color="#dddd00" /> <!-- L8 -->
              <stop offset="50%" stop-color="#ffff00" /> <!-- L9 - galben pur -->
              <stop offset="51.9%" stop-color="#ffff33" /> <!-- L10 - galben deschis -->
              <!-- L11-L19: ROȘU (Sell zones) -->
              <stop offset="53.5%" stop-color="#330000" /> <!-- L11 - roșu închis -->
              <stop offset="55%" stop-color="#440000" /> <!-- L12 -->
              <stop offset="56.2%" stop-color="#550000" /> <!-- L13 -->
              <stop offset="57.5%" stop-color="#660000" /> <!-- L14 -->
              <stop offset="59.4%" stop-color="#770000" /> <!-- L15 -->
              <stop offset="61.9%" stop-color="#880000" /> <!-- L16 -->
              <stop offset="65%" stop-color="#990000" /> <!-- L17 -->
              <stop offset="67.5%" stop-color="#aa0000" /> <!-- L18 -->
              <stop offset="69.4%" stop-color="#bb0000" /> <!-- L19 - roșu deschis -->
              <!-- ATH: ROȘU + GALBEN (Special) -->
              <stop offset="72.5%" stop-color="#ff6600" /> <!-- ATH - roșu-galben mix -->
              <!-- L20-L28: ROȘU (Post-ATH high sell) -->
              <stop offset="75%" stop-color="#cc0000" /> <!-- L20 -->
              <stop offset="79.4%" stop-color="#dd0000" /> <!-- L21 -->
              <stop offset="82.5%" stop-color="#ee0000" /> <!-- L22 -->
              <stop offset="86.9%" stop-color="#ff0000" /> <!-- L23 - roșu pur -->
              <stop offset="90%" stop-color="#ff3333" /> <!-- L24 -->
              <stop offset="92.5%" stop-color="#ff6666" /> <!-- L25 -->
              <stop offset="94.4%" stop-color="#ff9999" /> <!-- L26 -->
              <stop offset="97.5%" stop-color="#ffcccc" /> <!-- L27 -->
              <stop offset="100%" stop-color="#ffdddd" /> <!-- L28 - roșu foarte deschis -->
            </linearGradient>
          </defs>

          <!-- Background -->
          <rect x="0" y="0" width="1200" height="800" fill="#0f172a" rx="20" />

          <!-- Main spectrum bar -->
          <rect
            x="100"
            y="50"
            width="80"
            height="700"
            fill="url(#btcPriceGradient)"
            stroke="#1f2937"
            stroke-width="2"
            rx="15"
          />

          <!-- Price level markers and labels -->
          <g v-for="level in spectrumLevels" :key="level.label">
            <!-- Background rectangle for the level row -->
            <rect
              x="220"
              :y="getLevelYPosition(level.btcRaw) - 8"
              width="550"
              height="16"
              :fill="level.color"
              :opacity="0.15"
              rx="2"
            />

            <!-- Level marker line -->
            <line
              :x1="180"
              :y1="getLevelYPosition(level.btcRaw)"
              :x2="220"
              :y2="getLevelYPosition(level.btcRaw)"
              :stroke="level.color"
              stroke-width="2.5"
            />

            <!-- Level dot (no white stroke) -->
            <circle
              :cx="140"
              :cy="getLevelYPosition(level.btcRaw)"
              r="5"
              :fill="level.color"
            />

            <!-- Level label and data -->
            <text
              x="230"
              :y="getLevelYPosition(level.btcRaw) + 5"
              :fill="level.color"
              font-size="13"
              font-family="monospace"
              font-weight="bold"
            >
              {{ level.label }}
            </text>

            <text
              x="300"
              :y="getLevelYPosition(level.btcRaw) + 5"
              :fill="level.color"
              font-size="12"
              font-family="monospace"
              font-weight="600"
            >
              ₿{{ level.btc }} | ${{ level.usd }} | {{ level.lcx }} LCX | {{ level.multiplier }}
            </text>
          </g>

          <!-- Current price indicator -->
          <g v-if="currentPricePosition >= 50 && currentPricePosition <= 750">
            <line
              x1="90"
              :y1="currentPricePosition"
              x2="800"
              :y2="currentPricePosition"
              :stroke="currentLevelColor"
              stroke-width="3"
              stroke-dasharray="8,4"
              style="filter: drop-shadow(0 0 6px currentColor); opacity: 0.9"
            />
            <circle
              cx="140"
              :cy="currentPricePosition"
              r="8"
              :fill="currentLevelColor"
              style="filter: drop-shadow(0 0 8px currentColor)"
            />
            <text
              x="810"
              :y="currentPricePosition + 5"
              :fill="currentLevelColor"
              font-size="14"
              font-weight="bold"
              font-family="monospace"
              style="text-shadow: 0 0 4px rgba(0, 0, 0, 0.8)"
            >
              ← CURRENT: ₿{{ currentBtcPrice }}
            </text>
          </g>

          <!-- Zone labels on the left -->
          <text x="30" y="100" fill="#10b981" font-size="16" font-weight="bold">BUY</text>
          <text x="30" y="350" fill="#f59e0b" font-size="16" font-weight="bold">NEUTRAL</text>
          <text x="30" y="600" fill="#ef4444" font-size="16" font-weight="bold">SELL</text>
          <text x="30" y="740" fill="#ea580c" font-size="16" font-weight="bold">ATH</text>
        </svg>
      </div>

      <!-- Legend panel -->
      <div class="spectrum-legend">
        <h3 class="legend-title">📋 Price Range Legend</h3>

        <div class="legend-section">
          <div class="legend-section-title">🟢 BUY ZONES (ATL - L6)</div>
          <div class="legend-items">
            <div v-for="level in buyLegendLevels" :key="level.label" class="legend-item" :class="level.className">
              <span class="legend-label">{{ level.label }}</span>
              <span class="legend-range">₿{{ level.btcRange }}</span>
            </div>
          </div>
        </div>

        <div class="legend-section">
          <div class="legend-section-title">🟡 NEUTRAL ZONES (L7 - L8)</div>
          <div class="legend-items">
            <div v-for="level in neutralLegendLevels" :key="level.label" class="legend-item" :class="level.className">
              <span class="legend-label">{{ level.label }}</span>
              <span class="legend-range">₿{{ level.btcRange }}</span>
            </div>
          </div>
        </div>

        <div class="legend-section">
          <div class="legend-section-title">🔴 SELL ZONES (L9 - L19)</div>
          <div class="legend-items">
            <div v-for="level in sellLegendLevels" :key="level.label" class="legend-item" :class="level.className">
              <span class="legend-label">{{ level.label }}</span>
              <span class="legend-range">₿{{ level.btcRange }}</span>
            </div>
          </div>
        </div>

        <div class="legend-section">
          <div class="legend-section-title">🔥 ATH ZONE</div>
          <div class="legend-items">
            <div class="legend-item btc-range-ath">
              <span class="legend-label">ATH</span>
              <span class="legend-range">₿0.000008</span>
            </div>
          </div>
        </div>

        <div class="legend-section">
          <div class="legend-section-title">🚀 POST-ATH LEVELS (Beyond ATH)</div>
          <div class="legend-items">
            <div v-for="level in postAthLegendLevels" :key="level.label" class="legend-item" :class="level.className">
              <span class="legend-label">{{ level.label }}</span>
              <span class="legend-range">₿{{ level.btcRange }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// Props received from parent component
const props = defineProps({
  currentPrice: {
    type: String,
    required: true
  },
  btcPrice: {
    type: String,
    required: true
  },
  currentLevelClass: {
    type: String,
    default: ''
  },
  currentLevelEmoji: {
    type: String,
    default: '🟡'
  },
  currentLevelName: {
    type: String,
    default: 'Unknown'
  }
});

// Spectrum visualization data
const spectrumLevels = computed(() => {
  const btcPriceUsd = parseFloat(props.btcPrice);
  const lcxPriceUsd = parseFloat(props.currentPrice);

  // Define the extended price levels (ATH = 0.000008, then L20-L28 after ATH up to 0.0001)
  const keyPriceLevels = [
    { btc: 0.00000001, label: 'ATL', color: '#003300' }, // Verde închis
    { btc: 0.0000001, label: 'L1', color: '#004d00' }, // Verde
    { btc: 0.0000002, label: 'L2', color: '#006600' }, // Verde
    { btc: 0.0000003, label: 'L3', color: '#008000' }, // Verde
    { btc: 0.0000004, label: 'L4', color: '#009900' }, // Verde
    { btc: 0.0000005, label: 'L5', color: '#00b300' }, // Verde
    { btc: 0.0000006, label: 'L6', color: '#00cc00' }, // Verde deschis
    { btc: 0.0000007, label: 'L7', color: '#cccc00' }, // Galben închis
    { btc: 0.0000008, label: 'L8', color: '#dddd00' }, // Galben
    { btc: 0.000001, label: 'L9', color: '#ffff00' }, // Galben pur
    { btc: 0.0000012, label: 'L10', color: '#ffff33' }, // Galben deschis
    { btc: 0.0000014, label: 'L11', color: '#330000' }, // Roșu închis START
    { btc: 0.0000016, label: 'L12', color: '#440000' }, // Roșu
    { btc: 0.0000018, label: 'L13', color: '#550000' }, // Roșu
    { btc: 0.000002, label: 'L14', color: '#660000' }, // Roșu
    { btc: 0.0000025, label: 'L15', color: '#770000' }, // Roșu
    { btc: 0.000003, label: 'L16', color: '#880000' }, // Roșu
    { btc: 0.000004, label: 'L17', color: '#990000' }, // Roșu
    { btc: 0.000005, label: 'L18', color: '#aa0000' }, // Roșu deschis
    { btc: 0.000006, label: 'L19', color: '#bb0000' }, // Roșu deschis
    { btc: 0.000008, label: 'ATH', color: '#ff6600' }, // ATH roșu-galben mix
    // Post-ATH levels (beyond ATH)
    { btc: 0.00001, label: 'L20', color: '#cc0000' }, // Roșu
    { btc: 0.000015, label: 'L21', color: '#dd0000' }, // Roșu
    { btc: 0.00002, label: 'L22', color: '#ee0000' }, // Roșu
    { btc: 0.00003, label: 'L23', color: '#ff0000' }, // Roșu pur
    { btc: 0.00004, label: 'L24', color: '#ff3333' }, // Roșu deschis
    { btc: 0.00005, label: 'L25', color: '#ff6666' }, // Roșu deschis
    { btc: 0.00006, label: 'L26', color: '#ff9999' }, // Roșu deschis
    { btc: 0.00008, label: 'L27', color: '#ffcccc' }, // Roșu foarte deschis
    { btc: 0.0001, label: 'L28', color: '#ffdddd' }  // Roșu foarte deschis
  ];

  return keyPriceLevels.map(kpl => {
    const usdValue = kpl.btc * btcPriceUsd;
    const lcxEquivalent = usdValue / lcxPriceUsd;
    const multiplier = (lcxEquivalent / 1).toFixed(2);

    return {
      label: kpl.label,
      btc: kpl.btc.toFixed(10),
      usd: usdValue.toFixed(6),
      lcx: lcxEquivalent.toFixed(2),
      multiplier: multiplier + 'x',
      color: kpl.color,
      btcRaw: kpl.btc
    };
  });
});

// Calculate current BTC price for 1 LCX
const currentBtcPrice = computed(() => {
  const lcxPriceUsd = parseFloat(props.currentPrice);
  const btcPriceUsd = parseFloat(props.btcPrice);
  const btcPrice = lcxPriceUsd / btcPriceUsd;
  return btcPrice.toFixed(10);
});

// Helper function to calculate Y position for any BTC price (logarithmic scale)
const getLevelYPosition = (btcPrice) => {
  const minBtc = 0.00000001; // ATL
  const maxBtc = 0.0001; // L28 Extreme

  if (btcPrice < minBtc || btcPrice > maxBtc) return -1;

  // Calculate position using logarithmic scale (inverted: lower prices at bottom)
  const ratio = (Math.log10(btcPrice) - Math.log10(minBtc)) / (Math.log10(maxBtc) - Math.log10(minBtc));
  return 750 - (ratio * 700); // Inverted: 750 at bottom (ATL), 50 at top (L28)
};

// Calculate current price position on spectrum (50-750px from top)
const currentPricePosition = computed(() => {
  const lcxPriceUsd = parseFloat(props.currentPrice);
  const btcPriceUsd = parseFloat(props.btcPrice);
  const currentBtc = lcxPriceUsd / btcPriceUsd;

  return getLevelYPosition(currentBtc);
});

// Get current level color for the price indicator
const currentLevelColor = computed(() => {
  const lcxPriceUsd = parseFloat(props.currentPrice);
  const btcPriceUsd = parseFloat(props.btcPrice);
  const currentBtc = lcxPriceUsd / btcPriceUsd;

  // Find which level the current price is at
  const levelColors = {
    'ATL': '#003300', 'L1': '#004d00', 'L2': '#006600', 'L3': '#008000', 'L4': '#009900',
    'L5': '#00b300', 'L6': '#00cc00', 'L7': '#cccc00', 'L8': '#dddd00', 'L9': '#ffff00',
    'L10': '#ffff33', 'L11': '#330000', 'L12': '#440000', 'L13': '#550000', 'L14': '#660000',
    'L15': '#770000', 'L16': '#880000', 'L17': '#990000', 'L18': '#aa0000', 'L19': '#bb0000',
    'ATH': '#ff6600', 'L20': '#cc0000', 'L21': '#dd0000', 'L22': '#ee0000', 'L23': '#ff0000',
    'L24': '#ff3333', 'L25': '#ff6666', 'L26': '#ff9999', 'L27': '#ffcccc', 'L28': '#ffdddd'
  };

  const levels = [
    { btc: 0.00000001, name: 'ATL' }, { btc: 0.0000001, name: 'L1' }, { btc: 0.0000002, name: 'L2' },
    { btc: 0.0000003, name: 'L3' }, { btc: 0.0000004, name: 'L4' }, { btc: 0.0000005, name: 'L5' },
    { btc: 0.0000006, name: 'L6' }, { btc: 0.0000007, name: 'L7' }, { btc: 0.0000008, name: 'L8' },
    { btc: 0.000001, name: 'L9' }, { btc: 0.0000012, name: 'L10' }, { btc: 0.0000014, name: 'L11' },
    { btc: 0.0000016, name: 'L12' }, { btc: 0.0000018, name: 'L13' }, { btc: 0.000002, name: 'L14' },
    { btc: 0.0000025, name: 'L15' }, { btc: 0.000003, name: 'L16' }, { btc: 0.000004, name: 'L17' },
    { btc: 0.000005, name: 'L18' }, { btc: 0.000006, name: 'L19' }, { btc: 0.000008, name: 'ATH' },
    { btc: 0.00001, name: 'L20' }, { btc: 0.000015, name: 'L21' }, { btc: 0.00002, name: 'L22' },
    { btc: 0.00003, name: 'L23' }, { btc: 0.00004, name: 'L24' }, { btc: 0.00005, name: 'L25' },
    { btc: 0.00006, name: 'L26' }, { btc: 0.00008, name: 'L27' }, { btc: 0.0001, name: 'L28' }
  ];

  let closestLevel = 'L1';
  let minDiff = Math.abs(currentBtc - levels[1].btc);

  for (const level of levels) {
    const diff = Math.abs(currentBtc - level.btc);
    if (diff < minDiff) {
      minDiff = diff;
      closestLevel = level.name;
    }
  }

  return levelColors[closestLevel] || '#3b82f6';
});

// Legend data for the side panel
const buyLegendLevels = computed(() => [
  { label: 'ATL', btcRange: '0.00000001 - 0.0000001', className: 'btc-range-atl' },
  { label: 'L1 Buy', btcRange: '0.0000001 - 0.0000002', className: 'btc-range-level1-buy' },
  { label: 'L2 Buy', btcRange: '0.0000002 - 0.0000003', className: 'btc-range-level2-buy' },
  { label: 'L3 Buy', btcRange: '0.0000003 - 0.0000004', className: 'btc-range-level3-buy' },
  { label: 'L4 Buy', btcRange: '0.0000004 - 0.0000005', className: 'btc-range-level4-buy' },
  { label: 'L5 Buy', btcRange: '0.0000005 - 0.0000006', className: 'btc-range-level5-buy' },
  { label: 'L6 Buy', btcRange: '0.0000006 - 0.0000007', className: 'btc-range-level6-buy' }
]);

const neutralLegendLevels = computed(() => [
  { label: 'L7 Neutral', btcRange: '0.0000007 - 0.0000008', className: 'btc-range-level7-neutral' },
  { label: 'L8 Neutral', btcRange: '0.0000008 - 0.000001', className: 'btc-range-level8-neutral' }
]);

const sellLegendLevels = computed(() => [
  { label: 'L9 Sell', btcRange: '0.000001 - 0.0000012', className: 'btc-range-level9-sell-start' },
  { label: 'L10 Sell', btcRange: '0.0000012 - 0.0000014', className: 'btc-range-level10-sell' },
  { label: 'L11 Sell', btcRange: '0.0000014 - 0.0000016', className: 'btc-range-level11-sell' },
  { label: 'L12 Sell', btcRange: '0.0000016 - 0.0000018', className: 'btc-range-level12-sell' },
  { label: 'L13 Sell', btcRange: '0.0000018 - 0.000002', className: 'btc-range-level13-sell-medium' },
  { label: 'L14 Sell', btcRange: '0.000002 - 0.0000025', className: 'btc-range-level14-sell-medium' },
  { label: 'L15 Sell', btcRange: '0.0000025 - 0.000003', className: 'btc-range-level15-sell-medium' },
  { label: 'L16 Sell', btcRange: '0.000003 - 0.000004', className: 'btc-range-level16-sell-strong' },
  { label: 'L17 Sell', btcRange: '0.000004 - 0.000005', className: 'btc-range-level17-sell-strong' },
  { label: 'L18 Sell', btcRange: '0.000005 - 0.000006', className: 'btc-range-level18-sell-vstrong' },
  { label: 'L19 Pre-ATH', btcRange: '0.000006 - 0.000008', className: 'btc-range-level19-pre-ath' }
]);

const postAthLegendLevels = computed(() => [
  { label: 'L20 Post-ATH', btcRange: '0.00001 - 0.000015', className: 'btc-range-level20-sell' },
  { label: 'L21 Post-ATH', btcRange: '0.000015 - 0.00002', className: 'btc-range-level21-sell' },
  { label: 'L22 Post-ATH', btcRange: '0.00002 - 0.00003', className: 'btc-range-level22-sell' },
  { label: 'L23 Post-ATH', btcRange: '0.00003 - 0.00004', className: 'btc-range-level23-sell' },
  { label: 'L24 Post-ATH', btcRange: '0.00004 - 0.00005', className: 'btc-range-level24-sell' },
  { label: 'L25 Post-ATH', btcRange: '0.00005 - 0.00006', className: 'btc-range-level25-sell' },
  { label: 'L26 Post-ATH', btcRange: '0.00006 - 0.00008', className: 'btc-range-level26-sell' },
  { label: 'L27 Post-ATH', btcRange: '0.00008 - 0.0001', className: 'btc-range-level27-sell' },
  { label: 'L28 Extreme', btcRange: '0.0001+', className: 'btc-range-level28-extreme' }
]);
</script>

<style scoped>
/* ===== VISUAL SPECTRUM STYLES ===== */
.visual-spectrum-container {
  padding: 20px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 16px;
  min-height: 900px;
}

.spectrum-header {
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.spectrum-title {
  font-size: 28px;
  font-weight: 700;
  color: #e5e7eb;
  margin-bottom: 16px;
  text-align: center;
}

.spectrum-info {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.info-item {
  color: #9ca3af;
  font-size: 14px;
}

.info-item strong {
  color: #e5e7eb;
  margin-right: 6px;
}

.level-badge-inline {
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  margin-left: 8px;
  display: inline-block;
}

.spectrum-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 30px;
}

.spectrum-svg-wrapper {
  background: #0f172a;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.spectrum-svg {
  width: 100%;
  height: auto;
}

.spectrum-legend {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 24px;
  max-height: 850px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.legend-title {
  font-size: 20px;
  font-weight: 700;
  color: #e5e7eb;
  margin-bottom: 20px;
  text-align: center;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 12px;
}

.legend-section {
  margin-bottom: 24px;
}

.legend-section-title {
  font-size: 16px;
  font-weight: 700;
  color: #e5e7eb;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
}

.legend-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.legend-label {
  color: #e5e7eb;
}

.legend-range {
  color: #9ca3af;
  font-family: 'Courier New', monospace;
  font-size: 11px;
}

/* Apply the same color classes from table to legend */
/* VERDE - Buy Zones */
.legend-item.btc-range-atl {
  background: rgba(0, 51, 0, 0.3);
  border-left-color: #003300;
}

.legend-item.btc-range-level1-buy {
  background: rgba(0, 77, 0, 0.3);
  border-left-color: #004d00;
}

.legend-item.btc-range-level2-buy {
  background: rgba(0, 102, 0, 0.3);
  border-left-color: #006600;
}

.legend-item.btc-range-level3-buy {
  background: rgba(0, 128, 0, 0.3);
  border-left-color: #008000;
}

.legend-item.btc-range-level4-buy {
  background: rgba(0, 153, 0, 0.3);
  border-left-color: #009900;
}

.legend-item.btc-range-level5-buy {
  background: rgba(0, 179, 0, 0.3);
  border-left-color: #00b300;
}

.legend-item.btc-range-level6-buy {
  background: rgba(0, 204, 0, 0.3);
  border-left-color: #00cc00;
}

/* GALBEN - Neutral */
.legend-item.btc-range-level7-neutral {
  background: rgba(204, 204, 0, 0.3);
  border-left-color: #cccc00;
}

.legend-item.btc-range-level8-neutral {
  background: rgba(221, 221, 0, 0.3);
  border-left-color: #dddd00;
}

.legend-item.btc-range-level9-sell-start {
  background: rgba(255, 255, 0, 0.2);
  border-left-color: #ffff00;
}

.legend-item.btc-range-level10-sell {
  background: rgba(255, 255, 51, 0.2);
  border-left-color: #ffff33;
}

/* ROȘU - Sell Zones */
.legend-item.btc-range-level11-sell {
  background: rgba(51, 0, 0, 0.3);
  border-left-color: #330000;
}

.legend-item.btc-range-level12-sell {
  background: rgba(68, 0, 0, 0.3);
  border-left-color: #440000;
}

.legend-item.btc-range-level13-sell-medium {
  background: rgba(85, 0, 0, 0.3);
  border-left-color: #550000;
}

.legend-item.btc-range-level14-sell-medium {
  background: rgba(102, 0, 0, 0.3);
  border-left-color: #660000;
}

.legend-item.btc-range-level15-sell-medium {
  background: rgba(119, 0, 0, 0.3);
  border-left-color: #770000;
}

.legend-item.btc-range-level16-sell-strong {
  background: rgba(136, 0, 0, 0.3);
  border-left-color: #880000;
}

.legend-item.btc-range-level17-sell-strong {
  background: rgba(153, 0, 0, 0.3);
  border-left-color: #990000;
}

.legend-item.btc-range-level18-sell-vstrong {
  background: rgba(170, 0, 0, 0.3);
  border-left-color: #aa0000;
}

.legend-item.btc-range-level19-pre-ath {
  background: rgba(187, 0, 0, 0.3);
  border-left-color: #bb0000;
}

/* ATH - Special Red-Yellow */
.legend-item.btc-range-ath {
  background: linear-gradient(to right, rgba(255, 102, 0, 0.3), rgba(255, 255, 0, 0.3));
  border-left-color: #ff6600;
}

/* Extended levels L20-L28 */
.legend-item.btc-range-level20-sell {
  background: rgba(204, 0, 0, 0.3);
  border-left-color: #cc0000;
}

.legend-item.btc-range-level21-sell {
  background: rgba(221, 0, 0, 0.3);
  border-left-color: #dd0000;
}

.legend-item.btc-range-level22-sell {
  background: rgba(238, 0, 0, 0.3);
  border-left-color: #ee0000;
}

.legend-item.btc-range-level23-sell {
  background: rgba(255, 0, 0, 0.3);
  border-left-color: #ff0000;
}

.legend-item.btc-range-level24-sell {
  background: rgba(255, 51, 51, 0.2);
  border-left-color: #ff3333;
}

.legend-item.btc-range-level25-sell {
  background: rgba(255, 102, 102, 0.2);
  border-left-color: #ff6666;
}

.legend-item.btc-range-level26-sell {
  background: rgba(255, 153, 153, 0.2);
  border-left-color: #ff9999;
}

.legend-item.btc-range-level27-sell {
  background: rgba(255, 204, 204, 0.2);
  border-left-color: #ffcccc;
}

.legend-item.btc-range-level28-extreme {
  background: rgba(255, 221, 221, 0.2);
  border-left-color: #ffdddd;
}

@media (max-width: 1200px) {
  .spectrum-content {
    grid-template-columns: 1fr;
  }

  .spectrum-legend {
    max-height: 500px;
  }
}
</style>
