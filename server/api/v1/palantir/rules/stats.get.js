import AutomationRule from '~/server/models/palantir/automationRule.schema.js';

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
    const stats = await AutomationRule.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalRules: { $sum: 1 },
          enabledRules: {
            $sum: { $cond: [{ $eq: ['$enabled', true] }, 1, 0] }
          },
          disabledRules: {
            $sum: { $cond: [{ $eq: ['$enabled', false] }, 1, 0] }
          },
          totalExecutions: { $sum: '$executionCount' },
          avgPriority: { $avg: '$priority' },
          avgExecutionsPerRule: { $avg: '$executionCount' }
        }
      }
    ]);

    // Stats by event type
    const byEvent = await AutomationRule.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$trigger.event',
          count: { $sum: 1 },
          enabled: {
            $sum: { $cond: [{ $eq: ['$enabled', true] }, 1, 0] }
          },
          totalExecutions: { $sum: '$executionCount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Stats by action type
    const byAction = await AutomationRule.aggregate([
      { $match: { userId } },
      { $unwind: '$actions' },
      {
        $group: {
          _id: '$actions.type',
          count: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$actions.status', 'completed'] }, 1, 0] }
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ['$actions.status', 'failed'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Most executed rules
    const topExecuted = await AutomationRule.find({ userId })
      .select('ruleId name executionCount enabled lastExecuted')
      .sort({ executionCount: -1 })
      .limit(10)
      .lean();

    // Recently executed rules
    const recentlyExecuted = await AutomationRule.find({
      userId,
      lastExecuted: { $ne: null }
    })
      .select('ruleId name executionCount lastExecuted')
      .sort({ lastExecuted: -1 })
      .limit(10)
      .lean();

    const result = stats.length > 0 ? stats[0] : {
      totalRules: 0,
      enabledRules: 0,
      disabledRules: 0,
      totalExecutions: 0,
      avgPriority: 0,
      avgExecutionsPerRule: 0
    };

    return {
      success: true,
      data: {
        overall: result,
        byEvent,
        byAction,
        topExecuted,
        recentlyExecuted
      }
    };

  } catch (error) {
    console.error('❌ Error fetching automation rule stats:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch automation rule stats'
    });
  }
});
