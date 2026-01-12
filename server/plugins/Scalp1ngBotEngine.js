import { setIntervalAsync } from "set-interval-async"
import {Scalp1ngBotSchema} from "../models/Scalp1ngBot.schema";

export default defineNitroPlugin((nitroApp) => {
    startScheduler(nitroApp)
    // console.log('GriD Bot Engine Loaded...')
})

async function startScheduler(nitroApp) {
    // DISABLED - Scalp1ngBotLib.checkAndPlaceOrder is not implemented
    // This was causing continuous fetchClosedOrders calls every 1 second
    console.log('[Scalp1ng Bot Engine] ⚠️ Scheduler DISABLED - checkAndPlaceOrder not implemented');

    /*
    setIntervalAsync(async () => {

        // Obțineți botii din baza de date
        let runningBots = await Scalp1ngBotSchema.find({});

        for (const bot of runningBots) {

            // Obțineți ordinele de pe exchange
            let exchangeOrders = await nitroApp.ccxtw.fetchClosedOrders(bot.userID, bot.exchange, bot.symbol);

            if (exchangeOrders.success) {
                for (let exchangeOrdersIndex = 0; exchangeOrdersIndex < exchangeOrders.data.length; exchangeOrdersIndex++) {
                    const exchangeOrder = exchangeOrders.data[exchangeOrdersIndex];

                    for (let gridOrdersIndex = 0; gridOrdersIndex < bot.activeOrders.length; gridOrdersIndex++) {
                        const dbOrder = bot.activeOrders[gridOrdersIndex];

                        // Verifică și plasează orderul, actualizând PriceStart și listele de prețuri
                        await nitroApp.Scalp1ngBotLib.checkAndPlaceOrder(dbOrder, exchangeOrder, bot, gridOrdersIndex);
                    }
                }
            } else {
                console.log(exchangeOrders.log);
            }
        }
    }, 1000);
    */
}

