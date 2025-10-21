import { closedOrderHistorySchema } from '~/server/models/closedOrderHistory.schema';
import { orderStatisticsSchema } from '~/server/models/orderStatistics.schema';

export default defineEventHandler(async (event) => {
    const startTime = Date.now();

    try {
        const body = await readBody(event);
        const { userID, exchange, symbol, apiKeyNames } = body;

        if (!userID || !exchange || !symbol) {
            return {
                success: false,
                error: 'Missing required fields: userID, exchange, symbol'
            };
        }

        console.log(`[STATS] 📊 Starting statistics calculation for ${userID}/${exchange}/${symbol}...`);

        // Fetch toate comenzile pentru acest user/exchange/symbol
        const query = {
            userID,
            exchange,
            symbol
        };

        if (apiKeyNames && apiKeyNames.length > 0) {
            query.apiKeyName = { $in: apiKeyNames };
        }

        const allOrders = await closedOrderHistorySchema.find(query).lean();

        console.log(`[STATS] ✅ Fetched ${allOrders.length} orders for calculation`);

        if (allOrders.length === 0) {
            return {
                success: false,
                error: 'No orders found for the specified criteria'
            };
        }

        // === CALCULARE STATISTICI GENERALE ===
        const buyOrders = allOrders.filter(o => o.side === 'buy');
        const sellOrders = allOrders.filter(o => o.side === 'sell');

        const totalVolume = allOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
        const totalCost = allOrders.reduce((sum, o) => sum + (o.cost || 0), 0);
        const buyVolume = buyOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
        const sellVolume = sellOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
        const buyCost = buyOrders.reduce((sum, o) => sum + (o.cost || 0), 0);
        const sellCost = sellOrders.reduce((sum, o) => sum + (o.cost || 0), 0);

        const avgOrderSize = allOrders.length > 0 ? totalVolume / allOrders.length : 0;
        const avgPrice = allOrders.length > 0
            ? allOrders.reduce((sum, o) => sum + (o.price || 0), 0) / allOrders.length
            : 0;

        // === TOP ORDERS ===
        const topOrdersByVolume = [...allOrders]
            .sort((a, b) => (b.amount || 0) - (a.amount || 0))
            .slice(0, 50)
            .map(o => ({
                orderId: o.orderId,
                amount: o.amount,
                price: o.price,
                cost: o.cost,
                side: o.side,
                datetime: o.datetime,
                apiKeyName: o.apiKeyName
            }));

        const topOrdersByCost = [...allOrders]
            .sort((a, b) => (b.cost || 0) - (a.cost || 0))
            .slice(0, 50)
            .map(o => ({
                orderId: o.orderId,
                amount: o.amount,
                price: o.price,
                cost: o.cost,
                side: o.side,
                datetime: o.datetime,
                apiKeyName: o.apiKeyName
            }));

        // === EXTREME VALUES ===
        const sortedByPrice = [...allOrders].sort((a, b) => (b.price || 0) - (a.price || 0));
        const highestPriceOrder = sortedByPrice[0];
        const lowestPriceOrder = sortedByPrice.filter(o => o.price > 0)[sortedByPrice.length - 1];

        const sortedByCost = [...allOrders].sort((a, b) => (b.cost || 0) - (a.cost || 0));
        const largestOrder = sortedByCost[0];
        const smallestOrder = sortedByCost[sortedByCost.length - 1];

        // === LAST 1000 BUY/SELL PER API ===
        const apiKeys = [...new Set(allOrders.map(o => o.apiKeyName))];
        const last1000BuyPerApi = {};
        const last1000SellPerApi = {};

        apiKeys.forEach(apiKey => {
            last1000BuyPerApi[apiKey] = buyOrders
                .filter(o => o.apiKeyName === apiKey)
                .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
                .slice(0, 1000)
                .map(o => ({
                    orderId: o.orderId,
                    amount: o.amount,
                    price: o.price,
                    cost: o.cost,
                    datetime: o.datetime
                }));

            last1000SellPerApi[apiKey] = sellOrders
                .filter(o => o.apiKeyName === apiKey)
                .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
                .slice(0, 1000)
                .map(o => ({
                    orderId: o.orderId,
                    amount: o.amount,
                    price: o.price,
                    cost: o.cost,
                    datetime: o.datetime
                }));
        });

        // === BIG ORDERS ===
        const last50Orders1000to2000 = allOrders
            .filter(o => o.cost >= 1000 && o.cost < 2000)
            .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
            .slice(0, 50)
            .map(o => ({
                orderId: o.orderId,
                amount: o.amount,
                price: o.price,
                cost: o.cost,
                side: o.side,
                datetime: o.datetime,
                apiKeyName: o.apiKeyName
            }));

        const last50Orders2000to5000 = allOrders
            .filter(o => o.cost >= 2000 && o.cost < 5000)
            .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
            .slice(0, 50)
            .map(o => ({
                orderId: o.orderId,
                amount: o.amount,
                price: o.price,
                cost: o.cost,
                side: o.side,
                datetime: o.datetime,
                apiKeyName: o.apiKeyName
            }));

        const last50OrdersAbove5000 = allOrders
            .filter(o => o.cost >= 5000)
            .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
            .slice(0, 50)
            .map(o => ({
                orderId: o.orderId,
                amount: o.amount,
                price: o.price,
                cost: o.cost,
                side: o.side,
                datetime: o.datetime,
                apiKeyName: o.apiKeyName
            }));

        // === TIME-BASED STATISTICS ===
        const hourStats = {};
        for (let h = 0; h < 24; h++) hourStats[h] = { hour: h, count: 0, buy: 0, sell: 0, buyPriceSum: 0, sellPriceSum: 0, cost: 0 };

        allOrders.forEach(o => {
            const hour = new Date(o.datetime).getHours();
            hourStats[hour].count++;
            hourStats[hour].cost += o.cost || 0;
            if (o.side === 'buy') {
                hourStats[hour].buy++;
                hourStats[hour].buyPriceSum += o.price || 0;
            } else {
                hourStats[hour].sell++;
                hourStats[hour].sellPriceSum += o.price || 0;
            }
        });

        const ordersByHour = Object.values(hourStats).map(h => ({
            hour: h.hour,
            count: h.count,
            buy: h.buy,
            sell: h.sell,
            avgBuyPrice: h.buy > 0 ? h.buyPriceSum / h.buy : 0,
            avgSellPrice: h.sell > 0 ? h.sellPriceSum / h.sell : 0,
            cost: h.cost
        }));

        // Day of week
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayStats = {};
        dayNames.forEach((day, i) => {
            dayStats[i] = { day, count: 0, buy: 0, sell: 0, buyPriceSum: 0, sellPriceSum: 0, cost: 0 };
        });

        allOrders.forEach(o => {
            const dayIdx = new Date(o.datetime).getDay();
            dayStats[dayIdx].count++;
            dayStats[dayIdx].cost += o.cost || 0;
            if (o.side === 'buy') {
                dayStats[dayIdx].buy++;
                dayStats[dayIdx].buyPriceSum += o.price || 0;
            } else {
                dayStats[dayIdx].sell++;
                dayStats[dayIdx].sellPriceSum += o.price || 0;
            }
        });

        const ordersByDayOfWeek = Object.values(dayStats).map(d => ({
            day: d.day,
            count: d.count,
            buy: d.buy,
            sell: d.sell,
            avgBuyPrice: d.buy > 0 ? d.buyPriceSum / d.buy : 0,
            avgSellPrice: d.sell > 0 ? d.sellPriceSum / d.sell : 0,
            cost: d.cost
        }));

        // Last 30 days
        const last30DaysStats = {};
        const now = new Date();
        for (let i = 0; i < 30; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            last30DaysStats[dateStr] = { date: dateStr, count: 0, buy: 0, sell: 0, buyPriceSum: 0, sellPriceSum: 0, cost: 0 };
        }

        allOrders.forEach(o => {
            const dateStr = new Date(o.datetime).toISOString().split('T')[0];
            if (last30DaysStats[dateStr]) {
                last30DaysStats[dateStr].count++;
                last30DaysStats[dateStr].cost += o.cost || 0;
                if (o.side === 'buy') {
                    last30DaysStats[dateStr].buy++;
                    last30DaysStats[dateStr].buyPriceSum += o.price || 0;
                } else {
                    last30DaysStats[dateStr].sell++;
                    last30DaysStats[dateStr].sellPriceSum += o.price || 0;
                }
            }
        });

        const last30DaysActivity = Object.values(last30DaysStats)
            .map(d => ({
                date: d.date,
                count: d.count,
                buy: d.buy,
                sell: d.sell,
                avgBuyPrice: d.buy > 0 ? d.buyPriceSum / d.buy : 0,
                avgSellPrice: d.sell > 0 ? d.sellPriceSum / d.sell : 0,
                cost: d.cost
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        // === TRADING PATTERNS ===
        const ranges = [
            { label: '< $100', min: 0, max: 100 },
            { label: '$100-$500', min: 100, max: 500 },
            { label: '$500-$1K', min: 500, max: 1000 },
            { label: '$1K-$5K', min: 1000, max: 5000 },
            { label: '$5K-$10K', min: 5000, max: 10000 },
            { label: '> $10K', min: 10000, max: Infinity }
        ];

        const orderSizeDistribution = ranges.map(range => {
            const ordersInRange = allOrders.filter(o => o.cost >= range.min && o.cost < range.max);
            const total = ordersInRange.reduce((sum, o) => sum + (o.cost || 0), 0);
            return {
                label: range.label,
                min: range.min,
                max: range.max,
                count: ordersInRange.length,
                total,
                percentage: allOrders.length > 0 ? (ordersInRange.length / allOrders.length) * 100 : 0
            };
        });

        const peakTradingTimes = ordersByHour
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
            .map(h => ({
                hour: h.hour,
                count: h.count,
                buy: h.buy,
                sell: h.sell,
                cost: h.cost
            }));

        // Monthly comparison
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthStats = {};

        allOrders.forEach(o => {
            const date = new Date(o.datetime);
            const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            if (!monthStats[monthKey]) {
                monthStats[monthKey] = { month: monthKey, count: 0, buy: 0, sell: 0, cost: 0 };
            }
            monthStats[monthKey].count++;
            monthStats[monthKey].cost += o.cost || 0;
            if (o.side === 'buy') monthStats[monthKey].buy++;
            else monthStats[monthKey].sell++;
        });

        const monthlyComparison = Object.values(monthStats);

        // === PERFORMANCE PER API ===
        const volumePerApi = apiKeys.map(apiKey => ({
            apiKey,
            volume: allOrders.filter(o => o.apiKeyName === apiKey).reduce((sum, o) => sum + (o.amount || 0), 0)
        })).sort((a, b) => b.volume - a.volume);

        const costPerApi = apiKeys.map(apiKey => {
            const apiOrders = allOrders.filter(o => o.apiKeyName === apiKey);
            const apiBuys = apiOrders.filter(o => o.side === 'buy');
            const apiSells = apiOrders.filter(o => o.side === 'sell');
            return {
                apiKey,
                cost: apiOrders.reduce((sum, o) => sum + (o.cost || 0), 0),
                buyCost: apiBuys.reduce((sum, o) => sum + (o.cost || 0), 0),
                sellCost: apiSells.reduce((sum, o) => sum + (o.cost || 0), 0)
            };
        }).sort((a, b) => b.cost - a.cost);

        const avgOrderSizePerApi = apiKeys.map(apiKey => {
            const apiOrders = allOrders.filter(o => o.apiKeyName === apiKey);
            const volume = apiOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
            return {
                apiKey,
                avgSize: apiOrders.length > 0 ? volume / apiOrders.length : 0,
                orders: apiOrders.length
            };
        }).sort((a, b) => b.avgSize - a.avgSize);

        // === METADATA ===
        const dates = allOrders.map(o => new Date(o.datetime)).sort((a, b) => a - b);
        const oldestOrder = dates[0];
        const newestOrder = dates[dates.length - 1];

        // === SALVARE ÎN BAZA DE DATE ===
        const statisticsData = {
            userID,
            exchange,
            symbol,
            apiKeyName: null, // Statistici generale

            // General
            totalOrders: allOrders.length,
            totalVolume,
            totalCost,
            buyOrders: buyOrders.length,
            sellOrders: sellOrders.length,
            buyVolume,
            sellVolume,
            buyCost,
            sellCost,
            averageOrderSize: avgOrderSize,
            averagePrice: avgPrice,

            // Tops & Extremes
            topOrdersByVolume,
            topOrdersByCost,
            highestPriceOrder: highestPriceOrder ? {
                orderId: highestPriceOrder.orderId,
                amount: highestPriceOrder.amount,
                price: highestPriceOrder.price,
                cost: highestPriceOrder.cost,
                side: highestPriceOrder.side,
                datetime: highestPriceOrder.datetime,
                apiKeyName: highestPriceOrder.apiKeyName
            } : null,
            lowestPriceOrder: lowestPriceOrder ? {
                orderId: lowestPriceOrder.orderId,
                amount: lowestPriceOrder.amount,
                price: lowestPriceOrder.price,
                cost: lowestPriceOrder.cost,
                side: lowestPriceOrder.side,
                datetime: lowestPriceOrder.datetime,
                apiKeyName: lowestPriceOrder.apiKeyName
            } : null,
            largestOrder: largestOrder ? {
                orderId: largestOrder.orderId,
                amount: largestOrder.amount,
                price: largestOrder.price,
                cost: largestOrder.cost,
                side: largestOrder.side,
                datetime: largestOrder.datetime,
                apiKeyName: largestOrder.apiKeyName
            } : null,
            smallestOrder: smallestOrder ? {
                orderId: smallestOrder.orderId,
                amount: smallestOrder.amount,
                price: smallestOrder.price,
                cost: smallestOrder.cost,
                side: smallestOrder.side,
                datetime: smallestOrder.datetime,
                apiKeyName: smallestOrder.apiKeyName
            } : null,

            // Last trades
            last1000BuyPerApi,
            last1000SellPerApi,

            // Big orders
            last50Orders1000to2000,
            last50Orders2000to5000,
            last50OrdersAbove5000,

            // Time-based
            ordersByHour,
            ordersByDayOfWeek,
            last30DaysActivity,

            // Patterns
            orderSizeDistribution,
            peakTradingTimes,
            monthlyComparison,

            // Performance
            volumePerApi,
            costPerApi,
            avgOrderSizePerApi,

            // Metadata
            calculatedAt: new Date(),
            orderCount: allOrders.length,
            oldestOrder,
            newestOrder,
            calculationDuration: Date.now() - startTime
        };

        // Șterge statistici vechi pentru același set de parametri
        await orderStatisticsSchema.deleteMany({
            userID,
            exchange,
            symbol,
            apiKeyName: null
        });

        // Salvează noile statistici
        await orderStatisticsSchema.create(statisticsData);

        const duration = Date.now() - startTime;
        console.log(`[STATS] ✅ Statistics calculated and saved in ${duration}ms`);

        return {
            success: true,
            message: `Statistics calculated successfully for ${allOrders.length} orders`,
            duration,
            orderCount: allOrders.length
        };

    } catch (error) {
        console.error('[STATS] ❌ Error calculating statistics:', error);
        return {
            success: false,
            error: error.message
        };
    }
});
