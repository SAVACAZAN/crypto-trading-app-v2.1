<script setup>
const notification = useNotification();
import { useAppStore } from '~/stores/app.store';
import {NButton} from "naive-ui";
import {clearIntervalAsync, setIntervalAsync} from "set-interval-async";
const app = useAppStore()

let userID = useCookie('userID');

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);

const openOrdersTablePagination = false;
const openOrdersTableColumns = [
  {
    title: "Symbol",
    key: "symbol"
  },
  {
    title: "Type",
    key: "type"
  },
  {
    title: "Side",
    key: "side"
  },
  {
    title: "Price",
    key: "price"
  },
  {
    title: "Amount",
    key: "amount"
  },
  {
    title: "Filled",
    key: "filled"
  },
  {
    title: "Remaining",
    key: "remaining"
  },
  {
    title: function(row){
      return h(
          NButton,
          {
            strong: true,
            tertiary: true,
            size: "small",
            onClick: () => cancelAllOrders(row)
          },
          { default: () => "Cancel all" }
      );
    },
    key: "actions",
    render(row) {
      return h(
          NButton,
          {
            strong: true,
            tertiary: true,
            size: "small",
            onClick: () => cancelOrder(row)
          },
          { default: () => "Cancel Order" }
      );
    }
  },
];

const openOrdersTableData = ref([]);


const closedOrdersTablePagination = false;
const closedOrdersTableColumns = [
  {
    title: "Symbol",
    key: "symbol"
  },
  {
    title: "Type",
    key: "type"
  },
  {
    title: "Side",
    key: "side"
  },
  {
    title: "Price",
    key: "price"
  },
  {
    title: "Amount",
    key: "amount"
  },
  {
    title: "Filled",
    key: "filled"
  },
  {
    title: "Remaining",
    key: "remaining"
  },
];

const closedOrdersTableData = ref([]);

let orderListInterval = null;

onMounted(() => {
  orderListInterval = setIntervalAsync(fetchOrdersPooling, 500);
});

onUnmounted(() => {
  clearIntervalAsync(orderListInterval);
});

async function cancelOrder(row) {
  let data = {
    userID:userID.value,
    exchange: currentExchange.value,
    id:row.id,
    symbol:currentSymbol.value,
  }

  let response = await $fetch( '/api/v1/cancelOrder', {
    method: 'POST',
    body: data
  } );

  let base = row.symbol.split('/')[0];
  let quote = row.symbol.split('/')[1];

  notification['info']({
    content: "Order Cancelled!",
    meta: `Cancelled ${data.exchange} limit ${row.side} order for ${row.amount} ${base} by using ${quote} at price ${row.price}`,
    duration: 2500,
  });
}

async function cancelAllOrders(row) {
  let orders = openOrdersTableData.value;

  for (const order of orders) {
    await cancelOrder(order);
  }
}

async function fetchOrdersPooling() {
  let openOrdersData = [];
  let closedOrdersData = [];

  let openOrdersRes = await $fetch('/api/v1/fetchOpenOrders', {
    query:{
      userID:userID.value,
      exchange:currentExchange.value,
      symbol:currentSymbol.value,
    }
  });
  if (openOrdersRes.data) {
    for (let i = 0; i < openOrdersRes.data.length; i++) {
      openOrdersData.push({
        id: openOrdersRes.data[i].id,
        datetime: openOrdersRes.data[i].datetime,
        symbol: openOrdersRes.data[i].symbol,
        type: openOrdersRes.data[i].type,
        side: openOrdersRes.data[i].side,
        price: openOrdersRes.data[i].price,
        amount: openOrdersRes.data[i].amount,
        filled: openOrdersRes.data[i].filled,
        remaining: openOrdersRes.data[i].remaining,
        actions: '',
      })
    }

    openOrdersTableData.value = openOrdersData;
  }

  // Closed Orders
  let closedOrdersRes = await $fetch('/api/v1/fetchClosedOrders', {
    query:{
      userID:userID.value,
      exchange:currentExchange.value,
      symbol:currentSymbol.value,
    }
  });

  if (closedOrdersRes.data) {
    for (let i = 0; i < closedOrdersRes.data.length; i++) {
      closedOrdersData.push({
        datetime: closedOrdersRes.data[i].datetime,
        symbol: closedOrdersRes.data[i].symbol,
        type: closedOrdersRes.data[i].type,
        side: closedOrdersRes.data[i].side,
        price: closedOrdersRes.data[i].price,
        amount: closedOrdersRes.data[i].amount,
        filled: closedOrdersRes.data[i].filled,
        remaining: closedOrdersRes.data[i].remaining,
      })
    }

    closedOrdersTableData.value = closedOrdersData;
  }
}

