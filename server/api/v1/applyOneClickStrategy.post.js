import OneClickStrategy from '~/server/models/oneClickStrategy.schema'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const userId = body.userID
    const { strategyId, currentPrices } = body

    if (!strategyId) {
      return {
        success: false,
        message: 'Strategy ID is required'
      }
    }

    if (!currentPrices || !Array.isArray(currentPrices)) {
      return {
        success: false,
        message: 'Current prices are required'
      }
    }

    // Find strategy
    const strategy = await OneClickStrategy.findOne({
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
      const currentPrice = currentPrices.find(p => p.symbol === pair.symbol)

      if (!currentPrice) {
        return {
          symbol: pair.symbol,
          error: 'Current price not provided'
        }
      }

      const prices = strategy.calculatePrices(currentPrice.bid, currentPrice.ask, index)

      return {
        symbol: pair.symbol,
        exchange: pair.exchange,
        lowerPrice: prices.lowerPrice,
        upperPrice: prices.upperPrice,
        lowerPricePercent: prices.lowerPricePercent,
        upperPricePercent: prices.upperPricePercent,
        amount: pair.amount,
        grids: pair.grids,
        currentBid: currentPrice.bid,
        currentAsk: currentPrice.ask
      }
    })

    return {
      success: true,
      strategy: {
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
    console.error('Error applying OneClick strategy:', error)
    return {
      success: false,
      message: error.message
    }
  }
})