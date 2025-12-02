import { CoPilotAutomationRuleSchema } from '~/server/models/coPilotAutomationRule.schema';
import { CoPilotBotSchema } from '~/server/models/CoPilotBot.schema';

/**
 * Toggle automation rule active/inactive
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

        console.log('🔄 [ToggleCoPilotRule] Toggling rule:', { userID, botId, ruleId });

        // Build query - botId is optional (rules can be independent)
        const findQuery = {
            _id: ruleId,
            userID
        };

        if (botId) {
            findQuery.coPilotBotId = botId;
        }

        // Find and toggle rule
        const rule = await CoPilotAutomationRuleSchema.findOne(findQuery);

        if (!rule) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Rule not found'
            });
        }

        rule.isActive = !rule.isActive;
        rule.updatedAt = new Date();
        await rule.save();

        // Update bot's automation rules array
        const bot = await CoPilotBotSchema.findOne({ _id: botId, userID });
        if (bot && bot.automationRules) {
            const ruleIndex = bot.automationRules.findIndex(r => r.ruleId === ruleId);
            if (ruleIndex !== -1) {
                bot.automationRules[ruleIndex].isActive = rule.isActive;
                await bot.save();
            }
        }

        console.log(`✅ [ToggleCoPilotRule] Rule #${rule.ruleNumber} is now ${rule.isActive ? 'active' : 'inactive'}`);

        return {
            success: true,
            message: `Rule #${rule.ruleNumber} is now ${rule.isActive ? 'active' : 'inactive'}`,
            isActive: rule.isActive
        };

    } catch (error) {
        console.error('❌ [ToggleCoPilotRule] Error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to toggle automation rule'
        });
    }
});
