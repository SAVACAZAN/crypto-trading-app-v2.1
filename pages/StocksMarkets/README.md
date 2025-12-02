# StocksMarkets - Monitorizare Macro & Flow de Piață

## 📋 Scopul Modulului

Acest modul integrează monitorizarea evenimentelor macroeconomice, date de la bănci centrale, fluxuri de pe piețele de acțiuni și commodities pentru a optimiza deciziile bot-urilor de trading crypto.

---

## 🗂️ Structura Modulului

```
pages/StocksMarkets/
├── README.md                          # Documentație completă
├── OpenBIGEXCHANGES.vue              # Orarul burselor mondiale (NYSE, NASDAQ, LSE, etc.)
├── EconomicCalendar.vue              # Calendar evenimente macro (CPI, NFP, FOMC)
├── CentralBanks.vue                  # Monitorizare Fed, ECB, BoJ, BoE
├── StockFlowAnalysis.vue             # Analiză VIX, S&P500, volume, market internals
├── CommoditiesFlow.vue               # Petrol, Aur, inflație, stocuri EIA
├── OrderBookImbalances.vue           # Dezechilibre order book stocks
├── BotAlertSystem.vue                # Sistem de alerte pentru bot-uri
└── components/
    ├── ExchangeHoursClock.vue        # Ceas live cu orare burse
    ├── MacroEventCard.vue            # Card eveniment macro
    ├── CentralBankRateTracker.vue    # Tracker rate dobânzi
    ├── VIXGauge.vue                  # Indicator VIX (fear index)
    ├── VolumeHeatmap.vue             # Heatmap volume spikes
    └── FlowChart.vue                 # Grafic fluxuri instituționale
```

---

## 🌍 COMPLETE MARKET HOURS - STOCKS + FUTURES + FOREX + CRYPTO

### 📊 ECOSISTEMUL COMPLET 24/7

Acest modul monitorizează **toate piețele financiare** într-un singur loc:
- **STOCKS** (NYSE, NASDAQ, LSE, etc.) - 09:30-16:00 ET + pre/after hours
- **FUTURES** (ES, NQ, CL, GC, BTC) - 24/5 cu pauză zilnică 17:00-18:00 ET
- **FOREX** (4 sesiuni majore) - 24/5 continuu
- **CRYPTO** - 24/7 fără oprire

---

## 🕒 1. STOCKS - Orarul Burselor Mondiale

### Burse Majore Monitorizate

| Bursă | Simbol | Țară | Timezone | Ore Deschidere (Local) | Ore UTC | Ore București (GMT+2) |
|-------|--------|------|----------|------------------------|---------|----------------------|
| **New York Stock Exchange** | NYSE | USA | EST/EDT | 09:30 - 16:00 | 14:30 - 21:00 UTC | 16:30 - 23:00 |
| **NASDAQ** | NASDAQ | USA | EST/EDT | 09:30 - 16:00 | 14:30 - 21:00 UTC | 16:30 - 23:00 |
| **London Stock Exchange** | LSE | UK | GMT/BST | 08:00 - 16:30 | 08:00 - 16:30 UTC | 10:00 - 18:30 |
| **Tokyo Stock Exchange** | TSE | Japan | JST | 09:00 - 15:00 | 00:00 - 06:00 UTC | 02:00 - 08:00 |
| **Shanghai Stock Exchange** | SSE | China | CST | 09:30 - 15:00 | 01:30 - 07:00 UTC | 03:30 - 09:00 |
| **Hong Kong Stock Exchange** | HKEX | Hong Kong | HKT | 09:30 - 16:00 | 01:30 - 08:00 UTC | 03:30 - 10:00 |
| **Euronext Paris** | EPA | France | CET/CEST | 09:00 - 17:30 | 08:00 - 16:30 UTC | 10:00 - 18:30 |
| **Frankfurt Stock Exchange** | FRA | Germany | CET/CEST | 09:00 - 17:30 | 08:00 - 16:30 UTC | 10:00 - 18:30 |
| **Bombay Stock Exchange** | BSE | India | IST | 09:15 - 15:30 | 03:45 - 10:00 UTC | 05:45 - 12:00 |
| **Australian Securities Exchange** | ASX | Australia | AEST | 10:00 - 16:00 | 00:00 - 06:00 UTC | 02:00 - 08:00 |

### Pre-Market & After-Hours (NYSE/NASDAQ)

| Sesiune | Ore Local (EST) | Ore UTC | Ore București |
|---------|----------------|---------|---------------|
| **Pre-Market** | 04:00 - 09:30 | 09:00 - 14:30 UTC | 11:00 - 16:30 |
| **Regular** | 09:30 - 16:00 | 14:30 - 21:00 UTC | 16:30 - 23:00 |
| **After-Hours** | 16:00 - 20:00 | 21:00 - 01:00 UTC | 23:00 - 03:00 |

### 🔔 Alerte Importante

**🚨 Momente Critice de Lichiditate:**
- **16:30-17:00 București** = Deschidere NYSE/NASDAQ (volatilitate maximă)
- **10:00-10:30 București** = Deschidere LSE + Euronext
- **02:00-03:00 București** = Deschidere Tokyo + ASX
- **23:00-23:30 București** = Închidere NYSE (volume mari de EOD)

**📊 Overlap-uri Importante:**
- **16:30-18:30 București** = NYSE + LSE + Euronext (lichiditate MAXIMĂ)
- **02:00-08:00 București** = Tokyo + Hong Kong + Shanghai

---

## 📅 2. ECONOMIC CALENDAR - Evenimente Macroeconomice

### API-uri Utilizate

