import GridBotStrategy from '~/server/models/gridBotStrategy.schema'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const userId = body.userID
    const strategyId = body.strategyId

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

    const {
      name,
      description,
      exchange,
      symbol,
      lowerPrice,
      upperPrice,
      amountType,
      amount,
      nrOfGrids,
      ordersSide,
      incrementalPercentAmountBuy,
      incrementalPercentAmountSell,
      deviationPriceBuy,
      deviationPriceSell,
      deviationAmountBuy,
      deviationAmountSell,
      usePriceGroup,
      priceGroupBuy,
      priceGroupSell
    } = body

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

    // Check if new name already exists (for different strategy)
    if (name && name !== strategy.name) {
      const existingStrategy = await GridBotStrategy.findOne({
        userId,
        name,
        _id: { $ne: strategyId }
      })
      if (existingStrategy) {
        return {
          success: false,
          message: 'Strategy with this name already exists'
        }
      }
    }

    // Update strategy
    if (name) strategy.name = name
    if (description !== undefined) strategy.description = description
    if (exchange) strategy.exchange = exchange
    if (symbol) strategy.symbol = symbol
    if (lowerPrice) strategy.lowerPrice = lowerPrice
    if (upperPrice) strategy.upperPrice = upperPrice
    if (amountType) strategy.amountType = amountType
    if (amount) strategy.amount = amount
    if (nrOfGrids) strategy.nrOfGrids = nrOfGrids
    if (ordersSide) strategy.ordersSide = ordersSide
    if (incrementalPercentAmountBuy !== undefined) strategy.incrementalPercentAmountBuy = incrementalPercentAmountBuy
    if (incrementalPercentAmountSell !== undefined) strategy.incrementalPercentAmountSell = incrementalPercentAmountSell
    if (deviationPriceBuy !== undefined) strategy.deviationPriceBuy = deviationPriceBuy
    if (deviationPriceSell !== undefined) strategy.deviationPriceSell = deviationPriceSell
    if (deviationAmountBuy !== undefined) strategy.deviationAmountBuy = deviationAmountBuy
    if (deviationAmountSell !== undefined) strategy.deviationAmountSell = deviationAmountSell
    if (usePriceGroup !== undefined) strategy.usePriceGroup = usePriceGroup
    if (priceGroupBuy !== undefined) strategy.priceGroupBuy = priceGroupBuy
    if (priceGroupSell !== undefined) strategy.priceGroupSell = priceGroupSell

    await strategy.save()

    return {
      success: true,
      message: 'Strategy updated successfully',
      strategy
    }
  } catch (error) {
    console.error('Error updating GridBot strategy:', error)
    return {
      success: false,
      message: error.message
    }
  }
})
