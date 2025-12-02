import { dcaGridBotSchema } from "~/server/models/dcaGridBot.schema";

export default defineEventHandler(async (event) => {
    const data = await readBody(event);

    console.log('[API updateDcaGridBot] Request received:', {
        botId: data.botId,
        userID: data.userID,
        updates: Object.keys(data).filter(k => k !== 'botId' && k !== 'userID')
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

        // Update allowed fields
        const allowedUpdates = [
            'status', 'dcaAmount', 'dcaInterval', 'totalBudget',
            'lowerPrice', 'upperPrice', 'nrOfGrids', 'gridAmount', 'gridSide',
            'autoAdjustGrid', 'reinvestProfits', 'stopLoss', 'takeProfit'
        ];

        allowedUpdates.forEach(field => {
            if (data[field] !== undefined) {
                bot[field] = data[field];
            }
        });

        bot.updatedAt = new Date();
        await bot.save();

        console.log('[API updateDcaGridBot] Bot updated:', {
            botId: bot._id,
            status: bot.status
        });

        return {
            success: true,
            message: 'Bot updated successfully',
            data: bot
        };

    } catch (error) {
        console.error('[API updateDcaGridBot] Error:', error);
        return {
            success: false,
            message: 'Error updating bot: ' + error.message
        };
    }
});
