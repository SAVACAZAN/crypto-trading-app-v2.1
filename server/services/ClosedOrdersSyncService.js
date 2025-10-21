import { closedOrderHistorySchema } from '../models/closedOrderHistory.schema';
import { syncStateSchema } from '../models/syncState.schema';

/**
 * Optimized Closed Orders Sync Service
 * Previne rate limit abuse și duplicate entries
 */
export class ClosedOrdersSyncService {
    constructor(nitroApp = null) {
        this.nitroApp = nitroApp;
        // Rate limit configuration per exchange (în milisecunde)
        this.rateLimitConfig = {
            'lcx': 120000,              // 2 minute între sync-uri
            'coinbaseadvanced': 300000, // 5 minute
            'kraken': 180000,           // 3 minute
            'bitrue': 300000,           // 5 minute
            'binance': 60000,           // 1 minut
            'default': 300000           // 5 minute default
        };

        // Câte ordine să fetch-uim per request
        // NOTE: Unele exchange-uri au limit per page (ex: Coinbase 100 per request),
        // dar folosim pagination pentru a fetch până la target limit
        this.fetchLimitConfig = {
            'lcx': 1000,                // LCX: max 100 per page, paginat până la 1000 total
            'coinbaseadvanced': 1000,   // Coinbase: 100 per page, paginat până la 1000 total (incremental)
            'kraken': 1000,             // Kraken: fetch up to 1000 orders
            'binance': 1000,            // Binance: fetch up to 1000 orders
            'bitrue': 1000,             // Bitrue: fetch up to 1000 orders
            'probit': 1000,             // ProBit: fetch up to 1000 orders
            'default': 1000             // Default: 1000 orders for all exchanges
        };

        // Pentru FULL HISTORICAL SYNC - fetch ALL orders (no limit)
        // Folosit doar la prima sincronizare pentru a lua toate orders-urile istorice
        this.historicalSyncConfig = {
            'coinbaseadvanced': null,   // null = unlimited, fetch toate orders-urile disponibile
            'kraken': null,
            'default': null
        };
    }

    /**
     * Fetch Coinbase orders with cursor-based pagination
     * Coinbase API returns max 100 orders per request, so we need to paginate
     *
     * @param {string} targetLimit - Number of orders to fetch, or null for UNLIMITED (full historical sync)
     */
    async fetchCoinbaseWithPagination(userID, apiKeyName, symbol, since, targetLimit) {
        const allOrders = [];
        let cursor = null;
        let hasMore = true;
        const perPageLimit = 100; // Coinbase max per request
        let requestCount = 0;

        // If targetLimit is null, fetch ALL available orders (unlimited)
        const isUnlimited = targetLimit === null;
        const maxRequests = isUnlimited ? 10000 : Math.ceil(targetLimit / perPageLimit); // 10000 = ~1 million orders max

        if (isUnlimited) {
            console.log(`[SYNC-SERVICE] 🔄 Starting UNLIMITED Coinbase pagination (fetching ALL historical orders)`);
        } else {
            console.log(`[SYNC-SERVICE] 🔄 Starting Coinbase pagination (target: ${targetLimit} orders, max ${maxRequests} requests)`);
        }

        while (hasMore && requestCount < maxRequests) {
            // For limited fetch, stop when we reach targetLimit
            if (!isUnlimited && allOrders.length >= targetLimit) {
                break;
            }
            requestCount++;

            try {
                // Build params with cursor if we have one
                const params = cursor ? { cursor } : {};

                // Use CCXT wrapper with params
                const response = await this.nitroApp.ccxtw.fetchClosedOrders(
                    userID,
                    'coinbaseadvanced',
                    symbol || undefined,
                    apiKeyName,
                    since,
                    perPageLimit,
                    params  // Pass cursor as extra params
                );

                if (!response.success || !response.data) {
                    console.error(`[SYNC-SERVICE] ❌ Pagination request ${requestCount} failed:`, response.log);
                    break;
                }

                const orders = response.data;
                allOrders.push(...orders);

                console.log(`[SYNC-SERVICE] 📄 Page ${requestCount}: fetched ${orders.length} orders (total: ${allOrders.length})`);

                // Check if there's more data
                // Cursor is in response.info (extracted by CCXT wrapper)
                if (response.info && response.info.cursor) {
                    cursor = response.info.cursor;
                    hasMore = true;
                    console.log(`[SYNC-SERVICE] 🔗 Found cursor for next page: ${cursor.substring(0, 20)}...`);
                } else {
                    // No cursor = no more pages
                    hasMore = false;
                    console.log(`[SYNC-SERVICE] 🛑 No cursor found, pagination complete`);
                }

                // If we got less than perPageLimit, probably no more data
                if (orders.length < perPageLimit) {
                    hasMore = false;
                    console.log(`[SYNC-SERVICE] 🛑 Got ${orders.length} < ${perPageLimit}, no more pages`);
                }

                // No delay for FULL HISTORICAL SYNC - go as fast as possible
                // Coinbase supports ~30 req/sec, we'll be well under that with sequential requests
                if (hasMore && !isUnlimited) {
                    await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay only for incremental sync
                }
                // For unlimited sync, no delay = maximum speed

            } catch (error) {
                console.error(`[SYNC-SERVICE] ❌ Pagination error on request ${requestCount}:`, error.message);
                break;
            }
        }

        console.log(`[SYNC-SERVICE] ✅ Coinbase pagination complete: ${allOrders.length} total orders in ${requestCount} requests`);
        return allOrders;
    }

