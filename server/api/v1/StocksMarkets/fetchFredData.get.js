/**
 * FRED API Integration - Federal Reserve Economic Data
 *
 * FREE API from Federal Reserve Bank of St. Louis
 * Get your API key at: https://research.stlouisfed.org/docs/api/api_key.html
 *
 * Rate Limits: NO rate limits for FRED API (very generous)
 *
 * Common Series IDs:
 * - DFF: Federal Funds Rate (daily)
 * - CPIAUCSL: Consumer Price Index (monthly)
 * - UNRATE: Unemployment Rate (monthly)
 * - M2SL: M2 Money Supply (monthly)
 * - GOLDAMGBD228NLBM: Gold Price (daily)
 * - DCOILWTICO: WTI Crude Oil Price (daily)
 * - VIXCLS: VIX Volatility Index (daily)
 * - GDP: Gross Domestic Product (quarterly)
 * - T10Y2Y: 10-Year Treasury minus 2-Year Treasury (daily) - Recession indicator
 */

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { series_id, limit = 100, sort_order = 'desc' } = query

    // Validate required parameters
    if (!series_id) {
      return {
        success: false,
        error: 'Missing required parameter: series_id',
        available_series: {
          interest_rates: ['DFF', 'T10Y2Y', 'DGS10', 'DGS2'],
          inflation: ['CPIAUCSL', 'PCEPI', 'CPILFESL'],
          employment: ['UNRATE', 'PAYEMS', 'ICSA'],
          money_supply: ['M2SL', 'M1SL'],
          commodities: ['GOLDAMGBD228NLBM', 'DCOILWTICO', 'DCOILBRENTEU'],
          market: ['VIXCLS', 'SP500', 'NASDAQCOM'],
          gdp: ['GDP', 'GDPC1', 'A191RL1Q225SBEA']
        }
      }
    }

    // Get FRED API key from environment variables
    const FRED_API_KEY = process.env.FRED_API_KEY

    if (!FRED_API_KEY) {
      return {
        success: false,
        error: 'FRED_API_KEY not configured',
        message: 'Please add FRED_API_KEY to your .env file. Get your free API key at: https://research.stlouisfed.org/docs/api/api_key.html'
      }
    }

    // Build FRED API URL
    const fredUrl = `https://api.stlouisfed.org/fred/series/observations`
    const params = new URLSearchParams({
      series_id: series_id,
      api_key: FRED_API_KEY,
      file_type: 'json',
      limit: limit.toString(),
      sort_order: sort_order
    })

    // Fetch data from FRED API
    const response = await fetch(`${fredUrl}?${params}`)

    if (!response.ok) {
      throw new Error(`FRED API error: ${response.status} ${response.statusText}`)
    }

    const fredData = await response.json()

    // Check for API errors
    if (fredData.error_code) {
      return {
        success: false,
        error: fredData.error_message,
        error_code: fredData.error_code
      }
    }

    // Process and format the data
    const observations = fredData.observations || []

    // Filter out invalid values (marked as '.')
    const validObservations = observations
      .filter(obs => obs.value !== '.')
      .map(obs => ({
        date: obs.date,
        value: parseFloat(obs.value),
        timestamp: new Date(obs.date).getTime()
      }))

    // Calculate statistics
    const values = validObservations.map(obs => obs.value)
    const latest = validObservations[0]
    const previous = validObservations[1]

    const stats = {
      latest: latest?.value || null,
      previous: previous?.value || null,
      change: latest && previous ? latest.value - previous.value : null,
      changePercent: latest && previous ? ((latest.value - previous.value) / previous.value) * 100 : null,
      latestDate: latest?.date || null,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((sum, val) => sum + val, 0) / values.length
    }

    // Get series metadata
    const seriesMetadata = getSeriesMetadata(series_id)

    return {
      success: true,
      series_id,
      metadata: seriesMetadata,
      stats,
      data: validObservations,
      count: validObservations.length,
      fetchedAt: new Date().toISOString()
    }

  } catch (error) {
    console.error('FRED API Error:', error)
    return {
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
  }
})

/**
 * Get metadata for common FRED series
 */
