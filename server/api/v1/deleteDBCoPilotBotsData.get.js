import {CoPilotBotSchema} from "~/server/models/CoPilotBot.schema";
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    let resp = await CoPilotBotSchema.deleteMany({});

    return 'ok';

})
