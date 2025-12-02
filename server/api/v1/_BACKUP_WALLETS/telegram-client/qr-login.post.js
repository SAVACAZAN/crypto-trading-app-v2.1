import TelegramClientSession from '~/server/models/TelegramClientSession.schema';
import MTProto from '@mtproto/core';
import QRCode from 'qrcode';

// Telegram API credentials - These should be in .env file
// Get them from https://my.telegram.org/apps
const API_ID = process.env.TELEGRAM_API_ID || 'YOUR_API_ID';
const API_HASH = process.env.TELEGRAM_API_HASH || 'YOUR_API_HASH';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID, loginType = 'qr' } = body;

    if (!userID) {
      return {
        success: false,
        message: 'User ID is required'
      };
    }

    console.log(`📱 Generating QR code for Telegram client login: ${userID}`);

    // Check if API credentials are configured
    if (API_ID === 'YOUR_API_ID' || API_HASH === 'YOUR_API_HASH') {
      return {
        success: false,
        message: 'Telegram API credentials not configured. Please set TELEGRAM_API_ID and TELEGRAM_API_HASH in .env file. Get them from https://my.telegram.org/apps'
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

    // Request QR login token
    const { token, expires } = await mtproto.call('auth.exportLoginToken', {
      api_id: parseInt(API_ID),
      api_hash: API_HASH,
      except_ids: [],
    });

    // Convert token to base64url format for QR code
    const tokenBase64 = Buffer.from(token).toString('base64url');
    const qrData = `tg://login?token=${tokenBase64}`;

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    // Save or update session with QR token
    const expiresAt = new Date(expires * 1000);

    // Store the raw token bytes for import checking
    const tokenRaw = Buffer.from(token).toString('base64');

    // Clear any old authentication data before saving new QR token
    await TelegramClientSession.findOneAndUpdate(
      { userID },
      {
        userID,
        qrLoginToken: tokenBase64,
        qrLoginTokenRaw: tokenRaw, // Store raw token for checking
        qrExpiresAt: expiresAt,
        isAuthenticated: false,
        loginType: loginType, // Save login type (qr, sms, hacked)
        phoneCodeHash: null, // Clear any old phone code hash
        lastActive: new Date()
      },
      { upsert: true, new: true }
    );

    console.log(`✅ QR code generated successfully, expires at: ${expiresAt.toISOString()}`);

    return {
      success: true,
      qrCodeDataUrl,
      expiresAt: expiresAt.toISOString(),
      expiresIn: Math.floor((expiresAt - new Date()) / 1000) // seconds
    };

  } catch (error) {
    console.error('❌ Error generating QR code:', error);
    return {
      success: false,
      message: error.message || 'Failed to generate QR code'
    };
  }
});
