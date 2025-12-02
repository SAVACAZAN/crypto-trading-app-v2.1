<script setup>
import { computed } from 'vue';

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

// Calculate grid orders based on configuration
const gridOrders = computed(() => {
  const {
    lowerPrice,
    upperPrice,
    PriceStart,
    amountPriceStart,
    amount,
    nrOfGrids,
    ordersSide,
    incrementalPercentAmountBuy,
    incrementalPercentAmountSell,
    symbol
  } = props.config;

  const lower = parseFloat(lowerPrice) || 0;
  const upper = parseFloat(upperPrice) || 0;
  const grids = parseInt(nrOfGrids) || 0;
  const baseAmount = parseFloat(amount) || 0;
  const startPrice = parseFloat(PriceStart) || 0;
  const startAmount = parseFloat(amountPriceStart) || 0;
  const incBuy = parseFloat(incrementalPercentAmountBuy) || 0;
  const incSell = parseFloat(incrementalPercentAmountSell) || 0;

  if (!lower || !upper || !grids || lower >= upper || !startPrice) {
    return [];
  }

  const orders = [];
  const priceStep = (upper - lower) / grids;

  // FIRST ORDER: Initial order at PriceStart
  if (ordersSide === 'buyOnly') {
    // buyOnly: 1 BUY at PriceStart, then (grids-1) SELL orders
    const initialQuantity = startAmount / startPrice;

    orders.push({
      id: 0,
      price: startPrice.toFixed(6),
      amount: initialQuantity.toFixed(4),
      total: startAmount.toFixed(4),
      side: 'BUY',
      percentage: ((startPrice - lower) / (upper - lower) * 100).toFixed(2),
      isInitial: true
    });

    // Grid SELL orders (starting from lowerPrice + priceStep)
    // Uses incrementalPercent formula: (amount + ((amount / 100) * (index + 1) * amount)) / price
    for (let i = 1; i < grids; i++) {
      const price = lower + (i * priceStep);
      // Formula from FronRunLib: incrementalPercent
      const orderQuantity = (baseAmount + ((baseAmount / 100) * i * baseAmount)) / price;

      orders.push({
        id: i,
        price: price.toFixed(6),
        amount: orderQuantity.toFixed(4),
        total: (price * orderQuantity).toFixed(4),
        side: 'SELL',
        percentage: ((price - lower) / (upper - lower) * 100).toFixed(2),
        isInitial: false
      });
    }
  } else if (ordersSide === 'sellOnly') {
    // sellOnly: 1 SELL at PriceStart, then (grids-1) BUY orders
    const initialQuantity = startAmount / startPrice;

    orders.push({
      id: 0,
      price: startPrice.toFixed(6),
      amount: initialQuantity.toFixed(4),
      total: startAmount.toFixed(4),
      side: 'SELL',
      percentage: ((startPrice - lower) / (upper - lower) * 100).toFixed(2),
      isInitial: true
    });

    // Grid BUY orders (starting from lowerPrice + priceStep)
    // Uses incrementalPercent formula: (amount + ((amount / 100) * (index + 1) * amount)) / price
    for (let i = 1; i < grids; i++) {
      const price = lower + (i * priceStep);
      // Formula from FronRunLib: incrementalPercent
      const orderQuantity = (baseAmount + ((baseAmount / 100) * i * baseAmount)) / price;

      orders.push({
        id: i,
        price: price.toFixed(6),
        amount: orderQuantity.toFixed(4),
        total: (price * orderQuantity).toFixed(4),
        side: 'BUY',
        percentage: ((price - lower) / (upper - lower) * 100).toFixed(2),
        isInitial: false
      });
    }
  }

  return orders;
});

// Summary stats
const summary = computed(() => {
  const orders = gridOrders.value;
  if (orders.length === 0) return null;

  const buyOrders = orders.filter(o => o.side === 'BUY');
  const sellOrders = orders.filter(o => o.side === 'SELL');

  const totalAmount = orders.reduce((sum, order) => sum + parseFloat(order.amount), 0);
  const totalValue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
  const avgPrice = orders.reduce((sum, order) => sum + parseFloat(order.price), 0) / orders.length;

  return {
    totalOrders: orders.length,
    buyOrdersCount: buyOrders.length,
    sellOrdersCount: sellOrders.length,
    totalAmount: totalAmount.toFixed(4),
    totalValue: totalValue.toFixed(4),
    avgPrice: avgPrice.toFixed(6),
    priceRange: `${orders[0].price} - ${orders[orders.length - 1].price}`
  };
});

function closeModal() {
  emit('close');
}
</script>

