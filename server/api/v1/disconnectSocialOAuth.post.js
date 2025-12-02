import { defineEventHandler, readBody } from 'h3'
import SocialOAuth from '../../models/socialOAuth.schema'
import { getUserIdFromBody } from '../../utils/getUserId'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { platform } = body

    const currentUserId = getUserIdFromBody(event, body)

    if (!platform) {
      return {
        success: false,
        message: 'Platform is required'
      }
    }

    // Delete OAuth record
    await SocialOAuth.findOneAndDelete({
      userId: currentUserId,
      platform
    })

    return {
      success: true,
      message: `${platform} disconnected successfully`
    }

  } catch (error) {
    console.error('Error disconnecting OAuth:', error)
    return {
      success: false,
      message: 'Failed to disconnect: ' + error.message
    }
  }
})
