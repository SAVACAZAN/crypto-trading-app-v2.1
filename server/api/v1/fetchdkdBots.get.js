
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    let response = await nitroApp.DkdBotLib.fetchdkdBots(query.userID, query.exchange, query.symbol);

    return {
        data: response
    }
})

