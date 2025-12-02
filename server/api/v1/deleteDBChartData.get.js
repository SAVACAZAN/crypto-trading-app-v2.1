import {candlesSchema} from "~/server/models/candles.schema";
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    const { exchange, symbol, timeframe } = query;

    // Build filter - if parameters provided, delete only matching candles
    // Otherwise delete all (backward compatibility)
    const filter = {};
    if (exchange) filter.exchange = exchange;
    if (symbol) filter.symbol = symbol;
    if (timeframe) filter.timeframe = timeframe;

    console.log('🗑️ Deleting candles from DB:', filter);

    let resp = await candlesSchema.deleteMany(filter);

    console.log(`✅ Deleted ${resp.deletedCount} candles`);

    return {
        success: true,
        deletedCount: resp.deletedCount,
        filter
    };

})
