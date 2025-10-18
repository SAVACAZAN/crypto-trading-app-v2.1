<template>
  <div>
    <div class="tables-container">
      <div class="exchange-rates-table">
        <h2>Exchange Rates: <td>{{ currentSymbol }}</td> </h2>
     

        <table>
          <thead>
            <tr>
              <th>Exchange</th>
           
              <th>Best Bid</th>
              <th>Best Ask</th>
              <th>Buy Quantity</th>
              <th>Sell Quantity</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(rate, exchange) in exchangeRates" :key="exchange">
    <template v-if="rate.bid !== 'N/A' && rate.ask !== 'N/A'">
      <td :class="getExchangeClass(exchange)">{{ exchange }}</td>
      <td class="bid-price">{{ rate.bid }}</td>
      <td class="ask-price">{{ rate.ask }}</td>
 <!-- Exemplu pentru Buy Quantity -->
<td :class="['buy-quantity', getExchangeClass(exchange)]">{{ rate.buyQuantity }}</td>

<!-- Exemplu pentru Sell Quantity -->
<td :class="['sell-quantity', getExchangeClass(exchange)]">{{ rate.sellQuantity }}</td>

    </template>
  </tr>
          </tbody>
        </table>
      </div>

      <div class="arbitrage-opportunities-table">
        <h2>Arbitrage Opportunities</h2>
        <table v-if="arbitrageOpportunities.length">
          <thead>
            <tr>
              <th>Buy At</th>
              <th>Sell At</th>
              <th>Buy Price</th>
              <th>Sell Price</th>
              <th>Buy Quantity</th>
              <th>Sell Quantity</th>
              <th>Potential Profit</th>
            </tr>
          </thead>
        <tbody>
    <tr v-for="opportunity in arbitrageOpportunities" :key="opportunity.buyAt + opportunity.sellAt">
      <td :class="getExchangeClass(opportunity.buyAt)">{{ opportunity.buyAt }}</td>
      <td :class="getExchangeClass(opportunity.sellAt)">{{ opportunity.sellAt }}</td>
      <td class="bid-price">{{ opportunity.buyPrice }}</td>
      <td class="ask-price">{{ opportunity.sellPrice }}</td>
<!-- Exemplu pentru Buy Quantity în Arbitrage Opportunities -->
<td :class="['buy-quantity', getExchangeClass(opportunity.buyAt)]">{{ opportunity.buyQuantity }}</td>

<!-- Exemplu pentru Sell Quantity în Arbitrage Opportunities -->
<td :class="['sell-quantity', getExchangeClass(opportunity.sellAt)]">{{ opportunity.sellQuantity }}</td>
      <td>{{ opportunity.profit }}</td>
    </tr>
  </tbody>
        </table>
        <p v-else>No arbitrage opportunities found.</p>
      </div>
      

      <tbody>
      <div class="tables-switch">
        <button data-symbol="BTC" @click="setCurrentSymbol('BTC')">BTC</button>
        <button data-symbol="ETH" @click="setCurrentSymbol('ETH')">ETH</button>
        <button data-symbol="EGLD" @click="setCurrentSymbol('EGLD')">EGLD</button>
        <button data-symbol="QNT" @click="setCurrentSymbol('QNT')">QNT</button>
        <button data-symbol="BCH" @click="setCurrentSymbol('BCH')">BCH</button>
        <button data-symbol="LTC" @click="setCurrentSymbol('LTC')">LTC</button>
        <button data-symbol="DASH" @click="setCurrentSymbol('DASH')">DASH</button>
        <button data-symbol="UNI" @click="setCurrentSymbol('UNI')">UNI</button>
        <button data-symbol="LCX" @click="setCurrentSymbol('LCX')">LCX</button>
     
        <tbody>
      <div>
        <div>
          <div class="custom-symbol-input">
            <input v-model="customSymbol" @input="validateInput">
            <button @click="setCustomSymbol">Set Custom Symbol</button>
          </div>
        </div>
      </div>
  </tbody>
      </div>
    </tbody>
   
     
    
 


    </div>
    
  </div>
