import TelegramBot from '~/server/models/TelegramBot.schema';
import fetch from 'node-fetch';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID, name, token } = body;

    if (!userID || !name || !token) {
      return {
        success: false,
        message: 'User ID, name, and token are required'
      };
    }

    console.log(`➕ Adding new bot for user: ${userID}`);

    // Validate token by calling getMe
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data = await response.json();

      if (!data.ok) {
        return {
          success: false,
          message: 'Invalid bot token. Please check your token from @BotFather.'
        };
      }

      const botInfo = data.result;

      console.log(`✅ Bot validated: @${botInfo.username}`);

      // Check if bot already exists for this user
      const existingBot = await TelegramBot.findOne({
        userID,
        botId: botInfo.id
      });

      if (existingBot) {
        return {
          success: false,
          message: `Bot @${botInfo.username} already exists in your collection`
        };
      }

      // Save bot to database
      const newBot = await TelegramBot.create({
        userID,
        name,
        token,
        username: botInfo.username,
        botId: botInfo.id,
        firstName: botInfo.first_name,
        isActive: true,
        lastActive: new Date()
      });

      console.log(`💾 Bot saved to database: @${botInfo.username}`);

      return {
        success: true,
        bot: newBot,
        message: `Bot @${botInfo.username} added successfully`
      };

    } catch (apiError) {
      console.error('❌ Error validating bot token:', apiError);
      return {
        success: false,
        message: 'Failed to validate bot token. Please check your token.'
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
