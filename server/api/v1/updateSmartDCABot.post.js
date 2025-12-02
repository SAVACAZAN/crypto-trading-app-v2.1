import { smartDcaBotSchema } from "~/server/models/smartDcaBot.schema";

export default defineEventHandler(async (event) => {
    console.log('[API updateSmartDCABot] Request received');

    try {
        const body = await readBody(event);
        const { userID, botId, amountPerInterval, dcaInterval, totalDuration, executionMode } = body;

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

        // Update bot fields
        if (amountPerInterval !== undefined) {
            bot.amountPerInterval = parseFloat(amountPerInterval);
        }
        if (dcaInterval !== undefined) {
            bot.dcaInterval = dcaInterval;
        }
        if (totalDuration !== undefined) {
            bot.totalDuration = parseInt(totalDuration);
        }
        if (executionMode !== undefined) {
            bot.executionMode = executionMode;
        }

        await bot.save();

        console.log('[API updateSmartDCABot] Bot updated:', botId);

        return {
            success: true,
            message: 'Bot updated successfully',
            data: bot
        };

    } catch (error) {
        console.error('[API updateSmartDCABot] Error:', error);
        return {
            success: false,
            message: 'Error updating bot: ' + error.message
        };
    }
});
