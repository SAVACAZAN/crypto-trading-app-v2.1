import { defineEventHandler, readBody } from 'h3'
import SocialOAuth from '../../models/socialOAuth.schema'
import crypto from 'crypto'
import { getUserIdFromBody } from '../../utils/getUserId'

// OAuth Configuration for each platform
const oauthConfigs = {
  facebook: {
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    scope: 'public_profile,email,pages_show_list,instagram_basic'
  },
  instagram: {
    authUrl: 'https://api.instagram.com/oauth/authorize',
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    scope: 'user_profile,user_media'
  },
  twitter: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scope: 'tweet.read users.read follows.read offline.access'
  },
  linkedin: {
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    scope: 'r_liteprofile r_emailaddress w_member_social'
  },
  youtube: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/youtube.readonly'
  },
  tiktok: {
    authUrl: 'https://www.tiktok.com/auth/authorize/',
    tokenUrl: 'https://open-api.tiktok.com/oauth/access_token/',
    scope: 'user.info.basic,video.list'
  },
  discord: {
    authUrl: 'https://discord.com/api/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    scope: 'identify email guilds'
  },
  telegram: {
    // Telegram uses Bot API, not OAuth
    botApiUrl: 'https://api.telegram.org/bot'
  },
  reddit: {
    authUrl: 'https://www.reddit.com/api/v1/authorize',
    tokenUrl: 'https://www.reddit.com/api/v1/access_token',
    scope: 'identity read submit'
  },
  github: {
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    scope: 'user repo'
  }
}

// Encryption helper functions
const ENCRYPTION_KEY = process.env.SOCIAL_OAUTH_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
const IV_LENGTH = 16

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { platform, credentials } = body

    const currentUserId = getUserIdFromBody(event, body)

    if (!platform || !credentials) {
      return {
        success: false,
        message: 'Platform and credentials are required'
      }
    }

    // Special handling for Telegram (Bot API)
    if (platform === 'telegram') {
      const { botToken } = credentials

      if (!botToken) {
        return { success: false, message: 'Bot token is required for Telegram' }
      }

      try {
        // Validate bot token by calling getMe
        const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`)
        const data = await response.json()

        if (!data.ok) {
          return { success: false, message: 'Invalid Telegram bot token' }
        }

        // Save encrypted bot token
        const encryptedToken = encrypt(botToken)

        await SocialOAuth.findOneAndUpdate(
          { userId: currentUserId, platform },
          {
            userId: currentUserId,
            platform,
            credentials: { botToken: encryptedToken },
            accessToken: encryptedToken,
            isConnected: true,
            userData: {
              botName: data.result.first_name,
              username: data.result.username,
              botId: data.result.id
            },
            connectedAt: new Date()
          },
          { upsert: true, new: true }
        )

        return {
          success: true,
          message: 'Telegram bot connected successfully',
          userData: {
            botName: data.result.first_name,
            username: data.result.username
          }
        }
      } catch (error) {
        return { success: false, message: 'Failed to validate Telegram bot: ' + error.message }
      }
    }

    // Store encrypted credentials
    const encryptedCreds = {}
    Object.keys(credentials).forEach(key => {
      if (credentials[key]) {
        encryptedCreds[key] = encrypt(credentials[key])
      }
    })

    // Save credentials to database - mark as connected since we have credentials
    await SocialOAuth.findOneAndUpdate(
      { userId: currentUserId, platform },
      {
        userId: currentUserId,
        platform,
        credentials: encryptedCreds,
        isConnected: true, // Mark as connected when credentials are saved
        connectedAt: new Date()
      },
      { upsert: true, new: true }
    )

    // For platforms without OAuth config, just save credentials and return success
    const config = oauthConfigs[platform]
    if (!config) {
      return {
        success: true,
        message: `${platform} credentials saved successfully`,
        userData: null
      }
    }

    // Generate state for CSRF protection
    const state = crypto.randomBytes(16).toString('hex')

    // Build OAuth URL based on platform
    const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/api/v1/oauth/callback/${platform}`

    let authUrl = ''
    const clientId = credentials.clientId || credentials.appId || credentials.apiKey || credentials.clientKey

    switch (platform) {
      case 'facebook':
        authUrl = `${config.authUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${config.scope}&response_type=code`
        break
      case 'instagram':
        authUrl = `${config.authUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${config.scope}&response_type=code`
        break
      case 'twitter':
        authUrl = `${config.authUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${config.scope}&state=${state}&response_type=code&code_challenge=challenge&code_challenge_method=plain`
        break
      case 'linkedin':
        authUrl = `${config.authUrl}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${config.scope}`
        break
      case 'youtube':
        authUrl = `${config.authUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${config.scope}&response_type=code&access_type=offline&state=${state}`
        break
      case 'tiktok':
        authUrl = `${config.authUrl}?client_key=${clientId}&scope=${config.scope}&response_type=code&redirect_uri=${redirectUri}&state=${state}`
        break
      case 'discord':
        authUrl = `${config.authUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${config.scope}&state=${state}`
        break
      case 'reddit':
        authUrl = `${config.authUrl}?client_id=${clientId}&response_type=code&state=${state}&redirect_uri=${redirectUri}&duration=permanent&scope=${config.scope}`
        break
      case 'github':
        authUrl = `${config.authUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${config.scope}&state=${state}`
        break
    }

    // Store state for verification
    await SocialOAuth.findOneAndUpdate(
      { userId: currentUserId, platform },
      { oauthState: state },
      { upsert: true }
    )

    return {
      success: true,
      authUrl,
      state
    }

  } catch (error) {
    console.error('Error connecting OAuth:', error)
    return {
      success: false,
      message: 'Failed to initiate OAuth connection: ' + error.message
    }
  }
})
