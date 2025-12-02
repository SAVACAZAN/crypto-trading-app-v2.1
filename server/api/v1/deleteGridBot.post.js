import { gridBotSchema } from "~/server/models/gridBot.schema";

export default defineEventHandler(async (event) => {
    const data = await readBody(event);

    console.log('[API deleteGridBot] Request received:', {
        botId: data.botId,
        userID: data.userID
    });

    try {
        // Delete the grid bot by ID and userID (for security)
        const result = await gridBotSchema.deleteOne({
            _id: data.botId,
            userID: data.userID
        });

        console.log('[API deleteGridBot] Delete result:', result);

        if (result.deletedCount === 1) {
            return {
                success: true,
                message: 'Grid bot deleted successfully'
            };
        } else {
            return {
                success: false,
                message: 'Grid bot not found or already deleted'
            };
        }
    } catch (error) {
        console.error('[API deleteGridBot] Error:', error);
        return {
            success: false,
            message: 'Error deleting grid bot: ' + error.message
        };
    }
});
