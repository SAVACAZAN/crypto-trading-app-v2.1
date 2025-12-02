import mongoose from 'mongoose';

const sepoliaNetworkBalanceSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
    index: true
  },
  address: {
    type: String,
    required: true,
    index: true
  },
  balance: {
    type: String,
    default: '0'
  },
  balanceInWei: {
    type: String,
    default: '0'
  },
  network: {
    type: String,
    default: 'Sepolia'
  },
  chainId: {
    type: Number,
    default: 11155111
  },
  lastScanned: {
    type: Date,
    default: Date.now
  },
  walletSource: {
    type: String,
    enum: ['testNetworks', 'ethereum', 'external'],
    default: 'testNetworks'
  },
  walletName: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for faster lookups
sepoliaNetworkBalanceSchema.index({ userID: 1, address: 1 }, { unique: true });
sepoliaNetworkBalanceSchema.index({ userID: 1, network: 1 });

export const sepoliaNetworkBalance = mongoose.model('sepoliaNetworkBalance', sepoliaNetworkBalanceSchema);
