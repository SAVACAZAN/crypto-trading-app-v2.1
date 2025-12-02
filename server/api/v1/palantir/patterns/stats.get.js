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

    // Time range filter (default: last 24 hours)
    const since = query.since
      ? new Date(query.since)
      : new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Aggregate stats
    const stats = await PatternDetection.aggregate([
      {
        $match: {
          userId,
          detectedAt: { $gte: since }
        }
      },
      {
        $group: {
          _id: '$patternType',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' },
          maxConfidence: { $max: '$confidence' },
          minConfidence: { $min: '$confidence' },
          avgPriceChange: { $avg: '$metrics.priceChange' },
          avgVolumeChange: { $avg: '$metrics.volumeChange' },
          avgRsi: { $avg: '$metrics.rsi' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Overall stats
    const overall = await PatternDetection.aggregate([
      {
        $match: {
          userId,
          detectedAt: { $gte: since }
        }
      },
      {
        $group: {
          _id: null,
          totalPatterns: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' },
          highConfidenceCount: {
            $sum: { $cond: [{ $gte: ['$confidence', 75] }, 1, 0] }
          },
          mediumConfidenceCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$confidence', 50] },
                    { $lt: ['$confidence', 75] }
                  ]
                },
                1,
                0
              ]
            }
          },
          lowConfidenceCount: {
            $sum: { $cond: [{ $lt: ['$confidence', 50] }, 1, 0] }
          }
        }
      }
    ]);

    // Patterns by timeframe
    const byTimeframe = await PatternDetection.aggregate([
      {
        $match: {
          userId,
          detectedAt: { $gte: since }
        }
      },
      {
        $group: {
          _id: '$timeframe',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Most active symbols
    const bySymbol = await PatternDetection.aggregate([
      {
        $match: {
          userId,
          detectedAt: { $gte: since }
        }
      },
      {
        $group: {
          _id: '$symbol',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' },
          patterns: { $push: '$patternType' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    return {
      success: true,
      data: {
        byPattern: stats,
        overall: overall.length > 0 ? overall[0] : {
          totalPatterns: 0,
          avgConfidence: 0,
          highConfidenceCount: 0,
          mediumConfidenceCount: 0,
          lowConfidenceCount: 0
        },
        byTimeframe,
        bySymbol,
        period: {
          from: since.toISOString(),
          to: new Date().toISOString(),
          hours: Math.round((Date.now() - since.getTime()) / (1000 * 60 * 60))
        }
      }
    };

  } catch (error) {
    console.error('❌ Error fetching pattern stats:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch pattern stats'
    });
  }
});
