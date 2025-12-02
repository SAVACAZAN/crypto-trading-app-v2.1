<template>
  <div class="social-profile-container">
    <!-- MAIN CATEGORY TABS -->
    <div class="category-tabs">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="category-tab"
        :class="{ active: activeCategory === cat.id }"
        @click="activeCategory = cat.id"
      >
        {{ cat.icon }} {{ cat.name }}
      </button>
    </div>

    <!-- MODE TOGGLE (OAuth vs Links) -->
    <div class="mode-toggle">
      <button
        class="mode-btn"
        :class="{ active: viewMode === 'oauth' }"
        @click="viewMode = 'oauth'"
      >
        <i class="fas fa-key"></i> OAuth & API Keys
      </button>
      <button
        class="mode-btn"
        :class="{ active: viewMode === 'links' }"
        @click="viewMode = 'links'"
      >
        <i class="fas fa-link"></i> Profile Links
      </button>
    </div>

    <!-- CATEGORY CONTENT -->
    <div class="category-content">
      <!-- OAUTH MODE -->
      <div v-if="viewMode === 'oauth'" class="oauth-mode">
        <div class="info-banner">
          <i class="fas fa-info-circle"></i>
          <p>{{ categories.find(c => c.id === activeCategory)?.description }}</p>
        </div>

        <div class="platforms-grid">
          <div
            v-for="platform in getCurrentPlatforms()"
            :key="platform.id"
            class="platform-card"
            :class="platform.id"
          >
            <div class="card-header">
              <i :class="platform.icon"></i>
              <h3>{{ platform.name }}</h3>
              <span v-if="oauthStatus[platform.id]" class="status-badge connected">
                <i class="fas fa-check-circle"></i> Connected
              </span>
              <span v-else class="status-badge disconnected">
                <i class="fas fa-times-circle"></i> Not Connected
              </span>
            </div>

            <!-- NOT CONNECTED -->
            <div v-if="!oauthStatus[platform.id]" class="oauth-inputs">
              <input
                v-for="field in platform.fields"
                :key="field.key"
                v-model="apiKeys[platform.id][field.key]"
                :type="field.type"
                :placeholder="field.placeholder"
                class="api-input"
              />
              <button @click="connectOAuth(platform.id)" class="connect-btn">
                <i class="fas fa-plug"></i> Connect {{ platform.name }}
              </button>
            </div>

            <!-- CONNECTED -->
            <div v-else class="connected-info">
              <div class="user-info">
                <i class="fas fa-user-circle"></i>
                <span>{{ oauthData[platform.id]?.username || oauthData[platform.id]?.email || 'Connected' }}</span>
              </div>
              <div v-if="oauthData[platform.id]?.expiresAt" class="expiry-info">
                <i class="fas fa-clock"></i>
                <span>Expires: {{ formatExpiry(oauthData[platform.id]?.expiresAt) }}</span>
              </div>
              <div class="action-btns">
                <button @click="disconnectOAuth(platform.id)" class="disconnect-btn">
                  <i class="fas fa-unlink"></i> Disconnect
                </button>
                <button v-if="platform.supportsRefresh" @click="refreshToken(platform.id)" class="refresh-btn">
                  <i class="fas fa-sync"></i> Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- LINKS MODE -->
      <div v-else class="links-mode">
        <div class="info-banner">
          <i class="fas fa-info-circle"></i>
          <p>Profile links are unlocked after OAuth authentication. Connect via OAuth first.</p>
        </div>

        <div class="platforms-grid">
          <div
            v-for="platform in getCurrentPlatforms()"
            :key="platform.id"
            class="platform-card"
            :class="platform.id"
          >
            <div class="card-header">
              <i :class="platform.icon"></i>
              <h3>{{ platform.name }}</h3>
              <span v-if="oauthStatus[platform.id]" class="status-badge unlocked">
                <i class="fas fa-unlock"></i> Unlocked
              </span>
              <span v-else class="status-badge locked">
                <i class="fas fa-lock"></i> Locked
              </span>
            </div>

            <!-- UNLOCKED -->
            <div v-if="oauthStatus[platform.id]" class="link-inputs">
              <input
                v-model="socialLinks[platform.id]"
                type="text"
                :placeholder="platform.linkPlaceholder"
                class="link-input"
              />
              <button @click="saveLink(platform.id)" class="save-btn" :class="{ saved: socialLinks[platform.id] }">
                <i class="fas fa-save"></i> {{ socialLinks[platform.id] ? 'Update' : 'Save' }}
              </button>
            </div>

            <!-- LOCKED -->
            <div v-else class="locked-state">
              <i class="fas fa-lock"></i>
              <p>Connect via OAuth first</p>
              <button @click="viewMode = 'oauth'" class="unlock-btn">
                <i class="fas fa-key"></i> Go to OAuth
              </button>
            </div>
          </div>
        </div>

        <!-- BULK ACTIONS -->
        <div v-if="hasConnectedPlatforms" class="bulk-actions">
          <button @click="saveAllLinks" class="bulk-btn save">
            <i class="fas fa-save"></i> Save All Links
          </button>
        </div>
      </div>
    </div>

    <!-- TOAST MESSAGES -->
    <div v-if="message" class="toast-message" :class="messageType">
      <i :class="messageType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
      <span>{{ message }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const activeCategory = ref('classic')
const viewMode = ref('oauth')
const message = ref('')
const messageType = ref('success')

const categories = [
  {
    id: 'classic',
    name: 'Classic & Major',
    icon: '🌐',
    description: 'Major social media platforms with millions of users worldwide'
  },
  {
    id: 'media',
    name: 'Media & Creative',
    icon: '📸',
    description: 'Photo, video, and creative content sharing platforms'
  },
  {
    id: 'community',
    name: 'Community & Chat',
    icon: '💬',
    description: 'Community platforms, messaging apps, and live streaming services'
  },
  {
    id: 'business',
    name: 'Business & Productivity',
    icon: '👨‍💼',
    description: 'Professional tools, project management, and business platforms'
  },
  {
    id: 'crypto',
    name: 'Crypto & Web3',
    icon: '💰',
    description: 'Cryptocurrency exchanges, DeFi platforms, and Web3 wallets'
  },
  {
    id: 'content',
    name: 'Blogs & Content',
    icon: '📰',
    description: 'Blogging platforms, newsletters, and creator monetization tools'
  },
  {
    id: 'marketing',
    name: 'Analytics & Marketing',
    icon: '📊',
    description: 'Marketing automation, analytics, and advertising platforms'
  }
]

const platforms = {
  classic: [
    { id: 'facebook', name: 'Facebook', icon: 'fab fa-facebook', fields: [{key: 'appId', placeholder: 'App ID', type: 'text'}, {key: 'appSecret', placeholder: 'App Secret', type: 'password'}], linkPlaceholder: 'https://facebook.com/yourprofile', supportsRefresh: true },
    { id: 'instagram', name: 'Instagram', icon: 'fab fa-instagram', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}], linkPlaceholder: 'https://instagram.com/yourprofile', supportsRefresh: true },
    { id: 'twitter', name: 'X (Twitter)', icon: 'fab fa-x-twitter', fields: [{key: 'apiKey', placeholder: 'API Key (Consumer Key)', type: 'text'}, {key: 'apiSecret', placeholder: 'API Secret (Consumer Secret)', type: 'password'}, {key: 'bearerToken', placeholder: 'Bearer Token', type: 'password'}, {key: 'accessToken', placeholder: 'Access Token', type: 'password'}, {key: 'accessTokenSecret', placeholder: 'Access Token Secret', type: 'password'}], linkPlaceholder: 'https://x.com/yourprofile', supportsRefresh: true },
    { id: 'linkedin', name: 'LinkedIn', icon: 'fab fa-linkedin', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}], linkPlaceholder: 'https://linkedin.com/in/yourprofile', supportsRefresh: true },
    { id: 'youtube', name: 'YouTube', icon: 'fab fa-youtube', fields: [{key: 'clientId', placeholder: 'Google Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Google Client Secret', type: 'password'}], linkPlaceholder: 'https://youtube.com/@yourchannel', supportsRefresh: true },
    { id: 'tiktok', name: 'TikTok', icon: 'fab fa-tiktok', fields: [{key: 'clientKey', placeholder: 'Client Key', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}], linkPlaceholder: 'https://tiktok.com/@yourprofile', supportsRefresh: false },
    { id: 'discord', name: 'Discord', icon: 'fab fa-discord', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}, {key: 'botToken', placeholder: 'Bot Token (Optional)', type: 'password'}], linkPlaceholder: 'https://discord.gg/yourserver', supportsRefresh: true },
    { id: 'telegram', name: 'Telegram', icon: 'fab fa-telegram', fields: [{key: 'botToken', placeholder: 'Bot Token', type: 'password'}], linkPlaceholder: 'https://t.me/yourprofile', supportsRefresh: false },
    { id: 'reddit', name: 'Reddit', icon: 'fab fa-reddit', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}], linkPlaceholder: 'https://reddit.com/u/yourprofile', supportsRefresh: true },
    { id: 'github', name: 'GitHub', icon: 'fab fa-github', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}, {key: 'personalToken', placeholder: 'Personal Token (Optional)', type: 'password'}], linkPlaceholder: 'https://github.com/yourprofile', supportsRefresh: true }
  ],
  media: [
    { id: 'pinterest', name: 'Pinterest', icon: 'fab fa-pinterest', fields: [{key: 'appId', placeholder: 'App ID', type: 'text'}, {key: 'appSecret', placeholder: 'App Secret', type: 'password'}], linkPlaceholder: 'https://pinterest.com/yourprofile', supportsRefresh: true },
    { id: 'snapchat', name: 'Snapchat', icon: 'fab fa-snapchat', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}], linkPlaceholder: 'https://snapchat.com/add/yourprofile', supportsRefresh: false },
    { id: 'flickr', name: 'Flickr', icon: 'fab fa-flickr', fields: [{key: 'apiKey', placeholder: 'API Key', type: 'text'}, {key: 'apiSecret', placeholder: 'API Secret', type: 'password'}], linkPlaceholder: 'https://flickr.com/photos/yourprofile', supportsRefresh: true },
    { id: 'deviantart', name: 'DeviantArt', icon: 'fab fa-deviantart', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}], linkPlaceholder: 'https://deviantart.com/yourprofile', supportsRefresh: true },
    { id: 'behance', name: 'Behance', icon: 'fab fa-behance', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}], linkPlaceholder: 'https://behance.net/yourprofile', supportsRefresh: false },
    { id: 'dribbble', name: 'Dribbble', icon: 'fab fa-dribbble', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}], linkPlaceholder: 'https://dribbble.com/yourprofile', supportsRefresh: true },
    { id: 'imgur', name: 'Imgur', icon: 'fas fa-image', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}], linkPlaceholder: 'https://imgur.com/user/yourprofile', supportsRefresh: false },
    { id: 'vimeo', name: 'Vimeo', icon: 'fab fa-vimeo', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}], linkPlaceholder: 'https://vimeo.com/yourprofile', supportsRefresh: true },
    { id: 'dailymotion', name: 'Dailymotion', icon: 'fas fa-video', fields: [{key: 'apiKey', placeholder: 'API Key', type: 'text'}, {key: 'apiSecret', placeholder: 'API Secret', type: 'password'}], linkPlaceholder: 'https://dailymotion.com/yourprofile', supportsRefresh: false },
    { id: 'soundcloud', name: 'SoundCloud', icon: 'fab fa-soundcloud', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}], linkPlaceholder: 'https://soundcloud.com/yourprofile', supportsRefresh: true }
  ],
  community: [
    { id: 'slack', name: 'Slack', icon: 'fab fa-slack', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}], linkPlaceholder: 'https://yourworkspace.slack.com', supportsRefresh: true },
    { id: 'whatsapp', name: 'WhatsApp Business', icon: 'fab fa-whatsapp', fields: [{key: 'phoneNumberId', placeholder: 'Phone Number ID', type: 'text'}, {key: 'accessToken', placeholder: 'Access Token', type: 'password'}], linkPlaceholder: 'https://wa.me/yourphonenumber', supportsRefresh: false },
    { id: 'signal', name: 'Signal', icon: 'fas fa-comment-dots', fields: [{key: 'apiKey', placeholder: 'API Key', type: 'text'}], linkPlaceholder: 'Signal: +yourphonenumber', supportsRefresh: false },
    { id: 'matrix', name: 'Matrix / Element', icon: 'fas fa-hashtag', fields: [{key: 'homeserver', placeholder: 'Homeserver URL', type: 'text'}, {key: 'accessToken', placeholder: 'Access Token', type: 'password'}], linkPlaceholder: 'matrix.to/#/@youruser:server.com', supportsRefresh: false },
    { id: 'twitch', name: 'Twitch', icon: 'fab fa-twitch', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}], linkPlaceholder: 'https://twitch.tv/yourprofile', supportsRefresh: true },
    { id: 'clubhouse', name: 'Clubhouse', icon: 'fas fa-microphone', fields: [{key: 'apiKey', placeholder: 'API Key', type: 'text'}], linkPlaceholder: 'Clubhouse: @yourprofile', supportsRefresh: false },
    { id: 'threads', name: 'Threads (Meta)', icon: 'fas fa-at', fields: [{key: 'appId', placeholder: 'App ID', type: 'text'}, {key: 'appSecret', placeholder: 'App Secret', type: 'password'}], linkPlaceholder: 'https://threads.net/@yourprofile', supportsRefresh: true },
    { id: 'mastodon', name: 'Mastodon', icon: 'fab fa-mastodon', fields: [{key: 'instanceUrl', placeholder: 'Instance URL', type: 'text'}, {key: 'accessToken', placeholder: 'Access Token', type: 'password'}], linkPlaceholder: 'https://yourinstance.social/@yourprofile', supportsRefresh: false },
    { id: 'bluesky', name: 'Bluesky', icon: 'fas fa-cloud', fields: [{key: 'handle', placeholder: 'Handle', type: 'text'}, {key: 'appPassword', placeholder: 'App Password', type: 'password'}], linkPlaceholder: 'https://bsky.app/profile/yourprofile', supportsRefresh: false },
    { id: 'truthsocial', name: 'Truth Social', icon: 'fas fa-flag-usa', fields: [{key: 'apiKey', placeholder: 'API Key', type: 'text'}], linkPlaceholder: 'https://truthsocial.com/@yourprofile', supportsRefresh: false }
  ],
  business: [
    { id: 'notion', name: 'Notion', icon: 'fas fa-book', fields: [{key: 'integrationToken', placeholder: 'Integration Token', type: 'password'}], linkPlaceholder: 'https://notion.so/yourpage', supportsRefresh: false },
    { id: 'trello', name: 'Trello', icon: 'fab fa-trello', fields: [{key: 'apiKey', placeholder: 'API Key', type: 'text'}, {key: 'apiToken', placeholder: 'API Token', type: 'password'}], linkPlaceholder: 'https://trello.com/yourprofile', supportsRefresh: false },
    { id: 'asana', name: 'Asana', icon: 'fas fa-tasks', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}], linkPlaceholder: 'https://app.asana.com', supportsRefresh: true },
    { id: 'monday', name: 'Monday.com', icon: 'fas fa-calendar-check', fields: [{key: 'apiToken', placeholder: 'API Token', type: 'password'}], linkPlaceholder: 'https://yourworkspace.monday.com', supportsRefresh: false },
    { id: 'clickup', name: 'ClickUp', icon: 'fas fa-mouse-pointer', fields: [{key: 'apiToken', placeholder: 'API Token', type: 'password'}], linkPlaceholder: 'https://app.clickup.com', supportsRefresh: false },
    { id: 'zoom', name: 'Zoom', icon: 'fas fa-video', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}], linkPlaceholder: 'https://zoom.us/profile', supportsRefresh: true },
    { id: 'teams', name: 'Microsoft Teams', icon: 'fab fa-microsoft', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}], linkPlaceholder: 'https://teams.microsoft.com', supportsRefresh: true },
    { id: 'google', name: 'Google Workspace', icon: 'fab fa-google', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}], linkPlaceholder: 'https://workspace.google.com', supportsRefresh: true },
    { id: 'dropbox', name: 'Dropbox', icon: 'fab fa-dropbox', fields: [{key: 'appKey', placeholder: 'App Key', type: 'text'}, {key: 'appSecret', placeholder: 'App Secret', type: 'password'}], linkPlaceholder: 'https://dropbox.com/yourprofile', supportsRefresh: true },
    { id: 'box', name: 'Box', icon: 'fas fa-box', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}], linkPlaceholder: 'https://box.com', supportsRefresh: true }
  ],
  crypto: [
    { id: 'coinbase', name: 'Coinbase', icon: 'fas fa-coins', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}], linkPlaceholder: 'Coinbase Profile', supportsRefresh: true },
    { id: 'kraken', name: 'Kraken', icon: 'fas fa-exchange-alt', fields: [{key: 'apiKey', placeholder: 'API Key', type: 'text'}, {key: 'apiSecret', placeholder: 'API Secret', type: 'password'}], linkPlaceholder: 'Kraken Account', supportsRefresh: false },
    { id: 'lcx', name: 'LCX Exchange', icon: 'fas fa-chart-line', fields: [{key: 'apiKey', placeholder: 'API Key', type: 'text'}, {key: 'apiSecret', placeholder: 'API Secret', type: 'password'}], linkPlaceholder: 'LCX Account', supportsRefresh: false },
    { id: 'bitrue', name: 'Bitrue', icon: 'fas fa-btc', fields: [{key: 'apiKey', placeholder: 'API Key', type: 'text'}, {key: 'secretKey', placeholder: 'Secret Key', type: 'password'}], linkPlaceholder: 'Bitrue Account', supportsRefresh: false },
    { id: 'metamask', name: 'MetaMask', icon: 'fas fa-wallet', fields: [{key: 'walletAddress', placeholder: 'Wallet Address', type: 'text'}], linkPlaceholder: 'Ethereum Address: 0x...', supportsRefresh: false },
    { id: 'phantom', name: 'Phantom (Solana)', icon: 'fas fa-ghost', fields: [{key: 'walletAddress', placeholder: 'Wallet Address', type: 'text'}], linkPlaceholder: 'Solana Address', supportsRefresh: false },
    { id: 'binance', name: 'Binance', icon: 'fas fa-money-bill-wave', fields: [{key: 'apiKey', placeholder: 'API Key', type: 'text'}, {key: 'secretKey', placeholder: 'Secret Key', type: 'password'}], linkPlaceholder: 'Binance Account', supportsRefresh: false },
    { id: 'uniswap', name: 'Uniswap Profile', icon: 'fas fa-unicorn', fields: [{key: 'ensName', placeholder: 'ENS Name', type: 'text'}, {key: 'walletAddress', placeholder: 'Wallet Address', type: 'text'}], linkPlaceholder: 'https://app.uniswap.org', supportsRefresh: false },
    { id: 'opensea', name: 'OpenSea', icon: 'fas fa-ship', fields: [{key: 'walletAddress', placeholder: 'Wallet Address', type: 'text'}], linkPlaceholder: 'https://opensea.io/yourprofile', supportsRefresh: false },
    { id: 'zapper', name: 'Zapper / Zerion', icon: 'fas fa-bolt', fields: [{key: 'walletAddress', placeholder: 'Wallet Address', type: 'text'}], linkPlaceholder: 'https://zapper.fi/account/0x...', supportsRefresh: false }
  ],
  content: [
    { id: 'medium', name: 'Medium', icon: 'fab fa-medium', fields: [{key: 'integrationToken', placeholder: 'Integration Token', type: 'password'}], linkPlaceholder: 'https://medium.com/@yourprofile', supportsRefresh: false },
    { id: 'substack', name: 'Substack', icon: 'fas fa-newspaper', fields: [{key: 'apiKey', placeholder: 'API Key', type: 'text'}], linkPlaceholder: 'https://yoursubstack.substack.com', supportsRefresh: false },
    { id: 'wordpress', name: 'WordPress', icon: 'fab fa-wordpress', fields: [{key: 'siteUrl', placeholder: 'Site URL', type: 'text'}, {key: 'apiKey', placeholder: 'API Key', type: 'password'}], linkPlaceholder: 'https://yoursite.wordpress.com', supportsRefresh: false },
    { id: 'blogger', name: 'Blogger', icon: 'fab fa-blogger', fields: [{key: 'apiKey', placeholder: 'API Key', type: 'text'}], linkPlaceholder: 'https://yourblog.blogspot.com', supportsRefresh: false },
    { id: 'ghost', name: 'Ghost', icon: 'fas fa-ghost', fields: [{key: 'adminApiKey', placeholder: 'Admin API Key', type: 'password'}, {key: 'apiUrl', placeholder: 'API URL', type: 'text'}], linkPlaceholder: 'https://yoursite.ghost.io', supportsRefresh: false },
    { id: 'patreon', name: 'Patreon', icon: 'fab fa-patreon', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}], linkPlaceholder: 'https://patreon.com/yourprofile', supportsRefresh: true },
    { id: 'onlyfans', name: 'OnlyFans', icon: 'fas fa-star', fields: [{key: 'apiKey', placeholder: 'API Key', type: 'text'}], linkPlaceholder: 'https://onlyfans.com/yourprofile', supportsRefresh: false },
    { id: 'kofi', name: 'Ko-fi', icon: 'fas fa-coffee', fields: [{key: 'apiToken', placeholder: 'API Token', type: 'password'}], linkPlaceholder: 'https://ko-fi.com/yourprofile', supportsRefresh: false },
    { id: 'buymeacoffee', name: 'BuyMeACoffee', icon: 'fas fa-mug-hot', fields: [{key: 'apiToken', placeholder: 'API Token', type: 'password'}], linkPlaceholder: 'https://buymeacoffee.com/yourprofile', supportsRefresh: false },
    { id: 'tumblr', name: 'Tumblr', icon: 'fab fa-tumblr', fields: [{key: 'consumerKey', placeholder: 'Consumer Key', type: 'text'}, {key: 'consumerSecret', placeholder: 'Consumer Secret', type: 'password'}], linkPlaceholder: 'https://yourprofile.tumblr.com', supportsRefresh: true }
  ],
  marketing: [
    { id: 'googleanalytics', name: 'Google Analytics', icon: 'fas fa-chart-bar', fields: [{key: 'trackingId', placeholder: 'Tracking ID', type: 'text'}, {key: 'apiKey', placeholder: 'API Key', type: 'password'}], linkPlaceholder: 'Google Analytics Property', supportsRefresh: false },
    { id: 'googleads', name: 'Google Ads', icon: 'fab fa-google', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}], linkPlaceholder: 'Google Ads Account', supportsRefresh: true },
    { id: 'facebookads', name: 'Facebook Ads', icon: 'fab fa-facebook', fields: [{key: 'adAccountId', placeholder: 'Ad Account ID', type: 'text'}, {key: 'accessToken', placeholder: 'Access Token', type: 'password'}], linkPlaceholder: 'Facebook Ads Manager', supportsRefresh: true },
    { id: 'twitterads', name: 'Twitter Ads', icon: 'fab fa-twitter', fields: [{key: 'consumerKey', placeholder: 'Consumer Key', type: 'text'}, {key: 'consumerSecret', placeholder: 'Consumer Secret', type: 'password'}], linkPlaceholder: 'Twitter Ads Account', supportsRefresh: false },
    { id: 'linkedinads', name: 'LinkedIn Ads', icon: 'fab fa-linkedin', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}], linkPlaceholder: 'LinkedIn Campaign Manager', supportsRefresh: true },
    { id: 'tiktokads', name: 'TikTok Ads', icon: 'fab fa-tiktok', fields: [{key: 'accessToken', placeholder: 'Access Token', type: 'password'}, {key: 'advertiserId', placeholder: 'Advertiser ID', type: 'text'}], linkPlaceholder: 'TikTok Ads Manager', supportsRefresh: false },
    { id: 'mailchimp', name: 'Mailchimp', icon: 'fab fa-mailchimp', fields: [{key: 'apiKey', placeholder: 'API Key', type: 'password'}], linkPlaceholder: 'Mailchimp Account', supportsRefresh: false },
    { id: 'sendinblue', name: 'Sendinblue (Brevo)', icon: 'fas fa-envelope', fields: [{key: 'apiKey', placeholder: 'API Key', type: 'password'}], linkPlaceholder: 'Brevo Account', supportsRefresh: false },
    { id: 'buffer', name: 'Buffer', icon: 'fas fa-share-alt', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}], linkPlaceholder: 'https://buffer.com', supportsRefresh: true },
    { id: 'hootsuite', name: 'Hootsuite', icon: 'fas fa-stream', fields: [{key: 'clientId', placeholder: 'Client ID', type: 'text'}, {key: 'clientSecret', placeholder: 'Client Secret', type: 'password'}], linkPlaceholder: 'https://hootsuite.com', supportsRefresh: true }
  ]
}

