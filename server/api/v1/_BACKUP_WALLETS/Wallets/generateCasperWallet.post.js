/**
 * Casper Network (CSPR) Wallet Generator
 * Uses ED25519 key pairs for Casper
 * Casper uses hex-encoded public keys with algorithm prefix
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

    console.log(`[Generate Casper Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Casper'
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

    // Casper derivation path: m/44'/506'/{account}'/0/0
    const derivationPath = `m/44'/506'/${accountIndex}'/0/0`;
    const child = rootKey.derivePath(derivationPath);

    const privateKey = child.privateKey;
    const publicKey = child.publicKey;

    // Casper address format: algorithm-prefix (01 for ED25519 or 02 for SECP256K1) + hex public key
    // Using SECP256K1 (02 prefix) since we're using BIP32
    const publicKeyHex = publicKey.toString('hex');
    const address = `02${publicKeyHex}`;

    // Create account hash (for display)
    const accountHash = crypto.createHash('blake2b512')
      .update(Buffer.concat([Buffer.from([0x02]), publicKey]))
      .digest()
      .slice(0, 32)
      .toString('hex');

    const walletData = {
      success: true,
      network: 'Casper',
      type: 'Casper',
      symbol: 'CSPR',

      address: address,
      accountHash: `account-hash-${accountHash}`,
      publicKey: publicKeyHex,
      privateKey: privateKey.toString('hex'),
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,

      addressFormat: 'Algorithm prefix + hex public key',

      warning: '⚠️ NEVER share your private key or mnemonic! Casper is an enterprise-grade blockchain.',

      chainInfo: {
        network: 'mainnet',
        rpcUrl: 'https://rpc.mainnet.casperlabs.io',
        explorerUrl: `https://cspr.live/account/${address}`,
        features: [
          '🏢 Enterprise blockchain',
          '⚡ Proof of Stake (PoS)',
          '🔧 WASM smart contracts',
          '🔄 Upgradeable contracts'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Casper Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Casper',
        networkSymbol: 'CSPR',
        chainId: 0,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKeyHex,
        privateKey: privateKey.toString('hex'),
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nAccount Hash: ${walletData.accountHash}\nCoin Type: 506`,
        tags: ['Casper', 'CSPR', 'Enterprise', 'PoS', 'WASM'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Casper Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Casper Network (CSPR) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Casper Network (CSPR) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Casper Wallet] Error:', error);
    return {
      success: false,
      message: `Casper wallet generation failed: ${error.message}`
    };
  }
});
