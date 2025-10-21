import {grinderBotSchema} from "~/server/models/grinderBot.schema";
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    let resp = await grinderBotSchema.deleteMany({});

    return 'ok';

})