// Initialize all platform states
const oauthStatus = ref({})
const oauthData = ref({})
const apiKeys = ref({})
const socialLinks = ref({})

// Initialize states for all platforms
Object.keys(platforms).forEach(category => {
  platforms[category].forEach(platform => {
    oauthStatus.value[platform.id] = false
    oauthData.value[platform.id] = null
    socialLinks.value[platform.id] = ''

    // Initialize API keys structure
    apiKeys.value[platform.id] = {}
    platform.fields.forEach(field => {
      apiKeys.value[platform.id][field.key] = ''
    })
  })
})

const getCurrentPlatforms = () => {
  return platforms[activeCategory.value] || []
}

const hasConnectedPlatforms = computed(() => {
  return Object.values(oauthStatus.value).some(status => status === true)
})

const connectOAuth = async (platformId) => {
  const platform = getCurrentPlatforms().find(p => p.id === platformId)
  if (!platform) return

  const keys = apiKeys.value[platformId]
  const hasKeys = Object.values(keys).some(val => val && val.trim() !== '')

  if (!hasKeys) {
    showMessage(`Please enter API credentials for ${platform.name}`, 'error')
    return
  }

  try {
    const response = await $fetch('/api/v1/connectSocialOAuth', {
      method: 'POST',
      body: { platform: platformId, credentials: keys }
    })

    if (response.success) {
      if (response.authUrl) {
        const popup = window.open(response.authUrl, `${platformId}_oauth`, 'width=600,height=700')

        window.addEventListener('message', (event) => {
          if (event.data.platform === platformId && event.data.success) {
            oauthStatus.value[platformId] = true
            oauthData.value[platformId] = event.data.userData
            showMessage(`${platform.name} connected successfully!`, 'success')
            popup.close()
          }
        })
      } else {
        oauthStatus.value[platformId] = true
        oauthData.value[platformId] = response.userData
        showMessage(`${platform.name} connected successfully!`, 'success')
      }
    }
  } catch (error) {
    showMessage(`Failed to connect ${platform.name}: ${error.message}`, 'error')
  }
}

