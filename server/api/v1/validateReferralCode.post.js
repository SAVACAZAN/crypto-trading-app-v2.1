import { userSchema } from "~/server/models/user.schema";

export default defineEventHandler(async (event) => {
    try {
        const data = await readBody(event);
        const { referralCode, userID } = data;

        if (!referralCode) {
            return {
                valid: false,
                reason: 'Code is required'
            };
        }

        // Validate format (3-20 alphanumeric characters)
        const codeRegex = /^[a-zA-Z0-9]{3,20}$/;
        if (!codeRegex.test(referralCode)) {
            return {
                valid: false,
                reason: 'Invalid format. Code must be 3-20 alphanumeric characters'
            };
        }

        // Check if the referral code exists in database
        const referrerUser = await userSchema.findOne({
            referralCode: referralCode
        });

        if (!referrerUser) {
            return {
                valid: false,
                reason: 'Referral code does not exist'
            };
        }

        // Check if user is trying to refer themselves
        if (userID && referrerUser._id.toString() === userID) {
            return {
                valid: false,
                reason: 'You cannot refer yourself'
            };
        }

        return {
            valid: true,
            referrerUsername: referrerUser.username,
            message: 'Referral code is valid'
        };
    } catch (error) {
        console.error('Error validating referral code:', error);
        return {
            valid: false,
            reason: 'Error checking referral code'
        };
    }
});
