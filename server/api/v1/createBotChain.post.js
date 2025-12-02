import { BotChainModel } from '~/server/models/botChain.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userId, name, nodes } = body;

    // Validate required fields
    if (!userId || !name || !nodes || nodes.length === 0) {
      return {
        success: false,
        error: 'Missing required fields: userId, name, or nodes'
      };
    }

    // Generate unique chain ID
    const chainId = `chain-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Process nodes - add nodeId and default status
    const processedNodes = nodes.map((node, index) => ({
      nodeId: `node-${index + 1}`,
      type: node.type,
      config: node.config || { strategy: 'BUY' },
      trigger: node.trigger || null,
      status: index === 0 ? 'active' : 'waiting' // First node is active
    }));

    // Create new bot chain
    const newChain = new BotChainModel({
      userId,
      chainId,
      name,
      enabled: true,
      nodes: processedNodes,
      currentNode: processedNodes[0].nodeId,
      executionCount: 0,
      successRate: 0,
      lastExecution: null
    });

    await newChain.save();

    console.log(`✅ Bot chain created: ${chainId} for user ${userId}`);

    return {
      success: true,
      data: newChain,
      message: 'Bot chain created successfully'
    };
  } catch (error) {
    console.error('❌ Error creating bot chain:', error);
    return {
      success: false,
      error: error.message
    };
  }
});
