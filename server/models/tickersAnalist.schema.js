import mongoose from 'mongoose';

const tickersAnalistSchema = new mongoose.Schema({
  // Selected Pair Info
  symbol: {
    type: String,
    required: true // e.g., "LCX/USDC", "EGLD/USDT", "BTC/USDT"
  },
  exchange: {
    type: String,
    required: true // e.g., "coinbaseadvanced", "binance"
  },

  // Selected Pair Price Data
  pairPriceUSD: {
    type: Number,
    required: true
  },
  pairPriceBTC: {
    type: Number,
    required: true
  },
  pairPriceETH: {
    type: Number,
    required: true
  },

  // BTC Data (always included for reference)
  btcPriceUSD: {
    type: Number,
    required: true
  },
  btcPriceETH: {
    type: Number,
    required: true
  },

  // ETH Data (always included for reference)
  ethPriceUSD: {
    type: Number,
    required: true
  },
  ethPriceBTC: {
    type: Number,
    required: true
  },

  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'tickersAnalist'
});

// Compound index for faster queries by symbol and time
tickersAnalistSchema.index({ symbol: 1, timestamp: -1 });
tickersAnalistSchema.index({ exchange: 1, timestamp: -1 });

export default mongoose.model('TickersAnalist', tickersAnalistSchema);
