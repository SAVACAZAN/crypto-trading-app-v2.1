import { getLcxClient, cancelOrdersBulk } from '../../utils/lcxSdkHelper.js'

export default defineEventHandler(async (event) => {
    const data = await readBody(event)

    console.log('[API cancelAllOrdersBySymbol] Request received:', {
        userID: data.userID,
        exchange: data.exchange,
        symbol: data.symbol,
        apiKeyName: data.apiKeyName,
        orderCount: data.orderIds?.length
    })

    console.log('[API cancelAllOrdersBySymbol] 🔍 DEBUG: exchange value:', data.exchange)
    console.log('[API cancelAllOrdersBySymbol] 🔍 DEBUG: exchange === "lcx":', data.exchange === 'lcx')
    console.log('[API cancelAllOrdersBySymbol] 🔍 DEBUG: typeof exchange:', typeof data.exchange)

    // For LCX exchange, use SDK's orderCancelAll (much faster - single API call)
    if (data.exchange === 'lcx') {
        try {
            console.log('[API cancelAllOrdersBySymbol] ✅ Entered LCX SDK path!')
            console.log('[API cancelAllOrdersBySymbol] Using LCX SDK orderCancelAll for bulk cancel...')

            // Get LCX SDK client
            console.log('[API cancelAllOrdersBySymbol] 🔧 Creating LCX SDK client...')
            const lcxClient = await getLcxClient(data.userID, data.apiKeyName)
            console.log('[API cancelAllOrdersBySymbol] ✅ LCX SDK client created successfully')

            // Cancel all orders in one API call
            console.log('[API cancelAllOrdersBySymbol] 📞 Calling cancelOrdersBulk with', data.orderIds.length, 'orders...')
            const result = await cancelOrdersBulk(lcxClient, data.orderIds)
            console.log('[API cancelAllOrdersBySymbol] 📞 cancelOrdersBulk returned:', result)

            if (result.success) {
                console.log('[API cancelAllOrdersBySymbol] ✅ Bulk cancel successful:', result.count, 'orders')

                return {
                    success: true,
                    totalOrders: data.orderIds.length,
                    successCount: result.count,
                    failedCount: 0,
                    errors: [],
                    method: 'SDK orderCancelAll (bulk)'
                }
            } else {
                // If bulk cancel fails, fall back to individual cancellation
                console.warn('[API cancelAllOrdersBySymbol] ⚠️ Bulk cancel failed, falling back to individual cancellation...')
                console.error('[API cancelAllOrdersBySymbol] ❌ Bulk error:', result.error)
            }
        } catch (error) {
            console.error('[API cancelAllOrdersBySymbol] ❌ SDK EXCEPTION caught:', error)
            console.error('[API cancelAllOrdersBySymbol] ❌ Error message:', error.message)
            console.error('[API cancelAllOrdersBySymbol] ❌ Error stack:', error.stack)
            console.error('[API cancelAllOrdersBySymbol] Falling back to individual cancellation')
        }
    }

    // Fallback: Cancel orders individually (for non-LCX or if bulk fails)
    console.log('[API cancelAllOrdersBySymbol] Using individual cancellation with delay...')

    const nitroApp = useNitroApp()
    const results = {
        success: 0,
        failed: 0,
        errors: []
    }

    // Cancel each order one by one with 1500ms delay
    for (let i = 0; i < data.orderIds.length; i++) {
        const orderId = data.orderIds[i]

        try {
            console.log(`[API cancelAllOrdersBySymbol] Canceling order ${i + 1}/${data.orderIds.length}: ${orderId}`)

            const response = await nitroApp.ccxtw.cancelOrder(
                data.userID,
                data.exchange,
                orderId,
                data.symbol,
                data.apiKeyName
            )

            if (response.success) {
                results.success++
            } else {
                results.failed++
                results.errors.push({ orderId, error: response.log })
            }
        } catch (error) {
            console.error(`[API cancelAllOrdersBySymbol] Error canceling ${orderId}:`, error)
            results.failed++
            results.errors.push({ orderId, error: error.message })
        }

        // Delay 1500ms between cancellations (except last one)
        if (i < data.orderIds.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1500))
        }
    }

    console.log('[API cancelAllOrdersBySymbol] Results:', results)

    return {
        success: results.success > 0,
        totalOrders: data.orderIds.length,
        successCount: results.success,
        failedCount: results.failed,
        errors: results.errors,
        method: 'Individual cancellation (fallback)'
    }
})
