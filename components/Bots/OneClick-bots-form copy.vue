<script setup>
import { useAppStore } from '~/stores/app.store';
import { ref, onMounted } from "vue";
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async';

const app = useAppStore();

console.log('App Store loaded:', app);


let userID = useCookie('userID');
console.log('User ID loaded from cookie:', userID);
const showStrategySection = ref(false);
const showConfigurationSection = ref(false);
const showTopBar = ref(true);
const showMarketTable = ref(true);
let amountTypeOptions = [
  { value: 'quantityPerGrid', label: 'Qty Per Grid' },
  { value: 'totalAmount', label: 'Total Amount' },
  { value: 'incrementalPercent', label: 'Incremental Amount' }
];
console.log('Amount type options initialized:', amountTypeOptions);

let ordersSideOptions = [
  { value: 'buyOrSell', label: 'Buy & Sell' },
  { value: 'buyOnly', label: 'Buy Only' },
  { value: 'sellOnly', label: 'Sell Only' },
];
console.log('Order side options initialized:', ordersSideOptions);

// Refs for form inputs
let incrementalPercentAmountBuy = ref('');
let incrementalPercentAmountSell = ref('');
let deviationPriceBuy = ref('');
let deviationPriceSell = ref('');
let deviationAmountBuy = ref('');
let deviationAmountSell = ref('');
console.log('Form refs initialized.');



// Funcție pentru a actualiza dinamica deviației de preț pentru buy
function updateDeviationPriceBuy(index, newValue) {
  if (marketForms.value[index]) {
    marketForms.value[index].deviationPriceBuy = parseFloat(newValue) || '';
    console.log(`Updated deviationPriceBuy for market ${index}:`, newValue);
  } else {
    console.warn(`Market form at index ${index} does not exist.`);
  }
}

// Funcție pentru a actualiza dinamica deviației de preț pentru sell
function updateDeviationPriceSell(index, newValue) {
  if (marketForms.value[index]) {
    marketForms.value[index].deviationPriceSell = parseFloat(newValue) || '';
    console.log(`Updated deviationPriceSell for market ${index}:`, newValue);
  } else {
    console.warn(`Market form at index ${index} does not exist.`);
  }
}

// Funcție pentru a actualiza dinamica deviației de cantitate pentru buy
function updateDeviationAmountBuy(index, newValue) {
  if (marketForms.value[index]) {
    marketForms.value[index].deviationAmountBuy = parseFloat(newValue) || '';
    console.log(`Updated deviationAmountBuy for market ${index}:`, newValue);
  } else {
    console.warn(`Market form at index ${index} does not exist.`);
  }
}

// Funcție pentru a actualiza dinamica deviației de cantitate pentru sell
function updateDeviationAmountSell(index, newValue) {
  if (marketForms.value[index]) {
    marketForms.value[index].deviationAmountSell = parseFloat(newValue) || '';
    console.log(`Updated deviationAmountSell for market ${index}:`, newValue);
  } else {
    console.warn(`Market form at index ${index} does not exist.`);
  }
}


const savedConfigurations = ref(
  JSON.parse(localStorage.getItem("savedConfigurations")) || [
    {
      name: "Default",
      incrementalPercentAmountBuy: "1",
      incrementalPercentAmountSell: "1",
      deviationPriceBuy: "1",
      deviationPriceSell: "1",
      deviationAmountBuy: "1",
      deviationAmountSell: "1",
      isDefault: true, // Configurația implicită inițială
    },
    {
      name: "X1",
      incrementalPercentAmountBuy: "2",
      incrementalPercentAmountSell: "2",
      deviationPriceBuy: "2",
      deviationPriceSell: "2",
      deviationAmountBuy: "2",
      deviationAmountSell: "2",
      isDefault: false,
    },
  ]
);

// Watcher pentru sincronizarea configurațiilor salvate cu localStorage
watch(savedConfigurations, (newConfigs) => {
  localStorage.setItem("savedConfigurations", JSON.stringify(newConfigs));
}, { deep: true });

