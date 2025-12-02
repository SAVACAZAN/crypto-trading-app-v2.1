# 🌳 Referral System - Complete 5-Tier Specification

## 📊 System Overview

### Chain Structure Example
```
User1 (kiss)
 └─ User2 (Miruna)     [Level 1 from User1's perspective]
     └─ User3 (Ingrid)  [Level 2 from User1's perspective]
         └─ User4 (Europa) [Level 3 from User1's perspective]
             └─ User5      [Level 4 from User1's perspective]
                 └─ User6  [Level 5 from User1's perspective]
```

---

## 🎯 TIER SYSTEM - How It Works

### For Each User, We Track TWO Things:

1. **DOWN the chain** (referralChain) - Who they referred (their children)
2. **UP the chain** (tierCredits) - Who gets credit from their activity (their parents)

---

## 📋 Complete Tier Breakdown for Each User

### 👤 User1 (kiss)

**Referral Chain (DOWN):**
```javascript
referralChain: {
  level1: [User2],  // Direct referrals
  level2: [User3],  // User2's referrals
  level3: [User4],  // User3's referrals
  level4: [User5],  // User4's referrals
  level5: [User6]   // User5's referrals
}
```

**Tier Credits (UP):**
```javascript
tierCredits: {
  // User1 is the top, no one above them
  tier1: null,
  tier2: null,
  tier3: null,
  tier4: null,
  tier5: null
}
```

**Earnings:**
- 25% from User2's activity (Level 1)
- 15% from User3's activity (Level 2)
- 10% from User4's activity (Level 3)
- 5% from User5's activity (Level 4)
- 2% from User6's activity (Level 5)

---

### 👤 User2 (Miruna)

**Referral Chain (DOWN):**
```javascript
referralChain: {
  level1: [User3],  // Direct referrals
  level2: [User4],  // User3's referrals
  level3: [User5],  // User4's referrals
  level4: [User6],  // User5's referrals
  level5: []
}
```

**Tier Credits (UP):**
```javascript
tierCredits: {
  tier1: User1,  // User1 is Tier 1 for User2 (gets 25% of User2's activity)
  tier2: null,
  tier3: null,
  tier4: null,
  tier5: null
}
```

**Earnings:**
- 25% from User3's activity (Level 1)
- 15% from User4's activity (Level 2)
- 10% from User5's activity (Level 3)
- 5% from User6's activity (Level 4)

**Contributes To:**
- User1 gets 25% of User2's activity

---

### 👤 User3 (Ingrid)

**Referral Chain (DOWN):**
```javascript
referralChain: {
  level1: [User4],  // Direct referrals
  level2: [User5],  // User4's referrals
  level3: [User6],  // User5's referrals
  level4: [],
  level5: []
}
```

**Tier Credits (UP):**
```javascript
tierCredits: {
  tier1: User2,  // User2 is Tier 1 (gets 25%)
  tier2: User1,  // User1 is Tier 2 (gets 15%)
  tier3: null,
  tier4: null,
  tier5: null
}
```

**Earnings:**
- 25% from User4's activity (Level 1)
- 15% from User5's activity (Level 2)
- 10% from User6's activity (Level 3)

**Contributes To:**
- User2 gets 25% of User3's activity
- User1 gets 15% of User3's activity

---

### 👤 User4 (Europa)

**Referral Chain (DOWN):**
```javascript
referralChain: {
  level1: [User5],  // Direct referrals
  level2: [User6],  // User5's referrals
  level3: [],
  level4: [],
  level5: []
}
```

**Tier Credits (UP):**
```javascript
tierCredits: {
  tier1: User3,  // User3 is Tier 1 (gets 25%)
  tier2: User2,  // User2 is Tier 2 (gets 15%)
  tier3: User1,  // User1 is Tier 3 (gets 10%)
  tier4: null,
  tier5: null
}
```

**Earnings:**
- 25% from User5's activity (Level 1)
- 15% from User6's activity (Level 2)

**Contributes To:**
- User3 gets 25% of User4's activity
- User2 gets 15% of User4's activity
- User1 gets 10% of User4's activity

---

### 👤 User5

**Referral Chain (DOWN):**
```javascript
referralChain: {
  level1: [User6],  // Direct referrals
  level2: [],
  level3: [],
  level4: [],
  level5: []
}
```

**Tier Credits (UP):**
```javascript
tierCredits: {
  tier1: User4,  // User4 is Tier 1 (gets 25%)
  tier2: User3,  // User3 is Tier 2 (gets 15%)
  tier3: User2,  // User2 is Tier 3 (gets 10%)
  tier4: User1,  // User1 is Tier 4 (gets 5%)
  tier5: null
}
```

**Earnings:**
- 25% from User6's activity (Level 1)

**Contributes To:**
- User4 gets 25% of User5's activity
- User3 gets 15% of User5's activity
- User2 gets 10% of User5's activity
- User1 gets 5% of User5's activity

---

### 👤 User6

**Referral Chain (DOWN):**
```javascript
referralChain: {
  level1: [],
  level2: [],
  level3: [],
  level4: [],
  level5: []
}
```

