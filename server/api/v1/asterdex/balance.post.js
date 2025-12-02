import crypto from 'crypto';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { apiKey, secret } = body;

    console.log('💰 [ASTERDEX] Fetching balance...');

    if (!apiKey || !secret) {
      return {
        success: false,
        message: 'Missing API key or secret'
      };
    }

    // Base URL for Asterdex API
    const baseUrl = 'https://sapi.asterdex.com';

    // Generate timestamp
    const timestamp = Date.now();

    // Create query string
    const queryString = `timestamp=${timestamp}`;

    // Generate signature using HMAC SHA256
    const signature = crypto
      .createHmac('sha256', secret)
      .update(queryString)
      .digest('hex');

    // Make request to Asterdex API
    const url = `${baseUrl}/api/v1/account?${queryString}&signature=${signature}`;

    const response = await $fetch(url, {
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': apiKey,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ [ASTERDEX] Balance fetched successfully');

    // Transform response to match our format
    const balances = response.balances || [];
    const formattedBalances = balances
      .filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
      .map(b => ({
        asset: b.asset,
        free: parseFloat(b.free).toFixed(8),
        locked: parseFloat(b.locked).toFixed(8),
        total: (parseFloat(b.free) + parseFloat(b.locked)).toFixed(8)
      }));

    return {
      success: true,
      data: formattedBalances
    };
  } catch (error) {
    console.error('❌ [ASTERDEX] Error fetching balance:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch balance',
      error: error.data || error.message
    };
  }
});
