import TelegramBot from '~/server/models/TelegramBot.schema';
import { Telegraf } from 'telegraf';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { botId, chatId, message } = body;

    if (!botId || !chatId || !message) {
      return {
        success: false,
        message: 'botId, chatId and message are required'
      };
    }

    console.log(`📤 [TELEGRAM-SEND] Sending message to chat ${chatId} via bot ${botId}`);

    // Get bot from database
    const botData = await TelegramBot.findById(botId);

    if (!botData) {
      return {
        success: false,
        message: 'Bot not found'
      };
    }

    // Create Telegram bot instance
    const bot = new Telegraf(botData.token);

    // Send message using bot
    const sentMessage = await bot.telegram.sendMessage(chatId, message);

    console.log(`✅ [TELEGRAM-SEND] Message sent successfully`);

    // Update lastUsed timestamp
    botData.lastUsed = new Date();
    await botData.save();

    return {
      success: true,
      message: 'Message sent successfully',
      messageId: sentMessage.message_id,
      timestamp: sentMessage.date
    };

  } catch (error) {
    console.error('❌ [TELEGRAM-SEND] Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send message',
      error: error.toString()
    };
  }
});
