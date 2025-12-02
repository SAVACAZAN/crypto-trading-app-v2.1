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
    unique: true,
    index: true
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
      required: true,
      enum: [
        'GridBotPlus',
        'GridBot',
        'FrontRunBot',
        'Scalp1ngBot',
        'OneClickBot',
        'FibBot',
        'AIBot',
        'CoPilotBot',
        'DCAGridBot',
        'SmartDCABot',
        'GrinderBot',
        'OrderBookBot',
        'DCABot'
      ]
    },
    config: {
      strategy: {
        type: String,
        enum: ['BUY', 'SELL']
      },
      range: [Number],
      grids: Number,
      interval: String
    },
    trigger: {
      event: {
        type: String,
        enum: ['profit_reached', 'loss_limit', 'orders_filled', 'time_elapsed', 'price_above', 'price_below', 'volume_spike', 'pattern_detected']
      },
      operator: {
        type: String,
        enum: ['>=', '<=', '=']
      },
      value: Number
    },
    status: {
      type: String,
      enum: ['waiting', 'active', 'completed', 'failed'],
      default: 'waiting'
    }
  }],
  currentNode: {
    type: String,
    default: null
  },
  executionCount: {
    type: Number,
    default: 0
  },
  successRate: {
    type: Number,
    default: 0
  },
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

// Index for faster queries
BotChainSchema.index({ userId: 1, enabled: 1 });
BotChainSchema.index({ chainId: 1 });

export const BotChainModel = mongoose.models.BotChain || mongoose.model('BotChain', BotChainSchema);
