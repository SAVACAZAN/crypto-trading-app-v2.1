<template>
  <div>
    <!-- ANALYSIS SECTION -->
    <n-card style="background: #0f0f0f; margin-bottom: 16px;">
      <n-text strong style="color: #f5a623; font-size: 13px; display: block; margin-bottom: 12px;">📊 CLOSED ORDERS ANALYSIS</n-text>

      <!-- Analysis Grid -->
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

        <!-- Analysis Card 3: Total Volume -->
        <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #46f012;">
          <div style="color: #46f012; font-size: 9px; font-weight: 700; margin-bottom: 6px;">📦 TOTAL VOLUME</div>
          <div style="font-size: 11px; color: #46f012; font-weight: 700;">{{ formatNumber(totalVolume.toFixed(2)) }} {{ base }}</div>
          <div style="font-size: 8px; color: #888;">Across {{ totalOrdersCount }} orders</div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
            <div v-for="(item, i) in volumePerApi" :key="i" style="font-size: 7px; margin-bottom: 2px;">
              <span :style="`color: ${apiKeyColors[item.apiKey]}; font-weight: 600;`">{{ item.apiKey }}</span>: {{ formatNumber(item.volume.toFixed(2)) }}
            </div>
          </div>
        </div>

        <!-- Analysis Card 4: Total Cost -->
        <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #13e6f5;">
          <div style="color: #13e6f5; font-size: 9px; font-weight: 700; margin-bottom: 6px;">💵 TOTAL COST</div>
          <div style="font-size: 11px; color: #13e6f5; font-weight: 700;">${{ formatNumber(totalCost.toFixed(2)) }}</div>
          <div style="font-size: 8px; color: #888;">All closed orders</div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
            <div v-for="(item, i) in costPerApi" :key="i" style="font-size: 7px; margin-bottom: 2px;">
              <span :style="`color: ${apiKeyColors[item.apiKey]}; font-weight: 600;`">{{ item.apiKey }}</span>: ${{ formatNumber(item.cost.toFixed(2)) }}
            </div>
          </div>
        </div>

        <!-- Analysis Card 5: Average Order Size -->
        <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #e2c102;">
          <div style="color: #e2c102; font-size: 9px; font-weight: 700; margin-bottom: 6px;">📏 AVG ORDER SIZE</div>
          <div style="font-size: 11px; color: #e2c102; font-weight: 700;">{{ formatNumber(averageOrderSize.toFixed(2)) }} {{ base }}</div>
          <div style="font-size: 8px; color: #888;">Per order</div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
            <div v-for="(item, i) in avgOrderSizePerApi" :key="i" style="font-size: 7px; margin-bottom: 2px;">
              <span :style="`color: ${apiKeyColors[item.apiKey]}; font-weight: 600;`">{{ item.apiKey }}</span>: {{ formatNumber(item.avgSize.toFixed(2)) }}
            </div>
          </div>
        </div>

        <!-- Analysis Card 6: Buy vs Sell Ratio -->
        <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #e2735f;">
          <div style="color: #e2735f; font-size: 9px; font-weight: 700; margin-bottom: 6px;">⚖️ BUY/SELL RATIO</div>
          <div style="font-size: 10px; color: #10eb04;">BUY: {{ buyOrdersCount }} ({{ buyPercentage }}%)</div>
          <div style="font-size: 10px; color: #e90a15;">SELL: {{ sellOrdersCount }} ({{ sellPercentage }}%)</div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
            <div v-for="(item, i) in ratioPerApi" :key="i" style="font-size: 7px; margin-bottom: 2px;">
              <span :style="`color: ${apiKeyColors[item.apiKey]}; font-weight: 600;`">{{ item.apiKey }}</span>: {{ item.buy }}/{{ item.sell }}
            </div>
          </div>
        </div>

        <!-- Analysis Card 7: Largest Single Order -->
        <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #ff6347;">
          <div style="color: #ff6347; font-size: 9px; font-weight: 700; margin-bottom: 6px;">🏆 LARGEST ORDER</div>
          <div v-if="largestOrder" style="font-size: 8px; color: #aaa;">
            {{ formatNumber(largestOrder.amount) }} @ ${{ largestOrder.price.toFixed(4) }}
            <div style="color: #ff6347; font-weight: 700;">${{ formatNumber(largestOrder.cost?.toFixed(2)) }}</div>
            <span :style="`color: ${apiKeyColors[largestOrder.apiKeyName]}; font-weight: 600; font-size: 7px;`">[{{ largestOrder.apiKeyName }}]</span>
          </div>
        </div>

        <!-- Analysis Card 8: Smallest Single Order -->
        <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #888;">
          <div style="color: #888; font-size: 9px; font-weight: 700; margin-bottom: 6px;">🔻 SMALLEST ORDER</div>
          <div v-if="smallestOrder" style="font-size: 8px; color: #aaa;">
            {{ formatNumber(smallestOrder.amount) }} @ ${{ smallestOrder.price.toFixed(4) }}
            <div style="color: #888; font-weight: 700;">${{ formatNumber(smallestOrder.cost?.toFixed(2)) }}</div>
            <span :style="`color: ${apiKeyColors[smallestOrder.apiKeyName]}; font-weight: 600; font-size: 7px;`">[{{ smallestOrder.apiKeyName }}]</span>
          </div>
        </div>

        <!-- Analysis Card 9: Orders > $1000 -->
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

        <!-- Analysis Card 10: Orders > $500 -->
        <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #c0c0c0;">
          <div style="color: #c0c0c0; font-size: 9px; font-weight: 700; margin-bottom: 6px;">🥈 ORDERS > $500</div>
          <div style="font-size: 11px; color: #c0c0c0; font-weight: 700;">{{ ordersAbove500.length }}</div>
          <div style="font-size: 8px; color: #888;">Total: ${{ formatNumber(ordersAbove500Total.toFixed(2)) }}</div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
            <div v-for="(item, i) in orders500PerApi" :key="i" style="font-size: 7px; margin-bottom: 2px;">
              <span :style="`color: ${apiKeyColors[item.apiKey]}; font-weight: 600;`">{{ item.apiKey }}</span>: {{ item.count }} (${{ formatNumber(item.total.toFixed(2)) }})
            </div>
          </div>
        </div>

        <!-- Analysis Card 11: Orders > $100 -->
        <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #cd7f32;">
          <div style="color: #cd7f32; font-size: 9px; font-weight: 700; margin-bottom: 6px;">🥉 ORDERS > $100</div>
          <div style="font-size: 11px; color: #cd7f32; font-weight: 700;">{{ ordersAbove100.length }}</div>
          <div style="font-size: 8px; color: #888;">Total: ${{ formatNumber(ordersAbove100Total.toFixed(2)) }}</div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
            <div v-for="(item, i) in orders100PerApi" :key="i" style="font-size: 7px; margin-bottom: 2px;">
              <span :style="`color: ${apiKeyColors[item.apiKey]}; font-weight: 600;`">{{ item.apiKey }}</span>: {{ item.count }} (${{ formatNumber(item.total.toFixed(2)) }})
            </div>
          </div>
        </div>

        <!-- Analysis Card 12: Recent Activity (Last 24h) -->
        <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #9370db;">
          <div style="color: #9370db; font-size: 9px; font-weight: 700; margin-bottom: 6px;">⏱️ LAST 24 HOURS</div>
          <div style="font-size: 11px; color: #9370db; font-weight: 700;">{{ last24HoursOrders.length }} orders</div>
          <div style="font-size: 8px; color: #888;">Volume: ${{ formatNumber(last24HoursVolume.toFixed(2)) }}</div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
            <div v-for="(item, i) in last24HoursPerApi" :key="i" style="font-size: 7px; margin-bottom: 2px;">
              <span :style="`color: ${apiKeyColors[item.apiKey]}; font-weight: 600;`">{{ item.apiKey }}</span>: {{ item.count }} (${{ formatNumber(item.volume.toFixed(2)) }})
            </div>
          </div>
        </div>
      </div>
    </n-card>
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
  },
  base: {
    type: String,
    required: true
  },
  quote: {
    type: String,
    required: true
  }
});

