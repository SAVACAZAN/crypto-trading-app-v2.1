# Co-Pilot Per-Bot Investment Breakdown

## 🎯 Overview

Tabel detaliat care afișează **FIECARE BOT INDIVIDUAL** cu investiția exactă, permițând control complet asupra balance-ului pentru fiecare bot creat.

---

## 💡 Problema Rezolvată

**Scenariul:**
```
Rule #1: OneClick cu 3 pairs
  → Creează 3 bots (LCX, BTC, ETH)

Rule #2: OneClick cu 3 pairs
  → Creează încă 3 bots (LCX, BTC, ETH)

Rule #3: Custom strategy cu 25 pairs
  → Creează 25 bots

TOTAL: 31 bots
```

**Înainte:**
- ❌ Vedeai doar "Total Investment: $X"
- ❌ Nu știai cât investește FIECARE bot
- ❌ Nu aveai control la balance pentru cei 25 bots
- ❌ Nu știai care bot consumă mai mult capital

**Acum:**
- ✅ Vezi FIECARE bot în parte (toate cele 31)
- ✅ Știi exact cât BASE (LCX) cumpără fiecare
- ✅ Știi exact cât QUOTE (USDC) investește fiecare
- ✅ Vezi câte ordine plasează fiecare bot
- ✅ Control COMPLET asupra balance-ului

---

## 📊 Tabel Structure

### Header
```
🤖 Per-Bot Investment Breakdown (31 bots total)
```

### Columns
| # | Bot Type | Symbol | Rule | Base Amount | Quote Investment | Orders |
|---|----------|--------|------|-------------|------------------|--------|
| 1 | GRIDBOT | LCX/USDC | #1 | 110.0000 LCX | $10,892.25 | 100 |
| 2 | GRIDBOT | BTC/USDC | #1 | 110.0000 BTC | $4,500,000 | 100 |
| 3 | GRIDBOT | ETH/USDC | #1 | 110.0000 ETH | $370,000 | 100 |
| ... | ... | ... | ... | ... | ... | ... |
| 31 | GRIDBOT | XRP/USDC | #3 | 110.0000 XRP | $88.50 | 100 |
| **TOTAL** | | | | **3,410 LCX** | **$5,240,976.75** | **3,100** |

---

## 🧮 Calculations Per Bot Type

### 1. GridBot (from OneClick)

**Input:**
```javascript
pair = {
  symbol: 'LCX/USDC',
  lowerPricePercent: -50,   // -50% from current
  upperPricePercent: 1,     // +1% from current
  amount: 1.1,              // Amount per order
  grids: 100                // Number of orders
}
```

**Calculation:**
```javascript
// Base Amount
baseAmount = grids × amount
baseAmount = 100 × 1.1 = 110 LCX

// Quote Investment (suma tuturor ordinelor)
orders = calculateGridOrders(pair)  // 100 orders
quoteInvestment = Σ(order.price × order.amount)
quoteInvestment = $10,892.25

// Orders Count
ordersCount = 100
```

**Result:**
```
Bot #1: GridBot | LCX/USDC | Rule #1
  Base: 110.0000 LCX
  Quote: $10,892.25
  Orders: 100
```

---

### 2. Grid Bot (standalone)

**Input:**
```javascript
rule.actionConfig = {
  botType: 'grid',
  pairs: [{
    symbol: 'LCX/USDC',
    lowerPricePercent: -50,
    upperPricePercent: 1,
    amount: 1.1,
    grids: 100
  }]
}
```

**Calculation:** Same as GridBot above

---

### 3. FrontRun Bot

**Input:**
```javascript
rule.actionConfig = {
  botType: 'frontrun',
  amount: 1.1,
  nrOfGrids: 100
}
```

**Calculation:**
```javascript
baseAmount = amount × grids = 1.1 × 100 = 110
quoteInvestment = amount × grids × price
quoteInvestment = 1.1 × 100 × $0.15 = $16.50
ordersCount = 100
```

**Result:**
```
Bot #X: FrontRun | LCX/USDC | Rule #Y
  Base: 110.0000 LCX
  Quote: $16.50
  Orders: 100
```

---

### 4. DCA Bot

**Input:**
```javascript
rule.actionConfig = {
  botType: 'dca',
  botConfig: {
    baseOrderAmount: 100,     // Initial buy
    maxSafetyOrders: 5,       // Additional orders
    safetyOrderPercent: 3     // 3% lower each time
  }
}
```

**Calculation:**
```javascript
dcaInvestment = baseOrder
for i = 0 to maxSafetyOrders - 1:
  dcaInvestment += baseOrder × (1 + (safetyPercent × (i + 1)) / 100)

// Example:
dcaInvestment = 100 + (100 × 1.03) + (100 × 1.06) + (100 × 1.09) + (100 × 1.12) + (100 × 1.15)
dcaInvestment = 100 + 103 + 106 + 109 + 112 + 115 = $645

baseAmount = baseOrder = 100
ordersCount = maxSafetyOrders + 1 = 6
```

