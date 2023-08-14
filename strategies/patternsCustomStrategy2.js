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

export const patternsStrategy = (data) => {

    let MACD = [];
    let MACDSignal = [];
    for (let i = 0; i < data.candles.length; i++) {
        MACD.push(data.MACD[i].value);
        MACDSignal.push(data.MACDSignal[i].value);
    }


    let MACDCrossLines = {lineA: MACDSignal, lineB: MACD};

    // let MACrossLines = {lineA: MACDSignal, lineB: MACD};

    let MACDCrossUp = new CrossUp(MACDCrossLines);
    let MACDCrossUpValues = MACDCrossUp.getResult();
    let MACDCrossDown = new CrossDown(MACDCrossLines);
    let MACDCrossDownValues = MACDCrossDown.getResult();

    for (let i = 0; i < data.candles.length; i++) {

        if (data.RSI[i].value > 70 || data.RSI[i].value < 30) {

            if (i > 5) {
                let candleMinus4 = data.candles[i - 4];
                let candleMinus3 = data.candles[i - 3];
                let candleMinus2 = data.candles[i - 2];
                let candleMinus1 = data.candles[i - 1];
                let candle = data.candles[i];

                let fiveDayInput = {
                    open: [candleMinus4.open, candleMinus3.open, candleMinus2.open, candleMinus1.open, candle.open],
                    high: [candleMinus4.high, candleMinus3.high, candleMinus2.high, candleMinus1.high, candle.high],
                    close: [candleMinus4.close, candleMinus3.close, candleMinus2.close, candleMinus1.close, candle.close],
                    low: [candleMinus4.low, candleMinus3.low, candleMinus2.low, candleMinus1.low, candle.low],
                }

                console.log(fiveDayInput);

                //Hanging Man: Similar to the Hammer Pattern, this pattern suggests potential reversal after an uptrend.
                let bullishHangingman = hangingman(fiveDayInput);
                if (bullishHangingman){
                    markers.push({
                        time: candle.time,
                        position: 'belowBar',
                        color: '#74ff00',
                        shape: 'circle',
                        text: 'REVERSE5'
                    });
                }

                //Hanging Man: Similar to the Hammer Pattern, this pattern suggests potential reversal after an uptrend.
                let bearishHangingman = hangingman(fiveDayInput);
                if (bearishHangingman){
                    markers.push({
                        time: candle.time,
                        position: 'aboveBar',
                        color: '#ff0505',
                        shape: 'circle',
                        text: 'REVERSE5'
                    });
                }


                // Shooting Star: This bearish reversal pattern occurs when a small-bodied candle with a long upper
                // shadow follows an uptrend. It suggests a potential reversal from bullish to bearish.
                let bullishShootingStar = shootingstar(fiveDayInput);
                if (bullishShootingStar){
                    markers.push({
                        time: candle.time,
                        position: 'belowBar',
                        color: '#74ff00',
                        shape: 'circle',
                        text: 'REVERSE5'
                    });
                }


                let bearishShootingStar = shootingstar(fiveDayInput);
                if (bearishShootingStar){
                    markers.push({
                        time: candle.time,
                        position: 'aboveBar',
                        color: '#ff0505',
                        shape: 'circle',
                        text: 'REVERSE5'
                    });
                }


                // Shooting Star (Unconfirmed): Similar to the Shooting Star pattern, but not fully confirmed,
                // indicating potential reversal but with less certainty.
                let bullishShootingStarUnconfirmed = shootingstarunconfirmed(fiveDayInput);
                if (bullishShootingStar){
                    markers.push({
                        time: candle.time,
                        position: 'belowBar',
                        color: '#74ff00',
                        shape: 'circle',
                        text: 'REVERSE5'
                    });
                }


                let bearishShootingStarUnconfirmed = shootingstarunconfirmed(fiveDayInput);
                if (bearishShootingStar){
                    markers.push({
                        time: candle.time,
                        position: 'aboveBar',
                        color: '#ff0505',
                        shape: 'circle',
                        text: 'REVERSE5'
                    });
                }

                // Tweezer Top: This bearish reversal pattern occurs when two consecutive candles have the same high
                // but the second candle is bearish. It suggests potential reversal after an uptrend.
                let tweezertopR = tweezertop(fiveDayInput);
                if (tweezertopR){
                    markers.push({
                        time: candle.time,
                        position: 'aboveBar',
                        color: '#ff0505',
                        shape: 'circle',
                        text: 'REVERSE5'
                    });
                }

                // Tweezer Bottom: Similar to the Tweezer Top, this pattern suggests potential reversal after a downtrend.
                let tweezerbottomR = tweezerbottom(fiveDayInput);
                if (tweezerbottomR){
                    markers.push({
                        time: candle.time,
                        position: 'belowBar',
                        color: '#74ff00',
                        shape: 'circle',
                        text: 'REVERSE5'
                    });
                }
            }
        }


        if (i > 3) {
            let candleMinus2 = data.candles[i - 2];
            let candleMinus1 = data.candles[i - 1];
            let candle = data.candles[i];

            let threeDayInput = {
                open: [candleMinus2.open, candleMinus1.open, candle.open],
                high: [candleMinus2.high, candleMinus1.high, candle.high],
                close: [candleMinus2.close, candleMinus1.close, candle.close],
                low: [candleMinus2.low, candleMinus1.low, candle.low],
            }

            console.log(threeDayInput);

            // Abandoned Baby: This is a bullish reversal pattern that usually occurs after a downtrend.
            // It consists of three candlesticks: a long bearish candle, a gap, and a long bullish candle.
            // It suggests a potential trend reversal from bearish to bullish.
            let abandonedbabyR = abandonedbaby(threeDayInput);
            if (abandonedbabyR){
                markers.push({
                    time: candle.time,
                    position: 'belowBar',
                    color: '#74ff00',
                    shape: 'circle',
                    text: 'REVERSE3'
                });
            }

            //Evening Doji Star: This bearish reversal pattern is formed by a bullish candle,
            //followed by a Doji (a candle with almost no body), and then a bearish candle.
            //It indicates a possible trend reversal to the downside.
            let eveningdojistarR = eveningdojistar(threeDayInput);
            if (eveningdojistarR){
                markers.push({
                    time: candle.time,
                    position: 'aboveBar',
                    color: '#ff0505',
                    shape: 'circle',
                    text: 'REVERSE3'
                });
            }

            //Evening Star: Similar to the Evening Doji Star, this bearish reversal pattern consists of a bullish candle,
            //a small-bodied candle (either bullish or bearish), and then a larger bearish candle.
            //It signals a potential reversal from bullish to bearish.
            let eveningstarR = eveningstar(threeDayInput);
            if (eveningstarR){
                markers.push({
                    time: candle.time,
                    position: 'belowBar',
                    color: '#74ff00',
                    shape: 'circle',
                    text: 'REVERSE3'
                });
            }

            //Morning Star: This bullish reversal pattern consists of a bearish candle, a small-bodied candle
            //(either bullish or bearish), and then a larger bullish candle.
            // It suggests a potential reversal from bearish to bullish.
            let morningstarR = morningstar(threeDayInput);
            if (morningstarR){
                markers.push({
                    time: candle.time,
                    position: 'belowBar',
                    color: '#74ff00',
                    shape: 'circle',
                    text: 'REVERSE3'
                });
            }

            // Morning Doji Star: Similar to the Morning Star, this pattern has a Doji as the second candle.
            //It indicates potential reversal but with less confirmation.
            let morningdojistarR = morningdojistar(threeDayInput);
            if (morningdojistarR){
                markers.push({
                    time: candle.time,
                    position: 'belowBar',
                    color: '#74ff00',
                    shape: 'circle',
                    text: 'REVERSE3'
                });
            }

            //Three Black Crows: This bearish reversal pattern consists of three consecutive bearish candles
            //with lower lows and lower highs. It indicates a strong shift from bullish to bearish sentiment.
            let threeblackcrowsR = threeblackcrows(threeDayInput);
            if (threeblackcrowsR){
                markers.push({
                    time: candle.time,
                    position: 'aboveBar',
                    color: '#ff0505',
                    shape: 'circle',
                    text: 'REVERSE3'
                });
            }

            // Three White Soldiers:This pattern is a bullish reversal pattern.
            // The Three White Soldiers pattern belongs to the category of bullish reversal patterns.
            // It's a strong signal of potential trend reversal after a downtrend, as buyers take control and
            // drive prices higher over the three candles.
            let threewhitesoldiersR = threewhitesoldiers(threeDayInput);
            if (threewhitesoldiersR){
                markers.push({
                    time: candle.time,
                    position: 'aboveBar',
                    color: '#74ff00',
                    shape: 'circle',
                    text: 'REVERSE3'
                });
            }

            //Downside Tasuki Gap: is a bearish continuation pattern in a downtrend, featuring a long bearish candle
            // followed by a gap down and a bullish candle opening within the previous candle's body but closing below its midpoint.
            // It signifies a likely persistence of the downtrend despite temporary upward movement,
            // aiding traders in maintaining or entering short positions. This pattern falls into the continuation
            // category and highlights ongoing bearish momentum amid short-lived price rises.
            let downsidetasukigapR = downsidetasukigap(threeDayInput);
            if (downsidetasukigapR){
                markers.push({
                    time: candle.time,
                    position: 'aboveBar',
                    color: '#ff0505',
                    shape: 'circle',
                    text: 'CONTINUE3'
                });
            }

        }



        if (i > 2) {
            let candleMinus1 = data.candles[i];
            let candle = data.candles[i];

            let twoDayInput = {
                open: [candleMinus1.open, candle.open],
                high: [candleMinus1.high, candle.high],
                close: [candleMinus1.close, candle.close],
                low: [candleMinus1.low, candle.low],
            }

            //Bearish Engulfing Pattern: This bearish reversal pattern forms when a small bullish candle is followed
            // by a larger bearish candle that completely engulfs the previous candle.
            // It indicates a potential reversal from bullish to bearish.
            let bearishengulfingpatternR = bearishengulfingpattern(twoDayInput);
            if (bearishengulfingpatternR){
                markers.push({
                    time: candle.time,
                    position: 'aboveBar',
                    color: '#ff0505',
                    shape: 'circle',
                    text: 'REVERSE2'
                });
            }

            // Bullish Engulfing Pattern: This bullish reversal pattern is the opposite of the bearish engulfing pattern.
            // A small bearish candle is followed by a larger bullish candle that engulfs the previous candle,
            // suggesting a reversal from bearish to bullish.
            let bullishengulfingpatterR = bullishengulfingpattern(twoDayInput);
            if (bullishengulfingpatterR){
                markers.push({
                    time: candle.time,
                    position: 'belowBar',
                    color: '#74ff00',
                    shape: 'circle',
                    text: 'REVERSE2'
                });
            }

            //Dark Cloud Cover: This bearish reversal pattern occurs when a bullish candle is followed by a bearish candle that opens
            // higher but closes below the midpoint of the previous candle.
            // It suggests potential bearish momentum.
            let darkcloudcoverR = darkcloudcover(twoDayInput);
            if (darkcloudcoverR){
                markers.push({
                    time: candle.time,
                    position: 'aboveBar',
                    color: '#ff0505',
                    shape: 'circle',
                    text: 'REVERSE2'
                });
            }

            //Bullish Harami: Bullish Reversal Pattern.his pattern occurs after a downtrend and involves two candlesticks.
            //The first candle is a large bearish candle, followed by a smaller bullish candle that is completely
            //engulfed within the body of the previous bearish candle. It suggests a potential reversal from bearish to bullish.
            let bullishharamiR = bullishharami(twoDayInput);
            if (bullishharamiR){
                markers.push({
                    time: candle.time,
                    position: 'belowBar',
                    color: '#74ff00',
                    shape: 'circle',
                    text: 'REVERSE2'
                });
            }

            //Bullish Harami Cross: This bullish continuation pattern is the opposite of the Bearish Harami Cross.
            // It involves a large bearish candle followed by a Doji, suggesting potential continuation of an existing bullish trend.
            let bullishharamicrossR = bullishharamicross(twoDayInput);
            if (bullishharamicrossR){
                markers.push({
                    time: candle.time,
                    position: 'belowBar',
                    color: '#74ff00',
                    shape: 'circle',
                    text: 'CONTINUE2'
                });
            }

            //Bearish Harami
            let bearishharamiR = bearishharami(twoDayInput);
            if (bearishharamiR){
                markers.push({
                    time: candle.time,
                    position: 'belowBar',
                    color: '#ff0505',
                    shape: 'circle',
                    text: 'REVERSE2'
                });
            }

            //Bearish Harami Cross: This pattern is similar to the Bearish Harami but with a Doji instead of a small bearish candle.
            //It suggests uncertainty and potential reversal.
            let bearishharamicrossR = bearishharamicross(twoDayInput);
            if (bearishharamicrossR){
                markers.push({
                    time: candle.time,
                    position: 'aboveBar',
                    color: '#ff0505',
                    shape: 'circle',
                    text: 'REVERSE2'
                });
            }

            //Piercing Line: This bullish reversal pattern occurs when a bearish candle is followed by a
            //bullish candle that opens below the previous candle's low but closes above its midpoint.
            //It suggests potential trend reversal.
            let piercinglineR = piercingline(twoDayInput);
            if (piercinglineR){
                markers.push({
                    time: candle.time,
                    position: 'belowBar',
                    color: '#74ff00',
                    shape: 'circle',
                    text: 'REVERSE2'
                });
            }
        }


        let candle = data.candles[i];

        var singleInput = {
            open: [candle.open],
            high: [candle.high],
            close: [candle.close],
            low: [candle.low],
        }

        // //Doji: This neutral candle has almost no body and indicates market indecision between bulls and bears.
        // // It doesn't provide a clear direction on its own but can be significant when appearing after a trend.
        // let dojiR = doji(singleInput);
        // if (dojiR){
        //     markers.push({
        //         time: candle.time,
        //         position: 'aboveBar',
        //         color: '#eeeeee',
        //         shape: 'circle',
        //         text: 'INDE'
        //     });
        // }
        //
        // //Dragonfly Doji: A Doji with a long lower shadow but no upper shadow.
        // // It suggests potential bullish reversal after a downtrend.
        // let dragonflydojiR = dragonflydoji(singleInput);
        // if (dragonflydojiR){
        //     markers.push({
        //         time: candle.time,
        //         position: 'below',
        //         color: '#74ff00',
        //         shape: 'circle',
        //         text: 'REVERS'
        //     });
        // }
        //
        // //Gravestone Doji: A Doji with a long upper shadow but no lower shadow.
        // // It suggests potential bearish reversal after an uptrend.
        // let gravestonedojiR = gravestonedoji(singleInput);
        // if (gravestonedojiR){
        //     markers.push({
        //         time: candle.time,
        //         position: 'aboveBar',
        //         color: '#ff0505',
        //         shape: 'circle',
        //         text: 'REVERSE'
        //     });
        // }
        //
        // //Bullish Marubozu: This bullish continuation pattern features a long bullish candle with little to no shadows.
        // //It suggests strong bullish sentiment and potential continuation of the trend.
        // let bullishmarubozuR = bullishmarubozu(singleInput);
        // if (bullishmarubozuR){
        //     markers.push({
        //         time: candle.time,
        //         position: 'belowBar',
        //         color: '#74ff00',
        //         shape: 'circle',
        //         text: 'CONTINUE'
        //     });
        // }
        //
        // // Bearish Marubozu: Similar to the Bullish Marubozu, this bearish continuation pattern is characterized by a
        // // long bearish candle with minimal shadows. It indicates strong bearish sentiment and potential continuation of the trend.
        // let bearishmarubozuR = bearishmarubozu(singleInput);
        // if (bearishmarubozuR){
        //     markers.push({
        //         time: candle.time,
        //         position: 'aboveBar',
        //         color: '#ff0505',
        //         shape: 'circle',
        //         text: 'CONTINUE'
        //     });
        // }
        //
        // //Bullish Spinning Top: This pattern is a small-bodied candle with both upper and lower shadows.
        // //It suggests indecision in the market but can signal a continuation of the trend if it occurs during an uptrend.
        // let bullishspinningtopR = bullishspinningtop(singleInput);
        // if (bullishspinningtopR){
        //     markers.push({
        //         time: candle.time,
        //         position: 'belowBar',
        //         color: '#74ff00',
        //         shape: 'circle',
        //         text: 'CONTINUE'
        //     });
        // }
        //
        // //Bearish Spinning Top: Similar to the Bullish Spinning Top, this pattern indicates market indecision but
        // //can signal a continuation of the trend if it forms during a downtrend.
        // let bearishspinningtopR = bearishspinningtop(singleInput);
        // if (bearishspinningtopR){
        //     markers.push({
        //         time: candle.time,
        //         position: 'aboveBar',
        //         color: '#ff0505',
        //         shape: 'circle',
        //         text: 'CONTINUE'
        //     });
        // }
        //
        // // Bullish Hammer: This bullish reversal pattern has a small body and a long lower shadow.
        // // It suggests potential bullish reversal after a downtrend.
        // let bullishhammerstickR = bullishhammerstick(singleInput);
        // if (bullishhammerstickR){
        //     markers.push({
        //         time: candle.time,
        //         position: 'belowBar',
        //         color: '#74ff00',
        //         shape: 'circle',
        //         text: 'REVERSE'
        //     });
        // }
        //
        // // Bearish Hammer: Similar to the Bullish Hammer, this pattern suggests
        // // potential bearish reversal after an uptrend.
        // let bearishhammerstickR = bearishhammerstick(singleInput);
        // if (bearishhammerstickR){
        //     markers.push({
        //         time: candle.time,
        //         position: 'aboveBar',
        //         color: '#ff0505',
        //         shape: 'circle',
        //         text: 'REVERSE'
        //     });
        // }
        //
        //
        // // Bullish Inverted Hammer: This bullish reversal pattern has a small body and a long upper shadow.
        // // It indicates potential bullish reversal after a downtrend.
        // let bullishinvertedhammerstickR = bullishinvertedhammerstick(singleInput);
        // if (bullishinvertedhammerstickR){
        //     markers.push({
        //         time: candle.time,
        //         position: 'belowBar',
        //         color: '#74ff00',
        //         shape: 'circle',
        //         text: 'REVERSE'
        //     });
        // }
        //
        // // Bearish Inverted Hammer: Similar to the Bullish Inverted Hammer, this pattern suggests potential
        // // bearish reversal after an uptrend.
        // let bearishinvertedhammerstickR = bearishinvertedhammerstick(singleInput);
        // if (bearishinvertedhammerstickR){
        //     markers.push({
        //         time: candle.time,
        //         position: 'aboveBar',
        //         color: '#ff0505',
        //         shape: 'circle',
        //         text: 'REVERSE'
        //     });
        // }


        // console.log(position);

        // if (position === 0) {
        //     if (data.MACDHistogram[i].value > 0) {
        //         if (MACDCrossDownValues[i]) {
        //
        //             // if (data.RSI[i].value < 80) {
        //
        //             // if (candle.close > data.MA200[i].value &&
        //             //     candle.close > data.MA100[i].value &&
        //             //     candle.close > data.MA50[i].value) {
        //             markers.push({
        //                 time: candle.time,
        //                 position: 'belowBar',
        //                 color: '#74ff00',
        //                 shape: 'circle',
        //                 text: '1'
        //             });
        //             // enterPosition(candle.time, data.symbol, candle.close, 'BASE', generalOrderCost);
        //             // }
        //             // }
        //         }
        //     }
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
