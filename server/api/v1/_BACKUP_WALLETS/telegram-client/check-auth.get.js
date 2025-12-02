import TelegramClientSession from '~/server/models/TelegramClientSession.schema';
import MTProto from '@mtproto/core';

const API_ID = process.env.TELEGRAM_API_ID || 'YOUR_API_ID';
const API_HASH = process.env.TELEGRAM_API_HASH || 'YOUR_API_HASH';

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

    console.log(`🔍 Checking QR auth status for user: ${userID}`);

    // Get session from database
    const session = await TelegramClientSession.findOne({ userID });

    if (!session || !session.qrLoginToken) {
      console.log('⚠️ No QR login session found in database');
      return {
        success: false,
        isAuthenticated: false,
        message: 'No QR login session found'
      };
    }

    // Check if QR code expired based on timestamp
    const now = new Date();
    const expiresAt = new Date(session.qrExpiresAt);

    if (session.qrExpiresAt && now > expiresAt) {
      console.log(`⏱️ QR code has expired (now: ${now.toISOString()}, expires: ${expiresAt.toISOString()})`);
      return {
        success: false,
        isAuthenticated: false,
        expired: true,
        message: 'QR code has expired. Please generate a new one.'
      };
    }

    // If already authenticated, return user info
    if (session.isAuthenticated) {
      console.log('✅ User already authenticated (from database)');
      return {
        success: true,
        isAuthenticated: true,
        userInfo: session.userInfo
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

    try {
      // Check QR login status using the raw token
      const tokenBuffer = Buffer.from(session.qrLoginTokenRaw || session.qrLoginToken, 'base64');

      const result = await mtproto.call('auth.importLoginToken', {
        token: tokenBuffer,
      });

      // If result contains authorization, user has scanned QR
      if (result._ === 'auth.authorization') {
        const user = result.user;

        // Save session info
        // Note: MTProto automatically saves the session to file
        session.isAuthenticated = true;
        session.userInfo = {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name || '',
          username: user.username || '',
          phone: user.phone || '',
          photoUrl: '' // Will be populated later if needed
        };
        session.lastActive = new Date();
        session.qrLoginToken = null; // Clear QR token after successful auth
        session.qrLoginTokenRaw = null;

        await session.save();

        console.log(`✅ QR authentication successful for user: ${user.first_name}`);

        return {
          success: true,
          isAuthenticated: true,
          userInfo: session.userInfo
        };
      }

      // Still waiting for user to scan
      console.log('⏳ Still waiting for QR scan...');
      return {
        success: true,
        isAuthenticated: false,
        waiting: true,
        message: 'Waiting for QR code to be scanned'
      };

    } catch (authError) {
      // If token is still valid but not yet scanned
      if (authError.error_message && authError.error_message.includes('SESSION_PASSWORD_NEEDED')) {
        console.log('🔐 2FA detected');
        return {
          success: false,
          isAuthenticated: false,
          message: '2FA is enabled. Please use phone login instead.'
        };
      }

      // Token expired or not yet scanned
      if (authError.error_message && authError.error_message.includes('AUTH_TOKEN_EXPIRED')) {
        console.log('⏱️ QR token has expired');
        return {
          success: true,
          isAuthenticated: false,
          expired: true,
          message: 'QR code has expired. Please generate a new one.'
        };
      }

      console.log(`⏳ QR not scanned yet or error:`, authError.error_message || authError.message);

      return {
        success: true,
        isAuthenticated: false,
        waiting: true,
        message: 'Waiting for QR code to be scanned'
      };
    }

  } catch (error) {
    console.error('❌ Error checking QR auth:', error);
    return {
      success: false,
      isAuthenticated: false,
      message: error.message || 'Failed to check authentication status'
    };
  }
});
