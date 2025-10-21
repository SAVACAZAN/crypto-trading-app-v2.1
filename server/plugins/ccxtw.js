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
            fetchClosedOrders: true,
            fetchMyTrades: true,
            createOrder: true,
            cancelOrder: true,
            fetchOrder: true,
            fetchOrderBook: true,
            fetchTicker: true,
            fetchOHLCV: true
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

    /**
     * CCXT-compatible milliseconds method
     */
    milliseconds() {
        return Date.now();
    }

    /**
     * CCXT-compatible parseTimeframe method
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
     * Create order on LCX exchange
     * @param {string} symbol - Trading pair (e.g., 'LCX/USDC')
     * @param {string} type - Order type ('limit' or 'market')
     * @param {string} side - Order side ('buy' or 'sell')
     * @param {number} amount - Amount to trade
     * @param {number} price - Price (optional for market orders)
     * @param {object} params - Additional parameters
     */
    async createOrder(symbol, type, side, amount, price = undefined, params = {}) {
        if (!this.apiKey || !this.secret) {
            throw new Error('API credentials required for createOrder');
        }

        try {
            const timestamp = Date.now().toString();
            const path = 'api/create'; // LCX correct endpoint
            const method = 'POST';

            // LCX uses "Pair" with capital P and keeps the "/" format
            const payload = {
                Pair: symbol,                       // LCX/USDC format
                Side: side.toUpperCase(),           // BUY or SELL
                OrderType: type.toUpperCase(),      // LIMIT or MARKET
                Amount: parseFloat(amount)          // Float, not string
            };

            // Add price for limit orders
            if (type.toLowerCase() === 'limit' && price !== undefined) {
                payload.Price = parseFloat(price);  // Float, not string
            }

            const signature = this.generateSignature(method, path, payload);

            const response = await fetch(`${this.baseURL}/${path}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-key': this.apiKey,
                    'x-access-timestamp': timestamp,
                    'x-access-sign': signature
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            // Convert LCX response to CCXT format
            return {
                id: data.data?.orderId || data.data?.id,
                clientOrderId: data.data?.clientOrderId,
                timestamp: Date.now(),
                datetime: new Date().toISOString(),
                symbol: symbol,
                type: type,
                side: side,
                price: price,
                amount: amount,
                status: 'open',
                info: data
            };
        } catch (error) {
            throw new Error(`Failed to create order: ${error.message}`);
        }
    }

    /**
     * Cancel order on LCX exchange
     */
    async cancelOrder(id, symbol = undefined) {
        if (!this.apiKey || !this.secret) {
            throw new Error('API credentials required for cancelOrder');
        }

        try {
            const timestamp = Date.now().toString();
            const path = 'api/order';
            const method = 'DELETE';

            const payload = {
                orderId: id
            };

            if (symbol) {
                const lcxSymbol = symbol.toLowerCase().replace('/', '_');
                payload.symbol = lcxSymbol;
            }

            const signature = this.generateSignature(method, path, payload);

            const response = await fetch(`${this.baseURL}/${path}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-key': this.apiKey,
                    'x-access-timestamp': timestamp,
                    'x-access-sign': signature
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error(`Failed to cancel order: ${error.message}`);
        }
    }

    /**
     * Fetch specific order from LCX exchange
     */
    async fetchOrder(id, symbol = undefined) {
        if (!this.apiKey || !this.secret) {
            throw new Error('API credentials required for fetchOrder');
        }

        try {
            const timestamp = Date.now().toString();
            const path = `api/order/${id}`;
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
            return data.data;
        } catch (error) {
            throw new Error(`Failed to fetch order: ${error.message}`);
        }
    }

    /**
     * Fetch order book from LCX exchange
     */
    async fetchOrderBook(symbol, limit = undefined) {
        try {
            // LCX uses POST request for order book with pair parameter
            const payload = {
                pair: symbol
            };

            const response = await fetch(`${this.baseURL}/order/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            const orderBookData = data.data || data;

            // Convert to CCXT format
            return {
                symbol: symbol,
                bids: orderBookData.buy || orderBookData.bids || [],
                asks: orderBookData.sell || orderBookData.asks || [],
                timestamp: Date.now(),
                datetime: new Date().toISOString(),
                nonce: undefined
            };
        } catch (error) {
            throw new Error(`Failed to fetch order book: ${error.message}`);
        }
    }

    /**
     * Fetch ticker from LCX exchange
     */
    async fetchTicker(symbol) {
        try {
            // LCX uses POST request for single ticker with pair parameter
            const payload = {
                pair: symbol
            };

            const response = await fetch(`${this.baseURL}/market/ticker`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            const ticker = data.data || data;

            // Convert to CCXT format
            return {
                symbol: symbol,
                timestamp: Date.now(),
                datetime: new Date().toISOString(),
                high: parseFloat(ticker.high || ticker.highPrice || 0),
                low: parseFloat(ticker.low || ticker.lowPrice || 0),
                bid: parseFloat(ticker.bid || ticker.bestBid || 0),
                bidVolume: undefined,
                ask: parseFloat(ticker.ask || ticker.bestAsk || 0),
                askVolume: undefined,
                vwap: undefined,
                open: parseFloat(ticker.open || 0),
                close: parseFloat(ticker.last || ticker.lastPrice || ticker.close || 0),
                last: parseFloat(ticker.last || ticker.lastPrice || ticker.close || 0),
                previousClose: undefined,
                change: parseFloat(ticker.change || ticker.priceChange || 0),
                percentage: parseFloat(ticker.changePercent || ticker.priceChangePercent || 0),
                average: undefined,
                baseVolume: parseFloat(ticker.volume || ticker.baseVolume || 0),
                quoteVolume: parseFloat(ticker.quoteVolume || ticker.usdVolume || 0),
                info: ticker
            };
        } catch (error) {
            throw new Error(`Failed to fetch ticker: ${error.message}`);
        }
    }

    /**
     * Fetch closed orders from LCX exchange
     * Based on Quartz implementation - uses api/orderHistory endpoint
     */
    async fetchClosedOrders(symbol = undefined, since = undefined, limit = undefined) {
        if (!this.apiKey || !this.secret) {
            throw new Error('API credentials required for fetchClosedOrders');
        }

        try {
            const timestamp = Date.now().toString();
            // IMPORTANT: LCX signature uses 'api/orderHistory' but some docs might say 'orderHistory'
            // Based on Quartz lcx.js implementation (line 291, 424-425)
            const path = 'api/orderHistory';
            const method = 'POST';

            // Build payload - offset is required parameter
            const payload = {
                offset: 1 // Page index, first page = 1, fixed page size = 100
            };

            // Add optional parameters if provided
            if (symbol) {
                payload.pair = symbol; // Optional: Name of the trading pair
            }

            // Handle date range parameters
            // Check if 'since' is a very old timestamp (before year 2000) - treat as null
            const year2000Timestamp = 946684800000; // Jan 1, 2000 in milliseconds
            const isOldTimestamp = since && since < year2000Timestamp;

            if (since !== undefined && since !== null && !isOldTimestamp) {
                // If since is a valid recent timestamp, use it
                payload.fromDate = new Date(since).toISOString();
                payload.toDate = new Date().toISOString();
                console.log('[LCX] 📅 Using provided date range:', {
                    fromDate: payload.fromDate,
                    toDate: payload.toDate,
                    sinceMs: since
                });
            } else {
                // For FULL HISTORICAL SYNC or old/invalid timestamps
                // Fetch orders from last 3 months to ensure we get all recent orders
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                payload.fromDate = threeMonthsAgo.toISOString();
                payload.toDate = new Date().toISOString();

                if (isOldTimestamp) {
                    console.log('[LCX] ⚠️ Detected very old timestamp (', since, '), using default 3-month range instead');
                } else {
                    console.log('[LCX] 📅 Using default date range for historical sync');
                }

                console.log('[LCX] 📅 Date range:', {
                    fromDate: payload.fromDate,
                    toDate: payload.toDate
                });
            }

            const signature = this.generateSignature(method, path, payload);

            console.log('[LCX] 📊 fetchClosedOrders request:', {
                url: `${this.baseURL}/${path}`,
                method,
                payload,
                signatureInput: `${method}/${path}${JSON.stringify(payload)}`,
                headers: {
                    'x-access-key': this.apiKey?.substring(0, 8) + '...',
                    'x-access-timestamp': timestamp,
                    'x-access-sign': signature?.substring(0, 16) + '...'
                }
            });

            const response = await fetch(`${this.baseURL}/${path}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-key': this.apiKey,
                    'x-access-timestamp': timestamp,
                    'x-access-sign': signature
                },
                body: JSON.stringify(payload)
            });

            console.log('[LCX] 📊 fetchClosedOrders response:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('[LCX] ❌ fetchClosedOrders error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            const orders = data.data || data.orders || [];

            // Log response for debugging
            if (orders.length === 0) {
                console.log('[LCX] ⚠️ No orders returned from API. Response data:', data);
            } else {
                console.log('[LCX] ✅ Received', orders.length, 'orders from API');
                // Log first order to see structure
                if (orders[0]) {
                    console.log('[LCX] 📋 First order structure:', JSON.stringify(orders[0], null, 2));
                }
            }

            // Convert LCX orders to CCXT format (based on Quartz parseOrder)
            const ccxtOrders = orders.map(order => ({
                id: order.Id || order.orderId || order.id,
                clientOrderId: order.clientOrderId,
                timestamp: order.UpdatedAt ? new Date(order.UpdatedAt).getTime() : (order.CreatedAt ? new Date(order.CreatedAt).getTime() : Date.now()),
                datetime: order.UpdatedAt ? new Date(order.UpdatedAt).toISOString() : (order.CreatedAt ? new Date(order.CreatedAt).toISOString() : new Date().toISOString()),
                symbol: order.Pair || order.symbol,
                type: (order.OrderType || order.type || '').toLowerCase(),
                side: (order.Side || order.side || '').toLowerCase(),
                price: parseFloat(order.Price || order.price || 0),
                amount: parseFloat(order.Amount || order.amount || 0),
                filled: parseFloat(order.Filled || order.FilledAmount || order.filled || 0),
                remaining: parseFloat(order.RemainingAmount || order.remaining || ((order.Amount || 0) - (order.Filled || order.FilledAmount || 0)) || 0),
                cost: parseFloat(order.Cost || order.cost || 0),
                average: parseFloat(order.AveragePrice || order.average || 0),
                fee: {
                    cost: parseFloat(order.Fee || order.fee || 0),
                    currency: order.FeeCurrency || order.feeCurrency || 'USDC',
                    rate: parseFloat(order.FeeRate || order.feeRate || 0)
                },
                status: 'closed', // All orderHistory orders are closed/filled
                info: order
            }));

            // For LCX, if no status field, assume all orderHistory orders are closed
            // (don't filter by status since LCX might not return a Status field)
            if (ccxtOrders.length === 0) {
                console.log('[LCX] ℹ️ Returning all orders without status filtering');
                return ccxtOrders;
            }

            // Only filter if we have status field
            const hasStatusField = ccxtOrders.some(o => o.info.Status || o.info.status);
            if (hasStatusField) {
                const closedOrders = ccxtOrders.filter(o => {
                    const status = (o.info.Status || o.info.status || '').toLowerCase();
                    return status === 'filled' || status === 'closed' || status === 'completed' || status === '';
                });
                console.log('[LCX] 📊 After status filtering:', closedOrders.length, 'orders (from', ccxtOrders.length, ')');
                return closedOrders;
            } else {
                // No status field, return all orders from orderHistory endpoint (they should all be closed)
                console.log('[LCX] ℹ️ No status field found, returning all', ccxtOrders.length, 'orders as closed');
                return ccxtOrders;
            }
        } catch (error) {
            throw new Error(`Failed to fetch closed orders: ${error.message}`);
        }
    }

    /**
     * Fetch user trades (order history) from LCX exchange
     * This is an alias for fetchClosedOrders as LCX API returns similar data
     */
    async fetchMyTrades(symbol = undefined, since = undefined, limit = undefined) {
        // LCX uses the same orderHistory endpoint for both orders and trades
        // We can reuse fetchClosedOrders logic
        return this.fetchClosedOrders(symbol, since, limit);
    }

    /**
     * Fetch OHLCV candles from LCX exchange
     */
    async fetchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined) {
        try {
            // LCX timeframe mapping
            const timeframeMap = {
                '1m': '1',
                '3m': '3',
                '5m': '5',
                '15m': '15',
                '30m': '30',
                '45m': '45',
                '1h': '60',
                '2h': '120',
                '3h': '180',
                '4h': '240',
                '1d': '1D',
                '1w': '1W',
                '1M': '1M'
            };

            const resolution = timeframeMap[timeframe] || timeframe;

            // Calculate time range
            let fromTime = since;
            if (!fromTime) {
                // Default to 24 hours ago
                fromTime = Date.now() - 86400000;
            }

            let toTime;
            if (limit && fromTime) {
                const duration = this.parseTimeframe(timeframe);
                toTime = fromTime + (limit * duration * 1000) - 1;
                toTime = Math.min(toTime, Date.now());
            } else {
                toTime = Date.now();
            }

            // Convert to seconds for LCX API
            const payload = {
                pair: symbol,
                resolution: resolution,
                from: Math.floor(fromTime / 1000),
                to: Math.floor(toTime / 1000)
            };

            // LCX uses POST request for kline data
            const response = await fetch(`${this.baseURL}/market/kline`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            const candles = data.data || data;

            // Convert to CCXT format: [[timestamp, open, high, low, close, volume], ...]
            if (Array.isArray(candles)) {
                return candles.map(candle => [
                    candle.timestamp || candle.time || candle.t || candle[0],
                    parseFloat(candle.open || candle.o || candle[1] || 0),
                    parseFloat(candle.high || candle.h || candle[2] || 0),
                    parseFloat(candle.low || candle.l || candle[3] || 0),
                    parseFloat(candle.close || candle.c || candle[4] || 0),
                    parseFloat(candle.volume || candle.v || candle[5] || 0)
                ]);
            }

            return [];
        } catch (error) {
            throw new Error(`Failed to fetch OHLCV: ${error.message}`);
        }
    }
}