#### A. **TradingEconomics API** (Principal)
- **URL:** `https://api.tradingeconomics.com/`
- **Endpoints:**
  - `/calendar` - Evenimente viitoare
  - `/calendar/country/{country}` - Evenimente pe țară
  - `/calendar/indicator/{indicator}` - Indicator specific
- **Date furnizate:**
  - CPI, Core CPI, PPI
  - Unemployment Rate, NFP (Non-Farm Payrolls)
  - GDP, Retail Sales, PMI
  - FOMC Meetings, ECB Decisions
  - Importanță: Low / Medium / High

#### B. **FRED API** (Federal Reserve Economic Data) - GRATUIT
- **URL:** `https://api.stlouisfed.org/fred/`
- **Endpoints:**
  - `/series/observations?series_id=CPIAUCSL` - CPI
  - `/series/observations?series_id=UNRATE` - Unemployment
  - `/series/observations?series_id=DFF` - Federal Funds Rate
  - `/series/observations?series_id=M2SL` - Money Supply M2
- **API Key:** FREE (înregistrare pe research.stlouisfed.org)

#### C. **Investing.com Calendar** (via RapidAPI)
- **URL:** `https://rapidapi.com/apidojo/api/investing-cryptocurrency-markets`
- **Avantaj:** Calendar complet, ușor de interogat

#### D. **FinancialModelingPrep API**
- **URL:** `https://financialmodelingprep.com/api/v3/`
- **Endpoints:**
  - `/economic_calendar` - Calendar macro
  - `/earnings_calendar` - Earnings companii

### Evenimente Cheie Monitorizate

| Eveniment | Importanță | Frecvență | Impact pe Crypto | Bot Action |
|-----------|-----------|-----------|------------------|------------|
| **FOMC Meeting** | 🔴 HIGH | 8x/an | EXTREM | PAUSE bots 30 min înainte |
| **CPI (Inflation)** | 🔴 HIGH | Lunar | MARE | Reduce grid range, stop new positions |
| **NFP (Jobs Report)** | 🔴 HIGH | Lunar | MARE | Pause aggressive orders |
| **Fed Chair Speech** | 🟡 MEDIUM | Ad-hoc | MEDIU-MARE | Monitor tone (hawkish/dovish) |
| **GDP Report** | 🟡 MEDIUM | Trimestrial | MEDIU | Adjust risk parameters |
| **ECB Rate Decision** | 🔴 HIGH | 8x/an | MARE (EUR pairs) | Pause EU-related pairs |
| **Retail Sales** | 🟢 LOW-MEDIUM | Lunar | MEDIU | Monitor consumer spending |
| **PMI (Manufacturing)** | 🟢 LOW-MEDIUM | Lunar | MIC | Economic health indicator |
| **PPI (Producer Prices)** | 🟡 MEDIUM | Lunar | MEDIU | Leading inflation indicator |

### 🤖 Logică Bot pentru Evenimente

```javascript
// Exemplu pseudocod
if (eventImportance === 'HIGH' && eventTime - currentTime < 30min) {
  bot.pauseNewOrders();
  bot.widenStopLoss(1.5x);
  bot.reducePositionSize(0.5x);
}

if (eventActual > eventForecast + threshold) {
  // Hawkish surprise → USD up, crypto poate scădea
  bot.triggerHedge('SHORT');
} else if (eventActual < eventForecast - threshold) {
  // Dovish surprise → USD down, crypto poate crește
  bot.triggerOpportunity('LONG');
}
```

---

## 🏦 3. CENTRAL BANKS - Bănci Centrale & Rate Dobânzi

### Bănci Monitorizate

| Bancă | Țară/Regiune | Current Rate | Next Meeting | API Source |
|-------|--------------|--------------|--------------|------------|
| **Federal Reserve (Fed)** | USA | 5.25-5.50% | TBD | FRED API |
| **European Central Bank (ECB)** | Eurozone | 4.50% | TBD | ECB SDW API |
| **Bank of Japan (BoJ)** | Japan | -0.10% | TBD | TradingEconomics |
| **Bank of England (BoE)** | UK | 5.25% | TBD | TradingEconomics |
| **Swiss National Bank (SNB)** | Switzerland | 1.75% | TBD | TradingEconomics |

### API-uri pentru Bănci Centrale

#### **Fed (Federal Reserve)**
- **API:** FRED (Federal Reserve Economic Data)
- **Endpoint:** `https://api.stlouisfed.org/fred/series/observations?series_id=DFF`
- **Date:**
  - Federal Funds Rate (DFF)
  - Dot Plot projections
  - FOMC meeting minutes
  - Fed Chair speeches

#### **ECB (European Central Bank)**
- **API:** ECB Statistical Data Warehouse
- **URL:** `https://sdw-wsrest.ecb.europa.eu/service/`
- **Endpoints:**
  - `/data/FM/D.U2.EUR.RT.MM.EURIBOR1MD_.HSTA` - Euribor rates
  - `/data/IRS/M.U2.N.A.A.A.FA.EUR.S.Z` - ECB rates
- **Date:**
  - Main refinancing rate
  - Deposit facility rate
  - Inflation targets

#### **BoJ, BoE, SNB**
- **API:** TradingEconomics
- **Endpoint:** `/calendar/country/japan` (sau uk, switzerland)

### 📊 Ce Monitorizăm

1. **Rate Changes** (Schimbări de rate)
   - Rate increase → Hawkish → USD stronger → Crypto weaker
   - Rate decrease → Dovish → USD weaker → Crypto stronger

