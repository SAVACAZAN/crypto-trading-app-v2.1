import AutomationRule from '~/server/models/palantir/automationRule.schema.js';
import BotChain from '~/server/models/palantir/botChain.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userId, ruleId, eventData, manual } = body;

    if (!userId || !ruleId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'userId and ruleId are required'
      });
    }

    // Find rule
    const rule = await AutomationRule.findOne({
      ruleId,
      userId
    });

    if (!rule) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Automation rule not found'
      });
    }

    // Check if rule is enabled
    if (!rule.enabled && !manual) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Rule is disabled. Use manual=true to force execution.'
      });
    }

    // Check cooldown
    if (rule.cooldown.enabled && rule.cooldown.lastTriggered && !manual) {
      const timeSinceLastTrigger = Date.now() - rule.cooldown.lastTriggered.getTime();
      const cooldownMs = rule.cooldown.duration * 1000;

      if (timeSinceLastTrigger < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastTrigger) / 1000);
        throw createError({
          statusCode: 429,
          statusMessage: `Rule is in cooldown. Try again in ${remainingSeconds} seconds.`
        });
      }
    }

    // Check daily limits
    if (!manual) {
      const today = new Date().toDateString();
      const lastResetDay = rule.limits.lastReset.toDateString();

      if (today !== lastResetDay) {
        rule.limits.executionsToday = 0;
        rule.limits.lastReset = new Date();
      }

      if (rule.limits.executionsToday >= rule.limits.maxExecutionsPerDay) {
        throw createError({
          statusCode: 429,
          statusMessage: `Daily execution limit reached (${rule.limits.maxExecutionsPerDay})`
        });
      }
    }

    // Execute actions
    const executionResults = [];

    for (const action of rule.actions) {
      try {
        let result;

        switch (action.type) {
          case 'START_BOT':
            // Start a bot (Grid, DCA, etc.)
            result = await executeBotAction(action.config, 'start');
            break;

          case 'STOP_BOT':
            // Stop a bot
            result = await executeBotAction(action.config, 'stop');
            break;

          case 'START_CHAIN':
            // Start a bot chain
            const chain = await BotChain.findOne({
              chainId: action.config.chainId,
              userId
            });
            if (chain) {
              chain.enabled = true;
              chain.status = 'running';
              await chain.save();
              result = { success: true, chainId: chain.chainId };
            } else {
              result = { success: false, error: 'Chain not found' };
            }
            break;

          case 'SEND_NOTIFICATION':
            // Send notification (placeholder)
            result = {
              success: true,
              message: action.config.message || 'Rule triggered',
              channel: action.config.channel || 'app'
            };
            console.log(`📧 Notification: ${action.config.message}`);
            break;

          case 'SEND_WEBHOOK':
            // Send webhook (placeholder)
            result = {
              success: true,
              url: action.config.url,
              payload: eventData || {}
            };
            console.log(`🔗 Webhook sent to: ${action.config.url}`);
            break;

          case 'ADJUST_PARAMETERS':
            // Adjust bot parameters (placeholder)
            result = {
              success: true,
              botId: action.config.botId,
              adjustments: action.config.adjustments
            };
            break;

          default:
            result = { success: false, error: 'Unknown action type' };
        }

        action.status = result.success ? 'completed' : 'failed';
        executionResults.push({
          action: action.type,
          result
        });

      } catch (actionError) {
        action.status = 'failed';
        executionResults.push({
          action: action.type,
          error: actionError.message
        });
      }
    }

    // Update rule execution stats
    rule.executionCount++;
    rule.lastExecuted = new Date();
    rule.limits.executionsToday++;

    if (rule.cooldown.enabled) {
      rule.cooldown.lastTriggered = new Date();
    }

    await rule.save();

    console.log(`✅ Automation rule executed: ${ruleId} - ${executionResults.length} actions`);

    return {
      success: true,
      data: {
        ruleId,
        ruleName: rule.name,
        executionResults,
        executionCount: rule.executionCount,
        executedAt: rule.lastExecuted
      },
      message: 'Automation rule executed successfully'
    };

  } catch (error) {
    console.error('❌ Error executing automation rule:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to execute automation rule'
    });
  }
});

// Helper function to execute bot actions
async function executeBotAction(config, action) {
  // Placeholder - would integrate with actual bot management
  return {
    success: true,
    botId: config.botId,
    botType: config.botType,
    action
  };
}
