<template>
  <div class="trade-container">
    <!-- Top Section: 3 Columns - Trading Panel | Chart | OrderBook -->
    <div class="top-section">
      <!-- Left: Trading Panel -->
      <div class="trading-panel">
        <ExchangeForm/>
      </div>

      <!-- Center: Chart (largest) -->
      <div class="chart-panel">
        <Chart/>
      </div>

      <!-- Right: OrderBook -->
      <div class="orderbook-panel">
        <OrderBook/>
      </div>
    </div>

    <!-- Bottom Section: OrderList (full width) -->
    <div class="bottom-section">
      <OrderList/>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})
import { useAppStore } from '~/stores/app.store';
const app = useAppStore()
let userID = useCookie('userID');

await app.loadUserExchangeData(userID.value);
</script>

<style scoped>
.trade-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  width: 100%;
  height: 100vh;
  max-height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
}

/* Top Section: 3 Columns Layout */
.top-section {
  display: grid;
  grid-template-columns: 300px 1fr 280px;
  gap: 8px;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* Left Panel - Trading Form */
.trading-panel {
  display: flex;
  flex-direction: column;
  width: 300px;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Center Panel - Chart (takes remaining space) */
.chart-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

/* Right Panel - OrderBook */
.orderbook-panel {
  display: flex;
  flex-direction: column;
  width: 230px;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Bottom Section - OrderList */
.bottom-section {
  width: 100%;
  flex: 0 0 auto;
  max-height: 300px;
  overflow: hidden;
}

/* Ensure all components fit properly */
:deep(.n-card) {
  width: 100%;
  height: 100%;
}

/* Responsive Design */
@media (max-width: 1600px) {
  .top-section {
    grid-template-columns: 280px 1fr 260px;
  }

  .trading-panel {
    width: 280px;
  }

  .orderbook-panel {
    width: 260px;
  }
}

@media (max-width: 1400px) {
  .top-section {
    grid-template-columns: 260px 1fr 240px;
    min-height: 550px;
  }

  .trading-panel {
    width: 260px;
  }

  .orderbook-panel {
    width: 240px;
  }
}

@media (max-width: 1200px) {
  .top-section {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .trading-panel,
  .orderbook-panel,
  .chart-panel {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .trade-container {
    padding: 4px;
    gap: 6px;
  }

  .top-section {
    gap: 6px;
    min-height: auto;
  }
}
</style>
