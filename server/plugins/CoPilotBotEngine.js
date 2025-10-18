import { setIntervalAsync } from "set-interval-async"
import {CoPilotBotSchema} from "../models/CoPilotBot.schema";

export default defineNitroPlugin((nitroApp) => {
    startScheduler(nitroApp)
    // console.log('GriD Bot Engine Loaded...')
})

async function startScheduler(nitroApp) {
    setIntervalAsync(async () => {

        // Obțineți botii din baza de date
        let runningBots = await CoPilotBotSchema.find({});

        for (const bot of runningBots) {

            // Obțineți ordinele de pe exchange
            let exchangeOrders = await nitroApp.ccxtw.fetchClosedOrders(bot.userID, bot.exchange, bot.symbol);

            if (exchangeOrders.success) {
                for (let exchangeOrdersIndex = 0; exchangeOrdersIndex < exchangeOrders.data.length; exchangeOrdersIndex++) {
                    const exchangeOrder = exchangeOrders.data[exchangeOrdersIndex];

                    for (let gridOrdersIndex = 0; gridOrdersIndex < bot.activeOrders.length; gridOrdersIndex++) {
                        const dbOrder = bot.activeOrders[gridOrdersIndex];

                        // Verifică și plasează orderul, actualizând PriceStart și listele de prețuri
                        await nitroApp.CoPilotBotLib.checkAndPlaceOrder(dbOrder, exchangeOrder, bot, gridOrdersIndex);
                    }
                }
            } else {
                console.log(exchangeOrders.log);
            }
        }
    }, 1000);
}

