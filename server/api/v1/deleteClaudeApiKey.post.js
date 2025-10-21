import { userSchema as User } from '~/server/models/user.schema';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID } = body;

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

    // Remove the API key
    user.claudeApiKey = undefined;
    await user.save();

    console.log(`✅ Claude API key deleted for user ${userID}`);

    return {
      success: true,
      message: 'Claude API key deleted successfully'
    };
  } catch (error) {
    console.error('❌ Delete Claude API Key Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete Claude API key'
    };
  }
});