function saveConfiguration() {
  const configName = prompt("Enter a name for this configuration:");
  if (configName) {
    savedConfigurations.value.push({
      name: configName,
      incrementalPercentAmountBuy: incrementalPercentAmountBuy.value,
      incrementalPercentAmountSell: incrementalPercentAmountSell.value,
      deviationPriceBuy: deviationPriceBuy.value,
      deviationPriceSell: deviationPriceSell.value,
      deviationAmountBuy: deviationAmountBuy.value,
      deviationAmountSell: deviationAmountSell.value,
      isDefault: false, // Noua configurație nu este implicită
    });
    console.log("Configuration saved:", savedConfigurations.value);
  }
}

function setDefaultConfiguration(configName) {
  // Marchez configurația selectată ca implicită
  savedConfigurations.value.forEach((config) => {
    config.isDefault = config.name === configName;
  });
  console.log(`Configuration "${configName}" set as Default.`);
}

function applyDefaultConfiguration() {
  const defaultConfig = savedConfigurations.value.find((config) => config.isDefault);
  if (defaultConfig) {
    applyConfiguration(defaultConfig);
  } else {
    console.warn("No default configuration found.");
  }
}

function applyConfiguration(config) {
  if (config) {
    incrementalPercentAmountBuy.value = config.incrementalPercentAmountBuy;
    incrementalPercentAmountSell.value = config.incrementalPercentAmountSell;
    deviationPriceBuy.value = config.deviationPriceBuy;
    deviationPriceSell.value = config.deviationPriceSell;
    deviationAmountBuy.value = config.deviationAmountBuy;
    deviationAmountSell.value = config.deviationAmountSell;

    console.log("Configuration applied:", config);
  }
}

function deleteConfiguration(index) {
  const configToDelete = savedConfigurations.value[index];

  if (configToDelete.isDefault) {
    console.warn("Cannot delete the default configuration.");
    return;
  }

  savedConfigurations.value.splice(index, 1);
  console.log("Configuration deleted. Remaining configurations:", savedConfigurations.value);
}

// Aplica automat configurația implicită la pornire
onMounted(() => {
  applyDefaultConfiguration();
});
















const bestBid = ref(null);
const bestAsk = ref(null);
let selectedExchange = ref('coinbaseadvanced');
let selectedMarkets = ref([
  'LCX/USDC',]);

let marketForms = ref([]);

let savedStrategies = ref([]);
let strategyName = ref('');

let userExchanges = app.getUserExchanges;
let userExchangeMarkets = app.getUserExchangeMarkets;

console.log('Initial state: ', {
  selectedExchange,
  selectedMarkets,
  savedStrategies,
  strategyName,
  userExchanges,
  userExchangeMarkets,
});

// Functions
function loadSavedStrategies() {
  const strategies = localStorage.getItem('savedStrategies');
  console.log('Loaded strategies from localStorage:', strategies);
  if (strategies) {
    savedStrategies.value = JSON.parse(strategies);
    console.log('Parsed saved strategies:', savedStrategies.value);
  }
}

function saveStrategiesToLocalStorage() {
  console.log('Saving strategies to localStorage:', savedStrategies.value);
  localStorage.setItem('savedStrategies', JSON.stringify(savedStrategies.value));
}

function saveStrategy() {
  console.log('Saving strategy:', {
    name: strategyName.value.trim(),
    pairs: selectedMarkets.value
  });

  if (strategyName.value.trim() && selectedMarkets.value.length > 0) {
    savedStrategies.value.push({
      name: strategyName.value.trim(),
      pairs: [...selectedMarkets.value]
    });
    strategyName.value = '';
    saveStrategiesToLocalStorage();
    console.log('Strategy saved successfully.');
  } else {
    console.error('Failed to save strategy: Name or markets missing.');
  }
}

function applyStrategy(strategy) {
  console.log('Applying strategy:', strategy);
  selectedMarkets.value = [...strategy.pairs];
  updateSelectedMarkets(selectedMarkets.value);
}

function deleteStrategy(index) {
  console.log('Deleting strategy at index:', index);
  savedStrategies.value.splice(index, 1);
  saveStrategiesToLocalStorage();
}



async function updateSelectedExchange(exchange) {
  console.log('Updating selected exchange to:', exchange);
  selectedExchange.value = exchange;
  selectedMarkets.value = ['LCX/USDC'];
  marketForms.value = [];
  console.log('Exchange updated:', selectedExchange.value);
}

