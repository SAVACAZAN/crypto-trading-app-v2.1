import { userSchema as User } from '~/server/models/user.schema.js';
import { balanceSchema as Balance } from '~/server/models/balance.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { balance, orderbook, priceHistory, symbol, exchange, currentPrice, timeframe = '30d', userID, apiKeyName } = body;

    console.log('🤖 [GROQ AI] Received request:');
    console.log('   📊 Exchange:', exchange);
    console.log('   💰 Symbol:', symbol);
    console.log('   🔑 API Key:', apiKeyName || 'Default');
    console.log('   💵 Current Price:', currentPrice);

    if (!userID) return { success: false, error: 'Missing required field: userID' };
    if (!symbol) return { success: false, error: 'Missing required field: symbol' };
    if (!currentPrice || currentPrice === null) {
      console.error('❌ [GROQ AI] Current price is null');
      return { success: false, error: 'Current price is required. Please select a trading pair with valid market data.' };
    }

    const user = await User.findById(userID);
    if (!user) return { success: false, error: 'User not found' };

    const groqApiKey = user.aiApiKeys?.groq;
    if (!groqApiKey) return { success: false, error: 'Groq API key not configured. Get free key at console.groq.com' };

    const symbolParts = symbol.split('/');
    const baseCurr = symbolParts[0];
    const quoteCurr = symbolParts[1];

    let fullPortfolio = {};
    let totalPortfolioUSD = 0;
    let baseFree = 0;
    let quoteFree = 0;

    // ✅ USE COMBINED BALANCE IF PROVIDED (ALREADY CALCULATED FROM MULTIPLE API KEYS)
    if (balance && typeof balance === 'object') {
      console.log('✅ Using COMBINED balance from request body (multi-API)');

      // Build full portfolio from combined balance
      Object.keys(balance).forEach(curr => {
        const bal = balance[curr];
        if (bal && typeof bal === 'object' && bal.free > 0) {
          fullPortfolio[curr] = {
            free: bal.free,
            used: bal.used || 0,
            total: bal.total || bal.free
          };
        }
      });

      baseFree = balance[baseCurr]?.free || 0;
      quoteFree = balance[quoteCurr]?.free || 0;

      console.log('💰 COMBINED Balances for', baseCurr + '/' + quoteCurr + ':');
      console.log('   BASE (' + baseCurr + '):', baseFree.toFixed(8));
      console.log('   QUOTE (' + quoteCurr + '):', quoteFree.toFixed(8));
    } else {
      // ⚠️ FALLBACK: Query MongoDB if no balance provided
      console.log('⚠️  No balance in request, fetching from MongoDB...');
      const query = apiKeyName ? { userID, exchange, apiKeyName } : { userID, exchange };
      console.log('📡 Fetching balance with query:', query);
      const balanceDoc = await Balance.findOne(query).sort({ lastUpdated: -1 });

      if (balanceDoc && balanceDoc.balance) {
        console.log('✅ Balance document found for API:', balanceDoc.apiKeyName || 'Default');
        Object.keys(balanceDoc.balance).forEach(curr => {
          const bal = balanceDoc.balance[curr];
          if (bal && bal.free > 0) {
            fullPortfolio[curr] = {
              free: bal.free,
              used: bal.used || 0,
              total: bal.total || bal.free
            };
          }
        });

        baseFree = balanceDoc.balance[baseCurr]?.free || 0;
        quoteFree = balanceDoc.balance[quoteCurr]?.free || 0;
        totalPortfolioUSD = balanceDoc.totalUSD || 0;

        console.log('💰 Balances for', baseCurr + '/' + quoteCurr + ':');
        console.log('   BASE (' + baseCurr + '):', baseFree.toFixed(8));
        console.log('   QUOTE (' + quoteCurr + '):', quoteFree.toFixed(8));
      } else {
        console.log('⚠️  No balance found for query:', query);
      }
    }

    const orderbookToUse = orderbook || { bids: [], asks: [] };
    const bestBid = orderbookToUse.bids?.[0]?.[0] || 0;
    const bestAsk = orderbookToUse.asks?.[0]?.[0] || 0;

    let portfolioText = '\n';
    Object.keys(fullPortfolio).forEach(curr => {
      portfolioText += '  - ' + curr + ': ' + fullPortfolio[curr].free.toFixed(8) + ' (free)\n';
    });

    const apiKeyLabel = apiKeyName || 'Default';

    const prompt = 'You are an expert cryptocurrency grid trading bot advisor.\n\n' +
      '📊 TRADING SETUP:\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      'TRADING PAIR: ' + symbol + '\n' +
      'EXCHANGE: ' + exchange + '\n' +
      'API KEY: ' + apiKeyLabel + '\n' +
      'CURRENT PRICE: $' + currentPrice + '\n' +
      'BEST BID: $' + bestBid + '\n' +
      'BEST ASK: $' + bestAsk + '\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      'USER PORTFOLIO (ALL ASSETS):' + portfolioText + '\n\n' +
      '⚠️ CRITICAL - ANALYZE THESE BALANCES INDIVIDUALLY:\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      '  BASE (' + baseCurr + '):  ' + baseFree.toFixed(8) + ' coins\n' +
      '  QUOTE (' + quoteCurr + '): ' + quoteFree.toFixed(8) + ' coins\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      'DO NOT USE TOTAL USD VALUE ($' + totalPortfolioUSD.toFixed(2) + ')!\n' +
      'USE INDIVIDUAL COIN QUANTITIES ABOVE!\n\n' +
      'TASK: Analyze EACH currency INDIVIDUALLY and suggest MAX 10 grid bot configurations.\n\n' +
      'CRITICAL REQUIREMENTS:\n' +
      '1. MAX 10 BOTS total\n' +
      '2. TOTAL ORDERS across ALL bots: 400-450 orders (buy + sell combined)\n' +
      '3. SPREAD/WICKS: Use 1x, 2x, 3x...10x multipliers for catching wicks:\n' +
      '   - Bot 1: 1x spread (tight, close to price)\n' +
      '   - Bot 2: 2x spread (wider)\n' +
      '   - Bot 3: 3x spread (even wider)\n' +
      '   - ... up to Bot 10: 10x spread (very wide for catching extreme wicks)\n\n' +
      'INDIVIDUAL BALANCE ANALYSIS - CRITICAL:\n' +
      '1. ANALYZE SEPARATELY:\n' +
      '   - ' + baseCurr + ' balance: ' + baseFree.toFixed(8) + ' (use for SELL-only bots)\n' +
      '   - ' + quoteCurr + ' balance: ' + quoteFree.toFixed(8) + ' (use for BUY-only bots)\n' +
      '2. SUGGEST BOTS BASED ON WHAT USER HAS:\n' +
      '   - If user has ' + quoteCurr + ': Suggest BUY bots (buy ' + baseCurr + ' with ' + quoteCurr + ')\n' +
      '   - If user has ' + baseCurr + ': Suggest SELL bots (sell ' + baseCurr + ' for ' + quoteCurr + ')\n' +
      '   - If user has BOTH: Suggest mix of BUY and SELL bots\n' +
      '3. REALISTIC ALLOCATION:\n' +
      '   - Use 80-90% of available balance (leave reserve)\n' +
      '   - Divide balance wisely across multiple bots\n' +
      '   - Example: 10,000 ' + quoteCurr + ' → Bot1: 2000, Bot2: 1500, Bot3: 1200...\n\n' +
      'BOT CONFIGURATION PARAMETERS - MUST configure ALL:\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      '1. PRICE RANGE - CRITICAL LOGIC FOR BUY vs SELL BOTS:\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      '   CURRENT PRICE: $' + currentPrice.toFixed(4) + '\n\n' +
      '   🔴 BUY BOTS (use ' + quoteCurr + ' to buy ' + baseCurr + '):\n' +
      '      - MUST PLACE ORDERS BELOW CURRENT PRICE (buy the dip!)\n' +
      '      - lowerPrice: BELOW current price (where to start buying)\n' +
      '      - upperPrice: AT or SLIGHTLY BELOW current price\n' +
      '      - Bot 1 (1x - 5% range): Buy from $' + (currentPrice * 0.95).toFixed(4) + ' to $' + currentPrice.toFixed(4) + '\n' +
      '      - Bot 2 (2x - 10% range): Buy from $' + (currentPrice * 0.90).toFixed(4) + ' to $' + currentPrice.toFixed(4) + '\n' +
      '      - Bot 3 (3x - 15% range): Buy from $' + (currentPrice * 0.85).toFixed(4) + ' to $' + currentPrice.toFixed(4) + '\n' +
      '      - Bot 4 (4x - 20% range): Buy from $' + (currentPrice * 0.80).toFixed(4) + ' to $' + currentPrice.toFixed(4) + '\n' +
      '      - Bot 5 (5x - 25% range): Buy from $' + (currentPrice * 0.75).toFixed(4) + ' to $' + currentPrice.toFixed(4) + '\n' +
      '      - Bot 10 (10x - 50% range): Buy from $' + (currentPrice * 0.50).toFixed(4) + ' to $' + currentPrice.toFixed(4) + '\n\n' +
      '   🟢 SELL BOTS (use ' + baseCurr + ' to sell for ' + quoteCurr + '):\n' +
      '      - MUST PLACE ORDERS ABOVE CURRENT PRICE (sell the pump!)\n' +
      '      - lowerPrice: AT or SLIGHTLY ABOVE current price\n' +
      '      - upperPrice: ABOVE current price (where to stop selling)\n' +
      '      - Bot 1 (1x - 5% range): Sell from $' + currentPrice.toFixed(4) + ' to $' + (currentPrice * 1.05).toFixed(4) + '\n' +
      '      - Bot 2 (2x - 10% range): Sell from $' + currentPrice.toFixed(4) + ' to $' + (currentPrice * 1.10).toFixed(4) + '\n' +
      '      - Bot 3 (3x - 15% range): Sell from $' + currentPrice.toFixed(4) + ' to $' + (currentPrice * 1.15).toFixed(4) + '\n' +
      '      - Bot 4 (4x - 20% range): Sell from $' + currentPrice.toFixed(4) + ' to $' + (currentPrice * 1.20).toFixed(4) + '\n' +
      '      - Bot 5 (5x - 25% range): Sell from $' + currentPrice.toFixed(4) + ' to $' + (currentPrice * 1.25).toFixed(4) + '\n' +
      '      - Bot 10 (10x - 50% range): Sell from $' + currentPrice.toFixed(4) + ' to $' + (currentPrice * 1.50).toFixed(4) + '\n\n' +
      '   ⚠️ IMPORTANT: USE 4 DECIMAL PRECISION for all prices!\n' +
      '   ⚠️ BUY = BELOW current price | SELL = ABOVE current price\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      '2. GRIDS:\n' +
      '   - numberOfGrids: TOTAL 400-450 orders across all bots\n' +
      '   - For 10 bots: ~40-45 grids per bot\n' +
      '   - For 5 bots: ~80-90 grids per bot\n\n' +
      '3. INCREMENTAL AMOUNT (progressive sizing):\n' +
      '   - incrementalPercentAmountBuy: 1.0-2.0 (increase buy size deeper in range)\n' +
      '   - incrementalPercentAmountSell: 1.0-2.0 (increase sell size higher up)\n\n' +
      '4. PRICE DEVIATION (spread/wicks multiplier - KEY PARAMETER!):\n' +
      '   - deviationPriceBuy: 1.0 for Bot1, 2.0 for Bot2... 10.0 for Bot10\n' +
      '   - deviationPriceSell: 1.0 for Bot1, 2.0 for Bot2... 10.0 for Bot10\n' +
      '   - This creates layered wicks coverage!\n\n' +
      '5. AMOUNT DEVIATION (order size variation):\n' +
      '   - deviationAmountBuy: 0.8-1.2 (reduce/increase amounts per grid)\n' +
      '   - deviationAmountSell: 0.8-1.2\n\n' +
      '6. ALLOCATION - IMPORTANT: CALCULATE IN COIN QUANTITY, NOT USD!\n' +
      '   - suggestedAmount: QUANTITY of ' + quoteCurr + ' per bot (NOT USD value!)\n' +
      '   - Example: For ' + symbol + ' at $' + currentPrice + ':\n' +
      '     * If user has 10,000 ' + quoteCurr + ', suggest amounts like 1000 ' + quoteCurr + ', 1500 ' + quoteCurr + ', etc.\n' +
      '     * DO NOT suggest USD amounts like 100 USD\n' +
      '     * suggestedAmount is the BASE AMOUNT of ' + quoteCurr + ' for each grid\n' +
      '   - Calculate total USD at the end: (numberOfGrids × suggestedAmount × averagePrice)\n\n' +
      'AMOUNT CALCULATION LOGIC:\n' +
      '  - Each grid uses: suggestedAmount + (suggestedAmount × incrementalPercent × gridIndex)\n' +
      '  - Example: suggestedAmount = 100 ' + quoteCurr + ', incrementalPercent = 1.0 (1%)\n' +
      '    * Grid 1: 100 ' + quoteCurr + '\n' +
      '    * Grid 2: 100 + (100 × 0.01 × 1) = 101 ' + quoteCurr + '\n' +
      '    * Grid 3: 100 + (100 × 0.01 × 2) = 102 ' + quoteCurr + '\n' +
      '  - Total ' + quoteCurr + ' needed = sum of all grids\n' +
      '  - Total USD = (average price × total ' + quoteCurr + ')\n\n' +
      'EXAMPLE: If CURRENT PRICE = $' + currentPrice.toFixed(4) + ' and suggesting 10 bots with 400 total orders:\n' +
      '  - Each bot gets ~40 grids\n' +
      '  🔴 BUY BOTS (if user has ' + quoteCurr + '):\n' +
      '    - Bot 1 BUY (1x): Lower=$' + (currentPrice * 0.95).toFixed(4) + ', Upper=$' + currentPrice.toFixed(4) + ', 1.0x deviation, 1000 ' + quoteCurr + '\n' +
      '    - Bot 2 BUY (2x): Lower=$' + (currentPrice * 0.90).toFixed(4) + ', Upper=$' + currentPrice.toFixed(4) + ', 2.0x deviation, 800 ' + quoteCurr + '\n' +
      '    - Bot 5 BUY (5x): Lower=$' + (currentPrice * 0.75).toFixed(4) + ', Upper=$' + currentPrice.toFixed(4) + ', 5.0x deviation, 600 ' + quoteCurr + '\n' +
      '  🟢 SELL BOTS (if user has ' + baseCurr + '):\n' +
      '    - Bot 6 SELL (6x): Lower=$' + currentPrice.toFixed(4) + ', Upper=$' + (currentPrice * 1.30).toFixed(4) + ', 6.0x deviation, 5000 ' + baseCurr + '\n' +
      '    - Bot 7 SELL (7x): Lower=$' + currentPrice.toFixed(4) + ', Upper=$' + (currentPrice * 1.35).toFixed(4) + ', 7.0x deviation, 4000 ' + baseCurr + '\n' +
      '    - Bot 10 SELL (10x): Lower=$' + currentPrice.toFixed(4) + ', Upper=$' + (currentPrice * 1.50).toFixed(4) + ', 10.0x deviation, 2000 ' + baseCurr + '\n\n' +
      'COVERAGE STRATEGY - Griduri pentru TOATE scenariile:\n' +
      '  - PUMP: Upper grids to sell into rallies\n' +
      '  - DUMP: Lower grids to buy dips\n' +
      '  - SIDEWAYS: Mid-range grids for range trading\n' +
      '  - WICKS: Wide spread bots (5x-10x) to catch extreme moves\n' +
      '  - NORMAL: Tight spread bots (1x-3x) for regular volatility\n\n' +
      'Return ONLY valid JSON (USE 4 DECIMAL PRECISION, CURRENT PRICE = $' + currentPrice.toFixed(4) + '):\n' +
      '{\n' +
      '  "baseBalance": ' + baseFree.toFixed(8) + ',\n' +
      '  "quoteBalance": ' + quoteFree.toFixed(8) + ',\n' +
      '  "baseCurrency": "' + baseCurr + '",\n' +
      '  "quoteCurrency": "' + quoteCurr + '",\n' +
      '  "currentPrice": ' + currentPrice.toFixed(4) + ',\n' +
      '  "recommendedBots": [\n' +
      '    {\n' +
      '      "botName": "BUY Bot 1 - Tight (1x)",\n' +
      '      "lowerPrice": ' + (currentPrice * 0.95).toFixed(4) + ',\n' +
      '      "upperPrice": ' + currentPrice.toFixed(4) + ',\n' +
      '      "numberOfGrids": 40,\n' +
      '      "incrementalPercentAmountBuy": 1.0,\n' +
      '      "incrementalPercentAmountSell": 1.0,\n' +
      '      "deviationPriceBuy": 1.0,\n' +
      '      "deviationPriceSell": 1.0,\n' +
      '      "deviationAmountBuy": 0.9,\n' +
      '      "deviationAmountSell": 0.9,\n' +
      '      "suggestedAmount": 1000,\n' +
      '      "botType": "BUY",\n' +
      '      "usesBalance": "' + quoteCurr + '",\n' +
      '      "estimatedTotal' + quoteCurr + '": 40000,\n' +
      '      "riskLevel": "Low",\n' +
      '      "strategy": "BUY: 5% range below current price (1x multiplier)"\n' +
      '    },\n' +
      '    {\n' +
      '      "botName": "BUY Bot 2 - 10% Range (2x)",\n' +
      '      "lowerPrice": ' + (currentPrice * 0.90).toFixed(4) + ',\n' +
      '      "upperPrice": ' + currentPrice.toFixed(4) + ',\n' +
      '      "numberOfGrids": 40,\n' +
      '      "incrementalPercentAmountBuy": 1.0,\n' +
      '      "incrementalPercentAmountSell": 1.0,\n' +
      '      "deviationPriceBuy": 2.0,\n' +
      '      "deviationPriceSell": 2.0,\n' +
      '      "deviationAmountBuy": 0.9,\n' +
      '      "deviationAmountSell": 0.9,\n' +
      '      "suggestedAmount": 800,\n' +
      '      "botType": "BUY",\n' +
      '      "usesBalance": "' + quoteCurr + '",\n' +
      '      "estimatedTotal' + quoteCurr + '": 32000,\n' +
      '      "riskLevel": "Low",\n' +
      '      "strategy": "BUY: 10% range below current price (2x multiplier)"\n' +
      '    },\n' +
      '    {\n' +
      '      "botName": "SELL Bot 6 - 30% Range (6x)",\n' +
      '      "lowerPrice": ' + currentPrice.toFixed(4) + ',\n' +
      '      "upperPrice": ' + (currentPrice * 1.30).toFixed(4) + ',\n' +
      '      "numberOfGrids": 40,\n' +
      '      "incrementalPercentAmountBuy": 1.0,\n' +
      '      "incrementalPercentAmountSell": 1.0,\n' +
      '      "deviationPriceBuy": 6.0,\n' +
      '      "deviationPriceSell": 6.0,\n' +
      '      "deviationAmountBuy": 1.1,\n' +
      '      "deviationAmountSell": 1.1,\n' +
      '      "suggestedAmount": 5000,\n' +
      '      "botType": "SELL",\n' +
      '      "usesBalance": "' + baseCurr + '",\n' +
      '      "estimatedTotal' + baseCurr + '": 200000,\n' +
      '      "riskLevel": "Medium",\n' +
      '      "strategy": "SELL: 30% range above current price (6x multiplier for wicks)"\n' +
      '    },\n' +
      '    {\n' +
      '      "botName": "SELL Bot 10 - 50% Range (10x)",\n' +
      '      "lowerPrice": ' + currentPrice.toFixed(4) + ',\n' +
      '      "upperPrice": ' + (currentPrice * 1.50).toFixed(4) + ',\n' +
      '      "numberOfGrids": 40,\n' +
      '      "incrementalPercentAmountBuy": 1.5,\n' +
      '      "incrementalPercentAmountSell": 1.5,\n' +
      '      "deviationPriceBuy": 10.0,\n' +
      '      "deviationPriceSell": 10.0,\n' +
      '      "deviationAmountBuy": 1.2,\n' +
      '      "deviationAmountSell": 1.2,\n' +
      '      "suggestedAmount": 2000,\n' +
      '      "botType": "SELL",\n' +
      '      "usesBalance": "' + baseCurr + '",\n' +
      '      "estimatedTotal' + baseCurr + '": 80000,\n' +
      '      "riskLevel": "High",\n' +
      '      "strategy": "SELL: 50% range above current price (10x multiplier for extreme wicks)"\n' +
      '    }\n' +
      '  ],\n' +
      '  "marketAnalysis": "Current price: $' + currentPrice.toFixed(4) + '. Balance: ' + baseFree.toFixed(2) + ' ' + baseCurr + ' + ' + quoteFree.toFixed(2) + ' ' + quoteCurr + '. Strategy: BUY bots catch dips, SELL bots catch pumps.",\n' +
      '  "riskWarning": "⚠️ CRITICAL: BUY bots ONLY BELOW $' + currentPrice.toFixed(4) + ' | SELL bots ONLY ABOVE $' + currentPrice.toFixed(4) + '. Use 5%-50% ranges with 1x-10x multipliers."\n' +
      '}';

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + groqApiKey
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 8000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();

      // ✅ CUSTOM ERROR MESSAGE FOR RATE LIMIT
      if (response.status === 429) {
        console.log('⚠️ [GROQ AI] Rate limit exceeded - suggesting alternatives to user');
        return {
          success: false,
          rateLimitExceeded: true,
          error: '⚠️ Groq AI Daily Limit Reached!\n\nYou\'ve used your free daily tokens. Please try:\n• OpenAI ChatGPT (GPT-4) - Best quality\n• Claude AI (Anthropic) - Excellent for analysis\n• Google Gemini - Fast and free\n\nOr upgrade your Groq account at console.groq.com/settings/billing'
        };
      }

      // Other API errors
      console.error('❌ [GROQ AI] API Error:', response.status);
      throw new Error('Groq API error: ' + response.status + ' - ' + errorText);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;

    console.log('✅ [GROQ AI] Response received from Groq API');
    console.log('📝 [GROQ AI] Raw response length:', text.length, 'characters');
    console.log('🔍 [GROQ AI] First 500 chars:', text.substring(0, 500));

    const parsedSuggestions = parseResponse(text);
    console.log('📊 [GROQ AI] Parsed suggestions:', JSON.stringify(parsedSuggestions, null, 2));

    const marketContext = {
      symbol, exchange, currentPrice, timeframe,
      portfolio: fullPortfolio,
      totalPortfolioUSD,
      pairBalance: { base: baseFree, quote: quoteFree },
      orderbook: { bestBid, bestAsk },
    };

    return { success: true, data: { analysis: text, suggestions: parsedSuggestions, marketContext } };
  } catch (error) {
    console.error('Groq AI Error:', error);
    return { success: false, error: error.message || 'Failed to get AI analysis' };
  }
});

