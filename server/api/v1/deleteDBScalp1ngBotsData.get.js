import {Scalp1ngBotSchema} from "~/server/models/Scalp1ngBot.schema";
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    let resp = await Scalp1ngBotSchema.deleteMany({});

    return 'ok';

})
