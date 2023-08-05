import {userExchangesSchema} from "~/server/models/userExchanges.schema";
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const data = await readBody(event)

    //get user exchange
    let userExchange = await userExchangesSchema.findOne({userID:data.userID, exchange: data.exchange});


    //update selected market data by symbol
    for (let i = 0; i < userExchange.markets.length; i++) {
        if (userExchange.markets[i].base === data.market.split('/')[0] && userExchange.markets[i].quote === data.market.split('/')[1]) {
            let resp = await userExchangesSchema.findOneAndUpdate({userID:data.userID, exchange: data.exchange}, {selectedMarket:userExchange.markets[i]});

            return {
                data: resp
            }
        }
    }
})
