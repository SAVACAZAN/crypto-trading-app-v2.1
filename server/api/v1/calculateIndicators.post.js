import { defineEventHandler, readBody } from 'h3'
import ccxt from 'ccxt'
import IndicatorsCache from '~/server/models/indicatorsCache.schema.js'

// RSI Calculation
function calculateRSI(closes, period = 14) {
  if (closes.length < period + 1) {
    return { rsiData: [], currentRSI: null }
  }

  const rsiData = []

  // Calculate gains and losses
  const changes = []
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1])
  }

  // Calculate initial average gain and loss
  let avgGain = 0
  let avgLoss = 0

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i]
    } else {
      avgLoss += Math.abs(changes[i])
    }
  }

  avgGain /= period
  avgLoss /= period

  // Calculate first RSI
  let rs = avgGain / avgLoss
  let rsi = 100 - (100 / (1 + rs))
  rsiData.push(rsi)

  // Calculate subsequent RSI values using smoothed moving average
  for (let i = period; i < changes.length; i++) {
    const change = changes[i]

    if (change > 0) {
      avgGain = (avgGain * (period - 1) + change) / period
      avgLoss = (avgLoss * (period - 1)) / period
    } else {
      avgGain = (avgGain * (period - 1)) / period
      avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period
    }

    rs = avgGain / avgLoss
    rsi = 100 - (100 / (1 + rs))
    rsiData.push(rsi)
  }

  return {
    rsiData,
    currentRSI: rsiData[rsiData.length - 1]
  }
}

// EMA Calculation (for MACD)
function calculateEMA(data, period) {
  const ema = []
  const multiplier = 2 / (period + 1)

  // Start with SMA for first value
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += data[i]
  }
  ema.push(sum / period)

  // Calculate EMA for remaining values
  for (let i = period; i < data.length; i++) {
    const emaValue = (data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]
    ema.push(emaValue)
  }

  return ema
}

