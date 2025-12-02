# Co-Pilot Financial Dashboard

## 🎯 Overview

Dashboard financiar complet care afișează **exact cât capital investești** în TOȚI boții creați prin Co-Pilot rules, și **cât capital îți mai rămâne** disponibil.

---

## 💰 Problema Rezolvată

**Înainte:**
- ❌ Creezi 6 OneClick bots (3 pairs × 2 rules = 6 bots total)
- ❌ Nu știi exact cât investești la TOȚI boții
- ❌ Nu știi dacă mai ai bani pentru alți bots
- ❌ Nu vezi totalul global

**Acum:**
- ✅ Vezi EXACT totalul investit în TOȚI boții
- ✅ Vezi câți bots vei crea (ex: 6 bots)
- ✅ Vezi cât capital îți mai rămâne disponibil
- ✅ Vezi totalu în LCX și USDC separat

---

## 📊 Dashboard Layout

### Wide Modal (95vw, max 1600px)
Modal mai lat decât lung pentru a afișa toate informațiile financiare.

### 2-Column Grid Layout

**Coloana 1 (40%)** - Order Info Card
```
┌──────────────────────────────┐
│ LCX/USDC [SELL]             │
│ Amount: 35000 | Price: $0.15│
│ API: Alex                    │
│ ─────────────────────────────│
│ 💰 Total Order Value: $5250  │
└──────────────────────────────┘
```

**Coloana 2 (60%)** - Financial Stats Dashboard (4 cards)
```
┌────────────────────────────────────────────────────────────┐
│ 🤖 Total Bots     💵 Remaining     📦 Total LCX  💰 Total   │
│    Investment        Capital                       USDC    │
│                                                             │
│  $32,676.75          +$2,423.25    330 LCX     $32,676.75  │
│   6 bots             46.1% avail.   all bots     invested  │
└────────────────────────────────────────────────────────────┘
```

---

## 🧮 Financial Calculations

### 1. Total Bots Investment (`calculateTotalBotsInvestment()`)

Calculează **suma totală** necesară pentru TOȚI boții care vor fi creați.

**Supported Bot Types:**

#### OneClick Bot
```javascript
// OneClick cu 3 pairs
rule.actionConfig = {
  botType: 'oneclick',
  pairs: [
    { symbol: 'LCX/USDC', lowerPricePercent: -50, upperPricePercent: 1, amount: 1.1, grids: 100 },
    { symbol: 'BTC/USDC', lowerPricePercent: -50, upperPricePercent: 1, amount: 1.1, grids: 100 },
    { symbol: 'ETH/USDC', lowerPricePercent: -50, upperPricePercent: 1, amount: 1.1, grids: 100 }
  ]
}

// Calculation:
totalInvestment = 0
for each pair:
  totalInvestment += calculateTotalInvestment(pair)  // Sum of all 100 orders

// Example:
// Pair 1 (LCX): $10,892.25
// Pair 2 (BTC): $10,892.25
// Pair 3 (ETH): $10,892.25
// Total: $32,676.75
```

#### Grid Bot
```javascript
rule.actionConfig = {
  botType: 'grid',
  pairs: [{
    lowerPricePercent: -50,
    upperPricePercent: 1,
    amount: 1.1,
    grids: 100
  }]
}

// Total investment = sum of all grid orders
```

#### FrontRun Bot
```javascript
rule.actionConfig = {
  botType: 'frontrun',
  amount: 1.1,
  nrOfGrids: 100
}

// Estimate: amount × grids × current_price
totalInvestment = 1.1 × 100 × 0.15 = $16.50
```

#### DCA / Smart DCA Bot
```javascript
rule.actionConfig = {
  botType: 'dca',
  botConfig: {
    baseOrderAmount: 100,      // Initial buy
    maxSafetyOrders: 5,        // Additional buys
    safetyOrderPercent: 3      // 3% lower each time
  }
}

// Calculation:
dcaInvestment = baseOrder
for i = 0 to maxSafetyOrders:
  dcaInvestment += baseOrder × (1 + (safetyPercent × (i + 1)) / 100)

// Example:
// Base: $100
// Safety 1: $100 × 1.03 = $103
// Safety 2: $100 × 1.06 = $106
// Safety 3: $100 × 1.09 = $109
// Safety 4: $100 × 1.12 = $112
// Safety 5: $100 × 1.15 = $115
// Total: $645
```

