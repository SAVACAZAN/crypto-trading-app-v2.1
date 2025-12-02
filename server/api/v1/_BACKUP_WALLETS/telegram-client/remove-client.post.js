import TelegramClientSession from '~/server/models/TelegramClientSession.schema';
import { userSchema } from '~/server/models/user.schema';
import MTProto from '@mtproto/core';

const API_ID = process.env.TELEGRAM_API_ID || 'YOUR_API_ID';
const API_HASH = process.env.TELEGRAM_API_HASH || 'YOUR_API_HASH';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID, clientId } = body;

    if (!userID || !clientId) {
      return {
        success: false,
        message: 'User ID and client ID are required'
      };
    }

    console.log(`🗑️ Removing Telegram client ${clientId} for user: ${userID}`);

    // Find the session
    const session = await TelegramClientSession.findOne({
      _id: clientId,
      userID: userID
    });

    if (!session) {
      return {
        success: false,
        message: 'Client session not found'
      };
    }

    // If authenticated, try to log out from Telegram
    if (session.isAuthenticated) {
      try {
        const mtproto = new MTProto({
          api_id: parseInt(API_ID),
          api_hash: API_HASH,
          storageOptions: {
            path: `./.telegram-sessions/session-${userID}.json`,
          },
        });

        await mtproto.call('auth.logOut', {});
        console.log(`✅ Logged out from Telegram`);
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

    // Delete session from database
    await TelegramClientSession.findOneAndDelete({
      _id: clientId,
      userID: userID
    });

    // Clear from user profile
    await userSchema.findByIdAndUpdate(
      userID,
      {
        'telegramClient.isAuthenticated': false,
        'telegramClient.userInfo': null
      },
      { new: true }
    );

    console.log(`✅ Client removed successfully`);

    return {
      success: true,
      message: 'Client removed successfully'
    };

  } catch (error) {
    console.error('❌ Error removing client:', error);
    return {
      success: false,
      message: error.message || 'Failed to remove client'
    };
  }
});
