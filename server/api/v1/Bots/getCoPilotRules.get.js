import { CoPilotAutomationRuleSchema } from '~/server/models/coPilotAutomationRule.schema';

/**
 * Get all automation rules for a CoPilot bot or specific order
 */
export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const { userID, botId, orderId } = query;

        if (!userID) {
            throw createError({
                statusCode: 400,
                statusMessage: 'userID is required'
            });
        }

        console.log('📋 [GetCoPilotRules] Fetching rules:', { userID, botId, orderId });

        // Build query - allow querying by orderId without botId
        const searchQuery = {
            userID
        };

        if (botId) {
            searchQuery.botId = botId;
        }

        if (orderId) {
            searchQuery.orderId = orderId;
        }

        // Fetch rules
        const rules = await CoPilotAutomationRuleSchema.find(searchQuery).sort({ ruleNumber: 1 });

        console.log(`✅ [GetCoPilotRules] Found ${rules.length} rules`);

        return {
            success: true,
            rules: rules.map(rule => ({
                id: rule._id.toString(),
                botId: rule.botId,
                ruleNumber: rule.ruleNumber,
                orderId: rule.orderId,
                orderInfo: rule.orderInfo,
                ruleName: rule.ruleName,
                ruleType: rule.ruleType,
                triggerCondition: rule.triggerCondition,
                actionConfig: rule.actionConfig,
                isActive: rule.isActive,
                executionCount: rule.executionCount,
                lastExecuted: rule.lastExecuted,
                createdAt: rule.createdAt
            })),
            total: rules.length
        };

    } catch (error) {
        console.error('❌ [GetCoPilotRules] Error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to fetch automation rules'
        });
    }
});
