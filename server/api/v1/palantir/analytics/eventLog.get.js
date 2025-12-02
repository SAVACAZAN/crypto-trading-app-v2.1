import BotChain from '~/server/models/palantir/botChain.schema.js';
import PatternDetection from '~/server/models/palantir/patternDetection.schema.js';
import AutomationRule from '~/server/models/palantir/automationRule.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { userId, limit, eventType, since } = query;

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'userId is required'
      });
    }

    const eventLimit = limit ? parseInt(limit) : 50;
    const sinceDate = since ? new Date(since) : new Date(Date.now() - 24 * 60 * 60 * 1000);

    const events = [];

    // Get bot chain events from history
    const botChains = await BotChain.find({
      userId,
      'history.timestamp': { $gte: sinceDate }
    }).lean();

    botChains.forEach(chain => {
      chain.history
        .filter(h => new Date(h.timestamp) >= sinceDate)
        .forEach(historyItem => {
          events.push({
            type: 'chain',
            eventType: historyItem.event,
            timestamp: historyItem.timestamp,
            source: 'Bot Chain',
            sourceId: chain.chainId,
            sourceName: chain.name,
            description: historyItem.description,
            data: {
              nodeId: historyItem.nodeId,
              ...historyItem.data
            },
            severity: getSeverity(historyItem.event)
          });
        });
    });

    // Get pattern detection events
    if (!eventType || eventType === 'pattern') {
      const patterns = await PatternDetection.find({
        userId,
        detectedAt: { $gte: sinceDate }
      })
        .sort({ detectedAt: -1 })
        .limit(eventLimit)
        .lean();

      patterns.forEach(pattern => {
        events.push({
          type: 'pattern',
          eventType: 'pattern_detected',
          timestamp: pattern.detectedAt,
          source: 'Pattern Engine',
          sourceId: pattern._id,
          sourceName: `${pattern.patternType.toUpperCase()} on ${pattern.symbol}`,
          description: `${pattern.patternType} pattern detected on ${pattern.symbol} (${pattern.timeframe})`,
          data: {
            symbol: pattern.symbol,
            timeframe: pattern.timeframe,
            confidence: pattern.confidence,
            patternType: pattern.patternType,
            signals: pattern.signals,
            metrics: pattern.metrics
          },
          severity: pattern.confidence > 75 ? 'high' : pattern.confidence > 50 ? 'medium' : 'low'
        });
      });
    }

    // Get automation rule execution events
    if (!eventType || eventType === 'automation') {
      const rules = await AutomationRule.find({
        userId,
        lastExecuted: { $gte: sinceDate }
      })
        .sort({ lastExecuted: -1 })
        .limit(eventLimit)
        .lean();

      rules.forEach(rule => {
        events.push({
          type: 'automation',
          eventType: 'rule_executed',
          timestamp: rule.lastExecuted,
          source: 'Automation Engine',
          sourceId: rule.ruleId,
          sourceName: rule.name,
          description: `Automation rule "${rule.name}" executed`,
          data: {
            trigger: rule.trigger.event,
            executionCount: rule.executionCount,
            actions: rule.actions.map(a => a.type)
          },
          severity: 'medium'
        });
      });
    }

    // Sort all events by timestamp (newest first)
    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit results
    const limitedEvents = events.slice(0, eventLimit);

    // Calculate event statistics
    const stats = {
      total: limitedEvents.length,
      byType: {
        chain: limitedEvents.filter(e => e.type === 'chain').length,
        pattern: limitedEvents.filter(e => e.type === 'pattern').length,
        automation: limitedEvents.filter(e => e.type === 'automation').length
      },
      bySeverity: {
        high: limitedEvents.filter(e => e.severity === 'high').length,
        medium: limitedEvents.filter(e => e.severity === 'medium').length,
        low: limitedEvents.filter(e => e.severity === 'low').length
      },
      period: {
        from: sinceDate.toISOString(),
        to: new Date().toISOString()
      }
    };

    return {
      success: true,
      data: limitedEvents,
      stats,
      count: limitedEvents.length
    };

  } catch (error) {
    console.error('❌ Error fetching event log:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch event log'
    });
  }
});

// Helper function to determine event severity
function getSeverity(eventType) {
  const highSeverity = ['chain_failed', 'node_failed', 'error'];
  const mediumSeverity = ['chain_completed', 'node_completed', 'chain_paused', 'chain_resumed'];

  if (highSeverity.includes(eventType)) return 'high';
  if (mediumSeverity.includes(eventType)) return 'medium';
  return 'low';
}
