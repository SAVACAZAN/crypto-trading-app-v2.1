import TelegramBot from '~/server/models/TelegramBot.schema';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { userID } = query;

    if (!userID) {
      return {
        success: false,
        message: 'User ID is required',
        bots: []
      };
    }

    console.log(`📥 Loading saved bots for user: ${userID}`);

    // Find all bots for this user
    const bots = await TelegramBot.find({ userID }).sort({ createdAt: -1 });

    console.log(`✅ Loaded ${bots.length} bots`);

    return {
      success: true,
      bots: bots
    };

  } catch (error) {
    console.error('❌ Error loading bots:', error);
    return {
      success: false,
      message: error.message || 'Failed to load bots',
      bots: []
    };
  }
});