function getSeriesMetadata(series_id) {
  const metadata = {
    // Interest Rates
    'DFF': {
      name: 'Federal Funds Effective Rate',
      unit: 'Percent',
      frequency: 'Daily',
      category: 'Interest Rates',
      description: 'The interest rate at which depository institutions lend reserve balances to other institutions overnight'
    },
    'T10Y2Y': {
      name: '10-Year Treasury Minus 2-Year Treasury',
      unit: 'Percent',
      frequency: 'Daily',
      category: 'Interest Rates',
      description: 'Yield curve spread - negative values often precede recessions'
    },
    'DGS10': {
      name: '10-Year Treasury Constant Maturity Rate',
      unit: 'Percent',
      frequency: 'Daily',
      category: 'Interest Rates',
      description: 'Market yield on U.S. Treasury securities at 10-year constant maturity'
    },
    'DGS2': {
      name: '2-Year Treasury Constant Maturity Rate',
      unit: 'Percent',
      frequency: 'Daily',
      category: 'Interest Rates',
      description: 'Market yield on U.S. Treasury securities at 2-year constant maturity'
    },

    // Inflation
    'CPIAUCSL': {
      name: 'Consumer Price Index for All Urban Consumers',
      unit: 'Index 1982-1984=100',
      frequency: 'Monthly',
      category: 'Inflation',
      description: 'Measure of the average change over time in prices paid by urban consumers'
    },
    'PCEPI': {
      name: 'Personal Consumption Expenditures Price Index',
      unit: 'Index 2017=100',
      frequency: 'Monthly',
      category: 'Inflation',
      description: "Fed's preferred inflation measure"
    },
    'CPILFESL': {
      name: 'Consumer Price Index - Less Food and Energy',
      unit: 'Index 1982-1984=100',
      frequency: 'Monthly',
      category: 'Inflation',
      description: 'Core CPI excluding volatile food and energy prices'
    },

    // Employment
    'UNRATE': {
      name: 'Unemployment Rate',
      unit: 'Percent',
      frequency: 'Monthly',
      category: 'Employment',
      description: 'The unemployment rate represents the number of unemployed as a percentage of the labor force'
    },
    'PAYEMS': {
      name: 'All Employees, Total Nonfarm',
      unit: 'Thousands of Persons',
      frequency: 'Monthly',
      category: 'Employment',
      description: 'Total nonfarm payroll employment (Non-Farm Payrolls - NFP)'
    },
    'ICSA': {
      name: 'Initial Jobless Claims',
      unit: 'Number',
      frequency: 'Weekly',
      category: 'Employment',
      description: 'Number of people filing for unemployment insurance for the first time'
    },

    // Money Supply
    'M2SL': {
      name: 'M2 Money Supply',
      unit: 'Billions of Dollars',
      frequency: 'Monthly',
      category: 'Money Supply',
      description: 'M2 includes M1 plus savings deposits, money market deposits, and other near money'
    },
    'M1SL': {
      name: 'M1 Money Supply',
      unit: 'Billions of Dollars',
      frequency: 'Monthly',
      category: 'Money Supply',
      description: 'M1 includes currency, demand deposits, and other liquid deposits'
    },

    // Commodities
    'GOLDAMGBD228NLBM': {
      name: 'Gold Fixing Price (London)',
      unit: 'U.S. Dollars per Troy Ounce',
      frequency: 'Daily',
      category: 'Commodities',
      description: 'Gold price in USD - safe haven asset indicator'
    },
    'DCOILWTICO': {
      name: 'Crude Oil Prices: West Texas Intermediate (WTI)',
      unit: 'Dollars per Barrel',
      frequency: 'Daily',
      category: 'Commodities',
      description: 'Spot price of WTI crude oil'
    },
    'DCOILBRENTEU': {
      name: 'Crude Oil Prices: Brent',
      unit: 'Dollars per Barrel',
      frequency: 'Daily',
      category: 'Commodities',
      description: 'Spot price of Brent crude oil (Europe benchmark)'
    },

    // Market Indicators
    'VIXCLS': {
      name: 'CBOE Volatility Index: VIX',
      unit: 'Index',
      frequency: 'Daily',
      category: 'Market',
      description: 'Market fear index - measures expected volatility over next 30 days'
    },
    'SP500': {
      name: 'S&P 500',
      unit: 'Index',
      frequency: 'Daily',
      category: 'Market',
      description: 'S&P 500 stock market index'
    },
    'NASDAQCOM': {
      name: 'NASDAQ Composite Index',
      unit: 'Index',
      frequency: 'Daily',
      category: 'Market',
      description: 'NASDAQ Composite stock market index'
    },

    // GDP
    'GDP': {
      name: 'Gross Domestic Product',
      unit: 'Billions of Dollars',
      frequency: 'Quarterly',
      category: 'GDP',
      description: 'Total market value of goods and services produced in the U.S.'
    },
    'GDPC1': {
      name: 'Real Gross Domestic Product',
      unit: 'Billions of Chained 2017 Dollars',
      frequency: 'Quarterly',
      category: 'GDP',
      description: 'GDP adjusted for inflation'
    },
    'A191RL1Q225SBEA': {
      name: 'Real GDP Growth Rate',
      unit: 'Percent Change',
      frequency: 'Quarterly',
      category: 'GDP',
      description: 'Quarterly percent change in real GDP at annual rate'
    }
  }

  return metadata[series_id] || {
    name: series_id,
    unit: 'Unknown',
    frequency: 'Unknown',
    category: 'Unknown',
    description: 'No metadata available for this series'
  }
}
