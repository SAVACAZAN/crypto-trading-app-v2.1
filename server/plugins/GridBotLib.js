import {SMA, RSI, CrossUp, CrossDown} from 'technicalindicators';
import moment from 'moment';
import { create, all } from 'mathjs';
import {gridBotSchema} from "~/server/models/gridBot.schema";
import {dcaBotSchema} from "~/server/models/dcaBot.schema";
const config = {
    number: 'BigNumber',
    precision: 20
}
const math = create(all, config);

export default defineNitroPlugin((nitroApp) => {
    console.log('Grid Bots Library Loaded...')

    nitroApp.GridBotsLib = {
        createBot: async function(data){

            // DEBUG: Log incoming data to verify apiKeyName
            console.log('🔵 [createBot] Received data:');
            console.log('   userID:', data.userID);
            console.log('   exchange:', data.exchange);
            console.log('   symbol:', data.symbol);
            console.log('   apiKeyNames:', data.apiKeyNames);  // Changed to apiKeyNames (array)
            console.log('   ordersSide:', data.ordersSide);

            // Support both single apiKeyName (old format) and apiKeyNames array (new format)
            let apiKeyNamesArray = [];
            if (data.apiKeyNames && Array.isArray(data.apiKeyNames)) {
                apiKeyNamesArray = data.apiKeyNames;
            } else if (data.apiKeyName) {
                // Backward compatibility with old single apiKeyName
                apiKeyNamesArray = [data.apiKeyName];
            }

            console.log('   📋 API Keys to use:', apiKeyNamesArray);

            // Fetch balance BEFORE creating orders to get snapshot
            const [baseToken, quoteToken] = data.symbol.split('/');
            let balanceSnapshot = {
                baseFree: 0,
                baseTotal: 0,
                quoteFree: 0,
                quoteTotal: 0
            };

            try {
                const balanceResponse = await nitroApp.ccxtw.fetchBalance(
                    data.userID,
                    data.exchange,
                    apiKeyNamesArray[0] // Use first API key for balance
                );

                if (balanceResponse.success && balanceResponse.data) {
                    const balances = balanceResponse.data;

                    if (balances[baseToken]) {
                        balanceSnapshot.baseFree = parseFloat(balances[baseToken].free || 0);
                        balanceSnapshot.baseTotal = parseFloat(balances[baseToken].total || 0);
                    }

                    if (balances[quoteToken]) {
                        balanceSnapshot.quoteFree = parseFloat(balances[quoteToken].free || 0);
                        balanceSnapshot.quoteTotal = parseFloat(balances[quoteToken].total || 0);
                    }

                    console.log('💰 Balance snapshot BEFORE creating orders:', balanceSnapshot);
                }
            } catch (error) {
                console.error('⚠️ Error fetching balance snapshot:', error);
                // Continue even if balance fetch fails
            }

            let prices = [];
            let gridWidth;
            
            if (data.nrOfGrids === 2) {
                // Tratează cazul specific pentru nrOfGrids = 2
                gridWidth = math.evaluate(`(${data.upperPrice} - ${data.lowerPrice}) / 2`);
            } else {
                gridWidth = math.evaluate(`(${data.upperPrice} - ${data.lowerPrice}) / ${data.nrOfGrids}`);
            }
            
            let currentPrice = data.lowerPrice;
            
            for (let i = 0; i < data.nrOfGrids; i++) {
                if (data.nrOfGrids === 2 && i === 1) {
                    // Tratează cazul specific pentru a doua grilă când avem doar 2 grile
                    currentPrice = math.evaluate(`${currentPrice} + ${gridWidth}`);
                    prices.push(currentPrice); // Adăugă prețul pentru a doua grilă
                } else {
                    currentPrice = math.evaluate(`${currentPrice} + ${gridWidth}`);
                    prices.push(currentPrice);
                }
            }
            
            let tickerStatus = await nitroApp.ccxtw.fetchTicker(data.userID, data.exchange, data.symbol);

            let lastPrice = tickerStatus.data.last;

            console.log('🔍 [DEBUG] Grid prices calculation:');
            console.log('   Current market price:', lastPrice);
            console.log('   Grid price range:', data.lowerPrice, '-', data.upperPrice);
            console.log('   All grid prices:', prices);

            let sellPrices = [];
            for (let i = 0; i < prices.length; i++) {
                if (prices[i] > lastPrice) {
                    sellPrices.push(prices[i]);
                }
            }

            let buyPrices = [];
            for (let i = 0; i < prices.length; i++) {
                if (prices[i] < lastPrice) {
                    buyPrices.push(prices[i]);
                }
            }

            console.log('🔍 [DEBUG] Prices split by current market price:');
            console.log('   Buy prices (below market):', buyPrices);
            console.log('   Sell prices (above market):', sellPrices);

            let orders = [];

            // Place orders for EACH selected API key
            for (let apiKeyName of apiKeyNamesArray) {
                console.log(`\n🔑 Placing orders with API Key: ${apiKeyName}`);

                if (data.ordersSide === 'buyOrSell') {
                    let buyOrders = await this.placeBuyOrders(data.userID, data.exchange, data.symbol, buyPrices, data.amountType, data.amount, data.nrOfGrids, data.incrementalPercentAmountBuy, apiKeyName);
                    for (let i = 0; i < buyOrders.length; i++) {
                        orders.push(buyOrders[i]);
                    }

                    let sellOrders = await this.placeSellOrders(data.userID, data.exchange, data.symbol, sellPrices, data.amountType, data.amount, data.nrOfGrids, data.incrementalPercentAmountSell, apiKeyName);
                    for (let i = 0; i < sellOrders.length; i++) {
                        orders.push(sellOrders[i]);
                    }
                }

                if (data.ordersSide === 'buyOnly') {
                    let buyOrders = await this.placeBuyOrders(data.userID, data.exchange, data.symbol, buyPrices, data.amountType, data.amount, data.nrOfGrids, data.incrementalPercentAmountBuy, apiKeyName);
                    for (let i = 0; i < buyOrders.length; i++) {
                        orders.push(buyOrders[i]);
                    }
                }

                if (data.ordersSide === 'sellOnly')  {
                    let sellOrders = await this.placeSellOrders(data.userID, data.exchange, data.symbol, sellPrices, data.amountType, data.amount, data.nrOfGrids, data.incrementalPercentAmountSell, apiKeyName);
                    for (let i = 0; i < sellOrders.length; i++) {
                        orders.push(sellOrders[i]);
                    }
                }

                console.log(`✅ Completed placing orders with API Key: ${apiKeyName}\n`);

                // Add delay between switching API keys for Coinbase Advanced
                if (data.exchange === 'coinbaseadvanced' && apiKeyNamesArray.indexOf(apiKeyName) < apiKeyNamesArray.length - 1) {
                    console.log('⏱️  Waiting 2000ms before switching to next API key...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }

            data['activeOrders'] = orders;

            // Store apiKeyNames array in database
            data['apiKeyNames'] = apiKeyNamesArray;

            // Store first API key as apiKeyName for backward compatibility
            if (apiKeyNamesArray.length > 0) {
                data['apiKeyName'] = apiKeyNamesArray[0];
            }

            // Debug: Check orders before calculating balance
            console.log('🔍 [DEBUG] About to calculate balance from orders:');
            console.log('   Orders count:', orders ? orders.length : 'NULL');
            if (orders && orders.length > 0) {
                console.log('   First order:', JSON.stringify(orders[0], null, 2));
                console.log('   Last order:', JSON.stringify(orders[orders.length - 1], null, 2));
            }

            // Calculate balance in bot from active orders
            const balanceInOrders = this.calculateBalanceInOrders(orders);
            console.log('💰 Balance in active orders:', balanceInOrders);

            // Get USD prices for base and quote tokens
            const basePriceUSD = await this.getTokenPriceInUSD(data.userID, data.exchange, baseToken);
            const quotePriceUSD = await this.getTokenPriceInUSD(data.userID, data.exchange, quoteToken);

            console.log('💵 USD Prices:', {
                baseToken,
                basePriceUSD,
                quoteToken,
                quotePriceUSD
            });

            // Calculate USD values
            const balanceBaseInUSD = balanceInOrders.baseInOrders * basePriceUSD;
            const balanceQuoteInUSD = balanceInOrders.quoteInOrders * quotePriceUSD;

            // Update BalanceBot with actual amounts in orders, USD values, and balance snapshot
            if (data.BalanceBot) {
                // Current balances in grid bot orders
                data.BalanceBot.BalanceBase = balanceInOrders.baseInOrders.toString();
                data.BalanceBot.BalanceQuote = balanceInOrders.quoteInOrders.toString();
                data.BalanceBot.BalanceBaseInUSD = balanceBaseInUSD.toString();
                data.BalanceBot.BalanceQuoteInUSD = balanceQuoteInUSD.toString();

                // Balance snapshot at bot creation (before orders were placed)
                data.BalanceBot.BalanceBaseTotalAtStart = balanceSnapshot.baseTotal.toString();
                data.BalanceBot.BalanceQuoteTotalAtStart = balanceSnapshot.quoteTotal.toString();
                data.BalanceBot.BalanceBaseFreeAtStart = balanceSnapshot.baseFree.toString();
                data.BalanceBot.BalanceQuoteFreeAtStart = balanceSnapshot.quoteFree.toString();
            }

            console.log('💾 Saving to database with:');
            console.log('   apiKeyName:', data['apiKeyName']);
            console.log('   apiKeyNames:', data['apiKeyNames']);
            console.log('   BalanceBot.BalanceBase (in orders):', data.BalanceBot?.BalanceBase);
            console.log('   BalanceBot.BalanceQuote (in orders):', data.BalanceBot?.BalanceQuote);
            console.log('   BalanceBot.BalanceBaseInUSD:', data.BalanceBot?.BalanceBaseInUSD);
            console.log('   BalanceBot.BalanceQuoteInUSD:', data.BalanceBot?.BalanceQuoteInUSD);

            await new gridBotSchema(data).save()
        },

        async placeBuyOrders(userID, exchange, symbol, buyPrices, amountType, amount, nrOfGrids, incrementalPercentAmount, apiKeyName) {
            //buy
            console.log(`🟢 [placeBuyOrders] Using apiKeyName: ${apiKeyName}`);
            let orders = [];
            let localIndex = 1;
            for (let i = buyPrices.length - 1; i > 0; i--) {
                let log = null;
                let price = buyPrices[i];
                let quantityPerGrid = await this.getQuantityPerGrid(price, amountType, amount, nrOfGrids, incrementalPercentAmount, localIndex);

                console.log(`🟢 [placeBuyOrders] API: ${apiKeyName} | ${symbol} | BUY | Amount: ${quantityPerGrid} | Price: ${price}`);

                let orderResponse = await nitroApp.ccxtw.createOrder(userID, exchange, symbol, 'limit', 'buy', quantityPerGrid, price, {}, apiKeyName);

                if (orderResponse.success) {
                    orders.push({
                        id: orderResponse.data.id,
                        price: price, // Use our calculated price
                        side: 'buy',
                        size: quantityPerGrid, // Use our calculated amount
                        amount: quantityPerGrid, // Use our calculated amount
                    });
                    log =`${this.getCurrentTime()}: ${symbol}- OWN THIS ==>\x1b[33m - Side: \x1b[32mbuy, \x1b[33mAmount:\x1b[32m ${quantityPerGrid}, \x1b[33mPrice:\x1b[32m   ${price}`;
                }

                if (!orderResponse.success) {
                    log =`${this.getCurrentTime()}: ${symbol} - OWN THIS ==> - ${orderResponse.log}`;
                }

                console.log(log);
                localIndex++;

                // Add delay between orders to prevent rate limiting (1000ms for Coinbase Advanced)
                if (i > 1 && exchange === 'coinbaseadvanced') {
                    console.log('⏱️  Waiting 1000ms before next order...');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            return orders;
        },

        async placeSellOrders(userID, exchange, symbol, sellPrices, amountType, amount, nrOfGrids, incrementalPercentAmount, apiKeyName) {
            //sell
            console.log(`🔴 [placeSellOrders] Using apiKeyName: ${apiKeyName}`);
            let orders = [];
            let localIndex = 1;
            for (let i = 0; i < sellPrices.length; i++) {
                let log = null;
                let price = sellPrices[i];
                let quantityPerGrid = await this.getQuantityPerGrid(price, amountType, amount, nrOfGrids, incrementalPercentAmount, localIndex);

                console.log(`🔴 [placeSellOrders] API: ${apiKeyName} | ${symbol} | SELL | Amount: ${quantityPerGrid} | Price: ${price}`);

                let orderResponse = await nitroApp.ccxtw.createOrder(userID, exchange, symbol, 'limit', 'sell', quantityPerGrid, price, {}, apiKeyName);

                if (orderResponse.success) {
                    orders.push({
                        id: orderResponse.data.id,
                        price: price, // Use our calculated price
                        side: 'sell',
                        size: quantityPerGrid, // Use our calculated amount
                        amount: quantityPerGrid, // Use our calculated amount
                    });
                    log =`${this.getCurrentTime()}: ${symbol} - OWN THIS ==> - Side: \x1B[31msell, \x1b[33mAmount:\x1B[31m ${quantityPerGrid}, \x1b[33mPrice:\x1B[31m ${price}\x1b[33m`;
                }

                if (!orderResponse.success) {
                    log =`${this.getCurrentTime()}: ${symbol} - OWN THIS ==> - ${orderResponse.log}`;
                }

                console.log(log);
                localIndex++;

                // Add delay between orders to prevent rate limiting (1000ms for Coinbase Advanced)
                if (i < sellPrices.length - 1 && exchange === 'coinbaseadvanced') {
                    console.log('⏱️  Waiting 1000ms before next order...');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            return orders;
        },

        async getQuantityPerGrid(price, amountType, amount, nrOfGrids, incrementalPercentAmount, index){
            let quantityPerGrid = null;

            if (amountType === 'quantityPerGrid') {
                quantityPerGrid = math.evaluate(`${amount} / ${price}`);
            }

            if (amountType === 'totalAmount') {
                quantityPerGrid = math.evaluate(`(${amount} / ${nrOfGrids}) / ${price}`);
            }

            if (amountType === 'incrementalPercent') {
                if (nrOfGrids === 2) {
                    // Tratează cazul specific pentru nrOfGrids = 2
                    if (index === 1) {
                        // A doua ordine din grilă
                        // Aici puteți seta manual prețul și cantitatea pentru a doua ordine
                        quantityPerGrid = math.evaluate(`(${amount} / ${price})`); // De exemplu, setați cantitatea la ${amount} și prețul la 'sellUpperPrice'
                    } else {
                        // Prima ordine din grilă
                        // Aici puteți seta manual prețul și cantitatea pentru prima ordine
                        quantityPerGrid = math.evaluate(`(${amount} / ${price})`); // De exemplu, setați cantitatea la ${amount} și prețul la 'buyLowerPrice'
                    }
                } else {
                    // Tratează cazul general pentru nrOfGrids diferit de 2
                    quantityPerGrid = math.evaluate(`(${amount} + ((${amount} / 100) * (${incrementalPercentAmount} * ${index}))) / ${price}`);
                }
            }
            return quantityPerGrid;
        },

        async checkAndPlaceOrder(dbOrder, order, bot, gridOrdersIndex) {
            if (dbOrder.id === order.id) {

                let orderCounts = {};
                let buyCount = 0;
                let sellCount = 0;

                let exchange = bot.exchange;
                let side = order['side'];
                let price = order['price'];
                let amount = order['amount'];
                let newSide = false;
                let newAmount = false;
                let newPrice = 0;

                if (side === 'buy') {
                    //pret + ((pret / 100) * incrementalCustom)
                    if(bot.usePriceGroup) {
                        newPrice = bot.priceGroupSell;
                    } else {
                        newPrice = math.evaluate(`${price} + ((${price} / 100) * ${bot.config.deviationPriceBuy})`);
                    }
                    newAmount = math.evaluate(`${amount} + ((${amount} / 100) * ${bot.config.deviationAmountBuy})`);
                    newSide = 'sell';
                }

                if (side === 'sell') {
                    if(bot.usePriceGroup) {
                        newPrice = bot.priceGroupBuy;
                    } else {
                        newPrice = math.evaluate(`${price} - ((${price} / 100) * ${bot.config.deviationPriceSell})`);
                    }
                    newAmount = math.evaluate(`${amount} + ((${amount} / 100) * ${bot.config.deviationAmountSell})`);
                    newSide = 'buy';
                }

                // Add delay before placing inverse order for Coinbase Advanced to prevent rate limiting
                if (bot.exchange === 'coinbaseadvanced') {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }

                let newOrderResponse = await nitroApp.ccxtw.createOrder(bot.userID, bot.exchange, bot.symbol, 'limit', newSide, newAmount, newPrice, {}, bot.apiKeyName);

                if (newOrderResponse.success) {
                    const priceColor = side === 'buy' ? '\x1b[32m' : '\x1b[31m';
                    const sideColor = priceColor;
                    const amountColor = sideColor === '\x1b[32m' ? '\x1b[32m' : '\x1b[31m';
                    const newSideColor = sideColor === '\x1b[32m' ? '\x1b[31m' : '\x1b[32m';
                    const newPriceColor = newSideColor;
                    const newAmountColor = newSideColor === '\x1b[32m' ? '\x1b[32m' : '\x1b[31m';

                    console.log(`▶️ \x1b[34m==> ${exchange}   \x1b[33m${bot.symbol}\x1b[37m-->${priceColor}${price}🛡️->${sideColor}${side} ${amountColor}${amount}\x1b[37m 👽 --->${newSideColor}${newSide}${newPriceColor}${newPrice}✨<--<-✒️->${newAmountColor}${newAmount}\x1b[37m<-✒️->---->limit false`);

                    // Numerotare comenzări cu succes pentru fiecare exchange
                    if (!orderCounts[exchange]) {
                        orderCounts[exchange] = 1;
                    } else {
                        orderCounts[exchange]++;
                    }
                    console.log(`Comandaaaă cu succes nr. ${orderCounts[exchange]}`);

                    // Evidențierea numărului de tranzacții de tip buy și sell
                    if (side === 'buy') {
                        buyCount++;
                        console.log(`Tranzacție de tip buy cu succes nr. ${buyCount}`);
                    } else if (side === 'sell') {
                        sellCount++;
                        console.log(`Tranzacție de tip sell cu succes nr. ${sellCount}`);
                    }


                    // Save the ORIGINAL filled order (with original side) to filledOrders FIRST
                    let filledOrders = bot.filledOrders;
                    const originalFilledOrder = { ...bot.activeOrders[gridOrdersIndex] };

                    console.log('[GridBotLib] ===== ORDER UPDATE DEBUG =====');
                    console.log('[GridBotLib] Original filled order:', {
                        id: originalFilledOrder.id,
                        side: originalFilledOrder.side,
                        price: originalFilledOrder.price,
                        amount: originalFilledOrder.amount
                    });
                    console.log('[GridBotLib] newOrderResponse.data:', JSON.stringify(newOrderResponse.data, null, 2));
                    console.log('[GridBotLib] Calculated newPrice:', newPrice);
                    console.log('[GridBotLib] Calculated newAmount:', newAmount);
                    console.log('[GridBotLib] Calculated newSide:', newSide);

                    filledOrders.push(originalFilledOrder);

                    // THEN update the active order with the NEW inverse order data
                    // Use the calculated values (newPrice, newAmount, newSide) instead of response data
                    // because CCXT response may not contain these fields consistently
                    bot.activeOrders[gridOrdersIndex].id = newOrderResponse.data.id;
                    bot.activeOrders[gridOrdersIndex].price = newPrice;
                    bot.activeOrders[gridOrdersIndex].side = newSide;
                    bot.activeOrders[gridOrdersIndex].amount = newAmount;

                    console.log('[GridBotLib] Updated activeOrder:', {
                        id: bot.activeOrders[gridOrdersIndex].id,
                        side: bot.activeOrders[gridOrdersIndex].side,
                        price: bot.activeOrders[gridOrdersIndex].price,
                        amount: bot.activeOrders[gridOrdersIndex].amount
                    });
                    console.log('[GridBotLib] ===== END DEBUG =====');

                    // Recalculate balance in orders after order update
                    const balanceInOrders = this.calculateBalanceInOrders(bot.activeOrders);

                    // Extract base and quote tokens from symbol
                    const [baseToken, quoteToken] = bot.symbol.split('/');

                    // Get current USD prices
                    const basePriceUSD = await this.getTokenPriceInUSD(bot.userID, bot.exchange, baseToken);
                    const quotePriceUSD = await this.getTokenPriceInUSD(bot.userID, bot.exchange, quoteToken);

                    // Calculate USD values
                    const balanceBaseInUSD = balanceInOrders.baseInOrders * basePriceUSD;
                    const balanceQuoteInUSD = balanceInOrders.quoteInOrders * quotePriceUSD;

                    const updatedBalanceBot = {
                        ...bot.BalanceBot,
                        BalanceBase: balanceInOrders.baseInOrders.toString(),
                        BalanceQuote: balanceInOrders.quoteInOrders.toString(),
                        BalanceBaseInUSD: balanceBaseInUSD.toString(),
                        BalanceQuoteInUSD: balanceQuoteInUSD.toString()
                    };

                    await gridBotSchema.updateOne(
                        { _id: bot._id },
                        {
                            activeOrders: bot.activeOrders,
                            filledOrders: filledOrders,
                            BalanceBot: updatedBalanceBot
                        }
                    );
                } else {
                    console.log(newOrderResponse.log);
                }
            }
        },

        getCurrentTime() {
            return moment(new Date()).format('lll');
        },

        async fetchGridBots(userID, exchange, symbol) {
            let bots = await gridBotSchema.find({userID: userID});
            return bots;
        },

        // getBots: async function(){
        //     let bots = await dcaBotSchema.find({});
        //     let formattedBots = [];
        //
        //     for (let i = 0; i < bots.length; i++) {
        //         let bot = bots[i].toObject();
        //
        //         let profit = 0;
        //         let bots = await dcaBotSchema.find({id:bot._id});
        //         for (let i = 0; i < bots.length; i++) {
        //             profit = profit + bots[i].profit;
        //         }
        //
        //         bot.bots = bots;
        //         bot.profit = profit;
        //
        //         formattedBots.push(bot);
        //     }
        //     return formattedBots;
        // },

        /**
         * Calculate total base and quote amounts locked in active orders
         * @param {Array} orders - Array of active orders
         * @returns {Object} - { baseInOrders, quoteInOrders }
         */
        calculateBalanceInOrders: function(orders) {
            console.log('🔍 [calculateBalanceInOrders] Called with orders:', orders ? orders.length : 'NULL');

            let baseInOrders = 0;  // Total base currency in SELL orders
            let quoteInOrders = 0; // Total quote currency in BUY orders

            if (!orders || orders.length === 0) {
                console.log('⚠️ [calculateBalanceInOrders] Orders array is empty or null');
                return {
                    baseInOrders: 0,
                    quoteInOrders: 0
                };
            }

            console.log('🔍 [calculateBalanceInOrders] First order sample:', JSON.stringify(orders[0], null, 2));

            for (const order of orders) {
                if (order.side === 'sell') {
                    // SELL orders lock BASE currency (amount)
                    const amount = parseFloat(order.amount || 0);
                    console.log(`🔍 [SELL] amount: ${amount}`);
                    baseInOrders += amount;
                } else if (order.side === 'buy') {
                    // BUY orders lock QUOTE currency (price * amount)
                    const price = parseFloat(order.price || 0);
                    const amount = parseFloat(order.amount || 0);
                    const total = price * amount;
                    console.log(`🔍 [BUY] price: ${price}, amount: ${amount}, total: ${total}`);
                    quoteInOrders += total;
                }
            }

            console.log('💰 [calculateBalanceInOrders] Results:', {
                baseInOrders,
                quoteInOrders
            });

            return {
                baseInOrders: baseInOrders,
                quoteInOrders: quoteInOrders
            };
        },

        /**
         * Get USD price for a token
         * @param {string} userID - User ID
         * @param {string} exchange - Exchange name
         * @param {string} token - Token symbol (e.g., 'LCX', 'BTC', 'ETH', 'USDC')
         * @returns {Promise<number>} - Price in USD
         */
        getTokenPriceInUSD: async function(userID, exchange, token) {
            try {
                // USDC, USDT, USD are already in USD
                if (['USDC', 'USDT', 'USD', 'BUSD', 'DAI'].includes(token.toUpperCase())) {
                    return 1.0;
                }

                // Try to fetch token/USDC price first
                let symbol = `${token}/USDC`;
                try {
                    const tickerResponse = await nitroApp.ccxtw.fetchTicker(userID, exchange, symbol);
                    if (tickerResponse.success && tickerResponse.data && tickerResponse.data.last) {
                        return parseFloat(tickerResponse.data.last);
                    }
                } catch (err) {
                    console.log(`⚠️ Could not fetch ${symbol}, trying ${token}/USDT...`);
                }

                // Try token/USDT if token/USDC failed
                symbol = `${token}/USDT`;
                try {
                    const tickerResponse = await nitroApp.ccxtw.fetchTicker(userID, exchange, symbol);
                    if (tickerResponse.success && tickerResponse.data && tickerResponse.data.last) {
                        return parseFloat(tickerResponse.data.last);
                    }
                } catch (err) {
                    console.log(`⚠️ Could not fetch ${symbol}`);
                }

                console.warn(`⚠️ Could not fetch USD price for ${token}, returning 0`);
                return 0;
            } catch (error) {
                console.error(`Error fetching USD price for ${token}:`, error);
                return 0;
            }
        },
    };

})
