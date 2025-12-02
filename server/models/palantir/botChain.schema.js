import mongoose from 'mongoose';

const BotChainSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  chainId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  nodes: [{
    nodeId: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['GridBot', 'DCABot', 'Scalp1ngBot', 'FrontRunBot', 'FibBot', 'GrinderBot', 'CoPilotBot', 'OneClickBot', 'DkdBot'],
      required: true
    },
    config: {
      strategy: {
        type: String,
        enum: ['BUY', 'SELL'],
        required: true
      },
      symbol: String,
      exchange: String,
      apiKeyId: String,
      range: [Number], // [min, max] for grid bots
      grids: Number,
      amount: Number,
      // Additional bot-specific config
      additionalConfig: mongoose.Schema.Types.Mixed
    },
    status: {
      type: String,
      enum: ['waiting', 'active', 'completed', 'failed', 'cancelled'],
      default: 'waiting'
    },
    botId: String, // Reference to actual bot when started
    startedAt: Date,
    completedAt: Date,
    profit: Number,
    trigger: {
      event: {
        type: String,
        enum: ['profit_reached', 'loss_limit', 'orders_filled', 'time_elapsed', 'manual'],
        required: true
      },
      operator: {
        type: String,
        enum: ['>=', '<=', '=', '>', '<'],
        default: '>='
      },
      value: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        enum: ['%', 'USD', 'orders', 'seconds', 'minutes', 'hours'],
        default: '%'
      }
    },
    triggerCondition: String // Human-readable condition for display
  }],
  edges: [{
    from: {
      type: String,
      required: true
    },
    to: {
      type: String,
      required: true
    },
    condition: {
      type: String,
      required: true
    }
  }],
  currentNode: {
    type: String,
    default: null
  },
  currentNodeIndex: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['idle', 'running', 'paused', 'completed', 'failed'],
    default: 'idle'
  },
  executionCount: {
    type: Number,
    default: 0
  },
  successCount: {
    type: Number,
    default: 0
  },
  failureCount: {
    type: Number,
    default: 0
  },
  totalProfit: {
    type: Number,
    default: 0
  },
  history: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    nodeId: String,
    event: {
      type: String,
      enum: ['node_started', 'node_completed', 'node_failed', 'trigger_fired', 'chain_completed', 'chain_failed', 'chain_paused', 'chain_resumed'],
      required: true
    },
    data: mongoose.Schema.Types.Mixed,
    description: String
  }],
  lastExecution: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
BotChainSchema.index({ userId: 1, enabled: 1 });
// chainId index is already created by unique: true in schema
BotChainSchema.index({ status: 1 });
BotChainSchema.index({ 'nodes.status': 1 });

// Virtual for success rate
BotChainSchema.virtual('successRate').get(function() {
  if (this.executionCount === 0) return 0;
  return ((this.successCount / this.executionCount) * 100).toFixed(2);
});

// Method to add history entry
BotChainSchema.methods.addHistory = function(nodeId, event, data, description) {
  this.history.push({
    timestamp: new Date(),
    nodeId,
    event,
    data,
    description
  });
  this.updatedAt = new Date();
};

// Method to move to next node
BotChainSchema.methods.moveToNextNode = function() {
  if (this.currentNodeIndex < this.nodes.length - 1) {
    this.currentNodeIndex += 1;
    this.currentNode = this.nodes[this.currentNodeIndex].nodeId;
    return true;
  }
  return false;
};

// Method to check if trigger condition is met
BotChainSchema.methods.checkTrigger = function(nodeIndex, currentValue) {
  const node = this.nodes[nodeIndex];
  if (!node || !node.trigger) return false;

  const { operator, value } = node.trigger;

  switch (operator) {
    case '>=': return currentValue >= value;
    case '<=': return currentValue <= value;
    case '=': return currentValue === value;
    case '>': return currentValue > value;
    case '<': return currentValue < value;
    default: return false;
  }
};

export default mongoose.models.BotChain || mongoose.model('BotChain', BotChainSchema);
