import { gridBotSchema } from "~/server/models/gridBot.schema";
import { dcaGridBotSchema } from "~/server/models/dcaGridBot.schema";
import { smartDcaBotSchema } from "~/server/models/smartDcaBot.schema";
import { dcaBotaSchema as FronRunSchema } from "~/server/models/frontRunningBot.schema";
import { Scalp1ngBotSchema } from "~/server/models/Scalp1ngBot.schema";
import { FibBotSchema } from "~/server/models/FibBot.schema";
import { CoPilotBotSchema } from "~/server/models/CoPilotBot.schema";
import { grinderBotSchema } from "~/server/models/grinderBot.schema";
import { OneClickBotSchema } from "~/server/models/OneClickBot.schema";
import { dcaBotSchema } from "~/server/models/dcaBot.schema";

/**
 * Fetch ALL active bots from all types (Grid, DCA, Smart DCA, etc.)
 * Used by Palantir Active Bots page
 */
export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { userID } = body;

        if (!userID) {
            throw createError({
                statusCode: 400,
                statusMessage: 'userID is required'
            });
        }

        console.log('🤖 [FetchAllActiveBots] Fetching all bots for user:', userID);

        const allBots = [];

        // 1. Fetch Grid Bots
        try {
            const gridBots = await gridBotSchema.find({ userID });
            console.log(`📊 Found ${gridBots.length} Grid Bots`);

            gridBots.forEach(bot => {
                allBots.push({
                    id: bot._id.toString(),
                    name: bot.name || `Grid Bot ${bot._id.toString().slice(-4)}`,
                    type: 'GridBot',
                    exchange: bot.exchange || 'unknown',
                    symbol: bot.symbol || 'N/A',
                    strategy: bot.ordersSide?.toUpperCase() || 'NEUTRAL',
                    status: bot.status === 'running' ? 'running' : bot.status === 'paused' ? 'paused' : 'stopped',
                    pnl: calculatePnL(bot.filledOrders || []),
                    orders: bot.activeOrders?.length || 0,
                    totalOrders: bot.nrOfGrids || 0,
                    filled: calculateFilledPercent(bot.filledOrders?.length || 0, bot.nrOfGrids || 0),
                    runtime: calculateRuntime(bot.createdAt || bot.timestamp),
                    apiKeyNames: bot.apiKeyNames || [],
                    createdAt: bot.createdAt || bot.timestamp,
                    rawData: bot
                });
            });
        } catch (error) {
            console.error('❌ Error fetching Grid Bots:', error.message);
        }

        // 2. Fetch DCA Grid Bots
        try {
            const dcaBots = await dcaGridBotSchema.find({ userID });
            console.log(`💰 Found ${dcaBots.length} DCA Grid Bots`);

            dcaBots.forEach(bot => {
                allBots.push({
                    id: bot._id.toString(),
                    name: bot.name || `DCA Bot ${bot._id.toString().slice(-4)}`,
                    type: 'DCABot',
                    exchange: bot.exchange || 'unknown',
                    symbol: bot.symbol || 'N/A',
                    strategy: 'BUY',
                    status: bot.status === 'running' ? 'running' : bot.status === 'paused' ? 'paused' : 'stopped',
                    pnl: calculatePnL(bot.filledOrders || []),
                    orders: bot.activeOrders?.length || 0,
                    totalOrders: bot.gridLevels || 0,
                    filled: calculateFilledPercent(bot.filledOrders?.length || 0, bot.gridLevels || 0),
                    runtime: calculateRuntime(bot.createdAt || bot.timestamp),
                    apiKeyNames: bot.apiKeyNames || [],
                    createdAt: bot.createdAt || bot.timestamp,
                    rawData: bot
                });
            });
        } catch (error) {
            console.error('❌ Error fetching DCA Grid Bots:', error.message);
        }

        // 3. Fetch Smart DCA Bots
        try {
            const smartDcaBots = await smartDcaBotSchema.find({ userID });
            console.log(`🎯 Found ${smartDcaBots.length} Smart DCA Bots`);

            smartDcaBots.forEach(bot => {
                allBots.push({
                    id: bot._id.toString(),
                    name: bot.name || `Smart DCA ${bot._id.toString().slice(-4)}`,
                    type: 'SmartDCABot',
                    exchange: bot.exchange || 'unknown',
                    symbol: bot.symbol || 'N/A',
                    strategy: 'BUY',
                    status: bot.status === 'running' ? 'running' : bot.status === 'paused' ? 'paused' : 'stopped',
                    pnl: calculatePnL(bot.filledOrders || []),
                    orders: bot.activeOrders?.length || 0,
                    totalOrders: bot.totalOrders || 0,
                    filled: calculateFilledPercent(bot.filledOrders?.length || 0, bot.totalOrders || 0),
                    runtime: calculateRuntime(bot.createdAt),
                    apiKeyNames: bot.apiKeyNames || [],
                    createdAt: bot.createdAt,
                    rawData: bot
                });
            });
        } catch (error) {
            console.error('❌ Error fetching Smart DCA Bots:', error.message);
        }

        // 4. Fetch FrontRun Bots
        try {
            const frontRunBots = await FronRunSchema.find({ userID });
            console.log(`🏃 Found ${frontRunBots.length} FrontRun Bots`);

            frontRunBots.forEach(bot => {
                allBots.push({
                    id: bot._id.toString(),
                    name: bot.name || `FrontRun ${bot._id.toString().slice(-4)}`,
                    type: 'FrontRunBot',
                    exchange: bot.exchange || 'unknown',
                    symbol: bot.symbol || 'N/A',
                    strategy: 'NEUTRAL',
                    status: bot.status === 'running' ? 'running' : bot.status === 'paused' ? 'paused' : 'stopped',
                    pnl: calculatePnL(bot.filledOrders || []),
                    orders: bot.activeOrders?.length || 0,
                    totalOrders: bot.totalOrders || 0,
                    filled: calculateFilledPercent(bot.filledOrders?.length || 0, bot.totalOrders || 0),
                    runtime: calculateRuntime(bot.createdAt || bot.timestamp),
                    apiKeyNames: bot.apiKeyNames || [],
                    createdAt: bot.createdAt || bot.timestamp,
                    rawData: bot
                });
            });
        } catch (error) {
            console.error('❌ Error fetching FrontRun Bots:', error.message);
        }

        // 5. Fetch Scalping Bots
        try {
            const scalpBots = await Scalp1ngBotSchema.find({ userID });
            console.log(`⚡ Found ${scalpBots.length} Scalping Bots`);

            scalpBots.forEach(bot => {
                allBots.push({
                    id: bot._id.toString(),
                    name: bot.name || `Scalping ${bot._id.toString().slice(-4)}`,
                    type: 'Scalp1ngBot',
                    exchange: bot.exchange || 'unknown',
                    symbol: bot.symbol || 'N/A',
                    strategy: bot.side?.toUpperCase() || 'NEUTRAL',
                    status: bot.status === 'running' ? 'running' : bot.status === 'paused' ? 'paused' : 'stopped',
                    pnl: calculatePnL(bot.filledOrders || []),
                    orders: bot.activeOrders?.length || 0,
                    totalOrders: bot.totalOrders || 0,
                    filled: calculateFilledPercent(bot.filledOrders?.length || 0, bot.totalOrders || 0),
                    runtime: calculateRuntime(bot.createdAt || bot.timestamp),
                    apiKeyNames: bot.apiKeyNames || [],
                    createdAt: bot.createdAt || bot.timestamp,
                    rawData: bot
                });
            });
        } catch (error) {
            console.error('❌ Error fetching Scalping Bots:', error.message);
        }

        // 6. Fetch Fib Bots
        try {
            const fibBots = await FibBotSchema.find({ userID });
            console.log(`📐 Found ${fibBots.length} Fib Bots`);

            fibBots.forEach(bot => {
                allBots.push({
                    id: bot._id.toString(),
                    name: bot.name || `Fib ${bot._id.toString().slice(-4)}`,
                    type: 'FibBot',
                    exchange: bot.exchange || 'unknown',
                    symbol: bot.symbol || 'N/A',
                    strategy: bot.side?.toUpperCase() || 'NEUTRAL',
                    status: bot.status === 'running' ? 'running' : bot.status === 'paused' ? 'paused' : 'stopped',
                    pnl: calculatePnL(bot.filledOrders || []),
                    orders: bot.activeOrders?.length || 0,
                    totalOrders: bot.totalOrders || 0,
                    filled: calculateFilledPercent(bot.filledOrders?.length || 0, bot.totalOrders || 0),
                    runtime: calculateRuntime(bot.createdAt || bot.timestamp),
                    apiKeyNames: bot.apiKeyNames || [],
                    createdAt: bot.createdAt || bot.timestamp,
                    rawData: bot
                });
            });
        } catch (error) {
            console.error('❌ Error fetching Fib Bots:', error.message);
        }

        // 7. Fetch CoPilot Bots
        try {
            const copilotBots = await CoPilotBotSchema.find({ userID });
            console.log(`✈️ Found ${copilotBots.length} CoPilot Bots`);

            copilotBots.forEach(bot => {
                allBots.push({
                    id: bot._id.toString(),
                    name: bot.name || `CoPilot ${bot._id.toString().slice(-4)}`,
                    type: 'CoPilotBot',
                    exchange: bot.exchange || 'unknown',
                    symbol: bot.symbol || 'N/A',
                    strategy: bot.side?.toUpperCase() || 'NEUTRAL',
                    status: bot.status === 'running' ? 'running' : bot.status === 'paused' ? 'paused' : 'stopped',
                    pnl: calculatePnL(bot.filledOrders || []),
                    orders: bot.activeOrders?.length || 0,
                    totalOrders: bot.totalOrders || 0,
                    filled: calculateFilledPercent(bot.filledOrders?.length || 0, bot.totalOrders || 0),
                    runtime: calculateRuntime(bot.createdAt || bot.timestamp),
                    apiKeyNames: bot.apiKeyNames || [],
                    createdAt: bot.createdAt || bot.timestamp,
                    rawData: bot
                });
            });
        } catch (error) {
            console.error('❌ Error fetching CoPilot Bots:', error.message);
        }

        // 8. Fetch Grinder Bots
        try {
            const grinderBots = await grinderBotSchema.find({ userID });
            console.log(`⚙️ Found ${grinderBots.length} Grinder Bots`);

            grinderBots.forEach(bot => {
                allBots.push({
                    id: bot._id.toString(),
                    name: bot.name || `Grinder ${bot._id.toString().slice(-4)}`,
                    type: 'GrinderBot',
                    exchange: bot.exchange || 'unknown',
                    symbol: bot.symbol || 'N/A',
                    strategy: bot.side?.toUpperCase() || 'NEUTRAL',
                    status: bot.status === 'running' ? 'running' : bot.status === 'paused' ? 'paused' : 'stopped',
                    pnl: calculatePnL(bot.filledOrders || []),
                    orders: bot.activeOrders?.length || 0,
                    totalOrders: bot.totalOrders || 0,
                    filled: calculateFilledPercent(bot.filledOrders?.length || 0, bot.totalOrders || 0),
                    runtime: calculateRuntime(bot.createdAt || bot.timestamp),
                    apiKeyNames: bot.apiKeyNames || [],
                    createdAt: bot.createdAt || bot.timestamp,
                    rawData: bot
                });
            });
        } catch (error) {
            console.error('❌ Error fetching Grinder Bots:', error.message);
        }

        // 9. Fetch OneClick Bots
        try {
            const oneClickBots = await OneClickBotSchema.find({ userID });
            console.log(`🖱️ Found ${oneClickBots.length} OneClick Bots`);

            oneClickBots.forEach(bot => {
                allBots.push({
                    id: bot._id.toString(),
                    name: bot.name || `OneClick ${bot._id.toString().slice(-4)}`,
                    type: 'OneClickBot',
                    exchange: bot.exchange || 'unknown',
                    symbol: bot.symbol || 'N/A',
                    strategy: bot.side?.toUpperCase() || 'NEUTRAL',
                    status: bot.status === 'running' ? 'running' : bot.status === 'paused' ? 'paused' : 'stopped',
                    pnl: calculatePnL(bot.filledOrders || []),
                    orders: bot.activeOrders?.length || 0,
                    totalOrders: bot.totalOrders || 0,
                    filled: calculateFilledPercent(bot.filledOrders?.length || 0, bot.totalOrders || 0),
                    runtime: calculateRuntime(bot.createdAt || bot.timestamp),
                    apiKeyNames: bot.apiKeyNames || [],
                    createdAt: bot.createdAt || bot.timestamp,
                    rawData: bot
                });
            });
        } catch (error) {
            console.error('❌ Error fetching OneClick Bots:', error.message);
        }

        // 10. Fetch DCA Bots (legacy)
        try {
            const dcaBots = await dcaBotSchema.find({ userID });
            console.log(`📈 Found ${dcaBots.length} DCA Bots (legacy)`);

            dcaBots.forEach(bot => {
                allBots.push({
                    id: bot._id.toString(),
                    name: bot.name || `DCA ${bot._id.toString().slice(-4)}`,
                    type: 'DcaBot',
                    exchange: bot.exchange || 'unknown',
                    symbol: bot.symbol || 'N/A',
                    strategy: 'BUY',
                    status: bot.status === 'running' ? 'running' : bot.status === 'paused' ? 'paused' : 'stopped',
                    pnl: calculatePnL(bot.filledOrders || []),
                    orders: bot.activeOrders?.length || 0,
                    totalOrders: bot.totalOrders || 0,
                    filled: calculateFilledPercent(bot.filledOrders?.length || 0, bot.totalOrders || 0),
                    runtime: calculateRuntime(bot.createdAt || bot.timestamp),
                    apiKeyNames: bot.apiKeyNames || [],
                    createdAt: bot.createdAt || bot.timestamp,
                    rawData: bot
                });
            });
        } catch (error) {
            console.error('❌ Error fetching DCA Bots (legacy):', error.message);
        }

        // Sort by creation date (newest first)
        allBots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Calculate global stats
        const stats = {
            running: allBots.filter(b => b.status === 'running').length,
            paused: allBots.filter(b => b.status === 'paused').length,
            stopped: allBots.filter(b => b.status === 'stopped').length,
            totalPnL: allBots.reduce((sum, b) => sum + b.pnl, 0).toFixed(2),
            winRate: calculateWinRate(allBots),
            activeOrders: allBots.reduce((sum, b) => sum + b.orders, 0)
        };

        console.log('✅ [FetchAllActiveBots] Total bots:', allBots.length);
        console.log('📊 Stats:', stats);

        return {
            success: true,
            bots: allBots,
            stats: stats,
            total: allBots.length
        };

    } catch (error) {
        console.error('❌ [FetchAllActiveBots] Error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to fetch bots'
        });
    }
});

// Helper functions
function calculatePnL(filledOrders) {
    if (!filledOrders || filledOrders.length === 0) return 0;

    const totalProfit = filledOrders.reduce((sum, order) => {
        return sum + (parseFloat(order.profit) || 0);
    }, 0);

    return parseFloat(totalProfit.toFixed(2));
}

function calculateFilledPercent(filled, total) {
    if (!total || total === 0) return 0;
    return Math.round((filled / total) * 100);
}

function calculateRuntime(startTime) {
    if (!startTime) return '0m';

    const now = new Date();
    const start = new Date(startTime);
    const diff = now - start;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

function calculateWinRate(bots) {
    const botsWithTrades = bots.filter(b => b.totalOrders > 0);
    if (botsWithTrades.length === 0) return 0;

    const profitableBots = botsWithTrades.filter(b => b.pnl > 0).length;
    return parseFloat(((profitableBots / botsWithTrades.length) * 100).toFixed(1));
}
