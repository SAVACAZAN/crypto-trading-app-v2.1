/**
 * VIX (Volatility Index) Data Endpoint
 *
 * Fetches VIX data from multiple sources:
 * 1. FRED API (VIXCLS) - Historical VIX data from CBOE
 * 2. AlphaVantage (^VIX) - Real-time VIX quote
 *
 * Returns combined data with bot recommendations based on VIX levels
 */

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { source = 'both', limit = 30 } = query

    // Get API keys from environment
    const FRED_API_KEY = process.env.FRED_API_KEY
    const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY

    let fredData = null
    let alphaVantageData = null
    let errors = []

    // Fetch from FRED (Historical VIX data)
    if ((source === 'both' || source === 'fred') && FRED_API_KEY) {
      try {
        const fredUrl = 'https://api.stlouisfed.org/fred/series/observations'
        const fredParams = new URLSearchParams({
          series_id: 'VIXCLS',
          api_key: FRED_API_KEY,
          file_type: 'json',
          limit: limit.toString(),
          sort_order: 'desc'
        })

        const fredResponse = await fetch(`${fredUrl}?${fredParams}`)
        const fredJson = await fredResponse.json()

        if (fredJson.observations) {
          const validObs = fredJson.observations
            .filter(obs => obs.value !== '.')
            .map(obs => ({
              date: obs.date,
              value: parseFloat(obs.value),
              timestamp: new Date(obs.date).getTime()
            }))

          fredData = {
            latest: validObs[0],
            previous: validObs[1],
            change: validObs[0] && validObs[1] ? validObs[0].value - validObs[1].value : null,
            changePercent: validObs[0] && validObs[1]
              ? ((validObs[0].value - validObs[1].value) / validObs[1].value) * 100
              : null,
            history: validObs,
            source: 'FRED (VIXCLS)'
          }
        }
      } catch (error) {
        errors.push({
          source: 'FRED',
          error: error.message
        })
      }
    } else if ((source === 'both' || source === 'fred') && !FRED_API_KEY) {
      errors.push({
        source: 'FRED',
        error: 'FRED_API_KEY not configured'
      })
    }

    // Fetch from AlphaVantage (Real-time VIX quote)
    if ((source === 'both' || source === 'alphavantage') && ALPHA_VANTAGE_API_KEY) {
      try {
        const alphaUrl = 'https://www.alphavantage.co/query'
        const alphaParams = new URLSearchParams({
          function: 'GLOBAL_QUOTE',
          symbol: 'VIX',
          apikey: ALPHA_VANTAGE_API_KEY
        })

        const alphaResponse = await fetch(`${alphaUrl}?${alphaParams}`)
        const alphaJson = await alphaResponse.json()

        if (alphaJson['Global Quote'] && Object.keys(alphaJson['Global Quote']).length > 0) {
          const quote = alphaJson['Global Quote']
          alphaVantageData = {
            symbol: quote['01. symbol'],
            price: parseFloat(quote['05. price']),
            open: parseFloat(quote['02. open']),
            high: parseFloat(quote['03. high']),
            low: parseFloat(quote['04. low']),
            previousClose: parseFloat(quote['08. previous close']),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
            latestTradingDay: quote['07. latest trading day'],
            timestamp: new Date(quote['07. latest trading day']).getTime(),
            source: 'AlphaVantage (Real-time)'
          }
        } else if (alphaJson['Note']) {
          errors.push({
            source: 'AlphaVantage',
            error: 'Rate limit exceeded (5 calls/min, 500 calls/day)'
          })
        }
      } catch (error) {
        errors.push({
          source: 'AlphaVantage',
          error: error.message
        })
      }
    } else if ((source === 'both' || source === 'alphavantage') && !ALPHA_VANTAGE_API_KEY) {
      errors.push({
        source: 'AlphaVantage',
        error: 'ALPHA_VANTAGE_API_KEY not configured'
      })
    }

    // Determine the most current VIX value
    let currentVIX = null
    let vixSource = null

    if (alphaVantageData) {
      currentVIX = alphaVantageData.price
      vixSource = 'AlphaVantage (Real-time)'
    } else if (fredData && fredData.latest) {
      currentVIX = fredData.latest.value
      vixSource = 'FRED (Most recent close)'
    }

    // Generate bot recommendations based on VIX level
    const recommendations = currentVIX ? generateVIXRecommendations(currentVIX) : null

    // Calculate VIX statistics from historical data
    const statistics = fredData ? calculateVIXStatistics(fredData.history) : null

    return {
      success: true,
      vix: {
        current: currentVIX,
        source: vixSource,
        asOf: alphaVantageData?.latestTradingDay || fredData?.latest?.date || null
      },
      fredData,
      alphaVantageData,
      recommendations,
      statistics,
      errors: errors.length > 0 ? errors : null,
      fetchedAt: new Date().toISOString(),
      apiStatus: {
        fred: FRED_API_KEY ? 'configured' : 'missing',
        alphaVantage: ALPHA_VANTAGE_API_KEY ? 'configured' : 'missing'
      }
    }

  } catch (error) {
    console.error('VIX Fetch Error:', error)
    return {
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
  }
})

