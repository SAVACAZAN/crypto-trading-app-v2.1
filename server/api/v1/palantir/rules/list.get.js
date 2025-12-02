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

    // Build filter
    const filter = { userId };

    // Add enabled filter if provided
    if (query.enabled !== undefined) {
      filter.enabled = query.enabled === 'true';
    }

    // Add event filter if provided
    if (query.event) {
      filter['trigger.event'] = query.event;
    }

    // Add priority filter if provided
    if (query.minPriority) {
      filter.priority = { $gte: parseInt(query.minPriority) };
    }

    // Fetch rules
    const rules = await AutomationRule.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .lean();

    // Calculate stats
    const stats = {
      total: rules.length,
      enabled: rules.filter(r => r.enabled).length,
      disabled: rules.filter(r => !r.enabled).length,
      totalExecutions: rules.reduce((sum, r) => sum + r.executionCount, 0),
      averagePriority: rules.length > 0
        ? (rules.reduce((sum, r) => sum + r.priority, 0) / rules.length).toFixed(1)
        : 0
    };

    // Group by event type
    const byEvent = {};
    rules.forEach(r => {
      const event = r.trigger.event;
      if (!byEvent[event]) {
        byEvent[event] = { count: 0, enabled: 0 };
      }
      byEvent[event].count++;
      if (r.enabled) byEvent[event].enabled++;
    });

    return {
      success: true,
      data: rules,
      stats,
      byEvent,
      count: rules.length
    };

  } catch (error) {
    console.error('❌ Error fetching automation rules:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch automation rules'
    });
  }
});
