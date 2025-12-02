export default defineEventHandler(async (event) => {
    const nitroApp = useNitroApp()
    const data = await readBody(event)

    // Use the same library as Scalp1ngBot since they're similar grid bots
    await nitroApp.Scalp1ngBotLib.createBot(data);

    return {
        data: 'OK',
        message: 'Fibonacci Grid Bot created successfully'
    }
})
