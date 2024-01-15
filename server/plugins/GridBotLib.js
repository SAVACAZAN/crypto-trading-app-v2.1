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

            await new gridBotSchema(data).save()
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
                    log =`${this.getCurrentTime()}: ${symbol}- PLACING_GRID_ORDER\x1b[33m - Type: limit, Side: \x1b[32mbuy, \x1b[33mAmount:\x1b[32m ${quantityPerGrid}, \x1b[33mPrice:\x1b[32m   ${price}`;
                }

                if (!orderResponse.success) {
                    log =`${this.getCurrentTime()}: ${symbol} - PLACING_GRID_ORDER - ${orderResponse.log}`;
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
                    log =`${this.getCurrentTime()}: ${symbol} - PLACING_GRID_ORDER - Type: limit, Side: \x1B[31msell, \x1b[33mAmount:\x1B[31m ${quantityPerGrid}, \x1b[33mPrice:\x1B[31m ${price}\x1b[33m`;
                }

                if (!orderResponse.success) {
                    log =`${this.getCurrentTime()}: ${symbol} - PLACING_GRID_ORDER - ${orderResponse.log}`;
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
                        newPrice = math.evaluate(`${price} + ((${price} / 100) * ${bot.deviationPriceBuy})`);
                    }
                    newAmount = math.evaluate(`${amount} + ((${amount} / 100) * ${bot.deviationAmountBuy})`);
                    newSide = 'sell';
                }

                if (side === 'sell') {
                    if(bot.usePriceGroup) {
                        newPrice = bot.priceGroupBuy;
                    } else {
                        newPrice = math.evaluate(`${price} - ((${price} / 100) * ${bot.deviationPriceSell})`);
                    }
                    newAmount = math.evaluate(`${amount} + ((${amount} / 100) * ${bot.deviationAmountSell})`);
                    newSide = 'buy';
                }

                let newOrderResponse = await nitroApp.ccxtw.createOrder(bot.userID, bot.exchange, bot.symbol, 'limit', newSide, newAmount, newPrice, false);

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
                    console.log(`Comandă cu succes nr. ${orderCounts[exchange]}`);

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
