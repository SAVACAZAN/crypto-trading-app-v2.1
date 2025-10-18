<template>

  <n-card>

  
<div>
  <div>
   

  <table class="buy-table">
    <tr>      
      <td>
        <span style="color: #13bcda;">Total Buy Orders  </span>
       
          <span style="color: #46f012;">    [[[  {{ buyOrders.length }}  ]]]    </span>
        </td>
      <td>
          <span style="color: #13bcda;">Average Price {{ quote }} </span>
        </td>
          <td>
          <span style="color: #13e6f5;">{{ formatNumber(calculateAveragePrice(buyOrders)) }} </span>
        </td>
    
        <td>
          <span style="color: #13bcda;">Total Quantity: {{ base }} </span>
        </td>
          <td>
          <span style="color: #13e6f5;">{{ formatNumber(calculateTotalQuantity(buyOrders).toFixed(2))}} </span>
        </td>

        <td>
          <span style="color: #13bcda;">Total Cost {{ quote }} </span>
        </td>
          <td>
          <span style="color: #2ef813;">{{ formatNumber(calculateTotalCost(buyOrders)) }}</span>
        </td>
        

    </tr>
  </table>
</div>

<div>
  <table class="sell-table">
    <tr>
     
     <td>
        <span style="color: #13bcda;">Total Sell Orders</span> 
       
          <span style="color: #e90a15;">    [[[  {{ sellOrders.length }}  ]]]    </span>
        </td>
    

      
      <td>
          <span style="color: #13bcda;">Average Price {{ quote }} </span>
        </td>
          <td>
            <span style="color: #13e6f5;">{{ formatNumber(calculateAveragePrice(sellOrders), 'AveragePrice') }}</span>

        </td>
    
        <td>
          <span style="color: #13bcda;">Total Quantity {{ quote }}</span>
        </td>
          <td>
          <span style="color: #13e6f5;">  {{ formatNumber(calculateTotalQuantity(sellOrders).toFixed(2))}} </span>
        </td>

        <td>
          <span style="color: #13bcda;">Total Cost {{ quote }} </span>
        </td>
          <td>
          <span style="color: #e2735f;">   {{ formatNumber(calculateTotalCost(sellOrders)) }}</span>
        </td>

     
    </tr>
  </table>
</div>

</div>
</n-card>


  <div class="container">
    <n-card>
 
      <div class="balance-container">
    
    <!-- Tabel pentru Afișarea balanței totale -->
    <div class="balance-section">
    <table class="balance-table">
      <tr>
        <td>
          <span style="color: #13bcda;">Free {{ quote }} :</span>
          <span style="color: #13e6f5;">   {{ formatNumber(quoteBalance) }}</span>

        </td>

      </tr>
      <tr>
        <td>
        <span style="color: #13bcda;">Total1 {{ quote }} :</span>
          <span style="color: #13e6f5;">   {{ formatNumber(calculateTotalCost(buyOrders)) }}</span>
        </td>
      
      </tr>
      <tr>
         <td>
            <span style="color: #57b353;">Free {{ base }} :</span>
            <span style="color: #e2c102;">  {{ formatNumber(baseBalance) }}</span>     
          </td>

      </tr>
      <tr>
        <td>
            <span style="color: #57b353;">Total1 {{ base }} :</span>
            <span style="color: #e2c102;"> {{ formatNumber(calculateTotalbase()) }}</span>   

          </td>
        
          
      
      </tr>
    </table>
  </div>

  <!-- Tabel pentru Afișarea balanței salvate și diferenței -->
  <div class="balance-section">
    <table class="balance-table">
      <tr v-if="balancebase !== 0">
        <td style="color: #57b353" class="balance-label">Saved {{ base }} :</td>
        <td style="color: #e2c102"> {{ formatNumber(balancebase) }}</td>
      </tr>
      <tr v-if="balancequote !== 0">
        <td style="color: #13bcda" class="balance-label">Saved {{ quote }} :</td>
        <td style="color: #13e6f5"> {{ formatNumber(balancequote) }}</td>
      </tr>
      <tr>
        <td style="color: #29f10f" class="balance-label">{{ base }} Dif:</td>
        <td style="color: #13e6f5">{{ formatNumber(calculateTotalbase() - parseFloat(balancebase).toFixed(2)) }}</td>
      </tr>
      <tr>
        <td style="color: #0f24dd" class="balance-label">{{ quote }} Dif:</td>
        <td style="color: #a0e7de">{{ formatNumber(calculateTotalCost(buyOrders) - parseFloat(balancequote).toFixed(2)) }}</td>
      </tr>
    </table>
  </div>

  <!-- Tabel pentru Balanță și managementul balanței -->
  <div class="balance-section">
    <table class="balance-table">
      <tr>
        <td class="balance-label">1{{ base }} </td>
        <td><input type="text" v-model="balancebase" class="balance-input" placeholder="Enter balancebase"></td>
      </tr>
      <tr>
        <td class="balance-label">{{ quote }} </td>
        <td><input type="text" v-model="balancequote" class="balance-input" placeholder="Enter balancequote"></td>
      </tr>
     
    </table>
    <div>
    <td colspan="0"><button @click="saveBalanceLocal" class="balance-button">S</button></td>
        <td colspan="0 "><button @click="saveBalanceTargetLocal" class="balance-button">T</button></td>
        <td colspan="0"><button @click="saveBalanceLocal" class="balance-button">S</button></td>
        <td colspan="0 "><button @click="saveBalanceTargetLocal" class="balance-button">T</button></td>
     
      
   </div>
      
