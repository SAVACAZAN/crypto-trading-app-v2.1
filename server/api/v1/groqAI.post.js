import { userSchema as User } from '~/server/models/user.schema.js';
import { balanceSchema as Balance } from '~/server/models/balance.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { balance, orderbook, priceHistory, symbol, exchange, currentPrice, timeframe = '30d', userID, apiKeyName } = body;

    if (!userID) return { success: false, error: 'Missing required field: userID' };
    if (!symbol) return { success: false, error: 'Missing required field: symbol' };

    const user = await User.findById(userID);
    if (!user) return { success: false, error: 'User not found' };

    const groqApiKey = user.aiApiKeys?.groq;
    if (!groqApiKey) return { success: false, error: 'Groq API key not configured. Get free key at console.groq.com' };

    const symbolParts = symbol.split('/');
    const baseCurr = symbolParts[0];
    const quoteCurr = symbolParts[1];

    const query = apiKeyName ? { userID, exchange, apiKeyName } : { userID, exchange };
    const balanceDoc = await Balance.findOne(query).sort({ lastUpdated: -1 });

    let fullPortfolio = {};
    let totalPortfolioUSD = 0;
    let baseFree = 0;
    let quoteFree = 0;

    if (balanceDoc && balanceDoc.balance) {
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
    }

    const orderbookToUse = orderbook || { bids: [], asks: [] };
    const bestBid = orderbookToUse.bids?.[0]?.[0] || 0;
    const bestAsk = orderbookToUse.asks?.[0]?.[0] || 0;

    let portfolioText = '\n';
    Object.keys(fullPortfolio).forEach(curr => {
      portfolioText += '  - ' + curr + ': ' + fullPortfolio[curr].free.toFixed(8) + ' (free)\n';
    });

    const prompt = 'You are an expert cryptocurrency grid trading bot advisor.\n\n' +
      'TRADING PAIR: ' + symbol + '\n' +
      'EXCHANGE: ' + exchange + '\n' +
      'CURRENT PRICE: $' + currentPrice + '\n' +
      'BEST BID: $' + bestBid + '\n' +
      'BEST ASK: $' + bestAsk + '\n\n' +
      'USER PORTFOLIO (ALL ASSETS):' + portfolioText + '\n' +
      'TOTAL PORTFOLIO VALUE: ~$' + totalPortfolioUSD.toFixed(2) + '\n\n' +
      'PAIR BALANCE:\n' +
      '  - ' + baseCurr + ': ' + baseFree.toFixed(8) + ' free\n' +
      '  - ' + quoteCurr + ': ' + quoteFree.toFixed(8) + ' free\n\n' +
      'TASK: Analyze the portfolio and suggest MAX 10 grid bot configurations.\n\n' +
      'CRITICAL REQUIREMENTS:\n' +
      '1. MAX 10 BOTS total\n' +
      '2. TOTAL ORDERS across ALL bots: 400-450 orders (buy + sell combined)\n' +
      '3. SPREAD/WICKS: Use 1x, 2x, 3x...10x multipliers for catching wicks:\n' +
      '   - Bot 1: 1x spread (tight, close to price)\n' +
      '   - Bot 2: 2x spread (wider)\n' +
      '   - Bot 3: 3x spread (even wider)\n' +
      '   - ... up to Bot 10: 10x spread (very wide for catching extreme wicks)\n\n' +
      'PORTFOLIO ANALYSIS:\n' +
      '1. Look at ENTIRE portfolio - user might need to sell ' + baseCurr + ' or other assets to get ' + quoteCurr + '\n' +
      '2. If user has ' + baseCurr + ' but NO ' + quoteCurr + ', suggest selling some ' + baseCurr + ' first\n\n' +
      'BOT CONFIGURATION PARAMETERS - MUST configure ALL:\n' +
      '1. PRICE RANGE:\n' +
      '   - lowerPrice: Lower bound (Bot 1: tight ~5% below, Bot 10: wide ~50% below)\n' +
      '   - upperPrice: Upper bound (Bot 1: tight ~5% above, Bot 10: wide ~50% above)\n\n' +
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
      '6. ALLOCATION:\n' +
      '   - suggestedAmount: ' + quoteCurr + ' amount per bot (divide total wisely)\n\n' +
      'EXAMPLE: If suggesting 10 bots with 400 total orders:\n' +
      '  - Each bot gets ~40 grids\n' +
      '  - Bot 1: 1.0x deviation (tight), Bot 2: 2.0x, ... Bot 10: 10.0x (wide wicks)\n\n' +
      'COVERAGE STRATEGY - Griduri pentru TOATE scenariile:\n' +
      '  - PUMP: Upper grids to sell into rallies\n' +
      '  - DUMP: Lower grids to buy dips\n' +
      '  - SIDEWAYS: Mid-range grids for range trading\n' +
      '  - WICKS: Wide spread bots (5x-10x) to catch extreme moves\n' +
      '  - NORMAL: Tight spread bots (1x-3x) for regular volatility\n\n' +
      'Return ONLY valid JSON:\n' +
      '{\n' +
      '  "totalBalance": ' + totalPortfolioUSD + ',\n' +
      '  "recommendedBots": [\n' +
      '    {\n' +
      '      "botName": "Bot 1 - Conservative",\n' +
      '      "lowerPrice": 0.095,\n' +
      '      "upperPrice": 0.105,\n' +
      '      "numberOfGrids": 20,\n' +
      '      "incrementalPercentAmountBuy": 1.0,\n' +
      '      "incrementalPercentAmountSell": 1.0,\n' +
      '      "deviationPriceBuy": 1.0,\n' +
      '      "deviationPriceSell": 1.0,\n' +
      '      "deviationAmountBuy": 0.9,\n' +
      '      "deviationAmountSell": 0.9,\n' +
      '      "suggestedAmount": 50,\n' +
      '      "riskLevel": "Low",\n' +
      '      "strategy": "Tight range, sell some ' + baseCurr + ' first to get ' + quoteCurr + '"\n' +
      '    }\n' +
      '  ],\n' +
      '  "marketAnalysis": "Portfolio analysis and recommendations",\n' +
      '  "riskWarning": "Trading involves risk"\n' +
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
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error('Groq API error: ' + response.status + ' - ' + error);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;

    const marketContext = {
      symbol, exchange, currentPrice, timeframe,
      portfolio: fullPortfolio,
      totalPortfolioUSD,
      pairBalance: { base: baseFree, quote: quoteFree },
      orderbook: { bestBid, bestAsk },
    };

    return { success: true, data: { analysis: text, suggestions: parseResponse(text), marketContext } };
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
          totalBalance: parsed.totalBalance || 0,
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
