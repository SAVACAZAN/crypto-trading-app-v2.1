
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    let response = await nitroApp.ccxtw.fetchBalance(query.userID, query.exchange);

    // console.log(response);

    return {
        data: response.data
    }
})
