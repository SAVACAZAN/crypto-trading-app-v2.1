import { userSchema } from '~/server/models/user.schema.js';
import { randomUUID } from 'crypto';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID, walletData } = body;

    if (!userID || !walletData) {
      return {
        success: false,
        message: 'Missing required parameters: userID and walletData',
      };
    }

    console.log(`[Save Wallet] User: ${userID}, Network: ${walletData.network}`);

    // Find user
    const user = await userSchema.findById(userID);

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    // Create wallet name if not provided
    const walletName = walletData.walletName || `${walletData.network} Wallet ${Date.now()}`;

    // Create wallet object
    const newWallet = {
      walletId: randomUUID(),
      walletName,
      network: walletData.network,
      networkSymbol: walletData.networkSymbol,
      chainId: walletData.chainId,
      walletType: walletData.type,
      address: walletData.address,
      publicKey: walletData.publicKey,
      privateKey: walletData.privateKey, // TODO: Encrypt in production!
      mnemonic: walletData.mnemonic,
      note: walletData.note,
      isDefault: false,
      balance: '0',
      balanceUSD: '0',
      tags: [],
      createdAt: new Date(),
      lastUsed: new Date(),
      isActive: true
    };

    // Initialize wallets array if it doesn't exist
    if (!user.wallets) {
      user.wallets = [];
    }

    // Add wallet to user's wallets array
    user.wallets.push(newWallet);

    // Save user
    await user.save();

    return {
      success: true,
      message: 'Wallet saved successfully to user account',
      data: {
        walletId: newWallet.walletId,
        walletName: newWallet.walletName,
        network: newWallet.network,
        address: newWallet.address || newWallet.publicKey,
        totalWallets: user.wallets.length
      },
    };

  } catch (error) {
    console.error('[Save Wallet] Error:', error);
    return {
      success: false,
      message: 'Failed to save wallet',
      error: error.message,
    };
  }
});
