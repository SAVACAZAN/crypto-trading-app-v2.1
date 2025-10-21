<template>
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
    <!-- Card 1: Highest Price Paid -->
    <div style="background: #1a1a1a; padding: 12px; border-radius: 8px; border: 2px solid #f39c12;">
      <div style="color: #f39c12; font-size: 11px; font-weight: 700; margin-bottom: 8px; text-transform: uppercase;">
        Highest Price Paid
      </div>

      <div v-if="highestPriceOrder">
        <!-- Price -->
        <div style="font-size: 18px; color: #f39c12; font-weight: 700; margin-bottom: 4px;">
          ${{ highestPriceOrder.price.toFixed(4) }}
        </div>

        <!-- Order Details -->
        <div style="font-size: 9px; color: #aaa; margin-bottom: 8px;">
          <div style="margin-bottom: 2px;">
            <span style="color: #666;">Amount:</span> {{ formatNumber(highestPriceOrder.amount) }} {{ base }}
          </div>
          <div style="margin-bottom: 2px;">
            <span style="color: #666;">Cost:</span> ${{ formatNumber(highestPriceOrder.cost?.toFixed(2)) }}
          </div>
          <div style="margin-bottom: 2px;">
            <span style="color: #666;">Side:</span>
            <span :style="`color: ${highestPriceOrder.side === 'buy' ? '#20b2aa' : '#cd5c5c'}; font-weight: 600;`">
              {{ highestPriceOrder.side?.toUpperCase() }}
            </span>
          </div>
        </div>

        <!-- Date/Time -->
        <div style="font-size: 8px; color: #888; margin-bottom: 6px;">
          {{ highestPriceOrder.datetime ? formatDateTime(highestPriceOrder.datetime) : 'N/A' }}
        </div>

        <!-- API Key -->
        <div>
          <span :style="`color: ${apiKeyColors[highestPriceOrder.apiKeyName]}; font-weight: 600; font-size: 8px;`">
            [{{ highestPriceOrder.apiKeyName }}]
          </span>
        </div>
      </div>

      <div v-else style="font-size: 10px; color: #666; text-align: center; padding: 20px 0;">
        No orders available
      </div>
    </div>

    <!-- Card 2: Lowest Price Paid -->
    <div style="background: #1a1a1a; padding: 12px; border-radius: 8px; border: 2px solid #10eb04;">
      <div style="color: #10eb04; font-size: 11px; font-weight: 700; margin-bottom: 8px; text-transform: uppercase;">
        Lowest Price Paid
      </div>

      <div v-if="lowestPriceOrder">
        <!-- Price -->
        <div style="font-size: 18px; color: #10eb04; font-weight: 700; margin-bottom: 4px;">
          ${{ lowestPriceOrder.price.toFixed(4) }}
        </div>

        <!-- Order Details -->
        <div style="font-size: 9px; color: #aaa; margin-bottom: 8px;">
          <div style="margin-bottom: 2px;">
            <span style="color: #666;">Amount:</span> {{ formatNumber(lowestPriceOrder.amount) }} {{ base }}
          </div>
          <div style="margin-bottom: 2px;">
            <span style="color: #666;">Cost:</span> ${{ formatNumber(lowestPriceOrder.cost?.toFixed(2)) }}
          </div>
          <div style="margin-bottom: 2px;">
            <span style="color: #666;">Side:</span>
            <span :style="`color: ${lowestPriceOrder.side === 'buy' ? '#20b2aa' : '#cd5c5c'}; font-weight: 600;`">
              {{ lowestPriceOrder.side?.toUpperCase() }}
            </span>
          </div>
        </div>

        <!-- Date/Time -->
        <div style="font-size: 8px; color: #888; margin-bottom: 6px;">
          {{ lowestPriceOrder.datetime ? formatDateTime(lowestPriceOrder.datetime) : 'N/A' }}
        </div>

        <!-- API Key -->
        <div>
          <span :style="`color: ${apiKeyColors[lowestPriceOrder.apiKeyName]}; font-weight: 600; font-size: 8px;`">
            [{{ lowestPriceOrder.apiKeyName }}]
          </span>
        </div>
      </div>

      <div v-else style="font-size: 10px; color: #666; text-align: center; padding: 20px 0;">
        No orders available
      </div>
    </div>

    <!-- Card 3: Largest Single Order -->
    <div style="background: #1a1a1a; padding: 12px; border-radius: 8px; border: 2px solid #e74c3c;">
      <div style="color: #e74c3c; font-size: 11px; font-weight: 700; margin-bottom: 8px; text-transform: uppercase;">
        Largest Single Order
      </div>

      <div v-if="largestOrder">
        <!-- Cost (Main Value) -->
        <div style="font-size: 18px; color: #e74c3c; font-weight: 700; margin-bottom: 4px;">
          ${{ formatNumber(largestOrder.cost?.toFixed(2)) }}
        </div>

        <!-- Order Details -->
        <div style="font-size: 9px; color: #aaa; margin-bottom: 8px;">
          <div style="margin-bottom: 2px;">
            <span style="color: #666;">Amount:</span> {{ formatNumber(largestOrder.amount) }} {{ base }}
          </div>
          <div style="margin-bottom: 2px;">
            <span style="color: #666;">Price:</span> ${{ largestOrder.price.toFixed(4) }}
          </div>
          <div style="margin-bottom: 2px;">
            <span style="color: #666;">Side:</span>
            <span :style="`color: ${largestOrder.side === 'buy' ? '#20b2aa' : '#cd5c5c'}; font-weight: 600;`">
              {{ largestOrder.side?.toUpperCase() }}
            </span>
          </div>
        </div>

        <!-- Date/Time -->
        <div style="font-size: 8px; color: #888; margin-bottom: 6px;">
          {{ largestOrder.datetime ? formatDateTime(largestOrder.datetime) : 'N/A' }}
        </div>

        <!-- API Key -->
        <div>
          <span :style="`color: ${apiKeyColors[largestOrder.apiKeyName]}; font-weight: 600; font-size: 8px;`">
            [{{ largestOrder.apiKeyName }}]
          </span>
        </div>
      </div>

      <div v-else style="font-size: 10px; color: #666; text-align: center; padding: 20px 0;">
        No orders available
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  allOrders: {
    type: Array,
    default: () => []
  },
  selectedApiKeys: {
    type: Array,
    default: () => []
  },
  apiKeyColors: {
    type: Object,
    default: () => ({})
  },
  base: {
    type: String,
    default: ''
  },
  quote: {
    type: String,
    default: 'USD'
  }
});

