import { defineMongooseModel } from '#nuxt/mongoose'
export const candlesSchema = defineMongooseModel({
    name: 'candles',
    schema: {
        exchange: {
            type: String,
            required: true
        },
        symbol: {
            type: String,
            required: true
        },
        timeframe: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            required: true
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
})
