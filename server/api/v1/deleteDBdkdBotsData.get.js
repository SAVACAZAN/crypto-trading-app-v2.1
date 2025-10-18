import {DkdBotSchema} from "~/server/models/DkdBot.schema";
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    let resp = await DkdBotSchema.deleteMany({});

    return 'ok';

})
