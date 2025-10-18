<template>
    <n-card>
      <n-grid x-gap="4" :cols="4">
        <n-gi v-for="strategy in strategyData" :key="strategy.name">
          <n-button @click="currentStrategy = strategy; isDialogVisible = true">{{ strategy.name }}</n-button>
        </n-gi>
      </n-grid>
      <n-space vertical>
        <n-button type="primary" @click="createGridBot" :disabled="!currentStrategy">Create Grid bot</n-button>
  
        <!-- Buton pentru adăugarea strategiei curente la lista de strategii selectate -->
        <n-button @click="addNextStartStrategie" :disabled="!currentStrategy">Add Next Start Strategie</n-button>
  
        <!-- Buton pentru adăugarea strategiilor selectate -->
        <n-button @click="addSelectedStrategies" :disabled="!currentStrategy">Add Selected Strategies</n-button>
  
        <!-- Lista de strategii selectate -->
        <div v-if="selectedStrategies.length > 0">
          <h3>Strategii Selectate pentru Pornire:</h3>
          <ul>
            <li v-for="strategy in selectedStrategies" :key="strategy.name">
              {{ strategy.name }} - Lower: {{ strategy.lowerPrice }}, Upper: {{ strategy.upperPrice }},
              Nr of Grids: {{ strategy.nrOfGrids }}, Amount quote {{ strategy.amount }}, Side {{ strategy.ordersSide }}
            </li>
          </ul>
        </div>
  
        <!-- Buton pentru pornirea tuturor strategiilor selectate -->
        <n-button type="success" @click="startSelectedStrategies" :disabled="selectedStrategies.length === 0">
          Start Selected Strategies
        </n-button>
  
        <!-- Buton pentru salvarea Strategiilor Selectate pentru Pornire -->
        <n-button @click="saveSelectedStrategies" :disabled="selectedStrategies.length === 0">
          Salvează Strategiile Selectate
        </n-button>
  
        <!-- Câmp de intrare (input) pentru numele setului de Strategii -->
        <n-input v-model="settingsSetName" placeholder="Nume set Strategii" />
  
        <!-- Buton pentru salvarea Strategiilor Selectate -->
        <n-button @click="saveSelectedStrategiesInternal" :disabled="selectedStrategies.length === 0">
          Salvează Strategiile Selectate
        </n-button>
  
<!-- Câmp de intrare (input) pentru afișarea seturilor salvate -->
<n-input v-model="selectedSetName" placeholder="Nume set Strategii" />
<n-button @click="displaySelectedSet" :disabled="savedSets.length === 0">Afișează Setul Salvat</n-button>

<!-- Lista de seturi salvate -->
<div v-if="displayedSet.length > 0">
  <h3>Set Afișat:</h3>
  <ul>
    <li v-for="strategy in displayedSet" :key="strategy.name">
      {{ strategy.name }} - Lower: {{ strategy.lowerPrice }}, Upper: {{ strategy.upperPrice }},
      Nr of Grids: {{ strategy.nrOfGrids }}, Amount quote {{ strategy.amount }}, Side {{ strategy.ordersSide }}
    </li>
  </ul>
</div>
      
      </n-space>
  
      <!-- Adaugă un dialog personalizat pentru afișarea detaliilor strategiei -->
      <div v-if="isDialogVisible" class="custom-dialog">
        <!-- Detalii strategie -->
        <h2>Detalii Strategie</h2>
        <p>
          Nume: {{ currentStrategy ? currentStrategy.name : '' }} <br>
          Exchange: {{ app.getUserSelectedExchange }} <br>
          Symbol: {{ app.getUserSelectedMarket }} <br>
          Lower Price: {{ currentStrategy ? currentStrategy.lowerPrice : '' }} <br>
          Upper Price: {{ currentStrategy ? currentStrategy.upperPrice : '' }} <br>
          <!-- Alte detalii strategie -->
        </p>
        <n-button @click="isDialogVisible = false">Închide</n-button>
        <!-- Buton pentru afișarea rezultatelor -->
        <n-button @click="showResultPopup">Result</n-button>
      </div>
  
      <!-- New popup for calculations -->
      <div v-if="isResultPopupVisible" class="result-popup">
        <!-- Content for result popup -->
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
  let selectedStrategies = ref([]);
  let settingsSetName = ref('');
  let savedSets = ref([]);
  let displayedSet = ref([]);

  
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
  
  function addNextStartStrategie() {
    if (currentStrategy.value) {
      selectedStrategies.value.push(currentStrategy.value);
    }
  }
  
  function addSelectedStrategies() {
    if (currentStrategy.value) {
      selectedStrategies.value.push(currentStrategy.value);
    }
  }
  
  async function startSelectedStrategies() {
    const promises = selectedStrategies.value.map(strategy => createGridBot(strategy));
  
    try {
      // Așteaptă ca toate promisiunile să se rezolve
      const responses = await Promise.all(promises);
  
      // Poți adăuga acțiuni suplimentare după ce au fost pornite toate strategiile selectate
      console.log("Toate strategiile selectate au fost pornite!", responses);
    } catch (error) {
      // Tratează eventualele erori
      console.error("Eroare la pornirea strategiilor selectate:", error);
    }
  }
  
  async function createGridBot(strategy) {
    if (strategy) {
      let data = {
        userID: userID.value,
        name: strategy.name,
        exchange: app.getUserSelectedExchange,
        symbol: app.getUserSelectedMarket,
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
      };
  
      // Call the API to create the grid bot with the selected strategy data
      let response = await $fetch('/api/v1/createGridBot', {
        method: 'POST',
        body: data
      });
  
      // Handle the response as needed
      console.log(response);
    }
  }
  
  function saveSelectedStrategies() {
    if (selectedStrategies.value.length > 0 && settingsSetName.value.trim() !== '') {
      const settingsSet = {
        name: settingsSetName.value,
        strategies: selectedStrategies.value,
      };
  
      // Poți salva setul de strategii într-o variabilă sau să faci orice altceva cu această informație.
      console.log('Set de strategii salvat:', settingsSet);
  
      // Resetează numele setului pentru a permite salvarea altor seturi
      settingsSetName.value = '';
    }
  }
  
  function saveSelectedStrategiesInternal() {
    if (selectedStrategies.value.length > 0 && settingsSetName.value.trim() !== '') {
      const settingsSet = {
        name: settingsSetName.value,
        strategies: selectedStrategies.value,
      };
  
      // Poți salva setul de strategii într-o variabilă sau să faci orice altceva cu această informație.
      console.log('Set de strategii salvat:', settingsSet);
  
      // Adaugă setul salvat la lista de seturi
      savedSets.value.push(settingsSet);
  
      // Resetează numele setului pentru a permite salvarea altor seturi
      settingsSetName.value = '';
    }
  }
  
  
  function showResultPopup() {
    // Toggle the visibility of the result popup
    isResultPopupVisible.value = !isResultPopupVisible.value;
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
  }
  
  .result-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px;
    background-color: #ffffff; /* Change the background color as needed */
    border: 1px solid #0bdd9e;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    z-index: 999;
    display: flex;
    flex-direction: column;
  }
  
  .selected-strategies {
    margin-top: 20px;
  }
  
  .selected-strategies h2 {
    font-size: 18px;
    margin-bottom: 10px;
  }
  
  .selected-strategies ul {
    list-style-type: none;
    padding: 0;
  }
  
  .selected-strategies li {
    margin-bottom: 5px;
  }
  </style>
  