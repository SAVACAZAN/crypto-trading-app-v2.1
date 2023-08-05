
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    let response = await nitroApp.ccxtw.fetchMarkets(query.userID, query.exchange);

    return {
        data: response.data
    }
})