2. **Forward Guidance** (Tone)
   - Hawkish language → Viitoare creșteri → Risk-off
   - Dovish language → Viitoare reduceri → Risk-on

3. **Dot Plot** (Fed) - Proiecții membri Fed
   - Median rate expectation pentru următorii 3 ani

4. **Meeting Minutes** - Detalii discuții interne
   - Disagreements, uncertainties → Volatility

---

## 📈 4. STOCK FLOW ANALYSIS - Analiza Fluxurilor de Acțiuni

### Indicatori Cheie

#### A. **VIX (Volatility Index) - Fear Index**
- **API:** AlphaVantage, Yahoo Finance
- **Interpretare:**
  - VIX < 15 = Low fear, complacency → Risk-on
  - VIX 15-25 = Normal market
  - VIX 25-35 = Elevated fear → Caution
  - VIX > 35 = Panic → Risk-off, pause bots

#### B. **S&P500 & NASDAQ Leadership**
- **API:** Polygon.io, AlphaVantage
- **Monitorizare:**
  - S&P500 vs NASDAQ performance
  - Sectoare leading (Tech, Energy, Financials)
  - Advance/Decline ratio
  - New highs vs new lows

#### C. **Volume Analysis**
- **Volume Spikes:** > 2x average volume
- **Dark Pool Activity:** Institutional flows
- **Block Trades:** > $1M transactions

#### D. **Market Internals**
- **Advance/Decline Line**
- **McClellan Oscillator**
- **Cumulative Volume Delta**

### API-uri pentru Stocks

#### **1. Polygon.io** (Cel mai bun pentru real-time)
- **URL:** `https://api.polygon.io/v2/`
- **Endpoints:**
  - `/aggs/ticker/{symbol}/range/1/day/{from}/{to}` - OHLCV
  - `/snapshot/locale/us/markets/stocks/tickers` - All tickers snapshot
  - `/v3/quotes/{ticker}` - Real-time quotes
  - `/v2/snapshot/locale/us/markets/stocks/gainers` - Top gainers
- **Features:**
  - Order book data
  - Volume analysis
  - Market internals
  - WebSocket real-time

#### **2. AlphaVantage** (FREE tier disponibil)
- **URL:** `https://www.alphavantage.co/query`
- **Endpoints:**
  - `function=TIME_SERIES_INTRADAY` - Intraday prices
  - `function=RSI` - Relative Strength Index
  - `function=MACD` - MACD indicator
  - `function=BBANDS` - Bollinger Bands
  - `function=VWAP` - Volume Weighted Average Price
- **API Key:** FREE (5 calls/min, 500 calls/day)

#### **3. Yahoo Finance API** (Neoficial, gratuit)
- **Libraries:** `yahooquery` (Python), `yahoo-finance2` (Node.js)
- **Date:**
  - Prețuri real-time
  - Volume, Market Cap
  - Earnings calendar
  - ETF flows
  - Dividend data

### 🚨 Alerte pentru Bot

```javascript
// Volume Spike Detection
if (currentVolume > avgVolume * 2) {
  alert('VOLUME SPIKE on ' + symbol);
  bot.monitorForBreakout(symbol);
}

// VIX Alert
if (VIX > 30) {
  bot.reduceRiskExposure();
  bot.pauseAggressiveStrategies();
} else if (VIX < 15) {
  bot.increaseRiskAppetite();
}

// S&P500 Pre-Market Movement
if (SPY_premarket_change > 1%) {
  bot.prepareForVolatility();
  bot.adjustGridRange(1.5x);
}
```

---

## 🛢️ 5. COMMODITIES FLOW - Petrol, Aur, Energie

### A. **Petrol (Crude Oil)**

#### **Date Monitorizate:**
- **WTI Crude Oil** (US benchmark)
- **Brent Crude** (International benchmark)
- **EIA Weekly Inventories** (Stocuri petrol SUA)
- **OPEC Decisions** (Producție, cotă)
- **Rig Count** (Baker Hughes)

#### **API-uri:**
1. **EIA (Energy Information Administration)** - GRATUIT
   - **URL:** `https://api.eia.gov/`
   - **Endpoints:**
     - `/series/?series_id=PET.WCRSTUS1.W` - Weekly US Crude Stocks
     - `/series/?series_id=PET.RWTC.D` - WTI Daily Price
   - **API Key:** FREE (eia.gov/opendata)

2. **OPEC Reports**
   - Manual scraping sau TradingEconomics

3. **AlphaVantage**
   - `function=WTI` - West Texas Intermediate
   - `function=BRENT` - Brent Crude

#### **Logică Bot:**
```javascript
// EIA Inventory Report (miercuri 10:30 EST)
if (actualInventory > forecastInventory + threshold) {
  // Surplus → Price down
  bot.adjustCommodityExposure('OIL', 'BEARISH');
} else {
  // Deficit → Price up
  bot.adjustCommodityExposure('OIL', 'BULLISH');
}
```

### B. **Aur (Gold)**

#### **Date Monitorizate:**
- **Spot Gold Price (XAU/USD)**
- **US Dollar Index (DXY)** - Corelație inversă
- **Real Rates** (Nominal rate - Inflation)
- **Safe Haven Flows**

#### **API-uri:**
1. **AlphaVantage**
   - `function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD`

2. **FRED API**
   - `series_id=GOLDAMGBD228NLBM` - Gold Fixing Price

#### **Corelații:**
- **USD ↑ → Gold ↓** (negative correlation)
- **Real Rates ↑ → Gold ↓** (opportunity cost)
- **Fear ↑ (VIX high) → Gold ↑** (safe haven)

---

