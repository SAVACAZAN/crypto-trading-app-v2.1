<template>
  <div class="crypto-wallet-container">
    <!-- Header -->
    <div class="wallet-header">
      <h2>💰 Crypto Wallets</h2>
      <p>Manage your cryptocurrency wallets and addresses</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <n-spin size="large" />
      <p>Loading your wallets...</p>
    </div>

    <!-- Crypto List -->
    <div v-else class="crypto-list">
      <!-- Bitcoin Card -->
      <div class="crypto-card btc-card" @click="openBitcoinWallet">
        <div class="card-header">
          <div class="crypto-icon btc">₿</div>
          <div class="crypto-info">
            <h3>Bitcoin</h3>
            <span class="crypto-symbol">BTC</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalBtcWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalBtcAddresses }}</span>
          </div>
        </div>

        <div v-if="bitcoinWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in bitcoinWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.wallets[0]?.addresses?.nativeSegwit?.address)">
              {{ formatAddressShort(wallet.wallets[0]?.addresses?.nativeSegwit?.address) }}
            </n-button>
          </div>
          <div v-if="bitcoinWallets.length > 2" class="more-indicator">
            +{{ bitcoinWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateBitcoinWallet" :loading="generatingBtc" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Ethereum Card -->
      <div class="crypto-card eth-card" @click="openEthereumWallet">
        <div class="card-header">
          <div class="crypto-icon eth">Ξ</div>
          <div class="crypto-info">
            <h3>Ethereum</h3>
            <span class="crypto-symbol">ETH</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalEthWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Balance</span>
            <span class="stat-value">{{ totalEthBalance.toFixed(4) }} ETH</span>
          </div>
        </div>

        <div v-if="ethereumWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in ethereumWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="ethereumWallets.length > 2" class="more-indicator">
            +{{ ethereumWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateEthWallet" :loading="generatingEthWallet" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- BASE Network Card -->
      <div class="crypto-card base-card" @click="navigateTo('/BASENetwork')">
        <div class="card-header">
          <div class="crypto-icon base">🔵</div>
          <div class="crypto-info">
            <h3>BASE</h3>
            <span class="crypto-symbol">BASE</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalBaseWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalBaseAddresses }}</span>
          </div>
        </div>

        <div v-if="baseWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in baseWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="baseWallets.length > 2" class="more-indicator">
            +{{ baseWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateBaseWallet" :loading="generatingBase" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Polygon Network Card -->
      <div class="crypto-card polygon-card" @click="navigateTo('/PolygonNetwork')">
        <div class="card-header">
          <div class="crypto-icon polygon">⬢</div>
          <div class="crypto-info">
            <h3>Polygon</h3>
            <span class="crypto-symbol">POL</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalPolygonWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalPolygonAddresses }}</span>
          </div>
        </div>

        <div v-if="polygonWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in polygonWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="polygonWallets.length > 2" class="more-indicator">
            +{{ polygonWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generatePolygonWallet" :loading="generatingPolygon" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Arbitrum Network Card -->
      <div class="crypto-card arbitrum-card" @click="navigateTo('/ARBNetwork')">
        <div class="card-header">
          <div class="crypto-icon arbitrum">🔷</div>
          <div class="crypto-info">
            <h3>Arbitrum</h3>
            <span class="crypto-symbol">ARB</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalArbitrumWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalArbitrumAddresses }}</span>
          </div>
        </div>

        <div v-if="arbitrumWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in arbitrumWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="arbitrumWallets.length > 2" class="more-indicator">
            +{{ arbitrumWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateArbitrumWallet" :loading="generatingArbitrum" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Optimism Network Card -->
      <div class="crypto-card optimism-card" @click="navigateTo('/OptimismNetwork')">
        <div class="card-header">
          <div class="crypto-icon optimism">🔴</div>
          <div class="crypto-info">
            <h3>Optimism</h3>
            <span class="crypto-symbol">OP</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalOptimismWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalOptimismAddresses }}</span>
          </div>
        </div>

        <div v-if="optimismWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in optimismWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="optimismWallets.length > 2" class="more-indicator">
            +{{ optimismWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateOptimismWallet" :loading="generatingOptimism" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- BNB Chain Card -->
      <div class="crypto-card bnb-card" @click="navigateTo('/BNBNetwork')">
        <div class="card-header">
          <div class="crypto-icon bnb">🟡</div>
          <div class="crypto-info">
            <h3>BNB Chain</h3>
            <span class="crypto-symbol">BNB</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalBNBWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalBNBAddresses }}</span>
          </div>
        </div>

        <div v-if="bnbWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in bnbWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="bnbWallets.length > 2" class="more-indicator">
            +{{ bnbWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateBNBWallet" :loading="generatingBNB" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Avalanche Network Card -->
      <div class="crypto-card avalanche-card" @click="navigateTo('/AvalancheNetwork')">
        <div class="card-header">
          <div class="crypto-icon avalanche">🔺</div>
          <div class="crypto-info">
            <h3>Avalanche</h3>
            <span class="crypto-symbol">AVAX</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalAvalancheWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalAvalancheAddresses }}</span>
          </div>
        </div>

        <div v-if="avalancheWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in avalancheWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="avalancheWallets.length > 2" class="more-indicator">
            +{{ avalancheWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateAvalancheWallet" :loading="generatingAvalanche" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- zkSync Era Card -->
      <div class="crypto-card zksync-card" @click="navigateTo('/zkSyncNetwork')">
        <div class="card-header">
          <div class="crypto-icon zksync">⚡</div>
          <div class="crypto-info">
            <h3>zkSync Era</h3>
            <span class="crypto-symbol">ZK</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalZkSyncWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalZkSyncAddresses }}</span>
          </div>
        </div>

        <div v-if="zkSyncWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in zkSyncWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="zkSyncWallets.length > 2" class="more-indicator">
            +{{ zkSyncWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateZkSyncWallet" :loading="generatingZkSync" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Fantom Card -->
      <div class="crypto-card fantom-card" @click="navigateTo('/FantomNetwork')">
        <div class="card-header">
          <div class="crypto-icon fantom">👻</div>
          <div class="crypto-info">
            <h3>Fantom</h3>
            <span class="crypto-symbol">FTM</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalFantomWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalFantomAddresses }}</span>
          </div>
        </div>

        <div v-if="fantomWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in fantomWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="fantomWallets.length > 2" class="more-indicator">
            +{{ fantomWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateFantomWallet" :loading="generatingFantom" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Linea Card -->
      <div class="crypto-card linea-card" @click="navigateTo('/LineaNetwork')">
        <div class="card-header">
          <div class="crypto-icon linea">📐</div>
          <div class="crypto-info">
            <h3>Linea</h3>
            <span class="crypto-symbol">ETH</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalLineaWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalLineaAddresses }}</span>
          </div>
        </div>

        <div v-if="lineaWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in lineaWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="lineaWallets.length > 2" class="more-indicator">
            +{{ lineaWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateLineaWallet" :loading="generatingLinea" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Scroll Card -->
      <div class="crypto-card scroll-card" @click="navigateTo('/ScrollNetwork')">
        <div class="card-header">
          <div class="crypto-icon scroll">📜</div>
          <div class="crypto-info">
            <h3>Scroll</h3>
            <span class="crypto-symbol">ETH</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalScrollWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalScrollAddresses }}</span>
          </div>
        </div>

        <div v-if="scrollWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in scrollWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="scrollWallets.length > 2" class="more-indicator">
            +{{ scrollWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateScrollWallet" :loading="generatingScroll" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Blast Card -->
      <div class="crypto-card blast-card" @click="navigateTo('/BlastNetwork')">
        <div class="card-header">
          <div class="crypto-icon blast">💥</div>
          <div class="crypto-info">
            <h3>Blast</h3>
            <span class="crypto-symbol">BLAST</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalBlastWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalBlastAddresses }}</span>
          </div>
        </div>

        <div v-if="blastWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in blastWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="blastWallets.length > 2" class="more-indicator">
            +{{ blastWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateBlastWallet" :loading="generatingBlast" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Mantle Card -->
      <div class="crypto-card mantle-card" @click="navigateTo('/MantleNetwork')">
        <div class="card-header">
          <div class="crypto-icon mantle">🧥</div>
          <div class="crypto-info">
            <h3>Mantle</h3>
            <span class="crypto-symbol">MNT</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalMantleWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalMantleAddresses }}</span>
          </div>
        </div>

        <div v-if="mantleWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in mantleWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="mantleWallets.length > 2" class="more-indicator">
            +{{ mantleWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateMantleWallet" :loading="generatingMantle" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Cronos Card -->
      <div class="crypto-card cronos-card" @click="navigateTo('/CronosNetwork')">
        <div class="card-header">
          <div class="crypto-icon cronos">🔷</div>
          <div class="crypto-info">
            <h3>Cronos</h3>
            <span class="crypto-symbol">CRO</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalCronosWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalCronosAddresses }}</span>
          </div>
        </div>

        <div v-if="cronosWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in cronosWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="cronosWallets.length > 2" class="more-indicator">
            +{{ cronosWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateCronosWallet" :loading="generatingCronos" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Harmony Card -->
      <div class="crypto-card harmony-card" @click="navigateTo('/HarmonyNetwork')">
        <div class="card-header">
          <div class="crypto-icon harmony">⭕</div>
          <div class="crypto-info">
            <h3>Harmony</h3>
            <span class="crypto-symbol">ONE</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalHarmonyWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalHarmonyAddresses }}</span>
          </div>
        </div>

        <div v-if="harmonyWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in harmonyWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="harmonyWallets.length > 2" class="more-indicator">
            +{{ harmonyWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateHarmonyWallet" :loading="generatingHarmony" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Moonbeam Card -->
      <div class="crypto-card moonbeam-card" @click="navigateTo('/MoonbeamNetwork')">
        <div class="card-header">
          <div class="crypto-icon moonbeam">🌙</div>
          <div class="crypto-info">
            <h3>Moonbeam</h3>
            <span class="crypto-symbol">GLMR</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalMoonbeamWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalMoonbeamAddresses }}</span>
          </div>
        </div>

        <div v-if="moonbeamWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in moonbeamWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="moonbeamWallets.length > 2" class="more-indicator">
            +{{ moonbeamWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateMoonbeamWallet" :loading="generatingMoonbeam" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Gnosis Chain Card -->
      <div class="crypto-card gnosis-card" @click="navigateTo('/GnosisNetwork')">
        <div class="card-header">
          <div class="crypto-icon gnosis">🦉</div>
          <div class="crypto-info">
            <h3>Gnosis Chain</h3>
            <span class="crypto-symbol">xDAI</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalGnosisWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalGnosisAddresses }}</span>
          </div>
        </div>

        <div v-if="gnosisWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in gnosisWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="gnosisWallets.length > 2" class="more-indicator">
            +{{ gnosisWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateGnosisWallet" :loading="generatingGnosis" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

<!-- ========== PHASE 3+ NEW NETWORKS ========== -->

      <!-- Ronin Card -->
      <div class="crypto-card ronin-card" @click="navigateTo('/RoninNetwork')">
        <div class="card-header">
          <div class="crypto-icon ronin">⚔️</div>
          <div class="crypto-info">
            <h3>Ronin</h3>
            <span class="crypto-symbol">RON</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalRoninWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalRoninAddresses }}</span>
          </div>
        </div>

        <div v-if="roninWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in roninWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="roninWallets.length > 2" class="more-indicator">
            +{{ roninWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateRoninWallet" :loading="generatingRonin" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Immutable zkEVM Card -->
      <div class="crypto-card immutableZkEVM-card" @click="navigateTo('/ImmutableZkEVMNetwork')">
        <div class="card-header">
          <div class="crypto-icon immutableZkEVM">🎯</div>
          <div class="crypto-info">
            <h3>Immutable zkEVM</h3>
            <span class="crypto-symbol">IMX</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalImmutableZkEVMWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalImmutableZkEVMAddresses }}</span>
          </div>
        </div>

        <div v-if="immutableZkEVMWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in immutableZkEVMWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="immutableZkEVMWallets.length > 2" class="more-indicator">
            +{{ immutableZkEVMWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateImmutableZkEVMWallet" :loading="generatingImmutableZkEVM" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Beam Card -->
      <div class="crypto-card beam-card" @click="navigateTo('/BeamNetwork')">
        <div class="card-header">
          <div class="crypto-icon beam">🌟</div>
          <div class="crypto-info">
            <h3>Beam</h3>
            <span class="crypto-symbol">BEAM</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalBeamWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalBeamAddresses }}</span>
          </div>
        </div>

        <div v-if="beamWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in beamWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="beamWallets.length > 2" class="more-indicator">
            +{{ beamWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateBeamWallet" :loading="generatingBeam" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Oasys Card -->
      <div class="crypto-card oasys-card" @click="navigateTo('/OasysNetwork')">
        <div class="card-header">
          <div class="crypto-icon oasys">🏝️</div>
          <div class="crypto-info">
            <h3>Oasys</h3>
            <span class="crypto-symbol">OAS</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalOasysWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalOasysAddresses }}</span>
          </div>
        </div>

        <div v-if="oasysWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in oasysWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="oasysWallets.length > 2" class="more-indicator">
            +{{ oasysWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateOasysWallet" :loading="generatingOasys" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Polygon zkEVM Card -->
      <div class="crypto-card polygonZkEVM-card" @click="navigateTo('/PolygonZkEVMNetwork')">
        <div class="card-header">
          <div class="crypto-icon polygonZkEVM">🔷</div>
          <div class="crypto-info">
            <h3>Polygon zkEVM</h3>
            <span class="crypto-symbol">ETH</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalPolygonZkEVMWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalPolygonZkEVMAddresses }}</span>
          </div>
        </div>

        <div v-if="polygonZkEVMWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in polygonZkEVMWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="polygonZkEVMWallets.length > 2" class="more-indicator">
            +{{ polygonZkEVMWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generatePolygonZkEVMWallet" :loading="generatingPolygonZkEVM" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Boba Network Card -->
      <div class="crypto-card boba-card" @click="navigateTo('/BobaNetwork')">
        <div class="card-header">
          <div class="crypto-icon boba">🧋</div>
          <div class="crypto-info">
            <h3>Boba Network</h3>
            <span class="crypto-symbol">BOBA</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalBobaWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalBobaAddresses }}</span>
          </div>
        </div>

        <div v-if="bobaWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in bobaWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="bobaWallets.length > 2" class="more-indicator">
            +{{ bobaWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateBobaWallet" :loading="generatingBoba" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Metis Card -->
      <div class="crypto-card metis-card" @click="navigateTo('/MetisNetwork')">
        <div class="card-header">
          <div class="crypto-icon metis">🌊</div>
          <div class="crypto-info">
            <h3>Metis</h3>
            <span class="crypto-symbol">METIS</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalMetisWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalMetisAddresses }}</span>
          </div>
        </div>

        <div v-if="metisWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in metisWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="metisWallets.length > 2" class="more-indicator">
            +{{ metisWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateMetisWallet" :loading="generatingMetis" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Aurora Card -->
      <div class="crypto-card aurora-card" @click="navigateTo('/AuroraNetwork')">
        <div class="card-header">
          <div class="crypto-icon aurora">🌌</div>
          <div class="crypto-info">
            <h3>Aurora</h3>
            <span class="crypto-symbol">ETH</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalAuroraWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalAuroraAddresses }}</span>
          </div>
        </div>

        <div v-if="auroraWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in auroraWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="auroraWallets.length > 2" class="more-indicator">
            +{{ auroraWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateAuroraWallet" :loading="generatingAurora" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Redstone Card -->
      <div class="crypto-card redstone-card" @click="navigateTo('/RedstoneNetwork')">
        <div class="card-header">
          <div class="crypto-icon redstone">🔴</div>
          <div class="crypto-info">
            <h3>Redstone</h3>
            <span class="crypto-symbol">RED</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalRedstoneWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalRedstoneAddresses }}</span>
          </div>
        </div>

        <div v-if="redstoneWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in redstoneWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="redstoneWallets.length > 2" class="more-indicator">
            +{{ redstoneWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateRedstoneWallet" :loading="generatingRedstone" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- opBNB Card -->
      <div class="crypto-card opBNB-card" @click="navigateTo('/OpBNBNetwork')">
        <div class="card-header">
          <div class="crypto-icon opBNB">⚡</div>
          <div class="crypto-info">
            <h3>opBNB</h3>
            <span class="crypto-symbol">BNB</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalOpBNBWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalOpBNBAddresses }}</span>
          </div>
        </div>

        <div v-if="opBNBWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in opBNBWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="opBNBWallets.length > 2" class="more-indicator">
            +{{ opBNBWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateOpBNBWallet" :loading="generatingOpBNB" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Arbitrum Nova Card -->
      <div class="crypto-card arbitrumNova-card" @click="navigateTo('/ArbitrumNovaNetwork')">
        <div class="card-header">
          <div class="crypto-icon arbitrumNova">🎮</div>
          <div class="crypto-info">
            <h3>Arbitrum Nova</h3>
            <span class="crypto-symbol">ETH</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalArbitrumNovaWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalArbitrumNovaAddresses }}</span>
          </div>
        </div>

        <div v-if="arbitrumNovaWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in arbitrumNovaWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="arbitrumNovaWallets.length > 2" class="more-indicator">
            +{{ arbitrumNovaWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateArbitrumNovaWallet" :loading="generatingArbitrumNova" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Zora Network Card -->
      <div class="crypto-card zora-card" @click="navigateTo('/ZoraNetwork')">
        <div class="card-header">
          <div class="crypto-icon zora">🎨</div>
          <div class="crypto-info">
            <h3>Zora Network</h3>
            <span class="crypto-symbol">ETH</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalZoraWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalZoraAddresses }}</span>
          </div>
        </div>

        <div v-if="zoraWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in zoraWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="zoraWallets.length > 2" class="more-indicator">
            +{{ zoraWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateZoraWallet" :loading="generatingZora" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Manta Pacific Card -->
      <div class="crypto-card mantaPacific-card" @click="navigateTo('/MantaPacificNetwork')">
        <div class="card-header">
          <div class="crypto-icon mantaPacific">🦈</div>
          <div class="crypto-info">
            <h3>Manta Pacific</h3>
            <span class="crypto-symbol">ETH</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalMantaPacificWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalMantaPacificAddresses }}</span>
          </div>
        </div>

        <div v-if="mantaPacificWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in mantaPacificWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="mantaPacificWallets.length > 2" class="more-indicator">
            +{{ mantaPacificWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateMantaPacificWallet" :loading="generatingMantaPacific" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Morph L2 Card -->
      <div class="crypto-card morphL2-card" @click="navigateTo('/MorphL2Network')">
        <div class="card-header">
          <div class="crypto-icon morphL2">🔀</div>
          <div class="crypto-info">
            <h3>Morph L2</h3>
            <span class="crypto-symbol">ETH</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalMorphL2Wallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalMorphL2Addresses }}</span>
          </div>
        </div>

        <div v-if="morphL2Wallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in morphL2Wallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="morphL2Wallets.length > 2" class="more-indicator">
            +{{ morphL2Wallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateMorphL2Wallet" :loading="generatingMorphL2" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Xai Network Card -->
      <div class="crypto-card xai-card" @click="navigateTo('/XaiNetwork')">
        <div class="card-header">
          <div class="crypto-icon xai">🎯</div>
          <div class="crypto-info">
            <h3>Xai Network</h3>
            <span class="crypto-symbol">XAI</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalXaiWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalXaiAddresses }}</span>
          </div>
        </div>

        <div v-if="xaiWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in xaiWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="xaiWallets.length > 2" class="more-indicator">
            +{{ xaiWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateXaiWallet" :loading="generatingXai" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Fraxtal Card -->
      <div class="crypto-card fraxtal-card" @click="navigateTo('/FraxtalNetwork')">
        <div class="card-header">
          <div class="crypto-icon fraxtal">❄️</div>
          <div class="crypto-info">
            <h3>Fraxtal</h3>
            <span class="crypto-symbol">frxETH</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalFraxtalWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalFraxtalAddresses }}</span>
          </div>
        </div>

        <div v-if="fraxtalWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in fraxtalWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="fraxtalWallets.length > 2" class="more-indicator">
            +{{ fraxtalWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateFraxtalWallet" :loading="generatingFraxtal" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Taiko Card -->
      <div class="crypto-card taiko-card" @click="navigateTo('/TaikoNetwork')">
        <div class="card-header">
          <div class="crypto-icon taiko">⛩️</div>
          <div class="crypto-info">
            <h3>Taiko</h3>
            <span class="crypto-symbol">TAIKO</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalTaikoWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalTaikoAddresses }}</span>
          </div>
        </div>

        <div v-if="taikoWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in taikoWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="taikoWallets.length > 2" class="more-indicator">
            +{{ taikoWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateTaikoWallet" :loading="generatingTaiko" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Mode Network Card -->
      <div class="crypto-card modeNetwork-card" @click="navigateTo('/ModeNetworkNetwork')">
        <div class="card-header">
          <div class="crypto-icon modeNetwork">🟢</div>
          <div class="crypto-info">
            <h3>Mode Network</h3>
            <span class="crypto-symbol">MODE</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalModeNetworkWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalModeNetworkAddresses }}</span>
          </div>
        </div>

        <div v-if="modeNetworkWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in modeNetworkWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="modeNetworkWallets.length > 2" class="more-indicator">
            +{{ modeNetworkWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateModeNetworkWallet" :loading="generatingModeNetwork" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Celo Card -->
      <div class="crypto-card celo-card" @click="navigateTo('/CeloNetwork')">
        <div class="card-header">
          <div class="crypto-icon celo">📱</div>
          <div class="crypto-info">
            <h3>Celo</h3>
            <span class="crypto-symbol">CELO</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalCeloWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalCeloAddresses }}</span>
          </div>
        </div>

        <div v-if="celoWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in celoWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="celoWallets.length > 2" class="more-indicator">
            +{{ celoWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateCeloWallet" :loading="generatingCelo" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Hedera Card -->
      <div class="crypto-card hedera-card" @click="navigateTo('/HederaNetwork')">
        <div class="card-header">
          <div class="crypto-icon hedera">ⓗ</div>
          <div class="crypto-info">
            <h3>Hedera</h3>
            <span class="crypto-symbol">HBAR</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalHederaWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalHederaAddresses }}</span>
          </div>
        </div>

        <div v-if="hederaWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in hederaWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="hederaWallets.length > 2" class="more-indicator">
            +{{ hederaWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateHederaWallet" :loading="generatingHedera" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Sei Network Card -->
      <div class="crypto-card sei-card" @click="navigateTo('/SeiNetwork')">
        <div class="card-header">
          <div class="crypto-icon sei">🌊</div>
          <div class="crypto-info">
            <h3>Sei Network</h3>
            <span class="crypto-symbol">SEI</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalSeiWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalSeiAddresses }}</span>
          </div>
        </div>

        <div v-if="seiWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in seiWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="seiWallets.length > 2" class="more-indicator">
            +{{ seiWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateSeiWallet" :loading="generatingSei" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Kava Card -->
      <div class="crypto-card kava-card" @click="navigateTo('/KavaNetwork')">
        <div class="card-header">
          <div class="crypto-icon kava">🔴</div>
          <div class="crypto-info">
            <h3>Kava</h3>
            <span class="crypto-symbol">KAVA</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalKavaWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalKavaAddresses }}</span>
          </div>
        </div>

        <div v-if="kavaWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in kavaWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="kavaWallets.length > 2" class="more-indicator">
            +{{ kavaWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateKavaWallet" :loading="generatingKava" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Shimmer EVM Card -->
      <div class="crypto-card shimmerEVM-card" @click="navigateTo('/ShimmerEVMNetwork')">
        <div class="card-header">
          <div class="crypto-icon shimmerEVM">✨</div>
          <div class="crypto-info">
            <h3>Shimmer EVM</h3>
            <span class="crypto-symbol">SMR</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalShimmerEVMWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalShimmerEVMAddresses }}</span>
          </div>
        </div>

        <div v-if="shimmerEVMWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in shimmerEVMWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="shimmerEVMWallets.length > 2" class="more-indicator">
            +{{ shimmerEVMWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateShimmerEVMWallet" :loading="generatingShimmerEVM" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Conflux eSpace Card -->
      <div class="crypto-card confluxESpace-card" @click="navigateTo('/ConfluxESpaceNetwork')">
        <div class="card-header">
          <div class="crypto-icon confluxESpace">🌐</div>
          <div class="crypto-info">
            <h3>Conflux eSpace</h3>
            <span class="crypto-symbol">CFX</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalConfluxESpaceWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalConfluxESpaceAddresses }}</span>
          </div>
        </div>

        <div v-if="confluxESpaceWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in confluxESpaceWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="confluxESpaceWallets.length > 2" class="more-indicator">
            +{{ confluxESpaceWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateConfluxESpaceWallet" :loading="generatingConfluxESpace" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Oasis Emerald Card -->
      <div class="crypto-card oasisEmerald-card" @click="navigateTo('/OasisEmeraldNetwork')">
        <div class="card-header">
          <div class="crypto-icon oasisEmerald">🌹</div>
          <div class="crypto-info">
            <h3>Oasis Emerald</h3>
            <span class="crypto-symbol">ROSE</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalOasisEmeraldWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalOasisEmeraldAddresses }}</span>
          </div>
        </div>

        <div v-if="oasisEmeraldWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in oasisEmeraldWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="oasisEmeraldWallets.length > 2" class="more-indicator">
            +{{ oasisEmeraldWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateOasisEmeraldWallet" :loading="generatingOasisEmerald" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Energy Web Card -->
      <div class="crypto-card energyWeb-card" @click="navigateTo('/EnergyWebNetwork')">
        <div class="card-header">
          <div class="crypto-icon energyWeb">⚡</div>
          <div class="crypto-info">
            <h3>Energy Web</h3>
            <span class="crypto-symbol">EWT</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalEnergyWebWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalEnergyWebAddresses }}</span>
          </div>
        </div>

        <div v-if="energyWebWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in energyWebWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="energyWebWallets.length > 2" class="more-indicator">
            +{{ energyWebWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateEnergyWebWallet" :loading="generatingEnergyWeb" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Telos EVM Card -->
      <div class="crypto-card telosEVM-card" @click="navigateTo('/TelosEVMNetwork')">
        <div class="card-header">
          <div class="crypto-icon telosEVM">🔷</div>
          <div class="crypto-info">
            <h3>Telos EVM</h3>
            <span class="crypto-symbol">TLOS</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalTelosEVMWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalTelosEVMAddresses }}</span>
          </div>
        </div>

        <div v-if="telosEVMWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in telosEVMWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="telosEVMWallets.length > 2" class="more-indicator">
            +{{ telosEVMWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateTelosEVMWallet" :loading="generatingTelosEVM" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Horizen EON Card -->
      <div class="crypto-card horizenEON-card" @click="navigateTo('/HorizenEONNetwork')">
        <div class="card-header">
          <div class="crypto-icon horizenEON">🔐</div>
          <div class="crypto-info">
            <h3>Horizen EON</h3>
            <span class="crypto-symbol">ZEN</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalHorizenEONWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalHorizenEONAddresses }}</span>
          </div>
        </div>

        <div v-if="horizenEONWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in horizenEONWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="horizenEONWallets.length > 2" class="more-indicator">
            +{{ horizenEONWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateHorizenEONWallet" :loading="generatingHorizenEON" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Viction Card -->
      <div class="crypto-card viction-card" @click="navigateTo('/VictionNetwork')">
        <div class="card-header">
          <div class="crypto-icon viction">🎯</div>
          <div class="crypto-info">
            <h3>Viction</h3>
            <span class="crypto-symbol">VIC</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalVictionWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalVictionAddresses }}</span>
          </div>
        </div>

        <div v-if="victionWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in victionWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="victionWallets.length > 2" class="more-indicator">
            +{{ victionWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateVictionWallet" :loading="generatingViction" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Fuse Network Card -->
      <div class="crypto-card fuse-card" @click="navigateTo('/FuseNetwork')">
        <div class="card-header">
          <div class="crypto-icon fuse">💳</div>
          <div class="crypto-info">
            <h3>Fuse Network</h3>
            <span class="crypto-symbol">FUSE</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalFuseWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalFuseAddresses }}</span>
          </div>
        </div>

        <div v-if="fuseWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in fuseWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="fuseWallets.length > 2" class="more-indicator">
            +{{ fuseWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateFuseWallet" :loading="generatingFuse" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Syscoin Card -->
      <div class="crypto-card syscoin-card" @click="navigateTo('/SyscoinNetwork')">
        <div class="card-header">
          <div class="crypto-icon syscoin">🔷</div>
          <div class="crypto-info">
            <h3>Syscoin</h3>
            <span class="crypto-symbol">SYS</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalSyscoinWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalSyscoinAddresses }}</span>
          </div>
        </div>

        <div v-if="syscoinWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in syscoinWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="syscoinWallets.length > 2" class="more-indicator">
            +{{ syscoinWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateSyscoinWallet" :loading="generatingSyscoin" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- ThunderCore Card -->
      <div class="crypto-card thunderCore-card" @click="navigateTo('/ThunderCoreNetwork')">
        <div class="card-header">
          <div class="crypto-icon thunderCore">⚡</div>
          <div class="crypto-info">
            <h3>ThunderCore</h3>
            <span class="crypto-symbol">TT</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalThunderCoreWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalThunderCoreAddresses }}</span>
          </div>
        </div>

        <div v-if="thunderCoreWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in thunderCoreWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="thunderCoreWallets.length > 2" class="more-indicator">
            +{{ thunderCoreWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateThunderCoreWallet" :loading="generatingThunderCore" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Astar Card -->
      <div class="crypto-card astar-card" @click="navigateTo('/AstarNetwork')">
        <div class="card-header">
          <div class="crypto-icon astar">⭐</div>
          <div class="crypto-info">
            <h3>Astar</h3>
            <span class="crypto-symbol">ASTR</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalAstarWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalAstarAddresses }}</span>
          </div>
        </div>

        <div v-if="astarWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in astarWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="astarWallets.length > 2" class="more-indicator">
            +{{ astarWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateAstarWallet" :loading="generatingAstar" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Shiden Card -->
      <div class="crypto-card shiden-card" @click="navigateTo('/ShidenNetwork')">
        <div class="card-header">
          <div class="crypto-icon shiden">🦋</div>
          <div class="crypto-info">
            <h3>Shiden</h3>
            <span class="crypto-symbol">SDN</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalShidenWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalShidenAddresses }}</span>
          </div>
        </div>

        <div v-if="shidenWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in shidenWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="shidenWallets.length > 2" class="more-indicator">
            +{{ shidenWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateShidenWallet" :loading="generatingShiden" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Efinity Card -->
      <div class="crypto-card efinity-card" @click="navigateTo('/EfinityNetwork')">
        <div class="card-header">
          <div class="crypto-icon efinity">💎</div>
          <div class="crypto-info">
            <h3>Efinity</h3>
            <span class="crypto-symbol">EFI</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalEfinityWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalEfinityAddresses }}</span>
          </div>
        </div>

        <div v-if="efinityWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in efinityWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="efinityWallets.length > 2" class="more-indicator">
            +{{ efinityWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateEfinityWallet" :loading="generatingEfinity" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- World Chain Card -->
      <div class="crypto-card worldChain-card" @click="navigateTo('/WorldChainNetwork')">
        <div class="card-header">
          <div class="crypto-icon worldChain">🌍</div>
          <div class="crypto-info">
            <h3>World Chain</h3>
            <span class="crypto-symbol">WLD</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalWorldChainWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalWorldChainAddresses }}</span>
          </div>
        </div>

        <div v-if="worldChainWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in worldChainWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="worldChainWallets.length > 2" class="more-indicator">
            +{{ worldChainWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateWorldChainWallet" :loading="generatingWorldChain" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Sonic Card -->
      <div class="crypto-card sonic-card" @click="navigateTo('/SonicNetwork')">
        <div class="card-header">
          <div class="crypto-icon sonic">💨</div>
          <div class="crypto-info">
            <h3>Sonic</h3>
            <span class="crypto-symbol">S</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalSonicWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalSonicAddresses }}</span>
          </div>
        </div>

        <div v-if="sonicWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in sonicWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="sonicWallets.length > 2" class="more-indicator">
            +{{ sonicWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateSonicWallet" :loading="generatingSonic" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Flare Network Card -->
      <div class="crypto-card flare-card" @click="navigateTo('/FlareNetwork')">
        <div class="card-header">
          <div class="crypto-icon flare">🔥</div>
          <div class="crypto-info">
            <h3>Flare Network</h3>
            <span class="crypto-symbol">FLR</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalFlareWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalFlareAddresses }}</span>
          </div>
        </div>

        <div v-if="flareWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in flareWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="flareWallets.length > 2" class="more-indicator">
            +{{ flareWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateFlareWallet" :loading="generatingFlare" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Songbird Card -->
      <div class="crypto-card songbird-card" @click="navigateTo('/SongbirdNetwork')">
        <div class="card-header">
          <div class="crypto-icon songbird">🐦</div>
          <div class="crypto-info">
            <h3>Songbird</h3>
            <span class="crypto-symbol">SGB</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalSongbirdWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalSongbirdAddresses }}</span>
          </div>
        </div>

        <div v-if="songbirdWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in songbirdWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="songbirdWallets.length > 2" class="more-indicator">
            +{{ songbirdWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateSongbirdWallet" :loading="generatingSongbird" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- ZetaChain Card -->
      <div class="crypto-card zetaChain-card" @click="navigateTo('/ZetaChainNetwork')">
        <div class="card-header">
          <div class="crypto-icon zetaChain">⛓️</div>
          <div class="crypto-info">
            <h3>ZetaChain</h3>
            <span class="crypto-symbol">ZETA</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalZetaChainWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalZetaChainAddresses }}</span>
          </div>
        </div>

        <div v-if="zetaChainWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in zetaChainWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="zetaChainWallets.length > 2" class="more-indicator">
            +{{ zetaChainWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateZetaChainWallet" :loading="generatingZetaChain" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- SmartBCH Card -->
      <div class="crypto-card smartBCH-card" @click="navigateTo('/SmartBCHNetwork')">
        <div class="card-header">
          <div class="crypto-icon smartBCH">💚</div>
          <div class="crypto-info">
            <h3>SmartBCH</h3>
            <span class="crypto-symbol">BCH</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalSmartBCHWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalSmartBCHAddresses }}</span>
          </div>
        </div>

        <div v-if="smartBCHWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in smartBCHWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="smartBCHWallets.length > 2" class="more-indicator">
            +{{ smartBCHWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateSmartBCHWallet" :loading="generatingSmartBCH" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- RSK Card -->
      <div class="crypto-card rSK-card" @click="navigateTo('/RSKNetwork')">
        <div class="card-header">
          <div class="crypto-icon rSK">🟠</div>
          <div class="crypto-info">
            <h3>RSK</h3>
            <span class="crypto-symbol">RBTC</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalRSKWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalRSKAddresses }}</span>
          </div>
        </div>

        <div v-if="rSKWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in rSKWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="rSKWallets.length > 2" class="more-indicator">
            +{{ rSKWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateRSKWallet" :loading="generatingRSK" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Wanchain Card -->
      <div class="crypto-card wanchain-card" @click="navigateTo('/WanchainNetwork')">
        <div class="card-header">
          <div class="crypto-icon wanchain">🌐</div>
          <div class="crypto-info">
            <h3>Wanchain</h3>
            <span class="crypto-symbol">WAN</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalWanchainWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalWanchainAddresses }}</span>
          </div>
        </div>

        <div v-if="wanchainWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in wanchainWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="wanchainWallets.length > 2" class="more-indicator">
            +{{ wanchainWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateWanchainWallet" :loading="generatingWanchain" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- GoChain Card -->
      <div class="crypto-card goChain-card" @click="navigateTo('/GoChainNetwork')">
        <div class="card-header">
          <div class="crypto-icon goChain">🟢</div>
          <div class="crypto-info">
            <h3>GoChain</h3>
            <span class="crypto-symbol">GO</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalGoChainWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalGoChainAddresses }}</span>
          </div>
        </div>

        <div v-if="goChainWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in goChainWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="goChainWallets.length > 2" class="more-indicator">
            +{{ goChainWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateGoChainWallet" :loading="generatingGoChain" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Canto Card -->
      <div class="crypto-card canto-card" @click="navigateTo('/CantoNetwork')">
        <div class="card-header">
          <div class="crypto-icon canto">🎵</div>
          <div class="crypto-info">
            <h3>Canto</h3>
            <span class="crypto-symbol">CANTO</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalCantoWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalCantoAddresses }}</span>
          </div>
        </div>

        <div v-if="cantoWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in cantoWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="cantoWallets.length > 2" class="more-indicator">
            +{{ cantoWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateCantoWallet" :loading="generatingCanto" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>


<!-- ========== END PHASE 3+ NETWORKS ========== -->

      <!-- Solana Card -->
      <div class="crypto-card sol-card" @click="navigateTo('/SolanaNetwork')">
        <div class="card-header">
          <div class="crypto-icon sol">◎</div>
          <div class="crypto-info">
            <h3>Solana</h3>
            <span class="crypto-symbol">SOL</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalSolWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalSolAddresses }}</span>
          </div>
        </div>

        <div v-if="solanaWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in solanaWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="solanaWallets.length > 2" class="more-indicator">
            +{{ solanaWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateSolanaWallet" :loading="generatingSol" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Internet Computer Card -->
      <div class="crypto-card icp-card" @click="navigateTo('/InternetComputerNetwork')">
        <div class="card-header">
          <div class="crypto-icon icp">∞</div>
          <div class="crypto-info">
            <h3>Internet Computer</h3>
            <span class="crypto-symbol">ICP</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalIcpWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalIcpAddresses }}</span>
          </div>
        </div>

        <div v-if="internetComputerWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in internetComputerWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="internetComputerWallets.length > 2" class="more-indicator">
            +{{ internetComputerWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateInternetComputerWallet" :loading="generatingIcp" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Mina Protocol Card -->
      <div class="crypto-card mina-card" @click="navigateTo('/MinaNetwork')">
        <div class="card-header">
          <div class="crypto-icon mina">M</div>
          <div class="crypto-info">
            <h3>Mina Protocol</h3>
            <span class="crypto-symbol">MINA</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalMinaWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalMinaAddresses }}</span>
          </div>
        </div>

        <div v-if="minaWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in minaWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="minaWallets.length > 2" class="more-indicator">
            +{{ minaWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateMinaWallet" :loading="generatingMina" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- IOTA Card -->
      <div class="crypto-card iota-card" @click="navigateTo('/IOTANetwork')">
        <div class="card-header">
          <div class="crypto-icon iota">⟠</div>
          <div class="crypto-info">
            <h3>IOTA</h3>
            <span class="crypto-symbol">MIOTA</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalIotaWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalIotaAddresses }}</span>
          </div>
        </div>

        <div v-if="iotaWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in iotaWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="iotaWallets.length > 2" class="more-indicator">
            +{{ iotaWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateIOTAWallet" :loading="generatingIota" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Chia Card -->
      <div class="crypto-card chia-card" @click="navigateTo('/ChiaNetwork')">
        <div class="card-header">
          <div class="crypto-icon chia">🌱</div>
          <div class="crypto-info">
            <h3>Chia</h3>
            <span class="crypto-symbol">XCH</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalXchWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalXchAddresses }}</span>
          </div>
        </div>

        <div v-if="chiaWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in chiaWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="chiaWallets.length > 2" class="more-indicator">
            +{{ chiaWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateChiaWallet" :loading="generatingXch" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Polkadot Card -->
      <div class="crypto-card polkadot-card" @click="navigateTo('/PolkadotNetwork')">
        <div class="card-header">
          <div class="crypto-icon polkadot">⬤</div>
          <div class="crypto-info">
            <h3>Polkadot</h3>
            <span class="crypto-symbol">DOT</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalDotWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalDotAddresses }}</span>
          </div>
        </div>

        <div v-if="polkadotWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in polkadotWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="polkadotWallets.length > 2" class="more-indicator">
            +{{ polkadotWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generatePolkadotWallet" :loading="generatingDot" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Cosmos Card -->
      <div class="crypto-card cosmos-card" @click="navigateTo('/CosmosNetwork')">
        <div class="card-header">
          <div class="crypto-icon cosmos">⚛️</div>
          <div class="crypto-info">
            <h3>Cosmos</h3>
            <span class="crypto-symbol">ATOM</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalAtomWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalAtomAddresses }}</span>
          </div>
        </div>
        <div v-if="cosmosWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in cosmosWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="cosmosWallets.length > 2" class="more-indicator">
            +{{ cosmosWallets.length - 2 }} more wallets
          </div>
        </div>
        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateCosmosWallet" :loading="generatingAtom" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Algorand Card -->
      <div class="crypto-card algorand-card" @click="navigateTo('/AlgorandNetwork')">
        <div class="card-header">
          <div class="crypto-icon algorand">▲</div>
          <div class="crypto-info">
            <h3>Algorand</h3>
            <span class="crypto-symbol">ALGO</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalAlgoWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalAlgoAddresses }}</span>
          </div>
        </div>
        <div v-if="algorandWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in algorandWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="algorandWallets.length > 2" class="more-indicator">
            +{{ algorandWallets.length - 2 }} more wallets
          </div>
        </div>
        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateAlgorandWallet" :loading="generatingAlgo" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Aptos Card -->
      <div class="crypto-card aptos-card" @click="navigateTo('/AptosNetwork')">
        <div class="card-header">
          <div class="crypto-icon aptos">🅰️</div>
          <div class="crypto-info">
            <h3>Aptos</h3>
            <span class="crypto-symbol">APT</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalAptWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalAptAddresses }}</span>
          </div>
        </div>
        <div v-if="aptosWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in aptosWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="aptosWallets.length > 2" class="more-indicator">
            +{{ aptosWallets.length - 2 }} more wallets
          </div>
        </div>
        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateAptosWallet" :loading="generatingApt" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- MultiversX Card -->
      <div class="crypto-card mvx-card" @click="navigateToMultiversX">
        <div class="card-header">
          <div class="crypto-icon mvx">🔷</div>
          <div class="crypto-info">
            <h3>MultiversX</h3>
            <span class="crypto-symbol">EGLD</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalMvxWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Network</span>
            <span class="stat-value">Mainnet</span>
          </div>
        </div>

        <div v-if="multiversxWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in multiversxWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="multiversxWallets.length > 2" class="more-indicator">
            +{{ multiversxWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateMultiversXWallet" :loading="generatingMvx" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Initia Card -->
      <div class="crypto-card initia-card" @click="navigateTo('/InitiaNetwork')">
        <div class="card-header">
          <div class="crypto-icon initia">🌟</div>
          <div class="crypto-info">
            <h3>Initia</h3>
            <span class="crypto-symbol">INIT</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalInitiaWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalInitiaAddresses }}</span>
          </div>
        </div>

        <div v-if="initiaWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in initiaWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="initiaWallets.length > 2" class="more-indicator">
            +{{ initiaWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateInitiaWallet" :loading="generatingInitia" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Cardano Card -->
      <div class="crypto-card ada-card" @click="navigateTo('/CardanoNetwork')">
        <div class="card-header">
          <div class="crypto-icon ada">₳</div>
          <div class="crypto-info">
            <h3>Cardano</h3>
            <span class="crypto-symbol">ADA</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalAdaWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalAdaAddresses }}</span>
          </div>
        </div>

        <div v-if="cardanoWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in cardanoWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="cardanoWallets.length > 2" class="more-indicator">
            +{{ cardanoWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateCardanoWallet" :loading="generatingAda" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Sui Card -->
      <div class="crypto-card sui-card" @click="navigateTo('/SuiNetwork')">
        <div class="card-header">
          <div class="crypto-icon sui">💧</div>
          <div class="crypto-info">
            <h3>Sui</h3>
            <span class="crypto-symbol">SUI</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalSuiWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalSuiAddresses }}</span>
          </div>
        </div>

        <div v-if="suiWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in suiWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="suiWallets.length > 2" class="more-indicator">
            +{{ suiWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateSuiWallet" :loading="generatingSui" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Stellar Card -->
      <div class="crypto-card xlm-card" @click="navigateTo('/StellarNetwork')">
        <div class="card-header">
          <div class="crypto-icon xlm">✨</div>
          <div class="crypto-info">
            <h3>Stellar</h3>
            <span class="crypto-symbol">XLM</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalXlmWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalXlmAddresses }}</span>
          </div>
        </div>

        <div v-if="stellarWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in stellarWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="stellarWallets.length > 2" class="more-indicator">
            +{{ stellarWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateStellarWallet" :loading="generatingXlm" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Ripple Card -->
      <div class="crypto-card xrp-card" @click="navigateTo('/RippleNetwork')">
        <div class="card-header">
          <div class="crypto-icon xrp">💎</div>
          <div class="crypto-info">
            <h3>Ripple</h3>
            <span class="crypto-symbol">XRP</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalXrpWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalXrpAddresses }}</span>
          </div>
        </div>

        <div v-if="rippleWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in rippleWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="rippleWallets.length > 2" class="more-indicator">
            +{{ rippleWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateRippleWallet" :loading="generatingXrp" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Litecoin Card -->
      <div class="crypto-card ltc-card" @click="navigateTo('/LitecoinNetwork')">
        <div class="card-header">
          <div class="crypto-icon ltc">Ł</div>
          <div class="crypto-info">
            <h3>Litecoin</h3>
            <span class="crypto-symbol">LTC</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalLtcWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalLtcAddresses }}</span>
          </div>
        </div>

        <div v-if="litecoinWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in litecoinWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="litecoinWallets.length > 2" class="more-indicator">
            +{{ litecoinWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateLitecoinWallet" :loading="generatingLtc" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Dogecoin Card -->
      <div class="crypto-card doge-card" @click="navigateTo('/DogecoinNetwork')">
        <div class="card-header">
          <div class="crypto-icon doge">Ð</div>
          <div class="crypto-info">
            <h3>Dogecoin</h3>
            <span class="crypto-symbol">DOGE</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalDogeWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalDogeAddresses }}</span>
          </div>
        </div>

        <div v-if="dogecoinWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in dogecoinWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="dogecoinWallets.length > 2" class="more-indicator">
            +{{ dogecoinWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateDogecoinWallet" :loading="generatingDoge" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Bitcoin Cash Card -->
      <div class="crypto-card bch-card" @click="navigateTo('/BitcoinCashNetwork')">
        <div class="card-header">
          <div class="crypto-icon bch">₿</div>
          <div class="crypto-info">
            <h3>Bitcoin Cash</h3>
            <span class="crypto-symbol">BCH</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalBchWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalBchAddresses }}</span>
          </div>
        </div>

        <div v-if="bitcoinCashWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in bitcoinCashWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="bitcoinCashWallets.length > 2" class="more-indicator">
            +{{ bitcoinCashWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateBitcoinCashWallet" :loading="generatingBch" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- DASH Card -->
      <div class="crypto-card dash-card" @click="navigateTo('/DashNetwork')">
        <div class="card-header">
          <div class="crypto-icon dash">Đ</div>
          <div class="crypto-info">
            <h3>DASH</h3>
            <span class="crypto-symbol">DASH</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalDashWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalDashAddresses }}</span>
          </div>
        </div>

        <div v-if="dashWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in dashWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="dashWallets.length > 2" class="more-indicator">
            +{{ dashWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateDashWallet" :loading="generatingDash" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Near Card -->
      <div class="crypto-card near-card" @click="navigateTo('/NearNetwork')">
        <div class="card-header">
          <div class="crypto-icon near">🔷</div>
          <div class="crypto-info">
            <h3>Near Protocol</h3>
            <span class="crypto-symbol">NEAR</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalNearWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalNearAddresses }}</span>
          </div>
        </div>

        <div v-if="nearWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in nearWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="nearWallets.length > 2" class="more-indicator">
            +{{ nearWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateNearWallet" :loading="generatingNear" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Celestia Card -->
      <div class="crypto-card tia-card" @click="navigateTo('/CelestiaNetwork')">
        <div class="card-header">
          <div class="crypto-icon tia">🌌</div>
          <div class="crypto-info">
            <h3>Celestia</h3>
            <span class="crypto-symbol">TIA</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalTiaWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalTiaAddresses }}</span>
          </div>
        </div>

        <div v-if="celestiaWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in celestiaWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="celestiaWallets.length > 2" class="more-indicator">
            +{{ celestiaWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateCelestiaWallet" :loading="generatingTia" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Kusama Card -->
      <div class="crypto-card ksm-card" @click="navigateTo('/KusamaNetwork')">
        <div class="card-header">
          <div class="crypto-icon ksm">🐦</div>
          <div class="crypto-info">
            <h3>Kusama</h3>
            <span class="crypto-symbol">KSM</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalKsmWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalKsmAddresses }}</span>
          </div>
        </div>

        <div v-if="kusamaWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in kusamaWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="kusamaWallets.length > 2" class="more-indicator">
            +{{ kusamaWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateKusamaWallet" :loading="generatingKsm" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Axelar Card -->
      <div class="crypto-card axl-card" @click="navigateTo('/AxelarNetwork')">
        <div class="card-header">
          <div class="crypto-icon axl">🔗</div>
          <div class="crypto-info">
            <h3>Axelar</h3>
            <span class="crypto-symbol">AXL</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalAxlWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalAxlAddresses }}</span>
          </div>
        </div>

        <div v-if="axelarWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in axelarWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="axelarWallets.length > 2" class="more-indicator">
            +{{ axelarWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateAxelarWallet" :loading="generatingAxl" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- VeChain Card -->
      <div class="crypto-card vet-card" @click="navigateTo('/VeChainNetwork')">
        <div class="card-header">
          <div class="crypto-icon vet">⚡</div>
          <div class="crypto-info">
            <h3>VeChain</h3>
            <span class="crypto-symbol">VET</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalVetWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalVetAddresses }}</span>
          </div>
        </div>

        <div v-if="vechainWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in vechainWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="vechainWallets.length > 2" class="more-indicator">
            +{{ vechainWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateVeChainWallet" :loading="generatingVet" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Flow Card -->
      <div class="crypto-card flow-card" @click="navigateTo('/FlowNetwork')">
        <div class="card-header">
          <div class="crypto-icon flow">🌊</div>
          <div class="crypto-info">
            <h3>Flow</h3>
            <span class="crypto-symbol">FLOW</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalFlowWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalFlowAddresses }}</span>
          </div>
        </div>

        <div v-if="flowWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in flowWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="flowWallets.length > 2" class="more-indicator">
            +{{ flowWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateFlowWallet" :loading="generatingFlow" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Tezos Card -->
      <div class="crypto-card xtz-card" @click="navigateTo('/TezosNetwork')">
        <div class="card-header">
          <div class="crypto-icon xtz">🔷</div>
          <div class="crypto-info">
            <h3>Tezos</h3>
            <span class="crypto-symbol">XTZ</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalXtzWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalXtzAddresses }}</span>
          </div>
        </div>

        <div v-if="tezosWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in tezosWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="tezosWallets.length > 2" class="more-indicator">
            +{{ tezosWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateTezosWallet" :loading="generatingXtz" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Starknet Card -->
      <div class="crypto-card strk-card" @click="navigateTo('/StarknetNetwork')">
        <div class="card-header">
          <div class="crypto-icon strk">⚡</div>
          <div class="crypto-info">
            <h3>Starknet</h3>
            <span class="crypto-symbol">STRK</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalStrkWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalStrkAddresses }}</span>
          </div>
        </div>

        <div v-if="starknetWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in starknetWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="starknetWallets.length > 2" class="more-indicator">
            +{{ starknetWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateStarknetWallet" :loading="generatingStrk" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Secret Network Card -->
      <div class="crypto-card scrt-card" @click="$router.push('/SecretNetwork')">
        <div class="card-header">
          <div class="crypto-icon scrt">🔐</div>
          <div class="crypto-info">
            <h3>Secret Network</h3>
            <span class="crypto-symbol">SCRT</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalScrtWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalScrtAddresses }}</span>
          </div>
        </div>

        <div v-if="secretWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in secretWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="secretWallets.length > 2" class="more-indicator">
            +{{ secretWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateSecretWallet" :loading="generatingScrt" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Kujira Card -->
      <div class="crypto-card kuji-card" @click="$router.push('/Kujira')">
        <div class="card-header">
          <div class="crypto-icon kuji">🐋</div>
          <div class="crypto-info">
            <h3>Kujira</h3>
            <span class="crypto-symbol">KUJI</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalKujiWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalKujiAddresses }}</span>
          </div>
        </div>

        <div v-if="kujiraWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in kujiraWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="kujiraWallets.length > 2" class="more-indicator">
            +{{ kujiraWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateKujiraWallet" :loading="generatingKuji" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Archway Card -->
      <div class="crypto-card arch-card" @click="$router.push('/Archway')">
        <div class="card-header">
          <div class="crypto-icon arch">🏛️</div>
          <div class="crypto-info">
            <h3>Archway</h3>
            <span class="crypto-symbol">ARCH</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalArchWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalArchAddresses }}</span>
          </div>
        </div>

        <div v-if="archwayWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in archwayWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="archwayWallets.length > 2" class="more-indicator">
            +{{ archwayWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateArchwayWallet" :loading="generatingArch" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Thorchain Card -->
      <div class="crypto-card rune-card" @click="$router.push('/Thorchain')">
        <div class="card-header">
          <div class="crypto-icon rune">⚡</div>
          <div class="crypto-info">
            <h3>Thorchain</h3>
            <span class="crypto-symbol">RUNE</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalRuneWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalRuneAddresses }}</span>
          </div>
        </div>

        <div v-if="thorchainWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in thorchainWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="thorchainWallets.length > 2" class="more-indicator">
            +{{ thorchainWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateThorchainWallet" :loading="generatingRune" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Waves Card -->
      <div class="crypto-card waves-card" @click="$router.push('/Waves')">
        <div class="card-header">
          <div class="crypto-icon waves">🌊</div>
          <div class="crypto-info">
            <h3>Waves</h3>
            <span class="crypto-symbol">WAVES</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalWavesWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalWavesAddresses }}</span>
          </div>
        </div>

        <div v-if="wavesWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in wavesWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="wavesWallets.length > 2" class="more-indicator">
            +{{ wavesWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateWavesWallet" :loading="generatingWaves" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Zilliqa Card -->
      <div class="crypto-card zil-card" @click="$router.push('/Zilliqa')">
        <div class="card-header">
          <div class="crypto-icon zil">💎</div>
          <div class="crypto-info">
            <h3>Zilliqa</h3>
            <span class="crypto-symbol">ZIL</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalZilWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalZilAddresses }}</span>
          </div>
        </div>

        <div v-if="zilliqaWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in zilliqaWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="zilliqaWallets.length > 2" class="more-indicator">
            +{{ zilliqaWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateZilliqaWallet" :loading="generatingZil" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- NEO Card -->
      <div class="crypto-card neo-card" @click="$router.push('/NEO')">
        <div class="card-header">
          <div class="crypto-icon neo">🟢</div>
          <div class="crypto-info">
            <h3>NEO</h3>
            <span class="crypto-symbol">NEO</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalNeoWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalNeoAddresses }}</span>
          </div>
        </div>

        <div v-if="neoWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in neoWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="neoWallets.length > 2" class="more-indicator">
            +{{ neoWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateNeoWallet" :loading="generatingNeo" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Kadena Card -->
      <div class="crypto-card kda-card" @click="$router.push('/Kadena')">
        <div class="card-header">
          <div class="crypto-icon kda">⛓️</div>
          <div class="crypto-info">
            <h3>Kadena</h3>
            <span class="crypto-symbol">KDA</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalKdaWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalKdaAddresses }}</span>
          </div>
        </div>

        <div v-if="kadenaWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in kadenaWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="kadenaWallets.length > 2" class="more-indicator">
            +{{ kadenaWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateKadenaWallet" :loading="generatingKda" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- EOS Card -->
      <div class="crypto-card eos-card" @click="$router.push('/EOS')">
        <div class="card-header">
          <div class="crypto-icon eos">📦</div>
          <div class="crypto-info">
            <h3>EOS</h3>
            <span class="crypto-symbol">EOS</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalEosWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalEosAddresses }}</span>
          </div>
        </div>

        <div v-if="eosWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in eosWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="eosWallets.length > 2" class="more-indicator">
            +{{ eosWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateEosWallet" :loading="generatingEos" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- WAX Card -->
      <div class="crypto-card waxp-card" @click="$router.push('/WAX')">
        <div class="card-header">
          <div class="crypto-icon waxp">🎮</div>
          <div class="crypto-info">
            <h3>WAX</h3>
            <span class="crypto-symbol">WAXP</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalWaxpWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalWaxpAddresses }}</span>
          </div>
        </div>

        <div v-if="waxWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in waxWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="waxWallets.length > 2" class="more-indicator">
            +{{ waxWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateWaxWallet" :loading="generatingWaxp" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Ontology Card -->
      <div class="crypto-card ont-card" @click="$router.push('/Ontology')">
        <div class="card-header">
          <div class="crypto-icon ont">🏢</div>
          <div class="crypto-info">
            <h3>Ontology</h3>
            <span class="crypto-symbol">ONT</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalOntWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalOntAddresses }}</span>
          </div>
        </div>

        <div v-if="ontologyWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in ontologyWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="ontologyWallets.length > 2" class="more-indicator">
            +{{ ontologyWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateOntologyWallet" :loading="generatingOnt" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Theta Network Card -->
      <div class="crypto-card theta-card" @click="$router.push('/ThetaNetwork')">
        <div class="card-header">
          <div class="crypto-icon theta">Θ</div>
          <div class="crypto-info">
            <h3>Theta Network</h3>
            <span class="crypto-symbol">THETA</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalThetaWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalThetaAddresses }}</span>
          </div>
        </div>

        <div v-if="thetaWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in thetaWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="thetaWallets.length > 2" class="more-indicator">
            +{{ thetaWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateThetaWallet" :loading="generatingTheta" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Casper Network Card -->
      <div class="crypto-card cspr-card" @click="$router.push('/CasperNetwork')">
        <div class="card-header">
          <div class="crypto-icon cspr">C</div>
          <div class="crypto-info">
            <h3>Casper Network</h3>
            <span class="crypto-symbol">CSPR</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalCsprWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalCsprAddresses }}</span>
          </div>
        </div>

        <div v-if="casperWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in casperWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="casperWallets.length > 2" class="more-indicator">
            +{{ casperWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateCasperWallet" :loading="generatingCspr" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- ICON Card -->
      <div class="crypto-card icx-card" @click="$router.push('/ICON')">
        <div class="card-header">
          <div class="crypto-icon icx">🇰🇷</div>
          <div class="crypto-info">
            <h3>ICON</h3>
            <span class="crypto-symbol">ICX</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalIcxWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalIcxAddresses }}</span>
          </div>
        </div>

        <div v-if="iconWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in iconWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="iconWallets.length > 2" class="more-indicator">
            +{{ iconWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateIconWallet" :loading="generatingIcx" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Qtum Card -->
      <div class="crypto-card qtum-card" @click="$router.push('/Qtum')">
        <div class="card-header">
          <div class="crypto-icon qtum">⚛️</div>
          <div class="crypto-info">
            <h3>Qtum</h3>
            <span class="crypto-symbol">QTUM</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalQtumWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalQtumAddresses }}</span>
          </div>
        </div>

        <div v-if="qtumWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in qtumWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="qtumWallets.length > 2" class="more-indicator">
            +{{ qtumWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateQtumWallet" :loading="generatingQtum" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Ergo Card -->
      <div class="crypto-card erg-card" @click="$router.push('/Ergo')">
        <div class="card-header">
          <div class="crypto-icon erg">Σ</div>
          <div class="crypto-info">
            <h3>Ergo</h3>
            <span class="crypto-symbol">ERG</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalErgWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalErgAddresses }}</span>
          </div>
        </div>

        <div v-if="ergoWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in ergoWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="ergoWallets.length > 2" class="more-indicator">
            +{{ ergoWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateErgoWallet" :loading="generatingErg" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- NEM Card -->
      <div class="crypto-card xem-card" @click="$router.push('/NEM')">
        <div class="card-header">
          <div class="crypto-icon xem">⚖️</div>
          <div class="crypto-info">
            <h3>NEM</h3>
            <span class="crypto-symbol">XEM</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalXemWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalXemAddresses }}</span>
          </div>
        </div>

        <div v-if="nemWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in nemWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="nemWallets.length > 2" class="more-indicator">
            +{{ nemWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateNemWallet" :loading="generatingXem" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Symbol Card -->
      <div class="crypto-card xym-card" @click="$router.push('/Symbol')">
        <div class="card-header">
          <div class="crypto-icon xym">🔄</div>
          <div class="crypto-info">
            <h3>Symbol</h3>
            <span class="crypto-symbol">XYM</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalXymWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalXymAddresses }}</span>
          </div>
        </div>

        <div v-if="symbolWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in symbolWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="symbolWallets.length > 2" class="more-indicator">
            +{{ symbolWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateSymbolWallet" :loading="generatingXym" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Nervos CKB Card -->
      <div class="crypto-card ckb-card" @click="$router.push('/NervosCKB')">
        <div class="card-header">
          <div class="crypto-icon ckb">🧬</div>
          <div class="crypto-info">
            <h3>Nervos CKB</h3>
            <span class="crypto-symbol">CKB</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalCkbWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalCkbAddresses }}</span>
          </div>
        </div>

        <div v-if="nervosCkbWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in nervosCkbWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="nervosCkbWallets.length > 2" class="more-indicator">
            +{{ nervosCkbWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateNervosCkbWallet" :loading="generatingCkb" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Aleph Zero Card -->
      <div class="crypto-card azero-card" @click="$router.push('/AlephZero')">
        <div class="card-header">
          <div class="crypto-icon azero">🔒</div>
          <div class="crypto-info">
            <h3>Aleph Zero</h3>
            <span class="crypto-symbol">AZERO</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalAzeroWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalAzeroAddresses }}</span>
          </div>
        </div>

        <div v-if="alephZeroWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in alephZeroWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="alephZeroWallets.length > 2" class="more-indicator">
            +{{ alephZeroWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateAlephZeroWallet" :loading="generatingAzero" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Radix Card -->
      <div class="crypto-card xrd-card" @click="$router.push('/Radix')">
        <div class="card-header">
          <div class="crypto-icon xrd">X</div>
          <div class="crypto-info">
            <h3>Radix DLT</h3>
            <span class="crypto-symbol">XRD</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalXrdWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalXrdAddresses }}</span>
          </div>
        </div>

        <div v-if="radixWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in radixWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="radixWallets.length > 2" class="more-indicator">
            +{{ radixWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateRadixWallet" :loading="generatingXrd" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Nibiru Chain Card -->
      <div class="crypto-card nibi-card" @click="$router.push('/NibiruChain')">
        <div class="card-header">
          <div class="crypto-icon nibi">💱</div>
          <div class="crypto-info">
            <h3>Nibiru Chain</h3>
            <span class="crypto-symbol">NIBI</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalNibiWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalNibiAddresses }}</span>
          </div>
        </div>

        <div v-if="nibiruWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in nibiruWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="nibiruWallets.length > 2" class="more-indicator">
            +{{ nibiruWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateNibiruWallet" :loading="generatingNibi" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Dymension Card -->
      <div class="crypto-card dym-card" @click="$router.push('/Dymension')">
        <div class="card-header">
          <div class="crypto-icon dym">🚀</div>
          <div class="crypto-info">
            <h3>Dymension</h3>
            <span class="crypto-symbol">DYM</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalDymWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalDymAddresses }}</span>
          </div>
        </div>

        <div v-if="dymensionWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in dymensionWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="dymensionWallets.length > 2" class="more-indicator">
            +{{ dymensionWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateDymensionWallet" :loading="generatingDym" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Immutable X Card -->
      <div class="crypto-card imx-card" @click="$router.push('/ImmutableX')">
        <div class="card-header">
          <div class="crypto-icon imx">🎨</div>
          <div class="crypto-info">
            <h3>Immutable X</h3>
            <span class="crypto-symbol">IMX</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalImxWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalImxAddresses }}</span>
          </div>
        </div>

        <div v-if="immutableXWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in immutableXWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="immutableXWallets.length > 2" class="more-indicator">
            +{{ immutableXWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateImmutableXWallet" :loading="generatingImx" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Loopring Card -->
      <div class="crypto-card lrc-card" @click="$router.push('/Loopring')">
        <div class="card-header">
          <div class="crypto-icon lrc">💍</div>
          <div class="crypto-info">
            <h3>Loopring</h3>
            <span class="crypto-symbol">LRC</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalLrcWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalLrcAddresses }}</span>
          </div>
        </div>

        <div v-if="loopringWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in loopringWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="loopringWallets.length > 2" class="more-indicator">
            +{{ loopringWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateLoopringWallet" :loading="generatingLrc" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Ultra.io Card -->
      <div class="crypto-card uos-card" @click="$router.push('/Ultra.io')">
        <div class="card-header">
          <div class="crypto-icon uos">U</div>
          <div class="crypto-info">
            <h3>Ultra.io</h3>
            <span class="crypto-symbol">UOS</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalUosWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalUosAddresses }}</span>
          </div>
        </div>

        <div v-if="ultraWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in ultraWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="ultraWallets.length > 2" class="more-indicator">
            +{{ ultraWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateUltraWallet" :loading="generatingUos" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Hyperliquid Card -->
      <div class="crypto-card hype-card" @click="$router.push('/Hyperliquid')">
        <div class="card-header">
          <div class="crypto-icon hype">📊</div>
          <div class="crypto-info">
            <h3>Hyperliquid</h3>
            <span class="crypto-symbol">HYPE</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalHypeWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalHypeAddresses }}</span>
          </div>
        </div>

        <div v-if="hyperliquidWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in hyperliquidWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="hyperliquidWallets.length > 2" class="more-indicator">
            +{{ hyperliquidWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateHyperliquidWallet" :loading="generatingHype" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- Constellation Card -->
      <div class="crypto-card dag-card" @click="$router.push('/Constellation')">
        <div class="card-header">
          <div class="crypto-icon dag">🔄</div>
          <div class="crypto-info">
            <h3>Constellation</h3>
            <span class="crypto-symbol">DAG</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalDagWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalDagAddresses }}</span>
          </div>
        </div>

        <div v-if="constellationWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in constellationWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="constellationWallets.length > 2" class="more-indicator">
            +{{ constellationWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateConstellationWallet" :loading="generatingDag" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>

      <!-- LCX Card -->
      <div class="crypto-card lcx-card" @click="$router.push('/LCX')">
        <div class="card-header">
          <div class="crypto-icon lcx">🏦</div>
          <div class="crypto-info">
            <h3>LCX</h3>
            <span class="crypto-symbol">LCX</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ totalLcxWallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ totalLcxAddresses }}</span>
          </div>
        </div>

        <div v-if="lcxWallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in lcxWallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="lcxWallets.length > 2" class="more-indicator">
            +{{ lcxWallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generateLcxWallet" :loading="generatingLcx" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>
    </div>

    <!-- Bitcoin Wallet Modal -->
    <n-modal
      v-model:show="showBtcModal"
      preset="card"
      title="₿ Bitcoin Wallets & Addresses"
      class="btc-wallet-modal"
      style="width: 90%; max-width: 1200px;"
    >
      <div v-if="loadingBtcWallets" class="modal-loading">
        <n-spin size="large" />
        <p>Loading Bitcoin wallets...</p>
      </div>

      <div v-else-if="bitcoinWallets.length === 0" class="empty-state">
        <n-empty description="No Bitcoin wallets found">
          <template #icon>
            <span style="font-size: 48px;">₿</span>
          </template>
          <template #extra>
            <n-button type="primary" @click="navigateToNetworks">
              Create Bitcoin Wallet
            </n-button>
          </template>
        </n-empty>
      </div>

      <div v-else class="btc-wallets-list">
        <!-- Wallet Accordion -->
        <n-collapse accordion arrow-placement="right">
          <n-collapse-item
            v-for="(wallet, walletIndex) in bitcoinWallets"
            :key="wallet._id"
            :title="`🔐 ${wallet.walletName} (${wallet.wallets?.length || 0} sub-wallets)`"
            :name="`wallet-${walletIndex}`"
          >
            <template #header-extra>
              <n-tag type="success" size="small">
                {{ wallet.wallets?.length || 0 }} × 5 = {{ (wallet.wallets?.length || 0) * 5 }} addresses
              </n-tag>
            </template>

            <!-- Wallet Info -->
            <n-alert type="info" style="margin-bottom: 16px;">
              <template #icon>
                <span style="font-size: 18px;">📝</span>
              </template>
              <strong>Mnemonic:</strong> {{ wallet.wordCount }} words
              <span v-if="wallet.hasPassphrase"> | 🔐 Passphrase Protected</span>
              <br>
              <small>Created: {{ formatDate(wallet.generatedAt) }}</small>
            </n-alert>

            <!-- Sub-wallets -->
            <div class="sub-wallets">
              <n-collapse accordion>
                <n-collapse-item
                  v-for="(subWallet, subIndex) in wallet.wallets"
                  :key="`sub-${subIndex}`"
                  :title="`${subWallet.emoji} ${subWallet.name}`"
                  :name="`subwallet-${subIndex}`"
                >
                  <template #header-extra>
                    <n-tag type="primary" size="tiny">5 addresses</n-tag>
                  </template>

                  <p class="sub-wallet-desc">{{ subWallet.description }}</p>

                  <!-- Address Types -->
                  <div class="address-types">
                    <!-- Legacy -->
                    <div class="address-card legacy">
                      <div class="address-header">
                        <span class="address-icon">🔑</span>
                        <span class="address-type">Legacy (P2PKH)</span>
                        <n-tag size="tiny" type="default">{{ subWallet.addresses.legacy?.address?.substring(0, 1) }}...</n-tag>
                      </div>
                      <div class="address-content">
                        <div class="address-row">
                          <span class="label">Address:</span>
                          <n-button text type="primary" size="tiny" @click="copyToClipboard(subWallet.addresses.legacy?.address)">
                            {{ subWallet.addresses.legacy?.address }}
                          </n-button>
                        </div>
                        <div class="address-row">
                          <span class="label">Path:</span>
                          <code>{{ subWallet.addresses.legacy?.path }}</code>
                        </div>
                        <div class="address-row fee-info" v-if="btcPrice > 0">
                          <span class="label">Fee (send $10):</span>
                          <span class="fee-value">
                            ${{ calculateCostToSend10USD('legacy').feeUSD }}
                            ({{ calculateCostToSend10USD('legacy').feeSats }} sats)
                            = Total: ${{ calculateCostToSend10USD('legacy').totalUSD }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Script Hash -->
                    <div class="address-card scripthash">
                      <div class="address-header">
                        <span class="address-icon">📜</span>
                        <span class="address-type">Script Hash (P2SH)</span>
                        <n-tag size="tiny" type="default">{{ subWallet.addresses.scriptHash?.address?.substring(0, 1) }}...</n-tag>
                      </div>
                      <div class="address-content">
                        <div class="address-row">
                          <span class="label">Address:</span>
                          <n-button text type="primary" size="tiny" @click="copyToClipboard(subWallet.addresses.scriptHash?.address)">
                            {{ subWallet.addresses.scriptHash?.address }}
                          </n-button>
                        </div>
                        <div class="address-row">
                          <span class="label">Path:</span>
                          <code>{{ subWallet.addresses.scriptHash?.path }}</code>
                        </div>
                        <div class="address-row fee-info" v-if="btcPrice > 0">
                          <span class="label">Fee (send $10):</span>
                          <span class="fee-value">
                            ${{ calculateCostToSend10USD('scriptHash').feeUSD }}
                            ({{ calculateCostToSend10USD('scriptHash').feeSats }} sats)
                            = Total: ${{ calculateCostToSend10USD('scriptHash').totalUSD }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- SegWit -->
                    <div class="address-card segwit">
                      <div class="address-header">
                        <span class="address-icon">⚡</span>
                        <span class="address-type">SegWit (P2SH-P2WPKH)</span>
                        <n-tag size="tiny" type="default">{{ subWallet.addresses.segwit?.address?.substring(0, 1) }}...</n-tag>
                      </div>
                      <div class="address-content">
                        <div class="address-row">
                          <span class="label">Address:</span>
                          <n-button text type="primary" size="tiny" @click="copyToClipboard(subWallet.addresses.segwit?.address)">
                            {{ subWallet.addresses.segwit?.address }}
                          </n-button>
                        </div>
                        <div class="address-row">
                          <span class="label">Path:</span>
                          <code>{{ subWallet.addresses.segwit?.path }}</code>
                        </div>
                        <div class="address-row fee-info" v-if="btcPrice > 0">
                          <span class="label">Fee (send $10):</span>
                          <span class="fee-value">
                            ${{ calculateCostToSend10USD('segwit').feeUSD }}
                            ({{ calculateCostToSend10USD('segwit').feeSats }} sats)
                            = Total: ${{ calculateCostToSend10USD('segwit').totalUSD }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Native SegWit -->
                    <div class="address-card nativesegwit">
                      <div class="address-header">
                        <span class="address-icon">🚀</span>
                        <span class="address-type">Native SegWit (P2WPKH)</span>
                        <n-tag size="tiny" type="success">RECOMMENDED</n-tag>
                      </div>
                      <div class="address-content">
                        <div class="address-row">
                          <span class="label">Address:</span>
                          <n-button text type="primary" size="tiny" @click="copyToClipboard(subWallet.addresses.nativeSegwit?.address)">
                            {{ subWallet.addresses.nativeSegwit?.address }}
                          </n-button>
                        </div>
                        <div class="address-row">
                          <span class="label">Path:</span>
                          <code>{{ subWallet.addresses.nativeSegwit?.path }}</code>
                        </div>
                        <div class="address-row fee-info" v-if="btcPrice > 0">
                          <span class="label">Fee (send $10):</span>
                          <span class="fee-value lowest-fee">
                            ${{ calculateCostToSend10USD('nativeSegwit').feeUSD }}
                            ({{ calculateCostToSend10USD('nativeSegwit').feeSats }} sats)
                            = Total: ${{ calculateCostToSend10USD('nativeSegwit').totalUSD }}
                            ✨ LOWEST FEE
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Taproot -->
                    <div class="address-card taproot">
                      <div class="address-header">
                        <span class="address-icon">🌳</span>
                        <span class="address-type">Taproot (P2TR)</span>
                        <n-tag size="tiny" type="info">NEWEST</n-tag>
                      </div>
                      <div class="address-content">
                        <div class="address-row">
                          <span class="label">Address:</span>
                          <n-button text type="primary" size="tiny" @click="copyToClipboard(subWallet.addresses.taproot?.address)">
                            {{ subWallet.addresses.taproot?.address }}
                          </n-button>
                        </div>
                        <div class="address-row">
                          <span class="label">Path:</span>
                          <code>{{ subWallet.addresses.taproot?.path }}</code>
                        </div>
                        <div class="address-row fee-info" v-if="btcPrice > 0">
                          <span class="label">Fee (send $10):</span>
                          <span class="fee-value">
                            ${{ calculateCostToSend10USD('taproot').feeUSD }}
                            ({{ calculateCostToSend10USD('taproot').feeSats }} sats)
                            = Total: ${{ calculateCostToSend10USD('taproot').totalUSD }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </n-collapse-item>
              </n-collapse>
            </div>
          </n-collapse-item>
        </n-collapse>
      </div>
    </n-modal>

    <!-- Ethereum Generate Modal -->
    <n-modal
      v-model:show="showEthGenerateModal"
      preset="card"
      title="➕ Generate Ethereum Wallet"
      style="width: 500px; max-width: 95vw;"
    >
      <n-alert type="info" style="margin-bottom: 20px;">
        <template #icon>
          <span style="font-size: 20px;">Ξ</span>
        </template>
        <strong>Generate New Ethereum Wallet</strong><br>
        A new 12-word mnemonic will be generated automatically
      </n-alert>

      <n-alert type="warning" style="margin-bottom: 20px;">
        ⚠️ <strong>Security Warning:</strong><br>
        Make sure to backup your mnemonic phrase! It will be stored securely in the database.
      </n-alert>

      <div style="display: flex; gap: 12px;">
        <n-button
          type="primary"
          @click="generateEthWallet"
          :loading="generatingEthWallet"
          block
        >
          🎯 Generate Ethereum Wallet
        </n-button>
        <n-button
          @click="showEthGenerateModal = false"
          :disabled="generatingEthWallet"
          block
        >
          ❌ Cancel
        </n-button>
      </div>
    </n-modal>

    <!-- Ethereum Wallet Modal -->
    <n-modal
      v-model:show="showEthModal"
      preset="card"
      title="Ξ Ethereum Wallets & Addresses"
      class="eth-wallet-modal"
      style="width: 90%; max-width: 1200px;"
    >
      <div v-if="loadingEthWallets" class="modal-loading">
        <n-spin size="large" />
        <p>Loading Ethereum wallets...</p>
      </div>

      <div v-else-if="ethereumWallets.length === 0" class="empty-state">
        <n-empty description="No Ethereum wallets found">
          <template #icon>
            <span style="font-size: 48px;">Ξ</span>
          </template>
          <template #extra>
            <n-button type="primary" @click="navigateToNetworks">
              Create Ethereum Wallet
            </n-button>
          </template>
        </n-empty>
      </div>

      <div v-else class="eth-wallets-list">
        <!-- Wallet Accordion -->
        <n-collapse accordion arrow-placement="right">
          <n-collapse-item
            v-for="(wallet, walletIndex) in ethereumWallets"
            :key="wallet._id"
            :title="`💼 ${wallet.walletName} (#${wallet.walletIndex})`"
            :name="`wallet-${walletIndex}`"
          >
            <template #header-extra>
              <n-tag type="success" size="small">
                {{ wallet.derivationPath }}
              </n-tag>
            </template>

            <!-- Wallet Info -->
            <n-alert type="info" style="margin-bottom: 16px;">
              <template #icon>
                <span style="font-size: 18px;">📝</span>
              </template>
              <strong>Derivation Path:</strong> {{ wallet.derivationPath }}
              <br>
              <small>Created: {{ formatDate(wallet.generatedAt) }}</small>
            </n-alert>

            <!-- Ethereum Address -->
            <div class="address-card ethereum">
              <div class="address-header">
                <span class="address-icon">Ξ</span>
                <span class="address-type">Ethereum Address</span>
                <n-tag size="tiny" type="success">0x...</n-tag>
              </div>
              <div class="address-content">
                <div class="address-row">
                  <span class="label">Address:</span>
                  <n-button text type="primary" size="tiny" @click="copyToClipboard(wallet.address)">
                    {{ wallet.address }}
                  </n-button>
                </div>
                <div class="address-row">
                  <span class="label">Path:</span>
                  <code>{{ wallet.derivationPath }}</code>
                </div>
                <div class="address-row">
                  <span class="label">Balance:</span>
                  <span class="balance-value">{{ wallet.balance }} ETH</span>
                </div>
                <div class="address-row fee-info" v-if="ethPrice > 0">
                  <span class="label">Fee (send $10):</span>
                  <span class="fee-value eth-fee">
                    ${{ calculateEthCostToSend10USD('standard').feeUSD }}
                    ({{ calculateEthCostToSend10USD('standard').feeGwei }} Gwei)
                    = Total: ${{ calculateEthCostToSend10USD('standard').totalUSD }}
                  </span>
                </div>
                <div class="address-row fee-info" v-if="ethPrice > 0" style="background: rgba(98, 126, 234, 0.05); border-left-color: #627eea;">
                  <span class="label">Fast Fee:</span>
                  <span class="fee-value">
                    ${{ calculateEthCostToSend10USD('fast').feeUSD }}
                    ({{ calculateEthCostToSend10USD('fast').feeGwei }} Gwei)
                    = Total: ${{ calculateEthCostToSend10USD('fast').totalUSD }}
                  </span>
                </div>
                <div class="address-row fee-info" v-if="ethPrice > 0" style="background: rgba(0, 200, 100, 0.05); border-left-color: #00c864;">
                  <span class="label">Slow Fee:</span>
                  <span class="fee-value lowest-fee">
                    ${{ calculateEthCostToSend10USD('slow').feeUSD }}
                    ({{ calculateEthCostToSend10USD('slow').feeGwei }} Gwei)
                    = Total: ${{ calculateEthCostToSend10USD('slow').totalUSD }}
                    ✨ LOWEST FEE
                  </span>
                </div>
              </div>
            </div>
          </n-collapse-item>
        </n-collapse>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userID = useCookie('userID');

// State
const loading = ref(false);
const loadingBtcWallets = ref(false);
const loadingEthWallets = ref(false);
const loadingMvxWallets = ref(false);
const showBtcModal = ref(false);
const showEthModal = ref(false);
const showEthGenerateModal = ref(false);
const generatingBtc = ref(false);
const generatingEthWallet = ref(false);
const generatingBase = ref(false);
const generatingPolygon = ref(false);
const generatingArbitrum = ref(false);
const generatingOptimism = ref(false);
const generatingBNB = ref(false);
const generatingAvalanche = ref(false);
// Phase 2 generating states
const generatingZkSync = ref(false);
const generatingFantom = ref(false);
const generatingLinea = ref(false);
const generatingScroll = ref(false);
const generatingBlast = ref(false);
const generatingMantle = ref(false);
const generatingCronos = ref(false);
const generatingHarmony = ref(false);
const generatingMoonbeam = ref(false);
const generatingGnosis = ref(false);
const generatingSol = ref(false);
const generatingIcp = ref(false);
const generatingMina = ref(false);
const generatingIota = ref(false);
const generatingXch = ref(false);
const generatingDot = ref(false);
const generatingAtom = ref(false);
const generatingAlgo = ref(false);
const generatingApt = ref(false);
const generatingMvx = ref(false);
const generatingInitia = ref(false);
const generatingAda = ref(false);
const generatingSui = ref(false);
const generatingXlm = ref(false);
const generatingXrp = ref(false);
const generatingLtc = ref(false);
const generatingDoge = ref(false);
const generatingBch = ref(false);
const generatingDash = ref(false);
const generatingNear = ref(false);
const generatingTia = ref(false);
const generatingKsm = ref(false);
const generatingAxl = ref(false);
const generatingVet = ref(false);
const generatingFlow = ref(false);
const generatingXtz = ref(false);
const generatingStrk = ref(false);
const bitcoinWallets = ref([]);
const ethereumWallets = ref([]);
const baseWallets = ref([]);
const polygonWallets = ref([]);
const arbitrumWallets = ref([]);
const optimismWallets = ref([]);
const bnbWallets = ref([]);
const avalancheWallets = ref([]);
// Phase 2 wallets
const zkSyncWallets = ref([]);
const fantomWallets = ref([]);
const lineaWallets = ref([]);
const scrollWallets = ref([]);
const blastWallets = ref([]);
const mantleWallets = ref([]);
const cronosWallets = ref([]);
const harmonyWallets = ref([]);
const moonbeamWallets = ref([]);
const gnosisWallets = ref([]);
const solanaWallets = ref([]);
const internetComputerWallets = ref([]);
const minaWallets = ref([]);
const iotaWallets = ref([]);
const chiaWallets = ref([]);
const polkadotWallets = ref([]);
const cosmosWallets = ref([]);
const algorandWallets = ref([]);
const aptosWallets = ref([]);
const multiversxWallets = ref([]);
const initiaWallets = ref([]);
const cardanoWallets = ref([]);
const suiWallets = ref([]);
const stellarWallets = ref([]);
const rippleWallets = ref([]);
const litecoinWallets = ref([]);
const dogecoinWallets = ref([]);
const bitcoinCashWallets = ref([]);
const dashWallets = ref([]);
const nearWallets = ref([]);
const celestiaWallets = ref([]);
const kusamaWallets = ref([]);
const axelarWallets = ref([]);
const vechainWallets = ref([]);
const flowWallets = ref([]);
const tezosWallets = ref([]);
const starknetWallets = ref([]);
const secretWallets = ref([]);
const kujiraWallets = ref([]);
const archwayWallets = ref([]);
const thorchainWallets = ref([]);
const wavesWallets = ref([]);
const zilliqaWallets = ref([]);
const neoWallets = ref([]);
const kadenaWallets = ref([]);
const eosWallets = ref([]);
const waxWallets = ref([]);
const ontologyWallets = ref([]);
const thetaWallets = ref([]);
const casperWallets = ref([]);
const iconWallets = ref([]);
const qtumWallets = ref([]);
const ergoWallets = ref([]);
const nemWallets = ref([]);
const symbolWallets = ref([]);
const nervosCkbWallets = ref([]);
const alephZeroWallets = ref([]);
const radixWallets = ref([]);
const nibiruWallets = ref([]);
const dymensionWallets = ref([]);
const immutableXWallets = ref([]);
const loopringWallets = ref([]);
const ultraWallets = ref([]);
const hyperliquidWallets = ref([]);
const constellationWallets = ref([]);
const lcxWallets = ref([]);

// Phase 3+ Wallet Arrays
const roninWallets = ref([]);
const immutableZkEVMWallets = ref([]);
const beamWallets = ref([]);
const oasysWallets = ref([]);
const polygonZkEVMWallets = ref([]);
const bobaWallets = ref([]);
const metisWallets = ref([]);
const auroraWallets = ref([]);
const redstoneWallets = ref([]);
const opBNBWallets = ref([]);
const arbitrumNovaWallets = ref([]);
const zoraWallets = ref([]);
const mantaPacificWallets = ref([]);
const morphL2Wallets = ref([]);
const xaiWallets = ref([]);
const fraxtalWallets = ref([]);
const taikoWallets = ref([]);
const modeNetworkWallets = ref([]);
const celoWallets = ref([]);
const hederaWallets = ref([]);
const seiWallets = ref([]);
const kavaWallets = ref([]);
const shimmerEVMWallets = ref([]);
const confluxESpaceWallets = ref([]);
const oasisEmeraldWallets = ref([]);
const energyWebWallets = ref([]);
const telosEVMWallets = ref([]);
const horizenEONWallets = ref([]);
const victionWallets = ref([]);
const fuseWallets = ref([]);
const syscoinWallets = ref([]);
const thunderCoreWallets = ref([]);
const astarWallets = ref([]);
const shidenWallets = ref([]);
const efinityWallets = ref([]);
const worldChainWallets = ref([]);
const sonicWallets = ref([]);
const flareWallets = ref([]);
const songbirdWallets = ref([]);
const zetaChainWallets = ref([]);
const smartBCHWallets = ref([]);
const rSKWallets = ref([]);
const wanchainWallets = ref([]);
const goChainWallets = ref([]);
const cantoWallets = ref([]);

const btcPrice = ref(0);
const ethPrice = ref(0);

// Transaction sizes in vbytes (virtual bytes) for different address types
// Based on standard P2PKH/P2SH/P2WPKH/P2TR transactions
const TX_SIZES = {
  legacy: 226,        // P2PKH: ~226 vbytes
  scriptHash: 298,    // P2SH: ~298 vbytes
  segwit: 165,        // P2SH-P2WPKH: ~165 vbytes
  nativeSegwit: 141,  // P2WPKH: ~141 vbytes (most efficient)
  taproot: 154        // P2TR: ~154 vbytes
};

// Fee rates (sat/vB) - can be updated from mempool API
const FEE_RATES = {
  low: 5,      // ~1 hour
  medium: 10,  // ~30 min
  high: 20     // ~10 min
};

// Ethereum gas constants
// Standard ETH transfer = 21000 gas units
const ETH_GAS_LIMIT = 21000;

// Gas prices in Gwei (can be updated from gas station API)
const ETH_GAS_PRICES = {
  slow: 10,      // ~5 min - LOWEST
  standard: 20,  // ~2 min
  fast: 40       // ~30 sec
};

// Computed
const totalBtcWallets = computed(() => {
  return bitcoinWallets.value.reduce((sum, wallet) => sum + (wallet.wallets?.length || 0), 0);
});

const totalBtcAddresses = computed(() => {
  return totalBtcWallets.value * 5; // Each wallet has 5 address types
});

const totalEthWallets = computed(() => {
  return ethereumWallets.value.length;
});

const totalBaseWallets = computed(() => {
  return baseWallets.value.length;
});

const totalBaseAddresses = computed(() => {
  return baseWallets.value.length;
});

const totalPolygonWallets = computed(() => {
  return polygonWallets.value.length;
});

const totalPolygonAddresses = computed(() => {
  return polygonWallets.value.length;
});

const totalArbitrumWallets = computed(() => {
  return arbitrumWallets.value.length;
});

const totalArbitrumAddresses = computed(() => {
  return arbitrumWallets.value.length;
});

const totalOptimismWallets = computed(() => {
  return optimismWallets.value.length;
});

const totalOptimismAddresses = computed(() => {
  return optimismWallets.value.length;
});

const totalBNBWallets = computed(() => {
  return bnbWallets.value.length;
});

const totalBNBAddresses = computed(() => {
  return bnbWallets.value.length;
});

const totalAvalancheWallets = computed(() => {
  return avalancheWallets.value.length;
});

const totalAvalancheAddresses = computed(() => {
  return avalancheWallets.value.length;
});

// Phase 2 computed properties
const totalZkSyncWallets = computed(() => {
  return zkSyncWallets.value.length;
});

const totalZkSyncAddresses = computed(() => {
  return zkSyncWallets.value.length;
});

const totalFantomWallets = computed(() => {
  return fantomWallets.value.length;
});

const totalFantomAddresses = computed(() => {
  return fantomWallets.value.length;
});

const totalLineaWallets = computed(() => {
  return lineaWallets.value.length;
});

const totalLineaAddresses = computed(() => {
  return lineaWallets.value.length;
});

const totalScrollWallets = computed(() => {
  return scrollWallets.value.length;
});

const totalScrollAddresses = computed(() => {
  return scrollWallets.value.length;
});

const totalBlastWallets = computed(() => {
  return blastWallets.value.length;
});

const totalBlastAddresses = computed(() => {
  return blastWallets.value.length;
});

const totalMantleWallets = computed(() => {
  return mantleWallets.value.length;
});

const totalMantleAddresses = computed(() => {
  return mantleWallets.value.length;
});

const totalCronosWallets = computed(() => {
  return cronosWallets.value.length;
});

const totalCronosAddresses = computed(() => {
  return cronosWallets.value.length;
});

const totalHarmonyWallets = computed(() => {
  return harmonyWallets.value.length;
});

const totalHarmonyAddresses = computed(() => {
  return harmonyWallets.value.length;
});

const totalMoonbeamWallets = computed(() => {
  return moonbeamWallets.value.length;
});

const totalMoonbeamAddresses = computed(() => {
  return moonbeamWallets.value.length;
});

const totalGnosisWallets = computed(() => {
  return gnosisWallets.value.length;
});

const totalGnosisAddresses = computed(() => {
  return gnosisWallets.value.length;
});

const totalSolWallets = computed(() => {
  return solanaWallets.value.length;
});

const totalSolAddresses = computed(() => {
  return solanaWallets.value.length;
});

const totalIcpWallets = computed(() => {
  return internetComputerWallets.value.length;
});

const totalIcpAddresses = computed(() => {
  return internetComputerWallets.value.length;
});

const totalMinaWallets = computed(() => {
  return minaWallets.value.length;
});

const totalMinaAddresses = computed(() => {
  return minaWallets.value.length;
});

const totalIotaWallets = computed(() => {
  return iotaWallets.value.length;
});

const totalIotaAddresses = computed(() => {
  return iotaWallets.value.length;
});

const totalXchWallets = computed(() => {
  return chiaWallets.value.length;
});

const totalXchAddresses = computed(() => {
  return chiaWallets.value.length;
});

const totalDotWallets = computed(() => {
  return polkadotWallets.value.length;
});

const totalDotAddresses = computed(() => {
  return polkadotWallets.value.length;
});

const totalAtomWallets = computed(() => {
  return cosmosWallets.value.length;
});

const totalAtomAddresses = computed(() => {
  return cosmosWallets.value.length;
});

const totalAlgoWallets = computed(() => {
  return algorandWallets.value.length;
});

const totalAlgoAddresses = computed(() => {
  return algorandWallets.value.length;
});

const totalAptWallets = computed(() => {
  return aptosWallets.value.length;
});

const totalAptAddresses = computed(() => {
  return aptosWallets.value.length;
});

const totalMvxWallets = computed(() => {
  return multiversxWallets.value.length;
});

const totalInitiaWallets = computed(() => {
  return initiaWallets.value.length;
});

const totalInitiaAddresses = computed(() => {
  return initiaWallets.value.length;
});

const totalAdaWallets = computed(() => {
  return cardanoWallets.value.length;
});

const totalAdaAddresses = computed(() => {
  return cardanoWallets.value.length;
});

const totalSuiWallets = computed(() => {
  return suiWallets.value.length;
});

const totalSuiAddresses = computed(() => {
  return suiWallets.value.length;
});

const totalXlmWallets = computed(() => {
  return stellarWallets.value.length;
});

const totalXlmAddresses = computed(() => {
  return stellarWallets.value.length;
});

const totalXrpWallets = computed(() => {
  return rippleWallets.value.length;
});

const totalXrpAddresses = computed(() => {
  return rippleWallets.value.length;
});

const totalLtcWallets = computed(() => {
  return litecoinWallets.value.length;
});

const totalLtcAddresses = computed(() => {
  return litecoinWallets.value.length;
});

const totalDogeWallets = computed(() => {
  return dogecoinWallets.value.length;
});

const totalDogeAddresses = computed(() => {
  return dogecoinWallets.value.length;
});

const totalBchWallets = computed(() => {
  return bitcoinCashWallets.value.length;
});

const totalBchAddresses = computed(() => {
  return bitcoinCashWallets.value.length;
});

const totalDashWallets = computed(() => {
  return dashWallets.value.length;
});

const totalDashAddresses = computed(() => {
  return dashWallets.value.length;
});

const totalNearWallets = computed(() => {
  return nearWallets.value.length;
});

const totalNearAddresses = computed(() => {
  return nearWallets.value.length;
});

const totalTiaWallets = computed(() => {
  return celestiaWallets.value.length;
});

const totalTiaAddresses = computed(() => {
  return celestiaWallets.value.length;
});

const totalKsmWallets = computed(() => {
  return kusamaWallets.value.length;
});

const totalKsmAddresses = computed(() => {
  return kusamaWallets.value.length;
});

const totalAxlWallets = computed(() => {
  return axelarWallets.value.length;
});

const totalAxlAddresses = computed(() => {
  return axelarWallets.value.length;
});

const totalVetWallets = computed(() => {
  return vechainWallets.value.length;
});

const totalVetAddresses = computed(() => {
  return vechainWallets.value.length;
});

const totalFlowWallets = computed(() => {
  return flowWallets.value.length;
});

const totalFlowAddresses = computed(() => {
  return flowWallets.value.length;
});

const totalXtzWallets = computed(() => {
  return tezosWallets.value.length;
});

const totalXtzAddresses = computed(() => {
  return tezosWallets.value.length;
});

const totalStrkWallets = computed(() => {
  return starknetWallets.value.length;
});

const totalStrkAddresses = computed(() => {
  return starknetWallets.value.length;
});

const totalScrtWallets = computed(() => secretWallets.value.length);
const totalScrtAddresses = computed(() => secretWallets.value.length);
const totalKujiWallets = computed(() => kujiraWallets.value.length);
const totalKujiAddresses = computed(() => kujiraWallets.value.length);
const totalArchWallets = computed(() => archwayWallets.value.length);
const totalArchAddresses = computed(() => archwayWallets.value.length);
const totalRuneWallets = computed(() => thorchainWallets.value.length);
const totalRuneAddresses = computed(() => thorchainWallets.value.length);
const totalWavesWallets = computed(() => wavesWallets.value.length);
const totalWavesAddresses = computed(() => wavesWallets.value.length);
const totalZilWallets = computed(() => zilliqaWallets.value.length);
const totalZilAddresses = computed(() => zilliqaWallets.value.length);
const totalNeoWallets = computed(() => neoWallets.value.length);
const totalNeoAddresses = computed(() => neoWallets.value.length);
const totalKdaWallets = computed(() => kadenaWallets.value.length);
const totalKdaAddresses = computed(() => kadenaWallets.value.length);
const totalEosWallets = computed(() => eosWallets.value.length);
const totalEosAddresses = computed(() => eosWallets.value.length);
const totalWaxpWallets = computed(() => waxWallets.value.length);
const totalWaxpAddresses = computed(() => waxWallets.value.length);
const totalOntWallets = computed(() => ontologyWallets.value.length);
const totalOntAddresses = computed(() => ontologyWallets.value.length);
const totalThetaWallets = computed(() => thetaWallets.value.length);
const totalThetaAddresses = computed(() => thetaWallets.value.length);
const totalCsprWallets = computed(() => casperWallets.value.length);
const totalCsprAddresses = computed(() => casperWallets.value.length);
const totalIcxWallets = computed(() => iconWallets.value.length);
const totalIcxAddresses = computed(() => iconWallets.value.length);
const totalQtumWallets = computed(() => qtumWallets.value.length);
const totalQtumAddresses = computed(() => qtumWallets.value.length);
const totalErgWallets = computed(() => ergoWallets.value.length);
const totalErgAddresses = computed(() => ergoWallets.value.length);
const totalXemWallets = computed(() => nemWallets.value.length);
const totalXemAddresses = computed(() => nemWallets.value.length);
const totalXymWallets = computed(() => symbolWallets.value.length);
const totalXymAddresses = computed(() => symbolWallets.value.length);
const totalCkbWallets = computed(() => nervosCkbWallets.value.length);
const totalCkbAddresses = computed(() => nervosCkbWallets.value.length);
const totalAzeroWallets = computed(() => alephZeroWallets.value.length);
const totalAzeroAddresses = computed(() => alephZeroWallets.value.length);
const totalXrdWallets = computed(() => radixWallets.value.length);
const totalXrdAddresses = computed(() => radixWallets.value.length);
const totalNibiWallets = computed(() => nibiruWallets.value.length);
const totalNibiAddresses = computed(() => nibiruWallets.value.length);
const totalDymWallets = computed(() => dymensionWallets.value.length);
const totalDymAddresses = computed(() => dymensionWallets.value.length);
const totalImxWallets = computed(() => immutableXWallets.value.length);
const totalImxAddresses = computed(() => immutableXWallets.value.length);
const totalLrcWallets = computed(() => loopringWallets.value.length);
const totalLrcAddresses = computed(() => loopringWallets.value.length);
const totalUosWallets = computed(() => ultraWallets.value.length);
const totalUosAddresses = computed(() => ultraWallets.value.length);
const totalHypeWallets = computed(() => hyperliquidWallets.value.length);
const totalHypeAddresses = computed(() => hyperliquidWallets.value.length);
const totalDagWallets = computed(() => constellationWallets.value.length);
const totalDagAddresses = computed(() => constellationWallets.value.length);
const totalLcxWallets = computed(() => lcxWallets.value.length);
const totalLcxAddresses = computed(() => lcxWallets.value.length);

// Phase 3+ Computed Properties
const totalRoninWallets = computed(() => roninWallets.value.length);
const totalRoninAddresses = computed(() => roninWallets.value.length);
const totalImmutableZkEVMWallets = computed(() => immutableZkEVMWallets.value.length);
const totalImmutableZkEVMAddresses = computed(() => immutableZkEVMWallets.value.length);
const totalBeamWallets = computed(() => beamWallets.value.length);
const totalBeamAddresses = computed(() => beamWallets.value.length);
const totalOasysWallets = computed(() => oasysWallets.value.length);
const totalOasysAddresses = computed(() => oasysWallets.value.length);
const totalPolygonZkEVMWallets = computed(() => polygonZkEVMWallets.value.length);
const totalPolygonZkEVMAddresses = computed(() => polygonZkEVMWallets.value.length);
const totalBobaWallets = computed(() => bobaWallets.value.length);
const totalBobaAddresses = computed(() => bobaWallets.value.length);
const totalMetisWallets = computed(() => metisWallets.value.length);
const totalMetisAddresses = computed(() => metisWallets.value.length);
const totalAuroraWallets = computed(() => auroraWallets.value.length);
const totalAuroraAddresses = computed(() => auroraWallets.value.length);
const totalRedstoneWallets = computed(() => redstoneWallets.value.length);
const totalRedstoneAddresses = computed(() => redstoneWallets.value.length);
const totalOpBNBWallets = computed(() => opBNBWallets.value.length);
const totalOpBNBAddresses = computed(() => opBNBWallets.value.length);
const totalArbitrumNovaWallets = computed(() => arbitrumNovaWallets.value.length);
const totalArbitrumNovaAddresses = computed(() => arbitrumNovaWallets.value.length);
const totalZoraWallets = computed(() => zoraWallets.value.length);
const totalZoraAddresses = computed(() => zoraWallets.value.length);
const totalMantaPacificWallets = computed(() => mantaPacificWallets.value.length);
const totalMantaPacificAddresses = computed(() => mantaPacificWallets.value.length);
const totalMorphL2Wallets = computed(() => morphL2Wallets.value.length);
const totalMorphL2Addresses = computed(() => morphL2Wallets.value.length);
const totalXaiWallets = computed(() => xaiWallets.value.length);
const totalXaiAddresses = computed(() => xaiWallets.value.length);
const totalFraxtalWallets = computed(() => fraxtalWallets.value.length);
const totalFraxtalAddresses = computed(() => fraxtalWallets.value.length);
const totalTaikoWallets = computed(() => taikoWallets.value.length);
const totalTaikoAddresses = computed(() => taikoWallets.value.length);
const totalModeNetworkWallets = computed(() => modeNetworkWallets.value.length);
const totalModeNetworkAddresses = computed(() => modeNetworkWallets.value.length);
const totalCeloWallets = computed(() => celoWallets.value.length);
const totalCeloAddresses = computed(() => celoWallets.value.length);
const totalHederaWallets = computed(() => hederaWallets.value.length);
const totalHederaAddresses = computed(() => hederaWallets.value.length);
const totalSeiWallets = computed(() => seiWallets.value.length);
const totalSeiAddresses = computed(() => seiWallets.value.length);
const totalKavaWallets = computed(() => kavaWallets.value.length);
const totalKavaAddresses = computed(() => kavaWallets.value.length);
const totalShimmerEVMWallets = computed(() => shimmerEVMWallets.value.length);
const totalShimmerEVMAddresses = computed(() => shimmerEVMWallets.value.length);
const totalConfluxESpaceWallets = computed(() => confluxESpaceWallets.value.length);
const totalConfluxESpaceAddresses = computed(() => confluxESpaceWallets.value.length);
const totalOasisEmeraldWallets = computed(() => oasisEmeraldWallets.value.length);
const totalOasisEmeraldAddresses = computed(() => oasisEmeraldWallets.value.length);
const totalEnergyWebWallets = computed(() => energyWebWallets.value.length);
const totalEnergyWebAddresses = computed(() => energyWebWallets.value.length);
const totalTelosEVMWallets = computed(() => telosEVMWallets.value.length);
const totalTelosEVMAddresses = computed(() => telosEVMWallets.value.length);
const totalHorizenEONWallets = computed(() => horizenEONWallets.value.length);
const totalHorizenEONAddresses = computed(() => horizenEONWallets.value.length);
const totalVictionWallets = computed(() => victionWallets.value.length);
const totalVictionAddresses = computed(() => victionWallets.value.length);
const totalFuseWallets = computed(() => fuseWallets.value.length);
const totalFuseAddresses = computed(() => fuseWallets.value.length);
const totalSyscoinWallets = computed(() => syscoinWallets.value.length);
const totalSyscoinAddresses = computed(() => syscoinWallets.value.length);
const totalThunderCoreWallets = computed(() => thunderCoreWallets.value.length);
const totalThunderCoreAddresses = computed(() => thunderCoreWallets.value.length);
const totalAstarWallets = computed(() => astarWallets.value.length);
const totalAstarAddresses = computed(() => astarWallets.value.length);
const totalShidenWallets = computed(() => shidenWallets.value.length);
const totalShidenAddresses = computed(() => shidenWallets.value.length);
const totalEfinityWallets = computed(() => efinityWallets.value.length);
const totalEfinityAddresses = computed(() => efinityWallets.value.length);
const totalWorldChainWallets = computed(() => worldChainWallets.value.length);
const totalWorldChainAddresses = computed(() => worldChainWallets.value.length);
const totalSonicWallets = computed(() => sonicWallets.value.length);
const totalSonicAddresses = computed(() => sonicWallets.value.length);
const totalFlareWallets = computed(() => flareWallets.value.length);
const totalFlareAddresses = computed(() => flareWallets.value.length);
const totalSongbirdWallets = computed(() => songbirdWallets.value.length);
const totalSongbirdAddresses = computed(() => songbirdWallets.value.length);
const totalZetaChainWallets = computed(() => zetaChainWallets.value.length);
const totalZetaChainAddresses = computed(() => zetaChainWallets.value.length);
const totalSmartBCHWallets = computed(() => smartBCHWallets.value.length);
const totalSmartBCHAddresses = computed(() => smartBCHWallets.value.length);
const totalRSKWallets = computed(() => rSKWallets.value.length);
const totalRSKAddresses = computed(() => rSKWallets.value.length);
const totalWanchainWallets = computed(() => wanchainWallets.value.length);
const totalWanchainAddresses = computed(() => wanchainWallets.value.length);
const totalGoChainWallets = computed(() => goChainWallets.value.length);
const totalGoChainAddresses = computed(() => goChainWallets.value.length);
const totalCantoWallets = computed(() => cantoWallets.value.length);
const totalCantoAddresses = computed(() => cantoWallets.value.length);

const totalEthBalance = computed(() => {
  return ethereumWallets.value.reduce((sum, w) => sum + parseFloat(w.balance || 0), 0);
});

// Methods
async function loadBitcoinWallets() {
  try {
    loadingBtcWallets.value = true;
    const response = await $fetch('/api/v1/Wallets/fetchBitcoinWallets', {
      method: 'GET',
      params: { userID: userID.value }
    });

    if (response.success) {
      bitcoinWallets.value = response.data || [];
    } else {
      window.$message?.error(response.message || 'Failed to load Bitcoin wallets');
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Bitcoin wallets:', error);
    window.$message?.error('Failed to load Bitcoin wallets');
  } finally {
    loadingBtcWallets.value = false;
  }
}

async function openBitcoinWallet() {
  showBtcModal.value = true;
  if (bitcoinWallets.value.length === 0) {
    await loadBitcoinWallets();
  }
}

function copyToClipboard(text) {
  if (!text) return;
  navigator.clipboard.writeText(text);
  window.$message?.success('Address copied to clipboard!');
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleString();
}

function navigateToNetworks() {
  router.push('/Networks');
}

function navigateToMultiversX() {
  router.push('/MultiversXNetwork');
}

// Load MultiversX wallets
async function loadMultiversXWallets() {
  try {
    loadingMvxWallets.value = true;
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'MultiversX'
      }
    });

    if (response.success) {
      multiversxWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading MultiversX wallets:', error);
  } finally {
    loadingMvxWallets.value = false;
  }
}

async function loadInitiaWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Initia'
      }
    });

    if (response.success) {
      initiaWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Initia wallets:', error);
  }
}

async function loadCardanoWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Cardano'
      }
    });

    if (response.success) {
      cardanoWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Cardano wallets:', error);
  }
}

