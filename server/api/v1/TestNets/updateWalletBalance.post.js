import { testNetworksSchema } from '~/server/models/testNetworks.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { walletId, balance } = body;

    if (!walletId) {
      return {
        success: false,
        message: 'Missing walletId parameter',
      };
    }

    if (balance === undefined || balance === null) {
      return {
        success: false,
        message: 'Missing balance parameter',
      };
    }

    console.log(`[Update Wallet Balance] Wallet: ${walletId}, Balance: ${balance}`);

    // Update wallet balance and lastActivity
    const updatedWallet = await testNetworksSchema.findByIdAndUpdate(
      walletId,
      {
        balance: balance.toString(),
        lastActivity: new Date(),
      },
      { new: true }
    );

    if (!updatedWallet) {
      return {
        success: false,
        message: 'Wallet not found',
      };
    }

    return {
      success: true,
      message: 'Wallet balance updated successfully',
      data: {
        _id: updatedWallet._id,
        balance: updatedWallet.balance,
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
