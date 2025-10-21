import { balanceSchema } from "~/server/models/balance.schema";

/**
 * Cache-First Balance API
 * ALWAYS reads from database, NEVER calls CCXT directly
 * Scheduler updates the cache in background
 */
export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const { userID, exchange, apiKeyName } = query;

        if (!userID) {
            throw createError({
                statusCode: 400,
                message: 'Missing required parameter: userID'
            });
        }

        // Build query
        const dbQuery = { userID };
        if (exchange) dbQuery.exchange = exchange;
        if (apiKeyName) dbQuery.apiKeyName = apiKeyName;

        // Get cached balance from database
        const balances = await balanceSchema
            .find(dbQuery)
            .sort({ lastUpdated: -1 })
            .lean();

        if (!balances || balances.length === 0) {
            return {
                success: true,
                data: [],
                meta: {
                    cached: true,
                    count: 0,
                    message: 'No cached balance found. Scheduler will update soon.'
                }
            };
        }

        // Calculate cache age for each balance
        const balancesWithMeta = balances.map(bal => {
            const cacheAge = bal.lastUpdated
                ? Math.floor((Date.now() - new Date(bal.lastUpdated).getTime()) / 1000)
                : null;

            return {
                exchange: bal.exchange,
                apiKeyName: bal.apiKeyName,
                balance: bal.balance,
                totalUSD: bal.totalUSD || 0,
                lastUpdated: bal.lastUpdated,
                cacheAgeSeconds: cacheAge
            };
        });

        return {
            success: true,
            data: balancesWithMeta,
            meta: {
                cached: true,
                count: balancesWithMeta.length
            }
        };

    } catch (error) {
        console.error('[API] ❌ Error getting cached balance:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to get cached balance'
        });
    }
});
