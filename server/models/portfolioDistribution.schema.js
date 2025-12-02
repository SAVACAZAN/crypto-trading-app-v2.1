import { defineMongooseModel } from '#nuxt/mongoose'

export const portfolioDistributionSchema = defineMongooseModel({
    name: 'portfolioDistribution',
    schema: {
        userID: {
            type: String,
            required: true,
            index: true
        },
        date: {
            type: Date,
            required: true,
            index: true
        },
        // Stablecoins (USDC, USDT, EUR stablecoins, etc)
        stablecoins: {
            totalUSD: {
                type: Number,
                required: true,
                default: 0
            },
            percentage: {
                type: Number,
                required: true,
                default: 0
            },
            breakdown: {
                type: Map,
                of: Number,
                default: {}
            }
        },
        // Other cryptocurrencies
        crypto: {
            totalUSD: {
                type: Number,
                required: true,
                default: 0
            },
            percentage: {
                type: Number,
                required: true,
                default: 0
            },
            breakdown: {
                type: Map,
                of: Number,
                default: {}
            }
        },
        // Total portfolio value
        totalPortfolioUSD: {
            type: Number,
            required: true,
            default: 0
        },
        // Snapshot metadata
        exchanges: [{
            name: String,
            totalUSD: Number
        }],
        timestamp: {
            type: Date,
            required: true,
            default: Date.now
        }
    },
    options: {
        timestamps: true
    }
})
