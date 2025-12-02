import ccxt from 'ccxt';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { walletAddress, privateKey } = body;

    if (!walletAddress || !privateKey) {
      return {
        success: false,
        message: "Wallet address and private key are required"
      };
    }

    // Initialize Hyperliquid exchange with credentials
    const exchange = new ccxt.hyperliquid({
      'enableRateLimit': true,
      'walletAddress': walletAddress,
      'privateKey': privateKey
    });

    // Fetch balance
    const balance = await exchange.fetchBalance();

    console.log(`💰 Fetched balance for ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`);

    return {
      success: true,
      data: balance
    };

  } catch (error) {
    console.error('❌ Error fetching Hyperliquid balance:', error);
    return {
      success: false,
      message: error.message || "Failed to fetch balance",
      data: null
    };
  }
});
