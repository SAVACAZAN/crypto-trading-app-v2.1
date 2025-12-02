import PatternDetection from '~/server/models/palantir/patternDetection.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userId, patternId, deleteAll, olderThan } = body;

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'userId is required'
      });
    }

    let result;

    if (deleteAll) {
      // Delete all patterns for user
      const filter = { userId };

      // Optional: delete only patterns older than X hours
      if (olderThan) {
        const cutoffDate = new Date(Date.now() - olderThan * 60 * 60 * 1000);
        filter.detectedAt = { $lt: cutoffDate };
      }

      result = await PatternDetection.deleteMany(filter);

      console.log(`✅ Deleted ${result.deletedCount} patterns for user ${userId}`);

      return {
        success: true,
        deletedCount: result.deletedCount,
        message: `${result.deletedCount} pattern(s) deleted successfully`
      };

    } else if (patternId) {
      // Delete specific pattern
      result = await PatternDetection.deleteOne({
        _id: patternId,
        userId
      });

      if (result.deletedCount === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Pattern not found'
        });
      }

      console.log(`✅ Pattern deleted: ${patternId}`);

      return {
        success: true,
        message: 'Pattern deleted successfully'
      };

    } else {
      throw createError({
        statusCode: 400,
        statusMessage: 'Either patternId or deleteAll must be provided'
      });
    }

  } catch (error) {
    console.error('❌ Error deleting pattern(s):', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to delete pattern(s)'
    });
  }
});
