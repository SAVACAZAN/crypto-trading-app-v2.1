export default defineEventHandler(async (event) => {
    const nitroApp = useNitroApp()
    const data = await readBody(event)

    await nitroApp.Scalp1ngBotLib.createBot(data);

    return {
        data: 'OK'
    }
})
