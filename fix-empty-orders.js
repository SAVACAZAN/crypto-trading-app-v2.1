// Script to fix empty price/amount in activeOrders
// Run with: node fix-empty-orders.js

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = 'mongodb://127.0.0.1:27017/crypto-app-V1';

// GridBot Schema
const gridBotSchema = new mongoose.Schema({}, { strict: false });
const GridBot = mongoose.model('GridBot', gridBotSchema, 'gridbots');

async function fixEmptyOrders() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find all grid bots
        const bots = await GridBot.find({});
        console.log(`📊 Found ${bots.length} grid bots`);

        for (const bot of bots) {
            if (!bot.activeOrders || bot.activeOrders.length === 0) {
                continue;
            }

            let hasEmptyOrders = false;
            const updatedOrders = bot.activeOrders.map((order, index) => {
                // Check if order has empty price or amount
                if (!order.price || !order.amount || order.price === '' || order.amount === '') {
                    hasEmptyOrders = true;

                    // Try to reconstruct from grid configuration
                    const lowerPrice = parseFloat(bot.lowerPrice);
                    const upperPrice = parseFloat(bot.upperPrice);
                    const nrOfGrids = parseInt(bot.nrOfGrids);
                    const amount = parseFloat(bot.amount);

                    if (lowerPrice && upperPrice && nrOfGrids && amount) {
                        const priceStep = (upperPrice - lowerPrice) / nrOfGrids;

                        // Estimate price based on order position
                        const estimatedPrice = lowerPrice + (priceStep * index);

                        console.log(`  🔧 Fixing order ${order.id}: side=${order.side}, estimatedPrice=${estimatedPrice.toFixed(8)}, amount=${amount}`);

                        return {
                            ...order,
                            price: order.price || estimatedPrice.toFixed(8),
                            amount: order.amount || amount.toString()
                        };
                    } else {
                        console.log(`  ⚠️ Cannot fix order ${order.id}: missing bot config data`);
                        return order;
                    }
                }
                return order;
            });

            if (hasEmptyOrders) {
                console.log(`\n🔄 Bot: ${bot.name} (${bot._id})`);
                console.log(`  Symbol: ${bot.symbol}, Side: ${bot.ordersSide}`);
                console.log(`  Empty orders found, updating...`);

                await GridBot.updateOne(
                    { _id: bot._id },
                    { $set: { activeOrders: updatedOrders } }
                );

                console.log(`  ✅ Updated ${updatedOrders.length} orders`);
            }
        }

        console.log('\n✅ Fix completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixEmptyOrders();