async function fetchOrderBook() {
  console.log('Fetching order book for markets:', selectedMarkets.value);
  try {
    for (let market of selectedMarkets.value) {
      const response = await $fetch('/api/v1/fetchOrderBook', {
        method: 'GET',
        params: {
          exchange: selectedExchange.value,
          symbol: market
        }
      });
      const orderBook = response.data;
      console.log(`Order book for ${market}:`, orderBook);

      const marketForm = marketForms.value.find((mf) => mf.symbol === market);
      if (marketForm) {
        marketForm.bestBid = orderBook.bids?.[0]?.[0] || 'N/A';
        marketForm.bestAsk = orderBook.asks?.[0]?.[0] || 'N/A';
        console.log(`Updated market form for ${market}:`, marketForm);
      }
    }
  } catch (error) {
    console.error('Error fetching order book:', error);
  }
}

function addToAmount(value) {
  console.log('Adding value to amounts:', value);
  marketForms.value.forEach((marketForm) => {
    marketForm.amount = String((+marketForm.amount || 0) + value);
  });
  console.log('Updated market forms with added amount:', marketForms.value);
}

function addToNrOfGrids(value) {
  console.log('Adding value to number of grids:', value);
  marketForms.value.forEach((marketForm) => {
    marketForm.nrOfGrids = String((+marketForm.nrOfGrids || 0) + value);
  });
  console.log('Updated market forms with added grids:', marketForms.value);
}

function updateLowerPriceForAll(deviationPercentage) {
  console.log('Updating lower price for all with deviation percentage:', deviationPercentage);
  marketForms.value.forEach((marketForm) => {
    if (marketForm.bestBid) {
      marketForm.lowerPrice = (parseFloat(marketForm.bestBid) * (1 - deviationPercentage)).toFixed(6);
      console.log(`Updated lower price for ${marketForm.symbol}:`, marketForm.lowerPrice);
    }
  });
}

function updateUpperPriceForAll(deviationPercentage) {
  console.log('Updating upper price for all with deviation percentage:', deviationPercentage);
  marketForms.value.forEach((marketForm) => {
    if (marketForm.bestAsk) {
      marketForm.upperPrice = (parseFloat(marketForm.bestAsk) * (1 + deviationPercentage)).toFixed(6);
      console.log(`Updated upper price for ${marketForm.symbol}:`, marketForm.upperPrice);
    }
  });
}

async function createGridBot() {
  try {
    console.log('Starting to create Grid Bots with market forms:', marketForms.value);

    const botsData = marketForms.value.map((marketForm, index) => ({
      userID: userID.value,
      name: marketForm.name || `gridBot_${marketForm.symbol}`,
      exchange: selectedExchange.value,
      symbol: marketForm.symbol,
      lowerPrice: parseFloat(marketForm.lowerPrice) || 0,
      upperPrice: parseFloat(marketForm.upperPrice) || 0,
      amountType: marketForm.amountType,
      amount: parseFloat(marketForm.amount) || 0,
      nrOfGrids: parseInt(marketForm.nrOfGrids) || 0,
      ordersSide: marketForm.ordersSide,
      incrementalPercentAmountBuy: parseFloat(marketForm.incrementalPercentAmountBuy) || 0,
      incrementalPercentAmountSell: parseFloat(marketForm.incrementalPercentAmountSell) || 0,
      config: {
        deviationPriceBuy: parseFloat(marketForm.deviationPriceBuy) || parseFloat(deviationPriceBuy.value) || 1,
        deviationPriceSell: parseFloat(marketForm.deviationPriceSell) || parseFloat(deviationPriceSell.value) || 1,
        deviationAmountBuy: parseFloat(marketForm.deviationAmountBuy) || parseFloat(deviationAmountBuy.value) || 1,
        deviationAmountSell: parseFloat(marketForm.deviationAmountSell) || parseFloat(deviationAmountSell.value) || 1,
      },
    }));

    console.log('Prepared bot data to send:', botsData);

    const responses = await Promise.all(
      botsData.map((botData) =>
        $fetch('/api/v1/createGridBot', {
          method: 'POST',
          body: botData,
        })
      )
    );

    console.log('Grid Bots created successfully:', responses);
    alert('Grid Bots have been created!');
  } catch (error) {
    console.error('Error creating grid bots:', error);
    alert('Failed to create Grid Bots. Please check the console for more details.');
  }
}

function handleBuy() {
  console.log('Buy button clicked');
  // Creează bot pentru "buy"
  createGridBot({ type: 'buy' })
    .then(response => {
      console.log('Buy bot created successfully:', response);
    })
    .catch(error => {
      console.error('Error creating Buy bot:', error);
    });
}