<div>
  <tr> <span>GRIDS: {{ RemainingNrGrids }}</span></tr>
    <tr>
      
  <td>Posible {{ base }}</td>
  <td>{{ formatNumber(parseFloat(calculateTotalbase()) + parseFloat(calculateTotalQuantity(buyOrders)), ) }}</td>
</tr>
<tr>
  <td>BreakGiven {{ base }}</td>
  <td>

    {{ 
  Math.abs(
    parseFloat(
      (
        (calculateTotalCost(buyOrders) - parseFloat(balancequote)) /
        (calculateTotalbase() - parseFloat(balancebase))
      ).toFixed(3)
    )
  )
}}



</td>


</tr>
</div>
   
  </div>

 

</div>



    <!-- Tabele pentru Buy Orders și Sell Orders -->
  <div class="orders-container">
    <!-- Tabel pentru Buy Orders -->
    <div class="order-table buy-orders" style="max-height: 300px; overflow-y: auto;">
      <h2 class="section-heading buy-heading">Buy Orders quote {{ quote }} </h2>
      <table class="table">
        <!-- antetul tabelului -->
        <thead>
          <tr>
            <th class="buy-symbol">Symbol</th>
            <th class="buy-price">Price</th>
            <th class="buy-amount">Amount</th>
            <th class="buy-inusd">InUSD</th>
            <th class="buy-filled">Filled</th>
            <th class="buy-remaining">Remaining</th>
            <th class="buy-actions">Actions</th>
          </tr>
        </thead>
        <!-- corpul tabelului -->
        <tbody>
          
          <tr v-for="order in buyOrders" :key="order.id">
            <td>{{ order.symbol }}</td>
            <td><span style="color: #13e6f5;">{{ formatNumber(order.price, 'Price') }}</span></td>
            <td><span style="color: #13e6f5;">{{ formatNumber(order.amount) }}</span></td>
            <td><span style="color: #13e6f5;">{{ formatNumber(calculateAmountInUSD(order)) }}</span></td>
            <td><span style="color: #13e6f5;">{{ formatNumber(order.filled) }}</span></td>
            <td><span style="color: #13e6f5;">{{ formatNumber(order.remaining) }}</span></td>
             <button @click="cancelOrder(order)" class="buy-cancel-btn">Cancel Order</button>
           
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tabel pentru Sell Orders -->
    <div class="order-table sell-orders" style="max-height: 300px; overflow-y: auto;">
      <h2 class="section-heading sell-heading">Sell Orders base {{ base }} </h2>
      <table class="table">
        <!-- antetul tabelului -->
        <thead>
          <tr>
            <th class="sell-symbol">Symbol</th>
            <th class="sell-price">Price</th>
            <th class="sell-amount">Amount</th>
            <th class="sell-inusd">InUSD</th>
            <th class="sell-filled">Filled</th>
            <th class="sell-remaining">Remaining</th>
            <th class="sell-actions">Actions</th>
          </tr>
        </thead>
        <!-- corpul tabelului -->
        <tbody>
          <tr v-for="order in sellOrders" :key="order.id">
            <td><span style="color: #f70909;">{{ order.symbol }}</span></td>
              <td><span style="color: #e6f51b;">{{ formatNumber(order.price, 'Price') }}</span></td>
              <td><span style="color: #f70909;">{{ formatNumber(order.amount) }}</span></td>
              <td><span style="color: #13e6f5;">{{ formatNumber(calculateAmountInUSD(order)) }}</span></td>
              <td><span style="color: #f70909;">{{ formatNumber(order.filled) }}</span></td>
              <td><span style="color: #ec2e47;">{{ formatNumber(order.remaining) }}</span></td>
            
              <button @click="cancelOrder(order)" class="sell-cancel-btn">Cancel Order</button>
          
          </tr>
        </tbody>
      </table>
    </div>
  </div>
    

  
  </n-card>



 


   

   
  </div>
