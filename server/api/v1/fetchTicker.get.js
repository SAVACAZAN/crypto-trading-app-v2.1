
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    try {
        let response = await nitroApp.ccxtw.fetchTicker(query.userID, query.exchange, query.symbol);

        // console.log(response);

        return {
            data: response.data
        }
    } catch (error) {
        // Gracefully handle missing API keys - return null data instead of throwing error
        if (error.message && error.message.includes('No API keys found')) {
            console.log(`ℹ️ User ${query.userID} has no API keys configured for ${query.exchange}`);
            return {
                data: null,
                noApiKeys: true
            }
        }

        // For other errors, log and return error info
        console.error('Error fetching ticker:', error.message);
        return {
            data: null,
            error: error.message
        }
    }
})
