import { userSchema as User } from '~/server/models/user.schema';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID, claudeApiKey } = body;

    if (!userID || !claudeApiKey) {
      return {
        success: false,
        error: 'UserID and Claude API key are required'
      };
    }

    // Validate API key format (basic validation)
    if (!claudeApiKey.startsWith('sk-ant-')) {
      return {
        success: false,
        error: 'Invalid Claude API key format. Key should start with "sk-ant-"'
      };
    }

    const user = await User.findById(userID);

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Save the API key (in production, consider encrypting it)
    user.claudeApiKey = claudeApiKey;
    await user.save();

    console.log(`✅ Claude API key saved for user ${userID}`);

    return {
      success: true,
      message: 'Claude API key saved successfully'
    };
  } catch (error) {
    console.error('❌ Save Claude API Key Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to save Claude API key'
    };
  }
});
