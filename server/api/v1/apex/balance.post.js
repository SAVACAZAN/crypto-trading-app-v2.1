import crypto from 'crypto';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { apiKey, secret, passphrase } = body;

    console.log('💰 [APEX] Fetching balance...');

    if (!apiKey || !secret || !passphrase) {
      return {
        success: false,
        message: 'Missing API key, secret, or passphrase'
      };
    }

    // Base URL for Apex Exchange (Omni) API
    const baseUrl = 'https://omni.apex.exchange/api';
    const endpoint = '/v3/account-balance';

    // Generate timestamp
    const timestamp = Date.now();

    // Create signature string: timestamp + method + path + dataString
    const method = 'GET';
    const path = endpoint;
    const dataString = ''; // Empty for GET requests
    const signatureString = `${timestamp}${method}${path}${dataString}`;

    // Generate signature using HMAC SHA256
    const signature = crypto
      .createHmac('sha256', secret)
      .update(signatureString)
      .digest('hex');

    // Make request to Apex API
    const url = `${baseUrl}${endpoint}`;

    const response = await $fetch(url, {
      method: 'GET',
      headers: {
        'APEX-API-KEY': apiKey,
        'APEX-PASSPHRASE': passphrase,
        'APEX-SIGNATURE': signature,
        'APEX-TIMESTAMP': timestamp.toString(),
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ [APEX] Balance fetched successfully');

    // Transform response to match our format
    const accountData = response.data || {};
    const formattedBalances = [];

    // Apex returns total equity and available balance
    // We'll create a simplified balance structure
    if (accountData.totalEquityValue) {
      formattedBalances.push({
        asset: 'TOTAL',
        free: parseFloat(accountData.availableBalance || 0).toFixed(8),
        locked: (parseFloat(accountData.totalEquityValue || 0) - parseFloat(accountData.availableBalance || 0)).toFixed(8),
        total: parseFloat(accountData.totalEquityValue || 0).toFixed(8)
      });
    }

    return {
      success: true,
      data: formattedBalances,
      raw: accountData // Include raw data for debugging
    };
  } catch (error) {
    console.error('❌ [APEX] Error fetching balance:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch balance',
      error: error.data || error.message
    };
  }
});
