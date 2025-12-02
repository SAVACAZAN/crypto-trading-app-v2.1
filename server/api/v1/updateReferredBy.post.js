import { userSchema } from "~/server/models/user.schema";

/**
 * Build tier credits for a user and distribute $100 referral bonus
 * UP the chain (who earns from this user's registration)
 *
 * Distribution:
 * - Tier 1 (direct referrer): $100 × 25% = $25
 * - Tier 2: $100 × 15% = $15
 * - Tier 3: $100 × 10% = $10
 * - Tier 4: $100 × 5% = $5
 * - Tier 5: $100 × 2% = $2
 * Total distributed: $57
 */
async function buildTierCreditsAndDistribute(userId, referrerCode, newUserUsername) {
    const BASE_BONUS = 100; // $100 per referral
    const tiers = [
        { level: 1, percentage: 0.25 }, // 25% = $25
        { level: 2, percentage: 0.15 }, // 15% = $15
        { level: 3, percentage: 0.10 }, // 10% = $10
        { level: 4, percentage: 0.05 }, // 5% = $5
        { level: 5, percentage: 0.02 }  // 2% = $2
    ];

    const tierCredits = {
        tier1: { userID: null, username: null, referralCode: null, percentage: 25 },
        tier2: { userID: null, username: null, referralCode: null, percentage: 15 },
        tier3: { userID: null, username: null, referralCode: null, percentage: 10 },
        tier4: { userID: null, username: null, referralCode: null, percentage: 5 },
        tier5: { userID: null, username: null, referralCode: null, percentage: 2 }
    };

    let currentReferrer = referrerCode;
    let totalDistributed = 0;
    let recipients = 0;

    // Go UP the chain 5 levels
    for (let i = 0; i < 5; i++) {
        if (!currentReferrer) break;

        // Find the user with this referral code
        const referrerUser = await userSchema.findOne({ referralCode: currentReferrer });
        if (!referrerUser) break;

        // Calculate earnings for this tier
        const earnings = BASE_BONUS * tiers[i].percentage;

        // Assign tier credit
        tierCredits[`tier${i + 1}`] = {
            userID: referrerUser._id.toString(),
            username: referrerUser.username || referrerUser.referralCode,
            referralCode: referrerUser.referralCode,
            percentage: tiers[i].percentage * 100 // Convert to percentage for display
        };

        // Update referrer's earnings
        const currentEarnings = referrerUser.referralEarnings || {
            totalEarnings: 0,
            earningsPerReferral: 100,
            earningsHistory: [],
            lastUpdated: null
        };

        const newTotalEarnings = (currentEarnings.totalEarnings || 0) + earnings;

        // Add to earnings history
        const earningsHistory = currentEarnings.earningsHistory || [];
        earningsHistory.push({
            userID: userId.toString(),
            username: newUserUsername || 'New User',
            amount: earnings,
            tier: i + 1,
            earnedAt: new Date()
        });

        await userSchema.findByIdAndUpdate(referrerUser._id, {
            'referralEarnings.totalEarnings': newTotalEarnings,
            'referralEarnings.earningsHistory': earningsHistory,
            'referralEarnings.lastUpdated': new Date()
        });

        console.log(`  ↑ Tier ${i + 1}: ${referrerUser.username || referrerUser.referralCode} earned $${earnings.toFixed(2)} (${tiers[i].percentage * 100}%)`);

        totalDistributed += earnings;
        recipients++;

        // Move up the chain
        currentReferrer = referrerUser.referredBy;
    }

    // Update the new user's tier credits
    await userSchema.findByIdAndUpdate(userId, {
        tierCredits: tierCredits
    });

    return {
        totalDistributed: totalDistributed.toFixed(2),
        recipients: recipients,
        tierCredits: tierCredits
    };
}

export default defineEventHandler(async (event) => {
    try {
        const data = await readBody(event);
        const { userID, referredByCode } = data;

        if (!userID || !referredByCode) {
            throw createError({
                statusCode: 400,
                statusMessage: 'User ID and referrer code are required'
            });
        }

        // Validate format (3-20 alphanumeric characters)
        const codeRegex = /^[a-zA-Z0-9]{3,20}$/;
        if (!codeRegex.test(referredByCode)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid format. Code must be 3-20 alphanumeric characters'
            });
        }

        // Find the user
        const user = await userSchema.findById(userID);
        if (!user) {
            throw createError({
                statusCode: 404,
                statusMessage: 'User not found'
            });
        }

        // Check if referredBy was already edited once
        if (user.referredByEdited) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Referred by code can only be edited once'
            });
        }

        // Check if the referredByCode exists (belongs to an actual user)
        const referrerUser = await userSchema.findOne({
            referralCode: referredByCode
        });

        if (!referrerUser) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Referral code does not exist'
            });
        }

        // Prevent users from referring themselves
        if (referrerUser._id.toString() === userID) {
            throw createError({
                statusCode: 400,
                statusMessage: 'You cannot refer yourself'
            });
        }

        // Update the user's referredBy field and mark as edited
        await userSchema.findByIdAndUpdate(userID, {
            referredBy: referredByCode,
            referredByEdited: true
        });

        console.log(`\n💰 Distributing $100 referral bonus for ${user.username}...`);

        // Build tier credits for this user (UP chain - who earns from this user)
        const tierCredits = await buildTierCreditsAndDistribute(userID, referredByCode, user.username);

        console.log(`✅ Referral bonus distributed successfully!`);
        console.log(`   Total distributed: $${tierCredits.totalDistributed}`);
        console.log(`   Recipients: ${tierCredits.recipients}\n`);

        return {
            success: true,
            message: 'Referred by code updated successfully',
            referredBy: referredByCode,
            bonusDistributed: tierCredits.totalDistributed,
            recipients: tierCredits.recipients
        };
    } catch (error) {
        console.error('Error updating referred by code:', error);

        // Safe error handling - never crash the app
        const statusCode = error.statusCode || 500;
        const statusMessage = error.statusMessage || error.message || 'Failed to update referred by code';

        throw createError({
            statusCode: statusCode,
            statusMessage: statusMessage
        });
    }
});
