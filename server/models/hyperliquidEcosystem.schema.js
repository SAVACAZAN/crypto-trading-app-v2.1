import { Schema } from 'mongoose';

// Schema for Hyperliquid Ecosystem Data
const hyperliquidEcosystemSchema = new Schema({
  // Type of market data: 'spot' or 'perp'
  marketType: {
    type: String,
    enum: ['spot', 'perp'],
    required: true,
    index: true
  },

  // Array of available markets
  markets: [{
    // Market symbol (e.g., 'BTC-USD', 'ETH-USDC')
    symbol: {
      type: String,
      required: true
    },

    // Base asset (e.g., 'BTC', 'ETH')
    baseAsset: {
      type: String,
      required: true
    },

    // Quote asset (e.g., 'USD', 'USDC')
    quoteAsset: {
      type: String,
      required: true
    },

    // Market status
    status: {
      type: String,
      enum: ['active', 'inactive', 'paused'],
      default: 'active'
    },

    // Price precision
    pricePrecision: {
      type: Number,
      default: 8
    },

    // Quantity precision
    quantityPrecision: {
      type: Number,
      default: 8
    },

    // Minimum order size
    minOrderSize: {
      type: Number,
      default: 0
    },

    // Maximum order size
    maxOrderSize: {
      type: Number,
      default: 0
    },

    // Tick size (minimum price increment)
    tickSize: {
      type: Number,
      default: 0.01
    },

    // Step size (minimum quantity increment)
    stepSize: {
      type: Number,
      default: 0.001
    },

    // Additional metadata from Hyperliquid
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  }],

  // Total count of markets
  totalMarkets: {
    type: Number,
    default: 0
  },

  // Last sync timestamp
  lastSync: {
    type: Date,
    default: Date.now,
    index: true
  },

  // Sync status
  syncStatus: {
    type: String,
    enum: ['success', 'failed', 'in_progress'],
    default: 'success'
  },

  // Error message if sync failed
  syncError: {
    type: String,
    default: null
  },

  // API source information
  source: {
    type: String,
    default: 'Hyperliquid Public API'
  },

  // Version for data structure changes
  version: {
    type: String,
    default: '1.0.0'
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'hyperliquid_ecosystem'
});

// Indexes for faster queries
hyperliquidEcosystemSchema.index({ marketType: 1, lastSync: -1 });
hyperliquidEcosystemSchema.index({ 'markets.symbol': 1 });
hyperliquidEcosystemSchema.index({ 'markets.baseAsset': 1 });

// Static method to get latest markets by type
hyperliquidEcosystemSchema.statics.getLatestMarkets = async function(marketType) {
  return await this.findOne({ marketType })
    .sort({ lastSync: -1 })
    .lean()
    .exec();
};

// Static method to get all active markets
hyperliquidEcosystemSchema.statics.getAllActiveMarkets = async function() {
  const spotMarkets = await this.getLatestMarkets('spot');
  const perpMarkets = await this.getLatestMarkets('perp');

  return {
    spot: spotMarkets?.markets.filter(m => m.status === 'active') || [],
    perp: perpMarkets?.markets.filter(m => m.status === 'active') || [],
    spotCount: spotMarkets?.totalMarkets || 0,
    perpCount: perpMarkets?.totalMarkets || 0,
    lastSync: {
      spot: spotMarkets?.lastSync || null,
      perp: perpMarkets?.lastSync || null
    }
  };
};

// Static method to search markets by symbol
hyperliquidEcosystemSchema.statics.searchMarkets = async function(searchTerm, marketType = null) {
  const query = {};
  if (marketType) {
    query.marketType = marketType;
  }

  const results = await this.find(query)
    .sort({ lastSync: -1 })
    .lean()
    .exec();

  const allMarkets = results.flatMap(r =>
    r.markets.map(m => ({ ...m, marketType: r.marketType }))
  );

  const searchLower = searchTerm.toLowerCase();
  return allMarkets.filter(m =>
    m.symbol.toLowerCase().includes(searchLower) ||
    m.baseAsset.toLowerCase().includes(searchLower) ||
    m.quoteAsset.toLowerCase().includes(searchLower)
  );
};

// Instance method to check if data is stale (older than 1 hour)
hyperliquidEcosystemSchema.methods.isStale = function() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return this.lastSync < oneHourAgo;
};

// Pre-save hook to update totalMarkets
hyperliquidEcosystemSchema.pre('save', function(next) {
  if (this.markets && Array.isArray(this.markets)) {
    this.totalMarkets = this.markets.length;
  }
  next();
});

export default hyperliquidEcosystemSchema;
