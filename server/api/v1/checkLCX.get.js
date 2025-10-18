export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const userID = query.userID || '66e5d23b4844420459b54ee9';

    const { userExchangesSchema } = await import('~/server/models/userExchanges.schema.js');

    // Get all exchanges for this user
    const allExchanges = await userExchangesSchema.find({ userID });

    // Check specifically for LCX
    const lcxExchange = await userExchangesSchema.findOne({ userID, exchange: 'lcx' });

    return {
        success: true,
        userID,
        totalExchanges: allExchanges.length,
        exchanges: allExchanges.map(ex => ({
            exchange: ex.exchange,
            apiKeysCount: ex.apiKeys?.length || 0,
            apiKeyNames: ex.apiKeys?.map(k => k.name || 'Default') || [],
            hasMarkets: ex.markets?.length > 0
        })),
        lcxExists: !!lcxExchange,
        lcxData: lcxExchange ? {
            exchange: lcxExchange.exchange,
            apiKeysCount: lcxExchange.apiKeys?.length || 0,
            apiKeyNames: lcxExchange.apiKeys?.map(k => k.name || 'Default') || [],
            marketsCount: lcxExchange.markets?.length || 0
        } : null
    };
});