## 🤖 6. BOT ALERT SYSTEM - Sistem de Alerte pentru Bots

### Tipuri de Alerte

| Alert Type | Severity | Trigger | Bot Action |
|------------|----------|---------|------------|
| **FOMC Meeting** | 🔴 CRITICAL | 30 min before | PAUSE all bots |
| **High Impact Event** | 🟠 HIGH | 15 min before | Reduce position sizes |
| **Volume Spike** | 🟡 MEDIUM | Volume > 2x avg | Monitor for breakout |
| **VIX > 30** | 🟠 HIGH | Real-time | Risk-off mode |
| **EIA Inventory** | 🟡 MEDIUM | Wednesday 10:30 EST | Adjust commodity exposure |
| **Pre-Market Gap** | 🟡 MEDIUM | Gap > 1% | Widen grid range |
| **Order Book Imbalance** | 🟢 LOW | Bid/Ask ratio > 2:1 | Directional bias |

### Structura Alert System

```javascript
// MongoDB Schema pentru Alerts
{
  _id: ObjectId,
  eventType: 'FOMC_MEETING' | 'CPI_RELEASE' | 'VOLUME_SPIKE' | 'VIX_ALERT',
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
  triggerTime: Date,
  eventTime: Date,
  symbol: String,
  description: String,
  botActions: [
    {
      action: 'PAUSE' | 'REDUCE_SIZE' | 'WIDEN_STOPS' | 'HEDGE',
      params: Object
    }
  ],
  status: 'PENDING' | 'TRIGGERED' | 'COMPLETED',
  createdAt: Date
}
```

### Automated Bot Responses

```javascript
class BotAlertHandler {
  handleAlert(alert) {
    switch(alert.severity) {
      case 'CRITICAL':
        this.pauseAllBots();
        this.closeRiskyPositions();
        break;

      case 'HIGH':
        this.reducePositionSizes(0.5);
        this.widenStopLosses(1.5);
        break;

      case 'MEDIUM':
        this.adjustRiskParameters();
        this.monitorClosely();
        break;

      case 'LOW':
        this.logForAnalysis();
        break;
    }
  }
}
```

---

## 📊 7. ORDER BOOK IMBALANCES - Dezechilibre Order Book

### Ce Monitorizăm

1. **Bid/Ask Ratio**
   - Ratio > 2:1 (Bids) → Bullish pressure
   - Ratio > 2:1 (Asks) → Bearish pressure

2. **Large Orders** (Walls)
   - Buy wall → Support level
   - Sell wall → Resistance level

3. **Order Flow Toxicity**
   - Rapid order cancellations → Manipulation
   - Iceberg orders → Hidden liquidity

### API pentru Order Book

#### **Polygon.io**
- **Endpoint:** `/v2/snapshot/locale/us/markets/stocks/tickers`
- **Data:** Level 2 order book pentru US stocks

#### **Pentru Crypto** (din existing system)
- Folosim API-urile existente LCX, Coinbase, Kraken
- Monitorizăm order book depth

---

## 🔧 Implementare Tehnică

### Stack Tehnic

```
Frontend: Vue 3 + Nuxt 3
Backend: Nuxt Server API Routes
Database: MongoDB (event storage, alerts, historical data)
Real-time: WebSocket pentru live prices
Scheduling: node-cron pentru event checking
Charts: Chart.js, Lightweight Charts
```

### Folder Structure Final

```
pages/StocksMarkets/
├── OpenBIGEXCHANGES.vue
├── EconomicCalendar.vue
├── CentralBanks.vue
├── StockFlowAnalysis.vue
├── CommoditiesFlow.vue
├── OrderBookImbalances.vue
├── BotAlertSystem.vue

components/StocksMarkets/
├── ExchangeHoursClock.vue
├── MacroEventCard.vue
├── CentralBankRateTracker.vue
├── VIXGauge.vue
├── VolumeHeatmap.vue
├── FlowChart.vue

server/api/v1/StocksMarkets/
├── fetchEconomicCalendar.get.js
├── fetchCentralBankRates.get.js
├── fetchStockFlow.get.js
├── fetchCommodities.get.js
├── createBotAlert.post.js
├── fetchOrderBookImbalances.get.js

server/models/
├── economicEvent.schema.js
├── botAlert.schema.js
├── stockFlow.schema.js
```

### Environment Variables Necesare

```env
# Economic Calendar
TRADING_ECONOMICS_API_KEY=your_key
FRED_API_KEY=your_key
INVESTING_API_KEY=your_key
FINANCIAL_MODELING_PREP_KEY=your_key

# Stock Market Data
POLYGON_API_KEY=your_key
ALPHA_VANTAGE_API_KEY=your_key

# Commodities
EIA_API_KEY=your_key
```

---

## 📝 NEXT STEPS - Pași de Implementare

### ✅ Faza 1: Exchange Hours & Basic Setup
1. ✅ Create folder structure
2. ⏳ Build OpenBIGEXCHANGES.vue component
3. ⏳ Implement ExchangeHoursClock.vue
4. ⏳ Add timezone conversions

### ⏳ Faza 2: Economic Calendar
1. Setup API integrations (FRED, TradingEconomics)
2. Build EconomicCalendar.vue
3. Create MongoDB schema pentru events
4. Implement auto-fetch cron job

### ⏳ Faza 3: Central Banks
1. Integrate Fed API (FRED)
2. Integrate ECB API
3. Build CentralBanks.vue dashboard
4. Add rate change notifications

### ⏳ Faza 4: Stock Flow
1. Setup Polygon.io + AlphaVantage
2. Build VIX monitoring
3. Create volume spike detection
4. Implement StockFlowAnalysis.vue

