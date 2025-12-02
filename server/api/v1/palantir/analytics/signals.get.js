import PatternDetection from '~/server/models/palantir/patternDetection.schema.js';
import BotChain from '~/server/models/palantir/botChain.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { userId, symbol, minConfidence, limit } = query;

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'userId is required'
      });
    }

    const signalLimit = limit ? parseInt(limit) : 20;
    const confidenceThreshold = minConfidence ? parseFloat(minConfidence) : 60;

    // Get recent pattern detections
    const patternFilter = { userId };
    if (symbol) patternFilter.symbol = symbol;
    if (minConfidence) patternFilter.confidence = { $gte: confidenceThreshold };

    const recentPatterns = await PatternDetection.find(patternFilter)
      .sort({ detectedAt: -1 })
      .limit(signalLimit)
      .lean();

    // Get active bot chains
    const activeChains = await BotChain.find({
      userId,
      status: 'running'
    })
      .select('chainId name currentNode status totalProfit executionCount')
      .limit(10)
      .lean();

    // Generate trading signals from patterns
    const tradingSignals = recentPatterns.map(pattern => {
      const signal = generateSignalFromPattern(pattern);
      return {
        id: pattern._id,
        type: 'pattern',
        timestamp: pattern.detectedAt,
        symbol: pattern.symbol,
        timeframe: pattern.timeframe,
        action: signal.action,
        confidence: pattern.confidence,
        reason: signal.reason,
        priceTarget: signal.priceTarget,
        stopLoss: signal.stopLoss,
        patternType: pattern.patternType,
        metrics: pattern.metrics
      };
    });

    // Generate signals from bot chains
    const chainSignals = activeChains.map(chain => ({
      id: chain._id,
      type: 'chain',
      timestamp: chain.updatedAt,
      chainId: chain.chainId,
      chainName: chain.name,
      status: chain.status,
      currentNode: chain.currentNode,
      profit: chain.totalProfit || 0,
      executionCount: chain.executionCount,
      action: chain.totalProfit > 0 ? 'HOLD' : 'MONITOR'
    }));

    // Combine and sort all signals
    const allSignals = [...tradingSignals, ...chainSignals]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, signalLimit);

    // Calculate signal statistics
    const stats = {
      total: allSignals.length,
      patterns: tradingSignals.length,
      chains: chainSignals.length,
      buySignals: tradingSignals.filter(s => s.action === 'BUY').length,
      sellSignals: tradingSignals.filter(s => s.action === 'SELL').length,
      holdSignals: tradingSignals.filter(s => s.action === 'HOLD').length,
      avgConfidence: tradingSignals.length > 0
        ? (tradingSignals.reduce((sum, s) => sum + s.confidence, 0) / tradingSignals.length).toFixed(1)
        : 0
    };

    return {
      success: true,
      data: allSignals,
      stats,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Error fetching signals:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch signals'
    });
  }
});

// Helper function to generate trading signal from pattern
function generateSignalFromPattern(pattern) {
  let action = 'HOLD';
  let reason = '';
  let priceTarget = null;
  let stopLoss = null;

  const price = pattern.price || 50000;

  switch (pattern.patternType) {
    case 'pump':
      action = pattern.confidence > 75 ? 'SELL' : 'HOLD';
      reason = 'Pump detected - potential reversal incoming';
      priceTarget = price * 1.02;
      stopLoss = price * 0.97;
      break;

    case 'dump':
      action = pattern.confidence > 75 ? 'BUY' : 'HOLD';
      reason = 'Dump detected - potential bounce opportunity';
      priceTarget = price * 1.05;
      stopLoss = price * 0.95;
      break;

    case 'breakout':
      action = pattern.metrics.priceChange > 0 ? 'BUY' : 'SELL';
      reason = `${pattern.metrics.priceChange > 0 ? 'Upward' : 'Downward'} breakout detected`;
      priceTarget = pattern.metrics.priceChange > 0 ? price * 1.08 : price * 0.92;
      stopLoss = pattern.metrics.priceChange > 0 ? price * 0.96 : price * 1.04;
      break;

    case 'reversal':
      action = pattern.metrics.rsi < 30 ? 'BUY' : pattern.metrics.rsi > 70 ? 'SELL' : 'HOLD';
      reason = 'Potential trend reversal';
      priceTarget = pattern.metrics.rsi < 30 ? price * 1.06 : price * 0.94;
      stopLoss = pattern.metrics.rsi < 30 ? price * 0.96 : price * 1.04;
      break;

    case 'accumulation':
      action = 'BUY';
      reason = 'Accumulation phase - low risk entry';
      priceTarget = price * 1.10;
      stopLoss = price * 0.95;
      break;

    default:
      action = 'HOLD';
      reason = 'Pattern detected - monitor closely';
  }

  return { action, reason, priceTarget, stopLoss };
}
