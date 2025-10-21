
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    // Support apiKeyName parameter for multi-API key functionality
    let response = await nitroApp.ccxtw.fetchOpenOrders(query.userID, query.exchange, query.symbol, query.apiKeyName);

    return {
        data: response.data
    }
})
