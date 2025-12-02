import { userSchema } from '~/server/models/user.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    console.log('🔑 [ASTERDEX] Received body:', JSON.stringify(body, null, 2));
    const { userID, name, apiKey, secret } = body;

    // Validation
    if (!userID || !name || !apiKey || !secret) {
      console.log('❌ [ASTERDEX] Validation failed:', { userID: !!userID, name: !!name, apiKey: !!apiKey, secret: !!secret });
      return {
        success: false,
        message: 'Missing required fields: userID, name, apiKey, secret'
      };
    }

    // Create new Asterdex key object
    const newKey = {
      name,
      apiKey,
      secret,
      createdAt: new Date()
    };

    console.log('💾 [ASTERDEX] Saving to DB for user:', userID);

    // Update user document - add to specializedPlatforms.asterdex array
    const result = await userSchema.findOneAndUpdate(
      { _id: userID },
      {
        $push: {
          'specializedPlatforms.asterdex': newKey
        }
      },
      {
        new: true,
        upsert: false
      }
    );

    if (!result) {
      console.log('❌ [ASTERDEX] User not found:', userID);
      return {
        success: false,
        message: 'User not found'
      };
    }

    console.log('✅ [ASTERDEX] Successfully saved! Total keys:', result.specializedPlatforms?.asterdex?.length || 0);

    return {
      success: true,
      message: 'Asterdex API key added successfully',
      data: newKey
    };
  } catch (error) {
    console.error('Error adding Asterdex key:', error);
    return {
      success: false,
      message: error.message || 'Failed to add Asterdex key'
    };
  }
});
