<script setup>
import { useAppStore } from '~/stores/app.store';
import { ref, h, onMounted, computed } from "vue";
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async';

const app = useAppStore();
let userID = useCookie('userID');

// Import bot calculations composable (auto-imported by Nuxt 3)
const {
  calculateGridOrders,
  calculateTotalInvestment,
  calculateTotalBaseAmount,
  getBaseCurrency,
  getQuoteCurrency
} = useBotCalculations();

// Refs for form inputs
let incrementalPercentAmountBuy = ref('1');
let incrementalPercentAmountSell = ref('1');
let deviationPriceBuy = ref('20');
let deviationPriceSell = ref('20');
let deviationAmountBuy = ref('0.9');
let deviationAmountSell = ref('0.9');

// Load saved configurations from localStorage
const loadConfigurationsFromStorage = () => {
  try {
    const stored = localStorage.getItem('oneclick-saved-configs');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading configurations from localStorage:', error);
  }
  return [
    {
      name: "Default",
      incrementalPercentAmountBuy: "1",
      incrementalPercentAmountSell: "1",
      deviationPriceBuy: "20",
      deviationPriceSell: "20",
      deviationAmountBuy: "0.9",
      deviationAmountSell: "0.9",
      isDefault: true,
    }
  ];
};

const savedConfigurations = ref(loadConfigurationsFromStorage());

// Save configurations to localStorage
const saveConfigurationsToStorage = () => {
  try {
    localStorage.setItem('oneclick-saved-configs', JSON.stringify(savedConfigurations.value));
  } catch (error) {
    console.error('Error saving configurations to localStorage:', error);
  }
};

function saveConfiguration() {
  const configName = prompt("Enter configuration name:");
  if (configName) {
    savedConfigurations.value.push({
      name: configName,
      incrementalPercentAmountBuy: incrementalPercentAmountBuy.value,
      incrementalPercentAmountSell: incrementalPercentAmountSell.value,
      deviationPriceBuy: deviationPriceBuy.value,
      deviationPriceSell: deviationPriceSell.value,
      deviationAmountBuy: deviationAmountBuy.value,
      deviationAmountSell: deviationAmountSell.value,
      isDefault: false,
    });
    saveConfigurationsToStorage(); // Save to localStorage
  }
}

function applyConfiguration(config) {
  console.log('🔧 Applying configuration:', config);
  console.log('Before:', {
    incBuy: incrementalPercentAmountBuy.value,
    incSell: incrementalPercentAmountSell.value,
    devPriceBuy: deviationPriceBuy.value,
    devPriceSell: deviationPriceSell.value,
    devAmtBuy: deviationAmountBuy.value,
    devAmtSell: deviationAmountSell.value
  });

  incrementalPercentAmountBuy.value = config.incrementalPercentAmountBuy;
  incrementalPercentAmountSell.value = config.incrementalPercentAmountSell;
  deviationPriceBuy.value = config.deviationPriceBuy;
  deviationPriceSell.value = config.deviationPriceSell;
  deviationAmountBuy.value = config.deviationAmountBuy;
  deviationAmountSell.value = config.deviationAmountSell;

  console.log('After:', {
    incBuy: incrementalPercentAmountBuy.value,
    incSell: incrementalPercentAmountSell.value,
    devPriceBuy: deviationPriceBuy.value,
    devPriceSell: deviationPriceSell.value,
    devAmtBuy: deviationAmountBuy.value,
    devAmtSell: deviationAmountSell.value
  });

  // Show confirmation
  window.$message?.success(`✅ Applied: ${config.name}`) || alert(`✅ Applied: ${config.name}`);
}

function deleteConfiguration(index) {
  const config = savedConfigurations.value[index];
  if (config.isDefault) {
    alert('Cannot delete default configuration');
    return;
  }
  if (confirm(`Delete configuration "${config.name}"?`)) {
    savedConfigurations.value.splice(index, 1);
    saveConfigurationsToStorage(); // Save to localStorage
  }
}

// API Key selector
let availableApiKeys = ref([]);
let selectedApiKey = ref(null);
let loadingApiKeys = ref(false);
let apiKeyColors = ref({});

let selectedExchange = ref('coinbaseadvanced');
let selectedMarkets = ref(['LCX/USDC']);
let marketForms = ref([]);
let marketSearchQuery = ref('');

// Computed: filtered markets based on search
const filteredMarkets = computed(() => {
  if (!userExchangeMarkets.value || !Array.isArray(userExchangeMarkets.value)) {
    return [];
  }
  if (!marketSearchQuery.value) {
    return userExchangeMarkets.value;
  }
  const query = marketSearchQuery.value.toLowerCase();
  return userExchangeMarkets.value.filter(market =>
    market.label?.toLowerCase().includes(query) ||
    market.value?.toLowerCase().includes(query)
  );
});

// Add market to selection
function addMarket(market) {
  if (!selectedMarkets.value.includes(market)) {
    selectedMarkets.value.push(market);
    updateSelectedMarkets(selectedMarkets.value);
  }
}

// Remove market from selection
function removeMarket(market) {
  const index = selectedMarkets.value.indexOf(market);
  if (index > -1) {
    selectedMarkets.value.splice(index, 1);
    marketForms.value = marketForms.value.filter(mf => mf.symbol !== market);
  }
}

// Config dropdown state
let showConfigDetails = ref(false);

// Strategies state
let strategies = ref([]);
let loadingStrategies = ref(false);
let showStrategyForm = ref(false);
let newStrategyName = ref('');
let newStrategyDescription = ref('');

let userExchanges = app.getUserExchanges;
const userExchangeMarkets = computed(() => app.getUserExchangeMarkets);

async function updateSelectedExchange(exchange) {
  selectedExchange.value = exchange;
  selectedMarkets.value = [];
  marketForms.value = [];
  await loadApiKeys();
}

async function fetchOrderBook() {
  try {
    for (let market of selectedMarkets.value) {
      const response = await $fetch('/api/v1/fetchOrderBook', {
        method: 'GET',
        params: {
          userID: userID.value,
          exchange: selectedExchange.value,
          symbol: market
        }
      });
      const orderBook = response.data;

      const marketForm = marketForms.value.find((mf) => mf.symbol === market);
      if (marketForm) {
        marketForm.bestBid = orderBook?.bids?.[0]?.[0] || 'N/A';
        marketForm.bestAsk = orderBook?.asks?.[0]?.[0] || 'N/A';

        // Auto-populate lower and upper prices with ±20%
        if (marketForm.bestBid && marketForm.bestBid !== 'N/A') {
          const deviationBuy = parseFloat(deviationPriceBuy.value) / 100 || 0.20;
          marketForm.lowerPrice = (parseFloat(marketForm.bestBid) * (1 - deviationBuy)).toFixed(6);
        }
        if (marketForm.bestAsk && marketForm.bestAsk !== 'N/A') {
          const deviationSell = parseFloat(deviationPriceSell.value) / 100 || 0.20;
          marketForm.upperPrice = (parseFloat(marketForm.bestAsk) * (1 + deviationSell)).toFixed(6);
        }

        // Debug: log prices for each symbol
        console.log(`📊 ${market}: Bid=${marketForm.bestBid}, Ask=${marketForm.bestAsk}, Lower=${marketForm.lowerPrice}, Upper=${marketForm.upperPrice}`);
      }
    }
  } catch (error) {
    console.error('Error fetching order book:', error);
  }
}

function setAmount(value) {
  marketForms.value.forEach((marketForm) => {
    marketForm.amount = String(value);
  });
}

function setNrOfGrids(value) {
  marketForms.value.forEach((marketForm) => {
    marketForm.nrOfGrids = String(value);
  });
}

function updateLowerPriceForAll(deviationPercentage) {
  marketForms.value.forEach((marketForm) => {
    if (marketForm.bestBid) {
      marketForm.lowerPrice = (parseFloat(marketForm.bestBid) * (1 - deviationPercentage)).toFixed(6);
    }
  });
}

function updateUpperPriceForAll(deviationPercentage) {
  marketForms.value.forEach((marketForm) => {
    if (marketForm.bestAsk) {
      marketForm.upperPrice = (parseFloat(marketForm.bestAsk) * (1 + deviationPercentage)).toFixed(6);
    }
  });
}

// Bulk mode tracking
const activeBulkMode = ref(null); // null, 'buyOnly', 'sellOnly', or 'buyOrSell'

// Set all bots to same ordersSide (bulk operation)
function setAllSides(side) {
  activeBulkMode.value = side;
  marketForms.value.forEach((marketForm) => {
    marketForm.ordersSide = side;
  });
}

// Reset bulk mode when user manually changes a single bot's side
function onIndividualSideChange() {
  activeBulkMode.value = null;
}

// Computed properties for button states based on actual bot sides
const isCreateDisabled = computed(() => {
  if (marketForms.value.length === 0) return false;

  // Check if ALL bots have the same ordersSide
  const allSides = marketForms.value.map(f => f.ordersSide);
  const uniqueSides = [...new Set(allSides)];

  // If all bots have same side and it's NOT 'buyOrSell', disable Create
  if (uniqueSides.length === 1 && uniqueSides[0] !== 'buyOrSell') {
    return true;
  }

  return false;
});

const isBuyDisabled = computed(() => {
  if (marketForms.value.length === 0) return false;

  // Check if ALL bots have the same ordersSide
  const allSides = marketForms.value.map(f => f.ordersSide);
  const uniqueSides = [...new Set(allSides)];

  // If all bots have same side and it's NOT 'buyOnly', disable Buy
  if (uniqueSides.length === 1 && uniqueSides[0] !== 'buyOnly') {
    return true;
  }

  return false;
});

const isSellDisabled = computed(() => {
  if (marketForms.value.length === 0) return false;

  // Check if ALL bots have the same ordersSide
  const allSides = marketForms.value.map(f => f.ordersSide);
  const uniqueSides = [...new Set(allSides)];

  // If all bots have same side and it's NOT 'sellOnly', disable Sell
  if (uniqueSides.length === 1 && uniqueSides[0] !== 'sellOnly') {
    return true;
  }

  return false;
});

