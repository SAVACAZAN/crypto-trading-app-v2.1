# 📊 FRED Series Reference Guide

Complete reference of the most important FRED series IDs for crypto trading bot automation.

---

## 🎯 Most Important for Crypto Bots (Top 10)

| Series ID | Name | Update | Why Important for Crypto |
|-----------|------|--------|--------------------------|
| **DFF** | Federal Funds Rate | Daily | Higher rates → risk-off → crypto down |
| **T10Y2Y** | 10Y-2Y Treasury Spread | Daily | Negative = recession signal → crypto selloff |
| **VIXCLS** | VIX Volatility Index | Daily | Fear gauge → correlates with crypto volatility |
| **CPIAUCSL** | Consumer Price Index | Monthly | High inflation → crypto as hedge narrative |
| **M2SL** | M2 Money Supply | Monthly | Money printing → crypto bullish |
| **UNRATE** | Unemployment Rate | Monthly | High unemployment → risk-off → crypto down |
| **GOLDAMGBD228NLBM** | Gold Price | Daily | Safe haven → competes with BTC narrative |
| **DCOILWTICO** | WTI Oil Price | Daily | Energy costs → mining profitability |
| **SP500** | S&P 500 Index | Daily | 0.5-0.7 correlation with BTC |
| **NASDAQCOM** | NASDAQ Index | Daily | Tech correlation with crypto |

---

## 📈 Interest Rates & Monetary Policy

### Federal Reserve Rates
| Series ID | Name | Frequency | Current (2024) | Bot Impact |
|-----------|------|-----------|----------------|------------|
| **DFF** | Federal Funds Effective Rate | Daily | 4.58% | **CRITICAL** - Rate hikes = crypto down |
| **DFEDTARU** | Federal Funds Target Range - Upper | Daily | 5.50% | Fed's upper target |
| **DFEDTARL** | Federal Funds Target Range - Lower | Daily | 5.25% | Fed's lower target |
| **FEDFUNDS** | Federal Funds Rate (Monthly) | Monthly | 4.58% | Monthly average |

### Treasury Yields (Yield Curve)
| Series ID | Name | Frequency | Bot Use Case |
|-----------|------|-----------|--------------|
| **T10Y2Y** | 10-Year minus 2-Year | Daily | **Recession indicator** (negative = warning) |
| **DGS1** | 1-Year Treasury | Daily | Short-term rates |
| **DGS2** | 2-Year Treasury | Daily | Fed policy expectations |
| **DGS5** | 5-Year Treasury | Daily | Medium-term outlook |
| **DGS10** | 10-Year Treasury | Daily | Long-term rates (most watched) |
| **DGS30** | 30-Year Treasury | Daily | Very long-term outlook |
| **T10YIE** | 10-Year Breakeven Inflation | Daily | Market inflation expectations |

**Bot Logic:**
```javascript
// Recession indicator
if (T10Y2Y < 0) {
  // Inverted yield curve = recession warning
  // Action: Reduce crypto exposure, tighten stops
}

// Rising rates
if (DFF_change > 0.25) {
  // Fed hiking aggressively
  // Action: Reduce risk, crypto likely to fall
}
```

---

## 📊 Inflation Indicators

### Consumer Prices
| Series ID | Name | Frequency | Target | Bot Impact |
|-----------|------|-----------|--------|------------|
| **CPIAUCSL** | Consumer Price Index (CPI) | Monthly | 2% YoY | **HIGH** - Main inflation metric Fed watches |
| **CPILFESL** | Core CPI (ex food & energy) | Monthly | 2% YoY | Fed's preferred measure |
| **PCEPI** | PCE Price Index | Monthly | 2% YoY | **CRITICAL** - Fed's #1 target |
| **PCEPILFE** | Core PCE (ex food & energy) | Monthly | 2% YoY | Most important inflation metric |

### Inflation Expectations
| Series ID | Name | Frequency | Bot Use Case |
|-----------|------|-----------|--------------|
| **T5YIE** | 5-Year Breakeven Inflation | Daily | Market expectations (5Y forward) |
| **T10YIE** | 10-Year Breakeven Inflation | Daily | Long-term inflation expectations |
| **MICH** | University of Michigan Inflation Expectations | Monthly | Consumer sentiment on inflation |

**Bot Logic:**
```javascript
// Calculate YoY inflation
const cpiYoY = ((currentCPI - cpiYearAgo) / cpiYearAgo) * 100

if (cpiYoY > 5) {
  // High inflation → Crypto as inflation hedge narrative
  // Action: Slight long bias (but watch Fed response)
} else if (cpiYoY < 2) {
  // Disinflation → Fed may cut rates
  // Action: Risk-on mode, bullish crypto
}
```

