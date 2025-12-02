# ⚡ StocksMarkets Quick Start Guide

Get up and running with FREE stock market data in **5 minutes**.

---

## 🎯 3-Step Setup

### Step 1: Get FREE API Keys (2 minutes)

**FRED API (unlimited calls):**
1. Go to: https://research.stlouisfed.org/useraccount/register
2. Register → Login → Request API Key
3. Copy your key (32 characters)

**AlphaVantage API (500 calls/day):**
1. Go to: https://www.alphavantage.co/support/#api-key
2. Enter email → Get FREE API Key
3. Check email for your key

### Step 2: Add to .env File (1 minute)

Open `.env` file in project root:

```bash
# Add these lines at the bottom
FRED_API_KEY=paste_your_fred_key_here
ALPHA_VANTAGE_API_KEY=paste_your_alphavantage_key_here
```

**Example:**
```bash
FRED_API_KEY=abcdef1234567890abcdef1234567890
ALPHA_VANTAGE_API_KEY=ABC123XYZ456DEF789
```

### Step 3: Restart Server (30 seconds)

```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## ✅ Test Your Setup (2 minutes)

Open browser console (F12) on any page and run:

```javascript
// Test 1: FRED API (Federal Funds Rate)
fetch('/api/v1/StocksMarkets/fetchFredData?series_id=DFF&limit=5')
  .then(r => r.json())
  .then(d => console.log('✅ FRED:', d))

// Test 2: AlphaVantage API (S&P 500)
fetch('/api/v1/StocksMarkets/fetchAlphaVantageStock?symbol=SPY&function=GLOBAL_QUOTE')
  .then(r => r.json())
  .then(d => console.log('✅ AlphaVantage:', d))

// Test 3: VIX with bot recommendations
fetch('/api/v1/StocksMarkets/fetchVIX?source=both')
  .then(r => r.json())
  .then(d => console.log('✅ VIX:', d))
```

**Expected output:** You should see `success: true` in all responses.

**If you see errors:** Check [API_SETUP.md](./API_SETUP.md) troubleshooting section.

---

## 🚀 Top 5 Use Cases

### 1. VIX Bot Auto-Adjustment

**Fetch VIX every 5 minutes, auto-adjust bot parameters:**

```javascript
const fetchVIX = async () => {
  const res = await fetch('/api/v1/StocksMarkets/fetchVIX')
  const data = await res.json()

  if (data.success) {
    const vix = data.vix.current
    const settings = data.recommendations.gridBotSettings

    console.log(`VIX: ${vix}`)
    console.log(`Grid Spacing: ${settings.gridSpacing}`)
    console.log(`Position Size: ${settings.positionSize}`)

    // Apply to your bot
    if (data.recommendations.riskLevel === 'HIGH' || data.recommendations.riskLevel === 'CRITICAL') {
      console.warn('⚠️ HIGH VOLATILITY - Reducing bot exposure')
      // Pause aggressive bots, reduce position sizes
    }
  }
}

// Run every 5 minutes during market hours
setInterval(fetchVIX, 5 * 60 * 1000)
```

### 2. Federal Funds Rate Monitor

**Track Fed rate changes (updates daily at ~10:15 ET):**

```javascript
const checkFedRate = async () => {
  const res = await fetch('/api/v1/StocksMarkets/fetchFredData?series_id=DFF&limit=5')
  const data = await res.json()

  if (data.success) {
    const rate = data.stats.latest
    const change = data.stats.change

    console.log(`Fed Funds Rate: ${rate}%`)
    console.log(`Change: ${change > 0 ? '+' : ''}${change}%`)

    // Alert on major changes
    if (Math.abs(change) >= 0.25) {
      console.warn(`🚨 MAJOR FED RATE CHANGE: ${change}%`)
      // Adjust bot strategy
    }
  }
}

// Check once per day
checkFedRate()
```

### 3. Stock Market Sentiment

**Get overall market direction (bullish/bearish):**

```javascript
const checkMarketSentiment = async () => {
  // Fetch SPY and QQQ (takes ~13 seconds due to rate limits)
  const res = await fetch('/api/v1/StocksMarkets/fetchMarketIndices?indices=sp500,nasdaq')
  const data = await res.json()

  if (data.success) {
    console.log(`Market Sentiment: ${data.summary.sentiment}`)
    console.log(data.summary.sentimentDescription)
    console.log(`Avg Change: ${data.summary.averageChangePercent}%`)

    // Bot recommendations
    console.log('Bot Actions:')
    data.summary.botRecommendations.actions.forEach(action => {
      console.log(`- ${action}`)
    })

    // Crypto correlation note
    console.log(data.summary.botRecommendations.correlationNote)
  }
}

