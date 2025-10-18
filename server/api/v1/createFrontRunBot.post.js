export default defineEventHandler(async (event) => {
    const nitroApp = useNitroApp()
    const data = await readBody(event)

    await nitroApp.FrontRunLib.createBot(data);

    return {
        data: 'OK'
    }
})
