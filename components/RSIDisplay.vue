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
  <!-- RSI Information Section -->
  <div class="config-section">
    <div class="section-header" @click="showRSIInfo = !showRSIInfo">
      <span>📊 RSI at Creation</span>
      <span class="collapse-icon">{{ showRSIInfo ? '▼' : '▶' }}</span>
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