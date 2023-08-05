import {userExchangesSchema} from "~/server/models/userExchanges.schema";
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const data = await readBody(event)

    //reset
    let resp1 = await userExchangesSchema.updateMany({userID:data.userID}, {isSelectedExchange:false});

    //update
    let resp2 = await userExchangesSchema.findOneAndUpdate({userID:data.userID, exchange: data.exchange}, {isSelectedExchange:true});

    return {
        data: resp2
    }
})
