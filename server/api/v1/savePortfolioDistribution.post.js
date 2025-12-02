import { portfolioDistributionSchema } from '~/server/models/portfolioDistribution.schema'
import { balanceSchema } from '~/server/models/balance.schema'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userID } = body

    if (!userID) {
      return {
        success: false,
        error: 'userID is required'
      }
    }

    // List of stablecoins
    const stablecoins = ['USDC', 'USDT', 'DAI', 'BUSD', 'TUSD', 'USDD', 'USDP', 'GUSD', 'EUR', 'EURS', 'EURT', 'EURC']

    // Get all current balances for the user
    const balances = await balanceSchema.find({ userID }).lean()

    if (!balances || balances.length === 0) {
      return {
        success: false,
        error: 'No balances found for user'
      }
    }

    let totalPortfolioUSD = 0
    let stablecoinsUSD = 0
    let cryptoUSD = 0
    const stablecoinsBreakdown = {}
    const cryptoBreakdown = {}
    const exchangesSummary = []

    // Process each exchange balance
    for (const bal of balances) {
      const exchangeTotal = bal.totalUSD || 0
      totalPortfolioUSD += exchangeTotal

      exchangesSummary.push({
        name: `${bal.exchange} (${bal.apiKeyName})`,
        totalUSD: exchangeTotal
      })

      // Process individual coins in balance
      if (bal.balance && typeof bal.balance === 'object') {
        for (const [coin, data] of Object.entries(bal.balance)) {
          const coinUSD = data.usd || 0

          if (coinUSD > 0) {
            const coinSymbol = coin.toUpperCase()

            // Check if it's a stablecoin
            const isStablecoin = stablecoins.some(stable =>
              coinSymbol === stable ||
              coinSymbol.includes(stable) ||
              coinSymbol.startsWith('USD') ||
              coinSymbol.startsWith('EUR')
            )

            if (isStablecoin) {
              stablecoinsUSD += coinUSD
              stablecoinsBreakdown[coinSymbol] = (stablecoinsBreakdown[coinSymbol] || 0) + coinUSD
            } else {
              cryptoUSD += coinUSD
              cryptoBreakdown[coinSymbol] = (cryptoBreakdown[coinSymbol] || 0) + coinUSD
            }
          }
        }
      }
    }

    // Calculate percentages
    const stablecoinsPercentage = totalPortfolioUSD > 0 ? (stablecoinsUSD / totalPortfolioUSD) * 100 : 0
    const cryptoPercentage = totalPortfolioUSD > 0 ? (cryptoUSD / totalPortfolioUSD) * 100 : 0

    // Get today's date at midnight
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if we already have a snapshot for today
    const existingSnapshot = await portfolioDistributionSchema.findOne({
      userID,
      date: today
    })

    const distributionData = {
      userID,
      date: today,
      stablecoins: {
        totalUSD: stablecoinsUSD,
        percentage: stablecoinsPercentage,
        breakdown: stablecoinsBreakdown
      },
      crypto: {
        totalUSD: cryptoUSD,
        percentage: cryptoPercentage,
        breakdown: cryptoBreakdown
      },
      totalPortfolioUSD,
      exchanges: exchangesSummary,
      timestamp: new Date()
    }

    let result
    if (existingSnapshot) {
      // Update existing snapshot
      result = await portfolioDistributionSchema.findByIdAndUpdate(
        existingSnapshot._id,
        distributionData,
        { new: true }
      )
    } else {
      // Create new snapshot
      result = await portfolioDistributionSchema.create(distributionData)
    }

    return {
      success: true,
      data: result,
      summary: {
        totalPortfolioUSD,
        stablecoins: {
          usd: stablecoinsUSD,
          percentage: stablecoinsPercentage.toFixed(2) + '%'
        },
        crypto: {
          usd: cryptoUSD,
          percentage: cryptoPercentage.toFixed(2) + '%'
        }
      }
    }
  } catch (error) {
    console.error('Error saving portfolio distribution:', error)
    return {
      success: false,
      error: error.message
    }
  }
})
