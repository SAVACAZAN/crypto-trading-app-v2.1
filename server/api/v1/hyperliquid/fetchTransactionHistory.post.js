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

    console.log(`📜 Fetching transaction history for ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`);

    // Call Hyperliquid API for userNonFundingLedgerUpdates (deposits, withdrawals, transfers)
    console.log('🔍 Calling userNonFundingLedgerUpdates...');
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

    console.log('📋 First transaction sample:', JSON.stringify(response[0]));

    // Format transactions to match frontend expectations
    const formattedTransactions = response.map(tx => {
      const delta = tx.delta;
      const txType = delta.type;

      // Determine transaction type and details
      let transactionType = 'unknown';
      let amount = '0';
      let currency = 'USDC';
      let direction = 'unknown';

      if (txType === 'spotTransfer') {
        amount = delta.amount;
        currency = delta.token;

        // Check if this is a deposit or withdrawal by comparing addresses
        // destination = wallet receiving funds
        // user = wallet sending funds
        const destinationAddress = delta.destination?.toLowerCase();
        const userAddress = delta.user?.toLowerCase();
        const myAddress = walletAddress.toLowerCase();

        if (destinationAddress === myAddress) {
          // We are receiving funds - this is a DEPOSIT
          transactionType = 'Receive Spot';
          direction = 'deposit';
        } else if (userAddress === myAddress) {
          // We are sending funds - this is a WITHDRAWAL
          transactionType = 'Send Spot';
          direction = 'withdrawal';
        } else {
          // Unknown transfer (shouldn't happen)
          transactionType = 'Unknown Transfer';
          direction = 'unknown';
        }
      } else if (txType === 'accountClassTransfer') {
        transactionType = delta.toPerp ? 'Spot to Perps Transfer' : 'Perps to Spot Transfer';
        amount = delta.usdc;
        currency = 'USDC';
        direction = 'transfer';
      } else if (txType === 'spotToEvmTransfer' || txType === 'withdraw') {
        // Spot to EVM Transfer is a withdrawal to blockchain
        transactionType = 'Spot to EVM Transfer';
        amount = delta.amount || delta.usdc;
        currency = delta.token || 'USDC';
        direction = 'withdrawal';
      }

      return {
        id: tx.hash,
        timestamp: tx.time,
        txid: tx.hash,
        amount: parseFloat(amount),
        currency: currency,
        status: 'ok',
        type: transactionType,
        direction: direction,
        usdcValue: delta.usdcValue || delta.usdc || '0',
        fee: delta.fee || '0',
        raw: delta // Keep raw data for debugging
      };
    });

    console.log(`✅ Formatted ${formattedTransactions.length} transactions`);

    return {
      success: true,
      data: formattedTransactions,
      count: formattedTransactions.length
    };

  } catch (error) {
    console.error('❌ Error fetching Hyperliquid transaction history:', error);
    console.error('Error details:', error.message);
    return {
      success: false,
      message: error.message || "Failed to fetch transaction history",
      data: []
    };
  }
});
