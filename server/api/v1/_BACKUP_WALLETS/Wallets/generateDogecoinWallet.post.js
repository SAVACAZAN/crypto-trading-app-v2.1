/**
 * Dogecoin (DOGE) Wallet Generator
 * Uses bitcoinjs-lib with Dogecoin network parameters
 * Supports P2PKH addresses
 */

import * as bitcoin from 'bitcoinjs-lib';
import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

// Dogecoin network parameters
const dogecoin = {
  messagePrefix: '\x19Dogecoin Signed Message:\n',
  bech32: 'doge', // Not widely used
  bip32: {
    public: 0x02facafd, // dgub
    private: 0x02fac398, // dgpv
  },
  pubKeyHash: 0x1e, // D prefix
  scriptHash: 0x16, // 9 or A prefix (for P2SH)
  wif: 0x9e,
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
      accountIndex = 0
    } = body;

    if (!userID) {
      return { success: false, message: 'userID is required' };
    }

    console.log(`[Generate Dogecoin Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Dogecoin'
        };
      }
      mnemonic = customMnemonic;
    } else {
      mnemonic = bip39.generateMnemonic(256); // 24 words
    }

    // Derive Dogecoin keys using BIP44
    // Dogecoin path: m/44'/3'/{account}'/0/0
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc);
    const root = bip32.fromSeed(seed, dogecoin);

    const derivationPath = `m/44'/3'/${accountIndex}'/0/0`;
    const child = root.derivePath(derivationPath);

    const { address } = bitcoin.payments.p2pkh({
      pubkey: child.publicKey,
      network: dogecoin
    });

    const privateKeyWIF = child.toWIF();
    const publicKeyHex = child.publicKey.toString('hex');

    const walletData = {
      success: true,
      network: 'Dogecoin',
      type: 'Dogecoin',
      symbol: 'DOGE',

      address: address,
      privateKey: privateKeyWIF,
      publicKey: publicKeyHex,
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,
      addressFormat: 'P2PKH (D...)',

      warning: '⚠️ NEVER share your private key or mnemonic! Much secure, very crypto!',

      chainInfo: {
        network: 'mainnet',
        blockTime: '1 minute',
        explorerUrl: `https://dogechain.info/address/${address}`,
        blockchairUrl: `https://blockchair.com/dogecoin/address/${address}`,
        minFee: '~1 DOGE'
      },

      notes: [
        '🐕 Dogecoin - The people\'s crypto!',
        '📌 Much faster than Bitcoin (1 min blocks)',
        '📌 Originally started as a joke/meme coin',
        '📌 No maximum supply limit',
        '📌 Very low transaction fees',
        '📌 Community-driven and widely accepted',
        '📌 To the moon! 🚀🌙'
      ]
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Dogecoin Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Dogecoin',
        networkSymbol: 'DOGE',
        chainId: 0,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKeyHex,
        privateKey: privateKeyWIF,
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\n\n${walletData.notes.join('\n')}`,
        tags: ['Dogecoin', 'DOGE', 'UTXO', 'Meme'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Dogecoin Wallet] ✅ Saved: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: 'Dogecoin wallet generated successfully! Much wow!'
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: 'Dogecoin wallet generated (not saved to database)'
    };

  } catch (error) {
    console.error('[Generate Dogecoin Wallet] Error:', error);
    return {
      success: false,
      message: `Dogecoin wallet generation failed: ${error.message}`
    };
  }
});