async function loadSuiWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Sui'
      }
    });

    if (response.success) {
      suiWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Sui wallets:', error);
  }
}

async function loadStellarWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Stellar'
      }
    });

    if (response.success) {
      stellarWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Stellar wallets:', error);
  }
}

async function loadRippleWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Ripple'
      }
    });

    if (response.success) {
      rippleWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Ripple wallets:', error);
  }
}

async function loadLitecoinWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Litecoin'
      }
    });

    if (response.success) {
      litecoinWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Litecoin wallets:', error);
  }
}

async function loadDogecoinWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Dogecoin'
      }
    });

    if (response.success) {
      dogecoinWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Dogecoin wallets:', error);
  }
}

async function loadBitcoinCashWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Bitcoin Cash'
      }
    });

    if (response.success) {
      bitcoinCashWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Bitcoin Cash wallets:', error);
  }
}

async function loadDashWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'DASH'
      }
    });

    if (response.success) {
      dashWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading DASH wallets:', error);
  }
}

async function loadNearWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Near'
      }
    });

    if (response.success) {
      nearWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Near wallets:', error);
  }
}

async function loadCelestiaWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Celestia'
      }
    });

    if (response.success) {
      celestiaWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Celestia wallets:', error);
  }
}

async function loadKusamaWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Kusama'
      }
    });

    if (response.success) {
      kusamaWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Kusama wallets:', error);
  }
}