**Tier Credits (UP):**
```javascript
tierCredits: {
  tier1: User5,  // User5 is Tier 1 (gets 25%)
  tier2: User4,  // User4 is Tier 2 (gets 15%)
  tier3: User3,  // User3 is Tier 3 (gets 10%)
  tier4: User2,  // User2 is Tier 4 (gets 5%)
  tier5: User1   // User1 is Tier 5 (gets 2%) ✅ THIS IS THE KEY!
}
```

**Earnings:**
- None (no referrals yet)

**Contributes To:**
- User5 gets 25% of User6's activity
- User4 gets 15% of User6's activity
- User3 gets 10% of User6's activity
- User2 gets 5% of User6's activity
- **User1 gets 2% of User6's activity** ✅

---

## 💰 Points Distribution Example

### If User6 earns 1000 activity points:

```
User6 activity: 1000 points

Distribution:
├─ User5 (Tier 1): 1000 × 25% = 250 points
├─ User4 (Tier 2): 1000 × 15% = 150 points
├─ User3 (Tier 3): 1000 × 10% = 100 points
├─ User2 (Tier 4): 1000 × 5%  = 50 points
└─ User1 (Tier 5): 1000 × 2%  = 20 points ✅

Total distributed: 570 points (57%)
User6 keeps: 430 points (43%)
```

---

## 🗄️ Updated Database Schema

### User Schema - New Fields

```javascript
{
  // Existing fields...
  referralCode: String,
  referredBy: String,

  // NEW: Tier Credits (UP the chain - who earns from this user)
  tierCredits: {
    tier1: {
      userID: String,
      username: String,
      referralCode: String,
      percentage: 25
    },
    tier2: {
      userID: String,
      username: String,
      referralCode: String,
      percentage: 15
    },
    tier3: {
      userID: String,
      username: String,
      referralCode: String,
      percentage: 10
    },
    tier4: {
      userID: String,
      username: String,
      referralCode: String,
      percentage: 5
    },
    tier5: {
      userID: String,
      username: String,
      referralCode: String,
      percentage: 2
    }
  },

  // Existing: Referral Chain (DOWN the chain - who this user referred)
  referralPoints: {
    referralChain: {
      level1: Array,
      level2: Array,
      level3: Array,
      level4: Array,
      level5: Array
    }
  }
}
```

---

## 🔧 Algorithm - Building Tier Credits

### When a new user registers:

```javascript
// User6 registers with User5's referral code

async function buildTierCredits(newUser, referrerCode) {
  const tiers = [
    { level: 1, percentage: 25 },
    { level: 2, percentage: 15 },
    { level: 3, percentage: 10 },
    { level: 4, percentage: 5 },
    { level: 5, percentage: 2 }
  ];

  const tierCredits = {};
  let currentReferrer = referrerCode;

  // Go UP the chain 5 levels
  for (let i = 0; i < 5; i++) {
    if (!currentReferrer) break;

    // Find the user with this referral code
    const referrerUser = await userSchema.findOne({
      referralCode: currentReferrer
    });

    if (!referrerUser) break;

    // Assign tier credit
    tierCredits[`tier${i + 1}`] = {
      userID: referrerUser._id.toString(),
      username: referrerUser.username,
      referralCode: referrerUser.referralCode,
      percentage: tiers[i].percentage
    };

    // Move up the chain
    currentReferrer = referrerUser.referredBy;
  }

  // Save tier credits to new user
  await userSchema.findByIdAndUpdate(newUser._id, {
    tierCredits: tierCredits
  });

  return tierCredits;
}
```

### Example Execution:

```javascript
// User6 registers with User5's code "user5_code"

buildTierCredits(user6, "user5_code")

// Step 1: Find User5
referrerUser = User5
tierCredits.tier1 = { userID: User5._id, percentage: 25 }
currentReferrer = User5.referredBy // "user4_code"

// Step 2: Find User4
referrerUser = User4
tierCredits.tier2 = { userID: User4._id, percentage: 15 }
currentReferrer = User4.referredBy // "user3_code"

// Step 3: Find User3
referrerUser = User3
tierCredits.tier3 = { userID: User3._id, percentage: 10 }
currentReferrer = User3.referredBy // "user2_code"

// Step 4: Find User2
referrerUser = User2
tierCredits.tier4 = { userID: User2._id, percentage: 5 }
currentReferrer = User2.referredBy // "user1_code"

// Step 5: Find User1
referrerUser = User1
tierCredits.tier5 = { userID: User1._id, percentage: 2 } ✅
currentReferrer = User1.referredBy // null (top of chain)

// Result:
User6.tierCredits = {
  tier1: User5 (25%),
  tier2: User4 (15%),
  tier3: User3 (10%),
  tier4: User2 (5%),
  tier5: User1 (2%) ✅
}
```

---

## 📊 Displaying the Tree

### For User1 (kiss) - Show Referral Chain DOWN

