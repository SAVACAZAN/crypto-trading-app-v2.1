import { CoPilotBotSchema } from '~/server/models/CoPilotBot.schema';
import { CoPilotAutomationRuleSchema } from '~/server/models/coPilotAutomationRule.schema';

/**
 * Delete automation rule from CoPilot bot
 */
export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { userID, botId, ruleId } = body;

        if (!userID || !ruleId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing required fields'
            });
        }

        console.log('🗑️ [DeleteCoPilotRule] Deleting rule:', { userID, botId, ruleId });

        // Build query - botId is optional (rules can be independent)
        const deleteQuery = {
            _id: ruleId,
            userID
        };

        if (botId) {
            deleteQuery.coPilotBotId = botId;
        }

        // Delete rule from database
        const deletedRule = await CoPilotAutomationRuleSchema.findOneAndDelete(deleteQuery);

        if (!deletedRule) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Rule not found'
            });
        }

        // Remove rule reference from bot
        const bot = await CoPilotBotSchema.findOne({ _id: botId, userID });
        if (bot && bot.automationRules) {
            bot.automationRules = bot.automationRules.filter(r => r.ruleId !== ruleId);
            await bot.save();
        }

        console.log(`✅ [DeleteCoPilotRule] Rule #${deletedRule.ruleNumber} deleted successfully`);

        return {
            success: true,
            message: `Automation rule #${deletedRule.ruleNumber} deleted successfully`
        };

    } catch (error) {
        console.error('❌ [DeleteCoPilotRule] Error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to delete automation rule'
        });
    }
});
