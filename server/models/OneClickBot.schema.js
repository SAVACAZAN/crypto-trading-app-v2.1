import { defineMongooseModel } from '#nuxt/mongoose'
export const OneClickBotSchema = defineMongooseModel({
    name: 'OneClickBots',
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
    
        config: {
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
        }
    }
});