export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const { exchange } = query;

    const statusChecks = {
        coinbase: async () => {
            try {
                // Check Coinbase status page
                const statusPageResponse = await fetch('https://api.statuspage.io/v1/pages/5j4c75wtrnqh/summary.json');
                const statusData = await statusPageResponse.json();

                // Check main component status
                const indicator = statusData.status?.indicator || 'unknown';
                const description = statusData.status?.description || 'Unknown status';

                // Check for incidents
                const incidents = statusData.incidents || [];
                const activeIncidents = incidents.filter(i =>
                    i.status === 'investigating' ||
                    i.status === 'identified' ||
                    i.status === 'monitoring'
                );

                // Check components (Site Performance, Trading, API)
                const components = statusData.components || [];
                const criticalComponents = components.filter(c =>
                    c.name?.includes('Trading') ||
                    c.name?.includes('API') ||
                    c.name?.includes('Login') ||
                    c.name?.includes('Transactions')
                );

                const hasIssues = indicator !== 'none' || activeIncidents.length > 0;
                const apiDown = criticalComponents.some(c =>
                    c.status === 'major_outage' ||
                    c.status === 'partial_outage'
                );

                // Try a simple API call as secondary check
                let apiWorking = false;
                try {
                    const testResponse = await fetch('https://api.coinbase.com/api/v3/brokerage/time', {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    apiWorking = testResponse.ok;
                } catch (e) {
                    apiWorking = false;
                }

                return {
                    exchange: 'coinbase',
                    statusPageUrl: 'https://status.coinbase.com/',
                    operational: !hasIssues && apiWorking,
                    apiWorking,
                    indicator,
                    description,
                    hasIssues,
                    incidents: activeIncidents.map(i => ({
                        name: i.name,
                        status: i.status,
                        impact: i.impact,
                        created: i.created_at,
                        updates: i.incident_updates?.slice(0, 2)?.map(u => ({
                            body: u.body,
                            created: u.created_at,
                            status: u.status
                        })) || []
                    })),
                    components: criticalComponents.map(c => ({
                        name: c.name,
                        status: c.status,
                        description: c.description
                    })),
                    message: hasIssues ?
                        '⚠️ COINBASE HAS ISSUES - API calls disabled' :
                        apiWorking ?
                            '✅ Coinbase is operational' :
                            '❌ Coinbase API not responding',
                    shouldDisableSync: hasIssues || !apiWorking,
                    lastChecked: new Date().toISOString()
                };
            } catch (error) {
                return {
                    exchange: 'coinbase',
                    statusPageUrl: 'https://status.coinbase.com/',
                    operational: false,
                    apiWorking: false,
                    hasIssues: true,
                    message: `❌ Failed to check status: ${error.message}`,
                    shouldDisableSync: true,
                    lastChecked: new Date().toISOString()
                };
            }
        },

        lcx: async () => {
            // LCX doesn't have a public status page, so test the API
            try {
                const testResponse = await fetch('https://exchange-api.lcx.com/market/tickers', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });

                const apiWorking = testResponse.ok;

                return {
                    exchange: 'lcx',
                    statusPageUrl: null,
                    operational: apiWorking,
                    apiWorking,
                    hasIssues: !apiWorking,
                    message: apiWorking ? '✅ LCX is operational' : '❌ LCX API not responding',
                    shouldDisableSync: !apiWorking,
                    lastChecked: new Date().toISOString()
                };
            } catch (error) {
                return {
                    exchange: 'lcx',
                    operational: false,
                    apiWorking: false,
                    hasIssues: true,
                    message: `❌ LCX API error: ${error.message}`,
                    shouldDisableSync: true,
                    lastChecked: new Date().toISOString()
                };
            }
        },

        kraken: async () => {
            try {
                // Check Kraken status
                const testResponse = await fetch('https://api.kraken.com/0/public/SystemStatus');
                const data = await testResponse.json();

                const isOnline = data?.result?.status === 'online';

                return {
                    exchange: 'kraken',
                    statusPageUrl: 'https://status.kraken.com/',
                    operational: isOnline,
                    apiWorking: isOnline,
                    hasIssues: !isOnline,
                    message: isOnline ? '✅ Kraken is operational' : '❌ Kraken has issues',
                    shouldDisableSync: !isOnline,
                    lastChecked: new Date().toISOString()
                };
            } catch (error) {
                return {
                    exchange: 'kraken',
                    operational: false,
                    apiWorking: false,
                    hasIssues: true,
                    message: `❌ Kraken API error: ${error.message}`,
                    shouldDisableSync: true,
                    lastChecked: new Date().toISOString()
                };
            }
        }
    };

    // Check specific exchange or all
    if (exchange && statusChecks[exchange]) {
        const status = await statusChecks[exchange]();
        return {
            success: true,
            data: status
        };
    } else {
        // Check all exchanges
        const results = {};
        for (const [exchangeName, checkFunc] of Object.entries(statusChecks)) {
            results[exchangeName] = await checkFunc();
        }

        // Overall system status
        const allOperational = Object.values(results).every(s => s.operational);
        const criticalDown = results.coinbase?.shouldDisableSync || false;

        return {
            success: true,
            allOperational,
            criticalDown,
            message: criticalDown ?
                '🚨 CRITICAL: Coinbase is down - All sync operations suspended' :
                allOperational ?
                    '✅ All exchanges operational' :
                    '⚠️ Some exchanges have issues',
            exchanges: results
        };
    }
});