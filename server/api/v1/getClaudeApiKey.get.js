import { userSchema as User } from '~/server/models/user.schema';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { userID } = query;

    if (!userID) {
      return {
        success: false,
        error: 'UserID is required'
      };
    }

    const user = await User.findById(userID);

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    return {
      success: true,
      data: {
        claudeApiKey: user.claudeApiKey || null
      }
    };
  } catch (error) {
    console.error('❌ Get Claude API Key Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get Claude API key'
    };
  }
});
