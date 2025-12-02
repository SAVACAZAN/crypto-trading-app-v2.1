import PatternDetection from '~/server/models/palantir/patternDetection.schema.js';

/**
 * Clear all old patterns (for cleanup/debugging)
 */
export default defineEventHandler(async (event) => {
  try {
    const result = await PatternDetection.deleteMany({});

    console.log(`🗑️  Deleted ${result.deletedCount} old patterns from database`);

    return {
      success: true,
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} pattern(s) deleted. New patterns will be created automatically.`
    };
  } catch (error) {
    console.error('❌ Error clearing patterns:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to clear patterns'
    });
  }
});
