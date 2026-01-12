<script setup>
import { ref } from 'vue';

const props = defineProps({
  exchange: {
    type: String,
    default: 'coinbaseadvanced'
  },
  symbol: {
    type: String,
    default: 'BTC/USD'
  },
  incrementalPercentAmountBuy: {
    type: [String, Number],
    default: '1'
  },
  incrementalPercentAmountSell: {
    type: [String, Number],
    default: '1'
  },
  deviationPriceBuy: {
    type: [String, Number],
    default: '1'
  },
  deviationPriceSell: {
    type: [String, Number],
    default: '1'
  },
  deviationAmountBuy: {
    type: [String, Number],
    default: '9'
  },
  deviationAmountSell: {
    type: [String, Number],
    default: '9'
  }
});

const emit = defineEmits([
  'update-incremental-buy',
  'update-incremental-sell',
  'update-deviation-price-buy',
  'update-deviation-price-sell',
  'update-deviation-amount-buy',
  'update-deviation-amount-sell'
]);

// Drag state
const isDragging = ref(false);
const dragOffsetX = ref(0);
const dragOffsetY = ref(0);
const settingsX = ref(0);
const settingsY = ref(0);
const showSettings = ref(true);

function startDrag(event) {
  if (event.button !== 0) return;
  isDragging.value = true;

  const settingsSection = document.querySelector('.settings-config-section');
  if (!settingsSection) return;

  const rect = settingsSection.getBoundingClientRect();
  dragOffsetX.value = event.clientX - rect.left;
  dragOffsetY.value = event.clientY - rect.top;

  document.addEventListener('mousemove', handleDragMove);
  document.addEventListener('mouseup', handleDragEnd);

  event.preventDefault();
}

function handleDragMove(event) {
  if (!isDragging.value) return;

  settingsX.value = event.clientX - dragOffsetX.value;
  settingsY.value = event.clientY - dragOffsetY.value;
}

function handleDragEnd() {
  isDragging.value = false;
  document.removeEventListener('mousemove', handleDragMove);
  document.removeEventListener('mouseup', handleDragEnd);
}

