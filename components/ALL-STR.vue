<template>
    <n-card>
      <n-grid x-gap="4" :cols="4">
        <n-gi v-for="strategy in strategyData" :key="strategy.name">
          <n-button @click="currentStrategy = strategy; isDialogVisible = true">{{ strategy.name }}</n-button>
        </n-gi>
      </n-grid>
      <n-space vertical>
        <n-button type="primary" @click="createGridBot" :disabled="!currentStrategy">Create Grid bot</n-button>
      </n-space>
  
      <!-- Adaugă un dialog personalizat pentru afișarea detaliilor strategiei -->
      <div v-if="isDialogVisible" class="custom-dialog">
        <div class="dialog-content">
          <h2>Detalii Strategie</h2>
          <p>
            Nume: {{ currentStrategy ? currentStrategy.name : '' }} <br>
            Exchange: {{ app.getUserSelectedExchange }} <br>
            Symbol: {{ app.getUserSelectedMarket }} <br>
            <!-- Adaugă aici alte detalii despre strategie -->
  
          
            <!-- Afiseaza detalii complete doar daca showAllStrategies este true -->
            <template v-if="showAllStrategies">
              Lower Price: {{ currentStrategy ? currentStrategy.lowerPrice : '' }} <br>
              Upper Price: {{ currentStrategy ? currentStrategy.upperPrice : '' }} <br>
              Amount Type: {{ currentStrategy ? currentStrategy.amountType : '' }} <br>
              Amount: {{ currentStrategy ? currentStrategy.amount : '' }} <br>
              Nr of Grids: {{ currentStrategy ? currentStrategy.nrOfGrids : '' }} <br>
              Orders Side: {{ currentStrategy ? currentStrategy.ordersSide : '' }} <br>
              Incremental % Amount Buy: {{ currentStrategy ? currentStrategy.incrementalPercentAmountBuy : '' }} <br>
              Incremental % Amount Sell: {{ currentStrategy ? currentStrategy.incrementalPercentAmountSell : '' }} <br>
              Deviation Price Buy: {{ currentStrategy ? currentStrategy.deviationPriceBuy : '' }} <br>
              Deviation Price Sell: {{ currentStrategy ? currentStrategy.deviationPriceSell : '' }} <br>
              Deviation Amount Buy: {{ currentStrategy ? currentStrategy.deviationAmountBuy : '' }} <br>
              Deviation Amount Sell: {{ currentStrategy ? currentStrategy.deviationAmountSell : '' }} <br>
              Use Price Group: {{ currentStrategy ? currentStrategy.usePriceGroup : '' }} <br>
              Price Group Buy: {{ currentStrategy ? currentStrategy.priceGroupBuy : '' }} <br>
              Price Group Sell: {{ currentStrategy ? currentStrategy.priceGroupSell : '' }} <br>
            </template>
          </p>
        </div>
        
        <div class="dialog-buttons">
              <!-- Butonul pentru Show More -->


              <n-button @click="isDialogVisible = false">Închide</n-button>
              <n-button @click="showAllStrategies = !showAllStrategies">{{ showAllStrategies ? 'Show Less' : 'Show More' }}</n-button>
            
         
          <n-button @click="showResultPopup">GridList</n-button>
          <n-button @click="showResultPopup">GridListBuy</n-button>
          <n-button @click="showResultPopup">GridListSell</n-button>
          <n-button @click="showResultPopup">Profit</n-button>
          <n-button @click="showResultPopup">GridListBuyDev</n-button>
          <n-button @click="showResultPopup">GridListSellDev</n-button>
          <n-button @click="showResultPopup">ProfitDev</n-button>

        </div>
      </div>
  
      <!-- New popup for calculations -->
      <div v-if="isResultPopupVisible" class="result-popup">
        <!-- Content for result popup -->
        Price Group Buy: {{ currentStrategy ? currentStrategy.priceGroupBuy : '' }} <br>
              Price Group Sell: {{ currentStrategy ? currentStrategy.priceGroupSell : '' }} <br>
        <!-- You can add your calculations or any other content here -->
        <n-button @click="isResultPopupVisible = false">Close</n-button>
      </div>
  
    </n-card>
  </template>
  
  <script setup>
  import { useAppStore } from '~/stores/app.store';
  import { ref, onMounted } from 'vue';
  
  const app = useAppStore();
  const userID = useCookie('userID');
  
  let strategyData = ref([]);
  let currentStrategy = ref(null);
  let isDialogVisible = ref(false);
  let showAllStrategies = ref(false);
  let isResultPopupVisible = ref(false);
  
  async function loadStrategies() {
    let strategiesStore = JSON.parse(localStorage.getItem('strategiesStore')) || [];
    strategyData.value = strategiesStore.map(strategy => ({
      name: strategy.name,
      lowerPrice: strategy.lowerPrice,
      upperPrice: strategy.upperPrice,
      amountType: strategy.amountType,
      amount: strategy.amount,
      nrOfGrids: strategy.nrOfGrids,
      ordersSide: strategy.ordersSide,
      incrementalPercentAmountBuy: strategy.incrementalPercentAmountBuy,
      incrementalPercentAmountSell: strategy.incrementalPercentAmountSell,
      deviationPriceBuy: strategy.deviationPriceBuy,
      deviationPriceSell: strategy.deviationPriceSell,
      deviationAmountBuy: strategy.deviationAmountBuy,
      deviationAmountSell: strategy.deviationAmountSell,
      usePriceGroup: strategy.usePriceGroup,
      priceGroupBuy: strategy.priceGroupBuy,
      priceGroupSell: strategy.priceGroupSell,
    }));
  }
  
  async function createGridBot() {
    if (currentStrategy.value) {
      let data = {
        userID: userID.value,
        name: currentStrategy.value.name,
        exchange: app.getUserSelectedExchange,
        symbol: app.getUserSelectedMarket,
        lowerPrice: currentStrategy.value.lowerPrice,
        upperPrice: currentStrategy.value.upperPrice,
        amountType: currentStrategy.value.amountType,
        amount: currentStrategy.value.amount,
        nrOfGrids: currentStrategy.value.nrOfGrids,
        ordersSide: currentStrategy.value.ordersSide,
        incrementalPercentAmountBuy: currentStrategy.value.incrementalPercentAmountBuy,
        incrementalPercentAmountSell: currentStrategy.value.incrementalPercentAmountSell,
        deviationPriceBuy: currentStrategy.value.deviationPriceBuy,
        deviationPriceSell: currentStrategy.value.deviationPriceSell,
        deviationAmountBuy: currentStrategy.value.deviationAmountBuy,
        deviationAmountSell: currentStrategy.value.deviationAmountSell,
        usePriceGroup: currentStrategy.value.usePriceGroup,
        priceGroupBuy: currentStrategy.value.priceGroupBuy,
        priceGroupSell: currentStrategy.value.priceGroupSell,
      };
      
      // Call the API to create the grid bot with the selected strategy data
      let response = await $fetch('/api/v1/createGridBot', {
        method: 'POST',
        body: data
      });
  
      // Handle the response as needed
      console.log(response);
      isDialogVisible.value = false; // Ascunde dialogul după crearea bot-ului
    }
  }
  
  function showResultPopup() {
    isResultPopupVisible.value = true;
  }
  
  onMounted(() => {
    loadStrategies();
  });
  </script>
  
 
  <style scoped>
.custom-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  background-color: rgb(36, 2, 2);
  border: 1px solid #0bdd9e;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 999;
  display: flex;
  flex-direction: column;
}

.dialog-content {
  flex: 1;
}

.dialog-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 10px; /* Adjust the margin as needed */
}
  
  .result-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px;
    background-color: #3a14e4; /* Change the background color as needed */
    border: 1px solid #0bdd9e;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    z-index: 999;
    display: flex;
    flex-direction: column;
  }
  </style>
  