</template>


<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useAppStore } from '~/stores/app.store';
import { ref, computed } from "vue";

import { clearIntervalAsync, setIntervalAsync } from "set-interval-async";

const app = useAppStore();

let userID = useCookie('userID');
let currentExchange = ref(app.getUserSelectedExchange);
let currentSymbol = ref(app.getUserSelectedMarket);
let base = currentSymbol.value.split('/')[0];
let quote = currentSymbol.value.split('/')[1];

let buyOrders = ref([]);
let sellOrders = ref([]);

let baseBalance = ref('0');
let quoteBalance = ref('0');

let userBalanceInterval = null;

let MaxNrGrids = 500;
let RemainingNrGrids = computed(() => {
  return MaxNrGrids - (buyOrders.value.length + sellOrders.value.length);
});

// Definirea variabilei pentru balanță
let balancebase = ref(0);
let balancequote = ref(0);


onMounted(() => {
  userBalanceInterval = setIntervalAsync(fetchUserBalancePooling, 500);
  fetchOrdersPooling();
  loadBalanceLocal();
  startAutoRefresh();
});

onUnmounted(() => {
  clearIntervalAsync(userBalanceInterval);
});

// Load saved balances from localStorage
function loadBalanceLocal() {
    const savedBalanceBase = localStorage.getItem("savedBalanceBase");
    if (savedBalanceBase !== null) {
        balancebase.value = savedBalanceBase;
    }

    const savedBalanceQuote = localStorage.getItem("savedBalanceQuote");
    if (savedBalanceQuote !== null) {
        balancequote.value = savedBalanceQuote;
    }

    const savedBalanceBaseTarget = localStorage.getItem("savedBalanceBaseTarget");
    if (savedBalanceBaseTarget !== null) {
        balancebaseTarget.value = savedBalanceBaseTarget;
    }

    const savedBalanceQuoteTarget = localStorage.getItem("savedBalanceQuoteTarget");
    if (savedBalanceQuoteTarget !== null) {
        balancequoteTarget.value = savedBalanceQuoteTarget;
    }
}


// Save balances to localStorage
function saveBalanceLocal() {
    localStorage.setItem("savedBalanceBase", balancebase.value);
    localStorage.setItem("savedBalanceQuote", balancequote.value);
}
function saveBalanceTargetLocal() {
    localStorage.setItem("savedBalanceBaseTarget", balancebaseTarget.value);
    localStorage.setItem("savedBalanceQuoteTarget", balancequoteTarget.value);
  }


