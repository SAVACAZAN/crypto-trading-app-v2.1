import { smartDcaBotSchema } from "~/server/models/smartDcaBot.schema";

// Helper function to convert interval to milliseconds
function intervalToMs(interval) {
    const units = {
        'm': 60 * 1000,
        'h': 60 * 60 * 1000,
        'd': 24 * 60 * 60 * 1000,
        'w': 7 * 24 * 60 * 60 * 1000,
        'M': 30 * 24 * 60 * 60 * 1000
    };

    const match = interval.match(/^(\d+)([mhdwM])$/);
    if (!match) return 60000; // default to 1 minute

    const value = parseInt(match[1]);
    const unit = match[2];

    return value * (units[unit] || 60000);
}

export default defineEventHandler(async (event) => {
    console.log('[API createSmartDCABot] Request received');

    try {
        const body = await readBody(event);

        const {
            userID,
            name,
            exchange,
            symbol,
            side,
            amountPerInterval,
            dcaInterval,
            totalDuration,
            enableRSI,
            rsiTimeframe,
            rsiPeriod,
            rsiOversold,
            rsiOverbought,
            enableMACD,
            macdTimeframe,
            macdFast,
            macdSlow,
            macdSignal,
            executionMode,
            apiKeyNames,
            startingPrice,
            initialRSI,
            initialMACD
        } = body;

        // Validation
        if (!userID || !name || !exchange || !symbol || !side || !amountPerInterval || !dcaInterval) {
            return {
                success: false,
                message: 'Missing required fields'
            };
        }

        // Calculate next run time
        const intervalMs = intervalToMs(dcaInterval);
        const nextRun = new Date(Date.now() + intervalMs);

        // Create bot document
        const newBot = new smartDcaBotSchema({
            userID,
            name,
            exchange,
            symbol,
            side,
            amountPerInterval: parseFloat(amountPerInterval),
            dcaInterval,
            totalDuration: parseInt(totalDuration) || 0,
            enableRSI: enableRSI || false,
            rsiTimeframe: rsiTimeframe || '15m',
            rsiPeriod: parseInt(rsiPeriod) || 14,
            rsiOversold: parseFloat(rsiOversold) || 30,
            rsiOverbought: parseFloat(rsiOverbought) || 70,
            enableMACD: enableMACD || false,
            macdTimeframe: macdTimeframe || '1h',
            macdFast: parseInt(macdFast) || 12,
            macdSlow: parseInt(macdSlow) || 26,
            macdSignal: parseInt(macdSignal) || 9,
            executionMode: executionMode || 'smart',
            status: 'active',
            nextRun,
            startedAt: new Date(),
            startingPrice: startingPrice || null,
            initialRSI: initialRSI || {},
            initialMACD: initialMACD || {},
            executionHistory: [],
            rsiHistory: [],
            macdHistory: [],
            apiKeyNames: apiKeyNames || [],
            executionCount: 0,
            totalSpent: 0,
            totalReceived: 0,
            totalFees: 0
        });

        await newBot.save();

        console.log('[API createSmartDCABot] Bot created:', newBot._id);

        return {
            success: true,
            message: 'Smart DCA Bot created successfully',
            data: newBot
        };

    } catch (error) {
        console.error('[API createSmartDCABot] Error:', error);
        return {
            success: false,
            message: 'Error creating Smart DCA Bot: ' + error.message
        };
    }
});
