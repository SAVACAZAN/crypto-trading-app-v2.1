import { CoPilotRuleTemplateSchema } from '~/server/models/coPilotRuleTemplate.schema';

/**
 * Create a reusable automation rule template
 */
export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { userID, templateName, description, ruleType, triggerCondition, actionConfig, isGlobal } = body;

        if (!userID || !templateName || !ruleType || !triggerCondition) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing required fields'
            });
        }

        console.log('📝 [AddCoPilotRuleTemplate] Creating rule template:', {
            userID,
            templateName,
            ruleType
        });

        // Count existing templates for this user to generate template number
        const templateCount = await CoPilotRuleTemplateSchema.countDocuments({ userID });
        const templateNumber = templateCount + 1;

        // Create rule template
        const newTemplate = await CoPilotRuleTemplateSchema.create({
            templateNumber,
            userID,
            templateName,
            description: description || '',
            ruleType,
            triggerCondition,
            actionConfig: actionConfig || {},
            isGlobal: isGlobal || false,
            usageCount: 0
        });

        console.log(`✅ [AddCoPilotRuleTemplate] Template #${templateNumber} created successfully`);

        return {
            success: true,
            message: `Rule template #${templateNumber} created successfully`,
            template: {
                id: newTemplate._id.toString(),
                templateNumber,
                templateName,
                ruleType,
                triggerCondition,
                actionConfig: newTemplate.actionConfig,
                createdAt: newTemplate.createdAt
            }
        };

    } catch (error) {
        console.error('❌ [AddCoPilotRuleTemplate] Error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to create rule template'
        });
    }
});
