# 🤖 Trading Bots Documentation

## Overview

Această aplicație include 9 tipuri de roboți de trading automatizat, fiecare optimizat pentru strategii diferite de trading pe piețele crypto. Toți roboții funcționează pe multiple exchange-uri (LCX, Coinbase Advanced, Kraken, Bitrue, Probit).

---

## 📊 Lista Completă de Roboți

### 1. **Grid Bot** 🎯
**Tip:** Bot de Grid Trading Clasic
**Schema:** `gridBot.schema.js`
**Colecție MongoDB:** `GridBots`

#### Descriere Detaliată:
Grid Bot este un robot clasic de grid trading care plasează automat ordine de cumpărare și vânzare pe mai multe nivele de preț (grids) între un preț minim și maxim definit.

#### Caracteristici Principale:
- **Grid Trading Automatic:** Plasează ordine pe multiple nivele de preț
- **Buy & Sell Orders:** Suportă ordine de cumpărare, vânzare sau ambele (BOTH)
- **Deviation Control:** Controlul deviației prețurilor și cantităților pentru buy/sell
- **Price Grouping:** Grupare opțională a prețurilor în zone
- **Balance Tracking:** Urmărește balanța bot-ului și profitul în timp real
- **Take Profit:** Două strategii de take profit configurabile
- **Bot Actions:** Reset, cancel orders, și acțiuni custom (X1-X4)

#### Parametri Configurabili:
```javascript
{
  name: "Grid Bot Name",
  exchange: "lcx/coinbaseadvanced/kraken/bitrue/probit",
  symbol: "LCX/USDC",
  apiKeyName: "Main Account", // Opțional - suportă multiple API keys
  lowerPrice: "0.10",          // Limita inferioară a grid-ului
  upperPrice: "0.20",          // Limita superioară a grid-ului
  amount: "1000",              // Suma totală investită
  amountType: "QUOTE/BASE",    // Tipul sumei
  nrOfGrids: "10",             // Numărul de nivele grid
  ordersSide: "BUY/SELL/BOTH", // Tipul ordinelor
  config: {
    deviationPriceBuy: "0.5",    // Deviație % pentru prețul buy
    deviationPriceSell: "0.5",   // Deviație % pentru prețul sell
    deviationAmountBuy: "0",     // Deviație % pentru cantitatea buy
    deviationAmountSell: "0",    // Deviație % pentru cantitatea sell
    usePriceGroup: false,        // Activează gruparea prețurilor
    priceGroupBuy: "3",          // Grupe pentru buy
    priceGroupSell: "3"          // Grupe pentru sell
  },
  BalanceBot: {
    BalanceBase: "100.50",           // Balanța curentă în moneda de bază
    BalanceQuote: "1000.00",         // Balanța curentă în moneda quote
    BalanceBaseInUSD: "15.075",      // Valoarea în USD a bazei
    BalanceQuoteInUSD: "1000.00",    // Valoarea în USD a quote
    BalanceBaseProfit: "5.50",       // Profit în moneda de bază
    BalanceQuoteProfit: "50.00",     // Profit în moneda quote
    BalanceBotProfit: "55.50",       // Profit total bot
    BalanceBotValInitiala: "1000"    // Valoarea inițială investită
  },
  TakeProfitBot: {
    TakeProfitBotSTR1: "enabled",    // Take profit strategy 1
    TakeProfitBotSTR2: "disabled"    // Take profit strategy 2
  }
}
```

#### Use Case:
- Market-making între două prețuri
- Profit din volatilitate în range-uri definite
- Trading automat în piețe laterale (sideways)

---

### 2. **DCA Bot** 💰
**Tip:** Dollar Cost Averaging Bot
**Schema:** `dcaBot.schema.js`
**Colecție MongoDB:** `DCABots`

#### Descriere Detaliată:
DCA Bot implementează strategia Dollar Cost Averaging cu safety orders și take profit automat. Ideal pentru acumulare graduală și reducerea riscului.

#### Caracteristici Principale:
- **Base Order:** Ordine inițială la start
- **Safety Orders:** Ordine suplimentare la scăderi de preț
- **Take Profit Automat:** Închidere automată la profit target
- **Stop Loss:** Protecție la pierderi mari
- **Leverage Support:** Suportă trading cu leverage
- **Deal Management:** Gestionează multiple deal-uri simultan
- **Profit Tracking:** Urmărește profitul total al bot-ului

