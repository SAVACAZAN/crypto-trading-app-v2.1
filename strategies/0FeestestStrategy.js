import {CrossDown, CrossUp} from "technicalindicators";
import {create, all, cross} from 'mathjs';
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

let maxSafeOrdersCount = 10;
let generalOrderCost = balance / 10;
// let generalOrderCost = balance;

let checkPrices = {
    safeOrder:0,
    slOrder:0,
    tpOrder:0,
}

let minProfitPercent = 0.2;
let maxStopLossPercent = 0.1;

// let priceTargets = {
//     safe :0,
//     minSL :0.1,
//     minTP :0.1,
// }

let makerFees = 0;

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

export const testStrategy = (data) => {

    let MACD = [];
    let MACDSignal = [];
    for (let i = 0; i < data.candles.length; i++) {
        MACD.push(data.MACD[i].value);
        MACDSignal.push(data.MACDSignal[i].value);
    }

    // console.log(data.MACDHistogram);

    let MACDCrossLines = {lineA: MACDSignal, lineB: MACD};
    let MACrossLines = {lineA: MACDSignal, lineB: MACD};

    let MACDCrossUp = new CrossUp(MACDCrossLines);
    let MACDCrossUpValues = MACDCrossUp.getResult();

    let MACDCrossDown = new CrossDown(MACDCrossLines);
    let MACDCrossDownValues = MACDCrossDown.getResult();

    let crossLines = {
        lineA: data.MA12.map(item => item.value),
        lineB: data.MA21.map(item => item.value),
    };

    let crossUp = new CrossUp(crossLines);
    let crossDown = new CrossDown(crossLines);
    let crossUpValues = crossUp.getResult();
    let crossDownValues = crossDown.getResult();


    for (let i = 0; i < data.candles.length; i++) {

        let candle = data.candles[i];

        // if (candle.close > data.MA200[i].value) {
            if (crossUpValues[i]) {
                // no position opened
                if (position === 0) {
                    //enter position - base
                    enterPosition(candle.time, data.symbol, candle.close, 'BASE', generalOrderCost);

                    //set target prices
                    checkPrices.tpOrder = Number(math.evaluate(`${candle.close} + (${candle.close} * ${minProfitPercent} / 100)`));
                    checkPrices.safeOrder = Number(math.evaluate(`${candle.close} - (${candle.close} * ${maxStopLossPercent} / 100)`));
                    checkPrices.slOrder = Number(math.evaluate(`${candle.close} - (${candle.close} * ${maxStopLossPercent} / 100)`));

                    // console.log(candle.close, checkPrices.tpOrder, checkPrices.safeOrder, checkPrices.slOrder);

                }
            }
        // }


        if (position === 1) {//long position

            if (crossDownValues[i] && data.RSI[i].value > 80) {
                exitPosition(candle.time, data.symbol, candle.high, 'TP');
            } else

            //check tp order
            if (candle.high > checkPrices.tpOrder) {
                //exit position - tp
                exitPosition(candle.time, data.symbol, candle.high, 'TP');
            } else

            //check safety max limit
            if (positionOrders.length < maxSafeOrdersCount) {

                //check safety order
                if (candle.low < checkPrices.safeOrder) {
                    //enter position - safe
                    enterPosition(candle.time, data.symbol, candle.close, 'SAFE', generalOrderCost);

                    //set target prices
                    let totalAmount = 0;
                    let totalCost = 0;
                    for (let i = 0; i < positionOrders.length; i++) {
                        totalAmount = Number(math.evaluate(`${totalAmount} + ${positionOrders[i].amount}`));
                        totalCost = Number(math.evaluate(`${totalCost} + ${positionOrders[i].cost}`));
                    }
                    let priceAverage = Number(math.evaluate(`${totalCost} / ${totalAmount}`));

                    checkPrices.tpOrder = Number(math.evaluate(`${priceAverage} + (${priceAverage} * ${minProfitPercent} / 100)`));
                    checkPrices.safeOrder = Number(math.evaluate(`${priceAverage} - (${priceAverage} * ${maxStopLossPercent} / 100)`));
                    checkPrices.slOrder = Number(math.evaluate(`${priceAverage} - (${priceAverage} * ${maxStopLossPercent} / 100)`));

                }
            } else {
                //check sl order
                if (candle.low < checkPrices.slOrder) {
                    //exit position - sl
                    exitPosition(candle.time, data.symbol, candle.low, 'SL');
                }
            }

        }

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