    /**
     * Verifică dacă este permis să facem sync acum (rate limiting)
     * Pentru FULL HISTORICAL SYNC (totalOrdersSynced === 0), permitem sync imediat fără rate limiting
     */
    async canSyncNow(userID, exchange, apiKeyName, symbol = null) {
        const syncState = await syncStateSchema.findOne({
            userID,
            exchange,
            apiKeyName,
            symbol,
            syncType: 'closed_orders'
        });

        if (!syncState) {
            return true; // Prima sincronizare ever, permis imediat (FULL HISTORICAL SYNC)
        }

        // FULL HISTORICAL SYNC phase: dacă nu avem deloc ordine sincronizate (totalOrdersSynced === 0)
        // permitem sync imediat pentru a fetch toate orders-urile istorice
        if ((syncState.totalOrdersSynced || 0) === 0) {
            console.log(`[SYNC-SERVICE] 🚀 FULL HISTORICAL SYNC mode: allowing immediate sync to fetch all orders`);
            return true;
        }

        // Pentru INCREMENTAL SYNC, verifică rate limiting
        if (syncState.nextSyncAllowed && new Date() < syncState.nextSyncAllowed) {
            return false;
        }

        return true;
    }

    /**
     * Calculează următorul timestamp când este permis sync-ul
     */
    getNextSyncAllowed(exchange, consecutiveEmptyFetches = 0) {
        const baseDelay = this.rateLimitConfig[exchange] || this.rateLimitConfig['default'];

        // Crește delay-ul dacă nu găsim ordine noi (exponential backoff)
        // Reduced max multiplier from 8x to 3x for less aggressive backoff
        const multiplier = Math.min(Math.pow(1.5, consecutiveEmptyFetches), 3); // Max 3x
        const delay = baseDelay * multiplier;

        return new Date(Date.now() + delay);
    }

    /**
     * Obține ultimul timestamp sincronizat
     */
    async getLastSyncTimestamp(userID, exchange, apiKeyName, symbol = null) {
        const syncState = await syncStateSchema.findOne({
            userID,
            exchange,
            apiKeyName,
            symbol,
            syncType: 'closed_orders'
        });

        return syncState?.lastSyncTimestamp || null;
    }

    /**
     * Update sync state după sincronizare
     */
    async updateSyncState(userID, exchange, apiKeyName, symbol, newOrdersCount, latestTimestamp) {
        const now = new Date();

        const syncState = await syncStateSchema.findOne({
            userID,
            exchange,
            apiKeyName,
            symbol,
            syncType: 'closed_orders'
        });

        const consecutiveEmptyFetches = newOrdersCount === 0
            ? (syncState?.consecutiveEmptyFetches || 0) + 1
            : 0;

        const nextSyncAllowed = this.getNextSyncAllowed(exchange, consecutiveEmptyFetches);

        await syncStateSchema.findOneAndUpdate(
            {
                userID,
                exchange,
                apiKeyName,
                symbol,
                syncType: 'closed_orders'
            },
            {
                userID,
                exchange,
                apiKeyName,
                symbol,
                syncType: 'closed_orders',
                lastSyncTimestamp: latestTimestamp,
                lastSyncDate: now,
                nextSyncAllowed,
                lastSyncOrderCount: newOrdersCount,
                consecutiveEmptyFetches,
                $inc: { totalOrdersSynced: newOrdersCount },
                updatedAt: now
            },
            {
                upsert: true,
                new: true
            }
        );

        return { nextSyncAllowed, consecutiveEmptyFetches };
    }

