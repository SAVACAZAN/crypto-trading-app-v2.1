# 📊 Ticker Saver Script - Documentation

## Overview
The `saveAllTickers.js` script automatically fetches and saves price data for multiple cryptocurrency pairs every second to MongoDB.

## Tracked Pairs
- **LCX/USDT** (Binance)
- **BTC/USDT** (Binance)
- **ETH/USDT** (Binance)
- **EGLD/USDT** (Binance)
- **SOL/USDT** (Binance)
- **DOT/USDT** (Binance)
- **AVAX/USDT** (Binance)

## Installation

1. Make sure MongoDB is running locally or update `.env` with your connection string
2. Install dependencies (already done in main project)

## Running the Script

### Option 1: Using Node.js directly
```bash
node scripts/saveAllTickers.js
```

### Option 2: Add npm script to package.json
Add this line to your `package.json` scripts section:
```json
"save-tickers": "node scripts/saveAllTickers.js"
```

Then run:
```bash
npm run save-tickers
```

### Option 3: Run in background (Windows PowerShell)
```powershell
Start-Process node -ArgumentList "scripts/saveAllTickers.js" -NoNewWindow
```

### Option 4: Run in background (Linux/Mac)
```bash
node scripts/saveAllTickers.js &
```

## How It Works

1. **Connects to MongoDB** using the connection string from `.env`
2. **Fetches BTC and ETH prices** first (needed for all conversions)
3. **Fetches each tracked pair** from Binance
4. **Calculates conversions**:
   - Pair price in USD
   - Pair price in BTC
   - Pair price in ETH
5. **Saves to database** with timestamp
6. **Repeats every 1 second**

## Database Schema

Each entry contains:
```javascript
{
  symbol: "LCX/USDT",
  exchange: "binance",
  pairPriceUSD: 0.1119,
  pairPriceBTC: 0.0000010234,
  pairPriceETH: 0.0000288114,
  btcPriceUSD: 109305.00,
  btcPriceETH: 28.16,
  ethPriceUSD: 3882.00,
  ethPriceBTC: 0.03550,
  timestamp: "2025-10-23T10:30:45.123Z"
}
```

## Console Output

The script logs:
- ✓ Connected to MongoDB
- BTC and ETH prices
- ✓ Saved status for each pair
- Timestamp for each save cycle

Example:
```
✓ Connected to MongoDB

🚀 Starting Ticker Saver Script
📊 Tracking 7 pairs
⏱️  Saving every 1 second

[10:30:45] Fetching prices...
  BTC: $109,305.00
  ETH: $3,882.00
  ✓ Saved LCX/USDT: $0.111900
  ✓ Saved BTC/USDT: $109305.000000
  ✓ Saved ETH/USDT: $3882.000000
  ✓ Saved EGLD/USDT: $45.230000
  ✓ Saved SOL/USDT: $180.450000
  ✓ Saved DOT/USDT: $6.780000
  ✓ Saved AVAX/USDT: $28.900000
[10:30:45] All prices saved successfully!
```

## Stopping the Script

Press `Ctrl + C` to gracefully shut down. The script will:
1. Close MongoDB connection
2. Exit cleanly

## Integration with tickersAnalist Page

The `tickersAnalist.vue` page automatically reads from this data:
- Fetches historical data for selected pair
- Displays price charts
- Shows delta changes (1s, 1m, 1h, 1d)
- Calculates correlations

## Troubleshooting

### Error: "Cannot connect to MongoDB"
- Check if MongoDB is running: `mongod` or `mongo --version`
- Verify `.env` MONGODB_URI is correct

### Error: "Rate limit exceeded"
- Binance has rate limits (1200 requests/minute)
- Script uses 7 pairs × 1 request/second = 420 req/min (safe)

### High CPU usage
- Normal! Script runs continuously every second
- Consider increasing interval to 2-3 seconds if needed

## Configuration

To change tracked pairs, edit `PAIRS_TO_TRACK` array in the script:

```javascript
const PAIRS_TO_TRACK = [
  { symbol: 'LCX/USDT', exchange: 'binance' },
  { symbol: 'YOUR_COIN/USDT', exchange: 'binance' }
];
```

## Performance

- **Data stored per hour**: ~25,200 documents (7 pairs × 3600 seconds)
- **Data stored per day**: ~604,800 documents
- **MongoDB size estimate**: ~50-100MB per day

Consider implementing data retention policies:
```javascript
// Delete data older than 7 days
db.tickersAnalist.deleteMany({ timestamp: { $lt: new Date(Date.now() - 7*24*60*60*1000) } });
```

## Notes

- Script runs indefinitely until stopped
- All prices from Binance (most liquid exchange)
- Timestamps are in UTC
- Data indexed by symbol + timestamp for fast queries
