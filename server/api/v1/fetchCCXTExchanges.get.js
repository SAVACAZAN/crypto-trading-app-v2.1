
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()

    let response = await nitroApp.ccxtw.fetchExchanges();

    return {
        data: response
    }
})
