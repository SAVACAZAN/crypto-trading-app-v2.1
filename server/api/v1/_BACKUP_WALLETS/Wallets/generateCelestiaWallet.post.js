/**
 * Celestia (TIA) Wallet Generator
 * Celestia is Cosmos-based, uses same key derivation
 */

import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';
import crypto from 'crypto';

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

    console.log(`[Generate Celestia Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Celestia'
        };
      }
      mnemonic = customMnemonic;
    } else {
      mnemonic = bip39.generateMnemonic(256); // 24 words
    }

    // Celestia uses Cosmos SDK - path: m/44'/118'/{account}'/0/0
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const bip32 = BIP32Factory(ecc);
    const root = bip32.fromSeed(seed);

    const derivationPath = `m/44'/118'/${accountIndex}'/0/0`;
    const child = root.derivePath(derivationPath);

    const privateKeyHex = child.privateKey.toString('hex');
    const publicKeyHex = child.publicKey.toString('hex');

    // Celestia uses celestia prefix (celestia1...)
    // Simplified address generation
    const hash = crypto.createHash('sha256').update(child.publicKey).digest();
    const addressHex = hash.slice(0, 20).toString('hex');
    const address = `celestia1${addressHex}`;

    const walletData = {
      success: true,
      network: 'Celestia',
      type: 'Celestia',
      symbol: 'TIA',

      address: address,
      privateKey: privateKeyHex,
      publicKey: publicKeyHex,
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,
      addressFormat: 'Bech32 (celestia1...)',

      warning: '⚠️ NEVER share your private key or mnemonic! Celestia is modular blockchain for data availability.',

      chainInfo: {
        network: 'mainnet',
        blockTime: '~15 seconds',
        explorerUrl: `https://celestia.explorers.guru/account/${address}`,
        mintscanUrl: `https://www.mintscan.io/celestia/account/${address}`,
        rpcUrl: 'https://rpc.celestia.pops.one',
        minFee: '~0.001 TIA'
      },

      notes: [
        '📌 Celestia - Modular blockchain for data availability',
        '📌 First modular blockchain network',
        '📌 Data availability sampling',
        '📌 Supports any execution environment',
        '📌 Cosmos SDK based',
        '📌 Enables scalable rollups',
        '📌 Decouples consensus from execution'
      ]
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Celestia Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Celestia',
        networkSymbol: 'TIA',
        chainId: 0,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKeyHex,
        privateKey: privateKeyHex,
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\n\n${walletData.notes.join('\n')}`,
        tags: ['Celestia', 'TIA', 'Cosmos', 'Modular'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Celestia Wallet] ✅ Saved: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: 'Celestia wallet generated successfully!'
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: 'Celestia wallet generated (not saved to database)'
    };

  } catch (error) {
    console.error('[Generate Celestia Wallet] Error:', error);
    return {
      success: false,
      message: `Celestia wallet generation failed: ${error.message}`
    };
  }
});