// Toggle states
const showMoreVolume = ref(false);
const showMoreCost = ref(false);

// Filtered orders based on selected API keys
const filteredOrders = computed(() => {
  if (props.selectedApiKeys.length === 0) return [];
  return props.allOrders.filter(order =>
    props.selectedApiKeys.includes(order.apiKeyName)
  );
});

// Computed statistics
const topOrdersByVolume = computed(() => {
  return [...filteredOrders.value]
    .sort((a, b) => (b.amount || 0) - (a.amount || 0))
    .slice(0, 50);
});

const topOrdersByCost = computed(() => {
  return [...filteredOrders.value]
    .sort((a, b) => (b.cost || 0) - (a.cost || 0))
    .slice(0, 50);
});

const totalVolume = computed(() => {
  return filteredOrders.value.reduce((sum, order) =>
    sum + (order.filled || order.amount || 0), 0
  );
});

const totalCost = computed(() => {
  return filteredOrders.value.reduce((sum, order) =>
    sum + (order.cost || 0), 0
  );
});

const totalOrdersCount = computed(() => {
  return filteredOrders.value.length;
});

const averageOrderSize = computed(() => {
  if (filteredOrders.value.length === 0) return 0;
  return totalVolume.value / filteredOrders.value.length;
});

const buyOrdersCount = computed(() => {
  return filteredOrders.value.filter(order => order.side === 'buy').length;
});

const sellOrdersCount = computed(() => {
  return filteredOrders.value.filter(order => order.side === 'sell').length;
});