**Result:**
```
Bot #X: DCA | LCX/USDC | Rule #Y
  Base: 100.0000 LCX
  Quote: $645.00
  Orders: 6
```

---

### 5. Smart DCA Bot

**Calculation:** Identical to DCA Bot
```
Bot #X: SmartDCA | LCX/USDC | Rule #Y
  Base: 100.0000 LCX
  Quote: $645.00
  Orders: 6
```

---

### 6. Fibonacci Bot

**Input:**
```javascript
rule.actionConfig = {
  botType: 'fib',
  botConfig: {
    amount: 1.1,
    nrOfGrids: 7,       // Fib levels
    lowerPrice: 0.075,
    upperPrice: 0.150
  }
}
```

**Calculation:**
```javascript
avgPrice = (lowerPrice + upperPrice) / 2
avgPrice = (0.075 + 0.150) / 2 = 0.1125

baseAmount = amount × grids = 1.1 × 7 = 7.7
quoteInvestment = baseAmount × avgPrice = 7.7 × 0.1125 = $0.86625
ordersCount = 7
```

**Result:**
```
Bot #X: Fibonacci | LCX/USDC | Rule #Y
  Base: 7.7000 LCX
  Quote: $0.87
  Orders: 7
```

---

### 7. Scalping Bot

**Input:**
```javascript
rule.actionConfig = {
  botType: 'scalping',
  amount: 10
}
```

**Calculation:**
```javascript
baseAmount = 10
quoteInvestment = amount × price = 10 × $0.15 = $1.50
ordersCount = 1
```

**Result:**
```
Bot #X: Scalping | LCX/USDC | Rule #Y
  Base: 10.0000 LCX
  Quote: $1.50
  Orders: 1
```

---

## 📋 Example Scenario

### Setup:
```
Order: SELL 35,000 LCX @ $0.15 = $5,250

Rule #1: OneClick (3 pairs)
  - LCX/USDC: -50% to +1%, 100 grids, 1.1 amount
  - BTC/USDC: -50% to +1%, 100 grids, 1.1 amount
  - ETH/USDC: -50% to +1%, 100 grids, 1.1 amount

Rule #2: OneClick (3 pairs)
  - LCX/USDC: -50% to +1%, 100 grids, 1.1 amount
  - BTC/USDC: -50% to +1%, 100 grids, 1.1 amount
  - ETH/USDC: -50% to +1%, 100 grids, 1.1 amount

Rule #3: Custom strategy (25 pairs)
  - 25 × (LCX/USDC: -50% to +1%, 100 grids, 1.1 amount)
```

### Per-Bot Breakdown Table:

```
┌────┬──────────┬──────────┬──────┬────────────────┬──────────────────┬────────┐
│ #  │ Bot Type │ Symbol   │ Rule │ Base Amount    │ Quote Investment │ Orders │
├────┼──────────┼──────────┼──────┼────────────────┼──────────────────┼────────┤
│ 1  │ GRIDBOT  │ LCX/USDC │ #1   │ 110.0000 LCX  │ $10,892.25       │ 100    │
│ 2  │ GRIDBOT  │ BTC/USDC │ #1   │ 110.0000 BTC  │ $4,500,000.00    │ 100    │
│ 3  │ GRIDBOT  │ ETH/USDC │ #1   │ 110.0000 ETH  │ $370,000.00      │ 100    │
│ 4  │ GRIDBOT  │ LCX/USDC │ #2   │ 110.0000 LCX  │ $10,892.25       │ 100    │
│ 5  │ GRIDBOT  │ BTC/USDC │ #2   │ 110.0000 BTC  │ $4,500,000.00    │ 100    │
│ 6  │ GRIDBOT  │ ETH/USDC │ #2   │ 110.0000 ETH  │ $370,000.00      │ 100    │
│ 7  │ GRIDBOT  │ LCX/USDC │ #3   │ 110.0000 LCX  │ $10,892.25       │ 100    │
│ 8  │ GRIDBOT  │ LCX/USDC │ #3   │ 110.0000 LCX  │ $10,892.25       │ 100    │
│... │   ...    │   ...    │ ...  │      ...       │       ...        │  ...   │
│ 31 │ GRIDBOT  │ LCX/USDC │ #3   │ 110.0000 LCX  │ $10,892.25       │ 100    │
├────┴──────────┴──────────┴──────┼────────────────┼──────────────────┼────────┤
│                      TOTAL:      │ 3,300.0000 LCX│ $10,305,461.25   │ 3,100  │
└──────────────────────────────────┴────────────────┴──────────────────┴────────┘
```

### Analysis:
```
🤖 Total Bots: 31
📦 Total Base: 3,300 LCX (across 27 LCX pairs) + 220 BTC + 220 ETH
💰 Total Investment: $10,305,461.25
💵 Remaining Capital: $5,250 - $10,305,461.25 = -$10,300,211.25 ❌

⚠️ INSUFFICIENT FUNDS!
You need $10,300,211.25 MORE to fund all 31 bots!
```

---

## 🎨 UI Features

