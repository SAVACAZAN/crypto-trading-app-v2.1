import { create, all } from 'mathjs';
import moment from 'moment';
import { FibBotSchema } from "../models/FibBot.schema";

// Configurare math.js
const config = {
    number: 'BigNumber',
    precision: 20
};
const math = create(all, config);

export default defineNitroPlugin((nitroApp) => {
    console.log('Fib Bots Library Loaded...');

    nitroApp.FibBotLib = {
        async createBot(data) {
            // Obține ultimele prețuri și calculează grila
            let tickerStatus = await nitroApp.ccxtw.fetchTicker(data.userID, data.exchange, data.symbol);
            let lastPrice = tickerStatus.data.last;
            let prices = [];
            let gridWidth = math.evaluate(`((${data.upperPrice} - ${data.lowerPrice}) / ${data.nrOfGrids})`);
            let currentPrice = data.lowerPrice;

            for (let i = 0; i < data.nrOfGrids; i++) {
                currentPrice = math.evaluate(`${currentPrice} + ${gridWidth}`);
                prices.push(currentPrice);
            }

            let activeOrders = [];
            let activeOrdersPriceStart = [];

            if (data.ordersSide === 'buyOnly') {
                activeOrdersPriceStart.push(await this.placeOrder(data.userID, data.exchange, data.symbol, data.PriceStart, 'buy', data.amountType, data.amountPriceStart));
                activeOrders.push(...await this.placeOrders(data.userID, data.exchange, data.symbol, prices.slice(1), 'sell', data.amountType, data.amount, data.nrOfGrids - 1));
            } else if (data.ordersSide === 'sellOnly') {
                activeOrdersPriceStart.push(await this.placeOrder(data.userID, data.exchange, data.symbol, data.PriceStart, 'sell', data.amountType, data.amountPriceStart));
                activeOrders.push(...await this.placeOrders(data.userID, data.exchange, data.symbol, prices.slice(1), 'buy', data.amountType, data.amount, data.nrOfGrids - 1));
            }

            data['activeOrders'] = activeOrders;
            data['activeOrdersPriceStart'] = activeOrdersPriceStart;

            await new FibBotSchema(data).save();
        },

        async placeOrders(userID, exchange, symbol, prices, side, amountType, amount, nrOfGrids) {
            let orders = [];

            for (let i = 0; i < nrOfGrids; i++) {
                let price = prices[i];
                let quantityPerGrid = await this.getQuantityPerGrid(price, amountType, amount, nrOfGrids, i);
                let orderResponse = await nitroApp.ccxtw.createOrder(userID, exchange, symbol, 'limit', side, quantityPerGrid, price);

                if (orderResponse.success) {
                    orders.push({
                        PriceStart: orderResponse.data.PriceStart,
                        id: orderResponse.data.id,
                        price: orderResponse.data.price,
                        side: orderResponse.data.side,
                        size: orderResponse.data.size,
                        amount: orderResponse.data.amount,
                    });
                    console.log(`${this.getCurrentTime()}: ${symbol} - PLACING_GRID_ORDER - Type: limit, Side: ${side}, Amount: ${quantityPerGrid}, Price: ${price}`);
                } else {
                    console.log(`${this.getCurrentTime()}: ${symbol} - PLACING_GRID_ORDER - Failed with: ${orderResponse.log}`);
                }
            }

            return orders;
        },

        async placeOrder(userID, exchange, symbol, price, side, amountType, amountPriceStart) {
            let quantityPerGrid = await this.getQuantityPerGrid(price, amountType, amountPriceStart, 1, 0);
            let orderResponse = await nitroApp.ccxtw.createOrder(userID, exchange, symbol, 'limit', side, quantityPerGrid, price);

            if (orderResponse.success) {
                console.log(`${this.getCurrentTime()}: ${symbol} - PLACING_GRID_ORDER - Type: limit, Side: ${side}, Amount: ${quantityPerGrid}, Price: ${price}`);
                return {
                    PriceStart: orderResponse.data.PriceStart,
                    id: orderResponse.data.id,
                    price: orderResponse.data.price,
                    side: orderResponse.data.side,
                    size: orderResponse.data.size,
                    amount: orderResponse.data.amount,
                };
            } else {
                console.log(`${this.getCurrentTime()}: ${symbol} - PLACING_GRID_ORDER - Failed with: ${orderResponse.log}`);
                return null;
            }
        },

        async getQuantityPerGrid(price, amountType, amount, nrOfGrids, index) {
            let quantityPerGrid = null;

            if (amountType === 'quantityPerGrid') {
                quantityPerGrid = math.evaluate(`${amount} / ${price}`);
            }

            if (amountType === 'totalAmount') {
                quantityPerGrid = math.evaluate(`(${amount} / ${nrOfGrids}) / ${price}`);
            }

            if (amountType === 'incrementalPercent') {
                quantityPerGrid = math.evaluate(`(${amount} + ((${amount} / 100) * (${index} + 1) * ${amount})) / ${price}`);
            }

            return quantityPerGrid;
        },

        async  checkAndPlaceOrder(dbOrder, exchangeOrder, bot, gridOrdersIndex) {
            // Verifică dacă orderele sunt definite
            if (!bot.activeOrders) bot.activeOrders = [];
            if (!bot.activeOrdersPriceStart) bot.activeOrdersPriceStart = [];
            if (!bot.filledOrders) bot.filledOrders = [];
        
            if (dbOrder.id === exchangeOrder.id) {
                let side = exchangeOrder.side;
                let price = exchangeOrder.price;
                let amount = exchangeOrder.amount;
        
                let newSide = side === 'buy' ? 'sell' : 'buy';
                let newPrice = side === 'buy'
                    ? math.evaluate(`${price} + (${price} * 0.10)`)
                    : math.evaluate(`${price} - (${price} * 0.10)`);
        
                // Verifică dacă un ordin similar există deja în activeOrders
                let existsInOrders = bot.activeOrders.some(order => order.side === newSide && order.price === newPrice);
                let existsInPriceStart = bot.activeOrdersPriceStart.some(order => order.side === newSide && order.price === newPrice);
        
                if (!existsInOrders && !existsInPriceStart) {
                    let newOrderResponse = await nitroApp.ccxtw.createOrder(
                        bot.userID, bot.exchange, bot.symbol, 'limit', newSide, amount, newPrice
                    );
        
                    if (newOrderResponse.success) {
                        console.log(`🟢 ${bot.exchange} ${bot.symbol}: ${newSide} order placed at ${newPrice}`);
                        
                        // Adaugă noul ordin la activeOrders sau activeOrdersPriceStart
                        if (gridOrdersIndex !== null) {
                            if (side === 'sell') {
                                bot.activeOrdersPriceStart.push(newOrderResponse.data);
                            } else {
                                bot.activeOrders.push(newOrderResponse.data);
                            }
                        } else {
                            if (side === 'buy') {
                                bot.activeOrders.push(newOrderResponse.data);
                            } else {
                                bot.activeOrdersPriceStart.push(newOrderResponse.data);
                            }
                        }
        
                        // Adaugă ordinul finalizat la filledOrders și actualizează botul în DB
                        bot.filledOrders.push(dbOrder);
                        await FibBotSchema.updateOne(
                            { _id: bot._id },
                            {
                                activeOrders: bot.activeOrders,
                                activeOrdersPriceStart: bot.activeOrdersPriceStart,
                                filledOrders: bot.filledOrders
                            }
                        );
                    } else {
                        console.log(`❌ Order failed: ${newOrderResponse.log}`);
                    }
                } else {
                    console.log(`Order at ${newPrice} ${newSide} already exists.`);
                }
            }
        } ,

        getCurrentTime() {
            return moment(new Date()).format('lll');
        },

        async fetchFibBots(userID) {
            let bots = await FibBotSchema.find({ userID: userID });
            return bots;
        }
    };
});
