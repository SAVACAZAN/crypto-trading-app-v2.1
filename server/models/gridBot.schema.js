import { defineMongooseModel } from '#nuxt/mongoose'
export const gridBotSchema = defineMongooseModel({
    name: 'GridBots',
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
            required: true
        },
        deviationPriceSell: {
            type: String,
            required: true
        },
        deviationAmountBuy: {
            type: String,
            required: true
        },
        deviationAmountSell: {
            type: String,
            required: true
        },
        usePriceGroup: {
            type: Boolean,
            required: true
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
    },
})
