
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    let response = await nitroApp.ccxtw.fetchClosedOrders(query.userID, query.exchange, query.symbol);

    return {
        data: response.data
    }
})
