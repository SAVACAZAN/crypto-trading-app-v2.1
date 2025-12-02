/**
 * Navigation Cards Generator
 * Generates HTML for navigation cards to add to CryptoWallet.vue
 */

const networks = [
  // Gaming Networks
  { key: 'Ronin', name: 'Ronin', symbol: 'RON', icon: '⚔️', page: 'RoninNetwork' },
  { key: 'ImmutableZkEVM', name: 'Immutable zkEVM', symbol: 'IMX', icon: '🎯', page: 'ImmutableZkEVMNetwork' },
  { key: 'Beam', name: 'Beam', symbol: 'BEAM', icon: '🌟', page: 'BeamNetwork' },
  { key: 'Oasys', name: 'Oasys', symbol: 'OAS', icon: '🏝️', page: 'OasysNetwork' },

  // Layer 2 Solutions
  { key: 'PolygonZkEVM', name: 'Polygon zkEVM', symbol: 'ETH', icon: '🔷', page: 'PolygonZkEVMNetwork' },
  { key: 'Boba', name: 'Boba Network', symbol: 'BOBA', icon: '🧋', page: 'BobaNetwork' },
  { key: 'Metis', name: 'Metis', symbol: 'METIS', icon: '🌊', page: 'MetisNetwork' },
  { key: 'Aurora', name: 'Aurora', symbol: 'ETH', icon: '🌌', page: 'AuroraNetwork' },
  { key: 'Redstone', name: 'Redstone', symbol: 'RED', icon: '🔴', page: 'RedstoneNetwork' },
  { key: 'OpBNB', name: 'opBNB', symbol: 'BNB', icon: '⚡', page: 'OpBNBNetwork' },
  { key: 'ArbitrumNova', name: 'Arbitrum Nova', symbol: 'ETH', icon: '🎮', page: 'ArbitrumNovaNetwork' },
  { key: 'Zora', name: 'Zora Network', symbol: 'ETH', icon: '🎨', page: 'ZoraNetwork' },
  { key: 'MantaPacific', name: 'Manta Pacific', symbol: 'ETH', icon: '🦈', page: 'MantaPacificNetwork' },
  { key: 'MorphL2', name: 'Morph L2', symbol: 'ETH', icon: '🔀', page: 'MorphL2Network' },
  { key: 'Xai', name: 'Xai Network', symbol: 'XAI', icon: '🎯', page: 'XaiNetwork' },
  { key: 'Fraxtal', name: 'Fraxtal', symbol: 'frxETH', icon: '❄️', page: 'FraxtalNetwork' },
  { key: 'Taiko', name: 'Taiko', symbol: 'TAIKO', icon: '⛩️', page: 'TaikoNetwork' },
  { key: 'ModeNetwork', name: 'Mode Network', symbol: 'MODE', icon: '🟢', page: 'ModeNetworkNetwork' },

  // Layer 1 Networks
  { key: 'Celo', name: 'Celo', symbol: 'CELO', icon: '📱', page: 'CeloNetwork' },
  { key: 'Hedera', name: 'Hedera', symbol: 'HBAR', icon: 'ⓗ', page: 'HederaNetwork' },
  { key: 'Sei', name: 'Sei Network', symbol: 'SEI', icon: '🌊', page: 'SeiNetwork' },
  { key: 'Kava', name: 'Kava', symbol: 'KAVA', icon: '🔴', page: 'KavaNetwork' },
  { key: 'ShimmerEVM', name: 'Shimmer EVM', symbol: 'SMR', icon: '✨', page: 'ShimmerEVMNetwork' },
  { key: 'ConfluxESpace', name: 'Conflux eSpace', symbol: 'CFX', icon: '🌐', page: 'ConfluxESpaceNetwork' },
  { key: 'OasisEmerald', name: 'Oasis Emerald', symbol: 'ROSE', icon: '🌹', page: 'OasisEmeraldNetwork' },
  { key: 'EnergyWeb', name: 'Energy Web', symbol: 'EWT', icon: '⚡', page: 'EnergyWebNetwork' },
  { key: 'TelosEVM', name: 'Telos EVM', symbol: 'TLOS', icon: '🔷', page: 'TelosEVMNetwork' },
  { key: 'HorizenEON', name: 'Horizen EON', symbol: 'ZEN', icon: '🔐', page: 'HorizenEONNetwork' },
  { key: 'Viction', name: 'Viction', symbol: 'VIC', icon: '🎯', page: 'VictionNetwork' },
  { key: 'Fuse', name: 'Fuse Network', symbol: 'FUSE', icon: '💳', page: 'FuseNetwork' },
  { key: 'Syscoin', name: 'Syscoin', symbol: 'SYS', icon: '🔷', page: 'SyscoinNetwork' },
  { key: 'ThunderCore', name: 'ThunderCore', symbol: 'TT', icon: '⚡', page: 'ThunderCoreNetwork' },
  { key: 'Astar', name: 'Astar', symbol: 'ASTR', icon: '⭐', page: 'AstarNetwork' },
  { key: 'Shiden', name: 'Shiden', symbol: 'SDN', icon: '🦋', page: 'ShidenNetwork' },
  { key: 'Efinity', name: 'Efinity', symbol: 'EFI', icon: '💎', page: 'EfinityNetwork' },
  { key: 'WorldChain', name: 'World Chain', symbol: 'WLD', icon: '🌍', page: 'WorldChainNetwork' },
  { key: 'Sonic', name: 'Sonic', symbol: 'S', icon: '💨', page: 'SonicNetwork' },
  { key: 'Flare', name: 'Flare Network', symbol: 'FLR', icon: '🔥', page: 'FlareNetwork' },
  { key: 'Songbird', name: 'Songbird', symbol: 'SGB', icon: '🐦', page: 'SongbirdNetwork' },
  { key: 'ZetaChain', name: 'ZetaChain', symbol: 'ZETA', icon: '⛓️', page: 'ZetaChainNetwork' },

  // Sidechains & Special
  { key: 'SmartBCH', name: 'SmartBCH', symbol: 'BCH', icon: '💚', page: 'SmartBCHNetwork' },
  { key: 'RSK', name: 'RSK', symbol: 'RBTC', icon: '🟠', page: 'RSKNetwork' },
  { key: 'Wanchain', name: 'Wanchain', symbol: 'WAN', icon: '🌐', page: 'WanchainNetwork' },
  { key: 'GoChain', name: 'GoChain', symbol: 'GO', icon: '🟢', page: 'GoChainNetwork' },
  { key: 'Canto', name: 'Canto', symbol: 'CANTO', icon: '🎵', page: 'CantoNetwork' },
];

