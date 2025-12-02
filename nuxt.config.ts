// https://nuxt.com/docs/api/configuration/nuxt-config
// @ts-ignore
export default defineNuxtConfig({
  compatibilityDate: '2025-10-23',
  // ssr:false,
  modules: [
    '@nuxt/devtools',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    'nuxt-mongoose',
    '@bg-dev/nuxt-naiveui'
  ],

  hooks: {
    listen(server, { host, port }) {
      console.log('\n\n')
      console.log('\x1b[36m╔════════════════════════════════════════════════════════════════════════╗\x1b[0m')
      console.log('\x1b[36m║\x1b[0m \x1b[90m░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░\x1b[0m\x1b[36m║\x1b[0m')
      console.log('\x1b[36m║\x1b[0m   \x1b[35m🌌🚀✨\x1b[0m \x1b[1m\x1b[33mW E L C O M E   T O   C R Y P T O   A P P\x1b[0m \x1b[35m✨🚀🌌\x1b[0m              \x1b[36m║\x1b[0m')
      console.log('\x1b[36m║\x1b[0m \x1b[90m░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░\x1b[0m\x1b[36m║\x1b[0m')
      console.log('\x1b[36m║\x1b[0m                                                                        \x1b[36m║\x1b[0m')
      console.log('\x1b[36m║\x1b[0m  \x1b[32m💹 Advanced Multi-Exchange Trading Platform\x1b[0m                             \x1b[36m║\x1b[0m')
      console.log('\x1b[36m║\x1b[0m  \x1b[32m🤖 DCA Bots, Grid Trading & AI-Powered Strategies\x1b[0m                      \x1b[36m║\x1b[0m')
      console.log('\x1b[36m║\x1b[0m  \x1b[32m📊 Backtesting & Portfolio Management\x1b[0m                                   \x1b[36m║\x1b[0m')
      console.log('\x1b[36m║\x1b[0m  \x1b[32m🏛️  Palantir: Governance, Bots Deployment & Architecture\x1b[0m               \x1b[36m║\x1b[0m')
      console.log('\x1b[36m║\x1b[0m  \x1b[32m📈 Stock Trading & Web3 Tools Integration\x1b[0m                               \x1b[36m║\x1b[0m')
      console.log('\x1b[36m║\x1b[0m                                                                        \x1b[36m║\x1b[0m')
      console.log('\x1b[36m║\x1b[0m  \x1b[1m\x1b[36m░▒▓█─═★\x1b[0m \x1b[1m\x1b[34mF E A T U R E S\x1b[0m \x1b[1m\x1b[36m★═─█▓▒░\x1b[0m                                       \x1b[36m║\x1b[0m')
      console.log('\x1b[36m║\x1b[0m     \x1b[33m⚡\x1b[0m Real-time Trading       \x1b[33m📈\x1b[0m Technical Indicators                   \x1b[36m║\x1b[0m')
      console.log('\x1b[36m║\x1b[0m     \x1b[33m🧠\x1b[0m ML Strategies          \x1b[33m🎰\x1b[0m Casino & Betting Services              \x1b[36m║\x1b[0m')
      console.log('\x1b[36m║\x1b[0m     \x1b[33m🔄\x1b[0m Automated Grid Bots    \x1b[33m💰\x1b[0m Multi-Exchange Support                 \x1b[36m║\x1b[0m')
      console.log('\x1b[36m║\x1b[0m     \x1b[33m🔗\x1b[0m Web3 Tools             \x1b[33m👥\x1b[0m Social Profiles                        \x1b[36m║\x1b[0m')
      console.log('\x1b[36m║\x1b[0m                                                                        \x1b[36m║\x1b[0m')
      console.log('\x1b[36m║\x1b[0m  \x1b[35m💜 Made with love by\x1b[0m \x1b[1m\x1b[35m𝕊𝔸𝕍𝔸 ℂ𝔸ℤ𝔸ℕ\x1b[0m                                     \x1b[36m║\x1b[0m')
      console.log('\x1b[36m║\x1b[0m \x1b[90m░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░\x1b[0m\x1b[36m║\x1b[0m')
      console.log('\x1b[36m╚════════════════════════════════════════════════════════════════════════╝\x1b[0m')
      console.log('\n')
    }
  },

  mongoose: {
    uri: 'mongodb://127.0.0.1:27017/crypto-app-V1',
    options: {},
    modelsDir: 'models',
  },


  devtools: {
    enabled: false
  },

  // Runtime Config for Environment Variables (Security)
  runtimeConfig: {
    // Private keys (server-side only)
    jwtSecret: process.env.JWT_SECRET || 'change-this-to-a-secure-random-string-in-production',
    cookieSecret: process.env.COOKIE_SECRET || 'change-this-cookie-secret-in-production',

    // Public keys (exposed to client)
    public: {
      apiBase: process.env.API_BASE || 'http://localhost:3000'
    }
  },

  vite: {
    build: {
      rollupOptions: {
        external: [
          'ccxt',
          'node-telegram-bot-api',
          'whatsapp-web.js',
          'bcrypt',
          '@mtproto/core',
          '@polkadot/extension-dapp',
          'ws',
          // Wallet libraries - must be external
          // '@solana/web3.js', // REMOVED - bundling issues
          'bitcoinjs-lib',
          '@cosmjs/stargate',
          '@polkadot/keyring',
          'stellar-sdk',
          'near-api-js',
          'ripple-lib',
          'ton-crypto',
          '@taquito/taquito',
          'eosjs',
          // Proxy agents - external for server-side
          'http-proxy-agent',
          'https-proxy-agent',
          'socks-proxy-agent'
        ],
        onwarn(warning, warn) {
          // Ignore "sendError" unused import warnings from h3/nitro
          if (warning.code === 'UNUSED_EXTERNAL_IMPORT' && warning.message.includes('sendError')) {
            return;
          }
          // Show all other warnings
          warn(warning);
        }
      }
    },
    resolve: {
      alias: {
        // Prevent wallet libraries from being bundled on client-side
        // '@solana/web3.js': 'data:text/javascript,export default {}', // REMOVED
        'bitcoinjs-lib': 'data:text/javascript,export default {}',
        '@cosmjs/stargate': 'data:text/javascript,export default {}',
        '@polkadot/keyring': 'data:text/javascript,export default {}',
        'stellar-sdk': 'data:text/javascript,export default {}',
        'near-api-js': 'data:text/javascript,export default {}',
        'ripple-lib': 'data:text/javascript,export default {}',
        'ripple-keypairs': 'data:text/javascript,export default {}',
        'ton-crypto': 'data:text/javascript,export default {}',
        '@taquito/taquito': 'data:text/javascript,export default {}',
        'eosjs': 'data:text/javascript,export default {}'
      }
    },
    define: {
      // Define ws as a stub for browser environment
      'process.browser': 'true'
    },
    ssr: {
      noExternal: ['naive-ui', '@css-render/vue3-ssr', '@juggle/resize-observer']
    },
    optimizeDeps: {
      include: ['pinia', 'axios', 'chart.js', 'lodash'],
      exclude: [
        'ccxt',
        'whatsapp-web.js',
        'node-telegram-bot-api',
        '@tensorflow/tfjs',
        'http-proxy-agent',
        'https-proxy-agent',
        'socks-proxy-agent',
        'proxy-agent',
        'bcrypt',
        'telegraf',
        '@mtproto/core',
        'ws',
        // EVM Wallet packages
        // '@solana/wallet-adapter-base', // REMOVED
        // '@solana/wallet-adapter-wallets', // REMOVED
        'ethers',
        'algosdk',
        'aptos',
        'starknet',
        'tronweb',
        '@mysten/sui.js',
        'bip39',
        'bip32',
        'tiny-secp256k1',
        // Phase 1: Essential Networks
        'bitcoinjs-lib',
        // '@solana/web3.js', // REMOVED - bundling issues
        // 'bs58', // REMOVED - Solana dependency
        '@polkadot/api',
        '@polkadot/extension-dapp',
        '@polkadot/util-crypto',
        '@polkadot/keyring',
        '@cosmjs/crypto',
        '@cosmjs/encoding',
        '@cosmjs/stargate',
        'stellar-sdk',
        'near-api-js',
        // Phase 2: Popular Alts
        '@emurgo/cardano-serialization-lib-nodejs',
        'cardano-wallet-js',
        'ripple-lib',
        'ripple-keypairs',
        'ton',
        'ton-crypto',
        'ton-core',
        // Phase 3: Extended Support
        '@taquito/taquito',
        '@taquito/signer',
        '@dfinity/agent',
        '@dfinity/identity',
        'eosjs',
        'eosjs-ecc',
        // Phase 4: Additional Networks
        '@cityofzion/neon-js',
        '@waves/waves-crypto',
        '@stacks/transactions',
        '@stacks/wallet-sdk',
        '@glif/filecoin-address',
        'thor-devkit',
        '@multiversx/sdk-core',
        'mina-signer',
        'litecore-lib',
        'bitcore-lib-doge',
        '@psf/bitcoincashjs-lib',
        'bitcore-lib-zcash'
      ]
    }
  },

  nitro: {
    // Ignore backup wallet files completely
    ignore: [
      'server/api/v1/_BACKUP_WALLETS/**',
      'server/utils/bitcoinWalletGenerator.js',
      'server/utils/walletGenerators/**',
      'pages/wallet/**',
      'pages/TestNetWallet/**'
    ],
    externals: {
      inline: ['naive-ui'],
      // DO NOT inline these - keep them external
      external: [
        'ccxt',
        'whatsapp-web.js',
        'node-telegram-bot-api',
        'telegraf',
        'bcrypt',
        '@mtproto/core',
        // Wallet libraries - must be server-side only
        'bitcoinjs-lib',
        // '@solana/web3.js', // REMOVED - bundling issues
        '@polkadot/api',
        '@polkadot/keyring',
        '@cosmjs/crypto',
        '@cosmjs/stargate',
        'stellar-sdk',
        'near-api-js',
        'cardano-wallet-js',
        'ripple-lib',
        'ton',
        '@taquito/taquito',
        'eosjs',
        '@multiversx/sdk-core'
      ]
    },
    // Optimize server startup
    experimental: {
      tasks: true
    },
    // Increase timeouts for slow dependencies
    timing: true,
    minify: false, // Faster dev startup
    sourceMap: false, // Faster dev startup
    // Allow importing node built-ins
    node: true
  },

  // Performance optimizations
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: false
  }
})
