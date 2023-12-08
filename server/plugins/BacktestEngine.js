import { create, all } from 'mathjs';

const config = {
    number: 'BigNumber',
    precision: 20
}
const math = create(all, config);

export default defineNitroPlugin((nitroApp) => {
    // console.log('BackTest Engine Loaded...')

    nitroApp.backtestEngine = {
        //defaults
        params:{
            data:null,
            startBalance:1000,
            generalOrderCost: 10,
            maxSafeOrdersCount: 4,
            makerFees: 0.1,
            priceTargets: {
                safe :0.3,
                sl :0.2,
                tp :0.2,
            },
        },
        position: 0, // 0 no position, 1 long, -1 short
        balance: 0,
        // equity: [],
        orders: [],
        positionOrders: [],
        pricesToCheck: {
            safeOrder:0,
            slOrder:0,
            tpOrder:0,
        },
        statistics: {
            trades:0,
            baseOrders:0,
            safeOrders:0,
            tpOrders:0,
            slOrders:0,
            finalBalance:0,
            paidFees: 0,
            winLossRatio: 0,
        },

        init(params) {
            this.params = params;
            this.balance = params.startBalance;
        },

        executeStrategy(strategyFunction) {
            if (this.params.data) {
                return strategyFunction(this.params.data);
            } else {
                return false;
            }
        },

        enterPosition(candle, type, symbol) {

            let price = 0;

            if (type === 'base') {
                price = candle.close;
            }

            if (type === 'safe') {
                price = this.pricesToCheck.safeOrder;
            }

            let cost = this.params.generalOrderCost;
            let amount = Number(math.evaluate(`${cost} / ${price}`));
            let fees = 0;
            let feesCost = 0;

            fees = Number(math.evaluate(`(${this.params.makerFees} / 100) * ${amount}`));
            feesCost = Number(math.evaluate(`${fees} * ${price}`));
            amount = Number(math.evaluate(`${amount} - ${fees}`));
            // cost = Number(math.evaluate(`${cost} - (${fees} / ${price})`));

            this.balance = Number(math.evaluate(`${this.balance} - ${feesCost}`));

            let data = {
                symbol:symbol,
                time: candle.time,
                side: 'BUY',
                price: price,
                amount: amount,
                cost: cost,
                fees:feesCost,
                profit: 0,
                balance: this.balance,
                type:(type === 'base') ? 'BASE' : 'SAFE',
            };

            //push signal
            this.orders.push(data);
            this.positionOrders.push(data);

            let totalAmount = 0;
            let totalCost = 0;
            for (let i = 0; i < this.positionOrders.length; i++) {
                totalAmount = Number(math.evaluate(`${totalAmount} + ${this.positionOrders[i].amount}`));
                totalCost = Number(math.evaluate(`${totalCost} + ${this.positionOrders[i].cost}`));
            }
            let priceAverage = Number(math.evaluate(`${totalCost} / ${totalAmount}`));

            this.pricesToCheck.tpOrder = Number(math.evaluate(`${priceAverage} + (${priceAverage} * ${this.params.priceTargets.tp} / 100)`));
            this.pricesToCheck.safeOrder = Number(math.evaluate(`${priceAverage} - (${priceAverage} * ${this.params.priceTargets.safe} / 100)`));
            this.pricesToCheck.slOrder = Number(math.evaluate(`${priceAverage} - (${priceAverage} * ${this.params.priceTargets.sl} / 100)`));

            //statistics
            this.statistics.trades++;
            if (type === 'base') {
                this.statistics.baseOrders++;
            } else {
                this.statistics.safeOrders++;
            }

            this.statistics.paidFees = Number(math.evaluate(`${this.statistics.paidFees} + ${feesCost}`));
        },

        exitPosition(candle, type, symbol) {

            let price = 0;

            if (type === 'tp') {
                price = this.params.pricesToCheck.tpOrder;
            }

            if (type === 'sl') {
                price = this.params.pricesToCheck.slOrder;
            }

            let positionAmount = 0;
            let positionCost = 0;
            let entryCost = 0;
            let profit = 0;
            let fees = 0;
            let feesCost = 0;

            //calc position size
            for (let j = 0; j < this.positionOrders.length; j++) {
                positionAmount = Number(math.evaluate(`${positionAmount} + ${this.positionOrders[j].amount}`));
                entryCost = Number(math.evaluate(`${entryCost} + ${this.positionOrders[j].cost}`));
            }

            //calc position at current price
            positionCost = Number(math.evaluate(`${positionAmount} * ${price}`));

            //calc fees
            fees = Number(math.evaluate(`(${this.params.makerFees} / 100) * ${positionAmount}`));
            feesCost = Number(math.evaluate(`${fees} * ${price}`));

            //calc profit
            profit = Number(math.evaluate(`${positionCost} - ${entryCost}`));
            this.balance = Number(math.evaluate(`${this.balance} + ${profit} - ${feesCost}`));

            let data = {
                symbol:symbol,
                time: candle.time,
                side: 'SELL',
                price: price,
                amount: positionAmount,
                cost: positionCost,
                fees:feesCost,
                profit: profit,
                balance: this.balance,
                type:(type === 'tp') ? 'TP' : 'SL',
            }

            //push signal
            this.orders.push(data);
            this.positionOrders.push(data);

            //statistics
            this.statistics.trades++;
            if (type === 'tp') {
                this.statistics.tpOrders++;
            } else {
                this.statistics.slOrders++;
            }
            this.statistics.paidFees = Number(math.evaluate(`${this.statistics.paidFees} + ${feesCost}`));
        }
    };
})