const disconnectOAuth = async (platformId) => {
  const platform = getCurrentPlatforms().find(p => p.id === platformId)
  if (!platform) return

  if (!confirm(`Disconnect ${platform.name}?`)) return

  try {
    await $fetch('/api/v1/disconnectSocialOAuth', {
      method: 'POST',
      body: { platform: platformId }
    })

    oauthStatus.value[platformId] = false
    oauthData.value[platformId] = null
    socialLinks.value[platformId] = ''

    Object.keys(apiKeys.value[platformId]).forEach(key => {
      apiKeys.value[platformId][key] = ''
    })

    showMessage(`${platform.name} disconnected`, 'success')
  } catch (error) {
    showMessage(`Failed to disconnect: ${error.message}`, 'error')
  }
}

const refreshToken = async (platformId) => {
  const platform = getCurrentPlatforms().find(p => p.id === platformId)
  if (!platform) return

  try {
    await $fetch('/api/v1/refreshSocialToken', {
      method: 'POST',
      body: { platform: platformId }
    })

    showMessage(`${platform.name} token refreshed`, 'success')
    loadOAuthStatus()
  } catch (error) {
    showMessage(`Failed to refresh: ${error.message}`, 'error')
  }
}

const saveLink = async (platformId) => {
  const platform = getCurrentPlatforms().find(p => p.id === platformId)
  if (!platform) return

  if (!socialLinks.value[platformId]) {
    showMessage('Please enter a link', 'error')
    return
  }

  try {
    await $fetch('/api/v1/updateSocialProfile', {
      method: 'POST',
      body: { platform: platformId, url: socialLinks.value[platformId] }
    })

    showMessage(`${platform.name} link saved!`, 'success')
  } catch (error) {
    showMessage(`Failed to save: ${error.message}`, 'error')
  }
}

