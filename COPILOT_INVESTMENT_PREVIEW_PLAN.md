# Co-Pilot Investment Preview & Grid Orders - Refactoring Plan

**Date:** December 1, 2025
**Status:** 🚧 IN PROGRESS

---

## User Requirements (Romanian)

```
"nu este bine cand genereaza orderele nu face exact ca la oneclick ..
incarca prost .. si nu vreau sa vad toate orderele brute asa ,
vreau filtrate cum este in modalul la oneclick ..
vezi sa fie corect tre sa avem:

💰 Investment Preview
▼
25 bots • 2500 orders • $5025.00 total
🤖 Per Bot (25)
📊 Total Strategie

... astea o data ,, cand incarc strategia ..
si trot modalul sa fie ca aici corect si detaliat ..
si dupa fiecare order la noi acolo fiecare pair cu orderele lui,
nu asa brute toate ca nu ia preturile corect"
```

---

## Current Problem

**ViewRulesModal.vue** currently:
- ❌ Shows ALL orders from ALL pairs in one big table
- ❌ Uses same price (0.078) for all pairs
- ❌ No Investment Preview panel
- ❌ No Per Bot breakdown
- ❌ No Total Strategy view
- ❌ Not matching OneClick Bot structure

---

## Target Structure (from OneClick Bot)

### 1. **Investment Preview Panel** (Main Overview)
When user clicks "View Grid Orders" on a OneClick strategy rule:

```
💰 Investment Preview                [Strategy Name] [25 bots] [2500 orders] [$5025.00 total]

Tabs:
├── 🤖 Per Bot (25)
│   ├── Card: BTC/USDC    - 100 orders - $200.50 - [Click to see details]
│   ├── Card: ETH/USDC    - 100 orders - $201.00 - [Click to see details]
│   ├── Card: LCX/USDC    - 100 orders - $202.00 - [Click to see details]
│   └── ... (25 total)
│
└── 📊 Total Strategie
    ├── Total Bots: 25
    ├── Total Orders: 2500
    ├── Total Investment: $5025.00
    ├── Total Buy Orders: 1250
    ├── Total Sell Orders: 1250
    ├── Total Buy Investment: $2500.00
    ├── Total Sell Value: $2525.00
    └── Estimated Profit: $25.00 (1%)
```

### 2. **Single Pair Modal** (Detail View)
When user clicks on a specific pair card in Investment Preview:

```
📊 Grid Orders Preview                [BTC/USDC] [100 orders]

Tabs:
├── 📊 Statistici
│   ├── Symbol: BTC/USDC
│   ├── Price Range: $0.053552 - $0.067844
│   ├── Current Price: $0.067844
│   ├── Total Orders: 100
│   ├── BUY ORDERS Panel:
│   │   ├── Număr ordine: 70
│   │   ├── Investiție: $4.20
│   │   └── Preț mediu: $0.060
│   ├── SELL ORDERS Panel:
│   │   ├── Număr ordine: 30
│   │   ├── Primești: $2.10
│   │   └── Preț mediu: $0.070
│   └── PROFIT ESTIMAT: $0.30 (7%)
│
├── 💼 Necesare
│   ├── Capital Necesar
│   ├── API Key
│   ├── Balance Minim
│   └── Market Conditions
│
└── 📋 Ordine (100)
    └── Table with all 100 orders for THIS pair only
```

---

## Implementation Plan

### Phase 1: Data Structure Refactoring

#### 1.1 Add New State Variables
```javascript
// Investment Preview state
const showInvestmentPreview = ref(false);
const strategyPreview = ref({
  strategyName: '',
  totalPairs: 0,
  totalOrders: 0,
  totalInvestment: 0,
  totalBuyOrders: 0,
  totalSellOrders: 0,
  totalBuyInvestment: 0,
  totalSellValue: 0,
  pairs: [] // Array of pair previews
});

// Single Pair Modal state
const showSinglePairModal = ref(false);
const selectedPairForPreview = ref(null);
const singlePairOrders = ref([]);
const singlePairConfig = ref({});
```

#### 1.2 Modify `openGridPreview()` Function
```javascript
async function openGridPreview(rule) {
  const config = rule.actionConfig;
  const strategyId = config.oneClickStrategy;

  if (strategyId && strategyId !== 'custom') {
    const strategy = props.oneClickStrategies?.find(s => s._id === strategyId);

    if (strategy && strategy.pairs && strategy.pairs.length > 0) {
      // Calculate preview for ALL pairs
      await calculateStrategyPreview(strategy);

      // Open Investment Preview Modal
      showInvestmentPreview.value = true;
      return;
    }
  }

  // Custom config - open single pair modal directly
  await openSinglePairPreview(rule);
}
```

