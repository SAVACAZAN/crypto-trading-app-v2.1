import { CoPilotBotSchema } from '~/server/models/CoPilotBot.schema';
import { CoPilotAutomationRuleSchema } from '~/server/models/coPilotAutomationRule.schema';
import { CoPilotRuleTemplateSchema } from '~/server/models/coPilotRuleTemplate.schema';

/**
 * Apply a rule template to a specific order
 */
export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { userID, botId, orderId, templateId } = body;

        if (!userID || !botId || !orderId || !templateId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing required fields'
            });
        }

        console.log('🔄 [ApplyRuleTemplate] Applying template to order:', {
            userID,
            botId,
            orderId,
            templateId
        });

        // Find the template
        const template = await CoPilotRuleTemplateSchema.findOne({ _id: templateId });

        if (!template) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Template not found'
            });
        }

        // Find the bot
        const bot = await CoPilotBotSchema.findOne({ _id: botId, userID });

        if (!bot) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Bot not found'
            });
        }

        // Increment rule counter
        bot.ruleCounter = (bot.ruleCounter || 0) + 1;
        const ruleNumber = bot.ruleCounter;

        // Find order info
        let orderInfo = null;
        const order = bot.activeOrders.find(o => o.id === orderId);
        if (order) {
            orderInfo = {
                apiKey: order.apiKey || 'unknown',
                symbol: order.symbol || bot.symbol,
                side: order.side,
                type: order.type,
                amount: order.amount,
                price: order.price,
                totalValue: (parseFloat(order.amount) * parseFloat(order.price)).toString(),
                status: order.status
            };
        }

        // Create automation rule from template
        const newRule = await CoPilotAutomationRuleSchema.create({
            ruleNumber,
            userID,
            botId,
            orderId,
            orderInfo,
            ruleName: template.templateName,
            ruleType: template.ruleType,
            triggerCondition: template.triggerCondition,
            actionConfig: template.actionConfig,
            isActive: true,
            executionCount: 0
        });

        // Add rule reference to bot
        if (!bot.automationRules) {
            bot.automationRules = [];
        }

        bot.automationRules.push({
            ruleId: newRule._id.toString(),
            ruleNumber,
            orderId,
            ruleName: template.templateName,
            ruleType: template.ruleType,
            isActive: true,
            createdAt: new Date()
        });

        await bot.save();

        // Increment template usage count
        template.usageCount = (template.usageCount || 0) + 1;
        await template.save();

        console.log(`✅ [ApplyRuleTemplate] Template applied as rule #${ruleNumber}`);

        return {
            success: true,
            message: `Template "${template.templateName}" applied as rule #${ruleNumber}`,
            rule: {
                id: newRule._id.toString(),
                ruleNumber,
                ruleName: newRule.ruleName,
                ruleType: newRule.ruleType,
                triggerCondition: newRule.triggerCondition,
                actionConfig: newRule.actionConfig,
                createdAt: newRule.createdAt
            }
        };

    } catch (error) {
        console.error('❌ [ApplyRuleTemplate] Error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to apply rule template'
        });
    }
});