const buyPercentage = computed(() => {
  if (filteredOrders.value.length === 0) return 0;
  return Math.round((buyOrdersCount.value / filteredOrders.value.length) * 100);
});

const sellPercentage = computed(() => {
  if (filteredOrders.value.length === 0) return 0;
  return Math.round((sellOrdersCount.value / filteredOrders.value.length) * 100);
});

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

const ordersAbove1000 = computed(() => {
  return filteredOrders.value.filter(order => (order.cost || 0) > 1000);
});

const ordersAbove1000Total = computed(() => {
  return ordersAbove1000.value.reduce((sum, order) => sum + (order.cost || 0), 0);
});

const ordersAbove500 = computed(() => {
  return filteredOrders.value.filter(order => (order.cost || 0) > 500);
});

const ordersAbove500Total = computed(() => {
  return ordersAbove500.value.reduce((sum, order) => sum + (order.cost || 0), 0);
});

const ordersAbove100 = computed(() => {
  return filteredOrders.value.filter(order => (order.cost || 0) > 100);
});

const ordersAbove100Total = computed(() => {
  return ordersAbove100.value.reduce((sum, order) => sum + (order.cost || 0), 0);
});

const last24HoursOrders = computed(() => {
  const now = Date.now();
  const yesterday = now - 24 * 60 * 60 * 1000;
  return filteredOrders.value.filter(order =>
    new Date(order.datetime).getTime() > yesterday
  );
});

const last24HoursVolume = computed(() => {
  return last24HoursOrders.value.reduce((sum, order) => sum + (order.cost || 0), 0);
});

// Per API calculations
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

const avgOrderSizePerApi = computed(() => {
  const result = {};
  const counts = {};
  filteredOrders.value.forEach(order => {
    const apiKey = order.apiKeyName;
    if (!result[apiKey]) {
      result[apiKey] = 0;
      counts[apiKey] = 0;
    }
    result[apiKey] += (order.filled || order.amount || 0);
    counts[apiKey]++;
  });
  return Object.entries(result)
    .map(([apiKey, total]) => ({
      apiKey,
      avgSize: counts[apiKey] > 0 ? total / counts[apiKey] : 0
    }))
    .sort((a, b) => b.avgSize - a.avgSize);
});

const ratioPerApi = computed(() => {
  const result = {};
  filteredOrders.value.forEach(order => {
    const apiKey = order.apiKeyName;
    if (!result[apiKey]) result[apiKey] = { buy: 0, sell: 0 };
    if (order.side === 'buy') {
      result[apiKey].buy++;
    } else {
      result[apiKey].sell++;
    }
  });
  return Object.entries(result)
    .map(([apiKey, counts]) => ({ apiKey, ...counts }))
    .sort((a, b) => (b.buy + b.sell) - (a.buy + a.sell));
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

const orders500PerApi = computed(() => {
  const result = {};
  ordersAbove500.value.forEach(order => {
    const apiKey = order.apiKeyName;
    if (!result[apiKey]) result[apiKey] = { count: 0, total: 0 };
    result[apiKey].count++;
    result[apiKey].total += (order.cost || 0);
  });
  return Object.entries(result)
    .map(([apiKey, data]) => ({ apiKey, ...data }))
    .sort((a, b) => b.total - a.total);
});

const orders100PerApi = computed(() => {
  const result = {};
  ordersAbove100.value.forEach(order => {
    const apiKey = order.apiKeyName;
    if (!result[apiKey]) result[apiKey] = { count: 0, total: 0 };
    result[apiKey].count++;
    result[apiKey].total += (order.cost || 0);
  });
  return Object.entries(result)
    .map(([apiKey, data]) => ({ apiKey, ...data }))
    .sort((a, b) => b.total - a.total);
});

const last24HoursPerApi = computed(() => {
  const result = {};
  last24HoursOrders.value.forEach(order => {
    const apiKey = order.apiKeyName;
    if (!result[apiKey]) result[apiKey] = { count: 0, volume: 0 };
    result[apiKey].count++;
    result[apiKey].volume += (order.cost || 0);
  });
  return Object.entries(result)
    .map(([apiKey, data]) => ({ apiKey, ...data }))
    .sort((a, b) => b.volume - a.volume);
});

// Helper function
function formatNumber(value, type = 'default') {
  if (value === null || value === undefined || isNaN(value)) return '0';

  const num = parseFloat(value);

  if (type === 'Price' || type === 'AveragePrice') {
    if (num >= 1000) return num.toFixed(2);
    if (num >= 1) return num.toFixed(4);
    if (num >= 0.01) return num.toFixed(6);
    return num.toFixed(8);
  }

  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
  if (num >= 1) return num.toFixed(2);
  if (num >= 0.01) return num.toFixed(4);
  return num.toFixed(6);
}
</script>