import { userSchema } from '~/server/models/user.schema';

// Tier configuration based on referral count
const TIER_CONFIG = {
    Bronze: {
        minReferrals: 1,
        maxReferrals: 10,
        commission: 5,
        monthlyBonus: 10,
        badge: '/Refferalls-images/Bronze.svg',
        benefits: [
            '5% commission from referral trades',
            'Access to basic referral dashboard',
            'Monthly bonus: 10 USDT'
        ]
    },
    Silver: {
        minReferrals: 11,
        maxReferrals: 50,
        commission: 7.5,
        monthlyBonus: 50,
        badge: '/Refferalls-images/Gray.svg',
        benefits: [
            '7.5% commission from referral trades',
            'Priority customer support',
            'Monthly bonus: 50 USDT',
            'Access to Silver Casino games'
        ]
    },
    Gold: {
        minReferrals: 51,
        maxReferrals: 100,
        commission: 10,
        monthlyBonus: 150,
        badge: '/Refferalls-images/Yellow.svg',
        benefits: [
            '10% commission from referral trades',
            'VIP customer support',
            'Monthly bonus: 150 USDT',
            'Exclusive Gold Trading signals',
            'Free Grid Bot subscription (1 month)'
        ]
    },
    Platinum: {
        minReferrals: 101,
        maxReferrals: 500,
        commission: 12.5,
        monthlyBonus: 500,
        badge: '/Refferalls-images/Green.svg',
        benefits: [
            '12.5% commission from referral trades',
            'Dedicated account manager',
            'Monthly bonus: 500 USDT',
            'Platinum Casino access',
            'Free API access (unlimited calls)',
            'Custom trading bot development'
        ]
    },
    Diamond: {
        minReferrals: 501,
        maxReferrals: Infinity,
        commission: 15,
        monthlyBonus: 2000,
        badge: '/Refferalls-images/Blue.svg',
        benefits: [
            '15% commission from referral trades',
            'Profit sharing program (5% platform profits)',
            'Monthly bonus: 2000 USDT',
            'Diamond Casino & VIP events',
            'Personal trading coach',
            'Exclusive airdrops & early access'
        ]
    }
};

// Calculate tier based on referral count
function calculateTier(referralCount) {
    if (referralCount >= 501) return 'Diamond';
    if (referralCount >= 101) return 'Platinum';
    if (referralCount >= 51) return 'Gold';
    if (referralCount >= 11) return 'Silver';
    return 'Bronze';
}

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { userID } = body;

        if (!userID) {
            throw createError({
                statusCode: 400,
                statusMessage: 'User ID is required'
            });
        }

        // Get user
        const user = await userSchema.findById(userID);
        if (!user) {
            throw createError({
                statusCode: 404,
                statusMessage: 'User not found'
            });
        }

        // Count total referrals (users who have this user's referralCode in their referredBy field)
        const totalReferrals = await userSchema.countDocuments({
            referredBy: user.referralCode
        });

        // Calculate new tier
        const newTier = calculateTier(totalReferrals);
        const tierConfig = TIER_CONFIG[newTier];

        // Check if tier has changed
        const currentTier = user.referralTier?.tier || 'Bronze';
        const tierChanged = currentTier !== newTier;

        // Update user's tier
        user.referralTier = {
            tier: newTier,
            commission: tierConfig.commission,
            monthlyBonus: tierConfig.monthlyBonus,
            badge: tierConfig.badge,
            benefits: tierConfig.benefits,
            lastUpdated: new Date()
        };

        await user.save();

        return {
            success: true,
            data: {
                tier: newTier,
                commission: tierConfig.commission,
                monthlyBonus: tierConfig.monthlyBonus,
                badge: tierConfig.badge,
                benefits: tierConfig.benefits,
                totalReferrals,
                tierChanged,
                previousTier: tierChanged ? currentTier : null
            }
        };
    } catch (error) {
        console.error('Error updating user tier:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to update user tier'
        });
    }
});
