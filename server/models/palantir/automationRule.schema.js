import mongoose from 'mongoose';

const AutomationRuleSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  ruleId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  enabled: {
    type: Boolean,
    default: true
  },
  trigger: {
    event: {
      type: String,
      enum: [
        // Bot Events
        'BOT_STARTED',
        'BOT_STOPPED',
        'BOT_PROFIT_REACHED',
        'BOT_LOSS_LIMIT',
        'ORDER_FILLED',
        'ORDER_CANCELLED',
        // Market Events
        'PRICE_SPIKE',
        'PRICE_DROP',
        'VOLUME_SURGE',
        'PATTERN_DETECTED',
        'WHALE_WALL',
        'BREAKOUT',
        'REVERSAL',
        // Portfolio Events
        'TOTAL_PROFIT',
        'TOTAL_LOSS',
        'BALANCE_LOW',
        'BALANCE_HIGH',
        // Chain Events
        'CHAIN_NODE_COMPLETED',
        'CHAIN_COMPLETED',
        'CHAIN_FAILED'
      ],
      required: true
    },
    filter: mongoose.Schema.Types.Mixed,  // Additional filtering criteria
    conditions: [{
      field: String,
      operator: {
        type: String,
        enum: ['=', '!=', '>', '<', '>=', '<=', 'contains', 'in', 'not_in']
      },
      value: mongoose.Schema.Types.Mixed
    }]
  },
  actions: [{
    type: {
      type: String,
      enum: [
        'START_BOT',
        'STOP_BOT',
        'START_BOT_CHAIN',
        'STOP_BOT_CHAIN',
        'CANCEL_ORDERS',
        'CANCEL_ALL_ORDERS',
        'CREATE_ORDER',
        'SEND_NOTIFICATION',
        'SEND_EMAIL',
        'SEND_WEBHOOK',
        'EXECUTE_SCRIPT',
        'PAUSE_ALL_BOTS',
        'RESUME_ALL_BOTS'
      ],
      required: true
    },
    config: mongoose.Schema.Types.Mixed,
    priority: {
      type: Number,
      default: 1
    },
    delay: {
      type: Number,
      default: 0  // milliseconds
    }
  }],
  cooldown: {
    enabled: Boolean,
    duration: Number,  // milliseconds
    lastTriggered: Date
  },
  limits: {
    maxExecutionsPerDay: Number,
    maxExecutionsPerHour: Number,
    executionsToday: {
      type: Number,
      default: 0
    },
    executionsThisHour: {
      type: Number,
      default: 0
    }
  },
  executionLog: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    triggeredBy: mongoose.Schema.Types.Mixed,
    actionsExecuted: [{
      actionType: String,
      success: Boolean,
      result: mongoose.Schema.Types.Mixed,
      error: String
    }],
    success: Boolean,
    duration: Number  // milliseconds
  }],
  statistics: {
    totalExecutions: {
      type: Number,
      default: 0
    },
    successfulExecutions: {
      type: Number,
      default: 0
    },
    failedExecutions: {
      type: Number,
      default: 0
    },
    lastExecutedAt: Date,
    averageDuration: Number
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

// Indexes
AutomationRuleSchema.index({ userId: 1, enabled: 1 });
// ruleId index is already created by unique: true in schema
AutomationRuleSchema.index({ 'trigger.event': 1 });
AutomationRuleSchema.index({ enabled: 1 });

// Virtual for success rate
AutomationRuleSchema.virtual('successRate').get(function() {
  if (this.statistics.totalExecutions === 0) return 0;
  return ((this.statistics.successfulExecutions / this.statistics.totalExecutions) * 100).toFixed(2);
});

// Method to check if rule can be executed (cooldown & limits)
AutomationRuleSchema.methods.canExecute = function() {
  const now = new Date();

  // Check cooldown
  if (this.cooldown && this.cooldown.enabled && this.cooldown.lastTriggered) {
    const timeSinceLastTrigger = now - this.cooldown.lastTriggered;
    if (timeSinceLastTrigger < this.cooldown.duration) {
      return {
        allowed: false,
        reason: 'Cooldown period not elapsed',
        remainingMs: this.cooldown.duration - timeSinceLastTrigger
      };
    }
  }

  // Check hourly limit
  if (this.limits && this.limits.maxExecutionsPerHour) {
    if (this.limits.executionsThisHour >= this.limits.maxExecutionsPerHour) {
      return {
        allowed: false,
        reason: 'Hourly execution limit reached'
      };
    }
  }

  // Check daily limit
  if (this.limits && this.limits.maxExecutionsPerDay) {
    if (this.limits.executionsToday >= this.limits.maxExecutionsPerDay) {
      return {
        allowed: false,
        reason: 'Daily execution limit reached'
      };
    }
  }

  return { allowed: true };
};

// Method to log execution
AutomationRuleSchema.methods.logExecution = function(triggeredBy, actionsExecuted, success, duration) {
  this.executionLog.push({
    timestamp: new Date(),
    triggeredBy,
    actionsExecuted,
    success,
    duration
  });

  // Update statistics
  this.statistics.totalExecutions += 1;
  if (success) {
    this.statistics.successfulExecutions += 1;
  } else {
    this.statistics.failedExecutions += 1;
  }
  this.statistics.lastExecutedAt = new Date();

  // Update average duration
  if (this.statistics.averageDuration) {
    this.statistics.averageDuration = (this.statistics.averageDuration + duration) / 2;
  } else {
    this.statistics.averageDuration = duration;
  }

  // Update cooldown
  if (this.cooldown && this.cooldown.enabled) {
    this.cooldown.lastTriggered = new Date();
  }

  // Update limits
  if (this.limits) {
    this.limits.executionsThisHour = (this.limits.executionsThisHour || 0) + 1;
    this.limits.executionsToday = (this.limits.executionsToday || 0) + 1;
  }

  // Keep only last 100 log entries
  if (this.executionLog.length > 100) {
    this.executionLog = this.executionLog.slice(-100);
  }
};

// Method to reset hourly counter (call via cron every hour)
AutomationRuleSchema.methods.resetHourlyCounter = function() {
  if (this.limits) {
    this.limits.executionsThisHour = 0;
  }
};

// Method to reset daily counter (call via cron every day)
AutomationRuleSchema.methods.resetDailyCounter = function() {
  if (this.limits) {
    this.limits.executionsToday = 0;
  }
};

export default mongoose.models.AutomationRule || mongoose.model('AutomationRule', AutomationRuleSchema);
