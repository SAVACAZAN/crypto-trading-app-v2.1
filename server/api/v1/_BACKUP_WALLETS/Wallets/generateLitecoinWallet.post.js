/**
 * Litecoin (LTC) Wallet Generator
 * Uses bitcoinjs-lib with Litecoin network parameters
 * Supports P2PKH, P2WPKH (Native SegWit), and P2SH-P2WPKH (Nested SegWit)
 */

import * as bitcoin from 'bitcoinjs-lib';
import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

// Litecoin network parameters
const litecoin = {
  messagePrefix: '\x19Litecoin Signed Message:\n',
  bech32: 'ltc',
  bip32: {
    public: 0x019da462, // Ltub
    private: 0x019d9cfe, // Ltpv
  },
  pubKeyHash: 0x30, // L prefix
  scriptHash: 0x32, // M prefix (for P2SH)
  wif: 0xb0,
};

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      userID,
      walletName,
      saveToDatabase = true,
      useCustomMnemonic = false,
      customMnemonic = null,
      accountIndex = 0,
      addressType = 'p2wpkh' // 'p2pkh', 'p2wpkh', 'p2sh-p2wpkh'
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    console.log(`[Generate Litecoin Wallet] User: ${userID}, Type: ${addressType}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Litecoin'
        };
      }
      mnemonic = customMnemonic;
    } else {
      mnemonic = bip39.generateMnemonic(256); // 24 words
    }

    // Derive Litecoin keys using BIP44/49/84
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc);
    const root = bip32.fromSeed(seed, litecoin);

    let derivationPath;
    let address;
    let addressFormat;

    // BIP44 (P2PKH): m/44'/2'/{account}'/0/0
    // BIP49 (P2SH-P2WPKH): m/49'/2'/{account}'/0/0
    // BIP84 (P2WPKH): m/84'/2'/{account}'/0/0

    if (addressType === 'p2pkh') {
      // Legacy address (L...)
      derivationPath = `m/44'/2'/${accountIndex}'/0/0`;
      const child = root.derivePath(derivationPath);
      const { address: addr } = bitcoin.payments.p2pkh({
        pubkey: child.publicKey,
        network: litecoin
      });
      address = addr;
      addressFormat = 'P2PKH (Legacy - L...)';
    } else if (addressType === 'p2sh-p2wpkh') {
      // Nested SegWit (M...)
      derivationPath = `m/49'/2'/${accountIndex}'/0/0`;
      const child = root.derivePath(derivationPath);
      const { address: addr } = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2wpkh({
          pubkey: child.publicKey,
          network: litecoin
        }),
        network: litecoin
      });
      address = addr;
      addressFormat = 'P2SH-P2WPKH (Nested SegWit - M...)';
    } else {
      // Native SegWit (ltc1...)
      derivationPath = `m/84'/2'/${accountIndex}'/0/0`;
      const child = root.derivePath(derivationPath);
      const { address: addr } = bitcoin.payments.p2wpkh({
        pubkey: child.publicKey,
        network: litecoin
      });
      address = addr;
      addressFormat = 'P2WPKH (Native SegWit - ltc1...)';
    }

    const child = root.derivePath(derivationPath);
    const privateKeyWIF = child.toWIF();
    const publicKeyHex = child.publicKey.toString('hex');

    const walletData = {
      success: true,
      network: 'Litecoin',
      type: 'Litecoin',
      symbol: 'LTC',

      address: address,
      privateKey: privateKeyWIF,
      publicKey: publicKeyHex,
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,
      addressType: addressType,
      addressFormat: addressFormat,

      warning: '⚠️ NEVER share your private key or mnemonic! Litecoin uses Bitcoin-based addresses.',

      chainInfo: {
        network: 'mainnet',
        blockTime: '2.5 minutes',
        explorerUrl: `https://blockchair.com/litecoin/address/${address}`,
        litescanUrl: `https://litescan.io/address/${address}`,
        minFee: '~0.001 LTC'
      },

      notes: [
        '📌 Litecoin is faster than Bitcoin (2.5 min blocks vs 10 min)',
        '📌 Uses Scrypt algorithm instead of SHA-256',
        '📌 Maximum supply: 84 million LTC',
        '📌 Transaction fees are very low',
        '📌 Supports SegWit and Lightning Network',
        `📌 Address type: ${addressFormat}`
      ]
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Litecoin Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Litecoin',
        networkSymbol: 'LTC',
        chainId: 0,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKeyHex,
        privateKey: privateKeyWIF,
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\n\nType: ${addressFormat}\nPath: ${derivationPath}\n\n${walletData.notes.join('\n')}`,
        tags: ['Litecoin', 'LTC', 'UTXO', addressType.toUpperCase()],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Litecoin Wallet] ✅ Saved: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: 'Litecoin wallet generated successfully!'
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: 'Litecoin wallet generated (not saved to database)'
    };

  } catch (error) {
    console.error('[Generate Litecoin Wallet] Error:', error);
    return {
      success: false,
      message: `Litecoin wallet generation failed: ${error.message}`
    };
  }
});
