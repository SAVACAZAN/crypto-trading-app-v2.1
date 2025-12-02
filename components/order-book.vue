<script setup>
import { useAppStore } from '~/stores/app.store';
import {clearIntervalAsync, setIntervalAsync} from "set-interval-async"

const emit = defineEmits(['update:orderbook']);

const app = useAppStore()

let userID = useCookie('userID');

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);


const bidsData = ref([]);
const asksData = ref([]);

let orderBookInterval = null;

onMounted(() => {
  orderBookInterval = setIntervalAsync(fetchOrderBookPooling, 500);
});

onUnmounted(() => {
  clearIntervalAsync(orderBookInterval);
});

async function fetchOrderBookPooling() {
  // Safety check - don't fetch if exchange or symbol are not set
  if (!currentExchange.value || !currentSymbol.value) {
    console.warn('⚠️ OrderBook: Exchange or symbol not set, skipping fetch');
    return;
  }

  let bids = [];
  let asks = [];

  let orderBook = await $fetch('/api/v1/fetchOrderBook', {
    query:{
      userID:userID.value,
      exchange:currentExchange.value,
      symbol:currentSymbol.value
      // No limit = get FULL orderbook depth from exchange
    }
  });

  // Handle case where user has no API keys configured
  if (orderBook.noApiKeys) {
    // Silently skip - user hasn't configured API keys yet
    return;
  }

  if (orderBook.data) {
    for (let i = 0; i < orderBook.data.bids.length; i++) {
      bids.push({
        price: orderBook.data.bids[i][0],
        quantity: orderBook.data.bids[i][1],
        total: (orderBook.data.bids[i][1] * orderBook.data.bids[i][0]).toFixed(2),
      })
    }
    bidsData.value = bids;

    for (let i = 0; i < orderBook.data.asks.length; i++) {
      asks.push({
        price: orderBook.data.asks[i][0],
        quantity: orderBook.data.asks[i][1],
        total: (orderBook.data.asks[i][1] * orderBook.data.asks[i][0]).toFixed(2),
      })
    }
    asksData.value = asks;

    // Emit orderbook data to parent component
    emit('update:orderbook', orderBook.data);
  }
}


</script>

<template>
  <n-card size="small" class="order-book-card">
    <template #header>
      <div class="card-title">Order Book</div>
    </template>

    <div class="order-book-container">
      <!-- Asks Section -->
      <div class="asks-section">
        <div class="order-row" v-for="row in asksData" :key="row.price">
          <span class="cell price-cell red">{{ row.price }}</span>
          <span class="cell qty-cell red">{{ row.quantity }}</span>
          <span class="cell total-cell red">{{ row.total }}</span>
        </div>
      </div>

      <!-- Headers -->
      <div class="headers-row">
        <span class="header-cell">Price</span>
        <span class="header-cell">Quantity</span>
        <span class="header-cell">Total</span>
      </div>

      <!-- Bids Section -->
      <div class="bids-section">
        <div class="order-row" v-for="row in bidsData" :key="row.price">
          <span class="cell price-cell green">{{ row.price }}</span>
          <span class="cell qty-cell green">{{ row.quantity }}</span>
          <span class="cell total-cell green">{{ row.total }}</span>
        </div>
      </div>
    </div>
  </n-card>
</template>

<style scoped>
/* Card Styling - Compact & Full Width */
.order-book-card {
  width: 100%;
  height: 100%;
}

:deep(.n-card__content) {
  padding: 8px !important;
}

.card-title {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Container */
.order-book-container {
  display: flex;
  flex-direction: column;
  gap: 0px;
}

/* Asks & Bids Sections - Compact Display */
.asks-section,
.bids-section {
  display: flex;
  flex-direction: column;
  max-height: 350px;
  overflow-y: auto;
  overflow-x: hidden;
}

.asks-section {
  flex-direction: column-reverse;
}

/* Scrollbar Styling */
.asks-section::-webkit-scrollbar,
.bids-section::-webkit-scrollbar {
  width: 4px;
}

.asks-section::-webkit-scrollbar-thumb,
.bids-section::-webkit-scrollbar-thumb {
  background-color: rgba(95, 92, 92, 0.3);
  border-radius: 2px;
}

.asks-section::-webkit-scrollbar-track,
.bids-section::-webkit-scrollbar-track {
  background-color: transparent;
}

/* Order Rows */
.order-row {
  display: grid;
  grid-template-columns: auto auto auto;
  gap: 6px;
  padding: 2px 4px;
  align-items: center;
  transition: background-color 0.15s ease;
}

.order-row:hover {
  background-color: rgba(128, 128, 128, 0.08);
  border-radius: 2px;
}

/* Headers Row */
.headers-row {
  display: grid;
  grid-template-columns: auto auto auto;
  gap: 6px;
  padding: 4px 4px;
  border-top: 1px solid rgba(128, 128, 128, 0.2);
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  background-color: rgba(128, 128, 128, 0.05);
  margin: 4px 0;
}

.header-cell {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  opacity: 0.7;
  white-space: nowrap;
  text-align: right;
}

.header-cell:first-child {
  text-align: left;
}

/* Data Cells */
.cell {
  font-size: 11px;
  font-family: 'Courier New', monospace;
  font-weight: 500;
  white-space: nowrap;
  text-align: right;
  padding: 0;
}

.price-cell {
  text-align: left;
}

/* Colors */
.red {
  color: #e71b1b;
}

.green {
  color: #0ed80e;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cell {
    font-size: 10px;
  }

  .header-cell {
    font-size: 8px;
  }
}
</style>
