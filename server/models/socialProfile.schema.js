import mongoose from 'mongoose'

const socialProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  profiles: {
    // Classic & Major
    facebook: { type: String, default: '', trim: true },
    instagram: { type: String, default: '', trim: true },
    twitter: { type: String, default: '', trim: true },
    linkedin: { type: String, default: '', trim: true },
    youtube: { type: String, default: '', trim: true },
    tiktok: { type: String, default: '', trim: true },
    discord: { type: String, default: '', trim: true },
    telegram: { type: String, default: '', trim: true },
    reddit: { type: String, default: '', trim: true },
    github: { type: String, default: '', trim: true },

    // Media & Creative
    pinterest: { type: String, default: '', trim: true },
    snapchat: { type: String, default: '', trim: true },
    flickr: { type: String, default: '', trim: true },
    deviantart: { type: String, default: '', trim: true },
    behance: { type: String, default: '', trim: true },
    dribbble: { type: String, default: '', trim: true },
    imgur: { type: String, default: '', trim: true },
    vimeo: { type: String, default: '', trim: true },
    dailymotion: { type: String, default: '', trim: true },
    soundcloud: { type: String, default: '', trim: true },

    // Community & Chat
    slack: { type: String, default: '', trim: true },
    whatsapp: { type: String, default: '', trim: true },
    signal: { type: String, default: '', trim: true },
    matrix: { type: String, default: '', trim: true },
    twitch: { type: String, default: '', trim: true },
    clubhouse: { type: String, default: '', trim: true },
    threads: { type: String, default: '', trim: true },
    mastodon: { type: String, default: '', trim: true },
    bluesky: { type: String, default: '', trim: true },
    truthsocial: { type: String, default: '', trim: true },

    // Business & Productivity
    notion: { type: String, default: '', trim: true },
    trello: { type: String, default: '', trim: true },
    asana: { type: String, default: '', trim: true },
    monday: { type: String, default: '', trim: true },
    clickup: { type: String, default: '', trim: true },
    zoom: { type: String, default: '', trim: true },
    teams: { type: String, default: '', trim: true },
    google: { type: String, default: '', trim: true },
    dropbox: { type: String, default: '', trim: true },
    box: { type: String, default: '', trim: true },

    // Crypto & Web3
    coinbase: { type: String, default: '', trim: true },
    kraken: { type: String, default: '', trim: true },
    lcx: { type: String, default: '', trim: true },
    bitrue: { type: String, default: '', trim: true },
    metamask: { type: String, default: '', trim: true },
    phantom: { type: String, default: '', trim: true },
    binance: { type: String, default: '', trim: true },
    uniswap: { type: String, default: '', trim: true },
    opensea: { type: String, default: '', trim: true },
    zapper: { type: String, default: '', trim: true },

    // Blogs & Content
    medium: { type: String, default: '', trim: true },
    substack: { type: String, default: '', trim: true },
    wordpress: { type: String, default: '', trim: true },
    blogger: { type: String, default: '', trim: true },
    ghost: { type: String, default: '', trim: true },
    patreon: { type: String, default: '', trim: true },
    onlyfans: { type: String, default: '', trim: true },
    kofi: { type: String, default: '', trim: true },
    buymeacoffee: { type: String, default: '', trim: true },
    tumblr: { type: String, default: '', trim: true },

    // Analytics & Marketing
    googleanalytics: { type: String, default: '', trim: true },
    googleads: { type: String, default: '', trim: true },
    facebookads: { type: String, default: '', trim: true },
    twitterads: { type: String, default: '', trim: true },
    linkedinads: { type: String, default: '', trim: true },
    tiktokads: { type: String, default: '', trim: true },
    mailchimp: { type: String, default: '', trim: true },
    sendinblue: { type: String, default: '', trim: true },
    buffer: { type: String, default: '', trim: true },
    hootsuite: { type: String, default: '', trim: true }
  },
  isPublic: {
    type: Boolean,
    default: true
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

// Add method to get only connected profiles
socialProfileSchema.methods.getConnectedProfiles = function() {
  const connected = {}
  Object.keys(this.profiles).forEach(platform => {
    if (this.profiles[platform]) {
      connected[platform] = this.profiles[platform]
    }
  })
  return connected
}

// Add static method to find by userId
socialProfileSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId })
}

export default mongoose.models.SocialProfile || mongoose.model('SocialProfile', socialProfileSchema)
