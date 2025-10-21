<template>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">

    <!-- Card: LAST 1000 BUY ORDERS (Chronological) - BY API KEY -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #20b2aa;">
      <div style="color: #20b2aa; font-size: 9px; font-weight: 700; margin-bottom: 6px;">🟢 LAST 1000 BUY ORDERS BY API</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 6px;">Most recent per API key</div>

      <!-- Breakdown by API Key -->
      <div v-for="apiKey in selectedApiKeys" :key="apiKey" style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #333;">
        <div :style="`color: ${apiKeyColors[apiKey]}; font-size: 8px; font-weight: 700; margin-bottom: 4px;`">
          {{ apiKey }} - Last {{ last1000BuyPerApi[apiKey]?.length || 0 }} Buy Orders
        </div>
        <div v-for="(order, i) in (showMoreBuyPerApi[apiKey] ? last1000BuyPerApi[apiKey] : last1000BuyPerApi[apiKey]?.slice(0, 10))" :key="i" style="font-size: 7px; color: #aaa; margin-bottom: 2px; line-height: 1.4; padding-left: 6px;">
          {{ i + 1 }}. <span style="color: #666; font-size: 6px;">ID: {{ order.orderId || 'N/A' }}</span> |
          {{ formatNumber(order.amount) }} @ ${{ order.price.toFixed(4) }}
          = <span style="color: #20b2aa; font-weight: 600;">${{ formatNumber(order.cost?.toFixed(2)) }}</span>
          - 📅 {{ new Date(order.datetime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) }}
          🕒 {{ new Date(order.datetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }}
        </div>
        <button v-if="last1000BuyPerApi[apiKey]?.length > 10" @click="showMoreBuyPerApi[apiKey] = !showMoreBuyPerApi[apiKey]" style="font-size: 7px; color: #20b2aa; background: transparent; border: 1px solid #20b2aa; padding: 3px 8px; border-radius: 3px; cursor: pointer; margin-top: 4px; width: 100%;">
          {{ showMoreBuyPerApi[apiKey] ? 'Show Less ▲' : `Show More ▼ (${last1000BuyPerApi[apiKey]?.length - 10} more)` }}
        </button>
        <div style="font-size: 7px; color: #888; margin-top: 3px; padding-left: 6px;">
          Total: ${{ formatNumber((last1000BuyPerApi[apiKey]?.reduce((sum, o) => sum + (o.cost || 0), 0) || 0).toFixed(2)) }}
        </div>
      </div>
    </div>

    <!-- Card: LAST 1000 SELL ORDERS (Chronological) - BY API KEY -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #cd5c5c;">
      <div style="color: #cd5c5c; font-size: 9px; font-weight: 700; margin-bottom: 6px;">🔴 LAST 1000 SELL ORDERS BY API</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 6px;">Most recent per API key</div>

      <!-- Breakdown by API Key -->
      <div v-for="apiKey in selectedApiKeys" :key="apiKey" style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #333;">
        <div :style="`color: ${apiKeyColors[apiKey]}; font-size: 8px; font-weight: 700; margin-bottom: 4px;`">
          {{ apiKey }} - Last {{ last1000SellPerApi[apiKey]?.length || 0 }} Sell Orders
        </div>
        <div v-for="(order, i) in (showMoreSellPerApi[apiKey] ? last1000SellPerApi[apiKey] : last1000SellPerApi[apiKey]?.slice(0, 10))" :key="i" style="font-size: 7px; color: #aaa; margin-bottom: 2px; line-height: 1.4; padding-left: 6px;">
          {{ i + 1 }}. <span style="color: #666; font-size: 6px;">ID: {{ order.orderId || 'N/A' }}</span> |
          {{ formatNumber(order.amount) }} @ ${{ order.price.toFixed(4) }}
          = <span style="color: #cd5c5c; font-weight: 600;">${{ formatNumber(order.cost?.toFixed(2)) }}</span>
          - 📅 {{ new Date(order.datetime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) }}
          🕒 {{ new Date(order.datetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }}
        </div>
        <button v-if="last1000SellPerApi[apiKey]?.length > 10" @click="showMoreSellPerApi[apiKey] = !showMoreSellPerApi[apiKey]" style="font-size: 7px; color: #cd5c5c; background: transparent; border: 1px solid #cd5c5c; padding: 3px 8px; border-radius: 3px; cursor: pointer; margin-top: 4px; width: 100%;">
          {{ showMoreSellPerApi[apiKey] ? 'Show Less ▲' : `Show More ▼ (${last1000SellPerApi[apiKey]?.length - 10} more)` }}
        </button>
        <div style="font-size: 7px; color: #888; margin-top: 3px; padding-left: 6px;">
          Total: ${{ formatNumber((last1000SellPerApi[apiKey]?.reduce((sum, o) => sum + (o.cost || 0), 0) || 0).toFixed(2)) }}
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  allOrders: {
    type: Array,
    required: true
  },
  selectedApiKeys: {
    type: Array,
    required: true
  },
  apiKeyColors: {
    type: Object,
    required: true
  }
});

// Show More/Less toggles per API key
const showMoreBuyPerApi = ref({});
const showMoreSellPerApi = ref({});

// Buy and Sell orders
const buyOrders = computed(() => {
  return props.allOrders.filter(order => order.side === 'buy');
});

const sellOrders = computed(() => {
  return props.allOrders.filter(order => order.side === 'sell');
});

// LAST 1000 BUY ORDERS PER API KEY
const last1000BuyPerApi = computed(() => {
  const breakdown = {};
  props.selectedApiKeys.forEach(apiKey => {
    breakdown[apiKey] = [...buyOrders.value]
      .filter(order => order.apiKeyName === apiKey)
      .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
      .slice(0, 1000); // Get last 1000 per API
  });
  return breakdown;
});

// LAST 1000 SELL ORDERS PER API KEY
const last1000SellPerApi = computed(() => {
  const breakdown = {};
  props.selectedApiKeys.forEach(apiKey => {
    breakdown[apiKey] = [...sellOrders.value]
      .filter(order => order.apiKeyName === apiKey)
      .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
      .slice(0, 1000); // Get last 1000 per API
  });
  return breakdown;
});

// Utility function to format numbers
function formatNumber(num) {
  if (!num) return '0';
  const numStr = num.toString();
  const parts = numStr.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}
</script>
