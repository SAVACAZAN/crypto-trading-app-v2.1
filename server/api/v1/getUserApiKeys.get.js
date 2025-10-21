import { userExchangesSchema } from '../../models/userExchanges.schema';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const { userID, exchange } = query;

    if (!userID || !exchange) {
        return {
            success: false,
            error: 'Missing required parameters: userID and exchange'
        };
    }

    try {
        // Find user exchange document
        const userExchange = await userExchangesSchema.findOne({
            userID,
            exchange
        });

        if (!userExchange) {
            return {
                success: true,
                data: [],
                message: 'No exchange configuration found'
            };
        }

        // Extract API keys
        const apiKeys = userExchange.apiKeys || [];

        // Filter active keys and format response
        const activeKeys = apiKeys
            .filter(key => key.isActive !== false)
            .map(key => ({
                name: key.name || 'default',
                isActive: true,
                addedAt: key.addedAt || userExchange.createdAt
            }));

        console.log(`[API-KEYS] Found ${activeKeys.length} active keys for ${exchange}`);

        return {
            success: true,
            data: activeKeys,
            count: activeKeys.length
        };
    } catch (error) {
        console.error('[API-KEYS] Error:', error);
        return {
            success: false,
            error: error.message
        };
    }
});