// 60 Preset combinations: 6 independent values per preset
// Incremental: 1, 2, 3 (1%, 2%, 3%)
// Deviation Price: 10, 30, 50 (10%, 30%, 50%)
// Deviation Amount: Buy (9, 8, 7), Sell (9, 8, 7)
const presets = [
  // Inc=1, Dev Price=10 (10%)
  { incBuy: 1, incSell: 1, devPriceBuy: 10, devPriceSell: 10, devAmtBuy: 0.09, devAmtSell: 0.09, label: '1/10/9' },
  { incBuy: 1, incSell: 1, devPriceBuy: 10, devPriceSell: 10, devAmtBuy: 0.08, devAmtSell: 0.08, label: '1/10/8' },
  { incBuy: 1, incSell: 1, devPriceBuy: 10, devPriceSell: 10, devAmtBuy: 0.07, devAmtSell: 0.07, label: '1/10/7' },
  { incBuy: 1, incSell: 1, devPriceBuy: 10, devPriceSell: 10, devAmtBuy: 0.09, devAmtSell: 0.08, label: '1/10/9-8' },
  { incBuy: 1, incSell: 1, devPriceBuy: 10, devPriceSell: 10, devAmtBuy: 0.08, devAmtSell: 0.07, label: '1/10/8-7' },

  // Inc=1, Dev Price=30 (30%)
  { incBuy: 1, incSell: 1, devPriceBuy: 30, devPriceSell: 30, devAmtBuy: 0.09, devAmtSell: 0.09, label: '1/30/9' },
  { incBuy: 1, incSell: 1, devPriceBuy: 30, devPriceSell: 30, devAmtBuy: 0.08, devAmtSell: 0.08, label: '1/30/8' },
  { incBuy: 1, incSell: 1, devPriceBuy: 30, devPriceSell: 30, devAmtBuy: 0.07, devAmtSell: 0.07, label: '1/30/7' },
  { incBuy: 1, incSell: 1, devPriceBuy: 30, devPriceSell: 30, devAmtBuy: 0.09, devAmtSell: 0.08, label: '1/30/9-8' },
  { incBuy: 1, incSell: 1, devPriceBuy: 30, devPriceSell: 30, devAmtBuy: 0.08, devAmtSell: 0.07, label: '1/30/8-7' },

  // Inc=1, Dev Price=50 (50%)
  { incBuy: 1, incSell: 1, devPriceBuy: 50, devPriceSell: 50, devAmtBuy: 0.09, devAmtSell: 0.09, label: '1/50/9' },
  { incBuy: 1, incSell: 1, devPriceBuy: 50, devPriceSell: 50, devAmtBuy: 0.08, devAmtSell: 0.08, label: '1/50/8' },
  { incBuy: 1, incSell: 1, devPriceBuy: 50, devPriceSell: 50, devAmtBuy: 0.07, devAmtSell: 0.07, label: '1/50/7' },
  { incBuy: 1, incSell: 1, devPriceBuy: 50, devPriceSell: 50, devAmtBuy: 0.09, devAmtSell: 0.08, label: '1/50/9-8' },
  { incBuy: 1, incSell: 1, devPriceBuy: 50, devPriceSell: 50, devAmtBuy: 0.08, devAmtSell: 0.07, label: '1/50/8-7' },

  // Inc=2, Dev Price=10 (10%)
  { incBuy: 2, incSell: 2, devPriceBuy: 10, devPriceSell: 10, devAmtBuy: 0.09, devAmtSell: 0.09, label: '2/10/9' },
  { incBuy: 2, incSell: 2, devPriceBuy: 10, devPriceSell: 10, devAmtBuy: 0.08, devAmtSell: 0.08, label: '2/10/8' },
  { incBuy: 2, incSell: 2, devPriceBuy: 10, devPriceSell: 10, devAmtBuy: 0.07, devAmtSell: 0.07, label: '2/10/7' },
  { incBuy: 2, incSell: 2, devPriceBuy: 10, devPriceSell: 10, devAmtBuy: 0.09, devAmtSell: 0.08, label: '2/10/9-8' },
  { incBuy: 2, incSell: 2, devPriceBuy: 10, devPriceSell: 10, devAmtBuy: 0.08, devAmtSell: 0.07, label: '2/10/8-7' },

  // Inc=2, Dev Price=30 (30%)
  { incBuy: 2, incSell: 2, devPriceBuy: 30, devPriceSell: 30, devAmtBuy: 0.09, devAmtSell: 0.09, label: '2/30/9' },
  { incBuy: 2, incSell: 2, devPriceBuy: 30, devPriceSell: 30, devAmtBuy: 0.08, devAmtSell: 0.08, label: '2/30/8' },
  { incBuy: 2, incSell: 2, devPriceBuy: 30, devPriceSell: 30, devAmtBuy: 0.07, devAmtSell: 0.07, label: '2/30/7' },
  { incBuy: 2, incSell: 2, devPriceBuy: 30, devPriceSell: 30, devAmtBuy: 0.09, devAmtSell: 0.08, label: '2/30/9-8' },
  { incBuy: 2, incSell: 2, devPriceBuy: 30, devPriceSell: 30, devAmtBuy: 0.08, devAmtSell: 0.07, label: '2/30/8-7' },

  // Inc=2, Dev Price=50 (50%)
  { incBuy: 2, incSell: 2, devPriceBuy: 50, devPriceSell: 50, devAmtBuy: 0.09, devAmtSell: 0.09, label: '2/50/9' },
  { incBuy: 2, incSell: 2, devPriceBuy: 50, devPriceSell: 50, devAmtBuy: 0.08, devAmtSell: 0.08, label: '2/50/8' },
  { incBuy: 2, incSell: 2, devPriceBuy: 50, devPriceSell: 50, devAmtBuy: 0.07, devAmtSell: 0.07, label: '2/50/7' },
  { incBuy: 2, incSell: 2, devPriceBuy: 50, devPriceSell: 50, devAmtBuy: 0.09, devAmtSell: 0.08, label: '2/50/9-8' },
  { incBuy: 2, incSell: 2, devPriceBuy: 50, devPriceSell: 50, devAmtBuy: 0.08, devAmtSell: 0.07, label: '2/50/8-7' },

  // Inc=3, Dev Price=10 (10%)
  { incBuy: 3, incSell: 3, devPriceBuy: 10, devPriceSell: 10, devAmtBuy: 0.09, devAmtSell: 0.09, label: '3/10/9' },
  { incBuy: 3, incSell: 3, devPriceBuy: 10, devPriceSell: 10, devAmtBuy: 0.08, devAmtSell: 0.08, label: '3/10/8' },
  { incBuy: 3, incSell: 3, devPriceBuy: 10, devPriceSell: 10, devAmtBuy: 0.07, devAmtSell: 0.07, label: '3/10/7' },
  { incBuy: 3, incSell: 3, devPriceBuy: 10, devPriceSell: 10, devAmtBuy: 0.09, devAmtSell: 0.08, label: '3/10/9-8' },
  { incBuy: 3, incSell: 3, devPriceBuy: 10, devPriceSell: 10, devAmtBuy: 0.08, devAmtSell: 0.07, label: '3/10/8-7' },

  // Inc=3, Dev Price=30 (30%)
  { incBuy: 3, incSell: 3, devPriceBuy: 30, devPriceSell: 30, devAmtBuy: 0.09, devAmtSell: 0.09, label: '3/30/9' },
  { incBuy: 3, incSell: 3, devPriceBuy: 30, devPriceSell: 30, devAmtBuy: 0.08, devAmtSell: 0.08, label: '3/30/8' },
  { incBuy: 3, incSell: 3, devPriceBuy: 30, devPriceSell: 30, devAmtBuy: 0.07, devAmtSell: 0.07, label: '3/30/7' },
  { incBuy: 3, incSell: 3, devPriceBuy: 30, devPriceSell: 30, devAmtBuy: 0.09, devAmtSell: 0.08, label: '3/30/9-8' },
  { incBuy: 3, incSell: 3, devPriceBuy: 30, devPriceSell: 30, devAmtBuy: 0.08, devAmtSell: 0.07, label: '3/30/8-7' },

  // Inc=3, Dev Price=50 (50%)
  { incBuy: 3, incSell: 3, devPriceBuy: 50, devPriceSell: 50, devAmtBuy: 0.09, devAmtSell: 0.09, label: '3/50/9' },
  { incBuy: 3, incSell: 3, devPriceBuy: 50, devPriceSell: 50, devAmtBuy: 0.08, devAmtSell: 0.08, label: '3/50/8' },
  { incBuy: 3, incSell: 3, devPriceBuy: 50, devPriceSell: 50, devAmtBuy: 0.07, devAmtSell: 0.07, label: '3/50/7' },
  { incBuy: 3, incSell: 3, devPriceBuy: 50, devPriceSell: 50, devAmtBuy: 0.09, devAmtSell: 0.08, label: '3/50/9-8' },
  { incBuy: 3, incSell: 3, devPriceBuy: 50, devPriceSell: 50, devAmtBuy: 0.08, devAmtSell: 0.07, label: '3/50/8-7' }
];

