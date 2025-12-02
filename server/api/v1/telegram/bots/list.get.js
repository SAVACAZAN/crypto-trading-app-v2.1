import TelegramBot from '~/server/models/TelegramBot.schema';

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

    console.log(`📋 Fetching Telegram bots for user: ${userID}`);

    // Find all bots for this user
    const bots = await TelegramBot.find({ userID }).select('-token').lean();

    console.log(`✅ Found ${bots.length} bots`);

    return {
      success: true,
      bots: bots.map(bot => ({
        id: bot._id.toString(),
        name: bot.name,
        username: bot.username,
        isActive: bot.isActive || true,
        createdAt: bot.createdAt
      }))
    };

  } catch (error) {
    console.error('❌ Error fetching bots:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch bots'
    };
  }
});