#### Parametri Configurabili:
```javascript
{
  isRunning: true,
  exchange: "lcx",
  symbol: "LCX/USDC",
  direction: "LONG/SHORT",           // Direcția trade-ului
  baseOrderAmount: 100,              // Suma ordinului inițial
  baseOrderType: "MARKET/LIMIT",     // Tipul ordinului de bază
  takeProfitOrderPercent: 3.0,       // % take profit (ex: 3%)
  safetyOrderAmount: 50,             // Suma fiecărui safety order
  safetyOrderPercent: 2.0,           // % scădere pentru safety order
  maxSafetyOrdersCount: 5,           // Număr maxim de safety orders
  stopLossOrderPercent: 10.0,        // % stop loss
  leverage: 1,                       // Leverage (1 = no leverage)
  marketType: "SPOT/FUTURES",        // Tip piață
  dealStartCondition: "MANUAL/AUTO", // Condiție start deal
  activeDeal: {
    // Obiect cu informații despre deal-ul activ
  },
  closedDeals: [],                   // Array cu deal-urile închise
  profit: 0,                         // Profit total
  logs: []                           // Log-uri bot
}
```

#### Exemplu Funcționare:
1. **Start:** Bot plasează base order de 100 USDC la 0.15
2. **Safety Order 1:** Preț scade 2% → plasează 50 USDC la 0.147
3. **Safety Order 2:** Preț scade încă 2% → plasează 50 USDC la 0.144
4. **Take Profit:** Preț urcă la 3% profit → vinde totul

#### Use Case:
- Acumulare graduală la scăderi de preț
- Reducerea prețului mediu de achiziție
- Trading automat în trend-uri descendente

---

### 3. **OneClick Bot** ⚡
**Tip:** Grid Bot Simplificat cu Un Click
**Schema:** `OneClickBot.schema.js`
**Colecție MongoDB:** `OneClickBots`

#### Descriere Detaliată:
OneClick Bot este o versiune simplificată a Grid Bot-ului, optimizată pentru deployment rapid și configurare minimă. Ideal pentru beginneri.

#### Caracteristici:
- Similar cu Grid Bot dar cu interfață simplificată
- Configurare rapidă "one-click"
- Toate caracteristicile Grid Bot-ului
- Parametri pre-configurați pentru cele mai comune strategii

#### Diferențe față de Grid Bot:
- Interface mai simplă
- Mai puține opțiuni de customizare
- Templates pre-configurate
- Setup mai rapid

#### Use Case:
- Începători în grid trading
- Deployment rapid de strategii simple
- Testing de strategii fără configurare complexă

---

### 4. **CoPilot Bot** 🎮
**Tip:** Grid Bot Avansat cu Incremental Amount
**Schema:** `CoPilotBot.schema.js`
**Colecție MongoDB:** `CoPilotBot`

#### Descriere Detaliată:
CoPilot Bot este un grid bot avansat care ajustează automat cantitățile ordinelor în mod incremental pe măsură ce prețul se deplasează. "Asistă" trader-ul în gestionarea pozițiilor.

#### Caracteristici Unice:
- **Incremental Amount Buy/Sell:** Cantități crescătoare/descrescătoare
- **PriceStart:** Preț de start cu cantitate dedicată
- **Dynamic Grid Adjustment:** Ajustare dinamică a grid-ului
- **Price Deviation:** Control fin al deviației prețurilor
- **Amount Scaling:** Scalare automată a cantităților

#### Parametri Configurabili:
```javascript
{
  name: "CoPilot Bot",
  exchange: "lcx",
  symbol: "LCX/USDC",
  PriceStart: "0.15",                    // Preț de start
  amountPriceStart: "500",               // Cantitate la PriceStart
  lowerPrice: "0.10",
  upperPrice: "0.20",
  amount: "1000",
  nrOfGrids: "10",
  ordersSide: "BOTH",
  incrementalPercentAmountBuy: "10",     // % increment pentru buy
  incrementalPercentAmountSell: "10",    // % increment pentru sell
  deviationPriceBuy: "0.5",
  deviationPriceSell: "0.5",
  deviationAmountBuy: "0",
  deviationAmountSell: "0",
  usePriceGroup: false,
  priceGroupBuy: "3",
  priceGroupSell: "3"
}
```

#### Exemplu Funcționare:
**Buy Orders cu 10% increment:**
- Grid 1: 10 LCX la 0.10
- Grid 2: 11 LCX la 0.11 (+10%)
- Grid 3: 12.1 LCX la 0.12 (+10%)
- ...

#### Use Case:
- Acumulare crescătoare la prețuri mai mici
- Vânzare crescătoare la prețuri mai mari
- Strategie "averaging down" avansată

