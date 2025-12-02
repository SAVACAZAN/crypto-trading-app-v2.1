import { LcxApi, Configuration } from 'lcx-sdk'
import mongoose from 'mongoose'

/**
 * Get LCX SDK client instance for a specific user and API key
 * @param {string} userID - User ID
 * @param {string} apiKeyName - API key name
 * @returns {Promise<LcxApi>} LCX SDK client instance
 */
export async function getLcxClient(userID, apiKeyName) {
    try {
        // Define UserExchange schema inline
        const userExchangeSchema = new mongoose.Schema({
            userID: String,
            exchange: String,
            apiKeys: [mongoose.Schema.Types.Mixed]
        }, { collection: 'userexchanges', strict: false })

        // Get or create model
        const UserExchange = mongoose.models.UserExchange || mongoose.model('UserExchange', userExchangeSchema)

        // Find user's exchange data
        const userExchange = await UserExchange.findOne({
            userID: userID,
            exchange: 'lcx'
        })

        if (!userExchange || !userExchange.apiKeys) {
            throw new Error('User exchange data not found')
        }

        // Find the specific API key
        const apiKeyData = userExchange.apiKeys.find(k => k.apiKeyName === apiKeyName)

        if (!apiKeyData) {
            throw new Error(`API key '${apiKeyName}' not found`)
        }

        // Create LCX SDK configuration
        const lcxConfiguration = new Configuration({
            baseOptions: {
                headers: {
                    'API-KEY': apiKeyData.apiKey,
                    'SECRET-KEY': apiKeyData.apiSecret
                }
            }
        })

        // Return LCX SDK client instance
        return new LcxApi(lcxConfiguration)
    } catch (error) {
        console.error('[lcxSdkHelper] Error creating LCX client:', error)
        throw error
    }
}

/**
 * Cancel multiple orders using LCX SDK's orderCancelAll method
 * @param {LcxApi} lcxClient - LCX SDK client instance
 * @param {string[]} orderIds - Array of order IDs to cancel
 * @returns {Promise<{success: boolean, count: number, error?: string}>}
 */
export async function cancelOrdersBulk(lcxClient, orderIds) {
    try {
        console.log(`[lcxSdkHelper] Canceling ${orderIds.length} orders with orderCancelAll...`)

        const params = {
            orderIds: orderIds
        }

        // Use SDK's orderCancelAll method
        await lcxClient.orderCancelAll(params)

        console.log(`[lcxSdkHelper] ✅ Bulk cancel successful for ${orderIds.length} orders`)

        return {
            success: true,
            count: orderIds.length
        }
    } catch (error) {
        console.error('[lcxSdkHelper] Bulk cancel error:', error.message)

        return {
            success: false,
            count: 0,
            error: error.message
        }
    }
}
