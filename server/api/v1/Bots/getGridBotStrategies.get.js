import GridBotStrategy from '~/server/models/gridBotStrategy.schema'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userId = query.userID

    if (!userId) {
      return {
        success: false,
        message: 'User ID is required'
      }
    }

    // Get all strategies for this user
    const strategies = await GridBotStrategy.find({ userId }).sort({ createdAt: -1 })

    return {
      success: true,
      strategies: strategies || []
    }
  } catch (error) {
    console.error('Error fetching GridBot strategies:', error)
    return {
      success: false,
      message: error.message,
      strategies: []
    }
  }
})
