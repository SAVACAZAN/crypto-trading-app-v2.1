import { userExchangesSchema } from "~/server/models/userExchanges.schema";

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { userID, exchange, apiKeyName, isActive } = body;

        if (!userID || !exchange || !apiKeyName) {
            throw createError({
                statusCode: 400,
                message: 'Missing required parameters: userID, exchange, apiKeyName'
            });
        }

        // Find the user's exchange
        const userExchange = await userExchangesSchema.findOne({ userID, exchange });

        if (!userExchange) {
            throw createError({
                statusCode: 404,
                message: `Exchange ${exchange} not found for user`
            });
        }

        // Find the specific API key
        const apiKeysArray = userExchange.apiKeys || [];
        const keyIndex = apiKeysArray.findIndex(k => k.name === apiKeyName);

        if (keyIndex === -1) {
            throw createError({
                statusCode: 404,
                message: `API key ${apiKeyName} not found`
            });
        }

        // Toggle the isActive status
        apiKeysArray[keyIndex].isActive = isActive;

        // Clear error if reactivating
        if (isActive) {
            apiKeysArray[keyIndex].lastError = null;
        }

        // Update the database
        await userExchangesSchema.updateOne(
            { userID, exchange },
            { $set: { apiKeys: apiKeysArray } }
        );

        console.log(`[API] ✅ ${isActive ? 'Activated' : 'Deactivated'} API key: ${exchange} - ${apiKeyName}`);

        return {
            success: true,
            message: `API key ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: {
                exchange,
                apiKeyName,
                isActive
            }
        };

    } catch (error) {
        console.error('[API] ❌ Error toggling API key status:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to toggle API key status'
        });
    }
});
