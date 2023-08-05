import {userExchangesSchema} from "~/server/models/userExchanges.schema";

export default defineEventHandler(async (event) => {
    const nitroApp = useNitroApp()
    const data = await readBody(event)

    let resp = await userExchangesSchema.findByIdAndDelete(data.id);

    return {
        data: resp
    }
})
