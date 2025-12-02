# 🌳 Referral System - Complete Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Tier System Explained](#tier-system-explained)
3. [Database Schema](#database-schema)
4. [Referral Chain Logic](#referral-chain-logic)
5. [Points Calculation](#points-calculation)
6. [API Endpoints](#api-endpoints)
7. [Frontend Components](#frontend-components)
8. [Current Issues](#current-issues)
9. [Proposed Fixes](#proposed-fixes)

---

## 🎯 System Overview

### What We Want to Achieve

**Example Chain:**
```
User1 (kiss) - Top User
 └─ User2 (Miruna) - Level 1 from User1's perspective
     └─ User3 (Ingrid) - Level 2 from User1's perspective
         └─ User4 (Europa) - Level 3 from User1's perspective
             └─ User5 - Level 4 from User1's perspective
                 └─ User6 - Level 5 from User1's perspective
```

### Key Concept: TWO-WAY TRACKING

The system tracks referrals in **TWO directions**:

1. **DOWN the chain** (referralChain): Who you referred (your children/network)
2. **UP the chain** (tierCredits): Who earns from your activity (your parents/sponsors)

---

## 🧩 Tier System Explained

### Complete Tier Structure Example

```
Structură completă până la Tier 5:
User1 (kiss)
 └── User2 (Miruna)
      └── User3 (Ingrid)
            └── User4 (Europa)
                  └── User5
                        └── User6
```

### Tier Assignments for Each User

#### ✔️ User2 (Miruna)
```
Referral Chain (DOWN): User3, User4, User5, User6
Tier Credits (UP):
  • Tier 1: User1 (25%) - User1 earns 25% from User2's activity
```

#### ✔️ User3 (Ingrid)
```
Referral Chain (DOWN): User4, User5, User6
Tier Credits (UP):
  • Tier 1: User2 (25%) - User2 earns 25% from User3's activity
  • Tier 2: User1 (15%) - User1 earns 15% from User3's activity
```

#### ✔️ User4 (Europa)
```
Referral Chain (DOWN): User5, User6
Tier Credits (UP):
  • Tier 1: User3 (25%) - User3 earns 25% from User4's activity
  • Tier 2: User2 (15%) - User2 earns 15% from User4's activity
  • Tier 3: User1 (10%) - User1 earns 10% from User4's activity
```

#### ✔️ User5
```
Referral Chain (DOWN): User6
Tier Credits (UP):
  • Tier 1: User4 (25%) - User4 earns 25% from User5's activity
  • Tier 2: User3 (15%) - User3 earns 15% from User5's activity
  • Tier 3: User2 (10%) - User2 earns 10% from User5's activity
  • Tier 4: User1 (5%)  - User1 earns 5% from User5's activity
```

#### ✔️ User6 (Final Level)
```
Referral Chain (DOWN): (none yet)
Tier Credits (UP):
  • Tier 1: User5 (25%) - User5 earns 25% from User6's activity
  • Tier 2: User4 (15%) - User4 earns 15% from User6's activity
  • Tier 3: User3 (10%) - User3 earns 10% from User6's activity
  • Tier 4: User2 (5%)  - User2 earns 5% from User6's activity
  • Tier 5: User1 (2%)  - User1 earns 2% from User6's activity ✅
```

### 🎯 Final Result

**User1 (kiss) primește tier credit până la nivelul 5:**
- User1 este **Tier 5** pentru User6
- Lanțul: 1 → 2 → 3 → 4 → 5 → 6
- Când User6 câștigă puncte, User1 primește 2% ✅

### Points Distribution Example

**When User6 earns 1000 activity points:**
```
User6 Activity: 1000 points

Distribution:
├─ User5 (Tier 1): 1000 × 25% = 250 points
├─ User4 (Tier 2): 1000 × 15% = 150 points
├─ User3 (Tier 3): 1000 × 10% = 100 points
├─ User2 (Tier 4): 1000 × 5%  = 50 points
└─ User1 (Tier 5): 1000 × 2%  = 20 points ✅

Total Distributed: 570 points (57%)
User6 Keeps: 430 points (43%)
```

---

## 🏆 Referral Tier Levels (Badges/Ranks)

### Overview

Users earn **Tier Levels** (badges) based on their performance and network size. These are **separate** from the tier position in the chain.

### Tier Level System

| Tier | Requirements | Commission | Monthly Bonus | Badge |
|------|-------------|-----------|---------------|-------|
| **Bronze** | 0-5 referrals | 5% | 10 USDT | 🥉 Bronze.svg |
| **Silver** | 6-20 referrals | 10% | 50 USDT | 🥈 Silver.svg |
| **Gold** | 21-50 referrals | 15% | 100 USDT | 🥇 Gold.svg |
| **Platinum** | 51-100 referrals | 20% | 250 USDT | 💎 Platinum.svg |
| **Diamond** | 100+ referrals | 25% | 500 USDT | 💎 Diamond.svg |

### Benefits by Tier Level

#### 🥉 Bronze (Default)
```
Requirements: 0-5 total referrals
Benefits:
  • 5% commission from referral trades
  • Access to basic referral dashboard
  • Monthly bonus: 10 USDT
```

#### 🥈 Silver
```
Requirements: 6-20 total referrals
Benefits:
  • 10% commission from referral trades
  • Priority support
  • Monthly bonus: 50 USDT
  • Access to advanced analytics
```

#### 🥇 Gold
```
Requirements: 21-50 total referrals
Benefits:
  • 15% commission from referral trades
  • VIP support
  • Monthly bonus: 100 USDT
  • Advanced analytics + custom reports
  • Early access to new features
```

#### 💎 Platinum
```
Requirements: 51-100 total referrals
Benefits:
  • 20% commission from referral trades
  • Dedicated account manager
  • Monthly bonus: 250 USDT
  • All Gold benefits
  • Featured in leaderboard
```

#### 💎 Diamond (Elite)
```
Requirements: 100+ total referrals
Benefits:
  • 25% commission from referral trades
  • Premium account manager
  • Monthly bonus: 500 USDT
  • All Platinum benefits
  • Exclusive events access
  • Custom badge on profile
```

### Tier Level Upgrade Logic

**How users upgrade their tier level:**

```javascript
function calculateUserTierLevel(user) {
  // Count total referrals across all 5 levels
  const totalReferrals =
    user.referralPoints.referralChain.level1.length +
    user.referralPoints.referralChain.level2.length +
    user.referralPoints.referralChain.level3.length +
    user.referralPoints.referralChain.level4.length +
    user.referralPoints.referralChain.level5.length;

  // Determine tier based on total
  if (totalReferrals >= 100) {
    return {
      tier: 'Diamond',
      commission: 25,
      monthlyBonus: 500,
      badge: '/Refferalls-images/Diamond.svg'
    };
  } else if (totalReferrals >= 51) {
    return {
      tier: 'Platinum',
      commission: 20,
      monthlyBonus: 250,
      badge: '/Refferalls-images/Platinum.svg'
    };
  } else if (totalReferrals >= 21) {
    return {
      tier: 'Gold',
      commission: 15,
      monthlyBonus: 100,
      badge: '/Refferalls-images/Gold.svg'
    };
  } else if (totalReferrals >= 6) {
    return {
      tier: 'Silver',
      commission: 10,
      monthlyBonus: 50,
      badge: '/Refferalls-images/Silver.svg'
    };
  } else {
    return {
      tier: 'Bronze',
      commission: 5,
      monthlyBonus: 10,
      badge: '/Refferalls-images/Bronze.svg'
    };
  }
}
```

### Example: User1 (kiss) Tier Level Calculation

```
User1's Network:
  Level 1: 1 user (Miruna)
  Level 2: 1 user (Ingrid)
  Level 3: 1 user (Europa)
  Level 4: 1 user (User5)
  Level 5: 1 user (User6)

Total Referrals: 5
Current Tier Level: 🥉 Bronze

Earnings:
  • 5% commission from all referral trades
  • 10 USDT monthly bonus

To Upgrade to Silver:
  • Need: 6 total referrals (1 more!)
  • Will unlock: 10% commission, 50 USDT bonus
```

### Combining Both Systems

**User can have:**
1. **Tier Position** (1-5) in the referral chain = Determines % of points from each level
2. **Tier Level** (Bronze-Diamond) badge = Determines commission rate and bonuses

**Example:**
```
User1 (kiss):
  • Tier Level: Gold (21+ referrals) → 15% commission, 100 USDT/month
  • Tier Position for User6: Tier 5 → Gets 2% of User6's activity points

  When User6 makes a trade worth 1000 USDT:
    1. User1 gets 2% activity points (20 pts) - from Tier Position
    2. User1 earns 15% commission (150 USDT) - from Tier Level
    3. User1 gets 100 USDT monthly bonus - from Tier Level
```

**When viewing kiss's referral tree:**
- Level 1: Show Miruna (direct referral)
- Level 2: Show Ingrid (Miruna's referral)
- Level 3: Show Europa (Ingrid's referral)
- Level 4: Show User4 (Europa's referral)
- Level 5: Show User5 (User4's referral)

**Points Distribution:**
- kiss earns 25% of Miruna's activity points
- kiss earns 15% of Ingrid's activity points
- kiss earns 10% of Europa's activity points
- kiss earns 5% of User4's activity points
- kiss earns 2% of User5's activity points

---

## 🗄️ Database Schema

### User Schema Fields

```javascript
// Basic referral fields
{
  username: String,
  referralCode: String,        // User's unique referral code (e.g., "kiss123")
  referredBy: String,           // Referral code of who invited them
  codeEditedOnce: Boolean,      // Can edit their own code once
  referredByEdited: Boolean,    // Can edit who referred them once

  // Referral Points System
  referralPoints: {
    totalPoints: Number,        // Total accumulated points

    // Points breakdown by tier
    pointsByTier: {
      level1: Number,           // Points from level 1 (25%)
      level2: Number,           // Points from level 2 (15%)
      level3: Number,           // Points from level 3 (10%)
      level4: Number,           // Points from level 4 (5%)
      level5: Number            // Points from level 5 (2%)
    },

    // Referral chain - WHO this user has referred (down the chain)
    referralChain: {
      level1: Array,            // [{ userID, username, referralCode }]
      level2: Array,            // [{ userID, username, referralCode, referredBy }]
      level3: Array,            // [{ userID, username, referralCode, referredBy }]
      level4: Array,            // [{ userID, username, referralCode, referredBy }]
      level5: Array             // [{ userID, username, referralCode, referredBy }]
    },

    lastUpdated: Date
  },

  // Cached referral tree (for display purposes)
  referralTree: {
    tree: Array,                // Recursive tree structure with children
    pointsBreakdown: {
      level1: { users: Number, points: Number },
      level2: { users: Number, points: Number },
      level3: { users: Number, points: Number },
      level4: { users: Number, points: Number },
      level5: { users: Number, points: Number },
      grandTotal: Number
    },
    lastCalculated: Date
  },

  // Activity points (earned from trading, bots, etc.)
  activityPoints: Number,

  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔗 Referral Chain Logic

### How Referral Chain is Built

#### Registration Process
```
1. User registers with referralCode: "kiss123"
2. New user Europa registers with referredBy: "ingrid456"
3. System finds Ingrid's user record
4. Sets Europa.referredBy = "ingrid456"
5. Saves Europa to database
```

#### Chain Update Process (What Happens After Registration)
```javascript
// When Europa registers with Ingrid's code:

STEP 1: Update Ingrid (referredBy user)
- Build Ingrid's referral chain
- Find all users where referredBy = "ingrid456"
- Recursively find their referrals (5 levels deep)
- Save to Ingrid.referralPoints.referralChain

STEP 2: Update all users UP the chain (5 levels)
- Find Ingrid.referredBy (Miruna)
- Update Miruna's chain
- Find Miruna.referredBy (kiss)
- Update kiss's chain
- Continue up to 5 levels

RESULT:
kiss.referralPoints.referralChain = {
  level1: [Miruna],
  level2: [Ingrid],
  level3: [Europa],
  level4: [],
  level5: []
}
```

### Current Chain Building Algorithm

**File:** `server/api/v1/updateReferralChains.post.js`

```javascript
async function buildUserReferralChain(referralCode) {
  const chain = {
    level1: [], level2: [], level3: [], level4: [], level5: []
  };

  // Level 1: Direct referrals
  const level1Users = await userSchema.find({ referredBy: referralCode });
  chain.level1 = level1Users.map(u => ({
    userID: u._id.toString(),
    username: u.username || u.referralCode,
    referralCode: u.referralCode
  }));

  // Level 2: Referrals of level 1 users
  for (const l1User of level1Users) {
    const level2Users = await userSchema.find({ referredBy: l1User.referralCode });
    for (const l2User of level2Users) {
      chain.level2.push({
        userID: l2User._id.toString(),
        username: l2User.username || l2User.referralCode,
        referralCode: l2User.referralCode,
        referredBy: l1User.referralCode
      });

      // Level 3, 4, 5 continue recursively...
    }
  }

  return chain;
}
```

---

## 📊 Points Calculation

### Tier Percentages

| Level | Percentage | Description |
|-------|-----------|-------------|
| 1 | 25% | Direct referrals |
| 2 | 15% | Referrals of referrals |
| 3 | 10% | Third tier |
| 4 | 5% | Fourth tier |
| 5 | 2% | Fifth tier |

### Points Calculation Formula

```javascript
// For each user in the referral tree:
earnedPoints = userActivityPoints * tierPercentage

// Example:
// Miruna has 1000 activity points
// kiss earns: 1000 * 0.25 = 250 points (Level 1)

// Ingrid has 500 activity points
// kiss earns: 500 * 0.15 = 75 points (Level 2)

// Total points for kiss = 250 + 75 + ... (all levels)
```

### Current Calculation Code

**File:** `server/api/v1/calculateReferralTree.get.js`

```javascript
function calculatePointsBreakdown(tree) {
  const tierPercentages = {
    1: 0.25,  // 25%
    2: 0.15,  // 15%
    3: 0.10,  // 10%
    4: 0.05,  // 5%
    5: 0.02   // 2%
  };

  const breakdown = {
    level1: { users: 0, points: 0 },
    level2: { users: 0, points: 0 },
    level3: { users: 0, points: 0 },
    level4: { users: 0, points: 0 },
    level5: { users: 0, points: 0 },
    grandTotal: 0
  };

  function accumulatePoints(nodes, level) {
    if (!nodes || nodes.length === 0) return;

    for (const node of nodes) {
      const activityPoints = node.activityPoints || 0;
      const earnedPoints = activityPoints * tierPercentages[level];

      breakdown[`level${level}`].users++;
      breakdown[`level${level}`].points += earnedPoints;
      breakdown.grandTotal += earnedPoints;

      // Recursively process children
      if (node.children && node.children.length > 0) {
        accumulatePoints(node.children, level + 1);
      }
    }
  }

  accumulatePoints(tree, 1);
  return breakdown;
}
```

---

## 🔌 API Endpoints

### 1. Calculate Referral Tree
**Endpoint:** `GET /api/v1/calculateReferralTree?userID=...`

**What it does:**
- Builds the full 5-tier referral tree for a user
- Calculates points breakdown
- Returns tree structure with nested children

**Response:**
```json
{
  "success": true,
  "data": {
    "userID": "67890",
    "username": "kiss",
    "referralCode": "kiss123",
    "referralTree": [
      {
        "userID": "123",
        "username": "Miruna",
        "referralCode": "miruna456",
        "level": 1,
        "activityPoints": 1000,
        "children": [
          {
            "userID": "456",
            "username": "Ingrid",
            "referralCode": "ingrid789",
            "level": 2,
            "activityPoints": 500,
            "children": [...]
          }
        ]
      }
    ],
    "pointsBreakdown": {
      "level1": { "users": 1, "points": 250.00 },
      "level2": { "users": 1, "points": 75.00 },
      "level3": { "users": 1, "points": 50.00 },
      "level4": { "users": 0, "points": 0.00 },
      "level5": { "users": 0, "points": 0.00 },
      "grandTotal": 375.00
    }
  }
}
```

### 2. Update Referral Chains
**Endpoint:** `POST /api/v1/updateReferralChains`

**What it does:**
- Updates `referralPoints.referralChain` for ALL users
- Should be run after new users register
- Rebuilds entire chain structure

**Response:**
```json
{
  "success": true,
  "message": "Updated referral chains for 25 users",
  "totalUsers": 30,
  "updatedUsers": 25
}
```

### 3. Register with Referral
**Endpoint:** `POST /api/v1/registerReferral`

**What it does:**
- Creates new user with referralCode
- Sets referredBy field
- Automatically updates referral chains (NEW!)

**Payload:**
```json
{
  "username": "Europa",
  "password": "password123",
  "referralCode": "ingrid789"  // Code of person who referred them
}
```

---

## 🎨 Frontend Components

### ReferralTreeContent.vue

**Purpose:** Display the 5-tier referral network with clickable level cards

**Key Features:**
- Clickable level cards (1-5)
- Expandable user lists for each level
- Points breakdown display
- "Update Chains" button to rebuild chains
- "Refresh" button to reload tree

**Data Structure:**
```javascript
referralTreeData = {
  referralTree: [...],  // Nested tree with children
  pointsBreakdown: {
    level1: { users: 2, points: 250 },
    level2: { users: 2, points: 75 },
    ...
  }
}
```

**Functions:**
```javascript
// Toggle level card expansion
toggleLevel(level) {
  expandedLevels[level] = !expandedLevels[level]
}

// Get all users at a specific level
getUsersAtLevel(level) {
  // Recursively traverse tree
  // Find all nodes where node.level === level
  return users
}

// Fetch tree from API
fetchReferralTree() {
  // GET /api/v1/calculateReferralTree?userID=...
}

// Update all chains
updateAllChains() {
  // POST /api/v1/updateReferralChains
  // Then refresh tree
}
```

---

## ❌ Current Issues

### Issue 1: Chain Not Traversing Properly
**Problem:** When viewing kiss's referral tree, Ingrid and Europa don't appear at the correct levels.

**Why:** The chain building algorithm might not be properly traversing all 5 levels recursively.

**Example of what's wrong:**
```
Expected:
kiss → Level 1: Miruna
     → Level 2: Ingrid (Miruna's referral)
     → Level 3: Europa (Ingrid's referral)

Actual:
kiss → Level 1: Miruna
     → Level 2: (empty)
     → Level 3: (empty)
```

### Issue 2: Chain Not Updating Automatically
**Problem:** When new users register, the referral chains for parent users don't update.

**Why:** The `registerReferral.post.js` needs to call the chain update function after saving the new user.

### Issue 3: Click Handlers Not Working
**Problem:** Clicking on level cards doesn't expand to show users.

**Why:** Possible issues:
- `getUsersAtLevel()` function not finding users correctly
- `referralTreeData.referralTree` might be empty or malformed
- Tree structure from API doesn't match expected format

### Issue 4: Data Structure Mismatch
**Problem:** Two different data structures being used:

1. **referralChain** (flat arrays by level):
```javascript
referralChain: {
  level1: [user1, user2],
  level2: [user3, user4],
  ...
}
```

2. **referralTree** (nested with children):
```javascript
referralTree: [
  {
    username: "Miruna",
    level: 1,
    children: [
      {
        username: "Ingrid",
        level: 2,
        children: [...]
      }
    ]
  }
]
```

**Confusion:** Which one should we use for display?

---

## ✅ Proposed Fixes

### Fix 1: Use Single Data Structure

**Decision:** Use `referralTree` (nested) for display, `referralChain` (flat) for storage.

**Why:**
- `referralTree` is better for UI display (shows parent-child relationships)
- `referralChain` is better for database storage (simpler queries)

### Fix 2: Fix Tree Building Algorithm

**Current Issue:** Might not be traversing all levels correctly.

**Fix:** Ensure recursive traversal goes full 5 levels deep.

```javascript
// Fixed algorithm
async function buildReferralTree(referralCode, maxDepth = 5, currentDepth = 1) {
  if (currentDepth > maxDepth) return [];

  // Find direct referrals
  const directReferrals = await userSchema.find(
    { referredBy: referralCode },
    { _id: 1, username: 1, referralCode: 1, activityPoints: 1, profilePicture: 1, createdAt: 1 }
  );

  const tree = [];
  for (const referral of directReferrals) {
    const node = {
      userID: referral._id,
      username: referral.username || referral.referralCode,
      referralCode: referral.referralCode,
      profilePicture: referral.profilePicture,
      joinedAt: referral.createdAt,
      activityPoints: referral.activityPoints || 0,
      level: currentDepth,
      children: []
    };

    // IMPORTANT: Recursively get children
    if (currentDepth < maxDepth) {
      node.children = await buildReferralTree(
        referral.referralCode,
        maxDepth,
        currentDepth + 1
      );
    }

    tree.push(node);
  }

  return tree;
}
```

### Fix 3: Update Chains on Registration

**Already implemented in:** `server/api/v1/registerReferral.post.js`

```javascript
await user.save();
const token = jwt.sign({ userId: user._id }, 'randomkey1234');

// NEW: Update referral chains
if (referredBy) {
  try {
    await updateReferralChainsForUser(referredBy);
  } catch (error) {
    console.error('Error updating referral chains:', error);
  }
}

return { data: { token } };
```

### Fix 4: Fix getUsersAtLevel() Function

**Current Issue:** Might not be correctly extracting users at specific levels.

**Fix:**
```javascript
const getUsersAtLevel = (level) => {
  const users = [];

  const collectUsersAtLevel = (nodes, currentLevel) => {
    if (!nodes || nodes.length === 0) return;

    for (const node of nodes) {
      // Check if this node is at the target level
      if (node.level === level) {
        users.push(node);
      }

      // Continue traversing children regardless of level
      // (children might contain the level we're looking for)
      if (node.children && node.children.length > 0) {
        collectUsersAtLevel(node.children, currentLevel + 1);
      }
    }
  };

  // Start from the root of the tree
  collectUsersAtLevel(referralTreeData.value.referralTree, 1);
  return users;
};
```

### Fix 5: Add Debug Logging

**Add console logs to track data flow:**

```javascript
// In fetchReferralTree()
console.log('🌳 Fetched tree:', response.data.referralTree);
console.log('📊 Points breakdown:', response.data.pointsBreakdown);

// In getUsersAtLevel()
console.log(`🔍 Getting users at level ${level}`);
console.log('Tree data:', referralTreeData.value.referralTree);
const users = collectUsersAtLevel(...);
console.log(`Found ${users.length} users at level ${level}:`, users);

// In toggleLevel()
console.log(`🔄 Toggling level ${level}`, expandedLevels.value);
```

---

## 🚀 Next Steps

### Immediate Actions

1. **Click the "Update Chains" button** in the UI
   - This will rebuild all referral chains in the database
   - Wait for success notification

2. **Click "Refresh" button**
   - This will reload the tree with updated data

3. **Check browser console**
   - Look for debug logs
   - Check if data is being fetched correctly

4. **Try clicking a level card**
   - Does it expand?
   - Do users appear?

### Testing Checklist

- [ ] Register new user with referral code
- [ ] Check if chain updates automatically
- [ ] Click "Update Chains" button
- [ ] Verify all levels show correct user counts
- [ ] Click each level card (1-5)
- [ ] Verify users appear when expanded
- [ ] Check points calculation is correct
- [ ] Verify chain: kiss → Miruna → Ingrid → Europa

---

## 📝 Database Queries for Testing

### Check User's Referral Chain
```javascript
db.users.findOne(
  { username: "kiss" },
  { referralPoints: 1, referralCode: 1 }
)
```

### Check Who Referred Whom
```javascript
// Find all users referred by kiss
db.users.find({ referredBy: "kiss123" })

// Find who referred Miruna
db.users.findOne({ username: "Miruna" }, { referredBy: 1 })
```

### Manually Update a User's Chain
```javascript
// Run the updateReferralChains endpoint via Postman or browser
POST http://localhost:3001/api/v1/updateReferralChains
```

---

## 🐛 Debugging Guide

### Problem: Users don't appear when clicking level cards

**Debug Steps:**
1. Open browser console (F12)
2. Click a level card
3. Check console for:
   - `toggleLevel()` being called
   - `getUsersAtLevel()` finding users
   - `referralTreeData.value.referralTree` has data

**Expected logs:**
```
🔄 Toggling level 1 { 1: true, 2: false, ... }
🔍 Getting users at level 1
Tree data: [{ username: "Miruna", level: 1, ... }]
Found 1 users at level 1: [{ username: "Miruna", ... }]
```

### Problem: Points are 0.00 for all levels

**Debug Steps:**
1. Check if users have `activityPoints` set
2. Run: `db.users.updateMany({}, { $set: { activityPoints: 100 } })`
3. Click "Update Chains"
4. Click "Refresh"
5. Points should now appear

### Problem: Chain shows users at wrong levels

**Debug Steps:**
1. Check the `referredBy` chain manually:
   ```javascript
   // Europa should have: referredBy = "ingrid789"
   // Ingrid should have: referredBy = "miruna456"
   // Miruna should have: referredBy = "kiss123"
   ```
2. If wrong, fix manually in database
3. Click "Update Chains" to rebuild

---

## 📞 Support

If issues persist:
1. Check server logs for errors
2. Verify MongoDB connection
3. Test API endpoints with Postman
4. Review browser console errors
5. Check network tab for failed requests

**Key files to review:**
- `server/api/v1/calculateReferralTree.get.js` - Tree building
- `server/api/v1/updateReferralChains.post.js` - Chain updates
- `server/api/v1/registerReferral.post.js` - Registration
- `components/ReferralTreeContent.vue` - Display
- `server/models/user.schema.js` - Database schema
