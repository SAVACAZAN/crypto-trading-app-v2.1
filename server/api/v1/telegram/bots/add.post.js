import TelegramBot from '~/server/models/TelegramBot.schema';
import { Telegraf } from 'telegraf';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID, botName, botToken } = body;

    if (!userID || !botName || !botToken) {
      return {
        success: false,
        message: 'User ID, bot name, and bot token are required'
      };
    }

    console.log(`➕ Adding new Telegram bot for user: ${userID}`);

    // Verify bot token is valid by calling Telegram API
    try {
      const bot = new Telegraf(botToken);
      const botInfo = await bot.telegram.getMe();

      console.log(`✅ Bot verified: @${botInfo.username}`);

      // Check if this bot token already exists for this user
      const existingBot = await TelegramBot.findOne({ userID, token: botToken });

      if (existingBot) {
        return {
          success: false,
          message: 'This bot is already connected to your account'
        };
      }

      // Save bot to database
      const newBot = new TelegramBot({
        userID,
        name: botName,
        token: botToken,
        username: botInfo.username,
        botId: botInfo.id,
        isActive: true
      });

      await newBot.save();

      console.log(`💾 Bot saved to database: ${newBot._id}`);

      return {
        success: true,
        bot: {
          id: newBot._id.toString(),
          username: botInfo.username,
          name: botName
        },
        message: 'Bot connected successfully'
      };

    } catch (botError) {
      console.error('❌ Invalid bot token:', botError);
      return {
        success: false,
        message: 'Invalid bot token. Please check your token from @BotFather'
      };
    }

  } catch (error) {
    console.error('❌ Error adding bot:', error);
    return {
      success: false,
      message: error.message || 'Failed to add bot'
    };
  }
});
