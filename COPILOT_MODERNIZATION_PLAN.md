# Co-Pilot Bot Modernization Plan

## 🎯 Executive Summary

**Current State:** Co-Pilot has outdated single-market form component (665 lines) that lacks modern UI/UX features.

**Target State:** Modernized multi-market form matching OneClick standards with all latest features.

**Effort:** ~1.5-2 weeks development + testing

**Impact:** HIGH - Enables efficient multi-market grid bot management with visual feedback

---

## 📊 Current vs Target Architecture

### BEFORE (Current - Broken)
```
pages/Bots/Co-Pilot.vue (4,265 lines)
└── Monolithic monitoring system
    ├── Order table
    ├── Automation rules
    ├── Performance stats
    └── ❌ NO FORM COMPONENT IMPORT!

components/Bots/Co-Pilot-bots-form.vue (665 lines)
└── ❌ ORPHANED - Not used anywhere!
    ├── Single market only
    ├── localStorage strategies
    ├── No BULK operations
    └── No investment preview
```

### AFTER (Target - Unified)
```
pages/Bots/Co-Pilot.vue (REFACTORED)
├── Import Co-Pilot-bots-form component ✅
├── Keep monitoring features ✅
├── Keep automation rules ✅
└── Keep performance stats ✅

components/Bots/Co-Pilot-bots-form.vue (NEW - 2,300+ lines)
├── Compact fixed header ✅
├── Multi-market support ✅
├── Main Control Panel ✅
├── BULK operations ✅
├── Investment Preview ✅
├── Side selector per market ✅
├── Auto-populate ±20% ✅
└── Database strategies ✅
```

---

## 🔧 Detailed Refactoring Steps

### PHASE 1: Script Setup & Data Structure (Lines 1-350)

#### 1.1 Import Statements
```javascript
import { useAppStore } from '~/stores/app.store';
import { ref, h, onMounted, computed } from "vue";
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async';

// NEW: Import bot calculations composable
const {
  calculateGridOrders,
  calculateTotalInvestment,
  calculateTotalBaseAmount,
  getBaseCurrency,
  getQuoteCurrency
} = useBotCalculations();
```

#### 1.2 Configuration Refs (Replace lines 19-41)
```javascript
// Config inputs with default ±20%
let incrementalPercentAmountBuy = ref('1');
let incrementalPercentAmountSell = ref('1');
let deviationPriceBuy = ref('20');  // ✅ NEW: Default 20%
let deviationPriceSell = ref('20'); // ✅ NEW: Default 20%
let deviationAmountBuy = ref('0.9');
let deviationAmountSell = ref('0.9');
```

#### 1.3 Multi-Market Support (NEW)
```javascript
// Replace single symbol with multi-market arrays
const selectedMarkets = ref([]); // Array of market symbols
const marketForms = ref([]);     // Array of form data per market

// Market form structure per market:
{
  symbol: 'BTC/USDC',
  name: 'CoPilotBot_BTC/USDC',
  lowerPrice: '',
  upperPrice: '',
  amount: '1.1',
  nrOfGrids: '10',
  ordersSide: 'buyOrSell',  // ✅ NEW: Per-market side
  bestBid: null,
  bestAsk: null
}
```

#### 1.4 Bulk Mode Tracking (NEW)
```javascript
const activeBulkMode = ref(null); // null, 'buyOnly', 'sellOnly', or 'buyOrSell'
```

#### 1.5 Computed Properties for Button States (NEW)
```javascript
const isCreateDisabled = computed(() => {
  if (marketForms.value.length === 0) return false;
  const allSides = marketForms.value.map(f => f.ordersSide);
  const uniqueSides = [...new Set(allSides)];
  if (uniqueSides.length === 1 && uniqueSides[0] !== 'buyOrSell') {
    return true;
  }
  return false;
});

const isBuyDisabled = computed(() => {
  if (marketForms.value.length === 0) return false;
  const allSides = marketForms.value.map(f => f.ordersSide);
  const uniqueSides = [...new Set(allSides)];
  if (uniqueSides.length === 1 && uniqueSides[0] !== 'buyOnly') {
    return true;
  }
  return false;
});

const isSellDisabled = computed(() => {
  if (marketForms.value.length === 0) return false;
  const allSides = marketForms.value.map(f => f.ordersSide);
  const uniqueSides = [...new Set(allSides)];
  if (uniqueSides.length === 1 && uniqueSides[0] !== 'sellOnly') {
    return true;
  }
  return false;
});
```

