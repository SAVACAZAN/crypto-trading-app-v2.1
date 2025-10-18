<template>
  <n-card>
    <n-space vertical :size="12">
      <div class="box">
        <table>
          <tr>
            <td>Best Bid: {{ bestBid }}</td>
            <td>Best Ask: {{ bestAsk }}</td>
          </tr>
          <tr>
            <td>
              <n-button @click="updateLowerPrice(0.01)"> Bid - 1%</n-button>
              <n-button @click="updateUpperPrice(0.01)"> Ask + 1%</n-button>
            </td>
          </tr>
          <tr>
            <td>
              <n-button @click="updateLowerPrice(0.02)"> Bid - 2%</n-button>
              <n-button @click="updateUpperPrice(0.02)"> Ask + 2%</n-button>
            </td>
          </tr>
          <tr>
            <td>
              <n-button @click="updateLowerPrice(0.05)"> Bid - 5%</n-button>
              <n-button @click="updateUpperPrice(0.05)"> Ask + 5%</n-button>
            </td>
          </tr>
          <table>
  <tr>
    <td class="editable-cellLower" contenteditable="true" @input="handleManualLowerPriceInput" style="border: 1px solid rgb(6, 150, 37);" data-label="Preț minim manual:">
      {{ manualLowerPrice }}
    </td>
  </tr>
  <tr>
    <td class="editable-cellUpper" contenteditable="true" @input="handleManualUpperPriceInput" style="border: 1px solid rgb(231, 19, 19);" data-label="Preț maxim manual:">
      {{ manualUpperPrice }}
    </td>
  </tr>
  <tr>
    <td class="editable-cell amount" contenteditable="true" @input="handleInput('amount')" style="border: 1px solid rgb(6, 150, 37);" data-label="Amount:">
      {{ amount }}
    </td>
  </tr>
  <tr>
    <td class="editable-cell numberOfGrids" contenteditable="true" @input="handleInput('numberOfGrids')" style="border: 1px solid rgb(231, 19, 19);" data-label="Number of Grids:">
      {{ nrOfGrids }}
    </td>
  </tr>
  <tr>
    <td class="editable-cell incrementalPercentAmountBuy" contenteditable="true" @input="handleInput('incrementalPercentAmountBuy')" style="border: 1px solid rgb(6, 150, 37);" data-label="Incremental Percent Amount Buy:">
      {{ incrementalPercentAmountBuy }}
    </td>
  </tr>
  <tr>
    <td class="editable-cell incrementalPercentAmountSell" contenteditable="true" @input="handleInput('incrementalPercentAmountSell')" style="border: 1px solid rgb(231, 19, 19);" data-label="Incremental Percent Amount Sell:">
      {{ incrementalPercentAmountSell }}
    </td>
  </tr>
  <tr>
    <td class="editable-cell deviationPriceBuy" contenteditable="true" @input="handleInput('deviationPriceBuy')" style="border: 1px solid rgb(6, 150, 37);" data-label="Deviation Price Buy:">
      {{ deviationPriceBuy }}
    </td>
  </tr>
  <tr>
    <td class="editable-cell deviationPriceSell" contenteditable="true" @input="handleInput('deviationPriceSell')" style="border: 1px solid rgb(231, 19, 19);" data-label="Deviation Price Sell:">
      {{ deviationPriceSell }}
    </td>
  </tr>
  <tr>
    <td class="editable-cell deviationAmountBuy" contenteditable="true" @input="handleInput('deviationAmountBuy')" style="border: 1px solid rgb(6, 150, 37);" data-label="Deviation Amount Buy:">
      {{ deviationAmountBuy }}
    </td>
  </tr>
  <tr>
    <td class="editable-cell deviationAmountSell" contenteditable="true" @input="handleInput('deviationAmountSell')" style="border: 1px solid rgb(231, 19, 19);" data-label="Deviation Amount Sell:">
      {{ deviationAmountSell }}
    </td>
  </tr>

  <n-button type="primary" @click="createGridBot">Create Grid bot</n-button>
</table>

        
        </table>
      </div>
    </n-space>
  </n-card>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAppStore } from '~/stores/app.store';
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async';

