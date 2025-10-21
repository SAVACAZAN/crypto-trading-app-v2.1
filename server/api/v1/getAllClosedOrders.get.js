import { closedOrderHistorySchema } from "~/server/models/closedOrderHistory.schema";

/**
 * Get ALL Closed Orders from Database
 * No limits - returns everything for complete statistics
 */
export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const { userID, exchange, apiKeyName, symbol } = query;

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

        console.log(`[API] 📊 getAllClosedOrders: Starting to fetch ALL orders for ${apiKeyName || 'all API keys'}...`);

        // Get ALL orders from database - NO LIMIT
        const startTime = Date.now();
        const orders = await closedOrderHistorySchema
            .find(dbQuery)
            .sort({ datetime: -1 })
            .lean();

        const duration = Date.now() - startTime;
        console.log(`[API] ✅ getAllClosedOrders: Fetched ${orders.length} orders in ${duration}ms`);

        return {
            success: true,
            data: orders,
            meta: {
                count: orders.length,
                queryTime: duration
            }
        };

    } catch (error) {
        console.error('[API] ❌ Error getting all closed orders:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to get all closed orders'
        });
    }
});