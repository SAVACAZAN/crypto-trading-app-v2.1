import mongoose from 'mongoose';

/**
 * Add activity points to existing users so referral points can be calculated
 * This script will:
 * 1. Find all users who have a referredBy set (they are in someone's network)
 * 2. Give them random activity points between 50-500
 * 3. Update the database
 */

// Define User schema directly (simplified)
const userSchema = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

async function addActivityPoints() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://127.0.0.1:27017/crypto-app-V1');
        console.log('✅ Connected to MongoDB');

        // Find all users
        const allUsers = await userSchema.find({}, {
            _id: 1,
            username: 1,
            referralCode: 1,
            referredBy: 1,
            activityPoints: 1
        });

        console.log(`\n📊 Found ${allUsers.length} total users\n`);

        let usersUpdated = 0;
        let totalPointsAdded = 0;

        // For each user, add random activity points
        for (const user of allUsers) {
            // Generate random activity points between 50 and 500
            const randomPoints = Math.floor(Math.random() * 451) + 50; // 50 to 500

            // Update user's activity points
            await userSchema.findByIdAndUpdate(user._id, {
                $set: {
                    activityPoints: randomPoints
                }
            });

            console.log(`✅ ${user.username || user.referralCode}: ${randomPoints} activity points`);

            usersUpdated++;
            totalPointsAdded += randomPoints;
        }

        console.log(`\n\n🎉 ACTIVITY POINTS ADDED!`);
        console.log(`   Users updated: ${usersUpdated}`);
        console.log(`   Total points added: ${totalPointsAdded}`);
        console.log(`   Average per user: ${(totalPointsAdded / usersUpdated).toFixed(2)}\n`);

        // Now let's see what the network looks like
        const usersWithReferrers = await userSchema.find({
            referredBy: { $exists: true, $ne: null }
        }, {
            _id: 1,
            username: 1,
            referralCode: 1,
            referredBy: 1,
            activityPoints: 1
        });

        console.log(`\n📊 Users in referral networks: ${usersWithReferrers.length}\n`);

        for (const user of usersWithReferrers) {
            console.log(`👤 ${user.username || user.referralCode}:`);
            console.log(`   Referred by: ${user.referredBy}`);
            console.log(`   Activity Points: ${user.activityPoints}`);
            console.log('');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the script
addActivityPoints();
