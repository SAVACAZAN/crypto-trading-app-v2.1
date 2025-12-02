/**
 * DASH Wallet Generator
 * Uses bitcoinjs-lib with DASH network parameters
 * Supports P2PKH addresses
 */

import * as bitcoin from 'bitcoinjs-lib';
import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

// DASH network parameters
const dash = {
  messagePrefix: '\x19DarkCoin Signed Message:\n',
  bech32: 'dash', // Not widely used
  bip32: {
    public: 0x0488b21e, // xpub (same as Bitcoin)
    private: 0x0488ade4, // xprv
  },
  pubKeyHash: 0x4c, // X prefix
  scriptHash: 0x10, // 7 prefix (for P2SH)
  wif: 0xcc,
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

    console.log(`[Generate DASH Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for DASH'
        };
      }
      mnemonic = customMnemonic;
    } else {
      mnemonic = bip39.generateMnemonic(256); // 24 words
    }

    // Derive DASH keys using BIP44
    // DASH path: m/44'/5'/{account}'/0/0
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc);
    const root = bip32.fromSeed(seed, dash);

    const derivationPath = `m/44'/5'/${accountIndex}'/0/0`;
    const child = root.derivePath(derivationPath);

    const { address } = bitcoin.payments.p2pkh({
      pubkey: child.publicKey,
      network: dash
    });

    const privateKeyWIF = child.toWIF();
    const publicKeyHex = child.publicKey.toString('hex');

    const walletData = {
      success: true,
      network: 'DASH',
      type: 'DASH',
      symbol: 'DASH',

      address: address,
      privateKey: privateKeyWIF,
      publicKey: publicKeyHex,
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,
      addressFormat: 'P2PKH (X...)',

      warning: '⚠️ NEVER share your private key or mnemonic! DASH focuses on privacy and instant transactions.',

      chainInfo: {
        network: 'mainnet',
        blockTime: '~2.5 minutes',
        explorerUrl: `https://blockchair.com/dash/address/${address}`,
        dashexplorerUrl: `https://insight.dashevo.org/insight/address/${address}`,
        minFee: '~0.0001 DASH'
      },

      notes: [
        '📌 DASH (Digital Cash) - originally DarkCoin',
        '📌 Privacy-focused with PrivateSend feature',
        '📌 InstantSend for instant transactions',
        '📌 Two-tier network (miners + masternodes)',
        '📌 Masternodes enable advanced features',
        '📌 Self-funding and self-governing',
        '📌 Maximum supply: ~18.9 million DASH',
        '📌 Faster than Bitcoin (2.5 min blocks)'
      ]
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `DASH Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'DASH',
        networkSymbol: 'DASH',
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
        tags: ['DASH', 'Privacy', 'UTXO', 'InstantSend'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate DASH Wallet] ✅ Saved: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: 'DASH wallet generated successfully!'
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: 'DASH wallet generated (not saved to database)'
    };

  } catch (error) {
    console.error('[Generate DASH Wallet] Error:', error);
    return {
      success: false,
      message: `DASH wallet generation failed: ${error.message}`
    };
  }
});
