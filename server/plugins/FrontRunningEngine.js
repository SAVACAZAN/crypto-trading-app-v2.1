import { setIntervalAsync } from "set-interval-async"

export default defineNitroPlugin((nitroApp) => {
    startScheduler(nitroApp)
    // console.log('DCA Engine Loaded...')
})

function startScheduler(nitroApp) {
    setIntervalAsync(async () => {

        // get running bots
        let runningBots = await dcaBotSchema.find({isRunning: true});
        for (let bot of runningBots) {

            // console.log(bot.activeDeal.status);

            //NEW_DEAL --> 0
            if (bot.activeDeal.status === 'START_NEW_DEAL') {
                let log = `${nitroApp.DCALib.getCurrentTime()}: ${bot.symbol} - NEW_DEAL - Side: ${bot.direction}`;
                bot.logs.push(log);
                console.log(log);

                bot.activeDeal.status = 'PLACE_BASE_ORDER';
            }

            //PLACE_BASE_ORDER
            if (bot.activeDeal.status === 'PLACE_BASE_ORDER') {
                bot = await nitroApp.DCALib.placeBaseOrder(bot);
            }

            //PLACE_SAFETY_ORDER
            if (bot.activeDeal.status === 'PLACE_SAFETY_ORDER') {
                bot = await nitroApp.DCALib.placeSafetyOrder(bot);
            }

            //PLACE_TAKE_PROFIT_ORDER
            if (bot.activeDeal.status === 'PLACE_TAKE_PROFIT_ORDER') {
                bot = await nitroApp.DCALib.placeTakeProfitOrder(bot);
            }

            //PLACE_STOP_LOSS_ORDER
            if (bot.activeDeal.status === 'PLACE_STOP_LOSS_ORDER') {
                bot = await nitroApp.DCALib.placeStopLossOrder(bot);
            }

            //WAIT_FOR_FILLS
            if (bot.activeDeal.status === 'WAIT_FOR_FILLS') {

                ///BASE_ORDER_FILLED?
                if (bot.activeDeal.baseOrder !== null){
                    bot = await nitroApp.DCALib.checkBaseOrder(bot);
                }

                ///SAFETY_ORDER_FILLED?
                if (bot.activeDeal.safetyOrder !== null){
                    bot = await nitroApp.DCALib.checkSafetyOrder(bot);
                }

                ///TAKE_PROFIT_ORDER_FILLED?
                if (bot.activeDeal.takeProfitOrder !== null){
                    bot = await nitroApp.DCALib.checkTakeProfitOrder(bot);
                }

                ///STOP_LOSS_ORDER_FILLED?
                if (bot.activeDeal.stopLossOrder !== null){
                    bot = await nitroApp.DCALib.checkStopLossOrder(bot);
                }
            }

            await dcaBotSchema.updateOne({_id: bot._id}, bot);
        }


    }, 1000);
}