---

## 💼 Employment Data (Labor Market)

| Series ID | Name | Frequency | Release Day | Bot Impact |
|-----------|------|-----------|-------------|------------|
| **UNRATE** | Unemployment Rate | Monthly | 1st Fri @ 08:30 ET | **HIGH** - Strong labor = risk-on |
| **PAYEMS** | Total Non-Farm Payrolls | Monthly | 1st Fri @ 08:30 ET | **CRITICAL** - NFP moves markets |
| **ICSA** | Initial Jobless Claims | Weekly | Thu @ 08:30 ET | Leading indicator |
| **CIVPART** | Labor Force Participation Rate | Monthly | 1st Fri @ 08:30 ET | Labor market health |
| **AHETPI** | Average Hourly Earnings | Monthly | 1st Fri @ 08:30 ET | Wage inflation signal |

**Bot Logic:**
```javascript
// NFP (Non-Farm Payrolls) release
if (NFP_release_day) {
  // PAUSE all bots 15 minutes before (08:15 ET)
  // Major market volatility at 08:30 ET
  // Resume after 09:00 ET once dust settles
}

// Unemployment trend
if (UNRATE_trend === 'rising') {
  // Weakening economy → Risk-off
  // Action: Reduce position sizes
} else if (UNRATE < 4.0) {
  // Strong labor market → Risk-on
  // Action: Normal/aggressive parameters
}
```

---

## 💰 Money Supply (Liquidity)

| Series ID | Name | Frequency | Bot Impact |
|-----------|------|-----------|------------|
| **M2SL** | M2 Money Supply | Monthly | **HIGH** - More money = crypto bullish |
| **M1SL** | M1 Money Supply | Monthly | Most liquid money |
| **WALCL** | Fed Balance Sheet | Weekly | **CRITICAL** - QE/QT indicator |
| **WRESBAL** | Reserve Balances | Weekly | Bank liquidity |

**Bot Logic:**
```javascript
// Calculate M2 growth rate (YoY)
const m2Growth = ((currentM2 - m2YearAgo) / m2YearAgo) * 100

if (m2Growth > 10) {
  // Money printing → Crypto bullish (inflation hedge)
  // Action: Increase long exposure
} else if (m2Growth < 0) {
  // Quantitative Tightening (QT) → Crypto bearish
  // Action: Reduce risk, expect downtrend
}

// Fed Balance Sheet
if (WALCL_trend === 'increasing') {
  // QE (money printing) → Risk-on
} else if (WALCL_trend === 'decreasing') {
  // QT (tightening) → Risk-off
}
```

---

## 🏭 Economic Growth (GDP)

| Series ID | Name | Frequency | Release | Bot Impact |
|-----------|------|-----------|---------|------------|
| **GDP** | Gross Domestic Product | Quarterly | ~30 days after Q | **MEDIUM** - Overall economy |
| **GDPC1** | Real GDP (inflation-adjusted) | Quarterly | ~30 days after Q | Actual economic output |
| **A191RL1Q225SBEA** | Real GDP Growth Rate | Quarterly | ~30 days after Q | QoQ annualized growth |
| **GDPPOT** | Potential GDP | Quarterly | Economic capacity |

**Bot Logic:**
```javascript
// GDP growth rate
if (gdpGrowth > 3.0) {
  // Strong economy → Risk-on
  // Action: Normal/aggressive bot parameters
} else if (gdpGrowth < 0) {
  // Recession (2 consecutive quarters) → Risk-off
  // Action: Defensive positioning, reduce exposure
}
```

---

## 🥇 Commodities (Safe Havens & Energy)

### Precious Metals
| Series ID | Name | Frequency | Bot Use Case |
|-----------|------|-----------|--------------|
| **GOLDAMGBD228NLBM** | Gold Price (London) | Daily | **HIGH** - BTC vs Gold correlation |
| **GOLDPMGBD228NLBM** | Gold Price (PM Fix) | Daily | Afternoon gold price |
| **SLVPRUSD** | Silver Price | Daily | Industrial + safe haven |

### Energy
| Series ID | Name | Frequency | Bot Use Case |
|-----------|------|-----------|--------------|
| **DCOILWTICO** | WTI Crude Oil | Daily | **MEDIUM** - Mining costs |
| **DCOILBRENTEU** | Brent Crude Oil | Daily | Global oil benchmark |
| **DHHNGSP** | Natural Gas Price | Daily | Energy costs |
| **DEXUSEU** | USD/EUR Exchange Rate | Daily | Dollar strength |

