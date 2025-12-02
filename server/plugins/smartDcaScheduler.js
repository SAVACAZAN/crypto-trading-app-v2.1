import { smartDcaBotSchema } from "~/server/models/smartDcaBot.schema";
import { userExchangesSchema } from "~/server/models/userExchanges.schema";
import ccxt from 'ccxt';
import { RSI, MACD } from 'technicalindicators';

// Helper function to convert interval to milliseconds
function intervalToMs(interval) {
    const units = {
        'm': 60 * 1000,
        'h': 60 * 60 * 1000,
        'd': 24 * 60 * 60 * 1000,
        'w': 7 * 24 * 60 * 60 * 1000,
        'M': 30 * 24 * 60 * 60 * 1000
    };

    const match = interval.match(/^(\d+)([mhdwM])$/);
    if (!match) return 60000; // default to 1 minute

    const value = parseInt(match[1]);
    const unit = match[2];

    return value * (units[unit] || 60000);
}

// Calculate RSI
async function calculateRSI(exchange, symbol, timeframe, period) {
    try {
        const limit = period + 50;
        const candles = await exchange.fetchOHLCV(symbol, timeframe, undefined, limit);

        if (!candles || candles.length < period) {
            return null;
        }

        const closePrices = candles.map(candle => candle[4]);
        const rsiValues = RSI.calculate({
            values: closePrices,
            period: parseInt(period)
        });

        return rsiValues && rsiValues.length > 0 ? rsiValues[rsiValues.length - 1] : null;
    } catch (error) {
        console.error('[SmartDCA] Error calculating RSI:', error.message);
        return null;
    }
}

// Calculate MACD
async function calculateMACD(exchange, symbol, timeframe, fast, slow, signal) {
    try {
        const limit = slow + signal + 50;
        const candles = await exchange.fetchOHLCV(symbol, timeframe, undefined, limit);

        if (!candles || candles.length < limit) {
            return null;
        }

        const closePrices = candles.map(candle => candle[4]);
        const macdValues = MACD.calculate({
            values: closePrices,
            fastPeriod: parseInt(fast),
            slowPeriod: parseInt(slow),
            signalPeriod: parseInt(signal),
            SimpleMAOscillator: false,
            SimpleMASignal: false
        });

        return macdValues && macdValues.length > 0 ? macdValues[macdValues.length - 1] : null;
    } catch (error) {
        console.error('[SmartDCA] Error calculating MACD:', error.message);
        return null;
    }
}