async function loadAxelarWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Axelar'
      }
    });

    if (response.success) {
      axelarWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Axelar wallets:', error);
  }
}

async function loadVeChainWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'VeChain'
      }
    });

    if (response.success) {
      vechainWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading VeChain wallets:', error);
  }
}

async function loadFlowWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Flow'
      }
    });

    if (response.success) {
      flowWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Flow wallets:', error);
  }
}

async function loadTezosWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Tezos'
      }
    });

    if (response.success) {
      tezosWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Tezos wallets:', error);
  }
}

async function loadStarknetWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Starknet'
      }
    });

    if (response.success) {
      starknetWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Starknet wallets:', error);
  }
}

// Format address (short version)
function formatAddressShort(address) {
  if (!address) return 'N/A';
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

// Generate Bitcoin Wallet
async function generateBitcoinWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingBtc.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `Bitcoin Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('Bitcoin wallet generated!');
      await loadBitcoinWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Bitcoin] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingBtc.value = false;
  }
}

// Generate Ethereum Wallet
async function generateEthWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }

  generatingEthWallet.value = true;

  try {
    const walletName = `ETH Wallet ${ethereumWallets.value.length + 1}`;

    const response = await $fetch('/api/v1/Wallets/generateEthereumWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        count: 1,
        wordCount: 12
      }
    });

    if (response.success) {
      window.$message?.success('Ethereum wallet generated successfully!');
      showEthGenerateModal.value = false;
      await loadEthereumWallets();
    } else {
      window.$message?.error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[CryptoWallet] Error generating Ethereum wallet:', error);
    window.$message?.error('Failed to generate Ethereum wallet');
  } finally {
    generatingEthWallet.value = false;
  }
}

// Generate BASE Wallet
async function generateBaseWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingBase.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'BASE',
        walletName: `BASE Wallet ${baseWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('BASE wallet generated!');
      await loadBaseWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[BASE] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingBase.value = false;
  }
}

