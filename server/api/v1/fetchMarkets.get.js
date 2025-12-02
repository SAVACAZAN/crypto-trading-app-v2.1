import ccxt from 'ccxt'

export default defineEventHandler(async (event) => {
    try {
        const nitroApp = useNitroApp()
        const query = getQuery(event)

        // Try using ccxtw wrapper first
        if (nitroApp.ccxtw) {
            try {
                let response = await nitroApp.ccxtw.fetchMarkets(query.userID, query.exchange)
                return {
                    success: true,
                    markets: response.data
                }
            } catch (err) {
                console.log('ccxtw failed, falling back to direct CCXT:', err.message)
            }
        }

        // Fallback to direct CCXT
        const exchangeName = query.exchange || 'coinbase'

        if (!ccxt[exchangeName]) {
            return {
                success: false,
                message: `Exchange ${exchangeName} not supported`
            }
        }

        const exchange = new ccxt[exchangeName]({
            enableRateLimit: true
        })

        const markets = await exchange.fetchMarkets()

        return {
            success: true,
            markets: markets.map(m => ({
                symbol: m.symbol,
                id: m.id,
                base: m.base,
                quote: m.quote,
                active: m.active
            }))
        }
    } catch (error) {
        console.error('Error fetching markets:', error)
        return {
            success: false,
            message: error.message,
            markets: []
        }
    }
})
