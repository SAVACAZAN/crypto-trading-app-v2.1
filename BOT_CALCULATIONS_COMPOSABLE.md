# Bot Calculations Composable - Documentation

## 📋 Overview

**File:** `composables/useBotCalculations.js`

**Purpose:** Centralized, reusable calculation functions for all bot types in the crypto trading platform.

**Pattern:** Nuxt 3 composable (auto-imported, no manual imports needed)

---

## 🎯 Why This Exists

### Problem Before Refactoring

**Duplicate Code:**
- `calculateGridOrders()` existed in Co-Pilot.vue
- `calculateTotalInvestment()` existed in Co-Pilot.vue
- `getBaseCurrency()` / `getQuoteCurrency()` existed in Co-Pilot.vue
- OneClick-bots-form.vue had no calculation logic (relied on backend)
- Any new bot page would need to re-implement these functions

**Issues:**
- ❌ Code duplication
- ❌ Maintenance overhead (update in multiple places)
- ❌ Testing complexity
- ❌ Inconsistencies between implementations
- ❌ No reusability for future bot types

### Solution: Composable Pattern

**Benefits:**
- ✅ Single source of truth
- ✅ Auto-imported by Nuxt 3 (no `import` statements needed)
- ✅ Reusable across all components
- ✅ Easy to test independently
- ✅ Consistent calculations everywhere
- ✅ Well-documented with JSDoc

---

## 🔧 Available Functions

### Currency Helpers

#### `getBaseCurrency(symbol)`

Extracts base currency from trading pair.

**Parameters:**
- `symbol` (string) - Trading pair (e.g., "LCX/USDC", "BTC/USDC")

**Returns:**
- (string) Base currency (e.g., "LCX", "BTC")

**Example:**
```javascript
const baseCurrency = getBaseCurrency('BTC/USDC'); // Returns: "BTC"
const baseCurrency = getBaseCurrency('ETH/USDC'); // Returns: "ETH"
```

---

#### `getQuoteCurrency(symbol)`

Extracts quote currency from trading pair.

**Parameters:**
- `symbol` (string) - Trading pair (e.g., "LCX/USDC", "BTC/USDC")

**Returns:**
- (string) Quote currency (e.g., "USDC")

**Example:**
```javascript
const quoteCurrency = getQuoteCurrency('BTC/USDC'); // Returns: "USDC"
const quoteCurrency = getQuoteCurrency('LCX/USDT'); // Returns: "USDT"
```

---

### Grid Bot Calculations

#### `calculateGridOrders(pair)`

Calculates all grid orders for a trading pair. Creates evenly-spaced buy orders across the price range.

**Parameters:**
- `pair` (Object) - Trading pair configuration
  - `symbol` (string) - Trading pair symbol
  - `lowerPrice` (number) - Lower price boundary
  - `upperPrice` (number) - Upper price boundary
  - `amount` (number) - Amount per grid order
  - `grids` (number) - Number of grid orders

**Returns:**
- (Array) Array of order objects:
  ```javascript
  [
    {
      price: 0.075,    // Order price
      amount: 1.1,     // Order amount
      total: 0.0825    // price × amount
    },
    // ... 99 more orders
  ]
  ```

**Example:**
```javascript
const orders = calculateGridOrders({
  symbol: 'LCX/USDC',
  lowerPrice: 0.075,
  upperPrice: 0.150,
  amount: 1.1,
  grids: 100
});

console.log(orders.length); // 100
console.log(orders[0]);     // { price: 0.075, amount: 1.1, total: 0.0825 }
console.log(orders[99]);    // { price: 0.150, amount: 1.1, total: 0.165 }
```

**Formula:**
```javascript
priceStep = (upperPrice - lowerPrice) / (grids - 1)

for i = 0 to grids - 1:
  price = lowerPrice + (priceStep × i)
  order = { price, amount, total: price × amount }
```

---

#### `calculateTotalInvestment(pair)`

Calculates total investment (quote currency) needed for all grid orders.

**Parameters:**
- `pair` (Object) - Same as `calculateGridOrders()`

**Returns:**
- (number) Total USDC (or other quote currency) investment

**Example:**
```javascript
const totalInvestment = calculateTotalInvestment({
  lowerPrice: 0.075,
  upperPrice: 0.150,
  amount: 1.1,
  grids: 100
});

console.log(totalInvestment); // ~$11,275 (sum of all order totals)
```

**Formula:**
```javascript
totalInvestment = Σ (order.price × order.amount) for all orders
```

---

#### `calculateAveragePrice(pair)`

Calculates average price across all grid orders.

**Parameters:**
- `pair` (Object) - Same as `calculateGridOrders()`

**Returns:**
- (number) Average price

