import { defineMongooseModel } from '#nuxt/mongoose'
export const FibBotSchema = defineMongooseModel({
    name: 'FibBot',
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

          // Array for active grid orders
          activeOrders: {
            type: Array,
            default: [], // Default empty array to prevent undefined errors
        },
        // Array for active PriceStart orders
        activeOrdersPriceStart: {
            type: Array,
            default: [], // Default empty array
        },

        // Array for filled orders (could have separate tracking for grid and PriceStart)
        filledOrders: {
            type: Array,
            default: [] // Default empty array
        },

        // New fields to manage the active range of grids and PriceStart
        InitialActiveRange: {
            type: Object, // Contains grilaList and PriceStartInfo
            required: false,
            default: {
                grilaList: [],
                PriceStartInfo: {}
            }
        },

        // Track how many cycles of the grid were filled
        FilledCycle: {
            type: Number,
            default: 0 // Start at 0, to track grid fill cycles
        },

        // Track how many refills occurred in the cycles
        ReFilledCycle: {
            type: Number,
            default: 0 // Start at 0, to track refills in the cycles
        },

        // Boolean flag to activate/deactivate range trading
        ActiveRANGE: {
            type: Boolean,
            default: false // Default false, can be enabled by the user
        },

        // New field for storing PriceStartTRADE details when filled
        PriceStartTRADE: {
            price: {
                type: String,  // Price at which PriceStart trade was filled
                required: false
            },
            amount: {
                type: String,  // Amount filled at PriceStart trade
                required: false
            }
        },

        // Timestamps for creation and updates
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }
});