// Investment Preview collapse state
const showInvestmentPreview = ref(true);

// Quick Actions collapse state
const showQuickActions = ref(true);

// Unified Settings collapse state
const showUnifiedSettings = ref(true);

async function createGridBot(options = {}) {
  if (!selectedApiKey.value) {
    alert('Please select an API key');
    return;
  }

  // Determine default ordersSide based on button clicked (if buttons used)
  const defaultOrdersSide = options.type === 'buy' ? 'buyOnly' :
                            options.type === 'sell' ? 'sellOnly' :
                            null; // null means use individual marketForm ordersSide

  try {
    const botsData = marketForms.value.map((marketForm) => ({
      userID: userID.value,
      name: marketForm.name || `OneClickBot_${marketForm.symbol}`,
      exchange: selectedExchange.value,
      symbol: marketForm.symbol,
      lowerPrice: parseFloat(marketForm.lowerPrice) || 0,
      upperPrice: parseFloat(marketForm.upperPrice) || 0,
      amountType: 'incrementalPercent',
      amount: parseFloat(marketForm.amount) || 0,
      nrOfGrids: parseInt(marketForm.nrOfGrids) || 0,
      // Use button override or individual marketForm ordersSide
      ordersSide: defaultOrdersSide || marketForm.ordersSide || 'buyOrSell',
      incrementalPercentAmountBuy: parseFloat(incrementalPercentAmountBuy.value) || 0,
      incrementalPercentAmountSell: parseFloat(incrementalPercentAmountSell.value) || 0,
      apiKeyName: selectedApiKey.value,
      config: {
        deviationPriceBuy: parseFloat(deviationPriceBuy.value) || 1,
        deviationPriceSell: parseFloat(deviationPriceSell.value) || 1,
        deviationAmountBuy: parseFloat(deviationAmountBuy.value) || 1,
        deviationAmountSell: parseFloat(deviationAmountSell.value) || 1,
      },
    }));

    await Promise.all(
      botsData.map((botData) =>
        $fetch('/api/v1/createOneClickBot', {
          method: 'POST',
          body: botData,
        })
      )
    );

    alert('Grid Bots created successfully!');
  } catch (error) {
    console.error('Error creating grid bots:', error);
    alert('Failed to create Grid Bots');
  }
}

function handleBuy() {
  createGridBot({ type: 'buy' });
}

function handleSell() {
  createGridBot({ type: 'sell' });
}

async function updateSelectedMarkets(markets) {
  selectedMarkets.value = markets;

  marketForms.value = markets.map((market) => ({
    symbol: market,
    name: `OneClickBot_${market}`,
    lowerPrice: '',
    upperPrice: '',
    amount: '1.1',
    nrOfGrids: '10',
    ordersSide: 'buyOrSell', // Default to both buy and sell
    bestBid: null,
    bestAsk: null,
  }));

  await fetchOrderBook();
}

// Load strategies from database
async function loadStrategies() {
  loadingStrategies.value = true;
  try {
    const response = await $fetch('/api/v1/getOneClickStrategies', {
      method: 'GET',
      query: {
        userID: userID.value
      }
    });

    if (response.success) {
      strategies.value = response.strategies || [];
    }
  } catch (error) {
    console.error('Error loading strategies:', error);
  } finally {
    loadingStrategies.value = false;
  }
}

// Save current configuration as a strategy
async function saveStrategy() {
  if (!newStrategyName.value.trim()) {
    alert('Please enter a strategy name');
    return;
  }

  if (marketForms.value.length === 0) {
    alert('Please select at least one market');
    return;
  }

  try {
    // Calculate percentage offsets for each pair
    const pairs = marketForms.value.map(marketForm => {
      const bid = parseFloat(marketForm.bestBid) || 0;
      const ask = parseFloat(marketForm.bestAsk) || 0;
      const lowerPrice = parseFloat(marketForm.lowerPrice) || 0;
      const upperPrice = parseFloat(marketForm.upperPrice) || 0;

      // Calculate percentage deviation from bid/ask
      const lowerPricePercent = bid > 0 ? ((lowerPrice - bid) / bid * 100) : -20;
      const upperPricePercent = ask > 0 ? ((upperPrice - ask) / ask * 100) : 1;

      return {
        symbol: marketForm.symbol,
        exchange: selectedExchange.value,
        ordersSide: marketForm.ordersSide || 'buyOrSell', // Save individual bot side
        lowerPricePercent: parseFloat(lowerPricePercent.toFixed(2)),
        upperPricePercent: parseFloat(upperPricePercent.toFixed(2)),
        amount: parseFloat(marketForm.amount) || 1.1,
        grids: parseInt(marketForm.nrOfGrids) || 10,
        referenceBid: bid,
        referenceAsk: ask
      };
    });

    const strategyData = {
      userID: userID.value,
      name: newStrategyName.value.trim(),
      description: newStrategyDescription.value.trim(),
      configName: 'Custom',
      ordersSide: 'buyOrSell', // Default to both buy and sell
      incBuy: parseFloat(incrementalPercentAmountBuy.value) || 1,
      incSell: parseFloat(incrementalPercentAmountSell.value) || 1,
      devPriceBuy: parseFloat(deviationPriceBuy.value) || 1,
      devPriceSell: parseFloat(deviationPriceSell.value) || 1,
      devAmtBuy: parseFloat(deviationAmountBuy.value) || 0.9,
      devAmtSell: parseFloat(deviationAmountSell.value) || 0.9,
      pairs
    };

    const response = await $fetch('/api/v1/createOneClickStrategy', {
      method: 'POST',
      body: strategyData
    });

    if (response.success) {
      alert('Strategy saved successfully!');
      newStrategyName.value = '';
      newStrategyDescription.value = '';
      showStrategyForm.value = false;
      await loadStrategies();
    } else {
      alert(response.message || 'Failed to save strategy');
    }
  } catch (error) {
    console.error('Error saving strategy:', error);
    alert('Failed to save strategy');
  }
}

// Apply a strategy (recalculate prices based on current market)
async function applyStrategy(strategy) {
  try {
    // Get current prices for all pairs in the strategy
    const currentPrices = [];

    for (const pair of strategy.pairs) {
      const response = await $fetch('/api/v1/fetchOrderBook', {
        method: 'GET',
        params: {
          userID: userID.value,
          exchange: pair.exchange,
          symbol: pair.symbol
        }
      });

      if (response.data) {
        currentPrices.push({
          symbol: pair.symbol,
          bid: response.data.bids?.[0]?.[0] || 0,
          ask: response.data.asks?.[0]?.[0] || 0
        });
      }
    }

    // Apply strategy with calculated prices
    const applyResponse = await $fetch('/api/v1/applyOneClickStrategy', {
      method: 'POST',
      body: {
        userID: userID.value,
        strategyId: strategy._id,
        currentPrices
      }
    });

    if (applyResponse.success) {
      const appliedStrategy = applyResponse.strategy;

      // Update config values
      incrementalPercentAmountBuy.value = String(appliedStrategy.incBuy);
      incrementalPercentAmountSell.value = String(appliedStrategy.incSell);
      deviationPriceBuy.value = String(appliedStrategy.devPriceBuy);
      deviationPriceSell.value = String(appliedStrategy.devPriceSell);
      deviationAmountBuy.value = String(appliedStrategy.devAmtBuy);
      deviationAmountSell.value = String(appliedStrategy.devAmtSell);

      // Update selected exchange and markets
      if (appliedStrategy.pairs.length > 0) {
        selectedExchange.value = appliedStrategy.pairs[0].exchange;
        const symbols = appliedStrategy.pairs.map(p => p.symbol);
        await updateSelectedMarkets(symbols);

        // Update prices in marketForms with calculated values
        appliedStrategy.pairs.forEach(pair => {
          const marketForm = marketForms.value.find(mf => mf.symbol === pair.symbol);
          if (marketForm) {
            marketForm.lowerPrice = String(pair.lowerPrice);
            marketForm.upperPrice = String(pair.upperPrice);
            marketForm.amount = String(pair.amount);
            marketForm.nrOfGrids = String(pair.grids);
            marketForm.ordersSide = pair.ordersSide || 'buyOrSell'; // Restore individual bot side
            marketForm.bestBid = pair.currentBid;
            marketForm.bestAsk = pair.currentAsk;
          }
        });
      }

      alert(`Strategy "${strategy.name}" applied successfully!`);
    }
  } catch (error) {
    console.error('Error applying strategy:', error);
    alert('Failed to apply strategy');
  }
}

// Delete a strategy
async function deleteStrategy(strategyId) {
  if (!confirm('Are you sure you want to delete this strategy?')) {
    return;
  }

  try {
    const response = await $fetch('/api/v1/deleteOneClickStrategy', {
      method: 'POST',
      body: {
        userID: userID.value,
        strategyId
      }
    });

    if (response.success) {
      alert('Strategy deleted successfully');
      await loadStrategies();
    }
  } catch (error) {
    console.error('Error deleting strategy:', error);
    alert('Failed to delete strategy');
  }
}

onMounted(async () => {
  await loadApiKeys();
  await updateSelectedMarkets(selectedMarkets.value);
  await loadStrategies();
  setIntervalAsync(fetchOrderBook, 5000);
});

async function loadApiKeys() {
  loadingApiKeys.value = true;
  try {
    const response = await $fetch('/api/v1/fetchApiKeysList', {
      query: {
        userID: userID.value,
        exchange: selectedExchange.value
      }
    });

    if (response.success && response.data && response.data.length > 0) {
      const colors = ['#10eb04', '#05f5ed', '#f5a623', '#eb06eb', '#eadb11', '#50e3c2', '#f72c09', '#cb8d07'];
      apiKeyColors.value = {};

      availableApiKeys.value = response.data.map((apiKey, index) => {
        const color = colors[index % colors.length];
        apiKeyColors.value[apiKey.name] = color;
        return {
          label: `${apiKey.name} (${apiKey.preview})`,
          value: apiKey.name
        };
      });
      selectedApiKey.value = availableApiKeys.value[0].value;
    } else {
      availableApiKeys.value = [];
      selectedApiKey.value = null;
    }
  } catch (error) {
    console.error('Failed to load API keys:', error);
    availableApiKeys.value = [];
    selectedApiKey.value = null;
  } finally {
    loadingApiKeys.value = false;
  }
}

