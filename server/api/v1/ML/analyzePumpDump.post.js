import ccxt from 'ccxt';
import { userExchangesSchema } from '~/server/models/userExchanges.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID, symbol, exchange: exchangeName } = body;

    if (!userID || !symbol || !exchangeName) {
      return {
        success: false,
        message: 'Missing required parameters: userID, symbol, and exchange',
      };
    }

    console.log(`[Pump&Dump Analysis] User: ${userID}, Symbol: ${symbol}, Exchange: ${exchangeName}`);

    // Get user exchange credentials
    const userExchange = await userExchangesSchema.findOne({
      userID,
      exchangeName: exchangeName.toLowerCase(),
    });

    if (!userExchange) {
      return {
        success: false,
        message: 'Exchange credentials not found',
      };
    }

    // Initialize CCXT exchange
    const ExchangeClass = ccxt[exchangeName.toLowerCase()];
    if (!ExchangeClass) {
      return {
        success: false,
        message: `Exchange ${exchangeName} not supported`,
      };
    }

    const exchangeInstance = new ExchangeClass({
      apiKey: userExchange.apiKey,
      secret: userExchange.secret,
      password: userExchange.password || undefined,
      enableRateLimit: true,
    });

    // Fetch market data for analysis
    const [ticker, orderBook, trades, ohlcv] = await Promise.all([
      exchangeInstance.fetchTicker(symbol),
      exchangeInstance.fetchOrderBook(symbol, 100),
      exchangeInstance.fetchTrades(symbol, undefined, 100),
      exchangeInstance.fetchOHLCV(symbol, '1m', undefined, 60) // Last 60 minutes
    ]);

    // Perform Pump & Dump Analysis
    const analysis = performPumpDumpAnalysis(ticker, orderBook, trades, ohlcv);

    return {
      success: true,
      message: 'Pump & Dump analysis completed',
      data: analysis,
    };

  } catch (error) {
    console.error('[Pump&Dump Analysis] Error:', error);
    return {
      success: false,
      message: 'Failed to analyze pump & dump',
      error: error.message,
      data: {
        volumeSpike: 0,
        priceDeviation: 0,
        orderBookImbalance: 0,
        suspiciousActivity: false
      }
    };
  }
});