function parseResponse(response) {
  try {
    let cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      if (parsed.recommendedBots && Array.isArray(parsed.recommendedBots)) {
        return {
          parsed: true,
          baseBalance: parseFloat(parsed.baseBalance) || 0,
          quoteBalance: parseFloat(parsed.quoteBalance) || 0,
          baseCurrency: parsed.baseCurrency || 'BASE',
          quoteCurrency: parsed.quoteCurrency || 'QUOTE',
          recommendedBots: parsed.recommendedBots.map((bot, index) => ({
            botName: bot.botName || 'Bot ' + (index + 1),
            lowerPrice: parseFloat(bot.lowerPrice) || 0,
            upperPrice: parseFloat(bot.upperPrice) || 0,
            numberOfGrids: parseInt(bot.numberOfGrids) || 10,
            incrementalPercentAmountBuy: parseFloat(bot.incrementalPercentAmountBuy) || 1.0,
            incrementalPercentAmountSell: parseFloat(bot.incrementalPercentAmountSell) || 1.0,
            deviationPriceBuy: parseFloat(bot.deviationPriceBuy) || 1.0,
            deviationPriceSell: parseFloat(bot.deviationPriceSell) || 1.0,
            deviationAmountBuy: parseFloat(bot.deviationAmountBuy) || 0.9,
            deviationAmountSell: parseFloat(bot.deviationAmountSell) || 0.9,
            suggestedAmount: parseFloat(bot.suggestedAmount) || 10,
            botType: bot.botType || 'BUY',
            usesBalance: bot.usesBalance || parsed.quoteCurrency || 'QUOTE',
            riskLevel: bot.riskLevel || 'Medium',
            strategy: bot.strategy || 'Grid trading strategy'
          })),
          marketAnalysis: parsed.marketAnalysis || 'No analysis provided',
          riskWarning: parsed.riskWarning || 'Trading involves risk'
        };
      }

      return {
        lowerPrice: parsed.lowerPrice || null,
        upperPrice: parsed.upperPrice || null,
        numberOfGrids: parsed.numberOfGrids || null,
        riskLevel: parsed.riskLevel || 'Medium',
        reasoning: parsed.reasoning || null,
        parsed: true
      };
    }
    return { parsed: false, reasoning: response };
  } catch (error) {
    return { parsed: false, reasoning: response };
  }
}
