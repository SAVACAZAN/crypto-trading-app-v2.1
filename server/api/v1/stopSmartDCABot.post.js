import { smartDcaBotSchema } from "~/server/models/smartDcaBot.schema";

export default defineEventHandler(async (event) => {
    console.log('[API stopSmartDCABot] Request received');

    try {
        const body = await readBody(event);
        const { userID, botId } = body;

        if (!userID || !botId) {
            return {
                success: false,
                message: 'userID and botId are required'
            };
        }

        // Find and stop the bot
        const bot = await smartDcaBotSchema.findOne({ _id: botId, userID });

        if (!bot) {
            return {
                success: false,
                message: 'Bot not found'
            };
        }

        // Update bot status to stopped
        bot.status = 'stopped';
        bot.completedAt = new Date();

        await bot.save();

        console.log('[API stopSmartDCABot] Bot stopped:', botId);

        return {
            success: true,
            message: 'Bot stopped successfully',
            data: bot
        };

    } catch (error) {
        console.error('[API stopSmartDCABot] Error:', error);
        return {
            success: false,
            message: 'Error stopping Smart DCA Bot: ' + error.message
        };
    }
});
