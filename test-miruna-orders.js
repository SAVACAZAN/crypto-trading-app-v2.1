/**
 * Test script to fetch all open orders for Miruna API key
 * This will check all available markets and find where orders exist
 */

const userID = '66e5d23b4844420459b54ee9';
const exchange = 'lcx';
const apiKeyName = 'Miruna';
const baseURL = 'http://localhost:3000';

async function fetchJSON(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

async function testMirunaOrders() {
  console.log('🔍 Testing Open Orders for Miruna API Key');
  console.log('='.repeat(60));
  console.log(`UserID: ${userID}`);
  console.log(`Exchange: ${exchange}`);
  console.log(`API Key: ${apiKeyName}`);
  console.log('='.repeat(60));
  console.log('');

  try {
    // Step 1: Fetch all available markets
    console.log('📋 Step 1: Fetching available markets...');
    const marketsURL = `${baseURL}/api/v1/fetchMarkets?userID=${userID}&exchange=${exchange}`;
    const marketsRes = await fetchJSON(marketsURL);

    if (!marketsRes.data || marketsRes.data.length === 0) {
      console.log('❌ No markets found!');
      return;
    }

    const markets = marketsRes.data.map(m => m.symbol);
    console.log(`✅ Found ${markets.length} markets`);
    console.log(`   Markets: ${markets.slice(0, 5).join(', ')}${markets.length > 5 ? '...' : ''}`);
    console.log('');

    // Step 2: Check each market for open orders
    console.log('📋 Step 2: Checking orders on each market...');
    console.log('');

    let totalOrders = 0;
    const ordersPerMarket = {};

    for (const symbol of markets) {
      try {
        const ordersURL = `${baseURL}/api/v1/fetchOpenOrders?userID=${userID}&exchange=${exchange}&symbol=${encodeURIComponent(symbol)}&apiKeyName=${encodeURIComponent(apiKeyName)}`;
        const ordersRes = await fetchJSON(ordersURL);

        if (ordersRes.data && ordersRes.data.length > 0) {
          totalOrders += ordersRes.data.length;
          ordersPerMarket[symbol] = ordersRes.data;
          console.log(`✅ ${symbol.padEnd(20)} → ${ordersRes.data.length} orders found`);

          // Show order details
          ordersRes.data.forEach((order, idx) => {
            console.log(`   ${idx + 1}. ${order.side.toUpperCase()} ${order.amount} @ ${order.price} (ID: ${order.id})`);
          });
        } else {
          process.stdout.write('.');
        }
      } catch (error) {
        console.log(`❌ ${symbol}: ${error.message}`);
      }
    }

    console.log('');
    console.log('');
    console.log('='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Markets Checked: ${markets.length}`);
    console.log(`Markets with Orders: ${Object.keys(ordersPerMarket).length}`);
    console.log(`Total Orders Found: ${totalOrders}`);
    console.log('');

    if (totalOrders > 0) {
      console.log('📋 Orders by Market:');
      Object.entries(ordersPerMarket).forEach(([symbol, orders]) => {
        const buyOrders = orders.filter(o => o.side === 'buy').length;
        const sellOrders = orders.filter(o => o.side === 'sell').length;
        console.log(`   ${symbol}: ${buyOrders} BUY, ${sellOrders} SELL (Total: ${orders.length})`);
      });
    } else {
      console.log('⚠️ No open orders found for Miruna on any market');
    }

    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testMirunaOrders().catch(console.error);
