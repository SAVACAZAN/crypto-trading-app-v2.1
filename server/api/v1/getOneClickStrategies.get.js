import OneClickStrategy from '~/server/models/oneClickStrategy.schema'

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

    const strategies = await OneClickStrategy.getUserStrategies(userId)

    return {
      success: true,
      strategies
    }
  } catch (error) {
    console.error('Error fetching OneClick strategies:', error)
    return {
      success: false,
      message: error.message
    }
  }
})