**Example:**
```javascript
const avgPrice = calculateAveragePrice({
  lowerPrice: 0.075,
  upperPrice: 0.150,
  grids: 100
});

console.log(avgPrice); // ~0.1125 (midpoint of range)
```

**Formula:**
```javascript
avgPrice = (Σ order.price) / totalOrders
```

---

#### `calculateTotalBaseAmount(pair)`

Calculates total base currency that will be bought across all orders.

**Parameters:**
- `pair` (Object)
  - `amount` (number) - Amount per order
  - `grids` (number) - Number of orders

**Returns:**
- (number) Total base currency amount

**Example:**
```javascript
const totalBase = calculateTotalBaseAmount({
  amount: 1.1,
  grids: 100
});

console.log(totalBase); // 110 LCX (or BTC, ETH, etc.)
```

**Formula:**
```javascript
totalBaseAmount = amount × grids
```

---

### Strategy-Specific Calculations

#### `calculateDcaInvestment(botConfig)`

Calculates investment for DCA (Dollar Cost Averaging) bot strategy.

DCA strategy places a base order, then additional "safety orders" at lower prices to average down the entry price.

**Parameters:**
- `botConfig` (Object)
  - `baseOrderAmount` (number) - Initial order amount (default: 100)
  - `maxSafetyOrders` (number) - Number of safety orders (default: 5)
  - `safetyOrderPercent` (number) - Percentage increase per safety order (default: 3)

**Returns:**
- (number) Total DCA investment

**Example:**
```javascript
const dcaInvestment = calculateDcaInvestment({
  baseOrderAmount: 100,
  maxSafetyOrders: 5,
  safetyOrderPercent: 3
});

console.log(dcaInvestment); // 645
// Breakdown:
//   Base order:     100
//   Safety order 1: 103 (100 × 1.03)
//   Safety order 2: 106 (100 × 1.06)
//   Safety order 3: 109 (100 × 1.09)
//   Safety order 4: 112 (100 × 1.12)
//   Safety order 5: 115 (100 × 1.15)
//   TOTAL:          645
```

**Formula:**
```javascript
dcaInvestment = baseOrder
for i = 0 to maxSafetyOrders - 1:
  multiplier = 1 + ((safetyPercent × (i + 1)) / 100)
  dcaInvestment += baseOrder × multiplier
```

---

#### `calculateFibInvestment(botConfig)`

Calculates investment for Fibonacci bot strategy.

Fibonacci bots place orders at key Fibonacci retracement levels (23.6%, 38.2%, 50%, 61.8%, 78.6%, etc.).

**Parameters:**
- `botConfig` (Object)
  - `amount` (number) - Amount per Fib level (default: 1.1)
  - `nrOfGrids` (number) - Number of Fib levels (default: 7)
  - `lowerPrice` (number) - Lower price boundary
  - `upperPrice` (number) - Upper price boundary

**Returns:**
- (number) Total Fibonacci investment

**Example:**
```javascript
const fibInvestment = calculateFibInvestment({
  amount: 1.1,
  nrOfGrids: 7,
  lowerPrice: 0.075,
  upperPrice: 0.150
});

console.log(fibInvestment); // ~0.86625
// Calculation:
//   avgPrice = (0.075 + 0.150) / 2 = 0.1125
//   baseAmount = 1.1 × 7 = 7.7
//   investment = 7.7 × 0.1125 = 0.86625
```

**Formula:**
```javascript
avgPrice = (lowerPrice + upperPrice) / 2
baseAmount = amount × nrOfGrids
fibInvestment = baseAmount × avgPrice
```

---

#### `calculateFrontRunInvestment(botConfig, currentPrice)`

Calculates investment for FrontRun bot strategy.

FrontRun bots execute quick trades based on price momentum, designed for fast profit taking.

**Parameters:**
- `botConfig` (Object)
  - `amount` (number) - Amount per order (default: 1.1)
  - `nrOfGrids` (number) - Number of orders (default: 100)
- `currentPrice` (number) - Current market price

**Returns:**
- (number) Total FrontRun investment

**Example:**
```javascript
const frontRunInvestment = calculateFrontRunInvestment(
  { amount: 1.1, nrOfGrids: 100 },
  0.15  // current price
);

console.log(frontRunInvestment); // 16.50 USDC
// Calculation: 1.1 × 100 × 0.15 = 16.50
```

**Formula:**
```javascript
frontRunInvestment = amount × nrOfGrids × currentPrice
```

---

#### `calculateScalpingInvestment(botConfig, currentPrice)`

Calculates investment for Scalping bot strategy.

Scalping bots make high-frequency small profit trades with single orders.

**Parameters:**
- `botConfig` (Object)
  - `amount` (number) - Amount to trade (default: 10)
