import { closedOrderHistorySchema } from "~/server/models/closedOrderHistory.schema";
import { syncStateSchema } from "~/server/models/syncState.schema";

/**
 * Cache-First Closed Orders API
 * ALWAYS reads from database, NEVER calls CCXT directly
 * Scheduler updates the cache in background
 */
export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const { userID, exchange, apiKeyName, symbol, limit = 100, offset = 0 } = query;

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
        if (symbol) dbQuery.symbol = symbol;

        // Safety limit: max 100,000 orders per request
        const safeLimit = Math.min(parseInt(limit), 100000);

        console.log(`[API] 📊 getCachedClosedOrders: ${apiKeyName || 'all'} - limit: ${safeLimit}, offset: ${offset}`);

        // Get cached orders from database (sorted by datetime descending)
        const orders = await closedOrderHistorySchema
            .find(dbQuery)
            .sort({ datetime: -1 })
            .limit(safeLimit)
            .skip(parseInt(offset))
            .lean();

        // Get sync state to show cache freshness
        const syncState = await syncStateSchema.findOne({
            userID,
            exchange: exchange || { $exists: true },
            apiKeyName: apiKeyName || { $exists: true },
            syncType: 'closed_orders'
        });

        const cacheAge = syncState?.lastSyncDate
            ? Math.floor((Date.now() - new Date(syncState.lastSyncDate).getTime()) / 1000)
            : null;

        const nextSyncIn = syncState?.nextSyncAllowed
            ? Math.max(0, Math.floor((new Date(syncState.nextSyncAllowed).getTime() - Date.now()) / 1000))
            : null;

        return {
            success: true,
            data: orders,
            meta: {
                cached: true,
                count: orders.length,
                cacheAgeSeconds: cacheAge,
                nextSyncInSeconds: nextSyncIn,
                lastSyncDate: syncState?.lastSyncDate || null,
                totalSynced: syncState?.totalOrdersSynced || 0
            }
        };

    } catch (error) {
        console.error('[API] ❌ Error getting cached closed orders:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to get cached closed orders'
        });
    }
});
