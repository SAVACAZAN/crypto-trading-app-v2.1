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

    console.log(`💸 Fetching withdrawals for ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`);

    // Call Hyperliquid API for userNonFundingLedgerUpdates
    console.log('🔍 Calling userNonFundingLedgerUpdates for withdrawals...');
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

    // Filter and format only withdrawals
    const withdrawals = response
      .filter(tx => {
        const delta = tx.delta;
        const txType = delta.type;

        // spotTransfer where we are sending
        if (txType === 'spotTransfer') {
          const userAddress = delta.user?.toLowerCase();
          const myAddress = walletAddress.toLowerCase();
          return userAddress === myAddress;
        }

        // spotToEvmTransfer is also a withdrawal
        if (txType === 'spotToEvmTransfer' || txType === 'withdraw') {
          return true;
        }

        return false;
      })
      .map(tx => {
        const delta = tx.delta;
        const txType = delta.type;

        let transactionType = 'Send Spot';
        let amount = delta.amount;
        let currency = delta.token || 'USDC';

        if (txType === 'spotToEvmTransfer' || txType === 'withdraw') {
          transactionType = 'Spot to EVM Transfer';
          amount = delta.amount || delta.usdc;
        }

        return {
          id: tx.hash,
          timestamp: tx.time,
          txid: tx.hash,
          amount: parseFloat(amount),
          currency: currency,
          status: 'ok',
          type: transactionType,
          direction: 'withdrawal',
          usdcValue: delta.usdcValue || delta.usdc || '0',
          fee: delta.fee || '0',
          raw: delta
        };
      });

    console.log(`✅ Found ${withdrawals.length} withdrawals`);

    return {
      success: true,
      data: withdrawals,
      count: withdrawals.length
    };

  } catch (error) {
    console.error('❌ Error fetching Hyperliquid withdrawals:', error);
    return {
      success: false,
      message: error.message || "Failed to fetch withdrawals",
      data: []
    };
  }
});
