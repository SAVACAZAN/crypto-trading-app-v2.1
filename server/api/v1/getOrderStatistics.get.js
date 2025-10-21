import { orderStatisticsSchema } from '~/server/models/orderStatistics.schema';

export default defineEventHandler(async (event) => {
    const startTime = Date.now();

    try {
        const query = getQuery(event);
        const { userID, exchange, symbol } = query;

        if (!userID || !exchange || !symbol) {
            return {
                success: false,
                error: 'Missing required parameters: userID, exchange, symbol'
            };
        }

        console.log(`[STATS] 📊 Fetching pre-calculated statistics for ${userID}/${exchange}/${symbol}...`);

        // Caută statisticile pre-calculate
        const statistics = await orderStatisticsSchema.findOne({
            userID,
            exchange,
            symbol,
            apiKeyName: null // Statistici generale
        }).lean();

        if (!statistics) {
            console.log(`[STATS] ⚠️ No statistics found - need to calculate first`);
            return {
                success: false,
                error: 'Statistics not found. Please calculate statistics first.',
                needsCalculation: true
            };
        }

        const duration = Date.now() - startTime;
        console.log(`[STATS] ✅ Statistics fetched in ${duration}ms (calculated at: ${statistics.calculatedAt})`);

        return {
            success: true,
            data: statistics,
            meta: {
                fetchTime: duration,
                calculatedAt: statistics.calculatedAt,
                orderCount: statistics.orderCount,
                calculationDuration: statistics.calculationDuration,
                age: Date.now() - new Date(statistics.calculatedAt).getTime() // milliseconds since calculation
            }
        };

    } catch (error) {
        console.error('[STATS] ❌ Error fetching statistics:', error);
        return {
            success: false,
            error: error.message
        };
    }
});
