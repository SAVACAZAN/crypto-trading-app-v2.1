import { gridBotSchema } from "~/server/models/gridBot.schema";

export default defineEventHandler(async (event) => {
    const data = await readBody(event);

    console.log('[API updateGridStats] Request received:', {
        botId: data.botId,
        userID: data.userID
    });

    try {
        // Get the bot
        const bot = await gridBotSchema.findOne({
            _id: data.botId,
            userID: data.userID
        });

        if (!bot) {
            return {
                success: false,
                message: 'Bot not found'
            };
        }

        // Initialize gridStats if not exists
        if (!bot.gridStats) {
            bot.gridStats = [];
        }

        // Process filled orders to update grid statistics
        const filledOrders = bot.filledOrders || [];

        // Group filled orders by price to count refills
        const gridMap = new Map();

        filledOrders.forEach(order => {
            const price = parseFloat(order.price);
            const side = order.side;
            const amount = parseFloat(order.amount || order.filled || 0);
            const timestamp = order.timestamp || order.datetime;

            // Skip invalid orders with NaN price or missing side
            if (isNaN(price) || !side) {
                console.log('[API updateGridStats] Skipping invalid order:', { price: order.price, side });
                return;
            }

            // Create a key for this grid level (price + side)
            const key = `${price.toFixed(6)}_${side}`;

            if (!gridMap.has(key)) {
                gridMap.set(key, {
                    price: price,
                    side: side,
                    fillCount: 0,
                    totalVolume: 0,
                    fills: []
                });
            }

            const gridData = gridMap.get(key);
            gridData.fillCount++;
            gridData.totalVolume += amount;
            gridData.fills.push({
                timestamp: timestamp,
                amount: amount,
                orderId: order.id
            });
        });

        // Convert map to array and calculate statistics
        const newGridStats = [];

        for (const [key, gridData] of gridMap.entries()) {
            // Sort fills by timestamp
            gridData.fills.sort((a, b) => {
                const dateA = new Date(a.timestamp || 0);
                const dateB = new Date(b.timestamp || 0);
                return dateA - dateB;
            });

            const firstFill = gridData.fills[0];
            const lastFill = gridData.fills[gridData.fills.length - 1];

            // Calculate profit for this grid
            // For a complete cycle: BUY order filled, then corresponding SELL order filled
            // Simplified: we'll calculate based on spread
            let totalProfit = 0;
            const gridSpread = bot.upperPrice && bot.lowerPrice && bot.nrOfGrids
                ? (parseFloat(bot.upperPrice) - parseFloat(bot.lowerPrice)) / bot.nrOfGrids
                : 0;

            // Estimate profit: each fill cycle gains the grid spread
            if (gridData.side === 'buy') {
                // BUY fills will profit when price goes up
                totalProfit = gridData.fillCount * gridData.totalVolume / gridData.fillCount * gridSpread;
            } else {
                // SELL fills already captured the profit
                totalProfit = gridData.fillCount * gridData.totalVolume / gridData.fillCount * gridSpread;
            }

            newGridStats.push({
                price: gridData.price,
                side: gridData.side,
                fillCount: gridData.fillCount,
                totalVolume: gridData.totalVolume,
                totalProfit: totalProfit,
                firstFilledAt: firstFill ? new Date(firstFill.timestamp) : null,
                lastFilledAt: lastFill ? new Date(lastFill.timestamp) : null,
                averageAmount: gridData.totalVolume / gridData.fillCount
            });
        }

        // Sort by fillCount (most active grids first)
        newGridStats.sort((a, b) => b.fillCount - a.fillCount);

        // Update bot with new grid statistics
        bot.gridStats = newGridStats;
        await bot.save();

        console.log('[API updateGridStats] Updated grid stats:', {
            botId: data.botId,
            totalGrids: newGridStats.length,
            mostActiveGrid: newGridStats[0]
        });

        return {
            success: true,
            message: 'Grid statistics updated',
            data: {
                totalGridLevels: newGridStats.length,
                totalFills: newGridStats.reduce((sum, grid) => sum + grid.fillCount, 0),
                mostActiveGrid: newGridStats[0] || null,
                gridStats: newGridStats
            }
        };

    } catch (error) {
        console.error('[API updateGridStats] Error:', error);
        return {
            success: false,
            message: 'Error updating grid stats: ' + error.message
        };
    }
});
