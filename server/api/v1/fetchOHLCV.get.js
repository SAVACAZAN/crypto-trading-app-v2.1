import {SMA, RSI, MACD} from 'technicalindicators';
import moment from 'moment';
import {candlesSchema} from "~/server/models/candles.schema";
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)


    // you can use milliseconds integer or also parse uniform datetime string, i.e.  exchange.parse8601 ('2020-02-01T00:00:00Z') // 2023-07-01T00:00:00Z
    // const fromTimestamp = 1643659200000;
    // const fromTimestamp = await nitroApp.ccxtw.parse8601 (query.userID, query.exchange, query.dateFrom);
    const fromTimestamp = parseInt(query.dateFrom);
    const tillTimestamp = await nitroApp.ccxtw.milliseconds(query.userID, query.exchange);
    // const timeframe = '1h';
    // const itemsLimit = 1000;

    // get the duration of one timeframe period in milliseconds
    const duration = await nitroApp.ccxtw.parseTimeframe(query.userID, query.exchange, query.timeframe) * 1000;
    // console.log ('Fetching', query.symbol, query.timeframe, 'candles', 'from', await nitroApp.ccxtw.iso8601(query.userID, query.exchange, fromTimestamp), 'to', await nitroApp.ccxtw.iso8601(query.userID, query.exchange, tillTimestamp), '...');

    // console.log('fromTimestamp??', fromTimestamp, query.dateFrom);
    let lastBar = null;

    let result = [];
    let since = fromTimestamp;
    do {

        try {
            //check if data exists in db
            let candles = await candlesSchema.find({
                exchange:query.exchange,
                symbol:query.symbol,
                timeframe:query.timeframe,
                timestamp:{
                    $gte:since,
                    $lte:since + (duration * 100000)
                }
            })
            .exec();

            // console.log('1?: ', candles);

            if(candles.length) {
                // console.log('in candles', candles.length);

                for (let i = 0; i < candles.length; i++) {
                    //add db data to result
                    let arr = [];
                    arr[0] = Date.parse(candles[i].timestamp);
                    arr[1] = candles[i].open;
                    arr[2] = candles[i].high;
                    arr[3] = candles[i].low;
                    arr[4] = candles[i].close;
                    arr[5] = candles[i].volume;

                    result.push(arr);
                }

                const last = Date.parse(candles[candles.length - 1].timestamp);

                //push since to the next period
                since = last + duration // next start from last candle timestamp + duration

            } else {
                const candles = await nitroApp.ccxtw.fetchOHLCV(query.userID, query.exchange, query.symbol, query.timeframe, since, query.limit);
                // console.log('out candles', candles.data);

                // const message =  '[' + query.symbol + '] Fetched ' + candles.data.length + ' ' + query.timeframe + ' candles since ' + await nitroApp.ccxtw.iso8601(query.userID, query.exchange, since);

                if (candles.data) {

                    const first = candles.data[0];
                    const last = candles.data[candles.data.length - 1];
                    // console.log ( message, ' | first', await nitroApp.ccxtw.iso8601(query.userID, query.exchange, first[0]),  ' | last',  await nitroApp.ccxtw.iso8601(query.userID, query.exchange, last[0]));

                    // store your candles to a database or to a file here
                    for (let i = 0; i < candles.data.length; i++) {
                        await new candlesSchema({
                            exchange:query.exchange,
                            symbol:query.symbol,
                            timeframe:query.timeframe,
                            timestamp:candles.data[i][0],
                            open:candles.data[i][1],
                            high:candles.data[i][2],
                            low:candles.data[i][3],
                            close:candles.data[i][4],
                            volume:candles.data[i][5],
                        }).save();

                        if (i === candles.data.length - 1) {
                            lastBar = {
                                exchange:query.exchange,
                                symbol:query.symbol,
                                timeframe:query.timeframe,
                                timestamp:candles.data[i][0],
                                open:candles.data[i][1],
                                high:candles.data[i][2],
                                low:candles.data[i][3],
                                close:candles.data[i][4],
                                volume:candles.data[i][5],
                            }
                        }
                    }


                    result =  result.concat (candles.data);
                    since = last[0] + duration // next start from last candle timestamp + duration

                } else {
                    // console.log ( message, ' | moving into next period');
                    since = since + duration * query.limit; // next start from the current period's end
                }
            }

        } catch (e) {

            // console.log (query.symbol, e.constructor.name, e.message, ' Taking small pause...');
            await nitroApp.ccxtw.sleep(query.userID, query.exchange, 2000);
            // retry on next iteration
        }

    } while (since + duration <= tillTimestamp)

    if (lastBar !== null) {
        // console.log('last bar!!');
        candlesSchema.findOneAndDelete({
            exchange:lastBar.exchange,
            symbol:lastBar.symbol,
            timeframe:lastBar.timeframe,
            timestamp:lastBar.timestamp,
        })
    }

    // console.log (query.symbol + ' completed !');



    // console.log(result);

    //candles data
    let candlesData = [];
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

    return candlesData

})