async function fetchUserBalancePooling() {
  let response = await $fetch('/api/v1/fetchBalance', {
    query: {
      userID: userID.value,
      exchange: currentExchange.value,
    }
  });

  if (response.data) {
    if (response.data[base]) {
      baseBalance.value = `${(response.data[base].free).toFixed(2)}`;
    } else {
      baseBalance.value = 'N/A';
    }

    if (response.data[quote]) {
      quoteBalance.value = `${(response.data[quote].free).toFixed(2)}`;
    } else {
      quoteBalance.value = 'N/A';
    }
  } else {
    baseBalance.value = 'N/A';
    quoteBalance.value = 'N/A';
  }
}

async function fetchOrdersPooling() {
  let openOrdersRes = await $fetch('/api/v1/fetchOpenOrders', {
    query: {
      userID: userID.value,
      exchange: currentExchange.value,
      symbol: currentSymbol.value,
    }
  });

  if (openOrdersRes.data) {
    buyOrders.value = openOrdersRes.data.filter(order => order.side === 'buy');
    sellOrders.value = openOrdersRes.data.filter(order => order.side === 'sell');
  }
}

function calculateAveragePrice(orders) {
  let totalAmount = orders.reduce((acc, order) => acc + order.amount, 0);
  let totalPrice = orders.reduce((acc, order) => acc + (order.amount * order.price), 0);
  let averagePrice = totalPrice / totalAmount;
  return formatNumber(averagePrice.toFixed(3), 'AveragePrice');
}


function calculateTotalQuantity(orders) {
  return orders.reduce((acc, order) => acc + order.amount, 0);
}

function calculateTotalCost(orders) {
  return orders.reduce((acc, order) => acc + (order.amount * order.price), 0).toFixed(2);
}


function formatNumber(value, columnName) {
  if (typeof value === 'string' || typeof value === 'number') {
    // Verificăm dacă valoarea este un număr sau un șir de caractere care poate fi convertit în număr
    let numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      // Folosim expresia regulată pentru a adăuga separatorul de mii
      if (columnName !== 'AveragePrice' && columnName !== 'Price') {

        return numericValue.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
      } else {
        return numericValue.toFixed(3);
      }
    }
  }
  // Dacă nu este un număr sau un șir de caractere numeric, returnăm valoarea originală
  return value;
}




function calculateTotalquote() {
  // Calculăm totalul din ordinele de vânzare
  let totalFromOrders = calculateTotalQuantity(buyOrders.value);

  // Adăugăm cantitatea disponibilă în balanță pentru quote
  let totalQuoteBalance = parseFloat(quoteBalance.value);

  // Adăugăm și valoarea din ordinele de vânzare
  totalQuoteBalance += totalFromOrders;

  // Returnăm balanța totală pentru quote
  return totalQuoteBalance.toFixed(2);
}

function calculateTotalbase() {
  // Calculăm totalul din ordinele de cumpărare
  let totalFromOrders = calculateTotalQuantity(sellOrders.value);

  // Adăugăm cantitatea disponibilă în balanță pentru base
  let totalBaseBalance = parseFloat(baseBalance.value);

  // Adăugăm și valoarea din ordinele de cumpărare
  totalBaseBalance += totalFromOrders;

  // Returnăm balanța totală pentru base
  return totalBaseBalance.toFixed(2);
}




function calculateAmountInUSD(order) {
  // Calculăm valoarea în USD și o formatăm utilizând funcția formatNumber
  return formatNumber((parseFloat(order.amount) * parseFloat(order.price)).toFixed(2));
}


function cancelOrder(order) {
  // Implementarea funcționalității de anulare a comenzii
}

let refreshInterval;

function startAutoRefresh() {
  refreshInterval = setInterval(fetchOrdersPooling, 300000);
}
</script>

<style scoped>
/* Stiluri generale pentru tabele */
.buy-table{
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background-color: #0a2e01; /* Culoare de fundal pentru tabele */
  border-radius: 10px; /* Rotunjirea marginilor tabelei */
  box-shadow: 0 0 20px rgba(189, 236, 59, 0.904); /* Umbra */
}
.sell-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background-color: #420202; /* Culoare de fundal pentru tabele */
  border-radius: 10px; /* Rotunjirea marginilor tabelei */
  box-shadow: 0 0 20px rgba(189, 236, 59, 0.904); /* Umbra */
}

