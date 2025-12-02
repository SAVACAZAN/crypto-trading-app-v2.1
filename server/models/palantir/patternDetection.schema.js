import mongoose from 'mongoose';

const PatternDetectionSchema = new mongoose.Schema({
  patternId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    index: true
  },
  symbol: {
    type: String,
    required: true,
    index: true
  },
  exchange: {
    type: String,
    required: true
  },
  timeframe: {
    type: String,
    enum: ['1m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d', '1w', '1M'],
    required: true
  },
  patternType: {
    type: String,
    enum: ['pump', 'dump', 'breakout', 'reversal', 'accumulation', 'distribution', 'whale_wall', 'spoofing'],
    required: true,
    index: true
  },
  patternName: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  price: {
    type: Number,
    default: 0
  },
  volume: {
    type: Number,
    default: 0
  },
  metrics: {
    priceChange: Number,      // % price change
    priceChange5m: Number,
    priceChange15m: Number,
    priceChange1h: Number,
    volumeChange: Number,     // % volume change
    volumeSurge: Number,
    rsi: Number,
    rsi1m: Number,
    rsi5m: Number,
    rsi15m: Number,
    rsi1h: Number,
    macd: Number,
    macdSignal: String,       // 'bullish', 'bearish', 'neutral'
    macdCross: Boolean,
    orderBookImbalance: Number, // Ratio of buy vs sell orders
    whaleWallSize: Number,    // Size of whale wall if detected
    resistanceLevel: Number,
    supportLevel: Number,
    volatility: Number,
    // Additional metrics
    additionalMetrics: mongoose.Schema.Types.Mixed
  },
  signal: {
    type: String,
    enum: ['BUY', 'SELL', 'NEUTRAL'],
    required: true
  },
  signalStrength: {
    type: String,
    enum: ['WEAK', 'MODERATE', 'STRONG', 'VERY_STRONG'],
    default: 'MODERATE'
  },
  actionTaken: {
    type: String,
    default: null
  },
  actionData: mongoose.Schema.Types.Mixed,
  autoTrade: {
    enabled: Boolean,
    executed: Boolean,
    botId: String,
    chainId: String,
    result: mongoose.Schema.Types.Mixed
  },
  detectedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Patterns expire after 1 hour by default
      return new Date(Date.now() + 3600000);
    }
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'confirmed', 'false_positive'],
    default: 'active'
  },
  confirmedAt: Date,
  outcome: {
    type: String,
    enum: ['profitable', 'loss', 'breakeven', 'pending'],
    default: 'pending'
  },
  profitLoss: Number
}, {
  timestamps: true
});

// Indexes for performance
PatternDetectionSchema.index({ symbol: 1, detectedAt: -1 });
PatternDetectionSchema.index({ patternType: 1, confidence: -1 });
PatternDetectionSchema.index({ detectedAt: -1 });
PatternDetectionSchema.index({ status: 1, expiresAt: 1 });
PatternDetectionSchema.index({ userId: 1, detectedAt: -1 });

// TTL index to auto-delete expired patterns after 24 hours
PatternDetectionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

// Method to check if pattern is still valid
PatternDetectionSchema.methods.isValid = function() {
  return this.status === 'active' && new Date() < this.expiresAt;
};

// Method to mark as confirmed
PatternDetectionSchema.methods.confirm = function(outcome, profitLoss) {
  this.status = 'confirmed';
  this.confirmedAt = new Date();
  this.outcome = outcome;
  this.profitLoss = profitLoss;
};

// Static method to get pattern stats
PatternDetectionSchema.statics.getStats = async function(userId, patternType, days = 1) {
  const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));

  const stats = await this.aggregate([
    {
      $match: {
        userId: userId,
        patternType: patternType,
        detectedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        avgConfidence: { $avg: '$confidence' },
        confirmedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
        },
        profitableCount: {
          $sum: { $cond: [{ $eq: ['$outcome', 'profitable'] }, 1, 0] }
        },
        totalProfitLoss: { $sum: '$profitLoss' }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : {
    count: 0,
    avgConfidence: 0,
    confirmedCount: 0,
    profitableCount: 0,
    totalProfitLoss: 0
  };
};

export default mongoose.models.PatternDetection || mongoose.model('PatternDetection', PatternDetectionSchema);
