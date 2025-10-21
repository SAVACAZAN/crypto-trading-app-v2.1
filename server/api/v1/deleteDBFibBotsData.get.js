import {FibBotSchema} from "~/server/models/FibBot.schema";
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    let resp = await FibBotSchema.deleteMany({});

    return 'ok';

})
