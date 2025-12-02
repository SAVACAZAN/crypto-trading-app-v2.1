import { BotChainModel } from '~/server/models/botChain.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { chainId, userId } = body;

    if (!chainId || !userId) {
      return {
        success: false,
        error: 'Missing chainId or userId'
      };
    }

    // Find the chain
    const chain = await BotChainModel.findOne({ chainId, userId });

    if (!chain) {
      return {
        success: false,
        error: 'Bot chain not found'
      };
    }

    // Toggle enabled status
    chain.enabled = !chain.enabled;
    chain.updatedAt = new Date();
    await chain.save();

    console.log(`✅ Bot chain ${chainId} toggled to ${chain.enabled ? 'enabled' : 'disabled'}`);

    return {
      success: true,
      data: chain,
      message: `Bot chain ${chain.enabled ? 'enabled' : 'disabled'} successfully`
    };
  } catch (error) {
    console.error('❌ Error toggling bot chain:', error);
    return {
      success: false,
      error: error.message
    };
  }
});
