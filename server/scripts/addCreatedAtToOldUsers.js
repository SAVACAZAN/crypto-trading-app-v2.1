/**
 * Migration Script: Add createdAt to Old Users
 *
 * This script adds createdAt timestamp to users who don't have it.
 * For old users, we'll set a default date or use their _id ObjectID timestamp.
 */

import mongoose from 'mongoose';
import { userSchema } from '../models/user.schema.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crypto-app-V1';

async function addCreatedAtToOldUsers() {
    console.log('🚀 Starting createdAt Migration...\n');

    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find users without createdAt
        const usersWithoutDate = await userSchema.find({
            createdAt: { $exists: false }
        });

        console.log(`📊 Found ${usersWithoutDate.length} users without createdAt\n`);

        if (usersWithoutDate.length === 0) {
            console.log('✨ No migration needed - all users have createdAt!\n');
            await mongoose.disconnect();
            return;
        }

        let successCount = 0;
        let failCount = 0;

        // Process each user
        for (const user of usersWithoutDate) {
            try {
                // Extract timestamp from MongoDB ObjectID
                // ObjectID contains timestamp in first 4 bytes
                const objectIdTimestamp = user._id.getTimestamp();

                // Update user with createdAt
                await userSchema.findByIdAndUpdate(user._id, {
                    createdAt: objectIdTimestamp,
                    updatedAt: new Date() // Set updatedAt to now
                });

                console.log(`✅ ${user.username} - createdAt: ${objectIdTimestamp.toLocaleDateString()}`);
                successCount++;
            } catch (error) {
                console.error(`❌ Error processing user ${user.username}:`, error.message);
                failCount++;
            }
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📈 MIGRATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total users processed:     ${usersWithoutDate.length}`);
        console.log(`✅ Successfully updated:    ${successCount}`);
        console.log(`❌ Failed updates:          ${failCount}`);
        console.log('='.repeat(60) + '\n');

        console.log('🎉 Migration completed successfully!\n');

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB\n');

    } catch (error) {
        console.error('💥 Migration failed:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

// Run the migration
addCreatedAtToOldUsers();
