export default defineEventHandler(async (event) => {
    const nitroApp = useNitroApp()
    const data = await readBody(event)

    //
    // //get historical data
    // let response = await nitroApp.ccxtw.fetchOHLCV(data.userID, data.exchange, data.symbol);

    let historicalData = await $fetch('/api/v1/fetchOHLCV', {
        query:{
            userID:data.userID,
            exchange:data.exchange,
            symbol:data.symbol,
            timeframe:data.timeframe,
            dateFrom:data.date.from,
            limit:1000,
        }
    });


    const shortMAperiod = 12;
    const longMAperiod = 26;
    const riskPercentage = 1; // 2% risk per trade
    const initialCapital = 1000;

    const strategy = new MovingAverageCrossoverStrategy(historicalData, shortMAperiod, longMAperiod, riskPercentage);
    strategy.strategy();
    const result = strategy.backtest(initialCapital);
    // console.log(result);

    return {
        data: 'OK'
    }
})


class MovingAverageCrossoverStrategy {
    constructor(data, shortPeriod, longPeriod, riskPercentage) {
        this.data = data;
        this.shortPeriod = shortPeriod;
        this.longPeriod = longPeriod;
        this.riskPercentage = riskPercentage;
        this.positions = [];
    }

    strategy() {
        for (let i = this.longPeriod - 1; i < this.data.length; i++) {
            const shortMA = this.calculateMovingAverage(this.shortPeriod);
            const longMA = this.calculateMovingAverage(this.longPeriod);
            const currentPrice = this.data[i].close;

            if (i > this.longPeriod - 1) {
                // Generate signals based on moving average crossovers
                if (shortMA > longMA && this.positions[i - 1] !== 'BUY') {
                    this.positions[i] = 'BUY';
                } else if (shortMA < longMA && this.positions[i - 1] !== 'SELL') {
                    this.positions[i] = 'SELL';
                } else {
                    this.positions[i] = 'HOLD';
                }
            }
        }
    }

    calculateMovingAverage(period) {
        // Function to calculate the moving average for a given period
        const prices = this.data.slice(-period).map((d) => d.close);
        const sum = prices.reduce((total, price) => total + price, 0);
        return sum / period;
    }

    backtest(initialCapital) {
        let balance = initialCapital;
        let position = 0;

        for (let i = this.longPeriod; i < this.data.length; i++) {
            const signal = this.positions[i];
            const currentPrice = this.data[i].close;

            if (signal === 'BUY' && position === 0) {
                // Calculate the position size based on risk percentage and stop-loss level
                const stopLossPrice = currentPrice * (1 - this.riskPercentage / 100);
                const riskAmount = initialCapital * (this.riskPercentage / 100);
                const positionSize = riskAmount / (currentPrice - stopLossPrice);

                // Check if the position size is within available balance
                position = Math.min(balance / currentPrice, positionSize);
                balance -= position * currentPrice;
            } else if (signal === 'SELL' && position > 0) {
                // Execute a sell order
                balance += position * currentPrice;
                position = 0;
            }
        }

        // Calculate final value of the portfolio
        const finalValue = balance + position * this.data[this.data.length - 1].close;
        const profitOrLoss = finalValue - initialCapital;

        // console.log(this.positions);
        return { finalValue, profitOrLoss };
    }
}