#### 1.3 Create `calculateStrategyPreview()` Function
```javascript
async function calculateStrategyPreview(strategy) {
  console.log(`📊 Calculating preview for "${strategy.name}" with ${strategy.pairs.length} pairs`);

  const pairPreviews = [];
  let totalOrders = 0;
  let totalBuyOrders = 0;
  let totalSellOrders = 0;
  let totalBuyInvestment = 0;
  let totalSellValue = 0;

  for (const pair of strategy.pairs) {
    // Fetch real price for this pair
    let currentPrice = 0.078; // Fallback

    try {
      const tickerResponse = await $fetch('/api/v1/fetchTicker', {
        method: 'GET',
        params: {
          userID: userID.value,
          symbol: pair.symbol,
          exchange: pair.exchange || 'coinbaseadvanced'
        }
      });

      if (tickerResponse.success && tickerResponse.ticker?.last) {
        currentPrice = parseFloat(tickerResponse.ticker.last);
        console.log(`✅ ${pair.symbol}: $${currentPrice}`);
      }
    } catch (error) {
      console.error(`❌ ${pair.symbol}:`, error.message);
    }

    // Calculate grid for this pair
    const lowerPricePercent = pair.lowerPricePercent || -20;
    const upperPricePercent = pair.upperPricePercent || 1;
    const nrOfGrids = pair.grids || 10;
    const amount = pair.amount || 1;

    const lowerPrice = currentPrice * (1 + lowerPricePercent / 100);
    const upperPrice = currentPrice * (1 + upperPricePercent / 100);
    const priceStep = (upperPrice - lowerPrice) / (nrOfGrids - 1);

    // Calculate orders for this pair
    let buyOrders = 0;
    let sellOrders = 0;
    let buyInvestment = 0;
    let sellValue = 0;

    for (let i = 0; i < nrOfGrids; i++) {
      const price = lowerPrice + (i * priceStep);
      const side = price < currentPrice ? 'buy' : 'sell';
      const total = price * amount;

      if (side === 'buy') {
        buyOrders++;
        buyInvestment += total;
      } else {
        sellOrders++;
        sellValue += total;
      }
    }

    // Store pair preview
    pairPreviews.push({
      symbol: pair.symbol,
      exchange: pair.exchange || 'coinbaseadvanced',
      currentPrice,
      lowerPrice,
      upperPrice,
      lowerPricePercent,
      upperPricePercent,
      nrOfGrids,
      amount,
      totalOrders: nrOfGrids,
      buyOrders,
      sellOrders,
      buyInvestment,
      sellValue,
      totalInvestment: buyInvestment,
      baseCurrency: pair.symbol.split('/')[0],
      quoteCurrency: pair.symbol.split('/')[1] || 'USDC'
    });

    // Accumulate totals
    totalOrders += nrOfGrids;
    totalBuyOrders += buyOrders;
    totalSellOrders += sellOrders;
    totalBuyInvestment += buyInvestment;
    totalSellValue += sellValue;
  }

  // Store strategy preview
  strategyPreview.value = {
    strategyName: strategy.name,
    totalPairs: strategy.pairs.length,
    totalOrders,
    totalBuyOrders,
    totalSellOrders,
    totalBuyInvestment,
    totalSellValue,
    totalInvestment: totalBuyInvestment,
    pairs: pairPreviews
  };

  console.log(`✅ Strategy preview calculated:`, strategyPreview.value);
}
```

#### 1.4 Create `openSinglePairModal()` Function
```javascript
function openSinglePairModal(pairPreview) {
  console.log(`📊 Opening single pair modal for ${pairPreview.symbol}`);

  // Generate orders for this specific pair
  const orders = [];
  const priceStep = (pairPreview.upperPrice - pairPreview.lowerPrice) / (pairPreview.nrOfGrids - 1);

  for (let i = 0; i < pairPreview.nrOfGrids; i++) {
    const price = pairPreview.lowerPrice + (i * priceStep);
    const side = price < pairPreview.currentPrice ? 'buy' : 'sell';

    orders.push({
      symbol: pairPreview.symbol,
      side,
      price,
      amount: pairPreview.amount,
      total: price * pairPreview.amount
    });
  }

  selectedPairForPreview.value = pairPreview;
  singlePairOrders.value = orders;
  singlePairConfig.value = {
    lowerPrice: pairPreview.lowerPrice,
    upperPrice: pairPreview.upperPrice,
    nrOfGrids: pairPreview.nrOfGrids,
    amount: pairPreview.amount,
    ordersSide: 'buyOrSell',
    currentPrice: pairPreview.currentPrice
  };

  showSinglePairModal.value = true;
}
```

