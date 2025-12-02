import { CoPilotAutomationRuleSchema } from '~/server/models/coPilotAutomationRule.schema';
import { userExchangesSchema } from '~/server/models/userExchanges.schema';

/**
 * Fetch all open orders for Co-Pilot monitoring
 * Enriches orders with existing automation rules
 */
export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const { userID, exchange, apiKeyName } = query;

        if (!userID) {
            throw createError({
                statusCode: 400,
                statusMessage: 'userID is required'
            });
        }

        console.log(`📊 [FetchCoPilotOrders] Fetching orders for user: ${userID}`);
        if (exchange) console.log(`🎯 [FetchCoPilotOrders] Filtering by exchange: ${exchange}`);
        if (apiKeyName) console.log(`🔑 [FetchCoPilotOrders] Filtering by API key: ${apiKeyName}`);

        const nitroApp = useNitroApp();
        console.log(`🔧 [FetchCoPilotOrders] nitroApp.ccxtw available: ${!!nitroApp.ccxtw}`);

        // Get user's exchange configurations (filter by exchange if provided)
        const filter = { userID };
        if (exchange) {
            filter.exchange = exchange;
        }
        const userExchanges = await userExchangesSchema.find(filter);
        console.log(`🔍 [FetchCoPilotOrders] Found ${userExchanges ? userExchanges.length : 0} exchanges for user`);

        if (!userExchanges || userExchanges.length === 0) {
            console.log('⚠️ [FetchCoPilotOrders] No exchanges found for user');
            return {
                success: true,
                data: [],
                total: 0,
                message: 'No exchanges configured'
            };
        }

        let allOrders = [];
        const errors = [];

        // Fetch open orders from exchanges and API keys
        for (const userExchange of userExchanges) {
            const apiKeys = userExchange.apiKeys || [];
            console.log(`📦 [FetchCoPilotOrders] Exchange ${userExchange.exchange}: ${apiKeys.length} API keys`);

            for (const apiKey of apiKeys) {
                if (apiKey.isActive === false) continue; // Skip inactive keys

                const keyName = apiKey.name || 'default';

                // If apiKeyName filter is provided, skip keys that don't match
                if (apiKeyName && keyName !== apiKeyName) {
                    console.log(`⏭️ [FetchCoPilotOrders] Skipping ${keyName} (filter: ${apiKeyName})`);
                    continue;
                }

                try {
                    console.log(`🔍 [FetchCoPilotOrders] Fetching orders from ${userExchange.exchange} (${keyName})`);

                    // Use same approach as fetchOpenOrders.get.js
                    const ordersResponse = await nitroApp.ccxtw.fetchOpenOrders(
                        userID,
                        userExchange.exchange,
                        undefined, // all symbols (undefined instead of null)
                        keyName
                    );

                    // Check if we got data (response.data exists)
                    if (ordersResponse && ordersResponse.data && ordersResponse.data.length > 0) {
                        // Enrich each order with API key info
                        const enrichedOrders = ordersResponse.data.map(order => ({
                            ...order,
                            apiKeyName: keyName,
                            exchange: userExchange.exchange,
                            userID: userID
                        }));

                        allOrders.push(...enrichedOrders);

                        console.log(`✅ [FetchCoPilotOrders] Found ${enrichedOrders.length} orders from ${userExchange.exchange} (${keyName})`);
                    } else {
                        // No orders or error - log but don't add to errors if just empty
                        if (ordersResponse && ordersResponse.error) {
                            errors.push({
                                exchange: userExchange.exchange,
                                apiKeyName: keyName,
                                error: ordersResponse.error
                            });
                            console.error(`❌ [FetchCoPilotOrders] Failed to fetch from ${userExchange.exchange} (${keyName}):`, ordersResponse.error);
                        } else {
                            console.log(`ℹ️ [FetchCoPilotOrders] No orders found for ${userExchange.exchange} (${keyName})`);
                        }
                    }
                } catch (error) {
                    errors.push({
                        exchange: userExchange.exchange,
                        apiKeyName: apiKey.name || 'default',
                        error: error.message
                    });

                    console.error(`❌ [FetchCoPilotOrders] Error fetching from ${userExchange.exchange} (${apiKey.name}):`, error);
                }
            }
        }

        // Fetch all active automation rules for this user
        const allRules = await CoPilotAutomationRuleSchema.find({ userID });

        console.log(`📋 [FetchCoPilotOrders] Found ${allRules.length} automation rules`);

        // Enrich orders with rules info
        for (const order of allOrders) {
            // Find rules for this specific order
            const orderRules = allRules.filter(rule => rule.orderId === order.id);

            order.rulesCount = orderRules.length;
            order.hasActiveRules = orderRules.some(r => r.isActive);
            order.rules = orderRules.map(rule => ({
                ruleId: rule._id.toString(),
                ruleNumber: rule.ruleNumber,
                ruleName: rule.ruleName,
                ruleType: rule.ruleType,
                triggerCondition: rule.triggerCondition,
                triggerValue: rule.triggerValue,
                isActive: rule.isActive,
                executionCount: rule.executionCount || 0,
                lastExecutedAt: rule.lastExecutedAt,
                createdBotId: rule.createdBotId,
                createdBotType: rule.createdBotType
            }));

            // Calculate fill percentage
            if (order.amount && order.filled) {
                order.fillPercent = ((order.filled / order.amount) * 100).toFixed(2);
            } else {
                order.fillPercent = 0;
            }

            // Calculate total value in USD
            if (order.price && order.amount) {
                order.totalValue = (order.price * order.amount).toFixed(2);
            }

            // Calculate filled value in USD
            if (order.price && order.filled) {
                order.filledValue = (order.price * order.filled).toFixed(2);
            }
        }

        // Sort orders by timestamp (newest first)
        allOrders.sort((a, b) => {
            const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return timeB - timeA;
        });

        // Count total API keys scanned
        let totalApiKeys = 0;
        userExchanges.forEach(ue => {
            totalApiKeys += (ue.apiKeys || []).filter(k => k.isActive !== false).length;
        });

        console.log(`✅ [FetchCoPilotOrders] Total orders fetched: ${allOrders.length}`);
        console.log(`📊 [FetchCoPilotOrders] Stats: ${allRules.length} rules, ${totalApiKeys} API keys scanned, ${errors.length} errors`);

        return {
            success: true,
            data: allOrders,
            total: allOrders.length,
            errors: errors.length > 0 ? errors : undefined,
            stats: {
                totalOrders: allOrders.length,
                totalRules: allRules.length,
                ordersWithRules: allOrders.filter(o => o.rulesCount > 0).length,
                ordersWithActiveRules: allOrders.filter(o => o.hasActiveRules).length,
                apiKeysScanned: totalApiKeys,
                failedApiKeys: errors.length
            }
        };

    } catch (error) {
        console.error('❌ [FetchCoPilotOrders] Error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to fetch Co-Pilot orders'
        });
    }
});
