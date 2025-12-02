import { palantirGovernanceSchema } from "~/server/models/palantirGovernance.schema";

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const { userID } = query;

        if (!userID) {
            return {
                success: false,
                message: 'userID is required'
            };
        }

        // Fetch all governance assignments for this user
        const assignments = await palantirGovernanceSchema.find({ userID });

        // Transform to a map of apiKeyId -> governanceLevel for easy lookup
        const assignmentsMap = {};
        assignments.forEach(assignment => {
            assignmentsMap[assignment.apiKeyId] = {
                level: assignment.governanceLevel,
                exchange: assignment.exchange,
                apiKeyName: assignment.apiKeyName,
                assignedAt: assignment.assignedAt,
                notes: assignment.notes
            };
        });

        return {
            success: true,
            data: assignments,
            map: assignmentsMap
        };
    } catch (error) {
        console.error('❌ Error fetching governance assignments:', error);
        return {
            success: false,
            message: 'Failed to fetch governance assignments',
            error: error.message
        };
    }
});
