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
   * Handles both ref objects and plain values in formData
   */
  function selectStrategy(formData, selectedStrategyId) {
    const strategy = strategiesList.value.find(s => s._id === selectedStrategyId);

    if (strategy && strategy.pairs && strategy.pairs.length > 0) {
      console.log('📌 Strategy selected:', strategy.name);
      const pair = strategy.pairs[0]; // Use first pair for grid bot

      // Helper to set form field values (handles both refs and plain values)
      const setFormField = (field, value) => {
        if (field && typeof field === 'object' && 'value' in field) {
          // It's a ref object
          field.value = value;
        } else if (field !== undefined) {
          // It's a plain value - try to update it, but this won't persist changes
          console.warn('⚠️ Form field is not a ref, cannot update:', field);
        }
      };

      // Load configuration from strategy
      setFormField(formData.name, strategy.name);
      setFormField(formData.lowerPrice, pair.lowerPrice || '');
      setFormField(formData.upperPrice, pair.upperPrice || '');
      setFormField(formData.amountType, pair.amountType || 'incrementalPercent');
      setFormField(formData.amount, pair.amount || '');
      setFormField(formData.nrOfGrids, pair.grids || '');
      setFormField(formData.ordersSide, pair.ordersSide || 'buyOrSell');
      setFormField(formData.incrementalPercentAmountBuy, strategy.incBuy || '');
      setFormField(formData.incrementalPercentAmountSell, strategy.incSell || '');
      setFormField(formData.deviationPriceBuy, strategy.devPriceBuy || '');
      setFormField(formData.deviationPriceSell, strategy.devPriceSell || '');
      setFormField(formData.deviationAmountBuy, strategy.devAmtBuy || '');
      setFormField(formData.deviationAmountSell, strategy.devAmtSell || '');
    }
  }

  /**
   * Add a new strategy with calculated percentage offsets from bid/ask
   */
  async function addStrategy(formData, currentExchange, currentSymbol, bestBid, bestAsk, userID) {
    try {
      console.log('💾 Saving strategy...');
      console.log('Strategy data:', { formData, currentExchange, currentSymbol, bestBid, bestAsk, userID });

      // Handle both ref objects and plain values for form data fields
      const getFormValue = (field) => field?.value ?? field;

      const lowerPriceValue = getFormValue(formData.lowerPrice);
      const upperPriceValue = getFormValue(formData.upperPrice);
      const nameValue = getFormValue(formData.name);
      const amountValue = getFormValue(formData.amount);
      const nrOfGridsValue = getFormValue(formData.nrOfGrids);
      const ordersSideValue = getFormValue(formData.ordersSide);
      const amountTypeValue = getFormValue(formData.amountType);
      const incBuyValue = getFormValue(formData.incrementalPercentAmountBuy);
      const incSellValue = getFormValue(formData.incrementalPercentAmountSell);
      const devPriceBuyValue = getFormValue(formData.deviationPriceBuy);
      const devPriceSellValue = getFormValue(formData.deviationPriceSell);
      const devAmtBuyValue = getFormValue(formData.deviationAmountBuy);
      const devAmtSellValue = getFormValue(formData.deviationAmountSell);

      // Validate required fields
      if (!lowerPriceValue || !upperPriceValue) {
        console.error('❌ Missing required fields: lowerPrice and/or upperPrice');
        return;
      }

      // Handle both ref objects and plain values for exchange/symbol
      const exchangeValue = currentExchange?.value || currentExchange;
      const symbolValue = currentSymbol?.value || currentSymbol;

      // Get actual market prices from bestBid/bestAsk
      const bid = parseFloat(bestBid) || 0;
      const ask = parseFloat(bestAsk) || 0;
      const lowerPrice = parseFloat(lowerPriceValue) || 0;
      const upperPrice = parseFloat(upperPriceValue) || 0;

      console.log('💹 Market Prices from Ticker:');
      console.log('  - bestBid:', bid);
      console.log('  - bestAsk:', ask);
      console.log('💹 User Configured Prices:');
      console.log('  - lowerPrice:', lowerPrice);
      console.log('  - upperPrice:', upperPrice);

      // Calculate percentage offsets from actual market bid/ask
      const lowerPricePercent = bid > 0 ? ((lowerPrice - bid) / bid * 100) : -20;
      const upperPricePercent = ask > 0 ? ((upperPrice - ask) / ask * 100) : 1;

      console.log('✍️ Form values extracted:');
      console.log('  - name:', nameValue);
      console.log('  - symbol:', symbolValue);
      console.log('  - exchange:', exchangeValue);
      console.log('  - amount:', amountValue);
      console.log('  - nrOfGrids:', nrOfGridsValue);

      const response = await $fetch('/api/v1/Bots/saveGridBotStrategy', {
        method: 'POST',
        body: {
          userID,
          name: nameValue,
          description: '',
          configName: 'Custom',
          incBuy: parseFloat(incBuyValue) || 1,
          incSell: parseFloat(incSellValue) || 1,
          devPriceBuy: parseFloat(devPriceBuyValue) || 1,
          devPriceSell: parseFloat(devPriceSellValue) || 1,
          devAmtBuy: parseFloat(devAmtBuyValue) || 0.9,
          devAmtSell: parseFloat(devAmtSellValue) || 0.9,
          pairs: [{
            symbol: symbolValue,
            exchange: exchangeValue,
            ordersSide: ordersSideValue || 'buyOrSell',
            lowerPrice: lowerPrice,
            upperPrice: upperPrice,
            amount: parseFloat(amountValue) || 1.1,
            grids: parseInt(nrOfGridsValue) || 10,
            amountType: amountTypeValue || 'incrementalPercent',
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
        console.log('📦 Pair data:', pair);

        return {
          name: response.strategy.name,
          lowerPrice: pair.lowerPrice ?? 0,
          upperPrice: pair.upperPrice ?? 0,
          amount: pair.amount ?? 0,
          nrOfGrids: pair.grids ?? 10,
          ordersSide: pair.ordersSide ?? 'buyOrSell',
          amountType: pair.amountType ?? 'incrementalPercent',
          incBuy: response.strategy.incBuy ?? 1,
          incSell: response.strategy.incSell ?? 1,
          devPriceBuy: response.strategy.devPriceBuy ?? 1,
          devPriceSell: response.strategy.devPriceSell ?? 1,
          devAmtBuy: response.strategy.devAmtBuy ?? 0.9,
          devAmtSell: response.strategy.devAmtSell ?? 0.9,
          bestBid: pair.currentBid ?? 0,
          bestAsk: pair.currentAsk ?? 0
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
