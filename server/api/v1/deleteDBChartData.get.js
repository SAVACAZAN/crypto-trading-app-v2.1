import {candlesSchema} from "~/server/models/candles.schema";
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    let resp = await candlesSchema.deleteMany({});

    return 'ok';

})