const generateCard = (network) => {
  const keyLower = network.key.charAt(0).toLowerCase() + network.key.slice(1);

  return `      <!-- ${network.name} Card -->
      <div class="crypto-card ${keyLower}-card" @click="navigateTo('/${network.page}')">
        <div class="card-header">
          <div class="crypto-icon ${keyLower}">${network.icon}</div>
          <div class="crypto-info">
            <h3>${network.name}</h3>
            <span class="crypto-symbol">${network.symbol}</span>
          </div>
        </div>
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-label">Wallets</span>
            <span class="stat-value">{{ total${network.key}Wallets }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Addresses</span>
            <span class="stat-value">{{ total${network.key}Addresses }}</span>
          </div>
        </div>

        <div v-if="${keyLower}Wallets.length > 0" class="addresses-preview">
          <div class="address-item" v-for="(wallet, idx) in ${keyLower}Wallets.slice(0, 2)" :key="wallet._id">
            <span class="address-label">{{ wallet.walletName }}:</span>
            <n-button text size="tiny" type="primary" @click.stop="copyToClipboard(wallet.address)">
              {{ formatAddressShort(wallet.address) }}
            </n-button>
          </div>
          <div v-if="${keyLower}Wallets.length > 2" class="more-indicator">
            +{{ ${keyLower}Wallets.length - 2 }} more wallets
          </div>
        </div>

        <div class="card-footer">
          <n-button type="primary" size="small" @click.stop="generate${network.key}Wallet" :loading="generating${network.key}" block>
            ➕ Generate Wallet
          </n-button>
        </div>
      </div>
`;
};

// Generate all cards
console.log('\n<!-- ========== PHASE 3+ NEW NETWORKS ========== -->\n');
networks.forEach(network => {
  console.log(generateCard(network));
});

console.log('\n<!-- ========== END PHASE 3+ NETWORKS ========== -->\n');
