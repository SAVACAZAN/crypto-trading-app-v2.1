import { defineEventHandler } from 'h3'
import SocialOAuth from '../../../models/socialOAuth.schema'
import SocialProfile from '../../../models/socialProfile.schema'
import { getUserId } from '../../../utils/getUserId'
import crypto from 'crypto'

// Decryption helper
const ENCRYPTION_KEY = process.env.SOCIAL_OAUTH_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
const IV_LENGTH = 16

function decrypt(text) {
  try {
    const parts = text.split(':')
    const iv = Buffer.from(parts.shift(), 'hex')
    const encryptedText = Buffer.from(parts.join(':'), 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
  } catch (error) {
    return '[DECRYPTION_ERROR]'
  }
}

export default defineEventHandler(async (event) => {
  try {
    const currentUserId = getUserId(event)

    // Get OAuth connections
    const oauthRecords = await SocialOAuth.find({ userId: currentUserId })

    // Get profile links
    const socialProfile = await SocialProfile.findOne({ userId: currentUserId })

    const connections = []

    for (const record of oauthRecords) {
      const credentialFields = []

      // Show what credential fields exist (not the values for security)
      if (record.credentials) {
        Object.keys(record.credentials).forEach(key => {
          const decryptedValue = decrypt(record.credentials[key])
          const maskedValue = decryptedValue.substring(0, 4) + '...' + decryptedValue.substring(decryptedValue.length - 4)
          credentialFields.push({
            field: key,
            hasValue: decryptedValue && decryptedValue !== '[DECRYPTION_ERROR]',
            preview: maskedValue
          })
        })
      }

      connections.push({
        platform: record.platform,
        isConnected: record.isConnected,
        connectedAt: record.connectedAt,
        hasCredentials: credentialFields.length > 0,
        credentialFields: credentialFields,
        userData: record.userData || null,
        profileLink: socialProfile?.profiles?.[record.platform] || null,
        hasAccessToken: !!record.accessToken,
        hasRefreshToken: !!record.refreshToken,
        tokenExpiresAt: record.tokenExpiresAt || null
      })
    }

    return {
      success: true,
      userId: currentUserId,
      totalConnections: connections.length,
      connections: connections.sort((a, b) => a.platform.localeCompare(b.platform)),
      explanation: {
        isConnected: 'TRUE = Credentials saved in database (encrypted)',
        hasCredentials: 'Shows how many credential fields are stored',
        hasAccessToken: 'TRUE = OAuth flow completed successfully',
        profileLink: 'Manually entered profile URL from Profile Links tab',
        userData: 'Automatically fetched data from platform (if OAuth completed)'
      }
    }

  } catch (error) {
    console.error('Error fetching social connections debug info:', error)
    return {
      success: false,
      message: 'Failed to fetch debug info',
      error: error.message
    }
  }
})
