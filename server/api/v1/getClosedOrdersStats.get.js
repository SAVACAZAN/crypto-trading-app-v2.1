import { closedOrderHistorySchema } from '../../models/closedOrderHistory.schema';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const { userID, exchange, symbol, apiKeyNames } = query;

    if (!userID || !exchange) {
        return {
            success: false,
            error: 'Missing required parameters: userID and exchange'
        };
    }

    try {
        console.time('[STATS] Aggregation time');

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

        // Use MongoDB aggregation pipeline for better performance
        const pipeline = [
            { $match: filter },
            {
                $facet: {
                    // Overall statistics
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
                                minCost: { $min: '$cost' },
                                maxCost: { $max: '$cost' }
                            }
                        }
                    ],

                    // Buy statistics
                    buyStats: [
                        { $match: { side: 'buy' } },
                        {
                            $group: {
                                _id: null,
                                count: { $sum: 1 },
                                totalVolume: { $sum: '$amount' },
                                totalCost: { $sum: '$cost' },
                                avgPrice: { $avg: '$price' },
                                avgSize: { $avg: '$amount' },
                                minPrice: { $min: '$price' },
                                maxPrice: { $max: '$price' }
                            }
                        }
                    ],

                    // Sell statistics
                    sellStats: [
                        { $match: { side: 'sell' } },
                        {
                            $group: {
                                _id: null,
                                count: { $sum: 1 },
                                totalVolume: { $sum: '$amount' },
                                totalCost: { $sum: '$cost' },
                                avgPrice: { $avg: '$price' },
                                avgSize: { $avg: '$amount' },
                                minPrice: { $min: '$price' },
                                maxPrice: { $max: '$price' }
                            }
                        }
                    ],

                    // Per API Key statistics
                    perApiStats: [
                        {
                            $group: {
                                _id: '$apiKeyName',
                                totalOrders: { $sum: 1 },
                                totalVolume: { $sum: '$amount' },
                                totalCost: { $sum: '$cost' },
                                avgPrice: { $avg: '$price' },
                                buyCount: {
                                    $sum: { $cond: [{ $eq: ['$side', 'buy'] }, 1, 0] }
                                },
                                sellCount: {
                                    $sum: { $cond: [{ $eq: ['$side', 'sell'] }, 1, 0] }
                                },
                                buyCost: {
                                    $sum: { $cond: [{ $eq: ['$side', 'buy'] }, '$cost', 0] }
                                },
                                sellCost: {
                                    $sum: { $cond: [{ $eq: ['$side', 'sell'] }, '$cost', 0] }
                                },
                                buyVolume: {
                                    $sum: { $cond: [{ $eq: ['$side', 'buy'] }, '$amount', 0] }
                                },
                                sellVolume: {
                                    $sum: { $cond: [{ $eq: ['$side', 'sell'] }, '$amount', 0] }
                                }
                            }
                        },
                        { $sort: { totalCost: -1 } }
                    ],

                    // Distribution by cost ranges
                    costDistribution: [
                        {
                            $bucket: {
                                groupBy: '$cost',
                                boundaries: [0, 100, 1000, 10000, 100000, 1000000],
                                default: 'above_1M',
                                output: {
                                    count: { $sum: 1 },
                                    totalCost: { $sum: '$cost' },
                                    buyCount: {
                                        $sum: { $cond: [{ $eq: ['$side', 'buy'] }, 1, 0] }
                                    },
                                    sellCount: {
                                        $sum: { $cond: [{ $eq: ['$side', 'sell'] }, 1, 0] }
                                    }
                                }
                            }
                        }
                    ],

                    // Top 50 orders by cost
                    topOrdersByCost: [
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

                    // Top 50 orders by volume
                    topOrdersByVolume: [
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

                    // Largest buy order
                    largestBuyOrder: [
                        { $match: { side: 'buy' } },
                        { $sort: { cost: -1 } },
                        { $limit: 1 }
                    ],

                    // Largest sell order
                    largestSellOrder: [
                        { $match: { side: 'sell' } },
                        { $sort: { cost: -1 } },
                        { $limit: 1 }
                    ]
                }
            }
        ];

        const [result] = await closedOrderHistorySchema.aggregate(pipeline);

        console.timeEnd('[STATS] Aggregation time');

        // Format the response
        const response = {
            success: true,
            stats: {
                summary: result.summary[0] || {
                    totalOrders: 0,
                    totalVolume: 0,
                    totalCost: 0,
                    avgPrice: 0,
                    avgSize: 0
                },
                buy: result.buyStats[0] || {
                    count: 0,
                    totalVolume: 0,
                    totalCost: 0,
                    avgPrice: 0,
                    avgSize: 0
                },
                sell: result.sellStats[0] || {
                    count: 0,
                    totalVolume: 0,
                    totalCost: 0,
                    avgPrice: 0,
                    avgSize: 0
                },
                perApiKey: result.perApiStats || [],
                costDistribution: result.costDistribution || [],
                largestBuyOrder: result.largestBuyOrder[0] || null,
                largestSellOrder: result.largestSellOrder[0] || null
            },
            topOrders: {
                byCost: result.topOrdersByCost || [],
                byVolume: result.topOrdersByVolume || []
            }
        };

        console.log(`[STATS] Processed ${response.stats.summary.totalOrders} orders`);

        return response;

    } catch (error) {
        console.error('[STATS] Error:', error);
        return {
            success: false,
            error: error.message
        };
    }
});