- `currentPrice` (number) - Current market price

**Returns:**
- (number) Total Scalping investment

**Example:**
```javascript
const scalpingInvestment = calculateScalpingInvestment(
  { amount: 10 },
  0.15  // current price
);

console.log(scalpingInvestment); // 1.50 USDC
// Calculation: 10 × 0.15 = 1.50
```

**Formula:**
```javascript
scalpingInvestment = amount × currentPrice
```

---

#### `calculateOrdersCount(botConfig, botType)`

Calculates total number of orders for any bot type.

**Parameters:**
- `botConfig` (Object) - Bot configuration (varies by type)
- `botType` (string) - Bot type: 'grid', 'oneclick', 'dca', 'smartdca', 'fib', 'frontrun', 'scalping'

**Returns:**
- (number) Total number of orders

**Example:**
```javascript
// Grid bot
const gridOrders = calculateOrdersCount({ grids: 100 }, 'grid');
console.log(gridOrders); // 100

// DCA bot
const dcaOrders = calculateOrdersCount({ maxSafetyOrders: 5 }, 'dca');
console.log(dcaOrders); // 6 (base + 5 safety orders)

// Fibonacci bot
const fibOrders = calculateOrdersCount({ nrOfGrids: 7 }, 'fib');
console.log(fibOrders); // 7

// Scalping bot
const scalpOrders = calculateOrdersCount({}, 'scalping');
console.log(scalpOrders); // 1
```

---

## 💻 Usage Examples

### In Co-Pilot.vue (Auto-Import)

```vue
<script setup>
// No import needed! Nuxt 3 auto-imports composables

// Destructure functions
const {
  getBaseCurrency,
  getQuoteCurrency,
  calculateGridOrders,
  calculateTotalInvestment,
  calculateDcaInvestment,
  calculateFibInvestment
} = useBotCalculations();

// Use in functions
function calculatePerBotBreakdown() {
  const botsList = [];

  for (const rule of orderRules.value) {
    if (rule.actionConfig.botType === 'grid') {
      const pair = rule.actionConfig.pairs[0];

      botsList.push({
        symbol: pair.symbol,
        baseCurrency: getBaseCurrency(pair.symbol),
        baseAmount: calculateTotalBaseAmount(pair),
        quoteInvestment: calculateTotalInvestment(pair)
      });
    }
    else if (rule.actionConfig.botType === 'dca') {
      botsList.push({
        quoteInvestment: calculateDcaInvestment(rule.actionConfig.botConfig)
      });
    }
  }

  return botsList;
}
</script>
```

---

### In OneClick-bots-form.vue

```vue
<script setup>
const {
  calculateGridOrders,
  calculateTotalInvestment,
  getBaseCurrency
} = useBotCalculations();

const marketForms = ref([
  {
    symbol: 'LCX/USDC',
    lowerPrice: 0.075,
    upperPrice: 0.150,
    amount: 1.1,
    grids: 100
  }
]);

// Calculate investment preview
const previewInvestment = computed(() => {
  return marketForms.value.map(form => ({
    symbol: form.symbol,
    baseCurrency: getBaseCurrency(form.symbol),
    totalInvestment: calculateTotalInvestment(form),
    ordersCount: form.grids
  }));
});
</script>

<template>
  <div>
    <h3>Investment Preview</h3>
    <div v-for="preview in previewInvestment" :key="preview.symbol">
      <p>{{ preview.symbol }}: {{ preview.totalInvestment.toFixed(2) }} USDC</p>
      <p>{{ preview.ordersCount }} orders buying {{ preview.baseCurrency }}</p>
    </div>
  </div>
</template>
```

---

### In Future Bot Components

```vue
<script setup>
// Auto-imported!
const { calculateDcaInvestment, getBaseCurrency } = useBotCalculations();

const dcaConfig = ref({
  baseOrderAmount: 100,
  maxSafetyOrders: 5,
  safetyOrderPercent: 3
});

const totalInvestment = computed(() => {
  return calculateDcaInvestment(dcaConfig.value);
});
</script>
```

---

## 🧪 Testing

### Unit Test Example (Vitest)

```javascript
import { describe, it, expect } from 'vitest';
import { useBotCalculations } from '~/composables/useBotCalculations';

describe('useBotCalculations', () => {
  const {
    getBaseCurrency,
    calculateTotalInvestment,
    calculateDcaInvestment
  } = useBotCalculations();

  it('extracts base currency correctly', () => {
    expect(getBaseCurrency('LCX/USDC')).toBe('LCX');
    expect(getBaseCurrency('BTC/USDC')).toBe('BTC');
    expect(getBaseCurrency('ETH/USDT')).toBe('ETH');
  });

  it('calculates grid investment correctly', () => {
    const investment = calculateTotalInvestment({
      lowerPrice: 0.1,
      upperPrice: 0.2,
      amount: 1,
      grids: 10
    });

    expect(investment).toBeCloseTo(1.5, 2); // ~$1.50
  });

  it('calculates DCA investment correctly', () => {
    const investment = calculateDcaInvestment({
      baseOrderAmount: 100,
      maxSafetyOrders: 5,
      safetyOrderPercent: 3
    });

    expect(investment).toBe(645);
  });
});
```

