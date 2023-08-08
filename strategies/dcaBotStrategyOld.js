import {CrossDown, CrossUp} from "technicalindicators";
import { create, all } from 'mathjs';
const config = {
    number: 'BigNumber',
    precision: 20
}
const math = create(all, config);

export const testStrategy = (data) => {

    let signals = [];

    let maOffset = data.MA12.length - data.MA21.length;
    let MA12 = [];
    for (let i = maOffset; i < data.MA12.length; i++) {
        MA12.push(data.MA12[i].value);
    }

    let MA21 = [];
    for (let i = 0; i < data.MA21.length; i++) {
        MA21.push(data.MA21[i].value);
    }

    let crossLines = {
        lineA: MA12,
        lineB: MA21,
    };

    let crossUp = new CrossUp(crossLines);
    let crossDown = new CrossDown(crossLines);
    let crossUpValues = crossUp.getResult();
    let crossDownValues = crossDown.getResult();

    let offset = data.candles.length - crossUpValues.length;

    for (let i = 0; i < crossUpValues.length; i++) {
        if (crossUpValues[i] === true) {
            signals.push({
                symbol:data.symbol,
                time: data.candles[i + offset].time,
                side: 'BUY',
                price: data.candles[i + offset].close,
                type:'CU'
            })
        }

        if (crossDownValues[i] === true) {
            signals.push({
                symbol:data.symbol,
                time: data.candles[i + offset].time,
                side: 'SELL',
                price: data.candles[i + offset].close,
                type:'CD'
            })
        }
    }

    let RSIOffset = data.candles.length - data.RSI.length;
    let overboughtCondition = false;
    let oversoldCondition = false;

    for (let i = 0; i < data.RSI.length; i++) {

        if (data.RSI[i].value > 80 && !overboughtCondition) {

            signals.push({
                symbol:data.symbol,
                time: data.candles[i + RSIOffset].time,
                side: 'SELL',
                price: data.candles[i + RSIOffset].close,
                type:'OB'
            })

        } else {
            // overboughtCondition = false;
        }

        if (data.RSI[i].value < 20 && !oversoldCondition) {

            if (data.RSI[i].value > 80 && !overboughtCondition) {

                signals.push({
                    symbol:data.symbol,
                    time: data.candles[i + RSIOffset].time,
                    side: 'BUY',
                    price: data.candles[i + RSIOffset].close,
                    type:'OS'
                })

            } else {
                // oversoldCondition = false;
            }

        }

    }

    // console.log(signals[0].time)

    return signals;
}