function renderApiKeyLabel(option) {
  const color = apiKeyColors.value[option.value] || '#ffffff';
  return h('div', { style: 'display: flex; align-items: center;' }, [
    h('span', {
      style: `display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color}; margin-right: 8px;`
    }),
    h('span', { style: `color: ${color}; font-weight: 500;` }, option.label)
  ]);
}

// Calculate investment preview for all market forms
const investmentPreview = computed(() => {
  return marketForms.value.map(form => {
    // Get current price (bid+ask average or mid-price)
    const currentBid = parseFloat(form.bestBid) || 0;
    const currentAsk = parseFloat(form.bestAsk) || 0;
    const currentPrice = (currentBid + currentAsk) / 2 ||
                         (parseFloat(form.lowerPrice) + parseFloat(form.upperPrice)) / 2;

    // Prepare pair object for calculations
    const pair = {
      symbol: form.symbol,
      lowerPrice: parseFloat(form.lowerPrice) || 0,
      upperPrice: parseFloat(form.upperPrice) || 0,
      amount: parseFloat(form.amount) || 0,
      grids: parseInt(form.nrOfGrids) || 0,
      amountType: 'incrementalPercent', // OneClick uses incremental percent
      incrementalPercent: parseFloat(incrementalPercentAmountBuy.value) || 0,
      ordersSide: form.ordersSide || 'buyOrSell', // Use individual bot side
      currentPrice: currentPrice // Current market price for filtering
    };

    // Calculate metrics using composable (now respects ordersSide)
    const orders = calculateGridOrders(pair);
    const totalInvestment = calculateTotalInvestment(pair);
    const totalBase = calculateTotalBaseAmount(pair);
    const baseCurrency = getBaseCurrency(form.symbol);
    const quoteCurrency = getQuoteCurrency(form.symbol);

    return {
      symbol: form.symbol,
      baseCurrency,
      quoteCurrency,
      totalBase,
      totalInvestment,
      ordersCount: orders.length, // Actual orders count after filtering
      avgPrice: orders.length > 0 ? totalInvestment / totalBase : 0
    };
  });
});

// Calculate grand totals with Buy/Sell breakdown
const grandTotals = computed(() => {
  // Calculate totals for all bots
  let totalInvestment = 0;
  let totalOrders = 0;
  let buyOrders = 0;
  let sellOrders = 0;
  let buyInvestment = 0;
  let sellValue = 0;
  let totalBaseAmounts = {}; // Track base amounts per currency

  marketForms.value.forEach(form => {
    // Get current price
    const currentBid = parseFloat(form.bestBid) || 0;
    const currentAsk = parseFloat(form.bestAsk) || 0;
    const currentPrice = (currentBid + currentAsk) / 2 ||
                         (parseFloat(form.lowerPrice) + parseFloat(form.upperPrice)) / 2;

    const pair = {
      symbol: form.symbol,
      lowerPrice: parseFloat(form.lowerPrice) || 0,
      upperPrice: parseFloat(form.upperPrice) || 0,
      amount: parseFloat(form.amount) || 0,
      grids: parseInt(form.nrOfGrids) || 0,
      amountType: 'incrementalPercent',
      incrementalPercent: parseFloat(incrementalPercentAmountBuy.value) || 0,
      ordersSide: form.ordersSide || 'buyOrSell',
      currentPrice: currentPrice
    };

    // Calculate orders for this bot
    const orders = calculateGridOrders(pair);
    const baseCurrency = getBaseCurrency(form.symbol);

    // Count buy/sell orders and calculate investments
    orders.forEach(order => {
      totalOrders++;
      totalInvestment += order.total;

      if (order.side === 'buy') {
        buyOrders++;
        buyInvestment += order.total;
      } else {
        sellOrders++;
        sellValue += order.total;

        // Track base amount needed for sell orders
        if (!totalBaseAmounts[baseCurrency]) {
          totalBaseAmounts[baseCurrency] = 0;
        }
        totalBaseAmounts[baseCurrency] += order.amount;
      }
    });
  });

  return {
    totalInvestment,
    totalOrders,
    buyOrders,
    sellOrders,
    buyInvestment,
    sellValue,
    totalBaseAmounts // Object with base currencies and amounts needed for sell orders
  };
});

// Modal state for grid orders detail
const showGridOrdersModal = ref(false);
const selectedBotForOrders = ref(null);
const selectedBotOrders = ref([]);

// Open modal with bot order details
function openBotOrdersModal(preview, formIndex) {
  const form = marketForms.value[formIndex];

  // Get current price
  const currentBid = parseFloat(form.bestBid) || 0;
  const currentAsk = parseFloat(form.bestAsk) || 0;
  const currentPrice = (currentBid + currentAsk) / 2 ||
                       (parseFloat(form.lowerPrice) + parseFloat(form.upperPrice)) / 2;

  // Prepare pair object
  const pair = {
    symbol: form.symbol,
    lowerPrice: parseFloat(form.lowerPrice) || 0,
    upperPrice: parseFloat(form.upperPrice) || 0,
    amount: parseFloat(form.amount) || 0,
    grids: parseInt(form.nrOfGrids) || 0,
    amountType: 'incrementalPercent',
    incrementalPercent: parseFloat(incrementalPercentAmountBuy.value) || 0,
    ordersSide: form.ordersSide || 'buyOrSell', // Include ordersSide
    currentPrice: currentPrice // Include current price for filtering
  };

  // Calculate orders (now filtered by ordersSide)
  const orders = calculateGridOrders(pair);

  selectedBotForOrders.value = {
    ...preview,
    lowerPrice: pair.lowerPrice,
    upperPrice: pair.upperPrice,
    ordersSide: pair.ordersSide,
    currentPrice: currentPrice
  };
  selectedBotOrders.value = orders;
  showGridOrdersModal.value = true;
}
</script>

