<script setup>
import { ref, watch } from 'vue';
import { useRSIValues } from '~/composables/useRSIValues';
import '~/components/styles/rsi-styles.css';

const props = defineProps({
  exchange: {
    type: String,
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  autoFetch: {
    type: Boolean,
    default: true
  }
});

const { rsiValues, getRSIClass, fetchRSIValues, isLoadingRSI } = useRSIValues();
const showRSIInfo = ref(true);

// Drag state for RSI section
const isDragging = ref(false);
const dragOffsetX = ref(0);
const dragOffsetY = ref(0);
const rsiX = ref(0);
const rsiY = ref(0);

function startDrag(event) {
  if (event.button !== 0) return; // Only left mouse button
  isDragging.value = true;

  // Get RSI section element
  const rsiSection = document.querySelector('.rsi-config-section');
  if (!rsiSection) return;

  // Calculate offset between mouse and element position
  const rect = rsiSection.getBoundingClientRect();
  dragOffsetX.value = event.clientX - rect.left;
  dragOffsetY.value = event.clientY - rect.top;

  // Add event listeners
  document.addEventListener('mousemove', handleDragMove);
  document.addEventListener('mouseup', handleDragEnd);

  event.preventDefault();
}

function handleDragMove(event) {
  if (!isDragging.value) return;

  rsiX.value = event.clientX - dragOffsetX.value;
  rsiY.value = event.clientY - dragOffsetY.value;
}

function handleDragEnd() {
  isDragging.value = false;
  document.removeEventListener('mousemove', handleDragMove);
  document.removeEventListener('mouseup', handleDragEnd);
}

// Auto-fetch RSI if provided with exchange and symbol
if (props.autoFetch && props.exchange && props.symbol) {
  fetchRSIValues(props.exchange, props.symbol);
}

// Watch for prop changes to refetch
watch(
  () => [props.exchange, props.symbol],
  async () => {
    if (props.autoFetch && props.exchange && props.symbol) {
      await fetchRSIValues(props.exchange, props.symbol);
    }
  }
);
</script>

<template>
  <!-- RSI Information Section - Draggable -->
  <div
    class="rsi-config-section config-section"
    :style="{
      position: rsiX > 0 || rsiY > 0 ? 'fixed' : 'static',
      left: rsiX > 0 ? rsiX + 'px' : 'auto',
      top: rsiY > 0 ? rsiY + 'px' : 'auto',
      cursor: isDragging ? 'grabbing' : 'grab',
      zIndex: isDragging ? 1001 : 'auto'
    }"
  >
    <div class="section-header" @mousedown="startDrag" style="user-select: none;">
      <span>📊 RSI at Creation</span>
      <span class="collapse-icon" @click.stop="showRSIInfo = !showRSIInfo">{{ showRSIInfo ? '▼' : '▶' }}</span>
    </div>
    <div v-show="showRSIInfo" class="section-content rsi-section">
      <div v-if="isLoadingRSI" style="text-align: center; padding: 12px; color: #888;">
        <span>Loading RSI values...</span>
      </div>
      <div v-else class="rsi-grid">
        <div
          v-for="(value, timeframe) in rsiValues"
          :key="timeframe"
          class="rsi-item"
          :class="getRSIClass(value)"
        >
          <span class="rsi-timeframe">{{ timeframe }}</span>
          <span class="rsi-value">{{ value !== null ? value.toFixed(2) : '-' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  transition: background 0.2s;
}

.section-header:hover {
  background: #242936;
}

.collapse-icon {
  font-size: 9px;
  color: #666;
}

.section-content {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>