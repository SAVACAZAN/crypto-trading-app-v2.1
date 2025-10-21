import { closedOrderHistorySchema } from "~/server/models/closedOrderHistory.schema";
import { userExchangesSchema } from "~/server/models/userExchanges.schema";

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { userID, symbol, limit = 1000 } = body;

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
                synced: 0
            };
        }

        const results = [];
        let syncedCount = 0;
        let errorCount = 0;
        let duplicateCount = 0;

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
                    console.log(`[SYNC-CLOSED] Fetching closed orders for ${exchange} - ${apiKeyName}...`);

                    // Fetch closed orders from exchange
                    const closedOrdersResponse = await $fetch('/api/v1/fetchClosedOrders', {
                        method: 'GET',
                        params: {
                            userID,
                            exchange,
                            apiKeyName,
                            symbol,
                            limit
                        }
                    });

                    if (closedOrdersResponse && closedOrdersResponse.success && closedOrdersResponse.data) {
                        const orders = closedOrdersResponse.data;

                        // Save each order to database (upsert pentru evitarea duplicatelor)
                        for (const order of orders) {
                            try {
                                await closedOrderHistorySchema.findOneAndUpdate(
                                    {
                                        userID,
                                        exchange,
                                        apiKeyName,
                                        orderId: order.id
                                    },
                                    {
                                        userID,
                                        exchange,
                                        apiKeyName,
                                        orderId: order.id,
                                        symbol: order.symbol,
                                        side: order.side,
                                        type: order.type,
                                        price: order.price || 0,
                                        amount: order.amount || 0,
                                        filled: order.filled || 0,
                                        cost: order.cost || 0,
                                        fee: {
                                            cost: order.fee?.cost || 0,
                                            currency: order.fee?.currency || null
                                        },
                                        datetime: new Date(order.datetime || order.timestamp),
                                        timestamp: order.timestamp,
                                        status: order.status || 'closed',
                                        syncedAt: new Date(),
                                        lastUpdated: new Date()
                                    },
                                    {
                                        upsert: true,
                                        new: true
                                    }
                                );

                                syncedCount++;
                            } catch (dbError) {
                                if (dbError.code === 11000) {
                                    // Duplicate key error - order deja există
                                    duplicateCount++;
                                } else {
                                    console.error(`[SYNC-CLOSED] DB Error for order ${order.id}:`, dbError.message);
                                    errorCount++;
                                }
                            }
                        }

                        results.push({
                            exchange,
                            apiKeyName,
                            status: 'success',
                            ordersProcessed: orders.length
                        });

                        console.log(`[SYNC-CLOSED] ✅ ${exchange} - ${apiKeyName}: ${orders.length} orders processed`);
                    } else {
                        errorCount++;
                        results.push({
                            exchange,
                            apiKeyName,
                            status: 'error',
                            message: closedOrdersResponse?.log || 'Invalid closed orders response'
                        });
                        console.log(`[SYNC-CLOSED] ❌ ${exchange} - ${apiKeyName}: Failed`);
                    }
                } catch (error) {
                    errorCount++;
                    results.push({
                        exchange,
                        apiKeyName,
                        status: 'error',
                        message: error.message
                    });
                    console.error(`[SYNC-CLOSED] ❌ ${exchange} - ${apiKeyName}:`, error.message);
                }
            }
        }

        console.log(`[SYNC-CLOSED] 🎉 Sync completed: ${syncedCount} synced, ${duplicateCount} duplicates, ${errorCount} errors`);

        return {
            success: true,
            synced: syncedCount,
            duplicates: duplicateCount,
            errors: errorCount,
            total: syncedCount + duplicateCount + errorCount,
            results
        };

    } catch (error) {
        console.error('[SYNC-CLOSED] Error syncing closed orders:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to sync closed orders'
        });
    }
});