---

### PHASE 2: BULK Operations Functions (NEW - Lines 166-191)

```javascript
// Update lower price for all markets
function updateLowerPriceForAll(deviationPercentage) {
  marketForms.value.forEach((marketForm) => {
    if (marketForm.bestBid) {
      marketForm.lowerPrice = (parseFloat(marketForm.bestBid) * (1 - deviationPercentage)).toFixed(6);
    }
  });
}

// Update upper price for all markets
function updateUpperPriceForAll(deviationPercentage) {
  marketForms.value.forEach((marketForm) => {
    if (marketForm.bestAsk) {
      marketForm.upperPrice = (parseFloat(marketForm.bestAsk) * (1 + deviationPercentage)).toFixed(6);
    }
  });
}

// Set amount for all markets
function setAmount(value) {
  marketForms.value.forEach((marketForm) => {
    marketForm.amount = String(value);
  });
}

// Set grids for all markets
function setNrOfGrids(value) {
  marketForms.value.forEach((marketForm) => {
    marketForm.nrOfGrids = String(value);
  });
}

// Set all bots to same ordersSide (bulk operation)
function setAllSides(side) {
  activeBulkMode.value = side;
  marketForms.value.forEach((marketForm) => {
    marketForm.ordersSide = side;
  });
}

// Reset bulk mode when user manually changes a single bot's side
function onIndividualSideChange() {
  activeBulkMode.value = null;
}
```

---

### PHASE 3: Market Management Functions (NEW - Lines 91-162)

```javascript
// Market search
const marketSearchQuery = ref('');
const filteredMarkets = computed(() => {
  if (!marketSearchQuery.value) {
    return userExchangeMarkets.value;
  }
  const query = marketSearchQuery.value.toLowerCase();
  return userExchangeMarkets.value.filter(market =>
    market.label?.toLowerCase().includes(query) ||
    market.value?.toLowerCase().includes(query)
  );
});

// Add market to selection
function addMarket(market) {
  if (!selectedMarkets.value.includes(market)) {
    selectedMarkets.value.push(market);
    updateSelectedMarkets(selectedMarkets.value);
  }
}

// Remove market from selection
function removeMarket(market) {
  const index = selectedMarkets.value.indexOf(market);
  if (index > -1) {
    selectedMarkets.value.splice(index, 1);
    marketForms.value = marketForms.value.filter(mf => mf.symbol !== market);
  }
}

// Update market forms when markets change
async function updateSelectedMarkets(markets) {
  selectedMarkets.value = markets;

  marketForms.value = markets.map((market) => ({
    symbol: market,
    name: `CoPilotBot_${market}`,
    lowerPrice: '',
    upperPrice: '',
    amount: '1.1',
    nrOfGrids: '10',
    ordersSide: 'buyOrSell',
    bestBid: null,
    bestAsk: null,
  }));

  await fetchOrderBook();
}

// Fetch order book and auto-populate prices
async function fetchOrderBook() {
  try {
    for (let market of selectedMarkets.value) {
      const response = await $fetch('/api/v1/fetchOrderBook', {
        method: 'GET',
        params: {
          userID: userID.value,
          exchange: selectedExchange.value,
          symbol: market
        }
      });
      const orderBook = response.data;

      const marketForm = marketForms.value.find((mf) => mf.symbol === market);
      if (marketForm) {
        marketForm.bestBid = orderBook?.bids?.[0]?.[0] || 'N/A';
        marketForm.bestAsk = orderBook?.asks?.[0]?.[0] || 'N/A';

        // ✅ AUTO-POPULATE Lower/Upper with ±20%
        if (marketForm.bestBid && marketForm.bestBid !== 'N/A') {
          const deviationBuy = parseFloat(deviationPriceBuy.value) / 100 || 0.20;
          marketForm.lowerPrice = (parseFloat(marketForm.bestBid) * (1 - deviationBuy)).toFixed(6);
        }
        if (marketForm.bestAsk && marketForm.bestAsk !== 'N/A') {
          const deviationSell = parseFloat(deviationPriceSell.value) / 100 || 0.20;
          marketForm.upperPrice = (parseFloat(marketForm.bestAsk) * (1 + deviationSell)).toFixed(6);
        }

        console.log(`📊 ${market}: Bid=${marketForm.bestBid}, Ask=${marketForm.bestAsk}, Lower=${marketForm.lowerPrice}, Upper=${marketForm.upperPrice}`);
      }
    }
  } catch (error) {
    console.error('Error fetching order book:', error);
  }
}
```

