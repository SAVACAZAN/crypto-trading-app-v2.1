
<template>
  <div style="padding: 16px; background: #0a0a0a; min-height: 100vh;">
    <h2 style="color: #f5a623; margin-bottom: 16px;">📊 Closed Orders Analytics</h2>

    <!-- Use the new tabbed component with separated pages for better performance -->
    <ClosedOrdersDevTabbed />
  </div>
</template>

<script setup>
import ClosedOrdersDevTabbed from '~/components/ClosedOrdersDevTabbed.vue';

definePageMeta({
middleware: 'auth'
})
import { useAppStore } from '~/stores/app.store';
const app = useAppStore()
let userID = useCookie('userID');

await app.loadUserExchangeData(userID.value);
</script>
<style scoped>
/* Stilurile pentru containerul principal */
.container {
  padding: 20px;
}

/* Stilurile pentru containerul de comenzi */
.orders-container {
  display: flex;
}

/* Stilurile pentru tabelele de comenzi */
.order-table {
  flex: 1;
  margin-right: 20px;
}

/* Stilurile pentru titlurile secțiunilor */
.section-heading {
  font-size: 20px;
  margin-bottom: 10px;
}

/* Stilurile pentru tabel */
.table {
  width: 100%;
  border-collapse: collapse;
}

/* Stilurile pentru antetele tabelului */
.table th {
  background-color: #ccc;
  padding: 10px;
  border: 1px solid #000;
}

/* Stilurile pentru celulele tabelului */
.table td {
  padding: 10px;
  border: 1px solid #000;
}

/* Stilurile pentru rândurile pare ale tabelului */
.table tr:nth-child(even) {
  background-color: #f2f2f2;
}

/* Stilurile pentru butoanele de anulare a comenzii */
.cancel-btn {
  background-color: #ff0000;
  color: #fff;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.cancel-btn:hover {
  background-color: #cc0000;
}

/* Stilurile pentru bara de instrumente de cumpărare */
.buy-toolbar {
  background-color: #f2fff0; /* Albastru deschis */
  border-radius: 5px;
  padding: 20px;
  margin-bottom: 20px;
}

/* Stilurile pentru textul din bara de instrumente de cumpărare */
.buy-text {
  color: #4682b4; /* Albastru dinamic */
  margin-right: 20px;
  font-weight: bold;
}

/* Stilurile pentru bara de instrumente de vânzare */
.sell-toolbar {
  background-color: #ffe4e1; /* Roz deschis */
  border-radius: 5px;
  padding: 20px;
  margin-bottom: 20px;
}

/* Stilurile pentru textul din bara de instrumente de vânzare */
.sell-text {
  color: #ff6347; /* Roșu curcubeu */
  margin-right: 20px;
  font-weight: bold;
}
</style>