function handleSell() {
  console.log('Sell button clicked');
  // Creează bot pentru "sell"
  createGridBot({ type: 'sell' })
    .then(response => {
      console.log('Sell bot created successfully:', response);
    })
    .catch(error => {
      console.error('Error creating Sell bot:', error);
    });
}




async function updateSelectedMarkets(markets) {
  console.log('Updating selected markets to:', markets);
  selectedMarkets.value = markets;

  marketForms.value = markets.map((market) => ({
    symbol: market,
    name: `gridBot_${market}`,
    lowerPrice: '',
    upperPrice: '',
    amount: '1.1',
    nrOfGrids: '10',
    amountType: 'incrementalPercent',
    ordersSide: 'buyOrSell',
    bestBid: null,
    bestAsk: null,
    incrementalPercentAmountBuy: '',
    incrementalPercentAmountSell: '',
    deviationPriceBuy: '',
    deviationPriceSell: '',
    deviationAmountBuy: '',
    deviationAmountSell: ''
  }));
  console.log('Initialized market forms:', marketForms.value);
  await fetchOrderBook();
}

onMounted(async () => {
  console.log('Component mounted. Initializing...');
  loadSavedStrategies();
  await updateSelectedMarkets(selectedMarkets.value);
  setIntervalAsync(fetchOrderBook, 5000); // Update every 5 seconds
});
</script>


<template>


