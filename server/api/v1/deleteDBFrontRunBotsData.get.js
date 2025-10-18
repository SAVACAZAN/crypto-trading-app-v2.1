import {FronRunSchema} from "~/server/models/FronRun.schema.js";
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    let resp = await FronRunSchema.deleteMany({});

    return 'ok';

})
