import { defineEventHandler, readBody } from 'h3'
import SocialOAuth from '../../models/socialOAuth.schema'
import crypto from 'crypto'
import { getUserIdFromBody } from '../../utils/getUserId'

const ENCRYPTION_KEY = process.env.SOCIAL_OAUTH_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')

function decrypt(text) {
  const textParts = text.split(':')
  const iv = Buffer.from(textParts.shift(), 'hex')
  const encryptedText = Buffer.from(textParts.join(':'), 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}

function encrypt(text) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

const tokenUrls = {
  facebook: 'https://graph.facebook.com/v18.0/oauth/access_token',
  instagram: 'https://api.instagram.com/oauth/access_token',
  twitter: 'https://api.twitter.com/2/oauth2/token',
  linkedin: 'https://www.linkedin.com/oauth/v2/accessToken',
  youtube: 'https://oauth2.googleapis.com/token',
  discord: 'https://discord.com/api/oauth2/token',
  reddit: 'https://www.reddit.com/api/v1/access_token',
  github: 'https://github.com/login/oauth/access_token'
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { platform } = body

    const currentUserId = getUserIdFromBody(event, body)

    if (!platform) {
      return { success: false, message: 'Platform is required' }
    }

    // Get OAuth record
    const oauthRecord = await SocialOAuth.findOne({
      userId: currentUserId,
      platform
    })

    if (!oauthRecord) {
      return { success: false, message: 'OAuth connection not found' }
    }

    if (!oauthRecord.refreshToken) {
      return { success: false, message: 'No refresh token available. Please reconnect.' }
    }

    // Decrypt refresh token and credentials
    const refreshToken = decrypt(oauthRecord.refreshToken)
    const credentials = oauthRecord.credentials

    let clientId, clientSecret
    if (credentials.clientId) {
      clientId = decrypt(credentials.clientId)
      clientSecret = decrypt(credentials.clientSecret)
    } else if (credentials.appId) {
      clientId = decrypt(credentials.appId)
      clientSecret = decrypt(credentials.appSecret)
    }

    const tokenUrl = tokenUrls[platform]
    if (!tokenUrl) {
      return { success: false, message: 'Token refresh not supported for this platform' }
    }

    // Request new token
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret
    })

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    })

    const data = await response.json()

    if (!response.ok || !data.access_token) {
      return { success: false, message: 'Failed to refresh token: ' + (data.error_description || 'Unknown error') }
    }

    // Update tokens
    const encryptedAccessToken = encrypt(data.access_token)
    const updateData = {
      accessToken: encryptedAccessToken,
      tokenExpiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null
    }

    if (data.refresh_token) {
      updateData.refreshToken = encrypt(data.refresh_token)
    }

    await SocialOAuth.findOneAndUpdate(
      { userId: currentUserId, platform },
      updateData
    )

    return {
      success: true,
      message: 'Token refreshed successfully',
      expiresAt: updateData.tokenExpiresAt
    }

  } catch (error) {
    console.error('Error refreshing token:', error)
    return {
      success: false,
      message: 'Failed to refresh token: ' + error.message
    }
  }
})
