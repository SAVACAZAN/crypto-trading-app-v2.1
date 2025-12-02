/**
 * Theta Network (THETA) Wallet Generator
 * Theta is Ethereum-compatible, uses same address format
 * Uses BIP39/BIP32 with Ethereum derivation path
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

    console.log(`[Generate Theta Wallet] User: ${userID}, Account: ${accountIndex}`);

    let mnemonic;

    if (useCustomMnemonic && customMnemonic) {
      if (!bip39.validateMnemonic(customMnemonic)) {
        return {
          success: false,
          message: 'Invalid mnemonic phrase for Theta'
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

    // Theta uses Ethereum's derivation path: m/44'/60'/{account}'/0/0
    const derivationPath = `m/44'/60'/${accountIndex}'/0/0`;
    const child = rootKey.derivePath(derivationPath);

    const privateKey = child.privateKey;
    const publicKey = child.publicKey;

    // Generate Ethereum-compatible address
    // Remove the 0x04 prefix from uncompressed public key
    const pubKeyWithoutPrefix = publicKey.length === 65 ? publicKey.slice(1) : publicKey;

    // Keccak256 hash of public key
    const keccak256 = crypto.createHash('sha3-256').update(pubKeyWithoutPrefix).digest();

    // Take last 20 bytes and add 0x prefix
    const address = '0x' + keccak256.slice(-20).toString('hex');

    const walletData = {
      success: true,
      network: 'Theta',
      type: 'Theta',
      symbol: 'THETA',

      address: address,
      publicKey: publicKey.toString('hex'),
      privateKey: privateKey.toString('hex'),
      mnemonic: mnemonic,

      accountIndex: accountIndex,
      derivationPath: derivationPath,

      addressFormat: 'Ethereum-compatible (0x...)',

      warning: '⚠️ NEVER share your private key or mnemonic! Theta Network powers decentralized video streaming.',

      chainInfo: {
        network: 'mainnet',
        chainId: 361,
        rpcUrl: 'https://eth-rpc-api.thetatoken.org/rpc',
        explorerUrl: `https://explorer.thetatoken.org/account/${address}`,
        features: [
          '📺 Decentralized video streaming',
          '⚡ Dual token (THETA + TFUEL)',
          '🔧 Ethereum-compatible (EVM)',
          '💰 Edge node rewards'
        ]
      }
    };

    if (saveToDatabase) {
      const defaultWalletName = walletName || `Theta Wallet ${Date.now()}`;

      const savedWallet = await userWalletsSchema.create({
        userID,
        walletName: defaultWalletName,
        network: 'Theta',
        networkSymbol: 'THETA',
        chainId: 361,
        walletType: 'EVM',
        address: address,
        publicKey: publicKey.toString('hex'),
        privateKey: privateKey.toString('hex'),
        mnemonic: mnemonic,
        isDefault: false,
        balance: '0',
        balanceUSD: '0',
        note: `${walletData.warning}\nCoin Type: 60 (Ethereum)`,
        tags: ['Theta', 'THETA', 'Video Streaming', 'EVM'],
        createdAt: new Date(),
        lastUsed: new Date(),
        isActive: true
      });

      console.log(`[Generate Theta Wallet] ✅ Saved to DB: ${savedWallet._id}`);

      return {
        success: true,
        wallet: {
          ...walletData,
          privateKey: undefined,
          mnemonic: undefined
        },
        walletId: savedWallet._id.toString(),
        message: `Theta Network (THETA) wallet generated and saved successfully!`
      };
    }

    return {
      success: true,
      wallet: walletData,
      message: `Theta Network (THETA) wallet generated (not saved to database)`
    };

  } catch (error) {
    console.error('[Generate Theta Wallet] Error:', error);
    return {
      success: false,
      message: `Theta wallet generation failed: ${error.message}`
    };
  }
});
