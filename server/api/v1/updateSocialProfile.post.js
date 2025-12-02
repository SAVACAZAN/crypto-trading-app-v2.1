import { defineEventHandler, readBody } from 'h3'
import SocialProfile from '../../models/socialProfile.schema'
import { getUserIdFromBody } from '../../utils/getUserId'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { platform, url, profiles } = body

    const currentUserId = getUserIdFromBody(event, body)

    if (platform === 'all') {
      // Update all profiles at once
      const updatedProfile = await SocialProfile.findOneAndUpdate(
        { userId: currentUserId },
        {
          userId: currentUserId,
          profiles: profiles,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      )

      return {
        success: true,
        message: 'All social profiles updated successfully',
        profile: updatedProfile
      }
    } else {
      // Update single platform
      const updateField = `profiles.${platform}`
      const updatedProfile = await SocialProfile.findOneAndUpdate(
        { userId: currentUserId },
        {
          userId: currentUserId,
          [updateField]: url,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      )

      return {
        success: true,
        message: `${platform} profile updated successfully`,
        profile: updatedProfile
      }
    }
  } catch (error) {
    console.error('Error updating social profile:', error)
    return {
      success: false,
      message: 'Failed to update social profile',
      error: error.message
    }
  }
})
