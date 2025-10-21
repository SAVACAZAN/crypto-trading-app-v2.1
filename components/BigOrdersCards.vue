<template>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px;">

    <!-- Card: LAST 50 ORDERS $1000-$2000 -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #ffd700;">
      <div style="color: #ffd700; font-size: 9px; font-weight: 700; margin-bottom: 6px;">💎 LAST 50 ORDERS $1,000-$2,000</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 4px;">Most recent first ({{ last50Orders1000.length }} total)</div>
      <div v-for="(order, i) in (showMoreLast501000 ? last50Orders1000 : last50Orders1000.slice(0, 10))" :key="i" style="font-size: 7px; color: #aaa; margin-bottom: 2px; line-height: 1.4;">
        {{ i + 1 }}. <span style="color: #666; font-size: 6px;">ID: {{ order.orderId || 'N/A' }}</span> |
        <span :style="`color: ${order.side === 'buy' ? '#20b2aa' : '#cd5c5c'}; font-weight: 700;`">{{ order.side.toUpperCase() }}</span>
        {{ formatNumber(order.amount) }} @ ${{ order.price.toFixed(4) }}
        = <span style="color: #ffd700; font-weight: 600;">${{ formatNumber(order.cost?.toFixed(2)) }}</span>
        - 📅 {{ new Date(order.datetime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) }}
        🕒 {{ new Date(order.datetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }}
        <span :style="`color: ${apiKeyColors[order.apiKeyName]}; font-weight: 600; margin-left: 4px;`">[{{ order.apiKeyName }}]</span>
      </div>
      <button v-if="last50Orders1000.length > 10" @click="showMoreLast501000 = !showMoreLast501000" style="font-size: 7px; color: #ffd700; background: transparent; border: 1px solid #ffd700; padding: 3px 8px; border-radius: 3px; cursor: pointer; margin-top: 4px; width: 100%;">
        {{ showMoreLast501000 ? 'Show Less ▲' : `Show More ▼ (${last50Orders1000.length - 10} more)` }}
      </button>
      <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
        <div style="font-size: 7px; color: #888;">Total: ${{ formatNumber(last50Orders1000Total.toFixed(2)) }}</div>
        <div style="font-size: 7px; color: #20b2aa;">Buy: {{ last50Orders1000Buy }} | Sell: {{ last50Orders1000Sell }}</div>
      </div>
    </div>

    <!-- Card: LAST 50 ORDERS $2000-$5000 -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #ff8c00;">
      <div style="color: #ff8c00; font-size: 9px; font-weight: 700; margin-bottom: 6px;">💰 LAST 50 ORDERS $2,000-$5,000</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 4px;">Most recent first ({{ last50Orders2000.length }} total)</div>
      <div v-for="(order, i) in (showMoreLast502000 ? last50Orders2000 : last50Orders2000.slice(0, 10))" :key="i" style="font-size: 7px; color: #aaa; margin-bottom: 2px; line-height: 1.4;">
        {{ i + 1 }}. <span style="color: #666; font-size: 6px;">ID: {{ order.orderId || 'N/A' }}</span> |
        <span :style="`color: ${order.side === 'buy' ? '#20b2aa' : '#cd5c5c'}; font-weight: 700;`">{{ order.side.toUpperCase() }}</span>
        {{ formatNumber(order.amount) }} @ ${{ order.price.toFixed(4) }}
        = <span style="color: #ff8c00; font-weight: 600;">${{ formatNumber(order.cost?.toFixed(2)) }}</span>
        - 📅 {{ new Date(order.datetime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) }}
        🕒 {{ new Date(order.datetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }}
        <span :style="`color: ${apiKeyColors[order.apiKeyName]}; font-weight: 600; margin-left: 4px;`">[{{ order.apiKeyName }}]</span>
      </div>
      <button v-if="last50Orders2000.length > 10" @click="showMoreLast502000 = !showMoreLast502000" style="font-size: 7px; color: #ff8c00; background: transparent; border: 1px solid #ff8c00; padding: 3px 8px; border-radius: 3px; cursor: pointer; margin-top: 4px; width: 100%;">
        {{ showMoreLast502000 ? 'Show Less ▲' : `Show More ▼ (${last50Orders2000.length - 10} more)` }}
      </button>
      <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
        <div style="font-size: 7px; color: #888;">Total: ${{ formatNumber(last50Orders2000Total.toFixed(2)) }}</div>
        <div style="font-size: 7px; color: #20b2aa;">Buy: {{ last50Orders2000Buy }} | Sell: {{ last50Orders2000Sell }}</div>
      </div>
    </div>

    <!-- Card: LAST 50 ORDERS > $5000 -->
    <div style="background: #1a1a1a; padding: 10px; border-radius: 6px; border: 1px solid #ff1493;">
      <div style="color: #ff1493; font-size: 9px; font-weight: 700; margin-bottom: 6px;">💎💰 LAST 50 ORDERS > $5,000</div>
      <div style="font-size: 7px; color: #888; margin-bottom: 4px;">Most recent first ({{ last50Orders5000.length }} total)</div>
      <div v-for="(order, i) in (showMoreLast505000 ? last50Orders5000 : last50Orders5000.slice(0, 10))" :key="i" style="font-size: 7px; color: #aaa; margin-bottom: 2px; line-height: 1.4;">
        {{ i + 1 }}. <span style="color: #666; font-size: 6px;">ID: {{ order.orderId || 'N/A' }}</span> |
        <span :style="`color: ${order.side === 'buy' ? '#20b2aa' : '#cd5c5c'}; font-weight: 700;`">{{ order.side.toUpperCase() }}</span>
        {{ formatNumber(order.amount) }} @ ${{ order.price.toFixed(4) }}
        = <span style="color: #ff1493; font-weight: 600;">${{ formatNumber(order.cost?.toFixed(2)) }}</span>
        - 📅 {{ new Date(order.datetime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) }}
        🕒 {{ new Date(order.datetime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }}
        <span :style="`color: ${apiKeyColors[order.apiKeyName]}; font-weight: 600; margin-left: 4px;`">[{{ order.apiKeyName }}]</span>
      </div>
      <button v-if="last50Orders5000.length > 10" @click="showMoreLast505000 = !showMoreLast505000" style="font-size: 7px; color: #ff1493; background: transparent; border: 1px solid #ff1493; padding: 3px 8px; border-radius: 3px; cursor: pointer; margin-top: 4px; width: 100%;">
        {{ showMoreLast505000 ? 'Show Less ▲' : `Show More ▼ (${last50Orders5000.length - 10} more)` }}
      </button>
      <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #333;">
        <div style="font-size: 7px; color: #888;">Total: ${{ formatNumber(last50Orders5000Total.toFixed(2)) }}</div>
        <div style="font-size: 7px; color: #20b2aa;">Buy: {{ last50Orders5000Buy }} | Sell: {{ last50Orders5000Sell }}</div>
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

// Show More/Less toggles
const showMoreLast501000 = ref(false);
const showMoreLast502000 = ref(false);
const showMoreLast505000 = ref(false);

// LAST 50 ORDERS $1000-$2000 (EXCLUSIVE RANGE - chronological)
const last50Orders1000 = computed(() => {
  return [...props.allOrders]
    .filter(order => {
      const cost = order.cost || 0;
      return cost >= 1000 && cost < 2000;
    })
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
    .slice(0, 50);
});

const last50Orders1000Total = computed(() => {
  return last50Orders1000.value.reduce((sum, order) => sum + (order.cost || 0), 0);
});

const last50Orders1000Buy = computed(() => {
  return last50Orders1000.value.filter(o => o.side === 'buy').length;
});

const last50Orders1000Sell = computed(() => {
  return last50Orders1000.value.filter(o => o.side === 'sell').length;
});

// LAST 50 ORDERS $2000-$5000 (EXCLUSIVE RANGE - chronological)
const last50Orders2000 = computed(() => {
  return [...props.allOrders]
    .filter(order => {
      const cost = order.cost || 0;
      return cost >= 2000 && cost < 5000;
    })
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
    .slice(0, 50);
});

const last50Orders2000Total = computed(() => {
  return last50Orders2000.value.reduce((sum, order) => sum + (order.cost || 0), 0);
});

const last50Orders2000Buy = computed(() => {
  return last50Orders2000.value.filter(o => o.side === 'buy').length;
});

const last50Orders2000Sell = computed(() => {
  return last50Orders2000.value.filter(o => o.side === 'sell').length;
});

// LAST 50 ORDERS > $5000 (chronological)
const last50Orders5000 = computed(() => {
  return [...props.allOrders]
    .filter(order => (order.cost || 0) >= 5000)
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
    .slice(0, 50);
});

const last50Orders5000Total = computed(() => {
  return last50Orders5000.value.reduce((sum, order) => sum + (order.cost || 0), 0);
});

const last50Orders5000Buy = computed(() => {
  return last50Orders5000.value.filter(o => o.side === 'buy').length;
});

const last50Orders5000Sell = computed(() => {
  return last50Orders5000.value.filter(o => o.side === 'sell').length;
});

// Utility function
function formatNumber(num) {
  if (!num) return '0';
  const numStr = num.toString();
  const parts = numStr.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}
</script>
