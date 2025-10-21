import {OneClickBotSchema} from "~/server/models/OneClickBot.schema";
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    let resp = await OneClickBotSchema.deleteMany({});

    return 'ok';

})
