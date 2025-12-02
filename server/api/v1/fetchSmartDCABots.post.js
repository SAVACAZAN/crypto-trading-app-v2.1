import { smartDcaBotSchema } from "~/server/models/smartDcaBot.schema";

export default defineEventHandler(async (event) => {
    console.log('[API fetchSmartDCABots] Request received');

    try {
        const body = await readBody(event);
        const { userID } = body;

        if (!userID) {
            return {
                success: false,
                message: 'userID is required'
            };
        }

        // Fetch all bots for the user (active, stopped, completed)
        const bots = await smartDcaBotSchema
            .find({
                userID,
                status: { $in: ['active', 'stopped'] } // Show active and stopped bots
            })
            .sort({ startedAt: -1 })
            .lean();

        console.log('[API fetchSmartDCABots] Found bots:', bots.length);

        return {
            success: true,
            data: bots
        };

    } catch (error) {
        console.error('[API fetchSmartDCABots] Error:', error);
        return {
            success: false,
            message: 'Error fetching Smart DCA Bots: ' + error.message
        };
    }
});