    /**
     * Verifică dacă o ordine există deja în DB (previne duplicate)
     */
    async orderExists(orderId) {
        const count = await closedOrderHistorySchema.countDocuments({ orderId });
        return count > 0;
    }

    /**
     * Batch insert orders (mai rapid decât individual upsert)
     */
    async batchInsertOrders(orders, userID, exchange, apiKeyName) {
        if (!orders || orders.length === 0) {
            return { inserted: 0, skipped: 0 };
        }

        let inserted = 0;
        let skipped = 0;

        // Obține toate orderId-urile existente într-un singur query
        const orderIds = orders.map(o => o.id);
        const existingOrders = await closedOrderHistorySchema.find(
            { orderId: { $in: orderIds } },
            { orderId: 1 }
        ).lean();

        const existingOrderIds = new Set(existingOrders.map(o => o.orderId));

        // Filtrează doar ordinele noi
        const newOrders = orders.filter(order => !existingOrderIds.has(order.id));

        if (newOrders.length === 0) {
            console.log(`[SYNC-SERVICE] ⏭️ All ${orders.length} orders already exist, skipping...`);
            return { inserted: 0, skipped: orders.length };
        }

        // Pregătește documentele pentru insert
        const documentsToInsert = newOrders.map(order => ({
            userID,
            exchange,
            apiKeyName,
            orderId: order.id,
            symbol: order.symbol,
            side: order.side,
            type: order.type,
            price: order.price || 0,
            amount: order.amount || 0,
            filled: order.filled || 0,
            cost: order.cost || 0,
            fee: {
                cost: order.fee?.cost || 0,
                currency: order.fee?.currency || null
            },
            datetime: new Date(order.datetime || order.timestamp),
            timestamp: order.timestamp,
            status: order.status || 'closed',
            syncedAt: new Date(),
            lastUpdated: new Date()
        }));

        try {
            // Bulk insert - mult mai rapid
            const result = await closedOrderHistorySchema.insertMany(documentsToInsert, {
                ordered: false // Continue on duplicate errors
            });

            inserted = result.length;
            skipped = orders.length - inserted;

            console.log(`[SYNC-SERVICE] ✅ Inserted ${inserted} new orders, skipped ${skipped} duplicates`);
        } catch (error) {
            // Handle duplicate key errors
            if (error.code === 11000) {
                // Unele au fost inserate, altele au fost duplicate
                const insertedCount = error.insertedDocs?.length || 0;
                inserted = insertedCount;
                skipped = orders.length - insertedCount;
                console.log(`[SYNC-SERVICE] ⚠️ Partial insert: ${inserted} inserted, ${skipped} duplicates`);
            } else {
                throw error;
            }
        }

        return { inserted, skipped };
    }

