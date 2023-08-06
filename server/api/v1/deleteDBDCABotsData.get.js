import {dcaBotSchema} from "~/server/models/dcaBot.schema";
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    let resp = await dcaBotSchema.deleteMany({});

    return 'ok';

})
