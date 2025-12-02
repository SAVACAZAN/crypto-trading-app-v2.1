import BotChain from '~/server/models/palantir/botChain.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const userId = query.userId;

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'userId is required'
      });
    }

    // Build filter
    const filter = { userId };

    // Add status filter if provided
    if (query.status) {
      filter.status = query.status;
    }

    // Add enabled filter if provided
    if (query.enabled !== undefined) {
      filter.enabled = query.enabled === 'true';
    }

    // Fetch bot chains
    const botChains = await BotChain.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Calculate stats
    const stats = {
      total: botChains.length,
      running: botChains.filter(c => c.status === 'running').length,
      paused: botChains.filter(c => c.status === 'paused').length,
      completed: botChains.filter(c => c.status === 'completed').length,
      failed: botChains.filter(c => c.status === 'failed').length
    };

    return {
      success: true,
      data: botChains,
      stats,
      count: botChains.length
    };

  } catch (error) {
    console.error('❌ Error fetching bot chains:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch bot chains'
    });
  }
});
