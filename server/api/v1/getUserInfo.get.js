import { userSchema } from "~/server/models/user.schema";

export default defineEventHandler(async (event) => {
    try {
        // Get userID from query parameters
        const query = getQuery(event);
        const { userID } = query;

        if (!userID) {
            throw createError({
                statusCode: 400,
                statusMessage: 'User ID is required'
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

        // Count how many users this user has referred
        // NEW SYSTEM: Search only by referral code
        const referralCount = await userSchema.countDocuments({
            referredBy: user.referralCode
        });

        // Get list of referred users (new system - referral codes only)
        const referredUsers = await userSchema.find(
            { referredBy: user.referralCode },
            { username: 1, referralCode: 1, _id: 1, createdAt: 1 }
        ).sort({ createdAt: -1 });

        return {
            success: true,
            data: {
                userID: user._id,
                username: user.username,
                profilePicture: user.profilePicture || null,
                referralCode: user.referralCode,
                referredBy: user.referredBy || null,
                codeEditedOnce: user.codeEditedOnce || false,
                referredByEdited: user.referredByEdited || false,
                totalReferrals: referralCount,
                // Referral Tier Information
                referralTier: user.referralTier || {
                    tier: 'Bronze',
                    commission: 5,
                    monthlyBonus: 10,
                    badge: '/Refferalls-images/Bronze.svg',
                    benefits: [
                        '5% commission from referral trades',
                        'Access to basic referral dashboard',
                        'Monthly bonus: 10 USDT'
                    ]
                },
                referredUsers: referredUsers.map(u => ({
                    userID: u._id,
                    // Use referralCode as fallback if username is missing
                    username: u.username || u.referralCode || 'Anonymous',
                    joinedAt: u.createdAt
                })),
                // Referral Earnings - Support both OLD and NEW structure
                referralEarnings: user.referralBonus || user.referralEarnings || {
                    totalEarnings: 0,
                    earningsPerReferral: 100,
                    earningsHistory: [],
                    lastUpdated: null
                },
                // Registration Bonus - Support both OLD and NEW structure
                registeredBonus: user.registerWelcomeBonus || user.registeredBonus || {
                    amount: 150,
                    claimed: true,
                    claimedAt: user.createdAt || null
                },
                // Activity Points - Support both OLD and NEW structure
                activityPoints: user.referrals?.activityPoints || user.activityPoints || 0
            }
        };
    } catch (error) {
        console.error('Error fetching user info:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to fetch user info'
        });
    }
});
