import {userExchangesSchema} from "~/server/models/userExchanges.schema";

export default defineEventHandler(async (event) => {
    const nitroApp = useNitroApp()
    const data = await readBody(event)

    //set rest of exchanges as not selected
    await userExchangesSchema.updateMany({userID:data.userID}, {isSelectedExchange:false});

    //get exchange instance
    let exchangeInstance = await nitroApp.ccxtw.fetchExchangeInstance(data.exchange);

    //get exchange markets
    const marketsRaw = await $fetch('/api/v1/fetchMarkets', {
        query:{
            userID:data.userID,
            exchange:data.exchange,
        }
    });

    //format markets
    let markets = [];
    const processedMarkets = new Set();

    for (let i = 0; i < marketsRaw.data.length; i++) {
        let key = `${marketsRaw.data[i].base}/${marketsRaw.data[i].quote}`;

        if (marketsRaw.data[i].active && !processedMarkets.has(key)) {
            processedMarkets.add(key);

            markets.push({
                base:marketsRaw.data[i].base,
                quote:marketsRaw.data[i].quote,
                type:(marketsRaw.data[i].type === 'spot') ? 'spot' : 'futures',
                limits: marketsRaw.data[i].limits,
                precision:marketsRaw.data[i].precision,
                maker:marketsRaw.data[i].maker,
                taker:marketsRaw.data[i].taker,
            });
        }
    }

    let userExchange = {
        userID: data.userID,
        exchange: data.exchange,
        timeframes:exchangeInstance.timeframes,
        isSelectedExchange:true,
        markets:markets,
        selectedMarket:markets[0],
        apiKeys:data.apiKeys,
    };


    //push data to db
    let resp = await new userExchangesSchema(userExchange).save()

    return {
        data: resp
    }
})


