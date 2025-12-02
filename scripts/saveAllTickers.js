import ccxt from 'ccxt';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crypto-app-V1';

// Trading pairs to track
const PAIRS_TO_TRACK = [
  { symbol: 'LCX/USDC', exchange: 'coinbaseadvanced' },
  { symbol: 'BTC/USDC', exchange: 'coinbaseadvanced' },
  { symbol: 'ETH/USDC', exchange: 'coinbaseadvanced' },
  { symbol: 'EGLD/USDC', exchange: 'coinbaseadvanced' },
  { symbol: 'SOL/USDC', exchange: 'coinbaseadvanced' },
  { symbol: 'DOT/USDC', exchange: 'coinbaseadvanced' },
  { symbol: 'AVAX/USDC', exchange: 'coinbaseadvanced' }
];

// Ticker Schema
const tickersAnalistSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  exchange: { type: String, required: true },
  pairPriceUSD: { type: Number, required: true },
  pairPriceBTC: { type: Number, required: true },
  pairPriceETH: { type: Number, required: true },
  btcPriceUSD: { type: Number, required: true },
  btcPriceETH: { type: Number, required: true },
  ethPriceUSD: { type: Number, required: true },
  ethPriceBTC: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, required: true }
}, {
  timestamps: true,
  collection: 'tickersAnalist'
});

tickersAnalistSchema.index({ symbol: 1, timestamp: -1 });
tickersAnalistSchema.index({ exchange: 1, timestamp: -1 });

const TickersAnalist = mongoose.model('TickersAnalist', tickersAnalistSchema);

// Initialize exchange
const coinbaseadvanced = new ccxt.coinbaseadvanced();

// Fetch all prices
async function fetchAllPrices() {
  try {
    console.log(`\n[${new Date().toLocaleTimeString()}] Fetching prices...`);

    // Fetch BTC and ETH first (needed for all conversions)
    const btcTicker = await coinbaseadvanced.fetchTicker('BTC/USDC');
    const ethTicker = await coinbaseadvanced.fetchTicker('ETH/USDC');

    const btcPriceUSD = parseFloat(btcTicker.last);
    const ethPriceUSD = parseFloat(ethTicker.last);

    console.log(`  BTC: $${btcPriceUSD.toFixed(2)}`);
    console.log(`  ETH: $${ethPriceUSD.toFixed(2)}`);

    // Fetch and save each pair
    const savePromises = PAIRS_TO_TRACK.map(async (pairConfig) => {
      try {
        const ticker = await coinbaseadvanced.fetchTicker(pairConfig.symbol);
        const pairPriceUSD = parseFloat(ticker.last);

        const tickerData = new TickersAnalist({
          symbol: pairConfig.symbol,
          exchange: pairConfig.exchange,
          pairPriceUSD: pairPriceUSD,
          pairPriceBTC: pairPriceUSD / btcPriceUSD,
          pairPriceETH: pairPriceUSD / ethPriceUSD,
          btcPriceUSD: btcPriceUSD,
          btcPriceETH: btcPriceUSD / ethPriceUSD,
          ethPriceUSD: ethPriceUSD,
          ethPriceBTC: ethPriceUSD / btcPriceUSD,
          timestamp: new Date()
        });

        await tickerData.save();
        // console.log(`  ✓ Saved ${pairConfig.symbol}: $${pairPriceUSD.toFixed(6)}`);
      } catch (error) {
        console.error(`  ✗ Error saving ${pairConfig.symbol}:`, error.message);
      }
    });

    await Promise.all(savePromises);
    console.log(`[${new Date().toLocaleTimeString()}] All prices saved successfully!`);

  } catch (error) {
    console.error('Error in fetchAllPrices:', error);
  }
}

// Main function
async function main() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    console.log('🚀 Starting Ticker Saver Script');
    console.log(`📊 Tracking ${PAIRS_TO_TRACK.length} pairs`);
    console.log(`⏱️  Saving every 10 second\n`);

    // Initial fetch
    await fetchAllPrices();

    // Set interval to fetch every second
    setInterval(fetchAllPrices, 10000);

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✓ MongoDB connection closed');
  process.exit(0);
});

// Start the script
main();
