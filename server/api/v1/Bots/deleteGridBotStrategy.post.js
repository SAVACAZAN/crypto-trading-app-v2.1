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

    // Find and delete strategy
    const result = await GridBotStrategy.findOneAndDelete({
      _id: strategyId,
      userId
    })

    if (!result) {
      return {
        success: false,
        message: 'Strategy not found'
      }
    }

    return {
      success: true,
      message: 'Strategy deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting GridBot strategy:', error)
    return {
      success: false,
      message: error.message
    }
  }
})
