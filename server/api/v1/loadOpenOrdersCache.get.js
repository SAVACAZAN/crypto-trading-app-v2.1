import mongoose from 'mongoose'
import { OpenOrdersCacheSchema } from '../../models/openOrdersCache.schema.js'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const { userID, exchange, apiKeyName } = query

    console.log('[API loadOpenOrdersCache] Loading cache for:', { userID, exchange, apiKeyName })

    try {
        // Get model instance
        const OpenOrdersCache = mongoose.models.OpenOrdersCache || OpenOrdersCacheSchema

        const cacheEntries = await OpenOrdersCache.find({
            userID,
            exchange,
            apiKeyName
        }).lean()

        console.log('[API loadOpenOrdersCache] Found', cacheEntries.length, 'cache entries')

        // Convert array to object keyed by symbol
        const ordersData = {}
        for (const entry of cacheEntries) {
            ordersData[entry.symbol] = {
                orders: entry.orders,
                totalCount: entry.totalOrders,
                buyCount: entry.buyCount,
                sellCount: entry.sellCount,
                lastFetched: entry.lastFetched
            }
        }

        return {
            success: true,
            data: ordersData,
            cacheAge: cacheEntries.length > 0 ? new Date() - new Date(cacheEntries[0].lastFetched) : null
        }
    } catch (error) {
        console.error('[API loadOpenOrdersCache] Error:', error)
        return {
            success: false,
            data: {},
            error: error.message
        }
    }
})
