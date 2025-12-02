import TelegramBot from 'node-telegram-bot-api';

// Global state for Telegram bot
let telegramBot = null;
let isReady = false;
let botInfo = null;

export default defineEventHandler(async (event) => {
  try {
    console.log('📱 [TELEGRAM] Starting bot authentication...');

    const body = await readBody(event);
    const { botToken } = body;

    if (!botToken) {
      return {
        success: false,
        status: 'missing_token',
        message: 'Bot token is required'
      };
    }

    // Check if already authenticated with this token
    if (telegramBot && isReady && botInfo) {
      return {
        success: true,
        status: 'ready',
        botInfo,
        message: `Already connected as @${botInfo.username}`
      };
    }

    console.log('📱 [TELEGRAM] Initializing bot...');

    // Initialize Telegram Bot
    telegramBot = new TelegramBot(botToken, { polling: false });

    // Test token by getting bot info
    const me = await telegramBot.getMe();

    botInfo = {
      id: me.id,
      username: me.username,
      firstName: me.first_name,
      isBot: me.is_bot
    };

    isReady = true;

    console.log('✅ [TELEGRAM] Bot connected successfully');
    console.log('📱 [TELEGRAM] Bot username:', `@${botInfo.username}`);

    return {
      success: true,
      status: 'ready',
      botInfo,
      message: `Successfully connected as @${botInfo.username}`
    };

  } catch (error) {
    console.error('❌ [TELEGRAM] Error:', error);

    let errorMessage = 'Failed to connect bot';
    if (error.message.includes('401')) {
      errorMessage = 'Invalid bot token. Get a new token from @BotFather';
    } else if (error.message.includes('404')) {
      errorMessage = 'Bot not found. Check your token';
    }

    return {
      success: false,
      status: 'error',
      message: errorMessage,
      error: error.message
    };
  }
});

export function getTelegramBot() {
  return {
    bot: telegramBot,
    isReady,
    botInfo
  };
}
