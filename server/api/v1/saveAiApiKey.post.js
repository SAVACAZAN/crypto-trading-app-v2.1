import { userSchema as User } from '~/server/models/user.schema';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID, providerId, apiKey } = body;

    if (!userID || !providerId || !apiKey) {
      return {
        success: false,
        error: 'UserID, providerId, and API key are required'
      };
    }

    const user = await User.findById(userID);

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Initialize aiApiKeys object if it doesn't exist
    if (!user.aiApiKeys) {
      user.aiApiKeys = {};
    }

    // Save the API key for the specific provider
    user.aiApiKeys[providerId] = apiKey;

    // Mark the field as modified (required for nested objects in Mongoose)
    user.markModified('aiApiKeys');

    await user.save();

    console.log(`✅ AI API key saved for provider "${providerId}" - user ${userID}`);

    return {
      success: true,
      message: 'AI API key saved successfully'
    };
  } catch (error) {
    console.error('❌ Save AI API Key Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to save AI API key'
    };
  }
});
