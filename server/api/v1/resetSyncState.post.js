import { syncStateSchema } from '../../models/syncState.schema';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    const { userID, exchange, apiKeyName } = body;

    if (!userID || !exchange) {
        return {
            success: false,
            error: 'Missing required parameters: userID and exchange'
        };
    }

    try {
        // Delete the sync state for this exchange to force a full historical sync
        const result = await syncStateSchema.deleteMany({
            userID,
            exchange,
            apiKeyName: apiKeyName || { $exists: true },
            syncType: 'closed_orders'
        });

        console.log(`[RESET-SYNC] Deleted ${result.deletedCount} sync state(s) for ${exchange} - ${apiKeyName || 'all keys'}`);

        return {
            success: true,
            message: `Reset sync state for ${exchange}`,
            deletedCount: result.deletedCount
        };
    } catch (error) {
        console.error('[RESET-SYNC] Error:', error);
        return {
            success: false,
            error: error.message
        };
    }
});