<div class="actions-section">
  <n-grid x-gap="8" y-gap="8" :cols="12">
  <!-- Acțiuni principale -->
  <n-gi span="7">
    <n-card class="compact-card small-card">
      <table class="button-table compact-table">
        <thead>
          <tr>
            <th>Actions</th>
            <th>Price Adjustments</th>
            <th>Amount & Grids</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <!-- Action Buttons -->
            <td class="compact-buttons">
              <n-button size="tiny" class="btn btn-blue" @click="createGridBot">Create Grid Bots</n-button>
              <n-button size="tiny" class="btn btn-green" @click="handleBuy">Buy</n-button>
              <n-button size="tiny" class="btn btn-red" @click="handleSell">Sell</n-button>
            </td>

            <!-- Price Adjustments -->
            <td class="compact-buttons">
              <n-button size="tiny" class="btn btn-lower" @click="() => updateLowerPriceForAll(0.001)">Lower Price (-0.1%)</n-button>
              <n-button size="tiny" class="btn btn-lower" @click="() => updateLowerPriceForAll(0.01)">Lower Price (-1%)</n-button>
              <n-button size="tiny" class="btn btn-upper" @click="() => updateUpperPriceForAll(0.001)">Upper Price (+0.1%)</n-button>
              <n-button size="tiny" class="btn btn-upper" @click="() => updateUpperPriceForAll(0.01)">Upper Price (+1%)</n-button>
            </td>

            <!-- Amount & Grids -->
            <td class="compact-buttons">
              <n-button size="tiny" class="btn btn-blue" @click="() => addToAmount(1.1)">Add 1.1 to Amount</n-button>
              <n-button size="tiny" class="btn btn-blue" @click="() => addToAmount(10.1)">Add 10.1 to Amount</n-button>
              <n-button size="tiny" class="btn btn-blue" @click="() => addToNrOfGrids(5)">Add 5 to Grids</n-button>
              <n-button size="tiny" class="btn btn-blue" @click="() => addToNrOfGrids(10)">Add 10 to Grids</n-button>
            </td>
          </tr>
        </tbody>
      </table>
    </n-card>
  </n-gi>

  <!-- Restul secțiunilor (Saved Strategies și Configuration Settings) -->
  <n-gi span="5">
    
    <div class="global-actions">
      <div class="compact-section">
        <n-grid x-gap="16" :cols="12">
          <!-- Secțiunea pentru strategii salvate -->
          <n-gi span="6">
            <n-card class="compact-card">
              
              <n-switch
                v-model:value="showStrategySection"
                size="small"
                type="primary"
                checked-text="Show Saved Strategies"
                unchecked-text="Hide Saved Strategies"
              />
              <div v-if="showStrategySection">
                <n-table :bordered="false" size="small">
                  <thead>
                    <n-grid x-gap="8" :cols="12">
          <n-gi span="8">
            <n-input
              v-model:value="strategyName"
              placeholder="Strategy Name"
              size="small"
            />
          </n-gi>
          <n-gi span="4">
            <n-button size="small" type="primary" @click="saveStrategy">
              Save Strategy
            </n-button>
          </n-gi>
        </n-grid>
                    <tr>
                      <th>Strategy</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(strategy, index) in savedStrategies" :key="index">
                      <td>{{ strategy.name }}</td>
                      <td>
                        <n-button size="tiny" @click="() => applyStrategy(strategy)">Apply</n-button>
                        <n-button size="tiny" type="error" @click="() => deleteStrategy(index)">Delete</n-button>
                      </td>
                    </tr>
                  </tbody>
                </n-table>
              </div>
            </n-card>
          </n-gi>

          <!-- Secțiunea pentru configurări -->
          <n-gi span="6">
            <n-card class="compact-card">
              <n-switch
                v-model:value="showConfigurationSection"
                size="small"
                type="primary"
                checked-text="Show Configuration"
                unchecked-text="Hide Configuration"
              />
              <div v-if="showConfigurationSection">
                <h4>Configuration Settings</h4>
                <n-grid x-gap="4" :cols="12">
                     <!-- Incremental Percent Amount Buy -->
                      <n-gi span="4">
                        <n-input
                          v-model:value="incrementalPercentAmountBuy"
                          type="number"
                          placeholder="Inc. % Amount Buy"
                        />
                      </n-gi>
                      <!-- Incremental Percent Amount Sell -->
                      <n-gi span="4">
                        <n-input
                          v-model:value="incrementalPercentAmountSell"
                          type="number"
                          placeholder="Inc. % Amount Sell"
                        />
                      </n-gi>
                      <!-- Deviation Price Buy -->
                      <n-gi span="4">
                        <n-input
                          v-model:value="deviationPriceBuy"
                          type="number"
                          placeholder="Deviation Price Buy"
                          @input="updateDeviationPriceBuy(0, $event.target.value)"
                        />
                      </n-gi>
                      <!-- Deviation Price Sell -->
                      <n-gi span="4">
                        <n-input
                          v-model:value="deviationPriceSell"
                          type="number"
                          placeholder="Deviation Price Sell"
                          @input="updateDeviationPriceSell(0, $event.target.value)"
                        />
                      </n-gi>
                      <!-- Deviation Amount Buy -->
                      <n-gi span="4">
                        <n-input
                          v-model:value="deviationAmountBuy"
                          type="number"
                          placeholder="Deviation Amount Buy"
                          @input="updateDeviationAmountBuy(0, $event.target.value)"
                        />
                      </n-gi>
                      <!-- Deviation Amount Sell -->
                      <n-gi span="4">
                        <n-input
                          v-model:value="deviationAmountSell"
                          type="number"
                          placeholder="Deviation Amount Sell"
                          @input="updateDeviationAmountSell(0, $event.target.value)"
                        />
                      </n-gi>
                </n-grid>
                <n-grid x-gap="4" :cols="12">
                
                  <n-gi span="6">
                    <!-- Saved Configurations -->

  <!-- Save Button -->
  <n-grid x-gap="8" :cols="12">
          <n-gi span="6">
            <n-button
              size="small"
              type="primary"
              @click="saveConfiguration"
            >
              Save Configuration
            </n-button>
          </n-gi>
       
        </n-grid>

               
                <n-table :bordered="true" size="small">
                  <thead>
                    <tr>
                      <th>Configuration</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(config, index) in savedConfigurations"
                      :key="index"
                    >
                      <td>
                        {{ config.name }}
                        <span
                          v-if="config.isDefault"
                          style="color: green; font-weight: bold;"
                        >
                          (Default)
                        </span>
                      </td>
                      <td>
                        <n-button
                          size="tiny"
                          @click="applyConfiguration(config)"
                        >
                          Apply
                        </n-button>
                        <n-button
                          size="tiny"
                          type="warning"
                          @click="setDefaultConfiguration(config.name)"
                          :disabled="config.isDefault"
                        >
                          Set as Default
                        </n-button>
                        <n-button
                          size="tiny"
                          type="error"
                          @click="deleteConfiguration(index)"
                          :disabled="config.isDefault"
                        >
                          Delete
                        </n-button>
                      </td>
                    </tr>
                  </tbody>
                </n-table>
                  </n-gi>
                </n-grid>
              </div>
            </n-card>
          </n-gi>
        </n-grid>
      </div>
    </div>
  </n-gi>
