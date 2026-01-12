<script setup>
import { computed, ref, watch } from 'vue';

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

// Drag state
const isDragging = ref(false);
const dragOffsetX = ref(0);
const dragOffsetY = ref(0);
const modalX = ref(50);
const modalY = ref(50);
const modalElement = ref(null);

function startDrag(event) {
  if (event.button !== 0) return; // Only left mouse button
  isDragging.value = true;

  // Get modal element
  const modal = document.querySelector('.draggable-modal');
  if (!modal) return;

  // Calculate offset between mouse and modal position
  const rect = modal.getBoundingClientRect();
  dragOffsetX.value = event.clientX - rect.left;
  dragOffsetY.value = event.clientY - rect.top;

  // Add event listeners
  document.addEventListener('mousemove', handleDragMove);
  document.addEventListener('mouseup', handleDragEnd);

  event.preventDefault();
}

function handleDragMove(event) {
  if (!isDragging.value) return;

  modalX.value = event.clientX - dragOffsetX.value;
  modalY.value = event.clientY - dragOffsetY.value;
}

function handleDragEnd() {
  isDragging.value = false;
  document.removeEventListener('mousemove', handleDragMove);
  document.removeEventListener('mouseup', handleDragEnd);
}

// Calculate grid orders based on configuration
const gridOrders = computed(() => {
  if (!props.config) {
    return [];
  }

  const {
    lowerPrice,
    upperPrice,
    amount,
    nrOfGrids,
    ordersSide,
    currentPrice,
    symbol,
    amountType
  } = props.config;

  const lower = parseFloat(lowerPrice) || 0;
  const upper = parseFloat(upperPrice) || 0;
  const grids = parseInt(nrOfGrids) || 0;
  const baseAmount = parseFloat(amount) || 0;
  const current = parseFloat(currentPrice) || 0;
  const amtType = amountType || 'incrementalPercent';

  if (!lower || !upper || !grids || lower >= upper) {
    return [];
  }

  const orders = [];
  const priceStep = (upper - lower) / grids;

  // Generate grid orders
  for (let i = 0; i < grids; i++) {
    const price = lower + (i * priceStep);

    let orderTotal = baseAmount;
    let orderQuantity = 0;

    // Calculate based on amountType
    if (amtType === 'quantityPerGrid') {
      // amount is fixed quantity per grid (baseAmount is quantity, not USD)
      orderQuantity = baseAmount;
      orderTotal = baseAmount * price; // Calculate USD value
    } else if (amtType === 'totalAmount') {
      // amount is distributed equally across all grids (baseAmount is total USD)
      const amountPerGrid = baseAmount / grids;
      orderQuantity = amountPerGrid / price;
      orderTotal = amountPerGrid;
    } else {
      // incrementalPercent: amount is base USD amount for first grid
      orderQuantity = baseAmount / price;
      orderTotal = baseAmount;
    }

    let side = 'BUY';
    if (ordersSide === 'sell') {
      side = 'SELL';
    } else if (ordersSide === 'buyOrSell') {
      side = price < current ? 'BUY' : 'SELL';
    }

    orders.push({
      id: i,
      price: price.toFixed(8),
      amount: orderQuantity.toFixed(4),
      total: orderTotal.toFixed(2),
      side: side,
      percentage: ((price - lower) / (upper - lower) * 100).toFixed(2),
      isInitial: current > 0 && Math.abs(price - current) < priceStep / 2,
      amountType: amtType,
      gridIndex: i
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
    avgBuyPrice: avgBuyPrice.toFixed(8),
    avgSellPrice: avgSellPrice.toFixed(8),
    avgBaseQuantity: avgBaseQuantity.toFixed(4),
    totalAmount: totalAmount.toFixed(4),
    totalValue: totalValue.toFixed(2),
    avgPrice: avgPrice.toFixed(8),
    priceRange: `${parseFloat(orders[0].price).toFixed(8)} - ${parseFloat(orders[orders.length - 1].price).toFixed(8)}`
  };
});

// Incremental orders (with incremental amounts, without deviations)
const incrementalOrders = computed(() => {
  const {
    incrementalPercentAmountBuy,
    incrementalPercentAmountSell,
    amountType
  } = props.config;

  const incBuy = parseFloat(incrementalPercentAmountBuy) || 0;
  const incSell = parseFloat(incrementalPercentAmountSell) || 0;
  const amtType = amountType || 'incrementalPercent';

  const orders = gridOrders.value;
  if (orders.length === 0) return null;

  const buyOrders = orders.filter(o => o.side === 'BUY');
  const sellOrders = orders.filter(o => o.side === 'SELL');

  // Calculate incremental orders WITHOUT deviations
  let incrementalBuyOrders = [];
  let incrementalSellOrders = [];
  let totalBuyIncremental = 0;
  let totalBuyQtyIncremental = 0;
  let totalSellIncremental = 0;
  let totalSellQtyIncremental = 0;

  if (buyOrders.length > 0) {
    incrementalBuyOrders = buyOrders.map((order, index) => {
      const baseAmount = parseFloat(order.total); // USD amount from gridOrders
      const price = parseFloat(order.price);
      let incrementalAmount = baseAmount;

      // Apply incremental calculation only for 'incrementalPercent' amountType
      if (amtType === 'incrementalPercent') {
        // For BUY orders displayed in reverse (highest price first):
        // Visual order #1 (highest price) should have no increment
        // Visual order #2 should have 1x increment, etc.
        // Since buyOrders are in ascending price order but displayed reversed,
        // we need to apply incremental from the end: (length - 1 - index)
        const reversedIndex = buyOrders.length - 1 - index;
        incrementalAmount = baseAmount + ((baseAmount / 100) * (incBuy * reversedIndex));
      }
      // For other amountTypes (quantityPerGrid, totalAmount), amount stays constant

      const incrementalQty = incrementalAmount / price;

      totalBuyIncremental += incrementalAmount;
      totalBuyQtyIncremental += incrementalQty;

      return {
        ...order,
        incrementalAmount: incrementalAmount.toFixed(2),
        incrementalQty: incrementalQty.toFixed(4),
        incrementalTotal: (incrementalAmount).toFixed(2)
      };
    });
  }

  if (sellOrders.length > 0) {
    incrementalSellOrders = sellOrders.map((order, index) => {
      const baseAmount = parseFloat(order.total); // USD amount from gridOrders
      const price = parseFloat(order.price);
      let incrementalAmount = baseAmount;

      // Apply incremental calculation only for 'incrementalPercent' amountType
      if (amtType === 'incrementalPercent') {
        // For incrementalPercent: first order (index 0) stays at baseAmount
        // Subsequent orders get incremental applied: amount + ((amount / 100) * (incrementalPercent * index))
        // Order 1 (index 0): baseAmount (no increment)
        // Order 2 (index 1): baseAmount + (baseAmount / 100) * incSell * 1
        // Order 3 (index 2): baseAmount + (baseAmount / 100) * incSell * 2
        // etc.
        incrementalAmount = baseAmount + ((baseAmount / 100) * (incSell * index));
      }
      // For other amountTypes (quantityPerGrid, totalAmount), amount stays constant

      const incrementalQty = incrementalAmount / price;

      totalSellIncremental += incrementalAmount;
      totalSellQtyIncremental += incrementalQty;

      return {
        ...order,
        incrementalAmount: incrementalAmount.toFixed(2),
        incrementalQty: incrementalQty.toFixed(4),
        incrementalTotal: (incrementalAmount).toFixed(2)
      };
    });
  }

  return {
    incBuy,
    incSell,
    amountType: amtType,
    buyOrders: incrementalBuyOrders,
    sellOrders: incrementalSellOrders,
    totalBuyIncremental: totalBuyIncremental.toFixed(2),
    totalBuyQtyIncremental: totalBuyQtyIncremental.toFixed(4),
    totalSellIncremental: totalSellIncremental.toFixed(2),
    totalSellQtyIncremental: totalSellQtyIncremental.toFixed(4)
  };
});

function closeModal() {
  emit('close');
}

// Watch for config changes and reset tab to 'stats'
watch(
  () => props.config,
  () => {
    // Reset to stats tab when config changes (new strategy loaded)
    activeTab.value = 'stats';
  },
  { deep: true }
);
</script>

<template>
  <n-modal
    :show="visible"
    @update:show="(val) => !val && closeModal()"
    :mask-closable="false"
    preset="card"
    :style="{
      width: '450px',
      maxHeight: '70vh',
      position: 'fixed',
      left: modalX + 'px',
      top: modalY + 'px',
      cursor: isDragging ? 'grabbing' : 'grab'
    }"
    :bordered="false"
    :segmented="{ content: 'soft', footer: 'soft' }"
    class="draggable-modal"
  >
    <template #header>
      <div class="compact-header" @mousedown="startDrag" style="cursor: grab; user-select: none;">
        <span class="compact-icon">🎯</span>
        <div class="compact-header-text">
          <span class="compact-title">Grid Bot Demo</span>
          <span class="compact-symbol">{{ config.symbol || 'BTC/USD' }}</span>
        </div>
      </div>
    </template>

    <div class="compact-container" style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">
      <!-- TABS SECTION -->
      <n-tabs v-model:value="activeTab" type="line" animated size="small" style="display: flex; flex-direction: column; flex: 1; overflow: hidden;">
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
          <div v-if="summary && (config?.ordersSide === 'buyOrSell' || config?.ordersSide === 'buy' || config?.ordersSide === 'sell')" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <!-- BUY PANEL - ORIGINAL ORDERS -->
            <div v-if="summary.buyOrdersCount > 0" style="background: rgba(16, 235, 4, 0.08); padding: 8px; border-radius: 6px; border: 1px solid rgba(16, 235, 4, 0.3);">
              <div style="font-size: 10px; color: #10eb04; margin-bottom: 6px; font-weight: 700; border-bottom: 1px solid rgba(16, 235, 4, 0.2); padding-bottom: 4px;">
                📈 BUY ORDERS (Original)
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <div style="display: flex; justify-content: space-between; font-size: 8px;">
                  <span style="color: #888;">Orders:</span>
                  <span style="color: #10eb04; font-weight: 700;">{{ summary.buyOrdersCount }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 8px;">
                  <span style="color: #888;">Investment:</span>
                  <span style="color: #10eb04; font-weight: 700;">${{ (gridOrders.filter(o => o.side === 'BUY').reduce((sum, o) => sum + parseFloat(o.total), 0)).toFixed(2) }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 8px;">
                  <span style="color: #888;">Qty:</span>
                  <span style="color: #10eb04; font-weight: 700;">{{ (gridOrders.filter(o => o.side === 'BUY').reduce((sum, o) => sum + parseFloat(o.amount), 0)).toFixed(4) }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 8px;">
                  <span style="color: #888;">Avg Price:</span>
                  <span style="color: #10eb04; font-weight: 700;">{{ summary.avgBuyPrice }}</span>
                </div>
              </div>
            </div>

            <!-- SELL PANEL - ORIGINAL ORDERS -->
            <div v-if="summary.sellOrdersCount > 0" style="background: rgba(235, 4, 4, 0.08); padding: 8px; border-radius: 6px; border: 1px solid rgba(235, 4, 4, 0.3);">
              <div style="font-size: 10px; color: #eb0404; margin-bottom: 6px; font-weight: 700; border-bottom: 1px solid rgba(235, 4, 4, 0.2); padding-bottom: 4px;">
                📉 SELL ORDERS (Original)
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px;">
                <div style="display: flex; justify-content: space-between; font-size: 8px;">
                  <span style="color: #888;">Orders:</span>
                  <span style="color: #eb0404; font-weight: 300;">{{ summary.sellOrdersCount }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 8px;">
                  <span style="color: #888;">Revenue:</span>
                  <span style="color: #eb0404; font-weight: 700;">${{ (gridOrders.filter(o => o.side === 'SELL').reduce((sum, o) => sum + parseFloat(o.total), 0)).toFixed(2) }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 8px;">
                  <span style="color: #888;">Qty:</span>
                  <span style="color: #eb0404; font-weight: 700;">{{ (gridOrders.filter(o => o.side === 'SELL').reduce((sum, o) => sum + parseFloat(o.amount), 0)).toFixed(4) }}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 8px;">
                  <span style="color: #888;">Avg Price:</span>
                  <span style="color: #eb0404; font-weight: 700;">{{ summary.avgSellPrice }}</span>
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <!-- TAB 2: ORDERS -->
        <n-tab-pane name="orders" tab="📋 Orders" class="orders-tab">
          <div v-if="incrementalOrders" class="orders-wrapper">
            <!-- Amount Type Indicator -->
            <div class="amount-type-indicator">
              <span class="amount-type-label">AmountType:</span>
              <span :class="`amount-type-value amount-type-${incrementalOrders.amountType}`">
                {{ incrementalOrders.amountType }}
              </span>
            </div>
            <!-- SELL ORDERS TABLE - TOP SECTION -->
            <div class="orders-section orders-sell-section">
              <div class="table-header">
                <span>📉 SELL</span>
                <span v-if="incrementalOrders.amountType === 'incrementalPercent'">
                  Orders: {{ incrementalOrders.sellOrders.length }} | Rev: ${{ incrementalOrders.totalSellIncremental }}
                </span>
                <span v-else>
                  Orders: {{ gridOrders.filter(o => o.side === 'SELL').length }} | Rev: ${{ (gridOrders.filter(o => o.side === 'SELL').reduce((sum, o) => sum + parseFloat(o.total), 0)).toFixed(2) }}
                </span>
              </div>
              <div class="table-container">
                <table class="orders-table sell-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>SIDE</th>
                      <th>PRICE</th>
                      <th>AMT</th>
                      <th>TOTAL</th>
                      <th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-if="incrementalOrders.amountType === 'incrementalPercent'">
                      <tr v-for="(order, idx) in incrementalOrders.sellOrders" :key="`inc-sell-${idx}`" :class="{ 'is-initial': order.isInitial, 'has-increment': true }">
                        <td>{{ idx + 1 }}</td>
                        <td class="side-cell sell">SELL</td>
                        <td>{{ order.price }}</td>
                        <td class="inc-qty-cell sell">{{ order.incrementalQty }}</td>
                        <td class="inc-total-cell sell">${{ order.incrementalAmount }}</td>
                        <td>{{ order.percentage }}%</td>
                      </tr>
                    </template>
                    <template v-else-if="incrementalOrders.amountType === 'quantityPerGrid'">
                      <tr v-for="(order, idx) in gridOrders.filter(o => o.side === 'SELL')" :key="`grid-sell-${idx}`" :class="{ 'is-initial': order.isInitial }">
                        <td>{{ idx + 1 }}</td>
                        <td class="side-cell sell">SELL</td>
                        <td>{{ order.price }}</td>
                        <td>{{ order.amount }}</td>
                        <td>${{ order.total }}</td>
                        <td>{{ order.percentage }}%</td>
                      </tr>
                    </template>
                    <template v-else>
                      <tr v-for="(order, idx) in gridOrders.filter(o => o.side === 'SELL')" :key="`grid-sell-${idx}`" :class="{ 'is-initial': order.isInitial }">
                        <td>{{ idx + 1 }}</td>
                        <td class="side-cell sell">SELL</td>
                        <td>{{ order.price }}</td>
                        <td>{{ order.amount }}</td>
                        <td>${{ order.total }}</td>
                        <td>{{ order.percentage }}%</td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- DIVIDER -->
            <div class="orders-divider"></div>

            <!-- BUY ORDERS TABLE - BOTTOM SECTION -->
            <div class="orders-section orders-buy-section">
              <div class="table-header">
                <span>📈 BUY</span>
                <span v-if="incrementalOrders.amountType === 'incrementalPercent'">
                  Orders: {{ incrementalOrders.buyOrders.length }} | Inv: ${{ incrementalOrders.totalBuyIncremental }}
                </span>
                <span v-else>
                  Orders: {{ gridOrders.filter(o => o.side === 'BUY').length }} | Inv: ${{ (gridOrders.filter(o => o.side === 'BUY').reduce((sum, o) => sum + parseFloat(o.total), 0)).toFixed(2) }}
                </span>
              </div>
              <div class="table-container">
                <table class="orders-table buy-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>SIDE</th>
                      <th>PRICE</th>
                      <th>AMT</th>
                      <th>TOTAL</th>
                      <th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-if="incrementalOrders.amountType === 'incrementalPercent'">
                      <tr v-for="(order, idx) in [...incrementalOrders.buyOrders].reverse()" :key="`inc-buy-${idx}`" :class="{ 'is-initial': order.isInitial, 'has-increment': true }">
                        <td>{{ idx + 1 }}</td>
                        <td class="side-cell buy">BUY</td>
                        <td>{{ order.price }}</td>
                        <td class="inc-qty-cell buy">{{ order.incrementalQty }}</td>
                        <td class="inc-total-cell buy">${{ order.incrementalAmount }}</td>
                        <td>{{ order.percentage }}%</td>
                      </tr>
                    </template>
                    <template v-else-if="incrementalOrders.amountType === 'quantityPerGrid'">
                      <tr v-for="(order, idx) in [...gridOrders.filter(o => o.side === 'BUY')].reverse()" :key="`grid-buy-${idx}`" :class="{ 'is-initial': order.isInitial }">
                        <td>{{ idx + 1 }}</td>
                        <td class="side-cell buy">BUY</td>
                        <td>{{ order.price }}</td>
                        <td>{{ order.amount }}</td>
                        <td>${{ order.total }}</td>
                        <td>{{ order.percentage }}%</td>
                      </tr>
                    </template>
                    <template v-else>
                      <tr v-for="(order, idx) in [...gridOrders.filter(o => o.side === 'BUY')].reverse()" :key="`grid-buy-${idx}`" :class="{ 'is-initial': order.isInitial }">
                        <td>{{ idx + 1 }}</td>
                        <td class="side-cell buy">BUY</td>
                        <td>{{ order.price }}</td>
                        <td>{{ order.amount }}</td>
                        <td>${{ order.total }}</td>
                        <td>{{ order.percentage }}%</td>
                      </tr>
                    </template>
                  </tbody>
                </table>
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
  gap: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

/* Ensure tabs fill available space */
.compact-container :deep(.n-tabs) {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

/* Ensure tab pane content is scrollable */
.compact-container :deep(.n-tab-pane) {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  padding: 0;
}

/* Add padding only to non-orders tabs */
.compact-container :deep(.n-tab-pane):not(.orders-tab) {
  padding: 8px;
}

/* Orders Tab Styles */
.orders-tab {
  display: flex !important;
  flex-direction: column !important;
  flex: 1 !important;
  overflow: hidden !important;
  padding: 0 !important;
}

/* Amount Type Indicator */
.amount-type-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: #1a1f2e;
  border-bottom: 1px solid #2a3441;
  font-size: 10px;
  flex-shrink: 0;
}

.amount-type-label {
  color: #888;
  font-weight: 600;
  text-transform: uppercase;
}

.amount-type-value {
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 9px;
}

.amount-type-incrementalPercent {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.4);
}

.amount-type-quantityPerGrid {
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.4);
}

.amount-type-totalAmount {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.orders-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  height: 100%;
  gap: 1px;
  padding: 2px 4px;
}

/* SELL and BUY sections */
.orders-section {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  min-height: 0;
  gap: 1px;
}

.orders-sell-section {
  flex: 1;
}

.orders-buy-section {
  flex: 1;
}

/* Divider between SELL and BUY */
.orders-divider {
  width: 100%;
  height: 1px;
  background: #0080ff;
  flex-shrink: 0;
  margin: 0;
}

/* Table Header */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 4px;
  background: #1a1f2e;
  border: 1px solid #2a3441;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  color: #888;
  flex-shrink: 0;
  gap: 2px;
  line-height: 1.2;
}

.orders-sell-section .table-header {
  color: #ffc107;
}

.orders-buy-section .table-header {
  color: #10eb04;
}

.table-header span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Table Container with Scrolling */
.table-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  border: 1px solid #2a3441;
  border-radius: 4px;
  background: #0f1419;
}

/* SELL table container - limited to 10 rows */
.orders-sell-section .table-container {
  max-height: 135px;
  flex: 0 0 auto;
}

/* BUY table container - limited to 10 rows */
.orders-buy-section .table-container {
  max-height: 135px;
  flex: 0 0 auto;
}

/* Table Styles */
.orders-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  font-family: 'Courier New', monospace;
  line-height: 1.3;
}

.orders-table thead {
  position: sticky;
  top: 0;
  background: #1a1f2e;
  border-bottom: 1px solid #2a3441;
  z-index: 10;
}

.orders-table th {
  padding: 3px 2px;
  text-align: center;
  color: #888;
  font-weight: 600;
  text-transform: uppercase;
  border-right: none;
  font-size: 10px;
  line-height: 1.1;
}

.orders-table th:last-child {
  border-right: none;
}

.orders-table td {
  padding: 2px 2px;
  border-right: none;
  border-bottom: 1px solid rgba(42, 52, 65, 0.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  font-size: 11px;
}

.orders-table td:first-child,
.orders-table th:first-child {
  text-align: center;
  width: 20px;
  max-width: 20px;
  padding: 1px;
}

.orders-table td:last-child {
  border-right: none;
}

/* SELL Table Rows */
.sell-table tbody tr {
  background: rgba(235, 4, 4, 0.05);
  border-left: 2px solid #eb0404;
}

.sell-table tbody tr:hover {
  background: rgba(235, 4, 4, 0.1);
}

.sell-table tbody tr.is-initial {
  background: rgba(235, 4, 4, 0.15);
}

.sell-table tbody tr.has-increment {
  background: rgba(235, 4, 4, 0.08);
}

/* Color classes for incremental amounts */
.qty-cell {
  color: #888;
}

.total-cell {
  color: #aaa;
  font-weight: 500;
}

.inc-qty-cell.sell,
.inc-qty-cell.buy {
  font-weight: 600;
}

.inc-qty-cell.sell {
  color: #eb0404;
}

.inc-qty-cell.buy {
  color: #10eb04;
}

.inc-total-cell.sell,
.inc-total-cell.buy {
  font-weight: 700;
}

.inc-total-cell.sell {
  color: #ff6b6b;
}

.inc-total-cell.buy {
  color: #51cf66;
}

.sell-table .side-cell.sell {
  color: #eb0404;
  font-weight: 700;
}

/* BUY Table Rows */
.buy-table tbody tr {
  background: rgba(16, 235, 4, 0.05);
  border-left: 2px solid #10eb04;
}

.buy-table tbody tr:hover {
  background: rgba(16, 235, 4, 0.1);
}

.buy-table tbody tr.is-initial {
  background: rgba(16, 235, 4, 0.15);
}

.buy-table tbody tr.has-increment {
  background: rgba(16, 235, 4, 0.08);
}

.buy-table .side-cell.buy {
  color: #10eb04;
  font-weight: 700;
}

/* Scrollbar styling for table containers */
.table-container::-webkit-scrollbar {
  width: 10px;
}

.table-container::-webkit-scrollbar-track {
  background: transparent;
}

.table-container::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.5);
  border-radius: 5px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.8);
  background-clip: padding-box;
  cursor: grab;
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
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 100%;
}

.order-row {
  display: grid;
  grid-template-columns: 24px 32px 58px 54px 58px 40px;
  gap: 3px;
  padding: 2px 3px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  border-left: 2px solid transparent;
  font-size: 6px;
  font-family: 'Courier New', monospace;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

/* Scrollbar styling for orders container */
div[style*="overflow-y: auto"]::-webkit-scrollbar {
  width: 8px;
}

div[style*="overflow-y: auto"]::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.4);
  border-radius: 4px;
}

div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.6);
}

/* Legacy scrollbar styling */
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

/* Draggable Modal Styling */
.draggable-modal {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.draggable-modal :deep(.n-modal-mask) {
  pointer-events: none;
}

.draggable-modal :deep(.n-card) {
  pointer-events: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}
</style>