/* Stiluri pentru antetul tabelei */
.buy-table th{
  padding: 10px;
  text-align: left;
  background-color: #3498db; /* Culoare de fundal pentru antet */
  color: #fff; /* Culoare text antet */
  border-radius: 10px 10px 0 0; /* Rotunjirea marginilor antetului */
}

.sell-table th {
  padding: 10px;
  text-align: left;
  background-color: #3498db; /* Culoare de fundal pentru antet */
  color: #fff; /* Culoare text antet */
  border-radius: 10px 10px 0 0; /* Rotunjirea marginilor antetului */
}

/* Stiluri pentru celule */
.buy-table td,
.sell-table td {
  padding: 10px;
  border-bottom: 1px solid #ddd; /* Delimitare între rânduri */
}

/* Stiluri pentru ultimul rând */
.buy-table tr:last-child td,
.sell-table tr:last-child td {
  border-bottom: none; /* Eliminarea delimitării la ultimul rând */
  border-radius: 0 0 10px 10px; /* Rotunjirea marginilor la ultimul rând */
}

/* Stiluri pentru textul din celule */
.buy-orders,
.sell-orders,
.average-price,
.total-quantity,
.total-cost {
  font-size: 11px;
  font-weight: bold;
}



.average-price {
  color: #27ae60; /* Culoare pentru prețul mediu */
}

.total-quantity {
  color: #f39c12; /* Culoare pentru cantitatea totală */
}

.total-cost {
  color: #9b59b6; /* Culoare pentru costul total */
}




/* Stilurile pentru div-ul care conține tabelele */
div {
  margin-bottom: 20px; /* Spațiu între tabele */
}



/* Etichete pentru Buy Orders */
.buy-label {
  color: #1e90ff; /* Culoare pentru etichetele Buy Orders */
}

/* Etichete pentru Sell Orders */
.sell-label {
  color: #e74c3c; /* Culoare pentru etichetele Sell Orders */
}

.balance-section {
  display: inline-block; /* Afișează secțiunile de balanță pe aceeași linie */
  vertical-align: top; /* Aliniază secțiunile pe partea de sus a containerului */
  margin-right: 20px; /* Adaugă un spațiu între tabele */
}

/* Stilurile pentru etichetele de balanță */
.balance-label {
  font-weight: bold; /* Font bold pentru etichete */
}

/* Stilurile pentru inputurile de balanță */
.balance-input {
  width: 100px; /* Lățime fixă pentru inputuri */
}

/* Stilurile pentru butonul de salvare */
.balance-button {
  background-color: #4caf50; /* Culoare de fundal verde */
  color: white; /* Text alb */
  border: none; /* Fără bordură */
  padding: 8px 16px; /* Spațiere internă */
  text-align: center; /* Aliniere text la centru */
  text-decoration: none; /* Fără subliniere */
  display: inline-block; /* Afișare ca bloc */
  font-size: 14px; /* Dimensiune font */
  margin-top: 10px; /* Spațiu de sus */
}

/* Stilurile pentru balanța totală */
.quote-balance,
.quote-total,
.base-balance,
.base-total {
  font-weight: bold; /* Font bold */
}

/* Stilurile pentru fiecare tabel */
.balance-table {
  border-collapse: collapse; /* Colapsare bordură */
  width: 200px; /* Lățime fixă pentru tabele */
}

/* Stilurile pentru celulele tabelului */
.balance-table td {
  padding: 8px; /* Spațiere internă */
  border: 1px solid #ddd; /* Bordură subțire */
  text-align: left; /* Aliniere text la stânga */
}

/* Stilurile pentru antetul tabelului */
.balance-table th {
  padding-top: 12px; /* Spațiere de sus pentru antet */
  padding-bottom: 12px; /* Spațiere de jos pentru antet */
  background-color: #4caf50; /* Culoare de fundal verde pentru antet */
  color: white; /* Text alb pentru antet */
  border: 1px solid #ddd; /* Bordură subțire */
  text-align: left; /* Aliniere text la stânga */
  padding: 8px; /* Spațiere internă */
}