---

### PHASE 4: Investment Preview Calculation (NEW - Lines 430-640)

```javascript
const showInvestmentPreview = ref(true);

// Calculate investment preview for all markets
const investmentPreview = computed(() => {
  return marketForms.value.map((marketForm, index) => {
    const lowerPrice = parseFloat(marketForm.lowerPrice) || 0;
    const upperPrice = parseFloat(marketForm.upperPrice) || 0;
    const amount = parseFloat(marketForm.amount) || 0;
    const grids = parseInt(marketForm.nrOfGrids) || 0;
    const ordersSide = marketForm.ordersSide || 'buyOrSell';

    // Calculate grid orders using composable
    const orders = calculateGridOrders(
      lowerPrice,
      upperPrice,
      amount,
      grids,
      ordersSide,
      parseFloat(incrementalPercentAmountBuy.value) || 1,
      parseFloat(incrementalPercentAmountSell.value) || 1,
      parseFloat(deviationAmountBuy.value) || 0.9,
      parseFloat(deviationAmountSell.value) || 0.9
    );

    const {
      totalBase,
      totalInvestment,
      avgPrice
    } = calculateTotalInvestment(orders, marketForm.symbol);

    return {
      symbol: marketForm.symbol,
      baseCurrency: getBaseCurrency(marketForm.symbol),
      quoteCurrency: getQuoteCurrency(marketForm.symbol),
      totalBase,
      totalInvestment,
      avgPrice,
      ordersCount: orders.length,
      orders
    };
  });
});

// Calculate grand totals
const grandTotals = computed(() => {
  const totalInvestment = investmentPreview.value.reduce((sum, p) => sum + p.totalInvestment, 0);
  const totalOrders = investmentPreview.value.reduce((sum, p) => sum + p.ordersCount, 0);
  const totalBuyOrders = investmentPreview.value.reduce((sum, p) => {
    return sum + p.orders.filter(o => o.side === 'buy').length;
  }, 0);
  const totalSellOrders = investmentPreview.value.reduce((sum, p) => {
    return sum + p.orders.filter(o => o.side === 'sell').length;
  }, 0);

  return {
    totalInvestment,
    totalOrders,
    totalBuyOrders,
    totalSellOrders
  };
});
```

---

### PHASE 5: Template Structure (Lines 794-1300)

#### 5.1 Compact Fixed Header
```vue
<div class="compact-header-fixed">
  <div style="display: flex; align-items: center; gap: 12px;">
    <span class="header-title-small">🤖 Co-Pilot</span>

    <!-- Selected Markets Display (Limited to first 5) -->
    <div style="display: flex; align-items: center; gap: 6px;">
      <n-tag
        v-for="market in selectedMarkets.slice(0, 5)"
        :key="market"
        closable
        @close="removeMarket(market)"
        type="success"
        size="small"
        style="font-size: 10px; padding: 2px 6px;"
      >
        {{ market }}
      </n-tag>

      <!-- "+X more" popover -->
      <n-popover v-if="selectedMarkets.length > 5" trigger="hover" placement="bottom">
        <template #trigger>
          <n-tag type="info" size="small" style="font-size: 10px; padding: 2px 6px; cursor: pointer;">
            +{{ selectedMarkets.length - 5 }} more
          </n-tag>
        </template>
        <div style="max-height: 300px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;">
          <n-tag
            v-for="market in selectedMarkets.slice(5)"
            :key="market"
            closable
            @close="removeMarket(market)"
            type="success"
            size="small"
          >
            {{ market }}
          </n-tag>
        </div>
      </n-popover>

      <!-- Add Market Button -->
      <n-popover trigger="click" placement="bottom-start">
        <template #trigger>
          <n-button size="tiny" circle type="primary" style="width: 24px; height: 24px;">
            +
          </n-button>
        </template>
        <div style="max-height: 400px; overflow-y: auto;">
          <n-input
            v-model:value="marketSearchQuery"
            placeholder="Search markets..."
            size="small"
            clearable
            style="margin-bottom: 8px;"
          />
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <n-button
              v-for="market in filteredMarkets"
              :key="market.value"
              text
              size="small"
              @click="addMarket(market.value)"
              :disabled="selectedMarkets.includes(market.value)"
            >
              {{ market.label }}
            </n-button>
          </div>
        </div>
      </n-popover>
    </div>
  </div>
</div>
```

