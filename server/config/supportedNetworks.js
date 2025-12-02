/**
 * Supported Networks Configuration
 * Lista completă a rețelelor suportate de aplicație
 */

export const SUPPORTED_NETWORKS = {
  // EVM Networks
  EVM: [
    { name: 'Ethereum', symbol: 'ETH', chainId: 1, coinType: 60 },
    { name: 'Binance Smart Chain', symbol: 'BNB', chainId: 56, coinType: 60 },
    { name: 'Polygon', symbol: 'MATIC', chainId: 137, coinType: 60 },
    { name: 'Avalanche', symbol: 'AVAX', chainId: 43114, coinType: 60 },
    { name: 'Arbitrum', symbol: 'ARB', chainId: 42161, coinType: 60 },
    { name: 'Optimism', symbol: 'OP', chainId: 10, coinType: 60 },
    { name: 'Base', symbol: 'BASE', chainId: 8453, coinType: 60 },
    { name: 'Fantom', symbol: 'FTM', chainId: 250, coinType: 60 },
    { name: 'Cronos', symbol: 'CRO', chainId: 25, coinType: 60 },
    { name: 'Gnosis', symbol: 'xDAI', chainId: 100, coinType: 60 },
    { name: 'Celo', symbol: 'CELO', chainId: 42220, coinType: 60 },
    { name: 'Moonbeam', symbol: 'GLMR', chainId: 1284, coinType: 60 },
    { name: 'Moonriver', symbol: 'MOVR', chainId: 1285, coinType: 60 },
    { name: 'Harmony', symbol: 'ONE', chainId: 1666600000, coinType: 60 },
    { name: 'Aurora', symbol: 'AURORA', chainId: 1313161554, coinType: 60 },
    { name: 'Theta Network', symbol: 'THETA', chainId: 361, coinType: 60 },
    { name: 'LCX', symbol: 'LCX', chainId: 1, coinType: 60 },
  ],

  // Non-EVM Networks
  NON_EVM: [
    // Bitcoin & Forks
    { name: 'Bitcoin', symbol: 'BTC', coinType: 0, addressTypes: ['legacy', 'segwit', 'bech32'] },
    { name: 'Litecoin', symbol: 'LTC', coinType: 2 },
    { name: 'Dogecoin', symbol: 'DOGE', coinType: 3 },
    { name: 'Bitcoin Cash', symbol: 'BCH', coinType: 145 },
    { name: 'Dash', symbol: 'DASH', coinType: 5 },

    // Layer 1 Blockchains
    { name: 'Solana', symbol: 'SOL', coinType: 501 },
    { name: 'Cardano', symbol: 'ADA', coinType: 1815 },
    { name: 'Polkadot', symbol: 'DOT', coinType: 354 },
    { name: 'Kusama', symbol: 'KSM', coinType: 434 },
    { name: 'Algorand', symbol: 'ALGO', coinType: 283 },
    { name: 'Tezos', symbol: 'XTZ', coinType: 1729 },
    { name: 'Cosmos', symbol: 'ATOM', coinType: 118 },
    { name: 'Near Protocol', symbol: 'NEAR', coinType: 397 },
    { name: 'Aptos', symbol: 'APT', coinType: 637 },
    { name: 'Sui', symbol: 'SUI', coinType: 784 },
    { name: 'Stellar', symbol: 'XLM', coinType: 148 },
    { name: 'Ripple', symbol: 'XRP', coinType: 144 },
    { name: 'TRON', symbol: 'TRX', coinType: 195 },
    { name: 'TON', symbol: 'TON', coinType: 607 },
    { name: 'Internet Computer', symbol: 'ICP', coinType: 223 },
    { name: 'MultiversX', symbol: 'EGLD', coinType: 508 },
    { name: 'Mina Protocol', symbol: 'MINA', coinType: 12586 },
    { name: 'Chia', symbol: 'XCH', coinType: 8444 },
    { name: 'IOTA', symbol: 'IOTA', coinType: 4218 },
    { name: 'VeChain', symbol: 'VET', coinType: 818 },
    { name: 'Flow', symbol: 'FLOW', coinType: 539 },
    { name: 'Starknet', symbol: 'STRK', coinType: 9004 },

    // Cosmos Ecosystem
    { name: 'Celestia', symbol: 'TIA', coinType: 118 },
    { name: 'Axelar', symbol: 'AXL', coinType: 118 },
    { name: 'Secret Network', symbol: 'SCRT', coinType: 529 },
    { name: 'Kujira', symbol: 'KUJI', coinType: 118 },
    { name: 'Archway', symbol: 'ARCH', coinType: 118 },
    { name: 'Thorchain', symbol: 'RUNE', coinType: 931 },
    { name: 'Nibiru Chain', symbol: 'NIBI', coinType: 118 },
    { name: 'Dymension', symbol: 'DYM', coinType: 118 },
    { name: 'Initia', symbol: 'INIT', coinType: 118 },

    // Legacy Platforms
    { name: 'NEO', symbol: 'NEO', coinType: 888 },
    { name: 'Waves', symbol: 'WAVES', coinType: 5741564 },
    { name: 'Zilliqa', symbol: 'ZIL', coinType: 313 },
    { name: 'EOS', symbol: 'EOS', coinType: 194 },
    { name: 'WAX', symbol: 'WAXP', coinType: 194 },
    { name: 'Ontology', symbol: 'ONT', coinType: 1024 },
    { name: 'ICON', symbol: 'ICX', coinType: 4801368 },
    { name: 'Qtum', symbol: 'QTUM', coinType: 2301 },
    { name: 'NEM', symbol: 'XEM', coinType: 43 },
    { name: 'Symbol', symbol: 'XYM', coinType: 4343 },

    // Modern Platforms
    { name: 'Kadena', symbol: 'KDA', coinType: 626 },
    { name: 'Ergo', symbol: 'ERG', coinType: 429 },
    { name: 'Nervos CKB', symbol: 'CKB', coinType: 309 },
    { name: 'Aleph Zero', symbol: 'AZERO', coinType: 643 },
    { name: 'Radix DLT', symbol: 'XRD', coinType: 1022 },
    { name: 'Constellation', symbol: 'DAG', coinType: 1137 },
    { name: 'Casper Network', symbol: 'CSPR', coinType: 506 },

    // Layer 2 & Specialized
    { name: 'Immutable X', symbol: 'IMX', coinType: 60, isL2: true },
    { name: 'Loopring', symbol: 'LRC', coinType: 60, isL2: true },
    { name: 'Ultra.io', symbol: 'UOS', coinType: 194 },
    { name: 'Hyperliquid', symbol: 'HYPE', coinType: 60 },
  ]
};