// export const dcaBotStrategy = (data) => {
//
//     let signals = [];
//     let position = 0; // 0 no position, 1 long, -1 short
//     let positionAmount = 0;
//     let positionCost = 0;
//
//     let initialInvestment = 0;
//     let totalReturns = 0;
//
//     let startBalance = 1000;
//     let balance = startBalance;
//     let equity = [];
//
//     let direction = 'long';//TODO - smart direction, maybe trend detection
//
//     let maxSafeOrdersCount = 4;
//     let baseOrderCost = Number(math.evaluate(`${balance} / ${maxSafeOrdersCount}`));
//     let safetyOrderCost = baseOrderCost;
//
//
//     let takeProfitPercent = 0.01;
//     let safetyOrderPercent = 0.02;
//     let stopLossPercent = 0.02;
//     let takerFees = 0.1;
//
//     let baseOrderPrice = false;
//     let safetyOrderPrice = false;
//     let tpOrderPrice = false;
//     let slOrderPrice = false;
//     let safeOrdersCount = 0;
//
//
//
//     let statistics = {
//         trades:0,
//         baseOrders:0,
//         safeOrders:0,
//         tpOrders:0,
//         slOrders:0,
//         // deltaLossTotal:0,
//         // deltaWinTotal:0,
//         finalBalance:0,
//         winLossRatio: 0,
//     }
//
//
//     let MA12 = [];
//     for (let i = 0; i < data.MA12.length; i++) {
//         MA12.push(data.MA12[i].value);
//     }
//
//     let MA21 = [];
//     for (let i = 0; i < data.MA21.length; i++) {
//         MA21.push(data.MA21[i].value);
//     }
//
//     let crossLines = {
//         lineA: MA12,
//         lineB: MA21,
//     };
//
//     let crossUp = new CrossUp(crossLines);
//     let crossUpValues = crossUp.getResult();
//     let crossDown = new CrossDown(crossLines);
//     let crossDownValues = crossDown.getResult();
//
//     for (let i = 0; i < data.candles.length; i++) {
//         let candle = data.candles[i];
//
//
//         if (position === 0) {//no position opened
//
//             // if(data.RSI[i].value < 40) {
//             if (crossUpValues[i] === true) {
//
//                 if (direction === 'long') {
//                     position = 1;
//                     baseOrderPrice = candle.close;
//                     let baseOrderAmount = Number(math.evaluate(`${baseOrderCost} / ${candle.close}`));
//                     let positionAmount = baseOrderAmount;
//                     let positionCost = baseOrderCost;
//
//                     //base order
//                     signals.push({
//                         symbol:data.symbol.value,
//                         time: candle.time,
//                         side: 'BUY',
//                         price: baseOrderPrice,
//                         quantity: baseOrderAmount,
//                         cost: baseOrderCost,
//                         positionAmount: positionAmount,
//                         positionCost: positionCost,
//                         profit: 0,
//                         balance: balance,
//                         type:'BASE',
//                         position:1,
//                     })
//
//
//                     //tp target
//                     tpOrderPrice = Number(math.evaluate(`${candle.close} + (${candle.close} * ${takeProfitPercent})`));
//
//                     //safety target
//                     safetyOrderPrice = Number(math.evaluate(`${candle.close} - (${candle.close} * ${safetyOrderPercent})`));
//
//                     statistics.trades++;
//                     statistics.baseOrders++;
//                 }
//             }
//
//
//         } else if (position === 1) {//long position
//
//             if (direction === 'long') {
//
//                 //check tp order
//                 if (candle.close > tpOrderPrice) {
//                 // if(data.RSI[i].value > 80) {
//                 // if (crossDownValues[i] === true) {
//
//                     // let tpOrderAmount = positionAmount;
//                     // let tpOrderCost = tpOrderAmount * candle.close;
//                     // totalReturns = tpOrderCost;
//
//                     let profit = totalReturns - initialInvestment;
//                     // balance += profit;
//
//                     //tp order filled
//                     signals.push({
//                         symbol: data.symbol.value,
//                         time: candle.time,
//                         side: 'SELL',
//                         price: candle.close,
//                         quantity: positionAmount,
//                         cost: baseOrderCost,
//                         // positionAmount: positionAmount,
//                         // positionCost: positionCost,
//                         profit: profit,
//                         balance: balance,
//                         type: 'TP',
//                         position: 0
//                     })
//
//
//                     statistics.trades++;
//                     statistics.tpOrders++;
//                     // let delta = Number(math.evaluate(`(${positionAmount} * ${candle.close}) - (${positionAmount} * ${baseOrderPrice})`));
//                     // statistics.deltaWinTotal += delta;
//
//                     // console.log(delta);
//
//                     // baseOrderCost = Number(math.evaluate(`(${balance} + ${deltaWin}) / ${maxSafeOrdersCount}`));
//                     // safetyOrderCost = baseOrderCost;
//
//
//                     position = 0;
//                     baseOrderPrice = false;
//                     safetyOrderPrice = false;
//                     tpOrderPrice = false;
//                     slOrderPrice = false;
//                     safeOrdersCount = 0;
//                     positionAmount = 0;
//                     positionCost = 0;
//                     totalReturns = 0;
//                     initialInvestment = 0;
//                 }
//
//                 if (safeOrdersCount < maxSafeOrdersCount) {//check safety max limit
//
//                     //check safety order
//                     if (candle.close < safetyOrderPrice) {
//
//                         //safe order filled
//                         safeOrdersCount++;
//                         let safetyOrderAmount = Number(math.evaluate(`${safetyOrderCost} / ${candle.close}`));
//                         positionAmount = Number(math.evaluate(`${positionAmount} + ${safetyOrderAmount}`));
//                         positionCost = Number(math.evaluate(`${positionCost} + ${safetyOrderCost}`));
//                         initialInvestment = Number(math.evaluate(`${initialInvestment} + ${safetyOrderCost}`));
//
//                         //safety order
//                         signals.push({
//                             symbol:data.symbol.value,
//                             time: candle.time,
//                             side: 'BUY',
//                             price: candle.close,
//                             quantity: safetyOrderAmount,
//                             cost: safetyOrderCost,
//                             positionAmount: positionAmount,
//                             positionCost: positionCost,
//                             profit: 0,
//                             balance: balance,
//                             type:'SAFE',
//                             position:1
//                         })
//
//                         //adjust tp target
//                         tpOrderPrice = Number(math.evaluate(`${candle.close} + (${candle.close} * ${takeProfitPercent})`));
//
//                         //safety target
//                         safetyOrderPrice = Number(math.evaluate(`${candle.close} - (${candle.close} * ${safetyOrderPercent})`));
//
//                         //adjust stoploss target
//                         slOrderPrice = Number(math.evaluate(`${candle.close} - (${candle.close} * ${stopLossPercent})`));
//
//                         statistics.trades++;
//                         statistics.safeOrders++;
//
//                     }
//
//                 } else {
//
//                     //check stop order
//                     if (candle.close < slOrderPrice) {
//
//                         // let slOrderAmount = positionAmount;
//                         // let slOrderCost = slOrderAmount * candle.close;
//                         // totalReturns = slOrderCost;
//
//                         // let profit = totalReturns - initialInvestment;
//                         // balance += profit;
//
//                         //stop loss order
//                         signals.push({
//                             symbol:data.symbol.value,
//                             time: candle.time,
//                             side: 'SELL',
//                             price: candle.close,
//                             quantity: slOrderAmount,
//                             cost: slOrderCost,
//                             // positionAmount: positionAmount,
//                             // positionCost: positionCost,
//                             profit: profit,
//                             balance: balance,
//                             type:'SL',
//                             position:0
//                         })
//
//                         statistics.trades++;
//                         statistics.slOrders++;
//                         // let deltaLoss = positionAmount * candle.close;
//                         // statistics.deltaLossTotal += deltaLoss;
//
//                         // baseOrderCost = Number(math.evaluate(`(${balance} + ${deltaLoss}) / ${maxSafeOrdersCount}`));
//                         // safetyOrderCost = baseOrderCost;
//
//                         position = 0;
//                         baseOrderPrice = false;
//                         safetyOrderPrice = false;
//                         tpOrderPrice = false;
//                         slOrderPrice = false;
//                         safeOrdersCount = 0;
//                         // positionAmount = 0;
//                         totalReturns = 0;
//                         initialInvestment = 0;
//                     }
//                 }
//             }
//         }
//
//         equity.push({
//             time:candle.time,
//             value:balance
//         })
//     }
//
//     //calc balance
//     // let entryCost = 0;
//     // let exitCost = 0;
//     // let profit = 0;
//
//     // for (let i = 0; i < data.candles.length; i++) {
//     //
//     //     for (let j = 0; j < signals.length; j++) {
//     //
//     //         if (data.candles[i].time === signals[j].time) {
//     //             let order = signals[j];
//     //
//     //             if (order.side === 'BUY') {
//     //                 entryCost = order.quantity * order.price;
//     //
//     //                 signals[j].cost = entryCost.toFixed(2);
//     //                 signals[j].profit = 0;
//     //                 signals[j].balance = balance.toFixed(2);
//     //             }
//     //
//     //             if (order.side === 'SELL') {
//     //                 exitCost = order.quantity * order.price;
//     //                 profit = exitCost - entryCost;
//     //                 balance = balance + profit;
//     //
//     //                 signals[j].cost = exitCost.toFixed(2);
//     //                 signals[j].profit = profit;
//     //                 signals[j].balance = balance.toFixed(2);
//     //             }
//     //         }
//     //     }
//     // }
//
//     statistics.finalBalance = balance;
//     statistics.winLossRatio = Number(math.evaluate(`${statistics.tpOrders} / ${statistics.slOrders}`));
//
//     return {
//         signals,
//         statistics,
//         equity
//     };
// }


