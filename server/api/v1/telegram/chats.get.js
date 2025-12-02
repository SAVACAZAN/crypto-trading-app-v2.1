import TelegramBot from '~/server/models/TelegramBot.schema';
import { Telegraf } from 'telegraf';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { botId } = query;

    if (!botId) {
      return {
        success: false,
        message: 'Bot ID is required',
        chats: []
      };
    }

    console.log(`📱 [TELEGRAM-CHATS] Fetching chats for bot: ${botId}`);

    // Get bot from database
    const botData = await TelegramBot.findById(botId);

    if (!botData) {
      return {
        success: false,
        message: 'Bot not found',
        chats: []
      };
    }

    // Create Telegram bot instance
    const bot = new Telegraf(botData.token);

    // Get recent updates (messages) to find chats
    const updates = await bot.telegram.getUpdates({ limit: 100 });

    // Group messages by chat
    const chatsMap = new Map();

    updates.forEach(update => {
      const message = update.message || update.channel_post;
      if (!message) return;

      const chatId = message.chat.id;
      const chatName = message.chat.title || message.chat.first_name || message.chat.username || 'Unknown';
      const chatType = message.chat.type;

      if (!chatsMap.has(chatId)) {
        chatsMap.set(chatId, {
          id: chatId,
          name: chatName,
          type: chatType,
          participants_count: 0,
          username: message.chat.username || null,
          lastMessage: {
            text: message.text || '[Media]',
            date: message.date
          }
        });
      }
    });

    const chats = Array.from(chatsMap.values());

    console.log(`✅ [TELEGRAM-CHATS] Fetched ${chats.length} chats`);

    // Update lastUsed timestamp
    botData.lastUsed = new Date();
    await botData.save();

    return {
      success: true,
      chats: chats,
      message: `Fetched ${chats.length} chats`
    };

  } catch (error) {
    console.error('❌ [TELEGRAM-CHATS] Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch chats',
      chats: [],
      error: error.toString()
    };
  }
});