<template>
  <div class="oneclick-container">
    <!-- Compact Header -->
    <div class="compact-header-fixed">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span class="header-title-small">🤖 OneClick</span>

        <!-- Selected Markets Display (Limited) -->
        <div style="display: flex; align-items: center; gap: 6px;">
          <!-- Show first 5 markets -->
          <n-tag
            v-for="market in selectedMarkets.slice(0, 5)"
            :key="market"
            closable
            @close="removeMarket(market)"
            type="success"
            size="small"
            style="font-size: 10px; padding: 2px 6px;"
          >
            {{ market }}
          </n-tag>

          <!-- Show "+X more" if there are more than 5 markets -->
          <n-popover v-if="selectedMarkets.length > 5" trigger="hover" placement="bottom">
            <template #trigger>
              <n-tag type="info" size="small" style="font-size: 10px; padding: 2px 6px; cursor: pointer;">
                +{{ selectedMarkets.length - 5 }} more
              </n-tag>
            </template>
            <div style="max-height: 300px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;">
              <n-tag
                v-for="market in selectedMarkets.slice(5)"
                :key="market"
                closable
                @close="removeMarket(market)"
                type="success"
                size="small"
                style="font-size: 10px;"
              >
                {{ market }}
              </n-tag>
            </div>
          </n-popover>

          <!-- Add Market Button -->
          <n-popover trigger="click" placement="bottom-start" :style="{ maxWidth: '400px' }">
            <template #trigger>
              <n-button size="tiny" circle type="primary" style="font-size: 14px; width: 24px; height: 24px;">
                +
              </n-button>
            </template>
            <div style="max-height: 400px; overflow-y: auto;">
              <n-input
                v-model:value="marketSearchQuery"
                placeholder="Search markets..."
                size="small"
                clearable
                style="margin-bottom: 8px;"
              />
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <n-button
                  v-for="market in filteredMarkets"
                  :key="market.value"
                  text
                  size="small"
                  @click="addMarket(market.value)"
                  style="justify-content: flex-start; text-align: left; padding: 6px 12px;"
                  :disabled="selectedMarkets.includes(market.value)"
                >
                  <span :style="{ opacity: selectedMarkets.includes(market.value) ? 0.4 : 1 }">
                    {{ market.label }}
                  </span>
                </n-button>
                <div v-if="filteredMarkets.length === 0" style="padding: 12px; text-align: center; color: #888; font-size: 12px;">
                  No markets found
                </div>
              </div>
            </div>
          </n-popover>
        </div>
      </div>
    </div>


    <!-- Main Control Panel -->
    <div class="main-control-panel" v-if="marketForms.length > 0">
      <!-- Action Buttons Row -->
      <div class="control-row">
        <div class="control-section">
          <span class="section-label">Actions</span>
          <div class="button-group">
            <n-button type="primary" size="tiny" @click="createGridBot" :disabled="isCreateDisabled">🚀 Create</n-button>
            <n-button type="success" size="tiny" @click="handleBuy" :disabled="isBuyDisabled">📈 Buy</n-button>
            <n-button type="error" size="tiny" @click="handleSell" :disabled="isSellDisabled">📉 Sell</n-button>
          </div>
        </div>

        <div class="control-section">
          <span class="section-label">Lower Price</span>
          <div class="button-group">
            <n-button size="tiny" type="success" @click="() => updateLowerPriceForAll(0.01)">-1%</n-button>
            <n-button size="tiny" type="success" @click="() => updateLowerPriceForAll(0.02)">-2%</n-button>
            <n-button size="tiny" type="success" @click="() => updateLowerPriceForAll(0.1)">-10%</n-button>
            <n-button size="tiny" type="success" @click="() => updateLowerPriceForAll(0.2)">-20%</n-button>
            <n-button size="tiny" type="success" @click="() => updateLowerPriceForAll(0.5)">-50%</n-button>
            <n-button size="tiny" type="success" @click="() => updateLowerPriceForAll(0.97)">-97%</n-button>
            <n-button size="tiny" type="success" @click="() => updateLowerPriceForAll(0.98)">-98%</n-button>
          </div>
        </div>

        <div class="control-section">
          <span class="section-label">Upper Price</span>
          <div class="button-group">
            <n-button size="tiny" type="error" @click="() => updateUpperPriceForAll(0.01)">1x</n-button>
            <n-button size="tiny" type="error" @click="() => updateUpperPriceForAll(0.02)">2x</n-button>
            <n-button size="tiny" type="error" @click="() => updateUpperPriceForAll(0.1)">10x</n-button>
            <n-button size="tiny" type="error" @click="() => updateUpperPriceForAll(0.2)">20x</n-button>
            <n-button size="tiny" type="error" @click="() => updateUpperPriceForAll(0.5)">50x</n-button>
            <n-button size="tiny" type="error" @click="() => updateUpperPriceForAll(1.0)">100x</n-button>
            <n-button size="tiny" type="error" @click="() => updateUpperPriceForAll(2.0)">200x</n-button>
          </div>
        </div>

        <div class="control-section">
          <span class="section-label">Amount</span>
          <div class="button-group">
            <n-button size="tiny" type="info" @click="() => setAmount(1)">1</n-button>
            <n-button size="tiny" type="info" @click="() => setAmount(5)">5</n-button>
            <n-button size="tiny" type="info" @click="() => setAmount(10)">10</n-button>
            <n-button size="tiny" type="info" @click="() => setAmount(50)">50</n-button>
            <n-button size="tiny" type="info" @click="() => setAmount(100)">100</n-button>
          </div>
        </div>

        <div class="control-section">
          <span class="section-label">Grids</span>
          <div class="button-group">
            <n-button size="tiny" @click="() => setNrOfGrids(5)">5</n-button>
            <n-button size="tiny" @click="() => setNrOfGrids(10)">10</n-button>
            <n-button size="tiny" @click="() => setNrOfGrids(20)">20</n-button>
            <n-button size="tiny" @click="() => setNrOfGrids(50)">50</n-button>
            <n-button size="tiny" @click="() => setNrOfGrids(100)">100</n-button>
          </div>
        </div>
      </div>

      <!-- Config Row -->
      <div class="control-row" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #2a3441;">
        <div class="control-section" style="flex: 1;">
          <span class="section-label">⚙️ Config</span>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 9px; color: #10eb04; font-weight: 600;">📈 Inc % Buy</label>
              <n-input v-model:value="incrementalPercentAmountBuy" size="tiny" placeholder="1.0" style="width: 85px; --n-border: 1px solid rgba(16, 235, 4, 0.3); --n-border-hover: 1px solid rgba(16, 235, 4, 0.5); --n-border-focus: 1px solid #10eb04;" />
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 9px; color: #eb0404; font-weight: 600;">📉 Inc % Sell</label>
              <n-input v-model:value="incrementalPercentAmountSell" size="tiny" placeholder="1.0" style="width: 85px; --n-border: 1px solid rgba(235, 4, 4, 0.3); --n-border-hover: 1px solid rgba(235, 4, 4, 0.5); --n-border-focus: 1px solid #eb0404;" />
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 9px; color: #10eb04; font-weight: 600;">📈 Dev Price Buy</label>
              <n-input v-model:value="deviationPriceBuy" size="tiny" placeholder="1.0" style="width: 85px; --n-border: 1px solid rgba(16, 235, 4, 0.3); --n-border-hover: 1px solid rgba(16, 235, 4, 0.5); --n-border-focus: 1px solid #10eb04;" />
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 9px; color: #eb0404; font-weight: 600;">📉 Dev Price Sell</label>
              <n-input v-model:value="deviationPriceSell" size="tiny" placeholder="1.0" style="width: 85px; --n-border: 1px solid rgba(235, 4, 4, 0.3); --n-border-hover: 1px solid rgba(235, 4, 4, 0.5); --n-border-focus: 1px solid #eb0404;" />
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 9px; color: #10eb04; font-weight: 600;">📈 Dev Amt Buy</label>
              <n-input v-model:value="deviationAmountBuy" size="tiny" placeholder="0.9" style="width: 85px; --n-border: 1px solid rgba(16, 235, 4, 0.3); --n-border-hover: 1px solid rgba(16, 235, 4, 0.5); --n-border-focus: 1px solid #10eb04;" />
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-size: 9px; color: #eb0404; font-weight: 600;">📉 Dev Amt Sell</label>
              <n-input v-model:value="deviationAmountSell" size="tiny" placeholder="0.9" style="width: 85px; --n-border: 1px solid rgba(235, 4, 4, 0.3); --n-border-hover: 1px solid rgba(235, 4, 4, 0.5); --n-border-focus: 1px solid #eb0404;" />
            </div>
            <div style="display: flex; align-items: flex-end;">
              <n-button type="primary" size="tiny" @click="saveConfiguration">💾 Save</n-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Saved & Strategies Row -->
      <div class="control-row" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #2a3441;">
        <div class="control-section" style="flex: 1;">
          <span class="section-label">💾 Saved Configs</span>
          <div class="saved-list-inline">
            <div v-if="savedConfigurations.length === 0" style="font-size: 10px; color: #666;">No saved configs</div>
            <div v-for="(config, index) in savedConfigurations" :key="index" class="saved-item-inline">
              <span class="saved-name">{{ config.name }}</span>
              <div style="display: flex; gap: 4px;">
                <n-button size="tiny" @click="applyConfiguration(config)">Apply</n-button>
                <n-button v-if="!config.isDefault" size="tiny" type="error" @click="deleteConfiguration(index)">×</n-button>
              </div>
            </div>
          </div>
        </div>

        <div class="control-section" style="flex: 1; border-left: 1px solid #2a3441; padding-left: 12px; margin-left: 12px;">
          <span class="section-label">🎯 Strategies</span>
          <!-- Strategy Form -->
          <div v-if="showStrategyForm" class="strategy-form" style="margin-top: 8px;">
            <n-input
              v-model:value="newStrategyName"
              size="tiny"
              placeholder="Strategy name"
              style="margin-bottom: 4px;"
            />
            <n-input
              v-model:value="newStrategyDescription"
              size="tiny"
              placeholder="Description (optional)"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              style="margin-bottom: 4px;"
            />
            <div style="display: flex; gap: 4px;">
              <n-button type="primary" size="tiny" @click="saveStrategy" style="flex: 1; font-size: 8px; height: 18px; padding: 0 6px; line-height: 1;">
                💾 Save
              </n-button>
              <n-button size="tiny" @click="showStrategyForm = false; newStrategyName = ''; newStrategyDescription = '';" style="font-size: 8px; height: 18px; padding: 0 6px; line-height: 1;">
                ✕
              </n-button>
            </div>
            <div class="strategy-info">
              <small>📝 Saves: Config + Pairs + Price %</small>
            </div>
          </div>

          <!-- Strategy List -->
          <div v-if="!showStrategyForm" style="margin-top: 8px;">
            <n-button
              type="success"
              size="tiny"
              block
              @click="showStrategyForm = true"
              style="margin-bottom: 6px; font-size: 8px; height: 18px; padding: 0 6px; line-height: 1;"
            >
              ➕ New Strategy
            </n-button>

            <div v-if="loadingStrategies" style="text-align: center; padding: 8px;">
              <n-spin size="small" />
            </div>

            <div v-else-if="strategies.length === 0" style="font-size: 10px; color: #666;">
              <small>No strategies yet</small>
            </div>

            <div v-else style="display: flex; flex-direction: column; gap: 6px;">
              <div v-for="strategy in strategies" :key="strategy._id" class="strategy-item">
                <div class="strategy-header">
                  <span class="strategy-name" :title="strategy.description">
                    {{ strategy.name }}
                  </span>
                  <div class="strategy-actions">
                    <n-button size="tiny" type="info" @click="applyStrategy(strategy)" title="Apply strategy">
                      ▶
                    </n-button>
                    <n-button size="tiny" type="error" @click="deleteStrategy(strategy._id)" title="Delete strategy">
                      🗑
                    </n-button>
                  </div>
                </div>
                <div class="strategy-meta">
                  <small class="strategy-pairs">
                    {{ strategy.pairs.length }} pair{{ strategy.pairs.length !== 1 ? 's' : '' }}
                  </small>
                  <small class="strategy-date">
                    {{ new Date(strategy.createdAt).toLocaleDateString() }}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    
    <!-- Investment Preview Panel -->
    <div class="investment-preview" v-if="marketForms.length > 0">
      <div class="preview-header" @click="showInvestmentPreview = !showInvestmentPreview" style="cursor: pointer;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="preview-title">💰 Investment Preview</span>
          <span style="font-size: 12px; color: #666;">{{ showInvestmentPreview ? '▼' : '▶' }}</span>
        </div>
        <span class="preview-summary">
          {{ marketForms.length }} bot{{ marketForms.length !== 1 ? 's' : '' }} •
          {{ grandTotals.totalOrders }} orders •
          ${{ grandTotals.totalInvestment.toFixed(2) }} total
        </span>
      </div>

      <!-- Tabs: Per Bot vs Total Strategy -->
      <transition name="slide-fade">
      <div v-show="showInvestmentPreview">
      <n-tabs type="line" size="small" animated style="margin-top: 8px;">
        <!-- TAB 1: PER BOT VIEW -->
        <n-tab-pane name="perBot" :tab="`🤖 Per Bot (${marketForms.length})`">
          <div class="preview-grid">
            <div
              v-for="(preview, index) in investmentPreview"
              :key="index"
              class="preview-card clickable"
              @click="() => openBotOrdersModal(preview, index)"
              :title="`Click to view ${preview.ordersCount} orders details`"
            >
              <div class="preview-card-header">
                <span class="preview-symbol">{{ preview.symbol }}</span>
                <span class="preview-orders">{{ preview.ordersCount }} orders 🔍</span>
              </div>
              <div class="preview-card-body">
                <div class="preview-stat">
                  <span class="preview-label">Base Amount</span>
                  <span class="preview-value">{{ preview.totalBase.toFixed(4) }} {{ preview.baseCurrency }}</span>
                </div>
                <div class="preview-stat">
                  <span class="preview-label">Quote Investment</span>
                  <span class="preview-value">${{ preview.totalInvestment.toFixed(2) }} {{ preview.quoteCurrency }}</span>
                </div>
                <div class="preview-stat">
                  <span class="preview-label">Avg Price</span>
                  <span class="preview-value">${{ preview.avgPrice.toFixed(6) }}</span>
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <!-- TAB 2: TOTAL STRATEGY VIEW -->
        <n-tab-pane name="totalStrategy" tab="📊 Total Strategie">
          <div style="padding: 12px;">
            <!-- Grand Total Header -->
            <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%); padding: 16px; border-radius: 8px; border: 2px solid rgba(99, 102, 241, 0.4); margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div style="font-size: 16px; color: #6366f1; font-weight: 700;">🎯 VALOARE TOTALĂ STRATEGIE</div>
                <div style="font-size: 24px; color: #ffd93d; font-weight: 900;">${{ grandTotals.totalInvestment.toFixed(2) }}</div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; font-size: 12px; color: #888;">
                <div>📦 <span style="color: #a78bfa; font-weight: 600;">{{ marketForms.length }}</span> bots</div>
                <div>📋 <span style="color: #10eb04; font-weight: 600;">{{ grandTotals.totalOrders }}</span> orders</div>
                <div>💵 <span style="color: #ffd93d; font-weight: 600;">${{ grandTotals.totalInvestment.toFixed(2) }}</span> total investment</div>
              </div>
            </div>

            <!-- Buy/Sell Breakdown Across All Bots -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
              <!-- BUY TOTALS -->
              <div style="background: rgba(16, 235, 4, 0.08); padding: 14px; border-radius: 6px; border: 1px solid rgba(16, 235, 4, 0.3);">
                <div style="font-size: 13px; color: #10eb04; margin-bottom: 10px; font-weight: 700; border-bottom: 1px solid rgba(16, 235, 4, 0.2); padding-bottom: 6px;">
                  📈 TOTAL BUY ORDERS (toate boturile)
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <div style="display: flex; justify-content: space-between; font-size: 11px;">
                    <span style="color: #888;">Număr ordine:</span>
                    <span style="color: #10eb04; font-weight: 700;">{{ grandTotals.buyOrders }}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 11px;">
                    <span style="color: #888;">Investiție (USDC):</span>
                    <span style="color: #10eb04; font-weight: 700;">${{ grandTotals.buyInvestment.toFixed(2) }}</span>
                  </div>
                  <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(16, 235, 4, 0.2); font-size: 10px; color: #888; font-style: italic;">
                    💡 Capital necesar pentru toate ordinele de cumpărare
                  </div>
                </div>
              </div>

              <!-- SELL TOTALS -->
              <div style="background: rgba(235, 4, 4, 0.08); padding: 14px; border-radius: 6px; border: 1px solid rgba(235, 4, 4, 0.3);">
                <div style="font-size: 13px; color: #eb0404; margin-bottom: 10px; font-weight: 700; border-bottom: 1px solid rgba(235, 4, 4, 0.2); padding-bottom: 6px;">
                  📉 TOTAL SELL ORDERS (toate boturile)
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <div style="display: flex; justify-content: space-between; font-size: 11px;">
                    <span style="color: #888;">Număr ordine:</span>
                    <span style="color: #eb0404; font-weight: 700;">{{ grandTotals.sellOrders }}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 11px;">
                    <span style="color: #888;">Primești (USDC):</span>
                    <span style="color: #eb0404; font-weight: 700;">${{ grandTotals.sellValue.toFixed(2) }}</span>
                  </div>
                  <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(235, 4, 4, 0.2);">
                    <div style="font-size: 10px; color: #888; margin-bottom: 4px; font-weight: 600;">Necesită:</div>
                    <div
                      v-for="(amount, currency) in grandTotals.totalBaseAmounts"
                      :key="currency"
                      style="font-size: 10px; color: #eb0404; font-weight: 700;"
                    >
                      • {{ amount.toFixed(4) }} {{ currency }}
                    </div>
                  </div>
                  <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(235, 4, 4, 0.2); font-size: 10px; color: #888; font-style: italic;">
                    💰 Câți coins trebuie să deții pentru sell orders
                  </div>
                </div>
              </div>
            </div>

            <!-- REQUIREMENTS FOR ENTIRE STRATEGY -->
            <div style="background: #1a1f2e; padding: 16px; border-radius: 6px; border: 1px solid #2a3441;">
              <div style="font-size: 14px; color: #6366f1; margin-bottom: 12px; font-weight: 700;">
                🎯 NECESARE PENTRU TOATĂ STRATEGIA:
              </div>

              <div style="display: flex; flex-direction: column; gap: 12px;">
                <!-- CAPITAL TOTAL -->
                <div style="background: rgba(99, 102, 241, 0.05); padding: 12px; border-radius: 4px; border-left: 3px solid #6366f1;">
                  <div style="font-size: 12px; color: #6366f1; font-weight: 700; margin-bottom: 8px;">💰 Capital Total Necesar</div>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="font-size: 11px; color: #888;">
                      • Pentru toate BUY orders:
                      <span style="color: #10eb04; font-weight: 700;">${{ grandTotals.buyInvestment.toFixed(2) }} USDC</span>
                    </div>
                    <div style="font-size: 11px; color: #888;">
                      • Pentru toate SELL orders (necesită coins):
                    </div>
                    <div style="margin-left: 12px;">
                      <div
                        v-for="(amount, currency) in grandTotals.totalBaseAmounts"
                        :key="currency"
                        style="font-size: 11px; color: #eb0404; font-weight: 700;"
                      >
                        - {{ amount.toFixed(4) }} {{ currency }}
                      </div>
                    </div>
                    <div style="font-size: 11px; color: #888; margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(99, 102, 241, 0.2);">
                      • <strong>TOTAL MINIM (doar BUY):</strong>
                      <span style="color: #ffd93d; font-weight: 700; font-size: 13px;">${{ grandTotals.buyInvestment.toFixed(2) }} USDC</span>
                    </div>
                    <div style="font-size: 10px; color: #666; font-style: italic; margin-top: 4px;">
                      💡 Plus deținerea monedelor pentru SELL orders (vezi lista de mai sus)
                    </div>
                  </div>
                </div>

                <!-- API KEYS -->
                <div style="background: rgba(16, 235, 4, 0.05); padding: 12px; border-radius: 4px; border-left: 3px solid #10eb04;">
                  <div style="font-size: 12px; color: #10eb04; font-weight: 700; margin-bottom: 8px;">🔑 API Keys</div>
                  <div style="font-size: 11px; color: #888;">
                    • Ai nevoie de API Key(s) cu permisiuni TRADING pentru exchange-ul selectat
                  </div>
                  <div style="font-size: 11px; color: #888;">
                    • Total {{ marketForms.length }} bot{{ marketForms.length !== 1 ? 's' : '' }} vor folosi acest/aceste API Key(s)
                  </div>
                </div>

                <!-- BALANCE RECOMANDAT -->
                <div style="background: rgba(255, 217, 61, 0.05); padding: 12px; border-radius: 4px; border-left: 3px solid #ffd93d;">
                  <div style="font-size: 12px; color: #ffd93d; font-weight: 700; margin-bottom: 8px;">💵 Balance Recomandat (cu 10% rezervă)</div>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="font-size: 11px; color: #888;">
                      • USDC:
                      <span style="color: #ffd93d; font-weight: 700;">${{ (grandTotals.totalInvestment * 1.1).toFixed(2) }}</span>
                    </div>
                    <div style="font-size: 10px; color: #666; font-style: italic; margin-top: 4px;">
                      💡 Include 10% rezervă pentru siguranță și fluctuații de piață
                    </div>
                  </div>
                </div>

                <!-- PROFIT ESTIMAT TOTAL -->
                <div style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%); padding: 12px; border-radius: 4px; border-left: 3px solid #a855f7;">
                  <div style="font-size: 12px; color: #a855f7; font-weight: 700; margin-bottom: 8px;">💰 Profit Estimat (dacă toate ordinele se execută)</div>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px;">
                    <div>
                      <div style="font-size: 10px; color: #888;">Investit (Buy):</div>
                      <div style="font-size: 12px; color: #10eb04; font-weight: 700;">${{ grandTotals.buyInvestment.toFixed(2) }}</div>
                    </div>
                    <div>
                      <div style="font-size: 10px; color: #888;">Primit (Sell):</div>
                      <div style="font-size: 12px; color: #eb0404; font-weight: 700;">${{ grandTotals.sellValue.toFixed(2) }}</div>
                    </div>
                    <div>
                      <div style="font-size: 10px; color: #888;">Profit Brut:</div>
                      <div style="font-size: 12px; font-weight: 700;"
                        :style="{ color: (grandTotals.sellValue - grandTotals.buyInvestment) > 0 ? '#10eb04' : '#eb0404' }"
                      >
                        ${{ (grandTotals.sellValue - grandTotals.buyInvestment).toFixed(2) }}
                        <span style="font-size: 10px;">
                          ({{ (((grandTotals.sellValue - grandTotals.buyInvestment) / grandTotals.buyInvestment) * 100).toFixed(2) }}%)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(168, 85, 247, 0.2); font-size: 10px; color: #888; font-style: italic;">
                    ⚠️ Estimare teoretică. Nu include comisioane exchange și presupune execuția completă a strategiei.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>
      </div>
      </transition>
    </div>

   
    <!-- Grid Orders Detail Modal -->
    <n-modal
      v-model:show="showGridOrdersModal"
      preset="card"
      :style="{ width: '90%', maxWidth: '1200px', maxHeight: '90vh' }"
      title="Grid Orders Preview"
      :bordered="false"
      size="huge"
      :segmented="{
        content: 'soft',
        footer: 'soft'
      }"
    >
      <template #header>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 18px; font-weight: 700;">📊 Grid Orders Preview</span>
          <n-tag v-if="selectedBotForOrders" type="success" size="small">
            {{ selectedBotForOrders.symbol }}
          </n-tag>
          <n-tag v-if="selectedBotForOrders" type="info" size="small">
            {{ selectedBotOrders.length }} orders
          </n-tag>
        </div>
      </template>

      <div v-if="selectedBotForOrders" style="padding: 12px;">
        <!-- Tabs -->
        <n-tabs type="line" animated size="small">
          <!-- TAB 1: STATISTICS -->
          <n-tab-pane name="stats" tab="📊 Statistici">
            <!-- Summary Stats -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px;">
              <div style="background: #1a1f2e; padding: 12px; border-radius: 4px; border: 1px solid #2a3441;">
                <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Symbol</div>
                <div style="font-size: 16px; font-weight: 700; color: #6366f1;">{{ selectedBotForOrders.symbol }}</div>
              </div>
              <div style="background: #1a1f2e; padding: 12px; border-radius: 4px; border: 1px solid #2a3441;">
                <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Price Range</div>
                <div style="font-size: 14px; font-weight: 600; color: #10eb04;">${{ selectedBotForOrders.lowerPrice.toFixed(6) }} - ${{ selectedBotForOrders.upperPrice.toFixed(6) }}</div>
              </div>
              <div style="background: #1a1f2e; padding: 12px; border-radius: 4px; border: 1px solid #2a3441;">
                <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Current Price</div>
                <div style="font-size: 14px; font-weight: 600; color: #ffd93d;">${{ selectedBotForOrders.currentPrice?.toFixed(6) || '0.000000' }}</div>
              </div>
              <div style="background: #1a1f2e; padding: 12px; border-radius: 4px; border: 1px solid #2a3441;">
                <div style="font-size: 11px; color: #888; margin-bottom: 4px;">Total Orders</div>
                <div style="font-size: 14px; font-weight: 600; color: #a78bfa;">{{ selectedBotOrders.length }} orders</div>
              </div>
            </div>

            <!-- Buy/Sell Detailed Stats (shown when ordersSide = both) -->
            <div
              v-if="selectedBotForOrders.ordersSide === 'buyOrSell'"
              style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;"
            >
              <!-- BUY PANEL -->
              <div style="background: rgba(16, 235, 4, 0.08); padding: 14px; border-radius: 6px; border: 1px solid rgba(16, 235, 4, 0.3);">
                <div style="font-size: 13px; color: #10eb04; margin-bottom: 10px; font-weight: 700; border-bottom: 1px solid rgba(16, 235, 4, 0.2); padding-bottom: 6px;">
                  📈 BUY ORDERS (Cumpără)
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <div style="display: flex; justify-content: space-between; font-size: 11px;">
                    <span style="color: #888;">Număr ordine:</span>
                    <span style="color: #10eb04; font-weight: 700;">{{ selectedBotOrders.filter(o => o.side === 'buy').length }}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 11px;">
                    <span style="color: #888;">Investiție ({{ selectedBotForOrders.quoteCurrency }}):</span>
                    <span style="color: #10eb04; font-weight: 700;">${{ selectedBotOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + o.total, 0).toFixed(2) }}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 11px;">
                    <span style="color: #888;">Cumpără ({{ selectedBotForOrders.baseCurrency }}):</span>
                    <span style="color: #10eb04; font-weight: 700;">{{ selectedBotOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + o.amount, 0).toFixed(4) }}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 11px;">
                    <span style="color: #888;">Preț mediu:</span>
                    <span style="color: #10eb04; font-weight: 700;">
                      ${{ (selectedBotOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + o.total, 0) /
                           selectedBotOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + o.amount, 0)).toFixed(6) }}
                    </span>
                  </div>
                  <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(16, 235, 4, 0.2); font-size: 10px; color: #888; font-style: italic;">
                    💡 Când cumperi {{ selectedBotOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + o.amount, 0).toFixed(2) }} {{ selectedBotForOrders.baseCurrency }}
                    cu ${{ selectedBotOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + o.total, 0).toFixed(2) }}
                  </div>
                </div>
              </div>

              <!-- SELL PANEL -->
              <div style="background: rgba(235, 4, 4, 0.08); padding: 14px; border-radius: 6px; border: 1px solid rgba(235, 4, 4, 0.3);">
                <div style="font-size: 13px; color: #eb0404; margin-bottom: 10px; font-weight: 700; border-bottom: 1px solid rgba(235, 4, 4, 0.2); padding-bottom: 6px;">
                  📉 SELL ORDERS (Vinde)
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <div style="display: flex; justify-content: space-between; font-size: 11px;">
                    <span style="color: #888;">Număr ordine:</span>
                    <span style="color: #eb0404; font-weight: 700;">{{ selectedBotOrders.filter(o => o.side === 'sell').length }}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 11px;">
                    <span style="color: #888;">Primești ({{ selectedBotForOrders.quoteCurrency }}):</span>
                    <span style="color: #eb0404; font-weight: 700;">${{ selectedBotOrders.filter(o => o.side === 'sell').reduce((sum, o) => sum + o.total, 0).toFixed(2) }}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 11px;">
                    <span style="color: #888;">Vinzi ({{ selectedBotForOrders.baseCurrency }}):</span>
                    <span style="color: #eb0404; font-weight: 700;">{{ selectedBotOrders.filter(o => o.side === 'sell').reduce((sum, o) => sum + o.amount, 0).toFixed(4) }}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 11px;">
                    <span style="color: #888;">Preț mediu:</span>
                    <span style="color: #eb0404; font-weight: 700;">
                      ${{ (selectedBotOrders.filter(o => o.side === 'sell').reduce((sum, o) => sum + o.total, 0) /
                           selectedBotOrders.filter(o => o.side === 'sell').reduce((sum, o) => sum + o.amount, 0)).toFixed(6) }}
                    </span>
                  </div>
                  <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(235, 4, 4, 0.2); font-size: 10px; color: #888; font-style: italic;">
                    💰 Când vinzi {{ selectedBotOrders.filter(o => o.side === 'sell').reduce((sum, o) => sum + o.amount, 0).toFixed(2) }} {{ selectedBotForOrders.baseCurrency }}
                    primești ${{ selectedBotOrders.filter(o => o.side === 'sell').reduce((sum, o) => sum + o.total, 0).toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- PROFIT PANEL (when ordersSide = both) -->
            <div
              v-if="selectedBotForOrders.ordersSide === 'buyOrSell'"
              style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%); padding: 14px; border-radius: 6px; border: 1px solid rgba(99, 102, 241, 0.3);"
            >
              <div style="font-size: 13px; color: #a855f7; margin-bottom: 10px; font-weight: 700;">
                💰 PROFIT ESTIMAT (când toate ordinele se execută)
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
                <div>
                  <div style="font-size: 10px; color: #888; margin-bottom: 2px;">Total Investit (Buy):</div>
                  <div style="font-size: 13px; color: #10eb04; font-weight: 700;">
                    ${{ selectedBotOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + o.total, 0).toFixed(2) }}
                  </div>
                </div>
                <div>
                  <div style="font-size: 10px; color: #888; margin-bottom: 2px;">Total Primit (Sell):</div>
                  <div style="font-size: 13px; color: #eb0404; font-weight: 700;">
                    ${{ selectedBotOrders.filter(o => o.side === 'sell').reduce((sum, o) => sum + o.total, 0).toFixed(2) }}
                  </div>
                </div>
                <div>
                  <div style="font-size: 10px; color: #888; margin-bottom: 2px;">Profit Brut:</div>
                  <div style="font-size: 13px; font-weight: 700;"
                    :style="{
                      color: (selectedBotOrders.filter(o => o.side === 'sell').reduce((sum, o) => sum + o.total, 0) -
                             selectedBotOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + o.total, 0)) > 0
                             ? '#10eb04' : '#eb0404'
                    }"
                  >
                    ${{ (selectedBotOrders.filter(o => o.side === 'sell').reduce((sum, o) => sum + o.total, 0) -
                         selectedBotOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + o.total, 0)).toFixed(2) }}
                    <span style="font-size: 11px;">
                      ({{ (((selectedBotOrders.filter(o => o.side === 'sell').reduce((sum, o) => sum + o.total, 0) -
                             selectedBotOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + o.total, 0)) /
                            selectedBotOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + o.total, 0)) * 100).toFixed(2) }}%)
                    </span>
                  </div>
                </div>
              </div>
              <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(99, 102, 241, 0.2); font-size: 10px; color: #888; font-style: italic;">
                ⚠️ Profit estimat dacă toate ordinele BUY se execută, apoi toate ordinele SELL se execută. Nu include comisioane exchange.
              </div>
            </div>
          </n-tab-pane>

          <!-- TAB 2: REQUIREMENTS -->
          <n-tab-pane name="requirements" tab="💼 Necesare">
            <div style="background: #1a1f2e; padding: 16px; border-radius: 6px; border: 1px solid #2a3441;">
              <div style="font-size: 14px; color: #6366f1; margin-bottom: 12px; font-weight: 700;">
                🎯 De ce ai nevoie pentru a porni acest bot:
              </div>

              <div style="display: flex; flex-direction: column; gap: 12px;">
                <!-- CAPITAL NECESAR -->
                <div style="background: rgba(99, 102, 241, 0.05); padding: 12px; border-radius: 4px; border-left: 3px solid #6366f1;">
                  <div style="font-size: 12px; color: #6366f1; font-weight: 700; margin-bottom: 8px;">💰 Capital Necesar</div>
                  <div v-if="selectedBotForOrders.ordersSide === 'buyOrSell'" style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="font-size: 11px; color: #888;">
                      • Pentru BUY orders:
                      <span style="color: #10eb04; font-weight: 700;">
                        ${{ selectedBotOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + o.total, 0).toFixed(2) }} {{ selectedBotForOrders.quoteCurrency }}
                      </span>
                    </div>
                    <div style="font-size: 11px; color: #888;">
                      • Pentru SELL orders:
                      <span style="color: #eb0404; font-weight: 700;">
                        {{ selectedBotOrders.filter(o => o.side === 'sell').reduce((sum, o) => sum + o.amount, 0).toFixed(4) }} {{ selectedBotForOrders.baseCurrency }}
                      </span>
                    </div>
                    <div style="font-size: 11px; color: #888; margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(99, 102, 241, 0.2);">
                      • TOTAL necesar:
                      <span style="color: #ffd93d; font-weight: 700;">
                        ${{ selectedBotOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + o.total, 0).toFixed(2) }} {{ selectedBotForOrders.quoteCurrency }}
                        + {{ selectedBotOrders.filter(o => o.side === 'sell').reduce((sum, o) => sum + o.amount, 0).toFixed(4) }} {{ selectedBotForOrders.baseCurrency }}
                      </span>
                    </div>
                  </div>
                  <div v-else style="font-size: 11px; color: #888;">
                    Total necesar:
                    <span style="color: #ffd93d; font-weight: 700;">
                      ${{ selectedBotOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2) }} {{ selectedBotForOrders.quoteCurrency }}
                    </span>
                  </div>
                </div>

                <!-- API KEY -->
                <div style="background: rgba(16, 235, 4, 0.05); padding: 12px; border-radius: 4px; border-left: 3px solid #10eb04;">
                  <div style="font-size: 12px; color: #10eb04; font-weight: 700; margin-bottom: 8px;">🔑 API Key</div>
                  <div style="font-size: 11px; color: #888;">
                    • Ai nevoie de un API Key activ pentru exchange-ul selectat
                  </div>
                  <div style="font-size: 11px; color: #888;">
                    • Asigură-te că API Key are permisiuni de TRADING (buy + sell)
                  </div>
                </div>

                <!-- BALANCE -->
                <div style="background: rgba(255, 217, 61, 0.05); padding: 12px; border-radius: 4px; border-left: 3px solid #ffd93d;">
                  <div style="font-size: 12px; color: #ffd93d; font-weight: 700; margin-bottom: 8px;">💵 Balance Minim</div>
                  <div v-if="selectedBotForOrders.ordersSide === 'buyOrSell'" style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="font-size: 11px; color: #888;">
                      • {{ selectedBotForOrders.quoteCurrency }}:
                      <span style="color: #ffd93d; font-weight: 700;">
                        ${{ (selectedBotOrders.filter(o => o.side === 'buy').reduce((sum, o) => sum + o.total, 0) * 1.05).toFixed(2) }}
                      </span>
                      (cu 5% rezervă)
                    </div>
                    <div style="font-size: 11px; color: #888;">
                      • {{ selectedBotForOrders.baseCurrency }}:
                      <span style="color: #ffd93d; font-weight: 700;">
                        {{ (selectedBotOrders.filter(o => o.side === 'sell').reduce((sum, o) => sum + o.amount, 0) * 1.05).toFixed(4) }}
                      </span>
                      (cu 5% rezervă)
                    </div>
                  </div>
                  <div v-else style="font-size: 11px; color: #888;">
                    {{ selectedBotForOrders.quoteCurrency }}:
                    <span style="color: #ffd93d; font-weight: 700;">
                      ${{ (selectedBotOrders.reduce((sum, o) => sum + o.total, 0) * 1.05).toFixed(2) }}
                    </span>
                    (cu 5% rezervă)
                  </div>
                </div>

                <!-- MARKET CONDITIONS -->
                <div style="background: rgba(235, 4, 4, 0.05); padding: 12px; border-radius: 4px; border-left: 3px solid #eb0404;">
                  <div style="font-size: 12px; color: #eb0404; font-weight: 700; margin-bottom: 8px;">⚠️ Condiții de Piață</div>
                  <div style="font-size: 11px; color: #888;">
                    • Current price: <span style="color: #ffd93d; font-weight: 700;">${{ selectedBotForOrders.currentPrice?.toFixed(6) }}</span>
                  </div>
                  <div style="font-size: 11px; color: #888;">
                    • Range: <span style="color: #10eb04; font-weight: 700;">${{ selectedBotForOrders.lowerPrice.toFixed(6) }} - ${{ selectedBotForOrders.upperPrice.toFixed(6) }}</span>
                  </div>
                  <div style="font-size: 11px; color: #888; margin-top: 4px;">
                    💡 Verifică că current price este în range-ul grid-ului pentru profit optim
                  </div>
                </div>
              </div>
            </div>
          </n-tab-pane>

          <!-- TAB 3: ORDERS TABLE -->
          <n-tab-pane name="orders" tab="📋 Ordine ({{ selectedBotOrders.length }})">
            <!-- Orders Table -->
        <div style="max-height: 500px; overflow-y: auto; border: 1px solid #2a3441; border-radius: 4px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead style="position: sticky; top: 0; background: #1a1f2e; z-index: 1;">
              <tr>
                <th style="padding: 10px; text-align: left; color: #888; border-bottom: 2px solid #444;">#</th>
                <th style="padding: 10px; text-align: center; color: #888; border-bottom: 2px solid #444;">Side</th>
                <th style="padding: 10px; text-align: right; color: #6366f1; border-bottom: 2px solid #444;">Price</th>
                <th style="padding: 10px; text-align: right; color: #a78bfa; border-bottom: 2px solid #444;">Amount ({{ selectedBotForOrders.baseCurrency }})</th>
                <th style="padding: 10px; text-align: right; color: #ffd93d; border-bottom: 2px solid #444;">Total ({{ selectedBotForOrders.quoteCurrency }})</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(order, idx) in selectedBotOrders"
                :key="idx"
                style="border-bottom: 1px solid #2a3441;"
                :style="{
                  background: order.side === 'buy'
                    ? (idx % 2 === 0 ? 'rgba(16, 235, 4, 0.05)' : 'rgba(16, 235, 4, 0.08)')
                    : (idx % 2 === 0 ? 'rgba(235, 4, 4, 0.05)' : 'rgba(235, 4, 4, 0.08)')
                }"
              >
                <td style="padding: 8px; color: #666;">{{ idx + 1 }}</td>
                <td style="padding: 8px; text-align: center;">
                  <span
                    :style="{
                      color: order.side === 'buy' ? '#10eb04' : '#eb0404',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      textTransform: 'uppercase'
                    }"
                  >
                    {{ order.side === 'buy' ? '📈 BUY' : '📉 SELL' }}
                  </span>
                </td>
                <td
                  style="padding: 8px; text-align: right; font-family: monospace; font-weight: 600;"
                  :style="{ color: order.side === 'buy' ? '#10eb04' : '#eb0404' }"
                >
                  ${{ order.price.toFixed(8) }}
                </td>
                <td style="padding: 8px; text-align: right; color: #a78bfa; font-family: monospace;">
                  {{ order.amount.toFixed(8) }}
                </td>
                <td style="padding: 8px; text-align: right; color: #ffd93d; font-family: monospace; font-weight: 600;">
                  ${{ order.total.toFixed(8) }}
                </td>
              </tr>
            </tbody>
            <tfoot style="position: sticky; bottom: 0; background: #1e3a1e;">
              <tr style="border-top: 2px solid #444;">
                <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold; color: #10eb04;">
                  TOTAL ({{ selectedBotOrders.length }} orders):
                </td>
                <td style="padding: 12px; text-align: right; font-weight: bold; color: #a78bfa; font-family: monospace;">
                  {{ selectedBotOrders.reduce((sum, o) => sum + o.amount, 0).toFixed(4) }} {{ selectedBotForOrders.baseCurrency }}
                </td>
                <td style="padding: 12px; text-align: right; font-weight: bold; color: #ffd93d; font-family: monospace;">
                  ${{ selectedBotOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2) }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
          </n-tab-pane>
        </n-tabs>
      </div>

      <template #footer>
        <div style="display: flex; justify-content: flex-end;">
          <n-button @click="showGridOrdersModal = false">Close</n-button>
        </div>
      </template>
    </n-modal>

    <!-- Main Content with Sidebar -->
    <div class="content-wrapper" v-if="marketForms.length > 0">
   
      <!-- Main Table -->
      <div class="main-table">
        <table class="compact-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th style="color: #10eb04;">Bid</th>
              <th style="color: #eb0404;">Ask</th>
              <th>Spread</th>
              <th>Side</th>
              <th>Bot Name</th>
              <th style="color: #10eb04;">Lower Price</th>
              <th style="color: #eb0404;">Upper Price</th>
              <th>Amount</th>
              <th>Grids</th>
              <th colspan="3" style="background: #0f1419; border-left: 2px solid #2a3441;">
                <div style="display: flex; align-items: center; gap: 6px; padding: 4px;">
                  <span style="font-size: 10px; color: #888; font-weight: 600;">BULK:</span>
                  <n-button type="success" size="tiny" @click="() => setAllSides('buyOnly')" style="min-width: 60px; font-size: 10px;">
                    📈 Buy
                  </n-button>
                  <n-button type="error" size="tiny" @click="() => setAllSides('sellOnly')" style="min-width: 60px; font-size: 10px;">
                    📉 Sell
                  </n-button>
                  <n-button type="info" size="tiny" @click="() => setAllSides('buyOrSell')" style="min-width: 60px; font-size: 10px;">
                    🔄 Both
                  </n-button>
                  <span style="margin-left: 8px; font-size: 9px; color: #666; white-space: nowrap;">
                    {{ marketForms.filter(f => f.ordersSide === 'buyOnly').length }} Buy •
                    {{ marketForms.filter(f => f.ordersSide === 'sellOnly').length }} Sell •
                    {{ marketForms.filter(f => f.ordersSide === 'buyOrSell').length }} Both
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(marketForm, index) in marketForms" :key="index">
              <td><n-tag type="info" size="small" strong>{{ marketForm.symbol }}</n-tag></td>
              <td class="price-bid">{{ marketForm.bestBid || '-' }}</td>
              <td class="price-ask">{{ marketForm.bestAsk || '-' }}</td>
              <td class="price-spread" v-if="marketForm.bestBid && marketForm.bestAsk && !isNaN(parseFloat(marketForm.bestBid)) && !isNaN(parseFloat(marketForm.bestAsk))">
                {{ ((parseFloat(marketForm.bestAsk) - parseFloat(marketForm.bestBid)) / parseFloat(marketForm.bestBid) * 100).toFixed(3) }}%
              </td>
              <td v-else>-</td>
              <td>
                <n-select
                  v-model:value="marketForm.ordersSide"
                  :options="[
                    { label: '📈 Buy', value: 'buyOnly' },
                    { label: '📉 Sell', value: 'sellOnly' },
                    { label: '🔄 Both', value: 'buyOrSell' }
                  ]"
                  size="tiny"
                  style="width: 90px;"
                  @update:value="onIndividualSideChange"
                />
              </td>
              <td><n-input v-model:value="marketForm.name" size="tiny" placeholder="Bot name" /></td>
              <td>
                <n-input
                  v-model:value="marketForm.lowerPrice"
                  size="tiny"
                  placeholder="Lower"
                  style="--n-color: rgba(16, 235, 4, 0.1); --n-color-focus: rgba(16, 235, 4, 0.15); --n-text-color: #10eb04; --n-border: 1px solid rgba(16, 235, 4, 0.3); --n-border-hover: 1px solid rgba(16, 235, 4, 0.5); --n-border-focus: 1px solid #10eb04;"
                />
              </td>
              <td>
                <n-input
                  v-model:value="marketForm.upperPrice"
                  size="tiny"
                  placeholder="Upper"
                  style="--n-color: rgba(235, 4, 4, 0.1); --n-color-focus: rgba(235, 4, 4, 0.15); --n-text-color: #eb0404; --n-border: 1px solid rgba(235, 4, 4, 0.3); --n-border-hover: 1px solid rgba(235, 4, 4, 0.5); --n-border-focus: 1px solid #eb0404;"
                />
              </td>
              <td><n-input v-model:value="marketForm.amount" size="tiny" placeholder="Amount" /></td>
              <td><n-input v-model:value="marketForm.nrOfGrids" size="tiny" placeholder="Grids" /></td>
              <!-- Empty cells to match colspan in header -->
              <td style="border: none; background: transparent;"></td>
              <td style="border: none; background: transparent;"></td>
              <td style="border: none; background: transparent;"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Main Container */