async function generatePolygonWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingPolygon.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Polygon',
        walletName: `Polygon Wallet ${polygonWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Polygon wallet generated!');
      await loadPolygonWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Polygon] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingPolygon.value = false;
  }
}

async function generateArbitrumWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingArbitrum.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'ARB',
        walletName: `Arbitrum Wallet ${arbitrumWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Arbitrum wallet generated!');
      await loadArbitrumWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Arbitrum] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingArbitrum.value = false;
  }
}

async function generateOptimismWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingOptimism.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Optimism',
        walletName: `Optimism Wallet ${optimismWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Optimism wallet generated!');
      await loadOptimismWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Optimism] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingOptimism.value = false;
  }
}

async function generateBNBWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingBNB.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'BNB',
        walletName: `BNB Chain Wallet ${bnbWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('BNB Chain wallet generated!');
      await loadBNBWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[BNB Chain] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingBNB.value = false;
  }
}

async function generateAvalancheWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingAvalanche.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Avalanche',
        walletName: `Avalanche Wallet ${avalancheWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Avalanche wallet generated!');
      await loadAvalancheWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Avalanche] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingAvalanche.value = false;
  }
}

// Phase 2 - Generate Functions

async function generateZkSyncWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingZkSync.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'zkSync',
        walletName: `zkSync Wallet ${zkSyncWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('zkSync Era wallet generated!');
      await loadZkSyncWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[zkSync] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingZkSync.value = false;
  }
}

