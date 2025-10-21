import { defineMongooseModel } from '#nuxt/mongoose'

export const closedOrderHistorySchema = defineMongooseModel({
    name: 'closedOrderHistory',
    schema: {
        // User & Exchange Info
        userID: {
            type: String,
            required: true,
            index: true // Index pentru query rapid
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

        // Order Details
        orderId: {
            type: String,
            required: true,
            unique: true, // Previne duplicate
            index: true
        },
        symbol: {
            type: String,
            required: true,
            index: true // Pentru filtrare după pair
        },
        side: {
            type: String, // 'buy' sau 'sell'
            required: true,
            enum: ['buy', 'sell'],
            index: true
        },
        type: {
            type: String, // 'limit', 'market', etc.
            required: false
        },

        // Pricing & Amounts
        price: {
            type: Number,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        filled: {
            type: Number,
            required: false
        },
        cost: {
            type: Number,
            required: true,
            index: true // Pentru sortare după cost
        },

        // Fees
        fee: {
            cost: {
                type: Number,
                required: false
            },
            currency: {
                type: String,
                required: false
            }
        },

        // Timestamps
        datetime: {
            type: Date,
            required: true,
            index: true // IMPORTANT pentru filtrare după dată
        },
        timestamp: {
            type: Number,
            required: true
        },

        // Status
        status: {
            type: String,
            required: false,
            default: 'closed'
        },

        // Metadata pentru sincronizare
        syncedAt: {
            type: Date,
            default: Date.now,
            index: true
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    options: {
        timestamps: true,
        // Index compus pentru query-uri comune
        indexes: [
            // Query: toate ordinele unui user pentru un exchange
            { userID: 1, exchange: 1, datetime: -1 },

            // Query: ordine pentru user + apiKey + symbol
            { userID: 1, apiKeyName: 1, symbol: 1, datetime: -1 },

            // Query: ordine buy/sell pentru user
            { userID: 1, side: 1, datetime: -1 },

            // Query: ordine după cost (top orders)
            { userID: 1, cost: -1 },

            // Query: ordine într-un interval de timp
            { userID: 1, datetime: -1, syncedAt: -1 }
        ]
    }
})
