import { userSchema } from "~/server/models/user.schema";

export default defineEventHandler(async (event) => {
    try {
        const data = await readBody(event);
        const { userID, newReferralCode } = data;

        if (!userID || !newReferralCode) {
            throw createError({
                statusCode: 400,
                statusMessage: 'User ID and new referral code are required'
            });
        }

        // Validate format (3-20 alphanumeric characters)
        const codeRegex = /^[a-zA-Z0-9]{3,20}$/;
        if (!codeRegex.test(newReferralCode)) {
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

        // Check if the code was already edited once
        if (user.codeEditedOnce) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Referral code can only be edited once'
            });
        }

        // Check if the new code is already in use
        const existingUser = await userSchema.findOne({
            referralCode: newReferralCode,
            _id: { $ne: userID }
        });

        if (existingUser) {
            throw createError({
                statusCode: 409,
                statusMessage: 'Referral code already in use'
            });
        }

        // Update the user's referral code and mark as edited
        await userSchema.findByIdAndUpdate(userID, {
            referralCode: newReferralCode,
            codeEditedOnce: true
        });

        return {
            success: true,
            message: 'Referral code updated successfully',
            newReferralCode: newReferralCode
        };
    } catch (error) {
        console.error('Error updating referral code:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to update referral code'
        });
    }
});
