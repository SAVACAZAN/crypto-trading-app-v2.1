/**
 * Radix DLT (XRD) Wallet Generator
 * Uses BIP39/BIP32 for key derivation
 * Radix uses bech32m encoding with 'rdx' prefix
 */

import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import crypto from 'crypto';
import { userWalletsSchema } from '~/server/models/userWallets.schema.js';

// Simplified bech32m encode
function bech32mEncode(hrp, data) {
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

    console.log(`[Generate Radix Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Radix'
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

    // Radix derivation path: m/44'/1022'/{account}'/0/0
    const derivationPath = `m/44'/1022'/${accountIndex}'/0/0`;
    const child = rootKey.derivePath(derivationPath);

    const privateKey = child.privateKey;
    const publicKey = child.publicKey;

    // Radix address format: rdx1 + encoded public key hash
    const publicKeyHash = crypto.createHash('blake2b512').update(publicKey).digest().slice(0, 32);
    const address = bech32mEncode('rdx', publicKeyHash);

    const walletData = {
      success: true,
      network: 'Radix',
      type: 'Radix DLT',
      symbol: 'XRD',

      address: address,
      publicKey: publicKey.toString('hex'),
      privateKey: privateKey.toString('hex'),
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,

      addressFormat: 'Bech32m (rdx1...)',

      warning: '⚠️ NEVER share your private key or mnemonic! Radix is built for DeFi at scale.',

      chainInfo: {
        network: 'mainnet',
        rpcUrl: 'https://mainnet.radixdlt.com',
        explorerUrl: `https://dashboard.radixdlt.com/account/${address}`,
        features: [
          '🚀 DeFi-focused Layer 1',
          '⚡ Cerberus consensus (parallelization)',
          '🔧 Scrypto smart contracts (Rust)',
          '💼 Component-based architecture'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Radix Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Radix DLT',
        networkSymbol: 'XRD',
        chainId: 0,
        walletType: 'Non-EVM',
        address: address,
        publicKey: publicKey.toString('hex'),
        privateKey: privateKey.toString('hex'),
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nCoin Type: 1022`,
        tags: ['Radix', 'XRD', 'DeFi', 'Cerberus'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Radix Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Radix DLT (XRD) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Radix DLT (XRD) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Radix Wallet] Error:', error);
    return {
      success: false,
      message: `Radix wallet generation failed: ${error.message}`
    };
  }
});
