import {SMA, RSI, MACD} from 'technicalindicators';
import moment from 'moment';
import {candlesSchema} from "~/server/models/candles.schema";
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)


    const candles = await nitroApp.ccxtw.fetchOHLCV(query.userID, query.exchange, query.symbol, query.timeframe, undefined, 1);

    //candles data
    let candlesData = [];

    // console.log(candles);
    if (candles.data) {
        let result = candles.data;
        // console.log(result);

        for (let i = 0; i < result.length; i++) {
            candlesData.push({
                time:(result[i][0] / 1000),
                open:result[i][1],
                high:result[i][2],
                low:result[i][3],
                close:result[i][4],
                volume:result[i][5]
            });
        }
    }

    return candlesData

})
