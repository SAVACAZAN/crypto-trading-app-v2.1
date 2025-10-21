import { userSchema as User } from '~/server/models/user.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { balance, orderbook, priceHistory, symbol, exchange, currentPrice, timeframe = '30d', userID, customPrompt } = body;

    if (!userID) return { success: false, error: 'Missing required field: userID' };
    if (!symbol && !customPrompt) return { success: false, error: 'Missing required field: symbol or customPrompt' };

    const user = await User.findById(userID);
    if (!user) return { success: false, error: 'User not found' };

    const anthropicApiKey = user.aiApiKeys?.anthropic;
    if (!anthropicApiKey) return { success: false, error: 'Anthropic API key not configured. Please add your API key in the Profile page.' };

    const balanceToUse = balance || { base: 0, quote: 0, baseUSD: 0, quoteUSD: 0 };
    const orderbookToUse = orderbook || { bids: [], asks: [] };

    const marketContext = {
      symbol, exchange, currentPrice, timeframe,
      balance: { base: balanceToUse.base || 0, quote: balanceToUse.quote || 0, baseUSD: balanceToUse.baseUSD || 0, quoteUSD: balanceToUse.quoteUSD || 0 },
      orderbook: { bestBid: orderbookToUse.bids?.[0]?.[0] || 0, bestAsk: orderbookToUse.asks?.[0]?.[0] || 0 },
    };

    const prompt = customPrompt || `Analyze ${symbol} on ${exchange} at $${currentPrice}. Provide grid bot config: lowerPrice, upperPrice, numberOfGrids (10-50), riskLevel, reasoning as JSON.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);

    const data = await response.json();
    const text = data.content[0].text;

    return { success: true, data: { analysis: text, suggestions: parseResponse(text), marketContext } };
  } catch (error) {
    console.error('❌ Anthropic Error:', error);
    return { success: false, error: error.message || 'Failed to get AI analysis' };
  }
});

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
    return { parsed: false, reasoning: response };
  }
}
