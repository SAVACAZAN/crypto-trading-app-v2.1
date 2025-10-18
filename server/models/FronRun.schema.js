import { defineMongooseModel } from '#nuxt/mongoose'
export const FronRunSchema = defineMongooseModel({
    name: 'FrontRun',
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

        activeOrders: {
            type: Array,
            required: true
        },
        filledOrders: {
            type: Array,
            required: true
        },
        // New field for ActiveRANGE logic
        InitialActiveRange: {
            type: Object, // Contains grilaList (Array) and PriceStartInfo (Object)
            required: false,
            default: {
                grilaList: [],
                PriceStartInfo: {}
            }
        },
        // Track how many cycles have been filled
        FilledCycle: {
            type: Number,
            required: false,
            default: 0
        },
        // Track how many times orders were refilled
        ReFilledCycle: {
            type: Number,
            required: false,
            default: 0
        },
        // Flag for whether ActiveRANGE is enabled
        ActiveRANGE: {
            type: Boolean,
            required: false
        },


          // Adăugăm noul câmp pentru PriceStartTRADE
          PriceStartTRADE: {
            price: {
                type: String,
                required: false // va fi populat când ordinul de la PriceStart este filled
            },
            amount: {
                type: String,
                required: false // va fi populat când ordinul de la PriceStart este filled
            }
        }
    },
})
