import { userSchema } from '~/server/models/user.schema';
import TelegramClientSession from '~/server/models/TelegramClientSession.schema';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { userID } = query;

    if (!userID) {
      return {
        success: false,
        message: 'User ID is required'
      };
    }

    console.log(`📥 Loading Telegram config for user: ${userID}`);

    // Get user profile with Telegram config
    const user = await userSchema.findById(userID);

    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Check if user has saved Telegram configuration
    if (!user.telegramClient || !user.telegramClient.phoneNumber) {
      console.log(`⚠️ No saved Telegram config found for user: ${userID}`);
      return {
        success: true,
        hasConfig: false,
        telegramClient: null
      };
    }

    // Check if there's an active session
    const session = await TelegramClientSession.findOne({ userID });

    const config = {
      phoneNumber: user.telegramClient.phoneNumber,
      isAuthenticated: session?.isAuthenticated || false,
      userInfo: session?.userInfo || user.telegramClient.userInfo || null,
      lastConnected: user.telegramClient.lastConnected
    };

    console.log(`✅ Loaded Telegram config for user: ${userID}`, {
      phoneNumber: config.phoneNumber,
      isAuthenticated: config.isAuthenticated,
      hasSession: !!session
    });

    return {
      success: true,
      hasConfig: true,
      telegramClient: config
    };

  } catch (error) {
    console.error('❌ Error loading Telegram config:', error);
    return {
      success: false,
      message: error.message || 'Failed to load Telegram configuration'
    };
  }
});
