<script setup>
import { computed, ref } from 'vue';

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
const activeTab = ref('stats');

// Calculate grid orders based on configuration
const gridOrders = computed(() => {
  const {
    lowerPrice,
    upperPrice,
    amount,
    nrOfGrids,
    ordersSide,
    currentPrice,
    symbol
  } = props.config;

  const lower = parseFloat(lowerPrice) || 0;
  const upper = parseFloat(upperPrice) || 0;
  const grids = parseInt(nrOfGrids) || 0;
  const baseAmount = parseFloat(amount) || 0;
  const current = parseFloat(currentPrice) || 0;

  if (!lower || !upper || !grids || lower >= upper) {
    return [];
  }

  const orders = [];
  const priceStep = (upper - lower) / grids;

  // Generate grid orders
  for (let i = 0; i < grids; i++) {
    const price = lower + (i * priceStep);
    const orderQuantity = baseAmount / price;

    let side = 'BUY';
    if (ordersSide === 'sell') {
      side = 'SELL';
    } else if (ordersSide === 'buyOrSell') {
      side = price < current ? 'BUY' : 'SELL';
    }

    orders.push({
      id: i,
      price: price.toFixed(6),
      amount: orderQuantity.toFixed(4),
      total: baseAmount.toFixed(4),
      side: side,
      percentage: ((price - lower) / (upper - lower) * 100).toFixed(2),
      isInitial: current > 0 && Math.abs(price - current) < priceStep / 2
    });
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

  // Calculate averages for BUY and SELL orders
  const avgBuyPrice = buyOrders.length > 0
    ? buyOrders.reduce((sum, order) => sum + parseFloat(order.price), 0) / buyOrders.length
    : 0;

  const avgSellPrice = sellOrders.length > 0
    ? sellOrders.reduce((sum, order) => sum + parseFloat(order.price), 0) / sellOrders.length
    : 0;

  const avgBaseQuantity = orders.length > 0
    ? totalAmount / orders.length
    : 0;

  return {
    totalOrders: orders.length,
    buyOrdersCount: buyOrders.length,
    sellOrdersCount: sellOrders.length,
    avgBuyPrice: avgBuyPrice.toFixed(6),
    avgSellPrice: avgSellPrice.toFixed(6),
    avgBaseQuantity: avgBaseQuantity.toFixed(4),
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
    :style="{ width: '900px', maxHeight: '85vh' }"
    :bordered="false"
    :segmented="{ content: 'soft', footer: 'soft' }"
  >
    <template #header>
      <div class="compact-header">
        <span class="compact-icon">🎯</span>
        <div class="compact-header-text">
          <span class="compact-title">Grid Bot Demo</span>
          <span class="compact-symbol">{{ config.symbol || 'BTC/USD' }}</span>
        </div>
      </div>
    </template>

    <div class="compact-container">
      <!-- TABS SECTION -->
      <n-tabs v-model:value="activeTab" type="line" animated size="small">
        <!-- TAB 1: STATISTICS -->
        <n-tab-pane name="stats" tab="📊 Statistici">
          <!-- Summary Stats Grid -->
          <div v-if="summary" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 20px;">
            <div style="background: #1a1f2e; padding: 12px; border-radius: 4px; border: 1px solid #2a3441;">
              <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Symbol</div>
              <div style="font-size: 14px; font-weight: 700; color: #6366f1;">{{ config.symbol }}</div>
            </div>
            <div style="background: #1a1f2e; padding: 12px; border-radius: 4px; border: 1px solid #2a3441;">
              <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Price Range</div>
              <div style="font-size: 13px; font-weight: 600; color: #10eb04;">{{ summary.priceRange }}</div>
            </div>
            <div style="background: #1a1f2e; padding: 12px; border-radius: 4px; border: 1px solid #2a3441;">
              <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Total Orders</div>
              <div style="font-size: 14px; font-weight: 600; color: #a78bfa;">{{ summary.totalOrders }} orders</div>
            </div>
            <div style="background: #1a1f2e; padding: 12px; border-radius: 4px; border: 1px solid #2a3441;">
              <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Current Price</div>
              <div style="font-size: 13px; font-weight: 600; color: #ffd93d;">{{ config.currentPrice?.toFixed(6) || '-' }}</div>
            </div>
          </div>

          <!-- BUY/SELL DETAILED STATS -->
          <div v-if="summary && (config.ordersSide === 'buyOrSell' || config.ordersSide === 'buy' || config.ordersSide === 'sell')" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <!-- BUY PANEL -->
            <div v-if="summary.buyOrdersCount > 0" style="background: rgba(16, 235, 4, 0.08); padding: 14px; border-radius: 6px; border: 1px solid rgba(16, 235, 4, 0.3);">
              <div style="font-size: 13px; color: #10eb04; margin-bottom: 10px; font-weight: 700; border-bottom: 1px solid rgba(16, 235, 4, 0.2); padding-bottom: 6px;">
                📈 BUY ORDERS
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                  <span style="color: #888;">Number of orders:</span>
                  <span style="color: #10eb04; font-weight: 700;">{{ summary.buyOrdersCount }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                  <span style="color: #888;">Total investment ({{ config.quote }}):</span>
                  <span style="color: #10eb04; font-weight: 700;">${{ (gridOrders.filter(o => o.side === 'BUY').reduce((sum, o) => sum + parseFloat(o.total), 0)).toFixed(2) }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                  <span style="color: #888;">Total quantity ({{ config.symbol?.split('/')[0] }}):</span>
                  <span style="color: #10eb04; font-weight: 700;">{{ (gridOrders.filter(o => o.side === 'BUY').reduce((sum, o) => sum + parseFloat(o.amount), 0)).toFixed(4) }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                  <span style="color: #888;">Average price:</span>
                  <span style="color: #10eb04; font-weight: 700;">{{ summary.avgBuyPrice }}</span>
                </div>
              </div>
            </div>

            <!-- SELL PANEL -->
            <div v-if="summary.sellOrdersCount > 0" style="background: rgba(235, 4, 4, 0.08); padding: 14px; border-radius: 6px; border: 1px solid rgba(235, 4, 4, 0.3);">
              <div style="font-size: 13px; color: #eb0404; margin-bottom: 10px; font-weight: 700; border-bottom: 1px solid rgba(235, 4, 4, 0.2); padding-bottom: 6px;">
                📉 SELL ORDERS
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                  <span style="color: #888;">Number of orders:</span>
                  <span style="color: #eb0404; font-weight: 700;">{{ summary.sellOrdersCount }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                  <span style="color: #888;">Total revenue ({{ config.quote }}):</span>
                  <span style="color: #eb0404; font-weight: 700;">${{ (gridOrders.filter(o => o.side === 'SELL').reduce((sum, o) => sum + parseFloat(o.total), 0)).toFixed(2) }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                  <span style="color: #888;">Total quantity ({{ config.symbol?.split('/')[0] }}):</span>
                  <span style="color: #eb0404; font-weight: 700;">{{ (gridOrders.filter(o => o.side === 'SELL').reduce((sum, o) => sum + parseFloat(o.amount), 0)).toFixed(4) }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                  <span style="color: #888;">Average price:</span>
                  <span style="color: #eb0404; font-weight: 700;">{{ summary.avgSellPrice }}</span>
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <!-- TAB 2: ORDERS -->
        <n-tab-pane name="orders" tab="📋 Orders">
          <div class="compact-orders">
            <div class="orders-header">
              <span class="orders-title">Grid Orders ({{ gridOrders.length }})</span>
              <span class="orders-range">{{ summary?.priceRange }}</span>
            </div>
            <div class="orders-scroll">
              <div
                v-for="order in gridOrders"
                :key="order.id"
                :class="['order-row', order.side.toLowerCase(), { 'is-initial': order.isInitial }]"
              >
                <span class="order-num">#{{ order.id + 1 }}</span>
                <span :class="['order-side', order.side.toLowerCase()]">{{ order.side }}</span>
                <span class="order-price">{{ order.price }}</span>
                <span class="order-amount">{{ order.amount }}</span>
                <span class="order-total">{{ order.total }}</span>
                <span class="order-percentage">{{ order.percentage }}%</span>
              </div>
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>

    <template #footer>
      <div class="modal-footer">
        <n-button type="primary" @click="closeModal">Close</n-button>
      </div>
    </template>
  </n-modal>
</template>

<style scoped>
.compact-header {
  display: flex;
  align-items: center;
  gap: 8px;
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
  font-size: 12px;
  font-weight: 600;
  color: #e0e0e0;
}

.compact-symbol {
  font-size: 10px;
  color: #888;
}

.compact-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
}

.compact-summary {
  background: rgba(26, 31, 46, 0.5);
  border: 1px solid rgba(42, 52, 65, 0.5);
  border-radius: 4px;
  padding: 8px;
}

.summary-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat-compact {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  min-width: 60px;
}

.stat-label {
  font-size: 8px;
  color: #888;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 2px;
}

.stat-value {
  font-size: 11px;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.stat-value.yellow {
  color: #fbbf24;
}

.stat-value.green {
  color: #10eb04;
}

.stat-value.red {
  color: #ef4444;
}

.stat-value.cyan {
  color: #06b6d4;
}

.stat-value.white {
  color: #e0e0e0;
}

.compact-orders {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: rgba(26, 31, 46, 0.5);
  border-radius: 3px;
  border: 1px solid rgba(42, 52, 65, 0.5);
}

.orders-title {
  font-size: 10px;
  font-weight: 600;
  color: #e0e0e0;
}

.orders-range {
  font-size: 9px;
  color: #888;
  font-family: 'Courier New', monospace;
}

.orders-scroll {
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-row {
  display: grid;
  grid-template-columns: 40px 60px 100px 80px 80px 60px;
  gap: 8px;
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  border-left: 3px solid transparent;
  font-size: 9px;
  font-family: 'Courier New', monospace;
  align-items: center;
}

.order-row.buy {
  border-left-color: #10eb04;
  background: rgba(16, 235, 4, 0.08);
}

.order-row.sell {
  border-left-color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}

.order-row.is-initial {
  background: rgba(59, 130, 246, 0.15);
  border-left-color: #3b82f6;
}

.order-num {
  color: #888;
  font-weight: 600;
}

.order-side {
  font-weight: 700;
  text-transform: uppercase;
  font-size: 8px;
}

.order-side.buy {
  color: #10eb04;
}

.order-side.sell {
  color: #ef4444;
}

.order-price,
.order-amount,
.order-total,
.order-percentage {
  color: #e0e0e0;
  text-align: right;
}

.order-price {
  color: #06b6d4;
}

.order-percentage {
  color: #fbbf24;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Scrollbar styling */
.orders-scroll::-webkit-scrollbar {
  width: 6px;
}

.orders-scroll::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.orders-scroll::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 3px;
}

.orders-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.5);
}
</style>
