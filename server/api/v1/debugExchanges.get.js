export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const userID = query.userID;

    const { userExchangesSchema } = await import('~/server/models/userExchanges.schema.js');

    // Get all exchanges for this user
    const exchanges = await userExchangesSchema.find({ userID });

    return {
        success: true,
        userID,
        exchangesCount: exchanges.length,
        exchanges: exchanges.map(ex => ({
            exchange: ex.exchange,
            apiKeysCount: ex.apiKeys?.length || 0,
            apiKeyNames: ex.apiKeys?.map(k => k.name || 'Default') || []
        }))
    };
});