// MACD Calculation
function calculateMACD(closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  if (closes.length < slowPeriod + signalPeriod) {
    return { macdData: [], currentMACD: null }
  }

  // Calculate fast and slow EMAs
  const fastEMA = calculateEMA(closes, fastPeriod)
  const slowEMA = calculateEMA(closes, slowPeriod)

  // Align arrays (slow EMA starts later)
  const startIndex = slowPeriod - fastPeriod
  const macdLine = []

  for (let i = 0; i < slowEMA.length; i++) {
    macdLine.push(fastEMA[i + startIndex] - slowEMA[i])
  }

  // Calculate signal line (EMA of MACD line)
  const signalLine = calculateEMA(macdLine, signalPeriod)

  // Calculate histogram (MACD - Signal)
  const macdData = []
  const histogramStartIndex = signalPeriod - 1

  for (let i = 0; i < signalLine.length; i++) {
    macdData.push({
      macd: macdLine[i + histogramStartIndex],
      signal: signalLine[i],
      histogram: macdLine[i + histogramStartIndex] - signalLine[i]
    })
  }

  return {
    macdData,
    currentMACD: macdData[macdData.length - 1]
  }
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { exchange: exchangeName, symbol, timeframe = '1h', useCache = true } = body

    if (!exchangeName || !symbol) {
      return {
        success: false,
        message: 'Exchange and symbol are required'
      }
    }

    // Check cache first (if enabled)
    if (useCache) {
      try {
        const cachedData = await IndicatorsCache.findOne({
          exchange: exchangeName,
          symbol: symbol,
          timeframe: timeframe
        }).sort({ lastUpdated: -1 })

        // If cache exists and is less than 30 seconds old, return it
        if (cachedData && (Date.now() - cachedData.lastUpdated.getTime()) < 30000) {
          console.log(`✅ Cache hit for ${exchangeName} ${symbol} ${timeframe}`)
          return {
            success: true,
            fromCache: true,
            data: {
              symbol: cachedData.symbol,
              timeframe: cachedData.timeframe,
              exchange: cachedData.exchange,
              dataPoints: cachedData.dataPoints,
              currentPrice: cachedData.rsiData && cachedData.rsiData.length > 0 ? null : null, // Price not stored in cache
              currentRSI: cachedData.currentRSI,
              rsiData: cachedData.rsiData,
              currentMACD: cachedData.currentMACD,
              macdData: cachedData.macdData,
              timestamps: cachedData.timestamps,
              timestamp: cachedData.lastUpdated.toISOString()
            }
          }
        } else if (cachedData) {
          console.log(`⏰ Cache expired for ${exchangeName} ${symbol} ${timeframe}`)
        } else {
          console.log(`❌ No cache found for ${exchangeName} ${symbol} ${timeframe}`)
        }
      } catch (cacheError) {
        console.error('Cache lookup error:', cacheError)
        // Continue to fetch fresh data if cache fails
      }
    }

    // Initialize exchange
    let exchange
    try {
      exchange = new ccxt[exchangeName]({
        enableRateLimit: true,
      })
    } catch (err) {
      return {
        success: false,
        message: `Exchange ${exchangeName} not supported`
      }
    }

    // Check if exchange supports fetchOHLCV
    if (!exchange.has['fetchOHLCV']) {
      return {
        success: false,
        message: `Exchange ${exchangeName} does not support OHLCV data`
      }
    }

    // Fetch OHLCV data
    // Get enough candles for accurate calculations
    // MACD needs slow period (26) + signal period (9) = 35 minimum
    // Get 200 candles for better accuracy
    const limit = 200

    let ohlcv
    try {
      ohlcv = await exchange.fetchOHLCV(symbol, timeframe, undefined, limit)
    } catch (err) {
      console.error('Error fetching OHLCV:', exchangeName, err)
      return {
        success: false,
        message: `Failed to fetch OHLCV data: ${err.message}`
      }
    }

    if (!ohlcv || ohlcv.length === 0) {
      return {
        success: false,
        message: 'No OHLCV data available'
      }
    }

    // Extract close prices and timestamps
    const closes = ohlcv.map(candle => candle[4]) // close price is at index 4
    const timestamps = ohlcv.map(candle => Math.floor(candle[0] / 1000)) // timestamp in seconds
    const currentPrice = closes[closes.length - 1]

    // Calculate RSI
    const rsiResult = calculateRSI(closes, 14)

    // Calculate MACD
    const macdResult = calculateMACD(closes, 12, 26, 9)

    // Save to cache
    try {
      await IndicatorsCache.findOneAndUpdate(
        {
          exchange: exchangeName,
          symbol: symbol,
          timeframe: timeframe
        },
        {
          exchange: exchangeName,
          symbol: symbol,
          timeframe: timeframe,
          rsiData: rsiResult.rsiData,
          currentRSI: rsiResult.currentRSI,
          macdData: macdResult.macdData,
          currentMACD: macdResult.currentMACD,
          timestamps: timestamps.slice(-rsiResult.rsiData.length), // Only keep timestamps that match RSI data length
          lastUpdated: new Date(),
          dataPoints: ohlcv.length
        },
        {
          upsert: true,
          new: true
        }
      )
      console.log(`💾 Saved cache for ${exchangeName} ${symbol} ${timeframe}`)
    } catch (cacheError) {
      console.error('Cache save error:', cacheError)
      // Continue even if cache save fails
    }

    return {
      success: true,
      fromCache: false,
      data: {
        symbol,
        timeframe,
        exchange: exchangeName,
        dataPoints: ohlcv.length,
        currentPrice,
        currentRSI: rsiResult.currentRSI,
        rsiData: rsiResult.rsiData,
        currentMACD: macdResult.currentMACD,
        macdData: macdResult.macdData,
        timestamps: timestamps.slice(-rsiResult.rsiData.length),
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('Error calculating indicators:', error)
    return {
      success: false,
      message: `Failed to calculate indicators: ${error.message}`
    }
  }
})
