/**
 * Generic EVM Wallet Generator
 * Supports any EVM-compatible network (BASE, Arbitrum, Optimism, etc.)
 * Uses ethers.js for wallet generation
 */

import { ethers } from 'ethers';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

// Network configurations
const NETWORK_CONFIGS = {
  BASE: {
    chainId: 8453,
    symbol: 'ETH',
    name: 'BASE',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    tags: ['BASE', 'ETH', 'EVM', 'Layer2', 'Coinbase']
  },
  ARB: {
    chainId: 42161,
    symbol: 'ETH',
    name: 'Arbitrum',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    tags: ['Arbitrum', 'ARB', 'EVM', 'Layer2']
  },
  Optimism: {
    chainId: 10,
    symbol: 'ETH',
    name: 'Optimism',
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    tags: ['Optimism', 'OP', 'EVM', 'Layer2']
  },
  PLASMA: {
    chainId: 1380012617,
    symbol: 'ETH',
    name: 'PLASMA',
    rpcUrl: 'https://rpc.plasm.network',
    explorerUrl: 'https://plasma.etherscan.io',
    tags: ['PLASMA', 'ETH', 'EVM', 'Layer2']
  },
  Polygon: {
    chainId: 137,
    symbol: 'POL',
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    tags: ['Polygon', 'POL', 'MATIC', 'EVM', 'Layer2', 'Scaling']
  },
  BNB: {
    chainId: 56,
    symbol: 'BNB',
    name: 'BNB Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    tags: ['BNB', 'BSC', 'Binance', 'EVM', 'Layer1']
  },
  Avalanche: {
    chainId: 43114,
    symbol: 'AVAX',
    name: 'Avalanche',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
    tags: ['Avalanche', 'AVAX', 'EVM', 'Layer1', 'DeFi']
  },
  // Phase 2 Networks
  zkSync: {
    chainId: 324,
    symbol: 'ETH',
    name: 'zkSync Era',
    rpcUrl: 'https://mainnet.era.zksync.io',
    explorerUrl: 'https://explorer.zksync.io',
    tags: ['zkSync', 'ZK', 'EVM', 'Layer2', 'ZK-Rollup']
  },
  Fantom: {
    chainId: 250,
    symbol: 'FTM',
    name: 'Fantom',
    rpcUrl: 'https://rpc.ftm.tools',
    explorerUrl: 'https://ftmscan.com',
    tags: ['Fantom', 'FTM', 'EVM', 'Layer1', 'DeFi']
  },
  Linea: {
    chainId: 59144,
    symbol: 'ETH',
    name: 'Linea',
    rpcUrl: 'https://rpc.linea.build',
    explorerUrl: 'https://lineascan.build',
    tags: ['Linea', 'ETH', 'EVM', 'Layer2', 'ZK-Rollup', 'Consensys']
  },
  Scroll: {
    chainId: 534352,
    symbol: 'ETH',
    name: 'Scroll',
    rpcUrl: 'https://rpc.scroll.io',
    explorerUrl: 'https://scrollscan.com',
    tags: ['Scroll', 'ETH', 'EVM', 'Layer2', 'ZK-Rollup']
  },
  Blast: {
    chainId: 81457,
    symbol: 'ETH',
    name: 'Blast',
    rpcUrl: 'https://rpc.blast.io',
    explorerUrl: 'https://blastscan.io',
    tags: ['Blast', 'ETH', 'EVM', 'Layer2']
  },
  Mantle: {
    chainId: 5000,
    symbol: 'MNT',
    name: 'Mantle',
    rpcUrl: 'https://rpc.mantle.xyz',
    explorerUrl: 'https://explorer.mantle.xyz',
    tags: ['Mantle', 'MNT', 'EVM', 'Layer2', 'Optimistic']
  },
  Cronos: {
    chainId: 25,
    symbol: 'CRO',
    name: 'Cronos',
    rpcUrl: 'https://evm.cronos.org',
    explorerUrl: 'https://cronoscan.com',
    tags: ['Cronos', 'CRO', 'EVM', 'Layer1', 'Crypto.com']
  },
  Harmony: {
    chainId: 1666600000,
    symbol: 'ONE',
    name: 'Harmony',
    rpcUrl: 'https://api.harmony.one',
    explorerUrl: 'https://explorer.harmony.one',
    tags: ['Harmony', 'ONE', 'EVM', 'Layer1', 'Sharding']
  },
  Moonbeam: {
    chainId: 1284,
    symbol: 'GLMR',
    name: 'Moonbeam',
    rpcUrl: 'https://rpc.api.moonbeam.network',
    explorerUrl: 'https://moonscan.io',
    tags: ['Moonbeam', 'GLMR', 'EVM', 'Parachain', 'Polkadot']
  },
  Gnosis: {
    chainId: 100,
    symbol: 'xDAI',
    name: 'Gnosis Chain',
    rpcUrl: 'https://rpc.gnosischain.com',
    explorerUrl: 'https://gnosisscan.io',
    tags: ['Gnosis', 'xDAI', 'GNO', 'EVM', 'Layer1', 'DeFi']
  },
  // Phase 3 - Gaming & Specialized
  Ronin: {
    chainId: 2020,
    symbol: 'RON',
    name: 'Ronin',
    rpcUrl: 'https://api.roninchain.com/rpc',
    explorerUrl: 'https://explorer.roninchain.com',
    tags: ['Ronin', 'RON', 'EVM', 'Gaming', 'Axie Infinity']
  },
  ImmutableZkEVM: {
    chainId: 13371,
    symbol: 'IMX',
    name: 'Immutable zkEVM',
    rpcUrl: 'https://rpc.immutable.com',
    explorerUrl: 'https://explorer.immutable.com',
    tags: ['Immutable', 'IMX', 'EVM', 'Gaming', 'ZK-Rollup']
  },
  Beam: {
    chainId: 4337,
    symbol: 'BEAM',
    name: 'Beam Network',
    rpcUrl: 'https://rpc.beam.network',
    explorerUrl: 'https://explorer.beam.network',
    tags: ['Beam', 'BEAM', 'EVM', 'Gaming', 'Layer2']
  },
  Oasys: {
    chainId: 248,
    symbol: 'OAS',
    name: 'Oasys',
    rpcUrl: 'https://rpc.mainnet.oasys.games',
    explorerUrl: 'https://explorer.oasys.games',
    tags: ['Oasys', 'OAS', 'EVM', 'Gaming', 'Layer1']
  },
  // Additional Layer 2 Solutions
  PolygonZkEVM: {
    chainId: 1101,
    symbol: 'ETH',
    name: 'Polygon zkEVM',
    rpcUrl: 'https://zkevm-rpc.com',
    explorerUrl: 'https://zkevm.polygonscan.com',
    tags: ['Polygon', 'zkEVM', 'EVM', 'Layer2', 'ZK-Rollup']
  },
  Boba: {
    chainId: 288,
    symbol: 'BOBA',
    name: 'Boba Network',
    rpcUrl: 'https://mainnet.boba.network',
    explorerUrl: 'https://bobascan.com',
    tags: ['Boba', 'BOBA', 'EVM', 'Layer2', 'Optimistic']
  },
  Metis: {
    chainId: 1088,
    symbol: 'METIS',
    name: 'Metis',
    rpcUrl: 'https://andromeda.metis.io/?owner=1088',
    explorerUrl: 'https://andromeda-explorer.metis.io',
    tags: ['Metis', 'METIS', 'EVM', 'Layer2', 'Optimistic']
  },
  Aurora: {
    chainId: 1313161554,
    symbol: 'ETH',
    name: 'Aurora',
    rpcUrl: 'https://mainnet.aurora.dev',
    explorerUrl: 'https://aurorascan.dev',
    tags: ['Aurora', 'ETH', 'EVM', 'Layer2', 'NEAR']
  },
  Celo: {
    chainId: 42220,
    symbol: 'CELO',
    name: 'Celo',
    rpcUrl: 'https://forno.celo.org',
    explorerUrl: 'https://explorer.celo.org',
    tags: ['Celo', 'CELO', 'EVM', 'Layer1', 'Mobile']
  },
  // More Layer 2 Solutions
  Redstone: {
    chainId: 690,
    symbol: 'RED',
    name: 'Redstone',
    rpcUrl: 'https://rpc.redstonechain.com',
    explorerUrl: 'https://explorer.redstone.xyz',
    tags: ['Redstone', 'RED', 'EVM', 'Layer2', 'Optimistic']
  },
  OpBNB: {
    chainId: 204,
    symbol: 'BNB',
    name: 'opBNB',
    rpcUrl: 'https://opbnb-mainnet-rpc.bnbchain.org',
    explorerUrl: 'https://opbnbscan.com',
    tags: ['opBNB', 'BNB', 'EVM', 'Layer2', 'Optimistic', 'Binance']
  },
  ArbitrumNova: {
    chainId: 42170,
    symbol: 'ETH',
    name: 'Arbitrum Nova',
    rpcUrl: 'https://nova.arbitrum.io/rpc',
    explorerUrl: 'https://nova.arbiscan.io',
    tags: ['Arbitrum', 'Nova', 'EVM', 'Layer2', 'Gaming']
  },
  Zora: {
    chainId: 7777777,
    symbol: 'ETH',
    name: 'Zora Network',
    rpcUrl: 'https://rpc.zora.energy',
    explorerUrl: 'https://explorer.zora.energy',
    tags: ['Zora', 'ETH', 'EVM', 'Layer2', 'NFT']
  },
  MantaPacific: {
    chainId: 169,
    symbol: 'ETH',
    name: 'Manta Pacific',
    rpcUrl: 'https://pacific-rpc.manta.network/http',
    explorerUrl: 'https://pacific-explorer.manta.network',
    tags: ['Manta', 'ETH', 'EVM', 'Layer2', 'ZK']
  },
  MorphL2: {
    chainId: 2818,
    symbol: 'ETH',
    name: 'Morph L2',
    rpcUrl: 'https://rpc.morphl2.io',
    explorerUrl: 'https://explorer.morphl2.io',
    tags: ['Morph', 'ETH', 'EVM', 'Layer2', 'Optimistic']
  },
  Xai: {
    chainId: 660279,
    symbol: 'XAI',
    name: 'Xai Network',
    rpcUrl: 'https://xai-chain.net/rpc',
    explorerUrl: 'https://explorer.xai-chain.net',
    tags: ['Xai', 'XAI', 'EVM', 'Gaming', 'Layer3']
  },
  Fraxtal: {
    chainId: 252,
    symbol: 'frxETH',
    name: 'Fraxtal',
    rpcUrl: 'https://rpc.frax.com',
    explorerUrl: 'https://fraxscan.com',
    tags: ['Fraxtal', 'frxETH', 'EVM', 'Layer2', 'Optimistic']
  },
  // Additional Layer 1 Networks
  Hedera: {
    chainId: 295,
    symbol: 'HBAR',
    name: 'Hedera',
    rpcUrl: 'https://mainnet.hashio.io/api',
    explorerUrl: 'https://hashscan.io',
    tags: ['Hedera', 'HBAR', 'EVM', 'Layer1', 'Hashgraph']
  },
  Sei: {
    chainId: 1329,
    symbol: 'SEI',
    name: 'Sei Network',
    rpcUrl: 'https://evm-rpc.sei-apis.com',
    explorerUrl: 'https://seitrace.com',
    tags: ['Sei', 'SEI', 'EVM', 'Layer1', 'DeFi']
  },
  Kava: {
    chainId: 2222,
    symbol: 'KAVA',
    name: 'Kava',
    rpcUrl: 'https://evm.kava.io',
    explorerUrl: 'https://explorer.kava.io',
    tags: ['Kava', 'KAVA', 'EVM', 'Layer1', 'DeFi']
  },
  ShimmerEVM: {
    chainId: 148,
    symbol: 'SMR',
    name: 'Shimmer EVM',
    rpcUrl: 'https://json-rpc.evm.shimmer.network',
    explorerUrl: 'https://explorer.evm.shimmer.network',
    tags: ['Shimmer', 'SMR', 'EVM', 'Layer1', 'IOTA']
  },
  ConfluxESpace: {
    chainId: 1030,
    symbol: 'CFX',
    name: 'Conflux eSpace',
    rpcUrl: 'https://evm.confluxrpc.com',
    explorerUrl: 'https://evm.confluxscan.net',
    tags: ['Conflux', 'CFX', 'EVM', 'Layer1']
  },
  OasisEmerald: {
    chainId: 42262,
    symbol: 'ROSE',
    name: 'Oasis Emerald',
    rpcUrl: 'https://emerald.oasis.dev',
    explorerUrl: 'https://explorer.emerald.oasis.dev',
    tags: ['Oasis', 'ROSE', 'EVM', 'Layer1', 'Privacy']
  },
  EnergyWeb: {
    chainId: 246,
    symbol: 'EWT',
    name: 'Energy Web Chain',
    rpcUrl: 'https://rpc.energyweb.org',
    explorerUrl: 'https://explorer.energyweb.org',
    tags: ['EnergyWeb', 'EWT', 'EVM', 'Layer1', 'Energy']
  },
  TelosEVM: {
    chainId: 40,
    symbol: 'TLOS',
    name: 'Telos EVM',
    rpcUrl: 'https://mainnet.telos.net/evm',
    explorerUrl: 'https://teloscan.io',
    tags: ['Telos', 'TLOS', 'EVM', 'Layer1']
  },
  HorizenEON: {
    chainId: 7332,
    symbol: 'ZEN',
    name: 'Horizen EON',
    rpcUrl: 'https://eon-rpc.horizenlabs.io/ethv1',
    explorerUrl: 'https://eon-explorer.horizenlabs.io',
    tags: ['Horizen', 'ZEN', 'EVM', 'Layer1', 'Privacy']
  },
  Viction: {
    chainId: 88,
    symbol: 'VIC',
    name: 'Viction',
    rpcUrl: 'https://rpc.viction.xyz',
    explorerUrl: 'https://www.vicscan.xyz',
    tags: ['Viction', 'VIC', 'EVM', 'Layer1']
  },
  Fuse: {
    chainId: 122,
    symbol: 'FUSE',
    name: 'Fuse Network',
    rpcUrl: 'https://rpc.fuse.io',
    explorerUrl: 'https://explorer.fuse.io',
    tags: ['Fuse', 'FUSE', 'EVM', 'Layer1', 'Payments']
  },
  Syscoin: {
    chainId: 57,
    symbol: 'SYS',
    name: 'Syscoin',
    rpcUrl: 'https://rpc.syscoin.org',
    explorerUrl: 'https://explorer.syscoin.org',
    tags: ['Syscoin', 'SYS', 'EVM', 'Layer1']
  },
  ThunderCore: {
    chainId: 108,
    symbol: 'TT',
    name: 'ThunderCore',
    rpcUrl: 'https://mainnet-rpc.thundercore.com',
    explorerUrl: 'https://viewblock.io/thundercore',
    tags: ['ThunderCore', 'TT', 'EVM', 'Layer1']
  },
  Astar: {
    chainId: 592,
    symbol: 'ASTR',
    name: 'Astar Network',
    rpcUrl: 'https://evm.astar.network',
    explorerUrl: 'https://astar.blockscout.com',
    tags: ['Astar', 'ASTR', 'EVM', 'Parachain', 'Polkadot']
  },
  Shiden: {
    chainId: 336,
    symbol: 'SDN',
    name: 'Shiden Network',
    rpcUrl: 'https://evm.shiden.astar.network',
    explorerUrl: 'https://shiden.blockscout.com',
    tags: ['Shiden', 'SDN', 'EVM', 'Parachain', 'Kusama']
  },
  Efinity: {
    chainId: 1110,
    symbol: 'EFI',
    name: 'Efinity',
    rpcUrl: 'https://rpc.efinity.io',
    explorerUrl: 'https://explorer.efinity.io',
    tags: ['Efinity', 'EFI', 'EVM', 'NFT', 'Polkadot']
  },
  WorldChain: {
    chainId: 480,
    symbol: 'WLD',
    name: 'World Chain',
    rpcUrl: 'https://worldchain-mainnet.g.alchemy.com/public',
    explorerUrl: 'https://worldscan.org',
    tags: ['World', 'WLD', 'EVM', 'Layer2', 'Worldcoin']
  },
  Sonic: {
    chainId: 146,
    symbol: 'S',
    name: 'Sonic',
    rpcUrl: 'https://rpc.soniclabs.com',
    explorerUrl: 'https://explorer.soniclabs.com',
    tags: ['Sonic', 'S', 'EVM', 'Layer1', 'Gaming']
  },
  Flare: {
    chainId: 14,
    symbol: 'FLR',
    name: 'Flare Network',
    rpcUrl: 'https://flare-api.flare.network/ext/C/rpc',
    explorerUrl: 'https://flare-explorer.flare.network',
    tags: ['Flare', 'FLR', 'EVM', 'Layer1', 'Oracle']
  },
  Songbird: {
    chainId: 19,
    symbol: 'SGB',
    name: 'Songbird',
    rpcUrl: 'https://songbird-api.flare.network/ext/C/rpc',
    explorerUrl: 'https://songbird-explorer.flare.network',
    tags: ['Songbird', 'SGB', 'EVM', 'Layer1', 'Canary']
  },
  SmartBCH: {
    chainId: 10000,
    symbol: 'BCH',
    name: 'SmartBCH',
    rpcUrl: 'https://smartbch.greyh.at',
    explorerUrl: 'https://www.smartscan.cash',
    tags: ['SmartBCH', 'BCH', 'EVM', 'Sidechain', 'Bitcoin Cash']
  },
  RSK: {
    chainId: 30,
    symbol: 'RBTC',
    name: 'RSK',
    rpcUrl: 'https://public-node.rsk.co',
    explorerUrl: 'https://explorer.rsk.co',
    tags: ['RSK', 'RBTC', 'EVM', 'Sidechain', 'Bitcoin']
  },
  Wanchain: {
    chainId: 888,
    symbol: 'WAN',
    name: 'Wanchain',
    rpcUrl: 'https://gwan-ssl.wandevs.org:56891',
    explorerUrl: 'https://wanscan.org',
    tags: ['Wanchain', 'WAN', 'EVM', 'Layer1', 'Interoperability']
  },
  GoChain: {
    chainId: 60,
    symbol: 'GO',
    name: 'GoChain',
    rpcUrl: 'https://rpc.gochain.io',
    explorerUrl: 'https://explorer.gochain.io',
    tags: ['GoChain', 'GO', 'EVM', 'Layer1']
  },
  Canto: {
    chainId: 7700,
    symbol: 'CANTO',
    name: 'Canto',
    rpcUrl: 'https://canto.slingshot.finance',
    explorerUrl: 'https://tuber.build',
    tags: ['Canto', 'CANTO', 'EVM', 'Layer1', 'DeFi']
  },
  // Additional Specialized Networks
  ZetaChain: {
    chainId: 7000,
    symbol: 'ZETA',
    name: 'ZetaChain',
    rpcUrl: 'https://zetachain-evm.blockpi.network/v1/rpc/public',
    explorerUrl: 'https://explorer.zetachain.com',
    tags: ['ZetaChain', 'ZETA', 'EVM', 'Layer1', 'Interoperability']
  },
  Taiko: {
    chainId: 167000,
    symbol: 'TAIKO',
    name: 'Taiko',
    rpcUrl: 'https://rpc.mainnet.taiko.xyz',
    explorerUrl: 'https://taikoscan.io',
    tags: ['Taiko', 'TAIKO', 'EVM', 'Layer2', 'ZK-Rollup']
  },
  ModeNetwork: {
    chainId: 34443,
    symbol: 'MODE',
    name: 'Mode Network',
    rpcUrl: 'https://mainnet.mode.network',
    explorerUrl: 'https://explorer.mode.network',
    tags: ['Mode', 'MODE', 'EVM', 'Layer2', 'Optimistic']
  }
};

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      userID,
      network, // 'BASE', 'ARB', 'Optimism', 'PLASMA', etc.
      walletName
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    if (!network) {
      return { success: false, message: 'network is required' };
    }

    const networkConfig = NETWORK_CONFIGS[network];
    if (!networkConfig) {
      return {
        success: false,
        message: `Unsupported network: ${network}. Supported: ${Object.keys(NETWORK_CONFIGS).join(', ')}`
      };
    }

    console.log(`[Generate ${network} Wallet] User: ${userID}`);

    // Generate new wallet using ethers.js
    const wallet = ethers.Wallet.createRandom();

    // Get wallet details
    const address = wallet.address;
    const privateKey = wallet.privateKey;
    const mnemonic = wallet.mnemonic.phrase;

    // Save to database
    const defaultWalletName = walletName || `${networkConfig.name} Wallet ${Date.now()}`;

    const savedWallet = await userWalletsSchema.create({
      userID,
      walletName: defaultWalletName,
      network: networkConfig.name,
      networkSymbol: networkConfig.symbol,
      chainId: networkConfig.chainId,
      walletType: 'EVM',
      address: address,
      publicKey: wallet.publicKey,
      privateKey: privateKey,
      mnemonic: mnemonic,
      isDefault: false,
      balance: '0',
      balanceUSD: '0',
      note: `⚠️ NEVER share your mnemonic or private key!\n\nExplorer: ${networkConfig.explorerUrl}/address/${address}\nRPC: ${networkConfig.rpcUrl}`,
      tags: networkConfig.tags,
      createdAt: new Date(),
      lastUsed: new Date(),
      isActive: true
    });

    console.log(`[Generate ${network} Wallet] ✅ Created: ${address}`);

    return {
      success: true,
      walletId: savedWallet._id.toString(),
      address: address,
      network: networkConfig.name,
      chainId: networkConfig.chainId,
      message: `${networkConfig.name} wallet generated successfully!`
    };

  } catch (error) {
    console.error('[Generate EVM Wallet] Error:', error);
    return {
      success: false,
      message: `Failed: ${error.message}`
    };
  }
});