class CCXTW {
    constructor(){
        this.users = new Map();
    }

    async loadInstance(userID, exchange, apiKeyName = null) {

        const apiKeys = await this.getApiKeys(userID, exchange, apiKeyName);

        // Check if API keys are invalid/inactive
        if (apiKeys === false) {
            throw new Error(`No API keys found for ${exchange} - ${apiKeyName || 'default'}`);
        }

        if (apiKeys.isActive === false) {
            throw new Error(`API key is inactive for ${exchange} - ${apiKeyName || 'default'}. Please check your credentials.`);
        }

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

        try {
            await instance.loadMarkets();
        } catch (error) {
            // Check if it's an authentication error (401 Unauthorized)
            if (error.message && (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('Authentication'))) {
                console.error(`[CCXTW] ❌ Authentication failed for ${exchange} - ${apiKeyName || 'default'}. Marking as inactive.`);

                // Mark the API key as inactive in database
                await this.markApiKeyAsInactive(userID, exchange, apiKeyName);

                throw new Error(`Invalid credentials for ${exchange}. API key marked as inactive.`);
            }
            throw error;
        }

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
            let selectedKeyEntry = null;

            if (apiKeysArray && apiKeysArray.length > 0) {
                // Check if we have the new format with named keys (objects with .name and .keys properties)
                const namedEntries = apiKeysArray.filter(k => k.name !== undefined && k.keys !== undefined);

                if (namedEntries.length > 0) {
                    // New format: array of { name: 'Alex', keys: [{key, value}, ...], isActive: true }
                    if (apiKeyName) {
                        // Find specific named key
                        const namedKey = namedEntries.find(k => k.name === apiKeyName);
                        if (namedKey && namedKey.keys) {
                            keysToUse = namedKey.keys;
                            selectedKeyEntry = namedKey;
                        } else {
                            // Fallback to first named key if requested key not found
                            keysToUse = namedEntries[0].keys;
                            selectedKeyEntry = namedEntries[0];
                        }
                    } else {
                        // No specific key requested, use first one
                        keysToUse = namedEntries[0].keys;
                        selectedKeyEntry = namedEntries[0];
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

            // Check if the API key is marked as inactive
            if (selectedKeyEntry && selectedKeyEntry.isActive === false) {
                returnObj.isActive = false;
            }

            return returnObj;
        } else {
            return false;
        }
    }

    async markApiKeyAsInactive(userID, exchange, apiKeyName = null) {
        try {
            const userExchanges = await userExchangesSchema.findOne({userID, exchange});

            if (!userExchanges) {
                console.error(`[CCXTW] Cannot mark inactive: No exchange found for ${userID} - ${exchange}`);
                return false;
            }

            let apiKeysArray = userExchanges.apiKeys;
            if (!apiKeysArray || apiKeysArray.length === 0) {
                return false;
            }

            // Check if we have the new format with named keys
            const namedEntries = apiKeysArray.filter(k => k.name !== undefined && k.keys !== undefined);

            if (namedEntries.length > 0) {
                // New format: find and mark the specific key as inactive
                const keyIndex = apiKeysArray.findIndex(k => k.name === (apiKeyName || 'default'));
                if (keyIndex !== -1) {
                    apiKeysArray[keyIndex].isActive = false;
                    apiKeysArray[keyIndex].lastError = {
                        message: '401 Unauthorized - Invalid credentials',
                        timestamp: new Date()
                    };

                    await userExchangesSchema.updateOne(
                        {userID, exchange},
                        {$set: {apiKeys: apiKeysArray}}
                    );

                    console.log(`[CCXTW] ✅ Marked API key as inactive: ${exchange} - ${apiKeyName || 'default'}`);
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error(`[CCXTW] Error marking API key as inactive:`, error.message);
            return false;
        }
    }

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

        // console.log(`[CCXTW] 📖 fetchOrderBook called: exchange=${exchange}, symbol=${symbol}`);

        if (!this.users.has(userID)) {
            this.users.set(userID, new Map());
        }

        if (!this.users.get(userID).has(exchange)) {
            console.log(`[CCXTW] Loading instance for ${exchange}...`);
            await this.loadInstance(userID, exchange);
        }

        if (this.users.get(userID).get(exchange).has['fetchOrderBook']) {
            try {
                console.log(`[CCXTW] Calling fetchOrderBook on ${exchange} for ${symbol}...`);
                data = await this.users.get(userID).get(exchange).fetchOrderBook(symbol);

                // console.log(`[CCXTW] ✅ OrderBook fetched successfully:`, {
                //     symbol: data?.symbol,
                //     bidsCount: data?.bids?.length || 0,
                //     asksCount: data?.asks?.length || 0,
                //     bestBid: data?.bids?.[0]?.[0],
                //     bestAsk: data?.asks?.[0]?.[0]
                // });

                success = true;
            } catch (e) {
                data = null;
                success = false;
                console.error(`[CCXTW] ❌ OrderBook fetch failed for ${symbol} on ${exchange}:`, e.message);

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
            console.error(`[CCXTW] ❌ ${log}`);
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
    async createOrder(userID, exchange, symbol, type, side, amount, price, params = {}, apiKeyName = null) {
        let log = null;
        let data = null;
        let success = null;

        if (!this.users.has(userID)) {
            this.users.set(userID, new Map());
        }

        // Create unique instance key using apiKeyName
        const instanceKey = apiKeyName ? `${exchange}_${apiKeyName}` : exchange;

        // DEBUG: Log which instance key is being used
        console.log(`[CCXTW createOrder] Using instanceKey: "${instanceKey}" for ${side} ${symbol}`);

        if (!this.users.get(userID).has(instanceKey)) {
            await this.loadInstance(userID, exchange, apiKeyName);
        }

        if(this.users.get(userID).get(instanceKey).has['createOrder']) {

            try {
                if(exchange === 'binance') {
                    if (type === 'oco') {
                        data = await this.users.get(userID).get(instanceKey).privatePostOrderOco({
                            'symbol': symbol.split('/').join(''),
                            'quantity': this.users.get(userID).get(instanceKey).amountToPrecision(symbol, amount),
                            'side': side,
                            'price': this.users.get(userID).get(instanceKey).priceToPrecision(symbol, params.tpPrice),
                            'stopPrice': this.users.get(userID).get(instanceKey).priceToPrecision(symbol, params.stopLossPrice),
                            'stopLimitPrice': this.users.get(userID).get(instanceKey).priceToPrecision(symbol, params.stopLimitPrice),
                            'stopLimitTimeInForce': 'GTC',
                        });
                    }

                    if (type === 'limit' || type === 'take_profit_limit' || type === 'take_profit') {
                        data = await this.users.get(userID).get(instanceKey).createOrder(symbol, type, side, amount, price, params);
                    }

                    if (type === 'market') {
                        data = await this.users.get(userID).get(instanceKey).createOrder(symbol, type, side, amount);
                    }
                } else {
                    // FIX: Use instanceKey instead of exchange to ensure correct API key is used
                    data = await this.users.get(userID).get(instanceKey).createOrder(symbol, type, side, amount, price);
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

    async fetchOpenOrders(userID, exchange, symbol, apiKeyName = null){
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

        if(this.users.get(userID).get(instanceKey).has['fetchOpenOrders']) {
            try {
                data = await this.users.get(userID).get(instanceKey).fetchOpenOrders(symbol);
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

    async fetchClosedOrders(userID, exchange, symbol, apiKeyName = null, since = undefined, limit = undefined, params = {}){
        let log = null;
        let data = null;
        let success = null;
        let info = null; // Store pagination info (cursor, etc.)

        if (!this.users.has(userID)) {
            this.users.set(userID, new Map());
        }

        // Create unique instance key
        const instanceKey = apiKeyName ? `${exchange}_${apiKeyName}` : exchange;

        if (!this.users.get(userID).has(instanceKey)) {
            await this.loadInstance(userID, exchange, apiKeyName);
        }

        if(this.users.get(userID).get(instanceKey).has['fetchClosedOrders']) {
            try {
                // Pass limit, since, and params (for cursor pagination) to CCXT
                const rawResponse = await this.users.get(userID).get(instanceKey).fetchClosedOrders(symbol, since, limit, params);

                // CCXT returns array of orders
                data = rawResponse;

                // Extract cursor from Coinbase Advanced response
                // Coinbase stores pagination info in the "last_json_response" or order metadata
                const instance = this.users.get(userID).get(instanceKey);

                if (exchange === 'coinbaseadvanced') {
                    console.log('[CCXT] 🔍 Coinbase cursor extraction - checking instance properties...');

                    // Try to get cursor from last HTTP response
                    // CCXT Coinbase stores the full JSON response in last_json_response or last_response_headers
                    if (instance.last_json_response) {
                        console.log('[CCXT] ✓ Found last_json_response');
                        const lastResponse = instance.last_json_response;

                        if (lastResponse.cursor) {
                            info = { cursor: lastResponse.cursor, has_next: lastResponse.has_next };
                            console.log(`[CCXT] ✓ Extracted cursor from last_json_response: ${lastResponse.cursor.substring(0, 20)}...`);
                        } else if (lastResponse.pagination?.next_cursor) {
                            info = { cursor: lastResponse.pagination.next_cursor, has_next: true };
                            console.log(`[CCXT] ✓ Extracted cursor from pagination.next_cursor: ${lastResponse.pagination.next_cursor.substring(0, 20)}...`);
                        } else {
                            console.log('[CCXT] ⚠️ last_json_response exists but no cursor found:', Object.keys(lastResponse));
                        }
                    } else {
                        console.log('[CCXT] ⚠️ No last_json_response on instance');
                    }

                    // Fallback: Check if cursor is in the orders metadata (each order has .info with raw response)
                    if (!info && data && data.length > 0) {
                        const lastOrder = data[data.length - 1];
                        if (lastOrder.info) {
                            console.log('[CCXT] 🔍 Checking last order.info for cursor...');
                            if (lastOrder.info.cursor) {
                                info = { cursor: lastOrder.info.cursor };
                                console.log(`[CCXT] ✓ Extracted cursor from order.info: ${lastOrder.info.cursor.substring(0, 20)}...`);
                            }
                        }
                    }

                    if (!info) {
                        console.log('[CCXT] ❌ No cursor found! Pagination will stop after this page.');
                    }
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
            log = `Exchange ${exchange} does not support fetchClosedOrders`;
            success = false;
        }

        return {
            data,
            success,
            log,
            info  // Include pagination info (cursor) if available
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