// Execute DCA trade
async function executeDCATrade(bot, userExchange) {
    try {
        console.log(`[SmartDCA] 📊 Executing trade for bot: ${bot.name}`);
        console.log(`[SmartDCA] Bot details - Side: ${bot.side}, Symbol: ${bot.symbol}, Amount: ${bot.amountPerInterval}`);

        // Initialize exchange with API keys
        let exchange;
        const apiKeyName = bot.apiKeyNames && bot.apiKeyNames.length > 0 ? bot.apiKeyNames[0] : null;

        if (!apiKeyName) {
            console.error(`[SmartDCA] ❌ No API key configured for bot ${bot.name}`);
            throw new Error('No API key configured for bot');
        }

        console.log(`[SmartDCA] Looking for API key: ${apiKeyName} on exchange: ${bot.exchange}`);
        console.log(`[SmartDCA] Available API keys:`, userExchange.apiKeys.map(k => k.name));

        // Find API key in userExchanges
        // apiKeys structure: [{ name: "Main Account", keys: [{key: "apiKey", value: "..."}, {key: "secret", value: "..."}] }]
        const apiKeyObj = userExchange.apiKeys?.find(k => k.name === apiKeyName);
        console.log(`[SmartDCA] API key object found:`, apiKeyObj ? 'Yes' : 'No');

        if (!apiKeyObj) {
            console.error(`[SmartDCA] ❌ API key ${apiKeyName} not found for exchange ${bot.exchange}`);
            throw new Error(`API key ${apiKeyName} not found`);
        }

        // Extract apiKey and secret from keys array
        const apiKeyValue = apiKeyObj.keys.find(k => k.key === 'apiKey')?.value;
        const secretValue = apiKeyObj.keys.find(k => k.key === 'secret')?.value;

        if (!apiKeyValue || !secretValue) {
            console.error(`[SmartDCA] ❌ API key or secret missing for ${apiKeyName}`);
            throw new Error('API key or secret missing');
        }

        console.log(`[SmartDCA] ✅ API key retrieved successfully`);

        // Initialize exchange instance
        if (bot.exchange === 'coinbaseadvanced') {
            exchange = new ccxt.coinbaseadvanced({
                apiKey: apiKeyValue,
                secret: secretValue
            });
        } else if (bot.exchange === 'lcx') {
            exchange = new ccxt.lcx({
                apiKey: apiKeyValue,
                secret: secretValue
            });
        } else {
            exchange = new ccxt[bot.exchange]({
                apiKey: apiKeyValue,
                secret: secretValue
            });
        }

        console.log(`[SmartDCA] ✅ Exchange instance created for ${bot.exchange}`);

        // Fetch current price
        const ticker = await exchange.fetchTicker(bot.symbol);
        const currentPrice = ticker.last;

        // Calculate indicators for ALL timeframes
        const timeframes = ['1m', '5m', '15m', '30m', '1h', '2h', '6h', '1d'];
        const allRSI = {};
        const allMACD = {};
        let currentRSI = null;  // For bot's configured timeframe
        let currentMACD = null; // For bot's configured timeframe
        let conditionsMet = true;

        // Fetch RSI for all timeframes (ALWAYS calculate, even if not enabled for conditions)
        for (const tf of timeframes) {
            try {
                const rsiValue = await calculateRSI(exchange, bot.symbol, tf, bot.rsiPeriod || 14);
                if (rsiValue !== null) {
                    allRSI[tf] = rsiValue;

                    // Save RSI to history for this timeframe
                    bot.rsiHistory.push({
                        timestamp: new Date(),
                        timeframe: tf,
                        value: rsiValue
                    });

                    // Set current RSI for bot's configured timeframe
                    if (bot.enableRSI && tf === bot.rsiTimeframe) {
                        currentRSI = rsiValue;
                        // Check conditions only if RSI is enabled
                        if (bot.side === 'buy') {
                            conditionsMet = conditionsMet && rsiValue < bot.rsiOversold;
                        } else {
                            conditionsMet = conditionsMet && rsiValue > bot.rsiOverbought;
                        }
                    } else if (!bot.enableRSI && tf === '15m') {
                        // Default to 15m for display if RSI not enabled
                        currentRSI = rsiValue;
                    }
                }
            } catch (err) {
                console.warn(`[SmartDCA] Failed to calculate RSI for ${tf}:`, err.message);
            }
        }

        // Fetch MACD for all timeframes (ALWAYS calculate, even if not enabled for conditions)
        for (const tf of timeframes) {
            try {
                const macdValue = await calculateMACD(
                    exchange,
                    bot.symbol,
                    tf,
                    bot.macdFast || 12,
                    bot.macdSlow || 26,
                    bot.macdSignal || 9
                );
                if (macdValue !== null) {
                    allMACD[tf] = macdValue;

                    // Save MACD to history for this timeframe
                    bot.macdHistory.push({
                        timestamp: new Date(),
                        timeframe: tf,
                        macd: macdValue.MACD,
                        signal: macdValue.signal,
                        histogram: macdValue.histogram
                    });

                    // Set current MACD for bot's configured timeframe
                    if (bot.enableMACD && tf === bot.macdTimeframe) {
                        currentMACD = macdValue;
                        // Check conditions only if MACD is enabled
                        if (bot.side === 'buy') {
                            conditionsMet = conditionsMet && macdValue.histogram > 0;
                        } else {
                            conditionsMet = conditionsMet && macdValue.histogram < 0;
                        }
                    } else if (!bot.enableMACD && tf === '15m') {
                        // Default to 15m for display if MACD not enabled
                        currentMACD = macdValue;
                    }
                }
            } catch (err) {
                console.warn(`[SmartDCA] Failed to calculate MACD for ${tf}:`, err.message);
            }
        }

        // Execute trade based on execution mode
        let executed = false;
        let order = null;

        console.log(`[SmartDCA] Execution mode: ${bot.executionMode}, Conditions met: ${conditionsMet}`);

        if (bot.executionMode === 'scheduled' || conditionsMet) {
            try {
                const timestamp = new Date().toLocaleString();
                console.log(`\n========================================`);
                console.log(`[SmartDCA] 🚀 PLACING ORDER - ${timestamp}`);
                console.log(`[SmartDCA] Bot: ${bot.name}`);
                console.log(`[SmartDCA] Symbol: ${bot.symbol} | Side: ${bot.side.toUpperCase()}`);
                console.log(`[SmartDCA] Amount: ${bot.amountPerInterval} | Price: $${currentPrice.toFixed(4)}`);
                console.log(`[SmartDCA] Estimated Cost: $${(bot.amountPerInterval * currentPrice).toFixed(2)}`);
                if (bot.enableRSI && currentRSI) {
                    console.log(`[SmartDCA] RSI (${bot.rsiTimeframe}): ${currentRSI.toFixed(2)}`);
                }
                if (bot.enableMACD && currentMACD) {
                    console.log(`[SmartDCA] MACD Histogram (${bot.macdTimeframe}): ${currentMACD.histogram.toFixed(4)}`);
                }
                console.log(`========================================\n`);

                // Create market order
                order = await exchange.createMarketOrder(
                    bot.symbol,
                    bot.side,
                    bot.amountPerInterval
                );

                executed = true;
                console.log(`\n✅ ✅ ✅ ORDER EXECUTED SUCCESSFULLY ✅ ✅ ✅`);
                console.log(`[SmartDCA] Order ID: ${order.id}`);
                console.log(`[SmartDCA] Filled: ${order.filled || bot.amountPerInterval} ${order.symbol}`);
                console.log(`[SmartDCA] Cost: $${order.cost?.toFixed(2) || 'N/A'}`);
                console.log(`[SmartDCA] Fee: $${order.fee?.cost?.toFixed(4) || 'N/A'}`);
                console.log(`========================================\n`);

                // Update bot stats
                bot.executionCount += 1;

                if (bot.side === 'buy') {
                    bot.totalSpent += order.cost || (bot.amountPerInterval * currentPrice);
                } else {
                    bot.totalReceived += order.cost || (bot.amountPerInterval * currentPrice);
                }

                bot.totalFees += order.fee?.cost || 0;
                bot.lastExecutionAt = new Date();

            } catch (orderError) {
                console.error('[SmartDCA] Order execution error:', orderError.message);
                throw orderError;
            }
        } else {
            console.log(`[SmartDCA] Conditions not met, skipping execution`);
        }

        // Save execution to history (RSI/MACD already saved per timeframe above)
        bot.executionHistory.push({
            timestamp: new Date(),
            price: currentPrice,
            amount: bot.amountPerInterval,
            side: bot.side,
            orderId: order?.id || null,
            fee: order?.fee?.cost || 0,
            rsi: currentRSI,  // Bot's configured timeframe RSI
            macd: currentMACD, // Bot's configured timeframe MACD
            conditionsMet,
            executed,
            error: executed ? null : 'Conditions not met'
        });

        // Calculate next run time
        const intervalMs = intervalToMs(bot.dcaInterval);
        bot.nextRun = new Date(Date.now() + intervalMs);

        // Log next execution with countdown
        const nextRunDate = new Date(bot.nextRun);
        const minutesUntilNext = Math.floor(intervalMs / 60000);
        const secondsUntilNext = Math.floor((intervalMs % 60000) / 1000);
        console.log(`[SmartDCA] ⏰ Next execution: ${nextRunDate.toLocaleTimeString()} (in ${minutesUntilNext}m ${secondsUntilNext}s)`);
        console.log(`[SmartDCA] 📊 Execution #${bot.executionCount} complete\n`);

        // Check if bot should be completed (totalDuration exceeded)
        if (bot.totalDuration > 0) {
            const durationMs = bot.totalDuration * 60 * 60 * 1000; // hours to ms
            const elapsedMs = Date.now() - bot.startedAt.getTime();
            const progressPercent = ((elapsedMs / durationMs) * 100).toFixed(1);

            // Visual progress bar
            const barLength = 30;
            const filledLength = Math.floor((elapsedMs / durationMs) * barLength);
            const emptyLength = barLength - filledLength;
            const progressBar = '█'.repeat(filledLength) + '░'.repeat(emptyLength);

            console.log(`[SmartDCA] 📈 Bot Progress: ${progressPercent}% complete`);
            console.log(`[SmartDCA] [${progressBar}] ${Math.floor(elapsedMs / 60000)}m / ${bot.totalDuration * 60}m`);

            if (elapsedMs >= durationMs) {
                bot.status = 'completed';
                bot.completedAt = new Date();
                console.log(`[SmartDCA] 🎉🎉🎉 Bot ${bot.name} COMPLETED! 🎉🎉🎉`);
            }
        }

        await bot.save();

        return { success: true, executed, conditionsMet };

    } catch (error) {
        console.error(`[SmartDCA] Error executing trade for bot ${bot.name}:`, error.message);

        // Save error to bot
        bot.errorMessage = error.message;
        bot.status = 'error';
        await bot.save();

        return { success: false, error: error.message };
    }
}