async function generateFantomWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingFantom.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Fantom',
        walletName: `Fantom Wallet ${fantomWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Fantom wallet generated!');
      await loadFantomWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Fantom] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingFantom.value = false;
  }
}

async function generateLineaWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingLinea.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Linea',
        walletName: `Linea Wallet ${lineaWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Linea wallet generated!');
      await loadLineaWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Linea] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingLinea.value = false;
  }
}

async function generateScrollWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingScroll.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Scroll',
        walletName: `Scroll Wallet ${scrollWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Scroll wallet generated!');
      await loadScrollWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Scroll] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingScroll.value = false;
  }
}

async function generateBlastWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingBlast.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Blast',
        walletName: `Blast Wallet ${blastWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Blast wallet generated!');
      await loadBlastWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Blast] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingBlast.value = false;
  }
}

async function generateMantleWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingMantle.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Mantle',
        walletName: `Mantle Wallet ${mantleWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Mantle wallet generated!');
      await loadMantleWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Mantle] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingMantle.value = false;
  }
}

async function generateCronosWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingCronos.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Cronos',
        walletName: `Cronos Wallet ${cronosWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Cronos wallet generated!');
      await loadCronosWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Cronos] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingCronos.value = false;
  }
}

async function generateHarmonyWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingHarmony.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Harmony',
        walletName: `Harmony Wallet ${harmonyWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Harmony wallet generated!');
      await loadHarmonyWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Harmony] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingHarmony.value = false;
  }
}

async function generateMoonbeamWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingMoonbeam.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Moonbeam',
        walletName: `Moonbeam Wallet ${moonbeamWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Moonbeam wallet generated!');
      await loadMoonbeamWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Moonbeam] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingMoonbeam.value = false;
  }
}

async function generateGnosisWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingGnosis.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Gnosis',
        walletName: `Gnosis Wallet ${gnosisWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Gnosis Chain wallet generated!');
      await loadGnosisWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Gnosis] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingGnosis.value = false;
  }
}

// Generate Solana Wallet
async function generateSolanaWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingSol.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateSolanaWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `Solana Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('Solana wallet generated!');
      await loadSolanaWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Solana] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingSol.value = false;
  }
}

// Generate Internet Computer Wallet
async function generateInternetComputerWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingIcp.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateInternetComputerWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `Internet Computer Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('Internet Computer wallet generated!');
      await loadInternetComputerWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[ICP] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingIcp.value = false;
  }
}

// Generate Mina Protocol Wallet
async function generateMinaWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingMina.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateMinaWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `Mina Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('Mina Protocol wallet generated!');
      await loadMinaWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Mina] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingMina.value = false;
  }
}

// Generate IOTA Wallet
async function generateIOTAWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingIota.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateIOTAWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `IOTA Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('IOTA wallet generated!');
      await loadIOTAWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[IOTA] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingIota.value = false;
  }
}

// Generate Chia Wallet
async function generateChiaWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingXch.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateChiaWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `Chia Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('Chia wallet generated!');
      await loadChiaWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Chia] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingXch.value = false;
  }
}

// Generate Polkadot Wallet
async function generatePolkadotWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingDot.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generatePolkadotWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `Polkadot Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('Polkadot wallet generated!');
      await loadPolkadotWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Polkadot] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingDot.value = false;
  }
}

// Generate Cosmos Wallet
async function generateCosmosWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingAtom.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateCosmosWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        walletName: `Cosmos Wallet ${Date.now()}`,
        chainName: 'Cosmos'  // Match the network name used in loadCosmosWallets
      }
    });
    if (response.success) {
      window.$message?.success('Cosmos wallet generated!');
      await loadCosmosWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Cosmos] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingAtom.value = false;
  }
}

// Generate Algorand Wallet
async function generateAlgorandWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingAlgo.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateAlgorandWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `Algorand Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('Algorand wallet generated!');
      await loadAlgorandWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Algorand] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingAlgo.value = false;
  }
}

// Generate Aptos Wallet
async function generateAptosWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingApt.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateAptosWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `Aptos Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('Aptos wallet generated!');
      await loadAptosWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Aptos] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingApt.value = false;
  }
}

// Generate MultiversX Wallet
async function generateMultiversXWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingMvx.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateMultiversXWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `MultiversX Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('MultiversX wallet generated!');
      await loadMultiversXWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[MultiversX] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingMvx.value = false;
  }
}

