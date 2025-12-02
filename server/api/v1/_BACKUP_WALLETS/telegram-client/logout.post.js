import TelegramClientSession from '~/server/models/TelegramClientSession.schema';
import { userSchema } from '~/server/models/user.schema';
import MTProto from '@mtproto/core';

const API_ID = process.env.TELEGRAM_API_ID || 'YOUR_API_ID';
const API_HASH = process.env.TELEGRAM_API_HASH || 'YOUR_API_HASH';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID } = body;

    if (!userID) {
      return {
        success: false,
        message: 'User ID is required'
      };
    }

    console.log(`🚪 Logging out Telegram client for user: ${userID}`);

    // Get session
    const session = await TelegramClientSession.findOne({ userID });

    if (!session) {
      return {
        success: true,
        message: 'No active session found'
      };
    }

    // If authenticated, try to log out from Telegram
    if (session.isAuthenticated) {
      try {
        // Initialize MTProto client with storage options
        const mtproto = new MTProto({
          api_id: parseInt(API_ID),
          api_hash: API_HASH,
          storageOptions: {
            path: `./.telegram-sessions/session-${userID}.json`,
          },
        });

        // Call logout (MTProto will load session from file automatically)
        await mtproto.call('auth.logOut', {});

        console.log(`✅ Successfully logged out from Telegram`);
      } catch (logoutError) {
        console.error('⚠️ Error calling Telegram logout:', logoutError);
        // Continue anyway to clear local session
      }
    }

    // Delete the session file
    const fs = await import('fs');
    const sessionPath = `./.telegram-sessions/session-${userID}.json`;
    try {
      if (fs.existsSync(sessionPath)) {
        fs.unlinkSync(sessionPath);
        console.log('🧹 Deleted session file');
      }
    } catch (err) {
      console.log('⚠️ Could not delete session file:', err.message);
    }

    // Clear session from database
    await TelegramClientSession.findOneAndDelete({ userID });

    // Clear Telegram authentication from user profile (but keep phone number)
    await userSchema.findByIdAndUpdate(
      userID,
      {
        'telegramClient.isAuthenticated': false,
        'telegramClient.userInfo': null
      },
      { new: true }
    );

    console.log(`✅ Session cleared from database and user profile`);

    return {
      success: true,
      message: 'Logged out successfully'
    };

  } catch (error) {
    console.error('❌ Error during logout:', error);
    return {
      success: false,
      message: error.message || 'Failed to logout'
    };
  }
});
