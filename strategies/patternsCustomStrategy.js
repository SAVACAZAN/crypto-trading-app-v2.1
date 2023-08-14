import {
    CrossDown,
    CrossUp,
    abandonedbaby,
    bearishengulfingpattern,
    bullishengulfingpattern,
    darkcloudcover,
    downsidetasukigap,
    eveningdojistar,
    eveningstar,
    bearishharami,
    bearishharamicross,
    shootingstar,
    shootingstarunconfirmed,
    threeblackcrows,
    threewhitesoldiers,
    bullishharami,
    bullishharamicross,
    bullishmarubozu,
    bearishmarubozu,
    bullishspinningtop,
    bearishspinningtop,
    morningstar,
    morningdojistar,
    piercingline,
    doji,
    dragonflydoji,
    gravestonedoji,
    bullishhammerstick,
    bearishhammerstick,
    bullishinvertedhammerstick,
    bearishinvertedhammerstick,
    hammerpattern,
    hangingman,
    hammerpatternunconfirmed,
    hangingmanunconfirmed,
    tweezertop,
    tweezerbottom,
} from "technicalindicators";
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

// Detection parameters for double top pattern as percentages
const peakDifferencePercentageThreshold = 0.1; // Minimum percentage difference between peaks
const peakSeparationPercentageThreshold = 0.5; // Minimum percentage separation between peaks


const tolerance = 0.1;

const patterns = [];

export const patternsStrategy = (data) => {

    let patterns = findPattern(data.candles);
    let markers = [];
    for (let i = 0; i < patterns.length; i++) {

        markers.push({
            time: patterns[i].start.time,
            position: 'belowBar',
            color: '#74ff00',
            shape: 'circle',
            text: `S ${patterns[i].start.value}`
        })

        markers.push({
            time: patterns[i].end.time,
            position: 'belowBar',
            color: '#74ff00',
            shape: 'circle',
            text: `E ${patterns[i].end.value}`
        })

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

function averageTrueRange(data, period) {
    let atrValues = [];
    for (let i = 1; i < data.length; i++) {
        const currentHigh = data[i];
        const currentLow = data[i - 1];
        const previousClose = i > 1 ? data[i - 2] : currentLow;
        const trueRange = Math.max(currentHigh - currentLow, Math.abs(currentHigh - previousClose), Math.abs(currentLow - previousClose));
        atrValues.push(trueRange);
    }
    const total = atrValues.slice(-period).reduce((acc, value) => acc + value, 0);
    return total / period;
}

function isPivot(candles, index) {
    if(index <= 0 || index >= candles.length - 1) return false; // Added bounds check

    // Basic check for pivot
    return candles[index].close > candles[index - 1].close && candles[index].close > candles[index + 1].close ||
        candles[index].close < candles[index - 1].close && candles[index].close < candles[index + 1].close;
}

function isValidFlag(candles, startIndex, endIndex) {
    // Validate flag pattern between these indices

    let highsCount = 0;
    let lowsCount = 0;

    for (let i = startIndex; i <= endIndex; i++) {
        if (isPivot(candles, i)) {
            if (candles[i].close > candles[i - 1].close) highsCount++;
            else lowsCount++;
        }
    }

    return highsCount >= 2 && lowsCount >= 2; // Example condition, adjust as needed.
}

function findPattern(candles) {

    let breakouts = detectAllBreakouts(candles);

    console.log(breakouts);
    return breakouts;
}

function isConsolidating(candles) {
    let percentage = 2;
    let recentCandlesSticks = candles.slice(-15);

    let minClose = Math.min(...recentCandlesSticks.map(item => item.close));
    let maxClose = Math.max(...recentCandlesSticks.map(item => item.close));

    let threshold = 1 - (percentage / 100);

    if (minClose > maxClose * threshold) {
        return true;
    }

    return false;
}

function isBreakingOut(candles) {
    let lastClose = candles[candles.length - 1].close;

    if (isConsolidating(candles)) {
        let recentCandlesSticks = candles.slice(-16, -1);
        let maxRecentClose = Math.max(...recentCandlesSticks.map(item => item.close));

        if (lastClose > maxRecentClose) {
            return true;
        }
    }

    return false;
}

function detectAllBreakouts(candles) {
    let breakoutPoints = [];
    const windowSize = 100;

    // Start from the windowSize + 1 candle to have the first windowSize candles as the initial window.
    for (let i = windowSize + 1; i < candles.length; i++) {
        let windowCandles = candles.slice(i - windowSize, i); // Take the last windowSize candles up to the current
        if (isBreakingOut(windowCandles)) {
            breakoutPoints.push({
                start: candles[i-windowSize],
                end: candles[i]
            }); // This is the candle after the consolidation window where the breakout occurred.
            markers.push({
                time: candles[i].time,
                position: 'belowBar',
                color: '#74ff00',
                shape: 'circle',
                text: 'B?'
            });
        }
    }

    return breakoutPoints;
}
