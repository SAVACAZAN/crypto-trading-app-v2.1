import { BotChainModel } from '~/server/models/botChain.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { userId } = query;

    if (!userId) {
      return {
        success: false,
        error: 'Missing userId parameter'
      };
    }

    // Fetch all bot chains for user
    const chains = await BotChainModel.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Fetched ${chains.length} bot chains for user ${userId}`);

    return {
      success: true,
      data: chains,
      count: chains.length
    };
  } catch (error) {
    console.error('❌ Error fetching bot chains:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
});
