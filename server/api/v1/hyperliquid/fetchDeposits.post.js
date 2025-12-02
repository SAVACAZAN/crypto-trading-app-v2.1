export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { walletAddress } = body;

    if (!walletAddress) {
      return {
        success: false,
        message: "Wallet address is required"
      };
    }

    console.log(`💰 Fetching deposits for ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`);

    // Call Hyperliquid API for userNonFundingLedgerUpdates
    console.log('🔍 Calling userNonFundingLedgerUpdates for deposits...');
    const response = await $fetch('https://api.hyperliquid.xyz/info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        type: 'userNonFundingLedgerUpdates',
        user: walletAddress
      }
    });

    console.log('📊 Transaction history response count:', response?.length || 0);

    if (!response || response.length === 0) {
      console.log('ℹ️ No transactions found');
      return {
        success: true,
        data: [],
        count: 0
      };
    }

    // Filter and format only deposits
    const deposits = response
      .filter(tx => {
        const delta = tx.delta;
        const txType = delta.type;

        if (txType === 'spotTransfer') {
          const destinationAddress = delta.destination?.toLowerCase();
          const myAddress = walletAddress.toLowerCase();
          // Only deposits (we are receiving)
          return destinationAddress === myAddress;
        }
        return false;
      })
      .map(tx => {
        const delta = tx.delta;
        return {
          id: tx.hash,
          timestamp: tx.time,
          txid: tx.hash,
          amount: parseFloat(delta.amount),
          currency: delta.token,
          status: 'ok',
          type: 'Receive Spot',
          direction: 'deposit',
          usdcValue: delta.usdcValue || '0',
          fee: delta.fee || '0',
          raw: delta
        };
      });

    console.log(`✅ Found ${deposits.length} deposits`);

    return {
      success: true,
      data: deposits,
      count: deposits.length
    };

  } catch (error) {
    console.error('❌ Error fetching Hyperliquid deposits:', error);
    return {
      success: false,
      message: error.message || "Failed to fetch deposits",
      data: []
    };
  }
});
