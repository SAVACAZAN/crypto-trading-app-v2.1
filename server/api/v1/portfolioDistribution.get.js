import { portfolioDistributionSchema } from '~/server/models/portfolioDistribution.schema'
import { balanceSchema } from '~/server/models/balance.schema'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { userID, days = 30 } = query

    if (!userID) {
      return {
        success: false,
        error: 'userID is required'
      }
    }

    // Get historical distribution data
    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - parseInt(days))

    const distributions = await portfolioDistributionSchema.find({
      userID,
      date: { $gte: daysAgo }
    }).sort({ date: 1 }).lean()

    return {
      success: true,
      data: distributions,
      count: distributions.length
    }
  } catch (error) {
    console.error('Error fetching portfolio distribution:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
