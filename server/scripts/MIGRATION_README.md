# 🔄 Referral System Migration Guide

## Overview
This migration converts the old ObjectID-based referral system to the new referral code-based system.

---

## 📋 What This Migration Does

### Before Migration:
- Users have `referredBy` field containing MongoDB ObjectIDs
- Example: `referredBy: "66e5d23b4844420459b54ee9"`
- Hard to read and share

### After Migration:
- Users have `referredBy` field containing referral codes
- Example: `referredBy: "SAVACAZAN"`
- Easy to read, share, and remember

---

## 🚀 How to Run the Migration

### Step 1: Backup Your Database (IMPORTANT!)
Before running any migration, **ALWAYS** backup your database:

```bash
# MongoDB backup command
mongodump --db crypto-app-V1 --out ./backup-$(date +%Y%m%d)
```

### Step 2: Navigate to Scripts Directory
```bash
cd "c:\WORK\react\TOP BOTZ\WorkCloude\crypto-app-github v2.2 - updated COINBASE\server\scripts"
```

### Step 3: Run the Migration Script
```bash
node migrateReferralCodes.js
```

### Step 4: Verify the Results
The script will output:
- ✅ Number of successfully migrated users
- ❌ Number of failed migrations
- ⚠️ Number of referrers not found

---

## 📊 Expected Output

```
🚀 Starting Referral Code Migration...

✅ Connected to MongoDB

📊 Found 25 users with old ObjectID-based referrals

✅ Migrated: miruna
   Old: 66e5d23b4844420459b54ee9 (ObjectID)
   New: SAVACAZAN (Referral Code)
   Referrer: savacazan

✅ Migrated: alex
   Old: 66e5d23b4844420459b54ee9 (ObjectID)
   New: SAVACAZAN (Referral Code)
   Referrer: savacazan

...

============================================================
📈 MIGRATION SUMMARY
============================================================
Total users processed:     25
✅ Successfully migrated:   23
❌ Failed migrations:       0
⚠️  Referrer not found:     2
============================================================

🎉 Migration completed successfully!
💡 All referral codes are now using the new system.

👋 Disconnected from MongoDB
```

---

## ⚠️ Important Notes

### 1. Run Only Once
This migration should be run **ONLY ONCE**. Running it multiple times is safe (it will find 0 users to migrate), but unnecessary.

### 2. Referrer Not Found
If the script shows "Referrer not found", it means:
- The original referrer account was deleted
- The ObjectID was invalid
- Data corruption occurred

These users will keep their old ObjectID in the database until manually fixed.

### 3. Auto-Generated Referral Codes
If a referrer user doesn't have a referral code, the script will automatically generate one.

---

## 🔧 Troubleshooting

### Problem: "Cannot connect to MongoDB"
**Solution:** Check your MongoDB connection string in `.env`:
```
MONGODB_URI=mongodb://127.0.0.1:27017/crypto-app-V1
```

### Problem: "Module not found"
**Solution:** Make sure you're using ES modules. Update `package.json`:
```json
{
  "type": "module"
}
```

### Problem: Migration shows 0 users
**Solution:** This is good! It means all users are already migrated.

---

## 📝 Manual Verification

After migration, verify in MongoDB:

```javascript
// Connect to MongoDB
use crypto-app-V1

// Check for old ObjectID references (should be 0)
db.users.countDocuments({
  referredBy: { $regex: /^[0-9a-fA-F]{24}$/ }
})

// Check for new referral codes
db.users.find({
  referredBy: { $exists: true, $ne: null }
}).forEach(user => {
  print(`${user.username} → referred by: ${user.referredBy}`)
})
```

---

## 🎯 Post-Migration Checklist

- ✅ Backup created
- ✅ Migration script executed
- ✅ Summary shows success
- ✅ Manual verification in database
- ✅ Test referral page displays codes (not IDs)
- ✅ Test getUserInfo API returns correct counts
- ✅ Test new user registration with referral code

---

## 🔙 Rollback (If Needed)

If something goes wrong, restore from backup:

```bash
# Stop the application
# Restore MongoDB from backup
mongorestore --db crypto-app-V1 ./backup-YYYYMMDD/crypto-app-V1

# Restart the application
```

---

## 📞 Support

If you encounter issues:
1. Check the logs in the console output
2. Verify MongoDB connection
3. Ensure all dependencies are installed
4. Check backup before making changes

---

**Migration Script Location:**
`server/scripts/migrateReferralCodes.js`

**Created:** 2024
**Version:** 1.0.0
**Status:** Ready for production use

---

## 🎉 After Migration

Once migration is complete:
1. Old system is completely removed
2. All referrals use referral codes
3. Referral page shows usernames (not IDs)
4. System is cleaner and more user-friendly

**Enjoy the new referral system! 🚀**
