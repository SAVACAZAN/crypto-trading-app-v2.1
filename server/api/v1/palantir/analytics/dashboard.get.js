import BotChain from '~/server/models/palantir/botChain.schema.js';
import PatternDetection from '~/server/models/palantir/patternDetection.schema.js';
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

    // Time ranges
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Bot Chain Statistics
    const chainStats = await BotChain.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalChains: { $sum: 1 },
          runningChains: {
            $sum: { $cond: [{ $eq: ['$status', 'running'] }, 1, 0] }
          },
          completedChains: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalProfit: { $sum: '$totalProfit' },
          totalExecutions: { $sum: '$executionCount' },
          avgSuccessRate: { $avg: '$successRate' }
        }
      }
    ]);

    // Pattern Detection Statistics (last 24h)
    const patternStats = await PatternDetection.aggregate([
      {
        $match: {
          userId,
          detectedAt: { $gte: last24h }
        }
      },
      {
        $group: {
          _id: '$patternType',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' },
          highConfidence: {
            $sum: { $cond: [{ $gte: ['$confidence', 75] }, 1, 0] }
          }
        }
      }
    ]);

    // Automation Rule Statistics
    const ruleStats = await AutomationRule.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalRules: { $sum: 1 },
          enabledRules: {
            $sum: { $cond: [{ $eq: ['$enabled', true] }, 1, 0] }
          },
          totalExecutions: { $sum: '$executionCount' },
          executionsToday: { $sum: '$limits.executionsToday' }
        }
      }
    ]);

    // Recent Activity (last 7 days)
    const recentPatterns = await PatternDetection.countDocuments({
      userId,
      detectedAt: { $gte: last7d }
    });

    const recentChainExecutions = await BotChain.aggregate([
      {
        $match: {
          userId,
          'history.timestamp': { $gte: last7d }
        }
      },
      {
        $project: {
          recentEvents: {
            $filter: {
              input: '$history',
              as: 'h',
              cond: { $gte: ['$$h.timestamp', last7d] }
            }
          }
        }
      },
      {
        $unwind: '$recentEvents'
      },
      {
        $count: 'total'
      }
    ]);

    // Performance Metrics
    const performanceData = {
      chains: chainStats.length > 0 ? chainStats[0] : {
        totalChains: 0,
        runningChains: 0,
        completedChains: 0,
        totalProfit: 0,
        totalExecutions: 0,
        avgSuccessRate: 0
      },
      patterns: {
        total24h: patternStats.reduce((sum, p) => sum + p.count, 0),
        byType: patternStats,
        highConfidenceCount: patternStats.reduce((sum, p) => sum + p.highConfidence, 0)
      },
      automation: ruleStats.length > 0 ? ruleStats[0] : {
        totalRules: 0,
        enabledRules: 0,
        totalExecutions: 0,
        executionsToday: 0
      },
      activity: {
        patternsLast7d: recentPatterns,
        chainEventsLast7d: recentChainExecutions.length > 0
          ? recentChainExecutions[0].total
          : 0
      }
    };

    // System Health
    const systemHealth = {
      status: 'healthy',
      activeComponents: {
        botChains: performanceData.chains.runningChains > 0,
        patternEngine: performanceData.patterns.total24h > 0,
        automationEngine: performanceData.automation.enabledRules > 0
      },
      uptime: '99.9%', // Placeholder
      lastUpdate: now.toISOString()
    };

    return {
      success: true,
      data: {
        performance: performanceData,
        systemHealth,
        timestamp: now.toISOString()
      }
    };

  } catch (error) {
    console.error('❌ Error fetching dashboard data:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch dashboard data'
    });
  }
});
