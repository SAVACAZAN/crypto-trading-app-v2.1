import { setIntervalAsync } from "set-interval-async"
import {gridBotSchema} from "~/server/models/gridBot.schema";

export default defineNitroPlugin((nitroApp) => {
    startScheduler(nitroApp)
    // console.log('GriD Bot Engine Loaded...')
})

function startScheduler(nitroApp) {
    setIntervalAsync(async () => {

        //get bots from db
        let runningBots = await gridBotSchema.find({});

        // console.log(runningBots);

        for (const bot of runningBots) {

            //get exchange orders
            let exchangeOrders = await nitroApp.ccxtw.fetchClosedOrders(bot.userID, bot.exchange, bot.symbol);

            if (exchangeOrders.success) {
                for (let exchangeOrdersIndex = 0; exchangeOrdersIndex < exchangeOrders.data.length; exchangeOrdersIndex++) {
                    const exchangeOrder = exchangeOrders.data[exchangeOrdersIndex];
                    // order.status

                    for (let gridOrdersIndex = 0; gridOrdersIndex < bot.activeOrders.length; gridOrdersIndex++) {
                        const dbOrder = bot.activeOrders[gridOrdersIndex];

                        await nitroApp.GridBotsLib.checkAndPlaceOrder(dbOrder, exchangeOrder, bot, gridOrdersIndex);
                    }
                }
            } else {
                // console.log(exchangeOrders.log);
            }
        }
    }, 1000);
}
