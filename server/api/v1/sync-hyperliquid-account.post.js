import mongoose from 'mongoose';
import hyperliquidUserAccountSchema from '../../models/hyperliquidUserAccount.schema.js';

const HyperliquidUserAccount = mongoose.models.HyperliquidUserAccount || mongoose.model('HyperliquidUserAccount', hyperliquidUserAccountSchema);

/**
 * POST /api/v1/sync-hyperliquid-account
 *
 * Sync user's Hyperliquid account data (balance, deposits, withdrawals, transfers)
 * Body:
 *  - userId: User ID
 *  - walletAddress: Hyperliquid wallet address
 *  - apiKeyId: API Key ID
 *  - apiKey: Hyperliquid API key
 *  - apiSecret: Hyperliquid API secret
 *  - syncTypes: Array of what to sync ['balance', 'deposits', 'withdrawals', 'transfers'] (default: all)
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userId, walletAddress, apiKeyId, apiKey, apiSecret, syncTypes = ['balance', 'deposits', 'withdrawals', 'transfers'] } = body;

    if (!userId || !walletAddress) {
      return {
        success: false,
        error: 'Missing required parameters: userId and walletAddress'
      };
    }

    console.log(`[HYPERLIQUID-SYNC] Starting sync for user ${userId}, wallet ${walletAddress}`);
    console.log(`[HYPERLIQUID-SYNC] Sync types:`, syncTypes);

    const results = {
      balance: { success: false, error: null },
      deposits: { success: false, count: 0, error: null },
      withdrawals: { success: false, count: 0, error: null },
      transfers: { success: false, count: 0, error: null }
    };

    // Find or create user account document
    let account = await HyperliquidUserAccount.findOne({ userId, walletAddress });

    if (!account) {
      account = new HyperliquidUserAccount({
        userId,
        walletAddress,
        apiKeyId,
        deposits: [],
        withdrawals: [],
        transfers: [],
        balance: {
          spot: { assets: [], totalUsdValue: 0 },
          perp: { marginSummary: null, assetPositions: [] },
          totalAccountValue: 0
        }
      });
    }

    // SYNC BALANCE
    if (syncTypes.includes('balance')) {
      try {
        console.log('[HYPERLIQUID-SYNC] Fetching balance data...');

        // Fetch Spot Balance
        const spotBalanceResponse = await fetch('https://api.hyperliquid.xyz/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'spotClearinghouseState',
            user: walletAddress
          })
        });

        const spotBalanceData = await spotBalanceResponse.json();

        // Fetch Perp Balance
        const perpBalanceResponse = await fetch('https://api.hyperliquid.xyz/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'clearinghouseState',
            user: walletAddress
          })
        });

        const perpBalanceData = await perpBalanceResponse.json();

        // Process Spot Balance
        const spotAssets = spotBalanceData.balances?.map(b => ({
          coin: b.coin,
          total: parseFloat(b.total || 0),
          hold: parseFloat(b.hold || 0),
          available: parseFloat(b.total || 0) - parseFloat(b.hold || 0),
          usdValue: 0 // TODO: Calculate USD value
        })) || [];

        const spotTotalUsdValue = spotAssets.reduce((sum, a) => sum + a.usdValue, 0);

        // Process Perp Balance
        const perpMarginSummary = perpBalanceData.marginSummary || null;
        const perpAssetPositions = perpBalanceData.assetPositions || [];

        const totalAccountValue = spotTotalUsdValue + (perpMarginSummary?.accountValue || 0);

        // Update balance
        account.balance = {
          spot: {
            assets: spotAssets,
            totalUsdValue: spotTotalUsdValue,
            lastUpdated: new Date()
          },
          perp: {
            marginSummary: perpMarginSummary,
            assetPositions: perpAssetPositions,
            crossMarginSummary: perpBalanceData.crossMarginSummary || null,
            lastUpdated: new Date()
          },
          totalAccountValue,
          lastSync: new Date()
        };

        account.lastBalanceSync = new Date();
        account.syncStatus.balance = 'success';
        results.balance.success = true;

        console.log(`[HYPERLIQUID-SYNC] ✅ Balance synced: $${totalAccountValue.toFixed(2)}`);

      } catch (error) {
        console.error('[HYPERLIQUID-SYNC] ❌ Error syncing balance:', error);
        results.balance.error = error.message;
        account.syncStatus.balance = 'failed';
        account.lastError = `Balance sync failed: ${error.message}`;
      }
    }

    // SYNC DEPOSITS
    if (syncTypes.includes('deposits')) {
      try {
        console.log('[HYPERLIQUID-SYNC] Fetching deposit history...');

        const depositsResponse = await fetch('https://api.hyperliquid.xyz/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'userFunding',
            user: walletAddress
          })
        });

        const depositsData = await depositsResponse.json();

        // Filter for deposits (funding > 0)
        const deposits = (depositsData || [])
          .filter(f => parseFloat(f.delta?.funding || 0) > 0)
          .map(d => ({
            transactionHash: d.hash || d.tx || '',
            time: new Date(d.time || Date.now()),
            coin: d.coin || 'USDC',
            amount: parseFloat(d.delta?.funding || 0),
            usdValue: parseFloat(d.delta?.funding || 0), // Assuming USDC
            status: 'confirmed',
            confirmations: d.confirmations || 0,
            fromAddress: d.from || '',
            toAddress: walletAddress,
            fee: parseFloat(d.fee || 0),
            metadata: d
          }));

        account.deposits = deposits;
        account.lastDepositSync = new Date();
        account.syncStatus.deposits = 'success';
        results.deposits.success = true;
        results.deposits.count = deposits.length;

        console.log(`[HYPERLIQUID-SYNC] ✅ Deposits synced: ${deposits.length} records`);

      } catch (error) {
        console.error('[HYPERLIQUID-SYNC] ❌ Error syncing deposits:', error);
        results.deposits.error = error.message;
        account.syncStatus.deposits = 'failed';
      }
    }

    // SYNC WITHDRAWALS
    if (syncTypes.includes('withdrawals')) {
      try {
        console.log('[HYPERLIQUID-SYNC] Fetching withdrawal history...');

        const withdrawalsResponse = await fetch('https://api.hyperliquid.xyz/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'userFunding',
            user: walletAddress
          })
        });

        const withdrawalsData = await withdrawalsResponse.json();

        // Filter for withdrawals (funding < 0)
        const withdrawals = (withdrawalsData || [])
          .filter(f => parseFloat(f.delta?.funding || 0) < 0)
          .map(w => ({
            transactionHash: w.hash || w.tx || '',
            time: new Date(w.time || Date.now()),
            coin: w.coin || 'USDC',
            amount: Math.abs(parseFloat(w.delta?.funding || 0)),
            usdValue: Math.abs(parseFloat(w.delta?.funding || 0)),
            status: w.status || 'completed',
            fromAddress: walletAddress,
            toAddress: w.to || '',
            fee: parseFloat(w.fee || 0),
            nonce: w.nonce || 0,
            metadata: w
          }));

        account.withdrawals = withdrawals;
        account.lastWithdrawalSync = new Date();
        account.syncStatus.withdrawals = 'success';
        results.withdrawals.success = true;
        results.withdrawals.count = withdrawals.length;

        console.log(`[HYPERLIQUID-SYNC] ✅ Withdrawals synced: ${withdrawals.length} records`);

      } catch (error) {
        console.error('[HYPERLIQUID-SYNC] ❌ Error syncing withdrawals:', error);
        results.withdrawals.error = error.message;
        account.syncStatus.withdrawals = 'failed';
      }
    }

    // SYNC TRANSFERS (Spot ↔ Perp)
    if (syncTypes.includes('transfers')) {
      try {
        console.log('[HYPERLIQUID-SYNC] Fetching transfer history...');

        const transfersResponse = await fetch('https://api.hyperliquid.xyz/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'userNonFundingLedgerUpdates',
            user: walletAddress
          })
        });

        const transfersData = await transfersResponse.json();

        // Filter for internal transfers
        const transfers = (transfersData || [])
          .filter(t => t.delta?.type === 'internalTransfer' || t.type === 'internalTransfer')
          .map(t => ({
            time: new Date(t.time || Date.now()),
            coin: t.coin || 'USDC',
            amount: Math.abs(parseFloat(t.delta?.amount || t.amount || 0)),
            usdValue: Math.abs(parseFloat(t.delta?.amount || t.amount || 0)),
            fromAccount: t.delta?.from || t.from || 'spot',
            toAccount: t.delta?.to || t.to || 'perp',
            transactionHash: t.hash || t.tx || '',
            status: 'completed',
            metadata: t
          }));

        account.transfers = transfers;
        account.lastTransferSync = new Date();
        account.syncStatus.transfers = 'success';
        results.transfers.success = true;
        results.transfers.count = transfers.length;

        console.log(`[HYPERLIQUID-SYNC] ✅ Transfers synced: ${transfers.length} records`);

      } catch (error) {
        console.error('[HYPERLIQUID-SYNC] ❌ Error syncing transfers:', error);
        results.transfers.error = error.message;
        account.syncStatus.transfers = 'failed';
      }
    }

    // Save account
    await account.save();

    const overallSuccess = Object.values(results).every(r => r.success);

    return {
      success: overallSuccess,
      message: overallSuccess ? 'Account data synced successfully' : 'Partial sync completed with errors',
      data: {
        balance: results.balance,
        deposits: results.deposits,
        withdrawals: results.withdrawals,
        transfers: results.transfers,
        syncTime: new Date()
      }
    };

  } catch (error) {
    console.error('[HYPERLIQUID-SYNC] Fatal error:', error);

    return {
      success: false,
      error: error.message || 'Failed to sync account data',
      data: null
    };
  }
});
