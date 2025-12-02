/**
 * VeChain (VET) Wallet Generator - EVM-compatible but different
 */

import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';
import crypto from 'crypto';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID, walletName, saveToDatabase = true, useCustomMnemonic = false, customMnemonic = null, accountIndex = 0 } = body;
    if (!userID) return { success: false, message: 'userID is required' };

    console.log(`[Generate VeChain Wallet] User: ${userID}, Account: ${accountIndex}`);
    let mnemonic = useCustomMnemonic && customMnemonic ? customMnemonic : bip39.generateMnemonic(256);
    if (!bip39.validateMnemonic(mnemonic)) return { success: false, message: 'Invalid mnemonic' };

    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc);
    const child = bip32.fromSeed(seed).derivePath(`m/44'/818'/${accountIndex}'/0/0`);

    // VeChain uses Ethereum-style addresses (0x...)
    const publicKeyHash = crypto.createHash('sha256').update(child.publicKey).digest();
    const address = `0x${publicKeyHash.slice(0, 20).toString('hex')}`;

    if (saveToDatabase) {
      const savedWallet = await userWalletsSchema.create({
        userID, walletName: walletName || `VeChain Wallet ${Date.now()}`, network: 'VeChain', networkSymbol: 'VET', chainId: 0, walletType: 'Non-EVM',
        address, publicKey: child.publicKey.toString('hex'), privateKey: child.privateKey.toString('hex'), mnemonic, balance: '0', balanceUSD: '0',
        note: 'VeChain - Enterprise blockchain', tags: ['VeChain', 'VET', 'VTHO'], createdAt: new Date(), isActive: true
      });
      return { success: true, walletId: savedWallet._id.toString(), message: 'VeChain wallet generated!' };
    }
    return { success: true, message: 'VeChain wallet generated' };
  } catch (error) {
    console.error('[Generate VeChain Wallet] Error:', error);
    return { success: false, message: error.message };
  }
});
