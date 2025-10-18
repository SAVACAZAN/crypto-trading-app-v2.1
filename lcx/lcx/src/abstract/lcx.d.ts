import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetIdAll(params?: {}): Promise<implicitReturnType>;
    publicGetMarketPairs(params?: {}): Promise<implicitReturnType>;
    privateGetBalances(params?: {}): Promise<implicitReturnType>;
    publicPostOrderBook(params?: {}): Promise<implicitReturnType>;
    publicGetMarketTickers(params?: {}): Promise<implicitReturnType>;
    publicPostMarketTicker(params?: {}): Promise<implicitReturnType>;
    privatePostOrderHistory(params?: {}): Promise<implicitReturnType>;
    publicPostTradeRecent(params?: {}): Promise<implicitReturnType>;
    publicPostMarketKline(params?: {}): Promise<implicitReturnType>;
    privatePostOpen(params?: {}): Promise<implicitReturnType>;
    privatePostCreate(params?: {}): Promise<implicitReturnType>;
    privatePostCancel(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
