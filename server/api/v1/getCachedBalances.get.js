import {balanceSchema} from "~/server/models/balance.schema";

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const { userID } = query;

        if (!userID) {
            throw createError({
                statusCode: 400,
                statusMessage: 'userID is required'
            });
        }

        // Fetch all cached balances for the user
        const cachedBalances = await balanceSchema.find({ userID }).sort({ exchange: 1, apiKeyName: 1 });

        return {
            success: true,
            balances: cachedBalances,
            count: cachedBalances.length
        };

    } catch (error) {
        console.error('Error fetching cached balances:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to fetch cached balances'
        });
    }
});
