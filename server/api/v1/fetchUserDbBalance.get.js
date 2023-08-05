import { balanceSchema } from "~/server/models/balance.schema";
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    const response = await balanceSchema.find({ userID: query.userID, exchange: query.exchange });

    // console.log(response);

    return {
        data: response
    }
})
