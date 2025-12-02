import { defineEventHandler, getQuery } from 'h3'
import SocialProfile from '../../models/socialProfile.schema'
import { getUserId } from '../../utils/getUserId'

export default defineEventHandler(async (event) => {
  try {
    const currentUserId = getUserId(event)

    const socialProfile = await SocialProfile.findOne({ userId: currentUserId })

    if (!socialProfile) {
      return {
        success: true,
        message: 'No social profiles found',
        profiles: {}
      }
    }

    return {
      success: true,
      profiles: socialProfile.profiles,
      updatedAt: socialProfile.updatedAt
    }
  } catch (error) {
    console.error('Error fetching social profile:', error)
    return {
      success: false,
      message: 'Failed to fetch social profile',
      error: error.message,
      profiles: {}
    }
  }
})
