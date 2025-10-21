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

    // Get user's OpenAI API key
    const user = await User.findById(userID);
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    const openaiApiKey = user.aiApiKeys?.chatgpt;

    // Log API key details for debugging
    console.log('🔑 OpenAI (ChatGPT) Request Debug:');
    console.log('   UserID:', userID);
    console.log('   Has API Key:', !!openaiApiKey);
    console.log('   API Key Preview:', openaiApiKey ? `${openaiApiKey.substring(0, 12)}...${openaiApiKey.substring(openaiApiKey.length - 4)}` : 'none');

    if (!openaiApiKey) {
      return {
        success: false,
        error: 'OpenAI API key not configured. Please add your API key in the Profile page.'
      };
    }

    // Prepare context for ChatGPT
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

    // Build prompt for ChatGPT
    const prompt = buildChatGPTPrompt(marketContext);

    // Call OpenAI API with user's API key
    const chatGPTResponse = await callOpenAIAPI(prompt, openaiApiKey);

    // Parse ChatGPT's response to extract grid bot suggestions
    const suggestions = parseChatGPTResponse(chatGPTResponse);

    return {
      success: true,
      data: {
        analysis: chatGPTResponse,
        suggestions,
        marketContext
      }
    };

  } catch (error) {
    console.error('❌ OpenAI Error:', error);
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
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }

  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;

  return Math.sqrt(variance) * 100; // Return as percentage
}

// Build prompt for ChatGPT
function buildChatGPTPrompt(context) {
  return `You are an expert cryptocurrency trading advisor specializing in grid bot strategies. Analyze the following market data and provide optimal grid bot configuration recommendations.

## Market Data:
- **Trading Pair**: ${context.symbol}
- **Exchange**: ${context.exchange}
- **Current Price**: $${context.currentPrice}
- **Timeframe**: ${context.timeframe}

## Account Balance:
- Base Currency: ${context.balance.base} (≈ $${context.balance.baseUSD})
- Quote Currency: ${context.balance.quote} (≈ $${context.balance.quoteUSD})
- Total Balance: $${(context.balance.baseUSD + context.balance.quoteUSD).toFixed(2)}

## Orderbook Depth:
- Best Bid: $${context.orderbook.bestBid}
- Best Ask: $${context.orderbook.bestAsk}
- Spread: ${((context.orderbook.bestAsk - context.orderbook.bestBid) / context.orderbook.bestBid * 100).toFixed(3)}%
- Top 10 Bid Levels: ${context.orderbook.bidDepth.length} levels
- Top 10 Ask Levels: ${context.orderbook.askDepth.length} levels

## Price Statistics (${context.timeframe}):
${context.priceStats ? `
- High: $${context.priceStats.high.toFixed(6)}
- Low: $${context.priceStats.low.toFixed(6)}
- Average: $${context.priceStats.average.toFixed(6)}
- Volatility: ${context.priceStats.volatility.toFixed(2)}%
- Price Range: ${((context.priceStats.high - context.priceStats.low) / context.priceStats.low * 100).toFixed(2)}%
` : 'No historical data available'}

## Your Task:
Based on this market analysis, provide:

1. **Recommended Price Range**:
   - Lower Price: Calculate based on support levels and volatility
   - Upper Price: Calculate based on resistance levels and potential upside
   - Reasoning for the range selection

2. **Grid Configuration**:
   - Recommended Number of Grids (between 10-50)
   - Expected profit per grid
   - Grid spacing strategy

3. **Risk Assessment**:
   - Risk Level: Low / Medium / High
   - Key risk factors
   - Recommended position sizing

4. **Market Conditions Analysis**:
   - Current trend (bullish/bearish/sideways)
   - Volatility assessment
   - Liquidity analysis

5. **Recommendations**:
   - Is grid bot suitable for current conditions?
   - Suggested monitoring frequency
   - Exit conditions

Please format your response as a structured JSON with clear sections for easy parsing.`;
}

// Call OpenAI API
async function callOpenAIAPI(prompt, apiKey) {
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please add your API key in the Profile page.');
  }

  console.log('🤖 Calling OpenAI API (ChatGPT)...');
  console.log('   Model: gpt-4o');
  console.log('   Max Tokens: 4096');
  console.log('   API Key (preview):', `${apiKey.substring(0, 12)}...${apiKey.substring(apiKey.length - 4)}`);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'system',
          content: 'You are an expert cryptocurrency trading advisor specializing in grid bot strategies.'
        }, {
          role: 'user',
          content: prompt
        }],
        max_tokens: 4096,
        temperature: 0.7
      })
    });

    console.log('📡 OpenAI API Response Status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ OpenAI API Error Response:', error);
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI API Success! Response length:', data.choices[0].message.content.length);
    return data.choices[0].message.content;

  } catch (error) {
    console.error('❌ OpenAI API call failed:', error);
    throw error;
  }
}

// Parse ChatGPT's response to extract structured suggestions
function parseChatGPTResponse(response) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Extract grid bot parameters
      return {
        lowerPrice: parsed.recommendedPriceRange?.lowerPrice || parsed.lowerPrice || null,
        upperPrice: parsed.recommendedPriceRange?.upperPrice || parsed.upperPrice || null,
        numberOfGrids: parsed.gridConfiguration?.numberOfGrids || parsed.numberOfGrids || null,
        riskLevel: parsed.riskAssessment?.riskLevel || parsed.riskLevel || 'Medium',
        expectedProfitPerGrid: parsed.gridConfiguration?.expectedProfitPerGrid || null,
        reasoning: parsed.reasoning || parsed.recommendations || null,
        parsed: true
      };
    }

    // If no JSON found, try to extract values from text
    const lowerPriceMatch = response.match(/lower price[:\s]+\$?([0-9.]+)/i);
    const upperPriceMatch = response.match(/upper price[:\s]+\$?([0-9.]+)/i);
    const gridsMatch = response.match(/(\d+)\s+grids?/i);
    const riskMatch = response.match(/risk level[:\s]+(low|medium|high)/i);

    return {
      lowerPrice: lowerPriceMatch ? parseFloat(lowerPriceMatch[1]) : null,
      upperPrice: upperPriceMatch ? parseFloat(upperPriceMatch[1]) : null,
      numberOfGrids: gridsMatch ? parseInt(gridsMatch[1]) : null,
      riskLevel: riskMatch ? riskMatch[1] : 'Medium',
      reasoning: response,
      parsed: false
    };

  } catch (error) {
    console.error('Failed to parse ChatGPT response:', error);
    return {
      parsed: false,
      reasoning: response
    };
  }
}
