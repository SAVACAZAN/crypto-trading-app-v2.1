import ccxt from 'ccxt';
import { MACD } from 'technicalindicators';

export default defineEventHandler(async (event) => {
    console.log('[API calculateMACD] Request received');

    try {
        const body = await readBody(event);
        const { userID, exchange, symbol, timeframe, fast, slow, signal } = body;

        if (!exchange || !symbol || !timeframe || !fast || !slow || !signal) {
            return {
                success: false,
                message: 'Missing required fields: exchange, symbol, timeframe, fast, slow, signal'
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
        const limit = parseInt(slow) + parseInt(signal) + 50; // Get extra candles for accuracy
        const candles = await exchangeInstance.fetchOHLCV(symbol, timeframe, undefined, limit);

        if (!candles || candles.length < limit) {
            return {
                success: false,
                message: 'Not enough candle data to calculate MACD'
            };
        }

        // Extract closing prices
        const closePrices = candles.map(candle => candle[4]); // [time, open, high, low, close, volume]

        // Calculate MACD
        const macdValues = MACD.calculate({
            values: closePrices,
            fastPeriod: parseInt(fast),
            slowPeriod: parseInt(slow),
            signalPeriod: parseInt(signal),
            SimpleMAOscillator: false,
            SimpleMASignal: false
        });

        if (!macdValues || macdValues.length === 0) {
            return {
                success: false,
                message: 'Could not calculate MACD'
            };
        }

        // Get the latest MACD values
        const currentMACD = macdValues[macdValues.length - 1];

        console.log('[API calculateMACD] MACD calculated:', currentMACD);

        return {
            success: true,
            data: {
                macd: currentMACD.MACD,
                signal: currentMACD.signal,
                histogram: currentMACD.histogram,
                timestamp: Date.now(),
                timeframe,
                symbol
            }
        };

    } catch (error) {
        console.error('[API calculateMACD] Error:', error);
        return {
            success: false,
            message: 'Error calculating MACD: ' + error.message
        };
    }
});
