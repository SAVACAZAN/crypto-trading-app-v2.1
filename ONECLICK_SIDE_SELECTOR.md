# OneClick Side Selector Feature

## 🎯 Overview

Added individual **Side selector** for each bot in OneClick grid table, allowing per-bot configuration of order types (Buy/Sell/Both).

**Feature:** Each bot can now have its own `ordersSide` setting, saved in strategies and imported to Co-Pilot.

---

## ✨ New Functionality

### 1. Side Selector Column in Grid Table

**Location:** [components/Bots/OneClick-bots-form.vue:922-950](components/Bots/OneClick-bots-form.vue#L922-L950)

Added new column **"Side"** between "Spread" and "Bot Name":

```vue
<thead>
  <tr>
    <th>Symbol</th>
    <th>Bid</th>
    <th>Ask</th>
    <th>Spread</th>
    <th>Side</th>  <!-- ✅ NEW COLUMN -->
    <th>Bot Name</th>
    <th>Lower Price</th>
    <th>Upper Price</th>
    <th>Amount</th>
    <th>Grids</th>
  </tr>
</thead>
```

**Dropdown Options:**
```vue
<n-select
  v-model:value="marketForm.ordersSide"
  :options="[
    { label: '📈 Buy', value: 'buyOnly' },
    { label: '📉 Sell', value: 'sellOnly' },
    { label: '🔄 Both', value: 'buyOrSell' }
  ]"
  size="tiny"
  style="width: 90px;"
/>
```

**Features:**
- ✅ Dropdown with 3 options (Buy/Sell/Both)
- ✅ Emoji indicators for quick visual identification
- ✅ Compact size (90px width)
- ✅ Per-bot configuration (each row has its own selector)

---

### 2. Individual ordersSide in marketForms

**Location:** [components/Bots/OneClick-bots-form.vue:211-221](components/Bots/OneClick-bots-form.vue#L211-L221)

Added `ordersSide` field to each market form:

```javascript
marketForms.value = markets.map((market) => ({
  symbol: market,
  name: `gridBot_${market}`,
  lowerPrice: '',
  upperPrice: '',
  amount: '1.1',
  nrOfGrids: '10',
  ordersSide: 'buyOrSell', // ✅ Default to both buy and sell
  bestBid: null,
  bestAsk: null,
}));
```

**Default:** `'buyOrSell'` (Both buy and sell orders)

---

### 3. Smart ordersSide Logic in createGridBot()

**Location:** [components/Bots/OneClick-bots-form.vue:149-172](components/Bots/OneClick-bots-form.vue#L149-L172)

Updated bot creation logic to respect both buttons AND individual selectors:

```javascript
async function createGridBot(options = {}) {
  // Determine default ordersSide based on button clicked (if buttons used)
  const defaultOrdersSide = options.type === 'buy' ? 'buyOnly' :
                            options.type === 'sell' ? 'sellOnly' :
                            null; // null means use individual marketForm ordersSide

  const botsData = marketForms.value.map((marketForm) => ({
    // ... other fields ...

    // Use button override or individual marketForm ordersSide
    ordersSide: defaultOrdersSide || marketForm.ordersSide || 'buyOrSell',
  }));
}
```

**Priority Logic:**
1. **Button Override** - If user clicks "Buy" or "Sell" button → All bots use that side
2. **Individual Selector** - If user clicks "Create" button → Each bot uses its own selector value
3. **Default Fallback** - If nothing set → `'buyOrSell'` (Both)

---

### 4. Save ordersSide in Strategy

**Location:** [components/Bots/OneClick-bots-form.vue:271-281](components/Bots/OneClick-bots-form.vue#L271-L281)

Each pair in strategy now saves its individual `ordersSide`:

```javascript
const pairs = marketForms.value.map(marketForm => {
  return {
    symbol: marketForm.symbol,
    exchange: selectedExchange.value,
    ordersSide: marketForm.ordersSide || 'buyOrSell', // ✅ Save individual bot side
    lowerPricePercent: parseFloat(lowerPricePercent.toFixed(2)),
    upperPricePercent: parseFloat(upperPricePercent.toFixed(2)),
    amount: parseFloat(marketForm.amount) || 1.1,
    grids: parseInt(marketForm.nrOfGrids) || 10,
    referenceBid: bid,
    referenceAsk: ask
  };
});
```

**Strategy Structure:**
```javascript
{
  name: "My Strategy",
  pairs: [
    {
      symbol: "LCX/USDC",
      ordersSide: "buyOrSell",  // ✅ Individual setting
      // ...
    },
    {
      symbol: "BTC/USDC",
      ordersSide: "buyOnly",    // ✅ Different setting
      // ...
    }
  ]
}
```

---

### 5. Restore ordersSide When Applying Strategy

**Location:** [components/Bots/OneClick-bots-form.vue:371-383](components/Bots/OneClick-bots-form.vue#L371-L383)

When loading a saved strategy, each bot's `ordersSide` is restored:

```javascript
appliedStrategy.pairs.forEach(pair => {
  const marketForm = marketForms.value.find(mf => mf.symbol === pair.symbol);
  if (marketForm) {
    marketForm.lowerPrice = String(pair.lowerPrice);
    marketForm.upperPrice = String(pair.upperPrice);
    marketForm.amount = String(pair.amount);
    marketForm.nrOfGrids = String(pair.grids);
    marketForm.ordersSide = pair.ordersSide || 'buyOrSell'; // ✅ Restore individual bot side
    marketForm.bestBid = pair.currentBid;
    marketForm.bestAsk = pair.currentAsk;
  }
});
```

---

## 🎯 Usage Examples

### Example 1: Mixed Strategy (Buy + Sell + Both)

**Configuration:**
```
┌──────────────┬──────────┬──────────┬─────────┬──────────┐
│ Symbol       │ Bid      │ Ask      │ Spread  │ Side     │
├──────────────┼──────────┼──────────┼─────────┼──────────┤
│ LCX/USDC     │ 0.0813   │ 0.0815   │ 0.246%  │ 🔄 Both  │
│ BTC/USDC     │ 97000    │ 97100    │ 0.103%  │ 📈 Buy   │
│ ETH/USDC     │ 3500     │ 3510     │ 0.286%  │ 📉 Sell  │
└──────────────┴──────────┴──────────┴─────────┴──────────┘
```

**Click "🚀 Create":**
- LCX bot: Places buy + sell orders
- BTC bot: Places buy orders only
- ETH bot: Places sell orders only

**Saved Strategy:**
```javascript
{
  pairs: [
    { symbol: "LCX/USDC", ordersSide: "buyOrSell" },
    { symbol: "BTC/USDC", ordersSide: "buyOnly" },
    { symbol: "ETH/USDC", ordersSide: "sellOnly" }
  ]
}
```

---

### Example 2: Button Override

**Configuration:**
```
All bots have Side = 🔄 Both
```

**Click "📈 Buy" button:**
- **ALL** bots create buy orders only (button overrides individual selectors)

**Click "📉 Sell" button:**
- **ALL** bots create sell orders only (button overrides individual selectors)

**Click "🚀 Create" button:**
- Each bot respects its own Side selector value

---

### Example 3: Strategy Import to Co-Pilot

**OneClick Strategy:**
```javascript
{
  name: "Scalp Strategy",
  pairs: [
    { symbol: "LCX/USDC", ordersSide: "buyOnly", amount: 1.1, grids: 100 },
    { symbol: "SOL/USDC", ordersSide: "sellOnly", amount: 5.0, grids: 50 }
  ]
}
```

**Import to Co-Pilot:**
1. Load strategy in OneClick
2. Copy configuration to Co-Pilot
3. Co-Pilot creates:
   - LCX bot with **buy orders only**
   - SOL bot with **sell orders only**

---

## 📊 Visual Layout

### Grid Table with Side Selector

```
╔════════════╦═══════╦═══════╦════════╦══════════╦════════════╦═══════╗
║ Symbol     ║ Bid   ║ Ask   ║ Spread ║ Side     ║ Bot Name   ║ ...   ║
╠════════════╬═══════╬═══════╬════════╬══════════╬════════════╬═══════╣
║ LCX/USDC   ║ 0.081 ║ 0.082 ║ 0.24%  ║ [🔄Both▼]║ gridBot_.. ║ ...   ║
║ BTC/USDC   ║ 97000 ║ 97100 ║ 0.10%  ║ [📈Buy ▼]║ gridBot_.. ║ ...   ║
║ ETH/USDC   ║ 3500  ║ 3510  ║ 0.29%  ║ [📉Sell▼]║ gridBot_.. ║ ...   ║
╚════════════╩═══════╩═══════╩════════╩══════════╩════════════╩═══════╝
```

**Dropdown Expanded:**
```
┌──────────┐
│ 📈 Buy   │  ← buyOnly
│ 📉 Sell  │  ← sellOnly
│ 🔄 Both  │  ← buyOrSell (default)
└──────────┘
```

---

## 🔧 Technical Implementation

### Data Flow

```
1. User selects markets
   ↓
2. updateSelectedMarkets() creates marketForms
   - Each form has ordersSide: 'buyOrSell' (default)
   ↓
3. User changes Side selector
   - Updates marketForm.ordersSide for that specific bot
   ↓
4. User clicks Create/Buy/Sell button
   ↓
5. createGridBot(options)
   - If Buy button: defaultOrdersSide = 'buyOnly'
   - If Sell button: defaultOrdersSide = 'sellOnly'
   - If Create button: defaultOrdersSide = null (use individual)
   ↓
6. Build botsData array
   - ordersSide = defaultOrdersSide || marketForm.ordersSide
   ↓
7. Send to backend /api/v1/createOneClickBot
   - Backend receives correct ordersSide per bot
```

### Strategy Data Flow

```
1. User clicks "Save Strategy"
   ↓
2. saveStrategy() collects all pairs
   - Each pair includes: ordersSide from marketForm
   ↓
3. Save to MongoDB
   {
     pairs: [
       { symbol: "LCX/USDC", ordersSide: "buyOrSell", ... },
       { symbol: "BTC/USDC", ordersSide: "buyOnly", ... }
     ]
   }
   ↓
4. User clicks "Apply Strategy"
   ↓
5. applyStrategy() loads from DB
   ↓
6. Restore marketForms
   - marketForm.ordersSide = pair.ordersSide
   ↓
7. Side selectors show saved values
```

---

## 🎨 UI/UX Features

### 1. Visual Clarity
- **📈 Emoji for Buy** - Green upward trend
- **📉 Emoji for Sell** - Red downward trend
- **🔄 Emoji for Both** - Blue circular arrows

### 2. Compact Design
- Selector width: 90px
- Size: tiny (matches other inputs)
- Fits seamlessly in grid table

### 3. Intuitive Labels
- "Buy" instead of "buyOnly"
- "Sell" instead of "sellOnly"
- "Both" instead of "buyOrSell"

### 4. Smart Defaults
- Default: "Both" (most common use case)
- Preserved in strategies
- Button override for bulk operations

---

## ✅ Benefits

### For Users
1. **Flexibility** - Configure each bot individually
2. **Strategy Templates** - Save different configurations
3. **Quick Overrides** - Use buttons for bulk changes
4. **Visual Feedback** - Emojis show side at a glance

### For Co-Pilot Integration
1. **Accurate Import** - Each bot knows its side
2. **No Guesswork** - Explicit ordersSide saved
3. **Strategy Replication** - Exact reproduction

### For Strategy Management
1. **Per-Bot Control** - Different sides for different symbols
2. **Saved Preferences** - Load and replay exact configuration
3. **Scalability** - Manage 10+ bots with different sides

---

## 📝 Files Modified

### 1. [components/Bots/OneClick-bots-form.vue](components/Bots/OneClick-bots-form.vue)

**Lines 211-221:** Added `ordersSide` to marketForms initialization

**Lines 149-172:** Updated `createGridBot()` with smart ordersSide logic

**Lines 271-281:** Save `ordersSide` in strategy pairs

**Lines 379:** Restore `ordersSide` when applying strategy

**Lines 922-950:** Added Side selector column in grid table

---

## 🧪 Testing Scenarios

### Test 1: Individual Selectors
1. Select 3 markets: LCX, BTC, ETH
2. Set LCX = Both, BTC = Buy, ETH = Sell
3. Click "Create"
4. **Expected:**
   - LCX bot has buy + sell orders
   - BTC bot has buy orders only
   - ETH bot has sell orders only

### Test 2: Button Override
1. Select 3 markets with different sides
2. Click "Buy" button
3. **Expected:** All bots create buy orders only
4. Click "Sell" button
5. **Expected:** All bots create sell orders only

### Test 3: Strategy Save/Load
1. Configure mixed sides (Buy/Sell/Both)
2. Save strategy "Mixed Test"
3. Clear configuration
4. Load "Mixed Test" strategy
5. **Expected:** Side selectors show saved values

### Test 4: Co-Pilot Import
1. Create OneClick strategy with varied sides
2. Import to Co-Pilot
3. **Expected:** Co-Pilot respects individual ordersSide

---

## 🚀 Future Enhancements

### 1. Bulk Side Change
```vue
<n-button @click="setAllSides('buyOnly')">
  Set All to Buy
</n-button>
```

### 2. Side-Based Filtering
```vue
<n-checkbox @change="showOnlyBuy">
  Show only Buy bots
</n-checkbox>
```

### 3. Side Statistics
```vue
Buy bots: 5 | Sell bots: 3 | Both: 2
```

### 4. Color-Coded Rows
```css
.row-buy { background: rgba(0, 255, 0, 0.05); }
.row-sell { background: rgba(255, 0, 0, 0.05); }
.row-both { background: rgba(0, 0, 255, 0.05); }
```

---

## 📄 Summary

**Added:**
- ✅ Side selector column (Buy/Sell/Both) in grid table
- ✅ Individual `ordersSide` per bot in marketForms
- ✅ Smart logic: button override vs individual selector
- ✅ Save `ordersSide` in strategies
- ✅ Restore `ordersSide` when loading strategies
- ✅ Visual emojis for quick identification

**Result:**
- Users can now configure each bot's order side individually
- Strategies preserve exact configuration
- Co-Pilot integration improved with explicit ordersSide
- Flexible workflow: per-bot OR bulk with buttons

---

**Date:** 2025-11-29
**Version:** v2.2 (OneClick Side Selector)
**Status:** ✅ IMPLEMENTED & TESTED
