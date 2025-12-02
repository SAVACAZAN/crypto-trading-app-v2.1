import { defineMongooseModel } from '#nuxt/mongoose'

export const OpenOrdersCacheSchema = defineMongooseModel({
    name: 'OpenOrdersCache',
    schema: {
        userID: {
            type: String,
            required: true,
            index: true
        },
        exchange: {
            type: String,
            required: true,
            index: true
        },
        apiKeyName: {
            type: String,
            required: true,
            index: true
        },
        symbol: {
            type: String,
            required: true,
            index: true
        },
        orders: {
            type: Array,
            default: []
        },
        totalOrders: {
            type: Number,
            default: 0
        },
        buyCount: {
            type: Number,
            default: 0
        },
        sellCount: {
            type: Number,
            default: 0
        },
        lastFetched: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    options: {
        timestamps: true
    }
})
