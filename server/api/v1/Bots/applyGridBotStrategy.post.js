import GridBotStrategy from '~/server/models/gridBotStrategy.schema'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const userId = body.userID
    const strategyId = body.strategyId
    const currentPrices = body.currentPrices || []

    if (!userId) {
      return {
        success: false,
        message: 'User ID is required'
      }
    }

    if (!strategyId) {
      return {
        success: false,
        message: 'Strategy ID is required'
      }
    }

    // Find strategy
    const strategy = await GridBotStrategy.findOne({
      _id: strategyId,
      userId
    })

    if (!strategy) {
      return {
        success: false,
        message: 'Strategy not found'
      }
    }

    // Calculate actual prices based on current market prices
    const calculatedPairs = strategy.pairs.map((pair, index) => {
      // Use the first currentPrice provided by frontend (which contains the current market prices)
      // This allows applying strategies on ANY pair, not just the saved pair
      const currentPrice = currentPrices[0]

      if (!currentPrice || !currentPrice.bid || !currentPrice.ask) {
        return {
          symbol: pair.symbol,
          error: 'Current price not provided'
        }
      }

      const prices = strategy.calculatePrices(currentPrice.bid, currentPrice.ask, index)

      return {
        symbol: pair.symbol,
        exchange: pair.exchange,
        ordersSide: pair.ordersSide,
        lowerPrice: prices.lowerPrice,
        upperPrice: prices.upperPrice,
        lowerPricePercent: prices.lowerPricePercent,
        upperPricePercent: prices.upperPricePercent,
        amount: pair.amount,
        grids: pair.grids,
        amountType: pair.amountType,
        currentBid: currentPrice.bid,
        currentAsk: currentPrice.ask
      }
    })

    return {
      success: true,
      strategy: {
        _id: strategy._id,
        name: strategy.name,
        description: strategy.description,
        configName: strategy.configName,
        incBuy: strategy.incBuy,
        incSell: strategy.incSell,
        devPriceBuy: strategy.devPriceBuy,
        devPriceSell: strategy.devPriceSell,
        devAmtBuy: strategy.devAmtBuy,
        devAmtSell: strategy.devAmtSell,
        pairs: calculatedPairs
      }
    }
  } catch (error) {
    console.error('Error applying GridBot strategy:', error)
    return {
      success: false,
      message: error.message
    }
  }
})
