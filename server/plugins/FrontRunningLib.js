import {SMA, RSI, CrossUp, CrossDown} from 'technicalindicators';
import moment from 'moment';
import { create, all } from 'mathjs';
import {dcaBotSchema} from "~/server/models/dcaBot.schema";
const config = {
    number: 'BigNumber',
    precision: 20
}
const math = create(all, config);

export default defineNitroPlugin((nitroApp) => {
    // console.log('DCA Library Loaded...')

    nitroApp.DCALib = {

        placeBaseOrder: async function(bot) {
            let status = await nitroApp.ccxtw.fetchTicker(bot.userID, bot.exchange, bot.symbol);
            let baseOrderPrice = status.data.last;
            let baseOrderAmount = math.evaluate(`(${bot.baseOrderAmount} * ${bot.leverage}) / ${baseOrderPrice}`);
            let side = this.getSide(bot);
            let log = null;

            if (bot.marketType === 'future') {
                await nitroApp.ccxtw.setLeverage(bot.userID, bot.exchange, bot.leverage, bot.symbol);
            }

            let orderResponse = await nitroApp.ccxtw.createOrder(
                bot.userID,
                bot.exchange,
                bot.symbol,
                bot.baseOrderType,
                side.mainDirection,
                baseOrderAmount,
                baseOrderPrice,
            );

            if (orderResponse.success) {
                bot.activeDeal.baseOrder = orderResponse.data;
                log =`${this.getCurrentTime()}: ${bot.symbol} - ${bot.activeDeal.status} - Type: ${bot.baseOrderType}, Side: ${side.mainDirection}, Amount: ${baseOrderAmount}, Price: ${baseOrderPrice}`;

                //next step->>
                bot.activeDeal.status = 'WAIT_FOR_FILLS';
            }

            if (!orderResponse.success) {
                bot.activeDeal.baseOrder = null;
                log =`${this.getCurrentTime()}: ${bot.symbol} - ${bot.activeDeal.status} - ${orderResponse.log}`;
            }

            bot.logs.push(log);
            console.log(log);

            return bot;
        },
        placeSafetyOrder: async function(bot) {
            let sign = this.getSign(bot);
            let safetyOrderPrice = math.evaluate(`${bot.activeDeal.filledOrders[bot.activeDeal.filledOrders.length -1].price} ${sign.mainSign} ((${bot.activeDeal.filledOrders[bot.activeDeal.filledOrders.length -1].price} / 100) * ${bot.safetyOrderPercent})`);
            let safetyOrderAmount = math.evaluate(`(${bot.safetyOrderAmount} * ${bot.leverage}) / ${safetyOrderPrice}`);
            let side = this.getSide(bot);
            let log = null;

            let orderResponse = await nitroApp.ccxtw.createOrder(
                bot.userID,
                bot.exchange,
                bot.symbol,
                'limit',
                side.mainDirection,
                safetyOrderAmount,
                safetyOrderPrice
            );

            if (orderResponse.success) {
                bot.activeDeal.safetyOrder = orderResponse.data;
                log =`${this.getCurrentTime()}: ${bot.symbol} - ${bot.activeDeal.status} - Type: limit, Side: ${side.mainDirection}, Amount: ${safetyOrderAmount}, Price: ${safetyOrderPrice}`;

                //next step->>
                bot.activeDeal.status = 'PLACE_TAKE_PROFIT_ORDER';
            }

            if (!orderResponse.success) {
                bot.activeDeal.safetyOrder = null;
                log =`${this.getCurrentTime()}: ${bot.symbol} - ${bot.activeDeal.status} - ${orderResponse.log}`;
            }

            bot.logs.push(log);
            console.log(log);

            return bot;
        },
        placeTakeProfitOrder: async function(bot) {
            let sign = this.getSign(bot);
            let side = this.getSide(bot);
            let log = null;

            let tpTotalAmount = 0;
            let tpTotalCost = 0;
            for (let i = 0; i < bot.activeDeal.filledOrders.length; i++) {
                if (bot.activeDeal.filledOrders[i].side === side.mainDirection) {
                    tpTotalAmount = math.evaluate(`${tpTotalAmount} + ${bot.activeDeal.filledOrders[i].amount}`);
                    tpTotalCost   = math.evaluate(`${tpTotalCost} + ${bot.activeDeal.filledOrders[i].cost}`);

                    // console.log(bot.activeDeal.filledOrders[i].fees);
                }
            }
            let tpPriceAverage = math.evaluate(`${tpTotalCost} / ${tpTotalAmount}`);
            let tpPrice = math.evaluate(`${tpPriceAverage} ${sign.oppositeSign} ((${tpPriceAverage} / 100) * ${bot.takeProfitOrderPercent})`);

            let type = null;
            let params = null;
            if (bot.exchange === 'binance') {
                params = {'stopPrice': tpPrice};
                if (bot.marketType === 'spot') {
                    type = 'take_profit_limit';
                }
                if (bot.marketType === 'future') {
                    type = 'take_profit';
                }
            } else {
                type = 'limit';
            }

            let orderResponse = await nitroApp.ccxtw.createOrder(
                bot.userID,
                bot.exchange,
                bot.symbol,
                type,
                side.oppositeDirection,
                tpTotalAmount,
                tpPrice,
                params
            );

            if (orderResponse.success) {
                bot.activeDeal.takeProfitOrder = orderResponse.data;
                log =`${this.getCurrentTime()}: ${bot.symbol} - ${bot.activeDeal.status} - Type: ${type}, Side: ${side.mainDirection}, Amount: ${tpTotalAmount}, Price: ${tpPrice}`;

                //next step->>
                bot.activeDeal.status = 'WAIT_FOR_FILLS';
            }

            if (!orderResponse.success) {
                bot.activeDeal.takeProfitOrder = null;
                log =`${this.getCurrentTime()}: ${bot.symbol} - ${bot.activeDeal.status} - ${orderResponse.log}`;
            }

            bot.logs.push(log);
            console.log(log);

            return bot;
        },
        placeStopLossOrder: async function(bot) {
            let sign = this.getSign(bot);
            let side = this.getSide(bot);
            let log = null;

            let baseOrderPrice = bot.activeDeal.filledOrders[0].price;
            let stopLossOrderPrice = math.evaluate(`${baseOrderPrice} ${sign.mainSign} ((${baseOrderPrice} / 100) * ${bot.stopLossOrderPercent})`);

            let totalAmount = 0;
            let totalCost = 0;
            for (let i = 0; i < bot.activeDeal.filledOrders.length; i++) {
                if (bot.activeDeal.filledOrders[i].side === side.mainDirection) {
                    totalAmount = math.evaluate(`${totalAmount} + ${bot.activeDeal.filledOrders[i].amount}`);
                    totalCost   = math.evaluate(`${totalCost} + ${bot.activeDeal.filledOrders[i].cost}`);
                }
            }

            let tpPriceAverage = math.evaluate(`${totalCost} / ${totalAmount}`);
            let tpPrice = math.evaluate(`${tpPriceAverage} ${sign.oppositeSign} ((${tpPriceAverage} / 100) * ${bot.takeProfitOrderPercent})`);

            let type = null;
            let params = null;
            if(bot.marketType === 'future') {
                type = 'STOP_MARKET';
                params = {
                    'stopPrice': stopLossOrderPrice
                };
            }
            if(bot.marketType === 'spot') {
                type = 'oco';
                params = {
                    tpPrice:tpPrice,
                    stopLossPrice: stopLossOrderPrice,
                    stopLimitPrice: stopLossOrderPrice
                };
            }

            let orderResponse = await nitroApp.ccxtw.createOrder(
                bot.userID,
                bot.exchange,
                bot.symbol,
                type,
                side.oppositeDirection,
                totalAmount,
                stopLossOrderPrice,
                params
            );

            if (orderResponse.success) {
                log =`${this.getCurrentTime()}: ${bot.symbol} - ${bot.activeDeal.status} - Type: limit, Side: ${side.mainDirection}, Amount: ${totalAmount}, Price: ${stopLossOrderPrice}`;
                bot.logs.push(log);
                console.log(log);

                //next step->>
                if(bot.marketType === 'future') {
                    bot.activeDeal.stopLossOrder = orderResponse.data;

                    bot.activeDeal.status = 'PLACE_TAKE_PROFIT_ORDER';
                }

                if(bot.marketType === 'spot') {
                    let stopLossOrder = await nitroApp.ccxtw.fetchOrder(bot.userID, bot.exchange, orderResponse.data.orders[0].orderId, bot.symbol);
                    bot.activeDeal.stopLossOrder = stopLossOrder.data;

                    let takeProfitOrder = await nitroApp.ccxtw.fetchOrder(bot.userID, bot.exchange, orderResponse.data.orders[1].orderId, bot.symbol);
                    bot.activeDeal.takeProfitOrder = takeProfitOrder.data;

                    bot.activeDeal.status = 'WAIT_FOR_FILLS';
                }

            }

            if (!orderResponse.success) {
                bot.activeDeal.stopLossOrder = null;
                log =`${this.getCurrentTime()}: ${bot.symbol} - ${bot.activeDeal.status} - ${orderResponse.log}`;
                bot.logs.push(log);
                console.log(log);
            }

            return bot;
        },
        checkBaseOrder: async function(bot) {
            let orderResponse = await nitroApp.ccxtw.fetchOrder(bot.userID, bot.exchange, bot.activeDeal.baseOrder.id, bot.symbol);
            let log = null;

            if (orderResponse.success) {
                if (orderResponse.data.status === 'closed') {
                    bot.activeDeal.baseOrder = null;
                    bot.activeDeal.filledOrders.push(orderResponse.data);
                    log =`${this.getCurrentTime()}: ${bot.symbol} - ${bot.activeDeal.status} - BASE_ORDER_FILLED`;
                    bot.logs.push(log);
                    console.log(log);

                    //next step->>
                    if ((bot.activeDeal.filledOrders.length - 1) < bot.maxSafetyOrdersCount) {

                        bot.activeDeal.status = 'PLACE_SAFETY_ORDER';
                    } else {

                        if (bot.stopLossOrderPercent > 0) {
                            bot.activeDeal.status = 'PLACE_STOP_LOSS_ORDER';
                        } else {
                            log = `${this.getCurrentTime()}: ${bot.symbol} - SAFETY_ORDERS_NR_REACHED`;
                            bot.activeDeal.status = 'SAFETY_ORDERS_NR_REACHED';

                            bot.logs.push(log);
                            console.log(log);
                        }
                    }
                }
            }
            return bot;
        },
        checkSafetyOrder: async function(bot) {
            let orderResponse = await nitroApp.ccxtw.fetchOrder(bot.userID, bot.exchange, bot.activeDeal.safetyOrder.id, bot.symbol);
            let log = null;

            if (orderResponse.success) {
                if (orderResponse.data.status === 'closed') {
                    bot.activeDeal.safetyOrder = null;
                    bot.activeDeal.filledOrders.push(orderResponse.data);
                    log =`${this.getCurrentTime()}: ${bot.symbol} - ${bot.activeDeal.status} - SAFETY_ORDER_FILLED`;
                    bot.logs.push(log);
                    console.log(log);

                    //cancel tp order if any
                    if (bot.activeDeal.takeProfitOrder !== null){
                        let cancelOrderResponse = await nitroApp.ccxtw.cancelOrder(bot.userID, bot.exchange, bot.activeDeal.takeProfitOrder.id, bot.symbol);
                        if (!cancelOrderResponse.success) {
                            bot.logs.push(cancelOrderResponse.log);
                            console.log(cancelOrderResponse.log);
                        }
                        bot.activeDeal.takeProfitOrder = null;
                    }
                    //next step->>
                    if ((bot.activeDeal.filledOrders.length - 1) < bot.maxSafetyOrdersCount) {
                        bot.activeDeal.status = 'PLACE_SAFETY_ORDER';
                    } else {
                        if (bot.stopLossOrderPercent > 0) {
                            bot.activeDeal.status = 'PLACE_STOP_LOSS_ORDER';
                        } else {
                            log = `${this.getCurrentTime()}: ${bot.symbol} - SAFETY_ORDERS_NR_REACHED`;
                            bot.activeDeal.status = 'PLACE_TAKE_PROFIT_ORDER';

                            bot.logs.push(log);
                            console.log(log);
                        }
                    }
                }
            }

            return bot;
        },
        checkTakeProfitOrder: async function(bot) {
            let side = this.getSide(bot);
            let orderResponse = await nitroApp.ccxtw.fetchOrder(bot.userID, bot.exchange, bot.activeDeal.takeProfitOrder.id, bot.symbol);
            let log = null;

            if (orderResponse.success) {
                if (orderResponse.data.status === 'closed') {
                    bot.activeDeal.takeProfitOrder = null;
                    bot.activeDeal.filledOrders.push(orderResponse.data);
                    log =`${this.getCurrentTime()}: ${bot.symbol} - ${bot.activeDeal.status} - TAKE_PROFIT_ORDER_FILLED`;
                    bot.logs.push(log);
                    console.log(log);

                    //next step->>
                    //cancel old safety order
                    if (bot.activeDeal.safetyOrder !== null){
                        let cancelOrderResponse = await nitroApp.ccxtw.cancelOrder(bot.userID, bot.exchange, bot.activeDeal.safetyOrder.id, bot.symbol);
                        if (!cancelOrderResponse.success) {
                            bot.logs.push(cancelOrderResponse.log);
                            console.log(cancelOrderResponse.log);
                        }
                        bot.activeDeal.safetyOrder = null;
                    }


                    if (bot.marketType === 'future') {
                        if (bot.activeDeal.stopLossOrder !== null){
                            let cancelOrderResponse = await nitroApp.ccxtw.cancelOrder(bot.userID, bot.exchange, bot.activeDeal.stopLossOrder.id, bot.symbol);
                            if (!cancelOrderResponse.success) {
                                bot.logs.push(cancelOrderResponse.log);
                                console.log(cancelOrderResponse.log);
                            }
                            bot.activeDeal.stopLossOrder = null;
                        }
                    }

                    //calculate profit
                    bot.activeDeal.profit = this.calculateProfit(bot.activeDeal.filledOrders, side.mainDirection);
                    bot.profit = math.evaluate(`${bot.profit} + ${bot.activeDeal.profit}`);
                    bot.activeDeal.status = 'CLOSED_DEAL';

                    bot.closedDeals.push(bot.activeDeal);

                    log = `${this.getCurrentTime()}: ${bot.symbol} - CLOSED_DEAL - Profit: ${bot.activeDeal.profit}!!!. Resetting.`;
                    bot.logs.push(log);
                    console.log(log);

                    //reset
                    bot.activeDeal = {
                        status:'START_NEW_DEAL',
                        baseOrder:null,
                        safetyOrder:null,
                        takeProfitOrder:null,
                        stopLossOrder:null,
                        filledOrders:[],
                        profit:0,
                    };
                }
            }

            return bot;
        },
        checkStopLossOrder: async function(bot) {
            let side = this.getSide(bot);
            let orderResponse = await nitroApp.ccxtw.fetchOrder(bot.userID, bot.exchange, bot.activeDeal.stopLossOrder.id, bot.symbol);
            let log = null;

            if (orderResponse.success) {
                if (orderResponse.data.status === 'closed') {
                    bot.activeDeal.stopLossOrder = null;
                    bot.activeDeal.filledOrders.push(orderResponse.data);
                    log =`${this.getCurrentTime()}: ${bot.symbol} - ${bot.activeDeal.status} - STOP_LOSS_ORDER_FILLED`;
                    bot.logs.push(log);
                    console.log(log);

                    //next step->>
                    //cancel tp order
                    if (bot.marketType === 'future') {
                        if (bot.takeProfitOrder !== null){
                            let cancelOrderResponse = await nitroApp.ccxtw.cancelOrder(bot.userID, bot.exchange, bot.activeDeal.takeProfitOrder.id, bot.symbol);
                            if (!cancelOrderResponse.success) {
                                bot.logs.push(cancelOrderResponse.log);
                                console.log(cancelOrderResponse.log);
                            }
                            bot.activeDeal.takeProfitOrder = null;
                        }
                    }

                    bot.activeDeal.profit = this.calculateProfit(bot.activeDeal.filledOrders, side.mainDirection);
                    bot.profit = math.evaluate(`${bot.profit} + ${bot.activeDeal.profit}`);
                    bot.activeDeal.status = 'CLOSED_DEAL';
                    bot.closedDeals.push(bot.activeDeal);
                    log = `${this.getCurrentTime()}: ${bot.symbol} - STOP_LOSS_FILLED - LOSS: ${bot.activeDeal.profit}`;
                    bot.logs.push(log);
                    console.log(log);

                    //reset
                    bot.activeDeal = {
                        status:'START_NEW_DEAL',
                        baseOrder:null,
                        safetyOrder:null,
                        takeProfitOrder:null,
                        stopLossOrder:null,
                        filledOrders:[],
                        profit:0,
                    };
                }
            }
            return bot;
        },
        createBot: async function(data){

            if (data.marketType === 'spot') {
                data.leverage = 1;
            }

            data.activeDeal = {
                status:'START_NEW_DEAL',
                baseOrder:null,
                safetyOrder:null,
                takeProfitOrder:null,
                stopLossOrder:null,
                filledOrders:[],
                profit:0,
            };

            data.closedDeals = [];

            data.profit = 0;

            data.logs = [];

            await new dcaBotSchema(data).save()
        },
        startBot: async function(id) {
            await dcaBotSchema.updateOne({ _id:id }, { status:true });
        },
        stopBot: async function(id) {
            await dcaBotSchema.updateOne({ _id:id }, { status:false });
        },
        deleteBot: async function(id) {
            await dcaBotSchema.findByIdAndDelete(id);
        },
        getBots: async function(){
            let bots = await dcaBotSchema.find({});
            let formattedBots = [];

            for (let i = 0; i < bots.length; i++) {
                let bot = bots[i].toObject();

                let profit = 0;
                let bots = await dcaBotSchema.find({id:bot._id});
                for (let i = 0; i < bots.length; i++) {
                    profit = profit + bots[i].profit;
                }

                bot.bots = bots;
                bot.profit = profit;

                formattedBots.push(bot);
            }
            return formattedBots;
        },
        getDirection: async function(userID, exchange, symbol) {
            let status = await nitroApp.ccxtw.fetchOHLCV(userID, exchange, symbol, '1m');
            if (status.success) {
                let prices = [];
                for (let i = 0; i < status.data.length; i++) {
                    prices.push(status.data[i][3]);
                }

                let ma7Data = [];
                let ma7 = new SMA({period : 7, values : prices});
                let results = ma7.getResult();
                let offset = prices.length - results.length;
                for (let i = 0; i < results.length; i++) {
                    ma7Data.push({
                        time:(status.data[i+offset][0] / 1000),
                        value:results[i],
                    });
                }

                let ma25Data = [];
                let ma25 = new SMA({period : 25, values : prices});
                results = ma25.getResult();
                offset = prices.length - results.length;
                for (let i = 0; i < results.length; i++) {
                    ma25Data.push({
                        time:(status.data[i+offset][0] / 1000),
                        value:results[i],
                    });
                }

                let rsiData = [];
                let rsi = new RSI({period : 14, values : prices});
                results = rsi.getResult();
                offset = prices.length - results.length;
                for (let i = 0; i < results.length; i++) {
                    rsiData.push({
                        time:(status.data[i+offset][0] / 1000),
                        value:results[i],
                    });
                }

                let data = {
                    ma7:ma7Data,
                    ma25:ma25Data,
                    rsi:rsiData,
                }


                let maOffset = data.ma7.length - data.ma25.length;
                let ma7Vals = [];
                for (let i = maOffset; i < data.ma7.length; i++) {
                    ma7Vals.push(data.ma7[i].value);
                }

                let ma25Vals = [];
                for (let i = 0; i < data.ma25.length; i++) {
                    ma25Vals.push(data.ma25[i].value);
                }

                let crossLines = {
                    lineA: ma7Vals,
                    lineB: ma25Vals,
                };

                let crossUp = new CrossUp(crossLines);
                let crossDown = new CrossDown(crossLines);
                let crossUpValues = crossUp.getResult();
                let crossDownValues = crossDown.getResult();


                let overboughtCondition = false;
                let oversoldCondition = false;
                let trend = null;

                for (let i = 0; i < crossUpValues.length; i++) {

                    if (crossUpValues[i] === true) {
                        trend = 'bullish';
                    }

                    if (crossDownValues[i] === true) {
                        trend = 'bearish';
                    }
                }

                for (let i = 0; i < data.rsi.length; i++) {
                    if (data.rsi[i].value > 80 && !overboughtCondition) {
                        overboughtCondition = true;
                    } else {
                        overboughtCondition = false;
                    }
                    if (data.rsi[i].value < 20 && !oversoldCondition) {
                        oversoldCondition = true;
                    } else {
                        oversoldCondition = false;
                    }
                }

                return {
                    trend,
                    overboughtCondition,
                    oversoldCondition
                }
            }
        },
        getCurrentTime: function() {
            return moment(new Date()).format('lll');
        },
        getSide: function(bot){
            let side = null;
            let opposite = null;
            if (bot.direction === 'long') {
                side = 'buy';
                opposite = 'sell';
            }
            if (bot.direction === 'short') {
                side = 'sell';
                opposite = 'buy';
            }
            return {
                mainDirection:side,
                oppositeDirection:opposite
            }
        },
        getSign: function(bot){
            let mainSign = null;
            let oppositeSign = null

            if (bot.direction === 'long') {
                mainSign = '-';
                oppositeSign = '+';
            } else {
                mainSign = '+';
                oppositeSign = '-';
            }

            return {
                mainSign:mainSign,
                oppositeSign:oppositeSign
            }
        },
        calculateProfit(orders, side){
            //calc profit
            let totalBuyCost = 0;
            let totalSellCost = 0;
            let profit = 0;

            for (let i = 0; i < orders.length; i++) {
                if (orders[i].side === side) {
                    totalBuyCost = math.evaluate(`${totalBuyCost} + ${orders[i].cost}`);
                }
                if (orders[i].side !== side) {
                    totalSellCost = math.evaluate(`${totalSellCost} + ${orders[i].cost}`);
                }
            }

            if (side === 'buy') {
                profit = math.evaluate(`${totalSellCost} - ${totalBuyCost}`);
            } else {
                profit = math.evaluate(`${totalBuyCost} - ${totalSellCost}`);
            }
            return profit;
        }
    };

})
