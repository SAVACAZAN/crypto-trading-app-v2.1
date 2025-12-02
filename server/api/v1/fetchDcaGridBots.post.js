import { dcaGridBotSchema } from "~/server/models/dcaGridBot.schema";

export default defineEventHandler(async (event) => {
    const data = await readBody(event);

    console.log('[API fetchDcaGridBots] Request received:', {
        userID: data.userID
    });

    try {
        if (!data.userID) {
            return {
                success: false,
                message: 'Missing userID'
            };
        }

        // Fetch all DCA + Grid bots for this user
        const bots = await dcaGridBotSchema.find({
            userID: data.userID
        }).sort({ createdAt: -1 }).lean();

        console.log('[API fetchDcaGridBots] Found bots:', bots.length);

        return {
            success: true,
            data: bots
        };

    } catch (error) {
        console.error('[API fetchDcaGridBots] Error:', error);
        return {
            success: false,
            message: 'Error fetching DCA + Grid bots: ' + error.message
        };
    }
});
