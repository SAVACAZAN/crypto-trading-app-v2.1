/**
 * Test endpoint to directly fetch markets from LCX API
 * No authentication needed - this is a public endpoint
 */
export default defineEventHandler(async (event) => {
    try {
        console.log('[TestLCX] 🔍 Fetching markets directly from LCX API...');

        const response = await fetch('https://exchange-api.lcx.com/market/pairs', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const markets = data.data || [];

        console.log(`[TestLCX] ✅ Fetched ${markets.length} markets from LCX`);

        // Search for MDEX/EUR specifically
        const mdexEUR = markets.find(m =>
            (m.base === 'MDEX' && m.quote === 'EUR') ||
            (m.symbol && m.symbol.includes('MDEX') && m.symbol.includes('EUR'))
        );

        // Get all pairs as strings for easy searching
        const allPairs = markets.map(m => {
            if (m.symbol) return m.symbol;
            if (m.base && m.quote) return `${m.base}/${m.quote}`;
            return null;
        }).filter(Boolean);

        return {
            success: true,
            totalMarkets: markets.length,
            mdexEURFound: mdexEUR ? true : false,
            mdexEUR: mdexEUR || null,
            allPairs: allPairs.sort(), // Sorted alphabetically
            rawData: markets // Full data for inspection
        };

    } catch (error) {
        console.error('[TestLCX] ❌ Error:', error);
        return {
            success: false,
            error: error.message
        };
    }
})