export default {
  setup() {
    const app = useAppStore();
    let userID = useCookie('userID');

    const currentExchange = ref(app.getUserSelectedExchange);
    const currentSymbol = ref(app.getUserSelectedMarket);

    const bestBid = ref(null);
    const bestAsk = ref(null);
    const manualLowerPrice = ref('');
    const manualUpperPrice = ref('');

    let lowerPrice = ref('');
    let upperPrice = ref('');
    let amountType = ref('incrementalPercent');
    let amountTypeOptions = [
      { value: 'quantityPerGrid', label:'Qty Per Grid'},
      { value: 'totalAmount', label:'Total Amount'},
      { value: 'incrementalPercent', label:'Incremental Amount'}
    ];
    let amount = ref('');
    let nrOfGrids = ref('');
    let ordersSide = ref('buyOrSell');
    let ordersSideOptions = [
      { value: 'buyOrSell', label: 'Buy & Sell' },
      { value: 'buyOnly', label: 'Buy Only' },
      { value: 'sellOnly', label: 'Sell Only' },
    ];
    let incrementalPercentAmountBuy = ref('');
    let incrementalPercentAmountSell = ref('');
    let deviationPriceBuy = ref('');
    let deviationPriceSell = ref('');
    let deviationAmountBuy = ref('');
    let deviationAmountSell = ref('');

    let orderBookInterval = null;

    // Starea pentru a ține evidența dacă devierea inițială a fost aplicată sau nu
    let initialDeviationApplied = false;

    onMounted(() => {
      orderBookInterval = setIntervalAsync(fetchOrderBookPooling, 500);
    });

    onUnmounted(() => {
      clearIntervalAsync(orderBookInterval);
    });

    async function fetchOrderBookPooling() {
      try {
        const orderBook = await $fetch('/api/v1/fetchOrderBook', {
          query: {
            userID: userID.value,
            exchange: currentExchange.value,
            symbol: currentSymbol.value,
          },
        });

        if (orderBook.data) {
          bestBid.value = orderBook.data.bids.length > 0 ? orderBook.data.bids[0][0] : null;
          bestAsk.value = orderBook.data.asks.length > 0 ? orderBook.data.asks[0][0] : null;
        }
      } catch (error) {
        console.error('Error fetching order book:', error);
      }
    }

    // Funcția pentru actualizarea prețului minim
    function updateLowerPrice(deviationPercentage = 0.01) {
      if (bestBid.value) {
        const newValue = (bestBid.value * (1 - deviationPercentage)).toFixed(3).toString();
        console.log(`Update Lower Price Button Clicked. New Value with ${deviationPercentage * 100}% deviation:`, newValue);
        manualLowerPrice.value = newValue;
        //  și lowerPrice automat
        lowerPrice.value = newValue;
      }
    }

    // Funcția pentru actualizarea prețului maxim
    function updateUpperPrice(deviationPercentage = 0.01) {
      if (bestAsk.value) {
        const newValue = (bestAsk.value * (1 + deviationPercentage)).toFixed(3).toString();
        console.log(`Update Upper Price Button Clicked. New Value with ${deviationPercentage * 100}% deviation:`, newValue);
        manualUpperPrice.value = newValue;
        //  și upperPrice automat
        upperPrice.value = newValue;
      }
    }

    // Funcția pentru aplicarea devierii inițiale la încărcarea paginii
    function applyInitialDeviation() {
      if (!initialDeviationApplied) {
        updateLowerPrice();
        updateUpperPrice();
        initialDeviationApplied = true; // Marchează devierea inițială ca aplicată
      }
    }
  // Funcția pentru gestionarea introducerii de date în celula pentru prețul minim
  function handleManualLowerPriceInput(event) {
      const newValue = event.target.innerText.trim();
      if (/^\d*\.?\d*$/.test(newValue)) {
        manualLowerPrice.value = newValue;
      } else {
        event.target.innerText = manualLowerPrice.value; // Restaură valoarea anterioară
      }
    }

    // Funcția pentru gestionarea introducerii de date în celula pentru prețul maxim
    function handleManualUpperPriceInput(event) {
      const newValue = event.target.innerText.trim();
      if (/^\d*\.?\d*$/.test(newValue)) {
        manualUpperPrice.value = newValue;
      } else {
        event.target.innerText = manualUpperPrice.value; // Restaură valoarea anterioară
      }
    }


async function createGridBot(){

let data = {
  userID: userID.value,
  name: name.value,
  exchange: currentExchange.value,
  symbol: currentSymbol.value,
  lowerPrice: lowerPrice.value,
  upperPrice: upperPrice.value,
  amountType: amountType.value,
  amount: amount.value,
  nrOfGrids: nrOfGrids.value,
  ordersSide: ordersSide.value,
  incrementalPercentAmountBuy:incrementalPercentAmountBuy.value,
  incrementalPercentAmountSell:incrementalPercentAmountSell.value,
    config: {
      deviationPriceBuy: deviationPriceBuy.value,
      deviationPriceSell: deviationPriceSell.value,
      deviationAmountBuy: deviationAmountBuy.value,
      deviationAmountSell: deviationAmountSell.value,
      usePriceGroup: usePriceGroup.value,
      priceGroupBuy: priceGroupBuy.value,
      priceGroupSell: priceGroupSell.value
  },
  BalanceBot: {
    BalanceBase: BalanceBase.value,
    BalanceQuote: BalanceQuote.value,
    BalanceBaseInUSD: BalanceBaseInUSD.value,
    BalanceQuoteInUSD: BalanceQuoteInUSD.value,
    BalanceBaseProfit: BalanceBaseProfit.value,
    BalanceQuoteProfit: BalanceQuoteProfit.value,
    BalanceBotProfit: BalanceBotProfit.value,
    BalanceBotValInitiala: BalanceBotValInitiala.value
  },
  TakeProfitBot: {
    TakeProfitBotSTR1: TakeProfitBotSTR1.value,
    TakeProfitBotSTR2: TakeProfitBotSTR2.value
  },
  BotAction: {
    BotReset: BotReset.value,
    BotCancelOrders: BotCancelOrders.value,
    BotX1: BotX1.value,
    BotX2: BotX2.value,
    BotX3: BotX3.value,
    BotX4: BotX4.value,
  },

};

// console.log(data);

let response = await $fetch( '/api/v1/createGridBot', {
  method: 'POST',
  body: data
} );
// Afiseaza butoanele dupa crearea botului
BotX1.value = 'ComandaX1';
BotX2.value = 'ComandaX2';
// Adauga aici BotX3, BotX4 etc. daca este nevoie de ele
}
    // Apelați funcția applyInitialDeviation la încărcarea paginii
    onMounted(applyInitialDeviation);


    // Inițializare pentru lowerPrice și upperPrice
    onMounted(fetchOrderBookPooling);

    return {
      bestBid,
      bestAsk,
      manualLowerPrice,
      manualUpperPrice,
      lowerPrice,
      upperPrice,
      amountType,
      amountTypeOptions,
      amount,
      nrOfGrids,
      ordersSide,
      ordersSideOptions,
      incrementalPercentAmountBuy,
      incrementalPercentAmountSell,
      deviationPriceBuy,
      deviationPriceSell,
      deviationAmountBuy,
      deviationAmountSell,
      updateLowerPrice,
      updateUpperPrice,
      handleManualLowerPriceInput,
      handleManualUpperPriceInput,
    };
  },

  
};
</script>

