
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    // Support apiKeyName parameter for multi-API key functionality
    // If symbol is omitted, fetch ALL open orders (more efficient for LCX)
    // Support pagination with offset and limit parameters
    const params = {};
    if (query.offset !== undefined) {
        params.offset = parseInt(query.offset);
    }
    if (query.limit !== undefined) {
        params.limit = parseInt(query.limit);
    }

    // Removed verbose logging to reduce console clutter from grid bots
    // console.log('[API fetchOpenOrders] Request received:', {
    //     userID: query.userID,
    //     exchange: query.exchange,
    //     symbol: query.symbol,
    //     apiKeyName: query.apiKeyName,
    //     offset: params.offset,
    //     limit: params.limit
    // });

    let response = await nitroApp.ccxtw.fetchOpenOrders(query.userID, query.exchange, query.symbol || undefined, query.apiKeyName, params);

    // console.log('[API fetchOpenOrders] Response:', {
    //     ordersCount: response.data ? response.data.length : 0,
    //     success: response.success
    // });

    return {
        data: response.data
    }
})
