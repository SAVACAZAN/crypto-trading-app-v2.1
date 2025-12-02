import mongoose from 'mongoose'

const socialOAuthSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  platform: {
    type: String,
    required: true,
    enum: [
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
    ],
    index: true
  },
  credentials: {
    // Encrypted credentials (clientId, clientSecret, etc.)
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  accessToken: {
    type: String,
    required: false
  },
  refreshToken: {
    type: String,
    required: false
  },
  tokenType: {
    type: String,
    default: 'Bearer'
  },
  tokenExpiresAt: {
    type: Date,
    required: false
  },
  scope: {
    type: String,
    required: false
  },
  oauthState: {
    type: String,
    required: false
  },
  isConnected: {
    type: Boolean,
    default: false
  },
  userData: {
    // Platform-specific user data
    username: String,
    email: String,
    displayName: String,
    profilePicture: String,
    channelName: String,
    channelId: String,
    botName: String,
    botId: String,
    discriminator: String,
    platformUserId: String
  },
  permissions: {
    type: [String],
    default: []
  },
  connectedAt: {
    type: Date,
    default: null
  },
  lastUsedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Compound index for userId + platform
socialOAuthSchema.index({ userId: 1, platform: 1 }, { unique: true })

// Method to check if token is expired
socialOAuthSchema.methods.isTokenExpired = function() {
  if (!this.tokenExpiresAt) return false
  return new Date() >= this.tokenExpiresAt
}

// Method to check if token needs refresh (expires in less than 5 minutes)
socialOAuthSchema.methods.needsRefresh = function() {
  if (!this.tokenExpiresAt) return false
  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000)
  return this.tokenExpiresAt <= fiveMinutesFromNow
}

// Static method to find active connections
socialOAuthSchema.statics.findActiveConnections = function(userId) {
  return this.find({
    userId,
    isConnected: true
  })
}

// Static method to find by platform
socialOAuthSchema.statics.findByPlatform = function(userId, platform) {
  return this.findOne({ userId, platform })
}

export default mongoose.models.SocialOAuth || mongoose.model('SocialOAuth', socialOAuthSchema)
