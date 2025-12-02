import OneClickStrategy from '~/server/models/oneClickStrategy.schema'

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
    const { name, description, configName, incBuy, incSell, devPriceBuy, devPriceSell, devAmtBuy, devAmtSell, pairs } = body

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
    const existingStrategy = await OneClickStrategy.findOne({ userId, name })
    if (existingStrategy) {
      return {
        success: false,
        message: 'Strategy with this name already exists'
      }
    }

    // Create new strategy
    const strategy = new OneClickStrategy({
      userId,
      name,
      description: description || '',
      configName: configName || 'Default',
      incBuy: incBuy || 1,
      incSell: incSell || 1,
      devPriceBuy: devPriceBuy || 1,
      devPriceSell: devPriceSell || 1,
      devAmtBuy: devAmtBuy || 0.9,
      devAmtSell: devAmtSell || 0.9,
      pairs: pairs.map(pair => ({
        symbol: pair.symbol,
        exchange: pair.exchange || 'coinbaseadvanced',
        ordersSide: pair.ordersSide || 'buyOrSell',
        lowerPricePercent: pair.lowerPricePercent || -20,
        upperPricePercent: pair.upperPricePercent || 1,
        amount: pair.amount || 1.1,
        grids: pair.grids || 10,
        referenceBid: pair.referenceBid,
        referenceAsk: pair.referenceAsk,
        lastUpdated: new Date()
      }))
    })

    await strategy.save()

    return {
      success: true,
      message: 'Strategy created successfully',
      strategy
    }
  } catch (error) {
    console.error('Error creating OneClick strategy:', error)
    return {
      success: false,
      message: error.message
    }
  }
})