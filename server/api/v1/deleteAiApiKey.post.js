import { userSchema as User } from '~/server/models/user.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID, providerId } = body;

    if (!userID || !providerId) {
      return {
        success: false,
        error: 'UserID and providerId are required'
      };
    }

    const user = await User.findById(userID);

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Remove the API key for the specific provider
    if (user.aiApiKeys && user.aiApiKeys[providerId]) {
      delete user.aiApiKeys[providerId];
      user.markModified('aiApiKeys');
      await user.save();
    }

    console.log(`✅ AI API key deleted for provider "${providerId}" - user ${userID}`);

    return {
      success: true,
      message: 'AI API key deleted successfully'
    };
  } catch (error) {
    console.error('❌ Delete AI API Key Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete AI API key'
    };
  }
});
