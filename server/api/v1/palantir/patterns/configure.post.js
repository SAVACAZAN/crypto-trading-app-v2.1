import PatternDetection from '~/server/models/palantir/patternDetection.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userId, patternId, config } = body;

    if (!userId || !patternId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'userId and patternId are required'
      });
    }

    // Find pattern
    const pattern = await PatternDetection.findOne({
      _id: patternId,
      userId
    });

    if (!pattern) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Pattern not found'
      });
    }

    // Update configuration if provided
    if (config) {
      if (config.minConfidence !== undefined) {
        pattern.minConfidence = config.minConfidence;
      }

      if (config.enabled !== undefined) {
        pattern.enabled = config.enabled;
      }

      if (config.notifications !== undefined) {
        pattern.notifications = config.notifications;
      }

      if (config.autoTrade !== undefined) {
        pattern.autoTrade = config.autoTrade;
      }
    }

    await pattern.save();

    console.log(`✅ Pattern configuration updated: ${patternId}`);

    return {
      success: true,
      data: pattern,
      message: 'Pattern configuration updated successfully'
    };

  } catch (error) {
    console.error('❌ Error configuring pattern:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to configure pattern'
    });
  }
});
