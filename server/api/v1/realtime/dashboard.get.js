import { userExchangesSchema } from '~/server/models/userExchanges.schema';
import { gridBotSchema } from '~/server/models/gridBot.schema';
import { dcaBotSchema } from '~/server/models/dcaBot.schema';
import { smartDcaBotSchema } from '~/server/models/smartDcaBot.schema';
import { Scalp1ngBotSchema } from '~/server/models/Scalp1ngBot.schema';
import { FibBotSchema } from '~/server/models/FibBot.schema';
import { closedOrderHistorySchema } from '~/server/models/closedOrderHistory.schema';
import { OpenOrdersCacheSchema } from '~/server/models/openOrdersCache.schema';
import { balanceSchema } from '~/server/models/balance.schema';
import PatternDetection from '~/server/models/palantir/patternDetection.schema.js';
import BotChain from '~/server/models/palantir/botChain.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const userId = query.userId || 'system';

    // Get all user exchanges with API keys
    const userExchanges = await userExchangesSchema.find({ userID: userId });

    // Count active API keys across all exchanges
    let totalApiKeys = 0;
    let activeExchanges = 0;

    userExchanges.forEach(exchange => {
      if (exchange.apiKeys && exchange.apiKeys.length > 0) {
        totalApiKeys += exchange.apiKeys.length;
        activeExchanges++;
      }
    });

    // Get all bots
    const [gridBots, dcaBots, smartDcaBots, scalpingBots, fibBots] = await Promise.all([
      gridBotSchema.find({ userId }).lean(),
      dcaBotSchema.find({ userId }).lean(),
      smartDcaBotSchema.find({ userId, isActive: true }).lean(),
      Scalp1ngBotSchema.find({ userId }).lean(),
      FibBotSchema.find({ userId }).lean()
    ]);

    // Count running bots
    const runningBots = [
      ...gridBots.filter(b => b.status === 'running' || b.status === 'active'),
      ...dcaBots.filter(b => b.status === 'running' || b.status === 'active'),
      ...smartDcaBots,
      ...scalpingBots.filter(b => b.status === 'running'),
      ...fibBots.filter(b => b.status === 'running')
    ];

    // Get open orders from cache
    const openOrdersCache = await OpenOrdersCacheSchema.findOne({ userId });
    const openOrdersCount = openOrdersCache?.orders?.length || 0;

    // Get closed orders for P&L calculation
    const closedOrders = await closedOrderHistorySchema.find({ userId }).sort({ timestamp: -1 }).limit(1000).lean();

    // Calculate P&L
    let totalPnL = 0;
    let profitableOrders = 0;
    let totalOrders = closedOrders.length;

    closedOrders.forEach(order => {
      if (order.profit !== undefined) {
        totalPnL += parseFloat(order.profit) || 0;
        if (parseFloat(order.profit) > 0) profitableOrders++;
      }
    });

    const successRate = totalOrders > 0 ? ((profitableOrders / totalOrders) * 100).toFixed(1) : 0;

    // Get balances - MULTI-API support (all API keys combined)
    const balances = await balanceSchema.find({ userID: userId }).lean();
    let totalBalance = 0;

    // Sum balances across ALL API keys for all exchanges
    balances.forEach(bal => {
      if (bal.totalUSD) {
        totalBalance += parseFloat(bal.totalUSD) || 0;
      }
    });

    // Get Palantir patterns (last 24h)
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const patternsCount = await PatternDetection.countDocuments({
      userId,
      detectedAt: { $gte: last24h }
    });

    // Get active bot chains
    const activeChainsCount = await BotChain.countDocuments({
      userId,
      status: 'running'
    });

    // Recent activity
    const recentActivity = [];

    // Add recent bot starts
    runningBots.slice(0, 2).forEach(bot => {
      recentActivity.push({
        icon: '🤖',
        type: 'BOT STARTED',
        message: `${bot.botName || bot.name || 'Trading Bot'} started on ${bot.symbol || bot.pair}`,
        time: formatTimeAgo(bot.createdAt || bot.startTime),
        color: '#00d4ff'
      });
    });

    // Add recent orders
    closedOrders.slice(0, 2).forEach(order => {
      recentActivity.push({
        icon: '📊',
        type: `ORDER ${order.side?.toUpperCase() || 'FILLED'}`,
        message: `${order.side || 'Order'} ${order.amount || ''} ${order.symbol || ''} at $${order.price?.toFixed(2) || '0'}`,
        time: formatTimeAgo(order.timestamp || order.createdAt),
        color: order.side === 'buy' ? '#10eb04' : '#f52a09'
      });
    });

    // Add pattern detections
    const recentPatterns = await PatternDetection.find({ userId }).sort({ detectedAt: -1 }).limit(1).lean();
    if (recentPatterns.length > 0) {
      const pattern = recentPatterns[0];
      recentActivity.push({
        icon: '🔍',
        type: 'PATTERN DETECTED',
        message: `${pattern.patternType} pattern on ${pattern.symbol} (${pattern.confidence.toFixed(1)}% confidence)`,
        time: formatTimeAgo(pattern.detectedAt),
        color: '#10eb04'
      });
    }

    return {
      success: true,
      stats: {
        totalApiKeys,
        activeExchanges,
        activeBots: runningBots.length,
        openOrders: openOrdersCount,
        totalPnL: parseFloat(totalPnL.toFixed(2)),
        successRate: parseFloat(successRate),
        totalBalance: parseFloat(totalBalance.toFixed(2)),
        totalBots: gridBots.length + dcaBots.length + smartDcaBots.length + scalpingBots.length + fibBots.length,
        patternsDetected: patternsCount,
        activeChains: activeChainsCount
      },
      runningBots: runningBots.slice(0, 4).map(bot => ({
        id: bot._id.toString(),
        name: bot.botName || bot.name || 'Trading Bot',
        icon: getBotIcon(bot.type || 'grid'),
        type: bot.type || 'GridBot',
        symbol: bot.symbol || bot.pair || 'BTC/USDC',
        status: bot.status || 'running',
        pnl: parseFloat(bot.totalProfit || bot.profit || 0),
        orders: bot.filledOrders || bot.executedOrders || 0,
        totalOrders: bot.totalGrids || bot.totalOrders || 0,
        runtime: calculateRuntime(bot.createdAt || bot.startTime),
        exchange: bot.exchange || 'LCX'
      })),
      recentActivity: recentActivity.slice(0, 5),
      exchanges: userExchanges.map(ex => ({
        name: ex.exchange,
        isSelected: ex.isSelectedExchange,
        apiKeysCount: ex.apiKeys?.length || 0,
        markets: ex.markets?.length || 0,
        selectedMarket: ex.selectedMarket?.symbol || null
      }))
    };
  } catch (error) {
    console.error('[REALTIME DASHBOARD ERROR]', error);
    return {
      success: false,
      error: error.message,
      stats: {
        totalApiKeys: 0,
        activeExchanges: 0,
        activeBots: 0,
        openOrders: 0,
        totalPnL: 0,
        successRate: 0,
        totalBalance: 0,
        totalBots: 0,
        patternsDetected: 0,
        activeChains: 0
      },
      runningBots: [],
      recentActivity: [],
      exchanges: []
    };
  }
});

function formatTimeAgo(date) {
  if (!date) return 'Just now';
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function calculateRuntime(startTime) {
  if (!startTime) return '0m';
  const now = Date.now();
  const diff = now - new Date(startTime).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

function getBotIcon(type) {
  const icons = {
    'grid': '📊',
    'dca': '💰',
    'scalping': '⚡',
    'fib': '📐',
    'frontrun': '🏃',
    'smart': '🧠'
  };
  return icons[type.toLowerCase()] || '🤖';
}