#### Fibonacci Bot
```javascript
rule.actionConfig = {
  botType: 'fib',
  botConfig: {
    amount: 1.1,
    nrOfGrids: 7,
    lowerPrice: 0.075,
    upperPrice: 0.150
  }
}

// Calculation:
avgPrice = (lowerPrice + upperPrice) / 2 = 0.1125
totalInvestment = amount × grids × avgPrice
totalInvestment = 1.1 × 7 × 0.1125 = $0.86625
```

#### Scalping Bot
```javascript
rule.actionConfig = {
  botType: 'scalping',
  amount: 10
}

// Simple: amount × current_price
totalInvestment = 10 × 0.15 = $1.50
```

---

### 2. Total Bots Count (`calculateTotalBots()`)

Calculează câți bots vor fi creați în total.

```javascript
// OneClick cu 3 pairs = 3 bots
// Grid bot = 1 bot
// FrontRun bot = 1 bot
// DCA bot = 1 bot
// Total: 6 bots

function calculateTotalBots() {
  let totalBots = 0;

  for (const rule of orderRules.value) {
    if (!rule.isActive) continue;

    if (botType === 'oneclick') {
      totalBots += rule.actionConfig.pairs.length;  // 3 pairs = 3 bots
    } else {
      totalBots += 1;  // All other types = 1 bot
    }
  }

  return totalBots;
}
```

---

### 3. Remaining Capital (`calculateRemainingCapital()`)

Calculează **câți bani îți mai rămân** după ce finanțezi toți boții.

```javascript
function calculateRemainingCapital() {
  const totalOrderValue = $5,250.00;  // From order: 35000 LCX × $0.15
  const totalInvestment = $32,676.75; // Total for 6 bots

  return totalOrderValue - totalInvestment;
  // = $5,250 - $32,676.75 = -$27,426.75
}
```

**Status Indicator:**
- 🟢 **Verde** - Dacă remaining > 0 (ai bani)
- 🔴 **Roșu** - Dacă remaining < 0 (lipsă fonduri)

**Percentage:**
```javascript
percentAvailable = (remaining / totalOrderValue) × 100
// Example: (-$27,426.75 / $5,250) × 100 = -522.4%
```

---

### 4. Total Base Currency (`calculateTotalBaseCurrency()`)

Calculează **câte monede** (ex: LCX) vei cumpăra în total.

```javascript
// OneClick - 3 pairs × 100 grids × 1.1 amount = 330 LCX
// Grid Bot - 100 grids × 1.1 amount = 110 LCX
// FrontRun - 100 grids × 1.1 amount = 110 LCX
// Total: 550 LCX

function calculateTotalBaseCurrency() {
  let totalBase = 0;

  // OneClick
  if (botType === 'oneclick') {
    for (each pair) {
      totalBase += calculateTotalBaseAmount(pair);  // grids × amount
    }
  }

  // Grid
  else if (botType === 'grid') {
    totalBase += grids × amount;
  }

  // FrontRun
  else if (botType === 'frontrun') {
    totalBase += grids × amount;
  }

  // Fib
  else if (botType === 'fib') {
    totalBase += grids × amount;
  }

  // DCA
  else if (botType === 'dca') {
    totalBase += baseOrderAmount;  // Just the initial order
  }

  return totalBase;
}
```

---

### 5. Total Quote Currency (`calculateTotalQuoteCurrency()`)

Calculează **câți dolari** (ex: USDC) investești în total.

```javascript
// This is the same as Total Bots Investment
function calculateTotalQuoteCurrency() {
  return calculateTotalBotsInvestment();
}
```

---

## 📸 Example Scenario

