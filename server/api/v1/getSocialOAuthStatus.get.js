import { defineEventHandler, getQuery } from 'h3'
import SocialOAuth from '../../models/socialOAuth.schema'
import { getUserId } from '../../utils/getUserId'

export default defineEventHandler(async (event) => {
  try {
    const currentUserId = getUserId(event)

    // Get all OAuth connections for this user
    const oauthRecords = await SocialOAuth.find({ userId: currentUserId })

    // Initialize all 60+ platforms
    const allPlatforms = [
      // Classic & Major
      'facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'discord', 'telegram', 'reddit', 'github',
      // Media & Creative
      'pinterest', 'snapchat', 'flickr', 'deviantart', 'behance', 'dribbble', 'imgur', 'vimeo', 'dailymotion', 'soundcloud',
      // Community & Chat
      'slack', 'whatsapp', 'signal', 'matrix', 'twitch', 'clubhouse', 'threads', 'mastodon', 'bluesky', 'truthsocial',
      // Business & Productivity
      'notion', 'trello', 'asana', 'monday', 'clickup', 'zoom', 'teams', 'google', 'dropbox', 'box',
      // Crypto & Web3
      'coinbase', 'kraken', 'lcx', 'bitrue', 'metamask', 'phantom', 'binance', 'uniswap', 'opensea', 'zapper',
      // Blogs & Content
      'medium', 'substack', 'wordpress', 'blogger', 'ghost', 'patreon', 'onlyfans', 'kofi', 'buymeacoffee', 'tumblr',
      // Analytics & Marketing
      'googleanalytics', 'googleads', 'facebookads', 'twitterads', 'linkedinads', 'tiktokads', 'mailchimp', 'sendinblue', 'buffer', 'hootsuite'
    ]

    const status = {}
    const data = {}

    // Initialize all platforms as false/null
    allPlatforms.forEach(platform => {
      status[platform] = false
      data[platform] = null
    })

    // Populate with actual data from database
    oauthRecords.forEach(record => {
      // Set status to true if connected OR if credentials exist (even if not fully OAuth connected)
      const hasCredentials = record.credentials && Object.keys(record.credentials).length > 0
      status[record.platform] = record.isConnected || hasCredentials

      data[record.platform] = {
        username: record.userData?.username || null,
        email: record.userData?.email || null,
        channelName: record.userData?.channelName || null,
        botName: record.userData?.botName || null,
        discriminator: record.userData?.discriminator || null,
        expiresAt: record.tokenExpiresAt || null,
        connectedAt: record.connectedAt || null,
        isConnected: record.isConnected,
        hasCredentials: hasCredentials
      }
    })

    return {
      success: true,
      status,
      data
    }

  } catch (error) {
    console.error('Error fetching OAuth status:', error)
    return {
      success: false,
      message: 'Failed to fetch OAuth status',
      status: {},
      data: {}
    }
  }
})