#### 5.2 Main Control Panel
```vue
<div class="main-control-panel" v-if="marketForms.length > 0">
  <!-- ROW 1: Action Buttons -->
  <div class="control-row">
    <!-- Actions Section -->
    <div class="control-section">
      <span class="section-label">Actions</span>
      <div class="button-group">
        <n-button type="primary" size="tiny" @click="createCoPilotBot" :disabled="isCreateDisabled">
          🚀 Create
        </n-button>
        <n-button type="success" size="tiny" @click="handleBuy" :disabled="isBuyDisabled">
          📈 Buy
        </n-button>
        <n-button type="error" size="tiny" @click="handleSell" :disabled="isSellDisabled">
          📉 Sell
        </n-button>
      </div>
    </div>

    <!-- Lower Price Section (GREEN) -->
    <div class="control-section">
      <span class="section-label">Lower Price</span>
      <div class="button-group">
        <n-button size="tiny" type="success" @click="() => updateLowerPriceForAll(0.01)">-1%</n-button>
        <n-button size="tiny" type="success" @click="() => updateLowerPriceForAll(0.02)">-2%</n-button>
        <n-button size="tiny" type="success" @click="() => updateLowerPriceForAll(0.1)">-10%</n-button>
        <n-button size="tiny" type="success" @click="() => updateLowerPriceForAll(0.2)">-20%</n-button>
        <n-button size="tiny" type="success" @click="() => updateLowerPriceForAll(0.5)">-50%</n-button>
        <n-button size="tiny" type="success" @click="() => updateLowerPriceForAll(0.97)">-97%</n-button>
        <n-button size="tiny" type="success" @click="() => updateLowerPriceForAll(0.98)">-98%</n-button>
      </div>
    </div>

    <!-- Upper Price Section (RED) -->
    <div class="control-section">
      <span class="section-label">Upper Price</span>
      <div class="button-group">
        <n-button size="tiny" type="error" @click="() => updateUpperPriceForAll(0.01)">1x</n-button>
        <n-button size="tiny" type="error" @click="() => updateUpperPriceForAll(0.02)">2x</n-button>
        <n-button size="tiny" type="error" @click="() => updateUpperPriceForAll(0.1)">10x</n-button>
        <n-button size="tiny" type="error" @click="() => updateUpperPriceForAll(0.2)">20x</n-button>
        <n-button size="tiny" type="error" @click="() => updateUpperPriceForAll(0.5)">50x</n-button>
        <n-button size="tiny" type="error" @click="() => updateUpperPriceForAll(1.0)">100x</n-button>
        <n-button size="tiny" type="error" @click="() => updateUpperPriceForAll(2.0)">200x</n-button>
      </div>
    </div>

    <!-- Amount Section (BLUE) -->
    <div class="control-section">
      <span class="section-label">Amount</span>
      <div class="button-group">
        <n-button size="tiny" type="info" @click="() => setAmount(1)">1</n-button>
        <n-button size="tiny" type="info" @click="() => setAmount(5)">5</n-button>
        <n-button size="tiny" type="info" @click="() => setAmount(10)">10</n-button>
        <n-button size="tiny" type="info" @click="() => setAmount(50)">50</n-button>
        <n-button size="tiny" type="info" @click="() => setAmount(100)">100</n-button>
      </div>
    </div>

    <!-- Grids Section -->
    <div class="control-section">
      <span class="section-label">Grids</span>
      <div class="button-group">
        <n-button size="tiny" @click="() => setNrOfGrids(5)">5</n-button>
        <n-button size="tiny" @click="() => setNrOfGrids(10)">10</n-button>
        <n-button size="tiny" @click="() => setNrOfGrids(20)">20</n-button>
        <n-button size="tiny" @click="() => setNrOfGrids(50)">50</n-button>
        <n-button size="tiny" @click="() => setNrOfGrids(100)">100</n-button>
      </div>
    </div>
  </div>

  <!-- ROW 2: Config Inputs -->
  <div class="control-row" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #2a3441;">
    <div class="control-section" style="flex: 1;">
      <span class="section-label">⚙️ Config</span>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <!-- Inc % Buy (GREEN) -->
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-size: 9px; color: #10eb04; font-weight: 600;">📈 Inc % Buy</label>
          <n-input
            v-model:value="incrementalPercentAmountBuy"
            size="tiny"
            placeholder="1.0"
            style="width: 85px; --n-border: 1px solid rgba(16, 235, 4, 0.3); --n-border-hover: 1px solid rgba(16, 235, 4, 0.5); --n-border-focus: 1px solid #10eb04;"
          />
        </div>

        <!-- Inc % Sell (RED) -->
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-size: 9px; color: #eb0404; font-weight: 600;">📉 Inc % Sell</label>
          <n-input
            v-model:value="incrementalPercentAmountSell"
            size="tiny"
            placeholder="1.0"
            style="width: 85px; --n-border: 1px solid rgba(235, 4, 4, 0.3); --n-border-hover: 1px solid rgba(235, 4, 4, 0.5); --n-border-focus: 1px solid #eb0404;"
          />
        </div>

        <!-- Dev Price Buy (GREEN) -->
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-size: 9px; color: #10eb04; font-weight: 600;">📈 Dev Price Buy</label>
          <n-input
            v-model:value="deviationPriceBuy"
            size="tiny"
            placeholder="20"
            style="width: 85px; --n-border: 1px solid rgba(16, 235, 4, 0.3); --n-border-hover: 1px solid rgba(16, 235, 4, 0.5); --n-border-focus: 1px solid #10eb04;"
          />
        </div>

        <!-- Dev Price Sell (RED) -->
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-size: 9px; color: #eb0404; font-weight: 600;">📉 Dev Price Sell</label>
          <n-input
            v-model:value="deviationPriceSell"
            size="tiny"
            placeholder="20"
            style="width: 85px; --n-border: 1px solid rgba(235, 4, 4, 0.3); --n-border-hover: 1px solid rgba(235, 4, 4, 0.5); --n-border-focus: 1px solid #eb0404;"
          />
        </div>

        <!-- Dev Amt Buy (GREEN) -->
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-size: 9px; color: #10eb04; font-weight: 600;">📈 Dev Amt Buy</label>
          <n-input
            v-model:value="deviationAmountBuy"
            size="tiny"
            placeholder="0.9"
            style="width: 85px; --n-border: 1px solid rgba(16, 235, 4, 0.3); --n-border-hover: 1px solid rgba(16, 235, 4, 0.5); --n-border-focus: 1px solid #10eb04;"
          />
        </div>

        <!-- Dev Amt Sell (RED) -->
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label style="font-size: 9px; color: #eb0404; font-weight: 600;">📉 Dev Amt Sell</label>
          <n-input
            v-model:value="deviationAmountSell"
            size="tiny"
            placeholder="0.9"
            style="width: 85px; --n-border: 1px solid rgba(235, 4, 4, 0.3); --n-border-hover: 1px solid rgba(235, 4, 4, 0.5); --n-border-focus: 1px solid #eb0404;"
          />
        </div>

        <!-- Save Button -->
        <div style="display: flex; align-items: flex-end;">
          <n-button type="primary" size="tiny" @click="saveConfiguration">💾 Save</n-button>
        </div>
      </div>
    </div>
  </div>

  <!-- ROW 3: Saved Configs & Strategies -->
  <div class="control-row" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #2a3441;">
    <!-- Saved Configs -->
    <div class="control-section" style="flex: 1;">
      <span class="section-label">💾 Saved Configs</span>
      <div class="saved-list-inline">
        <div v-for="(config, index) in savedConfigurations" :key="index" class="saved-item-inline">
          <span class="saved-name">{{ config.name }}</span>
          <div style="display: flex; gap: 4px;">
            <n-button size="tiny" @click="applyConfiguration(config)">Apply</n-button>
            <n-button v-if="!config.isDefault" size="tiny" type="error" @click="deleteConfiguration(index)">×</n-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Strategies -->
    <div class="control-section" style="flex: 1; border-left: 1px solid #2a3441; padding-left: 12px;">
      <span class="section-label">🎯 Strategies</span>
      <!-- Strategy management UI here -->
    </div>
  </div>
</div>
```

