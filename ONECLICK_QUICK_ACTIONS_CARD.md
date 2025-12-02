# OneClick Quick Actions Card Feature

## 🎯 Overview

Separated the **Ticker Bar with Actions** into its own collapsible card positioned after the Investment Preview section.

**Feature:** Quick Actions now have their own dedicated, expandable/collapsible card for better organization and space management.

---

## ✨ New Functionality

### 1. Quick Actions Card Structure

**Location:** [components/Bots/OneClick-bots-form.vue:1123-1178](components/Bots/OneClick-bots-form.vue#L1123-L1178)

**Features:**
- ✅ Positioned after Investment Preview (line 1123)
- ✅ Collapsible with smooth slide-fade transition
- ✅ Clickable header with arrow indicator (▼/▶)
- ✅ Hover effects (golden border and glow)
- ✅ Descriptive subtitle: "Bulk operations and quick settings"
- ✅ Shows only when bots are configured (`v-if="marketForms.length > 0"`)

### 2. Card Header

```vue
<div class="actions-header" @click="showQuickActions = !showQuickActions"
     style="cursor: pointer; background: #0f1419; border: 1px solid #2a3441;
            border-radius: 3px; padding: 8px 12px; margin-bottom: 8px;
            transition: border-color 0.2s;">
  <div style="display: flex; align-items: center; justify-content: space-between;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 13px; color: #ffd93d; font-weight: 600;">⚡ Quick Actions</span>
      <span style="font-size: 12px; color: #666;">{{ showQuickActions ? '▼' : '▶' }}</span>
    </div>
    <span style="font-size: 11px; color: #888;">Bulk operations and quick settings</span>
  </div>
</div>
```

**Header Elements:**
- **⚡ Quick Actions** - Title with lightning emoji (yellow #ffd93d)
- **Arrow Indicator** - ▼ when expanded, ▶ when collapsed
- **Subtitle** - Right-aligned description text

### 3. Collapsible Content

```vue
<transition name="slide-fade">
<div v-show="showQuickActions">
  <div class="ticker-content">
    <div class="ticker-actions">
      <!-- All action buttons -->
    </div>
  </div>
</div>
</transition>
```

**Content Includes:**
1. **Create Buttons** - 🚀 Create, 📈 Buy, 📉 Sell
2. **Lower Price Adjustments** - -1%, -2%, -10%, -20%, -50%, -97%, -98%
3. **Upper Price Adjustments (Leverage)** - 1x, 2x, 10x, 20x, 50x, 100x, 200x
4. **Amount Presets** - A:1, A:5, A:10, A:50, A:100
5. **Grid Presets** - G:5, G:10, G:20, G:50, G:100

---

## 🔧 Implementation Details

### State Management

**Location:** [components/Bots/OneClick-bots-form.vue:193](components/Bots/OneClick-bots-form.vue#L193)

```javascript
// Quick Actions collapse state
const showQuickActions = ref(true);
```

**Default:** `true` (expanded by default)

### CSS Enhancements

**Location:** [components/Bots/OneClick-bots-form.vue:1614-1622](components/Bots/OneClick-bots-form.vue#L1614-L1622)

```css
/* Quick Actions Card */
.quick-actions-card {
  margin-bottom: 12px;
}

.actions-header:hover {
  border-color: #ffd93d !important;
  box-shadow: 0 2px 8px rgba(255, 217, 61, 0.2);
}
```

**Hover Effects:**
- Border changes to golden yellow (#ffd93d)
- Subtle glow shadow appears (rgba(255, 217, 61, 0.2))
- Smooth transition (0.2s)

---

## 📊 Layout Position

### Before (Old Structure)

```
┌─────────────────────────────────┐
│ 🤖 OneClick Grid Bot Header     │
├─────────────────────────────────┤
│ 📊 Ticker Bar with Actions      │ ← Was here, always visible
├─────────────────────────────────┤
│ 💰 Investment Preview           │
├─────────────────────────────────┤
│ ⚙️ Sidebar Config               │
└─────────────────────────────────┘
```

### After (New Structure)

```
┌─────────────────────────────────┐
│ 🤖 OneClick Grid Bot Header     │
├─────────────────────────────────┤
│ 💰 Investment Preview           │ ← Collapsible
│   ┌─ Per-Bot Breakdown          │
│   └─ Total Strategy             │
├─────────────────────────────────┤
│ ⚡ Quick Actions                │ ← NEW! Collapsible
│   ┌─ Create/Buy/Sell            │
│   ├─ Price Adjustments          │
│   ├─ Amount Presets             │
│   └─ Grid Presets               │
├─────────────────────────────────┤
│ ⚙️ Sidebar Config               │
└─────────────────────────────────┘
```

---

## 🎨 UI/UX Features

### Visual Feedback

1. **Hover State**
   - Border color changes: #2a3441 → #ffd93d (golden)
   - Glow shadow appears
   - Cursor becomes pointer

2. **Arrow Indicator**
   - ▼ when expanded (content visible)
   - ▶ when collapsed (content hidden)

3. **Color Scheme**
   - Title: Golden yellow (#ffd93d)
   - Subtitle: Gray (#888)
   - Border: Dark gray (#2a3441) → Golden on hover

### Smooth Transitions

**Animation:** `slide-fade` transition
- **Duration:** 0.3s ease-out (enter), 0.2s cubic-bezier (leave)
- **Effect:** Slides down 10px + opacity fade
- **Feel:** Smooth, natural expansion/collapse

---

## 📝 Files Modified

### 1. [components/Bots/OneClick-bots-form.vue](components/Bots/OneClick-bots-form.vue)

**Line 193:** Added `showQuickActions` ref
```javascript
const showQuickActions = ref(true);
```

**Lines 1123-1178:** Created Quick Actions Card after Investment Preview
- Collapsible header with click handler
- Transition wrapper with slide-fade animation
- All action buttons moved from old Ticker Bar

**Lines 727-769:** Removed old Ticker Bar with Actions
- Old section deleted completely
- Sidebar Config now directly follows Strategy Sidebar

**Lines 1614-1622:** Added CSS for Quick Actions Card
- `.quick-actions-card` base styles
- `.actions-header:hover` hover effects

---

## ✅ Benefits

### For Users

1. **Better Organization**
   - Quick Actions have dedicated space
   - Easier to find and access
   - Clearer visual hierarchy

2. **Space Management**
   - Can collapse when not needed
   - More screen space for bot configurations
   - Reduces visual clutter

3. **Visual Consistency**
   - Matches Investment Preview design pattern
   - Consistent collapsible behavior
   - Unified color scheme

### For Workflow

1. **Improved Layout Flow**
   - Investment Preview → Quick Actions → Config
   - Logical top-to-bottom progression
   - Related features grouped together

2. **Flexible Interface**
   - Both Investment Preview and Quick Actions collapsible
   - Users control what's visible
   - Adaptable to different workflows

---

## 🧪 Testing Scenarios

### Test 1: Card Collapse/Expand
1. Load OneClick page with markets selected
2. Click "⚡ Quick Actions" header
3. **Expected:** Content collapses with slide-fade animation, arrow changes to ▶
4. Click header again
5. **Expected:** Content expands, arrow changes to ▼

### Test 2: Hover Effects
1. Hover over Quick Actions header
2. **Expected:** Border turns golden (#ffd93d), glow shadow appears
3. Move cursor away
4. **Expected:** Border returns to dark gray, shadow disappears

### Test 3: Button Functionality
1. Expand Quick Actions
2. Click various buttons (Create, Buy, Sell, presets)
3. **Expected:** All buttons work as before (no functionality broken)

### Test 4: No Bots Selected
1. Clear all selected markets
2. **Expected:** Quick Actions card disappears (`v-if="marketForms.length > 0"`)

---

## 🚀 Future Enhancements

### 1. Quick Actions Presets
```vue
<n-button @click="loadQuickActionPreset('conservative')">
  📊 Conservative Setup
</n-button>
```

Quick-load entire configurations (lower price -10%, upper +10%, 50 grids, etc.)

### 2. Keyboard Shortcuts
```javascript
// Ctrl+Q - Toggle Quick Actions
// Ctrl+C - Click Create button
// Ctrl+B - Click Buy button
```

### 3. Action History
```vue
<div class="recent-actions">
  Last action: Set amount to 100 (2 seconds ago)
</div>
```

Show recent quick action usage for reference.

### 4. Customizable Button Layout
```vue
<n-button @click="customizeQuickActions">
  ⚙️ Customize Buttons
</n-button>
```

Allow users to show/hide or reorder buttons.

---

## 📄 Summary

**Changed:**
- ✅ Removed old Ticker Bar from original position (after header)
- ✅ Created new Quick Actions Card after Investment Preview
- ✅ Added collapsible functionality with smooth transitions
- ✅ Implemented hover effects (golden border + glow)
- ✅ Positioned logically: Header → Preview → Actions → Config

**Result:**
- Users now have a dedicated, collapsible Quick Actions section
- Better space management with ability to hide when not needed
- Improved visual hierarchy and organization
- Consistent design pattern with Investment Preview
- All original functionality preserved

---

**Date:** 2025-11-30
**Version:** v2.2 (OneClick Quick Actions Card)
**Status:** ✅ IMPLEMENTED & TESTED
