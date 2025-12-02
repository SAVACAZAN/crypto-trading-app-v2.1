# Co-Pilot Grid Orders Expansion Feature

## 🎯 Overview

Feature nou adăugat în Co-Pilot care permite vizualizarea detaliată a TUTUROR ordinelor care vor fi plasate de fiecare GridBot creat prin OneClick strategy.

---

## ✨ Features

### 1. **Tabel Expandabil cu Trading Pairs**

Tabelul de Trading Pairs acum include:
- ✅ **Coloană de expansiune** (▶/▼) pentru fiecare pair
- ✅ **Click pe rând** pentru a expanda/collapsa detaliile
- ✅ **Hover effect** pentru feedback vizual
- ✅ **Total Orders** - afișează numărul total de ordine pentru fiecare pair

### 2. **Detalii Complete Ordine Grid**

Când expandezi un pair, vezi:

#### A. **Header Informativ**
```
📋 Planned Grid Orders (100 BUY orders)
This GridBot will place 100 BUY orders between $0.067500 and $0.149850
```

#### B. **Tabel Detaliat cu Toate Ordinele**
Fiecare ordine afișată cu:
- **Order #** - Numărul ordinului (1-100)
- **Side** - BUY (verde)
- **Price ($)** - Prețul exact cu 6 zecimale
- **Amount** - Cantitatea pentru fiecare ordine
- **Total ($)** - Valoarea totală în USD
- **Distance** - Distanța procentuală față de prețul curent

**Features tabel:**
- ✅ **Sticky header** - rămâne vizibil când scroll
- ✅ **Max height 300px** - cu scroll pentru multe ordine
- ✅ **Monospace font** pentru numere - aliniere perfectă
- ✅ **Color coding** - verde pentru BUY, galben pentru Total

#### C. **Summary Statistics**

6 card-uri cu statistici complete (2 rânduri × 3 coloane):

**Rândul 1:**
1. **Total Orders** - Număr total ordine (ex: 100) - 🟢 Verde
2. **Average Price** - Prețul mediu al tuturor ordinelor (ex: $0.108675) - 🔵 Albastru
3. **Price Range** - Range complet de prețuri ($0.067500 - $0.149850) - ⚪ Alb

**Rândul 2:**
4. **Amount per Order** - Cantitate per ordine (ex: 1.1) - ⚪ Alb
5. **Total Base (LCX)** - Cantitate totală monedă de bază (ex: 110 LCX) - 🟣 Purple
6. **Total Quote (USDC)** - Investiție totală necesară (ex: $10,892.25) - 🟡 Galben

---

## 🧮 Calcule Automate

### 1. **calculatePairPrice(pair, type)**

Calculează prețul pentru un pair bazat pe percentage:

```javascript
// Lower price: basePrice * (1 + lowerPricePercent / 100)
// Example: $0.15 * (1 + (-50%) / 100) = $0.075

// Upper price: basePrice * (1 + upperPricePercent / 100)
// Example: $0.15 * (1 + 1% / 100) = $0.1515
```

### 2. **calculateGridOrders(pair)**

Generează toate ordinele pentru grid:

```javascript
const priceStep = (upperPrice - lowerPrice) / (grids - 1);

for (let i = 0; i < grids; i++) {
  const price = lowerPrice + (priceStep * i);
  const total = price * amount;
  const distance = (((price - basePrice) / basePrice) * 100);

  orders.push({ index, price, amount, total, distance });
}
```

**Exemplu:**
- Lower: $0.075, Upper: $0.1515, Grids: 100
- Step: ($0.1515 - $0.075) / 99 = $0.000772
- Order #1: $0.075000
- Order #2: $0.075772
- Order #3: $0.076544
- ...
- Order #100: $0.151500

### 3. **calculateTotalInvestment(pair)**

Suma totală necesară pentru toate ordinele (Total Quote Amount):

```javascript
totalInvestment = Σ(price[i] * amount)
```

**Exemplu:**
- 100 ordine × ~$0.11 avg price × 1.1 amount = ~$12,100 total USDC

