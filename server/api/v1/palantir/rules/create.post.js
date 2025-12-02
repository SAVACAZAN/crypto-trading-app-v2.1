import AutomationRule from '~/server/models/palantir/automationRule.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userId, name, description, trigger, actions, priority, cooldown, limits } = body;

    // Validate required fields
    if (!userId || !name || !trigger || !actions || actions.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: userId, name, trigger, actions'
      });
    }

    // Validate trigger
    if (!trigger.event || !trigger.conditions || trigger.conditions.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Trigger must have event and at least one condition'
      });
    }

    // Validate actions
    for (const action of actions) {
      if (!action.type || !action.config) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Each action must have type and config'
        });
      }
    }

    // Generate unique ruleId
    const ruleId = `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create automation rule
    const rule = new AutomationRule({
      userId,
      ruleId,
      name,
      description: description || '',
      enabled: true,
      trigger: {
        event: trigger.event,
        conditions: trigger.conditions.map(c => ({
          field: c.field,
          operator: c.operator,
          value: c.value
        }))
      },
      actions: actions.map(a => ({
        type: a.type,
        config: a.config,
        status: 'pending'
      })),
      priority: priority || 5,
      executionCount: 0,
      lastExecuted: null,
      cooldown: cooldown || {
        enabled: false,
        duration: 60,
        lastTriggered: null
      },
      limits: limits || {
        maxExecutionsPerDay: 100,
        executionsToday: 0,
        lastReset: new Date()
      }
    });

    await rule.save();

    console.log(`✅ Automation rule created: ${ruleId} - "${name}"`);

    return {
      success: true,
      data: rule,
      message: 'Automation rule created successfully'
    };

  } catch (error) {
    console.error('❌ Error creating automation rule:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to create automation rule'
    });
  }
});
