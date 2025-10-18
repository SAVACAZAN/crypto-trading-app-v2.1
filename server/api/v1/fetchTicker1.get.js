
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    let response = await nitroApp.ccxtw.fetchTicker1(query.userID, query.exchange1, query.symbol1);

    // console.log(response);

    return {
        data1: response.data
    }
})
