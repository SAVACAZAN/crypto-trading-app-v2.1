
export default defineNuxtPlugin(() => {
    return {
        provide: {
            cryptoBacktester: {
                data: null,
                initialBalance:null,
                balance: null,
                position: 0, // 0 for no position, 1 for long, -1 for short
                orders: [],
                equity: [],
                markers: [],

                init(data, balance) {
                    this.data = data;
                    this.initialBalance = balance;
                    this.balance = balance;
                    this.position = 0;
                    this.orders = [];
                    this.equity = [];
                    this.markers = [];
                },

                // Add a method to execute a specific trading strategy
                executeStrategy(strategyFunction) {

                    const signals = strategyFunction(this.data);

                    signals.forEach(signal => {
                        if (this.position === 0) {
                            if (signal.type === 'BUY') {
                                this.enterPosition(signal.type, signal);
                            }
                        }

                        if (this.position === 1) {
                            if (signal.type === 'SELL') {
                                this.exitPosition(signal.type, signal);
                            }
                        }

                        //TODO shorting
                    });

                    //calc balance
                    this.balance = this.initialBalance;
                    let entryCost = 0;
                    let exitCost = 0;
                    let profit = 0;
                    let orders = [];

                    for (let i = 0; i < this.data.candles.length; i++) {

                        for (let j = 0; j < this.orders.length; j++) {

                            if (this.data.candles[i].time === this.orders[j].time) {
                                let order = this.orders[j];

                                if (order.type === 'BUY') {
                                    entryCost = order.quantity * order.price;

                                    orders.push({
                                        time:order.time,
                                        type: order.type,
                                        price:order.price.toFixed(2),
                                        quantity:order.quantity.toFixed(2),
                                        cost:entryCost.toFixed(2),
                                        profit:'n/a',
                                        balance: this.balance.toFixed(2),
                                    });
                                }

                                if (order.type === 'SELL') {
                                    exitCost = order.quantity * order.price;
                                    profit = exitCost - entryCost;
                                    this.balance = this.balance + profit;

                                    orders.push({
                                        time:order.time,
                                        type: order.type,
                                        price:order.price.toFixed(2),
                                        quantity:order.quantity.toFixed(2),
                                        cost:exitCost.toFixed(2),
                                        profit:profit.toFixed(2),
                                        balance: this.balance.toFixed(2),
                                    });
                                }
                            }
                        }

                        this.equity.push({
                            time: this.data.candles[i].time,
                            value:this.balance,
                        })
                    }


                    return {
                        balance: this.balance,
                        orders: orders,
                        markers: this.markers,
                        equity: this.equity
                    };
                },

                enterPosition(type, signal) {

                    let positionSize = this.balance;

                    if (type === 'BUY') {
                        this.position = 1;
                        const quantity = positionSize / signal.price;
                        this.orders.push({ time: signal.time, type: 'BUY', price: signal.price, quantity: quantity });
                        this.markers.push({ time: signal.time, position: 'belowBar', color: '#2196F3', shape: 'arrowUp', text: `BUY ${signal.checkType}` });
                    }

                    if (type === 'SELL') {
                        this.position = -1;
                        const quantity = positionSize / signal.price;
                        this.orders.push({ time: signal.time, type: 'SELL', price: signal.price, quantity: quantity });
                        this.markers.push({ time: signal.time, position: 'aboveBar', color: '#e91e63', shape: 'arrowDown', text: `SELL ${signal.checkType}` });
                    }
                },

                exitPosition(type, signal) {

                    this.position = 0;

                    let lastOrder = this.orders[this.orders.length -1];
                    let quantity = lastOrder.quantity;

                    this.orders.push({ time: signal.time, type: type, price: signal.price, quantity: quantity });
                    this.markers.push({ time: signal.time, position: 'aboveBar', color: '#e91e63', shape: 'arrowDown', text: `SELL ${signal.checkType}` });
                }
            }
        }
    }
})
