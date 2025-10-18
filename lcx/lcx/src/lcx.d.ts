import Exchange from './abstract/lcx.js';
import { Int, OrderSide, OrderType } from './base/types.js';
/**
 * @class lcx
 * @extends Exchange
 */
export default class lcx extends Exchange {
    describe(): any;

    fetchMarkets(): any;

    fetchBalance(): any;

    parseBalance(): any;

    fetchOrderBook(): any;

    fetchTickers(): any;

    fetchTicker(): any;

    parseTicker(): any;

    fetchMyTrades(): any;

    fetchTrades(): any;

    parseTrade(): any;

    fetchOHLCV(): any;

    parseOHLCV(): any;

    fetchOpenOrders(): any;

    fetchClosedOrders(): any;

    parseOrderStatus(): any;

    parseOrder(): any;

    createOrder(): any;

    cancelOrder(): any;

    sign(): any;

    handleErrors(): any;
}
