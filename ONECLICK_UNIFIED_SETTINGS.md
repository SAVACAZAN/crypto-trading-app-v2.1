# OneClick Unified Settings Card Feature

## 🎯 Overview

Unified **Config**, **Saved Configurations**, and **Strategies** into a single collapsible card for better organization and space management.

**Feature:** All settings and strategies are now in one long, organized list within a single expandable card.

---

## ✨ New Functionality

### 1. Unified Settings Card Structure

**Location:** [components/Bots/OneClick-bots-form.vue:727-895](components/Bots/OneClick-bots-form.vue#L727-L895)

**Before (Old Structure):**
```
┌─────────────────────┐
│ ⚙️ Config           │ ← Separate card
├─────────────────────┤
│ 💾 Saved            │ ← Separate card
├─────────────────────┤
│ 🎯 Strategies       │ ← Separate card
└─────────────────────┘
```

**After (New Structure):**
```
┌─────────────────────────────────────┐
│ ⚙️ Settings & Strategies         ▼ │ ← Unified card header (collapsible)
├─────────────────────────────────────┤
│ ⚙️ Config                        ▼ │ ← Collapsible section
│   Inc % Buy, Inc % Sell, etc.      │
│   💾 Save Config button             │
├─────────────────────────────────────┤
│ 💾 Saved Configurations             │ ← Section
│   • Config 1         [Apply]        │
│   • Config 2         [Apply]        │
├─────────────────────────────────────┤
│ 🎯 Strategies                       │ ← Section
│   ➕ New Strategy                   │
│   • Strategy 1  [▶] [🗑]            │
│   • Strategy 2  [▶] [🗑]            │
└─────────────────────────────────────┘
```

---

## 🔧 Implementation Details

### Card Header

**Location:** [components/Bots/OneClick-bots-form.vue:729-738](components/Bots/OneClick-bots-form.vue#L729-L738)

```vue
<div class="settings-header" @click="showUnifiedSettings = !showUnifiedSettings"
     style="cursor: pointer; background: #0f1419; border: 1px solid #2a3441;
            border-radius: 3px; padding: 8px 12px; margin-bottom: 8px;
            transition: border-color 0.2s;">
  <div style="display: flex; align-items: center; justify-content: space-between;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 13px; color: #a78bfa; font-weight: 600;">⚙️ Settings & Strategies</span>
      <span style="font-size: 12px; color: #666;">{{ showUnifiedSettings ? '▼' : '▶' }}</span>
    </div>
    <span style="font-size: 11px; color: #888;">Config • Saved • Strategies</span>
  </div>
</div>
```

**Features:**
- ✅ Purple title (#a78bfa): "⚙️ Settings & Strategies"
- ✅ Arrow indicator (▼/▶)
- ✅ Subtitle: "Config • Saved • Strategies"
- ✅ Hover effect: Purple border + glow

### Section 1: Config

**Location:** [components/Bots/OneClick-bots-form.vue:743-773](components/Bots/OneClick-bots-form.vue#L743-L773)

```vue
<div class="unified-section">
  <div class="unified-section-title collapsible" @click="showConfigDetails = !showConfigDetails">
    <span style="color: #6366f1; font-weight: 600;">⚙️ Config</span>
    <span style="font-size: 11px; color: #666;">{{ showConfigDetails ? '▼' : '▶' }}</span>
  </div>
  <transition name="slide-fade">
  <div v-show="showConfigDetails">
    <div class="config-grid" style="margin-top: 8px;">
      <!-- Inc % Buy/Sell, Dev Price, Dev Amt inputs -->
    </div>
    <n-button type="primary" size="tiny" block @click="saveConfiguration">
      💾 Save Config
    </n-button>
  </div>
  </transition>
</div>
```

**Features:**
- ✅ Blue title (#6366f1)
- ✅ Collapsible (nested inside main card)
- ✅ All config inputs (Inc %, Dev Price, Dev Amt)
- ✅ Save button

### Divider

**Location:** Lines 775-776, 794-795

```vue
<div style="border-top: 1px solid #2a3441; margin: 12px 0;"></div>
```

Separates sections visually.

### Section 2: Saved Configurations

**Location:** [components/Bots/OneClick-bots-form.vue:778-792](components/Bots/OneClick-bots-form.vue#L778-L792)

```vue
<div class="unified-section">
  <div class="unified-section-title">
    <span style="color: #10eb04; font-weight: 600;">💾 Saved Configurations</span>
  </div>
  <div class="saved-list" style="margin-top: 8px;">
    <div v-if="savedConfigurations.length === 0">No saved configurations</div>
    <div v-for="(config, index) in savedConfigurations" :key="index" class="saved-item">
      <span class="saved-name">{{ config.name }}</span>
      <n-button size="tiny" @click="applyConfiguration(config)">Apply</n-button>
    </div>
  </div>
</div>
```

**Features:**
- ✅ Green title (#10eb04)
- ✅ Always expanded
- ✅ Shows empty state if no configs
- ✅ List of saved configs with Apply buttons

### Section 3: Strategies

**Location:** [components/Bots/OneClick-bots-form.vue:797-891](components/Bots/OneClick-bots-form.vue#L797-L891)

```vue
<div class="unified-section">
  <div class="unified-section-title">
    <span style="color: #ffd93d; font-weight: 600;">🎯 Strategies</span>
  </div>

  <!-- Strategy Form (if creating new) -->
  <div v-if="showStrategyForm">
    <!-- Name, Description, Save/Cancel buttons -->
  </div>

  <!-- Strategy List -->
  <div v-if="!showStrategyForm">
    <n-button type="success" @click="showStrategyForm = true">
      ➕ New Strategy
    </n-button>
    <!-- List of strategies with Apply/Delete buttons -->
  </div>
</div>
```

**Features:**
- ✅ Yellow title (#ffd93d)
- ✅ Always expanded
- ✅ ➕ New Strategy button
- ✅ Strategy form (when creating)
- ✅ List of strategies with metadata
- ✅ Apply (▶) and Delete (🗑) buttons

---

## 📊 State Management

**Location:** [components/Bots/OneClick-bots-form.vue:195-196](components/Bots/OneClick-bots-form.vue#L195-L196)

```javascript
// Unified Settings collapse state
const showUnifiedSettings = ref(true);
```

**Default:** `true` (expanded by default)

**Existing States:**
- `showConfigDetails` - Controls Config section collapse
- `showStrategyForm` - Controls strategy form visibility

---

## 🎨 CSS Styling

**Location:** [components/Bots/OneClick-bots-form.vue:1664-1689](components/Bots/OneClick-bots-form.vue#L1664-L1689)

```css
/* Unified Settings Card */
.unified-settings-card {
  margin-bottom: 12px;
}

.settings-header:hover {
  border-color: #a78bfa !important;  /* Purple */
  box-shadow: 0 2px 8px rgba(167, 139, 250, 0.2);  /* Purple glow */
}

.unified-section {
  margin-bottom: 8px;
}

.unified-section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  cursor: pointer;
  font-size: 12px;
}

.unified-section-title.collapsible:hover {
  opacity: 0.8;  /* Hover feedback */
}
```

**Effects:**
- Main header: Purple border + glow on hover
- Section titles: Reduced opacity on hover (collapsible sections only)
- Smooth transitions

---

## 🎯 Visual Hierarchy

### Color Coding

1. **Main Card Header** - Purple (#a78bfa)
   - ⚙️ Settings & Strategies

2. **Config Section** - Blue (#6366f1)
   - ⚙️ Config

3. **Saved Section** - Green (#10eb04)
   - 💾 Saved Configurations

4. **Strategies Section** - Yellow (#ffd93d)
   - 🎯 Strategies

### Layout Flow

```
┌─────────────────────────────────────┐
│ 🤖 OneClick Grid Bot Header         │
├─────────────────────────────────────┤
│ ⚙️ Settings & Strategies (PURPLE) ▼ │ ← NEW UNIFIED CARD
│ ┌─────────────────────────────────┐ │
│ │ ⚙️ Config (BLUE) ▼              │ │
│ │   [Config inputs...]            │ │
│ │   💾 Save Config                │ │
│ ├─────────────────────────────────┤ │
│ │ 💾 Saved Configurations (GREEN) │ │
│ │   • Config 1      [Apply]       │ │
│ ├─────────────────────────────────┤ │
│ │ 🎯 Strategies (YELLOW)          │ │
│ │   ➕ New Strategy               │ │
│ │   • Strategy 1   [▶] [🗑]       │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 💰 Investment Preview            ▼ │
├─────────────────────────────────────┤
│ ⚡ Quick Actions                  ▼ │
└─────────────────────────────────────┘
```

---

## ✅ Benefits

### For Organization

1. **Single Location** - All settings in one place
2. **Reduced Clutter** - One card instead of three separate ones
3. **Clear Hierarchy** - Visual separation with dividers
4. **Color-Coded Sections** - Easy to identify different areas

### For Space Management

1. **Collapsible Main Card** - Hide entire settings when not needed
2. **Nested Collapse** - Config section can be collapsed independently
3. **Long List Format** - All items visible in one scroll
4. **Consistent Design** - Matches Investment Preview and Quick Actions

### For User Experience

1. **Better Flow** - Settings → Preview → Actions logical progression
2. **Quick Access** - All settings visible in one expanded card
3. **Visual Feedback** - Purple glow on hover
4. **Intuitive Navigation** - Clear section titles and separators

---

## 🧪 Testing Scenarios

### Test 1: Card Collapse/Expand
1. Load OneClick page with markets selected
2. Click "⚙️ Settings & Strategies" header
3. **Expected:** All content collapses, arrow changes to ▶
4. Click header again
5. **Expected:** Content expands, arrow changes to ▼

### Test 2: Config Section Collapse
1. Expand main card
2. Click "⚙️ Config" section title
3. **Expected:** Config inputs collapse
4. Click again
5. **Expected:** Config inputs expand

### Test 3: Hover Effects
1. Hover over main header
2. **Expected:** Purple border (#a78bfa) + glow
3. Hover over "⚙️ Config" section
4. **Expected:** Opacity reduces to 0.8

### Test 4: Saved Configurations
1. Save a configuration
2. **Expected:** Appears in "💾 Saved Configurations" section
3. Click Apply button
4. **Expected:** Configuration loads

### Test 5: Strategies
1. Click "➕ New Strategy"
2. **Expected:** Form appears
3. Enter name and description, click Save
4. **Expected:** Strategy appears in list
5. Click ▶ (Apply)
6. **Expected:** Strategy loads
7. Click 🗑 (Delete)
8. **Expected:** Strategy removed

---

## 📝 Files Modified

### 1. [components/Bots/OneClick-bots-form.vue](components/Bots/OneClick-bots-form.vue)

**Line 195-196:** Added `showUnifiedSettings` ref
```javascript
const showUnifiedSettings = ref(true);
```

**Lines 727-895:** Created Unified Settings Card
- Replaced separate cards with single unified card
- Added collapsible main header
- Organized 3 sections with dividers:
  1. Config (collapsible)
  2. Saved Configurations (always visible)
  3. Strategies (always visible)

**Lines 1664-1689:** Added CSS
- `.unified-settings-card` - Base card styling
- `.settings-header:hover` - Purple hover effect
- `.unified-section` - Section spacing
- `.unified-section-title` - Section title styling
- `.unified-section-title.collapsible:hover` - Hover feedback

---

## 🚀 Future Enhancements

### 1. Search/Filter
```vue
<n-input
  v-model:value="settingsSearchQuery"
  size="tiny"
  placeholder="Search settings..."
  style="margin-bottom: 8px;"
/>
```

Filter strategies or configs by name.

### 2. Import/Export
```vue
<n-button @click="exportAllSettings">
  📤 Export All
</n-button>
<n-button @click="importSettings">
  📥 Import
</n-button>
```

Backup and restore all settings.

### 3. Quick Apply
```vue
<n-button @click="applyLastUsedStrategy">
  🔄 Quick Apply Last Used
</n-button>
```

One-click apply most recent strategy.

### 4. Section Badges
```vue
<div class="unified-section-title">
  <span>🎯 Strategies</span>
  <n-badge :value="strategies.length" type="warning" />
</div>
```

Show count badges for each section.

---

## 📄 Summary

**Changed:**
- ✅ Merged 3 separate cards into 1 unified card
- ✅ Added collapsible main header
- ✅ Organized sections with visual dividers
- ✅ Color-coded section titles (Blue, Green, Yellow)
- ✅ Purple hover effect on main header
- ✅ Nested collapse for Config section
- ✅ Preserved all original functionality

**Result:**
- Users have a single, organized settings card
- Better space management with collapsible main card
- Clear visual hierarchy with color coding
- All settings accessible in one long list
- Consistent design with Investment Preview and Quick Actions

---

**Date:** 2025-11-30
**Version:** v2.2 (OneClick Unified Settings)
**Status:** ✅ IMPLEMENTED & TESTED
