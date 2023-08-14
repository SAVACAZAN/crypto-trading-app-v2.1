import {CrossDown, CrossUp} from "technicalindicators";
import { create, all } from 'mathjs';
import {fill} from "lodash";
const config = {
    number: 'BigNumber',
    precision: 20
}
const math = create(all, config);

let position = 0; // 0 no position, 1 long, -1 short
let startBalance = 1000;
let balance = startBalance;
let equity = [];
let orders = [];
let positionOrders = [];

let direction = 'long';//TODO - smart direction, maybe trend detection

let maxSafeOrdersCount = 0;
let generalOrderCost = balance / 10;
// let generalOrderCost = balance;

let checkPrices = {
    safeOrder:0,
    slOrder:0,
    tpOrder:0,
}

let minProfitPercent = 0.8;
let maxStopLossPercent = 0.4;

// let priceTargets = {
//     safe :0,
//     minSL :0.1,
//     minTP :0.1,
// }

let makerFees = 0.1;

let statistics = {
    trades:0,
    baseOrders:0,
    safeOrders:0,
    tpOrders:0,
    slOrders:0,
    finalBalance:0,
    paidFees: 0,
    winLossRatio: 0,
}

let markers = [];

// Assuming wick_threshold is defined somewhere
const wick_threshold = 0.0001; // e.g., 0.05 or any appropriate value

