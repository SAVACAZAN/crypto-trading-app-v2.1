import { palantirGovernanceSchema } from "~/server/models/palantirGovernance.schema";

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { userID, apiKeyId } = body;

        if (!userID || !apiKeyId) {
            return {
                success: false,
                message: 'Missing required fields: userID, apiKeyId'
            };
        }

        // Find and delete the assignment
        const result = await palantirGovernanceSchema.findOneAndDelete({
            userID,
            apiKeyId
        });

        if (!result) {
            return {
                success: false,
                message: 'No assignment found for this API key'
            };
        }

        return {
            success: true,
            message: 'API key removed from governance level successfully',
            data: result
        };
    } catch (error) {
        console.error('❌ Error removing key from governance level:', error);
        return {
            success: false,
            message: 'Failed to remove key from governance level',
            error: error.message
        };
    }
});
