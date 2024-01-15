
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    let response = await nitroApp.GridBotsLib.fetchGridBots(query.userID, query.exchange, query.symbol);

    return {
        data: response
    }
})