export const suportResistanceStrategy = (data) => {

    // let MACD = [];
    // let MACDSignal = [];
    // for (let i = 0; i < data.candles.length; i++) {
    //     MACD.push(data.MACD[i].value);
    //     MACDSignal.push(data.MACDSignal[i].value);
    // }
    //
    // // console.log(data.MACDHistogram);
    //
    // let MACDCrossLines = {lineA: MACDSignal, lineB: MACD};
    // let MACrossLines = {lineA: MACDSignal, lineB: MACD};
    //
    // let MACDCrossUp = new CrossUp(MACDCrossLines);
    // let MACDCrossUpValues = MACDCrossUp.getResult();
    // let MACDCrossDown = new CrossDown(MACDCrossLines);
    // let MACDCrossDownValues = MACDCrossDown.getResult();

    const n1 = 8;
    const n2 = 6;
    const backCandles = 140;

    for (let i = 0; i < data.candles.length; i++) {
        data.candles[i]['RSI'] = data.RSI[i].value;
    }

    let signal = Array(data.candles.length).fill(0);

    for (let row = backCandles + n1; row < data.candles.length - n2; row++) {
        signal[row] = checkCandleSignal(row, n1, n2, backCandles, data.candles);

        console.log(row, data.candles[row]['RSI']);

        if (signal[row] === 1) {
            console.log('1?');

            markers.push({
                time: data.candles[row].time,
                position: 'aboveBar',
                color: '#e91e63',
                shape: 'arrowDown',
                text: 'belowRez'
            });

        }

        if (signal[row] === 2) {
            console.log('2?');

            markers.push({
                time: data.candles[row].time,
                position: 'belowBar',
                color: '#74ff00',
                shape: 'arrowDown',
                text: 'aboveSup'
            });
        }
    }

// Assuming data.candles is an array of objects, we add the signal property to each object in data.candles
//     for (let i = 0; i < data.candles.length; i++) {
//         data.candles[i].signal = signal[i];
//     }

    console.log(signal);


    for (let i = 0; i < data.candles.length; i++) {

        let candle = data.candles[i];

        // console.log(position);

        // if (position === 0) {
        //     if (data.MACDHistogram[i].value > 0) {
        //         if (MACDCrossDownValues[i]) {

                    // if (data.RSI[i].value < 80) {

                    // if (candle.close > data.MA200[i].value &&
                    //     candle.close > data.MA100[i].value &&
                    //     candle.close > data.MA50[i].value) {
                    // markers.push({
                    //     time: candle.time,
                    //     position: 'belowBar',
                    //     color: '#74ff00',
                    //     shape: 'circle',
                    //     text: '1'
                    // });
                    // enterPosition(candle.time, data.symbol, candle.close, 'BASE', generalOrderCost);
                    // }
                    // }
                // }
            // }
        // }
        //
        //
        //
        //
        // if (data.MACDHistogram[i].value < 0) {
        //     if (MACDCrossUpValues[i]) {
        //
        //         // if (data.RSI[i].value > 20) {
        //
        //             // if (candle.close < data.MA200[i].value &&
        //             //     candle.close < data.MA100[i].value &&
        //             //     candle.close < data.MA50[i].value) {
        //                 markers.push({
        //                     time: candle.time,
        //                     position: 'aboveBar',
        //                     color: '#ff0505',
        //                     shape: 'circle',
        //                     text: '-1'
        //                 });
        //                 // exitPosition(candle.time, data.symbol, candle.close, 'TP');
        //             // }
        //         // }
        //     }
        // }


        // no position opened
        // if (position === 0) {
        //     if (data.MACDHistogram[i].value > 0) {
        //         if (MACDCrossDownValues[i]) {
        //
        //             if (data.RSI[i].value < 80) {
        //
        //                 if (candle.close > data.MA200[i].value &&
        //                     candle.close > data.MA100[i].value &&
        //                     candle.close > data.MA50[i].value) {
        //
        //                     //enter position - base
        //                     enterPosition(candle.time, data.symbol, candle.close, 'BASE', generalOrderCost);
        //
        //                     //set target prices
        //                     checkPrices.tpOrder = Number(math.evaluate(`${candle.close} + (${candle.close} * ${minProfitPercent} / 100)`));
        //                     checkPrices.safeOrder = Number(math.evaluate(`${candle.close} - (${candle.close} * ${maxStopLossPercent} / 100)`));
        //                     checkPrices.slOrder = Number(math.evaluate(`${candle.close} - (${candle.close} * ${maxStopLossPercent} / 100)`));
        //
        //                     console.log(candle.close, checkPrices.tpOrder, checkPrices.safeOrder, checkPrices.slOrder);
        //
        //                 }
        //             }
        //         }
        //     }
        // }
        //
        // if (position === 1) {//long position
        //
        //     //check tp order
        //     if (candle.high > checkPrices.tpOrder) {
        //         //exit position - tp
        //         exitPosition(candle.time, data.symbol, candle.high, 'TP');
        //     }
        //
        //     //check safety max limit
        //     if (positionOrders.length < maxSafeOrdersCount) {
        //
        //         //check safety order
        //         if (candle.low < checkPrices.safeOrder) {
        //             //enter position - safe
        //             enterPosition(candle.time, data.symbol, candle.close, 'SAFE', generalOrderCost);
        //
        //             //set target prices
        //             let totalAmount = 0;
        //             let totalCost = 0;
        //             for (let i = 0; i < positionOrders.length; i++) {
        //                 totalAmount = Number(math.evaluate(`${totalAmount} + ${positionOrders[i].amount}`));
        //                 totalCost = Number(math.evaluate(`${totalCost} + ${positionOrders[i].cost}`));
        //             }
        //             let priceAverage = Number(math.evaluate(`${totalCost} / ${totalAmount}`));
        //             // const minTPPercent = Number(math.evaluate(`${makerFees} + (${positionOrders.length} * ${minProfitPercent})`));
        //
        //             console.log(positionOrders.length, minProfitPercent, positionOrders.length * minProfitPercent);
        //
        //             checkPrices.tpOrder = Number(math.evaluate(`${priceAverage} + (${priceAverage} * ${minProfitPercent} / 100)`));
        //             checkPrices.safeOrder = Number(math.evaluate(`${priceAverage} - (${priceAverage} * ${maxStopLossPercent} / 100)`));
        //             checkPrices.slOrder = Number(math.evaluate(`${priceAverage} - (${priceAverage} * ${maxStopLossPercent} / 100)`));
        //
        //             const number1 = priceAverage;
        //             const number2 = checkPrices.tpOrder - number1;
        //
        //             // Calculate the percentage value
        //             const percentage = (number2 / number1) * 100;
        //
        //             // console.log(candle.close, checkPrices.tpOrder, checkPrices.safeOrder, checkPrices.slOrder, percentage);
        //         }
        //     } else {
        //         //check sl order
        //         if (candle.low < checkPrices.slOrder) {
        //             //exit position - sl
        //             exitPosition(candle.time, data.symbol, candle.high, 'SL');
        //         }
        //     }
        //
        // }

    }


    statistics.finalBalance = balance;
    statistics.winLossRatio = Number(math.evaluate(`${statistics.tpOrders} / ${statistics.slOrders}`));

    return {
        balance:balance,
        signals: orders,
        orders: orders,
        markers:markers,
        statistics,
        equity
    };
}

