import TelegramClientSession from '~/server/models/TelegramClientSession.schema';
import MTProto from '@mtproto/core';

const API_ID = process.env.TELEGRAM_API_ID || 'YOUR_API_ID';
const API_HASH = process.env.TELEGRAM_API_HASH || 'YOUR_API_HASH';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID, phoneNumber, loginType = 'sms' } = body;

    console.log('📱 [SEND-CODE] Request received:', { userID, phoneNumber, loginType });

    if (!userID || !phoneNumber) {
      console.log('❌ [SEND-CODE] Missing required fields');
      return {
        success: false,
        message: 'User ID and phone number are required'
      };
    }

    console.log(`📞 [SEND-CODE] Sending verification code to: ${phoneNumber}`);

    // Check if API credentials are configured
    if (API_ID === 'YOUR_API_ID' || API_HASH === 'YOUR_API_HASH') {
      console.log('❌ [SEND-CODE] API credentials not configured');
      return {
        success: false,
        message: 'Telegram API credentials not configured. Please set TELEGRAM_API_ID and TELEGRAM_API_HASH in .env file.'
      };
    }

    console.log('🔧 [SEND-CODE] API credentials found, initializing MTProto...');
    console.log('🔧 [SEND-CODE] API_ID:', API_ID);

    // Clear any existing session to avoid AUTH_RESTART errors
    const existingSession = await TelegramClientSession.findOne({ userID });
    if (existingSession && existingSession.isAuthenticated) {
      console.log('🧹 [SEND-CODE] Clearing old session to avoid AUTH_RESTART...');
      await TelegramClientSession.findOneAndUpdate(
        { userID },
        {
          isAuthenticated: false,
          qrLoginToken: null,
          qrLoginTokenRaw: null
        }
      );

      // Also delete the session file if it exists
      const fs = await import('fs');
      const sessionPath = `./.telegram-sessions/session-${userID}.json`;
      try {
        if (fs.existsSync(sessionPath)) {
          fs.unlinkSync(sessionPath);
          console.log('🧹 [SEND-CODE] Deleted old session file');
        }
      } catch (err) {
        console.log('⚠️ [SEND-CODE] Could not delete session file:', err.message);
      }
    }

    // Initialize MTProto client with storage options
    const mtproto = new MTProto({
      api_id: parseInt(API_ID),
      api_hash: API_HASH,
      storageOptions: {
        path: `./.telegram-sessions/session-${userID}.json`,
      },
    });

    console.log('📡 [SEND-CODE] Calling auth.sendCode with phone:', phoneNumber);

    let result;
    try {
      // Send authentication code to phone number
      // Request SMS delivery with allow_app_hash disabled to force SMS
      result = await mtproto.call('auth.sendCode', {
        phone_number: phoneNumber,
        settings: {
          _: 'codeSettings',
          allow_flashcall: false,
          current_number: false,
          allow_app_hash: false, // Disable app hash to prevent in-app delivery
        },
      });
    } catch (sendError) {
      // Handle AUTH_RESTART by clearing storage and retrying
      if (sendError.error_message && sendError.error_message.includes('AUTH_RESTART')) {
        console.log('🔄 [SEND-CODE] AUTH_RESTART error, clearing storage and retrying...');

        // Clear MTProto storage
        mtproto.storage = {};

        // Retry sending code
        result = await mtproto.call('auth.sendCode', {
          phone_number: phoneNumber,
          settings: {
            _: 'codeSettings',
            allow_flashcall: false,
            current_number: false,
            allow_app_hash: false,
          },
        });
      }
      // Handle datacenter migration
      else if (sendError.error_message && sendError.error_message.includes('PHONE_MIGRATE_')) {
        const dcId = parseInt(sendError.error_message.match(/\d+/)[0]);
        console.log(`🔄 [SEND-CODE] Phone registered on DC${dcId}, migrating...`);

        // Switch to the correct datacenter
        mtproto.setDefaultDc(dcId);

        // Retry sending code
        result = await mtproto.call('auth.sendCode', {
          phone_number: phoneNumber,
          settings: {
            _: 'codeSettings',
            allow_flashcall: false,
            current_number: false,
            allow_app_hash: false,
          },
        });
      } else {
        throw sendError;
      }
    }

    console.log(`✅ [SEND-CODE] Verification code sent successfully!`);
    console.log('📋 [SEND-CODE] Result:', JSON.stringify(result, null, 2));

    // Save session with phone code hash
    await TelegramClientSession.findOneAndUpdate(
      { userID },
      {
        userID,
        phoneNumber,
        phoneCodeHash: result.phone_code_hash,
        isAuthenticated: false,
        loginType: loginType, // Save login type (sms or hacked)
        lastActive: new Date()
      },
      { upsert: true, new: true }
    );

    return {
      success: true,
      phoneCodeHash: result.phone_code_hash,
      message: `Verification code sent to ${phoneNumber}`
    };

  } catch (error) {
    console.error('❌ Error sending verification code:', error);

    let errorMessage = 'Failed to send verification code';

    if (error.error_message) {
      if (error.error_message.includes('PHONE_NUMBER_INVALID')) {
        errorMessage = 'Invalid phone number format. Use international format (e.g., +1234567890)';
      } else if (error.error_message.includes('PHONE_NUMBER_BANNED')) {
        errorMessage = 'This phone number is banned from Telegram';
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
