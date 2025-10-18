export default defineEventHandler(async (event) => {
    const nitroApp = useNitroApp()
    const data = await readBody(event)

    await nitroApp.GrinderBotLib.createGrinderBot(data);

    return {
        data: 'OK'
    }
})
