import { palantirGovernanceSchema } from "~/server/models/palantirGovernance.schema";

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { userID, apiKeyId, exchange, apiKeyName, governanceLevel, notes } = body;

        // Validate required fields
        if (!userID || !apiKeyId || !exchange || !apiKeyName || !governanceLevel) {
            return {
                success: false,
                message: 'Missing required fields: userID, apiKeyId, exchange, apiKeyName, governanceLevel'
            };
        }

        // Check if this API key is already assigned to a governance level
        const existingAssignment = await palantirGovernanceSchema.findOne({
            userID,
            apiKeyId
        });

        if (existingAssignment) {
            // Update existing assignment
            existingAssignment.governanceLevel = governanceLevel;
            existingAssignment.exchange = exchange;
            existingAssignment.apiKeyName = apiKeyName;
            existingAssignment.notes = notes || '';
            existingAssignment.assignedAt = new Date();

            await existingAssignment.save();

            return {
                success: true,
                message: 'Governance assignment updated successfully',
                data: existingAssignment
            };
        } else {
            // Create new assignment
            const newAssignment = await palantirGovernanceSchema.create({
                userID,
                apiKeyId,
                exchange,
                apiKeyName,
                governanceLevel,
                notes: notes || '',
                assignedAt: new Date()
            });

            return {
                success: true,
                message: 'API key assigned to governance level successfully',
                data: newAssignment
            };
        }
    } catch (error) {
        console.error('❌ Error assigning key to governance level:', error);
        return {
            success: false,
            message: 'Failed to assign key to governance level',
            error: error.message
        };
    }
});