/**
 * Get all supported networks
 */
export function getAllNetworks() {
  return [
    ...SUPPORTED_NETWORKS.EVM.map(n => ({ ...n, walletType: 'EVM' })),
    ...SUPPORTED_NETWORKS.NON_EVM.map(n => ({ ...n, walletType: 'Non-EVM' }))
  ];
}

/**
 * Get network by symbol
 */
export function getNetworkBySymbol(symbol) {
  const allNetworks = getAllNetworks();
  return allNetworks.find(n => n.symbol === symbol);
}

/**
 * Get network by name
 */
export function getNetworkByName(name) {
  const allNetworks = getAllNetworks();
  return allNetworks.find(n => n.name === name);
}

/**
 * Check if network is supported
 */
export function isNetworkSupported(networkName) {
  return getNetworkByName(networkName) !== undefined;
}

/**
 * Get networks by type
 */
export function getNetworksByType(type) {
  if (type === 'EVM') {
    return SUPPORTED_NETWORKS.EVM;
  } else if (type === 'Non-EVM') {
    return SUPPORTED_NETWORKS.NON_EVM;
  }
  return getAllNetworks();
}

/**
 * Get Cosmos ecosystem networks
 */
export function getCosmosNetworks() {
  return SUPPORTED_NETWORKS.NON_EVM.filter(n =>
    n.coinType === 118 ||
    ['ATOM', 'TIA', 'AXL', 'SCRT', 'KUJI', 'ARCH', 'RUNE', 'NIBI', 'DYM', 'INIT'].includes(n.symbol)
  );
}

/**
 * Get total count of supported networks
 */
export function getSupportedNetworksCount() {
  return {
    total: getAllNetworks().length,
    evm: SUPPORTED_NETWORKS.EVM.length,
    nonEvm: SUPPORTED_NETWORKS.NON_EVM.length
  };
}

/**
 * Network categories for UI grouping
 */
export const NETWORK_CATEGORIES = {
  BITCOIN_FORKS: ['Bitcoin', 'Litecoin', 'Dogecoin', 'Bitcoin Cash', 'Dash'],
  LAYER_1: ['Ethereum', 'Solana', 'Cardano', 'Polkadot', 'Algorand', 'Near Protocol', 'Aptos', 'Sui'],
  COSMOS_ECOSYSTEM: ['Cosmos', 'Celestia', 'Axelar', 'Secret Network', 'Kujira', 'Archway', 'Thorchain', 'Nibiru Chain', 'Dymension'],
  LAYER_2: ['Arbitrum', 'Optimism', 'Base', 'Immutable X', 'Loopring', 'Starknet'],
  DEFI: ['Binance Smart Chain', 'Polygon', 'Avalanche', 'Fantom', 'Radix DLT', 'Hyperliquid', 'LCX'],
  LEGACY: ['NEO', 'Waves', 'EOS', 'WAX', 'Ontology', 'ICON', 'Qtum', 'NEM', 'Symbol'],
  GAMING_NFT: ['WAX', 'Ultra.io', 'Immutable X', 'Flow'],
  PRIVACY: ['Secret Network', 'Aleph Zero'],
  SPECIALIZED: ['TRON', 'TON', 'Internet Computer', 'MultiversX', 'Mina Protocol', 'Chia', 'IOTA', 'VeChain']
};

export default {
  SUPPORTED_NETWORKS,
  getAllNetworks,
  getNetworkBySymbol,
  getNetworkByName,
  isNetworkSupported,
  getNetworksByType,
  getCosmosNetworks,
  getSupportedNetworksCount,
  NETWORK_CATEGORIES
};
