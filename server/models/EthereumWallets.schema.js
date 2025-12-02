import mongoose from 'mongoose';

/**
 * Ethereum Wallets Schema
 * Stores Ethereum wallet information for users
 * Each wallet contains a single address (unlike Bitcoin which has 5 types)
 */
const ethereumWalletsSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
    index: true
  },
  walletName: {
    type: String,
    required: true,
    default: 'ETH Wallet'
  },
  address: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        // Ethereum address format: 0x followed by 40 hexadecimal characters
        return /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: props => `${props.value} is not a valid Ethereum address!`
    }
  },
  privateKey: {
    type: String,
    required: true
  },
  mnemonic: {
    type: String,
    required: true
  },
  derivationPath: {
    type: String,
    required: true,
    default: "m/44'/60'/0'/0/0" // Standard Ethereum BIP44 path
  },
  walletIndex: {
    type: Number,
    required: true,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  lastUsed: {
    type: Date,
    default: null
  },
  balance: {
    type: String,
    default: '0'
  },
  balanceUSD: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'ethereum_wallets'
});

// Compound index for userID and walletIndex
ethereumWalletsSchema.index({ userID: 1, walletIndex: 1 }, { unique: true });

// Index for active wallets
ethereumWalletsSchema.index({ userID: 1, isActive: 1 });

export const EthereumWalletsSchema = mongoose.model('EthereumWallets', ethereumWalletsSchema);