// Generate Initia Wallet
async function generateInitiaWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingInitia.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateInitiaWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `Initia Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('Initia wallet generated!');
      await loadInitiaWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Initia] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingInitia.value = false;
  }
}

// Generate Cardano Wallet
async function generateCardanoWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingAda.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateCardanoWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `Cardano Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('Cardano wallet generated!');
      await loadCardanoWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Cardano] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingAda.value = false;
  }
}

// Generate Sui Wallet
async function generateSuiWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingSui.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateSuiWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `Sui Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('Sui wallet generated!');
      await loadSuiWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Sui] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingSui.value = false;
  }
}

// Generate Stellar Wallet
async function generateStellarWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingXlm.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateStellarWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `Stellar Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('Stellar wallet generated!');
      await loadStellarWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Stellar] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingXlm.value = false;
  }
}

// Generate Ripple Wallet
async function generateRippleWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingXrp.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateRippleWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `Ripple Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('Ripple wallet generated!');
      await loadRippleWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Ripple] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingXrp.value = false;
  }
}

// Generate wallet functions for all networks
async function generateLitecoinWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingLtc.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateLitecoinWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `Litecoin Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('Litecoin wallet generated!');
      await loadLitecoinWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Litecoin] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingLtc.value = false;
  }
}

async function generateDogecoinWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingDoge.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateDogecoinWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `Dogecoin Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('Dogecoin wallet generated!');
      await loadDogecoinWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Dogecoin] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingDoge.value = false;
  }
}

async function generateBitcoinCashWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingBch.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateBitcoinCashWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `Bitcoin Cash Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('Bitcoin Cash wallet generated!');
      await loadBitcoinCashWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[BitcoinCash] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingBch.value = false;
  }
}

async function generateDashWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingDash.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateDashWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `DASH Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('DASH wallet generated!');
      await loadDashWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[DASH] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingDash.value = false;
  }
}

async function generateNearWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingNear.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateNearWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `Near Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('Near wallet generated!');
      await loadNearWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Near] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingNear.value = false;
  }
}

async function generateCelestiaWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingTia.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateCelestiaWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `Celestia Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('Celestia wallet generated!');
      await loadCelestiaWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Celestia] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingTia.value = false;
  }
}

async function generateKusamaWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingKsm.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateKusamaWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `Kusama Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('Kusama wallet generated!');
      await loadKusamaWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Kusama] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingKsm.value = false;
  }
}

async function generateAxelarWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingAxl.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateAxelarWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `Axelar Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('Axelar wallet generated!');
      await loadAxelarWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Axelar] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingAxl.value = false;
  }
}

async function generateVeChainWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingVet.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateVeChainWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `VeChain Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('VeChain wallet generated!');
      await loadVeChainWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[VeChain] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingVet.value = false;
  }
}

async function generateFlowWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingFlow.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateFlowWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `Flow Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('Flow wallet generated!');
      await loadFlowWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Flow] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingFlow.value = false;
  }
}

async function generateTezosWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingXtz.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateTezosWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `Tezos Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('Tezos wallet generated!');
      await loadTezosWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Tezos] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingXtz.value = false;
  }
}

async function generateStarknetWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingStrk.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateStarknetWallet', {
      method: 'POST',
      body: { userID: userID.value, walletName: `Starknet Wallet ${Date.now()}` }
    });
    if (response.success) {
      window.$message?.success('Starknet wallet generated!');
      await loadStarknetWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Starknet] Error:', error);
    window.$message?.error(error.message || 'Failed to generate wallet');
  } finally {
    generatingStrk.value = false;
  }
}

// Calculate transaction fee for a given address type
function calculateTxFee(addressType, feeRate = 'medium') {
  const txSize = TX_SIZES[addressType] || 0;
  const satPerVbyte = FEE_RATES[feeRate] || 10;
  const feeSats = txSize * satPerVbyte;
  const feeBTC = feeSats / 100000000; // Convert satoshis to BTC
  return {
    sats: feeSats,
    btc: feeBTC,
    usd: btcPrice.value > 0 ? feeBTC * btcPrice.value : 0
  };
}

// Calculate cost to send $10 USD in BTC
function calculateCostToSend10USD(addressType, feeRate = 'medium') {
  if (btcPrice.value === 0) return { total: 0, fee: 0, amount: 10 };

  const amountBTC = 10 / btcPrice.value; // $10 in BTC
  const fee = calculateTxFee(addressType, feeRate);
  const totalBTC = amountBTC + fee.btc;
  const totalUSD = totalBTC * btcPrice.value;

  return {
    amountBTC: amountBTC.toFixed(8),
    feeBTC: fee.btc.toFixed(8),
    totalBTC: totalBTC.toFixed(8),
    feeUSD: fee.usd.toFixed(2),
    totalUSD: totalUSD.toFixed(2),
    feeSats: fee.sats
  };
}

// Load BTC and ETH prices from ticker
async function loadBtcPrice() {
  try {
    const response = await $fetch('/api/v1/fetchBtcEthPrices');
    if (response.success && response.data) {
      btcPrice.value = response.data.btcPrice || 0;
      ethPrice.value = response.data.ethPrice || 0;
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading BTC/ETH prices:', error);
  }
}

// Load Ethereum wallets
async function loadEthereumWallets() {
  try {
    loadingEthWallets.value = true;
    const response = await $fetch('/api/v1/Wallets/fetchEthereumWallets', {
      method: 'GET',
      params: { userID: userID.value }
    });

    if (response.success) {
      ethereumWallets.value = response.data || [];
    } else {
      window.$message?.error(response.message || 'Failed to load Ethereum wallets');
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Ethereum wallets:', error);
    window.$message?.error('Failed to load Ethereum wallets');
  } finally {
    loadingEthWallets.value = false;
  }
}

// Load BASE wallets
async function loadBaseWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'BASE'
      }
    });

    if (response.success) {
      baseWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading BASE wallets:', error);
  }
}

async function loadPolygonWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Polygon'
      }
    });

    if (response.success) {
      polygonWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Polygon wallets:', error);
  }
}

async function loadArbitrumWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Arbitrum'
      }
    });

    if (response.success) {
      arbitrumWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Arbitrum wallets:', error);
  }
}

async function loadOptimismWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Optimism'
      }
    });

    if (response.success) {
      optimismWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Optimism wallets:', error);
  }
}

async function loadBNBWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'BNB Chain'
      }
    });

    if (response.success) {
      bnbWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading BNB Chain wallets:', error);
  }
}

async function loadAvalancheWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Avalanche'
      }
    });

    if (response.success) {
      avalancheWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Avalanche wallets:', error);
  }
}

// Phase 2 - Load Functions

async function loadZkSyncWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'zkSync Era'
      }
    });

    if (response.success) {
      zkSyncWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading zkSync wallets:', error);
  }
}

async function loadFantomWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Fantom'
      }
    });

    if (response.success) {
      fantomWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Fantom wallets:', error);
  }
}

async function loadLineaWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Linea'
      }
    });

    if (response.success) {
      lineaWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Linea wallets:', error);
  }
}

async function loadScrollWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Scroll'
      }
    });

    if (response.success) {
      scrollWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Scroll wallets:', error);
  }
}

async function loadBlastWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Blast'
      }
    });

    if (response.success) {
      blastWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Blast wallets:', error);
  }
}

async function loadMantleWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Mantle'
      }
    });

    if (response.success) {
      mantleWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Mantle wallets:', error);
  }
}

async function loadCronosWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Cronos'
      }
    });

    if (response.success) {
      cronosWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Cronos wallets:', error);
  }
}

async function loadHarmonyWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Harmony'
      }
    });

    if (response.success) {
      harmonyWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Harmony wallets:', error);
  }
}

async function loadMoonbeamWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Moonbeam'
      }
    });

    if (response.success) {
      moonbeamWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Moonbeam wallets:', error);
  }
}

async function loadGnosisWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Gnosis Chain'
      }
    });

    if (response.success) {
      gnosisWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Gnosis wallets:', error);
  }
}

async function loadSolanaWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Solana'
      }
    });

    if (response.success) {
      solanaWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Solana wallets:', error);
  }
}

async function loadInternetComputerWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Internet Computer'
      }
    });

    if (response.success) {
      internetComputerWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Internet Computer wallets:', error);
  }
}

async function loadMinaWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Mina Protocol'
      }
    });

    if (response.success) {
      minaWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Mina Protocol wallets:', error);
  }
}

async function loadIOTAWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'IOTA'
      }
    });

    if (response.success) {
      iotaWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading IOTA wallets:', error);
  }
}

async function loadChiaWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Chia'
      }
    });

    if (response.success) {
      chiaWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Chia wallets:', error);
  }
}

async function loadPolkadotWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Polkadot'
      }
    });

    if (response.success) {
      polkadotWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Polkadot wallets:', error);
  }
}

async function loadCosmosWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: { userID: userID.value, network: 'Cosmos' }
    });
    if (response.success) {
      cosmosWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Cosmos wallets:', error);
  }
}

async function loadAlgorandWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: { userID: userID.value, network: 'Algorand' }
    });
    if (response.success) {
      algorandWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Algorand wallets:', error);
  }
}

async function loadAptosWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: { userID: userID.value, network: 'Aptos' }
    });
    if (response.success) {
      aptosWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Aptos wallets:', error);
  }
}

async function openEthereumWallet() {
  navigateTo('/ETHNetwork');
}

// Calculate Ethereum transaction fee
function calculateEthTxFee(gasPrice = 'standard') {
  const gasPriceGwei = ETH_GAS_PRICES[gasPrice] || ETH_GAS_PRICES.standard;
  const gasPriceEth = gasPriceGwei / 1000000000; // Convert Gwei to ETH
  const feeEth = ETH_GAS_LIMIT * gasPriceEth;

  return {
    gwei: gasPriceGwei,
    eth: feeEth,
    usd: ethPrice.value > 0 ? feeEth * ethPrice.value : 0
  };
}

// Calculate cost to send $10 USD in ETH
function calculateEthCostToSend10USD(gasPrice = 'standard') {
  if (ethPrice.value === 0) return { total: 0, fee: 0, amount: 10, feeGwei: 0 };

  const amountETH = 10 / ethPrice.value; // $10 in ETH
  const fee = calculateEthTxFee(gasPrice);
  const totalETH = amountETH + fee.eth;
  const totalUSD = totalETH * ethPrice.value;

  return {
    amountETH: amountETH.toFixed(8),
    feeETH: fee.eth.toFixed(8),
    totalETH: totalETH.toFixed(8),
    feeUSD: fee.usd.toFixed(2),
    totalUSD: totalUSD.toFixed(2),
    feeGwei: fee.gwei
  };
}

// Generate wallet functions for new networks
const generatingScrt = ref(false);
const generatingKuji = ref(false);
const generatingArch = ref(false);
const generatingRune = ref(false);
const generatingWaves = ref(false);
const generatingZil = ref(false);
const generatingNeo = ref(false);
const generatingKda = ref(false);
const generatingEos = ref(false);
const generatingWaxp = ref(false);
const generatingOnt = ref(false);
const generatingTheta = ref(false);
const generatingCspr = ref(false);
const generatingIcx = ref(false);
const generatingQtum = ref(false);
const generatingErg = ref(false);
const generatingXem = ref(false);
const generatingXym = ref(false);
const generatingCkb = ref(false);
const generatingAzero = ref(false);
const generatingXrd = ref(false);
const generatingNibi = ref(false);
const generatingDym = ref(false);
const generatingImx = ref(false);
const generatingLrc = ref(false);
const generatingUos = ref(false);
const generatingHype = ref(false);
const generatingDag = ref(false);
const generatingLcx = ref(false);

// Phase 3+ Generating States
const generatingRonin = ref(false);
const generatingImmutableZkEVM = ref(false);
const generatingBeam = ref(false);
const generatingOasys = ref(false);
const generatingPolygonZkEVM = ref(false);
const generatingBoba = ref(false);
const generatingMetis = ref(false);
const generatingAurora = ref(false);
const generatingRedstone = ref(false);
const generatingOpBNB = ref(false);
const generatingArbitrumNova = ref(false);
const generatingZora = ref(false);
const generatingMantaPacific = ref(false);
const generatingMorphL2 = ref(false);
const generatingXai = ref(false);
const generatingFraxtal = ref(false);
const generatingTaiko = ref(false);
const generatingModeNetwork = ref(false);
const generatingCelo = ref(false);
const generatingHedera = ref(false);
const generatingSei = ref(false);
const generatingKava = ref(false);
const generatingShimmerEVM = ref(false);
const generatingConfluxESpace = ref(false);
const generatingOasisEmerald = ref(false);
const generatingEnergyWeb = ref(false);
const generatingTelosEVM = ref(false);
const generatingHorizenEON = ref(false);
const generatingViction = ref(false);
const generatingFuse = ref(false);
const generatingSyscoin = ref(false);
const generatingThunderCore = ref(false);
const generatingAstar = ref(false);
const generatingShiden = ref(false);
const generatingEfinity = ref(false);
const generatingWorldChain = ref(false);
const generatingSonic = ref(false);
const generatingFlare = ref(false);
const generatingSongbird = ref(false);
const generatingZetaChain = ref(false);
const generatingSmartBCH = ref(false);
const generatingRSK = ref(false);
const generatingWanchain = ref(false);
const generatingGoChain = ref(false);
const generatingCanto = ref(false);

async function generateSecretWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingScrt.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateSecretWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('Secret Network wallet generated successfully!');
      await loadSecretWallets(); // Refresh wallet counts
    }
  } catch (error) {
    message.error('Failed to generate Secret wallet');
  } finally {
    generatingScrt.value = false;
  }
}

async function generateKujiraWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingKuji.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateKujiraWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('Kujira wallet generated successfully!');
      await loadKujiraWallets();
    }
  } catch (error) {
    message.error('Failed to generate Kujira wallet');
  } finally {
    generatingKuji.value = false;
  }
}

async function generateArchwayWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingArch.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateArchwayWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('Archway wallet generated successfully!');
      await loadArchwayWallets();
    }
  } catch (error) {
    message.error('Failed to generate Archway wallet');
  } finally {
    generatingArch.value = false;
  }
}

async function generateThorchainWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingRune.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateThorchainWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('Thorchain wallet generated successfully!');
      await loadThorchainWallets();
    }
  } catch (error) {
    message.error('Failed to generate Thorchain wallet');
  } finally {
    generatingRune.value = false;
  }
}

async function generateWavesWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingWaves.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateWavesWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('Waves wallet generated successfully!');
      await loadWavesWallets();
    }
  } catch (error) {
    message.error('Failed to generate Waves wallet');
  } finally {
    generatingWaves.value = false;
  }
}

async function generateZilliqaWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingZil.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateZilliqaWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('Zilliqa wallet generated successfully!');
      await loadZilliqaWallets();
    }
  } catch (error) {
    message.error('Failed to generate Zilliqa wallet');
  } finally {
    generatingZil.value = false;
  }
}

async function generateNeoWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingNeo.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateNeoWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('NEO wallet generated successfully!');
      await loadNeoWallets();
    }
  } catch (error) {
    message.error('Failed to generate NEO wallet');
  } finally {
    generatingNeo.value = false;
  }
}

async function generateKadenaWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingKda.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateKadenaWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('Kadena wallet generated successfully!');
      await loadKadenaWallets();
    }
  } catch (error) {
    message.error('Failed to generate Kadena wallet');
  } finally {
    generatingKda.value = false;
  }
}

async function generateEosWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingEos.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEOSWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('EOS wallet generated successfully!');
      await loadEosWallets();
    }
  } catch (error) {
    message.error('Failed to generate EOS wallet');
  } finally {
    generatingEos.value = false;
  }
}

async function generateWaxWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingWaxp.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateWAXWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('WAX wallet generated successfully!');
      await loadWaxWallets();
    }
  } catch (error) {
    message.error('Failed to generate WAX wallet');
  } finally {
    generatingWaxp.value = false;
  }
}

async function generateOntologyWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingOnt.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateOntologyWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('Ontology wallet generated successfully!');
      await loadOntologyWallets();
    }
  } catch (error) {
    message.error('Failed to generate Ontology wallet');
  } finally {
    generatingOnt.value = false;
  }
}

async function generateThetaWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingTheta.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateThetaWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('Theta Network wallet generated successfully!');
      await loadThetaWallets();
    }
  } catch (error) {
    message.error('Failed to generate Theta wallet');
  } finally {
    generatingTheta.value = false;
  }
}

async function generateCasperWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingCspr.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateCasperWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('Casper Network wallet generated successfully!');
      await loadCasperWallets();
    }
  } catch (error) {
    message.error('Failed to generate Casper wallet');
  } finally {
    generatingCspr.value = false;
  }
}

async function generateIconWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingIcx.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateICONWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('ICON wallet generated successfully!');
      await loadIconWallets();
    }
  } catch (error) {
    message.error('Failed to generate ICON wallet');
  } finally {
    generatingIcx.value = false;
  }
}

async function generateQtumWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingQtum.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateQtumWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('Qtum wallet generated successfully!');
      await loadQtumWallets();
    }
  } catch (error) {
    message.error('Failed to generate Qtum wallet');
  } finally {
    generatingQtum.value = false;
  }
}

async function generateErgoWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingErg.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateErgoWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('Ergo wallet generated successfully!');
      await loadErgoWallets();
    }
  } catch (error) {
    message.error('Failed to generate Ergo wallet');
  } finally {
    generatingErg.value = false;
  }
}

async function generateNemWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingXem.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateNEMWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('NEM wallet generated successfully!');
      await loadNemWallets();
    }
  } catch (error) {
    message.error('Failed to generate NEM wallet');
  } finally {
    generatingXem.value = false;
  }
}

async function generateSymbolWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingXym.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateSymbolWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('Symbol wallet generated successfully!');
      await loadSymbolWallets();
    }
  } catch (error) {
    message.error('Failed to generate Symbol wallet');
  } finally {
    generatingXym.value = false;
  }
}

async function generateNervosCkbWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingCkb.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateNervosCKBWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('Nervos CKB wallet generated successfully!');
      await loadNervosCkbWallets();
    }
  } catch (error) {
    message.error('Failed to generate Nervos CKB wallet');
  } finally {
    generatingCkb.value = false;
  }
}

async function generateAlephZeroWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingAzero.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateAlephZeroWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('Aleph Zero wallet generated successfully!');
      await loadAlephZeroWallets();
    }
  } catch (error) {
    message.error('Failed to generate Aleph Zero wallet');
  } finally {
    generatingAzero.value = false;
  }
}

async function generateRadixWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingXrd.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateRadixWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('Radix DLT wallet generated successfully!');
      await loadRadixWallets();
    }
  } catch (error) {
    message.error('Failed to generate Radix wallet');
  } finally {
    generatingXrd.value = false;
  }
}

async function generateNibiruWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingNibi.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateNibiruWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('Nibiru Chain wallet generated successfully!');
      await loadNibiruWallets();
    }
  } catch (error) {
    message.error('Failed to generate Nibiru wallet');
  } finally {
    generatingNibi.value = false;
  }
}

async function generateDymensionWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingDym.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateDymensionWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('Dymension wallet generated successfully!');
      await loadDymensionWallets();
    }
  } catch (error) {
    message.error('Failed to generate Dymension wallet');
  } finally {
    generatingDym.value = false;
  }
}

async function generateImmutableXWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingImx.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateImmutableXWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('Immutable X wallet generated successfully!');
      await loadImmutableXWallets();
    }
  } catch (error) {
    message.error('Failed to generate Immutable X wallet');
  } finally {
    generatingImx.value = false;
  }
}

async function generateLoopringWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingLrc.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateLoopringWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('Loopring wallet generated successfully!');
      await loadLoopringWallets();
    }
  } catch (error) {
    message.error('Failed to generate Loopring wallet');
  } finally {
    generatingLrc.value = false;
  }
}

async function generateUltraWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingUos.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateUltraWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('Ultra.io wallet generated successfully!');
      await loadUltraWallets();
    }
  } catch (error) {
    message.error('Failed to generate Ultra wallet');
  } finally {
    generatingUos.value = false;
  }
}

async function generateHyperliquidWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingHype.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateHyperliquidWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('Hyperliquid wallet generated successfully!');
      await loadHyperliquidWallets();
    }
  } catch (error) {
    message.error('Failed to generate Hyperliquid wallet');
  } finally {
    generatingHype.value = false;
  }
}

async function generateConstellationWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingDag.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateConstellationWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('Constellation wallet generated successfully!');
      await loadConstellationWallets();
    }
  } catch (error) {
    message.error('Failed to generate Constellation wallet');
  } finally {
    generatingDag.value = false;
  }
}

async function generateLcxWallet() {
  if (!userID.value) return message.error('Please login first');
  generatingLcx.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateLCXWallet', {
      method: 'POST',
      body: { userID: userID.value, saveToDatabase: true }
    });
    if (response.success) {
      message.success('LCX wallet generated successfully!');
      await loadLcxWallets();
    }
  } catch (error) {
    message.error('Failed to generate LCX wallet');
  } finally {
    generatingLcx.value = false;
  }
}

// ========== PHASE 3+ GENERATE WALLET FUNCTIONS ==========

async function generateRoninWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingRonin.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Ronin',
        walletName: `Ronin Wallet ${roninWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Ronin wallet generated successfully!');
      await loadRoninWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Ronin] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Ronin wallet');
  } finally {
    generatingRonin.value = false;
  }
}

async function generateImmutableZkEVMWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingImmutableZkEVM.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'ImmutableZkEVM',
        walletName: `Immutable zkEVM Wallet ${immutableZkEVMWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Immutable zkEVM wallet generated successfully!');
      await loadImmutableZkEVMWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Immutable zkEVM] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Immutable zkEVM wallet');
  } finally {
    generatingImmutableZkEVM.value = false;
  }
}

async function generateBeamWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingBeam.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Beam',
        walletName: `Beam Wallet ${beamWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Beam wallet generated successfully!');
      await loadBeamWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Beam] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Beam wallet');
  } finally {
    generatingBeam.value = false;
  }
}

async function generateOasysWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingOasys.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Oasys',
        walletName: `Oasys Wallet ${oasysWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Oasys wallet generated successfully!');
      await loadOasysWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Oasys] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Oasys wallet');
  } finally {
    generatingOasys.value = false;
  }
}

async function generatePolygonZkEVMWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingPolygonZkEVM.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'PolygonZkEVM',
        walletName: `Polygon zkEVM Wallet ${polygonZkEVMWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Polygon zkEVM wallet generated successfully!');
      await loadPolygonZkEVMWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Polygon zkEVM] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Polygon zkEVM wallet');
  } finally {
    generatingPolygonZkEVM.value = false;
  }
}

async function generateBobaWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingBoba.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Boba',
        walletName: `Boba Wallet ${bobaWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Boba wallet generated successfully!');
      await loadBobaWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Boba] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Boba wallet');
  } finally {
    generatingBoba.value = false;
  }
}

async function generateMetisWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingMetis.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Metis',
        walletName: `Metis Wallet ${metisWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Metis wallet generated successfully!');
      await loadMetisWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Metis] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Metis wallet');
  } finally {
    generatingMetis.value = false;
  }
}

async function generateAuroraWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingAurora.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Aurora',
        walletName: `Aurora Wallet ${auroraWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Aurora wallet generated successfully!');
      await loadAuroraWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Aurora] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Aurora wallet');
  } finally {
    generatingAurora.value = false;
  }
}