const saveAllLinks = async () => {
  const connectedLinks = {}
  Object.keys(socialLinks.value).forEach(platformId => {
    if (oauthStatus.value[platformId] && socialLinks.value[platformId]) {
      connectedLinks[platformId] = socialLinks.value[platformId]
    }
  })

  if (Object.keys(connectedLinks).length === 0) {
    showMessage('No links to save', 'error')
    return
  }

  try {
    await $fetch('/api/v1/updateSocialProfile', {
      method: 'POST',
      body: { platform: 'all', profiles: connectedLinks }
    })

    showMessage('All links saved successfully!', 'success')
  } catch (error) {
    showMessage(`Failed to save: ${error.message}`, 'error')
  }
}

const loadOAuthStatus = async () => {
  try {
    const response = await $fetch('/api/v1/getSocialOAuthStatus')
    if (response.success) {
      Object.assign(oauthStatus.value, response.status)
      Object.assign(oauthData.value, response.data)
    }
  } catch (error) {
    console.error('Failed to load OAuth status:', error)
  }
}

const loadSocialLinks = async () => {
  try {
    const response = await $fetch('/api/v1/getSocialProfile')
    if (response.profiles) {
      Object.assign(socialLinks.value, response.profiles)
    }
  } catch (error) {
    console.error('Failed to load links:', error)
  }
}

