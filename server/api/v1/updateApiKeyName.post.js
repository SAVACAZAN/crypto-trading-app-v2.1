import {userExchangesSchema} from "~/server/models/userExchanges.schema";

export default defineEventHandler(async (event) => {
    const data = await readBody(event);

    try {
        // Find the exchange document
        const userExchange = await userExchangesSchema.findOne({
            _id: data.id,
            userID: data.userID,
            exchange: data.exchange
        });

        if (!userExchange) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Exchange not found'
            });
        }

        // Handle both old and new format
        if (userExchange.apiKeys && userExchange.apiKeys.length > 0) {
            if (userExchange.apiKeys[0].name !== undefined) {
                // New format: array of { name, keys: [...] }
                if (data.apiKeyIndex !== undefined && userExchange.apiKeys[data.apiKeyIndex]) {
                    userExchange.apiKeys[data.apiKeyIndex].name = data.newName;
                }
            } else {
                // Old format: convert to new format
                const oldKeys = [...userExchange.apiKeys];
                userExchange.apiKeys = [{
                    name: data.newName,
                    keys: oldKeys
                }];
            }

            await userExchange.save();

            return {
                success: true,
                data: userExchange
            };
        }

        throw createError({
            statusCode: 400,
            statusMessage: 'No API keys found'
        });

    } catch (error) {
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to update API key name'
        });
    }
})
