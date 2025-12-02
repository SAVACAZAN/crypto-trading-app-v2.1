import { userSchema } from "~/server/models/user.schema";

/**
 * Reset all referral data for a specific user
 * This clears tierCredits, referralChain, referralTree, and referralPoints
 *
 * POST /api/v1/resetUserReferralData
 * Body: { username: "kiss" }
 */
export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { username } = body;

        if (!username) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Username is required'
            });
        }

        console.log(`\n🗑️ Resetting referral data for user: ${username}...`);

        // Find the user
        const user = await userSchema.findOne({ username });
        if (!user) {
            throw createError({
                statusCode: 404,
                statusMessage: `User ${username} not found`
            });
        }

        // Reset all referral-related fields
        const resetData = {
            // Reset tier credits (UP chain)
            'tierCredits.tier1.userID': null,
            'tierCredits.tier1.username': null,
            'tierCredits.tier1.referralCode': null,
            'tierCredits.tier2.userID': null,
            'tierCredits.tier2.username': null,
            'tierCredits.tier2.referralCode': null,
            'tierCredits.tier3.userID': null,
            'tierCredits.tier3.username': null,
            'tierCredits.tier3.referralCode': null,
            'tierCredits.tier4.userID': null,
            'tierCredits.tier4.username': null,
            'tierCredits.tier4.referralCode': null,
            'tierCredits.tier5.userID': null,
            'tierCredits.tier5.username': null,
            'tierCredits.tier5.referralCode': null,

            // Reset referral points and chain (DOWN chain)
            'referralPoints.totalPoints': 0,
            'referralPoints.pointsByTier.level1': 0,
            'referralPoints.pointsByTier.level2': 0,
            'referralPoints.pointsByTier.level3': 0,
            'referralPoints.pointsByTier.level4': 0,
            'referralPoints.pointsByTier.level5': 0,
            'referralPoints.referralChain.level1': [],
            'referralPoints.referralChain.level2': [],
            'referralPoints.referralChain.level3': [],
            'referralPoints.referralChain.level4': [],
            'referralPoints.referralChain.level5': [],
            'referralPoints.lastUpdated': new Date(),

            // Reset referral tree cache
            'referralTree.tree': [],
            'referralTree.pointsBreakdown.level1.users': 0,
            'referralTree.pointsBreakdown.level1.points': 0,
            'referralTree.pointsBreakdown.level2.users': 0,
            'referralTree.pointsBreakdown.level2.points': 0,
            'referralTree.pointsBreakdown.level3.users': 0,
            'referralTree.pointsBreakdown.level3.points': 0,
            'referralTree.pointsBreakdown.level4.users': 0,
            'referralTree.pointsBreakdown.level4.points': 0,
            'referralTree.pointsBreakdown.level5.users': 0,
            'referralTree.pointsBreakdown.level5.points': 0,
            'referralTree.pointsBreakdown.grandTotal': 0,
            'referralTree.lastCalculated': null,

            // Keep referralCode and referredBy as they are (don't reset these)
            // This allows the user to still be part of chains if needed
        };

        await userSchema.findByIdAndUpdate(user._id, { $set: resetData });

        console.log(`✅ Reset complete for ${username}`);
        console.log(`   - Tier credits cleared`);
        console.log(`   - Referral chain cleared`);
        console.log(`   - Referral tree cleared`);
        console.log(`   - Points reset to 0`);

        return {
            success: true,
            message: `Referral data reset successfully for user ${username}`,
            user: {
                username: user.username,
                referralCode: user.referralCode,
                referredBy: user.referredBy
            }
        };
    } catch (error) {
        console.error('❌ Error resetting referral data:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error.statusMessage || 'Failed to reset referral data'
        });
    }
});
