import {CrossDown, CrossUp} from "technicalindicators";
import * as tf from '@tensorflow/tfjs';
import { RandomForestClassifier as RFClassifier } from 'ml-random-forest';
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

export const testStrategy = async (data) => {


    //1 labeling data
    let labeledData = labelData(data);

    //2 Feature Engineering
    // const rsiValues = data.RSI.map(item => item.value);
    // const macdValues = data.MACD.map(item => item.value);
    // const signalValues = data.MACDSignal.map(item => item.value);
    // const histogramValues = data.MACDHistogram.map(item => item.value);
    // const atrValues = data.ATR.map(item => item.value);
    // const bbLowerValues = data.BBLower.map(item => item.value);
    // const bbMiddleValues = data.BBMiddle.map(item => item.value);
    // const bbUpperValues = data.BBUpper.map(item => item.value);
    //
    // const ma12Values = data.MA12.map(item => item.value);
    // const ma21Values = data.MA21.map(item => item.value);
    // const ma50Values = data.MA50.map(item => item.value);
    // const ma100Values = data.MA100.map(item => item.value);
    // const ma200Values = data.MA200.map(item => item.value);


    //3 Preprocessing
    // const normalizedRSI = minMaxScaling(rsiValues);
    const priceDirection = deducePriceDirection(data.candles);
    // const normalizedMacd = minMaxScaling(macdValues);
    // const normalizedSignal = minMaxScaling(signalValues);
    // const normalizedHistogram = minMaxScaling(histogramValues);
    // const normalizedATR = minMaxScaling(atrValues);
    // const normalizedBBLower = minMaxScaling(bbLowerValues);
    // const normalizedBBMiddle = minMaxScaling(bbMiddleValues);
    // const normalizedBBUpper = minMaxScaling(bbUpperValues);
    //
    // const normalizedMA12 = minMaxScaling(ma12Values);
    // const normalizedMA21 = minMaxScaling(ma21Values);
    // const normalizedMA50 = minMaxScaling(ma50Values);
    // const normalizedMA100 = minMaxScaling(ma100Values);
    // const normalizedMA200 = minMaxScaling(ma200Values);

    console.log(labeledData);

    //4 Combine data
    // const features = labeledData.map((_, index) => [
    //     priceDirection[index]
    //     // normalizedRSI[index],
    //     // normalizedMacd[index],
    //     // normalizedSignal[index],
    //     // normalizedHistogram[index],
    //     // normalizedATR[index],
    //     // normalizedBBLower[index],
    //     // normalizedBBMiddle[index],
    //     // normalizedBBUpper[index],
    //     // normalizedMA12[index],
    //     // normalizedMA21[index],
    //     // normalizedMA50[index],
    //     // normalizedMA100[index],
    //     // normalizedMA200[index]
    // ]);

    // console.log(features);

    //5 Split data
    const splitIndex = Math.floor(labeledData.length * 0.5);

    const trainFeatures = labeledData.slice(0, splitIndex);
    const testFeatures = labeledData.slice(splitIndex);

    const trainLabels = labeledData.slice(0, splitIndex);
    const testLabels = labeledData.slice(splitIndex);



    //7 convert to tensors
    // const trainTensors = {
    //     features: tf.tensor2d(trainFeatures),
    //     labels: tf.tensor2d(trainLabels, [trainLabels.length, 1])
    // };
    //
    // const testTensors = {
    //     features: tf.tensor2d(testFeatures),
    //     labels: tf.tensor2d(testLabels, [testLabels.length, 1])
    // };

    const options = {
        seed: 3,
        maxFeatures: 0.8,
        replacement: true,
        nEstimators: 100
    };

    const classifier = new RFClassifier(options);
    classifier.train(trainFeatures, trainLabels);
    const result = classifier.predict(testFeatures);

    console.log(result);
    // const oobResult = classifier.predictOOB();
    // const confusionMatrix = classifier.getConfusionMatrix();

    // console.log('preparing train??');
    // await trainModel();
    // console.log('done train??');
    //
    // console.log('preparing predinct??');
    // const predictions = model.predict(testTensors.features);
    // console.log('done predinct??');
    // console.log(predictions);


    statistics.finalBalance = balance;
    statistics.winLossRatio = Number(math.evaluate(`${statistics.tpOrders} / ${statistics.slOrders}`));

    return {
        balance:0,
        signals: orders,
        orders: orders,
        markers:markers,
        statistics:statistics,
        equity
    };
}

const MIN_DISTANCE_BETWEEN_BOTTOMS = 5; // example value
const MAX_DISTANCE_BETWEEN_BOTTOMS = 100; // example value
const N = 50; // number of candles to check before and after for a bottom
const M = 50; // number of candles to check for breakout after second bottom

function isBottom(candles, idx) {
    let currentLow = candles[idx].low;
    let prevLows = Array.from({ length: N }, (_, i) => candles[Math.max(0, idx - i - 1)].low);
    let nextLows = Array.from({ length: N }, (_, i) => candles[Math.min(candles.length - 1, idx + i + 1)].low);

    if (currentLow < Math.min(...prevLows) && currentLow < Math.min(...nextLows)){
        markers.push({
            time: candles[idx].time,
            position: 'aboveBar',
            color: '#e91e63',
            shape: 'arrowDown',
            text: `bottom`
        });
        return true;
    }

    return false;
}

function maxHighBetween(candles, startIdx, endIdx) {
    let highs = Array.from({ length: endIdx - startIdx }, (_, i) => candles[startIdx + i].high);
    return Math.max(...highs);
}

function breakoutExists(candles, idx, resistance) {
    for (let i = idx; i < Math.min(candles.length, idx + M); i++) {
        if (candles[i].high > resistance) {
            markers.push({
                time: candles[i].time,
                position: 'aboveBar',
                color: '#e91e63',
                shape: 'arrowDown',
                text: `breakout`
            });
            return true;
        }
    }
    return false;
}

function labelData(data) {
    let labels = [];
    let last = '';

    for (let i = 0; i < data.candles.length; i++) {
        let obj = {
            marketConditions:'neutral',
            pastPrice:data.candles[i].close
        }
        if (data.RSI[i].value > 70) {
            obj.marketConditions = 'BOUGHT';
        } else if (data.RSI[i].value < 30) {
            obj.marketConditions = 'SOLD';
        } else if(data.MACD[i].value > data.MACDSignal[i].value && data.ADX[i].value > 25) {
            obj.marketConditions = 'TREND';
        }
        labels.push(obj);

        if (last !== obj.marketConditions) {
            last = obj.marketConditions;
            markers.push({
                time: data.candles[i].time,
                position: 'belowBar',
                color: '#74ff00',
                shape: 'circle',
                text: obj.marketConditions
            });
        }
    }

    return labels;
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

function minMaxScaling(data) {
    let min = data[0];
    let max = data[0];

    // Find min and max without spread operator
    for (let i = 1; i < data.length; i++) {
        if (data[i] < min) min = data[i];
        if (data[i] > max) max = data[i];
    }

    // Normalize
    return data.map(value => (value - min) / (max - min));
}


function deducePriceDirection(candles) {
    if (!candles || candles.length <= 1) {
        return [];
    }

    let directions = [];
    for (let i = 1; i < candles.length; i++) {
        if (candles[i].close > candles[i - 1].close) {
            directions.push('bullish');
        } else if (candles[i].close < candles[i - 1].close) {
            directions.push('bearish');
        } else {
            directions.push('neutral');
        }
    }

    // The first candle has no previous candle to compare with, so we'll label it as 'neutral'
    return [0, ...directions];
}