// Apply preset - sets all 6 values at once
function applyPreset(preset) {
  emit('update-incremental-buy', preset.incBuy.toString());
  emit('update-incremental-sell', preset.incSell.toString());
  emit('update-deviation-price-buy', preset.devPriceBuy.toString());
  emit('update-deviation-price-sell', preset.devPriceSell.toString());
  emit('update-deviation-amount-buy', preset.devAmtBuy.toString());
  emit('update-deviation-amount-sell', preset.devAmtSell.toString());
}

// Get button class based on deviation (use Buy value for color coding)
function getButtonClass(preset) {
  if (preset.devPriceBuy <= 10) return 'preset-btn-low';      // 10% - Blue
  if (preset.devPriceBuy <= 30) return 'preset-btn-medium';   // 30% - Purple
  return 'preset-btn-high';                                     // 50% - Orange
}
</script>

<template>
  <!-- Incremental & Deviation Settings Panel - Draggable -->
  <div
    class="settings-config-section config-section"
    :style="{
      position: settingsX > 0 || settingsY > 0 ? 'fixed' : 'static',
      left: settingsX > 0 ? settingsX + 'px' : 'auto',
      top: settingsY > 0 ? settingsY + 'px' : 'auto',
      cursor: isDragging ? 'grabbing' : 'grab',
      zIndex: isDragging ? 1001 : 'auto',
      width: '60%',
      maxHeight: '85vh'
    }"
  >
    <div class="section-header" @mousedown="startDrag" style="user-select: none;">
      <span>⚙️ Inc/Dev Quick Presets (60x)</span>
      <span class="collapse-icon" @click.stop="showSettings = !showSettings">{{ showSettings ? '▼' : '▶' }}</span>
    </div>
    <div v-show="showSettings" class="section-content settings-section">
      <!-- Single Unified Presets Grid -->
      <div class="presets-row">
        <!-- <div class="presets-label">⚙️ Increment & Deviation Strategies</div> -->
        <div class="presets-grid">
          <button
            v-for="(preset, idx) in presets"
            :key="`preset-${idx}`"
            :class="['preset-btn', getButtonClass(preset)]"
            @click="applyPreset(preset)"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>

      <!-- Legend -->
      <div class="legend-box">
        <span class="legend-item"><span class="color-dot low"></span> Low Deviation (10%)</span>
        <span class="legend-item"><span class="color-dot medium"></span> Medium Deviation (30%)</span>
        <span class="legend-item"><span class="color-dot high"></span> High Deviation (50%)</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Settings Config Section - Draggable */