/* Stilurile pentru bara de instrumente */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  background-color: #0c0faf; /* Culoare de fundal pentru bara */
  padding: 5px;
  border-radius: 10px; /* Colțuri rotunjite */
}

/* Stilurile pentru textul din bara de instrumente */
.buy-text {
  color: #2ecc71; /* Culoare text pentru "Buy" */
  font-weight: bold;
}

.sell-text {
  color: #e74c3c; /* Culoare text pentru "Sell" */
  font-weight: bold;
}

/* Stilurile pentru fiecare element de text */
.buy-orders {
  color: #f39c12; /* Culoare pentru "Total Buy Orders" */
}

.buy-average {
  color: #9b59b6; /* Culoare pentru "Average Price" */
}

.buy-quantity {
  color: #1abc9c; /* Culoare pentru "Total Quantity" */
}

.buy-cost {
  color: #3498db; /* Culoare pentru "Total Cost" */
}

.sell-orders {
  color: #d35400; /* Culoare pentru "Total Sell Orders" */
}

.sell-average {
  color: #30110d; /* Culoare pentru "Average Price" */
}

.sell-quantity {
  color: #7f8c8d; /* Culoare pentru "Total Quantity" */
}

.sell-cost {
  color: #16a085; /* Culoare pentru "Total Cost" */
}



  /* Stilurile pentru containerul de comenzi */
  .orders-container {
    display: flex;
    overflow-x: auto; /* Adăugăm scroll orizontal când conținutul depășește lățimea containerului */
    gap: 20px; /* Adăugăm un spațiu între fiecare tabel */
    flex-wrap: nowrap; /* Evităm trecerea pe mai multe linii */
    cursor: ns-resize; /* Cursor vertical (sus-jos) */
  }

  /* Stilurile pentru tabelele de comenzi */
  .order-table {
    border: 1px solid #ccc; /* Adăugăm un border pentru claritate */
    border-radius: 5px; /* Rotunjim marginile */
    overflow-y: auto; /* Adăugăm scroll vertical când conținutul depășește înălțimea containerului */
    width: 100%; /* Tabelul ocupă întreaga lățime a containerului */
    min-width: 300px; /* Lățimea minimă a tabelului */
    max-width: 600px; /* Lățimea maximă a tabelului */
    min-height: 200px; /* Înălțimea minimă a tabelului */
    max-height: 400px; /* Înălțimea maximă a tabelului */
  }
/* Culorile pentru fiecare element de text */
.quote-balance {
  color: #3498db; /* Culoare pentru "Free {{ quote }} : " */
}

.quote-total {
  color: #3498db; /* Culoare pentru "Total {{ quote }} : " */
}

.base-balance {
  color: #e67e22; /* Culoare pentru "Free {{ base }} : " */
}

.base-total {
  color: #e67e22; /* Culoare pentru "Total {{ base }} : " */
}



/* Culori pentru titlurile secțiunilor Buy și Sell */
.buy-heading {
  color: #058f43; /* Culoare pentru titlurile secțiunii Buy */
}

.sell-heading {
  color: #e74c3c; /* Culoare pentru titlurile secțiunii Sell */
}

/* Culori și dimensiuni pentru antetul tabelului Buy */
.buy-symbol, .buy-price, .buy-amount, .buy-inusd, .buy-filled, .buy-remaining, .buy-actions {
  color: #058f43; /* Culori pentru antetul tabelului Buy */
  font-size: 12px; /* Dimensiunea fontului */
}

/* Culori și dimensiuni pentru antetul tabelului Sell */
.sell-symbol, .sell-price, .sell-amount, .sell-inusd, .sell-filled, .sell-remaining, .sell-actions {
  color: #e74c3c; /* Culori pentru antetul tabelului Sell */
  font-size: 12px; /* Dimensiunea fontului */
}


/* Culori pentru butoanele de anulare a comenzii din tabelul Buy */
.buy-cancel-btn {
  background-color: #3498db;
  color: #fff;
}

/* Culori pentru butoanele de anulare a comenzii din tabelul Sell */
.sell-cancel-btn {
  background-color: #e74c3c;
  color: #fff;
}



</style>