function enterPosition(time, symbol, price, type, cost) {
    let amount = Number(math.evaluate(`${cost} / ${price}`));
    let fees = 0;
    let feesCost = 0;

    fees = Number(math.evaluate(`(${makerFees} / 100) * ${amount}`));
    feesCost = Number(math.evaluate(`${fees} * ${price}`));
    amount = Number(math.evaluate(`${amount} - ${fees}`));
    balance = Number(math.evaluate(`${balance} - ${feesCost}`));

    let data = {
        symbol:symbol,
        time: time,
        side: 'BUY',
        price: price,
        amount: amount,
        cost: cost,
        fees:feesCost,
        profit: 0,
        balance: balance,
        type:type,
    };

    orders.push(data);
    positionOrders.push(data);

    markers.push({
        time: time,
        position: 'belowBar',
        color: '#2196F3',
        shape: 'arrowUp',
        text: `${type}`
    });

    //statistics
    statistics.trades++;
    if (type === 'BASE') {
        statistics.baseOrders++;
    } else {
        statistics.safeOrders++;
    }
    statistics.paidFees = Number(math.evaluate(`${statistics.paidFees} + ${feesCost}`));

    position = 1;
}

function exitPosition(time, symbol, price, type) {

    let positionAmount = 0;
    let positionCost = 0;
    let entryCost = 0;
    let profit = 0;
    let fees = 0;
    let feesCost = 0;

    //calc position size
    for (let j = 0; j < positionOrders.length; j++) {
        positionAmount = Number(math.evaluate(`${positionAmount} + ${positionOrders[j].amount}`));
        entryCost = Number(math.evaluate(`${entryCost} + ${positionOrders[j].cost}`));
    }

    //calc position at current price
    positionCost = Number(math.evaluate(`${positionAmount} * ${price}`));

    //calc fees
    fees = Number(math.evaluate(`(${makerFees} / 100) * ${positionAmount}`));
    feesCost = Number(math.evaluate(`${fees} * ${price}`));

    //calc profit
    profit = Number(math.evaluate(`${positionCost} - ${entryCost}`));
    balance = Number(math.evaluate(`${balance} + ${profit} - ${feesCost}`));

    let data = {
        symbol:symbol,
        time: time,
        side: 'SELL',
        price: price,
        amount: positionAmount,
        cost: positionCost,
        fees:feesCost,
        profit: profit,
        balance: balance,
        type:type,
    }

    markers.push({
        time: time,
        position: 'aboveBar',
        color: '#e91e63',
        shape: 'arrowDown',
        text: `${type}`
    });

    //push signal
    orders.push(data);
    positionOrders.push(data);

    //statistics
    statistics.trades++;
    if (type === 'TP') {
        statistics.tpOrders++;
    } else {
        statistics.slOrders++;
    }
    statistics.paidFees = Number(math.evaluate(`${statistics.paidFees} + ${feesCost}`));

    //cleanup
    position = 0;
    positionOrders = [];
    checkPrices = {
        safeOrder:0,
        slOrder:0,
        tpOrder:0,
    }
}

function support(df1, l, n1, n2) {
    let minBeforeL = Math.min(...df1.slice(l-n1, l).map(candle => candle.low));
    let minAfterL = Math.min(...df1.slice(l+1, l+n2+1).map(candle => candle.low));

    if (minBeforeL < df1[l].low || minAfterL < df1[l].low) {
        return 0;
    }

    let candle_body = Math.abs(df1[l].open - df1[l].close);
    let lower_wick = Math.min(df1[l].open, df1[l].close) - df1[l].low;

    if (lower_wick > candle_body && lower_wick > wick_threshold) {
        return 1;
    }

    return 0;
}

