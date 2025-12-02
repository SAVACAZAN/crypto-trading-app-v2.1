/**
 * Ethereum Wallet Generator - SIMPLE VERSION
 * Uses ethers.js for wallet generation
 */

import { ethers } from 'ethers';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      userID,
      walletName
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    console.log(`[Generate Ethereum Wallet] User: ${userID}`);

    // Generate new wallet using ethers.js
    const wallet = ethers.Wallet.createRandom();

    // Get wallet details
    const address = wallet.address;
    const privateKey = wallet.privateKey;
    const mnemonic = wallet.mnemonic.phrase;

    // Save to database
    const defaultWalletName = walletName || `Ethereum Wallet ${Date.now()}`;

    const savedWallet = await userWalletsSchema.create({
      userID,
      walletName: defaultWalletName,
      network: 'Ethereum',
      networkSymbol: 'ETH',
      chainId: 1, // Ethereum Mainnet
      walletType: 'EVM',
      address: address,
      publicKey: wallet.publicKey,
      privateKey: privateKey,
      mnemonic: mnemonic,
      isDefault: false,
      balance: '0',
      balanceUSD: '0',
      note: '⚠️ NEVER share your mnemonic or private key!',
      tags: ['Ethereum', 'ETH', 'EVM'],
      createdAt: new Date(),
      lastUsed: new Date(),
      isActive: true
    });

    console.log(`[Generate Ethereum Wallet] ✅ Created: ${address}`);

    return {
      success: true,
      walletId: savedWallet._id.toString(),
      address: address,
      message: 'Ethereum wallet generated successfully!'
    };

  } catch (error) {
    console.error('[Generate Ethereum Wallet] Error:', error);
    return {
      success: false,
      message: `Failed: ${error.message}`
    };
  }
});
