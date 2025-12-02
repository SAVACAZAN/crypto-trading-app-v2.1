import BotChain from '~/server/models/palantir/botChain.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { chainId } = body;

    if (!chainId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'chainId is required'
      });
    }

    // Find and delete chain
    const result = await BotChain.deleteOne({ chainId });

    if (result.deletedCount === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Bot chain not found'
      });
    }

    console.log(`✅ Bot chain deleted: ${chainId}`);

    return {
      success: true,
      message: 'Bot chain deleted successfully'
    };

  } catch (error) {
    console.error('❌ Error deleting bot chain:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to delete bot chain'
    });
  }
});
