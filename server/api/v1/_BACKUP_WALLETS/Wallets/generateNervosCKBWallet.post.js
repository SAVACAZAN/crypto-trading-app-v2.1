/**
 * Nervos CKB (CKB) Wallet Generator
 * Uses BIP39/BIP32 for key derivation
 * CKB uses bech32 encoding with 'ckb' prefix
 */

import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import crypto from 'crypto';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

// Simplified bech32 encode function
function bech32Encode(hrp, data) {
  const hex = Buffer.from(data).toString('hex');
  return `${hrp}1${hex}`;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      userID,
      walletName,
      saveToDatabase = true,
      useCustomMnemonic = false,
      customMnemonic = null,
      accountIndex = 0
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    console.log(`[Generate Nervos CKB Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Nervos CKB'
        };
      }
      mnemonic = customMnemonic;
    } else {
      mnemonic = bip39.generateMnemonic(256);
    }

    // Derive keys using BIP32
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc);
    const rootKey = bip32.fromSeed(seed);

    // CKB derivation path: m/44'/309'/{account}'/0/0
    const derivationPath = `m/44'/309'/${accountIndex}'/0/0`;
    const child = rootKey.derivePath(derivationPath);

    const privateKey = child.privateKey;
    const publicKey = child.publicKey;

    // CKB address generation (short format with SECP256K1-Blake160)
    // Blake160 is Blake2b hash truncated to 160 bits (20 bytes)
    const blake2bHash = crypto.createHash('blake2b512').update(publicKey).digest();
    const blake160Hash = blake2bHash.slice(0, 20);

    // Code hash type and args for default lock script
    const addressPayload = Buffer.concat([
      Buffer.from([0x00]), // format type (short)
      Buffer.from([0x00]), // code hash index (SECP256K1_BLAKE160)
      blake160Hash
    ]);

    // Encode as bech32 with 'ckb' prefix (simplified)
    const address = bech32Encode('ckb', addressPayload);

    const walletData = {
      success: true,
      network: 'Nervos CKB',
      type: 'Nervos CKB',
      symbol: 'CKB',

      address: address,
      publicKey: publicKey.toString('hex'),
      privateKey: privateKey.toString('hex'),
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,

      addressFormat: 'bech32 (ckb1...)',

      warning: '⚠️ NEVER share your private key or mnemonic! Nervos CKB is a layered blockchain.',

      chainInfo: {
        network: 'mainnet',
        rpcUrl: 'https://mainnet.ckb.dev',
        explorerUrl: `https://explorer.nervos.org/address/${address}`,
        features: [
          '🏗️ Layered architecture (L1 + L2)',
          '🔧 Cell model (generalized UTXO)',
          '⚡ Proof of Work (NC-MAX)',
          '🌐 Universal interoperability'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Nervos CKB Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Nervos CKB',
        networkSymbol: 'CKB',
        chainId: 0,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKey.toString('hex'),
        privateKey: privateKey.toString('hex'),
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nCoin Type: 309`,
        tags: ['Nervos', 'CKB', 'Layered', 'Cell Model', 'PoW'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Nervos CKB Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Nervos CKB wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Nervos CKB wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Nervos CKB Wallet] Error:', error);
    return {
      success: false,
      message: `Nervos CKB wallet generation failed: ${error.message}`
    };
  }
});
