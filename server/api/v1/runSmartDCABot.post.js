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
    console.log('[API runSmartDCABot] Request received');

    try {
        const body = await readBody(event);
        const { userID, botId } = body;

        // Validation
        if (!userID || !botId) {
            return {
                success: false,
                message: 'Missing required fields'
            };
        }

        // Find bot
        const bot = await smartDcaBotSchema.findById(botId);

        if (!bot) {
            return {
                success: false,
                message: 'Bot not found'
            };
        }

        // Check ownership
        if (bot.userID !== userID) {
            return {
                success: false,
                message: 'Unauthorized'
            };
        }

        // Resume bot
        bot.status = 'active';
        bot.errorMessage = null;

        // Set next run time
        const intervalMs = intervalToMs(bot.dcaInterval);
        bot.nextRun = new Date(Date.now() + intervalMs);

        await bot.save();

        console.log('[API runSmartDCABot] Bot resumed:', botId);

        return {
            success: true,
            message: 'Bot resumed successfully',
            data: bot
        };

    } catch (error) {
        console.error('[API runSmartDCABot] Error:', error);
        return {
            success: false,
            message: 'Error resuming bot: ' + error.message
        };
    }
});
