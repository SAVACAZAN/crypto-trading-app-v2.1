import ccxt from 'ccxt'
import {userExchangesSchema} from "~/server/models/userExchanges.schema";
class CCXTW {
    constructor(){
        this.users = new Map();
    }

    async loadInstance(userID, exchange) {

        const apiKeys = await this.getApiKeys(userID, exchange);
        let instance = new ccxt[exchange](apiKeys);
        await instance.loadMarkets();

        // Retrieve the user's data (nested Map) using their userID
        const userExchangeData = this.users.get(userID);

        // Check if the user exists in the main data container
        if (!userExchangeData) {
            // If the user doesn't exist, create a new entry for them
            // Create a nested Map to store exchange-related data for the user
            const userExchangeData = new Map();

            // Add the user to the main data container with the nested Map as its value
            this.users.set(userID, userExchangeData);
        }

        // Now you can set the exchange data for the user using the exchange name as the key
        this.users.get(userID).set(exchange, instance);

        // console.log('loading instance: ', userID, exchange);
    }

    async getApiKeys(userID, exchange) {
        let returnObj = [];
        const userExchanges = await userExchangesSchema.findOne({userID, exchange});

        if (userExchanges) {
            for (let i = 0; i < userExchanges.apiKeys.length; i++) {
                returnObj[userExchanges.apiKeys[i].key] = userExchanges.apiKeys[i].value;
            }
            return returnObj;
        } else {
            return false;
        }
    };

    /*
    * PUBLIC METHODS
    */

    async fetchExchanges() {
        return ccxt.exchanges;
    }

    async fetchExchangeInstance(exchange, keys) {

        let exKeys = [];

        for (let i = 0; i < keys.length; i++) {
            exKeys[keys[i].key] = keys[i].value;
        }

        let instance = new ccxt[exchange] (exKeys);
        await instance.loadMarkets();
        return instance;
    }

    async fetchMarkets(userID, exchange) {
        let log = null;
        let data = null;
        let success = null;

        if (!this.users.has(userID)) {
            this.users.set(userID, new Map());
        }

        if (!this.users.get(userID).has(exchange)) {
            await this.loadInstance(userID, exchange);
        }

        if (this.users.get(userID).get(exchange).has['fetchMarkets']){
            try {
                data = await this.users.get(userID).get(exchange).fetchMarkets();
                success = true;
            } catch (e) {
                data = null;
                success = false;
                if (e instanceof ccxt.NetworkError) {
                    log =`Failed due to a network error: ${e.message}`;
                } else if (e instanceof ccxt.ExchangeError) {
                    log =`Failed due to a exchange error: ${e.message}`;
                } else {
                    log =`Failed with: ${e.message}`;
                }
            }
        } else {
            log = `Exchange ${exchange} does not support fetchMarkets`;
            success = false;
        }

        return {
            data,
            success,
            log
        };
    };

    // TODO - broken??
    async fetchCurrencies(userID, exchange) {
        let log = null;
        let data = null;
        let success = null;

        if (!this.users.has(userID)) {
            this.users.set(userID, new Map());
        }

        if (!this.users.get(userID).has(exchange)) {
            await this.loadInstance(userID, exchange);
        }

        if (this.users.get(userID).get(exchange).has['fetchCurrencies']) {
            try {
                data = await this.users.get(userID).get(exchange).fetchCurrencies();
                success = true;
            } catch (e) {
                data = null;
                success = false;
                if (e instanceof ccxt.NetworkError) {
                    log =`Failed due to a network error: ${e.message}`;
                } else if (e instanceof ccxt.ExchangeError) {
                    log =`Failed due to a exchange error: ${e.message}`;
                } else {
                    log =`Failed with: ${e.message}`;
                }
            }
        } else {
            log = `Exchange ${exchange} does not support fetchCurrencies`;
            success = false;
        }



        return {
            data,
            success,
            log
        };
    };

    async fetchTicker(userID, exchange, symbol) {
        let log = null;
        let data = null;
        let success = null;

        if (!this.users.has(userID)) {
            this.users.set(userID, new Map());
        }

        if (!this.users.get(userID).has(exchange)) {
            await this.loadInstance(userID, exchange);
        }

        if (this.users.get(userID).get(exchange).has['fetchTicker']) {
            try {
                data = await this.users.get(userID).get(exchange).fetchTicker(symbol);
                success = true;
            } catch (e) {
                data = null;
                success = false;
                if (e instanceof ccxt.NetworkError) {
                    log =`Failed due to a network error: ${e.message}`;
                } else if (e instanceof ccxt.ExchangeError) {
                    log =`Failed due to a exchange error: ${e.message}`;
                } else {
                    log =`Failed with: ${e.message}`;
                }
            }
        } else {
            log = `Exchange ${exchange} does not support fetchTicker`;
            success = false;
        }

        return {
            data,
            success,
            log
        };
    };

