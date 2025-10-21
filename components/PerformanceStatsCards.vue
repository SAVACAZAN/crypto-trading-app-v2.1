<template>
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
    <!-- Card 1: Volume per API -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #46f012;">
      <div style="color: #46f012; font-size: 9px; font-weight: 700; margin-bottom: 6px;">📦 VOLUME PER API</div>
      <div style="font-size: 8px; color: #888; margin-bottom: 6px;">Top 10 API Keys by Total Volume</div>
      <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
        <div v-for="(item, i) in volumePerApi.slice(0, 10)" :key="i" style="font-size: 7px; margin-bottom: 2px;">
          <span style="color: #666;">{{ i + 1 }}.</span>
          <span :style="`color: ${apiKeyColors[item.apiKey]}; font-weight: 600;`">{{ item.apiKey }}</span>:
          <span style="color: #46f012; font-weight: 600;">{{ formatNumber(item.volume.toFixed(2)) }} {{ base }}</span>
        </div>
        <div v-if="volumePerApi.length === 0" style="font-size: 7px; color: #666; text-align: center; padding: 8px 0;">
          No data available
        </div>
      </div>
    </div>

    <!-- Card 2: Cost per API -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #13e6f5;">
      <div style="color: #13e6f5; font-size: 9px; font-weight: 700; margin-bottom: 6px;">💵 COST PER API</div>
      <div style="font-size: 8px; color: #888; margin-bottom: 6px;">Top 10 API Keys by Total Cost</div>
      <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
        <div v-for="(item, i) in costPerApi.slice(0, 10)" :key="i" style="margin-bottom: 4px;">
          <div style="font-size: 7px;">
            <span style="color: #666;">{{ i + 1 }}.</span>
            <span :style="`color: ${apiKeyColors[item.apiKey]}; font-weight: 600;`">{{ item.apiKey }}</span>:
            <span style="color: #13e6f5; font-weight: 600;">${{ formatNumber(item.cost.toFixed(2)) }}</span>
          </div>
          <div style="font-size: 6px; color: #888; margin-top: 1px; padding-left: 12px;">
            <span style="color: #20b2aa;">buy: ${{ formatNumber(item.buy.toFixed(2)) }}</span> |
            <span style="color: #cd5c5c;">sell: ${{ formatNumber(item.sell.toFixed(2)) }}</span>
          </div>
        </div>
        <div v-if="costPerApi.length === 0" style="font-size: 7px; color: #666; text-align: center; padding: 8px 0;">
          No data available
        </div>
      </div>
    </div>

    <!-- Card 3: Average Order Size per API -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #e2c102;">
      <div style="color: #e2c102; font-size: 9px; font-weight: 700; margin-bottom: 6px;">📏 AVG ORDER SIZE PER API</div>
      <div style="font-size: 8px; color: #888; margin-bottom: 6px;">Top 10 API Keys by Average Size</div>
      <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
        <div v-for="(item, i) in avgOrderSizePerApi.slice(0, 10)" :key="i" style="margin-bottom: 4px;">
          <div style="font-size: 7px;">
            <span style="color: #666;">{{ i + 1 }}.</span>
            <span :style="`color: ${apiKeyColors[item.apiKey]}; font-weight: 600;`">{{ item.apiKey }}</span>:
            <span style="color: #e2c102; font-weight: 600;">{{ formatNumber(item.avgSize.toFixed(2)) }} {{ base }}</span>
          </div>
          <div style="font-size: 6px; color: #888; margin-top: 1px; padding-left: 12px;">
            <span style="color: #20b2aa;">buy: {{ formatNumber(item.avgBuySize.toFixed(2)) }} {{ base }}</span> |
            <span style="color: #cd5c5c;">sell: {{ formatNumber(item.avgSellSize.toFixed(2)) }} {{ base }}</span>
          </div>
        </div>
        <div v-if="avgOrderSizePerApi.length === 0" style="font-size: 7px; color: #666; text-align: center; padding: 8px 0;">
          No data available
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// Props
const props = defineProps({
  allOrders: {
    type: Array,
    required: true,
    default: () => []
  },
  selectedApiKeys: {
    type: Array,
    required: true,
    default: () => []
  },
  apiKeyColors: {
    type: Object,
    required: true,
    default: () => ({})
  },
  base: {
    type: String,
    required: true,
    default: ''
  }
});

// Computed property: Volume per API (sorted by volume descending)
const volumePerApi = computed(() => {
  const breakdown = {};
  props.selectedApiKeys.forEach(apiKey => {
    const apiOrders = props.allOrders.filter(o => o.apiKeyName === apiKey);
    breakdown[apiKey] = apiOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  });
  return Object.entries(breakdown)
    .map(([apiKey, volume]) => ({ apiKey, volume }))
    .sort((a, b) => b.volume - a.volume);
});

// Computed property: Cost per API (sorted by cost descending) with buy/sell breakdown
const costPerApi = computed(() => {
  const breakdown = {};
  props.selectedApiKeys.forEach(apiKey => {
    const apiOrders = props.allOrders.filter(o => o.apiKeyName === apiKey);
    const buyCost = apiOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + (o.cost || 0), 0);
    const sellCost = apiOrders.filter(o => o.side === 'sell').reduce((sum, o) => sum + (o.cost || 0), 0);
    breakdown[apiKey] = {
      total: buyCost + sellCost,
      buy: buyCost,
      sell: sellCost
    };
  });
  return Object.entries(breakdown)
    .map(([apiKey, costs]) => ({ apiKey, cost: costs.total, buy: costs.buy, sell: costs.sell }))
    .sort((a, b) => b.cost - a.cost);
});

// Computed property: Average order size per API with buy/sell breakdown
const avgOrderSizePerApi = computed(() => {
  const breakdown = {};
  props.selectedApiKeys.forEach(apiKey => {
    const apiOrders = props.allOrders.filter(o => o.apiKeyName === apiKey);
    const buyOrders = apiOrders.filter(o => o.side === 'buy');
    const sellOrders = apiOrders.filter(o => o.side === 'sell');

    const totalVolume = apiOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const buyVolume = buyOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const sellVolume = sellOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

    breakdown[apiKey] = {
      total: apiOrders.length > 0 ? totalVolume / apiOrders.length : 0,
      buy: buyOrders.length > 0 ? buyVolume / buyOrders.length : 0,
      sell: sellOrders.length > 0 ? sellVolume / sellOrders.length : 0
    };
  });
  return Object.entries(breakdown)
    .map(([apiKey, sizes]) => ({ apiKey, avgSize: sizes.total, avgBuySize: sizes.buy, avgSellSize: sizes.sell }))
    .sort((a, b) => b.avgSize - a.avgSize);
});

// Utility function: Format numbers with thousands separator
function formatNumber(value, columnName) {
  if (typeof value === 'string' || typeof value === 'number') {
    let numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      if (columnName !== 'AveragePrice' && columnName !== 'Price') {
        return numericValue.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
      } else {
        return numericValue.toFixed(4);
      }
    }
  }
  return value;
}
</script>
