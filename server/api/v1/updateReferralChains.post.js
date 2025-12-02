import { userSchema } from "~/server/models/user.schema";

/**
 * Update referral chains for all users in the database
 * This should be run after new users register to update the entire referral tree
 *
 * POST /api/v1/updateReferralChains
 */
export default defineEventHandler(async (event) => {
    try {
        console.log('\n🔄 Starting referral chain update for all users...');

        // Get all users
        const allUsers = await userSchema.find({}, {
            _id: 1,
            username: 1,
            referralCode: 1,
            referredBy: 1
        });

        console.log(`📊 Found ${allUsers.length} users to process`);

        let updatedCount = 0;

        // For each user, update their referral chain
        for (const user of allUsers) {
            if (!user.referralCode) {
                console.log(`⏭️  Skipping user ${user.username} (no referral code)`);
                continue;
            }

            // Build the referral chain for this user (who referred them up to 5 levels)
            const referralChain = await buildUserReferralChain(user.referralCode);

            // Update the user's referrals.chain (NEW structure)
            await userSchema.findByIdAndUpdate(user._id, {
                'referrals.chain': referralChain,
                'referrals.lastUpdated': new Date()
            });

            updatedCount++;
            console.log(`✅ Updated referral chain for ${user.username || user.referralCode}`);
        }

        console.log(`\n✨ Referral chain update complete! Updated ${updatedCount} users.`);

        return {
            success: true,
            message: `Updated referral chains for ${updatedCount} users`,
            totalUsers: allUsers.length,
            updatedUsers: updatedCount
        };
    } catch (error) {
        console.error('❌ Error updating referral chains:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update referral chains'
        });
    }
});

/**
 * Build the referral chain for a user (who they referred up to 5 levels deep)
 * Returns an object with level1, level2, level3, level4, level5 arrays
 * WITH CIRCULAR REFERENCE PROTECTION
 */
async function buildUserReferralChain(referralCode) {
    const chain = {
        level1: [],
        level2: [],
        level3: [],
        level4: [],
        level5: []
    };

    // Track processed referral codes to prevent circular references
    const processedCodes = new Set();
    processedCodes.add(referralCode); // Add starting code to prevent self-referral

    // Level 1: Direct referrals (users who have this referralCode as referredBy)
    const level1Users = await userSchema.find(
        { referredBy: referralCode },
        { _id: 1, username: 1, referralCode: 1 }
    );

    for (const l1User of level1Users) {
        // Skip if already processed (circular reference)
        if (processedCodes.has(l1User.referralCode)) {
            console.log(`⚠️  Skipping circular reference at L1: ${l1User.referralCode}`);
            continue;
        }
        processedCodes.add(l1User.referralCode);

        chain.level1.push({
            userID: l1User._id.toString(),
            username: l1User.username || l1User.referralCode,
            referralCode: l1User.referralCode
        });
    }

    // Level 2: Referrals of level 1 users
    for (const l1User of level1Users) {
        if (!processedCodes.has(l1User.referralCode)) continue;

        const level2Users = await userSchema.find(
            { referredBy: l1User.referralCode },
            { _id: 1, username: 1, referralCode: 1 }
        );

        for (const l2User of level2Users) {
            // Skip if already processed (circular reference)
            if (processedCodes.has(l2User.referralCode)) {
                console.log(`⚠️  Skipping circular reference at L2: ${l2User.referralCode}`);
                continue;
            }
            processedCodes.add(l2User.referralCode);

            chain.level2.push({
                userID: l2User._id.toString(),
                username: l2User.username || l2User.referralCode,
                referralCode: l2User.referralCode,
                referredBy: l1User.referralCode
            });

            // Level 3: Referrals of level 2 users
            const level3Users = await userSchema.find(
                { referredBy: l2User.referralCode },
                { _id: 1, username: 1, referralCode: 1 }
            );

            for (const l3User of level3Users) {
                // Skip if already processed (circular reference)
                if (processedCodes.has(l3User.referralCode)) {
                    console.log(`⚠️  Skipping circular reference at L3: ${l3User.referralCode}`);
                    continue;
                }
                processedCodes.add(l3User.referralCode);

                chain.level3.push({
                    userID: l3User._id.toString(),
                    username: l3User.username || l3User.referralCode,
                    referralCode: l3User.referralCode,
                    referredBy: l2User.referralCode
                });

                // Level 4: Referrals of level 3 users
                const level4Users = await userSchema.find(
                    { referredBy: l3User.referralCode },
                    { _id: 1, username: 1, referralCode: 1 }
                );

                for (const l4User of level4Users) {
                    // Skip if already processed (circular reference)
                    if (processedCodes.has(l4User.referralCode)) {
                        console.log(`⚠️  Skipping circular reference at L4: ${l4User.referralCode}`);
                        continue;
                    }
                    processedCodes.add(l4User.referralCode);

                    chain.level4.push({
                        userID: l4User._id.toString(),
                        username: l4User.username || l4User.referralCode,
                        referralCode: l4User.referralCode,
                        referredBy: l3User.referralCode
                    });

                    // Level 5: Referrals of level 4 users
                    const level5Users = await userSchema.find(
                        { referredBy: l4User.referralCode },
                        { _id: 1, username: 1, referralCode: 1 }
                    );

                    for (const l5User of level5Users) {
                        // Skip if already processed (circular reference)
                        if (processedCodes.has(l5User.referralCode)) {
                            console.log(`⚠️  Skipping circular reference at L5: ${l5User.referralCode}`);
                            continue;
                        }
                        processedCodes.add(l5User.referralCode);

                        chain.level5.push({
                            userID: l5User._id.toString(),
                            username: l5User.username || l5User.referralCode,
                            referralCode: l5User.referralCode,
                            referredBy: l4User.referralCode
                        });
                    }
                }
            }
        }
    }

    return chain;
}
