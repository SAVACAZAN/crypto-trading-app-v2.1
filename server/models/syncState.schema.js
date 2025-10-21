import { defineMongooseModel } from '#nuxt/mongoose'

/**
 * Schema pentru tracking starea sincronizării closed orders
 * Previne fetch-uri repetitive și optimizează rate limits
 */
export const syncStateSchema = defineMongooseModel({
    name: 'syncState',
    schema: {
        // Identificatori unici
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
            required: false, // null = toate simbolurile
            index: true
        },

        // Sync type (closed_orders, balance, etc.)
        syncType: {
            type: String,
            required: true,
            enum: ['closed_orders', 'balance', 'open_orders'],
            default: 'closed_orders',
            index: true
        },

        // Tracking timestamps
        lastSyncTimestamp: {
            type: Number, // Unix timestamp al ultimei ordine sincronizate
            required: false,
            index: true
        },
        lastSyncDate: {
            type: Date,
            required: false,
            index: true
        },
        nextSyncAllowed: {
            type: Date, // Când este permisă următoarea sincronizare (rate limiting)
            required: false,
            index: true
        },

        // Statistici
        totalOrdersSynced: {
            type: Number,
            default: 0
        },
        lastSyncOrderCount: {
            type: Number,
            default: 0
        },
        consecutiveEmptyFetches: {
            type: Number,
            default: 0 // Crește delay dacă nu sunt ordine noi
        },

        // Metadata
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    options: {
        timestamps: true,
        // Index compus pentru query rapid
        indexes: [
            // Query: sync state pentru user + exchange + apiKey
            { userID: 1, exchange: 1, apiKeyName: 1, syncType: 1, symbol: 1 },

            // Query: găsește toate sincronizările care pot rula acum
            { nextSyncAllowed: 1, syncType: 1 }
        ]
    }
})
