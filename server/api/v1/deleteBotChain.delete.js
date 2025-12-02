import { BotChainModel } from '~/server/models/botChain.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { chainId, userId } = query;

    if (!chainId || !userId) {
      return {
        success: false,
        error: 'Missing chainId or userId'
      };
    }

    // Delete the chain
    const result = await BotChainModel.deleteOne({ chainId, userId });

    if (result.deletedCount === 0) {
      return {
        success: false,
        error: 'Bot chain not found or already deleted'
      };
    }

    console.log(`✅ Bot chain ${chainId} deleted successfully`);

    return {
      success: true,
      message: 'Bot chain deleted successfully'
    };
  } catch (error) {
    console.error('❌ Error deleting bot chain:', error);
    return {
      success: false,
      error: error.message
    };
  }
});
