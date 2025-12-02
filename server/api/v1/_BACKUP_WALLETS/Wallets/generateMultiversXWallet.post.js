/**
 * MultiversX (EGLD) Wallet Generator - SIMPLE VERSION
 * Uses official @multiversx/sdk-core for wallet generation
 */

import { Mnemonic, UserSigner } from '@multiversx/sdk-core';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      userID,
      walletName,
      saveToDatabase = true
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    console.log(`[Generate MultiversX Wallet] User: ${userID}`);

    // Generate new 24-word mnemonic
    const mnemonic = Mnemonic.generate();
    const mnemonicText = mnemonic.toString();

    // Derive secret key from mnemonic (index 0)
    const secretKey = mnemonic.deriveKey(0);

    // Create signer and get address
    const signer = new UserSigner(secretKey);
    const addressObj = signer.getAddress();
    const address = addressObj.toString(); // or addressObj.bech32() depending on version

    // Get keys in hex format
    const privateKeyHex = secretKey.hex();
    const publicKeyHex = secretKey.generatePublicKey().hex();

    // Save to database
    const defaultWalletName = walletName || `MultiversX Wallet ${Date.now()}`;

    const savedWallet = await userWalletsSchema.create({
      userID,
      walletName: defaultWalletName,
      network: 'MultiversX',
      networkSymbol: 'EGLD',
      chainId: 0,
      walletType: 'Non-EVM',
      address: address,
      publicKey: publicKeyHex,
      privateKey: privateKeyHex,
      mnemonic: mnemonicText,
      isDefault: false,
      balance: '0',
      balanceUSD: '0',
      note: '⚠️ NEVER share your mnemonic or private key!',
      tags: ['MultiversX', 'EGLD'],
      createdAt: new Date(),
      lastUsed: new Date(),
      isActive: true
    });

    console.log(`[Generate MultiversX Wallet] ✅ Created: ${address}`);

    return {
      success: true,
      walletId: savedWallet._id.toString(),
      address: address,
      message: 'MultiversX wallet generated successfully!'
    };

  } catch (error) {
    console.error('[Generate MultiversX Wallet] Error:', error);
    return {
      success: false,
      message: `Failed: ${error.message}`
    };
  }
});
