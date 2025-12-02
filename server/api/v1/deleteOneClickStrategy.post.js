import OneClickStrategy from '~/server/models/oneClickStrategy.schema'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const userId = body.userID
    const { strategyId } = body

    if (!strategyId) {
      return {
        success: false,
        message: 'Strategy ID is required'
      }
    }

    // Find and delete strategy (only if it belongs to the user)
    const strategy = await OneClickStrategy.findOneAndDelete({
      _id: strategyId,
      userId
    })

    if (!strategy) {
      return {
        success: false,
        message: 'Strategy not found or you do not have permission to delete it'
      }
    }

    return {
      success: true,
      message: 'Strategy deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting OneClick strategy:', error)
    return {
      success: false,
      message: error.message
    }
  }
})