const formatExpiry = (date) => {
  if (!date) return 'Never'
  return new Date(date).toLocaleString()
}

const showMessage = (msg, type) => {
  message.value = msg
  messageType.value = type
  setTimeout(() => { message.value = '' }, 4000)
}

onMounted(() => {
  loadOAuthStatus()
  loadSocialLinks()
})
</script>

<style scoped>
.social-profile-container {
  padding: 0;
  max-width: 100%;
  margin: 0 auto;
}

/* CATEGORY TABS */
.category-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.category-tab {
  padding: 10px 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #a0a0a0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.category-tab:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.category-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

/* MODE TOGGLE */
.mode-toggle {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
}

.mode-btn {
  padding: 10px 25px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: #a0a0a0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.mode-btn.active {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border-color: #11998e;
  color: white;
}

/* INFO BANNER */
.info-banner {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-banner i {
  color: #667eea;
  font-size: 18px;
}

.info-banner p {
  margin: 0;
  color: #d0d0d0;
  font-size: 13px;
}

/* PLATFORMS GRID */
.platforms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.platform-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.platform-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.card-header i {
  font-size: 24px;
  color: #667eea;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  flex: 1;
  color: #fff;
}

.status-badge {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-badge.connected,
.status-badge.unlocked {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.status-badge.disconnected,
.status-badge.locked {
  background: rgba(255, 59, 59, 0.2);
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}

/* INPUTS */
.api-input,
.link-input {
  width: 100%;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: white;
  font-size: 12px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.api-input:focus,
.link-input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.12);
}

.api-input::placeholder,
.link-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
}

/* BUTTONS */
.connect-btn,
.save-btn,
.unlock-btn {
  width: 100%;
  padding: 9px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.connect-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.connect-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 3px 12px rgba(102, 126, 234, 0.4);
}

.save-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.save-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.save-btn.saved {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.unlock-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: auto;
  padding: 6px 16px;
  font-size: 11px;
}

/* CONNECTED INFO */
.connected-info {
  background: rgba(17, 153, 142, 0.1);
  border: 1px solid rgba(17, 153, 142, 0.3);
  border-radius: 6px;
  padding: 10px;
}

.user-info,
.expiry-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #d0d0d0;
  margin-bottom: 6px;
}

.user-info i,
.expiry-info i {
  color: #38ef7d;
  font-size: 14px;
}

.action-btns {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.disconnect-btn,
.refresh-btn {
  flex: 1;
  padding: 6px 12px;
  border: none;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.disconnect-btn {
  background: rgba(255, 59, 59, 0.2);
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}

.disconnect-btn:hover {
  background: #ff3b3b;
  color: white;
}

.refresh-btn {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  border: 1px solid #667eea;
}

.refresh-btn:hover {
  background: #667eea;
  color: white;
}

/* LOCKED STATE */
.locked-state {
  text-align: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
}

.locked-state i {
  font-size: 28px;
  color: #ff6b6b;
  margin-bottom: 8px;
}

.locked-state p {
  margin: 8px 0;
  color: #a0a0a0;
  font-size: 12px;
}

/* BULK ACTIONS */
.bulk-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.bulk-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bulk-btn.save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.bulk-btn.save:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

/* TOAST MESSAGE */
.toast-message {
  position: fixed;
  bottom: 25px;
  right: 25px;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  animation: slideIn 0.3s ease;
  z-index: 10000;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
}

.toast-message.success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.toast-message.error {
  background: linear-gradient(135deg, #ff3b3b 0%, #ff6b6b 100%);
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .platforms-grid {
    grid-template-columns: 1fr;
  }

  .category-tabs {
    justify-content: flex-start;
  }

  .mode-toggle {
    flex-direction: column;
  }

  .mode-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