</template>



<script setup>
import { ref, onMounted } from 'vue';
import ccxt from 'ccxt';

const exchangeRates = ref({});
const currentSymbol = ref('ETH');
const arbitrageOpportunities = ref([]);
const exchanges = {
  'binance': new ccxt.binance(),
  'coinbase': new ccxt.coinbasepro(),
  'okx': new ccxt.okx(),
  'bitget': new ccxt.bitget(),
  'upbit': new ccxt.upbit(),
  'blockchaincom': new ccxt.blockchaincom(),
  'bybit': new ccxt.bybit(),
  'cryptocom': new ccxt.cryptocom(),
  'okex': new ccxt.okex(),  
  'lcx': new ccxt.lcx(),  
  
};
const customSymbol = ref('');

function validateInput() {
  // Verificați dacă textul din textarea conține doar litere mari (A-Z)
  let inputText = customSymbol.value.toUpperCase(); // Transformă totul în litere mari
  if (inputText !== customSymbol.value) {
    customSymbol.value = inputText; // Setează valoarea corectată în uppercase
  }
}


function setCustomSymbol() {
  // Funcția pentru a seta simbolul personalizat, dacă este valid
  setCurrentSymbol(customSymbol.value);
}

async function fetchExchangeRates() {
  const pairFormats = ['/USD', '/USDT', '/USDC', '-usd'];
  for (const [key, exchange] of Object.entries(exchanges)) {
    try {
      await exchange.loadMarkets();
      let found = false;
      for (const format of pairFormats) {
        const symbol = currentSymbol.value + format;
        if (exchange.symbols.includes(symbol)) {
          const orderbook = await exchange.fetchOrderBook(symbol);

          // Verificați dacă orderbook are date valide
          if (orderbook && orderbook.bids && orderbook.asks) {
            exchangeRates.value[key] = {
              bid: orderbook.bids.length > 0 ? orderbook.bids[0][0] : 'N/A',
              ask: orderbook.asks.length > 0 ? orderbook.asks[0][0] : 'N/A',
              buyQuantity: orderbook.asks.length > 0 ? orderbook.asks[0][1] : 'N/A',
              sellQuantity: orderbook.bids.length > 0 ? orderbook.bids[0][1] : 'N/A',
              // Calculați prețul mediu și cantitatea totală pentru cele mai bune 5 niveluri "bid"
              top5BidPrice: orderbook.bids.slice(0, 5).reduce((acc, curr) => acc + curr[0], 0) / 5,
              top5BidQuantity: orderbook.bids.slice(0, 5).reduce((acc, curr) => acc + curr[1], 0),
              // Calculați prețul mediu și cantitatea totală pentru cele mai bune 5 niveluri "ask"
              top5AskPrice: orderbook.asks.slice(0, 5).reduce((acc, curr) => acc + curr[0], 0) / 5,
              top5AskQuantity: orderbook.asks.slice(0, 5).reduce((acc, curr) => acc + curr[1], 0),
            };
          } else {
            exchangeRates.value[key] = { bid: 'N/A', ask: 'N/A', buyQuantity: 'N/A', sellQuantity: 'N/A' };
          }

          found = true;
          break;
        }
      }
      if (!found) {
        exchangeRates.value[key] = { bid: 'N/A', ask: 'N/A', buyQuantity: 'N/A', sellQuantity: 'N/A' };
      }
    } catch (error) {
      console.error(`Error fetching data from ${key}:`, error);
      exchangeRates.value[key] = { bid: 'N/A', ask: 'N/A', buyQuantity: 'N/A', sellQuantity: 'N/A' };
    }
  }
  calculateArbitrageOpportunities();
}


