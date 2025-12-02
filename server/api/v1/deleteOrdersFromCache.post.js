import mongoose from 'mongoose'
import { OpenOrdersCacheSchema } from '../../models/openOrdersCache.schema.js'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { userID, exchange, apiKeyName, symbol, orderIds } = body

    console.log('[API deleteOrdersFromCache] Deleting orders from cache:', {
        userID,
        exchange,
        apiKeyName,
        symbol,
        orderCount: orderIds?.length
    })

    try {
        // Get model instance
        const OpenOrdersCache = mongoose.models.OpenOrdersCache || OpenOrdersCacheSchema

        // Find the cache entry for this symbol
        const cacheEntry = await OpenOrdersCache.findOne({
            userID,
            exchange,
            apiKeyName,
            symbol
        })

        if (!cacheEntry) {
            console.log('[API deleteOrdersFromCache] No cache entry found')
            return {
                success: false,
                message: 'No cache entry found'
            }
        }

        // Filter out the cancelled orders
        const originalCount = cacheEntry.orders.length
        cacheEntry.orders = cacheEntry.orders.filter(order => !orderIds.includes(order.id))
        const newCount = cacheEntry.orders.length
        const deletedCount = originalCount - newCount

        // Recalculate counts
        let buyCount = 0
        let sellCount = 0
        cacheEntry.orders.forEach(order => {
            if (order.side === 'buy') buyCount++
            else if (order.side === 'sell') sellCount++
        })

        cacheEntry.totalOrders = newCount
        cacheEntry.buyCount = buyCount
        cacheEntry.sellCount = sellCount
        cacheEntry.updatedAt = new Date()

        // Save updated cache or delete if empty
        if (newCount === 0) {
            await OpenOrdersCache.deleteOne({
                userID,
                exchange,
                apiKeyName,
                symbol
            })
            console.log('[API deleteOrdersFromCache] Cache entry deleted (no orders left)')
        } else {
            await cacheEntry.save()
            console.log('[API deleteOrdersFromCache] Cache updated:', {
                deleted: deletedCount,
                remaining: newCount
            })
        }

        return {
            success: true,
            deletedCount,
            remainingCount: newCount
        }
    } catch (error) {
        console.error('[API deleteOrdersFromCache] Error:', error)
        return {
            success: false,
            error: error.message
        }
    }
})
