import { userSchema as User } from '~/server/models/user.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      balance,
      orderbook,
      priceHistory,
      symbol,
      exchange,
      currentPrice,
      timeframe = '30d',
      userID
    } = body;

    if (!userID) {
      return { success: false, error: 'Missing required field: userID' };
    }

    if (!symbol) {
      return { success: false, error: 'Missing required field: symbol' };
    }

    const balanceToUse = balance || { base: 0, quote: 0, baseUSD: 0, quoteUSD: 0 };
    const orderbookToUse = orderbook || { bids: [], asks: [] };

    const user = await User.findById(userID);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const geminiApiKey = user.aiApiKeys?.gemini;

    console.log('🔑 Google Gemini Request Debug:');
    console.log('   UserID:', userID);
    console.log('   Has API Key:', !!geminiApiKey);
    console.log('   API Key Preview:', geminiApiKey ? `${geminiApiKey.substring(0, 12)}...${geminiApiKey.substring(geminiApiKey.length - 4)}` : 'none');

    if (!geminiApiKey) {
      return { success: false, error: 'Google Gemini API key not configured. Please add your API key in the Profile page.' };
    }

    const marketContext = {
      symbol, exchange, currentPrice, timeframe,
      balance: { base: balanceToUse.base || 0, quote: balanceToUse.quote || 0, baseUSD: balanceToUse.baseUSD || 0, quoteUSD: balanceToUse.quoteUSD || 0 },
      orderbook: { bestBid: orderbookToUse.bids?.[0]?.[0] || 0, bestAsk: orderbookToUse.asks?.[0]?.[0] || 0, bidDepth: orderbookToUse.bids?.slice(0, 10) || [], askDepth: orderbookToUse.asks?.slice(0, 10) || [] },
      priceStats: priceHistory ? {
        high: Math.max(...priceHistory.map(p => p.high || p.price)),
        low: Math.min(...priceHistory.map(p => p.low || p.price)),
        average: priceHistory.reduce((sum, p) => sum + (p.close || p.price), 0) / priceHistory.length,
        volatility: calculateVolatility(priceHistory)
      } : null
    };

    const prompt = buildPrompt(marketContext);
    const geminiResponse = await callGeminiAPI(prompt, geminiApiKey);
    const suggestions = parseResponse(geminiResponse);

    return {
      success: true,
      data: { analysis: geminiResponse, suggestions, marketContext }
    };

  } catch (error) {
    console.error('❌ Gemini AI Error:', error);
    return { success: false, error: error.message || 'Failed to get AI analysis' };
  }
});

function calculateVolatility(priceHistory) {
  if (!priceHistory || priceHistory.length < 2) return 0;
  const prices = priceHistory.map(p => p.close || p.price);
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
  return Math.sqrt(variance) * 100;
}

function buildPrompt(context) {
  return `You are an expert cryptocurrency trading advisor. Analyze this market data and provide grid bot recommendations in JSON format.

Market: ${context.symbol} on ${context.exchange}
Current Price: $${context.currentPrice}
Balance: $${(context.balance.baseUSD + context.balance.quoteUSD).toFixed(2)}
Spread: ${((context.orderbook.bestAsk - context.orderbook.bestBid) / context.orderbook.bestBid * 100).toFixed(3)}%
${context.priceStats ? `Volatility: ${context.priceStats.volatility.toFixed(2)}%` : ''}

Provide grid bot configuration with:
- lowerPrice: lower bound for grid
- upperPrice: upper bound for grid
- numberOfGrids: between 10-50
- riskLevel: Low/Medium/High
- reasoning: brief explanation

Return ONLY valid JSON format.`;
}

async function callGeminiAPI(prompt, apiKey) {
  console.log('🤖 Calling Google Gemini API (FREE!)...');
  console.log('   Model: gemini-1.5-flash-latest');

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      })
    });

    console.log('📡 Gemini API Response Status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Gemini API Error Response:', error);
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    console.log('✅ Gemini API Success! Response length:', text.length);
    return text;

  } catch (error) {
    console.error('❌ Gemini API call failed:', error);
    throw error;
  }
}

function parseResponse(response) {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
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
    console.error('Failed to parse Gemini response:', error);
    return { parsed: false, reasoning: response };
  }
}
