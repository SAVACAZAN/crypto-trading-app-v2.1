import TelegramClientSession from '~/server/models/TelegramClientSession.schema';
import { userSchema } from '~/server/models/user.schema';
import MTProto from '@mtproto/core';

const API_ID = process.env.TELEGRAM_API_ID || 'YOUR_API_ID';
const API_HASH = process.env.TELEGRAM_API_HASH || 'YOUR_API_HASH';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID, phoneNumber, phoneCodeHash, code, loginType } = body;

    if (!userID || !phoneNumber || !phoneCodeHash || !code) {
      return {
        success: false,
        message: 'User ID, phone number, phone code hash, and verification code are required'
      };
    }

    console.log(`🔐 Verifying code for phone: ${phoneNumber}`);

    // Check if API credentials are configured
    if (API_ID === 'YOUR_API_ID' || API_HASH === 'YOUR_API_HASH') {
      return {
        success: false,
        message: 'Telegram API credentials not configured'
      };
    }

    // Initialize MTProto client with storage options
    const mtproto = new MTProto({
      api_id: parseInt(API_ID),
      api_hash: API_HASH,
      storageOptions: {
        path: `./.telegram-sessions/session-${userID}.json`,
      },
    });

    // Verify the code and sign in
    const result = await mtproto.call('auth.signIn', {
      phone_number: phoneNumber,
      phone_code_hash: phoneCodeHash,
      phone_code: code,
    });

    if (result._ === 'auth.authorization') {
      const user = result.user;

      console.log(`✅ Phone authentication successful for: ${user.first_name}`);

      const userInfo = {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name || '',
        username: user.username || '',
        phone: user.phone || phoneNumber,
        photoUrl: ''
      };

      // Get existing session to preserve loginType
      const existingSession = await TelegramClientSession.findOne({ userID });
      const finalLoginType = loginType || existingSession?.loginType || 'sms';

      // Save authenticated session
      // Note: MTProto automatically saves the session to file at .telegram-sessions/session-${userID}.json
      // We don't need to manually save sessionString anymore
      const session = await TelegramClientSession.findOneAndUpdate(
        { userID },
        {
          userID,
          phoneNumber,
          isAuthenticated: true,
          userInfo,
          loginType: finalLoginType, // Preserve login type from session or use provided
          phoneCodeHash: null, // Clear the hash after successful auth
          lastActive: new Date()
        },
        { upsert: true, new: true }
      );

      // Save Telegram phone number and authentication status to User profile
      await userSchema.findByIdAndUpdate(
        userID,
        {
          'telegramClient.phoneNumber': phoneNumber,
          'telegramClient.isAuthenticated': true,
          'telegramClient.userInfo': userInfo,
          'telegramClient.lastConnected': new Date()
        },
        { new: true }
      );

      console.log(`💾 Saved Telegram authentication to user profile: ${userID}`);

      return {
        success: true,
        userInfo: session.userInfo,
        message: 'Authentication successful'
      };
    }

    return {
      success: false,
      message: 'Unexpected response from Telegram'
    };

  } catch (error) {
    console.error('❌ Error verifying code:', error);

    let errorMessage = 'Failed to verify code';

    if (error.error_message) {
      if (error.error_message.includes('PHONE_CODE_INVALID')) {
        errorMessage = 'Invalid verification code. Please try again.';
      } else if (error.error_message.includes('PHONE_CODE_EXPIRED')) {
        errorMessage = 'Verification code has expired. Please request a new one.';
      } else if (error.error_message.includes('SESSION_PASSWORD_NEEDED')) {
        // 2FA is enabled - would need additional password step
        errorMessage = 'Two-factor authentication is enabled. This feature will be added soon.';

        // TODO: Implement 2FA password verification
        // Would need to call auth.checkPassword with password hash
      } else if (error.error_message.includes('FLOOD_WAIT')) {
        const waitTime = error.error_message.match(/\d+/);
        errorMessage = `Too many attempts. Please wait ${waitTime ? waitTime[0] : 'a few'} seconds`;
      } else {
        errorMessage = error.error_message;
      }
    }

    return {
      success: false,
      message: errorMessage
    };
  }
});