<style scoped>[contenteditable="true"] {
  /* Stiluri generale pentru elementele contenteditable */
  padding: 2px;
  border: 1px solid #ccc;
  border-radius: 1px;
  outline: none; /* Elimină conturul implicit la focalizare */
  min-height: 10px; /* Înălțime minimă pentru a asigura vizibilitatea */
  font-family: Arial, sans-serif;
  font-size: 13px;
  color: #e0bfbf;
}

[contenteditable="true"]:focus {
  /* Stiluri pentru când elementul este focalizat */
  border-color: blue;
}

.editable-cellLower,
.editable-cellUpper,
.editable-cell.amount,
.editable-cell.numberOfGrids,
.editable-cell.incrementalPercentAmountBuy,
.editable-cell.incrementalPercentAmountSell,
.editable-cell.deviationPriceBuy,
.editable-cell.deviationPriceSell,
.editable-cell.deviationAmountBuy,
.editable-cell.deviationAmountSell {
  position: relative;
}

.editable-cellLower:before {
  content: "Preț minim manual: "; /* Textul descriptiv pentru prețul minim */
  position: relative;
  top: 0;
  left: 0;
  color: rgba(193, 224, 16, 0.5); /* Culoarea textului */
  pointer-events: none; /* Face textul descriptiv "ne-clickabil" */
}

.editable-cellUpper:before {
  content: "Preț maxim manual: "; /* Textul descriptiv pentru prețul maxim */
  position: relative;
  top: 0;
  left: 0;
  color: rgba(193, 224, 16, 0.5); /* Culoarea textului */
  pointer-events: none; /* Face textul descriptiv "ne-clickabil" */
}

.editable-cell.amount:before {
  content: "Amount:"; /* Textul descriptiv pentru Amount */
}

.editable-cell.numberOfGrids:before {
  content: "Number of Grids:"; /* Textul descriptiv pentru Number of Grids */
}

.editable-cell.incrementalPercentAmountBuy:before {
  content: "Incremental Percent Amount Buy:"; /* Textul descriptiv pentru Incremental Percent Amount Buy */
  
}

.editable-cell.incrementalPercentAmountSell:before {
  content: "Incremental Percent Amount Sell:"; /* Textul descriptiv pentru Incremental Percent Amount Sell */
}

.editable-cell.deviationPriceBuy:before {
  content: "Deviation Price Buy:"; /* Textul descriptiv pentru Deviation Price Buy */
}

.editable-cell.deviationPriceSell:before {
  content: "Deviation Price Sell:"; /* Textul descriptiv pentru Deviation Price Sell */
}

.editable-cell.deviationAmountBuy:before {
  content: "Deviation Amount Buy:"; /* Textul descriptiv pentru Deviation Amount Buy */
}

.editable-cell.deviationAmountSell:before {
  content: "Deviation Amount Sell:"; /* Textul descriptiv pentru Deviation Amount Sell */
}


</style>
