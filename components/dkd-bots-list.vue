<script setup>
import { useAppStore } from '~/stores/app.store';
import { ref, computed } from "vue";
const app = useAppStore()

let userID = useCookie('userID');

let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);

const dkdBotsTablePagination = false;
const dkdBotsTableColumns = [
  {
    title: "Name",
    key: "name"
  },
  {
    title: "Symbol",
    key: "symbol"
  },
  {
    title: "PriceStart",
    key: "PriceStart"
  },
  {
    title: "Lower Price",
    key: "lowerPrice"
  },
  {
    title: "Upper Price",
    key: "upperPrice"
  },
  {
    title: "Amount Type",
    key: "amountType"
  },
  {
    title: "Amount",
    key: "amount"
  },
  {
    title: "nr Of dkds",
    key: "nrOfGrids"
  },
  {
    title: "orders Side",
    key: "ordersSide"
  },
];
const dkdBotsTableData = ref([]);

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
    title: "Actions",
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

let totalGrids = ref(0);
let totalGridsValue = ref(0);

let orderListInterval = null;
onMounted(() => {
  orderListInterval = setIntervalAsync(fetchOrdersPooling, 500);
});

onUnmounted(() => {
  clearIntervalAsync(orderListInterval);
});

async function cancelOrder(row) {
  let data = {
    userID: userID.value,
    exchange: currentExchange.value,
    id: row.id,
    symbol: currentSymbol.value,
  }

  let response = await $fetch('/api/v1/cancelOrder', {
    method: 'POST',
    body: data
  });

  let base = row.symbol.split('/')[0];
  let quote = row.symbol.split('/')[1];

  notification['info']({
    content: "Order Cancelled!",
    meta: `Cancelled ${data.exchange} limit ${row.side} order for ${row.amount} ${base} by using ${quote} at price ${row.price}`,
    duration: 2500,
  });
}

async function fetchOrdersPooling() {
  let dkdBotsData = [];
  let openOrdersData = [];
  let closedOrdersData = [];

  let dkdBotsRes = await $fetch('/api/v1/fetchdkdBots', {
    query: {
      userID: userID.value,
      exchange: currentExchange.value,
      symbol: currentSymbol.value,
    }
  });

  if (dkdBotsRes.data) {
    let totalGridsValue = 0;

    for (let i = 0; i < dkdBotsRes.data.length; i++) {
      dkdBotsData.push({
        id: dkdBotsRes.data[i].id,
        name: dkdBotsRes.data[i].name,
        symbol: dkdBotsRes.data[i].symbol,
        PriceStart: dkdBotsRes.data[i].PriceStart,
        lowerPrice: dkdBotsRes.data[i].lowerPrice,
        upperPrice: dkdBotsRes.data[i].upperPrice,
        amountType: dkdBotsRes.data[i].amountType,
        amount: dkdBotsRes.data[i].amount,
        nrOfGrids: dkdBotsRes.data[i].nrOfGrids,
        ordersSide: dkdBotsRes.data[i].ordersSide,
      });
      
      totalGridsValue += parseInt(dkdBotsRes.data[i].nrOfGrids);
    }
    totalGrids.value = totalGridsValue.toString();
    dkdBotsTableData.value = dkdBotsData;
  }

  let openOrdersRes = await $fetch('/api/v1/fetchOpenOrders', {
    query: {
      userID: userID.value,
      exchange: currentExchange.value,
      symbol: currentSymbol.value,
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

  let closedOrdersRes = await $fetch('/api/v1/fetchClosedOrders', {
    query: {
      userID: userID.value,
      exchange: currentExchange.value,
      symbol: currentSymbol.value,
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
const RemainingGrids = computed(() => 500 - parseInt(totalGrids.value));
</script>

<template>
  <n-card>
    <n-tabs type="line" animated>
      <n-tab-pane name="dkd Bots" tab="dkd Bots">
        <div>Total Grids: {{ totalGrids }}</div>
        <div>Remaining Grids: {{ RemainingGrids }}</div>
        <n-data-table
            :columns="dkdBotsTableColumns"
            :data="dkdBotsTableData"
            :pagination="dkdBotsTablePagination"
            :max-height="250"
            size="small"
        />
      </n-tab-pane>
      <n-tab-pane name="Open Orders" tab="Open Orders">
        <n-data-table
            :columns="openOrdersTableColumns"
            :data="openOrdersTableData"
            :pagination="openOrdersTablePagination"
            :max-height="250"
            size="small"
        />
      </n-tab-pane>
      <n-tab-pane name="Closed Orders" tab="Closed Orders">
        <n-data-table
            :columns="closedOrdersTableColumns"
            :data="closedOrdersTableData"
            :pagination="closedOrdersTablePagination"
            :max-height="250"
            size="small"
        />
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<style scoped>
/* Stilurile pentru tabelele de date */
.n-data-table {
  margin-top: 20px;
}

/* Stilurile pentru antetele coloanelor */
.n-data-table-header th {
  background-color: #f0f0f0;
}

/* Stilurile pentru rândurile din tabele */
.n-data-table-row {
  transition: background-color 0.3s ease;
}

.n-data-table-row:hover {
  background-color: #f5f5f5;
}

/* Stilurile pentru butonul de acțiune */
.n-button {
  margin: 0;
}
</style>