**Bot Logic:**
```javascript
// Gold vs BTC
if (gold_trend === 'up' && btc_trend === 'up') {
  // Both safe havens rising → Fear/uncertainty
  // Action: Expect volatility, widen stops
}

// Oil prices
if (oil_price > 100) {
  // High energy costs → Mining less profitable
  // Inflation pressure → Complex for crypto (bullish inflation hedge, bearish cost)
}
```

---

## 📉 Market Indicators

### Stock Indices
| Series ID | Name | Frequency | Crypto Correlation |
|-----------|------|-----------|-------------------|
| **SP500** | S&P 500 Index | Daily | **0.5-0.7** (strong) |
| **NASDAQCOM** | NASDAQ Composite | Daily | **0.6-0.8** (very strong - tech) |
| **DJIA** | Dow Jones Industrial Average | Daily | **0.4-0.6** (moderate) |
| **WILL5000INDFC** | Wilshire 5000 Total Market | Daily | Broadest U.S. market index |

### Volatility & Fear
| Series ID | Name | Frequency | Bot Impact |
|-----------|------|-----------|------------|
| **VIXCLS** | CBOE Volatility Index (VIX) | Daily | **CRITICAL** - See VIX endpoint |

**Bot Logic:**
```javascript
// Stock market correlation
if (sp500_change < -2.0) {
  // S&P 500 down 2%+ → Expect crypto to follow (1-2 day lag)
  // Action: Reduce long exposure, expect selloff
}

if (nasdaq_trend === 'down' && duration > 3) {
  // NASDAQ downtrend → Tech/crypto correlation strong
  // Action: Defensive positioning
}
```

---

## 🏠 Housing Market

| Series ID | Name | Frequency | Bot Use Case |
|-----------|------|-----------|--------------|
| **CSUSHPINSA** | Case-Shiller Home Price Index | Monthly | Housing market health |
| **HOUST** | Housing Starts | Monthly | Construction activity |
| **MORTGAGE30US** | 30-Year Mortgage Rate | Weekly | Housing affordability |
| **PERMIT** | Building Permits | Monthly | Future construction |

**Bot Logic:**
```javascript
// Rising mortgage rates
if (MORTGAGE30US > 7.0) {
  // Housing market stress → Economic slowdown signal
  // Action: Slight risk-off bias
}
```

---

## 🏦 Banking & Credit

| Series ID | Name | Frequency | Bot Use Case |
|-----------|------|-----------|--------------|
| **DRTSCILM** | Total Consumer Credit | Monthly | Credit expansion/contraction |
| **TOTRESNS** | Total Reserves | Weekly | Banking system liquidity |
| **EXCSRESNS** | Excess Reserves | Weekly | Banks' extra reserves |
| **BOPGSTB** | Balance of Payments | Quarterly | Trade balance |

---

## 🌍 International Rates (for comparison)

| Series ID | Name | Frequency | Bot Use Case |
|-----------|------|-----------|--------------|
| **ECBDFR** | ECB Deposit Facility Rate | Daily | European rates |
| **IRSTCB01JPM156N** | Japan Policy Rate | Monthly | BoJ policy |
| **GBRCPIALLMINMEI** | UK CPI | Monthly | UK inflation |

---

## 📅 Economic Calendar Series (Release Dates)

### Monthly Releases (CRITICAL for bots)

**First Friday @ 08:30 ET (NFP Friday):**
- UNRATE (Unemployment Rate)
- PAYEMS (Non-Farm Payrolls)
- AHETPI (Average Hourly Earnings)
- **Bot Action:** PAUSE all bots 08:15-09:00 ET

**~15th of Month @ 08:30 ET (CPI Release):**
- CPIAUCSL (CPI - All Items)
- CPILFESL (Core CPI)
- **Bot Action:** PAUSE all bots 08:15-09:00 ET

**~Last Week of Month @ 08:30 ET (PCE Release):**
- PCEPI (PCE Price Index)
- PCEPILFE (Core PCE)
- **Bot Action:** PAUSE all bots 08:15-09:00 ET

**Weekly Release - Thursday @ 08:30 ET:**
- ICSA (Initial Jobless Claims)
- **Bot Action:** Minor volatility, optional pause 08:25-08:35 ET

---

## 🤖 Bot Automation Examples

### Example 1: Auto-Pause During Major Releases

