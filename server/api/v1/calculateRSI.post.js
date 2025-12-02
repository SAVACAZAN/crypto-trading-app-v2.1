import ccxt from 'ccxt';
import { RSI } from 'technicalindicators';

export default defineEventHandler(async (event) => {
    console.log('[API calculateRSI] Request received');

    try {
        const body = await readBody(event);
        const { userID, exchange, symbol, timeframe, period } = body;

        if (!exchange || !symbol || !timeframe || !period) {
            return {
                success: false,
                message: 'Missing required fields: exchange, symbol, timeframe, period'
            };
        }

        // Initialize exchange
        let exchangeInstance;
        if (exchange === 'coinbaseadvanced') {
            exchangeInstance = new ccxt.coinbaseadvanced();
        } else if (exchange === 'lcx') {
            exchangeInstance = new ccxt.lcx();
        } else if (exchange === 'kraken') {
            exchangeInstance = new ccxt.kraken();
        } else {
            exchangeInstance = new ccxt[exchange]();
        }

        // Fetch OHLCV data
        const limit = period + 50; // Get extra candles for accuracy
        const candles = await exchangeInstance.fetchOHLCV(symbol, timeframe, undefined, limit);

        if (!candles || candles.length < period) {
            return {
                success: false,
                message: 'Not enough candle data to calculate RSI'
            };
        }

        // Extract closing prices
        const closePrices = candles.map(candle => candle[4]); // [time, open, high, low, close, volume]

        // Calculate RSI
        const rsiValues = RSI.calculate({
            values: closePrices,
            period: parseInt(period)
        });

        if (!rsiValues || rsiValues.length === 0) {
            return {
                success: false,
                message: 'Could not calculate RSI'
            };
        }

        // Get the latest RSI value
        const currentRSI = rsiValues[rsiValues.length - 1];

        console.log('[API calculateRSI] RSI calculated:', currentRSI);

        return {
            success: true,
            data: {
                rsi: currentRSI,
                timestamp: Date.now(),
                timeframe,
                period,
                symbol
            }
        };

    } catch (error) {
        console.error('[API calculateRSI] Error:', error);
        return {
            success: false,
            message: 'Error calculating RSI: ' + error.message
        };
    }
});
