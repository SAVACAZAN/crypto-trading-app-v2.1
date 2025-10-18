import ccxt from 'ccxt'
import {userExchangesSchema} from "~/server/models/userExchanges.schema";
import crypto from 'crypto';

/**
 * LCX Exchange implementation with custom signature authentication
 * Based on Quartz implementation - lcx-simple.ts
 */
class LCXExchange {
    constructor(config = {}) {
        this.id = 'lcx';
        this.apiKey = config.apiKey || '';
        this.secret = config.secret || '';
        this.enableRateLimit = config.enableRateLimit !== false;
        this.baseURL = 'https://exchange-api.lcx.com';
        this.has = {
            fetchBalance: true,
            fetchMarkets: true,
            fetchOpenOrders: true,
            fetchClosedOrders: true
        };
    }

    /**
     * Generate signature for LCX API authentication
     * Official LCX format: method + endpoint + JSON.stringify(payload)
     */
    generateSignature(method, path, payload = {}) {
        const endpoint = '/' + path;
        const requestString = method + endpoint + JSON.stringify(payload);
        const signature = crypto.createHmac('sha256', this.secret).update(requestString).digest('base64');
        return signature;
    }

    /**
     * Load markets (CCXT compatibility)
     */
    async loadMarkets() {
        try {
            const response = await fetch(`${this.baseURL}/market/pairs`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            throw new Error(`Failed to load markets: ${error.message}`);
        }
    }

    /**
     * Parse timeframe string to seconds (CCXT compatibility)
     */
    parseTimeframe(timeframe) {
        const amount = parseInt(timeframe.slice(0, -1));
        const unit = timeframe.slice(-1);
        const units = {
            's': 1,
            'm': 60,
            'h': 60 * 60,
            'd': 60 * 60 * 24,
            'w': 60 * 60 * 24 * 7,
            'M': 60 * 60 * 24 * 30,
            'y': 60 * 60 * 24 * 365
        };
        return amount * (units[unit] || 0);
    }

    /**
     * Fetch balance from LCX
     */
    async fetchBalance() {
        if (!this.apiKey || !this.secret) {
            throw new Error('API credentials required for fetchBalance');
        }

        try {
            const timestamp = Date.now().toString();
            const path = 'api/balances';
            const method = 'GET';
            const payload = {};
            const signature = this.generateSignature(method, path, payload);

            const response = await fetch(`${this.baseURL}/${path}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-key': this.apiKey,
                    'x-access-timestamp': timestamp,
                    'x-access-sign': signature
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            const lcxBalances = data.data || data.balances || [];

            // Convert LCX balance format to CCXT compatible format
            const ccxtBalance = {
                info: data,
                timestamp: Date.now(),
                datetime: new Date().toISOString(),
                free: {},
                used: {},
                total: {}
            };

            // Process LCX balance format
            if (Array.isArray(lcxBalances)) {
                lcxBalances.forEach((item) => {
                    if (item.coin && item.balance) {
                        const currency = item.coin.toUpperCase();
                        const free = parseFloat(item.balance.freeBalance || '0');
                        const used = parseFloat(item.balance.occupiedBalance || '0');
                        const total = parseFloat(item.balance.totalBalance || '0');

                        if (total > 0) {
                            ccxtBalance[currency] = { free, used, total };
                            ccxtBalance.free[currency] = free;
                            ccxtBalance.used[currency] = used;
                            ccxtBalance.total[currency] = total;
                        }
                    }
                });
            }

            return ccxtBalance;
        } catch (error) {
            throw new Error(`Failed to fetch balance: ${error.message}`);
        }
    }
}

class CCXTW {
    constructor(){
        this.users = new Map();
    }

    async loadInstance(userID, exchange, apiKeyName = null) {

        const apiKeys = await this.getApiKeys(userID, exchange, apiKeyName);

        // Use custom implementations for specific exchanges
        let instance;
        if (exchange === 'lcx') {
            instance = new LCXExchange(apiKeys);
        } else if (exchange === 'coinbaseadvanced') {
            // Use v3 API for proper "used" balance (holds) support
            // See: https://github.com/ccxt/ccxt/issues/22878
            instance = new ccxt[exchange]({
                ...apiKeys,
                options: {
                    fetchBalance: 'v3PrivateGetBrokerageAccounts'
                }
            });
        } else {
            instance = new ccxt[exchange](apiKeys);
        }

        await instance.loadMarkets();

        // ProBit requires signIn() to obtain access token (expires after 15 minutes)
        if (exchange === 'probit' && typeof instance.signIn === 'function') {
            try {
                await instance.signIn();
                console.log(`[CCXTW] ProBit signIn() successful for ${apiKeyName || 'default'}`);
            } catch (error) {
                console.error(`[CCXTW] ProBit signIn() failed:`, error.message);
            }
        }

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

        // Create unique key for this exchange + API key combination
        const instanceKey = apiKeyName ? `${exchange}_${apiKeyName}` : exchange;

        // Now you can set the exchange data for the user using the instance key
        this.users.get(userID).set(instanceKey, instance);

        // console.log('loading instance: ', userID, exchange, apiKeyName);
    }

    async getApiKeys(userID, exchange, apiKeyName = null) {
        let returnObj = {};  // Changed from [] to {} - must be an object, not array!
        const userExchanges = await userExchangesSchema.findOne({userID, exchange});

        if (userExchanges) {
            let apiKeysArray = userExchanges.apiKeys;
            let keysToUse = [];

            if (apiKeysArray && apiKeysArray.length > 0) {
                // Check if we have the new format with named keys (objects with .name and .keys properties)
                const namedEntries = apiKeysArray.filter(k => k.name !== undefined && k.keys !== undefined);

                if (namedEntries.length > 0) {
                    // New format: array of { name: 'Alex', keys: [{key, value}, ...] }
                    if (apiKeyName) {
                        // Find specific named key
                        const namedKey = namedEntries.find(k => k.name === apiKeyName);
                        if (namedKey && namedKey.keys) {
                            keysToUse = namedKey.keys;
                        } else {
                            // Fallback to first named key if requested key not found
                            keysToUse = namedEntries[0].keys;
                        }
                    } else {
                        // No specific key requested, use first one
                        keysToUse = namedEntries[0].keys;
                    }
                } else {
                    // Old format: flat array of {key: 'apiKey', value: '...'}
                    keysToUse = apiKeysArray;
                }
            }

            // Convert keysToUse array to object format
            for (let i = 0; i < keysToUse.length; i++) {
                if (keysToUse[i].key && keysToUse[i].value !== undefined) {
                    returnObj[keysToUse[i].key] = keysToUse[i].value;
                }
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

    async fetchBalance(userID, exchange, apiKeyName = null) {
        let log = null;
        let data = null;
        let success = null;

        if (!this.users.has(userID)) {
            this.users.set(userID, new Map());
        }

        // Create unique instance key
        const instanceKey = apiKeyName ? `${exchange}_${apiKeyName}` : exchange;

        if (!this.users.get(userID).has(instanceKey)) {
            await this.loadInstance(userID, exchange, apiKeyName);
        }

        if (this.users.get(userID).get(instanceKey).has['fetchBalance']) {
            try {
                data = await this.users.get(userID).get(instanceKey).fetchBalance();
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