    async fetchTickers(userID, exchange, symbols) {
        let log = null;
        let data = null;
        let success = null;

        if (!this.users.has(userID)) {
            this.users.set(userID, new Map());
        }

        if (!this.users.get(userID).has(exchange)) {
            await this.loadInstance(userID, exchange);
        }

        if (this.users.get(userID).get(exchange).has['fetchTickers']) {
            try {
                data = await this.users.get(userID).get(exchange).fetchTickers(symbols.split(','));
                success = true;
            } catch (e) {
                data = null;
                success = false;
                if (e instanceof ccxt.NetworkError) {
                    log =`Failed due to a network error: ${e.message}`;
                } else if (e instanceof ccxt.ExchangeError) {
                    log =`Failed due to a exchange error: ${e.message}`;
                } else {
                    log =`Failed with: ${e.message}`;
                }
            }
        } else {
            log = `Exchange ${exchange} does not support fetchTickers`;
            success = false;
        }

        return {
            data,
            success,
            log
        };
    };

    async fetchOrderBook(userID, exchange, symbol) {
        let log = null;
        let data = null;
        let success = null;

        if (!this.users.has(userID)) {
            this.users.set(userID, new Map());
        }

        if (!this.users.get(userID).has(exchange)) {
            await this.loadInstance(userID, exchange);
        }

        if (this.users.get(userID).get(exchange).has['fetchOrderBook']) {
            try {
                data = await this.users.get(userID).get(exchange).fetchOrderBook(symbol);
                success = true;
            } catch (e) {
                data = null;
                success = false;
                if (e instanceof ccxt.NetworkError) {
                    log =`Failed due to a network error: ${e.message}`;
                } else if (e instanceof ccxt.ExchangeError) {
                    log =`Failed due to a exchange error: ${e.message}`;
                } else {
                    log =`Failed with: ${e.message}`;
                }
            }
        } else {
            log = `Exchange ${exchange} does not support fetchOrderBook`;
            success = false;
        }

        return {
            data,
            success,
            log
        };
    };

    async fetchOHLCV(userID, exchange, symbol, timeframe, since, limit) {
        let log = null;
        let data = null;
        let success = null;

        if (!this.users.has(userID)) {
            this.users.set(userID, new Map());
        }

        if (!this.users.get(userID).has(exchange)) {
            await this.loadInstance(userID, exchange);
        }

        // console.log('entries: ', this.users.get(userID).keys());

        if(this.users.get(userID).get(exchange).has['fetchOHLCV']) {
            try {
                data = await this.users.get(userID).get(exchange).fetchOHLCV(symbol, timeframe, since, limit);
                success = true;
            } catch (e) {
                data = null;
                success = false;
                if (e instanceof ccxt.NetworkError) {
                    log =`Failed due to a network error: ${e.message}`;
                } else if (e instanceof ccxt.ExchangeError) {
                    log =`Failed due to a exchange error: ${e.message}`;
                } else {
                    log =`Failed with: ${e.message}`;
                }
            }
        } else {
            log = `Exchange ${exchange} does not support fetchOHLCV`;
            success = false;
        }

        return {
            data,
            success,
            log
        };
    };

    async milliseconds(userID, exchange){
        if (!this.users.has(userID)) {
            this.users.set(userID, new Map());
        }

        if (!this.users.get(userID).has(exchange)) {
            await this.loadInstance(userID, exchange);
        }

        let ms = await this.users.get(userID).get(exchange).milliseconds();

        return ms;
    }

    async parseTimeframe(userID, exchange, timeframe){
        if (!this.users.has(userID)) {
            this.users.set(userID, new Map());
        }

        if (!this.users.get(userID).has(exchange)) {
            await this.loadInstance(userID, exchange);
        }

        let tf = await this.users.get(userID).get(exchange).parseTimeframe(timeframe);

        return tf;
    }

    async sleep(userID, exchange, ms){
        if (!this.users.has(userID)) {
            this.users.set(userID, new Map());
        }

        if (!this.users.get(userID).has(exchange)) {
            await this.loadInstance(userID, exchange);
        }

        await this.users.get(userID).get(exchange).sleep(ms);
    }

    async parse8601(userID, exchange, date){
        if (!this.users.has(userID)) {
            this.users.set(userID, new Map());
        }

        if (!this.users.get(userID).has(exchange)) {
            await this.loadInstance(userID, exchange);
        }

        let fdate = await this.users.get(userID).get(exchange).parse8601(date);

        return fdate;
    }

    async iso8601(userID, exchange, date){
        if (!this.users.has(userID)) {
            this.users.set(userID, new Map());
        }

        if (!this.users.get(userID).has(exchange)) {
            await this.loadInstance(userID, exchange);
        }

        let fdate = await this.users.get(userID).get(exchange).iso8601(date);

        return fdate;
    }

