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

            console.log('💾 Saving to database with:');
            console.log('   apiKeyName:', data['apiKeyName']);
            console.log('   apiKeyNames:', data['apiKeyNames']);

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
                        id:orderResponse.data.id,
                        price:orderResponse.data.price,
                        side:orderResponse.data.side,
                        size:orderResponse.data.size,
                        amount:orderResponse.data.amount,
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
                        id:orderResponse.data.id,
                        price: orderResponse.data.price,
                        side: orderResponse.data.side,
                        size:orderResponse.data.size,
                        amount:orderResponse.data.amount,
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


                    let filledOrders = bot.filledOrders;

                    filledOrders.push(bot.activeOrders[gridOrdersIndex]);

                    bot.activeOrders[gridOrdersIndex].id = newOrderResponse.data.id;
                    bot.activeOrders[gridOrdersIndex].price = newOrderResponse.data.price;
                    bot.activeOrders[gridOrdersIndex].side = newOrderResponse.data.side;
                    bot.activeOrders[gridOrdersIndex].amount = newOrderResponse.data.amount;

                    await gridBotSchema.updateOne({ _id: bot._id }, { activeOrders: bot.activeOrders, filledOrders: filledOrders });
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
        }

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
    };

})
