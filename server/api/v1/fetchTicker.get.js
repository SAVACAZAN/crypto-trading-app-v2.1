
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    let response = await nitroApp.ccxtw.fetchTicker(query.userID, query.exchange, query.symbol);

    // console.log(response);

    return {
        data: response.data
    }
})
