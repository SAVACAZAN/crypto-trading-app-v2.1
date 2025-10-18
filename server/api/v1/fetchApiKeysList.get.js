import {userExchangesSchema} from "~/server/models/userExchanges.schema";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    try {
        // Find the exchange document
        const userExchange = await userExchangesSchema.findOne({
            userID: query.userID,
            exchange: query.exchange
        });

        if (!userExchange) {
            return {
                success: false,
                data: [],
                message: 'Exchange not found'
            };
        }

        let apiKeysList = [];

        // Handle both old and new format
        if (userExchange.apiKeys && userExchange.apiKeys.length > 0) {
            if (userExchange.apiKeys[0].name !== undefined) {
                // New format: array of { name, keys: [...] }
                apiKeysList = userExchange.apiKeys.map(apiKey => ({
                    name: apiKey.name,
                    // Return only first few characters of the actual key for security
                    preview: apiKey.keys.find(k => k.key === 'apiKey')?.value.substring(0, 20) + '...' || 'N/A'
                }));
            } else {
                // Old format: flat array of { key, value }
                apiKeysList = [{
                    name: 'Default',
                    preview: userExchange.apiKeys.find(k => k.key === 'apiKey')?.value.substring(0, 20) + '...' || 'N/A'
                }];
            }
        }

        return {
            success: true,
            data: apiKeysList
        };

    } catch (error) {
        return {
            success: false,
            data: [],
            message: error.message || 'Failed to fetch API keys list'
        };
    }
})