#### 5.3 Bot Grid Table
```vue
<!-- Main Table -->
<div class="main-table">
  <table class="compact-table">
    <thead>
      <tr>
        <th>Symbol</th>
        <th style="color: #10eb04;">Bid</th>
        <th style="color: #eb0404;">Ask</th>
        <th>Spread</th>
        <th>Side</th>
        <th>Bot Name</th>
        <th style="color: #10eb04;">Lower Price</th>
        <th style="color: #eb0404;">Upper Price</th>
        <th>Amount</th>
        <th>Grids</th>
        <th colspan="3">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span>BULK:</span>
            <n-button type="success" size="tiny" @click="() => setAllSides('buyOnly')">
              📈 Buy
            </n-button>
            <n-button type="error" size="tiny" @click="() => setAllSides('sellOnly')">
              📉 Sell
            </n-button>
            <n-button type="info" size="tiny" @click="() => setAllSides('buyOrSell')">
              🔄 Both
            </n-button>
          </div>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(marketForm, index) in marketForms" :key="index">
        <td><n-tag type="info" size="small">{{ marketForm.symbol }}</n-tag></td>
        <td class="price-bid">{{ marketForm.bestBid || '-' }}</td>
        <td class="price-ask">{{ marketForm.bestAsk || '-' }}</td>
        <td class="price-spread">
          {{ marketForm.bestBid && marketForm.bestAsk ?
             ((parseFloat(marketForm.bestAsk) - parseFloat(marketForm.bestBid)) / parseFloat(marketForm.bestBid) * 100).toFixed(3) + '%' :
             '-' }}
        </td>
        <td>
          <n-select
            v-model:value="marketForm.ordersSide"
            :options="[
              { label: '📈 Buy', value: 'buyOnly' },
              { label: '📉 Sell', value: 'sellOnly' },
              { label: '🔄 Both', value: 'buyOrSell' }
            ]"
            size="tiny"
            style="width: 90px;"
            @update:value="onIndividualSideChange"
          />
        </td>
        <td><n-input v-model:value="marketForm.name" size="tiny" placeholder="Bot name" /></td>
        <td>
          <n-input
            v-model:value="marketForm.lowerPrice"
            size="tiny"
            placeholder="Lower"
            style="--n-color: rgba(16, 235, 4, 0.1); --n-text-color: #10eb04; --n-border: 1px solid rgba(16, 235, 4, 0.3);"
          />
        </td>
        <td>
          <n-input
            v-model:value="marketForm.upperPrice"
            size="tiny"
            placeholder="Upper"
            style="--n-color: rgba(235, 4, 4, 0.1); --n-text-color: #eb0404; --n-border: 1px solid rgba(235, 4, 4, 0.3);"
          />
        </td>
        <td><n-input v-model:value="marketForm.amount" size="tiny" placeholder="Amount" /></td>
        <td><n-input v-model:value="marketForm.nrOfGrids" size="tiny" placeholder="Grids" /></td>
      </tr>
    </tbody>
  </table>
</div>
```

