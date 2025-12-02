import { userSchema } from "~/server/models/user.schema";

/**
 * Rebuild tier credits for all users in the database
 * This should be run to update existing users after implementing the tier credits system
 *
 * POST /api/v1/rebuildTierCredits
 */
export default defineEventHandler(async (event) => {
    try {
        console.log('\n🔄 Starting tier credits rebuild for all users...');

        // Get all users
        const allUsers = await userSchema.find({}, {
            _id: 1,
            username: 1,
            referralCode: 1,
            referredBy: 1
        });

        console.log(`📊 Found ${allUsers.length} users to process`);

        let updatedCount = 0;

        // For each user, build their tier credits
        for (const user of allUsers) {
            if (!user.referralCode) {
                console.log(`⏭️  Skipping user ${user.username} (no referral code)`);
                continue;
            }

            // If user has a referrer, build their tier credits
            if (user.referredBy) {
                const tierCredits = await buildTierCreditsForUser(user._id, user.referredBy);
                updatedCount++;
                console.log(`✅ Built tier credits for ${user.username || user.referralCode}`);
            } else {
                console.log(`ℹ️  User ${user.username || user.referralCode} is at top of chain (no referrer)`);
            }
        }

        console.log(`\n✨ Tier credits rebuild complete! Updated ${updatedCount} users.`);

        return {
            success: true,
            message: `Rebuilt tier credits for ${updatedCount} users`,
            totalUsers: allUsers.length,
            updatedUsers: updatedCount
        };
    } catch (error) {
        console.error('❌ Error rebuilding tier credits:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to rebuild tier credits'
        });
    }
});

/**
 * Build tier credits for a user (UP the chain - who earns from this user's activity)
 * Returns the tier credits object
 */
async function buildTierCreditsForUser(userId, referrerCode) {
    const tiers = [
        { level: 1, percentage: 25 },
        { level: 2, percentage: 15 },
        { level: 3, percentage: 10 },
        { level: 4, percentage: 5 },
        { level: 5, percentage: 2 }
    ];

    const tierCredits = {
        tier1: { userID: null, username: null, referralCode: null, percentage: 25 },
        tier2: { userID: null, username: null, referralCode: null, percentage: 15 },
        tier3: { userID: null, username: null, referralCode: null, percentage: 10 },
        tier4: { userID: null, username: null, referralCode: null, percentage: 5 },
        tier5: { userID: null, username: null, referralCode: null, percentage: 2 }
    };

    let currentReferrer = referrerCode;

    // Go UP the chain 5 levels
    for (let i = 0; i < 5; i++) {
        if (!currentReferrer) break;

        // Find the user with this referral code
        const referrerUser = await userSchema.findOne({ referralCode: currentReferrer });
        if (!referrerUser) break;

        // Assign tier credit
        tierCredits[`tier${i + 1}`] = {
            userID: referrerUser._id.toString(),
            username: referrerUser.username || referrerUser.referralCode,
            referralCode: referrerUser.referralCode,
            percentage: tiers[i].percentage
        };

        console.log(`  ↑ Tier ${i + 1}: ${referrerUser.username || referrerUser.referralCode} (${tiers[i].percentage}%)`);

        // Move up the chain
        currentReferrer = referrerUser.referredBy;
    }

    // Update the user's tier credits
    await userSchema.findByIdAndUpdate(userId, {
        tierCredits: tierCredits
    });

    return tierCredits;
}
