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

let maxSafeOrdersCount = 4;
let generalOrderCost = balance / maxSafeOrdersCount;
// let generalOrderCost = balance;

let checkPrices = {
    safeOrder:0,
    slOrder:0,
    tpOrder:0,
}

let priceTargets = {
    safe :0.3,
    sl :0.2,
    tp :0.2,
}



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

export const dcaBotStrategy = (data) => {

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

        //no position opened
        if (position === 0) {

            if (crossUpValues[i] === true) {
                if (direction === 'long') {
                    //enter position - base
                    enterPosition(candle, 'base', data.symbol.value);
                    position = 1;
                }
            }
        } else if (position === 1) {//long position

            if (direction === 'long') {

                //check tp order
                if (candle.high > checkPrices.tpOrder) {
                    //exit position - tp
                    exitPosition(candle, 'tp', data.symbol.value);
                    position = 0;
                    positionOrders = [];
                    checkPrices = {
                        safeOrder:0,
                        slOrder:0,
                        tpOrder:0,
                    }
                }

                //check safety max limit
                if (positionOrders.length < maxSafeOrdersCount) {

                    //check safety order
                    if (candle.low < checkPrices.safeOrder) {
                        //enter position - safe
                        enterPosition(candle, 'safe', data.symbol.value);
                    }
                } else {
                    //check sl order
                    if (candle.low < checkPrices.slOrder) {
                        //exit position - sl
                        exitPosition(candle, 'sl', data.symbol.value);
                        position = 0;
                        positionOrders = [];
                        checkPrices = {
                            safeOrder:0,
                            slOrder:0,
                            tpOrder:0,
                        }
                    }
                }
            }
        }

        equity.push({
            time:candle.time,
            value:balance
        })
    }

    statistics.finalBalance = balance;
    statistics.winLossRatio = Number(math.evaluate(`${statistics.tpOrders} / ${statistics.slOrders}`));

    return {
        balance:balance,
        signals: orders,
        orders: orders,
        statistics,
        equity
    };
}

function validEntrySignal(data, index) {
    // let MA12 = [];
    // for (let i = 0; i < data.MA12.length; i++) {
    //     MA12.push(data.MA12[i].value);
    // }
    //
    // let MA21 = [];
    // for (let i = 0; i < data.MA21.length; i++) {
    //     MA21.push(data.MA21[i].value);
    // }
    //
    // let crossLines = {
    //     lineA: MA12,
    //     lineB: MA21,
    // };
    //
    // let crossUp = new CrossUp(crossLines);
    // let crossUpValues = crossUp.getResult();
    // let crossDown = new CrossDown(crossLines);
    // let crossDownValues = crossDown.getResult();
    //
    // // if(data.RSI[i].value < 40)
    // if (crossUpValues[index] === true) {
    //     return true;
    // }else {
    //     return false;
    // }

    return true;

}

function enterPosition(candle, type, symbol) {

    let price = 0;

    if (type === 'base') {
        price = candle.close;
    }

    if (type === 'safe') {
        price = checkPrices.safeOrder;
    }

    let cost = generalOrderCost;
    let amount = Number(math.evaluate(`${cost} / ${price}`));
    let fees = 0;
    let feesCost = 0;

    fees = Number(math.evaluate(`(${makerFees} / 100) * ${amount}`));
    feesCost = Number(math.evaluate(`${fees} * ${price}`));
    amount = Number(math.evaluate(`${amount} - ${fees}`));
    // cost = Number(math.evaluate(`${cost} - (${fees} / ${price})`));

    balance = Number(math.evaluate(`${balance} - ${feesCost}`));

    let data = {
        symbol:symbol,
        time: candle.time,
        side: 'BUY',
        price: price,
        amount: amount,
        cost: cost,
        fees:feesCost,
        profit: 0,
        balance: balance,
        type:(type === 'base') ? 'BASE' : 'SAFE',
    };

    //push signal
    orders.push(data);
    positionOrders.push(data);

    let totalAmount = 0;
    let totalCost = 0;
    for (let i = 0; i < positionOrders.length; i++) {
        totalAmount = Number(math.evaluate(`${totalAmount} + ${positionOrders[i].amount}`));
        totalCost = Number(math.evaluate(`${totalCost} + ${positionOrders[i].cost}`));
    }
    let priceAverage = Number(math.evaluate(`${totalCost} / ${totalAmount}`));

    checkPrices.tpOrder = Number(math.evaluate(`${priceAverage} + (${priceAverage} * ${priceTargets.tp} / 100)`));
    checkPrices.safeOrder = Number(math.evaluate(`${priceAverage} - (${priceAverage} * ${priceTargets.safe} / 100)`));
    checkPrices.slOrder = Number(math.evaluate(`${priceAverage} - (${priceAverage} * ${priceTargets.sl} / 100)`));

    //statistics
    statistics.trades++;
    if (type === 'base') {
        statistics.baseOrders++;
    } else {
        statistics.safeOrders++;
    }
    statistics.paidFees = Number(math.evaluate(`${statistics.paidFees} + ${feesCost}`));
}

function exitPosition(candle, type, symbol) {

    let price = 0;

    if (type === 'tp') {
        price = checkPrices.tpOrder;
    }

    if (type === 'sl') {
        price = checkPrices.slOrder;
    }

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
        time: candle.time,
        side: 'SELL',
        price: price,
        amount: positionAmount,
        cost: positionCost,
        fees:feesCost,
        profit: profit,
        balance: balance,
        type:(type === 'tp') ? 'TP' : 'SL',
    }

    //push signal
    orders.push(data);
    positionOrders.push(data);

    //statistics
    statistics.trades++;
    if (type === 'tp') {
        statistics.tpOrders++;
    } else {
        statistics.slOrders++;
    }
    statistics.paidFees = Number(math.evaluate(`${statistics.paidFees} + ${feesCost}`));
}
