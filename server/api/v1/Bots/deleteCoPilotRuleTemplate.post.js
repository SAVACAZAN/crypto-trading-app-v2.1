import { CoPilotRuleTemplateSchema } from '~/server/models/coPilotRuleTemplate.schema';

/**
 * Delete a rule template
 */
export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { userID, templateId } = body;

        if (!userID || !templateId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing required fields'
            });
        }

        console.log('🗑️ [DeleteCoPilotRuleTemplate] Deleting template:', { userID, templateId });

        // Delete template from database
        const deletedTemplate = await CoPilotRuleTemplateSchema.findOneAndDelete({
            _id: templateId,
            userID
        });

        if (!deletedTemplate) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Template not found or you do not have permission to delete it'
            });
        }

        console.log(`✅ [DeleteCoPilotRuleTemplate] Template #${deletedTemplate.templateNumber} deleted successfully`);

        return {
            success: true,
            message: `Template "${deletedTemplate.templateName}" deleted successfully`
        };

    } catch (error) {
        console.error('❌ [DeleteCoPilotRuleTemplate] Error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to delete rule template'
        });
    }
});
