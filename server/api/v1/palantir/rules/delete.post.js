import AutomationRule from '~/server/models/palantir/automationRule.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userId, ruleId } = body;

    if (!userId || !ruleId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'userId and ruleId are required'
      });
    }

    // Find and delete rule
    const result = await AutomationRule.deleteOne({
      ruleId,
      userId
    });

    if (result.deletedCount === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Automation rule not found'
      });
    }

    console.log(`✅ Automation rule deleted: ${ruleId}`);

    return {
      success: true,
      message: 'Automation rule deleted successfully'
    };

  } catch (error) {
    console.error('❌ Error deleting automation rule:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to delete automation rule'
    });
  }
});
