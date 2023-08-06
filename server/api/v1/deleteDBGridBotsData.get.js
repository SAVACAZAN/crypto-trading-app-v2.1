import {gridBotSchema} from "~/server/models/gridBot.schema";
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    let resp = await gridBotSchema.deleteMany({});

    return 'ok';

})
