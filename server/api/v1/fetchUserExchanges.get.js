import {userExchangesSchema} from "~/server/models/userExchanges.schema";
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    const apiKeys = await userExchangesSchema.find({ userID: query.userID });

    return {
        data: apiKeys
    }
})
