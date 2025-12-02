import { create, all } from 'mathjs';
import moment from 'moment';
import { FronRunSchema } from "../models/FronRun.schema";

// Initialize the mathjs instance
const config = {
    number: 'BigNumber',
    precision: 20
};
const math = create(all, config);  // Make sure this is defined globally

export default defineNitroPlugin((nitroApp) => {
    console.log('FrontRun Bots Library Loaded...');

    nitroApp.FrontRunLib = {
        async createBot(data) {
            // Use math in the createBot method
            let tickerStatus = await nitroApp.ccxtw.fetchTicker(data.userID, data.exchange, data.symbol);
            let lastPrice = tickerStatus.data.last;
            let prices = [];
            let gridWidth = math.evaluate(`((${data.upperPrice} - ${data.lowerPrice}) / ${data.nrOfGrids})`); // math is used here
            let currentPrice = data.lowerPrice;

            for (let i = 0; i < data.nrOfGrids; i++) {
                currentPrice = math.evaluate(`${currentPrice} + ${gridWidth}`);  // math is used here
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

            await new FronRunSchema(data).save();
        },

        async placeOrder(userID, exchange, symbol, price, side, amountType, amountPriceStart) {
            let quantityPerGrid = await this.getQuantityPerGrid(price, amountType, amountPriceStart, 1, 0);
            let orderResponse = await nitroApp.ccxtw.createOrder(userID, exchange, symbol, 'limit', side, quantityPerGrid, price);
        
            if (orderResponse.success) {
                const sideColor = side === 'buy' ? '\x1b[32m' : '\x1b[31m'; // Green for buy, Red for sell
                const amountColor = sideColor === '\x1b[32m' ? '\x1b[32m' : '\x1b[31m'; // Green/Red for amount
                const priceColor = sideColor === '\x1b[32m' ? '\x1b[32m' : '\x1b[31m'; // Green/Red for price
        
                console.log(`▶️ \x1b[34m==> ${exchange}   \x1b[33m${symbol}\x1b[37m-->${priceColor}${price}🛡️->${sideColor}${side} ${amountColor}${quantityPerGrid}\x1b[37m ✨`);
        
                return {
                    PriceStart: orderResponse.data.PriceStart,
                    id: orderResponse.data.id,
                    price: orderResponse.data.price,
                    side: orderResponse.data.side,
                    size: orderResponse.data.size,
                    amount: orderResponse.data.amount,
                };
            } else {
                console.log(`${this.getCurrentTime()}: ${symbol} -  OWN THIS ==>  - Failed with: ${orderResponse.log}`);
                return null;
            }
        },

        async placeOrders(userID, exchange, symbol, prices, side, amountType, amount, nrOfGrids) {
            let orders = [];
        
            for (let i = 0; i < nrOfGrids; i++) {
                let price = prices[i];
                let quantityPerGrid = await this.getQuantityPerGrid(price, amountType, amount, nrOfGrids, i);
                let orderResponse = await nitroApp.ccxtw.createOrder(userID, exchange, symbol, 'limit', side, quantityPerGrid, price);
        
                if (orderResponse.success) {
                    const sideColor = side === 'buy' ? '\x1b[32m' : '\x1b[31m'; // Green for buy, Red for sell
                    const amountColor = sideColor === '\x1b[32m' ? '\x1b[32m' : '\x1b[31m'; // Green/Red for amount
                    const priceColor = sideColor === '\x1b[32m' ? '\x1b[32m' : '\x1b[31m'; // Green/Red for price
        
                    orders.push({
                        PriceStart: orderResponse.data.PriceStart,
                        id: orderResponse.data.id,
                        price: orderResponse.data.price,
                        side: orderResponse.data.side,
                        size: orderResponse.data.size,
                        amount: orderResponse.data.amount,
                    });
        
                    console.log(`▶️ \x1b[34m==> ${exchange}   \x1b[33m${symbol}\x1b[37m-->${priceColor}${price}🛡️->${sideColor}${side} ${amountColor}${quantityPerGrid}\x1b[37m ✨`);
                } else {
                    console.log(`${this.getCurrentTime()}: ${symbol} -  OWN THIS ==>  - Failed with: ${orderResponse.log}`);
                }
            }
        
            return orders;
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
        
                        // Save the ORIGINAL filled order (with original side) to filledOrders FIRST
                        let filledOrders = bot.filledOrders;
                        const originalFilledOrder = { ...bot.activeOrders[gridOrdersIndex] };
                        filledOrders.push(originalFilledOrder);

                        // THEN update the active order with the NEW inverse order data
                        // Use the calculated values (newPrice, newAmount, newSide) instead of response data
                        bot.activeOrders[gridOrdersIndex].id = newOrderResponse.data.id;
                        bot.activeOrders[gridOrdersIndex].price = newPrice;
                        bot.activeOrders[gridOrdersIndex].side = newSide;
                        bot.activeOrders[gridOrdersIndex].amount = newAmount;
        
                        // Actualizăm schema din baza de date cu ordinele active și cele finalizate
                        await FronRunSchema.updateOne({ _id: bot._id }, { activeOrders: bot.activeOrders, filledOrders: filledOrders });
        
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
        async getQuantityPerGrid(price, amountType, amount, nrOfGrids, index) {
            let quantityPerGrid = null;

            // Using math to calculate based on amountType
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

        getCurrentTime() {
            return moment(new Date()).format('lll');
        }
    };
});
