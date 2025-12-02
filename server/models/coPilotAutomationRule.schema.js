import mongoose from 'mongoose';

/**
 * Co-Pilot Automation Rule Schema
 *
 * Represents an automation rule attached to a specific order
 * Rules define WHEN (trigger) and WHAT (action) should happen
 */
const CoPilotAutomationRuleSchemaDefinition = new mongoose.Schema({
    // User info
    userID: {
        type: String,
        required: true,
        index: true
    },

    // Parent Co-Pilot bot (optional - rules can exist independently)
    coPilotBotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CoPilotBot',
        index: true
    },

    // Rule identification
    ruleNumber: {
        type: Number,
        required: true,
        default: 1
    },
    ruleName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },

    // Order info (the order this rule monitors)
    orderId: {
        type: String,
        required: true,
        index: true
    },
    orderInfo: {
        type: {
            exchange: String,
            symbol: String,
            side: String, // buy/sell
            type: String, // limit/market
            amount: Number,
            price: Number,
            apiKeyName: String
        },
        default: {}
    },

    // Rule Type (what action to take)
    ruleType: {
        type: String,
        required: true,
        enum: ['copy_order', 'reverse_order', 'create_bot', 'cancel_order', 'modify_order', 'chain_action'],
        default: 'create_bot'
    },

    // Trigger Condition (when to execute)
    triggerCondition: {
        type: String,
        required: true,
        enum: ['on_fill', 'on_partial_fill', 'on_cancel', 'on_price_change', 'on_time', 'manual'],
        default: 'on_fill'
    },
    triggerValue: {
        type: mongoose.Schema.Types.Mixed, // Can be number, string, object
        default: null
    },

    // Action Configuration (depends on ruleType)
    actionConfig: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // Execution tracking
    isActive: {
        type: Boolean,
        default: true
    },
    executionCount: {
        type: Number,
        default: 0
    },
    lastExecutedAt: {
        type: Date,
        default: null
    },
    executionHistory: [{
        executedAt: Date,
        success: Boolean,
        result: mongoose.Schema.Types.Mixed,
        error: String
    }],

    // Created bot tracking (if ruleType === 'create_bot')
    createdBotId: {
        type: String,
        default: null
    },
    createdBotType: {
        type: String,
        default: null
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'coPilotAutomationRules'
});

// Indexes for performance (removed duplicate - already defined in schema with index: true)
CoPilotAutomationRuleSchemaDefinition.index({ userID: 1, orderId: 1 });
CoPilotAutomationRuleSchemaDefinition.index({ userID: 1, isActive: 1 });

// Export schema
export const CoPilotAutomationRuleSchema = mongoose.models.CoPilotAutomationRule ||
    mongoose.model('CoPilotAutomationRule', CoPilotAutomationRuleSchemaDefinition);

export default CoPilotAutomationRuleSchema;