    //fetchStatus

    //fetchTrades

    /*
    * PRIVATE METHODS
    */

    async fetchBalance(userID, exchange) {
        let log = null;
        let data = null;
        let success = null;

        if (!this.users.has(userID)) {
            this.users.set(userID, new Map());
        }

        if (!this.users.get(userID).has(exchange)) {
            await this.loadInstance(userID, exchange);
        }

        if (this.users.get(userID).get(exchange).has['fetchBalance']) {
            try {
                data = await this.users.get(userID).get(exchange).fetchBalance();
                success = true;
            } catch (e) {
                data = null;
                success = false;
                if (e instanceof ccxt.NetworkError) {
                    log =`Failed due to a network error: ${e.message}`;
                } else if (e instanceof ccxt.ExchangeError) {
                    log =`Failed due to a exchange error: ${e.message}`;
                } else {
                    log =`Failed with: ${e.message}`;
                }
            }
        } else {
            log = `Exchange ${exchange} does not support fetchBalance`;
            success = false;
        }

        return {
            data,
            success,
            log
        };
    };

    //createOrder
    async createOrder(userID, exchange, symbol, type, side, amount, price, params = {}) {
        let log = null;
        let data = null;
        let success = null;

        if (!this.users.has(userID)) {
            this.users.set(userID, new Map());
        }

        if (!this.users.get(userID).has(exchange)) {
            await this.loadInstance(userID, exchange);
        }

        if(this.users.get(userID).get(exchange).has['createOrder']) {

            try {
                if(exchange === 'binance') {
                    if (type === 'oco') {
                        data = await this.users.get(userID).get(exchange).privatePostOrderOco({
                            'symbol': symbol.split('/').join(''),
                            'quantity': this.users.get(userID).get(exchange).amountToPrecision(symbol, amount),
                            'side': side,
                            'price': this.users.get(userID).get(exchange).priceToPrecision(symbol, params.tpPrice),
                            'stopPrice': this.users.get(userID).get(exchange).priceToPrecision(symbol, params.stopLossPrice),
                            'stopLimitPrice': this.users.get(userID).get(exchange).priceToPrecision(symbol, params.stopLimitPrice),
                            'stopLimitTimeInForce': 'GTC',
                        });
                    }

                    if (type === 'limit' || type === 'take_profit_limit' || type === 'take_profit') {
                        data = await this.users.get(userID).get(exchange).createOrder(symbol, type, side, amount, price, params);
                    }

                    if (type === 'market') {
                        data = await this.users.get(userID).get(exchange).createOrder(symbol, type, side, amount);
                    }
                } else {
                    data = await this.users.get(userID).get(exchange).createOrder(symbol, type, side, amount, price);
                }

                success = true;
            } catch (e) {
                data = null;
                success = false;
                if (e instanceof ccxt.NetworkError) {
                    log =`Failed due to a network error: ${e.message}`;
                } else if (e instanceof ccxt.ExchangeError) {
                    log =`Failed due to a exchange error: ${e.message}`;
                } else {
                    log =`Failed with: ${e.message}`;
                }
            }
        } else {
            log = `Exchange ${exchange} does not support createOrder`;
            success = false;
        }

        return {
            data,
            success,
            log
        };
    };

    //cancelOrder
    async cancelOrder(userID, exchange, id, symbol){
        let log = null;
        let data = null;
        let success = null;

        if (!this.users.has(userID)) {
            this.users.set(userID, new Map());
        }

        if (!this.users.get(userID).has(exchange)) {
            await this.loadInstance(userID, exchange);
        }

        if(this.users.get(userID).get(exchange).has['cancelOrder']) {
            try {
                data = await this.users.get(userID).get(exchange).cancelOrder(id, symbol);
                success = true;
            } catch (e) {
                data = null;
                success = false;
                if (e instanceof ccxt.NetworkError) {
                    log =`Failed due to a network error: ${e.message}`;
                } else if (e instanceof ccxt.ExchangeError) {
                    log =`Failed due to a exchange error: ${e.message}`;
                } else {
                    log =`Failed with: ${e.message}`;
                }
            }
        } else {
            log = `Exchange ${exchange} does not support cancelOrder`;
            success = false;
        }

        return {
            data,
            success,
            log
        };
    };