### ⏳ Faza 5: Bot Integration
1. Create BotAlertSystem.vue
2. Build alert logic engine
3. Connect to existing grid bots
4. Test automated responses

---

## 📚 Resurse & Documentații

- **FRED API Docs:** https://fred.stlouisfed.org/docs/api/
- **Polygon.io Docs:** https://polygon.io/docs/
- **AlphaVantage Docs:** https://www.alphavantage.co/documentation/
- **TradingEconomics API:** https://docs.tradingeconomics.com/
- **EIA API:** https://www.eia.gov/opendata/documentation.php
- **ECB SDW API:** https://sdw-wsrest.ecb.europa.eu/

---

---

## 🕒 2. FUTURES - Piețe Futures 24/5

### Futures Majore Monitorizate

Futures sunt active **aproape 24/5** cu o pauză zilnică de 1 oră.

| Future | Simbol | Descriere | Exchange | Trading Hours (ET) | București Hours |
|--------|--------|-----------|----------|-------------------|-----------------|
| **E-mini S&P 500** | ES | S&P500 futures | CME | Sun 18:00 - Fri 17:00 | Lun 01:00 - Sâm 00:00 |
| **E-mini NASDAQ** | NQ | NASDAQ-100 futures | CME | Sun 18:00 - Fri 17:00 | Lun 01:00 - Sâm 00:00 |
| **Crude Oil** | CL | WTI Crude Oil futures | NYMEX | Sun 18:00 - Fri 17:00 | Lun 01:00 - Sâm 00:00 |
| **Gold** | GC | Gold futures | COMEX | Sun 18:00 - Fri 17:00 | Lun 01:00 - Sâm 00:00 |
| **Bitcoin Futures** | BTC | CME Bitcoin futures | CME | Sun 18:00 - Fri 17:00 | Lun 01:00 - Sâm 00:00 |
| **Ethereum Futures** | ETH | CME Ethereum futures | CME | Sun 18:00 - Fri 17:00 | Lun 01:00 - Sâm 00:00 |

### Pauză Zilnică (TOATE Futures CME)

| Pauză | ET Time | București Time | Durată |
|-------|---------|----------------|--------|
| **Daily Maintenance** | 17:00 - 18:00 | 00:00 - 01:00 | 1 oră |

### 🔔 Momente Critice pentru Futures

**🚨 Ore de Volatilitate Maximă:**
- **16:30 București (09:30 ET)** = Deschidere stock market → futures reacționează
- **15:30 București (08:30 ET)** = Majoritatea datelor macro (CPI, NFP, PPI)
- **21:00 București (14:00 ET)** = FOMC minutes release
- **00:00-01:00 București** = Pauză zilnică CME (lichiditate ZERO)

**📊 Caracteristici Futures:**
- **Trading 23/5** (23 ore pe zi, 5 zile pe săptămână)
- **Leverage ridicat** (margin requirements mici)
- **Lichiditate mare** în timpul sesiunii US
- **Gap-uri** la redeschidere după pauza de 1 oră

### 🤖 Bot Logic pentru Futures

```javascript
// Check if futures market is in daily pause
function isFuturesPause() {
  const ET_hour = getETHour();
  return ET_hour >= 17 && ET_hour < 18; // 17:00-18:00 ET
}

// Adjust bot behavior
if (isFuturesPause()) {
  bot.pauseOrders();
  bot.prepareForGap(); // Expect gap after 18:00 ET
} else if (isStockMarketOpen() && isFuturesActive()) {
  bot.increaseFrequency(); // High correlation period
}
```

---

## 💱 3. FOREX - Piața Valutară 24/5

### Cele 4 Sesiuni Majore

Forex este **24/5 continuu** cu 4 sesiuni principale care se suprapun.

| Sesiune | Timezone | Local Hours | UTC Hours | București Hours | Perechi Active |
|---------|----------|-------------|-----------|-----------------|----------------|
| **Sydney** | AEDT | 17:00 - 02:00 | 06:00 - 15:00 | 08:00 - 17:00 | AUD/USD, NZD/USD |
| **Tokyo / Asia** | JST | 00:00 - 09:00 | 15:00 - 00:00 | 17:00 - 02:00 | USD/JPY, AUD/JPY |
| **London / Europa** | GMT | 08:00 - 17:00 | 08:00 - 17:00 | 10:00 - 19:00 | EUR/USD, GBP/USD |
| **New York / SUA** | EST | 08:00 - 17:00 | 13:00 - 22:00 | 15:00 - 00:00 | USD/CAD, EUR/USD |

### ⚡ Overlap-uri FOREX (Lichiditate MAXIMĂ)

| Overlap | Sesiuni | București Hours | Impact | Volatilitate |
|---------|---------|-----------------|--------|--------------|
| **London + New York** | EU + US | **15:00 - 19:00** | 🔥 EXTREM | CEA MAI MARE |
| **Asia + London** | Tokyo + EU | 10:00 - 11:00 | 🟡 MEDIU | Mare |
| **Sydney + Tokyo** | AUD + JP | 01:00 - 07:00 | 🟢 MIC | Medie |

### 🔔 Momente Critice FOREX

**🚨 Volatilitate Maximă:**
- **15:00-19:00 București** = London + New York overlap (70% din volumul zilnic)
- **15:30 București (08:30 ET)** = US economic data releases
- **10:00 București** = Deschidere London (EUR/GBP perechi)
- **01:00-02:00 București** = Deschidere Tokyo (JPY perechi)

