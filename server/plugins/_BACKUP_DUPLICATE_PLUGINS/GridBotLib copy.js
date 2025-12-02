import {SMA, RSI, CrossUp, CrossDown} from 'technicalindicators';
import moment from 'moment';
import { create, all } from 'mathjs';
import {gridBotSchema} from "~/server/models/gridBot.schema";
import {dcaBotSchema} from "~/server/models/dcaBot.schema";
const config = {
    number: 'BigNumber',
    precision: 20
};
const math = create(all, config);

export default defineNitroPlugin((nitroApp) => {
    console.log('Grid Bots Library Loaded...');

    nitroApp.GridBotsLib = {
        orderCounts: {},
        buyCount: 0,
        sellCount: 0,

        createBot: async function(data){
            let prices = [];
            let gridWidth;
            
            if (data.nrOfGrids === 2) {
                gridWidth = math.evaluate(`(${data.upperPrice} - ${data.lowerPrice}) / 2`);
            } else {
                gridWidth = math.evaluate(`(${data.upperPrice} - ${data.lowerPrice}) / ${data.nrOfGrids}`);
            }
            
            let currentPrice = data.lowerPrice;
            
            for (let i = 0; i < data.nrOfGrids; i++) {
                currentPrice = math.evaluate(`${currentPrice} + ${gridWidth}`);
                prices.push(currentPrice);
            }
            
            let tickerStatus = await nitroApp.ccxtw.fetchTicker(data.userID, data.exchange, data.symbol);
            let lastPrice = tickerStatus.data.last;

            let sellPrices = prices.filter(price => price > lastPrice);
            let buyPrices = prices.filter(price => price < lastPrice);

            let orders = [];

            if (data.ordersSide === 'buyOrSell') {
                let buyOrders = await this.placeBuyOrders(data.userID, data.exchange, data.symbol, buyPrices, data.amountType, data.amount, data.nrOfGrids, data.incrementalPercentAmountBuy);
                orders.push(...buyOrders);

                let sellOrders = await this.placeSellOrders(data.userID, data.exchange, data.symbol, sellPrices, data.amountType, data.amount, data.nrOfGrids, data.incrementalPercentAmountSell);
                orders.push(...sellOrders);
            }

            if (data.ordersSide === 'buyOnly') {
                let buyOrders = await this.placeBuyOrders(data.userID, data.exchange, data.symbol, buyPrices, data.amountType, data.amount, data.nrOfGrids, data.incrementalPercentAmountBuy);
                orders.push(...buyOrders);
            }

            if (data.ordersSide === 'sellOnly') {
                let sellOrders = await this.placeSellOrders(data.userID, data.exchange, data.symbol, sellPrices, data.amountType, data.amount, data.nrOfGrids, data.incrementalPercentAmountSell);
                orders.push(...sellOrders);
            }

            data['activeOrders'] = orders;

            await new gridBotSchema(data).save();
        },

        async placeBuyOrders(userID, exchange, symbol, buyPrices, amountType, amount, nrOfGrids, incrementalPercentAmount) {
            let orders = [];
            let localIndex = 1;

            for (let i = buyPrices.length - 1; i >= 0; i--) {
                let price = buyPrices[i];
                let quantityPerGrid = await this.getQuantityPerGrid(price, amountType, amount, nrOfGrids, incrementalPercentAmount, localIndex);

                let orderResponse = await nitroApp.ccxtw.createOrder(userID, exchange, symbol, 'limit', 'buy', quantityPerGrid, price);

                if (orderResponse.success) {
                    orders.push(orderResponse.data);
                    this.buyCount++;
                    console.log(`\x1b[32m✔️ Tranzacție de tip \x1b[1mBUY\x1b[0;32m cu succes nr. ${this.buyCount} \x1b[0m pentru simbolul \x1b[1m${symbol}\x1b[0m`);
                } else {
                    console.log(`\x1b[31m❌ Eroare la plasarea comenzii de tip BUY pentru simbolul ${symbol}: ${orderResponse.log}\x1b[0m`);
                }

                localIndex++;
            }

            return orders;
        },

        async placeSellOrders(userID, exchange, symbol, sellPrices, amountType, amount, nrOfGrids, incrementalPercentAmount) {
            let orders = [];
            let localIndex = 1;

            for (let i = 0; i < sellPrices.length; i++) {
                let price = sellPrices[i];
                let quantityPerGrid = await this.getQuantityPerGrid(price, amountType, amount, nrOfGrids, incrementalPercentAmount, localIndex);

                let orderResponse = await nitroApp.ccxtw.createOrder(userID, exchange, symbol, 'limit', 'sell', quantityPerGrid, price);

                if (orderResponse.success) {
                    orders.push(orderResponse.data);
                    this.sellCount++;
                    console.log(`\x1b[31m✔️ Tranzacție de tip \x1b[1mSELL\x1b[0;31m cu succes nr. ${this.sellCount} \x1b[0m pentru simbolul \x1b[1m${symbol}\x1b[0m`);
                } else {
                    console.log(`\x1b[31m❌ Eroare la plasarea comenzii de tip SELL pentru simbolul ${symbol}: ${orderResponse.log}\x1b[0m`);
                }

                localIndex++;
            }

            return orders;
        },

        async getQuantityPerGrid(price, amountType, amount, nrOfGrids, incrementalPercentAmount, index) {
            let quantityPerGrid = null;

            if (amountType === 'quantityPerGrid') {
                quantityPerGrid = math.evaluate(`${amount} / ${price}`);
            } else if (amountType === 'totalAmount') {
                quantityPerGrid = math.evaluate(`(${amount} / ${nrOfGrids}) / ${price}`);
            } else if (amountType === 'incrementalPercent') {
                quantityPerGrid = math.evaluate(`(${amount} + ((${amount} / 100) * (${incrementalPercentAmount} * ${index}))) / ${price}`);
            }

            return quantityPerGrid;
        },

        async checkAndPlaceOrder(dbOrder, order, bot, gridOrdersIndex) {
            if (dbOrder.id === order.id) {
                let exchange = bot.exchange;
                let side = order.side;
                let price = order.price;
                let amount = order.amount;
                let newSide, newAmount, newPrice;

                if (side === 'buy') {
                    newPrice = math.evaluate(`${price} + ((${price} / 100) * ${bot.config.deviationPriceBuy})`);
                    newAmount = math.evaluate(`${amount} + ((${amount} / 100) * ${bot.config.deviationAmountBuy})`);
                    newSide = 'sell';
                } else if (side === 'sell') {
                    newPrice = math.evaluate(`${price} - ((${price} / 100) * ${bot.config.deviationPriceSell})`);
                    newAmount = math.evaluate(`${amount} + ((${amount} / 100) * ${bot.config.deviationAmountSell})`);
                    newSide = 'buy';
                }

                let newOrderResponse = await nitroApp.ccxtw.createOrder(bot.userID, bot.exchange, bot.symbol, 'limit', newSide, newAmount, newPrice, false);

                if (newOrderResponse.success) {
                    this.orderCounts[exchange] = (this.orderCounts[exchange] || 0) + 1;
                    console.log(`\x1b[34m🔄 Comandă cu succes nr. ${this.orderCounts[exchange]} pe exchange-ul \x1b[1m${exchange}\x1b[0m`);

                    if (side === 'buy') {
                        this.buyCount++;
                        console.log(`\x1b[32m✔️ Tranzacție de tip \x1b[1mBUY\x1b[0;32m cu succes nr. ${this.buyCount} \x1b[0m pentru simbolul \x1b[1m${bot.symbol}\x1b[0m`);
                    } else if (side === 'sell') {
                        this.sellCount++;
                        console.log(`\x1b[31m✔️ Tranzacție de tip \x1b[1mSELL\x1b[0;31m cu succes nr. ${this.sellCount} \x1b[0m pentru simbolul \x1b[1m${bot.symbol}\x1b[0m`);
                    }

                    let filledOrders = bot.filledOrders;
                    filledOrders.push(bot.activeOrders[gridOrdersIndex]);

                    bot.activeOrders[gridOrdersIndex] = {
                        ...bot.activeOrders[gridOrdersIndex],
                        id: newOrderResponse.data.id,
                        price: newOrderResponse.data.price,
                        side: newOrderResponse.data.side,
                        amount: newOrderResponse.data.amount,
                    };

                    await gridBotSchema.updateOne({ _id: bot._id }, { activeOrders: bot.activeOrders, filledOrders: filledOrders });
                } else {
                    console.log(`\x1b[31m❌ ${newOrderResponse.log}\x1b[0m`);
                }
            }
        },

        getCurrentTime() {
            return moment(new Date()).format('lll');
        },

        async fetchGridBots(userID) {
            return await gridBotSchema.find({ userID });
        }
    };
});
