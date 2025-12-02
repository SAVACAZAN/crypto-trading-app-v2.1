/**
 * Bitcoin Cash (BCH) Wallet Generator
 * Uses bitcoinjs-lib with Bitcoin Cash network parameters
 * Supports CashAddr format (bitcoincash:...)
 */

import * as bitcoin from 'bitcoinjs-lib';
import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

// Bitcoin Cash uses same parameters as Bitcoin
const bitcoinCash = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'bc', // BCH doesn't use bech32 widely
  bip32: {
    public: 0x0488b21e, // xpub
    private: 0x0488ade4, // xprv
  },
  pubKeyHash: 0x00, // 1 prefix (legacy)
  scriptHash: 0x05, // 3 prefix (legacy)
  wif: 0x80,
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

    console.log(`[Generate Bitcoin Cash Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Bitcoin Cash'
        };
      }
      mnemonic = customMnemonic;
    } else {
      mnemonic = bip39.generateMnemonic(256); // 24 words
    }

    // Derive Bitcoin Cash keys using BIP44
    // BCH path: m/44'/145'/{account}'/0/0
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc);
    const root = bip32.fromSeed(seed, bitcoinCash);

    const derivationPath = `m/44'/145'/${accountIndex}'/0/0`;
    const child = root.derivePath(derivationPath);

    // Generate legacy address (1...)
    const { address: legacyAddress } = bitcoin.payments.p2pkh({
      pubkey: child.publicKey,
      network: bitcoinCash
    });

    const privateKeyWIF = child.toWIF();
    const publicKeyHex = child.publicKey.toString('hex');

    // Note: For proper CashAddr format (bitcoincash:...), you'd need bchaddrjs library
    // For now, using legacy format which is compatible
    const address = legacyAddress;

    const walletData = {
      success: true,
      network: 'Bitcoin Cash',
      type: 'Bitcoin Cash',
      symbol: 'BCH',

      address: address,
      legacyAddress: legacyAddress,
      privateKey: privateKeyWIF,
      publicKey: publicKeyHex,
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,
      addressFormat: 'Legacy P2PKH (1...)',

      warning: '⚠️ NEVER share your private key or mnemonic! Bitcoin Cash forked from Bitcoin in 2017.',

      chainInfo: {
        network: 'mainnet',
        blockTime: '~10 minutes',
        explorerUrl: `https://blockchair.com/bitcoin-cash/address/${address}`,
        blockscoutUrl: `https://www.blockchain.com/bch/address/${address}`,
        minFee: '~0.001 BCH'
      },

      notes: [
        '📌 Bitcoin Cash forked from Bitcoin in August 2017',
        '📌 Larger block size (32MB vs Bitcoin\'s 1MB)',
        '📌 Lower transaction fees than Bitcoin',
        '📌 Faster transaction confirmations',
        '📌 Focus on peer-to-peer electronic cash',
        '📌 Uses CashAddr format (bitcoincash:...) or legacy format',
        '📌 Maximum supply: 21 million BCH (same as Bitcoin)'
      ]
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Bitcoin Cash Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Bitcoin Cash',
        networkSymbol: 'BCH',
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
        tags: ['Bitcoin Cash', 'BCH', 'UTXO', 'Fork'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Bitcoin Cash Wallet] ✅ Saved: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: 'Bitcoin Cash wallet generated successfully!'
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: 'Bitcoin Cash wallet generated (not saved to database)'
    };

  } catch (error) {
    console.error('[Generate Bitcoin Cash Wallet] Error:', error);
    return {
      success: false,
      message: `Bitcoin Cash wallet generation failed: ${error.message}`
    };
  }
});