**📊 Ore Liniștite (LOW Liquidity):**
- **06:00-09:00 București** = Gap între Tokyo close și London open
- **22:00-01:00 București** = După închidere NY, înainte de Tokyo

### 🤖 Bot Logic pentru FOREX

```javascript
// Detect forex session overlaps
function getForexSession(bucharestTime) {
  const hour = bucharestTime.getHours();

  if (hour >= 15 && hour < 19) {
    return 'LONDON_NY_OVERLAP'; // Maximum liquidity
  } else if (hour >= 10 && hour < 19) {
    return 'LONDON_SESSION';
  } else if (hour >= 15 && hour < 24) {
    return 'NY_SESSION';
  } else if (hour >= 1 && hour < 10) {
    return 'ASIA_SESSION';
  } else {
    return 'LOW_LIQUIDITY';
  }
}

// Adjust bot parameters
const session = getForexSession(new Date());
if (session === 'LONDON_NY_OVERLAP') {
  bot.increaseGridDensity();
  bot.widenSpread(1.5x); // More volatility
} else if (session === 'LOW_LIQUIDITY') {
  bot.reducePositionSize(0.5x);
  bot.widenStops(2x); // Avoid fake-outs
}
```

---

## ₿ 4. CRYPTO - Piața Cripto 24/7

### Caracteristici Unice

Crypto **nu se închide niciodată**, dar are pattern-uri clare de volatilitate.

| Caracteristică | Detalii |
|----------------|---------|
| **Trading Hours** | 24/7/365 (fără pauză) |
| **Volatilitate Maximă** | 15:30-17:30 RO (overlap EU + US stocks) |
| **Volatilitate Minimă** | 06:00-09:00 RO (gap între Asia și Europa) |
| **Liquidity Peaks** | Când stock/futures markets sunt active |

### 📊 Pattern-uri de Volatilitate Crypto (București Time)

| Interval Orar | Pattern | Lichiditate | Volatilitate | Bot Strategy |
|---------------|---------|-------------|--------------|--------------|
| **00:00 - 01:00** | Post-US close | Medie | Medie | Grid normal |
| **01:00 - 02:00** | Low activity | Scăzută | Scăzută | Reduce frequency |
| **02:00 - 05:00** | Asian wake-up | Medie | Medie-Mare | Monitor Asia news |
| **06:00 - 09:00** | **DEAD ZONE** | Foarte scăzută | Foarte scăzută | **CAUTION - fake moves** |
| **10:00 - 12:00** | Europa intră | Mare | Mare | Increase activity |
| **15:30 - 17:30** | **EU + US OVERLAP** | **MAXIMĂ** | **MAXIMĂ** | **Peak performance** |
| **18:00 - 21:00** | US full active | Mare | Mare | Monitor US news |
| **21:00 - 00:00** | US evening | Mare | Medie-Mare | Grid activ |

### 🔔 Evenimente Care Mișcă Crypto

**🚨 Impact EXTREM pe Crypto:**
- **FOMC Meetings** → Poate mișca BTC/ETH cu 5-10% în minute
- **CPI / Inflation Data** → Corelație directă cu "risk-on/risk-off"
- **Fed Speeches** → Hawkish = crypto down, Dovish = crypto up
- **Stock Market Crashes** → Crypto de obicei corelează (scade împreună)
- **VIX > 30** → Crypto devine extrem volatil (risk-off)

**📊 Pattern-uri Specifice Crypto:**
- **Weekend Effect** → Volume mai mici Sâm-Dum, dar mișcări pot fi mari
- **First Monday** → Adesea volatil (poziționare pentru săptămână)
- **Funding Rate Resets** → La 00:00, 08:00, 16:00 UTC (02:00, 10:00, 18:00 RO)

### 🤖 Bot Logic pentru CRYPTO

```javascript
function getCryptoVolatilityZone(bucharestTime) {
  const hour = bucharestTime.getHours();

  // Dead zone - evită trading agresiv
  if (hour >= 6 && hour < 9) {
    return {
      zone: 'DEAD_ZONE',
      liquidity: 'VERY_LOW',
      action: 'REDUCE_ACTIVITY'
    };
  }

  // Peak overlap - EU + US stocks active
  if (hour >= 15.5 && hour < 17.5) {
    return {
      zone: 'EU_US_OVERLAP',
      liquidity: 'MAXIMUM',
      action: 'PEAK_PERFORMANCE'
    };
  }

  // Europa intră
  if (hour >= 10 && hour < 18) {
    return {
      zone: 'EUROPE_ACTIVE',
      liquidity: 'HIGH',
      action: 'INCREASE_ACTIVITY'
    };
  }

  // US evening
  if (hour >= 21 || hour < 1) {
    return {
      zone: 'US_EVENING',
      liquidity: 'MEDIUM_HIGH',
      action: 'NORMAL_GRID'
    };
  }

  // Asian hours
  return {
    zone: 'ASIA_SESSION',
    liquidity: 'MEDIUM',
    action: 'MONITOR_ASIA_NEWS'
  };
}

// Apply to bot
const volatilityZone = getCryptoVolatilityZone(new Date());

switch(volatilityZone.action) {
  case 'REDUCE_ACTIVITY':
    bot.reduceFrequency(0.3);
    bot.widenStops(2x);
    break;

  case 'PEAK_PERFORMANCE':
    bot.increaseFrequency(1.5);
    bot.tightenGrid();
    bot.monitorMacroEvents();
    break;

  case 'INCREASE_ACTIVITY':
    bot.normalFrequency();
    bot.adjustForEuropeNews();
    break;
}
```

---

## 🔥 5. VOLATILITY WINDOWS - Ferestre de Volatilitate

