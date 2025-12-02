import {userExchangesSchema} from "~/server/models/userExchanges.schema";

/**
 * Refresh markets for a specific exchange
 * This is useful when exchanges add new trading pairs (like MDEX/EUR on LCX)
 */
export default defineEventHandler(async (event) => {
    try {
        const data = await readBody(event);

        if (!data.userID || !data.exchange) {
            return {
                success: false,
                message: 'Missing required parameters: userID and exchange'
            };
        }

        console.log(`[RefreshMarkets] 🔄 Refreshing markets for ${data.exchange}...`);

        // Check if exchange exists for this user
        let existingExchange = await userExchangesSchema.findOne({
            userID: data.userID,
            exchange: data.exchange
        });

        if (!existingExchange) {
            return {
                success: false,
                message: `Exchange ${data.exchange} not found for user`
            };
        }

        // Fetch latest markets from exchange
        const marketsRaw = await $fetch('/api/v1/fetchMarkets', {
            query:{
                userID: data.userID,
                exchange: data.exchange,
            }
        });

        if (!marketsRaw.success) {
            return {
                success: false,
                message: 'Failed to fetch markets from exchange',
                error: marketsRaw.message
            };
        }

        // Handle the response - markets could be in marketsRaw.markets or marketsRaw.data
        const rawMarkets = marketsRaw.markets || marketsRaw.data || [];

        if (!rawMarkets || rawMarkets.length === 0) {
            return {
                success: false,
                message: 'No markets returned from exchange'
            };
        }

        console.log(`[RefreshMarkets] ✅ Fetched ${rawMarkets.length} markets from ${data.exchange}`);

        // Format markets
        let markets = [];
        const processedMarkets = new Set();

        for (let i = 0; i < rawMarkets.length; i++) {
            let market = rawMarkets[i];
            let key = `${market.base}/${market.quote}`;

            // Only add active markets and avoid duplicates
            if (market.active && !processedMarkets.has(key)) {
                processedMarkets.add(key);

                markets.push({
                    base: market.base,
                    quote: market.quote,
                    type: (market.type === 'spot') ? 'spot' : 'futures',
                    limits: market.limits,
                    precision: market.precision,
                    maker: market.maker,
                    taker: market.taker,
                });
            }
        }

        console.log(`[RefreshMarkets] 📊 Processed ${markets.length} unique active markets`);

        // Get current selected market
        const currentSelectedMarket = existingExchange.selectedMarket;
        let newSelectedMarket = currentSelectedMarket;

        // Check if current selected market still exists in new markets
        if (currentSelectedMarket && currentSelectedMarket.base && currentSelectedMarket.quote) {
            const selectedKey = `${currentSelectedMarket.base}/${currentSelectedMarket.quote}`;
            const stillExists = markets.some(m => `${m.base}/${m.quote}` === selectedKey);

            if (!stillExists && markets.length > 0) {
                // If current market no longer exists, default to first market
                newSelectedMarket = markets[0];
                console.log(`[RefreshMarkets] ⚠️ Previous selected market ${selectedKey} not found, defaulting to ${newSelectedMarket.base}/${newSelectedMarket.quote}`);
            }
        } else if (markets.length > 0) {
            // If no selected market, default to first one
            newSelectedMarket = markets[0];
        }

        // Update markets in database
        await userExchangesSchema.updateOne(
            { userID: data.userID, exchange: data.exchange },
            {
                markets: markets,
                selectedMarket: newSelectedMarket,
            }
        );

        console.log(`[RefreshMarkets] ✅ Markets updated successfully for ${data.exchange}`);

        // Check if specific market was requested (e.g., MDEX/EUR)
        if (data.findMarket) {
            const foundMarket = markets.find(m => `${m.base}/${m.quote}` === data.findMarket);
            if (foundMarket) {
                console.log(`[RefreshMarkets] ✅ Found requested market: ${data.findMarket}`);
                return {
                    success: true,
                    message: `Markets refreshed! Found ${data.findMarket}`,
                    totalMarkets: markets.length,
                    foundMarket: foundMarket,
                    markets: markets
                };
            } else {
                console.log(`[RefreshMarkets] ❌ Requested market ${data.findMarket} not found`);
                return {
                    success: true,
                    message: `Markets refreshed but ${data.findMarket} not found`,
                    totalMarkets: markets.length,
                    foundMarket: null,
                    markets: markets
                };
            }
        }

        return {
            success: true,
            message: `Markets refreshed successfully for ${data.exchange}`,
            totalMarkets: markets.length,
            markets: markets
        };

    } catch (error) {
        console.error('[RefreshMarkets] ❌ Error:', error);
        return {
            success: false,
            message: error.message || 'Unknown error occurred'
        };
    }
})
