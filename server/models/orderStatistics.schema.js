import { defineMongooseModel } from '#nuxt/mongoose'

export const orderStatisticsSchema = defineMongooseModel({
    name: 'orderStatistics',
    schema: {
        // Identificare
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
        symbol: {
            type: String,
            required: true,
            index: true
        },
        apiKeyName: {
            type: String,
            required: false, // null = statistici generale pentru toate API keys
            index: true
        },

        // === STATISTICI GENERALE ===
        totalOrders: {
            type: Number,
            default: 0
        },
        totalVolume: {
            type: Number,
            default: 0
        },
        totalCost: {
            type: Number,
            default: 0
        },
        buyOrders: {
            type: Number,
            default: 0
        },
        sellOrders: {
            type: Number,
            default: 0
        },
        buyVolume: {
            type: Number,
            default: 0
        },
        sellVolume: {
            type: Number,
            default: 0
        },
        buyCost: {
            type: Number,
            default: 0
        },
        sellCost: {
            type: Number,
            default: 0
        },
        averageOrderSize: {
            type: Number,
            default: 0
        },
        averagePrice: {
            type: Number,
            default: 0
        },

        // === TOP ORDERS (Top 50) ===
        topOrdersByVolume: [{
            orderId: String,
            amount: Number,
            price: Number,
            cost: Number,
            side: String,
            datetime: Date,
            apiKeyName: String
        }],
        topOrdersByCost: [{
            orderId: String,
            amount: Number,
            price: Number,
            cost: Number,
            side: String,
            datetime: Date,
            apiKeyName: String
        }],

        // === EXTREME VALUES ===
        highestPriceOrder: {
            orderId: String,
            amount: Number,
            price: Number,
            cost: Number,
            side: String,
            datetime: Date,
            apiKeyName: String
        },
        lowestPriceOrder: {
            orderId: String,
            amount: Number,
            price: Number,
            cost: Number,
            side: String,
            datetime: Date,
            apiKeyName: String
        },
        largestOrder: {
            orderId: String,
            amount: Number,
            price: Number,
            cost: Number,
            side: String,
            datetime: Date,
            apiKeyName: String
        },
        smallestOrder: {
            orderId: String,
            amount: Number,
            price: Number,
            cost: Number,
            side: String,
            datetime: Date,
            apiKeyName: String
        },

        // === LAST TRADES PER API ===
        last1000BuyPerApi: {
            type: Map, // { apiKeyName: [orders] }
            of: [{
                orderId: String,
                amount: Number,
                price: Number,
                cost: Number,
                datetime: Date
            }]
        },
        last1000SellPerApi: {
            type: Map,
            of: [{
                orderId: String,
                amount: Number,
                price: Number,
                cost: Number,
                datetime: Date
            }]
        },

        // === BIG ORDERS ===
        last50Orders1000to2000: [{ // $1K-$2K
            orderId: String,
            amount: Number,
            price: Number,
            cost: Number,
            side: String,
            datetime: Date,
            apiKeyName: String
        }],
        last50Orders2000to5000: [{ // $2K-$5K
            orderId: String,
            amount: Number,
            price: Number,
            cost: Number,
            side: String,
            datetime: Date,
            apiKeyName: String
        }],
        last50OrdersAbove5000: [{ // >$5K
            orderId: String,
            amount: Number,
            price: Number,
            cost: Number,
            side: String,
            datetime: Date,
            apiKeyName: String
        }],

        // === TIME-BASED STATISTICS ===
        ordersByHour: [{ // 24 ore
            hour: Number,
            count: Number,
            buy: Number,
            sell: Number,
            avgBuyPrice: Number,
            avgSellPrice: Number,
            cost: Number
        }],
        ordersByDayOfWeek: [{ // 7 zile
            day: String,
            count: Number,
            buy: Number,
            sell: Number,
            avgBuyPrice: Number,
            avgSellPrice: Number,
            cost: Number
        }],
        last30DaysActivity: [{ // 30 zile
            date: String,
            count: Number,
            buy: Number,
            sell: Number,
            avgBuyPrice: Number,
            avgSellPrice: Number,
            cost: Number
        }],

        // === TRADING PATTERNS ===
        orderSizeDistribution: [{ // 6 range-uri
            label: String,
            min: Number,
            max: Number,
            count: Number,
            total: Number,
            percentage: Number
        }],
        peakTradingTimes: [{ // Top 10 ore
            hour: Number,
            count: Number,
            buy: Number,
            sell: Number,
            cost: Number
        }],
        monthlyComparison: [{ // Per lună
            month: String,
            count: Number,
            buy: Number,
            sell: Number,
            cost: Number
        }],

        // === PERFORMANCE PER API ===
        volumePerApi: [{
            apiKey: String,
            volume: Number
        }],
        costPerApi: [{
            apiKey: String,
            cost: Number,
            buyCost: Number,
            sellCost: Number
        }],
        avgOrderSizePerApi: [{
            apiKey: String,
            avgSize: Number,
            orders: Number
        }],

        // === METADATA ===
        calculatedAt: {
            type: Date,
            default: Date.now,
            index: true
        },
        orderCount: {
            type: Number,
            default: 0
        },
        oldestOrder: {
            type: Date
        },
        newestOrder: {
            type: Date
        },
        calculationDuration: { // ms
            type: Number
        }
    },
    options: {
        timestamps: true,
        indexes: [
            // Query: statistici pentru user + exchange + symbol (toate API keys)
            { userID: 1, exchange: 1, symbol: 1, apiKeyName: 1 },

            // Query: statistici generale (apiKeyName: null)
            { userID: 1, exchange: 1, symbol: 1, apiKeyName: 1, calculatedAt: -1 },

            // Cleanup: ștergere statistici vechi
            { calculatedAt: -1 }
        ]
    }
})