### Volatilitate EXTREM DE MARE (Bot → Safe Mode)

| Event | Time (București) | Markets Affected | Bot Action |
|-------|------------------|------------------|------------|
| **FOMC Meeting** | 21:00 (14:00 ET) | ALL | **PAUSE 30 min before** |
| **CPI Release** | 15:30 (08:30 ET) | ALL | **PAUSE 15 min before** |
| **NFP (Jobs Report)** | 15:30 (08:30 ET) | ALL | **PAUSE 15 min before** |
| **Fed Chair Speech** | Variable | ALL | **Monitor tone, reduce size** |
| **NYSE Opening** | 16:30 (09:30 ET) | Stocks, Futures, Crypto | **Widen grid 1.5x** |
| **Power Hour** | 22:00-23:00 (15:00-16:00 ET) | Stocks | **High volume, caution** |

### Volatilitate MARE (Bot → Adjust Parameters)

| Window | Time (București) | Reason | Bot Adjustment |
|--------|------------------|--------|----------------|
| **London + NY Overlap** | 15:00-19:00 | Forex peak | Widen spread 1.3x |
| **EU + US Stocks Overlap** | 16:30-18:30 | Maximum stock liquidity | Tighten grid, increase frequency |
| **Asian Session Open** | 02:00-05:00 | Tokyo + HK + Shanghai | Monitor Asia news |
| **Pre-Market US** | 11:00-16:30 | Stock futures active | Prepare for gaps |

### Volatilitate SCĂZUTĂ (Bot → Caution pentru Fake Moves)

| Window | Time (București) | Reason | Bot Adjustment |
|--------|------------------|--------|----------------|
| **Crypto Dead Zone** | 06:00-09:00 | Low global activity | **Reduce frequency 50%** |
| **Futures Daily Pause** | 00:00-01:00 (17:00-18:00 ET) | CME maintenance | **STOP orders** |
| **Forex Gap** | 06:00-09:00 | Between Tokyo/London | Widen stops 2x |
| **Weekend Crypto** | Sâm-Dum | Lower institutional volume | Reduce position size |

---

## 🤖 6. MARKET HOURS DETECTOR - Modul Automat de Detectare

### Structura Completă

