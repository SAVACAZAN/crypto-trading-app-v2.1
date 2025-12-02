import PatternDetection from '~/server/models/palantir/patternDetection.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const userId = query.userId;

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'userId is required'
      });
    }

    // Build filter
    const filter = { userId };

    // Add symbol filter if provided
    if (query.symbol) {
      filter.symbol = query.symbol;
    }

    // Add timeframe filter if provided
    if (query.timeframe) {
      filter.timeframe = query.timeframe;
    }

    // Add pattern type filter if provided
    if (query.patternType) {
      filter.patternType = query.patternType;
    }

    // Add confidence threshold if provided
    if (query.minConfidence) {
      filter.confidence = { $gte: parseFloat(query.minConfidence) };
    }

    // Add time range filter if provided
    if (query.since) {
      filter.detectedAt = { $gte: new Date(query.since) };
    }

    // Fetch patterns
    const patterns = await PatternDetection.find(filter)
      .sort({ detectedAt: -1 })
      .limit(query.limit ? parseInt(query.limit) : 100)
      .lean();

    // Calculate stats by pattern type
    const statsByType = {};
    patterns.forEach(p => {
      if (!statsByType[p.patternType]) {
        statsByType[p.patternType] = {
          count: 0,
          avgConfidence: 0,
          totalConfidence: 0
        };
      }
      statsByType[p.patternType].count++;
      statsByType[p.patternType].totalConfidence += p.confidence;
    });

    // Calculate averages
    Object.keys(statsByType).forEach(type => {
      statsByType[type].avgConfidence = (
        statsByType[type].totalConfidence / statsByType[type].count
      ).toFixed(2);
      delete statsByType[type].totalConfidence;
    });

    return {
      success: true,
      data: patterns,
      stats: statsByType,
      count: patterns.length
    };

  } catch (error) {
    console.error('❌ Error fetching patterns:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch patterns'
    });
  }
});