async function calculateArbitrageOpportunities() {
  const opportunities = [];
  for (const [exchange1, rates1] of Object.entries(exchangeRates.value)) {
    for (const [exchange2, rates2] of Object.entries(exchangeRates.value)) {
      if (exchange1 !== exchange2 && rates1.bid !== 'N/A' && rates2.ask !== 'N/A') {
        const potentialProfit = rates2.bid - rates1.ask;
        if (potentialProfit > 0) {
          opportunities.push({
            buyAt: exchange1,
            sellAt: exchange2,
            buyPrice: rates1.ask,
            sellPrice: rates2.bid,
            buyQuantity: rates1.buyQuantity !== 'N/A' ? rates1.buyQuantity : 0,
            sellQuantity: rates2.sellQuantity !== 'N/A' ? rates2.sellQuantity : 0,
            profit: potentialProfit.toFixed(2)
          });
        }
      }
    }
  }
  arbitrageOpportunities.value = opportunities;
}

function setCurrentSymbol(symbol) {
  currentSymbol.value = symbol;
  fetchExchangeRates();
}

function getExchangeClass(exchange) {
  const exchangeColors = {
    'binance': 'exchange-binance',
    'coinbase': 'exchange-coinbase',
    'okx': 'exchange-okx',
    'bitget': 'exchange-bitget',
    'upbit': 'exchange-upbit',
    'blockchaincom': 'exchange-blockchaincom',
    'bybit': 'exchange-bybit',
    'cryptocom': 'exchange-cryptocom',
    'okex': 'exchange-okex',
    'lcx': 'exchange-lcx',
    // ... (other exchanges)
  };
  return exchangeColors[exchange] || '';
}
function startAutoRefresh() {
  setInterval(() => {
    fetchExchangeRates();
    calculateArbitrageOpportunities();
  }, 1000); // Reîmprospătare la fiecare 2 secunde (2000 milisecunde)
}

// Porniți reîmprospătarea automată când componenta este montată
onMounted(() => {
  fetchExchangeRates();
  calculateArbitrageOpportunities();
  startAutoRefresh();
});
</script>

<style scoped>
.tables-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px; /* Spațiu între tabele */
}

.exchange-rates-table,
.arbitrage-opportunities-table {
  flex: 1; /* Fiecare tabel ocupă jumătate din spațiu */
  border: 1px solid #ccc; /* Adăugați o margine la tabele */
  padding: 10px; /* Spațiere internă pentru tabele */
  box-sizing: border-box; /* Asigurați-vă că padding-ul nu crește dimensiunea totală */
  position: fixed; /* Tabelul va fi pozitionat fix */
}

.exchange-rates-table {
  top: 210px; /* Poziționare la 20px de sus */
  left: 220px; /* Poziționare la 20px de stânga */
}

.arbitrage-opportunities-table {
  top: 210px; /* Poziționare la 20px de sus */
  right: 220px; /* Poziționare la 20px de dreapta */
}

.tables-switch {
  display: flex;
  flex-wrap: wrap;
  gap: 20px; /* Spațiu între butoane */
  position: fixed;
  top: 140; /* Poziționare la 20px de sus, la aceeași înălțime cu celelalte tabele */
  left: 220px; /* Poziționare la 20px de stânga */
}

.tables-switch button {
  padding: 10px 20px;
  background-color: #0072CE;
  color: white;
  border: none;
  cursor: pointer;
}

.tables-switch button:hover {
  background-color: #0058A0;
}

.exchange-binance {
  color: #e7c75e; /* Example color for Binance */
}

.exchange-coinbase {
  color: #6de263; /* Example color for Coinbase */
}

.exchange-okx {
  color: #0072CE; /* Example color for OKX */
}

.exchange-bitget {
  color: #FF6A00; /* Example color for Bitget */
}

.exchange-upbit {
  color: #b68be7; /* Example color for Upbit */
}

.exchange-blockchaincom {
  color: #d26adb; /* Example color for Blockchain.com */
}

.exchange-bybit {
  color: #e623c5; /* Example color for Bybit */
}

.exchange-cryptocom {
  color: #c00e58; /* Example color for Crypto.com */
}

.exchange-okex {
  color: #e48897; /* Example color for OKEx */
}
.exchange-lcx {
  color: #cff5c6; /* Exemplu de culoare pentru LCX */
}
.bid-price {
  color: green;
}

.ask-price {
  color: red;
}

/* Add other CSS styles here */
</style>