// Main scheduler loop
async function runScheduler() {
    try {
        // Find all active bots that are due for execution
        const now = new Date();
        const bots = await smartDcaBotSchema.find({
            status: 'active',
            nextRun: { $lte: now }
        });

        if (bots.length === 0) {
            return;
        }

        console.log(`[SmartDCA] Found ${bots.length} bots ready for execution`);

        // Execute each bot
        for (const bot of bots) {
            try {
                console.log(`[SmartDCA] Processing bot ${bot.name} for userID: ${bot.userID}, exchange: ${bot.exchange}`);

                // Find userExchange for this bot
                const userExchange = await userExchangesSchema.findOne({
                    userID: bot.userID,
                    exchange: bot.exchange
                });

                if (!userExchange) {
                    console.error(`[SmartDCA] ❌ User exchange not found for bot ${bot.name}, userID: ${bot.userID}, exchange: ${bot.exchange}`);
                    bot.status = 'error';
                    bot.errorMessage = 'User exchange configuration not found';
                    await bot.save();
                    continue;
                }

                console.log(`[SmartDCA] ✅ Found user exchange for ${bot.exchange}`);

                await executeDCATrade(bot, userExchange);
            } catch (error) {
                console.error(`[SmartDCA] ❌ Error processing bot ${bot.name}:`, error.message);
            }
        }

    } catch (error) {
        console.error('[SmartDCA] Scheduler error:', error);
    }
}

// Export plugin
export default defineNitroPlugin((nitroApp) => {
    console.log('[SmartDCA] 🎯 Smart DCA Scheduler plugin initializing...');

    // Run scheduler every 10 seconds
    const schedulerInterval = setInterval(() => {
        console.log('[SmartDCA] ⏰ Running scheduler check...');
        runScheduler();
    }, 10000); // 10 seconds

    console.log('[SmartDCA] ✅ Scheduler plugin initialized - checking every 10 seconds');

    // Run immediately on startup
    setTimeout(() => {
        console.log('[SmartDCA] 🚀 Running initial scheduler check...');
        runScheduler();
    }, 5000);

    // Cleanup on shutdown
    nitroApp.hooks.hook('close', () => {
        console.log('[SmartDCA] 🛑 Shutting down scheduler');
        clearInterval(schedulerInterval);
    });
});
