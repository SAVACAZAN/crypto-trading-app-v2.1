# Co-Pilot Composable Integration Fix

## 🐛 Problem Identified

**Issue:** Co-Pilot wrapper functions were not passing `amountType` and `incrementalPercent` parameters to the composable, resulting in incorrect calculations.

**Root Cause:**
- Wrapper functions adapted percentage-based prices to absolute prices ✅
- BUT they didn't pass `amountType` and `incrementalPercentAmount` ❌
- Composable defaulted to simple division without incremental percent
- Base amounts and investments were calculated incorrectly

---

## ✅ Solution Implemented

### Updated Wrapper Functions

All 4 wrapper functions now pass the required parameters:

#### 1. calculateGridOrders() - Lines 3260-3284

**Before:**
```javascript
function calculateGridOrders(pair) {
  const adaptedPair = {
    ...pair,
    lowerPrice,
    upperPrice
    // Missing amountType and incrementalPercent!
  };

  const orders = calculateGridOrdersBase(adaptedPair);
  return orders.map(...);
}
```

**After:**
```javascript
function calculateGridOrders(pair) {
  const adaptedPair = {
    ...pair,
    lowerPrice,
    upperPrice,
    amountType: pair.amountType || 'incrementalPercent',  // ✅
    incrementalPercent: parseFloat(pair.incrementalPercentAmountBuy || pair.incrementalPercentAmountSell || 0)  // ✅
  };

  const orders = calculateGridOrdersBase(adaptedPair);
  return orders.map(...);
}
```

#### 2. calculateTotalInvestment() - Lines 3289-3302

**Before:**
```javascript
function calculateTotalInvestment(pair) {
  const adaptedPair = {
    ...pair,
    lowerPrice,
    upperPrice
  };

  return calculateTotalInvestmentBase(adaptedPair);
}
```

**After:**
```javascript
function calculateTotalInvestment(pair) {
  const adaptedPair = {
    ...pair,
    lowerPrice,
    upperPrice,
    amountType: pair.amountType || 'incrementalPercent',  // ✅
    incrementalPercent: parseFloat(pair.incrementalPercentAmountBuy || pair.incrementalPercentAmountSell || 0)  // ✅
  };

  return calculateTotalInvestmentBase(adaptedPair);
}
```

#### 3. calculateAveragePrice() - Lines 3307-3320

**Before:**
```javascript
function calculateAveragePrice(pair) {
  const adaptedPair = {
    ...pair,
    lowerPrice,
    upperPrice
  };

  return calculateAveragePriceBase(adaptedPair);
}
```

**After:**
```javascript
function calculateAveragePrice(pair) {
  const adaptedPair = {
    ...pair,
    lowerPrice,
    upperPrice,
    amountType: pair.amountType || 'incrementalPercent',  // ✅
    incrementalPercent: parseFloat(pair.incrementalPercentAmountBuy || pair.incrementalPercentAmountSell || 0)  // ✅
  };

  return calculateAveragePriceBase(adaptedPair);
}
```

#### 4. calculateTotalBaseAmount() - Lines 3325-3338

**Before:**
```javascript
function calculateTotalBaseAmount(pair) {
  return calculateTotalBaseAmountBase(pair);  // ❌ Missing price conversion!
}
```

**After:**
```javascript
function calculateTotalBaseAmount(pair) {
  const lowerPrice = parseFloat(calculatePairPrice(pair, 'lower'));
  const upperPrice = parseFloat(calculatePairPrice(pair, 'upper'));

  const adaptedPair = {
    ...pair,
    lowerPrice,
    upperPrice,
    amountType: pair.amountType || 'incrementalPercent',  // ✅
    incrementalPercent: parseFloat(pair.incrementalPercentAmountBuy || pair.incrementalPercentAmountSell || 0)  // ✅
  };

  return calculateTotalBaseAmountBase(adaptedPair);
}
```

---

## 🔍 Parameter Mapping

### Co-Pilot Format → Composable Format

```javascript
// Co-Pilot uses these parameter names:
pair.incrementalPercentAmountBuy  // For buy orders
pair.incrementalPercentAmountSell // For sell orders
pair.amountType                   // 'fixed', 'incrementalPercent', 'quantityPerGrid', 'totalAmount'

// Composable expects:
pair.incrementalPercent           // Single parameter (use buy or sell)
pair.amountType                   // Same name
```

**Adaptation Logic:**
```javascript
incrementalPercent: parseFloat(
  pair.incrementalPercentAmountBuy ||
  pair.incrementalPercentAmountSell ||
  0
)
```

This tries `incrementalPercentAmountBuy` first (for buy orders), falls back to `incrementalPercentAmountSell`, then defaults to 0.

---

## 📊 Impact on Calculations

### Before Fix (WRONG)

**Example: LCX/USDC Grid**
- Lower Price: $0.075
- Upper Price: $0.150
- Amount: $1.10 USD
- Grids: 100
- Incremental Percent: 1%

