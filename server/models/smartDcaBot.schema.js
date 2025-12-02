import mongoose from 'mongoose';

const smartDcaBotSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    exchange: {
        type: String,
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    side: {
        type: String,
        enum: ['buy', 'sell'],
        required: true
    },
    amountPerInterval: {
        type: Number,
        required: true
    },
    dcaInterval: {
        type: String,
        required: true
    },
    totalDuration: {
        type: Number,
        default: 0 // 0 = infinite
    },
    enableRSI: {
        type: Boolean,
        default: false
    },
    rsiTimeframe: {
        type: String,
        default: '15m'
    },
    rsiPeriod: {
        type: Number,
        default: 14
    },
    rsiOversold: {
        type: Number,
        default: 30
    },
    rsiOverbought: {
        type: Number,
        default: 70
    },
    enableMACD: {
        type: Boolean,
        default: false
    },
    macdTimeframe: {
        type: String,
        default: '1h'
    },
    macdFast: {
        type: Number,
        default: 12
    },
    macdSlow: {
        type: Number,
        default: 26
    },
    macdSignal: {
        type: Number,
        default: 9
    },
    executionMode: {
        type: String,
        enum: ['scheduled', 'smart'],
        default: 'smart'
    },
    status: {
        type: String,
        enum: ['active', 'stopped', 'completed', 'error'],
        default: 'active'
    },
    executionCount: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    totalReceived: {
        type: Number,
        default: 0
    },
    totalFees: {
        type: Number,
        default: 0
    },
    nextRun: {
        type: Date
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    lastExecutionAt: {
        type: Date
    },
    startingPrice: {
        type: Number
    },
    initialRSI: {
        type: Object, // Multi-timeframe RSI at bot creation
        default: {}
    },
    initialMACD: {
        type: Object, // Multi-timeframe MACD at bot creation
        default: {}
    },
    executionHistory: [{
        timestamp: Date,
        price: Number,
        amount: Number,
        side: String,
        orderId: String,
        fee: Number,
        rsi: Number,
        macd: Object, // { macd, signal, histogram }
        conditionsMet: Boolean,
        executed: Boolean,
        error: String
    }],
    rsiHistory: [{
        timestamp: Date,
        timeframe: String,
        value: Number
    }],
    macdHistory: [{
        timestamp: Date,
        timeframe: String,
        macd: Number,
        signal: Number,
        histogram: Number
    }],
    apiKeyNames: {
        type: [String],
        default: []
    },
    errorMessage: String
}, {
    timestamps: true
});

// Indexes for performance
smartDcaBotSchema.index({ userID: 1, status: 1 });
smartDcaBotSchema.index({ status: 1, nextRun: 1 });

// Create and export the model
const SmartDCABot = mongoose.model('SmartDCABot', smartDcaBotSchema, 'smartdcabots');
export { SmartDCABot as smartDcaBotSchema };
