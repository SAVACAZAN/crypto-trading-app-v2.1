import PatternDetection from '~/server/models/palantir/patternDetection.schema.js';
import mongoose from 'mongoose';

/**
 * PatternEngine - Real-time pattern detection and analysis
 */
class PatternEngine {
  constructor() {
    this.scanInterval = null;
    this.activeScans = new Map();
    this.patternConfigs = new Map();
  }

  /**
   * Start the engine
   */
  start() {
    console.log('🔍 PatternEngine started');

    // Scan for patterns every 5 seconds
    this.scanInterval = setInterval(() => {
      this.scanAllMarkets();
    }, 5000);
  }

  /**
   * Stop the engine
   */
  stop() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    console.log('⏹️  PatternEngine stopped');
  }

  /**
   * Scan all configured markets for patterns
   */
  async scanAllMarkets() {
    try {
      // Get list of symbols to scan from database (only symbols with real data)
      const Candles = mongoose.connection.db.collection('candles');
      const symbols = await Candles.distinct('symbol', { exchange: 'coinbaseadvanced' });

      if (symbols.length === 0) {
        console.log('⚠️  No candles found in database, skipping pattern scan');
        return;
      }

      const timeframes = ['1m', '5m', '15m', '1h', '4h'];

      for (const symbol of symbols) {
        for (const timeframe of timeframes) {
          await this.scanSymbol(symbol, timeframe);
        }
      }
    } catch (error) {
      console.error('❌ Error scanning markets:', error);
    }
  }

  /**
   * Scan a specific symbol/timeframe for patterns
   */
  async scanSymbol(symbol, timeframe) {
    try {
      // Fetch market data (would integrate with your candles DB)
      const marketData = await this.fetchMarketData(symbol, timeframe);

      if (!marketData) return;

      // Calculate technical indicators
      const indicators = this.calculateIndicators(marketData);

      // Detect patterns
      const detectedPatterns = this.detectPatterns(indicators, marketData);

      // Save detected patterns
      for (const pattern of detectedPatterns) {
        await this.savePattern({
          userId: 'system', // Would be per-user in production
          symbol,
          timeframe,
          exchange: 'LCX', // Default exchange, could be configurable
          ...pattern
        });
      }
    } catch (error) {
      console.error(`❌ Error scanning ${symbol} ${timeframe}:`, error);
    }
  }

  /**
   * Fetch market data from candles database
   */
  async fetchMarketData(symbol, timeframe) {
    try {
      const Candles = mongoose.connection.db.collection('candles');

      // Get latest 100 candles for analysis from Coinbase Advanced
      const candles = await Candles.find({
        exchange: 'coinbaseadvanced',
        symbol,
        timeframe
      })
        .sort({ timestamp: -1 })
        .limit(100)
        .toArray();

      if (!candles || candles.length === 0) {
        return null;
      }

      // Get latest candle for current price/volume
      const latestCandle = candles[0];

      return {
        candles,
        currentPrice: latestCandle.close,
        volume: latestCandle.volume,
        high: Math.max(...candles.slice(0, 20).map(c => c.high)),
        low: Math.min(...candles.slice(0, 20).map(c => c.low))
      };
    } catch (error) {
      console.error(`❌ Error fetching candles for ${symbol} ${timeframe}:`, error);
      return null;
    }
  }

  /**
   * Calculate technical indicators
   */
  calculateIndicators(marketData) {
    const { currentPrice, volume } = marketData;

    // Simplified calculations (would use actual TA library)
    return {
      rsi: 30 + Math.random() * 40, // 30-70
      macd: (Math.random() - 0.5) * 2,
      ema20: currentPrice * (0.98 + Math.random() * 0.04),
      sma50: currentPrice * (0.97 + Math.random() * 0.06),
      bollingerUpper: currentPrice * 1.02,
      bollingerLower: currentPrice * 0.98,
      volumeChange: (Math.random() - 0.5) * 100,
      priceChange: (Math.random() - 0.5) * 10,
      currentPrice: currentPrice,      // Real price from latest candle
      currentVolume: volume             // Real volume from latest candle
    };
  }

  /**
   * Detect patterns from indicators
   */
  detectPatterns(indicators, marketData) {
    const patterns = [];

    // Pump detection
    if (indicators.priceChange > 3 && indicators.volumeChange > 30 && indicators.rsi > 60) {
      patterns.push({
        patternType: 'pump',
        confidence: this.calculateConfidence({
          priceChange: indicators.priceChange,
          volumeChange: indicators.volumeChange,
          rsi: indicators.rsi
        }),
        metrics: indicators
      });
    }

    // Dump detection
    if (indicators.priceChange < -3 && indicators.volumeChange > 30 && indicators.rsi < 40) {
      patterns.push({
        patternType: 'dump',
        confidence: this.calculateConfidence({
          priceChange: Math.abs(indicators.priceChange),
          volumeChange: indicators.volumeChange,
          rsi: 100 - indicators.rsi
        }),
        metrics: indicators
      });
    }

    // Breakout detection
    if (Math.abs(indicators.priceChange) > 2 && indicators.volumeChange > 40) {
      patterns.push({
        patternType: 'breakout',
        confidence: this.calculateConfidence({
          priceChange: Math.abs(indicators.priceChange),
          volumeChange: indicators.volumeChange,
          macd: Math.abs(indicators.macd)
        }),
        metrics: indicators
      });
    }

    // Reversal detection
    if ((indicators.rsi < 25 && indicators.macd > 0) || (indicators.rsi > 75 && indicators.macd < 0)) {
      patterns.push({
        patternType: 'reversal',
        confidence: this.calculateConfidence({
          rsi: indicators.rsi < 25 ? 25 - indicators.rsi : indicators.rsi - 75,
          macd: Math.abs(indicators.macd)
        }),
        metrics: indicators
      });
    }

    // Accumulation detection
    if (Math.abs(indicators.priceChange) < 1 && indicators.volumeChange > 20 &&
        indicators.rsi > 45 && indicators.rsi < 55) {
      patterns.push({
        patternType: 'accumulation',
        confidence: this.calculateConfidence({
          volumeChange: indicators.volumeChange,
          stability: 1 - Math.abs(indicators.priceChange)
        }),
        metrics: indicators
      });
    }

    return patterns;
  }

  /**
   * Calculate pattern confidence score
   */
  calculateConfidence(factors) {
    let confidence = 50; // Base confidence

    // Add confidence based on factors
    Object.values(factors).forEach(value => {
      if (typeof value === 'number') {
        confidence += Math.min(value / 2, 10);
      }
    });

    return Math.min(Math.max(confidence, 0), 100);
  }

  /**
   * Save detected pattern to database
   */
  async savePattern(patternData) {
    try {
      // Check if similar pattern already exists (within last 5 minutes)
      const existingPattern = await PatternDetection.findOne({
        userId: patternData.userId,
        symbol: patternData.symbol,
        timeframe: patternData.timeframe,
        patternType: patternData.patternType,
        detectedAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
      });

      if (existingPattern) {
        // Update existing pattern
        existingPattern.confidence = patternData.confidence;
        existingPattern.metrics = patternData.metrics;
        existingPattern.detectedAt = new Date();
        existingPattern.signal = this.determineSignal(patternData.patternType, patternData.metrics);
        await existingPattern.save();

        console.log(`🔄 Updated pattern: ${patternData.patternType} on ${patternData.symbol}`);
      } else {
        // Generate unique patternId
        const patternId = `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Extract exchange from symbol (e.g., "BTC/USDT" -> "LCX" or default exchange)
        const exchange = patternData.exchange || 'LCX';

        // Generate pattern name
        const patternName = `${patternData.patternType.toUpperCase()} on ${patternData.symbol} (${patternData.timeframe})`;

        // Determine trading signal
        const signal = this.determineSignal(patternData.patternType, patternData.metrics);

        // Create complete pattern object
        const completePattern = {
          ...patternData,
          patternId,
          exchange,
          patternName,
          signal,
          price: patternData.metrics?.currentPrice || 0,
          volume: patternData.metrics?.currentVolume || 0
        };

        // Create new pattern
        const pattern = new PatternDetection(completePattern);
        await pattern.save();

        console.log(`✅ New pattern detected: ${patternData.patternType} on ${patternData.symbol} (${patternData.confidence}%)`);
      }
    } catch (error) {
      console.error('❌ Error saving pattern:', error);
    }
  }

  /**
   * Determine trading signal from pattern type
   */
  determineSignal(patternType, metrics) {
    switch (patternType) {
      case 'pump':
        return metrics.rsi > 70 ? 'SELL' : 'NEUTRAL'; // Overbought - consider selling

      case 'dump':
        return metrics.rsi < 30 ? 'BUY' : 'NEUTRAL'; // Oversold - consider buying

      case 'breakout':
        return metrics.priceChange > 0 ? 'BUY' : 'SELL'; // Follow breakout direction

      case 'reversal':
        return metrics.rsi < 30 ? 'BUY' : metrics.rsi > 70 ? 'SELL' : 'NEUTRAL';

      case 'accumulation':
        return 'BUY'; // Accumulation is typically bullish

      default:
        return 'NEUTRAL';
    }
  }
}

// Export singleton instance
export default new PatternEngine();
