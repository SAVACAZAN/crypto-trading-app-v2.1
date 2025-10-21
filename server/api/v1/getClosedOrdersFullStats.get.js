import { closedOrderHistorySchema } from '../../models/closedOrderHistory.schema';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const { userID, exchange, symbol, apiKeyNames, limit = 100 } = query;

    if (!userID || !exchange) {
        return {
            success: false,
            error: 'Missing required parameters: userID and exchange'
        };
    }

    try {
        console.time('[FULL-STATS] Processing time');

        // Build filter
        const filter = {
            userID,
            exchange
        };

        if (symbol) {
            filter.symbol = symbol;
        }

        if (apiKeyNames) {
            const keys = apiKeyNames.split(',').filter(k => k);
            if (keys.length > 0) {
                filter.apiKeyName = { $in: keys };
            }
        }

        // Get limited orders for display (not all 89k)
        const displayOrders = await closedOrderHistorySchema
            .find(filter)
            .sort({ datetime: -1 })
            .limit(parseInt(limit))
            .lean();

        // Use aggregation for statistics
        const pipeline = [
            { $match: filter },
            {
                $facet: {
                    // Overall summary
                    summary: [
                        {
                            $group: {
                                _id: null,
                                totalOrders: { $sum: 1 },
                                totalVolume: { $sum: '$amount' },
                                totalCost: { $sum: '$cost' },
                                avgPrice: { $avg: '$price' },
                                avgSize: { $avg: '$amount' },
                                minPrice: { $min: '$price' },
                                maxPrice: { $max: '$price' },
                                buyCount: { $sum: { $cond: [{ $eq: ['$side', 'buy'] }, 1, 0] } },
                                sellCount: { $sum: { $cond: [{ $eq: ['$side', 'sell'] }, 1, 0] } },
                                buyCost: { $sum: { $cond: [{ $eq: ['$side', 'buy'] }, '$cost', 0] } },
                                sellCost: { $sum: { $cond: [{ $eq: ['$side', 'sell'] }, '$cost', 0] } },
                                buyVolume: { $sum: { $cond: [{ $eq: ['$side', 'buy'] }, '$amount', 0] } },
                                sellVolume: { $sum: { $cond: [{ $eq: ['$side', 'sell'] }, '$amount', 0] } }
                            }
                        }
                    ],

                    // Per API Key statistics
                    perApiKey: [
                        {
                            $group: {
                                _id: '$apiKeyName',
                                count: { $sum: 1 },
                                volume: { $sum: '$amount' },
                                cost: { $sum: '$cost' },
                                avgPrice: { $avg: '$price' },
                                avgSize: { $avg: '$amount' },
                                buyCount: { $sum: { $cond: [{ $eq: ['$side', 'buy'] }, 1, 0] } },
                                sellCount: { $sum: { $cond: [{ $eq: ['$side', 'sell'] }, 1, 0] } },
                                buyCost: { $sum: { $cond: [{ $eq: ['$side', 'buy'] }, '$cost', 0] } },
                                sellCost: { $sum: { $cond: [{ $eq: ['$side', 'sell'] }, '$cost', 0] } }
                            }
                        },
                        { $sort: { cost: -1 } }
                    ],

                    // Top orders by volume
                    topByVolume: [
                        { $sort: { amount: -1 } },
                        { $limit: 50 },
                        {
                            $project: {
                                orderId: 1,
                                symbol: 1,
                                side: 1,
                                price: 1,
                                amount: 1,
                                cost: 1,
                                datetime: 1,
                                apiKeyName: 1
                            }
                        }
                    ],

                    // Top orders by cost
                    topByCost: [
                        { $sort: { cost: -1 } },
                        { $limit: 50 },
                        {
                            $project: {
                                orderId: 1,
                                symbol: 1,
                                side: 1,
                                price: 1,
                                amount: 1,
                                cost: 1,
                                datetime: 1,
                                apiKeyName: 1
                            }
                        }
                    ],

                    // Orders > $1000
                    ordersAbove1000: [
                        { $match: { cost: { $gte: 1000 } } },
                        {
                            $group: {
                                _id: null,
                                count: { $sum: 1 },
                                total: { $sum: '$cost' }
                            }
                        }
                    ],

                    // Orders > $10000
                    ordersAbove10000: [
                        { $match: { cost: { $gte: 10000 } } },
                        {
                            $group: {
                                _id: null,
                                count: { $sum: 1 },
                                total: { $sum: '$cost' }
                            }
                        }
                    ],

                    // Largest order
                    largestOrder: [
                        { $sort: { cost: -1 } },
                        { $limit: 1 }
                    ],

                    // Smallest order
                    smallestOrder: [
                        { $match: { cost: { $gt: 0 } } },
                        { $sort: { cost: 1 } },
                        { $limit: 1 }
                    ],

                    // Most active day
                    mostActiveDay: [
                        {
                            $group: {
                                _id: { $dateToString: { format: '%Y-%m-%d', date: '$datetime' } },
                                count: { $sum: 1 },
                                cost: { $sum: '$cost' }
                            }
                        },
                        { $sort: { count: -1 } },
                        { $limit: 1 }
                    ],

                    // Most active week
                    mostActiveWeek: [
                        {
                            $group: {
                                _id: {
                                    year: { $year: '$datetime' },
                                    week: { $week: '$datetime' }
                                },
                                count: { $sum: 1 },
                                cost: { $sum: '$cost' }
                            }
                        },
                        { $sort: { count: -1 } },
                        { $limit: 1 }
                    ],

                    // Most active month
                    mostActiveMonth: [
                        {
                            $group: {
                                _id: { $dateToString: { format: '%Y-%m', date: '$datetime' } },
                                count: { $sum: 1 },
                                cost: { $sum: '$cost' }
                            }
                        },
                        { $sort: { count: -1 } },
                        { $limit: 1 }
                    ],

                    // Highest price order
                    highestPrice: [
                        { $sort: { price: -1 } },
                        { $limit: 1 }
                    ],

                    // Lowest price order
                    lowestPrice: [
                        { $match: { price: { $gt: 0 } } },
                        { $sort: { price: 1 } },
                        { $limit: 1 }
                    ],

                    // Per API stats for cards
                    perApiStats: [
                        {
                            $group: {
                                _id: '$apiKeyName',
                                totalOrders: { $sum: 1 },
                                totalVolume: { $sum: '$amount' },
                                totalCost: { $sum: '$cost' },
                                orders1000: { $sum: { $cond: [{ $gte: ['$cost', 1000] }, 1, 0] } },
                                orders10000: { $sum: { $cond: [{ $gte: ['$cost', 10000] }, 1, 0] } },
                                total1000: { $sum: { $cond: [{ $gte: ['$cost', 1000] }, '$cost', 0] } },
                                total10000: { $sum: { $cond: [{ $gte: ['$cost', 10000] }, '$cost', 0] } }
                            }
                        }
                    ],

                    // Top sells > $1000
                    topSellsAbove1000: [
                        { $match: { side: 'sell', cost: { $gte: 1000 } } },
                        { $sort: { cost: -1 } },
                        { $limit: 10 }
                    ],

                    // Top buys > $1000
                    topBuysAbove1000: [
                        { $match: { side: 'buy', cost: { $gte: 1000 } } },
                        { $sort: { cost: -1 } },
                        { $limit: 10 }
                    ],

                    // Trending by date (last 30 days)
                    dailyTrend: [
                        {
                            $match: {
                                datetime: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                            }
                        },
                        {
                            $group: {
                                _id: { $dateToString: { format: '%Y-%m-%d', date: '$datetime' } },
                                count: { $sum: 1 },
                                cost: { $sum: '$cost' },
                                buyCount: { $sum: { $cond: [{ $eq: ['$side', 'buy'] }, 1, 0] } },
                                sellCount: { $sum: { $cond: [{ $eq: ['$side', 'sell'] }, 1, 0] } }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],

                    // Last 7 days activity
                    last7Days: [
                        {
                            $match: {
                                datetime: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                count: { $sum: 1 },
                                cost: { $sum: '$cost' },
                                buyCount: { $sum: { $cond: [{ $eq: ['$side', 'buy'] }, 1, 0] } },
                                sellCount: { $sum: { $cond: [{ $eq: ['$side', 'sell'] }, 1, 0] } },
                                buyCost: { $sum: { $cond: [{ $eq: ['$side', 'buy'] }, '$cost', 0] } },
                                sellCost: { $sum: { $cond: [{ $eq: ['$side', 'sell'] }, '$cost', 0] } }
                            }
                        }
                    ]
                }
            }
        ];

        const [result] = await closedOrderHistorySchema.aggregate(pipeline);

        console.timeEnd('[FULL-STATS] Processing time');

        // Format response with all statistics needed for the cards
        const response = {
            success: true,
            displayOrders,
            stats: {
                summary: result.summary[0] || {},
                perApiKey: result.perApiKey || [],
                perApiStats: result.perApiStats || [],
                topByVolume: result.topByVolume || [],
                topByCost: result.topByCost || [],
                ordersAbove1000: result.ordersAbove1000[0] || { count: 0, total: 0 },
                ordersAbove10000: result.ordersAbove10000[0] || { count: 0, total: 0 },
                largestOrder: result.largestOrder[0] || null,
                smallestOrder: result.smallestOrder[0] || null,
                mostActiveDay: result.mostActiveDay[0] || null,
                mostActiveWeek: result.mostActiveWeek[0] || null,
                mostActiveMonth: result.mostActiveMonth[0] || null,
                highestPrice: result.highestPrice[0] || null,
                lowestPrice: result.lowestPrice[0] || null,
                topSellsAbove1000: result.topSellsAbove1000 || [],
                topBuysAbove1000: result.topBuysAbove1000 || [],
                dailyTrend: result.dailyTrend || [],
                last7Days: result.last7Days[0] || {}
            }
        };

        console.log(`[FULL-STATS] Returned ${displayOrders.length} display orders + full statistics`);

        return response;

    } catch (error) {
        console.error('[FULL-STATS] Error:', error);
        return {
            success: false,
            error: error.message
        };
    }
});