#### 5.4 Investment Preview Panel
```vue
<div class="investment-preview" v-if="marketForms.length > 0">
  <div class="preview-header" @click="showInvestmentPreview = !showInvestmentPreview">
    <span class="preview-title">💰 Investment Preview</span>
    <span class="preview-summary">
      {{ marketForms.length }} bot{{ marketForms.length !== 1 ? 's' : '' }} •
      {{ grandTotals.totalOrders }} orders •
      ${{ grandTotals.totalInvestment.toFixed(2) }} total
    </span>
  </div>

  <transition name="slide-fade">
    <div v-show="showInvestmentPreview">
      <n-tabs type="line" size="small" animated>
        <!-- PER BOT VIEW -->
        <n-tab-pane name="perBot" :tab="`🤖 Per Bot (${marketForms.length})`">
          <div class="preview-grid">
            <div
              v-for="(preview, index) in investmentPreview"
              :key="index"
              class="preview-card"
              @click="() => openBotOrdersModal(preview, index)"
            >
              <div class="preview-card-header">
                <span class="preview-symbol">{{ preview.symbol }}</span>
                <span class="preview-orders">{{ preview.ordersCount }} orders 🔍</span>
              </div>
              <div class="preview-card-body">
                <div class="preview-stat">
                  <span class="preview-label">Base Amount</span>
                  <span class="preview-value">{{ preview.totalBase.toFixed(4) }} {{ preview.baseCurrency }}</span>
                </div>
                <div class="preview-stat">
                  <span class="preview-label">Quote Investment</span>
                  <span class="preview-value">${{ preview.totalInvestment.toFixed(2) }} {{ preview.quoteCurrency }}</span>
                </div>
                <div class="preview-stat">
                  <span class="preview-label">Avg Price</span>
                  <span class="preview-value">${{ preview.avgPrice.toFixed(6) }}</span>
                </div>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <!-- TOTAL STRATEGY VIEW -->
        <n-tab-pane name="totalStrategy" tab="📊 Total Strategy">
          <div class="total-strategy-card">
            <div class="total-row">
              <span class="total-label">💰 Total Investment</span>
              <span class="total-value">${{ grandTotals.totalInvestment.toFixed(2) }} USDC</span>
            </div>
            <div class="total-row">
              <span class="total-label">📊 Total Orders</span>
              <span class="total-value">{{ grandTotals.totalOrders }}</span>
            </div>
            <div class="total-row">
              <span class="total-label">📈 Buy Orders</span>
              <span class="total-value" style="color: #10eb04;">{{ grandTotals.totalBuyOrders }}</span>
            </div>
            <div class="total-row">
              <span class="total-label">📉 Sell Orders</span>
              <span class="total-value" style="color: #eb0404;">{{ grandTotals.totalSellOrders }}</span>
            </div>
          </div>
        </n-tab-pane>
      </n-tabs>
    </div>
  </transition>
</div>
```