```
🌳 Your 5-Tier Network

Level 1 (25%) - 1 user
├─ Miruna (User2) - 1000 pts → You earn: 250 pts

Level 2 (15%) - 1 user
├─ Ingrid (User3) - 500 pts → You earn: 75 pts

Level 3 (10%) - 1 user
├─ Europa (User4) - 300 pts → You earn: 30 pts

Level 4 (5%) - 1 user
├─ User5 - 200 pts → You earn: 10 pts

Level 5 (2%) - 1 user
├─ User6 - 1000 pts → You earn: 20 pts ✅

Total Earnings: 385 pts
```

---

## 🔄 Points Calculation - Real-time

### When User6 earns activity points:

```javascript
async function distributePoints(userId, earnedPoints) {
  const user = await userSchema.findById(userId).populate('tierCredits');

  // Distribute to all tier credits
  for (let tier = 1; tier <= 5; tier++) {
    const tierCredit = user.tierCredits[`tier${tier}`];
    if (!tierCredit) continue;

    const percentage = tierCredit.percentage / 100;
    const points = earnedPoints * percentage;

    // Add points to the tier user
    await userSchema.findByIdAndUpdate(tierCredit.userID, {
      $inc: {
        'referralPoints.totalPoints': points,
        [`referralPoints.pointsByTier.level${tier}`]: points
      }
    });

    console.log(`✅ ${tierCredit.username} (Tier ${tier}) earned ${points} pts from ${user.username}`);
  }
}

// Example:
await distributePoints(user6._id, 1000);

// Console output:
// ✅ User5 (Tier 1) earned 250 pts from User6
// ✅ User4 (Tier 2) earned 150 pts from User6
// ✅ User3 (Tier 3) earned 100 pts from User6
// ✅ User2 (Tier 4) earned 50 pts from User6
// ✅ User1 (Tier 5) earned 20 pts from User6 ✅
```

---

## ✅ Implementation Checklist

### Database Updates
- [ ] Add `tierCredits` field to user schema
- [ ] Keep existing `referralPoints.referralChain` for DOWN chain
- [ ] Add indexes on `tierCredits.tier1.userID` through `tier5.userID`

### API Endpoints
- [ ] `POST /api/v1/buildTierCredits` - Build tier credits for a user
- [ ] `POST /api/v1/updateAllTierCredits` - Rebuild for all users
- [ ] `POST /api/v1/distributePoints` - Distribute points to tier users
- [ ] Keep existing `GET /api/v1/calculateReferralTree` for display

### Registration Flow
- [ ] When user registers with referral code:
  1. Create user with `referredBy` field
  2. Build tier credits (5 levels UP)
  3. Update referral chains (5 levels DOWN) for all parents
  4. Save everything

### Frontend Display
- [ ] Show referral chain (DOWN) - who user referred
- [ ] Show tier earnings breakdown by level
- [ ] Show total points from all tiers
- [ ] Add real-time updates when points are distributed

---

## 🧪 Testing Scenario

### Setup
```
1. Create User1 (kiss)
2. User2 (Miruna) registers with User1's code
3. User3 (Ingrid) registers with User2's code
4. User4 (Europa) registers with User3's code
5. User5 registers with User4's code
6. User6 registers with User5's code
```

### Test 1: Check User6's Tier Credits
```javascript
const user6 = await userSchema.findOne({ username: 'User6' });
console.log(user6.tierCredits);

// Expected:
{
  tier1: { userID: 'user5_id', username: 'User5', percentage: 25 },
  tier2: { userID: 'user4_id', username: 'Europa', percentage: 15 },
  tier3: { userID: 'user3_id', username: 'Ingrid', percentage: 10 },
  tier4: { userID: 'user2_id', username: 'Miruna', percentage: 5 },
  tier5: { userID: 'user1_id', username: 'kiss', percentage: 2 } ✅
}
```

### Test 2: User6 Earns 1000 Points
```javascript
await distributePoints(user6._id, 1000);

// Check User1's points
const user1 = await userSchema.findOne({ username: 'kiss' });
console.log(user1.referralPoints.pointsByTier.level5);

// Expected: 20 (2% of 1000) ✅
```

### Test 3: View User1's Referral Tree
```javascript
const tree = await calculateReferralTree(user1._id);

// Expected:
{
  level1: [{ username: 'Miruna', points: earned_from_miruna }],
  level2: [{ username: 'Ingrid', points: earned_from_ingrid }],
  level3: [{ username: 'Europa', points: earned_from_europa }],
  level4: [{ username: 'User5', points: earned_from_user5 }],
  level5: [{ username: 'User6', points: 20 }] ✅
}
```

---

## 🎯 Summary

**The key difference:**

### OLD (Incorrect):
- Only tracked DOWN the chain (referralChain)
- User1 could see their referrals, but didn't get points from 5 levels deep

### NEW (Correct):
- Track BOTH directions:
  - **DOWN (referralChain)**: Who you referred (for display)
  - **UP (tierCredits)**: Who earns from you (for points distribution)

- User6 has `tierCredits.tier5 = User1`
- When User6 earns points, User1 gets 2% ✅

**This is exactly what you showed in your diagram!**
