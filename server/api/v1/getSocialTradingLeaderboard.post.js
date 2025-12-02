import { gridBotSchema } from "~/server/models/gridBot.schema";

export default defineEventHandler(async (event) => {
    const data = await readBody(event);
    const period = data.period || '7d';

    console.log('[API getSocialTradingLeaderboard] Request received:', { period });

    try {
        // Calculate date filter based on period
        let dateFilter = null;
        const now = new Date();

        switch (period) {
            case '24h':
                dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'all':
            default:
                dateFilter = null;
                break;
        }

        // Fetch all grid bots
        const query = dateFilter
            ? { createdAt: { $gte: dateFilter } }
            : {};

        const allBots = await gridBotSchema.find(query).lean();

        // Group bots by user and calculate statistics
        const userStats = {};

        allBots.forEach(bot => {
            const userId = bot.userID;

            if (!userStats[userId]) {
                userStats[userId] = {
                    userID: userId,
                    username: bot.username || `User_${userId.substring(0, 8)}`,
                    totalProfit: 0,
                    totalInvestment: 0,
                    activeBots: 0,
                    totalTrades: 0,
                    winningTrades: 0,
                    losingTrades: 0,
                    bots: []
                };
            }

            const profit = parseFloat(bot.BalanceBot?.BalanceBotProfit || 0);
            const investment = parseFloat(bot.amount || 0);
            const filledOrders = bot.filledOrders || [];

            userStats[userId].totalProfit += profit;
            userStats[userId].totalInvestment += investment;
            userStats[userId].activeBots += bot.status === 'active' ? 1 : 0;
            userStats[userId].totalTrades += filledOrders.length;
            userStats[userId].bots.push(bot);

            // Count winning vs losing trades
            filledOrders.forEach(order => {
                const orderProfit = parseFloat(order.profit || 0);
                if (orderProfit > 0) {
                    userStats[userId].winningTrades++;
                } else if (orderProfit < 0) {
                    userStats[userId].losingTrades++;
                }
            });
        });

        // Convert to array and calculate ROI and win rate
        const leaderboard = Object.values(userStats).map(user => {
            const roi = user.totalInvestment > 0
                ? (user.totalProfit / user.totalInvestment) * 100
                : 0;

            const winRate = user.totalTrades > 0
                ? (user.winningTrades / user.totalTrades) * 100
                : 0;

            return {
                userID: user.userID,
                username: user.username,
                totalProfit: user.totalProfit,
                roi: roi,
                winRate: winRate,
                activeBots: user.activeBots,
                totalTrades: user.totalTrades,
                winningTrades: user.winningTrades,
                losingTrades: user.losingTrades
            };
        });

        // Sort by total profit (descending)
        leaderboard.sort((a, b) => b.totalProfit - a.totalProfit);

        // Take top 20
        const topTraders = leaderboard.slice(0, 20);

        console.log('[API getSocialTradingLeaderboard] Success:', {
            period,
            totalTraders: leaderboard.length,
            topTraders: topTraders.length
        });

        return {
            success: true,
            data: topTraders,
            meta: {
                period,
                totalTraders: leaderboard.length,
                dateFilter: dateFilter ? dateFilter.toISOString() : null
            }
        };

    } catch (error) {
        console.error('[API getSocialTradingLeaderboard] Error:', error);
        return {
            success: false,
            message: 'Error fetching leaderboard: ' + error.message
        };
    }
});
