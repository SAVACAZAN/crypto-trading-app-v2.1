
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    try {
        // Request FULL orderbook depth - undefined means get everything available
        const limit = query.limit || undefined;
        let response = await nitroApp.ccxtw.fetchOrderBook(query.userID, query.exchange, query.symbol, limit);

        return {
            data: response.data
        }
    } catch (error) {
        // Gracefully handle missing API keys - return null data instead of throwing error
        if (error.message && error.message.includes('No API keys found')) {
            console.log(`ℹ️ User ${query.userID} has no API keys configured for ${query.exchange}`);
            return {
                data: null,
                noApiKeys: true
            }
        }

        // For other errors, log and return error info
        console.error('Error fetching order book:', error.message);
        return {
            data: null,
            error: error.message
        }
    }
})
