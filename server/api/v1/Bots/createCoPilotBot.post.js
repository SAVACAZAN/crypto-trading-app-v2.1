export default defineEventHandler(async (event) => {
    try {
        const nitroApp = useNitroApp()
        const data = await readBody(event)

        console.log('🤖 [CreateCoPilotBot] Creating Co-Pilot bot:', {
            userID: data.userID,
            name: data.name,
            exchange: data.exchange,
            symbol: data.symbol
        });

        const bot = await nitroApp.CoPilotBotLib.createBot(data);

        console.log('✅ [CreateCoPilotBot] Bot created successfully:', {
            botId: bot?._id,
            name: bot?.name
        });

        return {
            success: true,
            data: 'OK',
            bot: bot
        }
    } catch (error) {
        console.error('❌ [CreateCoPilotBot] Error creating bot:', error);
        return {
            success: false,
            error: error.message || 'Failed to create Co-Pilot bot'
        }
    }
})