---

### 5. **Grinder Bot** ⚙️
**Tip:** Grid Bot pentru High-Frequency Trading
**Schema:** `grinderBot.schema.js`
**Colecție MongoDB:** `GrinderBots`

#### Descriere Detaliată:
Grinder Bot este optimizat pentru trading de înaltă frecvență în range-uri mici de preț. "Măcină" profitul din mișcări mici repetate.

#### Caracteristici:
- Similar cu Grid Bot
- Optimizat pentru range-uri mici (1-3%)
- Multe grid-uri (20-50)
- Profit din volatilitate micro
- Balance tracking avansat

#### Parametri Specifici:
```javascript
{
  name: "Grinder Bot",
  nrOfGrids: "50",              // Multe grid-uri
  lowerPrice: "0.145",          // Range mic
  upperPrice: "0.155",          // Range mic (~7%)
  BalanceBotStart: "1000",      // Tracking balanță inițială
  // ... restul similar cu Grid Bot
}
```

#### Use Case:
- High-frequency trading în range-uri strânse
- Profit din spread mic
- Market-making agresiv

---

### 6. **Scalp1ng Bot** 🔪
**Tip:** Scalping Grid Bot
**Schema:** `Scalp1ngBot.schema.js`
**Colecție MongoDB:** `Scalp1ngBot`

#### Descriere Detaliată:
Scalp1ng Bot execută strategii de scalping automat - profit rapid din mișcări foarte mici de preț.

#### Caracteristici:
- Grid trading ultra-rapid
- Profit target foarte mic (0.1-0.5%)
- Time-based exit
- Multe ordine active simultan

#### Diferențe față de Grinder Bot:
- **Grinder:** Focus pe multe grid-uri în range mic
- **Scalp1ng:** Focus pe profit foarte rapid din orice mișcare

#### Use Case:
- Profit rapid din volatilitate micro
- Trading în piețe foarte lichide
- Execuție rapidă, exit rapid

---

### 7. **Fib Bot** 📐
**Typ:** Fibonacci Grid Bot
**Schema:** `FibBot.schema.js`
**Colecție MongoDB:** `FibBot`

#### Descriere Detaliată:
Fib Bot folosește secvența Fibonacci pentru a plasa ordine pe nivele matematice specifice. Combină analiza tehnică Fibonacci cu grid trading.

#### Caracteristici Unice:
- **Fibonacci Sequence:** Ordine plasate pe nivele Fibonacci
- **PriceStart Trading:** Ordine specială la preț de start
- **Range Trading:** Activare/dezactivare trading în range
- **Cycle Tracking:** Tracking cicluri complete și refills
- **Dynamic Range:** Ajustare automată a range-ului activ

#### Parametri Configurabili:
```javascript
{
  name: "Fib Bot",
  exchange: "lcx",
  symbol: "LCX/USDC",
  PriceStart: "0.15",                    // Preț de start
  amountPriceStart: "500",               // Cantitate la start
  lowerPrice: "0.10",
  upperPrice: "0.20",
  amount: "1000",
  nrOfGrids: "8",                        // Nivele Fibonacci (0.236, 0.382, 0.5, 0.618, etc)
  incrementalPercentAmountBuy: "15",     // % increment Fibonacci
  incrementalPercentAmountSell: "15",

  // Tracking avansat
  activeOrders: [],                      // Ordine grid active
  activeOrdersPriceStart: [],            // Ordine PriceStart active
  filledOrders: [],                      // Ordine filled

  InitialActiveRange: {
    grilaList: [],                       // Lista grid-urilor active
    PriceStartInfo: {}                   // Info despre PriceStart
  },

  FilledCycle: 0,                        // Număr cicluri complete
  ReFilledCycle: 0,                      // Număr refills
  ActiveRANGE: false,                    // Range trading activ?

  PriceStartTRADE: {
    price: "0.15",                       // Preț filled PriceStart
    amount: "500"                        // Cantitate filled
  }
}
```

#### Nivele Fibonacci Standard:
- 0.236 (23.6%)
- 0.382 (38.2%)
- 0.500 (50%)
- 0.618 (61.8%) - "Golden Ratio"
- 0.786 (78.6%)

#### Exemplu Funcționare:
**Range: 0.10 - 0.20 (diferență 0.10)**

Nivele Fibonacci:
1. 0.10 + (0.10 × 0.236) = 0.1236
2. 0.10 + (0.10 × 0.382) = 0.1382
3. 0.10 + (0.10 × 0.500) = 0.1500 (PriceStart)
4. 0.10 + (0.10 × 0.618) = 0.1618
5. 0.10 + (0.10 × 0.786) = 0.1786

