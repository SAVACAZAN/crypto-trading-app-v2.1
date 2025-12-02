import { ref } from 'vue';

/**
 * Composable for Grid Bot Strategy Management
 * Uses database (MongoDB) with percentage-based pricing (like OneClick)
 */
export function useStrategyGridBot() {
  // Strategy variables
  const strategyPicker = ref();
  const strategyPickerOptions = ref([]);
  const strategiesList = ref([]);

  // Strategy config defaults
  const amountTypeOptions = [
    { value: 'quantityPerGrid', label: 'Qty Per Grid' },
    { value: 'totalAmount', label: 'Total Amount' },
    { value: 'incrementalPercent', label: 'Incremental Amount' }
  ];

  const ordersSideOptions = [
    { value: 'buyOrSell', label: 'Buy & Sell' },
    { value: 'buyOnly', label: 'Buy Only' },
    { value: 'sellOnly', label: 'Sell Only' }
  ];

  /**
   * Load all saved strategies from database
   */
  async function loadStrategies(userID) {
    if (!userID) {
      console.warn('⚠️ loadStrategies: userID is not provided');
      strategiesList.value = [];
      strategyPickerOptions.value = [];
      return;
    }

    try {
      const response = await $fetch('/api/v1/Bots/getGridBotStrategies', {
        query: { userID }
      });

      if (response.success && response.strategies) {
        strategiesList.value = response.strategies;
        strategyPickerOptions.value = response.strategies.map(s => ({
          value: s._id,
          label: s.name
        }));
        console.log('✅ GridBot Strategies loaded:', response.strategies.length);
      }
    } catch (error) {
      console.error('Error loading strategies:', error);
    }
  }

  /**
   * Select a strategy and load its parameters
   */
  function selectStrategy(formData, selectedStrategyId) {
    const strategy = strategiesList.value.find(s => s._id === selectedStrategyId);

    if (strategy && strategy.pairs && strategy.pairs.length > 0) {
      console.log('📌 Strategy selected:', strategy.name);
      const pair = strategy.pairs[0]; // Use first pair for grid bot

      // Load configuration from strategy
      formData.name.value = strategy.name;
      formData.lowerPrice.value = pair.lowerPrice || '';
      formData.upperPrice.value = pair.upperPrice || '';
      formData.amountType.value = pair.amountType || 'incrementalPercent';
      formData.amount.value = pair.amount || '';
      formData.nrOfGrids.value = pair.grids || '';
      formData.ordersSide.value = pair.ordersSide || 'buyOrSell';
      formData.incrementalPercentAmountBuy.value = strategy.incBuy || '';
      formData.incrementalPercentAmountSell.value = strategy.incSell || '';
      formData.deviationPriceBuy.value = strategy.devPriceBuy || '';
      formData.deviationPriceSell.value = strategy.devPriceSell || '';
      formData.deviationAmountBuy.value = strategy.devAmtBuy || '';
      formData.deviationAmountSell.value = strategy.devAmtSell || '';
    }
  }

  /**
   * Add a new strategy with calculated percentage offsets from bid/ask
   */
  async function addStrategy(formData, currentExchange, currentSymbol, bestBid, bestAsk, userID) {
    try {
      console.log('💾 Saving strategy...');

      // Calculate percentage offsets from bid/ask
      const bid = parseFloat(bestBid) || 0;
      const ask = parseFloat(bestAsk) || 0;
      const lowerPrice = parseFloat(formData.lowerPrice.value) || 0;
      const upperPrice = parseFloat(formData.upperPrice.value) || 0;

      const lowerPricePercent = bid > 0 ? ((lowerPrice - bid) / bid * 100) : -20;
      const upperPricePercent = ask > 0 ? ((upperPrice - ask) / ask * 100) : 1;

      const response = await $fetch('/api/v1/Bots/saveGridBotStrategy', {
        method: 'POST',
        body: {
          userID,
          name: formData.name.value,
          description: '',
          configName: 'Custom',
          incBuy: parseFloat(formData.incrementalPercentAmountBuy.value) || 1,
          incSell: parseFloat(formData.incrementalPercentAmountSell.value) || 1,
          devPriceBuy: parseFloat(formData.deviationPriceBuy.value) || 1,
          devPriceSell: parseFloat(formData.deviationPriceSell.value) || 1,
          devAmtBuy: parseFloat(formData.deviationAmountBuy.value) || 0.9,
          devAmtSell: parseFloat(formData.deviationAmountSell.value) || 0.9,
          pairs: [{
            symbol: currentSymbol.value,
            exchange: currentExchange.value,
            ordersSide: formData.ordersSide.value || 'buyOrSell',
            lowerPrice: lowerPrice,
            upperPrice: upperPrice,
            amount: parseFloat(formData.amount.value) || 1.1,
            grids: parseInt(formData.nrOfGrids.value) || 10,
            amountType: formData.amountType.value || 'incrementalPercent',
            bestBid: bid,
            bestAsk: ask
          }]
        }
      });

      if (response.success) {
        console.log('✅ Strategy added:', response.strategy.name);
        // Add to local list
        strategiesList.value.push(response.strategy);
        strategyPickerOptions.value.push({
          value: response.strategy._id,
          label: response.strategy.name
        });
        strategyPicker.value = response.strategy._id;
      } else {
        console.error('⚠️ Error adding strategy:', response.message);
      }
    } catch (error) {
      console.error('Error adding strategy:', error);
    }
  }

  /**
   * Apply a strategy (fetch current prices and calculate new prices)
   */
  async function applyStrategy(strategyId, currentExchange, currentSymbol, userID) {
    try {
      console.log('🚀 Applying strategy...');

      // Get current prices from market
      const orderBookResponse = await $fetch('/api/v1/fetchOrderBook', {
        query: {
          userID,
          exchange: currentExchange,
          symbol: currentSymbol
        }
      });

      const bid = orderBookResponse.data?.bids?.[0]?.[0] || 0;
      const ask = orderBookResponse.data?.asks?.[0]?.[0] || 0;

      // Apply strategy with current prices
      const response = await $fetch('/api/v1/Bots/applyGridBotStrategy', {
        method: 'POST',
        body: {
          userID,
          strategyId,
          currentPrices: [{
            symbol: currentSymbol,
            bid,
            ask
          }]
        }
      });

      if (response.success && response.strategy.pairs.length > 0) {
        const pair = response.strategy.pairs[0];
        console.log('✅ Strategy applied:', response.strategy.name);

        return {
          name: response.strategy.name,
          lowerPrice: pair.lowerPrice,
          upperPrice: pair.upperPrice,
          amount: pair.amount,
          nrOfGrids: pair.grids,
          ordersSide: pair.ordersSide,
          amountType: pair.amountType,
          incBuy: response.strategy.incBuy,
          incSell: response.strategy.incSell,
          devPriceBuy: response.strategy.devPriceBuy,
          devPriceSell: response.strategy.devPriceSell,
          devAmtBuy: response.strategy.devAmtBuy,
          devAmtSell: response.strategy.devAmtSell,
          bestBid: pair.currentBid,
          bestAsk: pair.currentAsk
        };
      } else {
        console.error('⚠️ Error applying strategy:', response.message);
        return null;
      }
    } catch (error) {
      console.error('Error applying strategy:', error);
      return null;
    }
  }

  /**
   * Delete a strategy
   */
  async function deleteStrategy(strategyId, userID) {
    try {
      console.log('🗑️ Deleting strategy...');

      const response = await $fetch('/api/v1/Bots/deleteGridBotStrategy', {
        method: 'POST',
        body: {
          userID,
          strategyId
        }
      });

      if (response.success) {
        console.log('✅ Strategy deleted');
        // Remove from local list
        strategiesList.value = strategiesList.value.filter(s => s._id !== strategyId);
        strategyPickerOptions.value = strategyPickerOptions.value.filter(o => o.value !== strategyId);
        strategyPicker.value = '';
      } else {
        console.error('⚠️ Error deleting strategy:', response.message);
      }
    } catch (error) {
      console.error('Error deleting strategy:', error);
    }
  }

  /**
   * Delete all strategies
   */
  async function deleteAllStrategies(userID) {
    try {
      console.log('🗑️ Deleting all strategies...');

      // Delete each strategy
      for (const strategy of strategiesList.value) {
        await deleteStrategy(strategy._id, userID);
      }

      strategiesList.value = [];
      strategyPickerOptions.value = [];
      strategyPicker.value = '';
      console.log('✅ All strategies deleted');
    } catch (error) {
      console.error('Error deleting all strategies:', error);
    }
  }

  return {
    strategyPicker,
    strategyPickerOptions,
    strategiesList,
    amountTypeOptions,
    ordersSideOptions,
    loadStrategies,
    selectStrategy,
    addStrategy,
    applyStrategy,
    deleteStrategy,
    deleteAllStrategies
  };
}
