import mongoose from 'mongoose'
import { OpenOrdersCacheSchema } from '../../models/openOrdersCache.schema.js'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { userID, exchange, apiKeyName, ordersData } = body

    console.log('[API saveOpenOrdersCache] Saving cache for:', { userID, exchange, apiKeyName, symbols: Object.keys(ordersData || {}).length })

    try {
        // Get model instance
        const OpenOrdersCache = mongoose.models.OpenOrdersCache || OpenOrdersCacheSchema

        // Delete existing cache for this user/exchange/apiKey combination
        await OpenOrdersCache.deleteMany({
            userID,
            exchange,
            apiKeyName
        })

        // Save new cache entries for each symbol
        const cacheEntries = []
        for (const [symbol, data] of Object.entries(ordersData)) {
            cacheEntries.push({
                userID,
                exchange,
                apiKeyName,
                symbol,
                orders: data.orders,
                totalOrders: data.totalCount,
                buyCount: data.buyCount,
                sellCount: data.sellCount,
                lastFetched: new Date(),
                updatedAt: new Date()
            })
        }

        if (cacheEntries.length > 0) {
            await OpenOrdersCache.insertMany(cacheEntries)
        }

        console.log('[API saveOpenOrdersCache] Saved', cacheEntries.length, 'cache entries')

        return {
            success: true,
            entriesSaved: cacheEntries.length
        }
    } catch (error) {
        console.error('[API saveOpenOrdersCache] Error:', error)
        return {
            success: false,
            error: error.message
        }
    }
})
