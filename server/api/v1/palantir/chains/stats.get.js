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

    // Aggregate stats
    const stats = await BotChain.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalChains: { $sum: 1 },
          activeChains: {
            $sum: { $cond: [{ $eq: ['$status', 'running'] }, 1, 0] }
          },
          pausedChains: {
            $sum: { $cond: [{ $eq: ['$status', 'paused'] }, 1, 0] }
          },
          completedChains: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          failedChains: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          totalExecutions: { $sum: '$executionCount' },
          totalSuccesses: { $sum: '$successCount' },
          totalFailures: { $sum: '$failureCount' },
          avgProfit: { $avg: '$totalProfit' }
        }
      }
    ]);

    const result = stats.length > 0 ? stats[0] : {
      totalChains: 0,
      activeChains: 0,
      pausedChains: 0,
      completedChains: 0,
      failedChains: 0,
      totalExecutions: 0,
      totalSuccesses: 0,
      totalFailures: 0,
      avgProfit: 0
    };

    // Calculate success rate
    result.successRate = result.totalExecutions > 0
      ? ((result.totalSuccesses / result.totalExecutions) * 100).toFixed(2)
      : 0;

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error('❌ Error fetching chain stats:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch chain stats'
    });
  }
});
