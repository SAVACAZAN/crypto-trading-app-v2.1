import { userSchema } from '~/server/models/user.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    console.log('🎯 [OMNI] Received body:', JSON.stringify(body, null, 2));
    const { userID, name, apiKey, passphrase, secret } = body;

    // Validation
    if (!userID || !name || !apiKey || !passphrase || !secret) {
      console.log('❌ [OMNI] Validation failed:', { userID: !!userID, name: !!name, apiKey: !!apiKey, passphrase: !!passphrase, secret: !!secret });
      return {
        success: false,
        message: 'Missing required fields: userID, name, apiKey, passphrase, secret'
      };
    }

    // Create new Omni key object
    const newKey = {
      name,
      apiKey,
      passphrase,
      secret,
      createdAt: new Date()
    };

    console.log('💾 [OMNI] Saving to DB for user:', userID);

    // Update user document - add to specializedPlatforms.omni array
    const result = await userSchema.findOneAndUpdate(
      { _id: userID },
      {
        $push: {
          'specializedPlatforms.omni': newKey
        }
      },
      {
        new: true,
        upsert: false
      }
    );

    if (!result) {
      console.log('❌ [OMNI] User not found:', userID);
      return {
        success: false,
        message: 'User not found'
      };
    }

    console.log('✅ [OMNI] Successfully saved! Total keys:', result.specializedPlatforms?.omni?.length || 0);

    return {
      success: true,
      message: 'Omni API key added successfully',
      data: newKey
    };
  } catch (error) {
    console.error('Error adding Omni key:', error);
    return {
      success: false,
      message: error.message || 'Failed to add Omni key'
    };
  }
});
