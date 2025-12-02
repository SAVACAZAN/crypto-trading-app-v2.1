import { smartDcaBotSchema } from "~/server/models/smartDcaBot.schema";

export default defineEventHandler(async (event) => {
    console.log('[API deleteSmartDCABot] Request received');

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

        // Delete bot
        await smartDcaBotSchema.findByIdAndDelete(botId);

        console.log('[API deleteSmartDCABot] Bot deleted:', botId);

        return {
            success: true,
            message: 'Bot deleted successfully'
        };

    } catch (error) {
        console.error('[API deleteSmartDCABot] Error:', error);
        return {
            success: false,
            message: 'Error deleting bot: ' + error.message
        };
    }
});
