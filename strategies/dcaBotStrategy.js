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

export const dcaBotStrategy = (data) => {

    let position = 0; // 0 no position, 1 long, -1 short
    let startBalance = 1000;
    let balance = startBalance;
    let equity = [];
    let signals = [];

    let direction = 'long';//TODO - smart direction, maybe trend detection

    let maxSafeOrdersCount = 3;
    let baseOrderCost = Number(math.evaluate(`${balance} / ${maxSafeOrdersCount}`));

    // let maxSafeOrdersCount = 0;
    // let baseOrderCost = balance;

    let safetyOrderCost = baseOrderCost;


    let safetyOrderPercent = 0.01;
    let stopLossPercent = 0.01;
    let takeProfitPercent = 0.02;
    let takerFees = 0.01;

    let safetyOrderPrice = false;
    let tpOrderPrice = false;
    let slOrderPrice = false;
    let buyOrders = [];

    let totalCost = 0;
    let totalAmount = 0;
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
        paidFees: 0,
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

                    //calc and apply fees
                    let fees = Number(math.evaluate(`(${takerFees} / 100) * ${baseOrderAmount}`));
                    baseOrderAmount = Number(math.evaluate(`${baseOrderAmount} - ${fees}`));
                    baseOrderCost = Number(math.evaluate(`(${baseOrderAmount} - ${fees}) * ${candle.close}`));
                    statistics.paidFees += fees;


                    //for balance
                    totalAmount = baseOrderAmount;
                    totalCost = baseOrderCost;

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
                        price: candle.close,
                        quantity: baseOrderAmount,
                        cost: baseOrderCost,
                        fees:fees,
                        profit: 0,
                        balance: balance,
                        type:'BASE',
                        position:1,
                    })

                    buyOrders.push({
                        price:candle.close,
                        units:baseOrderAmount,
                    })

                    statistics.trades++;
                    statistics.baseOrders++;
                }
            }


        } else if (position === 1) {//long position

            if (direction === 'long') {

                //check tp order
                if (candle.high > tpOrderPrice) {
                    // if(data.RSI[i].value > 80) {
                    // if (crossDownValues[i] === true) {

                    // let tpOrderCost = Number(math.evaluate(`${totalAmount} * ${candle.high}`));
                    //calc and apply fees
                    let fees = Number(math.evaluate(`(${takerFees} / 100) * ${totalAmount}`));
                    totalAmount = Number(math.evaluate(`${totalAmount} - ${fees}`));
                    totalCost = Number(math.evaluate(`(${totalAmount} - ${fees}) * ${candle.high}`));
                    statistics.paidFees += fees;


                    exitCost = totalCost;
                    profit = Number(math.evaluate(`${exitCost} - ${entryCost}`));
                    balance = balance + profit;

                    //tp order filled
                    signals.push({
                        symbol: data.symbol.value,
                        time: candle.time,
                        side: 'SELL',
                        price: candle.high,
                        quantity: totalAmount,
                        cost: totalCost,
                        fees:fees,
                        profit: profit,
                        balance: balance,
                        type: 'TP',
                        position: 0
                    })

                    statistics.trades++;
                    statistics.tpOrders++;

                    position = 0;
                    safetyOrderPrice = false;
                    tpOrderPrice = false;
                    slOrderPrice = false;
                    safeOrdersCount = 0;
                    totalAmount = 0;
                    totalCost = 0;
                    averagePrice = 0;
                    profit = 0;
                    entryCost = 0;
                    exitCost = 0;
                }

                if (safeOrdersCount < maxSafeOrdersCount) {//check safety max limit

                    //check safety order
                    if (candle.low < safetyOrderPrice) {

                        //safe order filled
                        safeOrdersCount++;
                        let safetyOrderAmount = Number(math.evaluate(`${safetyOrderCost} / ${candle.low}`));

                        //calc and apply fees
                        let fees = Number(math.evaluate(`(${takerFees} / 100) * ${safetyOrderAmount}`));
                        safetyOrderAmount = Number(math.evaluate(`${safetyOrderAmount} - ${fees}`));
                        safetyOrderCost = Number(math.evaluate(`(${safetyOrderAmount} - ${fees}) * ${candle.low}`));
                        statistics.paidFees += fees;

                        //total position base
                        totalAmount = Number(math.evaluate(`${totalAmount} + ${safetyOrderAmount}`));
                        totalCost = Number(math.evaluate(`${totalAmount} + ${safetyOrderCost}`));

                        //todo - wtf is happening here
                        // averagePrice = Number(math.evaluate(`${totalCost} / ${totalAmount}`));


                        // Calculate the total units and total cost of all bought units
                        let totalUnits = 0;
                        let totalCost2 = 0;

                        for (let i = 0; i < buyOrders.length; i++) {
                            totalUnits += buyOrders[i].units;
                            totalCost2 += buyOrders[i].price * buyOrders[i].units;
                        }

                        // Calculate the average price of all bought units
                        let averageBuyPrice = totalCost2 / totalUnits;


                        // Calculate the target selling price based on the average buy price
                        let tpSellingPrice = averageBuyPrice * (1 + (takeProfitPercent / 100));

                        console.log(averageBuyPrice, tpSellingPrice);




                        entryCost = Number(math.evaluate(`${entryCost} + ${safetyOrderCost}`));

                        //adjust tp target
                        tpOrderPrice = tpSellingPrice;

                        //safety target
                        safetyOrderPrice = Number(math.evaluate(`${candle.low} - (${candle.low} * ${safetyOrderPercent})`));

                        //adjust stoploss target
                        slOrderPrice = Number(math.evaluate(`${candle.low} - (${candle.low} * ${stopLossPercent})`));

                        //safety order
                        signals.push({
                            symbol:data.symbol.value,
                            time: candle.time,
                            side: 'BUY',
                            price: candle.low,
                            quantity: safetyOrderAmount,
                            cost: safetyOrderCost,
                            fees:fees,
                            profit: 0,
                            balance: balance,
                            type:'SAFE',
                            position:1
                        })

                        buyOrders.push({
                            price:candle.low,
                            units:safetyOrderAmount,
                        })

                        statistics.trades++;
                        statistics.safeOrders++;
                    }

                } else {

                    //check stop order
                    if (candle.low < slOrderPrice) {

                        // let slOrderCost = Number(math.evaluate(`${totalAmount} * ${candle.low}`));
                        //calc and apply fees
                        let fees = Number(math.evaluate(`(${takerFees} / 100) * ${totalAmount}`));
                        totalAmount = Number(math.evaluate(`${totalAmount} - ${fees}`));
                        totalCost = Number(math.evaluate(`(${totalAmount} - ${fees}) * ${candle.low}`));
                        statistics.paidFees += fees;

                        exitCost = totalCost;
                        profit = Number(math.evaluate(`${exitCost} - ${entryCost}`));
                        balance = balance + profit - statistics.paidFees;

                        //stop loss order
                        signals.push({
                            symbol:data.symbol.value,
                            time: candle.time,
                            side: 'SELL',
                            price: candle.low,
                            quantity: totalAmount,
                            cost: totalCost,
                            fees:fees,
                            profit: profit,
                            balance: balance,
                            type:'SL',
                            position:0
                        })

                        statistics.trades++;
                        statistics.slOrders++;

                        position = 0;
                        safetyOrderPrice = false;
                        tpOrderPrice = false;
                        slOrderPrice = false;
                        safeOrdersCount = 0;
                        totalAmount = 0;
                        totalCost = 0;
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

    statistics.finalBalance = balance;
    statistics.winLossRatio = Number(math.evaluate(`${statistics.tpOrders} / ${statistics.slOrders}`));

    return {
        signals,
        statistics,
        equity
    };
}