**Wrong Calculation:**
```
amountType and incrementalPercent not passed
→ Composable treats as fixed amount
→ Each order: 1.1 / price (no incremental increase)
→ Total Base: ~980 LCX (incorrect)
→ Total Investment: ~$110 (incorrect)
```

### After Fix (CORRECT)

**Correct Calculation:**
```
amountType: 'incrementalPercent'
incrementalPercent: 1
→ Composable applies progressive formula
→ Order 1: (1.1 + 0.011) / 0.075 = 14.81 LCX
→ Order 100: (1.1 + 1.1) / 0.150 = 14.67 LCX
→ Total Base: ~1,481 LCX ✅
→ Total Investment: ~$165 ✅
```

---

## 🎯 Where This Affects

### 1. Per-Bot Breakdown Table (Lines 1086-1155)

**Function:** `calculatePerBotBreakdown()` (lines 3492-3635)

Now correctly calculates:
- Base Amount per bot (LCX, BTC, ETH quantities)
- Quote Investment per bot (USDC needed)
- Multi-currency totals footer

### 2. Dashboard Financial Summary

**Function:** `calculateTotalBotsInvestment()` (lines 3331+)

Now correctly calculates:
- Total investment across all rules
- Total orders count
- Total base amounts per currency

### 3. Grid Orders Preview Modal

**Function:** `calculateGridOrders(pair)` (lines 3260-3284)

Now correctly shows:
- Progressive quantities per order
- Accurate price × quantity totals
- Correct order spacing

---

## 🧪 Testing Scenarios

### Test 1: OneClick with incrementalPercent = 1%

**Input:**
```javascript
{
  symbol: 'LCX/USDC',
  lowerPricePercent: -50,  // -50% from current
  upperPricePercent: 1,    // +1% from current
  amount: 1.1,
  grids: 100,
  amountType: 'incrementalPercent',
  incrementalPercentAmountBuy: 1
}
```

**Expected Output:**
- Order 1: ~14.81 LCX at $0.075
- Order 100: ~14.67 LCX at $0.150
- Total Base: ~1,481 LCX
- Total Investment: ~$165 USDC

### Test 2: Grid Bot with incrementalPercent = 2%

**Input:**
```javascript
{
  symbol: 'BTC/USDC',
  lowerPricePercent: -30,
  upperPricePercent: 30,
  amount: 100,
  grids: 50,
  amountType: 'incrementalPercent',
  incrementalPercentAmountBuy: 2
}
```

**Expected Output:**
- Progressive amounts increasing by 2% per order
- Total Base: Higher than simple 50 × amount
- Total Investment: Reflects progressive increase

### Test 3: Fixed Amount (incrementalPercent = 0)

**Input:**
```javascript
{
  symbol: 'ETH/USDC',
  amount: 10,
  grids: 20,
  amountType: 'fixed',
  incrementalPercentAmountBuy: 0
}
```

**Expected Output:**
- Each order: 10 / price (same USD amount per order)
- Total Base: Varies by price distribution
- Total Investment: ~$200 USDC (10 × 20)

---

## 📝 Files Modified

### 1. [pages/Bots/Co-Pilot.vue](pages/Bots/Co-Pilot.vue)

**Lines 3260-3284:** Updated `calculateGridOrders()` wrapper
- Added `amountType` parameter
- Added `incrementalPercent` parameter mapping

**Lines 3289-3302:** Updated `calculateTotalInvestment()` wrapper
- Added `amountType` parameter
- Added `incrementalPercent` parameter mapping

**Lines 3307-3320:** Updated `calculateAveragePrice()` wrapper
- Added `amountType` parameter
- Added `incrementalPercent` parameter mapping

**Lines 3325-3338:** Updated `calculateTotalBaseAmount()` wrapper
- Added price conversion (was missing!)
- Added `amountType` parameter
- Added `incrementalPercent` parameter mapping

---

## ✅ Summary

**Fixed:**
- ✅ All 4 wrapper functions now pass `amountType` and `incrementalPercent`
- ✅ `calculateTotalBaseAmount()` now converts percentage prices to absolute
- ✅ Per-bot breakdown shows correct base amounts
- ✅ Investment calculations match backend GridBotLib.js formula
- ✅ Multi-currency totals are accurate

**Result:**
- Co-Pilot now displays CORRECT investment calculations
- Base amounts reflect progressive incremental increases
- Total investments match actual order placement behavior
- Users can accurately plan capital allocation

**Reference:**
- Backend: [server/plugins/GridBotLib.js:311-340](server/plugins/GridBotLib.js#L311-L340)
- Composable: [composables/useBotCalculations.js:63-186](composables/useBotCalculations.js#L63-L186)
- Co-Pilot: [pages/Bots/Co-Pilot.vue:3260-3338](pages/Bots/Co-Pilot.vue#L3260-L3338)

---

**Date:** 2025-11-29
**Version:** v2.2 (Co-Pilot Composable Fix)
**Status:** ✅ FIXED & TESTED
