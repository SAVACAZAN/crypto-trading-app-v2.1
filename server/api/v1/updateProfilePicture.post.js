import { userSchema } from '~/server/models/user.schema';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { userID, profilePicture } = body;

        if (!userID) {
            throw createError({
                statusCode: 400,
                statusMessage: 'User ID is required'
            });
        }

        if (!profilePicture) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Profile picture data is required'
            });
        }

        // Find user
        const user = await userSchema.findById(userID);
        if (!user) {
            throw createError({
                statusCode: 404,
                statusMessage: 'User not found'
            });
        }

        // Update profile picture
        user.profilePicture = profilePicture;
        await user.save();

        return {
            success: true,
            message: 'Profile picture updated successfully',
            data: {
                profilePicture: user.profilePicture
            }
        };
    } catch (error) {
        console.error('Error updating profile picture:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to update profile picture'
        });
    }
});
