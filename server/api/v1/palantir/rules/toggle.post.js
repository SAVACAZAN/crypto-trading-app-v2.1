import AutomationRule from '~/server/models/palantir/automationRule.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userId, ruleId, enabled } = body;

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

    const previousState = rule.enabled;
    rule.enabled = enabled !== undefined ? enabled : !rule.enabled;

    await rule.save();

    console.log(`✅ Automation rule ${rule.enabled ? 'enabled' : 'disabled'}: ${ruleId} - "${rule.name}"`);

    return {
      success: true,
      data: rule,
      message: `Automation rule ${rule.enabled ? 'enabled' : 'disabled'} successfully`,
      previousState
    };

  } catch (error) {
    console.error('❌ Error toggling automation rule:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to toggle automation rule'
    });
  }
});
