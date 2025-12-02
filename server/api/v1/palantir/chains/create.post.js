import BotChain from '~/server/models/palantir/botChain.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userId, name, nodes, edges } = body;

    // Validate required fields
    if (!userId || !name || !nodes || nodes.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: userId, name, nodes'
      });
    }

    // Generate unique chainId
    const chainId = `chain-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create bot chain
    const botChain = new BotChain({
      userId,
      chainId,
      name,
      enabled: true,
      nodes: nodes.map((node, index) => ({
        nodeId: node.nodeId || `n${index + 1}`,
        type: node.type,
        config: node.config,
        status: index === 0 ? 'active' : 'waiting',
        trigger: node.trigger
      })),
      edges: edges || [],
      currentNode: nodes[0]?.nodeId || 'n1',
      currentNodeIndex: 0,
      status: 'idle'
    });

    await botChain.save();

    // Add initial history entry
    botChain.addHistory(
      botChain.currentNode,
      'chain_created',
      { nodesCount: nodes.length },
      `Bot chain "${name}" created with ${nodes.length} nodes`
    );
    await botChain.save();

    console.log(`✅ Bot chain created: ${chainId}`);

    return {
      success: true,
      data: botChain,
      message: 'Bot chain created successfully'
    };

  } catch (error) {
    console.error('❌ Error creating bot chain:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to create bot chain'
    });
  }
});