/**
 * Generate bot recommendations based on VIX level
 */
function generateVIXRecommendations(vix) {
  const recommendations = {
    vix,
    level: getVIXLevel(vix),
    marketCondition: getMarketCondition(vix),
    botActions: [],
    gridBotSettings: {},
    riskLevel: '',
    explanation: ''
  }

  if (vix < 12) {
    // Extremely low volatility (complacency)
    recommendations.riskLevel = 'LOW'
    recommendations.explanation = 'Extreme complacency - Market may be due for shock. Consider tightening stops.'
    recommendations.botActions = [
      'Increase risk appetite cautiously',
      'Narrow grid spacing (tighter ranges)',
      'Use standard position sizes',
      'Watch for sudden volatility spikes'
    ]
    recommendations.gridBotSettings = {
      gridSpacing: 'TIGHT (0.5-1%)',
      positionSize: 'STANDARD',
      stopLoss: 'TIGHT (-3%)',
      takeProfit: 'NORMAL (+2%)'
    }
  } else if (vix < 15) {
    // Low volatility (calm market)
    recommendations.riskLevel = 'LOW-MEDIUM'
    recommendations.explanation = 'Low volatility - Calm market conditions. Safe for normal bot operation.'
    recommendations.botActions = [
      'Normal bot operation',
      'Standard grid parameters',
      'Full position sizes acceptable',
      'Monitor for trend changes'
    ]
    recommendations.gridBotSettings = {
      gridSpacing: 'STANDARD (1-2%)',
      positionSize: 'FULL',
      stopLoss: 'STANDARD (-5%)',
      takeProfit: 'STANDARD (+3%)'
    }
  } else if (vix < 20) {
    // Normal volatility
    recommendations.riskLevel = 'MEDIUM'
    recommendations.explanation = 'Normal volatility - Typical market conditions. Standard risk management.'
    recommendations.botActions = [
      'Normal bot operation',
      'Standard grid parameters',
      'Normal position sizing',
      'Standard stop losses'
    ]
    recommendations.gridBotSettings = {
      gridSpacing: 'STANDARD (1.5-2.5%)',
      positionSize: 'FULL',
      stopLoss: 'STANDARD (-5%)',
      takeProfit: 'STANDARD (+3%)'
    }
  } else if (vix < 25) {
    // Elevated volatility
    recommendations.riskLevel = 'MEDIUM-HIGH'
    recommendations.explanation = 'Elevated volatility - Increased uncertainty. Begin reducing risk.'
    recommendations.botActions = [
      'Reduce position sizes by 20-30%',
      'Widen stop losses',
      'Wider grid spacing',
      'Reduce number of active grids'
    ]
    recommendations.gridBotSettings = {
      gridSpacing: 'WIDE (2-4%)',
      positionSize: 'REDUCED (70-80%)',
      stopLoss: 'WIDE (-7%)',
      takeProfit: 'CONSERVATIVE (+4%)'
    }
  } else if (vix < 30) {
    // High volatility (fear)
    recommendations.riskLevel = 'HIGH'
    recommendations.explanation = 'High volatility - Market fear increasing. Significant risk reduction needed.'
    recommendations.botActions = [
      'Reduce position sizes by 50%',
      'Widen stops significantly',
      'Much wider grid spacing',
      'Consider pausing aggressive strategies'
    ]
    recommendations.gridBotSettings = {
      gridSpacing: 'VERY WIDE (4-6%)',
      positionSize: 'HALF (50%)',
      stopLoss: 'VERY WIDE (-10%)',
      takeProfit: 'CONSERVATIVE (+5%)'
    }
  } else if (vix < 40) {
    // Very high volatility (panic)
    recommendations.riskLevel = 'CRITICAL'
    recommendations.explanation = 'Very high volatility - Market panic. Extreme caution required.'
    recommendations.botActions = [
      'PAUSE most aggressive bots',
      'Reduce position sizes by 70-80%',
      'Extremely wide stops',
      'Only conservative strategies'
    ]
    recommendations.gridBotSettings = {
      gridSpacing: 'EXTREMELY WIDE (6-10%)',
      positionSize: 'MINIMAL (20-30%)',
      stopLoss: 'EXTREMELY WIDE (-15%)',
      takeProfit: 'CONSERVATIVE (+6%)'
    }
  } else {
    // Extreme volatility (crisis)
    recommendations.riskLevel = 'EXTREME'
    recommendations.explanation = 'EXTREME VOLATILITY - Market crisis conditions. Risk-off mode.'
    recommendations.botActions = [
      'PAUSE ALL aggressive bots',
      'Emergency risk-off mode',
      'Consider closing positions',
      'Wait for volatility to subside'
    ]
    recommendations.gridBotSettings = {
      gridSpacing: 'CRISIS MODE (10%+)',
      positionSize: 'MINIMAL (10%)',
      stopLoss: 'EMERGENCY (-20%)',
      takeProfit: 'SURVIVAL (+10%)',
      specialNote: 'CONSIDER PAUSING ALL BOTS'
    }
  }

  return recommendations
}

