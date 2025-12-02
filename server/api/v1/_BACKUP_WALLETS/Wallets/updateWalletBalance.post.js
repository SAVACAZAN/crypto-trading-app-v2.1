import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { walletId, balance, balanceUSD } = body;

    if (!walletId) {
      return { success: false, message: 'Missing walletId parameter' };
    }

    console.log(`[Update Wallet Balance] Wallet: ${walletId}, Balance: ${balance}`);

    const updateData = {
      balance: balance ? balance.toString() : '0',
      lastActivity: new Date(),
    };

    // Only update balanceUSD if provided
    if (balanceUSD !== undefined) {
      updateData.balanceUSD = balanceUSD.toString();
    }

    const updatedWallet = await userWalletsSchema.findByIdAndUpdate(
      walletId,
      updateData,
      { new: true }
    );

    if (!updatedWallet) {
      return { success: false, message: 'Wallet not found' };
    }

    return {
      success: true,
      message: 'Wallet balance updated successfully',
      data: {
        _id: updatedWallet._id,
        balance: updatedWallet.balance,
        balanceUSD: updatedWallet.balanceUSD,
        lastActivity: updatedWallet.lastActivity,
      },
    };
  } catch (error) {
    console.error('[Update Wallet Balance] Error:', error);
    return {
      success: false,
      message: 'Failed to update wallet balance',
      error: error.message,
    };
  }
});