.oneclick-container {
  padding: 8px;
  width: 100%;
  background: #0f1419;
  min-height: 100vh;
  font-size: 12px;
}

/* Investment Preview Panel */
.investment-preview {
  background: #1a1f2e;
  border: 1px solid #2a3441;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 6px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #2a3441;
}

.preview-title {
  font-size: 14px;
  font-weight: 600;
  color: #e0e0e0;
}

.preview-summary {
  font-size: 11px;
  color: #888;
  font-family: 'Courier New', monospace;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
}

/* Slide-fade transition for Investment Preview */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* Quick Actions Card */
.quick-actions-card {
  margin-bottom: 12px;
}

.actions-header:hover {
  border-color: #ffd93d !important;
  box-shadow: 0 2px 8px rgba(255, 217, 61, 0.2);
}

/* Unified Settings Card */
.unified-settings-card {
  margin-bottom: 12px;
}

.settings-header:hover {
  border-color: #a78bfa !important;
  box-shadow: 0 2px 8px rgba(167, 139, 250, 0.2);
}

.unified-section {
  margin-bottom: 8px;
}

.unified-section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  cursor: pointer;
  font-size: 12px;
}

.unified-section-title.collapsible:hover {
  opacity: 0.8;
}

/* Main Control Panel */
.main-control-panel {
  background: #0f1419;
  border: 1px solid #2a3441;
  border-radius: 3px;
  padding: 12px;
  margin-bottom: 12px;
}

