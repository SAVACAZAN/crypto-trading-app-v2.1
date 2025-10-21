// Fetch combined balance from multiple API keys
import { balanceSchema } from '../../models/balance.schema';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const { userID, exchange, apiKeyNames, symbol } = query;

    console.log('🔍 [COMBINED BALANCE] Fetching combined balance...');
    console.log('   👤 UserID:', userID);
    console.log('   📊 Exchange:', exchange);
    console.log('   🔑 API Keys:', apiKeyNames);
    console.log('   💰 Symbol:', symbol);

    try {
        // Parse API keys array if it's a string
        let apiKeysArray = apiKeyNames;
        if (typeof apiKeyNames === 'string') {
            apiKeysArray = apiKeyNames.split(',');
        }

        console.log('   📋 Parsed API Keys:', apiKeysArray);

        // Extract BASE and QUOTE from symbol
        const [baseCurrency, quoteCurrency] = symbol.split('/');
        console.log('   💵 Base Currency:', baseCurrency);
        console.log('   💵 Quote Currency:', quoteCurrency);

        // Fetch balances for all API keys from MongoDB
        const balanceDocs = await balanceSchema.find({
            userID: userID,
            exchange: exchange,
            apiKeyName: { $in: apiKeysArray }
        }).sort({ lastUpdated: -1 });

        console.log('   📦 Found', balanceDocs.length, 'balance documents');

        // Combine balances for BASE and QUOTE only
        const combinedBalance = {};
        combinedBalance[baseCurrency] = { free: 0, used: 0, total: 0 };
        combinedBalance[quoteCurrency] = { free: 0, used: 0, total: 0 };

        balanceDocs.forEach((doc) => {
            console.log('   📄 Processing balance for API:', doc.apiKeyName);

            if (doc.balance) {
                // Add BASE currency
                if (doc.balance[baseCurrency]) {
                    combinedBalance[baseCurrency].free += doc.balance[baseCurrency].free || 0;
                    combinedBalance[baseCurrency].used += doc.balance[baseCurrency].used || 0;
                    combinedBalance[baseCurrency].total += doc.balance[baseCurrency].total || 0;
                    console.log(`      ${baseCurrency}:`, doc.balance[baseCurrency].free);
                }

                // Add QUOTE currency
                if (doc.balance[quoteCurrency]) {
                    combinedBalance[quoteCurrency].free += doc.balance[quoteCurrency].free || 0;
                    combinedBalance[quoteCurrency].used += doc.balance[quoteCurrency].used || 0;
                    combinedBalance[quoteCurrency].total += doc.balance[quoteCurrency].total || 0;
                    console.log(`      ${quoteCurrency}:`, doc.balance[quoteCurrency].free);
                }
            }
        });

        console.log('   ✅ COMBINED BALANCE:');
        console.log(`      ${baseCurrency}: ${combinedBalance[baseCurrency].free} (free)`);
        console.log(`      ${quoteCurrency}: ${combinedBalance[quoteCurrency].free} (free)`);

        return {
            success: true,
            data: combinedBalance,
            apiKeysUsed: apiKeysArray,
            totalDocuments: balanceDocs.length
        };

    } catch (error) {
        console.error('❌ [COMBINED BALANCE] Error:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch combined balance'
        };
    }
});
