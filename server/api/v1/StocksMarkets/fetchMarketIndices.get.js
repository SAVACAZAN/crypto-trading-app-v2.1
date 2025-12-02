/**
 * Market Indices Endpoint
 *
 * Fetches major stock market indices using FREE APIs:
 * - S&P 500 (SPY)
 * - NASDAQ (QQQ)
 * - Dow Jones (DIA)
 * - Russell 2000 (IWM)
 *
 * Uses AlphaVantage GLOBAL_QUOTE function for real-time data
 */

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { indices = 'all' } = query

    // Get AlphaVantage API key
    const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY

    if (!ALPHA_VANTAGE_API_KEY) {
      return {
        success: false,
        error: 'ALPHA_VANTAGE_API_KEY not configured',
        message: 'Please add ALPHA_VANTAGE_API_KEY to your .env file'
      }
    }

    // Define major indices
    const indicesMap = {
      sp500: { symbol: 'SPY', name: 'S&P 500', description: 'Top 500 U.S. large-cap stocks' },
      nasdaq: { symbol: 'QQQ', name: 'NASDAQ 100', description: 'Top 100 non-financial NASDAQ stocks' },
      dowjones: { symbol: 'DIA', name: 'Dow Jones Industrial Average', description: '30 large-cap blue-chip stocks' },
      russell2000: { symbol: 'IWM', name: 'Russell 2000', description: 'Small-cap stock index' }
    }

    // Determine which indices to fetch
    let symbolsToFetch = []
    if (indices === 'all') {
      symbolsToFetch = Object.keys(indicesMap)
    } else {
      symbolsToFetch = indices.split(',').filter(idx => indicesMap[idx])
    }

    if (symbolsToFetch.length === 0) {
      return {
        success: false,
        error: 'Invalid indices parameter',
        message: 'Valid values: all, sp500, nasdaq, dowjones, russell2000',
        example: '/api/v1/StocksMarkets/fetchMarketIndices?indices=sp500,nasdaq'
      }
    }

    // Fetch data for each index
    const results = {}
    const errors = []
    const baseUrl = 'https://www.alphavantage.co/query'

    for (const indexKey of symbolsToFetch) {
      const indexInfo = indicesMap[indexKey]

      try {
        const params = new URLSearchParams({
          function: 'GLOBAL_QUOTE',
          symbol: indexInfo.symbol,
          apikey: ALPHA_VANTAGE_API_KEY
        })

        const response = await fetch(`${baseUrl}?${params}`)
        const data = await response.json()

        // Check for rate limit
        if (data['Note']) {
          errors.push({
            index: indexKey,
            error: 'Rate limit exceeded',
            message: data['Note']
          })
          continue
        }

        // Check for API error
        if (data['Error Message']) {
          errors.push({
            index: indexKey,
            error: data['Error Message']
          })
          continue
        }

        // Process quote data
        const quote = data['Global Quote']
        if (quote && Object.keys(quote).length > 0) {
          results[indexKey] = {
            symbol: indexInfo.symbol,
            name: indexInfo.name,
            description: indexInfo.description,
            price: parseFloat(quote['05. price']),
            open: parseFloat(quote['02. open']),
            high: parseFloat(quote['03. high']),
            low: parseFloat(quote['04. low']),
            volume: parseInt(quote['06. volume']),
            latestTradingDay: quote['07. latest trading day'],
            previousClose: parseFloat(quote['08. previous close']),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
            timestamp: new Date(quote['07. latest trading day']).getTime(),
            trend: parseFloat(quote['09. change']) > 0 ? 'UP' : parseFloat(quote['09. change']) < 0 ? 'DOWN' : 'FLAT'
          }
        }

        // Rate limit protection: Wait 13 seconds between calls (5 calls/min = 12 sec + 1 sec buffer)
        if (symbolsToFetch.indexOf(indexKey) < symbolsToFetch.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 13000))
        }

      } catch (error) {
        errors.push({
          index: indexKey,
          error: error.message
        })
      }
    }

    // Calculate market summary
    const marketSummary = calculateMarketSummary(results)

    return {
      success: Object.keys(results).length > 0,
      indices: results,
      summary: marketSummary,
      errors: errors.length > 0 ? errors : null,
      fetchedAt: new Date().toISOString(),
      rateLimits: {
        alphavantage: '5 calls/minute, 500 calls/day',
        note: 'Fetching all 4 indices takes ~52 seconds due to rate limits'
      }
    }

  } catch (error) {
    console.error('Market Indices Fetch Error:', error)
    return {
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
  }
})

/**
 * Calculate overall market summary
 */