.control-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.control-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-label {
  font-size: 10px;
  color: #888;
  font-weight: 600;
  text-transform: uppercase;
}

.button-group {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.saved-list-inline {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.saved-item-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(16, 235, 4, 0.05);
  padding: 4px 8px;
  border-radius: 3px;
  border: 1px solid rgba(16, 235, 4, 0.2);
}

.saved-item-inline .saved-name {
  font-size: 10px;
  color: #10eb04;
}

.preview-card {
  background: #0f1419;
  border: 1px solid #2a3441;
  border-radius: 3px;
  padding: 8px;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
}

.preview-card.clickable {
  cursor: pointer;
}

.preview-card:hover {
  border-color: #6366f1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.preview-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #2a3441;
}

.preview-symbol {
  font-size: 12px;
  font-weight: 700;
  color: #6366f1;
}

.preview-orders {
  font-size: 9px;
  color: #666;
  font-family: 'Courier New', monospace;
}

.preview-card-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
}

.preview-label {
  color: #888;
  font-weight: 500;
}

.preview-value {
  color: #4ade80;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

/* Compact Header */
.compact-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: #1a1f2e;
  border: 1px solid #2a3441;
  border-radius: 4px;
  margin-bottom: 6px;
}

/* Compact Fixed Header (Sticky) */
.compact-header-fixed {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #0f1419;
  border-bottom: 1px solid #2a3441;
  padding: 6px 12px;
  margin-bottom: 12px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #e0e0e0;
}

