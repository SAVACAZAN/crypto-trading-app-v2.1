import mongoose from 'mongoose';

/**
 * Give retroactive $100 referral bonuses to all existing users
 * This script will:
 * 1. Find all users who have a referredBy set
 * 2. For each user, distribute $100 across 5 tiers UP the chain
 * 3. Update referralEarnings for all referrers
 */

// Define User schema directly (simplified)
const userSchema = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

const BASE_BONUS = 100; // $100 per referral
const tiers = [
    { level: 1, percentage: 0.25 }, // 25% = $25
    { level: 2, percentage: 0.15 }, // 15% = $15
    { level: 3, percentage: 0.10 }, // 10% = $10
    { level: 4, percentage: 0.05 }, // 5% = $5
    { level: 5, percentage: 0.02 }  // 2% = $2
];

async function giveRetroactiveBonuses() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://127.0.0.1:27017/crypto-app-V1');
        console.log('✅ Connected to MongoDB');

        // Find all users who have a referredBy code
        const usersWithReferrer = await userSchema.find({
            referredBy: { $exists: true, $ne: null }
        }, {
            _id: 1,
            username: 1,
            referralCode: 1,
            referredBy: 1,
            referralEarnings: 1
        });

        console.log(`\n📊 Found ${usersWithReferrer.length} users with referrers\n`);

        let totalDistributed = 0;
        let usersProcessed = 0;

        // For each user, distribute bonus UP the chain
        for (const user of usersWithReferrer) {
            console.log(`\n💰 Processing user: ${user.username || user.referralCode}`);
            console.log(`   Referred by: ${user.referredBy}`);

            // Check if this user already has earnings history (already processed)
            if (user.referralEarnings && user.referralEarnings.earningsHistory && user.referralEarnings.earningsHistory.length > 0) {
                console.log(`   ⏭️  Already has earnings history - skipping`);
                continue;
            }

            let currentReferrer = user.referredBy;
            let levelDistributed = 0;

            // Go UP the chain 5 levels
            for (let i = 0; i < 5; i++) {
                if (!currentReferrer) break;

                // Find the referrer user
                const referrerUser = await userSchema.findOne({ referralCode: currentReferrer });
                if (!referrerUser) {
                    console.log(`   ⚠️  Referrer not found for code: ${currentReferrer}`);
                    break;
                }

                // Calculate earnings for this tier
                const earnings = BASE_BONUS * tiers[i].percentage;

                // Update referrer's earnings using atomic operations
                await userSchema.findByIdAndUpdate(referrerUser._id, {
                    $inc: {
                        'referralEarnings.totalEarnings': earnings
                    },
                    $push: {
                        'referralEarnings.earningsHistory': {
                            userID: user._id.toString(),
                            username: user.username || user.referralCode || 'Unknown',
                            amount: earnings,
                            tier: i + 1,
                            earnedAt: new Date()
                        }
                    },
                    $set: {
                        'referralEarnings.lastUpdated': new Date(),
                        'referralEarnings.earningsPerReferral': 100
                    }
                });

                console.log(`   ✅ Tier ${i + 1}: ${referrerUser.username || referrerUser.referralCode} earned $${earnings.toFixed(2)} (${tiers[i].percentage * 100}%)`);

                levelDistributed += earnings;
                totalDistributed += earnings;

                // Move up the chain
                currentReferrer = referrerUser.referredBy;
            }

            console.log(`   💵 Total distributed for this user: $${levelDistributed.toFixed(2)}`);
            usersProcessed++;
        }

        console.log(`\n\n🎉 RETROACTIVE BONUS DISTRIBUTION COMPLETE!`);
        console.log(`   Processed: ${usersProcessed} users`);
        console.log(`   Total distributed: $${totalDistributed.toFixed(2)}`);
        console.log(`   Average per user: $${(totalDistributed / usersProcessed).toFixed(2)}\n`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the script
giveRetroactiveBonuses();
