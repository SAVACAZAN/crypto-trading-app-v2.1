import TelegramBot from '~/server/models/TelegramBot.schema';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID, botId } = body;

    if (!userID || !botId) {
      return {
        success: false,
        message: 'User ID and bot ID are required'
      };
    }

    console.log(`🗑️ Removing bot ${botId} for user: ${userID}`);

    // Delete bot from database
    const result = await TelegramBot.findOneAndDelete({
      _id: botId,
      userID: userID
    });

    if (!result) {
      return {
        success: false,
        message: 'Bot not found or you do not have permission to remove it'
      };
    }

    console.log(`✅ Bot removed successfully`);

    return {
      success: true,
      message: 'Bot removed successfully'
    };

  } catch (error) {
    console.error('❌ Error removing bot:', error);
    return {
      success: false,
      message: error.message || 'Failed to remove bot'
    };
  }
});