// ML-Based Pump & Dump Detection
function performPumpDumpAnalysis(ticker, orderBook, trades, ohlcv) {
  try {
    // 1. Volume Spike Detection
    const volumeSpike = detectVolumeSpike(ohlcv, ticker);

    // 2. Price Deviation Analysis
    const priceDeviation = detectPriceDeviation(ohlcv, ticker);

    // 3. Order Book Imbalance
    const orderBookImbalance = detectOrderBookImbalance(orderBook);

    // 4. Trade Pattern Analysis
    const tradePattern = analyzeTradePatterns(trades);

    // 5. Correlation Analysis
    const correlation = analyzeCorrelation(ohlcv);

    // 6. Distribution Phase Detection
    const distributionPhase = detectDistributionPhase(ohlcv, trades);

    // Determine if suspicious activity detected
    const suspiciousActivity =
      volumeSpike > 70 ||
      priceDeviation > 70 ||
      orderBookImbalance > 70 ||
      distributionPhase;

    return {
      volumeSpike: Math.min(100, volumeSpike),
      priceDeviation: Math.min(100, priceDeviation),
      orderBookImbalance: Math.min(100, orderBookImbalance),
      tradePattern,
      correlation,
      distributionPhase,
      suspiciousActivity,
      riskLevel: calculateRiskLevel(volumeSpike, priceDeviation, orderBookImbalance),
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    console.error('[Analysis] Error in pump dump detection:', error);
    return {
      volumeSpike: 0,
      priceDeviation: 0,
      orderBookImbalance: 0,
      suspiciousActivity: false,
    };
  }
}

// Volume Spike Detection
function detectVolumeSpike(ohlcv, ticker) {
  if (!ohlcv || ohlcv.length < 10) return 0;

  // Calculate average volume from historical data
  const avgVolume = ohlcv.slice(0, -5).reduce((sum, candle) => sum + candle[5], 0) / (ohlcv.length - 5);

  // Get current volume
  const currentVolume = ticker.quoteVolume || ticker.baseVolume || 0;

  // Calculate spike percentage
  const spikeRatio = (currentVolume / avgVolume) * 100;

  return Math.min(100, spikeRatio);
}

// Price Deviation Analysis
function detectPriceDeviation(ohlcv, ticker) {
  if (!ohlcv || ohlcv.length < 10) return 0;

  // Calculate average price
  const avgPrice = ohlcv.reduce((sum, candle) => sum + candle[4], 0) / ohlcv.length;

  // Get current price
  const currentPrice = ticker.last;

  // Calculate deviation percentage
  const deviation = Math.abs(((currentPrice - avgPrice) / avgPrice) * 100);

  return Math.min(100, deviation * 10); // Amplify for percentage
}

// Order Book Imbalance Detection
function detectOrderBookImbalance(orderBook) {
  if (!orderBook || !orderBook.bids || !orderBook.asks) return 0;

  // Calculate total bid and ask volume
  const bidVolume = orderBook.bids.slice(0, 20).reduce((sum, bid) => sum + bid[1], 0);
  const askVolume = orderBook.asks.slice(0, 20).reduce((sum, ask) => sum + ask[1], 0);

  // Calculate imbalance ratio
  const totalVolume = bidVolume + askVolume;
  const imbalance = Math.abs(bidVolume - askVolume) / totalVolume;

  return Math.min(100, imbalance * 100);
}

// Trade Pattern Analysis
function analyzeTradePatterns(trades) {
  if (!trades || trades.length < 10) {
    return {
      largeTrades: 0,
      buyPressure: 50,
      rapidTrading: false
    };
  }

  // Detect large trades
  const avgTradeSize = trades.reduce((sum, t) => sum + t.amount, 0) / trades.length;
  const largeTrades = trades.filter(t => t.amount > avgTradeSize * 3).length;

  // Calculate buy/sell pressure
  const buys = trades.filter(t => t.side === 'buy').length;
  const sells = trades.filter(t => t.side === 'sell').length;
  const buyPressure = (buys / (buys + sells)) * 100;

  // Detect rapid trading
  const timestamps = trades.map(t => t.timestamp);
  const avgTimeDiff = (timestamps[timestamps.length - 1] - timestamps[0]) / trades.length;
  const rapidTrading = avgTimeDiff < 1000; // Less than 1 second between trades

  return {
    largeTrades,
    buyPressure: Math.round(buyPressure),
    rapidTrading
  };
}

// Correlation Analysis
function analyzeCorrelation(ohlcv) {
  if (!ohlcv || ohlcv.length < 10) return 0;

  // Simple price-volume correlation
  const prices = ohlcv.map(c => c[4]);
  const volumes = ohlcv.map(c => c[5]);

  const correlation = calculateCorrelation(prices, volumes);

  return Math.round(correlation * 100);
}

// Pearson Correlation Coefficient
function calculateCorrelation(x, y) {
  const n = x.length;
  const sum_x = x.reduce((a, b) => a + b, 0);
  const sum_y = y.reduce((a, b) => a + b, 0);
  const sum_xy = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sum_x2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sum_y2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sum_xy - sum_x * sum_y;
  const denominator = Math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y));

  return denominator === 0 ? 0 : numerator / denominator;
}

// Distribution Phase Detection
function detectDistributionPhase(ohlcv, trades) {
  if (!ohlcv || ohlcv.length < 20 || !trades || trades.length < 10) return false;

  // Check for declining volume with stable/increasing price (distribution pattern)
  const recentCandles = ohlcv.slice(-10);
  const olderCandles = ohlcv.slice(-20, -10);

  const recentVolume = recentCandles.reduce((sum, c) => sum + c[5], 0) / 10;
  const olderVolume = olderCandles.reduce((sum, c) => sum + c[5], 0) / 10;

  const volumeDecline = recentVolume < olderVolume * 0.7; // 30% volume decline

  // Check price movement
  const recentPrice = recentCandles[recentCandles.length - 1][4];
  const oldPrice = olderCandles[0][4];
  const priceStable = Math.abs((recentPrice - oldPrice) / oldPrice) < 0.05; // Less than 5% change

  return volumeDecline && priceStable;
}

// Calculate Overall Risk Level
function calculateRiskLevel(volumeSpike, priceDeviation, orderBookImbalance) {
  const avgScore = (volumeSpike + priceDeviation + orderBookImbalance) / 3;

  if (avgScore > 70) return 'CRITICAL';
  if (avgScore > 50) return 'HIGH';
  if (avgScore > 30) return 'MEDIUM';
  return 'LOW';
}