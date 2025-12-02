import { dcaGridBotSchema } from "~/server/models/dcaGridBot.schema";

export default defineEventHandler(async (event) => {
    const data = await readBody(event);

    console.log('[API stopDcaGridBot] Request received:', {
        botId: data.botId,
        userID: data.userID
    });

    try {
        if (!data.botId || !data.userID) {
            return {
                success: false,
                message: 'Missing botId or userID'
            };
        }

        // Find the bot
        const bot = await dcaGridBotSchema.findOne({
            _id: data.botId,
            userID: data.userID
        });

        if (!bot) {
            return {
                success: false,
                message: 'Bot not found'
            };
        }

        // Update status to stopped
        bot.status = 'stopped';
        bot.stoppedAt = new Date();
        bot.updatedAt = new Date();
        await bot.save();

        console.log('[API stopDcaGridBot] Bot stopped:', {
            botId: bot._id,
            name: bot.name
        });

        return {
            success: true,
            message: 'Bot stopped successfully',
            data: {
                botId: bot._id,
                status: bot.status,
                stoppedAt: bot.stoppedAt
            }
        };

    } catch (error) {
        console.error('[API stopDcaGridBot] Error:', error);
        return {
            success: false,
            message: 'Error stopping bot: ' + error.message
        };
    }
});
