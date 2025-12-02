<template>
  <div class="advanced-charts-tab">
    <n-space vertical :size="20">
      <!-- Chart Controls -->
      <n-card size="small" :bordered="false">
        <n-space align="center">
          <n-button-group>
            <n-button :type="chartType === 'line' ? 'primary' : 'default'" @click="chartType = 'line'">
              📈 Line
            </n-button>
            <n-button :type="chartType === 'candlestick' ? 'primary' : 'default'" @click="chartType = 'candlestick'">
              📊 Candlestick
            </n-button>
            <n-button :type="chartType === 'area' ? 'primary' : 'default'" @click="chartType = 'area'">
              🌊 Area
            </n-button>
          </n-button-group>

          <n-button-group>
            <n-button :type="viewMode === 'single' ? 'primary' : 'default'" @click="viewMode = 'single'">
              Focus LCX
            </n-button>
            <n-button :type="viewMode === 'compare' ? 'primary' : 'default'" @click="viewMode = 'compare'">
              Compare to BTC
            </n-button>
            <n-button :type="viewMode === 'multi' ? 'primary' : 'default'" @click="viewMode = 'multi'">
              Multi-axis (LCX+BTC+ETH)
            </n-button>
          </n-button-group>

          <n-switch v-model:value="showVolatilityBands">
            <template #checked>Bollinger Bands ON</template>
            <template #unchecked">Bollinger Bands OFF</template>
          </n-switch>

          <n-switch v-model:value="normalizeView">
            <template #checked>Normalized</template>
            <template #unchecked>Absolute</template>
          </n-switch>
        </n-space>
      </n-card>

      <!-- Main Chart -->
      <n-card size="small" :bordered="false">
        <template #header>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span>📊 {{ getChartTitle() }}</span>
            <n-space>
              <n-button size="small" @click="zoomIn">🔍 Zoom In</n-button>
              <n-button size="small" @click="zoomOut">🔍 Zoom Out</n-button>
              <n-button size="small" @click="resetZoom">↺ Reset</n-button>
            </n-space>
          </div>
        </template>

        <div class="main-chart" :class="{ 'has-zones': showZones }">
          <div class="chart-container">
            <!-- Chart placeholder -->
            <div class="chart-placeholder">
              <p style="text-align: center; color: #888;">
                📈 Interactive {{ chartType.toUpperCase() }} chart
                <br><br>
                <span style="font-size: 14px;">
                  Mode: {{ viewMode === 'single' ? 'LCX Only' : viewMode === 'compare' ? 'LCX vs BTC' : 'Multi-axis (LCX, BTC, ETH)' }}
                </span>
                <br>
                <span style="font-size: 12px; color: #666;">
                  Zoom: {{ zoomLevel.toFixed(2) }}x | {{ showVolatilityBands ? 'Bollinger Bands Enabled' : 'No bands' }}
                </span>
              </p>
            </div>

            <!-- Zones overlay -->
            <div v-if="showZones" class="zones-overlay">
              <div class="zone-green" style="top: 0; height: 30%;">
                <span class="zone-label">🟢 Uptrend Zone</span>
              </div>
              <div class="zone-red" style="bottom: 0; height: 30%;">
                <span class="zone-label">🔴 Downtrend Zone</span>
              </div>
            </div>
          </div>

          <!-- Tooltip on hover -->
          <div v-if="showTooltip" class="chart-tooltip" :style="tooltipPosition">
            <div class="tooltip-item">
              <span class="tooltip-label">Price:</span>
              <span class="tooltip-value">${{ tooltipData.price.toFixed(6) }}</span>
            </div>
            <div class="tooltip-item">
              <span class="tooltip-label">Change:</span>
              <span class="tooltip-value" :style="{ color: tooltipData.change >= 0 ? '#4ade80' : '#ef4444' }">
                {{ tooltipData.change >= 0 ? '+' : '' }}{{ tooltipData.change.toFixed(2) }}%
              </span>
            </div>
            <div class="tooltip-item">
              <span class="tooltip-label">Volume:</span>
              <span class="tooltip-value">{{ tooltipData.volume.toFixed(2) }}</span>
            </div>
            <div class="tooltip-item">
              <span class="tooltip-label">Time:</span>
              <span class="tooltip-value">{{ tooltipData.time }}</span>
            </div>
          </div>
        </div>
      </n-card>

      <!-- Sparklines -->
      <n-grid :cols="4" :x-gap="16">
        <n-gi>
          <n-card size="small" :bordered="false" class="sparkline-card">
            <div class="sparkline-header">
              <span>LCX</span>
              <span class="sparkline-price">${{ prices.lcx.toFixed(6) }}</span>
            </div>
            <div class="sparkline">📈 Sparkline</div>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card size="small" :bordered="false" class="sparkline-card">
            <div class="sparkline-header">
              <span>BTC</span>
              <span class="sparkline-price">${{ prices.btc.toFixed(2) }}</span>
            </div>
            <div class="sparkline">📈 Sparkline</div>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card size="small" :bordered="false" class="sparkline-card">
            <div class="sparkline-header">
              <span>ETH</span>
              <span class="sparkline-price">${{ prices.eth.toFixed(2) }}</span>
            </div>
            <div class="sparkline">📈 Sparkline</div>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card size="small" :bordered="false" class="sparkline-card">
            <div class="sparkline-header">
              <span>Volume</span>
              <span class="sparkline-price">{{ volumeK }}K</span>
            </div>
            <div class="sparkline">📊 Sparkline</div>
          </n-card>
        </n-gi>
      </n-grid>

      <!-- Heatmap Timeline -->
      <n-card title="🗓️ Movement Intensity Heatmap" size="small" :bordered="false">
        <div class="heatmap">
          <div v-for="(hour, idx) in 24" :key="idx" class="heatmap-cell" :style="{ background: getHeatmapColor(idx) }">
            <span class="heatmap-label">{{ idx }}h</span>
          </div>
        </div>
      </n-card>
    </n-space>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  symbol: String,
  exchange: String,
  coin: String
});

