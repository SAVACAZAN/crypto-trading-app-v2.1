/**
 * Migration Script: Convert Old ObjectID-based Referrals to Referral Codes
 *
 * This script will:
 * 1. Find all users with referredBy field containing MongoDB ObjectIDs (24-char hex)
 * 2. Look up the referrer user by ID
 * 3. Replace ObjectID with the referrer's referral code
 * 4. Update the database
 *
 * Run this script ONCE to migrate all old data
 */

import mongoose from 'mongoose';
import { userSchema } from '../models/user.schema.js';

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crypto-app-V1';

async function migrateReferralCodes() {
    console.log('🚀 Starting Referral Code Migration...\n');

    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all users with referredBy field that looks like an ObjectID
        const usersWithOldReferrals = await userSchema.find({
            referredBy: {
                $exists: true,
                $ne: null,
                $regex: /^[0-9a-fA-F]{24}$/ // Matches 24-character hex strings (ObjectIDs)
            }
        });

        console.log(`📊 Found ${usersWithOldReferrals.length} users with old ObjectID-based referrals\n`);

        if (usersWithOldReferrals.length === 0) {
            console.log('✨ No migration needed - all referrals are already using referral codes!\n');
            await mongoose.disconnect();
            return;
        }

        let successCount = 0;
        let failCount = 0;
        let notFoundCount = 0;

        // Process each user
        for (const user of usersWithOldReferrals) {
            const oldReferredBy = user.referredBy;

            try {
                // Find the referrer by ObjectID
                const referrerUser = await userSchema.findById(oldReferredBy);

                if (!referrerUser) {
                    console.log(`⚠️  Referrer not found for user ${user.username} (${user._id})`);
                    console.log(`   Old referredBy: ${oldReferredBy}`);
                    notFoundCount++;
                    continue;
                }

                if (!referrerUser.referralCode) {
                    console.log(`⚠️  Referrer ${referrerUser.username} has no referral code!`);
                    console.log(`   Generating one now...`);

                    // Generate referral code if missing
                    referrerUser.referralCode = generateReferralCode();
                    await referrerUser.save();
                }

                // Update the user's referredBy field with the referral code
                await userSchema.findByIdAndUpdate(user._id, {
                    referredBy: referrerUser.referralCode
                });

                console.log(`✅ Migrated: ${user.username}`);
                console.log(`   Old: ${oldReferredBy} (ObjectID)`);
                console.log(`   New: ${referrerUser.referralCode} (Referral Code)`);
                console.log(`   Referrer: ${referrerUser.username}\n`);

                successCount++;
            } catch (error) {
                console.error(`❌ Error migrating user ${user.username}:`, error.message);
                failCount++;
            }
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📈 MIGRATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total users processed:     ${usersWithOldReferrals.length}`);
        console.log(`✅ Successfully migrated:   ${successCount}`);
        console.log(`❌ Failed migrations:       ${failCount}`);
        console.log(`⚠️  Referrer not found:     ${notFoundCount}`);
        console.log('='.repeat(60) + '\n');

        if (successCount > 0) {
            console.log('🎉 Migration completed successfully!');
            console.log('💡 All referral codes are now using the new system.\n');
        }

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB\n');

    } catch (error) {
        console.error('💥 Migration failed:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

// Helper function to generate referral code
function generateReferralCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let referralCode = '';
    for (let i = 0; i < 9; i++) {
        referralCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return referralCode;
}

// Run the migration
migrateReferralCodes();
