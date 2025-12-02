import { SMA, RSI, CrossUp, CrossDown } from 'technicalindicators';
import moment from 'moment';
import { create, all } from 'mathjs';
import { Scalp1ngBotSchema } from "~/server/models/Scalp1ngBot.schema";
import { dcaBotSchema } from "~/server/models/dcaBot.schema";

const config = {
    number: 'BigNumber',
    precision: 20
}
const math = create(all, config);

export default defineNitroPlugin((nitroApp) => {
    console.log('Scalp1ng Bots Library Loaded...')

    nitroApp.Scalp1ngBotLib = {
        async createBot(data) {
            let prices = [];
            let gridWidth = math.evaluate(`((${data.upperPrice} - ${data.lowerPrice}) / ${data.nrOfGrids})`);
            let currentPrice = data.lowerPrice;

            for (let i = 0; i < data.nrOfGrids; i++) {
                currentPrice = math.evaluate(`${currentPrice} + ${gridWidth}`);
                prices.push(currentPrice);
            }

            let sellPrices = prices; 
            let buyPrices = prices; 

            let orders = [];

            if (data.ordersSide === 'buyOrSell') {
                let buyOrders = await this.placeBuyOrders(data, buyPrices);
                orders.push(...buyOrders);

                let sellOrders = await this.placeSellOrders(data, sellPrices);
                orders.push(...sellOrders);
            }

            if (data.ordersSide === 'buyOnly') {
                let buyOrders = await this.placeBuyOrders(data, buyPrices);
                orders.push(...buyOrders);
            }

            if (data.ordersSide === 'sellOnly') {
                let sellOrders = await this.placeSellOrders(data, sellPrices);
                orders.push(...sellOrders);
            }

            data['activeOrders'] = orders;
            await new Scalp1ngBotSchema(data).save();
        },

        async placeBuyOrders(data, buyPrices) {
            let orders = [];
            let localIndex = 1;
            let totalFilledAmount = 0;

            for (let i = buyPrices.length - 1; i >= 0; i--) {
                let price = buyPrices[i];
                let quantityPerGrid = await this.getQuantityPerGrid(price, data.amountType, data.amount, data.nrOfGrids,  localIndex);

                console.log(data.userID, data.exchange, data.symbol, 'limit', 'buy', quantityPerGrid, price);

                let orderResponse = await nitroApp.ccxtw.createOrder(data.userID, data.exchange, data.symbol, 'limit', 'buy', quantityPerGrid, price);

                if (orderResponse.success && orderResponse.data) {
                    orders.push({
                        id: orderResponse.data.id,
                        price: orderResponse.data.price,
                        side: orderResponse.data.side,
                        size: orderResponse.data.size,
                        amount: orderResponse.data.amount,
                    });

                    console.log(`${this.getCurrentTime()}: ${data.symbol} - PLACING_GRID_ORDER - Type: limit, Side: buy, Amount: ${quantityPerGrid}, Price: ${price}`);

                    if (orderResponse.data.filled) {
                        let filledValue = quantityPerGrid * price;
                        totalFilledAmount += filledValue;
                    }

                    await new Promise(resolve => setTimeout(resolve, 25000));
                    await nitroApp.ccxtw.cancelOrder(data.userID, data.exchange, orderResponse.data.id, data.symbol);
                    console.log(`${this.getCurrentTime()}: ${data.symbol} - CANCELED_GRID_ORDER - Type: limit, Side: buy, Amount: ${quantityPerGrid}, Price: ${price}`);

                    await new Promise(resolve => setTimeout(resolve, 25000));
                } else {
                    console.log(`${this.getCurrentTime()}: ${data.symbol} - PLACING_GRID_ORDER - ${orderResponse.log}`);
                }

                localIndex++;
            }

            let BalanceBotRemain = data.BalanceBotStart - totalFilledAmount;
            console.log(`BalanceBotRemain: ${BalanceBotRemain} USD`);

            return orders;
        },

        async placeSellOrders(data, sellPrices) {
            let orders = [];
            let localIndex = 1;
            let totalFilledAmount = 0;

            for (let i = 0; i < sellPrices.length; i++) {
                let price = sellPrices[i];
                let quantityPerGrid = await this.getQuantityPerGrid(price, data.amountType, data.amount, data.nrOfGrids, localIndex);

                console.log(data.userID, data.exchange, data.symbol, 'limit', 'sell', quantityPerGrid, price);

                let orderResponse = await nitroApp.ccxtw.createOrder(data.userID, data.exchange, data.symbol, 'limit', 'sell', quantityPerGrid, price);

                if (orderResponse.success && orderResponse.data) {
                    orders.push({
                        id: orderResponse.data.id,
                        price: orderResponse.data.price,
                        side: orderResponse.data.side,
                        size: orderResponse.data.size,
                        amount: orderResponse.data.amount,
                    });

                    console.log(`${this.getCurrentTime()}: ${data.symbol} - PLACING_GRID_ORDER - Type: limit, Side: sell, Amount: ${quantityPerGrid}, Price: ${price}`);

                    if (orderResponse.data.filled) {
                        let filledValue = quantityPerGrid * price;
                        totalFilledAmount += filledValue;
                    }

                    await new Promise(resolve => setTimeout(resolve, 25000));
                    await nitroApp.ccxtw.cancelOrder(data.userID, data.exchange, orderResponse.data.id, data.symbol);
                    console.log(`${this.getCurrentTime()}: ${data.symbol} - CANCELED_GRID_ORDER - Type: limit, Side: sell, Amount: ${quantityPerGrid}, Price: ${price}`);

                    await new Promise(resolve => setTimeout(resolve, 25000));
                } else {
                    console.log(`${this.getCurrentTime()}: ${data.symbol} - PLACING_GRID_ORDER - ${orderResponse.log}`);
                }

                localIndex++;
            }

            let BalanceBotRemain = data.BalanceBotStart - totalFilledAmount;
            console.log(`BalanceBotRemain: ${BalanceBotRemain} USD`);

            return orders;
        },

        async getQuantityPerGrid(price, amountType, amount, nrOfGrids, index) {
            let quantityPerGrid = null;

            // Simplified to divide the amount by price
            quantityPerGrid = math.evaluate(`${amount} / ${price}`);

            return quantityPerGrid;
        },

        getCurrentTime() {
            return moment(new Date()).format('lll');
        },

        async fetchScalp1ngBot(userID, exchange, symbol) {
            return await Scalp1ngBotSchema.find({ userID: userID });
        }
    };
});
