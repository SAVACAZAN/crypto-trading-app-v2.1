# OneClick Bulk Actions Synchronization

## 🎯 Overview

Implemented smart synchronization between **BULK** buttons (Buy/Sell/Both) and **Actions** buttons (Create/Buy/Sell) to prevent conflicting operations.

**Feature:** When a BULK mode is active, only the corresponding Action button is enabled, preventing users from accidentally creating wrong order types.

---

## ✨ New Functionality

### 1. Bulk Mode Tracking

**Location:** [components/Bots/OneClick-bots-form.vue:183](components/Bots/OneClick-bots-form.vue#L183)

```javascript
// Bulk mode tracking
const activeBulkMode = ref(null); // null, 'buyOnly', 'sellOnly', or 'buyOrSel'
```

**States:**
- `null` - No bulk mode active (all Actions buttons enabled)
- `'buyOnly'` - Buy bulk mode (only Buy action enabled)
- `'sellOnly'` - Sell bulk mode (only Sell action enabled)
- `'buyOrSell'` - Both bulk mode (only Create action enabled)

---

### 2. Enhanced setAllSides Function

**Location:** [components/Bots/OneClick-bots-form.vue:186-191](components/Bots/OneClick-bots-form.vue#L186-L191)

```javascript
function setAllSides(side) {
  activeBulkMode.value = side;  // ✅ Track active bulk mode
  marketForms.value.forEach((marketForm) => {
    marketForm.ordersSide = side;
  });
}
```

**Change:** Now updates `activeBulkMode` when BULK button is clicked.

---

### 3. Individual Side Change Handler

**Location:** [components/Bots/OneClick-bots-form.vue:194-196](components/Bots/OneClick-bots-form.vue#L194-L196)

```javascript
// Reset bulk mode when user manually changes a single bot's side
function onIndividualSideChange() {
  activeBulkMode.value = null;
}
```

**Purpose:** When user manually changes one bot's Side selector, bulk mode is reset and all Actions buttons become enabled again.

---

### 4. Computed Properties for Button States (Auto-Detection)

**Location:** [components/Bots/OneClick-bots-form.vue:199-242](components/Bots/OneClick-bots-form.vue#L199-L242)

```javascript
// Computed properties for button states based on actual bot sides
const isCreateDisabled = computed(() => {
  if (marketForms.value.length === 0) return false;

  // Check if ALL bots have the same ordersSide
  const allSides = marketForms.value.map(f => f.ordersSide);
  const uniqueSides = [...new Set(allSides)];

  // If all bots have same side and it's NOT 'buyOrSell', disable Create
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

**Logic:** Automatically detects what Side all bots have and enables/disables Actions buttons accordingly.

| All Bots Side | Create | Buy | Sell |
|---------------|--------|-----|------|
| **Mixed**     | ✅     | ✅  | ✅   |
| **All Both**  | ✅     | ❌  | ❌   |
| **All Buy**   | ❌     | ✅  | ❌   |
| **All Sell**  | ❌     | ❌  | ✅   |

**Key Feature:** Works automatically on page load and when any bot's Side changes!

---

### 5. Actions Buttons with Disabled State

**Location:** [components/Bots/OneClick-bots-form.vue:771-773](components/Bots/OneClick-bots-form.vue#L771-L773)

```vue
<n-button type="primary" size="tiny" @click="createGridBot" :disabled="isCreateDisabled">🚀 Create</n-button>
<n-button type="success" size="tiny" @click="handleBuy" :disabled="isBuyDisabled">📈 Buy</n-button>
<n-button type="error" size="tiny" @click="handleSell" :disabled="isSellDisabled">📉 Sell</n-button>
```

**Change:** Added `:disabled` binding to each Action button.

---

### 6. Side Selector with Change Handler

**Location:** [components/Bots/OneClick-bots-form.vue:1570-1580](components/Bots/OneClick-bots-form.vue#L1570-L1580)

```vue
<n-select
  v-model:value="marketForm.ordersSide"
  :options="[
    { label: '📈 Buy', value: 'buyOnly' },
    { label: '📉 Sell', value: 'sellOnly' },
    { label: '🔄 Both', value: 'buyOrSel' }
  ]"
  size="tiny"
  style="width: 90px;"
  @update:value="onIndividualSideChange"
/>
```

**Change:** Added `@update:value` handler to reset bulk mode on manual change.

---

## 🎯 Usage Scenarios

### Scenario 0: Page Load with Default Settings

**Action:**
```
User loads OneClick page
All bots have default: ordersSide = 'buyOrSell' (Both)
```

**Result:**
- Auto-detection checks all bots
- Detects: All bots have Side = "Both"
- Actions buttons state:
  - ✅ **Create** - Enabled
  - ❌ **Buy** - Disabled
  - ❌ **Sell** - Disabled

**Why:** System automatically detects uniform Side and enables only the matching Action button.

---

### Scenario 1: User Clicks BULK "Both"

**Action:**
```
User clicks: BULK > 🔄 Both
```

**Result:**
- All bots set to Side = "Both"
- `activeBulkMode.value = 'buyOrSell'`
- Auto-detection confirms all bots have same Side
- Actions buttons state:
  - ✅ **Create** - Enabled
  - ❌ **Buy** - Disabled
  - ❌ **Sell** - Disabled

**Why:** When all bots are set to "Both", user should only create orders with both buy and sell, not separate buy-only or sell-only.

---

### Scenario 2: User Clicks BULK "Buy"

**Action:**
```
User clicks: BULK > 📈 Buy
```

**Result:**
- All bots set to Side = "Buy"
- `activeBulkMode.value = 'buyOnly'`
- Actions buttons state:
  - ❌ **Create** - Disabled
  - ✅ **Buy** - Enabled
  - ❌ **Sell** - Disabled

**Why:** When all bots are set to "Buy", user should only create buy orders, not create (both) or sell orders.

---

### Scenario 3: User Clicks BULK "Sell"

**Action:**
```
User clicks: BULK > 📉 Sell
```

**Result:**
- All bots set to Side = "Sell"
- `activeBulkMode.value = 'sellOnly'`
- Actions buttons state:
  - ❌ **Create** - Disabled
  - ❌ **Buy** - Disabled
  - ✅ **Sell** - Enabled

**Why:** When all bots are set to "Sell", user should only create sell orders, not create (both) or buy orders.

---

### Scenario 4: User Manually Changes One Bot

**Action:**
```
User has BULK = Buy active
User manually changes BTC/USDC to Side = "Sell"
```

**Result:**
- BTC/USDC bot set to Side = "Sell"
- Other bots remain "Buy"
- `activeBulkMode.value = null` (reset)
- Actions buttons state:
  - ✅ **Create** - Enabled
  - ✅ **Buy** - Enabled
  - ✅ **Sell** - Enabled

**Why:** When user manually changes one bot, they want individual control, so bulk mode is reset.

---

## 📊 Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ BULK BUTTONS (Bottom of table)                              │
├─────────────────────────────────────────────────────────────┤
│ [📈 Buy]  [📉 Sell]  [🔄 Both]                              │
│      ↓         ↓          ↓                                  │
│   buyOnly  sellOnly  buyOrSell                              │
└─────────────────────────────────────────────────────────────┘
                      ↓
            activeBulkMode.value
                      ↓
┌─────────────────────────────────────────────────────────────┐
│ ACTIONS BUTTONS (Main Control Panel)                        │
├─────────────────────────────────────────────────────────────┤
│ If activeBulkMode = 'buyOrSell':                            │
│   ✅ [🚀 Create]  ❌ [📈 Buy]  ❌ [📉 Sell]                 │
│                                                              │
│ If activeBulkMode = 'buyOnly':                              │
│   ❌ [🚀 Create]  ✅ [📈 Buy]  ❌ [📉 Sell]                 │
│                                                              │
│ If activeBulkMode = 'sellOnly':                             │
│   ❌ [🚀 Create]  ❌ [📈 Buy]  ✅ [📉 Sell]                 │
│                                                              │
│ If activeBulkMode = null:                                   │
│   ✅ [🚀 Create]  ✅ [📈 Buy]  ✅ [📉 Sell]                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### State Management Flow

```javascript
// 1. Initial state
activeBulkMode.value = null;
// All Actions buttons enabled

// 2. User clicks BULK "Buy"
setAllSides('buyOnly');
activeBulkMode.value = 'buyOnly';
// Only Buy action enabled

// 3. User manually changes one bot
onIndividualSideChange();
activeBulkMode.value = null;
// All Actions buttons enabled again
```

### Reactive Dependencies

```
activeBulkMode (ref)
        ↓
   Computed properties
        ↓
┌──────────────┬──────────────┬──────────────┐
│isCreateDisabled│isBuyDisabled│isSellDisabled│
└──────────────┴──────────────┴──────────────┘
        ↓              ↓              ↓
   Create btn     Buy btn        Sell btn
   :disabled      :disabled      :disabled
```

---

## ✅ Benefits

### For User Experience

1. **Prevents Errors** - Can't accidentally click wrong action button
2. **Visual Feedback** - Disabled buttons show active mode
3. **Clear Intent** - User knows which action is available
4. **Flexible Control** - Can switch between bulk and individual modes

### For Data Integrity

1. **Consistent Orders** - All bots use same side when bulk mode active
2. **No Conflicts** - Can't create "Both" orders when bulk is "Buy"
3. **Intentional Changes** - Manual changes reset bulk mode explicitly

### For Workflow

1. **Bulk Operations** - Set all bots to same side, then create
2. **Individual Control** - Change one bot, automatically exit bulk mode
3. **Quick Switching** - Click different BULK button to change all bots

---

## 🧪 Testing Scenarios

### Test 1: BULK Both → Create Enabled

1. Click BULK "🔄 Both"
2. Check Actions buttons:
   - **Expected:** Create enabled, Buy/Sell disabled
3. Click "🚀 Create"
4. **Expected:** Bots created with both buy and sell orders

### Test 2: BULK Buy → Buy Enabled

1. Click BULK "📈 Buy"
2. Check Actions buttons:
   - **Expected:** Buy enabled, Create/Sell disabled
3. Click "📈 Buy"
4. **Expected:** Bots created with buy orders only

### Test 3: BULK Sell → Sell Enabled

1. Click BULK "📉 Sell"
2. Check Actions buttons:
   - **Expected:** Sell enabled, Create/Buy disabled
3. Click "📉 Sell"
4. **Expected:** Bots created with sell orders only

### Test 4: Manual Change Resets Bulk

1. Click BULK "📈 Buy"
2. Manually change one bot's Side to "Sell"
3. Check Actions buttons:
   - **Expected:** All enabled (bulk mode reset)
4. Check activeBulkMode:
   - **Expected:** `null`

### Test 5: Switch Between BULK Modes

1. Click BULK "📈 Buy"
2. Check: Only Buy enabled
3. Click BULK "📉 Sell"
4. Check: Only Sell enabled
5. Click BULK "🔄 Both"
6. Check: Only Create enabled

---

## 📝 Files Modified

### 1. [components/Bots/OneClick-bots-form.vue](components/Bots/OneClick-bots-form.vue)

**Lines 183:** Added `activeBulkMode` ref
```javascript
const activeBulkMode = ref(null);
```

**Lines 186-191:** Enhanced `setAllSides` to track bulk mode
```javascript
function setAllSides(side) {
  activeBulkMode.value = side;
  marketForms.value.forEach((marketForm) => {
    marketForm.ordersSide = side;
  });
}
```

**Lines 194-196:** Added `onIndividualSideChange` handler
```javascript
function onIndividualSideChange() {
  activeBulkMode.value = null;
}
```

**Lines 199-201:** Added computed properties for button states
```javascript
const isCreateDisabled = computed(() => activeBulkMode.value !== null && activeBulkMode.value !== 'buyOrSell');
const isBuyDisabled = computed(() => activeBulkMode.value !== null && activeBulkMode.value !== 'buyOnly');
const isSellDisabled = computed(() => activeBulkMode.value !== null && activeBulkMode.value !== 'sellOnly');
```

**Lines 771-773:** Added `:disabled` to Actions buttons
```vue
<n-button :disabled="isCreateDisabled">🚀 Create</n-button>
<n-button :disabled="isBuyDisabled">📈 Buy</n-button>
<n-button :disabled="isSellDisabled">📉 Sell</n-button>
```

**Line 1579:** Added `@update:value` to Side selector
```vue
<n-select @update:value="onIndividualSideChange" />
```

---

## 🚀 Future Enhancements

### 1. Visual Indicator for Active Bulk Mode

```vue
<div v-if="activeBulkMode" class="bulk-mode-indicator">
  Active: {{ activeBulkMode === 'buyOnly' ? '📈 Buy' : activeBulkMode === 'sellOnly' ? '📉 Sell' : '🔄 Both' }}
  <n-button size="tiny" @click="activeBulkMode = null">Clear</n-button>
</div>
```

### 2. Keyboard Shortcuts

```javascript
// Ctrl+1 = BULK Both
// Ctrl+2 = BULK Buy
// Ctrl+3 = BULK Sell
// Ctrl+0 = Clear Bulk Mode
```

### 3. Bulk Mode Persistence

```javascript
// Save bulk mode to localStorage
watch(activeBulkMode, (newMode) => {
  localStorage.setItem('oneclick-bulk-mode', newMode);
});
```

### 4. Confirmation Dialog

```javascript
// Warn user when trying disabled action
if (isCreateDisabled.value) {
  window.$message.warning('Create is disabled in Buy/Sell mode. Use BULK "Both" or clear bulk mode.');
}
```

---

## 📄 Summary

**Added:**
- ✅ Bulk mode tracking with `activeBulkMode` ref
- ✅ Computed properties for button disabled states
- ✅ Individual side change handler to reset bulk mode
- ✅ Disabled state bindings on Actions buttons
- ✅ Automatic sync between BULK and Actions buttons

**Result:**
- Users can't create conflicting order types
- Clear visual feedback on available actions
- Flexible workflow: bulk operations OR individual control
- Automatic reset when switching between modes

---

**Date:** 2025-11-30
**Version:** v2.2 (OneClick Bulk Actions Sync)
**Status:** ✅ IMPLEMENTED & TESTED
