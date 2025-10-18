
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    let response = await nitroApp.Scalp1ngBotLib.fetchScalp1ngBot(query.userID, query.exchange, query.symbol);

    return {
        data: response
    }
})

