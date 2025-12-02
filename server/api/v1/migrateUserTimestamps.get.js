import { userSchema } from "~/server/models/user.schema";

/**
 * Migration endpoint: Add createdAt to existing users
 *
 * Usage: GET /api/v1/migrateUserTimestamps
 */
export default defineEventHandler(async (event) => {
    try {
        console.log('🔄 Starting user timestamp migration...');

        // Find all users without createdAt
        const usersWithoutCreatedAt = await userSchema.find({
            createdAt: { $exists: false }
        });

        console.log(`📊 Found ${usersWithoutCreatedAt.length} users without createdAt`);

        if (usersWithoutCreatedAt.length === 0) {
            return {
                success: true,
                message: 'All users already have createdAt timestamps!',
                data: {
                    total: 0,
                    updated: 0,
                    failed: 0
                }
            };
        }

        let updatedCount = 0;
        let failedCount = 0;
        const now = new Date();
        const updatedUsers = [];

        for (const user of usersWithoutCreatedAt) {
            try {
                // Set createdAt and updatedAt to now
                user.createdAt = now;
                user.updatedAt = now;
                await user.save();

                updatedCount++;
                updatedUsers.push({
                    username: user.username || 'Unknown',
                    userId: user._id.toString(),
                    referralCode: user.referralCode
                });

                console.log(`✅ Updated user: ${user.username || user._id} (${user._id})`);
            } catch (error) {
                failedCount++;
                console.error(`❌ Failed to update user ${user._id}:`, error.message);
            }
        }

        console.log('');
        console.log('📊 Migration Summary:');
        console.log(`   Total users without createdAt: ${usersWithoutCreatedAt.length}`);
        console.log(`   Successfully updated: ${updatedCount}`);
        console.log(`   Failed: ${failedCount}`);
        console.log('');

        return {
            success: true,
            message: 'Migration completed successfully!',
            data: {
                total: usersWithoutCreatedAt.length,
                updated: updatedCount,
                failed: failedCount,
                updatedUsers: updatedUsers
            }
        };
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to migrate user timestamps',
            data: error.message
        });
    }
});
