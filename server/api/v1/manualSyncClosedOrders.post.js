import { createClosedOrdersSyncService } from '../../services/ClosedOrdersSyncService';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { userID, exchange, apiKeyName, symbol } = body;

    if (!userID || !exchange) {
        return {
            success: false,
            error: 'Missing required parameters: userID and exchange'
        };
    }

    try {
        // Get nitroApp from event context
        const nitroApp = useNitroApp();

        // Create sync service instance with nitroApp
        const syncService = createClosedOrdersSyncService(nitroApp);

        console.log(`[MANUAL-SYNC] Starting manual sync for ${exchange} - ${apiKeyName || 'default'}`);

        // Execute sync
        const result = await syncService.syncClosedOrders(
            userID,
            exchange,
            apiKeyName || 'default',
            symbol || null
        );

        console.log(`[MANUAL-SYNC] Completed:`, result);

        return {
            success: result.success,
            data: result,
            error: result.error
        };
    } catch (error) {
        console.error('[MANUAL-SYNC] Error:', error);
        return {
            success: false,
            error: error.message
        };
    }
});