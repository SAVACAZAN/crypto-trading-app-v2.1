import { create, all } from 'mathjs';
import moment from 'moment';
import { grinderBotSchema } from "../models/grinderBot.schema";

const config = {
    number: 'BigNumber',
    precision: 20
};

const math = create(all, config);

export default defineNitroPlugin((nitroApp) => {
    console.log('Grid Bots Library Loaded...');

    nitroApp.GrinderBotLib = {
        async createGrinderBot(data) {
            let orderBookData = await nitroApp.ccxtw.fetchOrderBook(data.userID, data.exchange, data.symbol);

            let price = orderBookData.data.bids[0][0];
            
            let orders = [];

            if (data.ordersSide === 'buyOnly') {
                orders.push(await this.placeOrder(data.userID, data.exchange, data.symbol, data.BalanceBotStart, 'buy', data.amountType, data.amount));
                orders.push(...await this.placeOrders(data.userID, data.exchange, data.symbol, prices.slice(1), 'sell', data.amountType, data.amount));
            } else if (data.ordersSide === 'sellOnly') {
                orders.push(await this.placeOrder(data.userID, data.exchange, data.symbol, data.BalanceBotStart, 'sell', data.amountType, data.amount));
                orders.push(...await this.placeOrders(data.userID, data.exchange, data.symbol, prices.slice(1), 'buy', data.amountType, data.amount));
            }

            data['activeOrders'] = orders;

            await new grinderBotSchema(data).save();
        },

   
        
        
        getCurrentTime() {
            return moment(new Date()).format('lll');
        },

        async fetchGrinderBots(userID, exchange, symbol) {
            let bots = await grinderBotSchema.find({ userID: userID });
            return bots;
        }
    };
});