---

## 📦 Architecture Benefits

### Before Refactoring

```
Co-Pilot.vue (3700 lines)
  ├─ calculateGridOrders() ────────┐
  ├─ calculateTotalInvestment() ───┤ DUPLICATED
  ├─ getBaseCurrency() ────────────┤ LOGIC
  └─ getQuoteCurrency() ───────────┘

OneClick-bots-form.vue
  └─ No calculation logic ❌
```

**Problems:**
- Calculation logic tied to Co-Pilot
- OneClick can't preview investment
- Any new bot page needs to reimplement

---

### After Refactoring

```
composables/useBotCalculations.js (300 lines)
  ├─ calculateGridOrders() ────────┐
  ├─ calculateTotalInvestment() ───┤ SINGLE
  ├─ calculateDcaInvestment() ─────┤ SOURCE
  ├─ calculateFibInvestment() ─────┤ OF
  ├─ getBaseCurrency() ────────────┤ TRUTH
  └─ getQuoteCurrency() ───────────┘
       ▲           ▲           ▲
       │           │           │
       │           │           └─── Future Bot Pages
       │           └─────────────── OneClick-bots-form.vue
       └─────────────────────────── Co-Pilot.vue
```

**Benefits:**
- ✅ Single source of truth
- ✅ Reusable everywhere
- ✅ Auto-imported (Nuxt 3)
- ✅ Easy to test
- ✅ Consistent calculations

---

## 🔄 Migration Notes

### Co-Pilot.vue Changes

**Before:**
```javascript
// Local function definitions (lines 3238-3302)
function calculateGridOrders(pair) { /* ... */ }
function calculateTotalInvestment(pair) { /* ... */ }
function getBaseCurrency(symbol) { /* ... */ }
```

**After:**
```javascript
// Import composable (auto-imported by Nuxt)
const {
  getBaseCurrency,
  getQuoteCurrency,
  calculateGridOrders: calculateGridOrdersBase,
  calculateTotalInvestment: calculateTotalInvestmentBase,
  // ...
} = useBotCalculations();

// Wrapper functions that adapt Co-Pilot's format
function calculateGridOrders(pair) {
  const adaptedPair = {
    ...pair,
    lowerPrice: parseFloat(calculatePairPrice(pair, 'lower')),
    upperPrice: parseFloat(calculatePairPrice(pair, 'upper'))
  };
  return calculateGridOrdersBase(adaptedPair);
}
```

**Why Wrappers?**
- Co-Pilot uses percentage-based pricing (`lowerPricePercent`, `upperPricePercent`)
- Composable uses absolute prices (`lowerPrice`, `upperPrice`)
- Wrappers convert between formats for backward compatibility

---

## 📚 Related Documentation

- [COPILOT_GRID_ORDERS_EXPANSION.md](COPILOT_GRID_ORDERS_EXPANSION.md) - Grid orders feature
- [COPILOT_FINANCIAL_DASHBOARD.md](COPILOT_FINANCIAL_DASHBOARD.md) - Financial dashboard using composable
- [COPILOT_PER_BOT_BREAKDOWN.md](COPILOT_PER_BOT_BREAKDOWN.md) - Per-bot breakdown calculations
- [COPILOT_MULTI_CURRENCY_FIX.md](COPILOT_MULTI_CURRENCY_FIX.md) - Multi-currency display fix

---

## 🚀 Future Enhancements

### Potential Additions

1. **Profit Calculations:**
   ```javascript
   calculateGridProfit(orders, executedOrders)
   calculateDcaProfit(dcaConfig, currentPrice)
   ```

2. **Risk Calculations:**
   ```javascript
   calculateMaxDrawdown(botConfig)
   calculatePositionSize(balance, riskPercent)
   ```

3. **Advanced Grid Strategies:**
   ```javascript
   calculateGeometricGrid(pair)  // Geometric instead of arithmetic spacing
   calculateFibonacciGrid(pair)  // Grid based on Fib levels
   ```

4. **Backtesting Support:**
   ```javascript
   backtestGridStrategy(pair, historicalData)
   ```

---

**Date:** 2025-11-29
**Version:** v2.2 (Bot Calculations Composable)
**Status:** ✅ IMPLEMENTED & TESTED
**Author:** Claude Code
