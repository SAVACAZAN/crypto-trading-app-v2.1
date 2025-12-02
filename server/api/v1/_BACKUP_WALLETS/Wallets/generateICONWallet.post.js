/**
 * ICON (ICX) Wallet Generator
 * Uses BIP39/BIP32 for key derivation
 * ICON uses specific address format with 'hx' prefix
 */

import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import crypto from 'crypto';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

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

    console.log(`[Generate ICON Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for ICON'
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

    // ICON derivation path: m/44'/4801368'/{account}'/0/0
    const derivationPath = `m/44'/4801368'/${accountIndex}'/0/0`;
    const child = rootKey.derivePath(derivationPath);

    const privateKey = child.privateKey;
    const publicKey = child.publicKey;

    // ICON address generation
    // Remove 0x04 prefix if present (uncompressed public key)
    const pubKeyWithoutPrefix = publicKey.length === 65 ? publicKey.slice(1) : publicKey;

    // SHA3-256 hash of public key
    const sha3Hash = crypto.createHash('sha3-256').update(pubKeyWithoutPrefix).digest();

    // Take last 20 bytes and add 'hx' prefix
    const address = 'hx' + sha3Hash.slice(-20).toString('hex');

    const walletData = {
      success: true,
      network: 'ICON',
      type: 'ICON',
      symbol: 'ICX',

      address: address,
      publicKey: publicKey.toString('hex'),
      privateKey: privateKey.toString('hex'),
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,

      addressFormat: 'hx + 40 hex chars',

      warning: '⚠️ NEVER share your private key or mnemonic! ICON is South Korea\'s largest blockchain.',

      chainInfo: {
        network: 'mainnet',
        networkId: 1,
        rpcUrl: 'https://ctz.solidwallet.io/api/v3',
        explorerUrl: `https://tracker.icon.community/address/${address}`,
        features: [
          '🇰🇷 South Korean blockchain',
          '⚡ LFT2 consensus',
          '🔧 Smart contracts (Java, Python)',
          '🌐 Blockchain interoperability (BTP)'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `ICON Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'ICON',
        networkSymbol: 'ICX',
        chainId: 0,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKey.toString('hex'),
        privateKey: privateKey.toString('hex'),
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nCoin Type: 4801368`,
        tags: ['ICON', 'ICX', 'South Korea', 'Interoperability'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate ICON Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `ICON (ICX) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `ICON (ICX) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate ICON Wallet] Error:', error);
    return {
      success: false,
      message: `ICON wallet generation failed: ${error.message}`
    };
  }
});
