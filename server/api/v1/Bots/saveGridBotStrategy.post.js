import GridBotStrategy from '~/server/models/gridBotStrategy.schema'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const userId = body.userID

    if (!userId) {
      return {
        success: false,
        message: 'User ID is required'
      }
    }

    const {
      name,
      description,
      configName,
      incBuy,
      incSell,
      devPriceBuy,
      devPriceSell,
      devAmtBuy,
      devAmtSell,
      pairs  // Array of pairs with symbol, exchange, ordersSide, lowerPrice, upperPrice, amount, grids, bestBid, bestAsk
    } = body

    if (!name) {
      return {
        success: false,
        message: 'Strategy name is required'
      }
    }

    if (!pairs || !Array.isArray(pairs) || pairs.length === 0) {
      return {
        success: false,
        message: 'At least one trading pair is required'
      }
    }

    // Check if strategy name already exists for this user
    const existingStrategy = await GridBotStrategy.findOne({ userId, name })
    if (existingStrategy) {
      return {
        success: false,
        message: 'Strategy with this name already exists'
      }
    }

    // Calculate percentage offsets from bid/ask (like OneClick)
    const calculatedPairs = pairs.map(pair => {
      const bid = parseFloat(pair.bestBid) || parseFloat(pair.referenceBid) || 0
      const ask = parseFloat(pair.bestAsk) || parseFloat(pair.referenceAsk) || 0

      // Use provided percentages if available, otherwise calculate from prices
      let lowerPricePercent = pair.lowerPricePercent
      let upperPricePercent = pair.upperPricePercent

      if (lowerPricePercent === undefined || upperPricePercent === undefined) {
        // Fallback: calculate from absolute prices
        const lowerPrice = parseFloat(pair.lowerPrice) || 0
        const upperPrice = parseFloat(pair.upperPrice) || 0

        lowerPricePercent = bid > 0 ? ((lowerPrice - bid) / bid * 100) : -20
        upperPricePercent = ask > 0 ? ((upperPrice - ask) / ask * 100) : 1
      }

      return {
        symbol: pair.symbol,
        exchange: pair.exchange || 'coinbaseadvanced',
        ordersSide: pair.ordersSide || 'buyOrSell',
        lowerPricePercent: parseFloat(lowerPricePercent.toFixed(2)),
        upperPricePercent: parseFloat(upperPricePercent.toFixed(2)),
        amount: parseFloat(pair.amount) || 1.1,
        grids: parseInt(pair.grids) || 10,
        amountType: pair.amountType || 'incrementalPercent',
        referenceBid: bid,
        referenceAsk: ask,
        lastUpdated: new Date()
      }
    })

    // Create new strategy
    const strategy = new GridBotStrategy({
      userId,
      name,
      description: description || '',
      configName: configName || 'Custom',
      incBuy: parseFloat(incBuy) || 1,
      incSell: parseFloat(incSell) || 1,
      devPriceBuy: parseFloat(devPriceBuy) || 1,
      devPriceSell: parseFloat(devPriceSell) || 1,
      devAmtBuy: parseFloat(devAmtBuy) || 0.9,
      devAmtSell: parseFloat(devAmtSell) || 0.9,
      pairs: calculatedPairs
    })

    await strategy.save()

    return {
      success: true,
      message: 'Strategy saved successfully',
      strategy
    }
  } catch (error) {
    console.error('Error saving GridBot strategy:', error)
    return {
      success: false,
      message: error.message
    }
  }
})