### Sticky Headers & Footer
```css
/* Header stays visible when scrolling */
thead {
  position: sticky;
  top: 0;
  background: #2d2d2d;
  z-index: 1;
}

/* Footer (totals) stays visible at bottom */
tfoot {
  position: sticky;
  bottom: 0;
  background: #1e3a1e;
}
```

### Scrollable Content
```css
max-height: 300px;
overflow-y: auto;
```

### Color-Coded Bot Types
```javascript
'GridBot': 'success'    // Green
'FrontRun': 'warning'   // Orange
'DCA': 'info'           // Blue
'Fibonacci': 'error'    // Red
'Scalping': 'default'   // Gray
```

### Monospace Fonts for Numbers
```css
font-family: monospace;  // Perfect alignment
```

---

## 🔧 Implementation

### Function: `calculatePerBotBreakdown()`

**Location:** [pages/Bots/Co-Pilot.vue:3452-3595](pages/Bots/Co-Pilot.vue#L3452-L3595)

**Returns:**
```javascript
[
  {
    botType: 'GridBot',
    symbol: 'LCX/USDC',
    ruleNumber: 1,
    baseAmount: 110.0,
    quoteInvestment: 10892.25,
    ordersCount: 100,
    source: 'OneClick Rule #1'
  },
  // ... more bots
]
```

**Logic:**
1. Iterate through all active rules
2. For each rule:
   - If OneClick: expand into multiple bots (one per pair)
   - If other type: create single bot entry
3. Calculate for each bot:
   - Base amount (coins to buy)
   - Quote investment (USD needed)
   - Orders count
4. Return complete array

---

### Function: `getBotTypeColor()`

**Location:** [pages/Bots/Co-Pilot.vue:3597-3611](pages/Bots/Co-Pilot.vue#L3597-L3611)

**Purpose:** Color-code bot types for visual distinction

**Mapping:**
```javascript
{
  'GridBot': 'success',      // 🟢 Green
  'Grid': 'success',         // 🟢 Green
  'FrontRun': 'warning',     // 🟠 Orange
  'DCA': 'info',             // 🔵 Blue
  'SmartDCA': 'info',        // 🔵 Blue
  'Fibonacci': 'error',      // 🔴 Red
  'Scalping': 'default'      // ⚪ Gray
}
```

---

## 📊 UI Layout

**Location:** [pages/Bots/Co-Pilot.vue:1086-1145](pages/Bots/Co-Pilot.vue#L1086-L1145)

```vue
<n-card>
  <div>🤖 Per-Bot Investment Breakdown ({{ calculateTotalBots() }} bots total)</div>
  <div style="max-height: 300px; overflow-y: auto;">
    <table>
      <thead style="position: sticky; top: 0;">
        <!-- Column headers -->
      </thead>
      <tbody>
        <tr v-for="bot in calculatePerBotBreakdown()">
          <!-- Bot details -->
        </tr>
      </tbody>
      <tfoot style="position: sticky; bottom: 0;">
        <!-- Totals row -->
      </tfoot>
    </table>
  </div>
</n-card>
```

---

## 🎯 Benefits

### For Users

1. **Complete Transparency**
   - See EVERY bot that will be created
   - Know exact investment per bot
   - No surprises

2. **Balance Control**
   - Identify expensive bots
   - Adjust configurations
   - Optimize capital allocation

3. **Planning**
   - See which bots consume most capital
   - Decide which to keep/remove
   - Calculate ROI per bot

### Example Use Case

**Scenario:** You have 3 rules creating 31 bots

**Discovery:**
- Bot #2 (BTC): $4,500,000 (90% of total!)
- Bot #3 (ETH): $370,000 (7% of total)
- Other 29 bots: $335,461.25 (3% of total)

**Action:**
- Remove BTC pair from OneClick rules
- Keep only LCX and ETH pairs
- New total: $805,461.25 (much more affordable!)

---

## 🚀 Future Improvements

### 1. Sorting & Filtering
```javascript
// Sort by investment (highest first)
botsList.sort((a, b) => b.quoteInvestment - a.quoteInvestment)

// Filter by symbol
botsList.filter(bot => bot.symbol === 'LCX/USDC')

// Filter by rule
botsList.filter(bot => bot.ruleNumber === 1)
```

### 2. Export to CSV
```javascript
function exportBotsToCSV() {
  const bots = calculatePerBotBreakdown();
  const csv = bots.map(bot =>
    `${bot.botType},${bot.symbol},${bot.baseAmount},${bot.quoteInvestment}`
  ).join('\n');
  downloadFile(csv, 'bots-breakdown.csv');
}
```

### 3. Visual Charts
```vue
<n-card>
  <h3>Investment Distribution</h3>
  <PieChart :data="calculatePerBotBreakdown()" />
</n-card>
```

### 4. Per-Rule Summary
```vue
<n-collapse>
  <n-collapse-item title="Rule #1 (6 bots - $10,870,892.50)">
    <table><!-- Bots from Rule #1 only --></table>
  </n-collapse-item>
</n-collapse>
```

---

**Date:** 2025-11-27
**Version:** v2.2 (Per-Bot Breakdown)
**Status:** ✅ IMPLEMENTED & TESTED
