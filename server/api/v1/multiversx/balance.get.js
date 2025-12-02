/**
 * MultiversX Balance Checker
 * Fetches EGLD balance for a given address using MultiversX API
 */

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { address } = query;

    if (!address) {
      return {
        success: false,
        message: 'Address is required'
      };
    }

    // Validate MultiversX address format (erd1...)
    if (!address.startsWith('erd1')) {
      return {
        success: false,
        message: 'Invalid MultiversX address format. Must start with "erd1"'
      };
    }

    console.log(`[MultiversX Balance] Checking balance for: ${address}`);

    // MultiversX API endpoint
    const apiUrl = `https://api.multiversx.com/accounts/${address}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`MultiversX API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // EGLD has 18 decimals
    const balanceEGLD = parseFloat(data.balance || 0) / 1e18;

    // Get current EGLD price (placeholder - you can integrate with price API)
    const egldPriceUSD = await getEGLDPrice();

    const balanceUSD = balanceEGLD * egldPriceUSD;

    return {
      success: true,
      data: {
        address: address,
        balance: balanceEGLD.toFixed(4),
        balanceRaw: data.balance || '0',
        balanceUSD: balanceUSD.toFixed(2),
        egldPrice: egldPriceUSD,
        nonce: data.nonce || 0,
        shard: data.shard || 0,
        // Additional account info
        username: data.username || null,
        code: data.code || null,
        codeHash: data.codeHash || null,
        developerReward: data.developerReward || '0'
      }
    };

  } catch (error) {
    console.error('[MultiversX Balance] Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch MultiversX balance',
      data: {
        balance: '0',
        balanceUSD: '0'
      }
    };
  }
});

// Helper function to get EGLD price
async function getEGLDPrice() {
  try {
    // Try to get price from CoinGecko
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=elrond-erd-2&vs_currencies=usd', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data['elrond-erd-2']?.usd || 0;
    }

    // Fallback: try MultiversX API economics endpoint
    const economicsResponse = await fetch('https://api.multiversx.com/economics', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (economicsResponse.ok) {
      const economicsData = await economicsResponse.json();
      return parseFloat(economicsData.price || 0);
    }

    return 0;

  } catch (error) {
    console.error('[MultiversX] Error fetching EGLD price:', error);
    return 0;
  }
}