// Filter orders based on selected API keys
const filteredOrders = computed(() => {
  if (props.selectedApiKeys.length === 0) {
    return props.allOrders;
  }
  return props.allOrders.filter(order =>
    props.selectedApiKeys.includes(order.apiKeyName)
  );
});

// Computed: Highest Price Order
const highestPriceOrder = computed(() => {
  if (filteredOrders.value.length === 0) return null;
  return [...filteredOrders.value].sort((a, b) => (b.price || 0) - (a.price || 0))[0];
});

// Computed: Lowest Price Order
const lowestPriceOrder = computed(() => {
  if (filteredOrders.value.length === 0) return null;
  return [...filteredOrders.value]
    .filter(o => o.price > 0)
    .sort((a, b) => (a.price || 0) - (b.price || 0))[0];
});

// Computed: Largest Order (by cost/volume)
const largestOrder = computed(() => {
  if (filteredOrders.value.length === 0) return null;
  return [...filteredOrders.value].sort((a, b) => (b.cost || 0) - (a.cost || 0))[0];
});

// Utility: Format number with thousand separators
function formatNumber(value) {
  if (typeof value === 'string' || typeof value === 'number') {
    let numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      return numericValue.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
  }
  return value;
}

// Utility: Format date/time
function formatDateTime(datetime) {
  if (!datetime) return 'N/A';
  const date = new Date(datetime);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
