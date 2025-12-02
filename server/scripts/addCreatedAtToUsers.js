/**
 * Migration Script: Add createdAt to existing users
 *
 * This script adds a createdAt timestamp to users that don't have one.
 * For users without createdAt, it sets it to the current date.
 */

import mongoose from 'mongoose';
import { userSchema } from '../models/user.schema.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crypto-app-V1';

async function addCreatedAtToUsers() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find all users without createdAt
        const usersWithoutCreatedAt = await userSchema.find({
            createdAt: { $exists: false }
        });

        console.log(`📊 Found ${usersWithoutCreatedAt.length} users without createdAt`);

        if (usersWithoutCreatedAt.length === 0) {
            console.log('✅ All users already have createdAt timestamps!');
            await mongoose.disconnect();
            return;
        }

        let updatedCount = 0;
        const now = new Date();

        for (const user of usersWithoutCreatedAt) {
            try {
                // Set createdAt to now (or you could use a default date in the past)
                user.createdAt = now;
                user.updatedAt = now;
                await user.save();

                updatedCount++;
                console.log(`✅ Updated user: ${user.username || user._id} (${user._id})`);
            } catch (error) {
                console.error(`❌ Failed to update user ${user._id}:`, error.message);
            }
        }

        console.log('');
        console.log('📊 Migration Summary:');
        console.log(`   Total users without createdAt: ${usersWithoutCreatedAt.length}`);
        console.log(`   Successfully updated: ${updatedCount}`);
        console.log(`   Failed: ${usersWithoutCreatedAt.length - updatedCount}`);
        console.log('');
        console.log('✅ Migration completed!');

        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

// Run the migration
addCreatedAtToUsers();
