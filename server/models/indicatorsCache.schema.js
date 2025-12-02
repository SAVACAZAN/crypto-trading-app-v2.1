import mongoose from 'mongoose';

const indicatorsCacheSchema = new mongoose.Schema({
  exchange: {
    type: String,
    required: true,
    index: true
  },
  symbol: {
    type: String,
    required: true,
    index: true
  },
  timeframe: {
    type: String,
    required: true,
    index: true
  },
  // RSI data
  rsiData: [{
    type: Number
  }],
  currentRSI: {
    type: Number
  },
  // MACD data
  macdData: [{
    macd: Number,
    signal: Number,
    histogram: Number
  }],
  currentMACD: {
    macd: Number,
    signal: Number,
    histogram: Number
  },
  // Timestamps for each data point
  timestamps: [{
    type: Number // Unix timestamp
  }],
  // Cache metadata
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true
  },
  dataPoints: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for fast lookups
indicatorsCacheSchema.index({ exchange: 1, symbol: 1, timeframe: 1 }, { unique: true });

// TTL index - data expires after 5 minutes
indicatorsCacheSchema.index({ lastUpdated: 1 }, { expireAfterSeconds: 300 });

export default mongoose.model('IndicatorsCache', indicatorsCacheSchema);