    //fetchOrder
    async fetchOrder(userID, exchange, id, symbol){
        let log = null;
        let data = null;
        let success = null;

        if (!this.users.has(userID)) {
            this.users.set(userID, new Map());
        }

        if (!this.users.get(userID).has(exchange)) {
            await this.loadInstance(userID, exchange);
        }

        if(this.users.get(userID).get(exchange).has['fetchOrder']) {
            try {
                data = await this.users.get(userID).get(exchange).fetchOrder(id, symbol);
                success = true;
            } catch (e) {
                data = null;
                success = false;
                if (e instanceof ccxt.NetworkError) {
                    log =`Failed due to a network error: ${e.message}`;
                } else if (e instanceof ccxt.ExchangeError) {
                    log =`Failed due to a exchange error: ${e.message}`;
                } else {
                    log =`Failed with: ${e.message}`;
                }
            }
        } else {
            log = `Exchange ${exchange} does not support fetchOrder`;
            success = false;
        }

        return {
            data,
            success,
            log
        };
    };

    //fetchOrders
    async fetchOrders(userID, exchange, symbol){
        let log = null;
        let data = null;
        let success = null;

        if (!this.users.has(userID)) {
            this.users.set(userID, new Map());
        }

        if (!this.users.get(userID).has(exchange)) {
            await this.loadInstance(userID, exchange);
        }

        if(this.users.get(userID).get(exchange).has['fetchOrders']) {
            try {
                data = await this.users.get(userID).get(exchange).fetchOrders(symbol);
                success = true;
            } catch (e) {
                data = null;
                success = false;
                if (e instanceof ccxt.NetworkError) {
                    log =`Failed due to a network error: ${e.message}`;
                } else if (e instanceof ccxt.ExchangeError) {
                    log =`Failed due to a exchange error: ${e.message}`;
                } else {
                    log =`Failed with: ${e.message}`;
                }
            }
        } else {
            log = `Exchange ${exchange} does not support fetchOrders`;
            success = false;
        }

        return {
            data,
            success,
            log
        };
    };

    async fetchOpenOrders(userID, exchange, symbol){
        let log = null;
        let data = null;
        let success = null;

        if (!this.users.has(userID)) {
            this.users.set(userID, new Map());
        }

        if (!this.users.get(userID).has(exchange)) {
            await this.loadInstance(userID, exchange);
        }

        if(this.users.get(userID).get(exchange).has['fetchOpenOrders']) {
            try {
                data = await this.users.get(userID).get(exchange).fetchOpenOrders(symbol);
                success = true;
            } catch (e) {
                data = null;
                success = false;
                if (e instanceof ccxt.NetworkError) {
                    log =`Failed due to a network error: ${e.message}`;
                } else if (e instanceof ccxt.ExchangeError) {
                    log =`Failed due to a exchange error: ${e.message}`;
                } else {
                    log =`Failed with: ${e.message}`;
                }
            }
        } else {
            log = `Exchange ${exchange} does not support fetchOpenOrders`;
            success = false;
        }

        return {
            data,
            success,
            log
        };
    };

    async fetchClosedOrders(userID, exchange, symbol){
        let log = null;
        let data = null;
        let success = null;

        if (!this.users.has(userID)) {
            this.users.set(userID, new Map());
        }

        if (!this.users.get(userID).has(exchange)) {
            await this.loadInstance(userID, exchange);
        }

        if(this.users.get(userID).get(exchange).has['fetchClosedOrders']) {
            try {
                data = await this.users.get(userID).get(exchange).fetchClosedOrders(symbol);
                success = true;
            } catch (e) {
                data = null;
                success = false;
                if (e instanceof ccxt.NetworkError) {
                    log =`Failed due to a network error: ${e.message}`;
                } else if (e instanceof ccxt.ExchangeError) {
                    log =`Failed due to a exchange error: ${e.message}`;
                } else {
                    log =`Failed with: ${e.message}`;
                }
            }
        } else {
            log = `Exchange ${exchange} does not support fetchClosedOrders`;
            success = false;
        }

        return {
            data,
            success,
            log
        };
    };

    async setLeverage(userID, exchange, leverage, symbol){
        let log = null;
        let success = null;

        if (!this.users.has(userID)) {
            this.users.set(userID, new Map());
        }

        if (!this.users.get(userID).has(exchange)) {
            await this.loadInstance(userID, exchange);
        }

        if(this.users.get(userID).get(exchange).has['setLeverage']) {
            try {
                await this.users.get(userID).get(exchange).setLeverage(leverage, symbol);
                success = true;
            } catch (e) {
                success = false;
                if (e instanceof ccxt.NetworkError) {
                    log =`Failed due to a network error: ${e.message}`;
                } else if (e instanceof ccxt.ExchangeError) {
                    log =`Failed due to a exchange error: ${e.message}`;
                } else {
                    log =`Failed with: ${e.message}`;
                }
            }
        } else {
            log = `Exchange ${exchange} does not support setLeverage`;
            success = false;
        }

        return {
            success,
            log
        };
    };

}

export default defineNitroPlugin((nitroApp) => {
    // console.log('CCXT Wrapper Loaded...')
    nitroApp.ccxtw = new CCXTW();

})