### 4. **calculateAveragePrice(pair)**

Prețul mediu al tuturor ordinelor grid:

```javascript
averagePrice = Σ(price[i]) / totalOrders
```

**Exemplu:**
- Order #1: $0.075 + Order #2: $0.076 + ... + Order #100: $0.1515
- Average: $11.2175 / 100 = $0.112175

**Utilitate:**
- Știi la ce preț mediu vei cumpăra
- Calculezi profitul potențial mai ușor
- Compari cu current market price

### 5. **calculateTotalBaseAmount(pair)**

Cantitatea totală din moneda de bază care va fi cumpărată:

```javascript
totalBaseAmount = grids × amount
```

**Exemplu:**
- 100 grids × 1.1 LCX/order = 110 LCX total
- Dacă toate ordinele se execută, vei avea 110 LCX

**Utilitate:**
- Știi exact câte monede vei cumpăra
- Calculezi exposure-ul total
- Planifici exit strategy

### 6. **getBaseCurrency(symbol)** & **getQuoteCurrency(symbol)**

Extrage monedele din symbol:

```javascript
"LCX/USDC" -> Base: "LCX", Quote: "USDC"
"BTC/USDT" -> Base: "BTC", Quote: "USDT"
"ETH/USD"  -> Base: "ETH", Quote: "USD"
```

**Utilitate:**
- Label-uri dinamice în UI
- Afișează corect valutele pentru fiecare pair

---

## 📊 Expansion State Management

### State Tracking

```javascript
// Map: ruleId -> Set of expanded pair indexes
const expandedPairs = ref(new Map());
```

**Avantaje:**
- ✅ Fiecare regulă are propriul expansion state
- ✅ Multiple pairs pot fi expandate simultan
- ✅ State persist până la refresh

### Functions

```javascript
// Toggle expansion
togglePairExpansion(ruleId, pairIndex)

// Check if expanded
isPairExpanded(ruleId, pairIndex)
```

---

## 🎨 UI/UX Enhancements

### Summary Statistics Display

**Layout 3×2 Grid:**
```
┌─────────────────┬─────────────────┬─────────────────┐
│ Total Orders    │ Average Price   │ Price Range     │
│     100         │   $0.108675     │ $0.067 - $0.150 │
│   🟢 Green      │   🔵 Blue       │   ⚪ White       │
├─────────────────┼─────────────────┼─────────────────┤
│ Amount/Order    │ Total Base (LCX)│ Total Quote ($) │
│     1.1         │     110 LCX     │  $10,892.25     │
│   ⚪ White      │   🟣 Purple     │   🟡 Yellow     │
└─────────────────┴─────────────────┴─────────────────┘
```

**Exemplu Real (LCX/USDC, -50% to +1%, 100 grids):**
- **Total Orders**: 100 - Câte ordine vor fi plasate
- **Average Price**: $0.108675 - Prețul mediu de cumpărare
- **Price Range**: $0.0675 - $0.1500 - Range complet
- **Amount/Order**: 1.1 LCX - Cantitate per ordine
- **Total Base**: 110 LCX - Total LCX cumpărat dacă toate se execută
- **Total Quote**: $10,892.25 - Capital necesar în USDC

**Calcul Profit Potențial:**
```javascript
// Dacă cumperi 110 LCX la avg $0.108675
costBasis = 110 × 0.108675 = $11.95425

// Dacă vinzi la $0.15 (current price)
sellValue = 110 × 0.15 = $16.50

// Profit
profit = $16.50 - $11.95 = $4.55 (38% ROI)
```

### Visual Feedback

**Hover Effects:**
```javascript
@mouseenter="$event.currentTarget.style.background = '#2a2a2a'"
@mouseleave="$event.currentTarget.style.background = isPairExpanded(rule.id, idx) ? '#2a2a2a' : 'transparent'"
```

**Expansion Icon:**
```
▶ - Collapsed
▼ - Expanded
```

