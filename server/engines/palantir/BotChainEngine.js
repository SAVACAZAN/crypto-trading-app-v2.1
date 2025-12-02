import BotChain from '~/server/models/palantir/botChain.schema.js';

/**
 * BotChainEngine - Orchestrates bot chain execution and node transitions
 */
class BotChainEngine {
  constructor() {
    this.activeChains = new Map();
    this.executionInterval = null;
  }

  /**
   * Start the engine
   */
  start() {
    console.log('🚀 BotChainEngine started');

    // Check for chain updates every 10 seconds
    this.executionInterval = setInterval(() => {
      this.processActiveChains();
    }, 10000);
  }

  /**
   * Stop the engine
   */
  stop() {
    if (this.executionInterval) {
      clearInterval(this.executionInterval);
      this.executionInterval = null;
    }
    console.log('⏹️  BotChainEngine stopped');
  }

  /**
   * Process all active bot chains
   */
  async processActiveChains() {
    try {
      // Find all running chains
      const runningChains = await BotChain.find({
        status: 'running',
        enabled: true
      });

      for (const chain of runningChains) {
        await this.processChain(chain);
      }
    } catch (error) {
      console.error('❌ Error processing active chains:', error);
    }
  }

  /**
   * Process a single bot chain
   */
  async processChain(chain) {
    try {
      const currentNode = chain.nodes[chain.currentNodeIndex];

      if (!currentNode) {
        console.log(`⚠️  Chain ${chain.chainId} has no current node`);
        return;
      }

      // Check if current node is completed
      if (currentNode.status === 'completed') {
        await this.moveToNextNode(chain);
        return;
      }

      // Check if current node trigger is satisfied
      if (await this.checkTrigger(chain, currentNode)) {
        await this.executeNode(chain, currentNode);
      }
    } catch (error) {
      console.error(`❌ Error processing chain ${chain.chainId}:`, error);
      chain.status = 'failed';
      chain.addHistory(
        chain.currentNode,
        'chain_failed',
        { error: error.message },
        `Chain execution failed: ${error.message}`
      );
      await chain.save();
    }
  }

  /**
   * Check if node trigger conditions are met
   */
  async checkTrigger(chain, node) {
    if (!node.trigger) return true; // No trigger = immediate execution

    const { event, operator, value, unit } = node.trigger;

    switch (event) {
      case 'profit_reached':
        return this.checkProfitCondition(chain, operator, value);

      case 'loss_reached':
        return this.checkLossCondition(chain, operator, value);

      case 'time_elapsed':
        return this.checkTimeCondition(chain, operator, value, unit);

      case 'pattern_detected':
        return await this.checkPatternCondition(chain, value);

      case 'manual_trigger':
        return false; // Manual triggers don't auto-execute

      default:
        console.log(`⚠️  Unknown trigger event: ${event}`);
        return false;
    }
  }

  /**
   * Check profit condition
   */
  checkProfitCondition(chain, operator, value) {
    const currentProfit = chain.totalProfit || 0;

    switch (operator) {
      case '>=': return currentProfit >= value;
      case '>': return currentProfit > value;
      case '==': return currentProfit === value;
      default: return false;
    }
  }

  /**
   * Check loss condition
   */
  checkLossCondition(chain, operator, value) {
    const currentProfit = chain.totalProfit || 0;

    switch (operator) {
      case '<=': return currentProfit <= -value;
      case '<': return currentProfit < -value;
      default: return false;
    }
  }

  /**
   * Check time condition
   */
  checkTimeCondition(chain, operator, value, unit) {
    const lastExecutionTime = chain.lastExecutionTime || chain.createdAt;
    const now = Date.now();
    const elapsed = now - lastExecutionTime.getTime();

    const multipliers = {
      seconds: 1000,
      minutes: 60000,
      hours: 3600000,
      days: 86400000
    };

    const threshold = value * (multipliers[unit] || 1000);

    switch (operator) {
      case '>=': return elapsed >= threshold;
      case '>': return elapsed > threshold;
      default: return false;
    }
  }

  /**
   * Check pattern detection condition
   */
  async checkPatternCondition(chain, patternType) {
    // This would query PatternDetection schema
    // For now, return false (placeholder)
    return false;
  }

  /**
   * Execute a node (start the configured bot)
   */
  async executeNode(chain, node) {
    try {
      console.log(`⚙️  Executing node ${node.nodeId} (${node.type}) for chain ${chain.chainId}`);

      node.status = 'active';
      node.executionStartTime = new Date();

      // Start the bot based on node type
      const botResult = await this.startBot(node.type, node.config, chain.userId);

      if (botResult.success) {
        node.botInstanceId = botResult.botId;
        node.status = 'completed';

        chain.executionCount++;
        chain.successCount++;
        chain.lastExecutionTime = new Date();

        chain.addHistory(
          node.nodeId,
          'node_completed',
          { botId: botResult.botId, botType: node.type },
          `Node ${node.nodeId} (${node.type}) executed successfully`
        );

        console.log(`✅ Node ${node.nodeId} completed for chain ${chain.chainId}`);
      } else {
        node.status = 'failed';
        chain.failureCount++;

        chain.addHistory(
          node.nodeId,
          'node_failed',
          { error: botResult.error },
          `Node ${node.nodeId} failed: ${botResult.error}`
        );

        console.log(`❌ Node ${node.nodeId} failed for chain ${chain.chainId}`);
      }

      await chain.save();
    } catch (error) {
      console.error(`❌ Error executing node ${node.nodeId}:`, error);
      throw error;
    }
  }

  /**
   * Move to the next node in the chain
   */
  async moveToNextNode(chain) {
    const nextIndex = chain.currentNodeIndex + 1;

    if (nextIndex >= chain.nodes.length) {
      // Chain completed
      chain.status = 'completed';
      chain.addHistory(
        chain.currentNode,
        'chain_completed',
        { totalNodes: chain.nodes.length },
        `Chain completed - ${chain.nodes.length} nodes executed`
      );

      console.log(`✅ Chain ${chain.chainId} completed`);
    } else {
      // Move to next node
      chain.currentNodeIndex = nextIndex;
      chain.currentNode = chain.nodes[nextIndex].nodeId;
      chain.nodes[nextIndex].status = 'active';

      chain.addHistory(
        chain.currentNode,
        'node_started',
        { nodeIndex: nextIndex },
        `Moving to node ${chain.currentNode}`
      );

      console.log(`➡️  Chain ${chain.chainId} moved to node ${chain.currentNode}`);
    }

    await chain.save();
  }

  /**
   * Start a bot (placeholder - would integrate with actual bot systems)
   */
  async startBot(botType, config, userId) {
    // This would integrate with your actual bot creation endpoints
    // For now, return mock success
    return {
      success: true,
      botId: `bot-${Date.now()}`,
      message: `${botType} started successfully`
    };
  }
}

// Export singleton instance
export default new BotChainEngine();
