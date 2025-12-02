export default defineEventHandler(async (event) => {
    const nitroApp = useNitroApp()
    const data = await readBody(event)

    console.log('[API cancelOrder] Request received:', {
        userID: data.userID,
        exchange: data.exchange,
        orderId: data.orderId,
        id: data.id,
        symbol: data.symbol,
        apiKeyName: data.apiKeyName
    });

    // Support both 'id' and 'orderId' parameters
    const orderId = data.orderId || data.id;

    console.log('[API cancelOrder] Calling ccxtw.cancelOrder with orderId:', orderId);

    // Support apiKeyName for multi-API key functionality
    let response = await nitroApp.ccxtw.cancelOrder(data.userID, data.exchange, orderId, data.symbol, data.apiKeyName);

    console.log('[API cancelOrder] Response from ccxtw:', response);

    return {
        data: response.data,
        success: response.success,
        log: response.log
    }

})
