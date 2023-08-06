import { defineMongooseModel } from '#nuxt/mongoose'
export const dcaBotSchema = defineMongooseModel({
    name: 'DCABots',
    schema: {
        userID: {
            type: String,
            required: true
        },
        isRunning: {
            type: Boolean,
            required: true
        },
        exchange: {
            type: String,
            required: true
        },
        symbol: {
            type: String,
            required: true
        },
        direction: {
            type: String,
            required: true
        },
        baseOrderAmount: {
            type: Number,
            required: true
        },
        baseOrderType: {
            type: String,
            required: true
        },
        takeProfitOrderPercent: {
            type: Number,
            required: true
        },
        safetyOrderAmount: {
            type: Number,
            required: true
        },
        safetyOrderPercent: {
            type: Number,
            required: true
        },
        maxSafetyOrdersCount: {
            type: Number,
            required: true
        },
        stopLossOrderPercent: {
            type: Number,
            required: true
        },
        leverage: {
            type: Number,
            required: true
        },
        marketType: {
            type: String,
            required: true
        },
        dealStartCondition:{
            type: String,
            required: true
        },
        activeDeal:{
            type:Object,
            required: true
        },
        closedDeals:{
            type:Array,
            required: true
        },
        profit: {
            type: Number,
            required: true
        },
        logs: {
            type: Array,
            required: true
        },
    },
})
