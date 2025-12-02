import { defineEventHandler, getQuery, sendRedirect } from 'h3'
import SocialOAuth from '../../../../models/socialOAuth.schema'
import crypto from 'crypto'

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

const platformAPIs = {
  facebook: {
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    userUrl: 'https://graph.facebook.com/me?fields=id,name,email,picture'
  },
  instagram: {
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    userUrl: 'https://graph.instagram.com/me?fields=id,username,account_type'
  },
  twitter: {
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    userUrl: 'https://api.twitter.com/2/users/me'
  },
  linkedin: {
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    userUrl: 'https://api.linkedin.com/v2/me'
  },
  youtube: {
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userUrl: 'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true'
  },
  tiktok: {
    tokenUrl: 'https://open-api.tiktok.com/oauth/access_token/',
    userUrl: 'https://open.tiktokapis.com/v2/user/info/'
  },
  discord: {
    tokenUrl: 'https://discord.com/api/oauth2/token',
    userUrl: 'https://discord.com/api/users/@me'
  },
  reddit: {
    tokenUrl: 'https://www.reddit.com/api/v1/access_token',
    userUrl: 'https://oauth.reddit.com/api/v1/me'
  },
  github: {
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userUrl: 'https://api.github.com/user'
  }
}

export default defineEventHandler(async (event) => {
  try {
    const platform = event.context.params.platform
    const query = getQuery(event)
    const { code, state, error, error_description } = query

    if (error) {
      return `
        <!DOCTYPE html>
        <html>
        <head><title>OAuth Error</title></head>
        <body>
          <h1>Authentication Failed</h1>
          <p>${error_description || error}</p>
          <script>
            window.opener.postMessage({
              platform: '${platform}',
              success: false,
              error: '${error_description || error}'
            }, '*');
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
        </html>
      `
    }

    if (!code) {
      return `
        <!DOCTYPE html>
        <html>
        <head><title>OAuth Error</title></head>
        <body>
          <h1>No authorization code received</h1>
          <script>
            window.opener.postMessage({
              platform: '${platform}',
              success: false,
              error: 'No authorization code'
            }, '*');
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
        </html>
      `
    }

    // Find OAuth record to get credentials
    const oauthRecord = await SocialOAuth.findOne({ platform, oauthState: state })

    if (!oauthRecord) {
      return `
        <!DOCTYPE html>
        <html>
        <head><title>OAuth Error</title></head>
        <body>
          <h1>Invalid state parameter</h1>
          <script>
            window.opener.postMessage({
              platform: '${platform}',
              success: false,
              error: 'Invalid state'
            }, '*');
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
        </html>
      `
    }

    // Decrypt credentials
    const credentials = oauthRecord.credentials
    let clientId, clientSecret

    if (credentials.clientId) {
      clientId = decrypt(credentials.clientId)
      clientSecret = decrypt(credentials.clientSecret)
    } else if (credentials.appId) {
      clientId = decrypt(credentials.appId)
      clientSecret = decrypt(credentials.appSecret)
    } else if (credentials.apiKey) {
      clientId = decrypt(credentials.apiKey)
      clientSecret = decrypt(credentials.apiSecret)
    } else if (credentials.clientKey) {
      clientId = decrypt(credentials.clientKey)
      clientSecret = decrypt(credentials.clientSecret)
    }

    const api = platformAPIs[platform]
    const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/api/v1/oauth/callback/${platform}`

    // Exchange code for access token
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret
    })

    // Special handling for different platforms
    if (platform === 'twitter') {
      tokenParams.append('code_verifier', 'challenge')
    }

    const tokenResponse = await fetch(api.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: tokenParams
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok || !tokenData.access_token) {
      return `
        <!DOCTYPE html>
        <html>
        <head><title>OAuth Error</title></head>
        <body>
          <h1>Failed to get access token</h1>
          <p>${tokenData.error_description || tokenData.error || 'Unknown error'}</p>
          <script>
            window.opener.postMessage({
              platform: '${platform}',
              success: false,
              error: '${tokenData.error_description || 'Failed to get token'}'
            }, '*');
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
        </html>
      `
    }

    // Get user info
    const userHeaders = {
      'Authorization': `Bearer ${tokenData.access_token}`,
      'Accept': 'application/json'
    }

    // Reddit requires Basic Auth
    if (platform === 'reddit') {
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      userHeaders['Authorization'] = `Basic ${basicAuth}`
    }

    const userResponse = await fetch(api.userUrl, { headers: userHeaders })
    const userData = await userResponse.json()

    // Extract user info based on platform
    let extractedUserData = {}

    switch (platform) {
      case 'facebook':
        extractedUserData = {
          platformUserId: userData.id,
          username: userData.name,
          email: userData.email,
          profilePicture: userData.picture?.data?.url
        }
        break
      case 'instagram':
        extractedUserData = {
          platformUserId: userData.id,
          username: userData.username
        }
        break
      case 'twitter':
        extractedUserData = {
          platformUserId: userData.data?.id,
          username: userData.data?.username,
          displayName: userData.data?.name
        }
        break
      case 'linkedin':
        extractedUserData = {
          platformUserId: userData.id,
          displayName: `${userData.localizedFirstName} ${userData.localizedLastName}`
        }
        break
      case 'youtube':
        extractedUserData = {
          channelId: userData.items?.[0]?.id,
          channelName: userData.items?.[0]?.snippet?.title,
          profilePicture: userData.items?.[0]?.snippet?.thumbnails?.default?.url
        }
        break
      case 'discord':
        extractedUserData = {
          platformUserId: userData.id,
          username: userData.username,
          discriminator: userData.discriminator,
          email: userData.email,
          profilePicture: `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
        }
        break
      case 'reddit':
        extractedUserData = {
          platformUserId: userData.id,
          username: userData.name
        }
        break
      case 'github':
        extractedUserData = {
          platformUserId: userData.id,
          username: userData.login,
          displayName: userData.name,
          email: userData.email,
          profilePicture: userData.avatar_url
        }
        break
      case 'tiktok':
        extractedUserData = {
          platformUserId: userData.data?.user?.open_id,
          username: userData.data?.user?.display_name
        }
        break
    }

    // Save tokens and user data
    const encryptedAccessToken = encrypt(tokenData.access_token)
    const encryptedRefreshToken = tokenData.refresh_token ? encrypt(tokenData.refresh_token) : null

    await SocialOAuth.findOneAndUpdate(
      { userId: oauthRecord.userId, platform },
      {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenType: tokenData.token_type || 'Bearer',
        tokenExpiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
        scope: tokenData.scope || null,
        isConnected: true,
        userData: extractedUserData,
        connectedAt: new Date(),
        lastUsedAt: new Date()
      }
    )

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Successful</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
          }
          h1 { margin: 0 0 20px 0; }
          .icon { font-size: 64px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">✅</div>
          <h1>Authentication Successful!</h1>
          <p>You have successfully connected your ${platform} account.</p>
          <p>This window will close automatically...</p>
        </div>
        <script>
          window.opener.postMessage({
            platform: '${platform}',
            success: true,
            userData: ${JSON.stringify(extractedUserData)}
          }, '*');
          setTimeout(() => window.close(), 2000);
        </script>
      </body>
      </html>
    `

  } catch (error) {
    console.error('OAuth callback error:', error)
    return `
      <!DOCTYPE html>
      <html>
      <head><title>OAuth Error</title></head>
      <body>
        <h1>An error occurred</h1>
        <p>${error.message}</p>
        <script>
          window.opener.postMessage({
            platform: 'unknown',
            success: false,
            error: '${error.message}'
          }, '*');
          setTimeout(() => window.close(), 3000);
        </script>
      </body>
      </html>
    `
  }
})