    /**
     * Main sync method - optimizat pentru rate limits
     */
    async syncClosedOrders(userID, exchange, apiKeyName, symbol = null) {
        // 1. Verifică dacă putem face sync acum
        const canSync = await this.canSyncNow(userID, exchange, apiKeyName, symbol);
        if (!canSync) {
            const syncState = await syncStateSchema.findOne({
                userID, exchange, apiKeyName, symbol, syncType: 'closed_orders'
            });
            const waitTime = Math.ceil((syncState.nextSyncAllowed - new Date()) / 1000);
            console.log(`[SYNC-SERVICE] ⏳ Rate limit: wait ${waitTime}s for ${exchange} - ${apiKeyName}`);
            return {
                success: false,
                rateLimited: true,
                waitSeconds: waitTime,
                message: `Rate limited. Wait ${waitTime}s`
            };
        }

        // 2. Check if this is FULL HISTORICAL SYNC (first time ever) or incremental sync
        const syncState = await syncStateSchema.findOne({
            userID, exchange, apiKeyName, symbol, syncType: 'closed_orders'
        });

        // Detectăm dacă e prima sync-are ever (no syncState) sau dacă avem puține ordine (<1000)
        // FULL HISTORICAL SYNC = prima dată când rulăm, fetch ALL orders din ultimele 3 luni
        const isFullHistoricalSync = !syncState || (syncState.totalOrdersSynced || 0) === 0;

        // INCREMENTAL SYNC = după full sync, doar ultimele 1000 pentru actualizări
        const isIncrementalSync = !isFullHistoricalSync;

        // 3. Pentru FULL HISTORICAL SYNC, fetch toate orders-urile (targetLimit = null = unlimited)
        //    Pentru INCREMENTAL SYNC, fetch doar ultimele 1000 pentru updates
        let targetLimit;
        let lastTimestamp;

        if (isFullHistoricalSync) {
            console.log(`[SYNC-SERVICE] 🚀 FULL HISTORICAL SYNC for ${exchange} - ${apiKeyName}: fetching ALL orders from last 3 months`);
            targetLimit = this.historicalSyncConfig[exchange] || this.historicalSyncConfig['default']; // null = unlimited
            lastTimestamp = null; // Fetch din ultimele 3 luni (Coinbase default)
        } else {
            console.log(`[SYNC-SERVICE] 🔄 INCREMENTAL SYNC for ${exchange} - ${apiKeyName}: fetching latest 1000 orders for updates`);
            targetLimit = this.fetchLimitConfig[exchange] || this.fetchLimitConfig['default']; // 1000 orders
            lastTimestamp = await this.getLastSyncTimestamp(userID, exchange, apiKeyName, symbol);
        }

        let orders = [];
        try {
            if (!this.nitroApp || !this.nitroApp.ccxtw) {
                throw new Error('CCXT wrapper not available');
            }

            // Special handling for Coinbase Advanced - use pagination to fetch all orders
            if (exchange === 'coinbaseadvanced') {
                orders = await this.fetchCoinbaseWithPagination(
                    userID,
                    apiKeyName,
                    symbol,
                    lastTimestamp,
                    targetLimit
                );
            } else {
                // Standard fetch for other exchanges
                const response = await this.nitroApp.ccxtw.fetchClosedOrders(
                    userID,
                    exchange,
                    symbol || undefined,
                    apiKeyName,
                    lastTimestamp,
                    targetLimit
                );

                if (!response.success || !response.data) {
                    return {
                        success: false,
                        error: response.log || 'No data returned from CCXT'
                    };
                }

                orders = response.data;
            }

            // Apply timestamp filter only if we have lastTimestamp
            // (CCXT 'since' parameter might not work on all exchanges)
            if (lastTimestamp) {
                orders = orders.filter(o => o.timestamp > lastTimestamp);
            }

            // Sort by timestamp descending (newest first)
            orders.sort((a, b) => b.timestamp - a.timestamp);

            console.log(`[SYNC-SERVICE] 📦 Fetched ${orders.length} orders from ${exchange} - ${apiKeyName} (target: ${targetLimit}, since: ${lastTimestamp || 'all'})`);

        } catch (error) {
            console.error(`[SYNC-SERVICE] ❌ Fetch failed for ${exchange}:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }

        // 4. Batch insert (skip duplicates)
        const { inserted, skipped } = await this.batchInsertOrders(orders, userID, exchange, apiKeyName);

        // 5. Găsește cel mai recent timestamp
        let latestTimestamp = lastTimestamp;
        if (orders.length > 0) {
            latestTimestamp = Math.max(...orders.map(o => o.timestamp));
        }

        // 6. Update sync state
        const { nextSyncAllowed, consecutiveEmptyFetches } = await this.updateSyncState(
            userID,
            exchange,
            apiKeyName,
            symbol,
            inserted,
            latestTimestamp
        );

        const nextSyncIn = Math.ceil((nextSyncAllowed - new Date()) / 1000);

        return {
            success: true,
            fetched: orders.length,
            inserted,
            skipped,
            nextSyncIn,
            consecutiveEmptyFetches,
            lastTimestamp: latestTimestamp
        };
    }
}

// Export factory function (singleton will be created in scheduler with nitroApp)
export function createClosedOrdersSyncService(nitroApp) {
    return new ClosedOrdersSyncService(nitroApp);
}