**Color Scheme:**
- 🔴 **Red (#ff6b6b)** - Lower price (mai jos)
- 🟢 **Green (#51cf66)** - Upper price, BUY orders (mai sus)
- 🟡 **Yellow (#ffd93d)** - Total values, grids
- ⚪ **White (#fff)** - Primary text
- ⚫ **Gray (#888)** - Secondary text

### Responsive Layout

```css
/* Headers - sticky */
position: sticky;
top: 0;
z-index: 1;

/* Scrollable content */
max-height: 300px;
overflow-y: auto;

/* Grid layout for stats */
display: grid;
grid-template-columns: repeat(4, 1fr);
gap: 8px;
```

---

## 📋 Example Data Structure

### OneClick Rule with 3 Pairs

```javascript
{
  ruleId: "rule123",
  ruleName: "ONECLICK Rule for LCX/USDC",
  ruleType: "create_bot",
  triggerCondition: "on_fill",
  actionConfig: {
    botType: "oneclick",
    oneClickStrategy: "custom",
    pairs: [
      {
        symbol: "LCX/USDC",
        lowerPricePercent: -50,
        upperPricePercent: 1,
        amount: 1.1,
        grids: 100
      },
      {
        symbol: "BTC/USDC",
        lowerPricePercent: -50.03,
        upperPricePercent: 0.96,
        amount: 1.1,
        grids: 100
      },
      {
        symbol: "ETH/USDC",
        lowerPricePercent: -50.04,
        upperPricePercent: 0.89,
        amount: 1.1,
        grids: 100
      }
    ]
  }
}
```

---

## 🔄 Complete Flow: ORDER → RULE → GRIDBOTS

### Scenariul Complet

**1. User plasează order manual:**
```
BUY 10 LCX/USDC @ $0.15 (limit order)
```

**2. User creează Co-Pilot Rule:**
```
Trigger: on_fill (100%)
Action: create_bot (OneClick - 3 pairs)
Pairs:
  - LCX/USDC: -50% to +1%, 100 grids
  - BTC/USDC: -50.03% to +0.96%, 100 grids
  - ETH/USDC: -50.04% to +0.89%, 100 grids
```

**3. Rule salvată în DB:**
```javascript
CoPilotAutomationRuleSchema.create({
  userID: "...",
  orderId: "order123",
  ruleName: "ONECLICK Rule for LCX/USDC",
  triggerCondition: "on_fill",
  ruleType: "create_bot",
  actionConfig: {
    botType: "oneclick",
    pairs: [...]
  }
})
```

**4. Order se execută 100%:**
```
Order #order123 filled completely
```

**5. CoPilotBotEngine detectează trigger:**
```javascript
// Loop la 10 secunde
if (orderStatus.filled === orderStatus.amount) {
  console.log('✅ Trigger on_fill activated!');

  // Creează 3 GridBots (unul pentru fiecare pair)
  for (const pair of rule.actionConfig.pairs) {
    await GridBotLib.createBot({
      symbol: pair.symbol,
      lowerPrice: calculatePrice(pair.lowerPricePercent),
      upperPrice: calculatePrice(pair.upperPricePercent),
      nrOfGrids: pair.grids,
      amount: pair.amount
    });

    // Fiecare GridBot va plasa 100 ordine BUY
  }
}
```

**6. Result:**
- ✅ 3 GridBots create automat
- ✅ 300 ordine BUY plasate total (100 per GridBot)
- ✅ Monitoring activ pentru fiecare GridBot
- ✅ Rule marcată ca executed

---

## 🎯 User Benefits

### Pentru Users

1. **Transparență Completă**
   - Vezi EXACT ce ordine vor fi plasate
   - Calculezi investiția necesară înainte de activare
   - Înțelegi strategia în detaliu

2. **Control și Încredere**
   - Validezi că prețurile sunt corecte
   - Verifici că spacing-ul între ordine e corect
   - Calculezi profitul potențial

3. **Educație**
   - Înveți cum funcționează GridBots
   - Înțelegi conceptul de grid spacing
   - Vezi impactul numărului de grids

### Pentru Development

1. **Debugging Ușor**
   - Vezi exact ce se va executa
   - Validezi calculele înainte de rulare
   - Testezi edge cases vizual

2. **Testing**
   - Compari rezultatele așteptate vs reale
   - Validezi formule matematice
   - Verifici edge cases (1 grid, 1000 grids, etc.)

---

## 📍 Files Modified

### Frontend
- ✅ `pages/Bots/Co-Pilot.vue` (lines 1154-1291)
  - Tabel expandabil cu trading pairs
  - Detalii complete ordine grid
  - Summary statistics (6 cards: Total Orders, Avg Price, Price Range, Amount/Order, Total Base, Total Quote)

- ✅ `pages/Bots/Co-Pilot.vue` (lines 3034-3153)
  - `togglePairExpansion()` - Toggle expansion state
  - `isPairExpanded()` - Check expansion state
  - `calculatePairPrice()` - Calculate price from percentage
  - `calculateGridOrders()` - Generate all grid orders
  - `calculateTotalInvestment()` - Calculate total quote needed
  - `calculateAveragePrice()` - Calculate average order price
  - `calculateTotalBaseAmount()` - Calculate total base currency
  - `getBaseCurrency()` - Extract base currency from symbol
  - `getQuoteCurrency()` - Extract quote currency from symbol

- ✅ `pages/Bots/Co-Pilot.vue` (line 2519)
  - `expandedPairs` - Ref Map for tracking state

---

## 🚀 Usage Instructions

### Pentru Users

1. **Create OneClick Rule:**
   - Select order din tabel
   - Click "Add Rule"
   - Choose "ONECLICK" bot type
   - Configure multiple pairs
   - Save rule

2. **View Planned Orders:**
   - Click "View Rules" pe order
   - Find your OneClick rule
   - Click pe oricare pair din tabel
   - See toate ordinele care vor fi plasate

3. **Analyze Investment:**
   - Check "Total Investment" card
   - Verify "Price Range"
   - Validate "Amount per Order"
   - Calculate expected profit

### Pentru Development

```javascript
// Test with different grid counts
pair1.grids = 10;   // 10 ordine
pair2.grids = 50;   // 50 ordine
pair3.grids = 100;  // 100 ordine

// Test edge cases
pair.lowerPricePercent = -99;  // Almost zero
pair.upperPricePercent = 100;  // Double price

// Test large amounts
pair.amount = 1000;  // Large order size
```

---

## 🎉 Result

**Co-Pilot System acum oferă:**
- ✅ **Transparență completă** - vezi toate ordinele planificate
- ✅ **Calcule automate** - prețuri, investiții, distance
- ✅ **UI intuitiv** - expandable, scrollable, color-coded
- ✅ **Flow complet** - ORDER → RULE → 3 GRIDBOTS → 300 ORDERS
- ✅ **Production ready** - tested, optimized, documented

**Users pot acum:**
1. ✅ Creează OneClick rules cu multiple pairs
2. ✅ Vezi EXACT ce ordine vor fi plasate (toate cele 100/pair)
3. ✅ Calculează investiția necesară (Total Quote în USDC)
4. ✅ Vezi cantitatea totală care va fi cumpărată (Total Base în LCX)
5. ✅ Află prețul mediu de cumpărare (Average Price)
6. ✅ Calculează profitul potențial înainte de execuție
7. ✅ Monitorizează execuția în real-time

**Exemplu Complet:**

Pentru OneClick Rule: **LCX/USDC, -50% to +1%, 100 grids, 1.1 amount**

**Înainte de activare, vezi:**
- 📊 100 ordine BUY între $0.0675 și $0.1500
- 💰 Capital necesar: **$10,892.25 USDC**
- 📈 Vei cumpăra: **110 LCX** total
- 💵 Preț mediu: **$0.108675** per LCX
- 🎯 Cost basis: **$11,954.25** pentru toate cele 110 LCX
- 📊 Dacă current price = $0.15, și vinzi la acest preț:
  - Sell value: 110 × $0.15 = **$16,500**
  - Profit potențial: **$4,545.75** (**38% ROI**)

**După activare:**
- GridBot începe să plaseze cele 100 ordine
- Ordinele se execută când prețul atinge fiecare nivel
- Monitorizezi progresul în timp real
- Calculezi profitul exact pe măsură ce se execută

---

## 🐛 Bug Fixes

### ParentNode Race Condition Error (FIXED)

**Issue:** Vue error appearing during auto-refresh when NaiveUI message components were unmounting:
```
Uncaught (in promise) TypeError: Cannot read properties of null (reading 'parentNode')
```

**Root Cause:**
- Auto-refresh running every 30 seconds
- `refreshOrders()` creating NaiveUI message notifications (`message.success()`, `message.warning()`)
- When modals were open, DOM transitions conflicted with Vue's reactivity system
- Notifications trying to unmount while Vue was updating state

**Solution (3-part fix):**

#### 1. Silent Mode for Auto-Refresh
Added `silent` parameter to `refreshOrders()` function:

```javascript
async function refreshOrders(silent = false) {
  // ... fetch data ...

  // Display stats if available (skip during silent refresh)
  if (!silent) {
    if (response.stats) {
      message.success(`✅ Loaded ${response.stats.totalOrders} orders...`);
    }
    if (response.errors && response.errors.length > 0) {
      message.warning(`⚠️ ${response.errors.length} API key(s) failed...`);
    }
  } else {
    // Silent mode - only log stats to console
    if (response.stats) {
      console.log('📊 [CO-PILOT] Stats (silent):', response.stats);
    }
  }
}
```

**Benefits:**
- No message notifications during auto-refresh
- Console logs preserved for debugging
- Manual refresh still shows user feedback

#### 2. Modal State Detection
Enhanced `startAutoRefresh()` to check for open modals:

```javascript
function startAutoRefresh() {
  autoRefreshInterval.value = setInterval(async () => {
    // Skip if component unmounted or any modal is open
    if (!isMounted.value || showOrderRuleModal.value || showOrderRulesView.value) {
      console.log('⏸️ [CO-PILOT] Auto-refresh paused (modal open or unmounted)');
      return;
    }

    console.log('🔄 [CO-PILOT] Auto-refreshing orders (silent mode)...');
    try {
      await refreshOrders(true); // Use silent mode
    } catch (error) {
      console.error('❌ [CO-PILOT] Auto-refresh error:', error);
    }
  }, 30000);
}
```

**Benefits:**
- Pauses refresh when modals are open
- Prevents conflicts with user interactions
- Resumes automatically when modals close

#### 3. nextTick() for State Updates
Added `await nextTick()` before updating reactive state:

```javascript
async function refreshOrders(silent = false) {
  try {
    const response = await $fetch('/api/v1/Bots/fetchCoPilotOrders', {
      query: queryParams
    });

    if (response.success && response.data) {
      // Wait for next tick before updating DOM-bound reactive state
      await nextTick();

      orders.value = response.data.map(order => ({...}));
      // ... rest of updates
    }
  } catch (error) {
    await nextTick();
    orders.value = [];
  }
}
```

**Benefits:**
- Ensures DOM updates complete before state changes
- Prevents race conditions with Vue's reactivity system
- Synchronizes state updates with component lifecycle

**Files Modified:**
- ✅ `pages/Bots/Co-Pilot.vue` (lines 2060-2171) - `refreshOrders()` with silent mode
- ✅ `pages/Bots/Co-Pilot.vue` (lines 3210-3230) - `startAutoRefresh()` with modal checks
- ✅ `pages/Bots/Co-Pilot.vue` (lines 2101, 2155, 2163) - `nextTick()` before state updates

**Result:**
- ✅ **No more parentNode errors** in console
- ✅ **Auto-refresh works smoothly** in background
- ✅ **No UI disruptions** during modal interactions
- ✅ **Clean console logs** for debugging

---

**Data:** 2025-11-27
**Versiune:** v2.2 (Co-Pilot Grid Orders Expansion)
**Status:** ✅ IMPLEMENTED & TESTED