---

### Phase 2: Template Restructuring

#### 2.1 Investment Preview Modal Template
```vue
<!-- Investment Preview Modal -->
<n-modal
  v-model:show="showInvestmentPreview"
  preset="card"
  :style="{ width: '90%', maxWidth: '1400px', maxHeight: '90vh' }"
  title="💰 Investment Preview"
  :bordered="false"
  size="huge"
>
  <template #header>
    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
      <span style="font-size: 18px; font-weight: 700;">💰 Investment Preview</span>
      <n-tag v-if="strategyPreview.strategyName" type="primary" size="small">
        {{ strategyPreview.strategyName }}
      </n-tag>
      <n-tag v-if="strategyPreview.totalPairs" type="success" size="small">
        {{ strategyPreview.totalPairs }} bots
      </n-tag>
      <n-tag v-if="strategyPreview.totalOrders" type="info" size="small">
        {{ strategyPreview.totalOrders }} orders
      </n-tag>
      <n-tag type="warning" size="small">
        ${{ strategyPreview.totalInvestment?.toFixed(2) || '0.00' }} total
      </n-tag>
    </div>
  </template>

  <div style="padding: 12px;">
    <n-tabs type="line" animated size="small">
      <!-- PER BOT TAB -->
      <n-tab-pane name="perBot" :tab="`🤖 Per Bot (${strategyPreview.totalPairs})`">
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px;">
          <div
            v-for="(pair, index) in strategyPreview.pairs"
            :key="index"
            @click="openSinglePairModal(pair)"
            style="background: #1a1f2e; padding: 10px; border-radius: 4px; border: 1px solid #2a3441; cursor: pointer;"
          >
            <div style="font-size: 13px; font-weight: 700; color: #6366f1;">{{ pair.symbol }}</div>
            <div style="font-size: 10px; color: #888;">{{ pair.totalOrders }} orders</div>
            <div style="font-size: 11px; color: #ffd93d; font-weight: 600;">
              ${{ pair.totalInvestment?.toFixed(2) }}
            </div>
          </div>
        </div>
      </n-tab-pane>

      <!-- TOTAL STRATEGY TAB -->
      <n-tab-pane name="total" tab="📊 Total Strategie">
        <!-- Total stats cards -->
      </n-tab-pane>
    </n-tabs>
  </div>
</n-modal>

<!-- Single Pair Modal (reuse existing modal structure but with singlePairOrders) -->
<n-modal v-model:show="showSinglePairModal">
  <!-- Existing modal template but using selectedPairForPreview and singlePairOrders -->
</n-modal>
```

---

### Phase 3: Button Update in ViewRulesModal

Change button from direct modal open to Investment Preview:

```vue
<n-button size="tiny" type="primary" @click="openGridPreview(rule)">
  📊 View Grid Orders
</n-button>
```

---

## Benefits of This Approach

✅ **Matches OneClick Bot** - Identical user experience
✅ **Real Prices Per Pair** - Each pair gets its own current price
✅ **Organized View** - Users see overview first, then drill down
✅ **Performance** - Only loads detailed orders when user clicks on a pair
✅ **Scalability** - Works for 1 pair or 100 pairs

---

## Files To Modify

1. `components/CoPilot/ViewRulesModal.vue` - Complete refactor
2. Documentation files (this file + completion file)

---

## Testing Checklist

- [ ] Click "View Grid Orders" on OneClick strategy rule
- [ ] Investment Preview modal opens with all 25 pairs
- [ ] Per Bot tab shows 25 cards
- [ ] Total Strategie tab shows correct totals
- [ ] Click on a pair card
- [ ] Single Pair Modal opens with correct orders for THAT pair only
- [ ] Statistici tab shows correct buy/sell breakdown
- [ ] Necesare tab shows capital requirements
- [ ] Ordine tab shows all orders for that specific pair
- [ ] Prices are different for each pair (not all 0.078)
- [ ] Close modals work correctly

---

**Status:** 🚧 Ready to implement
**Next:** Refactor ViewRulesModal.vue with new structure
