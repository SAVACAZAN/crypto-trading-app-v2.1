import { CoPilotRuleTemplateSchema } from '~/server/models/coPilotRuleTemplate.schema';

/**
 * Get all rule templates for a user
 */
export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const { userID, includeGlobal } = query;

        if (!userID) {
            throw createError({
                statusCode: 400,
                statusMessage: 'userID is required'
            });
        }

        console.log('📋 [GetCoPilotRuleTemplates] Fetching templates:', { userID, includeGlobal });

        // Build query - get user's templates and optionally global templates
        const searchQuery = {
            $or: [
                { userID },
                ...(includeGlobal === 'true' ? [{ isGlobal: true }] : [])
            ]
        };

        // Fetch templates
        const templates = await CoPilotRuleTemplateSchema.find(searchQuery).sort({ templateNumber: 1 });

        console.log(`✅ [GetCoPilotRuleTemplates] Found ${templates.length} templates`);

        return {
            success: true,
            templates: templates.map(template => ({
                id: template._id.toString(),
                templateNumber: template.templateNumber,
                templateName: template.templateName,
                description: template.description,
                ruleType: template.ruleType,
                triggerCondition: template.triggerCondition,
                actionConfig: template.actionConfig,
                isGlobal: template.isGlobal,
                usageCount: template.usageCount,
                createdAt: template.createdAt
            })),
            total: templates.length
        };

    } catch (error) {
        console.error('❌ [GetCoPilotRuleTemplates] Error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to fetch rule templates'
        });
    }
});
