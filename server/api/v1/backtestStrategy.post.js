import { dcaBotStrategy } from "~/strategies/simpleStrategy";

export default defineEventHandler(async (event) => {
    const nitroApp = useNitroApp()
    const data = await readBody(event)

    nitroApp.backtestEngine.init(data);

    let results = nitroApp.backtestEngine.executeStrategy(dcaBotStrategy);

    return {
        data: results
    }
})