```javascript
import { fetch } from 'h3'

// Check if NFP Friday
const today = new Date()
const isFirstFriday = (today.getDay() === 5 && today.getDate() <= 7)

if (isFirstFriday) {
  const nowET = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
  const [time] = nowET.split(' ')[1].split(':')
  const hour = parseInt(time)

  if (hour === 8) {
    // Between 08:00-09:00 ET
    console.log('⚠️ NFP RELEASE HOUR - PAUSING ALL BOTS')
    // Pause bot logic here
  }
}
```

### Example 2: Fed Rate Change Alert

```javascript
// Fetch current and previous Fed rate
const response = await fetch('/api/v1/StocksMarkets/fetchFredData?series_id=DFF&limit=2')
const data = await response.json()

const currentRate = data.stats.latest
const previousRate = data.stats.previous
const change = data.stats.change

if (Math.abs(change) >= 0.25) {
  console.warn(`🚨 MAJOR FED RATE CHANGE: ${change > 0 ? '+' : ''}${change}%`)
  // Alert user, adjust bot parameters
}
```

### Example 3: Recession Indicator (Yield Curve)

```javascript
// Fetch 10Y-2Y Treasury spread
const response = await fetch('/api/v1/StocksMarkets/fetchFredData?series_id=T10Y2Y&limit=1')
const data = await response.json()

const yieldCurve = data.stats.latest

if (yieldCurve < 0) {
  console.warn('⚠️ INVERTED YIELD CURVE - RECESSION SIGNAL')
  // Reduce risk exposure
} else if (yieldCurve > 2.0) {
  console.log('✅ HEALTHY YIELD CURVE - NORMAL ECONOMY')
  // Normal risk appetite
}
```

### Example 4: Money Supply Growth

```javascript
// Fetch M2 (need 13 months for YoY calculation)
const response = await fetch('/api/v1/StocksMarkets/fetchFredData?series_id=M2SL&limit=13')
const data = await response.json()

const currentM2 = data.data[0].value
const yearAgoM2 = data.data[12].value
const m2GrowthYoY = ((currentM2 - yearAgoM2) / yearAgoM2) * 100

console.log(`M2 Growth (YoY): ${m2GrowthYoY.toFixed(2)}%`)

if (m2GrowthYoY > 10) {
  console.log('💰 MONEY PRINTING - BULLISH FOR CRYPTO')
} else if (m2GrowthYoY < 0) {
  console.warn('⚠️ QUANTITATIVE TIGHTENING - BEARISH FOR CRYPTO')
}
```

---

## 📖 Quick Reference Commands

### Fetch Common Series

```bash
# Federal Funds Rate
/api/v1/StocksMarkets/fetchFredData?series_id=DFF&limit=10

# VIX (from FRED)
/api/v1/StocksMarkets/fetchFredData?series_id=VIXCLS&limit=30

# CPI (last 12 months)
/api/v1/StocksMarkets/fetchFredData?series_id=CPIAUCSL&limit=12

# Unemployment Rate
/api/v1/StocksMarkets/fetchFredData?series_id=UNRATE&limit=12

# M2 Money Supply
/api/v1/StocksMarkets/fetchFredData?series_id=M2SL&limit=24

# 10Y-2Y Yield Curve
/api/v1/StocksMarkets/fetchFredData?series_id=T10Y2Y&limit=30

# Gold Price
/api/v1/StocksMarkets/fetchFredData?series_id=GOLDAMGBD228NLBM&limit=30

# Oil Price
/api/v1/StocksMarkets/fetchFredData?series_id=DCOILWTICO&limit=30

# S&P 500
/api/v1/StocksMarkets/fetchFredData?series_id=SP500&limit=30

# NASDAQ
/api/v1/StocksMarkets/fetchFredData?series_id=NASDAQCOM&limit=30
```

---

## 🔍 How to Find More Series

1. **FRED Search:** https://fred.stlouisfed.org/
2. **Browse Categories:** https://fred.stlouisfed.org/categories
3. **Popular Series:** https://fred.stlouisfed.org/tags/series?t=popular

**Example:** Search "Bitcoin" on FRED → CBBTCUSD series exists!

---

## 📚 Additional Resources

- **FRED API Docs:** https://fred.stlouisfed.org/docs/api/fred/
- **Economic Calendar:** https://www.forexfactory.com/calendar
- **Release Schedule:** https://fred.stlouisfed.org/releases
- **Series Search:** https://fred.stlouisfed.org/search

---

**Pro Tip:** All these series IDs work with your `/api/v1/StocksMarkets/fetchFredData` endpoint. Just change the `series_id` parameter!
