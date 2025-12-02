import mongoose from 'mongoose';

const dcaExecutionSchema = new mongoose.Schema({
    executedAt: { type: Date, required: true },
    amount: { type: Number, required: true },
    price: { type: Number, required: true },
    orderId: { type: String },
    status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' },
    error: { type: String }
});

const gridOrderSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    price: { type: Number, required: true },
    amount: { type: Number, required: true },
    side: { type: String, enum: ['buy', 'sell'], required: true },
    status: { type: String, enum: ['open', 'filled', 'cancelled'], default: 'open' },
    filledAt: { type: Date },
    profit: { type: Number, default: 0 }
});

const dcaGridBotSchema = new mongoose.Schema({
    userID: { type: String, required: true, index: true },
    name: { type: String, required: true },
    exchange: { type: String, required: true },
    symbol: { type: String, required: true },
    strategyType: {
        type: String,
        enum: ['dca-buy-grid-sell', 'grid-buy-dca-sell'],
        required: true
    },

    // DCA Configuration
    dcaAmount: { type: Number, required: true },
    dcaInterval: {
        type: String,
        enum: ['hourly', '4hours', '12hours', 'daily', '3days', 'weekly', 'biweekly', 'monthly'],
        required: true
    },
    totalBudget: { type: Number, required: true },
    startDate: { type: Date, required: true },
    duration: { type: String },
    nextDcaDate: { type: Date, required: true },

    // Grid Configuration
    lowerPrice: { type: Number, required: true },
    upperPrice: { type: Number, required: true },
    nrOfGrids: { type: Number, required: true },
    gridAmount: { type: Number, required: true },
    gridSide: {
        type: String,
        enum: ['buy', 'sell', 'both'],
        required: true
    },

    // Advanced Options
    autoAdjustGrid: { type: Boolean, default: false },
    reinvestProfits: { type: Boolean, default: false },
    stopLoss: { type: Number },
    takeProfit: { type: Number },

    // API Keys
    apiKeyNames: [{ type: String }],

    // Status & Statistics
    status: {
        type: String,
        enum: ['active', 'paused', 'stopped', 'completed'],
        default: 'active'
    },
    totalInvested: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },

    // Execution History
    dcaExecutions: [dcaExecutionSchema],
    gridOrders: [gridOrderSchema],
    filledOrders: [{ type: mongoose.Schema.Types.Mixed }],

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    stoppedAt: { type: Date }
}, {
    timestamps: true
});

// Indexes for performance
dcaGridBotSchema.index({ userID: 1, status: 1 });
dcaGridBotSchema.index({ userID: 1, symbol: 1 });
dcaGridBotSchema.index({ nextDcaDate: 1, status: 1 });

// Export the schema
const DcaGridBot = mongoose.models.DcaGridBot || mongoose.model('DcaGridBot', dcaGridBotSchema);
export { DcaGridBot as dcaGridBotSchema };
