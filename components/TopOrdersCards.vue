<template>
  <div>
    <n-card style="background: #0f0f0f; margin-bottom: 16px;">
      <n-text strong style="color: #f5a623; font-size: 13px; display: block; margin-bottom: 12px;">🔝 TOP ORDERS ANALYSIS</n-text>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">

        <!-- Analysis Card 1: Top Orders by Volume -->
        <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #10eb04;">
          <div style="color: #10eb04; font-size: 9px; font-weight: 700; margin-bottom: 6px;">🔝 TOP 50 BY VOLUME</div>
          <div v-for="(order, i) in (showMoreVolume ? topOrdersByVolume.slice(0, 50) : topOrdersByVolume.slice(0, 5))" :key="i" style="font-size: 7px; color: #aaa; margin-bottom: 2px; line-height: 1.4;">
            {{ i + 1 }}. {{ formatNumber(order.amount) }} @ ${{ order.price.toFixed(4) }}
            <span :style="`color: ${order.side === 'buy' ? '#20b2aa' : '#cd5c5c'}; font-weight: 700;`">({{ order.side }})</span>
            - 📅 {{ new Date(order.datetime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) }}
            🕒 {{ new Date(order.datetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }}
            - Cost: ${{ formatNumber(order.cost?.toFixed(2)) }}
            <span :style="`color: ${apiKeyColors[order.apiKeyName]}; font-weight: 600; margin-left: 4px;`">[{{ order.apiKeyName }}]</span>
          </div>
          <button v-if="topOrdersByVolume.length > 5" @click="showMoreVolume = !showMoreVolume" style="font-size: 7px; color: #10eb04; background: transparent; border: 1px solid #10eb04; padding: 3px 8px; border-radius: 3px; cursor: pointer; margin-top: 4px; width: 100%;">
            {{ showMoreVolume ? 'Show Less ▲' : `Show More ▼ (${topOrdersByVolume.length - 5} more)` }}
          </button>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
            <div style="font-size: 7px; color: #888; font-weight: 700; margin-bottom: 3px;">TOP API:</div>
            <div v-for="(item, i) in volumePerApi.slice(0, 3)" :key="i" style="font-size: 7px; margin-bottom: 2px;">
              <span :style="`color: ${apiKeyColors[item.apiKey]}; font-weight: 600;`">{{ item.apiKey }}</span>: {{ formatNumber(item.volume.toFixed(2)) }}
            </div>
          </div>
        </div>

        <!-- Analysis Card 2: Top Orders by Cost -->
        <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #f39c12;">
          <div style="color: #f39c12; font-size: 9px; font-weight: 700; margin-bottom: 6px;">💰 TOP 50 BY COST</div>
          <div v-for="(order, i) in (showMoreCost ? topOrdersByCost.slice(0, 50) : topOrdersByCost.slice(0, 5))" :key="i" style="font-size: 7px; color: #aaa; margin-bottom: 2px; line-height: 1.4;">
            {{ i + 1 }}. ${{ formatNumber(order.cost?.toFixed(2)) }}
            <span :style="`color: ${order.side === 'buy' ? '#20b2aa' : '#cd5c5c'}; font-weight: 700;`">({{ order.side }})</span>
            - 📅 {{ new Date(order.datetime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) }}
            🕒 {{ new Date(order.datetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }}
            - Qty: {{ formatNumber(order.amount?.toFixed(2)) }} @ ${{ order.price?.toFixed(4) }}
            <span :style="`color: ${apiKeyColors[order.apiKeyName]}; font-weight: 600; margin-left: 4px;`">[{{ order.apiKeyName }}]</span>
          </div>
          <button v-if="topOrdersByCost.length > 5" @click="showMoreCost = !showMoreCost" style="font-size: 7px; color: #f39c12; background: transparent; border: 1px solid #f39c12; padding: 3px 8px; border-radius: 3px; cursor: pointer; margin-top: 4px; width: 100%;">
            {{ showMoreCost ? 'Show Less ▲' : `Show More ▼ (${topOrdersByCost.length - 5} more)` }}
          </button>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
            <div style="font-size: 7px; color: #888; font-weight: 700; margin-bottom: 3px;">TOP API:</div>
            <div v-for="(item, i) in costPerApi.slice(0, 3)" :key="i" style="font-size: 7px; margin-bottom: 3px;">
              <span :style="`color: ${apiKeyColors[item.apiKey]}; font-weight: 600;`">{{ item.apiKey }}</span>: ${{ formatNumber(item.cost.toFixed(2)) }}
              <div style="font-size: 6px; color: #888; margin-top: 1px; padding-left: 4px;">
                <span style="color: #20b2aa;">buy: ${{ formatNumber(item.buy.toFixed(2)) }}</span> |
                <span style="color: #cd5c5c;">sell: ${{ formatNumber(item.sell.toFixed(2)) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Analysis Card: Orders > $1000 -->
        <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #ffd700;">
          <div style="color: #ffd700; font-size: 9px; font-weight: 700; margin-bottom: 6px;">💎 ORDERS > $1,000</div>
          <div style="font-size: 11px; color: #ffd700; font-weight: 700;">{{ ordersAbove1000.length }}</div>
          <div style="font-size: 8px; color: #888;">Total: ${{ formatNumber(ordersAbove1000Total.toFixed(2)) }}</div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
            <div v-for="(item, i) in orders1000PerApi" :key="i" style="font-size: 7px; margin-bottom: 2px;">
              <span :style="`color: ${apiKeyColors[item.apiKey]}; font-weight: 600;`">{{ item.apiKey }}</span>: {{ item.count }} (${{ formatNumber(item.total.toFixed(2)) }})
            </div>
          </div>
        </div>

        <!-- Analysis Card: Orders > $10,000 -->
        <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #ff1493;">
          <div style="color: #ff1493; font-size: 9px; font-weight: 700; margin-bottom: 6px;">💰 ORDERS > $10,000</div>
          <div style="font-size: 11px; color: #ff1493; font-weight: 700;">{{ ordersAbove10000.length }}</div>
          <div style="font-size: 8px; color: #888;">Total: ${{ formatNumber(ordersAbove10000Total.toFixed(2)) }}</div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
            <div v-for="(item, i) in orders10000PerApi" :key="i" style="font-size: 7px; margin-bottom: 2px;">
              <span :style="`color: ${apiKeyColors[item.apiKey]}; font-weight: 600;`">{{ item.apiKey }}</span>: {{ item.count }} (${{ formatNumber(item.total.toFixed(2)) }})
            </div>
          </div>
        </div>

        <!-- Analysis Card: Top Sell Orders > $1000 -->
        <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #ff4500;">
          <div style="color: #ff4500; font-size: 9px; font-weight: 700; margin-bottom: 6px;">📉 TOP SELLS > $1K</div>
          <div v-for="(order, i) in topSellsAbove1000.slice(0, 3)" :key="i" style="font-size: 8px; color: #aaa; margin-bottom: 2px;">
            {{ i + 1 }}. ${{ formatNumber(order.cost?.toFixed(2)) }}
            <span :style="`color: ${apiKeyColors[order.apiKeyName]}; font-weight: 600; margin-left: 4px; font-size: 7px;`">[{{ order.apiKeyName }}]</span>
          </div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
            <div style="font-size: 7px; color: #888; font-weight: 700; margin-bottom: 3px;">TOP API:</div>
            <div v-for="(item, i) in topSells1000PerApi.slice(0, 3)" :key="i" style="font-size: 7px; margin-bottom: 2px;">
              <span :style="`color: ${apiKeyColors[item.apiKey]}; font-weight: 600;`">{{ item.apiKey }}</span>: {{ item.count }} (${{ formatNumber(item.total.toFixed(2)) }})
            </div>
          </div>
        </div>

        <!-- Analysis Card: Top Sell Orders > $10000 -->
        <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #b22222;">
          <div style="color: #b22222; font-size: 9px; font-weight: 700; margin-bottom: 6px;">📉 TOP SELLS > $10K</div>
          <div v-for="(order, i) in topSellsAbove10000.slice(0, 3)" :key="i" style="font-size: 8px; color: #aaa; margin-bottom: 2px;">
            {{ i + 1 }}. ${{ formatNumber(order.cost?.toFixed(2)) }}
            <span :style="`color: ${apiKeyColors[order.apiKeyName]}; font-weight: 600; margin-left: 4px; font-size: 7px;`">[{{ order.apiKeyName }}]</span>
          </div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
            <div style="font-size: 7px; color: #888; font-weight: 700; margin-bottom: 3px;">TOP API:</div>
            <div v-for="(item, i) in topSells10000PerApi.slice(0, 3)" :key="i" style="font-size: 7px; margin-bottom: 2px;">
              <span :style="`color: ${apiKeyColors[item.apiKey]}; font-weight: 600;`">{{ item.apiKey }}</span>: {{ item.count }} (${{ formatNumber(item.total.toFixed(2)) }})
            </div>
          </div>
        </div>

        <!-- Analysis Card: Largest Single Order -->
        <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #ff6347;">
          <div style="color: #ff6347; font-size: 9px; font-weight: 700; margin-bottom: 6px;">🏆 LARGEST ORDER</div>
          <div v-if="largestOrder" style="font-size: 8px; color: #aaa;">
            {{ formatNumber(largestOrder.amount) }} @ ${{ largestOrder.price.toFixed(4) }}
            <div style="color: #ff6347; font-weight: 700;">${{ formatNumber(largestOrder.cost?.toFixed(2)) }}</div>
            <span :style="`color: ${apiKeyColors[largestOrder.apiKeyName]}; font-weight: 600; font-size: 7px;`">[{{ largestOrder.apiKeyName }}]</span>
          </div>
        </div>

        <!-- Analysis Card: Smallest Single Order -->
        <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #888;">
          <div style="color: #888; font-size: 9px; font-weight: 700; margin-bottom: 6px;">🔻 SMALLEST ORDER</div>
          <div v-if="smallestOrder" style="font-size: 8px; color: #aaa;">
            {{ formatNumber(smallestOrder.amount) }} @ ${{ smallestOrder.price.toFixed(4) }}
            <div style="color: #888; font-weight: 700;">${{ formatNumber(smallestOrder.cost?.toFixed(2)) }}</div>
            <span :style="`color: ${apiKeyColors[smallestOrder.apiKeyName]}; font-weight: 600; font-size: 7px;`">[{{ smallestOrder.apiKeyName }}]</span>
          </div>
        </div>

      </div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  allOrders: { type: Array, required: true },
  selectedApiKeys: { type: Array, required: true },
  apiKeyColors: { type: Object, required: true }
});

const showMoreVolume = ref(false);
const showMoreCost = ref(false);

// Filtered orders
const filteredOrders = computed(() => {
  if (props.selectedApiKeys.length === 0) return [];
  return props.allOrders.filter(order =>
    props.selectedApiKeys.includes(order.apiKeyName)
  );
});

// Top orders by volume
const topOrdersByVolume = computed(() => {
  return [...filteredOrders.value]
    .sort((a, b) => (b.amount || 0) - (a.amount || 0))
    .slice(0, 50);
});

// Top orders by cost
const topOrdersByCost = computed(() => {
  return [...filteredOrders.value]
    .sort((a, b) => (b.cost || 0) - (a.cost || 0))
    .slice(0, 50);
});

// Volume per API
const volumePerApi = computed(() => {
  const result = {};
  filteredOrders.value.forEach(order => {
    const apiKey = order.apiKeyName;
    if (!result[apiKey]) result[apiKey] = 0;
    result[apiKey] += (order.filled || order.amount || 0);
  });
  return Object.entries(result)
    .map(([apiKey, volume]) => ({ apiKey, volume }))
    .sort((a, b) => b.volume - a.volume);
});

// Cost per API
const costPerApi = computed(() => {
  const result = {};
  filteredOrders.value.forEach(order => {
    const apiKey = order.apiKeyName;
    if (!result[apiKey]) result[apiKey] = { cost: 0, buy: 0, sell: 0 };
    result[apiKey].cost += (order.cost || 0);
    if (order.side === 'buy') {
      result[apiKey].buy += (order.cost || 0);
    } else {
      result[apiKey].sell += (order.cost || 0);
    }
  });
  return Object.entries(result)
    .map(([apiKey, data]) => ({ apiKey, ...data }))
    .sort((a, b) => b.cost - a.cost);
});

// Orders above $1000
const ordersAbove1000 = computed(() => {
  return filteredOrders.value.filter(order => (order.cost || 0) > 1000);
});

const ordersAbove1000Total = computed(() => {
  return ordersAbove1000.value.reduce((sum, order) => sum + (order.cost || 0), 0);
});

const orders1000PerApi = computed(() => {
  const result = {};
  ordersAbove1000.value.forEach(order => {
    const apiKey = order.apiKeyName;
    if (!result[apiKey]) result[apiKey] = { count: 0, total: 0 };
    result[apiKey].count++;
    result[apiKey].total += (order.cost || 0);
  });
  return Object.entries(result)
    .map(([apiKey, data]) => ({ apiKey, ...data }))
    .sort((a, b) => b.total - a.total);
});

// Orders above $10000
const ordersAbove10000 = computed(() => {
  return filteredOrders.value.filter(order => (order.cost || 0) > 10000);
});

const ordersAbove10000Total = computed(() => {
  return ordersAbove10000.value.reduce((sum, order) => sum + (order.cost || 0), 0);
});

const orders10000PerApi = computed(() => {
  const result = {};
  ordersAbove10000.value.forEach(order => {
    const apiKey = order.apiKeyName;
    if (!result[apiKey]) result[apiKey] = { count: 0, total: 0 };
    result[apiKey].count++;
    result[apiKey].total += (order.cost || 0);
  });
  return Object.entries(result)
    .map(([apiKey, data]) => ({ apiKey, ...data }))
    .sort((a, b) => b.total - a.total);
});

// Top sells above $1000
const topSellsAbove1000 = computed(() => {
  return filteredOrders.value
    .filter(order => order.side === 'sell' && (order.cost || 0) > 1000)
    .sort((a, b) => (b.cost || 0) - (a.cost || 0))
    .slice(0, 10);
});

const topSells1000PerApi = computed(() => {
  const result = {};
  filteredOrders.value
    .filter(order => order.side === 'sell' && (order.cost || 0) > 1000)
    .forEach(order => {
      const apiKey = order.apiKeyName;
      if (!result[apiKey]) result[apiKey] = { count: 0, total: 0 };
      result[apiKey].count++;
      result[apiKey].total += (order.cost || 0);
    });
  return Object.entries(result)
    .map(([apiKey, data]) => ({ apiKey, ...data }))
    .sort((a, b) => b.total - a.total);
});

// Top sells above $10000
const topSellsAbove10000 = computed(() => {
  return filteredOrders.value
    .filter(order => order.side === 'sell' && (order.cost || 0) > 10000)
    .sort((a, b) => (b.cost || 0) - (a.cost || 0))
    .slice(0, 10);
});

const topSells10000PerApi = computed(() => {
  const result = {};
  filteredOrders.value
    .filter(order => order.side === 'sell' && (order.cost || 0) > 10000)
    .forEach(order => {
      const apiKey = order.apiKeyName;
      if (!result[apiKey]) result[apiKey] = { count: 0, total: 0 };
      result[apiKey].count++;
      result[apiKey].total += (order.cost || 0);
    });
  return Object.entries(result)
    .map(([apiKey, data]) => ({ apiKey, ...data }))
    .sort((a, b) => b.total - a.total);
});

// Largest/Smallest orders
const largestOrder = computed(() => {
  return filteredOrders.value.reduce((max, order) =>
    (!max || (order.cost || 0) > (max.cost || 0)) ? order : max, null
  );
});

const smallestOrder = computed(() => {
  return filteredOrders.value.reduce((min, order) =>
    (!min || ((order.cost || 0) < (min.cost || 0) && (order.cost || 0) > 0)) ? order : min, null
  );
});

// Helper function
function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  const num = parseFloat(value);
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
  if (num >= 1) return num.toFixed(2);
  if (num >= 0.01) return num.toFixed(4);
  return num.toFixed(6);
}
</script>