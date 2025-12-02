/**
 * Standalone script to sync Hyperliquid markets
 * Run with: node scripts/sync-hyperliquid-markets.js
 */

import mongoose from 'mongoose';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crypto-app-V1';

// Schema definition (same as in server/models)
const hyperliquidEcosystemSchema = new mongoose.Schema({
  marketType: {
    type: String,
    enum: ['spot', 'perp'],
    required: true,
    index: true
  },
  markets: [{
    symbol: { type: String, required: true },
    baseAsset: { type: String, required: true },
    quoteAsset: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive', 'paused'], default: 'active' },
    pricePrecision: { type: Number, default: 8 },
    quantityPrecision: { type: Number, default: 8 },
    minOrderSize: { type: Number, default: 0 },
    maxOrderSize: { type: Number, default: 0 },
    tickSize: { type: Number, default: 0.01 },
    stepSize: { type: Number, default: 0.001 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  }],
  totalMarkets: { type: Number, default: 0 },
  lastSync: { type: Date, default: Date.now, index: true },
  syncStatus: { type: String, enum: ['success', 'failed', 'in_progress'], default: 'success' },
  syncError: { type: String, default: null },
  source: { type: String, default: 'Hyperliquid Public API' },
  version: { type: String, default: '1.0.0' }
}, {
  timestamps: true,
  collection: 'hyperliquid_ecosystem'
});

hyperliquidEcosystemSchema.pre('save', function(next) {
  if (this.markets && Array.isArray(this.markets)) {
    this.totalMarkets = this.markets.length;
  }
  next();
});

const HyperliquidEcosystem = mongoose.model('HyperliquidEcosystem', hyperliquidEcosystemSchema);

// Main sync function
async function syncMarkets() {
  console.log('🚀 Starting Hyperliquid Markets Sync...\n');

  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const results = {
      spot: { success: false, count: 0, error: null },
      perp: { success: false, count: 0, error: null }
    };

    // Sync SPOT markets
    console.log('📊 Fetching SPOT markets from Hyperliquid API...');
    try {
      const spotResponse = await fetch('https://api.hyperliquid.xyz/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'spotMeta' })
      });

      if (!spotResponse.ok) {
        throw new Error(`API error: ${spotResponse.status}`);
      }

      const spotData = await spotResponse.json();
      const spotMarkets = [];

      if (spotData && spotData.tokens && Array.isArray(spotData.tokens)) {
        for (const token of spotData.tokens) {
          spotMarkets.push({
            symbol: `${token.name}/USDC`,
            baseAsset: token.name,
            quoteAsset: 'USDC',
            status: 'active',
            pricePrecision: 8,
            quantityPrecision: 8,
            tickSize: 0.01,
            stepSize: 0.001,
            metadata: { tokenId: token.index, fullName: token.name, ...token }
          });
        }
      } else if (spotData && spotData.universe && Array.isArray(spotData.universe)) {
        for (const market of spotData.universe) {
          const [base, quote] = market.name ? market.name.split('/') : [market.coin || 'UNKNOWN', 'USDC'];
          spotMarkets.push({
            symbol: market.name || `${base}/${quote}`,
            baseAsset: base,
            quoteAsset: quote,
            status: 'active',
            pricePrecision: 8,
            quantityPrecision: 8,
            tickSize: parseFloat(market.szDecimals || 0.01),
            stepSize: 0.001,
            metadata: market
          });
        }
      }

      await HyperliquidEcosystem.findOneAndUpdate(
        { marketType: 'spot' },
        {
          marketType: 'spot',
          markets: spotMarkets,
          totalMarkets: spotMarkets.length,
          lastSync: new Date(),
          syncStatus: 'success',
          syncError: null
        },
        { upsert: true, new: true }
      );

      results.spot.success = true;
      results.spot.count = spotMarkets.length;
      console.log(`✅ SPOT markets synced: ${spotMarkets.length}\n`);

    } catch (error) {
      console.error('❌ Error syncing SPOT markets:', error.message);
      results.spot.error = error.message;
    }

    // Sync PERP markets
    console.log('📊 Fetching PERP markets from Hyperliquid API...');
    try {
      const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'meta' })
      });

      if (!perpResponse.ok) {
        throw new Error(`API error: ${perpResponse.status}`);
      }

      const perpData = await perpResponse.json();
      const perpMarkets = [];

      if (perpData && perpData.universe && Array.isArray(perpData.universe)) {
        for (const market of perpData.universe) {
          perpMarkets.push({
            symbol: `${market.name}-PERP`,
            baseAsset: market.name,
            quoteAsset: 'USD',
            status: 'active',
            pricePrecision: 8,
            quantityPrecision: 8,
            minOrderSize: parseFloat(market.minSize || 0),
            maxOrderSize: parseFloat(market.maxLeverage || 0),
            tickSize: parseFloat(market.szDecimals || 0.01),
            stepSize: 0.001,
            metadata: { maxLeverage: market.maxLeverage, onlyIsolated: market.onlyIsolated, ...market }
          });
        }
      }

      await HyperliquidEcosystem.findOneAndUpdate(
        { marketType: 'perp' },
        {
          marketType: 'perp',
          markets: perpMarkets,
          totalMarkets: perpMarkets.length,
          lastSync: new Date(),
          syncStatus: 'success',
          syncError: null
        },
        { upsert: true, new: true }
      );

      results.perp.success = true;
      results.perp.count = perpMarkets.length;
      console.log(`✅ PERP markets synced: ${perpMarkets.length}\n`);

    } catch (error) {
      console.error('❌ Error syncing PERP markets:', error.message);
      results.perp.error = error.message;
    }

    // Summary
    console.log('📈 SYNC SUMMARY:');
    console.log(`   SPOT: ${results.spot.success ? '✅' : '❌'} ${results.spot.count} markets`);
    console.log(`   PERP: ${results.perp.success ? '✅' : '❌'} ${results.perp.count} markets`);
    console.log(`   TOTAL: ${results.spot.count + results.perp.count} markets`);

    if (results.spot.error || results.perp.error) {
      console.log('\n⚠️ ERRORS:');
      if (results.spot.error) console.log(`   SPOT: ${results.spot.error}`);
      if (results.perp.error) console.log(`   PERP: ${results.perp.error}`);
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run sync
syncMarkets();