// Check every 15 minutes during market hours (09:30-16:00 ET)
setInterval(checkMarketSentiment, 15 * 60 * 1000)
```

### 4. CPI Inflation Tracker

**Monitor inflation (released monthly ~15th):**

```javascript
const checkInflation = async () => {
  // Fetch last 13 months of CPI (for YoY calculation)
  const res = await fetch('/api/v1/StocksMarkets/fetchFredData?series_id=CPIAUCSL&limit=13')
  const data = await res.json()

  if (data.success) {
    const currentCPI = data.data[0].value
    const yearAgoCPI = data.data[12].value
    const inflationYoY = ((currentCPI - yearAgoCPI) / yearAgoCPI) * 100

    console.log(`CPI (YoY): ${inflationYoY.toFixed(2)}%`)

    if (inflationYoY > 5.0) {
      console.log('📈 HIGH INFLATION - Crypto as inflation hedge narrative')
    } else if (inflationYoY < 2.0) {
      console.log('📉 LOW INFLATION - Fed may cut rates (bullish crypto)')
    } else {
      console.log('✅ TARGET RANGE - Normal conditions')
    }
  }
}

// Check once per month (after CPI release)
checkInflation()
```

### 5. Recession Warning (Yield Curve)

**Detect recession signals (negative yield curve):**

```javascript
const checkRecessionSignal = async () => {
  // Fetch 10Y-2Y Treasury spread
  const res = await fetch('/api/v1/StocksMarkets/fetchFredData?series_id=T10Y2Y&limit=30')
  const data = await res.json()

  if (data.success) {
    const spread = data.stats.latest
    const daysInverted = data.data.filter(d => d.value < 0).length

    console.log(`10Y-2Y Spread: ${spread.toFixed(2)}%`)

    if (spread < 0) {
      console.warn(`⚠️ INVERTED YIELD CURVE (${daysInverted} days inverted)`)
      console.warn('Recession signal - Reduce crypto exposure')
    } else if (spread < 0.5) {
      console.log('⚠️ FLATTENING YIELD CURVE - Watch for inversion')
    } else {
      console.log('✅ HEALTHY YIELD CURVE - Normal economy')
    }
  }
}

// Check daily
checkRecessionSignal()
```

---

## 📊 Most Important Endpoints

### 1. VIX (Volatility Index)
```
GET /api/v1/StocksMarkets/fetchVIX?source=both&limit=30
```
**Returns:** VIX level + bot recommendations + risk level
**Update:** Every 5 minutes during market hours

### 2. Federal Funds Rate
```
GET /api/v1/StocksMarkets/fetchFredData?series_id=DFF&limit=10
```
**Returns:** Current Fed rate + historical data
**Update:** Once per day (updates at ~10:15 ET)

### 3. S&P 500 & NASDAQ
```
GET /api/v1/StocksMarkets/fetchMarketIndices?indices=sp500,nasdaq
```
**Returns:** Stock prices + market sentiment + bot recommendations
**Update:** Every 15 minutes during market hours

### 4. CPI (Inflation)
```
GET /api/v1/StocksMarkets/fetchFredData?series_id=CPIAUCSL&limit=13
```
**Returns:** CPI data (monthly)
**Update:** Once per month after release (~15th)

### 5. Unemployment Rate
```
GET /api/v1/StocksMarkets/fetchFredData?series_id=UNRATE&limit=12
```
**Returns:** Unemployment % (monthly)
**Update:** Once per month after NFP Friday (1st Friday)

---

## 🤖 Bot Integration Checklist

- [ ] Fetch VIX every 5 minutes → Adjust grid spacing based on volatility
- [ ] Check Fed rate daily → Watch for rate changes (0.25%+ = major)
- [ ] Monitor stock market sentiment every 15 min → Crypto follows stocks
- [ ] Track CPI monthly → High inflation = crypto hedge narrative
- [ ] Pause bots during major releases:
  - [ ] NFP Friday (1st Fri @ 08:30 ET) - PAUSE 08:15-09:00 ET
  - [ ] CPI Release (~15th @ 08:30 ET) - PAUSE 08:15-09:00 ET
  - [ ] FOMC Meetings (8x/year @ 14:00 ET) - PAUSE 13:45-15:00 ET

---

## 📅 Economic Calendar (Pause Bot Times)

### Weekly
- **Thursday 08:30 ET:** Jobless Claims (ICSA) - Minor volatility

### Monthly
- **1st Friday 08:30 ET:** Non-Farm Payrolls (NFP) - **PAUSE BOTS 08:15-09:00 ET**
- **~15th 08:30 ET:** CPI Release - **PAUSE BOTS 08:15-09:00 ET**
- **~Last Week 08:30 ET:** PCE Release - **PAUSE BOTS 08:15-09:00 ET**

### 8x Per Year (FOMC Meetings)
- **14:00 ET:** Fed Rate Decision - **PAUSE BOTS 13:45-15:00 ET**
- **14:30 ET:** Jerome Powell Press Conference - **PAUSE BOTS until end**

**2024 FOMC Dates:** Jan 31, Mar 20, May 1, Jun 12, Jul 31, Sep 18, Nov 7, Dec 18

---

## 💡 Pro Tips

### Caching to Save API Calls

AlphaVantage has a 500 calls/day limit. Cache aggressively:

```javascript
// Example: Simple in-memory cache
const cache = {}
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