---

### PHASE 6: CSS Styling (Lines 1658-2100)

Copy all CSS classes from OneClick:
- `.compact-header-fixed`
- `.header-title-small`
- `.main-control-panel`
- `.control-row`
- `.control-section`
- `.section-label`
- `.button-group`
- `.saved-list-inline`
- `.saved-item-inline`
- `.price-bid` (green #10eb04)
- `.price-ask` (red #eb0404)
- `.price-spread` (yellow)
- `.investment-preview`
- `.preview-grid`
- `.preview-card`
- `.total-strategy-card`
- etc.

---

## 📋 Implementation Checklist

### Pre-Flight
- [ ] Create full backup of current Co-Pilot-bots-form.vue
- [ ] Review OneClick-bots-form.vue structure
- [ ] Create feature branch: `feature/copilot-modernization`

### Script Setup
- [ ] Update imports (add composables)
- [ ] Replace single-market refs with multi-market arrays
- [ ] Add bulk mode tracking ref
- [ ] Implement computed properties for button states
- [ ] Add configuration refs with ±20% defaults

### Functions
- [ ] Implement market management functions (add/remove/search)
- [ ] Implement BULK operation functions
- [ ] Implement auto-populate fetchOrderBook with ±20%
- [ ] Implement investment preview calculations
- [ ] Update createCoPilotBot to handle multi-market

### Template
- [ ] Replace old header with compact fixed header
- [ ] Build Main Control Panel with 5 sections
- [ ] Add color-coded buttons (green/red/blue)
- [ ] Build bot grid table with Side selector per row
- [ ] Add BULK buttons in table header
- [ ] Build Investment Preview panel with tabs
- [ ] Add Grid Orders detail modal

### Styling
- [ ] Copy all CSS from OneClick
- [ ] Update class names if needed
- [ ] Ensure color scheme matches (green/red/blue)
- [ ] Test responsive layout

### Integration
- [ ] Update pages/Bots/Co-Pilot.vue to import form component
- [ ] Remove duplicate functionality from page component
- [ ] Ensure monitoring features remain functional
- [ ] Test end-to-end workflow

### Testing
- [ ] Test multi-market selection
- [ ] Test BULK operations
- [ ] Test Side selector per market
- [ ] Test auto-populate ±20%
- [ ] Test investment preview calculations
- [ ] Test button state logic
- [ ] Test strategy saving/loading
- [ ] Test with 50+ markets
- [ ] Test with Co-Pilot monitoring features

---

## 🚨 Breaking Changes

### API Changes
- **BEFORE:** Single bot creation
- **AFTER:** Batch bot creation (array of bots)

### Data Structure Changes
- **BEFORE:** `ordersSide` global for all orders
- **AFTER:** `ordersSide` per market

### Function Signature Changes
- **createCoPilotBot():** Now accepts multi-market data

---

## 🎯 Success Criteria

1. ✅ Multi-market support with inline selection
2. ✅ BULK operations for all parameters
3. ✅ Color-coded buttons (green/red/blue)
4. ✅ Side selector per market dropdown
5. ✅ Auto-populate ±20% on market selection
6. ✅ Investment preview with per-bot and total views
7. ✅ Button state logic (disable based on sides)
8. ✅ Compact fixed header with "+X more" display
9. ✅ All CSS styling matches OneClick
10. ✅ Co-Pilot monitoring features still work

---

## 📚 Reference Files

### Source (Copy From)
- `components/Bots/OneClick-bots-form.vue`
- Lines 1-2347 (entire file)

### Target (Update)
- `components/Bots/Co-Pilot-bots-form.vue`
- Lines 1-665 (replace entirely)

### Integration Target
- `pages/Bots/Co-Pilot.vue`
- Add import statement
- Replace monolithic form with component

---

## 🔄 Migration Strategy

**OPTION A: Complete Replacement** (Recommended)
1. Backup old file
2. Copy OneClick-bots-form.vue to Co-Pilot-bots-form.vue
3. Update bot name from "OneClickBot" to "CoPilotBot"
4. Update API endpoint from `/createGridBot` to `/createCoPilotBot`
5. Test thoroughly

**OPTION B: Incremental Update**
1. Update script setup section by section
2. Add new template sections one at a time
3. Copy CSS gradually
4. Test after each major section

**Recommended:** Option A for speed and consistency.

---

## 📅 Timeline

| Phase | Task | Duration |
|-------|------|----------|
| 1 | Backup & Setup | 1 hour |
| 2 | Script Refactoring | 4-6 hours |
| 3 | Template Rebuild | 6-8 hours |
| 4 | CSS Styling | 2-3 hours |
| 5 | Integration | 3-4 hours |
| 6 | Testing | 4-6 hours |
| **TOTAL** | | **20-28 hours** (2.5-3.5 days) |

---

## 🛠️ Tools & Commands

### Backup Command
```bash
cp components/Bots/Co-Pilot-bots-form.vue components/Bots/Co-Pilot-bots-form.vue.backup
```

### Git Commands
```bash
git checkout -b feature/copilot-modernization
git add components/Bots/Co-Pilot-bots-form.vue
git commit -m "refactor: modernize Co-Pilot form with OneClick standards"
```

### Test Command
```bash
npm run dev
# Navigate to http://localhost:3000/Bots/Co-Pilot
# Test all features
```

---

## 📝 Notes

- This is a MAJOR refactoring effort
- Expect 2-3 days of focused development
- High priority due to user impact
- Preserve Co-Pilot's unique monitoring features
- OneClick is the proven template - use it

---

**Status:** 📋 READY FOR IMPLEMENTATION
**Priority:** 🔴 HIGH
**Estimated Effort:** 2.5-3.5 days
**Risk Level:** Medium (breaking changes)

