import { userSchema } from "~/server/models/user.schema";

/**
 * Calculate and return the full 5-tier referral tree for a user
 *
 * Usage: GET /api/v1/calculateReferralTree?userID=...
 *
 * Returns:
 * - Full referral tree (5 levels deep)
 * - Points breakdown by tier
 * - Total accumulated points
 */
export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const { userID } = query;

        console.log('🔍 calculateReferralTree API called with userID:', userID);

        if (!userID) {
            console.log('❌ No userID provided');
            throw createError({
                statusCode: 400,
                statusMessage: 'User ID is required'
            });
        }

        // Find the user
        console.log('📡 Finding user in database...');
        const user = await userSchema.findById(userID);
        if (!user) {
            console.log('❌ User not found for ID:', userID);
            throw createError({
                statusCode: 404,
                statusMessage: 'User not found'
            });
        }

        console.log(`✅ User found: ${user.username || user.referralCode}`);
        console.log(`\n🌳 Building referral tree for ${user.username || user.referralCode}...`);

        // Build the 5-tier referral tree
        const referralTree = await buildReferralTree(user.referralCode, 5);

        // Calculate total points from all tiers
        const pointsBreakdown = calculatePointsBreakdown(referralTree);

        return {
            success: true,
            data: {
                userID: user._id,
                username: user.username,
                referralCode: user.referralCode,
                referralTree: referralTree,
                pointsBreakdown: pointsBreakdown,
                totalPoints: pointsBreakdown.grandTotal,
                lastCalculated: new Date()
            }
        };
    } catch (error) {
        console.error('❌ CATCH BLOCK EXECUTED - Error calculating referral tree:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);

        // Re-throw the error with proper status code
        const statusCode = error.statusCode || 500;
        const statusMessage = error.statusMessage || error.message || 'Failed to calculate referral tree';

        console.error(`❌ Throwing error with status ${statusCode}: ${statusMessage}`);

        throw createError({
            statusCode: statusCode,
            statusMessage: statusMessage
        });
    }
});

/**
 * Recursively build referral tree up to maxDepth levels
 * WITH CIRCULAR REFERENCE PROTECTION
 */
async function buildReferralTree(referralCode, maxDepth = 5, currentDepth = 1, processedCodes = new Set()) {
    if (currentDepth > maxDepth) {
        return [];
    }

    // Add current code to processed set
    processedCodes.add(referralCode);

    // Find all users directly referred by this referralCode
    const directReferrals = await userSchema.find(
        { referredBy: referralCode },
        {
            _id: 1,
            username: 1,
            referralCode: 1,
            createdAt: 1,
            activityPoints: 1, // OLD structure support
            'referrals.activityPoints': 1, // NEW structure - specific field to avoid collision
            profilePicture: 1
        }
    ).sort({ createdAt: -1 });

    console.log(`  ${'  '.repeat(currentDepth - 1)}Level ${currentDepth}: Found ${directReferrals.length} referrals for ${referralCode}`);

    // Build tree structure with recursive children
    const tree = [];
    for (const referral of directReferrals) {
        // Skip if already processed (circular reference)
        if (processedCodes.has(referral.referralCode)) {
            console.log(`⚠️  Skipping circular reference: ${referral.referralCode} at level ${currentDepth}`);
            continue;
        }

        // Support both OLD and NEW structure for activityPoints
        const activityPoints = referral.referrals?.activityPoints || referral.activityPoints || 0;

        const node = {
            userID: referral._id,
            username: referral.username || referral.referralCode || 'Anonymous',
            referralCode: referral.referralCode,
            profilePicture: referral.profilePicture || null,
            joinedAt: referral.createdAt,
            activityPoints: activityPoints,
            level: currentDepth,
            children: []
        };

        // Recursively get children for this referral
        if (currentDepth < maxDepth) {
            node.children = await buildReferralTree(referral.referralCode, maxDepth, currentDepth + 1, processedCodes);
        }

        tree.push(node);
    }

    return tree;
}

/**
 * Calculate points breakdown from the referral tree
 *
 * Tier percentages:
 * - Level 1: 25% of activity points
 * - Level 2: 15% of activity points
 * - Level 3: 10% of activity points
 * - Level 4: 5% of activity points
 * - Level 5: 2% of activity points
 */
function calculatePointsBreakdown(tree) {
    const tierPercentages = {
        1: 0.25, // 25%
        2: 0.15, // 15%
        3: 0.10, // 10%
        4: 0.05, // 5%
        5: 0.02  // 2%
    };

    const breakdown = {
        level1: { users: 0, points: 0 },
        level2: { users: 0, points: 0 },
        level3: { users: 0, points: 0 },
        level4: { users: 0, points: 0 },
        level5: { users: 0, points: 0 },
        grandTotal: 0
    };

    // Track processed users to prevent duplicates
    const processedUsers = new Set();

    // Recursive function to accumulate points from each level
    function accumulatePoints(nodes) {
        if (!nodes || nodes.length === 0) return;

        for (const node of nodes) {
            // Use node.level which is set correctly by buildReferralTree
            const level = node.level;

            // Convert userID to string for Set comparison
            const userIDStr = node.userID?.toString() || node.userID;

            // Skip if we've already processed this user (prevent duplicates)
            if (processedUsers.has(userIDStr)) {
                console.log(`⚠️  Skipping duplicate user: ${node.username} at level ${level} (already counted)`);
                continue;
            }

            // Mark user as processed
            processedUsers.add(userIDStr);

            const activityPoints = node.activityPoints || 0;
            const earnedPoints = activityPoints * tierPercentages[level];

            breakdown[`level${level}`].users++;
            breakdown[`level${level}`].points += earnedPoints;
            breakdown.grandTotal += earnedPoints;

            console.log(`  ✓ Level ${level}: ${node.username} - ${activityPoints} activity pts → ${earnedPoints.toFixed(2)} earned pts (${tierPercentages[level] * 100}%)`);

            // Recursively process children
            if (node.children && node.children.length > 0) {
                accumulatePoints(node.children);
            }
        }
    }

    // Start accumulation from root level
    accumulatePoints(tree);

    console.log(`\n📊 Points Breakdown Summary:`);
    console.log(`   Level 1: ${breakdown.level1.users} users, ${breakdown.level1.points.toFixed(2)} pts`);
    console.log(`   Level 2: ${breakdown.level2.users} users, ${breakdown.level2.points.toFixed(2)} pts`);
    console.log(`   Level 3: ${breakdown.level3.users} users, ${breakdown.level3.points.toFixed(2)} pts`);
    console.log(`   Level 4: ${breakdown.level4.users} users, ${breakdown.level4.points.toFixed(2)} pts`);
    console.log(`   Level 5: ${breakdown.level5.users} users, ${breakdown.level5.points.toFixed(2)} pts`);
    console.log(`   Grand Total: ${breakdown.grandTotal.toFixed(2)} pts\n`);

    // Round all points to 2 decimals
    breakdown.level1.points = Math.round(breakdown.level1.points * 100) / 100;
    breakdown.level2.points = Math.round(breakdown.level2.points * 100) / 100;
    breakdown.level3.points = Math.round(breakdown.level3.points * 100) / 100;
    breakdown.level4.points = Math.round(breakdown.level4.points * 100) / 100;
    breakdown.level5.points = Math.round(breakdown.level5.points * 100) / 100;
    breakdown.grandTotal = Math.round(breakdown.grandTotal * 100) / 100;

    return breakdown;
}
