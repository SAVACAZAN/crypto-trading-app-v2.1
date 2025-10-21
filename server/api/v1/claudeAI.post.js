import { userSchema as User } from '~/server/models/user.schema';

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

    // Validate required fields
    if (!userID) {
      return {
        success: false,
        error: 'Missing required field: userID'
      };
    }

    if (!symbol) {
      return {
        success: false,
        error: 'Missing required field: symbol'
      };
    }

    // Provide defaults for missing data
    const balanceToUse = balance || { base: 0, quote: 0, baseUSD: 0, quoteUSD: 0 };
    const orderbookToUse = orderbook || { bids: [], asks: [] };

    // Get user's Claude API key
    const user = await User.findById(userID);
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    const claudeApiKey = user.aiApiKeys?.claude;

    // Log API key details for debugging
    console.log('🔑 Claude AI Request Debug:');
    console.log('   UserID:', userID);
    console.log('   Has API Key:', !!claudeApiKey);
    console.log('   API Key Preview:', claudeApiKey ? `${claudeApiKey.substring(0, 12)}...${claudeApiKey.substring(claudeApiKey.length - 4)}` : 'none');

    if (!claudeApiKey) {
      return {
        success: false,
        error: 'Claude API key not configured. Please add your API key in the Profile page.'
      };
    }

    // Prepare context for Claude
    const marketContext = {
      symbol,
      exchange,
      currentPrice,
      timeframe,
      balance: {
        base: balanceToUse.base || 0,
        quote: balanceToUse.quote || 0,
        baseUSD: balanceToUse.baseUSD || 0,
        quoteUSD: balanceToUse.quoteUSD || 0
      },
      orderbook: {
        bestBid: orderbookToUse.bids?.[0]?.[0] || 0,
        bestAsk: orderbookToUse.asks?.[0]?.[0] || 0,
        bidDepth: orderbookToUse.bids?.slice(0, 10) || [],
        askDepth: orderbookToUse.asks?.slice(0, 10) || []
      },
      priceStats: priceHistory ? {
        high: Math.max(...priceHistory.map(p => p.high || p.price)),
        low: Math.min(...priceHistory.map(p => p.low || p.price)),
        average: priceHistory.reduce((sum, p) => sum + (p.close || p.price), 0) / priceHistory.length,
        volatility: calculateVolatility(priceHistory)
      } : null
    };

    // Build prompt for Claude
    const prompt = buildClaudePrompt(marketContext);

    // Call Claude API with user's API key
    const claudeResponse = await callClaudeAPI(prompt, claudeApiKey);

    // Parse Claude's response to extract grid bot suggestions
    const suggestions = parseClaudeResponse(claudeResponse);

    return {
      success: true,
      data: {
        analysis: claudeResponse,
        suggestions,
        marketContext
      }
    };

  } catch (error) {
    console.error('❌ Claude AI Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get AI analysis'
    };
  }
});

// Helper function to calculate volatility
function calculateVolatility(priceHistory) {
  if (!priceHistory || priceHistory.length < 2) return 0;

  const prices = priceHistory.map(p => p.close || p.price);
  const returns = [];

  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i-1]) / prices[i-1]);
  }

  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;

  return Math.sqrt(variance) * 100; // Convert to percentage
}

// Build prompt for Claude API
function buildClaudePrompt(context) {
  return `You are an expert cryptocurrency trading bot advisor specializing in grid trading strategies.

Analyze the following market data and provide specific grid bot configuration recommendations:

**Market Information:**
- Symbol: ${context.symbol}
- Exchange: ${context.exchange}
- Current Price: $${context.currentPrice}
- Timeframe: ${context.timeframe}

**User Balance:**
- Base Currency: ${context.balance.base} (≈ $${context.balance.baseUSD.toFixed(2)})
- Quote Currency: ${context.balance.quote} (≈ $${context.balance.quoteUSD.toFixed(2)})
- Total Portfolio Value: $${(context.balance.baseUSD + context.balance.quoteUSD).toFixed(2)}

**Orderbook:**
- Best Bid: $${context.orderbook.bestBid}
- Best Ask: $${context.orderbook.bestAsk}
- Spread: ${((context.orderbook.bestAsk - context.orderbook.bestBid) / context.orderbook.bestBid * 100).toFixed(3)}%

${context.priceStats ? `**Price Statistics (${context.timeframe}):**
- High: $${context.priceStats.high.toFixed(6)}
- Low: $${context.priceStats.low.toFixed(6)}
- Average: $${context.priceStats.average.toFixed(6)}
- Volatility: ${context.priceStats.volatility.toFixed(2)}%` : ''}

**Task:**
Based on this data, provide a comprehensive grid bot configuration recommendation including:

1. **Recommended Price Range:**
   - Lower Price Bound (support level)
   - Upper Price Bound (resistance level)
   - Reasoning for these levels

2. **Grid Configuration:**
   - Number of Grids (optimal quantity)
   - Grid Spacing Strategy
   - Expected profit per grid

3. **Risk Assessment:**
   - Risk Level (Low/Medium/High)
   - Potential scenarios (bullish/bearish/sideways)
   - Stop-loss recommendations

4. **Capital Allocation:**
   - Recommended investment amount
   - Buy/Sell balance suggestion
   - Reserve funds recommendation

5. **Market Conditions Analysis:**
   - Current trend assessment
   - Volatility analysis
   - Liquidity evaluation

Please format your response as a structured JSON with clear sections for easy parsing.`;
}

// Call Claude API
async function callClaudeAPI(prompt, apiKey) {
  if (!apiKey) {
    throw new Error('Claude API key not configured. Please add your API key in the Profile page.');
  }

  console.log('🤖 Calling Claude API...');
  console.log('   Model: claude-3-5-sonnet-20241022');
  console.log('   Max Tokens: 4096');
  console.log('   API Key (preview):', `${apiKey.substring(0, 12)}...${apiKey.substring(apiKey.length - 4)}`);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    console.log('📡 Claude API Response Status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Claude API Error Response:', error);
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log('✅ Claude API Success! Response length:', data.content[0].text.length);
    return data.content[0].text;

  } catch (error) {
    console.error('❌ Claude API call failed:', error);
    throw error;
  }
}

// Parse Claude's response to extract structured suggestions
function parseClaudeResponse(response) {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // If no JSON found, create structured response from text
    return {
      rawResponse: response,
      parsed: false,
      message: 'Could not parse structured data from AI response'
    };
  } catch (error) {
    console.error('❌ Failed to parse Claude response:', error);
    return {
      rawResponse: response,
      parsed: false,
      error: error.message
    };
  }
}
