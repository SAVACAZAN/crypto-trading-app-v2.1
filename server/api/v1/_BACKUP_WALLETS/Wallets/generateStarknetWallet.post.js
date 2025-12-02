/**
 * Starknet Wallet Generator - ZK-Rollup on Ethereum
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

    console.log(`[Generate Starknet Wallet] User: ${userID}, Account: ${accountIndex}`);
    let mnemonic = useCustomMnemonic && customMnemonic ? customMnemonic : bip39.generateMnemonic(256);
    if (!bip39.validateMnemonic(mnemonic)) return { success: false, message: 'Invalid mnemonic' };

    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc);
    const child = bip32.fromSeed(seed).derivePath(`m/44'/9004'/${accountIndex}'/0/0`);
    const hash = crypto.createHash('sha256').update(child.publicKey).digest();
    const address = `0x${hash.toString('hex').slice(0, 63)}`;

    if (saveToDatabase) {
      const savedWallet = await userWalletsSchema.create({
        userID, walletName: walletName || `Starknet Wallet ${Date.now()}`, network: 'Starknet', networkSymbol: 'ETH', chainId: 0, walletType: 'Non-EVM',
        address, publicKey: child.publicKey.toString('hex'), privateKey: child.privateKey.toString('hex'), mnemonic, balance: '0', balanceUSD: '0',
        note: 'Starknet - ZK-Rollup Layer 2', tags: ['Starknet', 'L2', 'ZK'], createdAt: new Date(), isActive: true
      });
      return { success: true, walletId: savedWallet._id.toString(), message: 'Starknet wallet generated!' };
    }
    return { success: true, message: 'Starknet wallet generated' };
  } catch (error) {
    console.error('[Generate Starknet Wallet] Error:', error);
    return { success: false, message: error.message };
  }
});
