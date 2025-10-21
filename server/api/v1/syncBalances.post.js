import {balanceSchema} from "~/server/models/balance.schema";
import {userExchangesSchema} from "~/server/models/userExchanges.schema";

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { userID } = body;

        if (!userID) {
            throw createError({
                statusCode: 400,
                statusMessage: 'userID is required'
            });
        }

        // Fetch all exchanges for the user
        const userExchanges = await userExchangesSchema.find({ userID });

        if (!userExchanges || userExchanges.length === 0) {
            return {
                success: true,
                message: 'No exchanges found for user',
                cached: 0
            };
        }

        const results = [];
        let successCount = 0;
        let errorCount = 0;

        // Loop through each exchange and API key combination
        for (const exchangeDoc of userExchanges) {
            const exchange = exchangeDoc.exchange;
            const apiKeysArray = exchangeDoc.apiKeys || [];

            // Handle both old format (flat array) and new format (array with name)
            let apiKeysList = [];
            if (apiKeysArray.length > 0) {
                if (apiKeysArray[0].name !== undefined) {
                    // New format: array of { name, keys: [...] }
                    apiKeysList = apiKeysArray.map(k => k.name);
                } else {
                    // Old format: single unnamed key
                    apiKeysList = ['default'];
                }
            }

            for (const apiKeyName of apiKeysList) {
                try {
                    // Fetch balance from exchange
                    const balanceResponse = await $fetch('/api/v1/fetchBalance', {
                        method: 'GET',
                        params: {
                            userID,
                            exchange,
                            apiKeyName
                        }
                    });

                    if (balanceResponse && balanceResponse.success && balanceResponse.data) {
                        // Calculate total USD value
                        let totalUSD = 0;
                        if (balanceResponse.data.total) {
                            totalUSD = Object.values(balanceResponse.data.total).reduce((sum, val) => {
                                return sum + (typeof val === 'number' ? val : 0);
                            }, 0);
                        }

                        // Upsert balance in database
                        await balanceSchema.findOneAndUpdate(
                            {
                                userID,
                                exchange,
                                apiKeyName
                            },
                            {
                                userID,
                                exchange,
                                apiKeyName,
                                balance: balanceResponse.data,
                                totalUSD,
                                timestamp: new Date(),
                                lastUpdated: new Date()
                            },
                            {
                                upsert: true,
                                new: true
                            }
                        );

                        successCount++;
                        results.push({
                            exchange,
                            apiKeyName,
                            status: 'success',
                            totalUSD
                        });
                    } else {
                        errorCount++;
                        results.push({
                            exchange,
                            apiKeyName,
                            status: 'error',
                            message: balanceResponse?.log || 'Invalid balance response'
                        });
                    }
                } catch (error) {
                    errorCount++;
                    results.push({
                        exchange,
                        apiKeyName,
                        status: 'error',
                        message: error.message
                    });
                }
            }
        }

        return {
            success: true,
            cached: successCount,
            errors: errorCount,
            total: successCount + errorCount,
            results
        };

    } catch (error) {
        console.error('Error syncing balances:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to sync balances'
        });
    }
});