export const dcaBotStrategy = (data) => {

    let signals = [];
    let position = 0; // 0 no position, 1 long, -1 short

    let startBalance = 1000;
    let balance = startBalance;
    let equity = [];

    let direction = 'long';//TODO - smart direction, maybe trend detection

    let maxSafeOrdersCount = 3;
    let baseOrderCost = Number(math.evaluate(`${balance} / ${maxSafeOrdersCount}`));
    let safetyOrderCost = baseOrderCost;


    let safetyOrderPercent = 0.01;
    let stopLossPercent = 0.01;
    let takeProfitPercent = 0.01;
    let takerFees = 0.1;

    let baseOrderPrice = false;
    let safetyOrderPrice = false;
    let tpOrderPrice = false;
    let slOrderPrice = false;

    let totalQuoteUSDT = 0;
    let totalBaseCoin = 0;
    let averagePrice = 0;

    let safeOrdersCount = 0;

    let entryCost = 0;
    let exitCost = 0;
    let profit = 0;

    let statistics = {
        trades:0,
        baseOrders:0,
        safeOrders:0,
        tpOrders:0,
        slOrders:0,
        finalBalance:0,
        winLossRatio: 0,
    }


    let MA12 = [];
    for (let i = 0; i < data.MA12.length; i++) {
        MA12.push(data.MA12[i].value);
    }

    let MA21 = [];
    for (let i = 0; i < data.MA21.length; i++) {
        MA21.push(data.MA21[i].value);
    }

    let crossLines = {
        lineA: MA12,
        lineB: MA21,
    };

    let crossUp = new CrossUp(crossLines);
    let crossUpValues = crossUp.getResult();
    let crossDown = new CrossDown(crossLines);
    let crossDownValues = crossDown.getResult();

    for (let i = 0; i < data.candles.length; i++) {
        let candle = data.candles[i];


        if (position === 0) {//no position opened

            // if(data.RSI[i].value < 40) {
            if (crossUpValues[i] === true) {

                if (direction === 'long') {
                    position = 1;

                    let baseOrderAmount = Number(math.evaluate(`${baseOrderCost} / ${candle.close}`));
                    baseOrderPrice = candle.close;

                    totalBaseCoin = baseOrderAmount;
                    totalQuoteUSDT = baseOrderCost;

                    entryCost = baseOrderCost;

                    //tp target
                    tpOrderPrice = Number(math.evaluate(`${candle.close} + (${candle.close} * ${takeProfitPercent})`));

                    //safety target
                    safetyOrderPrice = Number(math.evaluate(`${candle.close} - (${candle.close} * ${safetyOrderPercent})`));

                    //base order
                    signals.push({
                        symbol:data.symbol.value,
                        time: candle.time,
                        side: 'BUY',
                        price: baseOrderPrice,
                        quantity: baseOrderAmount,
                        cost: baseOrderCost,
                        profit: 0,
                        balance: balance,
                        type:'BASE',
                        position:1,
                    })

                    statistics.trades++;
                    statistics.baseOrders++;
                }
            }


        } else if (position === 1) {//long position

            if (direction === 'long') {

                //check tp order
                if (candle.close > tpOrderPrice) {
                    // if(data.RSI[i].value > 80) {
                    // if (crossDownValues[i] === true) {

                    let tpOrderCost = Number(math.evaluate(`${totalBaseCoin} * ${candle.close}`));

                    exitCost = tpOrderCost;
                    profit = Number(math.evaluate(`${exitCost} - ${entryCost}`));
                    balance = balance + profit;

                    //tp order filled
                    signals.push({
                        symbol: data.symbol.value,
                        time: candle.time,
                        side: 'SELL',
                        price: candle.close,
                        quantity: totalBaseCoin,
                        cost: tpOrderCost,
                        profit: profit,
                        balance: balance,
                        type: 'TP',
                        position: 0
                    })

                    statistics.trades++;
                    statistics.tpOrders++;

                    position = 0;
                    baseOrderPrice = false;
                    safetyOrderPrice = false;
                    tpOrderPrice = false;
                    slOrderPrice = false;
                    safeOrdersCount = 0;
                    totalBaseCoin = 0;
                    totalQuoteUSDT = 0;
                    averagePrice = 0;
                    profit = 0;
                    entryCost = 0;
                    exitCost = 0;
                }

                if (safeOrdersCount < maxSafeOrdersCount) {//check safety max limit

                    //check safety order
                    if (candle.close < safetyOrderPrice) {

                        //safe order filled
                        safeOrdersCount++;
                        let safetyOrderAmount = Number(math.evaluate(`${safetyOrderCost} / ${candle.close}`));

                        //total position base
                        totalBaseCoin = Number(math.evaluate(`${totalBaseCoin} + ${safetyOrderAmount}`));
                        totalQuoteUSDT = Number(math.evaluate(`${totalBaseCoin} + ${safetyOrderCost}`));

                        averagePrice = Number(math.evaluate(`${totalQuoteUSDT} / ${totalBaseCoin}`));

                        entryCost = Number(math.evaluate(`${entryCost} + ${safetyOrderCost}`));

                        console.log(totalBaseCoin, totalQuoteUSDT, averagePrice);

                        //adjust tp target
                        tpOrderPrice = Number(math.evaluate(`${averagePrice} + (${averagePrice} * ${takeProfitPercent})`));

                        //safety target
                        safetyOrderPrice = Number(math.evaluate(`${averagePrice} - (${averagePrice} * ${safetyOrderPercent})`));

                        //adjust stoploss target
                        slOrderPrice = Number(math.evaluate(`${averagePrice} - (${averagePrice} * ${stopLossPercent})`));


                        //safety order
                        signals.push({
                            symbol:data.symbol.value,
                            time: candle.time,
                            side: 'BUY',
                            price: candle.close,
                            quantity: safetyOrderAmount,
                            cost: safetyOrderCost,
                            profit: 0,
                            balance: balance,
                            type:'SAFE',
                            position:1
                        })


                        statistics.trades++;
                        statistics.safeOrders++;

                    }

                } else {

                    //check stop order
                    if (candle.close < slOrderPrice) {

                        let slOrderCost = Number(math.evaluate(`${totalBaseCoin} * ${candle.close}`));

                        exitCost = slOrderCost;
                        profit = Number(math.evaluate(`${exitCost} - ${entryCost}`));
                        balance = balance + profit;

                        //stop loss order
                        signals.push({
                            symbol:data.symbol.value,
                            time: candle.time,
                            side: 'SELL',
                            price: candle.close,
                            quantity: totalBaseCoin,
                            cost: slOrderCost,
                            profit: profit,
                            balance: balance,
                            type:'SL',
                            position:0
                        })

                        statistics.trades++;
                        statistics.slOrders++;

                        position = 0;
                        baseOrderPrice = false;
                        safetyOrderPrice = false;
                        tpOrderPrice = false;
                        slOrderPrice = false;
                        safeOrdersCount = 0;
                        totalBaseCoin = 0;
                        totalQuoteUSDT = 0;
                        averagePrice = 0;
                        profit = 0;
                        entryCost = 0;
                        exitCost = 0;
                    }
                }
            }
        }

        equity.push({
            time:candle.time,
            value:balance
        })
    }

    //calc balance
    // let entryCost = 0;
    // let exitCost = 0;
    // let profit = 0;

    // for (let i = 0; i < data.candles.length; i++) {
    //
    //     for (let j = 0; j < signals.length; j++) {
    //
    //         if (data.candles[i].time === signals[j].time) {
    //             let order = signals[j];
    //
    //             if (order.side === 'BUY') {
    //                 entryCost = order.quantity * order.price;
    //
    //                 signals[j].cost = entryCost.toFixed(2);
    //                 signals[j].profit = 0;
    //                 signals[j].balance = balance.toFixed(2);
    //             }
    //
    //             if (order.side === 'SELL') {
    //                 exitCost = order.quantity * order.price;
    //                 profit = exitCost - entryCost;
    //                 balance = balance + profit;
    //
    //                 signals[j].cost = exitCost.toFixed(2);
    //                 signals[j].profit = profit;
    //                 signals[j].balance = balance.toFixed(2);
    //             }
    //         }
    //     }
    // }

    statistics.finalBalance = balance;
    statistics.winLossRatio = Number(math.evaluate(`${statistics.tpOrders} / ${statistics.slOrders}`));

    return {
        signals,
        statistics,
        equity
    };
}
