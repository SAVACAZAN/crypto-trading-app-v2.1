export default defineEventHandler(async (event) => {
    const nitroApp = useNitroApp()
    const data = await readBody(event)

    let response = await nitroApp.ccxtw.createOrder(data.userID, data.exchange, data.symbol, data.type, data.side, data.amount, data.price);

    // console.log(response);

    return response

})
