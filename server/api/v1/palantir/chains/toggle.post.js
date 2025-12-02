import BotChain from '~/server/models/palantir/botChain.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { chainId, enabled } = body;

    if (!chainId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'chainId is required'
      });
    }

    // Find and update chain
    const botChain = await BotChain.findOne({ chainId });

    if (!botChain) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Bot chain not found'
      });
    }

    const previousStatus = botChain.enabled;
    botChain.enabled = enabled !== undefined ? enabled : !botChain.enabled;

    // Update status based on enabled state
    if (botChain.enabled) {
      botChain.status = 'running';
      botChain.addHistory(
        botChain.currentNode,
        'chain_resumed',
        { previousStatus },
        'Bot chain resumed'
      );
    } else {
      botChain.status = 'paused';
      botChain.addHistory(
        botChain.currentNode,
        'chain_paused',
        { previousStatus },
        'Bot chain paused'
      );
    }

    await botChain.save();

    console.log(`✅ Bot chain ${botChain.enabled ? 'enabled' : 'disabled'}: ${chainId}`);

    return {
      success: true,
      data: botChain,
      message: `Bot chain ${botChain.enabled ? 'enabled' : 'disabled'} successfully`
    };

  } catch (error) {
    console.error('❌ Error toggling bot chain:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to toggle bot chain'
    });
  }
});
