import { defineMongooseModel } from '#nuxt/mongoose'
export const candlesSchema = defineMongooseModel({
    name: 'candles',
    schema: {
        exchange: {
            type: String,
            required: true,
            index: true
        },
        symbol: {
            type: String,
            required: true,
            index: true
        },
        timeframe: {
            type: String,
            required: true,
            index: true
        },
        timestamp: {
            type: Date,
            required: true,
            index: true
        },
        open: {
            type: Number,
            required: true
        },
        high: {
            type: Number,
            required: true
        },
        low: {
            type: Number,
            required: true
        },
        close: {
            type: Number,
            required: true
        },
        volume: {
            type: Number,
            required: true
        },
    },
    options: {
        // Compound index for efficient queries
        indexes: [
            { exchange: 1, symbol: 1, timeframe: 1, timestamp: -1 }
        ]
    }
})