#### Use Case:
- Trading bazat pe analiza tehnică Fibonacci
- Suport/Rezistență matematică
- Strategie de retracement

---

### 8. **DKD Bot** 🎯
**Tip:** Dynamic Kill Deal Bot
**Schema:** `DkdBot.schema.js`
**Colecție MongoDB:** `DkdBot`

#### Descriere Detaliată:
DKD Bot este un bot avansat care combină grid trading cu gestionare dinamică a deal-urilor și "kill conditions" pentru exit automat.

#### Caracteristici:
- Grid trading cu PriceStart
- Incremental amounts
- Kill conditions automate
- Deal management avansat
- Price deviation control
- Price grouping

#### Parametri Configurabili:
```javascript
{
  name: "DKD Bot",
  PriceStart: "0.15",                    // Preț de start
  amountPriceStart: "500",               // Cantitate opțională
  incrementalPercentAmountBuy: "10",     // Increment buy
  incrementalPercentAmountSell: "10",    // Increment sell
  // ... + toate parametrii Grid Bot
}
```

#### Kill Conditions:
- Preț atinge target
- Timp expirat
- Profit/Loss target atins
- Volume conditions
- Manual trigger

#### Use Case:
- Grid trading cu exit automat
- Protecție avansată la risc
- Trading în trend-uri cu reversal detection

---

### 9. **FrontRunning Bot** 🏃
**Tip:** Front-Running Detection & Execution Bot
**Schema:** `frontRunningBot.schema.js`
**Colecție MongoDB:** `fr`

#### Descriere Detaliată:
FrontRunning Bot detectează și execută automat ordine înaintea altor ordine mari pe piață (front-running). **ATENȚIE: Această practică poate fi ilegală sau împotriva regulilor exchange-ului!**

#### Caracteristici:
- Similar cu DCA Bot în structură
- Detection de ordine mari
- Execuție rapidă
- Leverage support
- Profit din slippage

#### **⚠️ AVERTISMENT IMPORTANT:**
Front-running poate fi:
- Ilegal în multe jurisdicții
- Împotriva Terms of Service a exchange-urilor
- Subiect de sancțiuni și ban-uri
- Eticnică problemă în trading

**Recomandare:** Folosește acest bot doar în scopuri educaționale sau în medii de testare!

---

## 🔄 Sistem de Sincronizare Automată

### Background Balance Sync Scheduler

Aplicația include un sistem automat de sincronizare a balanțelor pentru toți userii:

#### Caracteristici:
- **Interval:** Rulează la fiecare 1 minut
- **Auto-start:** Pornește automat când serverul pornește
- **Rate Limiting LCX:** 2 secunde între request-uri LCX
- **User Delay:** 5 secunde între useri
- **Error Handling:** Continuă în caz de erori
- **Logging:** Log-uri detaliate pentru monitoring

#### Flux:
```
Minut 0:00 → User 1 (toate exchange-urile)
          ↓ (5s delay)
          → User 2 (toate exchange-urile)
          ↓ (5s delay)
          → User 3 (toate exchange-urile)

Minut 1:00 → Restart
```

#### Fișier:
`server/plugins/balanceSyncScheduler.js`

---

## 📦 Structura Comună pentru Toți Roboții

### Active Orders
```javascript
activeOrders: [
  {
    id: "order_123",
    price: "0.15",
    amount: "10",
    side: "BUY",
    status: "OPEN",
    timestamp: "2024-10-18T12:00:00Z"
  }
]
```

### Filled Orders
```javascript
filledOrders: [
  {
    id: "order_123",
    price: "0.15",
    amount: "10",
    side: "BUY",
    status: "FILLED",
    filledAt: "2024-10-18T12:05:00Z",
    profit: "5.50"
  }
]
```

### Balance Tracking
Toți roboții (Grid, OneClick, Grinder, Scalp1ng, Fib) au tracking avansat de balanță:

```javascript
BalanceBot: {
  BalanceBase: "100.50",           // Moneda de bază (ex: LCX)
  BalanceQuote: "1000.00",         // Moneda quote (ex: USDC)
  BalanceBaseInUSD: "15.075",      // Valoare USD bază
  BalanceQuoteInUSD: "1000.00",    // Valoare USD quote
  BalanceBaseProfit: "5.50",       // Profit în bază
  BalanceQuoteProfit: "50.00",     // Profit în quote
  BalanceBotProfit: "55.50",       // Profit total
  BalanceBotValInitiala: "1000"    // Investiție inițială
}
```

