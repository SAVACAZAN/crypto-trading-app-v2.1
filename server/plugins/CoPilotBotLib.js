import { create, all } from 'mathjs';
import moment from 'moment';
import { CoPilotBotSchema } from "../models/CoPilotBot.schema";

const config = {
    number: 'BigNumber',
    precision: 20
};

const math = create(all, config);

export default defineNitroPlugin((nitroApp) => {
    console.log('Grid Bots Library Loaded...');

    nitroApp.CoPilotBotLib = {
        async createBot(data) {
            let tickerStatus = await nitroApp.ccxtw.fetchTicker(data.userID, data.exchange, data.symbol);
            let lastPrice = tickerStatus.data.last;
            let prices = [];
            let gridWidth = math.evaluate(`((${data.upperPrice} - ${data.lowerPrice}) / ${data.nrOfGrids})`);
            let currentPrice = data.lowerPrice;

            for (let i = 0; i < data.nrOfGrids; i++) {
                currentPrice = math.evaluate(`${currentPrice} + ${gridWidth}`);
                prices.push(currentPrice);
            }

            let orders = [];

            if (data.ordersSide === 'buyOnly') {
                orders.push(await this.placeOrder(data.userID, data.exchange, data.symbol, data.PriceStart, 'buy', data.amountType, data.amountPriceStart));
                orders.push(...await this.placeOrders(data.userID, data.exchange, data.symbol, prices.slice(1), 'sell', data.amountType, data.amount, data.nrOfGrids - 1));
            } else if (data.ordersSide === 'sellOnly') {
                orders.push(await this.placeOrder(data.userID, data.exchange, data.symbol, data.PriceStart, 'sell', data.amountType, data.amountPriceStart));
                orders.push(...await this.placeOrders(data.userID, data.exchange, data.symbol, prices.slice(1), 'buy', data.amountType, data.amount, data.nrOfGrids - 1));
            }

            data['activeOrders'] = orders;

            await new CoPilotBotSchema(data).save();
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

        async checkAndPlaceOrder(dbOrder, order, bot, gridOrdersIndex) {
            if (dbOrder.id === order.id) {
                let exchange = bot.exchange;
                let side = order.side;
                let price = order.price;
                let amount = order.amount;
        
                let newSide = side === 'buy' ? 'sell' : 'buy'; // Inversăm partea de vânzare cu cea de cumpărare
                let newAmount = side === 'buy' ? math.evaluate(`${amount} + ((${amount} / 100) * ${bot.incrementalPercentAmountBuy})`) : math.evaluate(`${amount} + ((${amount} / 100) * ${bot.incrementalPercentAmountSell})`);
                let newPrice = side === 'buy' ? (bot.PriceStart ? bot.PriceStart : math.evaluate(`${price} + ((${price} / 100) * ${bot.PriceStart})`)) : (bot.PriceStart ? bot.PriceStart : math.evaluate(`${price} - ((${price} / 100) * ${bot.PriceStart})`));
        
                try {
                    let newOrderResponse = await nitroApp.ccxtw.createOrder(bot.userID, bot.exchange, bot.symbol, 'limit', newSide, newAmount, newPrice, false);
        
                    if (newOrderResponse.success) {
                        const priceColor = side === 'buy' ? '\x1b[32m' : '\x1b[31m';
                        const sideColor = priceColor;
                        const amountColor = sideColor === '\x1b[32m' ? '\x1b[32m' : '\x1b[31m';
                        const newSideColor = sideColor === '\x1b[32m' ? '\x1b[31m' : '\x1b[32m';
                        const newPriceColor = newSideColor;
                        const newAmountColor = newSideColor === '\x1b[32m' ? '\x1b[32m' : '\x1b[31m';
        
                        console.log(`▶️ \x1b[34m==> ${exchange}   \x1b[33m${bot.symbol}\x1b[37m-->${priceColor}${price}🛡️->${sideColor}${side} ${amountColor}${amount}\x1b[37m 👽 --->${newSideColor}${newSide}${newPriceColor}${newPrice}✨<--<-✒️->${newAmountColor}${newAmount}\x1b[37m<-✒️->---->limit false`);
        
                        let filledOrders = bot.filledOrders;
        
                        // Adăugăm orderul în lista de ordine finalizate
                        filledOrders.push(bot.activeOrders[gridOrdersIndex]);
        
                        // Actualizăm informațiile despre order
                        bot.activeOrders[gridOrdersIndex].id = newOrderResponse.data.id;
                        bot.activeOrders[gridOrdersIndex].price = newOrderResponse.data.price;
                        bot.activeOrders[gridOrdersIndex].side = newOrderResponse.data.side;
                        bot.activeOrders[gridOrdersIndex].amount = newOrderResponse.data.amount;
        
                        // Actualizăm schema din baza de date cu ordinele active și cele finalizate
                        await CoPilotBotSchema.updateOne({ _id: bot._id }, { activeOrders: bot.activeOrders, filledOrders: filledOrders });
        
                        // Actualizăm informațiile despre PriceStart și gridul de prețuri în funcție de latura orderului (buy/sell)
                        if (side === 'buy') {
                            bot.PriceStart = newPrice;
        
                            // Distribuim cantitatea pe grid-urile rămase în mod egal
                            const remainingGrids = bot.nrOfGrids - gridOrdersIndex - 1;
                            const quantityPerGrid = math.evaluate(`${newAmount} / ${remainingGrids}`);
        
                            // Actualizăm fiecare ordine activă din grid-urile rămase cu noua cantitate
                            for (let i = gridOrdersIndex + 1; i < bot.nrOfGrids; i++) {
                                bot.activeOrders[i].amount = quantityPerGrid;
                            }
        
                            // Actualizăm lista de prețuri de vânzare
                            bot.sellPrices = bot.activeOrders.filter(order => order.side === 'sell').map(order => order.price);
                        } else if (side === 'sell') {
                            bot.PriceStart = newPrice;
        
                            // Distribuim cantitatea pe grid-urile rămase în mod egal
                            const remainingGrids = bot.nrOfGrids - gridOrdersIndex - 1;
                            const quantityPerGrid = math.evaluate(`${newAmount} / ${remainingGrids}`);
        
                            // Actualizăm fiecare ordine activă din grid-urile rămase cu noua cantitate
                            for (let i = gridOrdersIndex + 1; i < bot.nrOfGrids; i++) {
                                bot.activeOrders[i].amount = quantityPerGrid;
                            }
        
                            // Actualizăm lista de prețuri de cumpărare
                            bot.buyPrices = bot.activeOrders.filter(order => order.side === 'buy').map(order => order.price);
                        }
        
                    } else {
                        console.log(newOrderResponse.log);
                    }
                } catch (error) {
                    console.error('Error checking and placing order:', error);
                }
            }
        },
        
        
        getCurrentTime() {
            return moment(new Date()).format('lll');
        },

        async fetchCoPilotBots(userID, exchange, symbol) {
            let bots = await CoPilotBotSchema.find({ userID: userID });
            return bots;
        }
    };
});