.header-title-small {
  font-size: 13px;
  font-weight: 600;
  color: #e0e0e0;
  white-space: nowrap;
}

.header-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Ticker Bar */
.ticker-bar {
  background: #1a1f2e;
  border: 1px solid #2a3441;
  border-radius: 4px;
  margin-bottom: 6px;
  padding: 6px 10px;
}

.ticker-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.ticker-scroll {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  flex: 1;
}

.ticker-item {
  display: flex;
  gap: 6px;
  align-items: center;
  white-space: nowrap;
  font-size: 11px;
}

.ticker-symbol {
  font-weight: 700;
  color: #6366f1;
  margin-right: 4px;
}

.ticker-bid {
  color: #4ade80;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.ticker-separator {
  color: #666;
}

.ticker-ask {
  color: #f87171;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.ticker-spread {
  color: #fbbf24;
  font-size: 10px;
  font-family: 'Courier New', monospace;
}

.ticker-actions {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-shrink: 0;
}

.action-separator {
  color: #666;
  margin: 0 4px;
  font-size: 12px;
}

/* Content Wrapper */
.content-wrapper {
  display: flex;
  gap: 8px;
}

/* Sidebar Config */
.sidebar-config {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-section {
  background: #1a1f2e;
  border: 1px solid #2a3441;
  border-radius: 4px;
  padding: 8px;
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  color: #888;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.section-title.collapsible {
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;
}

.section-title.collapsible:hover {
  color: #aaa;
}

.config-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  font-size: 10px;
}