</script>

<template>
  <n-card class="order-list-card" size="small">
    <template #header>
      <div class="card-header">
        <span class="header-title">Order History</span>
        <n-badge :value="openOrdersTableData.length" :max="99" type="success" v-if="openOrdersTableData.length > 0" />
      </div>
    </template>

    <n-tabs type="segment" animated size="small" class="order-tabs">
      <n-tab-pane name="Open Orders" tab="Open Orders">
        <div class="table-wrapper">
          <n-data-table
            :columns="openOrdersTableColumns"
            :data="openOrdersTableData"
            :pagination="openOrdersTablePagination"
            :max-height="250"
            size="small"
            :bordered="false"
            :single-line="false"
            striped
          />
        </div>
      </n-tab-pane>
      <n-tab-pane name="Closed Orders" tab="Closed Orders">
        <div class="table-wrapper">
          <n-data-table
            :columns="closedOrdersTableColumns"
            :data="closedOrdersTableData"
            :pagination="closedOrdersTablePagination"
            :max-height="250"
            size="small"
            :bordered="false"
            :single-line="false"
            striped
          />
        </div>
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<style scoped>
/* Card Styling */
.order-list-card {
  width: 100%;
  height: 100%;
}

:deep(.n-card__content) {
  padding: 8px !important;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.header-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

/* Tabs */
.order-tabs {
  margin-top: 0;
}

/* Table Wrapper */
.table-wrapper {
  margin-top: 8px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(128, 128, 128, 0.15);
}

/* Custom Table Styling */
:deep(.n-data-table) {
  background: transparent;
}

:deep(.n-data-table-th) {
  background: rgba(128, 128, 128, 0.08) !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  padding: 10px 12px !important;
  border-bottom: 2px solid rgba(128, 128, 128, 0.2) !important;
}

:deep(.n-data-table-td) {
  font-size: 12px !important;
  padding: 8px 12px !important;
  font-family: 'Courier New', monospace !important;
}

:deep(.n-data-table-tr:hover) {
  background: rgba(128, 128, 128, 0.05) !important;
}

/* Empty State */
:deep(.n-data-table-empty) {
  padding: 40px 20px !important;
  font-size: 13px !important;
  opacity: 0.6 !important;
}

/* Scrollbar */
:deep(.n-data-table-base-table-body)::-webkit-scrollbar {
  width: 8px;
}

:deep(.n-data-table-base-table-body)::-webkit-scrollbar-track {
  background: rgba(128, 128, 128, 0.05);
}

:deep(.n-data-table-base-table-body)::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.3);
  border-radius: 4px;
}

:deep(.n-data-table-base-table-body)::-webkit-scrollbar-thumb:hover {
  background: rgba(128, 128, 128, 0.5);
}

/* Responsive */
@media (max-width: 768px) {
  .table-wrapper {
    margin-top: 8px;
  }

  :deep(.n-data-table-th) {
    font-size: 10px !important;
    padding: 8px 10px !important;
  }

  :deep(.n-data-table-td) {
    font-size: 11px !important;
    padding: 6px 10px !important;
  }
}
</style>