---

## 🔧 Bot Actions

Majoritatea roboților grid (Grid, OneClick, Grinder, Scalp1ng) suportă acțiuni manuale:

```javascript
BotAction: {
  BotReset: "true",              // Reset bot și șterge toate ordinele
  BotCancelOrders: "true",       // Anulează toate ordinele active
  BotX1: "custom_action_1",      // Acțiune custom 1
  BotX2: "custom_action_2",      // Acțiune custom 2
  BotX3: "custom_action_3",      // Acțiune custom 3
  BotX4: "custom_action_4"       // Acțiune custom 4
}
```

---

## 🎨 Take Profit Strategies

Majoritatea roboților grid suportă două strategii de take profit:

```javascript
TakeProfitBot: {
  TakeProfitBotSTR1: "enabled",    // Strategie 1: Close all la % profit
  TakeProfitBotSTR2: "disabled"    // Strategie 2: Trailing stop
}
```

---

## 🌐 Exchange Support

Toți roboții funcționează pe următoarele exchange-uri:

- ✅ **LCX** (cu rate limiting special)
- ✅ **Coinbase Advanced**
- ✅ **Kraken**
- ✅ **Bitrue**
- ✅ **ProBit**

---

## 📊 Comparație Roboți

| Bot | Complexitate | Viteză | Profit Target | Use Case |
|-----|--------------|--------|---------------|----------|
| Grid Bot | ⭐⭐⭐ | Medium | 1-5% | Market making în range |
| DCA Bot | ⭐⭐ | Low | 3-10% | Acumulare graduală |
| OneClick Bot | ⭐ | Medium | 1-5% | Grid simplificat |
| CoPilot Bot | ⭐⭐⭐⭐ | Medium | 2-7% | Grid incremental |
| Grinder Bot | ⭐⭐⭐ | High | 0.5-2% | High-frequency în range mic |
| Scalp1ng Bot | ⭐⭐⭐⭐ | Very High | 0.1-1% | Scalping rapid |
| Fib Bot | ⭐⭐⭐⭐ | Medium | 3-8% | Trading Fibonacci |
| DKD Bot | ⭐⭐⭐⭐⭐ | Medium | Variabil | Grid cu kill conditions |
| FrontRun Bot | ⭐⭐⭐⭐⭐ | Very High | Variabil | ⚠️ Front-running (risky) |

---

## 🚀 Best Practices

### Grid Bot Family (Grid, OneClick, Grinder, Scalp1ng, Fib)
1. **Range Selection:** Alege range bazat pe volatilitate istorică
2. **Grid Count:** Mai multe grid-uri = profit mai mic per trade, dar mai multe trade-uri
3. **Amount Distribution:** Consideră deviații pentru optimizare
4. **Take Profit:** Setează target realistic bazat pe volatilitate

### DCA Bot
1. **Safety Orders:** Nu depăși 50% din capital pe safety orders
2. **Take Profit:** Minimum 2× mai mare decât safety order percent
3. **Stop Loss:** Obligatoriu pentru protecție
4. **Base Order:** Start cu 20-30% din capital total

### Advanced Bots (CoPilot, Fib, DKD)
1. **Testing:** Testează extensiv în testnet sau cu sume mici
2. **Monitoring:** Monitorizează constant performance
3. **Adjustments:** Ajustează parametrii bazat pe rezultate
4. **Risk Management:** Setează limite clare de risc

---

## ⚠️ Disclaimer

Toți roboții sunt instrumente de trading automat care comportă riscuri semnificative:
- Pierderi de capital
- Erori tehnice
- Slippage
- Rate limits de la exchange-uri
- Condiții de piață nefavorabile

**Tranzacționează responsabil și nu investi mai mult decât îți permiți să pierzi!**

---

## 📝 Developer Notes

### Adăugare Bot Nou
Pentru a adăuga un bot nou:

1. Creează schema în `server/models/[BotName].schema.js`
2. Adaugă endpoint delete în `server/api/v1/deleteDB[BotName]BotsData.get.js`
3. Adaugă în `pages/dev-tools.vue` pentru gestionare
4. Implementează logica bot în `strategies/` dacă e nevoie

### Testing
- Folosește `dev-tools` page pentru ștergere date test
- Monitorizează logs în consolă
- Verifică MongoDB pentru consistență date

---

**Versiune:** 2.2
**Ultima actualizare:** Octombrie 2024
**Autor:** TOP BOTZ Team