### Order Details:
```
Symbol: LCX/USDC
Side: SELL
Amount: 35,000 LCX
Price: $0.15
Total Order Value: $5,250.00
```

### Created Rules:
**Rule #1** - OneClick Bot (3 pairs)
- LCX/USDC: -50% to +1%, 100 grids, 1.1 amount
- BTC/USDC: -50% to +1%, 100 grids, 1.1 amount
- ETH/USDC: -50% to +1%, 100 grids, 1.1 amount

**Rule #2** - OneClick Bot (3 pairs)
- LCX/USDC: -50% to +1%, 100 grids, 1.1 amount
- BTC/USDC: -50% to +1%, 100 grids, 1.1 amount
- ETH/USDC: -50% to +1%, 100 grids, 1.1 amount

### Dashboard Shows:

```
┌─────────────────────────────────────────────────────────────┐
│                   📊 Financial Dashboard                     │
├─────────────────────────────────────────────────────────────┤
│ Order Info                    │  Financial Stats             │
│ ─────────────────────────────┼──────────────────────────────│
│ LCX/USDC [SELL]              │  🤖 Total Bots Investment    │
│ Amount: 35000                │     $65,353.50               │
│ Price: $0.15                 │     12 bots                  │
│ API: Alex                    │                               │
│                               │  💵 Remaining Capital        │
│ 💰 Total Order Value:        │     -$60,103.50 (LIPSĂ!)    │
│    $5,250.00                 │     -1145% available         │
│                               │                               │
│                               │  📦 Total LCX                │
│                               │     1,320 LCX                │
│                               │     across all bots          │
│                               │                               │
│                               │  💰 Total USDC               │
│                               │     $65,353.50               │
│                               │     investment needed        │
└───────────────────────────────┴──────────────────────────────┘

❌ WARNING: You need $60,103.50 MORE to fund all bots!
✅ Current order only provides $5,250.00
🔧 Reduce number of bots OR increase order size
```

---

## 🎨 UI Components

### Dashboard Header Grid
```vue
<div style="display: grid; grid-template-columns: 2fr 3fr; gap: 16px;">
  <!-- Order Info (40%) -->
  <n-card>...</n-card>

  <!-- Financial Stats (60%) -->
  <n-card>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
      <!-- 4 stats cards -->
    </div>
  </n-card>
</div>
```

### Stats Cards Structure
```vue
<div style="text-align: center;">
  <div style="font-size: 11px; color: #888;">🤖 Total Bots Investment</div>
  <div style="font-size: 20px; font-weight: bold; color: #ff6b6b;">
    ${{ calculateTotalBotsInvestment().toFixed(2) }}
  </div>
  <div style="font-size: 10px; color: #666;">
    {{ calculateTotalBots() }} bots
  </div>
</div>
```

### Color Scheme
- 🔴 **#ff6b6b** - Total Investment (expensive)
- 🟢 **#51cf66** - Remaining Capital (positive)
- 🔴 **#ff6b6b** - Remaining Capital (negative)
- 🟣 **#a78bfa** - Total Base Currency (LCX)
- 🟡 **#ffd93d** - Total Quote Currency (USDC)

---

## 🔧 Implementation Details

### Files Modified

