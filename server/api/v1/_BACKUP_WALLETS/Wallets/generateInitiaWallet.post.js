/**
 * Initia Wallet Generator - SIMPLE VERSION
 * Uses @cosmjs for Cosmos-SDK based chain
 * Initia address prefix: init
 */

import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
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

    console.log(`[Generate Initia Wallet] User: ${userID}`);

    // Generate wallet with Initia prefix (init)
    // Cosmos SDK standard derivation path: m/44'/118'/0'/0/0
    const wallet = await DirectSecp256k1HdWallet.generate(24, {
      prefix: 'init'
    });

    // Get wallet details
    const accounts = await wallet.getAccounts();
    const address = accounts[0].address;
    const mnemonic = wallet.mnemonic;

    // Get private key from wallet
    const accountsWithPrivkeys = await wallet.getAccountsWithPrivkeys();
    const privateKeyBytes = accountsWithPrivkeys[0].privkey;
    const privateKeyHex = Buffer.from(privateKeyBytes).toString('hex');

    // Save to database
    const defaultWalletName = walletName || `Initia Wallet ${Date.now()}`;

    const savedWallet = await userWalletsSchema.create({
      userID,
      walletName: defaultWalletName,
      network: 'Initia',
      networkSymbol: 'INIT',
      chainId: 0,
      walletType: 'Non-EVM',
      address: address,
      publicKey: Buffer.from(accounts[0].pubkey).toString('hex'),
      privateKey: privateKeyHex,
      mnemonic: mnemonic,
      isDefault: false,
      balance: '0',
      balanceUSD: '0',
      note: '⚠️ NEVER share your mnemonic! Initia uses Cosmos SDK.',
      tags: ['Initia', 'INIT', 'Cosmos'],
      createdAt: new Date(),
      lastUsed: new Date(),
      isActive: true
    });

    console.log(`[Generate Initia Wallet] ✅ Created: ${address}`);

    return {
      success: true,
      walletId: savedWallet._id.toString(),
      address: address,
      message: 'Initia wallet generated successfully!'
    };

  } catch (error) {
    console.error('[Generate Initia Wallet] Error:', error);
    return {
      success: false,
      message: `Failed: ${error.message}`
    };
  }
});