function resistance(df1, l, n1, n2) {
    let maxBeforeL = Math.max(...df1.slice(l-n1, l).map(candle => candle.high));
    let maxAfterL = Math.max(...df1.slice(l+1, l+n2+1).map(candle => candle.high));

    if (maxBeforeL > df1[l].high || maxAfterL > df1[l].high) {
        return 0;
    }

    let candle_body = Math.abs(df1[l].open - df1[l].close);
    let upper_wick = df1[l].high - Math.max(df1[l].open, df1[l].close);

    if (upper_wick > candle_body && upper_wick > wick_threshold) {
        return 1;
    }

    return 0;
}

function closeResistance(l, levels, lim, df) {

    if (levels.length === 0) {
        return 0;
    }

    let closestLevel = levels.reduce((a, b) => Math.abs(b - df[l].high) < Math.abs(a - df[l].high) ? b : a);

    let c1 = Math.abs(df[l].high - closestLevel) <= lim;
    let c2 = Math.abs(Math.max(df[l].open, df[l].close) - closestLevel) <= lim;
    let c3 = Math.min(df[l].open, df[l].close) < closestLevel;
    let c4 = df[l].low < closestLevel;

    if ((c1 || c2) && c3 && c4) {
        return closestLevel;
    } else {
        return 0;
    }
}

function closeSupport(l, levels, lim, df) {
    if (levels.length === 0) {
        return 0;
    }

    let closestLevel = levels.reduce((a, b) => Math.abs(b - df[l].low) < Math.abs(a - df[l].low) ? b : a);

    let c1 = Math.abs(df[l].low - closestLevel) <= lim;
    let c2 = Math.abs(Math.min(df[l].open, df[l].close) - closestLevel) <= lim;
    let c3 = Math.max(df[l].open, df[l].close) > closestLevel;
    let c4 = df[l].high > closestLevel;

    if ((c1 || c2) && c3 && c4) {
        return closestLevel;
    } else {
        return 0;
    }
}

function isBelowResistance(l, level_backCandles, level, df) {
    let pastHighs = df.slice(l - level_backCandles, l).map(candle => candle.high);
    return Math.max(...pastHighs) < level;
}

function isAboveSupport(l, level_backCandles, level, df) {
    let pastLows = df.slice(l - level_backCandles, l).map(candle => candle.low);
    return Math.min(...pastLows) > level;
}

function checkCandleSignal(l, n1, n2, backCandles, df) {
    let ss = [];
    let rr = [];

    for (let subrow = l - backCandles; subrow < l - n2; subrow++) {
        if (support(df, subrow, n1, n2)) {
            ss.push(df[subrow].low);
        }
        if (resistance(df, subrow, n1, n2)) {
            rr.push(df[subrow].high);
        }
    }

    ss.sort((a, b) => a - b);  // ascending sort

    for (let i = 1; i < ss.length; i++) {
        if (Math.abs(ss[i] - ss[i - 1]) <= 0.0001) {
            ss.splice(i, 1);
            i--;  // Correct the index after removal
        }
    }

    rr.sort((a, b) => b - a);  // descending sort

    for (let i = 1; i < rr.length; i++) {
        if (Math.abs(rr[i] - rr[i - 1]) <= 0.0001) {
            rr.splice(i, 1);
            i--;  // Correct the index after removal
        }
    }

    let rrss = [...rr, ...ss];
    rrss.sort((a, b) => a - b);

    for (let i = 1; i < rrss.length; i++) {
        if (Math.abs(rrss[i] - rrss[i - 1]) <= 0.0001) {
            rrss.splice(i, 1);
            i--;  // Correct the index after removal
        }
    }

    let cR = closeResistance(l, rrss, 150e-5, df);
    let cS = closeSupport(l, rrss, 150e-5, df);

    let rsiLast = df[l].RSI;
    let rsiValues = df.slice(l - 1, l).map(candle => candle.RSI);
    let rsiMin = Math.min(...rsiValues);
    let rsiMax = Math.max(...rsiValues);

    if (cR && isBelowResistance(l, 6, cR, df) && rsiMin < 45) {  // Assuming RSI property is available
        return 1;
    } else if (cS && isAboveSupport(l, 6, cS, df) && rsiMax > 55) {
        return 2;
    } else {
        return 0;
    }
}