// State
const chartType = ref('line');
const viewMode = ref('compare');
const showVolatilityBands = ref(true);
const normalizeView = ref(false);
const showZones = ref(true);
const zoomLevel = ref(1);
const showTooltip = ref(false);
const tooltipPosition = ref({ top: '0px', left: '0px' });
const tooltipData = ref({
  price: 0.11,
  change: 2.5,
  volume: 1234.56,
  time: '12:34:56'
});

const prices = ref({
  lcx: 0.11,
  btc: 109000,
  eth: 3840
});

const volumeK = ref(125);

// Methods
const getChartTitle = computed(() => {
  if (viewMode.value === 'single') return 'LCX Price Action';
  if (viewMode.value === 'compare') return 'LCX vs BTC Comparison';
  return 'Multi-Asset Synchronized View (LCX, BTC, ETH)';
});

const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value * 1.5, 10);
};

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value / 1.5, 0.5);
};

const resetZoom = () => {
  zoomLevel.value = 1;
};

const getHeatmapColor = (hour) => {
  const intensity = Math.random();
  if (intensity > 0.7) return 'rgba(239, 68, 68, 0.8)';
  if (intensity > 0.4) return 'rgba(251, 191, 36, 0.6)';
  return 'rgba(74, 222, 128, 0.4)';
};
</script>

<style scoped>
.advanced-charts-tab {
  padding: 20px;
}

.main-chart {
  position: relative;
  min-height: 500px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

.chart-container {
  position: relative;
  width: 100%;
  height: 500px;
}

.chart-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
}

.zones-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.zone-green {
  position: absolute;
  width: 100%;
  background: linear-gradient(180deg, rgba(74, 222, 128, 0.1), transparent);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 10px;
}

.zone-red {
  position: absolute;
  width: 100%;
  background: linear-gradient(0deg, rgba(239, 68, 68, 0.1), transparent);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 10px;
}

.zone-label {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.6;
}

.chart-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px;
  z-index: 100;
  min-width: 180px;
}

.tooltip-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
}

.tooltip-label {
  color: #888;
  margin-right: 12px;
}

.tooltip-value {
  color: #fff;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.sparkline-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.sparkline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #888;
}

.sparkline-price {
  color: #4ade80;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.sparkline {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.heatmap {
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  gap: 4px;
  padding: 16px 0;
}

.heatmap-cell {
  aspect-ratio: 1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #fff;
  font-weight: 600;
  transition: all 0.3s ease;
}

.heatmap-cell:hover {
  transform: scale(1.2);
  z-index: 10;
}

.heatmap-label {
  font-size: 9px;
}
</style>
