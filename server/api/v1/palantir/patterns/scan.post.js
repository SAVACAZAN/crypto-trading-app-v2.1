import PatternDetection from '~/server/models/palantir/patternDetection.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userId, symbol, timeframe, patternTypes, metrics } = body;

    if (!userId || !symbol || !timeframe) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: userId, symbol, timeframe'
      });
    }

    // Calculate confidence score based on metrics
    const calculateConfidence = (metrics) => {
      let confidence = 50; // Base confidence

      // Volume factor
      if (Math.abs(metrics.volumeChange) > 50) confidence += 15;
      else if (Math.abs(metrics.volumeChange) > 25) confidence += 10;

      // RSI factor
      if (metrics.rsi < 30 || metrics.rsi > 70) confidence += 10;

      // MACD factor
      if (Math.abs(metrics.macd) > 0.5) confidence += 10;

      // Price change factor
      if (Math.abs(metrics.priceChange) > 5) confidence += 15;

      return Math.min(confidence, 100);
    };

    const detectedPatterns = [];

    // Scan for patterns based on metrics
    for (const patternType of patternTypes || ['pump', 'dump', 'breakout', 'reversal']) {
      let detected = false;
      let signals = [];

      switch (patternType) {
        case 'pump':
          if (metrics.priceChange > 3 && metrics.volumeChange > 30 && metrics.rsi > 60) {
            detected = true;
            signals = ['Strong upward momentum', 'High volume', 'Overbought RSI'];
          }
          break;

        case 'dump':
          if (metrics.priceChange < -3 && metrics.volumeChange > 30 && metrics.rsi < 40) {
            detected = true;
            signals = ['Strong downward momentum', 'High volume', 'Oversold RSI'];
          }
          break;

        case 'breakout':
          if (Math.abs(metrics.priceChange) > 2 && metrics.volumeChange > 40 && Math.abs(metrics.macd) > 0.3) {
            detected = true;
            signals = ['Price breakout', 'Volume surge', 'MACD crossover'];
          }
          break;

        case 'reversal':
          if ((metrics.rsi < 25 && metrics.macd > 0) || (metrics.rsi > 75 && metrics.macd < 0)) {
            detected = true;
            signals = ['Potential reversal', 'RSI extreme', 'MACD divergence'];
          }
          break;

        case 'accumulation':
          if (Math.abs(metrics.priceChange) < 1 && metrics.volumeChange > 20 && metrics.rsi > 45 && metrics.rsi < 55) {
            detected = true;
            signals = ['Low volatility', 'Volume increase', 'Neutral RSI'];
          }
          break;
      }

      if (detected) {
        const confidence = calculateConfidence(metrics);

        const pattern = new PatternDetection({
          userId,
          symbol,
          timeframe,
          patternType,
          confidence,
          metrics: {
            priceChange: metrics.priceChange,
            volumeChange: metrics.volumeChange,
            rsi: metrics.rsi,
            macd: metrics.macd,
            ema20: metrics.ema20,
            sma50: metrics.sma50,
            bollingerUpper: metrics.bollingerUpper,
            bollingerLower: metrics.bollingerLower
          },
          signals,
          price: metrics.currentPrice,
          volume: metrics.currentVolume
        });

        await pattern.save();
        detectedPatterns.push(pattern);

        console.log(`✅ Pattern detected: ${patternType} on ${symbol} (${timeframe}) - Confidence: ${confidence}%`);
      }
    }

    return {
      success: true,
      data: detectedPatterns,
      count: detectedPatterns.length,
      message: detectedPatterns.length > 0
        ? `${detectedPatterns.length} pattern(s) detected`
        : 'No patterns detected'
    };

  } catch (error) {
    console.error('❌ Error scanning for patterns:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to scan for patterns'
    });
  }
});