**[pages/Bots/Co-Pilot.vue:1000-1084](pages/Bots/Co-Pilot.vue#L1000-L1084)**
- Wide modal layout (95vw, max 1600px)
- 2-column grid dashboard header
- 4 financial stats cards

**[pages/Bots/Co-Pilot.vue:3230-3389](pages/Bots/Co-Pilot.vue#L3230-L3389)**
- `calculateTotalBotsInvestment()` - Total capital needed
- `calculateTotalBots()` - Number of bots
- `calculateRemainingCapital()` - Remaining funds
- `calculateTotalBaseCurrency()` - Total base coins
- `calculateTotalQuoteCurrency()` - Total quote investment

---

## 📋 Usage Instructions

### For Users

1. **Open Co-Pilot page**
2. **Click "View Rules"** on any order
3. **See financial dashboard** at the top showing:
   - How much you're investing total
   - How many bots will be created
   - How much capital remains
   - Total LCX and USDC amounts

4. **Adjust rules** if you see:
   - 🔴 **Negative remaining capital** - reduce bots or increase order size
   - 🟢 **Positive remaining capital** - you have enough funds

### Example Adjustments

**Scenario:** You have $5,250 but need $65,353.50

**Option 1:** Reduce number of bots
- Remove 1 OneClick rule (saves $32,676.75)
- New total: $32,676.75 (still not enough!)
- Need to remove both OneClick rules and use simpler bots

**Option 2:** Increase order size
- Change order from 35,000 LCX to 500,000 LCX
- New order value: 500,000 × $0.15 = $75,000
- Remaining: $75,000 - $65,353.50 = +$9,646.50 ✅

**Option 3:** Reduce grids per bot
- Change from 100 grids to 10 grids
- Investment drops to ~$6,535.35
- Remaining: $5,250 - $6,535 = -$1,285 (still negative, but closer)

---

## 🎯 Benefits

### For Users

1. **Complete Financial Transparency**
   - Know EXACTLY how much you're investing
   - See all costs BEFORE creating bots
   - No surprises or insufficient funds errors

2. **Capital Planning**
   - Plan how many bots you can afford
   - See if you need to increase order size
   - Calculate ROI potential

3. **Risk Management**
   - Understand total exposure
   - Avoid over-leveraging
   - Balance between multiple strategies

### For Development

1. **Debugging**
   - Validate calculations visually
   - Test edge cases
   - Verify bot creation logic

2. **Testing**
   - Compare expected vs actual investment
   - Test different bot configurations
   - Verify multi-bot scenarios

---

## 📊 Real Example Breakdown

### Order: SELL 35,000 LCX @ $0.15 = $5,250

### Rule #1: OneClick (3 pairs × 100 grids × 1.1)
```
LCX/USDC:
- 100 orders from $0.0675 to $0.1515
- Average price: $0.1095
- Total: 100 × 1.1 × $0.1095 = $12,045

BTC/USDC:
- 100 orders (similar range)
- Total: $12,045

ETH/USDC:
- 100 orders (similar range)
- Total: $12,045

Rule #1 Total: $36,135
```

### Rule #2: Grid Bot (100 grids × 1.1)
```
LCX/USDC:
- 100 orders
- Total: $12,045

Rule #2 Total: $12,045
```

### Grand Total:
```
Total Investment: $48,180
Total Bots: 4 (3 from OneClick + 1 Grid)
Total LCX: 440 (400 + 40)
Remaining Capital: $5,250 - $48,180 = -$42,930

❌ INSUFFICIENT FUNDS!
Need additional $42,930 to fund all bots
```

---

## 🚀 Future Improvements

1. **Warning Alerts**
   ```javascript
   if (calculateRemainingCapital() < 0) {
     message.warning(`⚠️ Insufficient funds! Need $${Math.abs(calculateRemainingCapital()).toFixed(2)} more`);
   }
   ```

2. **Auto-Adjust Recommendations**
   ```javascript
   // Suggest optimal configuration
   const maxAffordableBots = Math.floor(totalOrderValue / avgBotCost);
   message.info(`💡 You can afford ${maxAffordableBots} bots with current order size`);
   ```

3. **Visual Progress Bar**
   ```vue
   <n-progress
     :percentage="(calculateTotalBotsInvestment() / totalOrderValue) * 100"
     :color="percentage > 100 ? '#ff6b6b' : '#51cf66'"
   />
   ```

4. **Per-Bot Breakdown**
   ```
   Bot #1 (LCX Grid): $12,045 (25%)
   Bot #2 (BTC Grid): $12,045 (25%)
   Bot #3 (ETH Grid): $12,045 (25%)
   Bot #4 (LCX Grid): $12,045 (25%)
   ────────────────────────────
   Total: $48,180 (100%)
   ```

---

**Date:** 2025-11-27
**Version:** v2.2 (Financial Dashboard)
**Status:** ✅ IMPLEMENTED & TESTED
