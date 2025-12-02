import { CoPilotBotSchema } from '~/server/models/CoPilotBot.schema';
import { CoPilotAutomationRuleSchema } from '~/server/models/coPilotAutomationRule.schema';

/**
 * Add automation rule to CoPilot bot order
 */
export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { userID, botId, orderId, orderInfo, ruleName, ruleType, triggerCondition, triggerValue, actionConfig } = body;

        // botId is now OPTIONAL - rules can exist without a bot
        if (!userID || !orderId || !ruleName || !ruleType || !triggerCondition) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing required fields: userID, orderId, ruleName, ruleType, triggerCondition'
            });
        }

        console.log('📝 [AddCoPilotRule] Adding automation rule:', {
            userID,
            botId: botId || 'standalone',
            orderId,
            ruleName,
            ruleType,
            triggerCondition,
            triggerValue,
            actionConfig
        });

        // Special logging for OneClick bot
        if (actionConfig?.botType === 'oneclick') {
            console.log('🎯 [AddCoPilotRule] OneClick Bot Detected:', {
                botType: actionConfig.botType,
                oneClickStrategy: actionConfig.oneClickStrategy,
                isCustom: actionConfig.oneClickStrategy === 'custom',
                fullActionConfig: JSON.stringify(actionConfig, null, 2)
            });
        }

        let bot = null;
        let ruleNumber = 1;

        // If botId provided, find the bot and increment counter
        if (botId) {
            bot = await CoPilotBotSchema.findOne({ _id: botId, userID });

            if (!bot) {
                console.warn(`⚠️ [AddCoPilotRule] Bot ${botId} not found, creating standalone rule`);
            } else {
                bot.ruleCounter = (bot.ruleCounter || 0) + 1;
                ruleNumber = bot.ruleCounter;
            }
        }

        // If no botId or bot not found, get rule number from total user rules
        if (!bot) {
            const userRulesCount = await CoPilotAutomationRuleSchema.countDocuments({ userID });
            ruleNumber = userRulesCount + 1;
        }

        // Use provided orderInfo or create minimal one
        const finalOrderInfo = orderInfo || {
            exchange: 'unknown',
            symbol: 'unknown',
            side: 'unknown',
            type: 'unknown',
            amount: 0,
            price: 0,
            apiKeyName: 'unknown'
        };

        // Create automation rule (standalone or linked to bot)
        const newRule = await CoPilotAutomationRuleSchema.create({
            ruleNumber,
            userID,
            coPilotBotId: botId || null,
            orderId,
            orderInfo: finalOrderInfo,
            ruleName,
            ruleType,
            triggerCondition,
            triggerValue: triggerValue || null,
            actionConfig: actionConfig || {},
            isActive: true,
            executionCount: 0
        });

        // If bot exists, add rule reference to it
        if (bot) {
            if (!bot.automationRules) {
                bot.automationRules = [];
            }

            bot.automationRules.push({
                ruleId: newRule._id.toString(),
                ruleNumber,
                orderId,
                ruleName,
                ruleType,
                isActive: true,
                createdAt: new Date()
            });

            await bot.save();
            console.log(`✅ [AddCoPilotRule] Rule linked to bot ${botId}`);
        } else {
            console.log(`✅ [AddCoPilotRule] Standalone rule created (no bot)`);
        }

        console.log(`✅ [AddCoPilotRule] Rule #${ruleNumber} created successfully`);
        console.log('📋 [AddCoPilotRule] Saved Rule Details:', {
            id: newRule._id.toString(),
            ruleNumber,
            ruleName,
            ruleType,
            actionConfig: newRule.actionConfig
        });

        return {
            success: true,
            message: `Automation rule #${ruleNumber} added successfully`,
            rule: {
                id: newRule._id.toString(),
                ruleNumber,
                ruleName,
                ruleType,
                triggerCondition,
                actionConfig: newRule.actionConfig,
                createdAt: newRule.createdAt
            }
        };

    } catch (error) {
        console.error('❌ [AddCoPilotRule] Error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to add automation rule'
        });
    }
});