/**
 * Get VIX level classification
 */
function getVIXLevel(vix) {
  if (vix < 12) return 'EXTREMELY_LOW'
  if (vix < 15) return 'LOW'
  if (vix < 20) return 'NORMAL'
  if (vix < 25) return 'ELEVATED'
  if (vix < 30) return 'HIGH'
  if (vix < 40) return 'VERY_HIGH'
  return 'EXTREME'
}

/**
 * Get market condition description
 */
function getMarketCondition(vix) {
  if (vix < 12) return 'Extreme Complacency'
  if (vix < 15) return 'Low Volatility / Calm'
  if (vix < 20) return 'Normal Volatility'
  if (vix < 25) return 'Elevated Volatility'
  if (vix < 30) return 'High Volatility / Fear'
  if (vix < 40) return 'Very High Volatility / Panic'
  return 'Extreme Volatility / Crisis'
}

/**
 * Calculate VIX statistics from historical data
 */
function calculateVIXStatistics(history) {
  if (!history || history.length === 0) return null

  const values = history.map(h => h.value)

  // Calculate percentiles
  const sortedValues = [...values].sort((a, b) => a - b)
  const p25 = sortedValues[Math.floor(sortedValues.length * 0.25)]
  const p50 = sortedValues[Math.floor(sortedValues.length * 0.50)]
  const p75 = sortedValues[Math.floor(sortedValues.length * 0.75)]
  const p90 = sortedValues[Math.floor(sortedValues.length * 0.90)]

  // Calculate average
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length

  // Calculate standard deviation
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)

  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: parseFloat(avg.toFixed(2)),
    median: p50,
    stdDev: parseFloat(stdDev.toFixed(2)),
    percentiles: {
      p25: parseFloat(p25.toFixed(2)),
      p50: parseFloat(p50.toFixed(2)),
      p75: parseFloat(p75.toFixed(2)),
      p90: parseFloat(p90.toFixed(2))
    },
    interpretation: {
      belowP25: `VIX below ${p25.toFixed(1)} indicates very low fear (bottom 25%)`,
      aboveP75: `VIX above ${p75.toFixed(1)} indicates elevated fear (top 25%)`,
      aboveP90: `VIX above ${p90.toFixed(1)} indicates high fear (top 10%)`
    }
  }
}