.settings-config-section {
  transition: all 1s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 3);
}

.settings-config-section.dragging {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 5);
}

/* Config Section Styling */
.config-section {
  background: #0f1419;
  border: 1px solid #2a3441;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.section-header {
  padding: 6px 8px;
  background: #1a1f2e;
  border-bottom: 1px solid #2a3441;
  cursor: pointer;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  transition: background 2s;
}

.section-header:hover {
  background: #242936;
}

.collapse-icon {
  font-size: 9px;
  color: #666;
  cursor: pointer;
}

.section-content {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  max-height: 200px;
}

.settings-section {
  padding: 8px !important;
}

/* Presets Row - Buy/Sell Separator */
.presets-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.presets-label {
  font-size: 9px;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
  padding: 2px 4px;
  background: #1a1f2e;
  border-left: 2px solid;
  border-radius: 2px;
}

.presets-row:nth-child(1) .presets-label {
  color: #10eb04;
  border-left-color: #10eb04;
}

.presets-row:nth-child(2) .presets-label {
  color: #eb0404;
  border-left-color: #eb0404;
}

/* Presets Grid - 15 columns for compact layout */
.presets-grid {
  display: grid;
  grid-template-columns: repeat(15, 1fr);
  gap: 8px;
  padding: 4px;
  background: rgba(0, 0, 0, 2);
  border: 1px solid #2a3441;
  border-radius: 3px;
}

.preset-btn {
  font-size: 7px;
  height: 18px;
  padding: 1px 2px;
  font-weight: 600;
  min-width: 45px;
  max-width: 45px;
  line-height: 1.2;
  border: 1px solid;
  border-radius: 0px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.2s ease;
  font-family: 'Courier New', monospace;
  margin: 0px;
}

.preset-btn:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

/* Blue - Low Deviation (10%) */
.preset-btn-low {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  color: #e0e7ff;
  border-color: #3b82f6;
}

.preset-btn-low:hover {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  box-shadow: 0 0 8px rgba(37, 99, 235, 0.4);
}

/* Purple - Medium Deviation (30%) */
.preset-btn-medium {
  background: linear-gradient(135deg, #6b21a8 0%, #a855f7 100%);
  color: #f3e8ff;
  border-color: #d946ef;
}

.preset-btn-medium:hover {
  background: linear-gradient(135deg, #7c3aed 0%, #d946ef 100%);
  box-shadow: 0 0 8px rgba(217, 70, 239, 0.4);
}

/* Orange - High Deviation (50%) */
.preset-btn-high {
  background: linear-gradient(135deg, #92400e 0%, #f97316 100%);
  color: #ffedd5;
  border-color: #fb923c;
}

.preset-btn-high:hover {
  background: linear-gradient(135deg, #b45309 0%, #fb923c 100%);
  box-shadow: 0 0 8px rgba(249, 115, 22, 0.4);
}

/* Legend */
.legend-box {
  display: flex;
  gap: 12px;
  padding: 4px 6px;
  background: rgba(26, 31, 46, 5);
  border: 1px solid #2a3441;
  border-radius: 3px;
  font-size: 8px;
  color: #888;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.color-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.color-dot.low {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
}

.color-dot.medium {
  background: linear-gradient(135deg, #a855f7 0%, #d946ef 100%);
}

.color-dot.high {
  background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
}

/* Scrollbar */
.section-content::-webkit-scrollbar {
  width: 6px;
}

.section-content::-webkit-scrollbar-track {
  background: transparent;
}

.section-content::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 3);
  border-radius: 3px;
}

.section-content::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 5);
}
</style>