function calculateMarketSummary(indices) {
  const indicesArray = Object.values(indices)

  if (indicesArray.length === 0) {
    return null
  }

  // Count trends
  const trends = {
    up: indicesArray.filter(idx => idx.trend === 'UP').length,
    down: indicesArray.filter(idx => idx.trend === 'DOWN').length,
    flat: indicesArray.filter(idx => idx.trend === 'FLAT').length
  }

  // Calculate average change
  const avgChange = indicesArray.reduce((sum, idx) => sum + idx.change, 0) / indicesArray.length
  const avgChangePercent = indicesArray.reduce((sum, idx) => sum + idx.changePercent, 0) / indicesArray.length

  // Determine overall market sentiment
  let sentiment = 'NEUTRAL'
  let sentimentDescription = 'Mixed market conditions'

  if (trends.up >= 3) {
    sentiment = 'BULLISH'
    sentimentDescription = 'Strong upward momentum across major indices'
  } else if (trends.down >= 3) {
    sentiment = 'BEARISH'
    sentimentDescription = 'Downward pressure across major indices'
  } else if (trends.up > trends.down) {
    sentiment = 'SLIGHTLY_BULLISH'
    sentimentDescription = 'Moderate upward bias'
  } else if (trends.down > trends.up) {
    sentiment = 'SLIGHTLY_BEARISH'
    sentimentDescription = 'Moderate downward bias'
  }

  // Bot recommendations based on market sentiment
  const botRecommendations = generateMarketBotRecommendations(sentiment, avgChangePercent, trends)

  return {
    sentiment,
    sentimentDescription,
    trends,
    averageChange: parseFloat(avgChange.toFixed(2)),
    averageChangePercent: parseFloat(avgChangePercent.toFixed(2)),
    totalIndices: indicesArray.length,
    botRecommendations
  }
}

/**
 * Generate bot recommendations based on market sentiment
 */
function generateMarketBotRecommendations(sentiment, avgChangePercent, trends) {
  const recommendations = {
    sentiment,
    riskLevel: '',
    actions: [],
    gridSettings: {},
    correlationNote: ''
  }

  switch (sentiment) {
    case 'BULLISH':
      recommendations.riskLevel = 'LOW-MEDIUM'
      recommendations.actions = [
        'Crypto often follows stock market bullish momentum',
        'Increase long position sizes moderately',
        'Standard grid spacing acceptable',
        'Watch for overbought conditions if rally extends'
      ]
      recommendations.gridSettings = {
        bias: 'LONG',
        gridSpacing: 'STANDARD (1.5-2.5%)',
        positionSize: 'FULL',
        stopLoss: 'STANDARD (-5%)'
      }
      recommendations.correlationNote = 'BTC correlation with S&P 500 typically 0.5-0.7 during bull markets'
      break

    case 'SLIGHTLY_BULLISH':
      recommendations.riskLevel = 'MEDIUM'
      recommendations.actions = [
        'Slight positive bias in stocks',
        'Normal bot operation with slight long bias',
        'Monitor for reversal signals',
        'Standard risk management'
      ]
      recommendations.gridSettings = {
        bias: 'NEUTRAL_TO_LONG',
        gridSpacing: 'STANDARD (1.5-2.5%)',
        positionSize: 'FULL',
        stopLoss: 'STANDARD (-5%)'
      }
      recommendations.correlationNote = 'Weak positive correlation expected'
      break

    case 'NEUTRAL':
      recommendations.riskLevel = 'MEDIUM'
      recommendations.actions = [
        'Mixed market signals - no clear direction',
        'Range-bound trading likely',
        'Favor grid bots over directional strategies',
        'Normal position sizing acceptable'
      ]
      recommendations.gridSettings = {
        bias: 'NEUTRAL',
        gridSpacing: 'STANDARD (1.5-2.5%)',
        positionSize: 'FULL',
        stopLoss: 'STANDARD (-5%)'
      }
      recommendations.correlationNote = 'Low correlation during neutral markets'
      break

    case 'SLIGHTLY_BEARISH':
      recommendations.riskLevel = 'MEDIUM-HIGH'
      recommendations.actions = [
        'Slight negative pressure in stocks',
        'Reduce long exposure slightly',
        'Consider short bias or defensive positioning',
        'Tighten stop losses'
      ]
      recommendations.gridSettings = {
        bias: 'NEUTRAL_TO_SHORT',
        gridSpacing: 'WIDE (2-3.5%)',
        positionSize: 'REDUCED (70-80%)',
        stopLoss: 'TIGHT (-4%)'
      }
      recommendations.correlationNote = 'Moderate correlation during mild selloffs'
      break

    case 'BEARISH':
      recommendations.riskLevel = 'HIGH'
      recommendations.actions = [
        'Strong bearish pressure in stocks',
        'Crypto likely to follow with 1-2 day lag',
        'Reduce position sizes by 40-50%',
        'Consider pausing long-only strategies',
        'Widen grid spacing for volatility'
      ]
      recommendations.gridSettings = {
        bias: 'SHORT_OR_NEUTRAL',
        gridSpacing: 'VERY WIDE (3-5%)',
        positionSize: 'HALF (50%)',
        stopLoss: 'WIDE (-7%)'
      }
      recommendations.correlationNote = 'High correlation (0.7-0.9) during stock market selloffs - crypto follows'
      break
  }

  // Add specific note about magnitude
  if (Math.abs(avgChangePercent) > 2) {
    recommendations.actions.unshift(`⚠️ Large market move (${avgChangePercent > 0 ? '+' : ''}${avgChangePercent.toFixed(2)}%) - expect increased crypto volatility`)
  }

  return recommendations
}
