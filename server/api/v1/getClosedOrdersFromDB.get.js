import { closedOrderHistorySchema } from "~/server/models/closedOrderHistory.schema";

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const {
            userID,
            exchange,
            apiKeyName,
            symbol,
            side, // 'buy' sau 'sell'
            startDate, // ISO date string
            endDate, // ISO date string
            limit = 10000, // Default 10k pentru a gestiona multe ordine
            skip = 0
        } = query;

        if (!userID) {
            throw createError({
                statusCode: 400,
                statusMessage: 'userID is required'
            });
        }

        // Build filter query
        const filter = { userID };

        if (exchange) {
            filter.exchange = exchange;
        }

        if (apiKeyName) {
            filter.apiKeyName = apiKeyName;
        }

        if (symbol) {
            filter.symbol = symbol;
        }

        if (side) {
            filter.side = side;
        }

        // Date range filter
        if (startDate || endDate) {
            filter.datetime = {};
            if (startDate) {
                filter.datetime.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.datetime.$lte = new Date(endDate);
            }
        }

        // Fetch orders from database
        const orders = await closedOrderHistorySchema
            .find(filter)
            .sort({ datetime: -1 }) // Cele mai recente primul
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .lean(); // Returnează plain JavaScript objects pentru performanță

        // Count total pentru paginare
        const totalCount = await closedOrderHistorySchema.countDocuments(filter);

        // Format response pentru compatibilitate cu frontend-ul existent
        const formattedOrders = orders.map(order => ({
            id: order.orderId,
            symbol: order.symbol,
            side: order.side,
            type: order.type,
            price: order.price,
            amount: order.amount,
            filled: order.filled,
            cost: order.cost,
            fee: order.fee,
            datetime: order.datetime,
            timestamp: order.timestamp,
            status: order.status,
            apiKeyName: order.apiKeyName,
            exchange: order.exchange
        }));

        return {
            success: true,
            data: formattedOrders,
            total: totalCount,
            limit: parseInt(limit),
            skip: parseInt(skip),
            hasMore: (parseInt(skip) + formattedOrders.length) < totalCount
        };

    } catch (error) {
        console.error('[GET-CLOSED-DB] Error fetching closed orders from DB:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to fetch closed orders from database'
        });
    }
});
