import {SMA, RSI, CrossUp, CrossDown} from 'technicalindicators';
import moment from 'moment';
import { create, all } from 'mathjs';
import {OneClickBotSchema} from "~/server/models/OneClickBot.schema";

const config = {
    number: 'BigNumber',
    precision: 20
}
const math = create(all, config);

export default defineNitroPlugin((nitroApp) => {
    console.log('OneClick Bots Library Loaded...')

    nitroApp.OneClickBotLib = {
        createBot: async function(data){

            // console.log('this hit?');

            let prices = [];
            let gridWidth = math.evaluate(`((${data.upperPrice} - ${data.lowerPrice}) / ${data.nrOfGrids})`);
            let currentPrice = data.lowerPrice;


            for (let i = 0; i < data.nrOfGrids; i++) {
                currentPrice = math.evaluate(`${currentPrice} + ${gridWidth}`);
                prices.push(math.evaluate(`${currentPrice} + ${gridWidth}`));
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

            if (data.ordersSide === 'buyOrSell') {
                let buyOrders = await this.placeBuyOrders(data.userID, data.exchange, data.symbol, buyPrices, data.amountType, data.amount, data.nrOfGrids, data.incrementalPercentAmountBuy);
                for (let i = 0; i < buyOrders.length; i++) {
                    orders.push(buyOrders[i]);
                }

                let sellOrders = await this.placeSellOrders(data.userID, data.exchange, data.symbol, sellPrices, data.amountType, data.amount, data.nrOfGrids, data.incrementalPercentAmountSell);
                for (let i = 0; i < sellOrders.length; i++) {
                    orders.push(sellOrders[i]);
                }
            }

            if (data.ordersSide === 'buyOnly') {
                let buyOrders = await this.placeBuyOrders(data.userID, data.exchange, data.symbol, buyPrices, data.amountType, data.amount, data.nrOfGrids, data.incrementalPercentAmountBuy);
                for (let i = 0; i < buyOrders.length; i++) {
                    orders.push(buyOrders[i]);
                }
            }

            if (data.ordersSide === 'sellOnly')  {
                let sellOrders = await this.placeSellOrders(data.userID, data.exchange, data.symbol, sellPrices, data.amountType, data.amount, data.nrOfGrids, data.incrementalPercentAmountSell);
                for (let i = 0; i < sellOrders.length; i++) {
                    orders.push(sellOrders[i]);
                }
            }

            data['activeOrders'] = orders;

            await new OneClickBotSchema(data).save()
        },

        async placeBuyOrders(userID, exchange, symbol, buyPrices, amountType, amount, nrOfGrids, incrementalPercentAmount) {
            //buy
            let orders = [];
            let localIndex = 1;
            for (let i = buyPrices.length - 1; i > 0; i--) {
                let log = null;
                let price = buyPrices[i];
                let quantityPerGrid = await this.getQuantityPerGrid(price, amountType, amount, nrOfGrids, incrementalPercentAmount, localIndex);

                console.log(userID, exchange, symbol, 'limit', 'buy', quantityPerGrid, price);

                let orderResponse = await nitroApp.ccxtw.createOrder(userID, exchange, symbol, 'limit', 'buy', quantityPerGrid, price);

                if (orderResponse.success) {

                    orders.push({
                        id:orderResponse.data.id,
                        price:orderResponse.data.price,
                        side:orderResponse.data.side,
                        size:orderResponse.data.size,
                        amount:orderResponse.data.amount,
                    });
                    log =`${this.getCurrentTime()}: ${symbol}- PLACINGxx_GRID_ORDER\x1b[33m - Type: limit, Side: \x1b[32mbuy, \x1b[33mAmount:\x1b[32m ${quantityPerGrid}, \x1b[33mPrice:\x1b[32m   ${price}`;
                }

                if (!orderResponse.success) {
                    log =`${this.getCurrentTime()}: ${symbol} - PLACINGxx_GRID_ORDER - ${orderResponse.log}`;
                }

                console.log(log);
                localIndex++;
            }

            return orders;
        },

        async placeSellOrders(userID, exchange, symbol, sellPrices, amountType, amount, nrOfGrids, incrementalPercentAmount) {
            //sell
            let orders = [];
            let localIndex = 1;
            for (let i = 0; i < sellPrices.length; i++) {
                let log = null;
                let price = sellPrices[i];
                let quantityPerGrid = await this.getQuantityPerGrid(price, amountType, amount, nrOfGrids, incrementalPercentAmount, localIndex);

                console.log(userID, exchange, symbol, 'limit', 'buy', quantityPerGrid, price);

                let orderResponse = await nitroApp.ccxtw.createOrder(userID, exchange, symbol, 'limit', 'sell', quantityPerGrid, price);

                if (orderResponse.success) {
                    orders.push({
                        id:orderResponse.data.id,
                        price: orderResponse.data.price,
                        side: orderResponse.data.side,
                        size:orderResponse.data.size,
                        amount:orderResponse.data.amount,
                    });
                    log =`${this.getCurrentTime()}: ${symbol} - PLACINGxx_GRID_ORDER - Type: limit, Side: \x1B[31msell, \x1b[33mAmount:\x1B[31m ${quantityPerGrid}, \x1b[33mPrice:\x1B[31m ${price}\x1b[33m`;
                }

                if (!orderResponse.success) {
                    log =`${this.getCurrentTime()}: ${symbol} - PLACINGxx_GRID_ORDER - ${orderResponse.log}`;
                }

                console.log(log);
                localIndex++;
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
     
                         // Save the ORIGINAL filled order (with original side) to filledOrders FIRST
                         let filledOrders = bot.filledOrders;
                         const originalFilledOrder = { ...bot.activeOrders[gridOrdersIndex] };
                         filledOrders.push(originalFilledOrder);

                         // THEN update the active order with the NEW inverse order data
                         bot.activeOrders[gridOrdersIndex] = {
                             ...bot.activeOrders[gridOrdersIndex],
                             id: newOrderResponse.data.id,
                             price: newOrderResponse.data.price,
                             side: newOrderResponse.data.side,
                             amount: newOrderResponse.data.amount,
                         };
     
                         await OneClickBotSchema.updateOne({ _id: bot._id }, { activeOrders: bot.activeOrders, filledOrders: filledOrders });
                     } else {
                         console.log(`\x1b[31m❌ ${newOrderResponse.log}\x1b[0m`);
                     }
                 }
             },

        getCurrentTime() {
            return moment(new Date()).format('lll');
        },

        async fetchOneClickBots(userID, exchange, symbol) {
            let bots = await OneClickBotSchema.find({userID: userID});
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