```javascript
// utils/MarketHoursDetector.js

class MarketHoursDetector {
  constructor() {
    this.currentTime = new Date();
  }

  // Convert to various timezones
  getETTime() {
    return new Date(this.currentTime.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  }

  getBucharestTime() {
    return new Date(this.currentTime.toLocaleString('en-US', { timeZone: 'Europe/Bucharest' }));
  }

  getUTCTime() {
    return new Date(this.currentTime.toLocaleString('en-US', { timeZone: 'UTC' }));
  }

  // Check if US stocks are open
  isStockMarketOpen() {
    const et = this.getETTime();
    const hour = et.getHours();
    const minutes = et.getMinutes();
    const day = et.getDay();

    // Weekend check
    if (day === 0 || day === 6) return false;

    // Regular hours: 09:30 - 16:00 ET
    const currentMinutes = hour * 60 + minutes;
    const openMinutes = 9 * 60 + 30;  // 09:30
    const closeMinutes = 16 * 60;     // 16:00

    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }

  // Check if in pre-market
  isPreMarket() {
    const et = this.getETTime();
    const hour = et.getHours();
    const minutes = et.getMinutes();
    const day = et.getDay();

    if (day === 0 || day === 6) return false;

    const currentMinutes = hour * 60 + minutes;
    const preStart = 4 * 60;      // 04:00
    const preEnd = 9 * 60 + 30;   // 09:30

    return currentMinutes >= preStart && currentMinutes < preEnd;
  }

  // Check if in after-hours
  isAfterHours() {
    const et = this.getETTime();
    const hour = et.getHours();
    const day = et.getDay();

    if (day === 0 || day === 6) return false;

    return hour >= 16 && hour < 20;
  }

  // Check if futures are in daily pause
  isFuturesPause() {
    const et = this.getETTime();
    const hour = et.getHours();
    const day = et.getDay();

    // Futures pause daily 17:00-18:00 ET (except weekends)
    if (day === 6) return true; // Saturday pause
    if (day === 5 && hour >= 17) return true; // Friday close

    return hour >= 17 && hour < 18;
  }

  // Check if futures are active
  isFuturesActive() {
    const et = this.getETTime();
    const day = et.getDay();

    // Sunday 18:00 ET - Friday 17:00 ET
    if (day === 0) {
      return et.getHours() >= 18;
    }
    if (day === 6) {
      return false; // Closed Saturday
    }
    if (day === 5) {
      return et.getHours() < 17; // Friday closes 17:00
    }

    // Check daily pause
    return !this.isFuturesPause();
  }

  // Get forex session
  getForexSession() {
    const bucharest = this.getBucharestTime();
    const hour = bucharest.getHours();

    if (hour >= 15 && hour < 19) {
      return {
        session: 'LONDON_NY_OVERLAP',
        liquidity: 'MAXIMUM',
        volatility: 'VERY_HIGH'
      };
    }

    if (hour >= 10 && hour < 19) {
      return {
        session: 'LONDON_SESSION',
        liquidity: 'HIGH',
        volatility: 'HIGH'
      };
    }

    if (hour >= 15 && hour < 24) {
      return {
        session: 'NY_SESSION',
        liquidity: 'HIGH',
        volatility: 'MEDIUM_HIGH'
      };
    }

    if (hour >= 1 && hour < 10) {
      return {
        session: 'ASIA_SESSION',
        liquidity: 'MEDIUM',
        volatility: 'MEDIUM'
      };
    }

    return {
      session: 'LOW_LIQUIDITY',
      liquidity: 'LOW',
      volatility: 'LOW'
    };
  }

  // Get crypto volatility zone
  getCryptoVolatilityZone() {
    const bucharest = this.getBucharestTime();
    const hour = bucharest.getHours();

    if (hour >= 6 && hour < 9) {
      return {
        zone: 'DEAD_ZONE',
        liquidity: 'VERY_LOW',
        volatility: 'VERY_LOW',
        recommendation: 'REDUCE_ACTIVITY'
      };
    }

    if (hour >= 15.5 && hour < 17.5) {
      return {
        zone: 'EU_US_OVERLAP',
        liquidity: 'MAXIMUM',
        volatility: 'MAXIMUM',
        recommendation: 'PEAK_PERFORMANCE'
      };
    }

    if (hour >= 10 && hour < 18) {
      return {
        zone: 'EUROPE_ACTIVE',
        liquidity: 'HIGH',
        volatility: 'HIGH',
        recommendation: 'INCREASE_ACTIVITY'
      };
    }

    if (hour >= 21 || hour < 1) {
      return {
        zone: 'US_EVENING',
        liquidity: 'MEDIUM_HIGH',
        volatility: 'MEDIUM_HIGH',
        recommendation: 'NORMAL_GRID'
      };
    }

    return {
      zone: 'ASIA_SESSION',
      liquidity: 'MEDIUM',
      volatility: 'MEDIUM',
      recommendation: 'MONITOR_ASIA_NEWS'
    };
  }

  // Get complete market status
  getMarketStatus() {
    return {
      stocks: {
        isOpen: this.isStockMarketOpen(),
        isPreMarket: this.isPreMarket(),
        isAfterHours: this.isAfterHours()
      },
      futures: {
        isActive: this.isFuturesActive(),
        isPause: this.isFuturesPause()
      },
      forex: this.getForexSession(),
      crypto: this.getCryptoVolatilityZone(),
      timestamps: {
        bucharest: this.getBucharestTime(),
        et: this.getETTime(),
        utc: this.getUTCTime()
      }
    };
  }

  // Get bot recommendations
  getBotRecommendations() {
    const status = this.getMarketStatus();
    const recommendations = [];

    // Critical events check
    if (this.isFuturesPause()) {
      recommendations.push({
        severity: 'CRITICAL',
        action: 'PAUSE_ALL',
        reason: 'Futures daily maintenance (17:00-18:00 ET)'
      });
    }

    // Crypto dead zone
    if (status.crypto.zone === 'DEAD_ZONE') {
      recommendations.push({
        severity: 'HIGH',
        action: 'REDUCE_FREQUENCY',
        multiplier: 0.3,
        reason: 'Crypto low liquidity period'
      });
    }

    // Peak performance
    if (status.crypto.zone === 'EU_US_OVERLAP') {
      recommendations.push({
        severity: 'MEDIUM',
        action: 'INCREASE_ACTIVITY',
        multiplier: 1.5,
        reason: 'Peak crypto liquidity - EU + US overlap'
      });
    }

    // Forex overlap
    if (status.forex.session === 'LONDON_NY_OVERLAP') {
      recommendations.push({
        severity: 'MEDIUM',
        action: 'WIDEN_SPREAD',
        multiplier: 1.5,
        reason: 'Forex maximum volatility - London + NY overlap'
      });
    }

    // Stock market opening
    if (this.isStockMarketOpen()) {
      const et = this.getETTime();
      const minutes = et.getHours() * 60 + et.getMinutes();
      const openingMinutes = 9 * 60 + 30;

      // First 30 minutes
      if (minutes < openingMinutes + 30) {
        recommendations.push({
          severity: 'HIGH',
          action: 'WIDEN_GRID',
          multiplier: 1.5,
          reason: 'Stock market opening - high volatility'
        });
      }
    }

    return recommendations;
  }
}

export default MarketHoursDetector;
```

### Exemplu de Utilizare în Bot

```javascript
import MarketHoursDetector from '~/utils/MarketHoursDetector';

class TradingBot {
  constructor() {
    this.marketDetector = new MarketHoursDetector();
  }

  async executeStrategy() {
    // Get market status
    const status = this.marketDetector.getMarketStatus();
    const recommendations = this.marketDetector.getBotRecommendations();

    console.log('Market Status:', status);
    console.log('Bot Recommendations:', recommendations);

    // Apply recommendations
    for (const rec of recommendations) {
      switch(rec.action) {
        case 'PAUSE_ALL':
          this.pauseAllOrders();
          break;

        case 'REDUCE_FREQUENCY':
          this.setFrequency(this.baseFrequency * rec.multiplier);
          break;

        case 'INCREASE_ACTIVITY':
          this.setFrequency(this.baseFrequency * rec.multiplier);
          this.tightenGrid();
          break;

        case 'WIDEN_SPREAD':
          this.spreadMultiplier = rec.multiplier;
          break;

        case 'WIDEN_GRID':
          this.gridRangeMultiplier = rec.multiplier;
          break;
      }
    }

    // Execute based on market
    if (status.crypto.recommendation === 'PEAK_PERFORMANCE') {
      await this.executePeakStrategy();
    } else if (status.crypto.recommendation === 'REDUCE_ACTIVITY') {
      await this.executeConservativeStrategy();
    } else {
      await this.executeNormalStrategy();
    }
  }
}
```

---

**🚀 Gata de implementare! Ecosistem complet STOCKS + FUTURES + FOREX + CRYPTO cu logică automată de bot.**
