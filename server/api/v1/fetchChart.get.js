import {SMA, RSI, MACD} from 'technicalindicators';
export default defineEventHandler(async (event) => {

    const nitroApp = useNitroApp()
    const query = getQuery(event)

    let response = await nitroApp.ccxtw.fetchOHLCV(query.userID, query.exchange, query.symbol, '1m');

    if (response.success){
        //candles data
        let candlesData = [];
        for (let i = 0; i < response.data.length; i++) {
            candlesData.push({
                time:(response.data[i][0] / 1000),
                open:response.data[i][1],
                high:response.data[i][2],
                low:response.data[i][3],
                close:response.data[i][4],
            });
        }

        //volume data
        let volumeData = [];
        for (let i = 0; i < response.data.length; i++) {
            volumeData.push({
                time:(response.data[i][0] / 1000),
                value:response.data[i][5],
                color: (candlesData[i].open < candlesData[i].close) ? 'rgb(38,166,154)' : 'rgb(239,83,80)'
            });
        }

        //general close
        let close = [];
        for (let i = 0; i < response.data.length; i++) {
            close.push(response.data[i][4])
        }

        //sma data
        let ma7Data = [];
        let ma7 = new SMA({period : 7, values : close});
        let results = ma7.getResult();
        let offset = close.length - results.length;
        for (let i = 0; i < results.length; i++) {
            ma7Data.push({
                time:(response.data[i+offset][0] / 1000),
                value:results[i],
            });
        }

        let ma25Data = [];
        let ma25 = new SMA({period : 25, values : close});
        results = ma25.getResult();
        offset = close.length - results.length;
        for (let i = 0; i < results.length; i++) {
            ma25Data.push({
                time:(response.data[i+offset][0] / 1000),
                value:results[i],
            });
        }

        let ma99Data = [];
        let ma99 = new SMA({period : 99, values : close});
        results = ma99.getResult();
        offset = close.length - results.length;
        for (let i = 0; i < results.length; i++) {
            ma99Data.push({
                time:(response.data[i+offset][0] / 1000),
                value:results[i],
            });
        }

        let rsiData = [];
        let rsi = new RSI({period : 14, values : close});
        results = rsi.getResult();
        offset = close.length - results.length;
        for (let i = 0; i < results.length; i++) {
            rsiData.push({
                time:(response.data[i+offset][0] / 1000),
                value:results[i],
            });
        }

        //macd data
        let macd = [];
        let macdSignal = [];
        let macdHistogram = [];
        results = MACD.calculate({
            values:close,
            fastPeriod        : 12,
            slowPeriod        : 26,
            signalPeriod      : 9,
            SimpleMAOscillator: false,
            SimpleMASignal    : false
        });
        offset = close.length - results.length;
        for (let i = 0; i < results.length; i++) {
            macd.push({
                time:(response.data[i+offset][0] / 1000),
                value:results[i].MACD,
            });

            macdSignal.push({
                time:(response.data[i+offset][0] / 1000),
                value:results[i].signal
            });

            macdHistogram.push({
                time:(response.data[i+offset][0] / 1000),
                value:results[i].histogram,
                color: (results[i].histogram > 0) ? 'rgb(38,166,154)' : 'rgb(239,83,80)'
            });
        }

        let formattedData = {
            candles:candlesData,
            volume:volumeData,
            ma7:ma7Data,
            ma25:ma25Data,
            ma99:ma99Data,
            rsi:rsiData,
            macd:macd,
            macdSignal:macdSignal,
            macdHistogram:macdHistogram,
        }

        return formattedData

    }
})
