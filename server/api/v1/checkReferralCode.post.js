import { userSchema } from "~/server/models/user.schema";

export default defineEventHandler(async (event) => {
    try {
        const data = await readBody(event);
        const { referralCode, userID } = data;

        if (!referralCode) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Referral code is required'
            });
        }

        // Check if the referral code is already used by another user
        const existingUser = await userSchema.findOne({
            referralCode: referralCode,
            _id: { $ne: userID } // Exclude current user
        });

        return {
            unique: !existingUser,
            message: existingUser ? 'Referral code already in use' : 'Referral code is available'
        };
    } catch (error) {
        console.error('Error checking referral code:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to check referral code'
        });
    }
});