</n-grid>

</div>



  <div class="dashboard">
      <!-- Top Bar Section -->
      <div class="top-bar">

        <n-card>
          
        </n-card>
            <n-card class="compact-card">
              <n-switch
                v-model:value="showTopBar"
                size="small"
                type="primary"
                checked-text="Show Top Bar"
                unchecked-text="Hide Top Bar"
              />



              

              <div v-if="showTopBar">
                <n-grid x-gap="2" :cols="2">
                  <n-gi span="2">
                    <n-select
                      v-model:value="selectedExchange"
                      :options="userExchanges"
                      placeholder="Select exchange"
                      filterable
                      @update:value="updateSelectedExchange($event)"
                    />
                  </n-gi>
                  <n-gi span="2">
                    <n-select
                      v-model:value="selectedMarkets"
                      :options="userExchangeMarkets"
                      placeholder="Select markets"
                      multiple
                      filterable
                      @update:value="updateSelectedMarkets($event)"
                    />
                  </n-gi>
                </n-grid>
              </div>
            </n-card>
      </div>

      <!-- Market Table Section -->
      <div class="market-table">
        <n-card class="compact-card">
          <n-switch
            v-model:value="showMarketTable"
            size="small"
            type="primary"
            checked-text="Show Market Table"
            unchecked-text="Hide Market Table"
          />
          <div v-if="showMarketTable">
            <n-table :bordered="true">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Bot Name</th>
                  <th>Lower Price</th>
                  <th>Upper Price</th>
                  <th>Amount</th>
                  <th>Nr of Grids</th>
                  <th>Bid</th>
                  <th>Ask</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(marketForm, index) in marketForms" :key="index">
                  <td>
                    <strong>{{ marketForm.symbol }}</strong>
                  </td>
                  <td>
                    <n-input
                      class="compact-input"
                      v-model:value="marketForm.name"
                      placeholder="Bot name"
                    />
                  </td>
                  <td>
                    <n-input
                      class="compact-input"
                      v-model:value="marketForm.lowerPrice"
                      placeholder="Lower Price"
                    />
                  </td>
                  <td>
                    <n-input
                      class="compact-input"
                      v-model:value="marketForm.upperPrice"
                      placeholder="Upper Price"
                    />
                  </td>
                  <td>
                    <n-input
                      v-model:value="marketForm.amount"
                      type="text"
                      placeholder="Amount"
                    />
                  </td>
                  <td>
                    <n-input
                      v-model:value="marketForm.nrOfGrids"
                      type="text"
                      placeholder="Nr of grids"
                    />
                  </td>
                  <td>
                    <span>{{ marketForm.bestBid }}</span>
                  </td>
                  <td>
                    <span>{{ marketForm.bestAsk }}</span>
                  </td>
                </tr>
              </tbody>
            </n-table>
          </div>
        </n-card>
      </div>
  
    
    
  </div>



  
</template>



<style scoped>
.actions-section {
  padding: 10px;
}

.small-card {
  padding: 10px;
  border: 1px solid #ddd;
  background-color: #4e4848;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.button-table {
  width: 100%;
  border-collapse: collapse;
}

.button-table th {
  background-color: #280481;
  color: white;
  padding: 6px;
  text-align: center;
}

.button-table td {
  padding: 4px;
  text-align: center;
  vertical-align: middle;
}

.compact-buttons n-button {
  margin: 2px;
  padding: 4px 6px;
}

.btn {
  font-size: 12px;
  font-weight: bold;
  border-radius: 3px;
}

.btn-blue {
  background-color: #007bff;
  color: white;
}

.btn-blue:hover {
  background-color: #0056b3;
}

.btn-green {
  background-color: #28a745;
  color: white;
}

.btn-green:hover {
  background-color: #1e7e34;
}

.btn-red {
  background-color: #dc3545;
  color: white;
}

.btn-red:hover {
  background-color: #b21f2d;
}

.btn-lower {
  background-color: #1e7e34;
  color: black;
}

.btn-lower:hover {
  background-color: #033602;
}

.btn-upper {
  background-color: #dc3545;
  color: white;
}

.btn-upper:hover {
  background-color: #670508;
}

</style>