async function generateRedstoneWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingRedstone.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Redstone',
        walletName: `Redstone Wallet ${redstoneWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Redstone wallet generated successfully!');
      await loadRedstoneWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Redstone] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Redstone wallet');
  } finally {
    generatingRedstone.value = false;
  }
}

async function generateOpBNBWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingOpBNB.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'OpBNB',
        walletName: `opBNB Wallet ${opBNBWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('opBNB wallet generated successfully!');
      await loadOpBNBWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[opBNB] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate opBNB wallet');
  } finally {
    generatingOpBNB.value = false;
  }
}

async function generateArbitrumNovaWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingArbitrumNova.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'ArbitrumNova',
        walletName: `Arbitrum Nova Wallet ${arbitrumNovaWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Arbitrum Nova wallet generated successfully!');
      await loadArbitrumNovaWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Arbitrum Nova] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Arbitrum Nova wallet');
  } finally {
    generatingArbitrumNova.value = false;
  }
}

async function generateZoraWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingZora.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Zora',
        walletName: `Zora Wallet ${zoraWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Zora wallet generated successfully!');
      await loadZoraWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Zora] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Zora wallet');
  } finally {
    generatingZora.value = false;
  }
}

async function generateMantaPacificWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingMantaPacific.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'MantaPacific',
        walletName: `Manta Pacific Wallet ${mantaPacificWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Manta Pacific wallet generated successfully!');
      await loadMantaPacificWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Manta Pacific] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Manta Pacific wallet');
  } finally {
    generatingMantaPacific.value = false;
  }
}

async function generateMorphL2Wallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingMorphL2.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'MorphL2',
        walletName: `Morph L2 Wallet ${morphL2Wallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Morph L2 wallet generated successfully!');
      await loadMorphL2Wallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Morph L2] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Morph L2 wallet');
  } finally {
    generatingMorphL2.value = false;
  }
}

async function generateXaiWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingXai.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Xai',
        walletName: `Xai Wallet ${xaiWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Xai wallet generated successfully!');
      await loadXaiWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Xai] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Xai wallet');
  } finally {
    generatingXai.value = false;
  }
}

async function generateFraxtalWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingFraxtal.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Fraxtal',
        walletName: `Fraxtal Wallet ${fraxtalWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Fraxtal wallet generated successfully!');
      await loadFraxtalWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Fraxtal] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Fraxtal wallet');
  } finally {
    generatingFraxtal.value = false;
  }
}

async function generateTaikoWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingTaiko.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Taiko',
        walletName: `Taiko Wallet ${taikoWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Taiko wallet generated successfully!');
      await loadTaikoWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Taiko] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Taiko wallet');
  } finally {
    generatingTaiko.value = false;
  }
}

async function generateModeNetworkWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingModeNetwork.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'ModeNetwork',
        walletName: `Mode Network Wallet ${modeNetworkWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Mode Network wallet generated successfully!');
      await loadModeNetworkWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Mode Network] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Mode Network wallet');
  } finally {
    generatingModeNetwork.value = false;
  }
}

async function generateCeloWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingCelo.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Celo',
        walletName: `Celo Wallet ${celoWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Celo wallet generated successfully!');
      await loadCeloWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Celo] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Celo wallet');
  } finally {
    generatingCelo.value = false;
  }
}

async function generateHederaWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingHedera.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Hedera',
        walletName: `Hedera Wallet ${hederaWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Hedera wallet generated successfully!');
      await loadHederaWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Hedera] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Hedera wallet');
  } finally {
    generatingHedera.value = false;
  }
}

async function generateSeiWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingSei.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Sei',
        walletName: `Sei Wallet ${seiWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Sei wallet generated successfully!');
      await loadSeiWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Sei] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Sei wallet');
  } finally {
    generatingSei.value = false;
  }
}

async function generateKavaWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingKava.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Kava',
        walletName: `Kava Wallet ${kavaWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Kava wallet generated successfully!');
      await loadKavaWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Kava] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Kava wallet');
  } finally {
    generatingKava.value = false;
  }
}

async function generateShimmerEVMWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingShimmerEVM.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'ShimmerEVM',
        walletName: `Shimmer EVM Wallet ${shimmerEVMWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Shimmer EVM wallet generated successfully!');
      await loadShimmerEVMWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Shimmer EVM] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Shimmer EVM wallet');
  } finally {
    generatingShimmerEVM.value = false;
  }
}

async function generateConfluxESpaceWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingConfluxESpace.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'ConfluxESpace',
        walletName: `Conflux eSpace Wallet ${confluxESpaceWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Conflux eSpace wallet generated successfully!');
      await loadConfluxESpaceWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Conflux eSpace] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Conflux eSpace wallet');
  } finally {
    generatingConfluxESpace.value = false;
  }
}

async function generateOasisEmeraldWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingOasisEmerald.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'OasisEmerald',
        walletName: `Oasis Emerald Wallet ${oasisEmeraldWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Oasis Emerald wallet generated successfully!');
      await loadOasisEmeraldWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Oasis Emerald] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Oasis Emerald wallet');
  } finally {
    generatingOasisEmerald.value = false;
  }
}

async function generateEnergyWebWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingEnergyWeb.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'EnergyWeb',
        walletName: `Energy Web Wallet ${energyWebWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Energy Web wallet generated successfully!');
      await loadEnergyWebWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Energy Web] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Energy Web wallet');
  } finally {
    generatingEnergyWeb.value = false;
  }
}

async function generateTelosEVMWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingTelosEVM.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'TelosEVM',
        walletName: `Telos EVM Wallet ${telosEVMWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Telos EVM wallet generated successfully!');
      await loadTelosEVMWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Telos EVM] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Telos EVM wallet');
  } finally {
    generatingTelosEVM.value = false;
  }
}

async function generateHorizenEONWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingHorizenEON.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'HorizenEON',
        walletName: `Horizen EON Wallet ${horizenEONWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Horizen EON wallet generated successfully!');
      await loadHorizenEONWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Horizen EON] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Horizen EON wallet');
  } finally {
    generatingHorizenEON.value = false;
  }
}

async function generateVictionWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingViction.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Viction',
        walletName: `Viction Wallet ${victionWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Viction wallet generated successfully!');
      await loadVictionWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Viction] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Viction wallet');
  } finally {
    generatingViction.value = false;
  }
}

async function generateFuseWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingFuse.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Fuse',
        walletName: `Fuse Wallet ${fuseWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Fuse wallet generated successfully!');
      await loadFuseWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Fuse] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Fuse wallet');
  } finally {
    generatingFuse.value = false;
  }
}

async function generateSyscoinWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingSyscoin.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Syscoin',
        walletName: `Syscoin Wallet ${syscoinWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Syscoin wallet generated successfully!');
      await loadSyscoinWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Syscoin] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Syscoin wallet');
  } finally {
    generatingSyscoin.value = false;
  }
}

async function generateThunderCoreWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingThunderCore.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'ThunderCore',
        walletName: `ThunderCore Wallet ${thunderCoreWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('ThunderCore wallet generated successfully!');
      await loadThunderCoreWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[ThunderCore] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate ThunderCore wallet');
  } finally {
    generatingThunderCore.value = false;
  }
}

async function generateAstarWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingAstar.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Astar',
        walletName: `Astar Wallet ${astarWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Astar wallet generated successfully!');
      await loadAstarWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Astar] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Astar wallet');
  } finally {
    generatingAstar.value = false;
  }
}

async function generateShidenWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingShiden.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Shiden',
        walletName: `Shiden Wallet ${shidenWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Shiden wallet generated successfully!');
      await loadShidenWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Shiden] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Shiden wallet');
  } finally {
    generatingShiden.value = false;
  }
}

async function generateEfinityWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingEfinity.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Efinity',
        walletName: `Efinity Wallet ${efinityWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Efinity wallet generated successfully!');
      await loadEfinityWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Efinity] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Efinity wallet');
  } finally {
    generatingEfinity.value = false;
  }
}

async function generateWorldChainWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingWorldChain.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'WorldChain',
        walletName: `World Chain Wallet ${worldChainWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('World Chain wallet generated successfully!');
      await loadWorldChainWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[World Chain] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate World Chain wallet');
  } finally {
    generatingWorldChain.value = false;
  }
}

async function generateSonicWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingSonic.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Sonic',
        walletName: `Sonic Wallet ${sonicWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Sonic wallet generated successfully!');
      await loadSonicWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Sonic] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Sonic wallet');
  } finally {
    generatingSonic.value = false;
  }
}

async function generateFlareWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingFlare.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Flare',
        walletName: `Flare Wallet ${flareWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Flare wallet generated successfully!');
      await loadFlareWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Flare] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Flare wallet');
  } finally {
    generatingFlare.value = false;
  }
}

async function generateSongbirdWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingSongbird.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Songbird',
        walletName: `Songbird Wallet ${songbirdWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Songbird wallet generated successfully!');
      await loadSongbirdWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Songbird] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Songbird wallet');
  } finally {
    generatingSongbird.value = false;
  }
}

async function generateZetaChainWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingZetaChain.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'ZetaChain',
        walletName: `ZetaChain Wallet ${zetaChainWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('ZetaChain wallet generated successfully!');
      await loadZetaChainWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[ZetaChain] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate ZetaChain wallet');
  } finally {
    generatingZetaChain.value = false;
  }
}

async function generateSmartBCHWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingSmartBCH.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'SmartBCH',
        walletName: `SmartBCH Wallet ${smartBCHWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('SmartBCH wallet generated successfully!');
      await loadSmartBCHWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[SmartBCH] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate SmartBCH wallet');
  } finally {
    generatingSmartBCH.value = false;
  }
}

async function generateRSKWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingRSK.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'RSK',
        walletName: `RSK Wallet ${rSKWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('RSK wallet generated successfully!');
      await loadRSKWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[RSK] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate RSK wallet');
  } finally {
    generatingRSK.value = false;
  }
}

async function generateWanchainWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingWanchain.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Wanchain',
        walletName: `Wanchain Wallet ${wanchainWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Wanchain wallet generated successfully!');
      await loadWanchainWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Wanchain] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Wanchain wallet');
  } finally {
    generatingWanchain.value = false;
  }
}

async function generateGoChainWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingGoChain.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'GoChain',
        walletName: `GoChain Wallet ${goChainWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('GoChain wallet generated successfully!');
      await loadGoChainWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[GoChain] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate GoChain wallet');
  } finally {
    generatingGoChain.value = false;
  }
}

async function generateCantoWallet() {
  if (!userID.value) {
    window.$message?.error('Please login first!');
    return;
  }
  generatingCanto.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: 'Canto',
        walletName: `Canto Wallet ${cantoWallets.value.length + 1}`
      }
    });
    if (response.success) {
      window.$message?.success('Canto wallet generated successfully!');
      await loadCantoWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[Canto] Generate error:', error);
    window.$message?.error(error.message || 'Failed to generate Canto wallet');
  } finally {
    generatingCanto.value = false;
  }
}

// ========== PHASE 3+ LOAD WALLET FUNCTIONS ==========

async function loadRoninWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Ronin'
      }
    });
    if (response.success) {
      roninWallets.value = response.data || [];
    } else {
      console.error('[Ronin] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Ronin] Load error:', error);
  }
}

async function loadImmutableZkEVMWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'ImmutableZkEVM'
      }
    });
    if (response.success) {
      immutableZkEVMWallets.value = response.data || [];
    } else {
      console.error('[Immutable zkEVM] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Immutable zkEVM] Load error:', error);
  }
}

async function loadBeamWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Beam'
      }
    });
    if (response.success) {
      beamWallets.value = response.data || [];
    } else {
      console.error('[Beam] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Beam] Load error:', error);
  }
}

async function loadOasysWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Oasys'
      }
    });
    if (response.success) {
      oasysWallets.value = response.data || [];
    } else {
      console.error('[Oasys] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Oasys] Load error:', error);
  }
}

async function loadPolygonZkEVMWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'PolygonZkEVM'
      }
    });
    if (response.success) {
      polygonZkEVMWallets.value = response.data || [];
    } else {
      console.error('[Polygon zkEVM] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Polygon zkEVM] Load error:', error);
  }
}

async function loadBobaWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Boba'
      }
    });
    if (response.success) {
      bobaWallets.value = response.data || [];
    } else {
      console.error('[Boba] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Boba] Load error:', error);
  }
}

async function loadMetisWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Metis'
      }
    });
    if (response.success) {
      metisWallets.value = response.data || [];
    } else {
      console.error('[Metis] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Metis] Load error:', error);
  }
}

async function loadAuroraWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Aurora'
      }
    });
    if (response.success) {
      auroraWallets.value = response.data || [];
    } else {
      console.error('[Aurora] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Aurora] Load error:', error);
  }
}

async function loadRedstoneWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Redstone'
      }
    });
    if (response.success) {
      redstoneWallets.value = response.data || [];
    } else {
      console.error('[Redstone] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Redstone] Load error:', error);
  }
}

async function loadOpBNBWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'OpBNB'
      }
    });
    if (response.success) {
      opBNBWallets.value = response.data || [];
    } else {
      console.error('[opBNB] Load error:', response.message);
    }
  } catch (error) {
    console.error('[opBNB] Load error:', error);
  }
}

async function loadArbitrumNovaWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'ArbitrumNova'
      }
    });
    if (response.success) {
      arbitrumNovaWallets.value = response.data || [];
    } else {
      console.error('[Arbitrum Nova] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Arbitrum Nova] Load error:', error);
  }
}

async function loadZoraWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Zora'
      }
    });
    if (response.success) {
      zoraWallets.value = response.data || [];
    } else {
      console.error('[Zora] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Zora] Load error:', error);
  }
}

async function loadMantaPacificWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'MantaPacific'
      }
    });
    if (response.success) {
      mantaPacificWallets.value = response.data || [];
    } else {
      console.error('[Manta Pacific] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Manta Pacific] Load error:', error);
  }
}

async function loadMorphL2Wallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'MorphL2'
      }
    });
    if (response.success) {
      morphL2Wallets.value = response.data || [];
    } else {
      console.error('[Morph L2] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Morph L2] Load error:', error);
  }
}

async function loadXaiWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Xai'
      }
    });
    if (response.success) {
      xaiWallets.value = response.data || [];
    } else {
      console.error('[Xai] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Xai] Load error:', error);
  }
}

async function loadFraxtalWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Fraxtal'
      }
    });
    if (response.success) {
      fraxtalWallets.value = response.data || [];
    } else {
      console.error('[Fraxtal] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Fraxtal] Load error:', error);
  }
}

async function loadTaikoWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Taiko'
      }
    });
    if (response.success) {
      taikoWallets.value = response.data || [];
    } else {
      console.error('[Taiko] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Taiko] Load error:', error);
  }
}

async function loadModeNetworkWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'ModeNetwork'
      }
    });
    if (response.success) {
      modeNetworkWallets.value = response.data || [];
    } else {
      console.error('[Mode Network] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Mode Network] Load error:', error);
  }
}

async function loadCeloWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Celo'
      }
    });
    if (response.success) {
      celoWallets.value = response.data || [];
    } else {
      console.error('[Celo] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Celo] Load error:', error);
  }
}

async function loadHederaWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Hedera'
      }
    });
    if (response.success) {
      hederaWallets.value = response.data || [];
    } else {
      console.error('[Hedera] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Hedera] Load error:', error);
  }
}

async function loadSeiWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Sei'
      }
    });
    if (response.success) {
      seiWallets.value = response.data || [];
    } else {
      console.error('[Sei] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Sei] Load error:', error);
  }
}

async function loadKavaWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Kava'
      }
    });
    if (response.success) {
      kavaWallets.value = response.data || [];
    } else {
      console.error('[Kava] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Kava] Load error:', error);
  }
}

async function loadShimmerEVMWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'ShimmerEVM'
      }
    });
    if (response.success) {
      shimmerEVMWallets.value = response.data || [];
    } else {
      console.error('[Shimmer EVM] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Shimmer EVM] Load error:', error);
  }
}

async function loadConfluxESpaceWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'ConfluxESpace'
      }
    });
    if (response.success) {
      confluxESpaceWallets.value = response.data || [];
    } else {
      console.error('[Conflux eSpace] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Conflux eSpace] Load error:', error);
  }
}

async function loadOasisEmeraldWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'OasisEmerald'
      }
    });
    if (response.success) {
      oasisEmeraldWallets.value = response.data || [];
    } else {
      console.error('[Oasis Emerald] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Oasis Emerald] Load error:', error);
  }
}

async function loadEnergyWebWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'EnergyWeb'
      }
    });
    if (response.success) {
      energyWebWallets.value = response.data || [];
    } else {
      console.error('[Energy Web] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Energy Web] Load error:', error);
  }
}

async function loadTelosEVMWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'TelosEVM'
      }
    });
    if (response.success) {
      telosEVMWallets.value = response.data || [];
    } else {
      console.error('[Telos EVM] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Telos EVM] Load error:', error);
  }
}

async function loadHorizenEONWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'HorizenEON'
      }
    });
    if (response.success) {
      horizenEONWallets.value = response.data || [];
    } else {
      console.error('[Horizen EON] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Horizen EON] Load error:', error);
  }
}

async function loadVictionWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Viction'
      }
    });
    if (response.success) {
      victionWallets.value = response.data || [];
    } else {
      console.error('[Viction] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Viction] Load error:', error);
  }
}

async function loadFuseWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Fuse'
      }
    });
    if (response.success) {
      fuseWallets.value = response.data || [];
    } else {
      console.error('[Fuse] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Fuse] Load error:', error);
  }
}

async function loadSyscoinWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Syscoin'
      }
    });
    if (response.success) {
      syscoinWallets.value = response.data || [];
    } else {
      console.error('[Syscoin] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Syscoin] Load error:', error);
  }
}

async function loadThunderCoreWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'ThunderCore'
      }
    });
    if (response.success) {
      thunderCoreWallets.value = response.data || [];
    } else {
      console.error('[ThunderCore] Load error:', response.message);
    }
  } catch (error) {
    console.error('[ThunderCore] Load error:', error);
  }
}

async function loadAstarWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Astar'
      }
    });
    if (response.success) {
      astarWallets.value = response.data || [];
    } else {
      console.error('[Astar] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Astar] Load error:', error);
  }
}

async function loadShidenWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Shiden'
      }
    });
    if (response.success) {
      shidenWallets.value = response.data || [];
    } else {
      console.error('[Shiden] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Shiden] Load error:', error);
  }
}

async function loadEfinityWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Efinity'
      }
    });
    if (response.success) {
      efinityWallets.value = response.data || [];
    } else {
      console.error('[Efinity] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Efinity] Load error:', error);
  }
}

async function loadWorldChainWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'WorldChain'
      }
    });
    if (response.success) {
      worldChainWallets.value = response.data || [];
    } else {
      console.error('[World Chain] Load error:', response.message);
    }
  } catch (error) {
    console.error('[World Chain] Load error:', error);
  }
}

async function loadSonicWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Sonic'
      }
    });
    if (response.success) {
      sonicWallets.value = response.data || [];
    } else {
      console.error('[Sonic] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Sonic] Load error:', error);
  }
}

async function loadFlareWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Flare'
      }
    });
    if (response.success) {
      flareWallets.value = response.data || [];
    } else {
      console.error('[Flare] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Flare] Load error:', error);
  }
}

async function loadSongbirdWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Songbird'
      }
    });
    if (response.success) {
      songbirdWallets.value = response.data || [];
    } else {
      console.error('[Songbird] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Songbird] Load error:', error);
  }
}

async function loadZetaChainWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'ZetaChain'
      }
    });
    if (response.success) {
      zetaChainWallets.value = response.data || [];
    } else {
      console.error('[ZetaChain] Load error:', response.message);
    }
  } catch (error) {
    console.error('[ZetaChain] Load error:', error);
  }
}

async function loadSmartBCHWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'SmartBCH'
      }
    });
    if (response.success) {
      smartBCHWallets.value = response.data || [];
    } else {
      console.error('[SmartBCH] Load error:', response.message);
    }
  } catch (error) {
    console.error('[SmartBCH] Load error:', error);
  }
}

async function loadRSKWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'RSK'
      }
    });
    if (response.success) {
      rSKWallets.value = response.data || [];
    } else {
      console.error('[RSK] Load error:', response.message);
    }
  } catch (error) {
    console.error('[RSK] Load error:', error);
  }
}

async function loadWanchainWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Wanchain'
      }
    });
    if (response.success) {
      wanchainWallets.value = response.data || [];
    } else {
      console.error('[Wanchain] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Wanchain] Load error:', error);
  }
}

async function loadGoChainWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'GoChain'
      }
    });
    if (response.success) {
      goChainWallets.value = response.data || [];
    } else {
      console.error('[GoChain] Load error:', response.message);
    }
  } catch (error) {
    console.error('[GoChain] Load error:', error);
  }
}

async function loadCantoWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Canto'
      }
    });
    if (response.success) {
      cantoWallets.value = response.data || [];
    } else {
      console.error('[Canto] Load error:', response.message);
    }
  } catch (error) {
    console.error('[Canto] Load error:', error);
  }
}

async function loadSecretWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Secret Network'
      }
    });

    if (response.success) {
      secretWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Secret Network wallets:', error);
  }
}

async function loadKujiraWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Kujira'
      }
    });

    if (response.success) {
      kujiraWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Kujira wallets:', error);
  }
}

async function loadArchwayWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Archway'
      }
    });

    if (response.success) {
      archwayWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Archway wallets:', error);
  }
}

async function loadThorchainWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Thorchain'
      }
    });

    if (response.success) {
      thorchainWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Thorchain wallets:', error);
  }
}

async function loadWavesWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Waves'
      }
    });

    if (response.success) {
      wavesWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Waves wallets:', error);
  }
}

async function loadZilliqaWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Zilliqa'
      }
    });

    if (response.success) {
      zilliqaWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Zilliqa wallets:', error);
  }
}

async function loadNeoWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'NEO'
      }
    });

    if (response.success) {
      neoWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading NEO wallets:', error);
  }
}

async function loadKadenaWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Kadena'
      }
    });

    if (response.success) {
      kadenaWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Kadena wallets:', error);
  }
}

async function loadEosWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'EOS'
      }
    });

    if (response.success) {
      eosWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading EOS wallets:', error);
  }
}

async function loadWaxWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'WAX'
      }
    });

    if (response.success) {
      waxWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading WAX wallets:', error);
  }
}

async function loadOntologyWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Ontology'
      }
    });

    if (response.success) {
      ontologyWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Ontology wallets:', error);
  }
}

async function loadThetaWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Theta Network'
      }
    });

    if (response.success) {
      thetaWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Theta Network wallets:', error);
  }
}

async function loadCasperWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Casper Network'
      }
    });

    if (response.success) {
      casperWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Casper Network wallets:', error);
  }
}

async function loadIconWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'ICON'
      }
    });

    if (response.success) {
      iconWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading ICON wallets:', error);
  }
}

async function loadQtumWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Qtum'
      }
    });

    if (response.success) {
      qtumWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Qtum wallets:', error);
  }
}

async function loadErgoWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Ergo'
      }
    });

    if (response.success) {
      ergoWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Ergo wallets:', error);
  }
}

async function loadNemWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'NEM'
      }
    });

    if (response.success) {
      nemWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading NEM wallets:', error);
  }
}

async function loadSymbolWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Symbol'
      }
    });

    if (response.success) {
      symbolWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Symbol wallets:', error);
  }
}

