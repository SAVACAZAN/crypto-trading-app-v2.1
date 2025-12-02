# 🔑 StocksMarkets API Setup Guide

Complete guide for setting up FREE API integrations for the StocksMarkets module.

## 📋 Table of Contents

1. [Required API Keys](#required-api-keys)
2. [FRED API Setup](#fred-api-setup)
3. [AlphaVantage API Setup](#alphavantage-api-setup)
4. [Environment Variables Configuration](#environment-variables-configuration)
5. [API Endpoints Usage](#api-endpoints-usage)
6. [Rate Limits & Best Practices](#rate-limits--best-practices)
7. [Testing the APIs](#testing-the-apis)
8. [Troubleshooting](#troubleshooting)

---

## 🔑 Required API Keys

Both APIs are **100% FREE** with generous limits:

| API | Cost | Rate Limits | Best For |
|-----|------|-------------|----------|
| **FRED** | Free | **NO LIMITS** | Economic data (rates, CPI, unemployment, GDP) |
| **AlphaVantage** | Free | 5 calls/min, 500 calls/day | Stock prices, VIX, technical indicators |

---

## 📊 FRED API Setup

### What is FRED?

**Federal Reserve Economic Data (FRED)** - Official U.S. economic data from the Federal Reserve Bank of St. Louis.

### Step 1: Get Your FREE API Key

1. Visit: **https://research.stlouisfed.org/useraccount/register**
2. Create a free account (email + password)
3. After login, go to: **https://research.stlouisfed.org/docs/api/api_key.html**
4. Click **"Request API Key"**
5. Fill in basic info (name, organization - can be "Personal Project")
6. Your API key will be displayed immediately

**Example key format:** `abcdef1234567890abcdef1234567890`

### Step 2: Test Your FRED API Key

```bash
# Test in terminal (replace YOUR_API_KEY)
curl "https://api.stlouisfed.org/fred/series/observations?series_id=DFF&api_key=YOUR_API_KEY&file_type=json&limit=1"
```

**Expected response:**
```json
{
  "observations": [
    {
      "date": "2025-01-13",
      "value": "4.58"
    }
  ]
}
```

### Available FRED Data Series

| Series ID | Name | Update Frequency | Bot Use Case |
|-----------|------|------------------|--------------|
| **DFF** | Federal Funds Rate | Daily | Interest rate changes affect crypto prices |
| **T10Y2Y** | 10Y-2Y Treasury Spread | Daily | Recession indicator (negative = warning) |
| **CPIAUCSL** | Consumer Price Index | Monthly | Inflation → crypto as hedge |
| **UNRATE** | Unemployment Rate | Monthly | Economic health indicator |
| **VIXCLS** | VIX Index | Daily | Market fear/volatility gauge |
| **M2SL** | M2 Money Supply | Monthly | Liquidity indicator |
| **GOLDAMGBD228NLBM** | Gold Price | Daily | Safe haven correlation with BTC |
| **DCOILWTICO** | WTI Oil Price | Daily | Inflation/energy costs |
| **GDP** | Gross Domestic Product | Quarterly | Overall economy health |
| **PAYEMS** | Non-Farm Payrolls | Monthly | Employment data (market mover) |

---

## 📈 AlphaVantage API Setup

### What is AlphaVantage?

**AlphaVantage** - Real-time and historical stock market data with technical indicators.

### Step 1: Get Your FREE API Key

1. Visit: **https://www.alphavantage.co/support/#api-key**
2. Enter your email address
3. Click **"GET FREE API KEY"**
4. Check your email - API key will be sent instantly
5. No account creation needed!

**Example key format:** `ABC123XYZ456DEF789`

### Step 2: Test Your AlphaVantage API Key

```bash
# Test in terminal (replace YOUR_API_KEY)
curl "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPY&apikey=YOUR_API_KEY"
```

**Expected response:**
```json
{
  "Global Quote": {
    "01. symbol": "SPY",
    "05. price": "467.89",
    "09. change": "2.34",
    "10. change percent": "0.50%"
  }
}
```

### Available AlphaVantage Functions

| Function | Description | Bot Use Case |
|----------|-------------|--------------|
| **GLOBAL_QUOTE** | Real-time stock quote | Current S&P500/NASDAQ prices |
| **TIME_SERIES_INTRADAY** | Intraday prices (1min-60min) | Pre-market volatility detection |
| **TIME_SERIES_DAILY** | Daily OHLCV data | Trend analysis |
| **OVERVIEW** | Company fundamentals | Sector analysis (P/E, market cap) |
| **Technical Indicators** | RSI, MACD, SMA, EMA, BBANDS | Overbought/oversold signals |

**Key Stock Symbols:**
- `SPY` - S&P 500 ETF
- `QQQ` - NASDAQ 100 ETF
- `DIA` - Dow Jones ETF
- `VIX` - Volatility Index
- `AAPL`, `MSFT`, `NVDA`, `TSLA` - Individual stocks

---

## ⚙️ Environment Variables Configuration

### Step 1: Locate Your .env File

```bash
cd "crypto-app-github v2.2 - updated COINBASE"
```

If `.env` file doesn't exist, create it:

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

### Step 2: Add API Keys to .env

Open `.env` file and add these lines at the bottom:

```bash
# ========================================
# STOCKS MARKETS API KEYS (FREE)
# ========================================

# FRED API - Federal Reserve Economic Data
# Get free key: https://research.stlouisfed.org/docs/api/api_key.html
FRED_API_KEY=your_fred_api_key_here

# AlphaVantage API - Stock Market Data
# Get free key: https://www.alphavantage.co/support/#api-key
ALPHA_VANTAGE_API_KEY=your_alphavantage_api_key_here
```

### Step 3: Replace Placeholder Values

**Example:**
```bash
# Before
FRED_API_KEY=your_fred_api_key_here
ALPHA_VANTAGE_API_KEY=your_alphavantage_api_key_here

# After (with your real keys)
FRED_API_KEY=abcdef1234567890abcdef1234567890
ALPHA_VANTAGE_API_KEY=ABC123XYZ456DEF789
```

### Step 4: Restart Your Application

```bash
# Stop the dev server (Ctrl+C)
# Then restart
npm run dev
```

**IMPORTANT:** Never commit your `.env` file to git! Make sure it's in `.gitignore`.

---

## 🚀 API Endpoints Usage

### 1. Fetch FRED Economic Data

**Endpoint:** `GET /api/v1/StocksMarkets/fetchFredData`

**Parameters:**
- `series_id` (required) - FRED series identifier (e.g., "DFF", "VIXCLS", "CPIAUCSL")
- `limit` (optional, default: 100) - Number of data points to fetch
- `sort_order` (optional, default: "desc") - Sort order ("asc" or "desc")

**Example Requests:**

```javascript
// Fetch Federal Funds Rate (last 30 days)
const response = await fetch('/api/v1/StocksMarkets/fetchFredData?series_id=DFF&limit=30')
const data = await response.json()

console.log(data.stats.latest)        // Current rate: 4.58%
console.log(data.stats.change)        // Change from previous: -0.08
console.log(data.stats.changePercent) // Change %: -1.71%

// Fetch VIX from FRED
const vixResponse = await fetch('/api/v1/StocksMarkets/fetchFredData?series_id=VIXCLS&limit=100')
const vixData = await vixResponse.json()

// Fetch CPI (inflation)
const cpiResponse = await fetch('/api/v1/StocksMarkets/fetchFredData?series_id=CPIAUCSL&limit=12')
const cpiData = await cpiResponse.json()
```

**Response Example:**
```json
{
  "success": true,
  "series_id": "DFF",
  "metadata": {
    "name": "Federal Funds Effective Rate",
    "unit": "Percent",
    "frequency": "Daily",
    "category": "Interest Rates"
  },
  "stats": {
    "latest": 4.58,
    "previous": 4.66,
    "change": -0.08,
    "changePercent": -1.72,
    "latestDate": "2025-01-13",
    "min": 4.33,
    "max": 5.50,
    "avg": 4.89
  },
  "data": [
    {
      "date": "2025-01-13",
      "value": 4.58,
      "timestamp": 1705104000000
    }
  ],
  "count": 30,
  "fetchedAt": "2025-01-14T10:30:00.000Z"
}
```

### 2. Fetch AlphaVantage Stock Data

**Endpoint:** `GET /api/v1/StocksMarkets/fetchAlphaVantageStock`

**Parameters:**
- `symbol` (optional, default: "SPY") - Stock ticker symbol
- `function` (optional, default: "GLOBAL_QUOTE") - API function type
- `interval` (optional, default: "5min") - For intraday: "1min", "5min", "15min", "30min", "60min"
- `outputsize` (optional, default: "compact") - "compact" (100 points) or "full" (20+ years)

**Example Requests:**

```javascript
// Get real-time S&P 500 quote
const spy = await fetch('/api/v1/StocksMarkets/fetchAlphaVantageStock?symbol=SPY&function=GLOBAL_QUOTE')
const spyData = await spy.json()

console.log(spyData.data.price)         // Current price: 467.89
console.log(spyData.data.changePercent) // Change: +0.50%

// Get NASDAQ (QQQ) intraday data (5-minute intervals)
const nasdaq = await fetch('/api/v1/StocksMarkets/fetchAlphaVantageStock?symbol=QQQ&function=TIME_SERIES_INTRADAY&interval=5min')
const nasdaqData = await nasdaq.json()

// Get VIX from AlphaVantage
const vix = await fetch('/api/v1/StocksMarkets/fetchAlphaVantageStock?symbol=VIX&function=GLOBAL_QUOTE')
const vixData = await vix.json()

// Get company fundamentals (Apple)
const aapl = await fetch('/api/v1/StocksMarkets/fetchAlphaVantageStock?symbol=AAPL&function=OVERVIEW')
const aaplData = await aapl.json()
console.log(aaplData.data.fundamentals.peRatio) // P/E Ratio
console.log(aaplData.data.marketCap)            // Market Cap
```

**Response Example (GLOBAL_QUOTE):**
```json
{
  "success": true,
  "symbol": "SPY",
  "function": "GLOBAL_QUOTE",
  "data": {
    "symbol": "SPY",
    "price": 467.89,
    "open": 465.23,
    "high": 468.45,
    "low": 464.87,
    "volume": 45123456,
    "latestTradingDay": "2025-01-13",
    "previousClose": 465.55,
    "change": 2.34,
    "changePercent": 0.50,
    "timestamp": 1705104000000
  },
  "fetchedAt": "2025-01-14T10:30:00.000Z"
}
```

### 3. Fetch VIX with Bot Recommendations

**Endpoint:** `GET /api/v1/StocksMarkets/fetchVIX`

**Parameters:**
- `source` (optional, default: "both") - Data source: "fred", "alphavantage", or "both"
- `limit` (optional, default: 30) - Number of historical points (FRED only)

**Example Request:**

```javascript
const vixResponse = await fetch('/api/v1/StocksMarkets/fetchVIX?source=both&limit=30')
const vixData = await vixResponse.json()

console.log(vixData.vix.current)                    // Current VIX: 14.32
console.log(vixData.recommendations.riskLevel)      // Risk level: LOW-MEDIUM
console.log(vixData.recommendations.botActions)     // Array of bot actions
console.log(vixData.recommendations.gridBotSettings) // Recommended grid settings
```

**Response Example:**
```json
{
  "success": true,
  "vix": {
    "current": 14.32,
    "source": "AlphaVantage (Real-time)",
    "asOf": "2025-01-13"
  },
  "recommendations": {
    "vix": 14.32,
    "level": "LOW",
    "marketCondition": "Low Volatility / Calm",
    "riskLevel": "LOW-MEDIUM",
    "explanation": "Low volatility - Calm market conditions. Safe for normal bot operation.",
    "botActions": [
      "Normal bot operation",
      "Standard grid parameters",
      "Full position sizes acceptable",
      "Monitor for trend changes"
    ],
    "gridBotSettings": {
      "gridSpacing": "STANDARD (1-2%)",
      "positionSize": "FULL",
      "stopLoss": "STANDARD (-5%)",
      "takeProfit": "STANDARD (+3%)"
    }
  },
  "statistics": {
    "min": 12.45,
    "max": 23.78,
    "avg": 16.23,
    "median": 15.67,
    "percentiles": {
      "p25": 13.89,
      "p50": 15.67,
      "p75": 18.34,
      "p90": 21.12
    }
  }
}
```

---

## ⚡ Rate Limits & Best Practices

### FRED API

✅ **NO rate limits!** - Unlimited free calls
✅ **Best practices:**
- Cache data locally (economic data updates daily/monthly, not real-time)
- Update Federal Funds Rate once per day
- Update CPI once per month (released ~15th of each month)
- Update VIX every 5-15 minutes during market hours

### AlphaVantage API (FREE tier)

⚠️ **Rate Limits:**
- **5 API calls per minute**
- **500 API calls per day**

✅ **Best practices:**
1. **Cache aggressively** - Store data in MongoDB or Redis
2. **Batch requests** - Wait 12 seconds between calls (5 calls/min = 1 call/12sec)
3. **Priority order:**
   - VIX (most important) - Every 5 minutes during market hours
   - SPY (S&P 500) - Every 15 minutes
   - QQQ (NASDAQ) - Every 15 minutes
   - Individual stocks - Every 30-60 minutes

4. **Error handling:**
```javascript
const response = await fetch('/api/v1/StocksMarkets/fetchAlphaVantageStock?symbol=SPY')
const data = await response.json()

if (!data.success && data.error === 'Rate limit exceeded') {
  console.log('Rate limit hit - waiting 60 seconds')
  // Use cached data or wait
}
```

5. **Premium upgrade** (if needed later):
   - 75 calls/min: $49.99/month
   - 600 calls/min: $149.99/month
   - 1200 calls/min: $249.99/month

---

## 🧪 Testing the APIs

### Test Script (Vue Component)

Create a test component to verify API integration:

```vue
<template>
  <div style="padding: 20px;">
    <h2>API Test Dashboard</h2>

    <!-- Test FRED API -->
    <div style="margin-bottom: 30px;">
      <h3>FRED API Test</h3>
      <button @click="testFRED">Test FRED (Federal Funds Rate)</button>
      <pre v-if="fredResult">{{ fredResult }}</pre>
    </div>

    <!-- Test AlphaVantage API -->
    <div style="margin-bottom: 30px;">
      <h3>AlphaVantage API Test</h3>
      <button @click="testAlphaVantage">Test AlphaVantage (SPY)</button>
      <pre v-if="alphaResult">{{ alphaResult }}</pre>
    </div>

    <!-- Test VIX Endpoint -->
    <div style="margin-bottom: 30px;">
      <h3>VIX Endpoint Test</h3>
      <button @click="testVIX">Test VIX (Combined)</button>
      <pre v-if="vixResult">{{ vixResult }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const fredResult = ref(null)
const alphaResult = ref(null)
const vixResult = ref(null)

const testFRED = async () => {
  try {
    const response = await fetch('/api/v1/StocksMarkets/fetchFredData?series_id=DFF&limit=10')
    fredResult.value = await response.json()
  } catch (error) {
    fredResult.value = { error: error.message }
  }
}

const testAlphaVantage = async () => {
  try {
    const response = await fetch('/api/v1/StocksMarkets/fetchAlphaVantageStock?symbol=SPY&function=GLOBAL_QUOTE')
    alphaResult.value = await response.json()
  } catch (error) {
    alphaResult.value = { error: error.message }
  }
}

const testVIX = async () => {
  try {
    const response = await fetch('/api/v1/StocksMarkets/fetchVIX?source=both&limit=30')
    vixResult.value = await response.json()
  } catch (error) {
    vixResult.value = { error: error.message }
  }
}
</script>
```

### Manual Testing (Browser Console)

Open browser console (F12) on any page and run:

```javascript
// Test FRED
fetch('/api/v1/StocksMarkets/fetchFredData?series_id=DFF&limit=5')
  .then(r => r.json())
  .then(d => console.log('FRED:', d))

// Test AlphaVantage
fetch('/api/v1/StocksMarkets/fetchAlphaVantageStock?symbol=SPY&function=GLOBAL_QUOTE')
  .then(r => r.json())
  .then(d => console.log('AlphaVantage:', d))

// Test VIX
fetch('/api/v1/StocksMarkets/fetchVIX?source=both')
  .then(r => r.json())
  .then(d => console.log('VIX:', d))
```

---

## 🔧 Troubleshooting

### Issue 1: "FRED_API_KEY not configured"

**Solution:**
1. Check `.env` file exists in project root
2. Verify key is on correct line: `FRED_API_KEY=your_key_here`
3. No spaces around `=` sign
4. Restart dev server: `npm run dev`

### Issue 2: "ALPHA_VANTAGE_API_KEY not configured"

**Solution:**
- Same as FRED issue above
- Variable name: `ALPHA_VANTAGE_API_KEY=your_key_here`

### Issue 3: AlphaVantage "Rate limit exceeded"

**Response:**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Our standard API call frequency is 5 calls per minute...",
  "rateLimits": {
    "free": "5 calls/minute, 500 calls/day"
  }
}
```

**Solution:**
- Wait 1 minute before next request
- Implement caching (store data in MongoDB)
- Reduce polling frequency
- Consider premium plan if needed

### Issue 4: FRED "Invalid API key"

**Solution:**
1. Verify API key is correct (32-character alphanumeric)
2. Check if you copied the full key (no truncation)
3. Request new API key at: https://research.stlouisfed.org/docs/api/api_key.html

### Issue 5: AlphaVantage returns empty data

**Possible causes:**
- Stock market is closed (try SPY, it should always have data)
- Invalid symbol (check ticker exists)
- Symbol requires exchange prefix (e.g., "TSE:AAPL" for Toronto)

**Solution:**
```javascript
// Always test with SPY first (most reliable)
fetch('/api/v1/StocksMarkets/fetchAlphaVantageStock?symbol=SPY&function=GLOBAL_QUOTE')
```

### Issue 6: CORS errors

**Solution:**
- APIs are called from server-side (`server/api/` folder)
- Browser CORS restrictions don't apply
- If you see CORS errors, you're calling the external API directly from frontend (wrong!)
- Always use your `/api/v1/StocksMarkets/*` endpoints

---

## 📚 Additional Resources

### Official Documentation

- **FRED API Docs:** https://fred.stlouisfed.org/docs/api/fred/
- **AlphaVantage Docs:** https://www.alphavantage.co/documentation/
- **FRED Series Search:** https://fred.stlouisfed.org/
- **Stock Ticker Lookup:** https://www.marketwatch.com/tools/quotes/lookup.asp

### Useful FRED Series Finder

```javascript
// Common FRED series by category
const fredSeries = {
  interestRates: ['DFF', 'T10Y2Y', 'DGS10', 'DGS2', 'DGS30'],
  inflation: ['CPIAUCSL', 'PCEPI', 'CPILFESL'],
  employment: ['UNRATE', 'PAYEMS', 'ICSA'],
  gdp: ['GDP', 'GDPC1', 'A191RL1Q225SBEA'],
  moneySupply: ['M2SL', 'M1SL'],
  commodities: ['GOLDAMGBD228NLBM', 'DCOILWTICO', 'DCOILBRENTEU'],
  housing: ['CSUSHPINSA', 'HOUST', 'MORTGAGE30US'],
  market: ['VIXCLS', 'SP500', 'NASDAQCOM', 'DEXUSEU']
}
```

---

## ✅ Quick Start Checklist

- [ ] Register for FRED API key at https://research.stlouisfed.org/useraccount/register
- [ ] Get AlphaVantage API key at https://www.alphavantage.co/support/#api-key
- [ ] Add both keys to `.env` file
- [ ] Restart dev server (`npm run dev`)
- [ ] Test FRED endpoint: `/api/v1/StocksMarkets/fetchFredData?series_id=DFF&limit=5`
- [ ] Test AlphaVantage endpoint: `/api/v1/StocksMarkets/fetchAlphaVantageStock?symbol=SPY`
- [ ] Test VIX endpoint: `/api/v1/StocksMarkets/fetchVIX`
- [ ] Implement caching for AlphaVantage (500 calls/day limit)
- [ ] Set up polling intervals (VIX: 5min, Stocks: 15min, FRED: daily)

---

**Need help?** Check the troubleshooting section or review the endpoint code in:
- `server/api/v1/StocksMarkets/fetchFredData.get.js`
- `server/api/v1/StocksMarkets/fetchAlphaVantageStock.get.js`
- `server/api/v1/StocksMarkets/fetchVIX.get.js`
