export default defineEventHandler(async (event) => {
    // Voice command strategies - can be loaded from database in the future
    const strategies = [
        {
            name: 'TOPBOT',
            aliases: ['topbot', 'top bot', 'top robot', 'top'],
            symbol: 'LCX/USDC',
            lowerPrice: 0.035,
            upperPrice: 0.045,
            grids: 20,
            amount: '100',
            amountType: 'quote',
            ordersSide: 'sell',
            description: 'Upper range strategy'
        },
        {
            name: 'MIDBOT',
            aliases: ['midbot', 'mid bot'],
            symbol: 'LCX/USDC',
            lowerPrice: 0.025,
            upperPrice: 0.035,
            grids: 15,
            amount: '100',
            amountType: 'quote',
            ordersSide: 'sell',
            description: 'Middle range strategy'
        },
        {
            name: 'LOWBOT',
            aliases: ['lowbot', 'low bot'],
            symbol: 'LCX/USDC',
            lowerPrice: 0.015,
            upperPrice: 0.025,
            grids: 10,
            amount: '100',
            amountType: 'quote',
            ordersSide: 'sell',
            description: 'Lower range strategy'
        },
        {
            name: 'SCALPER',
            aliases: ['scalper', 'scalp'],
            symbol: 'LCX/USDC',
            lowerPrice: 0.03,
            upperPrice: 0.032,
            grids: 30,
            amount: '100',
            amountType: 'quote',
            ordersSide: 'sell',
            description: 'Tight range, high frequency'
        },
        {
            name: 'HODLER',
            aliases: ['hodler', 'hodl'],
            symbol: 'LCX/USDC',
            lowerPrice: 0.02,
            upperPrice: 0.05,
            grids: 50,
            amount: '100',
            amountType: 'quote',
            ordersSide: 'sell',
            description: 'Wide range, long term'
        },
        {
            name: 'AGGRESSIVE',
            aliases: ['aggressive', 'aggro'],
            symbol: 'LCX/USDC',
            lowerPrice: 0.028,
            upperPrice: 0.038,
            grids: 25,
            amount: '100',
            amountType: 'quote',
            ordersSide: 'sell',
            description: 'Medium-high risk'
        },
        {
            name: 'CONSERVATIVE',
            aliases: ['conservative', 'safe'],
            symbol: 'LCX/USDC',
            lowerPrice: 0.02,
            upperPrice: 0.04,
            grids: 12,
            amount: '100',
            amountType: 'quote',
            ordersSide: 'sell',
            description: 'Safe, low risk'
        },
        {
            name: 'MOONSHOT',
            aliases: ['moonshot', 'moon'],
            symbol: 'LCX/USDC',
            lowerPrice: 0.04,
            upperPrice: 0.06,
            grids: 30,
            amount: '100',
            amountType: 'quote',
            ordersSide: 'sell',
            description: 'Bullish high range'
        },
        {
            name: 'BEARISH',
            aliases: ['bearish', 'bear'],
            symbol: 'LCX/USDC',
            lowerPrice: 0.01,
            upperPrice: 0.02,
            grids: 15,
            amount: '100',
            amountType: 'quote',
            ordersSide: 'buy',
            description: 'Bearish low range'
        },
        {
            name: 'BALANCED',
            aliases: ['balanced', 'balance'],
            symbol: 'LCX/USDC',
            lowerPrice: 0.025,
            upperPrice: 0.04,
            grids: 20,
            amount: '100',
            amountType: 'quote',
            ordersSide: 'sell',
            description: 'Balanced risk/reward'
        }
    ]

    return {
        success: true,
        data: strategies
    }
})