async function loadNervosCkbWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Nervos CKB'
      }
    });

    if (response.success) {
      nervosCkbWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Nervos CKB wallets:', error);
  }
}

async function loadAlephZeroWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Aleph Zero'
      }
    });

    if (response.success) {
      alephZeroWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Aleph Zero wallets:', error);
  }
}

async function loadRadixWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Radix DLT'
      }
    });

    if (response.success) {
      radixWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Radix DLT wallets:', error);
  }
}

async function loadNibiruWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Nibiru Chain'
      }
    });

    if (response.success) {
      nibiruWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Nibiru Chain wallets:', error);
  }
}

async function loadDymensionWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Dymension'
      }
    });

    if (response.success) {
      dymensionWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Dymension wallets:', error);
  }
}

async function loadImmutableXWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Immutable X'
      }
    });

    if (response.success) {
      immutableXWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Immutable X wallets:', error);
  }
}

async function loadLoopringWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Loopring'
      }
    });

    if (response.success) {
      loopringWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Loopring wallets:', error);
  }
}

async function loadUltraWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Ultra.io'
      }
    });

    if (response.success) {
      ultraWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Ultra.io wallets:', error);
  }
}

async function loadHyperliquidWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Hyperliquid'
      }
    });

    if (response.success) {
      hyperliquidWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Hyperliquid wallets:', error);
  }
}

async function loadConstellationWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'Constellation'
      }
    });

    if (response.success) {
      constellationWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading Constellation wallets:', error);
  }
}

async function loadLcxWallets() {
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: 'LCX'
      }
    });

    if (response.success) {
      lcxWallets.value = response.data || [];
    }
  } catch (error) {
    console.error('[CryptoWallet] Error loading LCX wallets:', error);
  }
}

onMounted(() => {
  // Pre-load wallets count and prices
  loadBitcoinWallets();
  loadEthereumWallets();
  loadBaseWallets();
  loadPolygonWallets();
  loadArbitrumWallets();
  loadOptimismWallets();
  loadBNBWallets();
  loadAvalancheWallets();
  // Phase 2 networks
  loadZkSyncWallets();
  loadFantomWallets();
  loadLineaWallets();
  loadScrollWallets();
  loadBlastWallets();
  loadMantleWallets();
  loadCronosWallets();
  loadHarmonyWallets();
  loadMoonbeamWallets();
  loadGnosisWallets();
  loadSolanaWallets();
  loadInternetComputerWallets();
  loadMinaWallets();
  loadIOTAWallets();
  loadChiaWallets();
  loadPolkadotWallets();
  loadCosmosWallets();
  loadAlgorandWallets();
  loadAptosWallets();
  loadMultiversXWallets();
  loadInitiaWallets();
  loadCardanoWallets();
  loadSuiWallets();
  loadStellarWallets();
  loadRippleWallets();
  loadLitecoinWallets();
  loadDogecoinWallets();
  loadBitcoinCashWallets();
  loadDashWallets();
  loadNearWallets();
  loadCelestiaWallets();
  loadKusamaWallets();
  loadAxelarWallets();
  loadVeChainWallets();
  loadFlowWallets();
  loadTezosWallets();
  loadStarknetWallets();
  loadSecretWallets();
  loadKujiraWallets();
  loadArchwayWallets();
  loadThorchainWallets();
  loadWavesWallets();
  loadZilliqaWallets();
  loadNeoWallets();
  loadKadenaWallets();
  loadEosWallets();
  loadWaxWallets();
  loadOntologyWallets();
  loadThetaWallets();
  loadCasperWallets();
  loadIconWallets();
  loadQtumWallets();
  loadErgoWallets();
  loadNemWallets();
  loadSymbolWallets();
  loadNervosCkbWallets();
  loadAlephZeroWallets();
  loadRadixWallets();
  loadNibiruWallets();
  loadDymensionWallets();
  loadImmutableXWallets();
  loadLoopringWallets();
  loadUltraWallets();
  loadHyperliquidWallets();
  loadConstellationWallets();
  loadLcxWallets();
  // Phase 3+ networks
  loadRoninWallets();
  loadImmutableZkEVMWallets();
  loadBeamWallets();
  loadOasysWallets();
  loadPolygonZkEVMWallets();
  loadBobaWallets();
  loadMetisWallets();
  loadAuroraWallets();
  loadRedstoneWallets();
  loadOpBNBWallets();
  loadArbitrumNovaWallets();
  loadZoraWallets();
  loadMantaPacificWallets();
  loadMorphL2Wallets();
  loadXaiWallets();
  loadFraxtalWallets();
  loadTaikoWallets();
  loadModeNetworkWallets();
  loadCeloWallets();
  loadHederaWallets();
  loadSeiWallets();
  loadKavaWallets();
  loadShimmerEVMWallets();
  loadConfluxESpaceWallets();
  loadOasisEmeraldWallets();
  loadEnergyWebWallets();
  loadTelosEVMWallets();
  loadHorizenEONWallets();
  loadVictionWallets();
  loadFuseWallets();
  loadSyscoinWallets();
  loadThunderCoreWallets();
  loadAstarWallets();
  loadShidenWallets();
  loadEfinityWallets();
  loadWorldChainWallets();
  loadSonicWallets();
  loadFlareWallets();
  loadSongbirdWallets();
  loadZetaChainWallets();
  loadSmartBCHWallets();
  loadRSKWallets();
  loadWanchainWallets();
  loadGoChainWallets();
  loadCantoWallets();
  loadBtcPrice();
});
</script>

<style scoped>
.crypto-wallet-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.wallet-header {
  margin-bottom: 30px;
}

.wallet-header h2 {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #fff;
}

.wallet-header p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.crypto-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 1200px;
  margin: 0 auto;
}

.crypto-card {
  background: linear-gradient(135deg, rgba(30, 35, 50, 0.9), rgba(20, 25, 40, 0.9));
  border: 2px solid rgba(100, 100, 100, 0.3);
  border-radius: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.crypto-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #f7931a, #ffb347);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.crypto-card.btc-card::before {
  background: linear-gradient(90deg, #f7931a, #ffb347);
}

.crypto-card.eth-card::before {
  background: linear-gradient(90deg, #627eea, #8fa3f3);
}

.crypto-card.base-card::before {
  background: linear-gradient(90deg, #0052FF, #4169E1);
}

.crypto-card.polygon-card::before {
  background: linear-gradient(90deg, #8247E5, #A855F7);
}

.crypto-card.arbitrum-card::before {
  background: linear-gradient(90deg, #2D374B, #28A0F0);
}

.crypto-card.optimism-card::before {
  background: linear-gradient(90deg, #FF0420, #FF6B6B);
}

.crypto-card.bnb-card::before {
  background: linear-gradient(90deg, #F3BA2F, #FFD700);
}

.crypto-card.avalanche-card::before {
  background: linear-gradient(90deg, #E84142, #FF6B6B);
}

/* Phase 2 Network Cards */
.crypto-card.zksync-card::before {
  background: linear-gradient(90deg, #8C8DFC, #B8B9FE);
}

.crypto-card.fantom-card::before {
  background: linear-gradient(90deg, #13B5EC, #1969FF);
}

.crypto-card.linea-card::before {
  background: linear-gradient(90deg, #121212, #61DFFF);
}

.crypto-card.scroll-card::before {
  background: linear-gradient(90deg, #FFEEDA, #FFC6A5);
}

.crypto-card.blast-card::before {
  background: linear-gradient(90deg, #FCFC03, #FFF);
}

.crypto-card.mantle-card::before {
  background: linear-gradient(90deg, #000, #4ADE80);
}

.crypto-card.cronos-card::before {
  background: linear-gradient(90deg, #002D74, #0066CC);
}

.crypto-card.harmony-card::before {
  background: linear-gradient(90deg, #00AEE9, #69FABD);
}

.crypto-card.moonbeam-card::before {
  background: linear-gradient(90deg, #53CBC8, #E1147B);
}

.crypto-card.gnosis-card::before {
  background: linear-gradient(90deg, #04795B, #48A9A6);
}

.crypto-card.theta-card::before {
  background: linear-gradient(90deg, #2AB8E6, #4FC3F7);
}

.crypto-card.cspr-card::before {
  background: linear-gradient(90deg, #FF473E, #FF6B66);
}

.crypto-card.erg-card::before {
  background: linear-gradient(90deg, #FF9800, #FFB74D);
}

.crypto-card.xrd-card::before {
  background: linear-gradient(90deg, #00C9FF, #92FE9D);
}

.crypto-card.uos-card::before {
  background: linear-gradient(90deg, #7B2CBF, #9D4EDD);
}

.crypto-card.mvx-card::before {
  background: linear-gradient(90deg, #0095ff, #00b3ff);
}

/* Phase 3+ Network Cards */
.crypto-card.ronin-card::before {
  background: linear-gradient(90deg, #0066FF, #0047B3);
}

.crypto-card.immutable-zkevm-card::before {
  background: linear-gradient(90deg, #0D0D0D, #3772FF);
}

.crypto-card.beam-card::before {
  background: linear-gradient(90deg, #A020F0, #D946EF);
}

.crypto-card.oasys-card::before {
  background: linear-gradient(90deg, #00D9FF, #00B8E6);
}

.crypto-card.polygon-zkevm-card::before {
  background: linear-gradient(90deg, #7B3FE4, #A855F7);
}

.crypto-card.boba-card::before {
  background: linear-gradient(90deg, #CCFF00, #B8E600);
}

.crypto-card.metis-card::before {
  background: linear-gradient(90deg, #00DACC, #00B8AD);
}

.crypto-card.aurora-card::before {
  background: linear-gradient(90deg, #70D44B, #5AB835);
}

.crypto-card.redstone-card::before {
  background: linear-gradient(90deg, #FF0000, #CC0000);
}

.crypto-card.opbnb-card::before {
  background: linear-gradient(90deg, #F0B90B, #F3BA2F);
}

.crypto-card.arbitrum-nova-card::before {
  background: linear-gradient(90deg, #FFA500, #FF8C00);
}

.crypto-card.zora-card::before {
  background: linear-gradient(90deg, #000000, #2D2D2D);
}

.crypto-card.manta-pacific-card::before {
  background: linear-gradient(90deg, #6B21A8, #8B5CF6);
}

.crypto-card.morph-l2-card::before {
  background: linear-gradient(90deg, #00FFD1, #00D9B8);
}

.crypto-card.xai-card::before {
  background: linear-gradient(90deg, #FF4D4D, #FF0000);
}

.crypto-card.fraxtal-card::before {
  background: linear-gradient(90deg, #000000, #1A1A1A);
}

.crypto-card.taiko-card::before {
  background: linear-gradient(90deg, #E81899, #FC0FC0);
}

.crypto-card.mode-network-card::before {
  background: linear-gradient(90deg, #DFFE00, #C4E600);
}

.crypto-card.celo-card::before {
  background: linear-gradient(90deg, #FBCC5C, #35D07F);
}

.crypto-card.hedera-card::before {
  background: linear-gradient(90deg, #220A46, #3B0D6B);
}

.crypto-card.sei-card::before {
  background: linear-gradient(90deg, #8B0000, #DC143C);
}

.crypto-card.kava-card::before {
  background: linear-gradient(90deg, #FF564F, #FF3D35);
}

.crypto-card.shimmer-evm-card::before {
  background: linear-gradient(90deg, #26D9D9, #1FB8B8);
}

.crypto-card.conflux-espace-card::before {
  background: linear-gradient(90deg, #4BBEEB, #3AA3D1);
}

.crypto-card.oasis-emerald-card::before {
  background: linear-gradient(90deg, #0092F6, #0074C4);
}

.crypto-card.energy-web-card::before {
  background: linear-gradient(90deg, #A566FF, #8F4FE6);
}

.crypto-card.telos-evm-card::before {
  background: linear-gradient(90deg, #571AFF, #3F00CC);
}

.crypto-card.horizen-eon-card::before {
  background: linear-gradient(90deg, #041742, #0A2A6B);
}

.crypto-card.viction-card::before {
  background: linear-gradient(90deg, #4169E1, #3354C4);
}

.crypto-card.fuse-card::before {
  background: linear-gradient(90deg, #B5FF00, #9FE600);
}

.crypto-card.syscoin-card::before {
  background: linear-gradient(90deg, #0082C6, #006BA3);
}

.crypto-card.thunder-core-card::before {
  background: linear-gradient(90deg, #FFC000, #E6AD00);
}

.crypto-card.astar-card::before {
  background: linear-gradient(90deg, #0059FF, #0047CC);
}

.crypto-card.shiden-card::before {
  background: linear-gradient(90deg, #FF4A00, #E63E00);
}

.crypto-card.efinity-card::before {
  background: linear-gradient(90deg, #FF1744, #E60035);
}

.crypto-card.world-chain-card::before {
  background: linear-gradient(90deg, #000000, #2D2D2D);
}

.crypto-card.sonic-card::before {
  background: linear-gradient(90deg, #00A3FF, #0088CC);
}

.crypto-card.flare-card::before {
  background: linear-gradient(90deg, #E31337, #C4102E);
}

.crypto-card.songbird-card::before {
  background: linear-gradient(90deg, #FF6B35, #FF5722);
}

.crypto-card.zeta-chain-card::before {
  background: linear-gradient(90deg, #00D4AA, #00B890);
}

.crypto-card.smart-bch-card::before {
  background: linear-gradient(90deg, #8DC63F, #78B335);
}

.crypto-card.rsk-card::before {
  background: linear-gradient(90deg, #00A651, #008F47);
}

.crypto-card.wanchain-card::before {
  background: linear-gradient(90deg, #136AAD, #0F5A94);
}

.crypto-card.go-chain-card::before {
  background: linear-gradient(90deg, #20C4F4, #1BADD9);
}

.crypto-card.canto-card::before {
  background: linear-gradient(90deg, #06FC99, #05E085);
}

.crypto-card:not(.disabled):hover {
  transform: translateY(-4px);
  border-color: #00ff88;
  box-shadow: 0 8px 24px rgba(0, 255, 136, 0.2);
}

.crypto-card:not(.disabled):hover::before {
  opacity: 1;
}

.crypto-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 0 0 auto;
}

.crypto-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.1);
}

.crypto-icon.btc {
  background: linear-gradient(135deg, #f7931a, #ffb347);
  color: #fff;
}

.crypto-icon.eth {
  background: linear-gradient(135deg, #627eea, #8fa3f3);
  color: #fff;
}

.crypto-icon.base {
  background: linear-gradient(135deg, #0052FF, #4169E1);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.polygon {
  background: linear-gradient(135deg, #8247E5, #A855F7);
  color: #fff;
  font-size: 36px;
}

.crypto-icon.arbitrum {
  background: linear-gradient(135deg, #2D374B, #28A0F0);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.optimism {
  background: linear-gradient(135deg, #FF0420, #FF6B6B);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.bnb {
  background: linear-gradient(135deg, #F3BA2F, #FFD700);
  color: #000;
  font-size: 32px;
}

.crypto-icon.avalanche {
  background: linear-gradient(135deg, #E84142, #FF6B6B);
  color: #fff;
  font-size: 32px;
}

/* Phase 2 Network Icons */
.crypto-icon.zksync {
  background: linear-gradient(135deg, #8C8DFC, #B8B9FE);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.fantom {
  background: linear-gradient(135deg, #13B5EC, #1969FF);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.linea {
  background: linear-gradient(135deg, #121212, #61DFFF);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.scroll {
  background: linear-gradient(135deg, #FFEEDA, #FFC6A5);
  color: #333;
  font-size: 32px;
}

.crypto-icon.blast {
  background: linear-gradient(135deg, #FCFC03, #FFF);
  color: #000;
  font-size: 32px;
}

.crypto-icon.mantle {
  background: linear-gradient(135deg, #000, #4ADE80);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.cronos {
  background: linear-gradient(135deg, #002D74, #0066CC);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.harmony {
  background: linear-gradient(135deg, #00AEE9, #69FABD);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.moonbeam {
  background: linear-gradient(135deg, #53CBC8, #E1147B);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.gnosis {
  background: linear-gradient(135deg, #04795B, #48A9A6);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.theta {
  background: linear-gradient(135deg, #2AB8E6, #4FC3F7);
  color: #fff;
  font-size: 36px;
  font-weight: 700;
}

.crypto-icon.cspr {
  background: linear-gradient(135deg, #FF473E, #FF6B66);
  color: #fff;
  font-size: 40px;
  font-weight: 700;
}

.crypto-icon.erg {
  background: linear-gradient(135deg, #FF9800, #FFB74D);
  color: #fff;
  font-size: 36px;
  font-weight: 700;
}

.crypto-icon.xrd {
  background: linear-gradient(135deg, #00C9FF, #92FE9D);
  color: #fff;
  font-size: 40px;
  font-weight: 700;
}

.crypto-icon.uos {
  background: linear-gradient(135deg, #7B2CBF, #9D4EDD);
  color: #fff;
  font-size: 40px;
  font-weight: 700;
}

.crypto-icon.mvx {
  background: linear-gradient(135deg, #0095ff, #00b3ff);
  color: #fff;
  font-size: 28px;
}

/* Phase 3+ Network Icons */
.crypto-icon.ronin {
  background: linear-gradient(135deg, #0066FF, #0047B3);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.immutable-zkevm {
  background: linear-gradient(135deg, #0D0D0D, #3772FF);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.beam {
  background: linear-gradient(135deg, #A020F0, #D946EF);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.oasys {
  background: linear-gradient(135deg, #00D9FF, #00B8E6);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.polygon-zkevm {
  background: linear-gradient(135deg, #7B3FE4, #A855F7);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.boba {
  background: linear-gradient(135deg, #CCFF00, #B8E600);
  color: #000;
  font-size: 32px;
}

.crypto-icon.metis {
  background: linear-gradient(135deg, #00DACC, #00B8AD);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.aurora {
  background: linear-gradient(135deg, #70D44B, #5AB835);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.redstone {
  background: linear-gradient(135deg, #FF0000, #CC0000);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.opbnb {
  background: linear-gradient(135deg, #F0B90B, #F3BA2F);
  color: #000;
  font-size: 32px;
}

.crypto-icon.arbitrum-nova {
  background: linear-gradient(135deg, #FFA500, #FF8C00);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.zora {
  background: linear-gradient(135deg, #000000, #2D2D2D);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.manta-pacific {
  background: linear-gradient(135deg, #6B21A8, #8B5CF6);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.morph-l2 {
  background: linear-gradient(135deg, #00FFD1, #00D9B8);
  color: #000;
  font-size: 32px;
}

.crypto-icon.xai {
  background: linear-gradient(135deg, #FF4D4D, #FF0000);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.fraxtal {
  background: linear-gradient(135deg, #000000, #1A1A1A);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.taiko {
  background: linear-gradient(135deg, #E81899, #FC0FC0);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.mode-network {
  background: linear-gradient(135deg, #DFFE00, #C4E600);
  color: #000;
  font-size: 32px;
}

.crypto-icon.celo {
  background: linear-gradient(135deg, #FBCC5C, #35D07F);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.hedera {
  background: linear-gradient(135deg, #220A46, #3B0D6B);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.sei {
  background: linear-gradient(135deg, #8B0000, #DC143C);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.kava {
  background: linear-gradient(135deg, #FF564F, #FF3D35);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.shimmer-evm {
  background: linear-gradient(135deg, #26D9D9, #1FB8B8);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.conflux-espace {
  background: linear-gradient(135deg, #4BBEEB, #3AA3D1);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.oasis-emerald {
  background: linear-gradient(135deg, #0092F6, #0074C4);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.energy-web {
  background: linear-gradient(135deg, #A566FF, #8F4FE6);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.telos-evm {
  background: linear-gradient(135deg, #571AFF, #3F00CC);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.horizen-eon {
  background: linear-gradient(135deg, #041742, #0A2A6B);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.viction {
  background: linear-gradient(135deg, #4169E1, #3354C4);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.fuse {
  background: linear-gradient(135deg, #B5FF00, #9FE600);
  color: #000;
  font-size: 32px;
}

.crypto-icon.syscoin {
  background: linear-gradient(135deg, #0082C6, #006BA3);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.thunder-core {
  background: linear-gradient(135deg, #FFC000, #E6AD00);
  color: #000;
  font-size: 32px;
}

.crypto-icon.astar {
  background: linear-gradient(135deg, #0059FF, #0047CC);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.shiden {
  background: linear-gradient(135deg, #FF4A00, #E63E00);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.efinity {
  background: linear-gradient(135deg, #FF1744, #E60035);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.world-chain {
  background: linear-gradient(135deg, #000000, #2D2D2D);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.sonic {
  background: linear-gradient(135deg, #00A3FF, #0088CC);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.flare {
  background: linear-gradient(135deg, #E31337, #C4102E);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.songbird {
  background: linear-gradient(135deg, #FF6B35, #FF5722);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.zeta-chain {
  background: linear-gradient(135deg, #00D4AA, #00B890);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.smart-bch {
  background: linear-gradient(135deg, #8DC63F, #78B335);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.rsk {
  background: linear-gradient(135deg, #00A651, #008F47);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.wanchain {
  background: linear-gradient(135deg, #136AAD, #0F5A94);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.go-chain {
  background: linear-gradient(135deg, #20C4F4, #1BADD9);
  color: #fff;
  font-size: 32px;
}

.crypto-icon.canto {
  background: linear-gradient(135deg, #06FC99, #05E085);
  color: #000;
  font-size: 32px;
}

.crypto-info h3 {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  margin: 0;
}

.crypto-symbol {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

.card-stats {
  display: flex;
  gap: 32px;
  flex: 1 1 auto;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  font-weight: 500;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #00ff88;
}

.addresses-preview {
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  flex: 0 1 auto;
  max-width: 400px;
}

.address-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 11px;
}

.address-item:last-child {
  margin-bottom: 0;
}

.address-label {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  flex-shrink: 0;
}

.more-indicator {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  font-style: italic;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.card-footer {
  display: flex;
  gap: 8px;
  flex: 0 0 auto;
}

.view-btn {
  font-size: 14px;
  font-weight: 600;
}

/* Modal Styles */
.modal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.empty-state {
  padding: 40px 20px;
}

.btc-wallets-list {
  max-height: 70vh;
  overflow-y: auto;
}

.sub-wallets {
  margin-top: 12px;
}

.sub-wallet-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 16px;
  font-style: italic;
}

.address-types {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-card {
  background: rgba(20, 25, 40, 0.6);
  border: 1px solid rgba(100, 100, 100, 0.3);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.2s ease;
}

.address-card:hover {
  border-color: #00ff88;
  background: rgba(20, 25, 40, 0.8);
}

.address-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.address-icon {
  font-size: 18px;
}

.address-type {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  flex: 1;
}

.address-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.address-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
}

.address-row .label {
  color: rgba(255, 255, 255, 0.5);
  min-width: 60px;
  font-weight: 500;
}

.address-row code {
  font-family: 'Monaco', 'Courier New', monospace;
  color: #00ff88;
  font-size: 11px;
  background: rgba(0, 255, 136, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.address-row button {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 11px;
  word-break: break-all;
  text-align: left;
}

.address-row.fee-info {
  background: rgba(0, 255, 136, 0.05);
  padding: 8px;
  border-radius: 4px;
  margin-top: 8px;
  border-left: 3px solid #00ff88;
}

.fee-value {
  font-family: 'Monaco', 'Courier New', monospace;
  color: #00ff88;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fee-value.lowest-fee {
  color: #00ff00;
  animation: pulse-fee 2s ease-in-out infinite;
}

@keyframes pulse-fee {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