const fetchWithCache = async (url) => {
  const now = Date.now()

  // Check cache
  if (cache[url] && (now - cache[url].timestamp) < CACHE_TTL) {
    return cache[url].data
  }

  // Fetch fresh data
  const response = await fetch(url)
  const data = await response.json()

  // Save to cache
  cache[url] = { data, timestamp: now }

  return data
}

// Usage
const vixData = await fetchWithCache('/api/v1/StocksMarkets/fetchVIX')
```

### Market Hours Detection

Only fetch during market hours to save API calls:

```javascript
const isMarketHours = () => {
  const now = new Date()
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const day = et.getDay() // 0=Sun, 5=Fri
  const hour = et.getHours()
  const minute = et.getMinutes()

  // Monday-Friday
  if (day === 0 || day === 6) return false

  // 09:30-16:00 ET
  const minutes = hour * 60 + minute
  return minutes >= 570 && minutes < 960 // 9:30 = 570, 16:00 = 960
}

// Only fetch during market hours
if (isMarketHours()) {
  fetchVIX()
  fetchMarketIndices()
}
```

### Rate Limit Safety

AlphaVantage: 5 calls/minute. Space them out:

```javascript
// Bad: All at once (rate limit!)
await fetch('/api/v1/StocksMarkets/fetchAlphaVantageStock?symbol=SPY')
await fetch('/api/v1/StocksMarkets/fetchAlphaVantageStock?symbol=QQQ')
await fetch('/api/v1/StocksMarkets/fetchAlphaVantageStock?symbol=VIX')
await fetch('/api/v1/StocksMarkets/fetchAlphaVantageStock?symbol=DIA')
await fetch('/api/v1/StocksMarkets/fetchAlphaVantageStock?symbol=IWM')
// Error: Rate limit exceeded!

// Good: Spaced 13 seconds apart
await fetch('/api/v1/StocksMarkets/fetchAlphaVantageStock?symbol=SPY')
await sleep(13000)
await fetch('/api/v1/StocksMarkets/fetchAlphaVantageStock?symbol=QQQ')
await sleep(13000)
// etc.

// Best: Use fetchMarketIndices endpoint (handles spacing automatically)
await fetch('/api/v1/StocksMarkets/fetchMarketIndices?indices=all')
```

---

## 🎓 Learn More

- **Full Setup Guide:** [API_SETUP.md](./API_SETUP.md)
- **FRED Series List:** [FRED_SERIES_REFERENCE.md](./FRED_SERIES_REFERENCE.md)
- **Integration Summary:** [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)
- **Complete Docs:** [README.md](./README.md)

---

## ❓ Quick Troubleshooting

### "FRED_API_KEY not configured"
- Check `.env` file exists in project root
- Verify key is correct: `FRED_API_KEY=your_key_here`
- No spaces around `=` sign
- Restart server: `npm run dev`

### "Rate limit exceeded" (AlphaVantage)
- You hit 5 calls/minute or 500 calls/day limit
- Wait 1 minute before next request
- Implement caching (see Pro Tips above)
- Reduce polling frequency

### Empty data / null values
- Stock market may be closed (try outside market hours)
- Try SPY first (most reliable symbol)
- Check if API key is valid
- Review response for error messages

---

## ✅ You're Ready!

1. ✅ Get API keys (2 min)
2. ✅ Add to `.env` (1 min)
3. ✅ Restart server (30 sec)
4. ✅ Test endpoints (2 min)
5. ✅ Start building! 🚀

**Total Time:** 5-10 minutes

**Next Step:** Visit the StocksMarkets dashboard in your app:
- Go to sidebar → **📊 Stocks**
- Or navigate to: `/StocksMarkets/GlobalMarketOverview`

---

**Questions?** Check [API_SETUP.md](./API_SETUP.md) for detailed troubleshooting.
