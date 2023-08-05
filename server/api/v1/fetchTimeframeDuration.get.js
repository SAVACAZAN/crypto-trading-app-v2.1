export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    const duration = await nitroApp.ccxtw.parseTimeframe(query.userID, query.exchange, query.timeframe) ;

    return duration

})
