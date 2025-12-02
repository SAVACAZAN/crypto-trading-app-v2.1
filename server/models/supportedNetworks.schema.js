/**
 * Supported Networks Schema
 * Database model pentru rețelele blockchain suportate
 */

import { defineMongooseModel } from '#nuxt/mongoose'

export const supportedNetworksSchema = defineMongooseModel({
  name: 'SupportedNetworks',
  schema: {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    symbol: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    walletType: {
      type: String,
      required: true,
      enum: ['EVM', 'Non-EVM']
    },
    coinType: {
      type: Number,
      required: true
    },
    chainId: {
      type: Number,
      required: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    // Address format information
    addressTypes: {
      type: Array,
      default: []
    },
    addressPrefix: {
      type: String,
      required: false
    },
    // Network information
    description: {
      type: String,
      required: false
    },
    category: {
      type: String,
      enum: [
        'Bitcoin Forks',
        'Layer 1',
        'Layer 2',
        'Cosmos Ecosystem',
        'DeFi',
        'Legacy',
        'Gaming/NFT',
        'Privacy',
        'Specialized'
      ],
      required: false
    },
    isL2: {
      type: Boolean,
      default: false
    },
    // URLs
    rpcUrl: {
      type: String,
      required: false
    },
    explorerUrl: {
      type: String,
      required: false
    },
    websiteUrl: {
      type: String,
      required: false
    },
    // Features
    features: {
      type: Array,
      default: []
    },
    supportedFeatures: {
      staking: { type: Boolean, default: false },
      smartContracts: { type: Boolean, default: false },
      nft: { type: Boolean, default: false },
      defi: { type: Boolean, default: false },
      crossChain: { type: Boolean, default: false }
    },
    // Statistics
    totalWalletsGenerated: {
      type: Number,
      default: 0
    },
    // Metadata
    icon: {
      type: String,
      required: false
    },
    color: {
      type: String,
      required: false
    },
    order: {
      type: Number,
      default: 999
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  options: {
    timestamps: true
  }
});
