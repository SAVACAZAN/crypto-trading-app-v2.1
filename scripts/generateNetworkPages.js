/**
 * Network Page Generator Script
 * Automatically generates Vue pages for all EVM networks
 * from the generateEVMWallet.post.js configuration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Network configurations to generate pages for
const networks = [
  // Phase 3 - Layer 2 Solutions (14 networks)
  {
    key: 'PolygonZkEVM',
    name: 'Polygon zkEVM',
    symbol: 'ETH',
    chainId: 1101,
    type: 'Layer 2 / ZK-Rollup',
    icon: '🔷',
    gradient: '#8247E5, #A855F7',
    rpcUrl: 'https://zkevm-rpc.com',
    explorerUrl: 'https://zkevm.polygonscan.com',
    description: 'Polygon zkEVM is a decentralized Ethereum Layer 2 scalability solution that uses cryptographic zero-knowledge proofs to offer validity and fast finality to off-chain transaction computation. It provides EVM equivalence with enhanced scalability and lower costs.',
    features: [
      '🚀 <strong>ZK-Rollup Technology:</strong> Advanced zero-knowledge proofs',
      '💰 <strong>Low Fees:</strong> Significantly cheaper than Ethereum L1',
      '⚡ <strong>Fast Finality:</strong> Quick transaction confirmation',
      '🔐 <strong>Ethereum Security:</strong> Inherits Ethereum security',
      '🛠️ <strong>EVM Equivalent:</strong> Full EVM compatibility',
      '🌍 <strong>Polygon Ecosystem:</strong> Part of the Polygon suite'
    ],
    links: {
      website: 'https://polygon.technology/polygon-zkevm',
      explorer: 'https://zkevm.polygonscan.com',
      wallet: 'https://wallet.polygon.technology',
      bridge: 'https://bridge.polygon.technology'
    }
  },
  {
    key: 'Boba',
    name: 'Boba Network',
    symbol: 'BOBA',
    chainId: 288,
    type: 'Layer 2 / Optimistic',
    icon: '🧋',
    gradient: '#CBFE00, #A4CC00',
    rpcUrl: 'https://mainnet.boba.network',
    explorerUrl: 'https://bobascan.com',
    description: 'Boba Network is an Optimistic Rollup that extends Ethereum capabilities with faster transactions and lower fees. It features Hybrid Compute for off-chain computation and cross-chain bridging solutions.',
    features: [
      '🚀 <strong>Optimistic Rollup:</strong> Ethereum Layer 2 scaling',
      '💰 <strong>Low Fees:</strong> Up to 100x cheaper than Ethereum',
      '⚡ <strong>Fast Exits:</strong> Reduced withdrawal times',
      '🔐 <strong>Hybrid Compute:</strong> Off-chain computation integration',
      '🛠️ <strong>EVM Compatible:</strong> Full Solidity support',
      '🌍 <strong>Multi-Chain:</strong> Available on multiple networks'
    ],
    links: {
      website: 'https://boba.network',
      explorer: 'https://bobascan.com',
      wallet: 'https://gateway.boba.network',
      bridge: 'https://gateway.boba.network/bridge'
    }
  },
  {
    key: 'Metis',
    name: 'Metis',
    symbol: 'METIS',
    chainId: 1088,
    type: 'Layer 2 / Optimistic',
    icon: '🌊',
    gradient: '#00D4D4, #00A0A0',
    rpcUrl: 'https://andromeda.metis.io/?owner=1088',
    explorerUrl: 'https://andromeda-explorer.metis.io',
    description: 'Metis is an Ethereum Layer 2 Optimistic Rollup platform focused on solving Ethereum scalability issues. It features decentralized sequencers and provides infrastructure for DAOs and dApps.',
    features: [
      '🚀 <strong>Optimistic Rollup:</strong> Scalable Layer 2 solution',
      '💰 <strong>Low Cost:</strong> Minimal transaction fees',
      '⚡ <strong>Fast Transactions:</strong> Quick finality',
      '🔐 <strong>Decentralized Sequencer:</strong> No single point of failure',
      '🛠️ <strong>EVM Equivalent:</strong> Easy migration from Ethereum',
      '🌍 <strong>DAO Focus:</strong> Built for decentralized organizations'
    ],
    links: {
      website: 'https://www.metis.io',
      explorer: 'https://andromeda-explorer.metis.io',
      wallet: 'https://bridge.metis.io',
      bridge: 'https://bridge.metis.io'
    }
  },
  {
    key: 'Aurora',
    name: 'Aurora',
    symbol: 'ETH',
    chainId: 1313161554,
    type: 'Layer 2 / NEAR',
    icon: '🌌',
    gradient: '#70D44B, #5AB83A',
    rpcUrl: 'https://mainnet.aurora.dev',
    explorerUrl: 'https://aurorascan.dev',
    description: 'Aurora is an EVM-compatible blockchain built on NEAR Protocol. It provides Ethereum developers with a scalable, low-cost, and user-friendly environment while leveraging NEAR\'s sharding technology.',
    features: [
      '🚀 <strong>NEAR-Powered:</strong> Built on NEAR Protocol',
      '💰 <strong>Low Fees:</strong> Transaction costs under $0.01',
      '⚡ <strong>High Speed:</strong> 2-second block time',
      '🔐 <strong>Secure:</strong> NEAR consensus mechanism',
      '🛠️ <strong>EVM Compatible:</strong> Ethereum tooling support',
      '🌍 <strong>Rainbow Bridge:</strong> Seamless Ethereum bridging'
    ],
    links: {
      website: 'https://aurora.dev',
      explorer: 'https://aurorascan.dev',
      wallet: 'https://wallet.aurora.dev',
      bridge: 'https://rainbowbridge.app'
    }
  },
  {
    key: 'Redstone',
    name: 'Redstone',
    symbol: 'RED',
    chainId: 690,
    type: 'Layer 2 / Optimistic',
    icon: '🔴',
    gradient: '#FF0000, #CC0000',
    rpcUrl: 'https://rpc.redstonechain.com',
    explorerUrl: 'https://explorer.redstone.xyz',
    description: 'Redstone is an Ethereum Layer 2 network using Optimistic Rollup technology, designed for high-performance decentralized applications with low transaction costs.',
    features: [
      '🚀 <strong>Optimistic Rollup:</strong> Ethereum L2 scaling',
      '💰 <strong>Low Fees:</strong> Cost-effective transactions',
      '⚡ <strong>Fast Performance:</strong> Quick block times',
      '🔐 <strong>Ethereum Security:</strong> Secured by Ethereum',
      '🛠️ <strong>EVM Compatible:</strong> Full Solidity support',
      '🌍 <strong>DeFi Ready:</strong> Optimized for DeFi applications'
    ],
    links: {
      website: 'https://redstone.xyz',
      explorer: 'https://explorer.redstone.xyz',
      wallet: 'https://bridge.redstone.xyz',
      bridge: 'https://bridge.redstone.xyz'
    }
  },
  {
    key: 'OpBNB',
    name: 'opBNB',
    symbol: 'BNB',
    chainId: 204,
    type: 'Layer 2 / Optimistic',
    icon: '⚡',
    gradient: '#F3BA2F, #E8A50C',
    rpcUrl: 'https://opbnb-mainnet-rpc.bnbchain.org',
    explorerUrl: 'https://opbnbscan.com',
    description: 'opBNB is BNB Chain\'s Layer 2 scaling solution built on the Optimism OP Stack. It offers high-performance, low-cost transactions while maintaining compatibility with BNB Chain and Ethereum ecosystems.',
    features: [
      '🚀 <strong>OP Stack:</strong> Optimism-based Layer 2',
      '💰 <strong>Ultra Low Fees:</strong> Extremely cheap transactions',
      '⚡ <strong>High Throughput:</strong> 4000+ TPS capability',
      '🔐 <strong>BNB Security:</strong> Secured by BNB Chain',
      '🛠️ <strong>EVM Compatible:</strong> Ethereum tooling support',
      '🌍 <strong>Binance Ecosystem:</strong> Part of BNB Chain family'
    ],
    links: {
      website: 'https://opbnb.bnbchain.org',
      explorer: 'https://opbnbscan.com',
      wallet: 'https://www.bnbchain.org/en/wallets',
      bridge: 'https://opbnb-bridge.bnbchain.org'
    }
  },
  {
    key: 'ArbitrumNova',
    name: 'Arbitrum Nova',
    symbol: 'ETH',
    chainId: 42170,
    type: 'Layer 2 / AnyTrust',
    icon: '🎮',
    gradient: '#28A0F0, #1E7FC0',
    rpcUrl: 'https://nova.arbitrum.io/rpc',
    explorerUrl: 'https://nova.arbiscan.io',
    description: 'Arbitrum Nova is an AnyTrust chain optimized for gaming and social applications. It offers ultra-low transaction costs while maintaining high security through a Data Availability Committee.',
    features: [
      '🚀 <strong>AnyTrust Technology:</strong> Optimized for gaming',
      '💰 <strong>Ultra Low Fees:</strong> Minimal transaction costs',
      '⚡ <strong>High Performance:</strong> Fast transactions',
      '🔐 <strong>Secure:</strong> Data Availability Committee',
      '🛠️ <strong>EVM Compatible:</strong> Full Ethereum compatibility',
      '🌍 <strong>Gaming Focused:</strong> Built for Web3 games'
    ],
    links: {
      website: 'https://nova.arbitrum.io',
      explorer: 'https://nova.arbiscan.io',
      wallet: 'https://bridge.arbitrum.io',
      bridge: 'https://bridge.arbitrum.io/?destinationChain=arbitrum-nova'
    }
  },
  {
    key: 'Zora',
    name: 'Zora Network',
    symbol: 'ETH',
    chainId: 7777777,
    type: 'Layer 2 / Optimistic',
    icon: '🎨',
    gradient: '#000000, #333333',
    rpcUrl: 'https://rpc.zora.energy',
    explorerUrl: 'https://explorer.zora.energy',
    description: 'Zora Network is an Ethereum Layer 2 built on the OP Stack, designed specifically for NFT creators and collectors. It provides a fast, affordable platform for minting and trading NFTs.',
    features: [
      '🚀 <strong>NFT Optimized:</strong> Built for digital art',
      '💰 <strong>Low Minting Costs:</strong> Affordable NFT creation',
      '⚡ <strong>Fast Transactions:</strong> Quick NFT operations',
      '🔐 <strong>Creator Focused:</strong> Tools for artists',
      '🛠️ <strong>OP Stack:</strong> Optimism-based infrastructure',
      '🌍 <strong>NFT Ecosystem:</strong> Vibrant creator community'
    ],
    links: {
      website: 'https://zora.co',
      explorer: 'https://explorer.zora.energy',
      wallet: 'https://bridge.zora.energy',
      bridge: 'https://bridge.zora.energy'
    }
  },
  {
    key: 'MantaPacific',
    name: 'Manta Pacific',
    symbol: 'ETH',
    chainId: 169,
    type: 'Layer 2 / Optimistic',
    icon: '🦈',
    gradient: '#6B46C1, #553C9A',
    rpcUrl: 'https://pacific-rpc.manta.network/http',
    explorerUrl: 'https://pacific-explorer.manta.network',
    description: 'Manta Pacific is a modular Layer 2 ecosystem on Ethereum, providing scalable and low-cost solutions for Web3 applications with native privacy features.',
    features: [
      '🚀 <strong>Modular L2:</strong> Flexible architecture',
      '💰 <strong>Low Fees:</strong> Cost-effective transactions',
      '⚡ <strong>High Speed:</strong> Fast finality',
      '🔐 <strong>Privacy Features:</strong> Optional privacy layer',
      '🛠️ <strong>EVM Compatible:</strong> Ethereum tooling',
      '🌍 <strong>Web3 Focus:</strong> Built for dApps'
    ],
    links: {
      website: 'https://pacific.manta.network',
      explorer: 'https://pacific-explorer.manta.network',
      wallet: 'https://pacific-bridge.manta.network',
      bridge: 'https://pacific-bridge.manta.network'
    }
  },
  {
    key: 'MorphL2',
    name: 'Morph L2',
    symbol: 'ETH',
    chainId: 2818,
    type: 'Layer 2 / Optimistic',
    icon: '🔀',
    gradient: '#4F46E5, #3730A3',
    rpcUrl: 'https://rpc.morphl2.io',
    explorerUrl: 'https://explorer.morphl2.io',
    description: 'Morph is a fully EVM-compatible Layer 2 rollup built to scale Ethereum with optimized performance and developer-friendly tools.',
    features: [
      '🚀 <strong>Optimistic Rollup:</strong> Ethereum Layer 2',
      '💰 <strong>Cost Efficient:</strong> Low transaction fees',
      '⚡ <strong>Fast Processing:</strong> Quick confirmations',
      '🔐 <strong>Ethereum Security:</strong> L1 security guarantees',
      '🛠️ <strong>Dev Friendly:</strong> Easy integration',
      '🌍 <strong>Full EVM:</strong> Complete compatibility'
    ],
    links: {
      website: 'https://morphl2.io',
      explorer: 'https://explorer.morphl2.io',
      wallet: 'https://bridge.morphl2.io',
      bridge: 'https://bridge.morphl2.io'
    }
  },
  {
    key: 'Xai',
    name: 'Xai Network',
    symbol: 'XAI',
    chainId: 660279,
    type: 'Layer 3 / Gaming',
    icon: '🎯',
    gradient: '#FF385C, #E31C5F',
    rpcUrl: 'https://xai-chain.net/rpc',
    explorerUrl: 'https://explorer.xai-chain.net',
    description: 'Xai is a Layer 3 blockchain optimized for gaming, built on Arbitrum. It enables seamless Web3 gaming experiences with traditional gaming UX.',
    features: [
      '🚀 <strong>Layer 3:</strong> Built on Arbitrum',
      '💰 <strong>Gasless Gaming:</strong> No gas for players',
      '⚡ <strong>Gaming Optimized:</strong> Purpose-built for games',
      '🔐 <strong>Secure:</strong> Arbitrum-backed security',
      '🛠️ <strong>EVM Compatible:</strong> Ethereum tooling',
      '🌍 <strong>AAA Games:</strong> Supporting major titles'
    ],
    links: {
      website: 'https://xai.games',
      explorer: 'https://explorer.xai-chain.net',
      wallet: 'https://sentry.xai.games',
      bridge: 'https://bridge.xai.games'
    }
  },
  {
    key: 'Fraxtal',
    name: 'Fraxtal',
    symbol: 'frxETH',
    chainId: 252,
    type: 'Layer 2 / Optimistic',
    icon: '❄️',
    gradient: '#000000, #1A1A1A',
    rpcUrl: 'https://rpc.frax.com',
    explorerUrl: 'https://fraxscan.com',
    description: 'Fraxtal is a modular Layer 2 blockchain built by Frax Finance using the OP Stack. It features innovative tokenomics with incentivized block space.',
    features: [
      '🚀 <strong>OP Stack:</strong> Optimism-based L2',
      '💰 <strong>Frax Ecosystem:</strong> Integrated with Frax',
      '⚡ <strong>Fast & Cheap:</strong> Efficient transactions',
      '🔐 <strong>Modular Design:</strong> Flexible architecture',
      '🛠️ <strong>EVM Compatible:</strong> Full Solidity support',
      '🌍 <strong>DeFi Focus:</strong> Built for finance'
    ],
    links: {
      website: 'https://frax.finance',
      explorer: 'https://fraxscan.com',
      wallet: 'https://app.frax.finance',
      bridge: 'https://bridge.frax.finance'
    }
  },
  {
    key: 'Taiko',
    name: 'Taiko',
    symbol: 'TAIKO',
    chainId: 167000,
    type: 'Layer 2 / ZK-Rollup',
    icon: '⛩️',
    gradient: '#E81899, #C01070',
    rpcUrl: 'https://rpc.mainnet.taiko.xyz',
    explorerUrl: 'https://taikoscan.io',
    description: 'Taiko is a fully decentralized, Ethereum-equivalent ZK-Rollup. It provides Type 1 ZK-EVM compatibility, making it the most compatible ZK-Rollup with Ethereum.',
    features: [
      '🚀 <strong>Type 1 ZK-EVM:</strong> Full Ethereum equivalence',
      '💰 <strong>Low Fees:</strong> Cost-effective L2',
      '⚡ <strong>Fast Proofs:</strong> Quick finality',
      '🔐 <strong>Decentralized:</strong> No centralized sequencer',
      '🛠️ <strong>100% Compatible:</strong> All Ethereum tools work',
      '🌍 <strong>Community Driven:</strong> Open-source and transparent'
    ],
    links: {
      website: 'https://taiko.xyz',
      explorer: 'https://taikoscan.io',
      wallet: 'https://bridge.taiko.xyz',
      bridge: 'https://bridge.taiko.xyz'
    }
  },
  {
    key: 'ModeNetwork',
    name: 'Mode Network',
    symbol: 'MODE',
    chainId: 34443,
    type: 'Layer 2 / Optimistic',
    icon: '🟢',
    gradient: '#DFFE00, #B8CC00',
    rpcUrl: 'https://mainnet.mode.network',
    explorerUrl: 'https://explorer.mode.network',
    description: 'Mode is a Layer 2 network built on the OP Stack with a focus on DeFi and yield-generating applications. It rewards users and developers with its innovative growth mechanisms.',
    features: [
      '🚀 <strong>OP Stack L2:</strong> Optimism-based',
      '💰 <strong>DeFi Focused:</strong> Built for finance',
      '⚡ <strong>Fast & Cheap:</strong> Efficient operations',
      '🔐 <strong>Ethereum Security:</strong> L1-backed',
      '🛠️ <strong>Dev Incentives:</strong> Revenue sharing',
      '🌍 <strong>Growth Rewards:</strong> User incentives'
    ],
    links: {
      website: 'https://mode.network',
      explorer: 'https://explorer.mode.network',
      wallet: 'https://bridge.mode.network',
      bridge: 'https://bridge.mode.network'
    }
  },
  // Phase 3 - Layer 1 Networks (22 networks)
  {
    key: 'Celo',
    name: 'Celo',
    symbol: 'CELO',
    chainId: 42220,
    type: 'Layer 1 / Mobile',
    icon: '📱',
    gradient: '#35D07F, #2AAF6F',
    rpcUrl: 'https://forno.celo.org',
    explorerUrl: 'https://explorer.celo.org',
    description: 'Celo is a mobile-first blockchain platform that makes decentralized financial tools and services accessible to anyone with a mobile phone. It focuses on financial inclusion and sustainability.',
    features: [
      '🚀 <strong>Mobile First:</strong> Designed for smartphones',
      '💰 <strong>Stable Coins:</strong> Multiple stable currencies',
      '⚡ <strong>Fast Payments:</strong> 5-second block time',
      '🔐 <strong>Carbon Negative:</strong> Climate-positive blockchain',
      '🛠️ <strong>EVM Compatible:</strong> Ethereum tooling support',
      '🌍 <strong>Global Reach:</strong> 150+ countries'
    ],
    links: {
      website: 'https://celo.org',
      explorer: 'https://explorer.celo.org',
      wallet: 'https://celowallet.app',
      bridge: 'https://app.allbridge.io'
    }
  },
  {
    key: 'Hedera',
    name: 'Hedera',
    symbol: 'HBAR',
    chainId: 295,
    type: 'Layer 1 / Hashgraph',
    icon: 'ⓗ',
    gradient: '#000000, #2A2A2A',
    rpcUrl: 'https://mainnet.hashio.io/api',
    explorerUrl: 'https://hashscan.io',
    description: 'Hedera is a public distributed ledger using the Hashgraph consensus algorithm. It provides fast, fair, and secure transactions with enterprise-grade governance.',
    features: [
      '🚀 <strong>Hashgraph:</strong> Advanced consensus',
      '💰 <strong>Low Fees:</strong> Predictable costs ($0.0001)',
      '⚡ <strong>Ultra Fast:</strong> 10,000+ TPS',
      '🔐 <strong>Enterprise Grade:</strong> Council governance',
      '🛠️ <strong>EVM Compatible:</strong> Solidity support',
      '🌍 <strong>Sustainable:</strong> Carbon-negative network'
    ],
    links: {
      website: 'https://hedera.com',
      explorer: 'https://hashscan.io',
      wallet: 'https://www.hashpack.app',
      bridge: 'https://www.hashport.network'
    }
  },
  {
    key: 'Sei',
    name: 'Sei Network',
    symbol: 'SEI',
    chainId: 1329,
    type: 'Layer 1 / DeFi',
    icon: '🌊',
    gradient: '#BB1E1E, #941818',
    rpcUrl: 'https://evm-rpc.sei-apis.com',
    explorerUrl: 'https://seitrace.com',
    description: 'Sei is the fastest Layer 1 blockchain, optimized for trading. It features parallelized EVM and provides the best infrastructure for DeFi applications.',
    features: [
      '🚀 <strong>Fastest L1:</strong> 390ms finality',
      '💰 <strong>Trading Optimized:</strong> Built-in order matching',
      '⚡ <strong>20,000 TPS:</strong> High throughput',
      '🔐 <strong>Twin Turbo:</strong> Parallelized EVM',
      '🛠️ <strong>EVM Compatible:</strong> Ethereum + CosmWasm',
      '🌍 <strong>DeFi Focus:</strong> Optimized for trading'
    ],
    links: {
      website: 'https://www.sei.io',
      explorer: 'https://seitrace.com',
      wallet: 'https://app.sei.io',
      bridge: 'https://bridge.sei.io'
    }
  },
  {
    key: 'Kava',
    name: 'Kava',
    symbol: 'KAVA',
    chainId: 2222,
    type: 'Layer 1 / DeFi',
    icon: '🔴',
    gradient: '#FF433E, #D9362F',
    rpcUrl: 'https://evm.kava.io',
    explorerUrl: 'https://explorer.kava.io',
    description: 'Kava is a Layer 1 blockchain combining the speed of Cosmos with the developer power of Ethereum. It provides a secure platform for DeFi applications.',
    features: [
      '🚀 <strong>Cosmos + Ethereum:</strong> Best of both',
      '💰 <strong>DeFi Platform:</strong> Lending, staking, more',
      '⚡ <strong>Fast Finality:</strong> 6-second blocks',
      '🔐 <strong>Secure:</strong> Battle-tested',
      '🛠️ <strong>EVM Co-Chain:</strong> Full Solidity support',
      '🌍 <strong>Cross-Chain:</strong> IBC connectivity'
    ],
    links: {
      website: 'https://www.kava.io',
      explorer: 'https://explorer.kava.io',
      wallet: 'https://app.kava.io',
      bridge: 'https://app.kava.io/bridge'
    }
  },
  {
    key: 'ShimmerEVM',
    name: 'Shimmer EVM',
    symbol: 'SMR',
    chainId: 148,
    type: 'Layer 1 / IOTA',
    icon: '✨',
    gradient: '#26D9D9, #1FB0B0',
    rpcUrl: 'https://json-rpc.evm.shimmer.network',
    explorerUrl: 'https://explorer.evm.shimmer.network',
    description: 'Shimmer EVM is the EVM-compatible smart contract platform built on the Shimmer network, providing feeless transactions and scalable infrastructure.',
    features: [
      '🚀 <strong>IOTA Technology:</strong> DAG-based',
      '💰 <strong>Feeless:</strong> No gas fees',
      '⚡ <strong>Scalable:</strong> High throughput',
      '🔐 <strong>IOTA Security:</strong> Battle-tested',
      '🛠️ <strong>EVM Compatible:</strong> Ethereum tooling',
      '🌍 <strong>Innovation:</strong> Staging network'
    ],
    links: {
      website: 'https://shimmer.network',
      explorer: 'https://explorer.evm.shimmer.network',
      wallet: 'https://firefly.iota.org',
      bridge: 'https://bridge.evm.shimmer.network'
    }
  },
  {
    key: 'ConfluxESpace',
    name: 'Conflux eSpace',
    symbol: 'CFX',
    chainId: 1030,
    type: 'Layer 1',
    icon: '🌐',
    gradient: '#4A90E2, #357ABD',
    rpcUrl: 'https://evm.confluxrpc.com',
    explorerUrl: 'https://evm.confluxscan.net',
    description: 'Conflux eSpace is a fully EVM-compatible smart contract platform built on Conflux Network, providing high throughput and low latency for dApps.',
    features: [
      '🚀 <strong>High TPS:</strong> 3000+ transactions per second',
      '💰 <strong>Low Fees:</strong> Cost-effective operations',
      '⚡ <strong>Fast Finality:</strong> Quick confirmations',
      '🔐 <strong>Tree-Graph:</strong> Unique consensus',
      '🛠️ <strong>EVM Compatible:</strong> Full Solidity support',
      '🌍 <strong>China Focus:</strong> Regulatory compliant'
    ],
    links: {
      website: 'https://confluxnetwork.org',
      explorer: 'https://evm.confluxscan.net',
      wallet: 'https://fluentwallet.com',
      bridge: 'https://confluxhub.io/espace-bridge/cross-space'
    }
  },
  {
    key: 'OasisEmerald',
    name: 'Oasis Emerald',
    symbol: 'ROSE',
    chainId: 42262,
    type: 'Layer 1 / Privacy',
    icon: '🌹',
    gradient: '#0092F6, #0074C8',
    rpcUrl: 'https://emerald.oasis.dev',
    explorerUrl: 'https://explorer.emerald.oasis.dev',
    description: 'Oasis Emerald is an EVM-compatible ParaTime on the Oasis Network, offering scalable, privacy-enabled DeFi with instant finality.',
    features: [
      '🚀 <strong>Privacy First:</strong> Confidential compute',
      '💰 <strong>Low Fees:</strong> 99% lower than Ethereum',
      '⚡ <strong>Instant Finality:</strong> 6-second blocks',
      '🔐 <strong>Secure Enclaves:</strong> TEE technology',
      '🛠️ <strong>EVM Compatible:</strong> Full Solidity support',
      '🌍 <strong>Scalable:</strong> High throughput'
    ],
    links: {
      website: 'https://oasisprotocol.org',
      explorer: 'https://explorer.emerald.oasis.dev',
      wallet: 'https://wallet.oasis.io',
      bridge: 'https://bridge.oasis.io'
    }
  },
  {
    key: 'EnergyWeb',
    name: 'Energy Web Chain',
    symbol: 'EWT',
    chainId: 246,
    type: 'Layer 1 / Energy',
    icon: '⚡',
    gradient: '#A0CD39, #87B32D',
    rpcUrl: 'https://rpc.energyweb.org',
    explorerUrl: 'https://explorer.energyweb.org',
    description: 'Energy Web Chain is a public, enterprise-grade blockchain platform designed specifically for the energy sector\'s requirements.',
    features: [
      '🚀 <strong>Energy Focused:</strong> Built for energy sector',
      '💰 <strong>Enterprise Grade:</strong> Production ready',
      '⚡ <strong>PoA Consensus:</strong> Validator-based',
      '🔐 <strong>Sustainable:</strong> Low energy consumption',
      '🛠️ <strong>EVM Compatible:</strong> Ethereum tooling',
      '🌍 <strong>Global Network:</strong> Energy Web ecosystem'
    ],
    links: {
      website: 'https://www.energyweb.org',
      explorer: 'https://explorer.energyweb.org',
      wallet: 'https://metamask.io',
      bridge: 'https://bridge.gnosischain.com'
    }
  },
  {
    key: 'TelosEVM',
    name: 'Telos EVM',
    symbol: 'TLOS',
    chainId: 40,
    type: 'Layer 1',
    icon: '🔷',
    gradient: '#571AFF, #3D0DB3',
    rpcUrl: 'https://mainnet.telos.net/evm',
    explorerUrl: 'https://teloscan.io',
    description: 'Telos EVM is one of the fastest EVM platforms available, offering high performance and low costs for decentralized applications.',
    features: [
      '🚀 <strong>Fastest EVM:</strong> 0.5 second blocks',
      '💰 <strong>Near Zero Fees:</strong> $0.00001 per transaction',
      '⚡ <strong>10,000 TPS:</strong> High throughput',
      '🔐 <strong>Fixed Gas:</strong> Predictable costs',
      '🛠️ <strong>EVM Compatible:</strong> Full Ethereum support',
      '🌍 <strong>Carbon Neutral:</strong> Eco-friendly'
    ],
    links: {
      website: 'https://www.telos.net',
      explorer: 'https://teloscan.io',
      wallet: 'https://wallet.telos.net',
      bridge: 'https://bridge.telos.net'
    }
  },
  {
    key: 'HorizenEON',
    name: 'Horizen EON',
    symbol: 'ZEN',
    chainId: 7332,
    type: 'Layer 1 / Privacy',
    icon: '🔐',
    gradient: '#041742, #030F2F',
    rpcUrl: 'https://eon-rpc.horizenlabs.io/ethv1',
    explorerUrl: 'https://eon-explorer.horizenlabs.io',
    description: 'Horizen EON is a privacy-focused, EVM-compatible smart contracting platform built on Horizen\'s zero-knowledge enabled network of blockchains.',
    features: [
      '🚀 <strong>Privacy Enabled:</strong> ZK technology',
      '💰 <strong>Scalable:</strong> High performance',
      '⚡ <strong>Fast Finality:</strong> Quick confirmations',
      '🔐 <strong>Secure:</strong> Enhanced privacy',
      '🛠️ <strong>EVM Compatible:</strong> Ethereum tooling',
      '🌍 <strong>Sidechain:</strong> Part of Horizen ecosystem'
    ],
    links: {
      website: 'https://horizen.io',
      explorer: 'https://eon-explorer.horizenlabs.io',
      wallet: 'https://www.horizen.io/wallets',
      bridge: 'https://bridge.horizen.io'
    }
  },
  {
    key: 'Viction',
    name: 'Viction',
    symbol: 'VIC',
    chainId: 88,
    type: 'Layer 1',
    icon: '🎯',
    gradient: '#6C5CE7, #5849C4',
    rpcUrl: 'https://rpc.viction.xyz',
    explorerUrl: 'https://www.vicscan.xyz',
    description: 'Viction (formerly TomoChain) is a people-centric Layer 1 blockchain offering zero-gas transactions and a focus on user experience.',
    features: [
      '🚀 <strong>PoSV Consensus:</strong> Proof of Stake Voting',
      '💰 <strong>Zero Gas:</strong> Gasless transactions',
      '⚡ <strong>2-Second Blocks:</strong> Fast finality',
      '🔐 <strong>150 Masternodes:</strong> Decentralized',
      '🛠️ <strong>EVM Compatible:</strong> Ethereum tooling',
      '🌍 <strong>DeFi Ready:</strong> Multiple dApps'
    ],
    links: {
      website: 'https://www.viction.xyz',
      explorer: 'https://www.vicscan.xyz',
      wallet: 'https://wallet.viction.xyz',
      bridge: 'https://bridge.viction.xyz'
    }
  },
  {
    key: 'Fuse',
    name: 'Fuse Network',
    symbol: 'FUSE',
    chainId: 122,
    type: 'Layer 1 / Payments',
    icon: '💳',
    gradient: '#B0F566, #95D951',
    rpcUrl: 'https://rpc.fuse.io',
    explorerUrl: 'https://explorer.fuse.io',
    description: 'Fuse is a fast, mobile-first, and EVM-compatible blockchain designed to enable businesses to create and operate wallets and payments infrastructure.',
    features: [
      '🚀 <strong>Mobile First:</strong> Built for mobile apps',
      '💰 <strong>Low Fees:</strong> Affordable transactions',
      '⚡ <strong>5-Second Blocks:</strong> Fast payments',
      '🔐 <strong>DPoS:</strong> Delegated Proof of Stake',
      '🛠️ <strong>EVM Compatible:</strong> Ethereum support',
      '🌍 <strong>Payments Focus:</strong> Business-ready'
    ],
    links: {
      website: 'https://fuse.io',
      explorer: 'https://explorer.fuse.io',
      wallet: 'https://wallet.fuse.io',
      bridge: 'https://bridge.fuse.io'
    }
  },
  {
    key: 'Syscoin',
    name: 'Syscoin',
    symbol: 'SYS',
    chainId: 57,
    type: 'Layer 1',
    icon: '🔷',
    gradient: '#0082C8, #006BA1',
    rpcUrl: 'https://rpc.syscoin.org',
    explorerUrl: 'https://explorer.syscoin.org',
    description: 'Syscoin is a Proof-of-Work blockchain merged-mined with Bitcoin, offering EVM compatibility and focused on scalability through its NEVM platform.',
    features: [
      '🚀 <strong>Bitcoin Security:</strong> Merged mining',
      '💰 <strong>Low Costs:</strong> Efficient operations',
      '⚡ <strong>Scalable:</strong> PoDA technology',
      '🔐 <strong>PoW Security:</strong> Bitcoin-backed',
      '🛠️ <strong>EVM Compatible:</strong> NEVM platform',
      '🌍 <strong>Hybrid:</strong> UTXO + EVM'
    ],
    links: {
      website: 'https://syscoin.org',
      explorer: 'https://explorer.syscoin.org',
      wallet: 'https://syscoin.org/get-started',
      bridge: 'https://bridge.syscoin.org'
    }
  },
  {
    key: 'ThunderCore',
    name: 'ThunderCore',
    symbol: 'TT',
    chainId: 108,
    type: 'Layer 1',
    icon: '⚡',
    gradient: '#FFC000, #D9A000',
    rpcUrl: 'https://mainnet-rpc.thundercore.com',
    explorerUrl: 'https://viewblock.io/thundercore',
    description: 'ThunderCore is an EVM-compatible public blockchain with fast transaction speeds and low gas costs, designed for mainstream adoption.',
    features: [
      '🚀 <strong>PaLa Consensus:</strong> Fast and secure',
      '💰 <strong>Low Fees:</strong> $0.00001 per tx',
      '⚡ <strong>1-2 Second Blocks:</strong> Fast finality',
      '🔐 <strong>Secure:</strong> Battle-tested',
      '🛠️ <strong>EVM Compatible:</strong> Full Ethereum support',
      '🌍 <strong>User Friendly:</strong> Easy onboarding'
    ],
    links: {
      website: 'https://www.thundercore.com',
      explorer: 'https://viewblock.io/thundercore',
      wallet: 'https://www.thundercore.com/thundercore-hub',
      bridge: 'https://bridge.thundercore.com'
    }
  },
  {
    key: 'Astar',
    name: 'Astar Network',
    symbol: 'ASTR',
    chainId: 592,
    type: 'Parachain / Polkadot',
    icon: '⭐',
    gradient: '#0068DB, #0052AD',
    rpcUrl: 'https://evm.astar.network',
    explorerUrl: 'https://astar.blockscout.com',
    description: 'Astar is a multi-chain smart contract platform on Polkadot that supports both EVM and WebAssembly smart contracts with cross-VM composability.',
    features: [
      '🚀 <strong>Polkadot Parachain:</strong> Shared security',
      '💰 <strong>dApp Staking:</strong> Earn by building',
      '⚡ <strong>Multi-VM:</strong> EVM + WASM',
      '🔐 <strong>Cross-Chain:</strong> XCM messaging',
      '🛠️ <strong>EVM Compatible:</strong> Full Solidity support',
      '🌍 <strong>Japan Hub:</strong> Web3 gateway'
    ],
    links: {
      website: 'https://astar.network',
      explorer: 'https://astar.blockscout.com',
      wallet: 'https://portal.astar.network',
      bridge: 'https://portal.astar.network/bridge'
    }
  },
  {
    key: 'Shiden',
    name: 'Shiden Network',
    symbol: 'SDN',
    chainId: 336,
    type: 'Parachain / Kusama',
    icon: '🦋',
    gradient: '#E6007A, #BB005F',
    rpcUrl: 'https://evm.shiden.astar.network',
    explorerUrl: 'https://shiden.blockscout.com',
    description: 'Shiden is a multi-chain dApp hub on Kusama, serving as Astar\'s canary network with real economic value and cutting-edge features.',
    features: [
      '🚀 <strong>Kusama Parachain:</strong> Canary network',
      '💰 <strong>dApp Staking:</strong> Developer rewards',
      '⚡ <strong>Multi-VM:</strong> EVM + WASM support',
      '🔐 <strong>Battle Testing:</strong> Innovation first',
      '🛠️ <strong>EVM Compatible:</strong> Ethereum tooling',
      '🌍 <strong>Cross-Chain:</strong> XCM ready'
    ],
    links: {
      website: 'https://shiden.astar.network',
      explorer: 'https://shiden.blockscout.com',
      wallet: 'https://portal.astar.network',
      bridge: 'https://portal.astar.network/bridge'
    }
  },
  {
    key: 'Efinity',
    name: 'Efinity',
    symbol: 'EFI',
    chainId: 1110,
    type: 'Parachain / Polkadot',
    icon: '💎',
    gradient: '#D946EF, #A21CAF',
    rpcUrl: 'https://rpc.efinity.io',
    explorerUrl: 'https://explorer.efinity.io',
    description: 'Efinity is a next-generation blockchain for NFTs built on Polkadot by Enjin. It provides advanced NFT functionalities with cross-chain capabilities.',
    features: [
      '🚀 <strong>NFT Focused:</strong> Built for digital assets',
      '💰 <strong>Fuel Tanks:</strong> Sponsored transactions',
      '⚡ <strong>Paratoken:</strong> Advanced NFT standard',
      '🔐 <strong>Polkadot Security:</strong> Shared security',
      '🛠️ <strong>EVM Compatible:</strong> Cross-VM support',
      '🌍 <strong>Enjin Ecosystem:</strong> Large community'
    ],
    links: {
      website: 'https://efinity.io',
      explorer: 'https://explorer.efinity.io',
      wallet: 'https://enjin.io/products/wallet',
      bridge: 'https://nft.io'
    }
  },
  {
    key: 'WorldChain',
    name: 'World Chain',
    symbol: 'WLD',
    chainId: 480,
    type: 'Layer 2 / Optimistic',
    icon: '🌍',
    gradient: '#000000, #333333',
    rpcUrl: 'https://worldchain-mainnet.g.alchemy.com/public',
    explorerUrl: 'https://worldscan.org',
    description: 'World Chain is an Ethereum Layer 2 built for humans, powered by Worldcoin. It offers priority blockspace for verified humans and gas-free transactions.',
    features: [
      '🚀 <strong>Human Centric:</strong> Built for people',
      '💰 <strong>Gas-Free:</strong> For verified humans',
      '⚡ <strong>OP Stack:</strong> Optimism-based',
      '🔐 <strong>World ID:</strong> Proof of personhood',
      '🛠️ <strong>EVM Compatible:</strong> Ethereum tooling',
      '🌍 <strong>Global:</strong> Worldcoin integration'
    ],
    links: {
      website: 'https://worldcoin.org/world-chain',
      explorer: 'https://worldscan.org',
      wallet: 'https://world.org',
      bridge: 'https://bridge.worldchain.org'
    }
  },
  {
    key: 'Sonic',
    name: 'Sonic',
    symbol: 'S',
    chainId: 146,
    type: 'Layer 1 / Gaming',
    icon: '💨',
    gradient: '#3B82F6, #2563EB',
    rpcUrl: 'https://rpc.soniclabs.com',
    explorerUrl: 'https://explorer.soniclabs.com',
    description: 'Sonic is a next-generation Layer 1 blockchain optimized for gaming and DeFi, featuring sub-second finality and native liquidity incentives.',
    features: [
      '🚀 <strong>Gaming Optimized:</strong> Built for Web3 games',
      '💰 <strong>Fee Monetization:</strong> Developers earn fees',
      '⚡ <strong>Sub-Second:</strong> Ultra-fast finality',
      '🔐 <strong>High Security:</strong> Advanced consensus',
      '🛠️ <strong>EVM Compatible:</strong> Full Solidity support',
      '🌍 <strong>DeFi Ready:</strong> Native incentives'
    ],
    links: {
      website: 'https://soniclabs.com',
      explorer: 'https://explorer.soniclabs.com',
      wallet: 'https://app.soniclabs.com',
      bridge: 'https://bridge.soniclabs.com'
    }
  },
  {
    key: 'Flare',
    name: 'Flare Network',
    symbol: 'FLR',
    chainId: 14,
    type: 'Layer 1 / Oracle',
    icon: '🔥',
    gradient: '#E52142, #B81A36',
    rpcUrl: 'https://flare-api.flare.network/ext/C/rpc',
    explorerUrl: 'https://flare-explorer.flare.network',
    description: 'Flare is a blockchain for data, providing decentralized access to high-integrity data from other chains and the internet. Features the Flare Time Series Oracle.',
    features: [
      '🚀 <strong>Data Layer:</strong> Blockchain for data',
      '💰 <strong>FTSO:</strong> Native price oracle',
      '⚡ <strong>State Connector:</strong> Trustless bridging',
      '🔐 <strong>FBA Consensus:</strong> Avalanche-based',
      '🛠️ <strong>EVM Compatible:</strong> Ethereum tooling',
      '🌍 <strong>Cross-Chain:</strong> Multi-chain data'
    ],
    links: {
      website: 'https://flare.network',
      explorer: 'https://flare-explorer.flare.network',
      wallet: 'https://bifrostwallet.com',
      bridge: 'https://portal.flare.network'
    }
  },
  {
    key: 'Songbird',
    name: 'Songbird',
    symbol: 'SGB',
    chainId: 19,
    type: 'Layer 1 / Canary',
    icon: '🐦',
    gradient: '#FFC107, #FFA000',
    rpcUrl: 'https://songbird-api.flare.network/ext/C/rpc',
    explorerUrl: 'https://songbird-explorer.flare.network',
    description: 'Songbird is the canary network for Flare, testing new features with real economic value before deployment to Flare Network.',
    features: [
      '🚀 <strong>Canary Network:</strong> Test with value',
      '💰 <strong>FTSO:</strong> Time series oracle',
      '⚡ <strong>Fast:</strong> Quick finality',
      '🔐 <strong>Battle Testing:</strong> Real value',
      '🛠️ <strong>EVM Compatible:</strong> Full Ethereum support',
      '🌍 <strong>Innovation:</strong> Latest features first'
    ],
    links: {
      website: 'https://flare.network/songbird',
      explorer: 'https://songbird-explorer.flare.network',
      wallet: 'https://bifrostwallet.com',
      bridge: 'https://portal.flare.network'
    }
  },
  {
    key: 'ZetaChain',
    name: 'ZetaChain',
    symbol: 'ZETA',
    chainId: 7000,
    type: 'Layer 1 / Omnichain',
    icon: '⛓️',
    gradient: '#00A264, #008251',
    rpcUrl: 'https://zetachain-evm.blockpi.network/v1/rpc/public',
    explorerUrl: 'https://explorer.zetachain.com',
    description: 'ZetaChain is a fundamental, public blockchain that enables omnichain, generic smart contracts and messaging between any blockchain.',
    features: [
      '🚀 <strong>Omnichain:</strong> Connect all blockchains',
      '💰 <strong>Universal Apps:</strong> Cross-chain dApps',
      '⚡ <strong>Fast Finality:</strong> Quick confirmations',
      '🔐 <strong>Decentralized:</strong> Non-custodial bridging',
      '🛠️ <strong>EVM Compatible:</strong> Ethereum tooling',
      '🌍 <strong>Any Chain:</strong> Bitcoin, Ethereum, Cosmos+'
    ],
    links: {
      website: 'https://www.zetachain.com',
      explorer: 'https://explorer.zetachain.com',
      wallet: 'https://hub.zetachain.com',
      bridge: 'https://hub.zetachain.com'
    }
  },
  // Sidechains & Special (5 networks)
  {
    key: 'SmartBCH',
    name: 'SmartBCH',
    symbol: 'BCH',
    chainId: 10000,
    type: 'Sidechain / Bitcoin Cash',
    icon: '💚',
    gradient: '#8DC351, #6FA936',
    rpcUrl: 'https://smartbch.greyh.at',
    explorerUrl: 'https://www.smartscan.cash',
    description: 'SmartBCH is an EVM-compatible sidechain for Bitcoin Cash, bringing DeFi and smart contracts to the BCH ecosystem.',
    features: [
      '🚀 <strong>BCH Sidechain:</strong> Bitcoin Cash powered',
      '💰 <strong>Low Fees:</strong> Affordable transactions',
      '⚡ <strong>Fast Blocks:</strong> 6-second finality',
      '🔐 <strong>SHA-Gate:</strong> Decentralized bridge',
      '🛠️ <strong>EVM Compatible:</strong> Full Solidity support',
      '🌍 <strong>DeFi Ready:</strong> DEXs and more'
    ],
    links: {
      website: 'https://smartbch.org',
      explorer: 'https://www.smartscan.cash',
      wallet: 'https://metamask.io',
      bridge: 'https://app.hop.ag'
    }
  },
  {
    key: 'RSK',
    name: 'RSK',
    symbol: 'RBTC',
    chainId: 30,
    type: 'Sidechain / Bitcoin',
    icon: '🟠',
    gradient: '#FF9900, #CC7A00',
    rpcUrl: 'https://public-node.rsk.co',
    explorerUrl: 'https://explorer.rsk.co',
    description: 'RSK (Rootstock) is a Bitcoin sidechain that brings smart contract functionality to Bitcoin, secured by Bitcoin\'s proof-of-work.',
    features: [
      '🚀 <strong>Bitcoin Sidechain:</strong> BTC-secured',
      '💰 <strong>Bitcoin Bridge:</strong> 2-way peg',
      '⚡ <strong>30-Second Blocks:</strong> Fast for Bitcoin',
      '🔐 <strong>Merge Mining:</strong> Bitcoin PoW',
      '🛠️ <strong>EVM Compatible:</strong> Ethereum tooling',
      '🌍 <strong>DeFi on Bitcoin:</strong> Smart contracts'
    ],
    links: {
      website: 'https://rootstock.io',
      explorer: 'https://explorer.rsk.co',
      wallet: 'https://www.defiant.app',
      bridge: 'https://tokenbridge.rsk.co'
    }
  },
  {
    key: 'Wanchain',
    name: 'Wanchain',
    symbol: 'WAN',
    chainId: 888,
    type: 'Layer 1 / Cross-Chain',
    icon: '🌐',
    gradient: '#136AAD, #0F5489',
    rpcUrl: 'https://gwan-ssl.wandevs.org:56891',
    explorerUrl: 'https://wanscan.org',
    description: 'Wanchain is a decentralized blockchain interoperability solution connecting isolated blockchain networks. It enables cross-chain transfers and smart contracts.',
    features: [
      '🚀 <strong>Cross-Chain:</strong> Connect blockchains',
      '💰 <strong>Low Fees:</strong> Efficient operations',
      '⚡ <strong>Fast Bridges:</strong> Quick cross-chain',
      '🔐 <strong>Secure:</strong> SMPC technology',
      '🛠️ <strong>EVM Compatible:</strong> Ethereum support',
      '🌍 <strong>Multi-Chain:</strong> 15+ blockchains'
    ],
    links: {
      website: 'https://www.wanchain.org',
      explorer: 'https://wanscan.org',
      wallet: 'https://www.wanchain.org/getstarted',
      bridge: 'https://bridge.wanchain.org'
    }
  },
  {
    key: 'GoChain',
    name: 'GoChain',
    symbol: 'GO',
    chainId: 60,
    type: 'Layer 1',
    icon: '🟢',
    gradient: '#4AC656, #3BA347',
    rpcUrl: 'https://rpc.gochain.io',
    explorerUrl: 'https://explorer.gochain.io',
    description: 'GoChain is a scalable, high-performance, and low-cost blockchain that is fully compatible with Ethereum. It uses Proof of Reputation consensus.',
    features: [
      '🚀 <strong>PoR Consensus:</strong> Proof of Reputation',
      '💰 <strong>1000x Cheaper:</strong> Than Ethereum',
      '⚡ <strong>10x Faster:</strong> Higher throughput',
      '🔐 <strong>Green:</strong> Energy efficient',
      '🛠️ <strong>EVM Compatible:</strong> Full Ethereum support',
      '🌍 <strong>Enterprise Ready:</strong> Business focused'
    ],
    links: {
      website: 'https://gochain.io',
      explorer: 'https://explorer.gochain.io',
      wallet: 'https://wallet.gochain.io',
      bridge: 'https://bridge.gochain.io'
    }
  },
  {
    key: 'Canto',
    name: 'Canto',
    symbol: 'CANTO',
    chainId: 7700,
    type: 'Layer 1 / DeFi',
    icon: '🎵',
    gradient: '#06FC99, #05D981',
    rpcUrl: 'https://canto.slingshot.finance',
    explorerUrl: 'https://tuber.build',
    description: 'Canto is a permissionless Layer 1 blockchain built to deliver on the promise of DeFi. It offers Free Public Infrastructure for liquidity, lending, and stablecoins.',
    features: [
      '🚀 <strong>Free Infrastructure:</strong> No protocol fees',
      '💰 <strong>DeFi Focused:</strong> Built for finance',
      '⚡ <strong>Cosmos SDK:</strong> Fast and scalable',
      '🔐 <strong>Decentralized:</strong> Community owned',
      '🛠️ <strong>EVM Compatible:</strong> Ethereum tooling',
      '🌍 <strong>Open Source:</strong> Fully transparent'
    ],
    links: {
      website: 'https://canto.io',
      explorer: 'https://tuber.build',
      wallet: 'https://wallet.canto.io',
      bridge: 'https://bridge.canto.io'
    }
  }
];

// Vue page template
const generatePageTemplate = (network) => {
  return `<template>
  <div class="${network.key.toLowerCase()}-network-page">
    <!-- Header Card -->
    <n-card class="header-card" style="margin-bottom: 24px;">
      <template #header>
        <div style="display: flex; align-items: center; gap: 16px; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, ${network.gradient}); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px;">
              ${network.icon}
            </div>
            <div>
              <h2 style="margin: 0; font-size: 24px;">${network.name}</h2>
              <p style="margin: 0; color: #666; font-size: 14px;">${network.type}</p>
            </div>
          </div>
          <n-button type="primary" size="large" @click="generateWallet" :loading="generating">
            ➕ Generate New Wallet
          </n-button>
        </div>
      </template>

      <n-grid cols="2 s:3 m:4" responsive="screen" :x-gap="16" :y-gap="16">
        <n-gi>
          <n-statistic label="Chain ID" value="${network.chainId}">
            <template #prefix>#</template>
          </n-statistic>
        </n-gi>
        <n-gi>
          <n-statistic label="Network Type" value="${network.type}">
            <template #prefix>⚡</template>
          </n-statistic>
        </n-gi>
        <n-gi>
          <n-statistic label="Native Token" value="${network.symbol}">
            <template #prefix>💎</template>
          </n-statistic>
        </n-gi>
        <n-gi>
          <n-statistic label="My Wallets" :value="wallets.length">
            <template #prefix>👛</template>
          </n-statistic>
        </n-gi>
      </n-grid>
    </n-card>

    <!-- Tabs -->
    <n-card>
      <n-tabs type="line" animated>
        <!-- Wallets Tab -->
        <n-tab-pane name="wallets" tab="👛 My Wallets">
          <div v-if="loading" style="text-align: center; padding: 40px;">
            <n-spin size="large" />
            <p style="margin-top: 16px; color: #666;">Loading your wallets...</p>
          </div>

          <div v-else-if="wallets.length === 0" style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 64px; margin-bottom: 16px;">💼</div>
            <h3 style="margin: 0 0 8px 0;">No ${network.name} Wallets Yet</h3>
            <p style="color: #666; margin-bottom: 24px;">Generate your first ${network.name} wallet to get started</p>
            <n-button type="primary" size="large" @click="generateWallet">
              ➕ Generate Wallet
            </n-button>
          </div>

          <n-space v-else vertical :size="16">
            <n-card v-for="(wallet, index) in wallets" :key="wallet._id" :title="\`\${wallet.walletName || '${network.name} Wallet ' + (index + 1)}\`" hoverable>
              <n-descriptions :column="1" bordered>
                <n-descriptions-item label="Address">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <code style="font-size: 12px; word-break: break-all;">\{\{ wallet.address \}\}</code>
                    <n-button text type="primary" size="tiny" @click="copyToClipboard(wallet.address, 'Address')">
                      📋 Copy
                    </n-button>
                    <n-button text type="info" size="tiny" @click="openExplorer(wallet.address)">
                      🔍 Explorer
                    </n-button>
                  </div>
                </n-descriptions-item>

                <n-descriptions-item label="Public Key">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <code style="font-size: 11px; word-break: break-all;">\{\{ wallet.publicKey || 'N/A' \}\}</code>
                    <n-button v-if="wallet.publicKey" text type="primary" size="tiny" @click="copyToClipboard(wallet.publicKey, 'Public Key')">
                      📋 Copy
                    </n-button>
                  </div>
                </n-descriptions-item>

                <n-descriptions-item label="Private Key">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <code v-if="showPrivateKey[wallet._id]" style="font-size: 11px; word-break: break-all; color: #ff4d4f;">\{\{ wallet.privateKey \}\}</code>
                    <code v-else style="color: #999;">••••••••••••••••••••••••••••••••</code>
                    <n-button text type="warning" size="tiny" @click="togglePrivateKey(wallet._id)">
                      \{\{ showPrivateKey[wallet._id] ? '🙈 Hide' : '👁️ Show' \}\}
                    </n-button>
                    <n-button v-if="showPrivateKey[wallet._id]" text type="primary" size="tiny" @click="copyToClipboard(wallet.privateKey, 'Private Key')">
                      📋 Copy
                    </n-button>
                  </div>
                </n-descriptions-item>

                <n-descriptions-item label="Mnemonic">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <code v-if="showMnemonic[wallet._id]" style="font-size: 11px; word-break: break-all; color: #ff4d4f;">\{\{ wallet.mnemonic || 'N/A' \}\}</code>
                    <code v-else style="color: #999;">•••• •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• ••••</code>
                    <n-button v-if="wallet.mnemonic" text type="warning" size="tiny" @click="toggleMnemonic(wallet._id)">
                      \{\{ showMnemonic[wallet._id] ? '🙈 Hide' : '👁️ Show' \}\}
                    </n-button>
                    <n-button v-if="showMnemonic[wallet._id] && wallet.mnemonic" text type="primary" size="tiny" @click="copyToClipboard(wallet.mnemonic, 'Mnemonic')">
                      📋 Copy
                    </n-button>
                  </div>
                </n-descriptions-item>

                <n-descriptions-item label="Balance">
                  <div>
                    <div>\{\{ wallet.balance || '0' \}\} ${network.symbol}</div>
                    <div v-if="wallet.balanceUSD" style="color: #666; font-size: 12px;">≈ $\{\{ wallet.balanceUSD \}\}</div>
                  </div>
                </n-descriptions-item>

                <n-descriptions-item label="Created">
                  \{\{ formatDate(wallet.createdAt) \}\}
                </n-descriptions-item>

                <n-descriptions-item label="Last Used">
                  \{\{ formatDate(wallet.lastUsed) \}\}
                </n-descriptions-item>
              </n-descriptions>

              <template #footer>
                <n-space>
                  <n-button type="info" size="small" @click="openExplorer(wallet.address)">
                    🔍 View on Explorer
                  </n-button>
                  <n-button type="primary" size="small" @click="copyToClipboard(wallet.address, 'Address')">
                    📋 Copy Address
                  </n-button>
                </n-space>
              </template>
            </n-card>
          </n-space>
        </n-tab-pane>

        <!-- Network Info Tab -->
        <n-tab-pane name="info" tab="ℹ️ Network Info">
          <n-space vertical :size="16">
            <n-card title="${network.icon} About ${network.name}">
              <p style="line-height: 1.8; color: #666;">
                ${network.description}
              </p>
            </n-card>

            <n-card title="🔗 Network Details">
              <n-descriptions :column="1" bordered>
                <n-descriptions-item label="Network Name">
                  ${network.name}
                </n-descriptions-item>
                <n-descriptions-item label="Chain ID">
                  ${network.chainId}
                </n-descriptions-item>
                <n-descriptions-item label="Currency Symbol">
                  ${network.symbol}
                </n-descriptions-item>
                <n-descriptions-item label="RPC URL">
                  <a href="${network.rpcUrl}" target="_blank">${network.rpcUrl}</a>
                </n-descriptions-item>
                <n-descriptions-item label="Block Explorer">
                  <a href="${network.explorerUrl}" target="_blank">${network.explorerUrl}</a>
                </n-descriptions-item>
              </n-descriptions>
            </n-card>

            <n-card title="✨ Key Features">
              <ul style="line-height: 2; color: #666;">
${network.features.map(f => `                <li>${f}</li>`).join('\n')}
              </ul>
            </n-card>

            <n-card title="🔗 Useful Links">
              <n-space vertical :size="12">
                <n-button type="primary" @click="openUrl('${network.links.website}')" block>
                  🌐 Official Website
                </n-button>
                <n-button type="info" @click="openUrl('${network.links.explorer}')" block>
                  🔍 Block Explorer
                </n-button>
                <n-button type="success" @click="openUrl('${network.links.wallet}')" block>
                  👛 Wallet
                </n-button>
                <n-button type="warning" @click="openUrl('${network.links.bridge}')" block>
                  🌉 Bridge
                </n-button>
              </n-space>
            </n-card>
          </n-space>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useMessage } from 'naive-ui';

const message = useMessage();

// State
const wallets = ref([]);
const loading = ref(false);
const generating = ref(false);
const showPrivateKey = reactive({});
const showMnemonic = reactive({});

// Get userID from localStorage
const userID = ref(null);
onMounted(() => {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    userID.value = userData.userID || userData._id;
  }
  if (userID.value) {
    loadWallets();
  }
});

// Load wallets
async function loadWallets() {
  loading.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/fetchUserWallets', {
      method: 'GET',
      params: {
        userID: userID.value,
        network: '${network.name}'
      }
    });

    if (response.success) {
      wallets.value = response.data || [];
    } else {
      message.error(response.message || 'Failed to load wallets');
    }
  } catch (error) {
    console.error('[${network.name}] Load error:', error);
    message.error('Failed to load ${network.name} wallets');
  } finally {
    loading.value = false;
  }
}

// Generate new wallet
async function generateWallet() {
  if (!userID.value) {
    message.error('Please login first!');
    return;
  }

  generating.value = true;
  try {
    const response = await $fetch('/api/v1/Wallets/generateEVMWallet', {
      method: 'POST',
      body: {
        userID: userID.value,
        network: '${network.key}',
        walletName: \`${network.name} Wallet \${wallets.value.length + 1}\`
      }
    });

    if (response.success) {
      message.success('${network.name} wallet generated successfully!');
      await loadWallets();
    } else {
      throw new Error(response.message || 'Failed to generate wallet');
    }
  } catch (error) {
    console.error('[${network.name}] Generate error:', error);
    message.error(error.message || 'Failed to generate wallet');
  } finally {
    generating.value = false;
  }
}

// Toggle private key visibility
function togglePrivateKey(walletId) {
  showPrivateKey[walletId] = !showPrivateKey[walletId];
}

// Toggle mnemonic visibility
function toggleMnemonic(walletId) {
  showMnemonic[walletId] = !showMnemonic[walletId];
}

// Copy to clipboard
async function copyToClipboard(text, label = 'Text') {
  try {
    await navigator.clipboard.writeText(text);
    message.success(\`\${label} copied to clipboard!\`);
  } catch (error) {
    console.error('Copy failed:', error);
    message.error('Failed to copy to clipboard');
  }
}

// Open explorer
function openExplorer(address) {
  window.open(\`${network.explorerUrl}/address/\${address}\`, '_blank');
}

// Open URL
function openUrl(url) {
  window.open(url, '_blank');
}

// Format date
function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString();
}
</script>

<style scoped>
.${network.key.toLowerCase()}-network-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-card {
  background: linear-gradient(135deg, rgba(${network.gradient.split(', ')[0].replace('#', '')}, 0.05), rgba(${network.gradient.split(', ')[1].replace('#', '')}, 0.05));
}

code {
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}
</style>
`;
};

// Helper function to convert hex to rgb
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Main execution
console.log('🚀 Starting Network Page Generator...\n');

const pagesDir = path.join(__dirname, '..', 'pages');

// Create pages directory if it doesn't exist
if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true });
}

let successCount = 0;
let errorCount = 0;

networks.forEach(network => {
  try {
    const fileName = `${network.key}Network.vue`;
    const filePath = path.join(pagesDir, fileName);

    const pageContent = generatePageTemplate(network);
    fs.writeFileSync(filePath, pageContent, 'utf8');

    console.log(`✅ Created: ${fileName}`);
    successCount++;
  } catch (error) {
    console.error(`❌ Failed to create ${network.key}Network.vue:`, error.message);
    errorCount++;
  }
});

console.log(`\n📊 Generation Complete!`);
console.log(`   ✅ Success: ${successCount} pages`);
console.log(`   ❌ Errors: ${errorCount} pages`);
console.log(`   📁 Location: ${pagesDir}`);
