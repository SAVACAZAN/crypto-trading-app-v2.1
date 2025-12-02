import { Schema } from 'mongoose';

// Schema for Hyperliquid User Account Data
const hyperliquidUserAccountSchema = new Schema({
  // Reference to user's Hyperliquid API key
  userId: {
    type: String,
    required: true,
    index: true
  },

  // Hyperliquid wallet address
  walletAddress: {
    type: String,
    required: true,
    index: true
  },

  // API Key reference (from hyperliquid-keys collection)
  apiKeyId: {
    type: Schema.Types.ObjectId,
    ref: 'HyperliquidKey',
    index: true
  },

  // 💰 BALANCE DATA
  balance: {
    // Spot wallet balance
    spot: {
      assets: [{
        coin: String,
        total: Number,
        hold: Number,
        available: Number,
        usdValue: Number
      }],
      totalUsdValue: Number,
      lastUpdated: Date
    },

    // Perpetuals wallet balance
    perp: {
      marginSummary: {
        accountValue: Number,
        totalNtlPos: Number,
        totalRawUsd: Number,
        totalMarginUsed: Number,
        withdrawable: Number
      },
      assetPositions: [{
        position: {
          coin: String,
          entryPx: Number,
          leverage: {
            type: Number,
            value: Number,
            rawUsd: Number
          },
          liquidationPx: Number,
          marginUsed: Number,
          maxTradeSizes: [Number],
          positionValue: Number,
          returnOnEquity: Number,
          szi: Number,
          unrealizedPnl: Number
        },
        type: String
      }],
      crossMarginSummary: {
        accountValue: Number,
        totalMarginUsed: Number,
        totalNtlPos: Number,
        totalRawUsd: Number,
        withdrawable: Number
      },
      lastUpdated: Date
    },

    // Combined total
    totalAccountValue: Number,
    lastSync: Date
  },

  // 📥 DEPOSITS HISTORY
  deposits: [{
    transactionHash: String,
    time: Date,
    coin: String,
    amount: Number,
    usdValue: Number,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'confirmed'
    },
    confirmations: Number,
    fromAddress: String,
    toAddress: String,
    fee: Number,
    metadata: Schema.Types.Mixed
  }],

  // 📤 WITHDRAWALS HISTORY
  withdrawals: [{
    transactionHash: String,
    time: Date,
    coin: String,
    amount: Number,
    usdValue: Number,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'completed'
    },
    fromAddress: String,
    toAddress: String,
    fee: Number,
    nonce: Number,
    metadata: Schema.Types.Mixed
  }],

  // 🔄 INTERNAL TRANSFERS (Spot ↔ Perp)
  transfers: [{
    time: Date,
    coin: String,
    amount: Number,
    usdValue: Number,
    fromAccount: {
      type: String,
      enum: ['spot', 'perp']
    },
    toAccount: {
      type: String,
      enum: ['spot', 'perp']
    },
    transactionHash: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed'
    },
    metadata: Schema.Types.Mixed
  }],

  // Sync metadata
  lastDepositSync: Date,
  lastWithdrawalSync: Date,
  lastTransferSync: Date,
  lastBalanceSync: Date,

  // Sync status
  syncStatus: {
    balance: {
      type: String,
      enum: ['success', 'failed', 'never'],
      default: 'never'
    },
    deposits: {
      type: String,
      enum: ['success', 'failed', 'never'],
      default: 'never'
    },
    withdrawals: {
      type: String,
      enum: ['success', 'failed', 'never'],
      default: 'never'
    },
    transfers: {
      type: String,
      enum: ['success', 'failed', 'never'],
      default: 'never'
    }
  },

  // Error tracking
  lastError: {
    type: String,
    default: null
  },

  // Statistics
  stats: {
    totalDeposits: Number,
    totalWithdrawals: Number,
    totalTransfers: Number,
    totalDepositAmount: Number,
    totalWithdrawalAmount: Number,
    netDeposits: Number
  }

}, {
  timestamps: true,
  collection: 'hyperliquid_user_accounts'
});

// Indexes for faster queries
hyperliquidUserAccountSchema.index({ userId: 1, walletAddress: 1 });
hyperliquidUserAccountSchema.index({ 'deposits.time': -1 });
hyperliquidUserAccountSchema.index({ 'withdrawals.time': -1 });
hyperliquidUserAccountSchema.index({ 'transfers.time': -1 });

// Static method to get user account data
hyperliquidUserAccountSchema.statics.getUserAccount = async function(userId, walletAddress) {
  return await this.findOne({ userId, walletAddress })
    .lean()
    .exec();
};

// Static method to get balance only
hyperliquidUserAccountSchema.statics.getBalance = async function(userId, walletAddress) {
  const account = await this.findOne({ userId, walletAddress })
    .select('balance lastBalanceSync syncStatus.balance')
    .lean()
    .exec();

  return account;
};

// Static method to get deposit history
hyperliquidUserAccountSchema.statics.getDeposits = async function(userId, walletAddress, limit = 100) {
  const account = await this.findOne({ userId, walletAddress })
    .select('deposits lastDepositSync')
    .lean()
    .exec();

  if (!account) return [];

  return account.deposits
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, limit);
};

// Static method to get withdrawal history
hyperliquidUserAccountSchema.statics.getWithdrawals = async function(userId, walletAddress, limit = 100) {
  const account = await this.findOne({ userId, walletAddress })
    .select('withdrawals lastWithdrawalSync')
    .lean()
    .exec();

  if (!account) return [];

  return account.withdrawals
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, limit);
};

// Static method to get transfer history
hyperliquidUserAccountSchema.statics.getTransfers = async function(userId, walletAddress, limit = 100) {
  const account = await this.findOne({ userId, walletAddress })
    .select('transfers lastTransferSync')
    .lean()
    .exec();

  if (!account) return [];

  return account.transfers
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, limit);
};

// Instance method to calculate statistics
hyperliquidUserAccountSchema.methods.calculateStats = function() {
  const totalDeposits = this.deposits?.length || 0;
  const totalWithdrawals = this.withdrawals?.length || 0;
  const totalTransfers = this.transfers?.length || 0;

  const totalDepositAmount = this.deposits?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
  const totalWithdrawalAmount = this.withdrawals?.reduce((sum, w) => sum + (w.amount || 0), 0) || 0;
  const netDeposits = totalDepositAmount - totalWithdrawalAmount;

  this.stats = {
    totalDeposits,
    totalWithdrawals,
    totalTransfers,
    totalDepositAmount,
    totalWithdrawalAmount,
    netDeposits
  };

  return this.stats;
};

// Pre-save hook to update statistics
hyperliquidUserAccountSchema.pre('save', function(next) {
  this.calculateStats();
  next();
});

export default hyperliquidUserAccountSchema;