<template>
  <n-modal
    :show="visible"
    @update:show="(val) => !val && closeModal()"
    :mask-closable="false"
    preset="card"
    :style="{ width: '800px', maxHeight: '85vh' }"
    :bordered="false"
    :segmented="{ content: 'soft', footer: 'soft' }"
  >
    <template #header>
      <div class="compact-header">
        <span class="compact-icon">🎯</span>
        <div class="compact-header-text">
          <span class="compact-title">FrontRun Grid Demo</span>
          <span class="compact-symbol">{{ config.symbol || 'LCX/USDC' }}</span>
        </div>
      </div>
    </template>

    <div class="compact-container">
      <!-- Compact Summary -->
      <div v-if="summary" class="compact-summary">
        <div class="summary-row">
          <div class="stat-compact">
            <span class="stat-label">Orders</span>
            <span class="stat-value yellow">{{ summary.totalOrders }}</span>
          </div>
          <div class="stat-compact">
            <span class="stat-label">🟢 BUY</span>
            <span class="stat-value green">{{ summary.buyOrdersCount }}</span>
          </div>
          <div class="stat-compact">
            <span class="stat-label">🔴 SELL</span>
            <span class="stat-value red">{{ summary.sellOrdersCount }}</span>
          </div>
          <div class="stat-compact">
            <span class="stat-label">Total Value</span>
            <span class="stat-value cyan">{{ summary.totalValue }} {{ config.quote || 'USDC' }}</span>
          </div>
        </div>
      </div>

      <!-- Compact Orders List -->
      <div class="compact-orders">
        <div class="orders-header">
          <span class="orders-title">📋 Orders ({{ gridOrders.length }})</span>
        </div>
        <div class="orders-scroll">
          <div
            v-for="order in gridOrders"
            :key="order.id"
            :class="['order-row', order.side.toLowerCase(), { 'is-initial': order.isInitial }]"
          >
            <span class="order-num">#{{ order.id + 1 }}</span>
            <span :class="['order-side', order.side.toLowerCase()]">
              {{ order.side === 'BUY' ? '🟢' : '🔴' }}
              {{ order.isInitial ? '⭐' : '' }}
            </span>
            <span class="order-price">{{ order.price }}</span>
            <span class="order-amount">{{ order.amount }}</span>
            <span class="order-total">{{ order.total }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <n-button type="primary" @click="closeModal" block>Close</n-button>
    </template>
  </n-modal>
</template>

<style scoped>
/* Compact Header */
.compact-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.compact-icon {
  font-size: 20px;
}

.compact-header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.compact-title {
  font-size: 14px;
  font-weight: 700;
  color: #f5a623;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.compact-symbol {
  font-size: 11px;
  color: #10eb04;
  font-weight: 600;
}

/* Compact Container */
.compact-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(85vh - 120px);
  overflow-y: auto;
  padding: 2px;
}

/* Compact Summary */
.compact-summary {
  background: linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%);
  border: 1px solid #2a3441;
  border-radius: 6px;
  padding: 10px;
}

.summary-row {
  display: flex;
  justify-content: space-around;
  gap: 8px;
}

.stat-compact {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.stat-label {
  font-size: 9px;
  color: #888;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.stat-value {
  font-size: 13px;
  font-weight: 700;
}

.stat-value.yellow { color: #eadb11; }
.stat-value.cyan { color: #05f5ed; }
.stat-value.green { color: #10eb04; }
.stat-value.orange { color: #f5a623; }
.stat-value.red { color: #f72c09; }

/* Compact Orders */
.compact-orders {
  background: #0f1419;
  border: 1px solid #2a3441;
  border-radius: 6px;
  overflow: hidden;
}

.orders-header {
  background: #1a1f2e;
  padding: 8px 12px;
  border-bottom: 1px solid #2a3441;
}

.orders-title {
  font-size: 11px;
  font-weight: 700;
  color: #f5a623;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.orders-scroll {
  max-height: 400px;
  overflow-y: auto;
}

.order-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-bottom: 1px solid #1a1a1a;
  transition: all 0.2s ease;
  font-size: 10px;
}

.order-row:hover {
  background: #1a1f2e;
}

.order-row.buy {
  background: rgba(16, 235, 4, 0.03);
}

.order-row.sell {
  background: rgba(247, 44, 9, 0.03);
}

.order-row.is-initial {
  background: rgba(234, 219, 17, 0.1) !important;
  border-left: 3px solid #eadb11;
  font-weight: 700;
}

.order-num {
  min-width: 25px;
  color: #888;
  font-weight: 600;
}

.order-side {
  min-width: 30px;
  font-size: 14px;
}

.order-price {
  flex: 1;
  color: #eadb11;
  font-weight: 600;
}

.order-amount {
  flex: 1;
  color: #05f5ed;
  font-weight: 600;
}

.order-total {
  flex: 1;
  color: #f5a623;
  font-weight: 600;
  text-align: right;
}

/* Scrollbar Styling */
.compact-container::-webkit-scrollbar,
.orders-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.compact-container::-webkit-scrollbar-track,
.orders-scroll::-webkit-scrollbar-track {
  background: #0f1419;
}

.compact-container::-webkit-scrollbar-thumb,
.orders-scroll::-webkit-scrollbar-thumb {
  background: #2a3441;
  border-radius: 3px;
}

.compact-container::-webkit-scrollbar-thumb:hover,
.orders-scroll::-webkit-scrollbar-thumb:hover {
  background: #3a4451;
}
</style>