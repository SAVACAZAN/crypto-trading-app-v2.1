import { defineMongooseModel } from '#nuxt/mongoose'
export const CoPilotBotSchema = defineMongooseModel({
    name: 'CoPilotBot',
    schema: {
        userID: {
            type: String,
            required: true
        },
        name: {
            type: String,
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
        PriceStart: {
            type: String,
            required: true
        },
        amountPriceStart: {
            type: String,
            required: true
        },
        lowerPrice: {
            type: String,
            required: true
        },
        upperPrice: {
            type: String,
            required: true
        },
        amountType: {
            type: String,
            required: true
        },
        amount: {
            type: String,
            required: true
        },
        nrOfGrids: {
            type: String,
            required: true
        },
        ordersSide: {
            type: String,
            required: true
        },
        incrementalPercentAmountBuy: {
            type: String,
            required: true
        },
        incrementalPercentAmountSell: {
            type: String,
            required: true
        },
        deviationPriceBuy: {
            type: String,
            required: false
        },
        deviationPriceSell: {
            type: String,
            required: false
        },
        deviationAmountBuy: {
            type: String,
            required: false
        },
        deviationAmountSell: {
            type: String,
            required: false
        },
        usePriceGroup: {
            type: Boolean,
            required: false
        },
        priceGroupBuy: {
            type: String,
            required: false,
        },
        priceGroupSell: {
            type: String,
            required: false
        },
        activeOrders: {
            type: Array,
            required: true
        },
        filledOrders: {
            type: Array,
            required: true
        },
        automationRules: {
            type: Array,
            default: [],
            required: false
        },
        ruleCounter: {
            type: Number,
            default: 0,
            required: false
        },
        status: {
            type: String,
            enum: ['running', 'paused', 'stopped'],
            default: 'running'
        },
        apiKeyNames: {
            type: Array,
            default: [],
            required: false
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
})
