import mongoose from 'mongoose'

const gridBotStrategySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  configName: {
    type: String,
    default: 'Custom'
  },
  // Incremental percentages for buy/sell (global settings)
  incBuy: {
    type: Number,
    default: 1
  },
  incSell: {
    type: Number,
    default: 1
  },
  // Deviation settings (global settings)
  devPriceBuy: {
    type: Number,
    default: 1
  },
  devPriceSell: {
    type: Number,
    default: 1
  },
  devAmtBuy: {
    type: Number,
    default: 0.9
  },
  devAmtSell: {
    type: Number,
    default: 0.9
  },
  // Trading pairs with percentage-based pricing (like OneClick)
  pairs: [{
    symbol: {
      type: String,
      required: true
    },
    exchange: {
      type: String,
      required: true,
      default: 'coinbaseadvanced'
    },
    ordersSide: {
      type: String,
      enum: ['buyOnly', 'sellOnly', 'buyOrSell'],
      default: 'buyOrSell'
    },
    // Percentage offsets from current market prices
    lowerPricePercent: {
      type: Number,
      default: -20, // -20% from bid
      required: true
    },
    upperPricePercent: {
      type: Number,
      default: 1, // +1% from ask
      required: true
    },
    amount: {
      type: Number,
      default: 1.1
    },
    grids: {
      type: Number,
      default: 10
    },
    // Amount type configuration
    amountType: {
      type: String,
      enum: ['quantityPerGrid', 'totalAmount', 'incrementalPercent'],
      default: 'incrementalPercent'
    },
    // Store reference prices for display purposes only
    referenceBid: Number,
    referenceAsk: Number,
    lastUpdated: Date
  }]
}, {
  timestamps: true
})

// Index for faster queries
gridBotStrategySchema.index({ userId: 1, name: 1 }, { unique: true })
gridBotStrategySchema.index({ userId: 1 })

// Method to calculate actual prices from percentages
gridBotStrategySchema.methods.calculatePrices = function(currentBid, currentAsk, pairIndex = 0) {
  const pair = this.pairs[pairIndex]
  if (!pair) return null

  const lowerPrice = currentBid * (1 + pair.lowerPricePercent / 100)
  const upperPrice = currentAsk * (1 + pair.upperPricePercent / 100)

  return {
    lowerPrice: parseFloat(lowerPrice.toFixed(8)),
    upperPrice: parseFloat(upperPrice.toFixed(8)),
    lowerPricePercent: pair.lowerPricePercent,
    upperPricePercent: pair.upperPricePercent
  }
}

// Static method to get all strategies for a user
gridBotStrategySchema.statics.getUserStrategies = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 })
}

export default mongoose.model('GridBotStrategy', gridBotStrategySchema)
