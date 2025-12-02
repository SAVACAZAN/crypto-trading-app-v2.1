import { gridBotSchema } from "~/server/models/gridBot.schema";

export default defineEventHandler(async (event) => {
    console.log('[API fetchAllGridBots] Request received');

    try {
        // Fetch all grid bots from all users (public community bots)
        const bots = await gridBotSchema.find({})
        .sort({ _id: -1 })
        .limit(100) // Limit to 100 most recent bots
        .lean();

        console.log('[API fetchAllGridBots] Found bots:', bots.length);
        if (bots.length > 0) {
            console.log('[API fetchAllGridBots] Sample bot name:', bots[0].name);
            console.log('[API fetchAllGridBots] Sample bot BalanceBot:', bots[0].BalanceBot);
            console.log('[API fetchAllGridBots] Sample bot BalanceBotProfit:', bots[0].BalanceBot?.BalanceBotProfit);
        }

        return {
            success: true,
            data: bots
        };

    } catch (error) {
        console.error('[API fetchAllGridBots] Error:', error);
        return {
            success: false,
            message: 'Error fetching community bots: ' + error.message
        };
    }
});
