import { userExchangesSchema } from "~/server/models/userExchanges.schema";

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const { userID, exchange } = query;

        if (!userID) {
            throw createError({
                statusCode: 400,
                message: 'Missing required parameter: userID'
            });
        }

        // Build query
        const dbQuery = { userID };
        if (exchange) {
            dbQuery.exchange = exchange;
        }

        // Find user exchanges
        const userExchanges = await userExchangesSchema.find(dbQuery);

        if (!userExchanges || userExchanges.length === 0) {
            return {
                success: true,
                data: []
            };
        }

        // Format response with API key status
        const apiKeyStatusList = [];

        for (const exchangeDoc of userExchanges) {
            const apiKeysArray = exchangeDoc.apiKeys || [];

            for (const apiKeyEntry of apiKeysArray) {
                if (apiKeyEntry.name !== undefined) {
                    apiKeyStatusList.push({
                        exchange: exchangeDoc.exchange,
                        apiKeyName: apiKeyEntry.name,
                        isActive: apiKeyEntry.isActive !== false, // Default to true if not set
                        lastError: apiKeyEntry.lastError || null,
                        createdAt: apiKeyEntry.createdAt || null
                    });
                }
            }
        }

        return {
            success: true,
            data: apiKeyStatusList
        };

    } catch (error) {
        console.error('[API] ❌ Error getting API key status:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to get API key status'
        });
    }
});
