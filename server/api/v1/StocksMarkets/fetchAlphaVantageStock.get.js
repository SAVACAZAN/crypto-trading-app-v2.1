/**
 * AlphaVantage API Integration - Stock Market Data
 *
 * FREE API from AlphaVantage
 * Get your API key at: https://www.alphavantage.co/support/#api-key
 *
 * FREE Tier Rate Limits:
 * - 5 API calls per minute
 * - 500 API calls per day
 *
 * Available Functions:
 * - TIME_SERIES_INTRADAY: Intraday time series (1min, 5min, 15min, 30min, 60min)
 * - TIME_SERIES_DAILY: Daily time series
 * - GLOBAL_QUOTE: Real-time quote (price, volume, change)
 * - OVERVIEW: Company fundamentals (P/E, market cap, EPS, etc.)
 * - Technical Indicators: RSI, MACD, SMA, EMA, BBANDS, etc.
 */

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const {
      symbol = 'SPY', // Default to S&P500 ETF
      function: apiFunction = 'GLOBAL_QUOTE',
      interval = '5min',
      outputsize = 'compact' // compact (100 data points) or full (20+ years)
    } = query

    // Get AlphaVantage API key from environment variables
    const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY

    if (!ALPHA_VANTAGE_API_KEY) {
      return {
        success: false,
        error: 'ALPHA_VANTAGE_API_KEY not configured',
        message: 'Please add ALPHA_VANTAGE_API_KEY to your .env file. Get your free API key at: https://www.alphavantage.co/support/#api-key',
        rateLimits: {
          free: '5 calls/minute, 500 calls/day',
          premium: 'Higher limits available with paid plans'
        }
      }
    }

    // Build AlphaVantage API URL
    const baseUrl = 'https://www.alphavantage.co/query'
    const params = new URLSearchParams({
      function: apiFunction,
      symbol: symbol,
      apikey: ALPHA_VANTAGE_API_KEY
    })

    // Add interval for intraday data
    if (apiFunction === 'TIME_SERIES_INTRADAY') {
      params.append('interval', interval)
      params.append('outputsize', outputsize)
    }

    // Add outputsize for daily data
    if (apiFunction === 'TIME_SERIES_DAILY') {
      params.append('outputsize', outputsize)
    }

    // Fetch data from AlphaVantage API
    const response = await fetch(`${baseUrl}?${params}`)

    if (!response.ok) {
      throw new Error(`AlphaVantage API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Check for API errors or rate limit
    if (data['Error Message']) {
      return {
        success: false,
        error: data['Error Message']
      }
    }

    if (data['Note']) {
      return {
        success: false,
        error: 'Rate limit exceeded',
        message: data['Note'],
        rateLimits: {
          free: '5 calls/minute, 500 calls/day',
          suggestion: 'Wait 1 minute before next request or upgrade to premium'
        }
      }
    }

    if (data['Information']) {
      return {
        success: false,
        error: 'API limit reached',
        message: data['Information']
      }
    }

    // Process data based on function type
    let processedData = null

    switch (apiFunction) {
      case 'GLOBAL_QUOTE':
        processedData = processGlobalQuote(data)
        break

      case 'TIME_SERIES_INTRADAY':
        processedData = processTimeSeries(data, `Time Series (${interval})`)
        break

      case 'TIME_SERIES_DAILY':
        processedData = processTimeSeries(data, 'Time Series (Daily)')
        break

      case 'OVERVIEW':
        processedData = processOverview(data)
        break

      default:
        processedData = data
    }

    return {
      success: true,
      symbol,
      function: apiFunction,
      data: processedData,
      fetchedAt: new Date().toISOString(),
      rateLimits: {
        remaining: 'Check X-RateLimit headers for actual limits',
        resetTime: 'Resets every minute'
      }
    }

  } catch (error) {
    console.error('AlphaVantage API Error:', error)
    return {
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
  }
})

/**
 * Process GLOBAL_QUOTE response
 */
function processGlobalQuote(data) {
  const quote = data['Global Quote']

  if (!quote || Object.keys(quote).length === 0) {
    return null
  }

  return {
    symbol: quote['01. symbol'],
    price: parseFloat(quote['05. price']),
    open: parseFloat(quote['02. open']),
    high: parseFloat(quote['03. high']),
    low: parseFloat(quote['04. low']),
    volume: parseInt(quote['06. volume']),
    latestTradingDay: quote['07. latest trading day'],
    previousClose: parseFloat(quote['08. previous close']),
    change: parseFloat(quote['09. change']),
    changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
    timestamp: new Date(quote['07. latest trading day']).getTime()
  }
}

/**
 * Process TIME_SERIES response (intraday or daily)
 */
function processTimeSeries(data, seriesKey) {
  const metadata = data['Meta Data']
  const timeSeries = data[seriesKey]

  if (!timeSeries) {
    return null
  }

  // Convert object to array and parse values
  const dataPoints = Object.entries(timeSeries).map(([timestamp, values]) => ({
    timestamp,
    time: new Date(timestamp).getTime(),
    open: parseFloat(values['1. open']),
    high: parseFloat(values['2. high']),
    low: parseFloat(values['3. low']),
    close: parseFloat(values['4. close']),
    volume: parseInt(values['5. volume'])
  }))

  // Sort by timestamp descending (most recent first)
  dataPoints.sort((a, b) => b.time - a.time)

  // Calculate statistics
  const latest = dataPoints[0]
  const previous = dataPoints[1]

  const closes = dataPoints.map(d => d.close)
  const volumes = dataPoints.map(d => d.volume)

  return {
    metadata: {
      symbol: metadata['2. Symbol'],
      lastRefreshed: metadata['3. Last Refreshed'],
      interval: metadata['4. Interval'] || 'Daily',
      timezone: metadata['6. Time Zone'] || metadata['5. Time Zone']
    },
    current: {
      price: latest.close,
      open: latest.open,
      high: latest.high,
      low: latest.low,
      volume: latest.volume,
      change: latest.close - previous.close,
      changePercent: ((latest.close - previous.close) / previous.close) * 100,
      timestamp: latest.timestamp
    },
    stats: {
      high24h: Math.max(...closes.slice(0, Math.min(24, closes.length))),
      low24h: Math.min(...closes.slice(0, Math.min(24, closes.length))),
      avgVolume: volumes.reduce((sum, v) => sum + v, 0) / volumes.length,
      priceRange: {
        min: Math.min(...closes),
        max: Math.max(...closes),
        avg: closes.reduce((sum, c) => sum + c, 0) / closes.length
      }
    },
    dataPoints,
    count: dataPoints.length
  }
}

/**
 * Process OVERVIEW response (company fundamentals)
 */
function processOverview(data) {
  if (!data || !data.Symbol) {
    return null
  }

  return {
    symbol: data.Symbol,
    name: data.Name,
    description: data.Description,
    sector: data.Sector,
    industry: data.Industry,
    exchange: data.Exchange,
    marketCap: parseInt(data.MarketCapitalization) || null,
    fundamentals: {
      peRatio: parseFloat(data.PERatio) || null,
      pegRatio: parseFloat(data.PEGRatio) || null,
      bookValue: parseFloat(data.BookValue) || null,
      dividendPerShare: parseFloat(data.DividendPerShare) || null,
      dividendYield: parseFloat(data.DividendYield) || null,
      eps: parseFloat(data.EPS) || null,
      revenuePerShare: parseFloat(data.RevenuePerShareTTM) || null,
      profitMargin: parseFloat(data.ProfitMargin) || null,
      operatingMargin: parseFloat(data.OperatingMarginTTM) || null,
      returnOnAssets: parseFloat(data.ReturnOnAssetsTTM) || null,
      returnOnEquity: parseFloat(data.ReturnOnEquityTTM) || null,
      beta: parseFloat(data.Beta) || null
    },
    price: {
      current: parseFloat(data.Price) || null,
      week52High: parseFloat(data['52WeekHigh']) || null,
      week52Low: parseFloat(data['52WeekLow']) || null,
      day50MA: parseFloat(data['50DayMovingAverage']) || null,
      day200MA: parseFloat(data['200DayMovingAverage']) || null
    },
    analystTarget: parseFloat(data.AnalystTargetPrice) || null
  }
}