.config-grid label {
  font-size: 9px;
  color: #888;
  font-weight: 600;
  margin-bottom: -4px;
}

.saved-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.saved-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 6px;
  background: #0f1419;
  border: 1px solid #2a3441;
  border-radius: 3px;
  font-size: 10px;
}

.saved-name {
  color: #ccc;
  font-weight: 500;
  font-size: 10px;
}

/* Main Table */
.main-table {
  flex: 1;
  overflow-x: auto;
}

.compact-table {
  width: 100%;
  border-collapse: collapse;
  background: #1a1f2e;
  border: 1px solid #2a3441;
  border-radius: 4px;
  font-size: 11px;
}

.compact-table thead {
  background: #0f1419;
}

.compact-table th {
  padding: 6px 8px;
  text-align: left;
  font-weight: 600;
  color: #888;
  border-bottom: 1px solid #2a3441;
  font-size: 10px;
  text-transform: uppercase;
}

.compact-table td {
  padding: 4px 6px;
  border-bottom: 1px solid #2a3441;
  color: #ccc;
}

.compact-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.price-bid {
  color: #10eb04 !important;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  font-size: 11px;
}

.price-ask {
  color: #eb0404 !important;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  font-size: 11px;
}

.price-spread {
  color: #fbbf24;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  font-size: 10px;
}

/* Strategies Section */
.strategies-section {
  max-height: 500px;
  overflow-y: auto;
}

.strategy-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.strategy-info {
  margin-top: 4px;
  padding: 4px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 3px;
  text-align: center;
}

.strategy-info small {
  color: #6366f1;
  font-size: 9px;
  font-weight: 600;
}

.empty-strategies {
  text-align: center;
  padding: 12px;
  color: #666;
  font-size: 10px;
}

.strategy-item {
  margin-bottom: 8px;
  padding: 6px;
  background: #0f1419;
  border: 1px solid #2a3441;
  border-radius: 3px;
  transition: border-color 0.2s;
}

.strategy-item:hover {
  border-color: #6366f1;
}

.strategy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.strategy-name {
  color: #e0e0e0;
  font-weight: 600;
  font-size: 11px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: help;
}

.strategy-actions {
  display: flex;
  gap: 3px;
}

.strategy-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  padding: 2px 0;
  border-bottom: 1px solid #2a3441;
}

.strategy-pairs {
  color: #6366f1;
  font-size: 9px;
  font-weight: 600;
}

.strategy-date {
  color: #666;
  font-size: 8px;
}

.strategy-pairs-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 4px;
}

.pair-badge {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 4px;
  background: rgba(99, 102, 241, 0.05);
  border-radius: 2px;
  font-size: 9px;
}

.pair-symbol {
  color: #6366f1;
  font-weight: 700;
  font-size: 9px;
}

.pair-percents {
  display: flex;
  gap: 3px;
  align-items: center;
  font-family: 'Courier New', monospace;
  font-size: 8px;
}

.percent-low {
  color: #f87171;
  font-weight: 600;
}

.percent-high {
  color: #4ade80;
  font-weight: 600;
}

.more-pairs {
  color: #666;
  font-size: 8px;
  text-align: center;
  padding: 2px;
  font-style: italic;
}

/* Scrollbar for strategies section */
.strategies-section::-webkit-scrollbar {
  width: 6px;
}

.strategies-section::-webkit-scrollbar-track {
  background: #0f1419;
  border-radius: 3px;
}

.strategies-section::-webkit-scrollbar-thumb {
  background: #2a3441;
  border-radius: 3px;
}

.strategies-section::-webkit-scrollbar-thumb:hover {
  background: #6366f1;
}
</style>
