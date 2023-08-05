export default defineEventHandler(async (event) => {
    const nitroApp = useNitroApp()
    const data = await readBody(event)

    let response = await nitroApp.ccxtw.cancelOrder(data.userID, data.exchange, data.id, data.symbol);

    // console.log(response);

    return {
        data: response.data
    }

})
