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
        apiKeyName: {
            type: String,
            required: false,
            default: null
        },
        apiKeyNames: {
            type: Array,
            required: false,
            default: []
        },
        lowerPrice: {
            type: String,
            required: true
        },
        upperPrice: {
            type: String,
            required: true
        },
        BalanceBotStart: {
            type: String,
            required: false
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
    
        config: {
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
                required: false
            },
            priceGroupSell: {
                type: String,
                required: false
            }
        },
        BalanceBot: {
            // Balances in grid bot orders (current)
            BalanceBase: {
                type: String,
                required: false
            },
            BalanceQuote: {
                type: String,
                required: false
            },
            BalanceBaseInUSD: {
                type: String,
                required: false
            },
            BalanceQuoteInUSD: {
                type: String,
                required: false
            },
            // Total balance snapshot at bot creation (free + used)
            BalanceBaseTotalAtStart: {
                type: String,
                required: false
            },
            BalanceQuoteTotalAtStart: {
                type: String,
                required: false
            },
            BalanceBaseFreeAtStart: {
                type: String,
                required: false
            },
            BalanceQuoteFreeAtStart: {
                type: String,
                required: false
            },
            // Profit tracking
            BalanceBaseProfit: {
                type: String,
                required: false
            },
            BalanceQuoteProfit: {
                type: String,
                required: false
            },
            BalanceBotProfit: {
                type: String,
                required: false
            },
            BalanceBotValInitiala: {
                type: String,
                required: false
            }
        },
        TakeProfitBot: {
            TakeProfitBotSTR1: {
                type: String,
                required: false
            },
            TakeProfitBotSTR2: {
                type: String,
                required: false
            }
        },
        BotAction: {
            BotReset: {
                type: String,
                required: false
            },
            BotCancelOrders: {
                type: String,
                required: false
            },
            BotX1: {
                type: String,
                required: false
            },
            BotX2: {
                type: String,
                required: false
            },
            BotX3: {
                type: String,
                required: false
            },
            BotX4: {
                type: String,
                required: false
            }
        },
        activeOrders: {
            type: Array,
            required: true
        },
        filledOrders: {
            type: Array,
            required: true
        },
        // Grid statistics - tracks fills per price level
        gridStats: {
            type: Array,
            required: false,
            default: []
            // Structure: [
            //   {
            //     price: 0.03,
            //     side: 'buy',
            //     fillCount: 50,
            //     totalVolume: 5000,
            //     totalProfit: 25.50,
            //     lastFilledAt: Date,
            //     firstFilledAt: Date
            //   }
            // ]
        },
        // RSI values at bot creation time (multi-timeframe)
        rsiAtCreation: {
            '1m': { type: Number, required: false },
            '5m': { type: Number, required: false },
            '15m': { type: Number, required: false },
            '30m': { type: Number, required: false },
            '1h': { type: Number, required: false },
            '2h': { type: Number, required: false },
            '6h': { type: Number, required: false },
            '1d': { type: Number, required: false }
        },
        // Current price at bot creation
        priceAtCreation: {
            type: Number,
            required: false
        }
    }
});